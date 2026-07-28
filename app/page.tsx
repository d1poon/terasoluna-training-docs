import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps, formatStepNumber } from "@/lib/steps";
import { PageFooter } from "@/components/PageFooter";
import { VERSIONS } from "@/lib/versions";

export default function HomePage() {
  const steps = getAllSteps();
  const stepsExceptToc = steps.filter((s) => s.number > 0);

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main id="main" className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              TERASOLUNA multi-project 研修教材 — {VERSIONS.terasolunaGfw} 準拠
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              役職編集アプリを
              <br className="md:hidden" />
              TERASOLUNA multi-project で組み立てる
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              <strong>研修環境で実際に使う TERASOLUNA archetype (blank-jsp-mybatis3) の 5 モジュール構成</strong>を軸に、
              ログイン → メニュー → 検索 → ユーザ情報 → 変更 の 5 画面アプリを「なぜこう書くか」まで理解しながら組み立てます。
              初学者向けに、<strong>各行の意図を自分の言葉で説明できる状態を目指す</strong>丁寧な構成にしています。
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              <strong>TERASOLUNA</strong> は日本の SIer 現場で広く使われる Spring ベースの開発フレームワーク。本教材は{" "}
              <code className="text-xs bg-slate-100 px-1 rounded">
                terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype {VERSIONS.terasolunaGfw}
              </code>{" "}
              (Spring Boot {VERSIONS.springBoot} / Spring Framework {VERSIONS.springFramework} / JDK 17 /
              MyBatis {VERSIONS.mybatis} / Tomcat 11) を主軸に書かれています。
              先に Boot 単一版で本質を掴みたい人向けに <Link href="/steps-boot/00-toc" className="text-brand underline">補助: Boot 版</Link> も用意しています。
            </p>
          </div>

          {/* Primary CTA — "Start here" recommended route */}
          <div className="mb-3">
            <div className="inline-block text-[10px] uppercase tracking-wider font-bold bg-brand text-white px-2 py-0.5 rounded">
              👉 まずここから
            </div>
          </div>
          <Link
            href="/steps/00-modules-map"
            className="block bg-gradient-to-br from-brand to-brand-dark text-white rounded-2xl p-6 md:p-8 mb-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div aria-hidden="true" className="text-4xl md:text-5xl leading-none">🗺</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider opacity-80 font-semibold">
                  Step 00 · 5 モジュールの地図
                </div>
                <div className="text-xl md:text-2xl font-bold mt-1">
                  demo-web / -domain / -env / -initdb / -selenium
                </div>
                <p className="mt-2 text-sm md:text-base text-white/90 leading-relaxed">
                  archetype 生成物の 5 モジュールがそれぞれ何を持つか、依存方向、「新しいファイルはどこに作るか」の判断フローを掴む。
                  <strong className="text-white">Step 01 以降で迷わないための土台。</strong>
                </p>
                <span className="inline-block mt-3 text-sm bg-white text-brand-dark font-semibold px-3 py-1.5 rounded">
                  地図を見る →
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/preface"
            className="block bg-white border-2 border-brand/40 rounded-xl p-4 md:p-5 mb-10 hover:border-brand hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <div aria-hidden="true" className="text-2xl leading-none">📗</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider text-brand font-semibold">
                  Web アプリって何?レベルの人はまずここ
                </div>
                <div className="text-base md:text-lg font-bold mt-0.5 text-slate-900">
                  はじめに (レストランメタファーで全体像)
                </div>
                <p className="mt-1 text-sm text-slate-600 leading-snug">
                  「Controller → どこに行くの?」レベルからでも読めるフロー解説。Step 00 と併読推奨。
                </p>
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
              desc="1. pom.xml → 22. userInfoEdit.jsp の実装、23. 通し動作確認まで番号順に並んだリスト。進捗保存機能付き。"
              accent="border-slate-200 hover:border-brand"
            />
            <SecondaryCard
              href="/db-connection"
              emoji="🔌"
              tag="Deep Dive"
              tagBg="bg-cyan-100"
              tagText="text-cyan-900"
              title="DB 接続の仕組み (TERASOLUNA -env)"
              desc="demo-infra.properties → demo-env.xml → demo-infra.xml の連鎖、Connection Pool、エラー診断まで。"
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
                <strong>時間は気にせず、腑に落ちるまで読んでから次へ</strong>。
                所要時間の目安は敢えて載せていません — 速く進めることより、各行の意味を自分の言葉で説明できる状態を優先してください。
                詰まった時は各 Step の「動作確認」節 や <Link href="/troubleshoot" className="text-brand underline">トラブルシュート</Link> を参照
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
              <li>• JDK 17+ (24 でも動作、TERASOLUNA 5.11.0 系は 17 必須)</li>
              <li>• Maven 3.9+</li>
              <li>• Tomcat 11 (STS4 / Eclipse の Servers ビューに登録して使用)</li>
              <li>• コーディングのエディタは自由 (STS4 / VSCode / IntelliJ どれでも) だが、アプリの起動 (Run on Server) は STS4 (Eclipse ベース) を使用</li>
              <li>• 詳細な使用バージョンは <Link href="/versions" className="text-brand underline">バージョン一覧</Link> 参照</li>
            </ul>
          </section>

          {/* Step list */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">
              Step 一覧 (TERASOLUNA multi-project)
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              まず <strong>Step 00</strong> で 5 モジュールの地図を掴む。あとは <strong>Step 01 から順に一つずつ</strong>、
              動作確認までを丁寧に踏んでから次へ進めます。前のステップの成果物を次で使うので、飛ばさずに順に進めてください。
              <strong>時間の目安は載せていません</strong> — 自分のペースで、詰まったら「なぜこう書く」節や「よくある詰まり」節を何度でも読み返す前提の構成です。
              <br />
              なお <strong>Step 02.5 / 12.5</strong> は<strong>オプションのステップ</strong>で、飛ばしても次に進めます。
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
            Built for TERASOLUNA training · TERASOLUNA {VERSIONS.terasolunaGfw} · Spring Boot{" "}
            {VERSIONS.springBoot} · 2026
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
