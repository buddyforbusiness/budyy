import { PropsWithChildren, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CollapsibleProps = PropsWithChildren<{
  title: string;
  style?: ViewStyle;
}>;

export function Collapsible({ children, title, style }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? "light";

  const isLight = theme === "light";
  const cardBg = isLight ? "#FFFFFF" : "#020617";
  const border = isLight ? "#E5E7EB" : "#1F2937";
  const textColor = isLight ? Colors.light.text : Colors.dark.text;
  const iconColor = isLight ? Colors.light.icon : Colors.dark.icon;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((value) => !value);
  };

  return (
    <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: border }, style]}>
      <TouchableOpacity
        style={styles.heading}
        onPress={toggle}
        activeOpacity={0.8}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={iconColor}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />
        <ThemedText
          type="defaultSemiBold"
          style={{ color: textColor, flexShrink: 1 }}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
      </TouchableOpacity>

      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  content: {
    marginTop: 8,
    marginLeft: 26,
  },
});
