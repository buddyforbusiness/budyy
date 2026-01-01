// app/signup.tsx
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

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !password) return Alert.alert("Missing info", "Enter email and password.");
    if (password.length < 8) return Alert.alert("Weak password", "Use at least 8 characters.");

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });
      if (error) throw error;

      // If email confirmation is ON, you may not get a session yet.
      // In that case, don't insert into profiles now (RLS will block because auth.uid() is null).
      if (!data.session) {
        Alert.alert(
          "Check your email",
          "Please confirm your email, then come back and log in."
        );
        return;
      }

      const user = data.session.user;

      // Upsert profile row (safe if it already exists)
      const { error: profileErr } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: cleanEmail,
          full_name: cleanName || null,
        },
        { onConflict: "id" }
      );

      if (profileErr) throw profileErr;

      router.replace({
        pathname: "/welcome",
        params: { fullName: cleanName, email: cleanEmail },
      });
    } catch (e: any) {
      Alert.alert("Signup failed", e?.message ?? "Something went wrong.");
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
          <Text style={styles.h1}>Create your Budyy account</Text>

          <Text style={styles.label}>Full name </Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nilisha"
            returnKeyType="next"
          />

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
            placeholder="Min 8 characters"
            secureTextEntry
            returnKeyType="done"
          />

          <Pressable style={styles.button} onPress={onSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign up</Text>}
          </Pressable>

          <Pressable onPress={() => router.push("/login")} style={{ marginTop: 14, alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#444", textDecorationLine: "underline" }}>
          Already confirmed your email? Log in
          </Text>
          </Pressable>


          <Text style={styles.note}>Guidance only — not financial advice.</Text>
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
  note: { marginTop: 12, fontSize: 12, color: "#666" },
});
