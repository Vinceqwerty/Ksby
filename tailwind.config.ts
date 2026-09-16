import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF7",
        foreground: "#142621",
        primary: {
          DEFAULT: "#0F6B5C",
          foreground: "#FAFAF7",
        },
        accent: {
          DEFAULT: "#F4A300",
          foreground: "#142621",
        },
        muted: "#E7E2D8",
        border: "#D8D2C4",
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
