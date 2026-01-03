/**
 * Budyy Design System — Colors + Typography + Tokens
 *
 * This keeps the app consistent everywhere.
 * Inspired by Monzo / Cleo / Plum / Revolut.
 */

import { Platform } from "react-native";

const primaryLight = "#0A84FF";
const primaryDark = "#5EA3FF";

export const Colors = {
  light: {
    text: "#0B1220",
    textMuted: "#6B7280",

    background: "#FFFFFF",
    backgroundSoft: "#F7F8FA",

    card: "#FFFFFF",
    cardGlass: "rgba(255,255,255,0.72)",

    border: "#E5E7EB",

    tint: primaryLight,
    icon: "#6B7280",

    success: "#22C55E",
    warning: "#FACC15",
    danger: "#EF4444",

    tabIconDefault: "#9CA3AF",
    tabIconSelected: primaryLight,
  },

  dark: {
    text: "#F3F4F6",
    textMuted: "#A1A1AA",

    background: "#0B1220",
    backgroundSoft: "#0F172A",

    card: "#0F172A",
    cardGlass: "rgba(15,23,42,0.65)",

    border: "#1F2937",

    tint: primaryDark,
    icon: "#9CA3AF",

    success: "#4ADE80",
    warning: "#EAB308",
    danger: "#F87171",

    tabIconDefault: "#6B7280",
    tabIconSelected: primaryDark,
  },
};

/**
 * Typography
 * Keep fonts subtle + premium.
 */

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  web: {
    sans: `system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
    serif: "Georgia, 'Times New Roman', serif",
    rounded: `'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif`,
    mono: `SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace`,
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

/**
 * Common UI tokens
 */

export const Radius = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 30,
};

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
};
