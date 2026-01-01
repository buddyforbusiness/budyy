import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { supabase } from "../src/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return Alert.alert("Missing info", "Enter email and password.");

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;

      const user = data.user;

      // Ensure profile exists (RLS will pass because you're authenticated)
      const { error: profileErr } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: cleanEmail,
          full_name: null, // set later if you want
        },
        { onConflict: "id" }
      );

      if (profileErr) throw profileErr;

      router.replace({
        pathname: "/welcome",
        params: { email: cleanEmail },
      });
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.h1}>Log in to Budyy</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            returnKeyType="done"
          />

          <Pressable style={styles.button} onPress={onLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Log in</Text>}
          </Pressable>

          <Pressable onPress={() => router.push("/signup")} style={styles.linkBtn}>
            <Text style={styles.linkText}>New here? Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", gap: 10 },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 16 },
  button: { marginTop: 8, backgroundColor: "black", padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
  linkBtn: { marginTop: 14, alignItems: "center" },
  linkText: { fontSize: 14, color: "#444", textDecorationLine: "underline" },
});
