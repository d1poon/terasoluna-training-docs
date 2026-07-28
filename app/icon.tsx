import { ImageResponse } from "next/og";

// Next.js の file convention: app/icon.tsx を置くだけで favicon 用の
// <link rel="icon"> が自動生成される (next/og の ImageResponse で動的生成、依存追加不要)。
//
// 日本語テキストは satori (ImageResponse の内部レンダラ) の同梱フォントでは
// グリフが無く豆腐 (空白の四角) になるため、確実に描画できる ASCII 1 文字のみを使う。
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#134e4a", // brand-dark (tailwind.config.ts の brand.dark と統一)
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        T
      </div>
    ),
    { ...size }
  );
}
