import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export default function HomePage() {
  const steps = getAllSteps();
  const stepsExceptToc = steps.filter((s) => s.number > 0);

  return (
    <div className="md:flex md:max-w-[80rem] md:mx-auto">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-12 md:py-12">
          {/* Hero */}
          <div className="mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              教える立場のあなたが理解しておくためのメモ
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              役職編集アプリを
              <br className="md:hidden" />
              12 ステップで組み立てる
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              <strong>これは後輩に配る資料ではなく、教える側 (あなた)
              が「後輩に何を聞かれても答えられる」状態を作るためのガイド</strong>。
              Java・JSP の基本文法から入って、Spring Boot + JSP + MyBatis + H2 で
              ログイン → メニュー → 検索 → ユーザ情報 → 変更 の 5 画面アプリをガンプラのように部品ごとに組み立てます。
            </p>
          </div>

          {/* Big "Start here" banner */}
          <Link
            href="/preface"
            className="block bg-gradient-to-br from-brand to-brand-dark text-white rounded-2xl p-6 md:p-8 mb-4 md:mb-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl md:text-5xl leading-none">📗</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                  まず最初に読む
                </div>
                <div className="text-xl md:text-2xl font-bold mt-1">
                  Web アプリって何をしてるの?
                </div>
                <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                  「Controller → どこに行くの?」レベルからでも読めるように、レストランに例えて全体像を掴む。
                  <strong className="text-white">先にこれを読んでから Step 01 に進むと理解が早い。</strong>
                </p>
                <span className="inline-block mt-3 text-sm bg-white text-brand-dark font-semibold px-3 py-1.5 rounded">
                  はじめにを読む →
                </span>
              </div>
            </div>
          </Link>

          {/* Secondary entry cards */}
          <div className="grid gap-3 md:gap-4 md:grid-cols-3 mb-10">
            <Link
              href="/steps/01-project-skeleton"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-brand hover:shadow-sm transition-all"
            >
              <div className="text-3xl">🚀</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Start
              </div>
              <div className="text-lg font-bold mt-1 text-slate-900">
                Step 01 から始める
              </div>
              <div className="text-sm text-slate-600 mt-1 leading-snug">
                順番に組み立てるガイド
              </div>
            </Link>

            <Link
              href="/glossary"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-brand hover:shadow-sm transition-all"
            >
              <div className="text-3xl">📖</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Glossary
              </div>
              <div className="text-lg font-bold mt-1 text-slate-900">
                用語集
              </div>
              <div className="text-sm text-slate-600 mt-1 leading-snug">
                Bean / DI / CSRF … 40 用語
              </div>
            </Link>

            <Link
              href="/playground"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-brand hover:shadow-sm transition-all"
            >
              <div className="text-3xl">🕹</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Try
              </div>
              <div className="text-lg font-bold mt-1 text-slate-900">
                触ってみるデモ
              </div>
              <div className="text-sm text-slate-600 mt-1 leading-snug">
                STS 無しでログイン・検索・変更を体験
              </div>
            </Link>
          </div>

          {/* 特徴 */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 mb-6">
            <h2 className="text-base md:text-lg font-bold mb-3 text-slate-900">
              このガイドの特徴
            </h2>
            <ul className="space-y-2 text-slate-700 text-sm md:text-base">
              <Bullet>
                <strong>Java・JSP の基本文法から</strong>始まる。初見でも読める粒度
              </Bullet>
              <Bullet>
                各ステップは <strong>5〜15 分</strong>。順番通りに進めれば必ず動く
              </Bullet>
              <Bullet>
                コードは <strong>コピペOK</strong>。すべて手打ちしなくていい
              </Bullet>
              <Bullet>
                各ステップに「<strong>なぜこう書くか</strong>」の解説付き
                — 後輩の想定質問に即答できる状態を目指す
              </Bullet>
              <Bullet>
                <strong>プレイグラウンド付き</strong>: 実物と同じ画面を触って動きを確かめられる
              </Bullet>
            </ul>
          </section>

          {/* 前提 */}
          <section className="bg-slate-50 rounded-xl border border-slate-200 p-5 md:p-6 mb-10">
            <h2 className="text-base md:text-lg font-bold mb-3 text-slate-900">
              前提
            </h2>
            <ul className="space-y-1.5 text-slate-700 text-sm md:text-base">
              <li>• JDK 17+ (JDK 24 でも動く)</li>
              <li>• Maven (3.8+)</li>
              <li>• 好きなエディタ (STS4 / VSCode / IntelliJ どれでも)</li>
            </ul>
          </section>

          {/* Step list */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              12 ステップ一覧
            </h2>
            <div className="grid gap-2">
              {stepsExceptToc.map((step) => (
                <Link
                  key={step.slug}
                  href={`/steps/${step.slug}`}
                  className="flex items-baseline gap-3 bg-white rounded-lg border border-slate-200 px-4 py-3 hover:border-brand hover:shadow-sm transition-all"
                >
                  <span className="text-brand font-mono font-bold text-sm md:text-base w-8 shrink-0">
                    {String(step.number).padStart(2, "0")}
                  </span>
                  <span className="text-slate-900 font-semibold text-sm md:text-base">
                    {step.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 text-center">
            Built for TERASOLUNA training · Spring Boot 3.4 · 2026
          </div>
        </main>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-brand font-bold shrink-0">✓</span>
      <span>{children}</span>
    </li>
  );
}
