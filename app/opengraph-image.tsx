import { ImageResponse } from "next/og";

// SNS / Slack 等でリンクを貼った時に表示される OGP 画像。
// next/og の ImageResponse で動的生成 (依存追加不要)。
//
// 日本語テキストは satori (内部レンダラ) の同梱フォントでは描画できない
// (CJK グリフ非搭載 → 豆腐化する) ため、フォントファイルを別途バンドルせずに
// 確実に動かすことを優先し、この画像内のテキストは ASCII のみで構成する。
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#134e4a", // brand-dark
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 20,
            background: "#0f766e", // brand
            color: "#ffffff",
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          T
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          TERASOLUNA Training Guide
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#99f6e4",
            marginTop: 28,
            textAlign: "center",
          }}
        >
          Spring Boot + JSP + MyBatis + H2 / 12-Step Hands-on Guide
        </div>
      </div>
    ),
    { ...size }
  );
}
