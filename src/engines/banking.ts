// src/engines/banking.ts
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { API_BASE_URL } from "../config";
import { supabase } from "../lib/supabase";

function getQueryParam(url: string, key: string) {
  const u = new URL(url);
  return u.searchParams.get(key);
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Please sign in before connecting a bank.");
  return { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" };
}

export async function connectBank() {
  try {
    // 1) Get auth URL from backend
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/v1/banking/authorisation-url`, { headers });
    const text = await res.text();

    console.log("auth-url raw response:", text);


    if (!res.ok) throw new Error(`Failed to get auth URL, status=${res.status}: ${text}`);

    const json = JSON.parse(text);
    const authUrl: string = json.url;
    if (!authUrl) throw new Error("Missing url from /truelayer/auth-url");

    // 2) IMPORTANT: redirectUri must match what you registered in TrueLayer
    // Use the SAME one you set in TrueLayer + buddy-api/.env:
    const redirectUri = process.env.EXPO_PUBLIC_TRUELAYER_REDIRECT_URI;
    if (!redirectUri) throw new Error("TrueLayer redirect URI is not configured.");

    console.log("Opening auth:", authUrl);
    console.log("Redirect URI:", redirectUri);

    // 3) Open auth session and wait for redirect back
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    console.log("openAuthSessionAsync result:", result);

    if (result.type !== "success" || !result.url) {
      throw new Error(`Auth not completed: ${result.type}`);
    }

    // 4) Extract code from returned redirect URL
    const code = getQueryParam(result.url, "code");
    if (!code) throw new Error(`No code found in redirect URL: ${result.url}`);
    const state = getQueryParam(result.url, "state");
    if (!state) throw new Error("Bank connection state was not returned.");

    // 5) Exchange code for tokens
    const tokenRes = await fetch(`${API_BASE_URL}/v1/banking/callback`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code, state }),
    });

    const tokenText = await tokenRes.text();
    if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokenText}`);

    Alert.alert("Bank connected ✅", "Success!");
  } catch (e) {
    console.log("connectBank error", e);
    Alert.alert(
      "Could not start bank connection",
      e instanceof Error ? e.message : String(e)
    );
  }
}
