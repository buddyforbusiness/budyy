// app/(tabs)/profile.tsx
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/src/lib/supabase";

type UserInfo = {
  email: string | null;
};

export default function ProfileTab() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [user, setUser] = useState<UserInfo | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [roundUpsEnabled, setRoundUpsEnabled] = useState(false);

  // subtle entrance animation
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({
          email: data.user.email ?? null,
        });
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/signup");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  };

  const SectionTitle = ({ label }: { label: string }) => (
    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
      {label}
    </Text>
  );

  const Row = ({
    icon,
    label,
    value,
    onPress,
    isDestructive,
    childrenRight,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
    isDestructive?: boolean;
    childrenRight?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        {icon}
        <View>
          <Text
            style={[
              styles.rowLabel,
              { color: isDestructive ? "#F87171" : theme.text },
            ]}
          >
            {label}
          </Text>
          {value ? (
            <Text style={[styles.rowValue, { color: theme.textMuted }]}>
              {value}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {childrenRight}
        {!childrenRight && (
          <IconSymbol name="chevron.right" size={16} color={theme.icon} />
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.backgroundSoft },
      ]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fade,
              transform: [{ translateY: slide }],
            }}
          >
            {/* HEADER CARD */}
            <View
              style={[
                styles.headerCard,
                {
                  backgroundColor: theme.cardGlass,
                  borderColor: theme.border,
                  shadowColor: "#000",
                },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.[0]?.toUpperCase() ?? "B"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>
                  Budyy user
                </Text>
                <Text style={[styles.email, { color: theme.textMuted }]}>
                  {user?.email ?? "email@not-set.com"}
                </Text>
              </View>
              <View style={styles.pill}>
                <Text style={[styles.pillText, { color: theme.text }]}>
                  Early access
                </Text>
              </View>
            </View>

            {/* ACCOUNT SECTION */}
            <SectionTitle label="ACCOUNT" />
            <View style={styles.sectionCard}>
              <Row
                icon={
                  <IconSymbol
                    name="house.fill"
                    size={20}
                    color={theme.tint}
                    withBadge
                  />
                }
                label="Connected accounts"
                value="0 banks linked"
                onPress={() =>
                  Alert.alert("Coming soon", "This will connect to your banks.")
                }
              />

              <Row
                icon={
                  <IconSymbol
                    name="chevron.left.forwardslash.chevron.right"
                    size={20}
                    color={theme.icon}
                  />
                }
                label="Data & privacy"
                value="Control what Budyy can see"
                onPress={() =>
                  Alert.alert(
                    "Data & privacy",
                    "Manage exports & deletion (coming soon)."
                  )
                }
              />
            </View>

            {/* APP SETTINGS */}
            <SectionTitle label="APP" />
            <View style={styles.sectionCard}>
              <Row
                icon={
                  <IconSymbol
                    name="paperplane.fill"
                    size={20}
                    color={theme.tint}
                    withBadge
                  />
                }
                label="Smart notifications"
                value={
                  notificationsEnabled
                    ? "Enabled — nudges & alerts"
                    : "Muted"
                }
                childrenRight={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                }
              />

              <Row
                icon={
                  <IconSymbol
                    name="chart.pie.fill"
                    size={20}
                    color={theme.icon}
                    withBadge
                  />
                }
                label="Round-ups"
                value={
                  roundUpsEnabled
                    ? "Rounding purchases into savings"
                    : "Off"
                }
                childrenRight={
                  <Switch
                    value={roundUpsEnabled}
                    onValueChange={setRoundUpsEnabled}
                  />
                }
              />
            </View>

            {/* HELP & LEGAL */}
            <SectionTitle label="HELP & LEGAL" />
            <View style={styles.sectionCard}>
              <Row
                icon={
                  <IconSymbol
                    name="chevron.right"
                    size={18}
                    color={theme.icon}
                  />
                }
                label="Support & FAQs"
                value="Get help with Budyy"
                onPress={() =>
                  Alert.alert(
                    "Support",
                    "Later this opens our help centre."
                  )
                }
              />
              <Row
                icon={
                  <IconSymbol
                    name="chevron.right"
                    size={18}
                    color={theme.icon}
                  />
                }
                label="Terms & privacy"
                value="How we handle your data"
                onPress={() =>
                  Alert.alert(
                    "Legal",
                    "Terms & privacy will live here."
                  )
                }
              />
            </View>

            {/* DANGER ZONE */}
            <SectionTitle label="DANGER ZONE" />
            <View style={styles.sectionCard}>
              <Row
                icon={
                  <IconSymbol
                    name="chevron.right"
                    size={18}
                    color="#F87171"
                  />
                }
                label="Log out"
                isDestructive
                onPress={logout}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(148, 163, 184, 0.35)",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#020617",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  email: {
    fontSize: 12,
    marginTop: 2,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(56,189,248,0.16)",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 11,
    marginTop: 2,
  },
});
