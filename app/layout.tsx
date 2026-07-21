import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TERASOLUNA 研修 — 役職編集アプリ 組立ガイド",
  description:
    "Spring Boot + JSP + MyBatis + H2 で役職編集アプリを 12 ステップで組み立てるガンプラ式ガイド",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
