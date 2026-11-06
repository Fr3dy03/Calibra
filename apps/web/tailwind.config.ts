import type { Config } from "tailwindcss";

/**
 * CalibraGraph design tokens.
 * Palette: calibration-platform colors, no gradients, no decorative purple.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAFCFD",
        surface: "#FFFFFF",
        text: "#263643",
        muted: "#647584",
        cobalt: "#285DAD",
        cobaltLight: "#EDF3FC",
        teal: "#168A91",
        tealLight: "#E7F5F3",
        ochre: "#C18A30",
        ochreLight: "#FBF1DC",
        critical: "#C24F4A",
        border: "#DFE7EC",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-plex-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
      },
      maxWidth: {
        page: "72rem",
        copy: "42rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(38, 54, 67, 0.04)",
        lift: "0 4px 16px 0 rgba(38, 54, 67, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
