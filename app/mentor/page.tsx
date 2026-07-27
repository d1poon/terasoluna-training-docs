import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { RelatedLinks } from "@/components/RelatedLinks";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";

export const metadata = { title: "メンター向けガイド | TERASOLUNA 研修" };

// ==========================================================================
// 【非表示化: 2026-07-28】
// このページはユーザ判断で「非表示」扱い。コード本体 (PITFALLS 配列、
// レンダリング等) は削除せず保持したまま、URL 直叩き時に 404 を返す。
// Sidebar / SearchPalette / RelatedLinks からのリンクも同時に除去済み。
// 再公開する時は、下の HIDDEN フラグを false にするだけで復活する。
// ==========================================================================
const HIDDEN = true;

/* ============== データ ============== */

type Pitfall = {
  step: string;
  href: string;
  symptom: string;
  socratic: string; // 答えを言わない質問
  answer: string;   // 教える側だけが読む答え
  budgetMin: number; // 想定所要時間 (分)
  redLine: number;   // これを超えたら助け舟を出す
};

const PITFALLS: Pitfall[] = [
  {
    step: "Step 01",
    href: "/steps/01-project-skeleton",
    symptom: "`mvn compile` で BUILD FAILURE、依存が解決できない",
    socratic: "「そのエラーメッセージの最後の 5 行、どこに何と書いてある?」→「そのライブラリはローカル?中央リポジトリ?」",
    answer: "社内プロキシで maven central にアクセスできない可能性。`~/.m2/settings.xml` にプロキシ設定が要る。もしくは会社の Nexus / JFrog を mirror として登録",
    budgetMin: 20,
    redLine: 40,
  },
  {
    step: "Step 02",
    href: "/steps/02-empty-boot",
    symptom: "起動時 `Failed to determine a suitable driver class`",
    socratic: "「そのエラー、Spring は何を探しに行った?」→「どこを見に行った?」→「そこに答え (URL や driver-class-name) はある?」",
    answer: "`application.properties` の `spring.datasource.url` / `driver-class-name` が抜けている、または typo",
    budgetMin: 5,
    redLine: 15,
  },
  {
    step: "Step 04",
    href: "/steps/04-mapper",
    symptom: "`Invalid bound statement (not found)`",
    socratic: "「そのエラー、どのファイルとどのファイルの話をしてる?」→「その 2 つが何で紐付いているんだっけ?」→「実際に文字列を並べて比べてみて」",
    answer: "XML の namespace と Java interface の完全修飾名が 1 文字違い。多くは大文字小文字違い、または `.repository` → `.mapper` などの typo",
    budgetMin: 10,
    redLine: 30,
  },
  {
    step: "Step 06",
    href: "/steps/06-auth-foundation",
    symptom: "ログイン画面と /login の間で無限リダイレクト",
    socratic: "「ログイン画面自体を表示する URL は認証が要る?要らない?」→「今の設定はどうなっている?」→「JSP は最終的にどのパスから読み込まれる?」",
    answer: "`SecurityConfig` の `permitAll()` に `/WEB-INF/**` が抜けている。JSP forward が再フィルタで蹴られる Spring Security 6 の仕様",
    budgetMin: 15,
    redLine: 45,
  },
  {
    step: "Step 07",
    href: "/steps/07-login",
    symptom: "POST /login で 403 Forbidden",
    socratic: "「サーバは何を期待して弾いた?」→「フォームには何を hidden で埋め込んでいる?」→「その値、どこから来る?」",
    answer: "CSRF トークンの hidden input が抜けている。または JSTL の `${_csrf.token}` の綴りミス",
    budgetMin: 10,
    redLine: 25,
  },
  {
    step: "Step 09",
    href: "/steps/09-search",
    symptom: "空欄検索したら 0 件、期待は全件",
    socratic: "「Mapper に渡っている値は何?」→「XML の LIKE パターンは今どうなっている?」→「LIKE '%null%' って動く?」",
    answer: "Controller が null を空文字に正規化していない、または XML の LIKE 前後の `||` が MySQL 系に変えられている",
    budgetMin: 10,
    redLine: 30,
  },
  {
    step: "Step 11",
    href: "/steps/11-edit",
    symptom: "更新はできるが F5 リロードで警告が出る",
    socratic: "「今、Controller は何を return している?」→「redirect と直接 return は何が違う?」→「HTTP のレベルで何が起きている?」",
    answer: "PRG パターンになっていない。POST の後に `return \"redirect:/user-info\"` にする必要がある",
    budgetMin: 10,
    redLine: 25,
  },
  {
    step: "Step 13",
    href: "/steps/13-service-test",
    symptom: "`@Mock` が動かず NullPointerException",
    socratic: "「JUnit5 は annotation を勝手に解釈する?」→「Mockito の annotation は誰が動かす?」→「今、その仕組みを有効化する 1 行は書いた?」",
    answer: "`@ExtendWith(MockitoExtension.class)` が抜けている",
    budgetMin: 15,
    redLine: 30,
  },
  {
    step: "Step 14",
    href: "/steps/14-mapper-test",
    symptom: "`@Autowired` の `UserService` で `NoSuchBeanDefinitionException`",
    socratic: "「@MybatisTest はどこまで起動する?」→「そのテストで Service が要る場面は本当にある?」→「Mapper 層だけで見るべきものは何?」",
    answer: "`@MybatisTest` は Mapper 層だけ起動する仕様。Service を含めたい場合は `@SpringBootTest` に切り替える",
    budgetMin: 10,
    redLine: 25,
  },
];

const CHECKLIST_STEP12 = [
  { q: "5 画面すべて 1 つのブラウザで通しで操作できたか (ログイン → メニュー → 検索 → ユーザ情報 → 変更 → 保存)", note: "1 つでも遷移が止まったら未完了" },
  { q: "u001 でログインして u002 の情報が見えていないか", note: "IDOR 脆弱性の目視確認" },
  { q: "F5 リロードで二重更新が起きないか (Step 11 の PRG)", note: "URL バーが `/user-info` になっていることも同時確認" },
  { q: "H2 コンソール (`/h2-console`) で `SELECT * FROM users` の結果が期待通りか", note: "BCrypt ハッシュが 60 文字入っているか" },
  { q: "ログアウト → 保護 URL 直打ちで `/login` にリダイレクトされるか", note: "Spring Security が生きている確認" },
  { q: "空欄検索で 5 件全部返るか、`長` で 3 件返るか", note: "SQL の LIKE 挙動確認" },
  { q: "Step 13-15 の自動テストが 14 件全部 PASS するか", note: "`mvn test` で BUILD SUCCESS" },
];

export default function MentorPage() {
  if (HIDDEN) notFound();  // ← 非表示中: /mentor は 404 を返す
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              For Mentors · 教える立場の方向け
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              メンター向けガイド
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              <strong>「答えを言わずに気付かせる」</strong>ための、ステップ別ハマりどころ集。
              学習者が詰まったとき、いきなり答えを渡すと考える機会を奪う。
              まず<strong>質問で場所を絞らせて</strong>、それでも詰まったら助け舟を出す。
            </p>
          </div>

          <PageMeta />

          {/* 使い方 */}
          <section className="mb-10 bg-white rounded-xl border border-slate-200 p-5 md:p-6">
            <h2 className="text-lg font-bold mb-3 text-slate-900">
              このページの使い方
            </h2>
            <ol className="space-y-2 text-sm md:text-base text-slate-700 list-decimal pl-6">
              <li>学習者が詰まったら、まず該当 Step の「症状」を照合</li>
              <li>「答えを言わない質問」を <strong>順番に</strong> 投げて、学習者に自力で絞らせる</li>
              <li>想定所要時間 × 1.5 (Red Line) を超えたら「答え」を開いて渡す</li>
              <li>渡した後は「なぜここが原因だったか」を学習者に説明してもらう (理解確認)</li>
            </ol>
          </section>

          {/* ハマりどころ集 */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              ステップ別ハマりどころ ({PITFALLS.length} 個)
            </h2>
            <div className="space-y-4">
              {PITFALLS.map((p, i) => (
                <details
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 open:shadow-sm"
                >
                  <summary className="cursor-pointer p-4 md:p-5 hover:bg-slate-50 rounded-xl">
                    <div className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <Link
                        href={p.href}
                        className="text-xs font-mono bg-brand/10 text-brand-dark px-2 py-0.5 rounded font-semibold hover:bg-brand/20"
                      >
                        {p.step}
                      </Link>
                      <span className="font-semibold text-slate-900 text-sm md:text-base">
                        {p.symptom}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>⏱ 想定 {p.budgetMin} 分</span>
                      <span className="text-rose-600 font-semibold">
                        🚨 {p.redLine} 分超で助け舟
                      </span>
                    </div>
                  </summary>
                  <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-cyan-900 uppercase tracking-wider mb-1">
                        💬 答えを言わない質問
                      </div>
                      <div className="text-sm text-cyan-900 leading-relaxed">
                        {p.socratic}
                      </div>
                    </div>
                    <details className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <summary className="cursor-pointer text-xs font-bold text-amber-900 uppercase tracking-wider">
                        🔓 答え (Red Line 超えたら開く)
                      </summary>
                      <div className="mt-2 text-sm text-amber-900 leading-relaxed">
                        {p.answer}
                      </div>
                    </details>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Step 12 完了判定チェックリスト */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">
              Step 12 完了判定チェックリスト
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              学習者が「できました」と言ったとき、メンターは以下 {CHECKLIST_STEP12.length} 項目を目視・実機確認する。
              <strong>全項目クリアで初めて「完成」</strong>と判定。
            </p>
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <ol className="space-y-3">
                {CHECKLIST_STEP12.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white font-bold text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base text-slate-900 font-semibold leading-relaxed">
                        {item.q}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.note}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* 全体の時間予算 */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              全体の時間予算 (メンターの計画用)
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">フェーズ</th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">Step</th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">最短</th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">想定</th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200 text-rose-700">Red Line</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  <tr className="border-b border-slate-100"><td className="px-3 md:px-4 py-2 font-semibold">セットアップ</td><td className="px-3 md:px-4 py-2 font-mono text-xs">01-02</td><td className="px-3 md:px-4 py-2">15 分</td><td className="px-3 md:px-4 py-2">30 分</td><td className="px-3 md:px-4 py-2 text-rose-600 font-semibold">60 分</td></tr>
                  <tr className="border-b border-slate-100"><td className="px-3 md:px-4 py-2 font-semibold">バックエンド</td><td className="px-3 md:px-4 py-2 font-mono text-xs">03-06</td><td className="px-3 md:px-4 py-2">30 分</td><td className="px-3 md:px-4 py-2">60 分</td><td className="px-3 md:px-4 py-2 text-rose-600 font-semibold">120 分</td></tr>
                  <tr className="border-b border-slate-100"><td className="px-3 md:px-4 py-2 font-semibold">フロントエンド</td><td className="px-3 md:px-4 py-2 font-mono text-xs">07-11</td><td className="px-3 md:px-4 py-2">40 分</td><td className="px-3 md:px-4 py-2">80 分</td><td className="px-3 md:px-4 py-2 text-rose-600 font-semibold">150 分</td></tr>
                  <tr className="border-b border-slate-100"><td className="px-3 md:px-4 py-2 font-semibold">動作確認</td><td className="px-3 md:px-4 py-2 font-mono text-xs">12</td><td className="px-3 md:px-4 py-2">10 分</td><td className="px-3 md:px-4 py-2">20 分</td><td className="px-3 md:px-4 py-2 text-rose-600 font-semibold">40 分</td></tr>
                  <tr className="border-b border-slate-100"><td className="px-3 md:px-4 py-2 font-semibold">テスト</td><td className="px-3 md:px-4 py-2 font-mono text-xs">13-15</td><td className="px-3 md:px-4 py-2">30 分</td><td className="px-3 md:px-4 py-2">60 分</td><td className="px-3 md:px-4 py-2 text-rose-600 font-semibold">120 分</td></tr>
                  <tr className="bg-slate-50 font-bold"><td className="px-3 md:px-4 py-2">合計</td><td className="px-3 md:px-4 py-2 font-mono text-xs">全 15</td><td className="px-3 md:px-4 py-2">≈ 2 時間</td><td className="px-3 md:px-4 py-2">≈ 4 時間</td><td className="px-3 md:px-4 py-2 text-rose-600">≈ 8 時間</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              最短 = 経験者がコピペで進む場合。想定 = 平均的な学習者が「なぜこう書くか」を読みながら進む場合。Red Line = ここを超えたらメンター介入必須。
            </p>
          </section>

          <RelatedLinks items={[
            { href: "/steps/00-toc", emoji: "📚", label: "15 ステップ目次", desc: "セットアップ〜テストまでの全ステップ一覧" },
            { href: "/how-to", emoji: "🍳", label: "「〜するには?」レシピ集", desc: "実装で聞かれる 20 レシピ、答えを見せる用" },
            { href: "/glossary", emoji: "📖", label: "用語集", desc: "55 用語、Ctrl+K で全ページ検索も可能" },
            { href: "/architecture", emoji: "🏛", label: "アーキテクチャ全体図", desc: "22 ファイルの層構造を 1 枚で" },
          ]} />

          <PageFooter pageTitle="メンター向けガイド" slug="mentor" />
        </main>
      </div>
    </div>
  );
}
