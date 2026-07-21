import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f766e", // teal-700
          light: "#14b8a6",
          dark: "#134e4a",
        },
      },
      fontFamily: {
        sans: ['"Hiragino Sans"', '"Noto Sans JP"', "system-ui", "sans-serif"],
        mono: ["Consolas", '"Courier New"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
