import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  // animations
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

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.backgroundSoft },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Explore Budyy 🚀
        </Text>

        <Text style={[styles.sub, { color: theme.textMuted }]}>
          Tips, features and upcoming super powers.
        </Text>

        {/* CARD 1 */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <IconSymbol
              name="paperplane.fill"
              size={20}
              color={theme.tint}
              withBadge
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Chat with Budyy
            </Text>
          </View>

          <Text style={[styles.cardBody, { color: theme.textMuted }]}>
            Ask questions about spending, budgeting, habits and money mindset —
            just like Cleo but calmer 😄
          </Text>

          <Pressable
            style={styles.cta}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <Text style={styles.ctaText}>Open chat</Text>
          </Pressable>
        </View>

        {/* CARD 2 */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <IconSymbol
              name="chart.pie.fill"
              size={20}
              color={theme.icon}
              withBadge
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Safe-to-spend
            </Text>
          </View>

          <Text style={[styles.cardBody, { color: theme.textMuted }]}>
            We subtract bills + essentials so you know what’s okay to spend
            without stressing.
          </Text>

          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>
              Coming soon
            </Text>
          </Pressable>
        </View>

        {/* CARD 3 */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardGlass, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <IconSymbol
              name="flag.fill"
              size={20}
              color={theme.tint}
              withBadge
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Build saving goals
            </Text>
          </View>

          <Text style={[styles.cardBody, { color: theme.textMuted }]}>
            Travel, visa costs, emergency fund, house deposit — we help make
            realistic plans.
          </Text>

          <Pressable
            style={styles.cta}
            onPress={() => router.push("/(tabs)/goals")}
          >
            <Text style={styles.ctaText}>Create a goal</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  sub: {
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardBody: {
    fontSize: 13,
  },
  cta: {
    marginTop: 10,
    backgroundColor: "#38BDF8",
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  ctaText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryBtn: {
    marginTop: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "#64748B",
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryText: {
    color: "#CBD5E1",
    fontWeight: "700",
  },
});
