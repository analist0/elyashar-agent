import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Aptos", "Segoe UI", "Arial", "sans-serif"],
        mono: ["Cascadia Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
