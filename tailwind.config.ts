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
        // 注意: next/font 等による Web フォントの読み込みは行っていない (2026-07-30 確認)。
        // ここは「OS に該当フォントがインストールされていれば使う」フォールバック指定であり、
        // Web フォントとして配信・読み込みされるわけではない。読者は社内研修受講者中心で
        // Windows 実機が主なため、system-ui (Windows では Segoe UI 相当) を先頭にして
        // 実際に効くフォントを優先し、以降は各 OS で日本語が綺麗に出る候補
        // (Segoe UI / Hiragino Sans (macOS) / Noto Sans JP / Meiryo (旧 Windows)) を
        // インストール済みなら効く保険として並べ、最終的に sans-serif へフォールバックする。
        sans: [
          "system-ui",
          '"Segoe UI"',
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          "Meiryo",
          "sans-serif",
        ],
        mono: ["Consolas", '"Courier New"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
