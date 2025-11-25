// src/theme/theme.ts
export const Colors = {
  // Core brand
  primary: "#2980B9",
  primaryDark: "#2980B9",

  // Surfaces
  background: "#F5F5F5",
  surface: "#FFFFFF",

  // Text
  text: "#333333",
  textMuted: "#777777",

  // Grays / lines
  border: "#E0E0E0",
  borderStrong: "#B3B3B3",
  light: "#F2F2F2",

  // Semantic
  success: "#0A8754",
  danger: "#C0392B",
  warning: "#F39C12",
  info: "#2980B9",

  // Accent (nhấn cơ khí, hơi “cảnh báo”)
  accent: "#FFB347",

  white: "#FFFFFF",
  black: "#000000",
} as const;

export const Radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export type ThemeColors = typeof Colors;
export type ThemeRadius = typeof Radius;
export type ThemeSpacing = typeof Spacing;
