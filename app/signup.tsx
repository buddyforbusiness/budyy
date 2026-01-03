// app/signup.tsx
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "../src/lib/supabase";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSignup = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !password) {
      return Alert.alert("Missing info", "Enter your email and password.");
    }
    if (password.length < 8) {
      return Alert.alert("Weak password", "Use at least 8 characters.");
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });
      if (error) throw error;

      // If confirm-email flow is on
      if (!data.session) {
        Alert.alert(
          "Check your email",
          "Please confirm your email, then come back and log in."
        );
        return;
      }

      const user = data.session.user;

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
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.logo,
              { color: theme.tint, fontFamily: Fonts?.rounded ?? undefined },
            ]}
          >
            Budyy
          </Text>
          <Text
            style={[
              styles.title,
              { color: theme.text, fontFamily: Fonts?.sans ?? undefined },
            ]}
          >
            Let’s set you up ✨
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Create a Budyy account so we can track your money and goals in one
            place.
          </Text>
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.dark.cardGlass
                  : Colors.light.cardGlass,
              borderColor: theme.border,
              shadowColor: "#000",
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Create your account
          </Text>

          <Text style={[styles.label, { color: theme.textMuted }]}>
            Full name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor:
                  colorScheme === "dark" ? "#020617" : "#F9FAFB",
              },
            ]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nilisha"
            placeholderTextColor={theme.textMuted}
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: theme.textMuted }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor:
                  colorScheme === "dark" ? "#020617" : "#F9FAFB",
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: theme.textMuted }]}>
            Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor:
                  colorScheme === "dark" ? "#020617" : "#F9FAFB",
              },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="Min 8 characters"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            returnKeyType="done"
          />

          <Pressable
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.tint,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={onSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0B1120" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign up</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/login")}
            style={styles.linkBtn}
          >
            <Text
              style={[
                styles.linkText,
                { color: theme.textMuted, textDecorationColor: theme.textMuted },
              ]}
            >
              Already confirmed your email? Log in
            </Text>
          </Pressable>
        </Animated.View>

        <Text style={[styles.footerNote, { color: theme.textMuted }]}>
          Budyy gives guidance only — not regulated financial advice.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 70,
    paddingBottom: 34,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  title: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  primaryButton: {
    marginTop: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#0B1120",
    fontSize: 15,
    fontWeight: "700",
  },
  linkBtn: {
    marginTop: Spacing.sm + 2,
    alignItems: "center",
  },
  linkText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
  footerNote: {
    marginTop: Spacing.md,
    fontSize: 11,
    textAlign: "center",
  },
});
