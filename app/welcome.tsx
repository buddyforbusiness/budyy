import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { supabase } from "../src/lib/supabase";

export default function Welcome() {
  const params = useLocalSearchParams<{ fullName?: string; email?: string }>();

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Welcome{params.fullName ? `, ${params.fullName}` : ""} 👋</Text>
      <Text style={styles.p}>{params.email ? `Signed in as ${params.email}` : "You're signed in."}</Text>
      <Text style={styles.p2}>Next: connect your bank to see your safe-to-spend.</Text>

      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", gap: 10 },
  h1: { fontSize: 24, fontWeight: "800" },
  p: { fontSize: 14, color: "#444" },
  p2: { marginTop: 10, fontSize: 14, color: "#444" },
  button: { marginTop: 18, borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 12, alignItems: "center" },
  buttonText: { fontSize: 14, fontWeight: "700" },
});
