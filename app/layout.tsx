import type { Metadata } from "next";
import "./globals.css";
import { EnableCodeCopy } from "@/components/CopyableCode";
import { TermActivator } from "@/components/TermActivator";
import { AnnotatedCodeEnhancer } from "@/components/AnnotatedCodeEnhancer";

export const metadata: Metadata = {
  title: "TERASOLUNA 研修 — 役職編集アプリ 組立ガイド",
  description:
    "Spring Boot + JSP + MyBatis + H2 で役職編集アプリを 12 ステップで組み立てる学習ガイド。「なぜこう書くか」まで理解しながら進める構成。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <EnableCodeCopy />
        <TermActivator />
        <AnnotatedCodeEnhancer />
      </body>
    </html>
  );
}
