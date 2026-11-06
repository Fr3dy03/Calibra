import type { Config } from "tailwindcss";

/**
 * CalibraGraph design tokens — "Deep Void / Neon Instrument".
 *
 * New design language (Web3-native, senior-level):
 *   - Deep-space canvas (#05070D) with nebula mesh gradients + grid overlay
 *   - Frosted glass panels (backdrop blur + luminous borders)
 *   - Neon gradient accents: violet (#8B5CF6) → electric blue (#3B82F6) → mint-teal (#2DD4BF)
 *   - Neon glow shadows on primary actions / live data
 *   - Display serif-free geometric sans (Space Grotesk) for headlines
 *   - Monospace (IBM Plex Mono) for every number, hash, serial, digest
 *
 * Palette derived from current Web3 "Crypto Aesthetic" research:
 *   void #05070D · deep space #0D1424 · silver text #E8EEF8 · mist #93A3B8
 *   electric indigo #6366F1 · violet #8B5CF6 · neon blue #3B82F6 · cyan #22D3EE
 *   mint teal #2DD4BF · caution amber #F59E0B · alert red #F43F5E
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
        bg: "#05070D",
        surface: "#0D1424",
        surfaceAlt: "#090E19",
        text: "#E8EEF8",
        muted: "#93A3B8",
        cobalt: "#6366F1",
        cobaltLight: "#161D38",
        teal: "#2DD4BF",
        tealLight: "#0D2B28",
        ochre: "#F59E0B",
        ochreLight: "#2A1E08",
        critical: "#F43F5E",
        border: "#1B2740",
        violet: "#8B5CF6",
        blue: "#3B82F6",
        cyan: "#22D3EE",
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
        display: [
          "var(--font-display)",
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
        DEFAULT: "10px",
      },
      maxWidth: {
        page: "72rem",
        copy: "42rem",
      },
      boxShadow: {
        card: "0 10px 40px -18px rgba(2, 8, 23, 0.9)",
        lift: "0 14px 44px -14px rgba(99, 102, 241, 0.5)",
        glow: "0 0 36px -8px rgba(139, 92, 246, 0.65), 0 0 90px -24px rgba(59, 130, 246, 0.45)",
        glowTeal: "0 0 30px -8px rgba(45, 212, 191, 0.55)",
        halo: "0 0 130px -30px rgba(99, 102, 241, 0.55)",
      },
      animation: {
        aurora: "aurora 30s ease-in-out infinite alternate",
        "grid-pan": "grid-pan 90s linear infinite",
      },
      keyframes: {
        aurora: {
          "0%": { transform: "translate3d(-4%, -2%, 0) scale(1)" },
          "50%": { transform: "translate3d(3%, 3%, 0) scale(1.06)" },
          "100%": { transform: "translate3d(-2%, 4%, 0) scale(1.03)" },
        },
        "grid-pan": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "44px 44px" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
