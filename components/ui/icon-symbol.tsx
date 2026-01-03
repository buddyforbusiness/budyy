// components/ui/icon-symbol.tsx

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import {
  OpaqueColorValue,
  StyleProp,
  TextStyle,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/**
 * Map SF Symbols -> Material Icons names
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",

  // NEW icons we use
  "flag.fill": "flag",
  "chart.pie.fill": "pie-chart",
  "person.crop.circle": "person",
} as const;

export type IconSymbolName = keyof typeof MAPPING;

type IconSymbolProps = {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
  withBadge?: boolean;
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  withBadge = false,
}: IconSymbolProps) {
  const scheme = useColorScheme() ?? "light";

  const tint =
    color ??
    (scheme === "light" ? Colors.light.icon : Colors.dark.icon);

  const badge =
    withBadge
      ? {
          backgroundColor:
            scheme === "light"
              ? "rgba(0,0,0,0.06)"
              : "rgba(255,255,255,0.1)",
          borderRadius: 999,
          padding: 6,
        }
      : {};

  const iconName: ComponentProps<typeof MaterialIcons>["name"] =
    MAPPING[name] ?? "help-outline";

  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={tint}
      style={[badge, style]}
    />
  );
}
