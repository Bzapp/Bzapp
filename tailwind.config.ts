import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#12151a",
          900: "#1a1f27",
          800: "#2a3140",
          700: "#3d4658",
          600: "#5a6478",
          500: "#7a8496",
          400: "#9aa3b2",
          300: "#c3c9d4",
          200: "#e2e6ec",
          100: "#f0f2f5",
          50: "#f7f8fa",
        },
        oil: {
          700: "#8a4a12",
          600: "#b35d0e",
          500: "#d97706",
          400: "#f59e0b",
          300: "#fbbf24",
        },
        steel: {
          600: "#3d5a73",
          500: "#4f7391",
          400: "#6b8fad",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(18,21,26,0.06), 0 8px 24px rgba(18,21,26,0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
