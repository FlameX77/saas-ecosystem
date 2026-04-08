import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0F1C", // Deep Navy
        foreground: "#FFFFFF",
        card: {
          DEFAULT: "#1A1F2E", // Card BG
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#1A1F2E",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#00D4AA", // Electric Teal
          foreground: "#0A0F1C",
        },
        secondary: {
          DEFAULT: "#F59E0B", // Amber Alert
          foreground: "#0A0F1C",
        },
        muted: {
          DEFAULT: "#2D3446",
          foreground: "#94A3B8",
        },
        accent: {
          DEFAULT: "#00D4AA",
          foreground: "#0A0F1C",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#2D3446",
        input: "#2D3446",
        ring: "#00D4AA",
      },
      fontFamily: {
        display: ["var(--font-editorial-new)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
