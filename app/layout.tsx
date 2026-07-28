import type { Metadata } from "next";
import "./globals.css";
import { EnableCodeCopy } from "@/components/CopyableCode";
import { TermActivator } from "@/components/TermActivator";
import { AnnotatedCodeEnhancer } from "@/components/AnnotatedCodeEnhancer";

const SITE_URL = "https://terasoluna-training-docs.vercel.app";
const SITE_TITLE = "TERASOLUNA 研修 — 役職編集アプリ 組立ガイド";
const SITE_DESCRIPTION =
  "TERASOLUNA multi-project (5 モジュール構成) で役職編集アプリを Step 00〜15 で組み立てる学習ガイド。JSP + MyBatis + Spring Security を「なぜこう書くか」まで理解しながら進める構成。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | TERASOLUNA 研修ガイド",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "TERASOLUNA 研修ガイド",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/*
          スキップリンク: キーボード操作者がサイドバーのナビゲーションを
          読み飛ばして本文 (id="main") に直接ジャンプできるようにする。
          普段は sr-only (視覚的に非表示) で、フォーカスされた時だけ見える。
          本文側の <main id="main"> は各ページ (steps/ steps-boot/ build-order/
          architecture/ playground 系) 側で付与している。
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          本文へスキップ
        </a>
        {children}
        <EnableCodeCopy />
        <TermActivator />
        <AnnotatedCodeEnhancer />
      </body>
    </html>
  );
}
