import {
  SymbolView,
  SymbolViewProps,
  SymbolWeight,
} from "expo-symbols";
import { useState } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type IconProps = {
  name: SymbolViewProps["name"];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  withBadge?: boolean; // optional background pill
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
  withBadge = false,
}: IconProps) {
  const [visible] = useState(new Animated.Value(0));
  const theme = useColorScheme() ?? "light";

  const tint =
    color ??
    (theme === "light" ? Colors.light.icon : Colors.dark.icon);

  const bg =
    theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)";

  // simple fade-in animation
  Animated.timing(visible, {
    toValue: 1,
    duration: 160,
    useNativeDriver: true,
  }).start();

  return (
    <Animated.View
      style={[
        {
          opacity: visible,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: withBadge ? 999 : 0,
          padding: withBadge ? 6 : 0,
          backgroundColor: withBadge ? bg : "transparent",
        },
        style,
      ]}
    >
      <SymbolView
        weight={weight}
        tintColor={tint}
        resizeMode="scaleAspectFit"
        name={name}
        style={{
          width: size,
          height: size,
        }}
      />
    </Animated.View>
  );
}
