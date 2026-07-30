"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RelatedLinks } from "@/components/RelatedLinks";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";

// この画面は localStorage による進捗チェックボックスが client 必須のため、
// インタラクティブな本体をこの client component に切り出している。
// ページ側 (page.tsx) は server component に戻し、metadata (title/description) を持つ。
//
// /build-order (Spring Boot 単一プロジェクト版) の実装をそのまま流用し、
// 入門トラック (/steps-basic/、Security なし・4 画面) 用のデータに差し替えたもの。
// localStorage キーは既存 (/build-order) と別にしてあるので進捗は混ざらない。

type Layer =
  | "Build"
  | "SecurityOff"
  | "DDL"
  | "Seed"
  | "Domain"
  | "Repository"
  | "SQL"
  | "Service"
  | "Form"
  | "Controller"
  | "View"
  | "Verify";

const LAYER_STYLE: Record<Layer, { emoji: string; color: string; jp: string }> = {
  Build:       { emoji: "🔧", color: "bg-slate-100 text-slate-800 border-slate-200", jp: "ビルド" },
  SecurityOff: { emoji: "🔓", color: "bg-rose-100 text-rose-900 border-rose-200", jp: "Security 無効化" },
  DDL:         { emoji: "🗄", color: "bg-slate-100 text-slate-800 border-slate-200", jp: "DDL" },
  Seed:        { emoji: "🌱", color: "bg-slate-100 text-slate-800 border-slate-200", jp: "初期データ" },
  Domain:      { emoji: "🧩", color: "bg-amber-100 text-amber-900 border-amber-200", jp: "Domain" },
  Repository:  { emoji: "💾", color: "bg-cyan-100 text-cyan-900 border-cyan-200", jp: "Repository" },
  SQL:         { emoji: "💾", color: "bg-cyan-100 text-cyan-900 border-cyan-200", jp: "SQL" },
  Service:     { emoji: "⚙️", color: "bg-emerald-100 text-emerald-900 border-emerald-200", jp: "Service" },
  Form:        { emoji: "🧾", color: "bg-violet-100 text-violet-900 border-violet-200", jp: "Form" },
  Controller:  { emoji: "🎨", color: "bg-blue-100 text-blue-900 border-blue-200", jp: "Controller" },
  View:        { emoji: "🖼", color: "bg-indigo-100 text-indigo-900 border-indigo-200", jp: "View" },
  Verify:      { emoji: "✅", color: "bg-teal-100 text-teal-900 border-teal-200", jp: "動作確認" },
};

type Item = {
  n: number;
  filename: string;
  path: string;
  layer: Layer;
  desc: string;
  stepSlug: string;
  stepNo: number;
  stepTitle: string;
};

type Phase = {
  name: string;
  emoji: string;
  desc: string;
  items: Item[];
};

const PHASES: Phase[] = [
  {
    name: "Phase A — セットアップ",
    emoji: "🔧",
    desc: "archetype を実行し、Spring Security を無効化する",
    items: [
      { n: 1, filename: "mvn archetype:generate", path: "demo/ (親 pom.xml + 5 子モジュール生成)", layer: "Build", desc: "TERASOLUNA blank archetype (5.11.0.RELEASE) を実行。Security 版と同じコマンドを使う (生成物には spring-security.xml も含まれるが Step 02 で無効化する)", stepSlug: "01-project-skeleton", stepNo: 1, stepTitle: "プロジェクト骨組み (親 POM + 5 子モジュール)" },
      { n: 2, filename: "web.xml ― contextConfigLocation を編集", path: "demo-web/src/main/webapp/WEB-INF/", layer: "SecurityOff", desc: "contextConfigLocation から spring-security.xml の読み込み行を削除する (ファイル自体は残す)", stepSlug: "02-empty-boot", stepNo: 2, stepTitle: "空アプリ起動 (Tomcat デプロイ確認 + Spring Security 無効化)" },
      { n: 3, filename: "web.xml ― springSecurityFilterChain を削除", path: "demo-web/src/main/webapp/WEB-INF/", layer: "SecurityOff", desc: "springSecurityFilterChain の <filter> と <filter-mapping> (計 8 行) を丸ごと削除する", stepSlug: "02-empty-boot", stepNo: 2, stepTitle: "空アプリ起動 (Tomcat デプロイ確認 + Spring Security 無効化)" },
      { n: 4, filename: "pom.xml ― H2 依存を追加", path: "demo-env/", layer: "Build", desc: "H2 in-memory DB の依存を追加 (バージョンは親 POM が管理するので書かない)", stepSlug: "02-empty-boot", stepNo: 2, stepTitle: "空アプリ起動 (Tomcat デプロイ確認 + Spring Security 無効化)" },
    ],
  },
  {
    name: "Phase B — バックエンド",
    emoji: "⚙️",
    desc: "3 層構造 (Domain → Repository → Service) を積み上げる。認証層は無い",
    items: [
      { n: 5, filename: "User.java", path: "demo-domain/src/main/java/com/example/demo/domain/model/", layer: "Domain", desc: "users テーブル 1 行を表す POJO (id / name / role)。認証を扱わないので password カラムは持たない", stepSlug: "03-user-domain", stepNo: 3, stepTitle: "User ドメイン (Entity)" },
      { n: 6, filename: "H2-schema.sql に DDL 追記", path: "demo-env/src/main/resources/database/", layer: "DDL", desc: "users テーブルの CREATE TABLE (id / name / role の 3 カラム) を追記", stepSlug: "03-user-domain", stepNo: 3, stepTitle: "User ドメイン (Entity)" },
      { n: 7, filename: "H2-dataload.sql に初期データ追記", path: "demo-env/src/main/resources/database/", layer: "Seed", desc: "起動時に投入する初期データ 5 件 (id / name / role) を INSERT 文で追記", stepSlug: "03-user-domain", stepNo: 3, stepTitle: "User ドメイン (Entity)" },
      { n: 8, filename: "UserRepository.java (interface)", path: "demo-domain/src/main/java/com/example/demo/domain/repository/user/", layer: "Repository", desc: "findAll / findById / findByRole / update の 4 メソッドを宣言 (MyBatis が実装を自動生成)", stepSlug: "04-repository", stepNo: 4, stepTitle: "Repository (SQL 係) + MyBatis 起動" },
      { n: 9, filename: "UserRepository.xml", path: "demo-domain/src/main/resources/com/example/demo/domain/repository/user/", layer: "SQL", desc: "namespace = Java interface の完全修飾名。findAll / findById / findByRole (LIKE 検索) / update の SQL を実装", stepSlug: "04-repository", stepNo: 4, stepTitle: "Repository (SQL 係) + MyBatis 起動" },
      { n: 10, filename: "UserService.java (interface)", path: "demo-domain/src/main/java/com/example/demo/domain/service/user/", layer: "Service", desc: "Repository の CRUD 4 種にほぼ 1:1 対応するメソッドを宣言", stepSlug: "05-service", stepNo: 5, stepTitle: "Service (interface + Impl)" },
      { n: 11, filename: "UserServiceImpl.java", path: "demo-domain/src/main/java/com/example/demo/domain/service/user/", layer: "Service", desc: "@Service + @Transactional。@Inject で UserRepository を注入 (@Autowired は使わない)", stepSlug: "05-service", stepNo: 5, stepTitle: "Service (interface + Impl)" },
    ],
  },
  {
    name: "Phase C — フロントエンド",
    emoji: "🎨",
    desc: "4 画面 (一覧 / 検索 / 詳細 / 編集) を Controller → JSP のペアで積む",
    items: [
      { n: 12, filename: "UserListController.java", path: "demo-web/src/main/java/com/example/demo/app/userlist/", layer: "Controller", desc: "GET /users で全件取得し一覧表示 (このトラックの入口 URL)", stepSlug: "06-list", stepNo: 6, stepTitle: "ユーザ一覧画面 (UserListController + list.jsp)" },
      { n: 13, filename: "list.jsp", path: "demo-web/src/main/webapp/WEB-INF/views/userlist/", layer: "View", desc: "一覧テーブル + 検索画面/詳細画面へのリンク (<c:url> + <c:param> で組み立て)", stepSlug: "06-list", stepNo: 6, stepTitle: "ユーザ一覧画面 (UserListController + list.jsp)" },
      { n: 14, filename: "UserSearchForm.java", path: "demo-web/src/main/java/com/example/demo/app/usersearch/", layer: "Form", desc: "検索画面の入力バインディング用 Form (Entity 直バインドしない、role のみ保持)", stepSlug: "07-search", stepNo: 7, stepTitle: "検索画面 (Form クラス + LIKE 検索)" },
      { n: 15, filename: "UserSearchController.java", path: "demo-web/src/main/java/com/example/demo/app/usersearch/", layer: "Controller", desc: "GET /users/search で role の部分一致 (LIKE) 検索", stepSlug: "07-search", stepNo: 7, stepTitle: "検索画面 (Form クラス + LIKE 検索)" },
      { n: 16, filename: "search.jsp", path: "demo-web/src/main/webapp/WEB-INF/views/usersearch/", layer: "View", desc: "検索フォーム (<form:form>) + 結果テーブル", stepSlug: "07-search", stepNo: 7, stepTitle: "検索画面 (Form クラス + LIKE 検索)" },
      { n: 17, filename: "UserDetailController.java (view メソッド)", path: "demo-web/src/main/java/com/example/demo/app/userdetail/", layer: "Controller", desc: "GET /users/detail?id= でユーザ 1 件を取得して詳細表示", stepSlug: "08-detail", stepNo: 8, stepTitle: "詳細画面 (UserDetailController + detail.jsp)" },
      { n: 18, filename: "detail.jsp", path: "demo-web/src/main/webapp/WEB-INF/views/userdetail/", layer: "View", desc: "ID / 名前 / 役職を表示。編集画面へのリンクと Flash メッセージ表示欄を持つ", stepSlug: "08-detail", stepNo: 8, stepTitle: "詳細画面 (UserDetailController + detail.jsp)" },
      { n: 19, filename: "UserEditForm.java", path: "demo-web/src/main/java/com/example/demo/app/userdetail/", layer: "Form", desc: "編集画面の入力バインディング用 Form (id は hidden で往復、role に @NotBlank)", stepSlug: "09-edit", stepNo: 9, stepTitle: "編集画面 & PRG パターン" },
      { n: 20, filename: "UserDetailController.java ← edit / update を追記", path: "demo-web/src/main/java/com/example/demo/app/userdetail/", layer: "Controller", desc: "GET /users/edit で編集画面表示、POST /users/edit で更新し PRG で redirect", stepSlug: "09-edit", stepNo: 9, stepTitle: "編集画面 & PRG パターン" },
      { n: 21, filename: "edit.jsp", path: "demo-web/src/main/webapp/WEB-INF/views/userdetail/", layer: "View", desc: "役職を書き換える編集フォーム (id は hidden。CSRF token は無い)", stepSlug: "09-edit", stepNo: 9, stepTitle: "編集画面 & PRG パターン" },
    ],
  },
  {
    name: "Phase D — 動作確認",
    emoji: "✅",
    desc: "4 画面を通しで動かして自己確認",
    items: [
      { n: 22, filename: "(新規ファイルなし)", path: "動作確認シナリオ 6 手順", layer: "Verify", desc: "一覧 → 検索 → 詳細 → 編集 → PRG の一気通貫動作を確認", stepSlug: "10-complete", stepNo: 10, stepTitle: "完成 & 通し動作確認" },
    ],
  },
];

const TOTAL_ITEMS = PHASES.reduce((sum, p) => sum + p.items.length, 0);
// /build-order (主軸/Boot版) と進捗が混ざらないよう、キーを別にする
const LS_KEY = "terasoluna-training-docs.build-progress-basic";

export function BuildOrderBasicClient() {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // localStorage から進捗をロード
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setDone(new Set(JSON.parse(raw) as number[]));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...done]));
    } catch {}
  }, [done, hydrated]);

  function toggle(n: number) {
    setDone((prev) => {
      const s = new Set(prev);
      if (s.has(n)) s.delete(n);
      else s.add(n);
      return s;
    });
  }

  function reset() {
    if (confirm("チェック状態をリセットしますか?")) setDone(new Set());
  }

  const completedCount = done.size;
  const pct = Math.round((completedCount / TOTAL_ITEMS) * 100);

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
      {/* Hero */}
      <div className="mb-6 md:mb-8">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          File-by-file Build Checklist (入門版)
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
          作成順チェックリスト (入門トラック)
        </h1>
        <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
          <strong>1 番から順に作れば一覧・検索・詳細・編集の 4 画面が動くところまで到達できる構成</strong>
          (動かなかった時は <Link href="/how-to" className="text-brand underline">レシピ集</Link> や
          各 Step の「よくあるハマり」節を参照)
          — 全 {TOTAL_ITEMS} 項目。<strong>時間の目安は載せていません</strong> — 自分のペースで、腑に落ちるまで読んでから次に進めてください。
          チェック状態はこのブラウザに保存されます。
        </p>
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-900">
          🌱 このチェックリストは<strong>入門トラック (/steps-basic/、Spring Security なし)</strong>のファイル配置に基づきます。
          Spring Security ありの主軸 / Boot 版で進めている方は{" "}
          <Link href="/build-order" className="text-brand underline">主軸 / Boot 版チェックリスト</Link> を使ってください。
        </div>
      </div>

      <PageMeta />

      {/* Progress bar */}
      <div className="mb-8 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-sm text-slate-600">進捗</div>
          <div className="text-sm">
            <span className="font-bold text-slate-900">{completedCount}</span>
            <span className="text-slate-500"> / {TOTAL_ITEMS}</span>
            <span className="ml-2 text-brand font-semibold">({pct}%)</span>
          </div>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {completedCount > 0 && (
          <button
            onClick={reset}
            className="mt-3 text-xs text-slate-500 hover:text-slate-900 underline"
          >
            進捗をリセット
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mb-8 flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 mr-1 self-center">凡例:</span>
        {(["Domain", "Repository", "Service", "Form", "Controller", "View"] as Layer[]).map((l) => (
          <span
            key={l}
            className={
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border " +
              LAYER_STYLE[l].color
            }
          >
            <span>{LAYER_STYLE[l].emoji}</span>
            <span>{LAYER_STYLE[l].jp}</span>
          </span>
        ))}
      </div>

      {/* Phase list */}
      {PHASES.map((phase) => {
        const phaseDone = phase.items.filter((i) => done.has(i.n)).length;
        return (
          <section key={phase.name} className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                <span className="mr-2">{phase.emoji}</span>
                {phase.name}
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {phaseDone} / {phase.items.length}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{phase.desc}</p>

            <ol className="space-y-2">
              {phase.items.map((item) => {
                const isDone = done.has(item.n);
                const style = LAYER_STYLE[item.layer];
                return (
                  <li key={item.n}>
                    <label
                      className={
                        "flex gap-3 md:gap-4 items-start p-3 md:p-4 rounded-xl border cursor-pointer transition-colors " +
                        (isDone
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white border-slate-200 hover:border-brand hover:shadow-sm")
                      }
                    >
                      {/* Number + checkbox */}
                      <div className="shrink-0 flex flex-col items-center gap-2">
                        <div
                          className={
                            "w-9 h-9 md:w-10 md:h-10 rounded-full font-bold flex items-center justify-center text-sm md:text-base " +
                            (isDone
                              ? "bg-brand text-white"
                              : "bg-slate-100 text-slate-700")
                          }
                        >
                          {isDone ? "✓" : item.n}
                        </div>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(item.n)}
                          className="w-4 h-4 accent-brand"
                          aria-label={`${item.n} 完了マーク`}
                        />
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span
                            className={
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border shrink-0 " +
                              style.color
                            }
                          >
                            <span>{style.emoji}</span>
                            <span>{style.jp}</span>
                          </span>
                          <span
                            className={
                              "font-bold text-sm md:text-base " +
                              (isDone ? "line-through text-slate-500" : "text-slate-900")
                            }
                          >
                            {item.filename}
                          </span>
                        </div>
                        <div className="mt-1 text-xs md:text-sm text-slate-500 font-mono truncate">
                          {item.path}
                        </div>
                        <div className="mt-1.5 text-sm text-slate-700 leading-snug">
                          {item.desc}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <Link
                            href={`/steps-basic/${item.stepSlug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-brand hover:underline font-semibold"
                          >
                            Step {String(item.stepNo).padStart(2, "0")} を開く →
                          </Link>
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {/* Bottom summary */}
      {completedCount === TOTAL_ITEMS && (
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <div aria-hidden="true" className="text-4xl mb-2">🎉</div>
          <div className="text-lg font-bold text-emerald-900">完成おめでとうございます!</div>
          <p className="mt-2 text-sm text-emerald-800">
            全 {TOTAL_ITEMS} 項目を組み終わりました。次は{" "}
            <Link href="/steps-basic/10-complete" className="underline font-semibold">
              Step 10 の自己確認 11 問
            </Link>
            で理解度チェック。
          </p>
        </div>
      )}

      <RelatedLinks items={[
        { href: "/steps-basic/00-modules-map", emoji: "🌱", label: "入門トラック Step 00 から読む", desc: "5 モジュールの地図 (Spring Security なし)" },
        { href: "/build-order", emoji: "✅", label: "主軸 / Boot 版チェックリスト", desc: "Spring Security ありで進めている場合はこちら" },
        { href: "/how-to", emoji: "🍳", label: "「〜するには?」レシピ集", desc: "詰まった時に開く。20 レシピで即答形式" },
        { href: "/preface", emoji: "📗", label: "まず最初に読む", desc: "全体像を掴んでから戻ってくると理解が早い" },
      ]} />

      <PageFooter pageTitle="作成順チェックリスト (入門版)" slug="build-order-basic" />
    </main>
  );
}
