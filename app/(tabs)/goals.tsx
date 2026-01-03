import { useEffect, useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function GoalsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  // entrance animation
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
          Build goals that feel realistic 🎯
        </Text>

        <Text style={[styles.sub, { color: theme.textMuted }]}>
          In Phase 1 Budyy helps you plan before touching real money.
        </Text>

        {/* Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardGlass,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            What you’ll do here:
          </Text>

          <Text style={[styles.item, { color: theme.text }]}>
            • Choose your top priorities
          </Text>
          <Text style={[styles.item, { color: theme.text }]}>
            • Set how much you want to save
          </Text>
          <Text style={[styles.item, { color: theme.text }]}>
            • Pick a target date
          </Text>
          <Text style={[styles.item, { color: theme.text }]}>
            • Budyy will suggest realistic monthly saving
          </Text>

          <Text style={[styles.hint, { color: theme.textMuted }]}>
            Later, Budyy will automatically adjust your plan based on spending
            and bills — like Cleo + Plum combined.
          </Text>

          <Pressable style={styles.cta}>
            <Text style={styles.ctaText}>Create your first goal</Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Soon: goals will sync with questionnaires & Supabase storage.
        </Text>
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
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  item: {
    fontSize: 13,
  },
  hint: {
    fontSize: 11,
    marginTop: 8,
  },
  cta: {
    marginTop: 14,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#38BDF8",
  },
  ctaText: {
    color: "#020617",
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    marginTop: 10,
    fontSize: 11,
  },
});
