import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        graphite: "#1f2937",
        platinum: "#f8fafc",
        saffron: "#f59e0b",
        brandTeal: "#0f766e",
        wine: "#7f1d1d"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(15, 118, 110, 0.18)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 420ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
