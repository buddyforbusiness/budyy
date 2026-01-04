// buddy-api/index.ts
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase admin client (server-side only!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * HEALTH CHECK
 */
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "budyy-api" });
});

/**
 * AUTH URL — Step 1 (sandbox)
 */
app.get("/truelayer/auth-url", (_req, res) => {
  console.log("HIT /truelayer/auth-url");

  // 🔴 TEMP: return Google instead of TrueLayer URL
  return res.json({
    url: "https://www.google.com",
  });
});

/**
 * TOKEN EXCHANGE — Step 2 (sandbox)
 */
app.post("/truelayer/token", async (req, res) => {
  try {
    const { code, userId } = req.body as {
      code?: string;
      userId?: string;
    };

    if (!code) return res.status(400).json({ error: "Missing code" });
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const tokenRes = await axios.post(
      "https://auth.truelayer-sandbox.com/connect/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.TRUELAYER_CLIENT_ID!,
        client_secret: process.env.TRUELAYER_CLIENT_SECRET!,
        redirect_uri: process.env.TRUELAYER_REDIRECT_URI!,
        code,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, scope } = tokenRes.data;

    const { error } = await supabaseAdmin
      .from("bank_connections")
      .upsert(
        {
          user_id: userId,
          provider: "truelayer",
          access_token,
          refresh_token,
          scope,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );

    if (error) {
      console.error("Supabase upsert error:", error);
      return res
        .status(500)
        .json({ error: "Failed to store bank connection" });
    }

    return res.json({ success: true });
  } catch (e: any) {
    console.error(e?.response?.data || e);
    res.status(500).json({ error: "Token exchange failed" });
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Budyy API running on http://localhost:${PORT} (SANDBOX)`);
});
