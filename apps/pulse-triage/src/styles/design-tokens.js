/**
 * PulseTriage Design System Tokens
 * Calm healthcare UI with anti-panic design language
 */

export const colors = {
  // Primary: Soft blue palette for calm, trustworthy healthcare
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9", // Primary brand color
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c3d66"
  },

  // Secondary: Soft green for positive actions and success
  secondary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#145231"
  },

  // Warning: Soft amber for important but not critical
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f"
  },

  // Error: Soft red for critical attention (but calming)
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d"
  },

  // Neutral: Soft grays for calm backgrounds
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717"
  },

  // Semantic colors
  success: "#22c55e",
  info: "#0ea5e9",

  // Neutral specific
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent"
};

export const spacing = {
  // Vertical rhythm for calm layout
  xs: "0.5rem", // 8px
  sm: "0.75rem", // 12px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "2.5rem", // 40px
  "3xl": "3rem", // 48px
  "4xl": "4rem", // 64px

  // Aliases for common patterns
  gutter: "1rem", // Base spacing
  gap: "1rem",
  padding: "1rem",
  margin: "1rem"
};

export const radii = {
  // Soft, rounded corners for calm, friendly feel
  none: "0",
  sm: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",

  // Component specific
  card: "0.75rem", // Slightly rounded cards
  button: "0.5rem", // Button corners
  input: "0.5rem", // Input fields
  badge: "9999px" // Pills
};

export const shadows = {
  // Soft, non-intrusive shadows for calm UI
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",

  // Elevation system
  elevation: {
    low: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    medium: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    high: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
  },

  // Dark mode shadows
  dark: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.3)"
  }
};

export const typography = {
  // Font sizes
  size: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem" // 36px
  },

  // Font weights
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  },

  // Letter spacing
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.02em"
  },

  // Preset styles
  heading1: {
    fontSize: "2.25rem",
    fontWeight: 700,
    lineHeight: 1.2
  },
  heading2: {
    fontSize: "1.875rem",
    fontWeight: 700,
    lineHeight: 1.2
  },
  heading3: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.4
  },
  body: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.5
  },
  bodySm: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: 1.4
  },
  button: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5
  }
};

// Export complete design system
export const designTokens = {
  colors,
  spacing,
  radii,
  shadows,
  typography
};

export default designTokens;
