import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps, formatStepNumber } from "@/lib/steps";
import { PageFooter } from "@/components/PageFooter";

export default function HomePage() {
  const steps = getAllSteps();
  const stepsExceptToc = steps.filter((s) => s.number > 0);

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              「なぜこう書くか」まで理解しながら組み立てる Spring 教材
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              役職編集アプリを
              <br className="md:hidden" />
              15 ステップで組み立てる
              <span className="ml-2 text-sm text-slate-500 font-normal align-middle">(+ 補助 1)</span>
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              <strong>単に動くコードを写経するのではなく、各行の「なぜこう書くか」まで納得しながら進める構成のガイド</strong>。
              Java・JSP の基本文法から入って、Spring Boot + JSP + MyBatis + H2 で
              ログイン → メニュー → 検索 → ユーザ情報 → 変更 の 5 画面アプリを、
              部品ごとに順番通りに組み立てます。独学の学習者にも、他人に教える立場の方にも役立つ構成です。
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              <strong>TERASOLUNA</strong> は日本の SIer 現場で広く使われる Spring ベースの開発フレームワーク。
              本教材は先に Spring Boot でシンプルに組んでから TERASOLUNA スタイルへの読み替えを提供する構成なので、両者を初めて触る人でも順に理解できます。
            </p>
          </div>

          {/* Primary CTA — "Start here" recommended route */}
          <div className="mb-3">
            <div className="inline-block text-[10px] uppercase tracking-wider font-bold bg-brand text-white px-2 py-0.5 rounded">
              👉 初めての方はこちら
            </div>
          </div>
          <Link
            href="/preface"
            className="block bg-gradient-to-br from-brand to-brand-dark text-white rounded-2xl p-6 md:p-8 mb-10 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div aria-hidden="true" className="text-4xl md:text-5xl leading-none">📗</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                  まず最初に読む · 推奨ルート
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

          {/* Secondary — Other routes (2×2 grid) */}
          <div className="mb-3">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              用途別の入口
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 mb-10">
            <SecondaryCard
              href="/textbook"
              emoji="📚"
              tag="For Beginners"
              tagBg="bg-indigo-100"
              tagText="text-indigo-900"
              title="ゼロから始める 教科書"
              desc="「カラムって何?」「タグって?」レベルからでも読めるチャプター 1-6。プログラミングが初めての人向け。"
              accent="border-indigo-200 hover:border-indigo-500"
            />
            <SecondaryCard
              href="/how-to"
              emoji="🍳"
              tag="How-to Recipe"
              tagBg="bg-orange-100"
              tagText="text-orange-900"
              title="「〜するには?」レシピ集 (20 個)"
              desc="「画面遷移するには?」「Service の作り方は?」を 1 行の答え + 実物コードで。"
              accent="border-orange-200 hover:border-orange-500"
            />
            <SecondaryCard
              href="/build-order"
              emoji="✅"
              tag="Checklist"
              tagBg="bg-brand/10"
              tagText="text-brand-dark"
              title="作成順チェックリスト (全 23 項目)"
              desc="1. pom.xml → 22. userInfoEdit.jsp まで通し番号で並んだリスト。進捗保存機能付き。"
              accent="border-slate-200 hover:border-brand"
            />
            <SecondaryCard
              href="/db-connection"
              emoji="🔌"
              tag="Deep Dive"
              tagBg="bg-cyan-100"
              tagText="text-cyan-900"
              title="DB 接続の仕組み (TERASOLUNA -env)"
              desc="jdbc.properties → -env.xml → -infra.xml の連鎖、Connection Pool、エラー診断まで。"
              accent="border-cyan-200 hover:border-cyan-500"
            />
          </div>

          {/* Quick access — 3-card grid */}
          <div className="mb-3">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              クイックアクセス
            </h2>
          </div>
          <div className="grid gap-3 md:gap-4 md:grid-cols-3 mb-10">
            <Link
              href="/steps/01-project-skeleton"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-brand hover:shadow-sm transition-all"
            >
              <div aria-hidden="true" className="text-3xl">🚀</div>
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
              <div aria-hidden="true" className="text-3xl">📖</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Glossary
              </div>
              <div className="text-lg font-bold mt-1 text-slate-900">
                用語集
              </div>
              <div className="text-sm text-slate-600 mt-1 leading-snug">
                Bean / DI / CSRF … 検索付き
              </div>
            </Link>

            <Link
              href="/playground"
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-brand hover:shadow-sm transition-all"
            >
              <div aria-hidden="true" className="text-3xl">🕹</div>
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
                各ステップは <strong>5〜15 分</strong>。順番通りに進めれば動くところまで到達する構成
                (詰まった時は <Link href="/how-to" className="text-brand underline">レシピ集</Link>
                や各 Step の「動作確認」節を参照)
              </Bullet>
              <Bullet>
                コードは <strong>コピペOK</strong>。すべて手打ちしなくていい
              </Bullet>
              <Bullet>
                各ステップに「<strong>なぜこう書くか</strong>」の解説付き
                — 「なんとなく動いた」ではなく、自分の言葉で説明できる状態を目指す
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
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">
              15 ステップ一覧 (+ 補助 1)
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Step 01-12 は「動くアプリを組む」フェーズ (通しで 1〜3 時間)。
              Step 13-15 は「JUnit5 + Mockito + MockMvc で自動テストを書く」フェーズ (追加 1〜2 時間)。
              前のステップに依存するので、上から順に進めてください。
              なお <strong>Step 02.5</strong> は Step 03-06 のバックエンド積み上げ期に入る前に画面を出す成功体験を挟むための<strong>オプションのステップ</strong>で、飛ばしても Step 03 に進めます。
            </p>
            <div className="grid gap-2">
              {stepsExceptToc.map((step) => (
                <Link
                  key={step.slug}
                  href={`/steps/${step.slug}`}
                  className="flex items-baseline gap-3 bg-white rounded-lg border border-slate-200 px-4 py-3 hover:border-brand hover:shadow-sm transition-all"
                >
                  <span className="text-brand font-mono font-bold text-sm md:text-base w-12 shrink-0">
                    {formatStepNumber(step.number)}
                  </span>
                  <span className="text-slate-900 font-semibold text-sm md:text-base">
                    {step.title}
                    {!Number.isInteger(step.number) && (
                      <span className="ml-2 text-xs text-slate-500 font-normal">(オプション)</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 text-center">
            Built for TERASOLUNA training · Spring Boot 3.4 · 2026
          </div>

          <PageFooter pageTitle="トップページ" slug="" />
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

function SecondaryCard({
  href,
  emoji,
  tag,
  tagBg,
  tagText,
  title,
  desc,
  accent,
}: {
  href: string;
  emoji: string;
  tag: string;
  tagBg: string;
  tagText: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={
        "block bg-white border rounded-xl p-5 hover:shadow-sm transition-all " +
        accent
      }
    >
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className="text-3xl leading-none shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <span
            className={
              "inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded " +
              tagBg +
              " " +
              tagText
            }
          >
            {tag}
          </span>
          <div className="text-base md:text-lg font-bold mt-1.5 text-slate-900 leading-tight">
            {title}
          </div>
          <p className="mt-1.5 text-sm text-slate-600 leading-snug">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
