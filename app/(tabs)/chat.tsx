// app/(tabs)/chat.tsx
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.backgroundSoft }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <View style={styles.flex}>
          {/* Messages / content */}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              Budyy Chat Coach
            </Text>

            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Ask Budyy things like:
            </Text>

            <Text style={[styles.example, { color: theme.text }]}>
              • Can I afford a £20 meal tonight?
            </Text>
            <Text style={[styles.example, { color: theme.text }]}>
              • Why does my money finish early?
            </Text>
            <Text style={[styles.example, { color: theme.text }]}>
              • How much can I save this month?
            </Text>

            <Text style={[styles.placeholder, { color: theme.textMuted }]}>
              (Phase 1: this is a preview. Next we’ll plug in the AI coach and
              show real messages here.)
            </Text>
          </ScrollView>

          {/* Input bar (placeholder) */}
          <View
            style={[
              styles.inputBar,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ask Budyy anything about your money..."
              placeholderTextColor={theme.textMuted}
              multiline
              editable={false} // until chat is wired
            />
            <Pressable
              style={[styles.sendButton, { backgroundColor: theme.tint }]}
              disabled
            >
              <Text style={styles.sendText}>Soon</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 16,
    gap: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  example: {
    fontSize: 13,
    marginTop: 2,
  },
  placeholder: {
    marginTop: 14,
    fontSize: 12,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
    paddingRight: 8,
  },
  sendButton: {
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
  sendText: {
    color: "#0B1120",
    fontSize: 13,
    fontWeight: "700",
  },
});
