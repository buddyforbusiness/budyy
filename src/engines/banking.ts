// src/engines/banking.ts
import * as Linking from "expo-linking";
import { Alert } from "react-native";

import { API_BASE_URL } from "../config";

export async function connectBank() {
  try {
    const fullUrl = `${API_BASE_URL}/truelayer/auth-url`;
    console.log("connectBank Hitting:", fullUrl);

    const res = await fetch(fullUrl);
    console.log("connectBank Status:", res.status);

    if (!res.ok) throw new Error("Failed to get auth URL");

    const json = await res.json();
    console.log("connectBank JSON:", json);

    if (!json.url) throw new Error("Missing auth URL");

    await Linking.openURL(json.url);
  } catch (e) {
    console.log("connectBank error", e);
    Alert.alert(
      "Could not start bank connection",
      String(e) || "Please try again."
    );
  }
}
