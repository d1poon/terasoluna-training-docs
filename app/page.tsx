import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export default function HomePage() {
  const steps = getAllSteps();
  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
      <Sidebar steps={steps} />

      <main className="flex-1 min-w-0 p-6 md:p-12">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            教える立場のあなたが理解しておくためのメモ
          </div>
          <h1 className="text-4xl font-bold mt-2 text-slate-900">
            役職編集アプリを 12 ステップで組み立てる
          </h1>
          <p className="mt-4 text-slate-700 text-lg leading-relaxed">
            <strong>これは後輩に配る資料ではなく、教える側 (あなた) が「後輩に何を聞かれても答えられる」状態を作るためのガイド</strong>。
            Java・JSP の基本文法から入り、Spring Boot + JSP + MyBatis + H2 で
            ログイン → メニュー → 検索 → ユーザ情報 → 変更 の 5 画面アプリをガンプラのように部品ごとに組み立てます。
          </p>
        </div>

        <section className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-3 text-slate-900">このガイドの特徴</h2>
          <ul className="space-y-2 text-slate-700">
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span><strong>Java・JSP の基本文法から</strong>始まる。初見でも読める粒度</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>各ステップは <strong>5〜15分</strong>。順番通りに進めれば必ず動く</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>コードは <strong>コピペOK</strong>。すべて手打ちしなくて良い</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>各ステップに「<strong>なぜこう書くか</strong>」の解説付き — 後輩の想定質問に即答できる状態を目指す</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span><strong>プレイグラウンド付き</strong>: 実物と同じ画面を触って動きを確かめられる (STS 起動不要)</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-3 text-slate-900">前提</h2>
          <ul className="space-y-2 text-slate-700">
            <li>• JDK 17+ (JDK 24 でも可)</li>
            <li>• Maven (3.8+)</li>
            <li>• 好きなエディタ (STS4 / VSCode / IntelliJ どれでも)</li>
          </ul>
        </section>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <section className="bg-gradient-to-br from-brand to-brand-dark text-white rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl leading-none">🏛</span>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-2">まず全体像を見る</h2>
                <p className="text-white/90 mb-3 text-sm leading-relaxed">
                  domain / service / controller / repository … どのファイルがどの層で、どの Step で作るかを一枚で。
                </p>
                <Link
                  href="/architecture"
                  className="inline-block bg-white text-brand-dark text-sm font-semibold px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
                >
                  アーキテクチャを見る →
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl leading-none">🕹</span>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-2">触って動きを確かめる</h2>
                <p className="text-white/90 mb-3 text-sm leading-relaxed">
                  STS を立ち上げなくても、ログイン・検索・変更の実物と同じ挙動をこのページで試せます。
                </p>
                <Link
                  href="/playground"
                  className="inline-block bg-white text-orange-700 text-sm font-semibold px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
                >
                  Playground を開く →
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">ステップ一覧</h2>
          <div className="grid gap-3">
            {steps.map((step) => (
              <Link
                key={step.slug}
                href={`/steps/${step.slug}`}
                className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-brand hover:shadow-sm transition-all"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-brand font-mono font-bold text-lg w-10">
                    {String(step.number).padStart(2, "0")}
                  </span>
                  <span className="text-slate-900 font-semibold">{step.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500 text-center">
          Built for TERASOLUNA training · Spring Boot 3.4 · 2026
        </div>
      </main>
    </div>
  );
}
