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
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: "#101827",
          800: "#1e293b",
          700: "#334155",
        },
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1d4ed8",
          light: "#eff6ff"
        },
        accent: {
          violet: "#7C3AED",
          purple: "#9333ea"
        },
        canvas: "#F8FAFC"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.08)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
