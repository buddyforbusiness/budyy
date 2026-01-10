// src/engines/banking.ts
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";

import { API_BASE_URL } from "../config";

export async function connectBank() {
  try {
    const fullUrl = `${API_BASE_URL}/truelayer/auth-url`;
    console.log("connectBank Hitting:", fullUrl);

    const res = await fetch(fullUrl);
    console.log("connectBank Status:", res.status);

    const text = await res.text();
    console.log("connectBank raw body:", text);

    if (!res.ok) throw new Error(`Failed to get auth URL, status=${res.status}`);

    let json: any;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.log("JSON parse error:", err);
      throw new Error("Response from /truelayer/auth-url was not valid JSON");
    }

    console.log("connectBank JSON:", json);

    if (!json.url || typeof json.url !== "string") {
      throw new Error("Missing or invalid 'url' field in auth response");
    }

    // Show what we're about to open
    Alert.alert("Opening bank auth", json.url);

    console.log("Opening bank auth URL:", json.url);
    const result = await WebBrowser.openBrowserAsync(json.url);
    console.log("WebBrowser result:", result);
  } catch (e) {
    console.log("connectBank error", e);
    Alert.alert(
      "Could not start bank connection",
      e instanceof Error ? e.message : String(e)
    );
  }
}
