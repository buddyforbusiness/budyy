import { createCipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createClient, User } from "@supabase/supabase-js";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";

dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_KEY", "TRUELAYER_CLIENT_ID", "TRUELAYER_CLIENT_SECRET", "TRUELAYER_REDIRECT_URI", "TOKEN_ENCRYPTION_KEY"] as const;
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);

const app = express();
const origins = (process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean);
app.disable("x-powered-by");
app.use(cors({ origin: origins.length ? origins : false }));
app.use(express.json({ limit: "32kb" }));

const supabaseAuth = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, { auth: { persistSession: false } });

type AuthedRequest = Request & { user?: User };

async function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid or expired session" });
  req.user = data.user;
  next();
}

function encrypt(secret: string) {
  const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, "base64");
  if (key.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return { ciphertext: ciphertext.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64") };
}

function signState(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, nonce: randomBytes(16).toString("hex"), expiresAt: Date.now() + 10 * 60_000 })).toString("base64url");
  const signature = createHmac("sha256", process.env.TOKEN_ENCRYPTION_KEY!).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function validState(state: string, userId: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", process.env.TOKEN_ENCRYPTION_KEY!).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
  const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId?: string; expiresAt?: number };
  return value.userId === userId && typeof value.expiresAt === "number" && value.expiresAt > Date.now();
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "buddy-api", version: "1" }));

app.get("/v1/banking/authorisation-url", requireUser, (req: AuthedRequest, res) => {
  const state = signState(req.user!.id);
  const params = new URLSearchParams({ response_type: "code", client_id: process.env.TRUELAYER_CLIENT_ID!, scope: "info accounts balance cards transactions offline_access", redirect_uri: process.env.TRUELAYER_REDIRECT_URI!, providers: "uk-ob-all uk-oauth-all", state });
  res.json({ url: `https://auth.truelayer-sandbox.com/?${params}` });
});

app.post("/v1/banking/callback", requireUser, async (req: AuthedRequest, res, next) => {
  try {
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const state = typeof req.body?.state === "string" ? req.body.state : "";
    if (!code || code.length > 2048) return res.status(400).json({ error: "A valid authorisation code is required" });
    if (!validState(state, req.user!.id)) return res.status(400).json({ error: "Invalid or expired authorisation state" });
    const tokenRes = await axios.post("https://auth.truelayer-sandbox.com/connect/token", new URLSearchParams({ grant_type: "authorization_code", client_id: process.env.TRUELAYER_CLIENT_ID!, client_secret: process.env.TRUELAYER_CLIENT_SECRET!, redirect_uri: process.env.TRUELAYER_REDIRECT_URI!, code }), { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 15_000 });
    const access = encrypt(tokenRes.data.access_token);
    const refresh = tokenRes.data.refresh_token ? encrypt(tokenRes.data.refresh_token) : null;
    const { error } = await supabaseAdmin.from("bank_connections").upsert({ user_id: req.user!.id, provider: "truelayer", status: "connected", encrypted_access_token: access, encrypted_refresh_token: refresh, consent_expires_at: tokenRes.data.expires_in ? new Date(Date.now() + tokenRes.data.expires_in * 1000).toISOString() : null, updated_at: new Date().toISOString() }, { onConflict: "user_id,provider" });
    if (error) throw error;
    res.status(201).json({ connected: true });
  } catch (error) { next(error); }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("request_failed", error instanceof Error ? error.message : error);
  res.status(500).json({ error: "The request could not be completed" });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, "0.0.0.0", () => console.log(`buddy-api listening on ${port}`));
