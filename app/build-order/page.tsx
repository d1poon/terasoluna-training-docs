"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

// このページはビルド時 (SSG) にはステップメタを埋め込まないので、
// サイドバー用のダミー steps を作る (実行時に何も参照しないため)
const DUMMY_STEPS = [
  { slug: "00-toc", number: 0, title: "目次" },
  { slug: "01-project-skeleton", number: 1, title: "プロジェクト骨組み" },
  { slug: "02-empty-boot", number: 2, title: "空アプリ起動 & DB 準備" },
  { slug: "03-user-domain", number: 3, title: "User ドメイン" },
  { slug: "04-mapper", number: 4, title: "Mapper (SQL 係)" },
  { slug: "05-service", number: 5, title: "Service (業務ロジック係)" },
  { slug: "06-auth-foundation", number: 6, title: "認証基盤" },
  { slug: "07-login", number: 7, title: "ログイン画面" },
  { slug: "08-menu", number: 8, title: "メニュー画面" },
  { slug: "09-search", number: 9, title: "検索画面" },
  { slug: "10-user-info", number: 10, title: "ユーザ情報画面" },
  { slug: "11-edit", number: 11, title: "変更画面 & PRG パターン" },
  { slug: "12-complete", number: 12, title: "完成 & まとめ" },
];

type Layer =
  | "Build"
  | "AppConfig"
  | "Entry"
  | "DDL"
  | "Domain"
  | "Repository"
  | "SQL"
  | "Service"
  | "Security"
  | "Config"
  | "Controller"
  | "View";

const LAYER_STYLE: Record<Layer, { emoji: string; color: string; jp: string }> = {
  Build:      { emoji: "🔧", color: "bg-slate-100 text-slate-800 border-slate-200", jp: "ビルド" },
  AppConfig:  { emoji: "📄", color: "bg-slate-100 text-slate-800 border-slate-200", jp: "App 設定" },
  Entry:      { emoji: "🚀", color: "bg-slate-100 text-slate-800 border-slate-200", jp: "エントリ" },
  DDL:        { emoji: "🗄", color: "bg-slate-100 text-slate-800 border-slate-200", jp: "DDL" },
  Domain:     { emoji: "🧩", color: "bg-amber-100 text-amber-900 border-amber-200", jp: "Domain" },
  Repository: { emoji: "💾", color: "bg-cyan-100 text-cyan-900 border-cyan-200", jp: "Repository" },
  SQL:        { emoji: "💾", color: "bg-cyan-100 text-cyan-900 border-cyan-200", jp: "SQL" },
  Service:    { emoji: "⚙️", color: "bg-emerald-100 text-emerald-900 border-emerald-200", jp: "Service" },
  Security:   { emoji: "🔐", color: "bg-rose-100 text-rose-900 border-rose-200", jp: "Security" },
  Config:     { emoji: "⚙", color: "bg-purple-100 text-purple-900 border-purple-200", jp: "Config" },
  Controller: { emoji: "🎨", color: "bg-blue-100 text-blue-900 border-blue-200", jp: "Controller" },
  View:       { emoji: "🖼", color: "bg-indigo-100 text-indigo-900 border-indigo-200", jp: "View" },
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
  minutes: number;
};

type Phase = {
  name: string;
  emoji: string;
  desc: string;
  items: Item[];
};

const PHASES: Phase[] = [
  {
    name: "Phase A — 下ごしらえ",
    emoji: "🔧",
    desc: "プロジェクトを箱ごと立ち上げる",
    items: [
      { n: 1, filename: "pom.xml", path: "reference-app/", layer: "Build", desc: "Maven 設定・依存宣言", stepSlug: "01-project-skeleton", stepNo: 1, stepTitle: "プロジェクト骨組み", minutes: 10 },
      { n: 2, filename: "application.properties", path: "src/main/resources/", layer: "AppConfig", desc: "Spring Boot 設定 (ポート・DB・JSP パス・MyBatis)", stepSlug: "01-project-skeleton", stepNo: 1, stepTitle: "プロジェクト骨組み", minutes: 5 },
      { n: 3, filename: "RolemgrApplication.java", path: "src/main/java/com/example/rolemgr/", layer: "Entry", desc: "@SpringBootApplication + main() 起動点", stepSlug: "02-empty-boot", stepNo: 2, stepTitle: "空アプリ起動 & DB 準備", minutes: 3 },
      { n: 4, filename: "schema.sql", path: "src/main/resources/", layer: "DDL", desc: "起動時に users テーブルを作る DDL", stepSlug: "02-empty-boot", stepNo: 2, stepTitle: "空アプリ起動 & DB 準備", minutes: 3 },
    ],
  },
  {
    name: "Phase B — 裏側 (Backend)",
    emoji: "⚙️",
    desc: "3層構造 (Domain → Repository → Service) を積み上げる",
    items: [
      { n: 5, filename: "User.java", path: "src/main/java/com/example/rolemgr/domain/", layer: "Domain", desc: "users テーブル1行を表す POJO (id / password / role)", stepSlug: "03-user-domain", stepNo: 3, stepTitle: "User ドメイン", minutes: 5 },
      { n: 6, filename: "UserMapper.java", path: "src/main/java/com/example/rolemgr/repository/", layer: "Repository", desc: "MyBatis Mapper インターフェース (findById / findByRole / updateRole)", stepSlug: "04-mapper", stepNo: 4, stepTitle: "Mapper (SQL 係)", minutes: 5 },
      { n: 7, filename: "UserMapper.xml", path: "src/main/resources/mapper/", layer: "SQL", desc: "SQL 本体。namespace = UserMapper インターフェースの完全修飾名", stepSlug: "04-mapper", stepNo: 4, stepTitle: "Mapper (SQL 係)", minutes: 10 },
      { n: 8, filename: "UserService.java", path: "src/main/java/com/example/rolemgr/service/", layer: "Service", desc: "業務ロジック層 + @Transactional 境界", stepSlug: "05-service", stepNo: 5, stepTitle: "Service (業務ロジック係)", minutes: 5 },
    ],
  },
  {
    name: "Phase C — 認証基盤",
    emoji: "🔐",
    desc: "Spring Security でログイン機能を組む土台",
    items: [
      { n: 9, filename: "CustomUserDetailsService.java", path: "src/main/java/com/example/rolemgr/security/", layer: "Security", desc: "Spring Security が DB からユーザを引くための係", stepSlug: "06-auth-foundation", stepNo: 6, stepTitle: "認証基盤", minutes: 5 },
      { n: 10, filename: "SecurityConfig.java", path: "src/main/java/com/example/rolemgr/config/", layer: "Config", desc: "URL 認可・ログインフォーム・BCrypt を宣言", stepSlug: "06-auth-foundation", stepNo: 6, stepTitle: "認証基盤", minutes: 10 },
      { n: 11, filename: "DataInitializer.java", path: "src/main/java/com/example/rolemgr/config/", layer: "Config", desc: "起動時に 5 ユーザを BCrypt ハッシュ付きで投入", stepSlug: "06-auth-foundation", stepNo: 6, stepTitle: "認証基盤", minutes: 5 },
    ],
  },
  {
    name: "Phase D — 画面 (Frontend)",
    emoji: "🎨",
    desc: "5画面を順番に。Controller → JSP のペアで積む",
    items: [
      { n: 12, filename: "LoginController.java", path: "src/main/java/com/example/rolemgr/controller/", layer: "Controller", desc: "GET /login のみ (POST は Spring Security が処理)", stepSlug: "07-login", stepNo: 7, stepTitle: "ログイン画面", minutes: 5 },
      { n: 13, filename: "login.jsp", path: "src/main/webapp/WEB-INF/views/", layer: "View", desc: "ID/PW フォーム。CSRF トークン hidden 必須", stepSlug: "07-login", stepNo: 7, stepTitle: "ログイン画面", minutes: 10 },
      { n: 14, filename: "MenuController.java", path: "src/main/java/com/example/rolemgr/controller/", layer: "Controller", desc: "Principal からログイン ID を取ってメニューへ", stepSlug: "08-menu", stepNo: 8, stepTitle: "メニュー画面", minutes: 3 },
      { n: 15, filename: "common/header.jsp", path: "src/main/webapp/WEB-INF/views/", layer: "View", desc: "全画面共通ヘッダ (○○さん + ログアウト + メニュー)", stepSlug: "08-menu", stepNo: 8, stepTitle: "メニュー画面", minutes: 5 },
      { n: 16, filename: "menu.jsp", path: "src/main/webapp/WEB-INF/views/", layer: "View", desc: "2つのリンク (検索 / 自分のユーザ情報)", stepSlug: "08-menu", stepNo: 8, stepTitle: "メニュー画面", minutes: 3 },
      { n: 17, filename: "SearchController.java", path: "src/main/java/com/example/rolemgr/controller/", layer: "Controller", desc: "GET /search?role=xxx、Service を呼んで結果を Model へ", stepSlug: "09-search", stepNo: 9, stepTitle: "検索画面", minutes: 5 },
      { n: 18, filename: "search.jsp", path: "src/main/webapp/WEB-INF/views/", layer: "View", desc: "検索フォーム + 結果テーブル (<c:forEach>)", stepSlug: "09-search", stepNo: 9, stepTitle: "検索画面", minutes: 10 },
      { n: 19, filename: "UserInfoController.java", path: "src/main/java/com/example/rolemgr/controller/", layer: "Controller", desc: "GET /user-info (view メソッドのみ、まず表示だけ)", stepSlug: "10-user-info", stepNo: 10, stepTitle: "ユーザ情報画面", minutes: 3 },
      { n: 20, filename: "userInfo.jsp", path: "src/main/webapp/WEB-INF/views/", layer: "View", desc: "自分の ID/役職 + 「変更する」ボタン", stepSlug: "10-user-info", stepNo: 10, stepTitle: "ユーザ情報画面", minutes: 5 },
      { n: 21, filename: "UserInfoController.java ← 追記", path: "src/main/java/com/example/rolemgr/controller/", layer: "Controller", desc: "editForm (GET) + edit (POST + redirect:) を追加", stepSlug: "11-edit", stepNo: 11, stepTitle: "変更画面 & PRG パターン", minutes: 5 },
      { n: 22, filename: "userInfoEdit.jsp", path: "src/main/webapp/WEB-INF/views/", layer: "View", desc: "役職を書き換える form + CSRF hidden", stepSlug: "11-edit", stepNo: 11, stepTitle: "変更画面 & PRG パターン", minutes: 5 },
    ],
  },
  {
    name: "Phase E — 完成確認",
    emoji: "🎉",
    desc: "全画面を通しで動かして自己確認",
    items: [
      { n: 23, filename: "(新規ファイルなし)", path: "動作確認シナリオ 14 手順", layer: "Entry", desc: "ログイン → 検索 → ユーザ情報 → 変更 → PRG 動作を通しで確認", stepSlug: "12-complete", stepNo: 12, stepTitle: "完成 & まとめ", minutes: 15 },
    ],
  },
];

const TOTAL_ITEMS = PHASES.reduce((sum, p) => sum + p.items.length, 0);
const TOTAL_MINUTES = PHASES.reduce((s, p) => s + p.items.reduce((s2, i) => s2 + i.minutes, 0), 0);
const LS_KEY = "terasoluna-training-docs.build-progress";

export default function BuildOrderPage() {
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
    <div className="md:flex md:max-w-[80rem] md:mx-auto">
      <Sidebar steps={DUMMY_STEPS} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-12 md:py-12">
          {/* Hero */}
          <div className="mb-6 md:mb-8">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              File-by-file Build Checklist
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              作成順チェックリスト
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              <strong>1 番から順に作れば必ず動く</strong> — 全 {TOTAL_ITEMS} 項目、目安 {TOTAL_MINUTES} 分。
              チェック状態はこのブラウザに保存されます。
            </p>
          </div>

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
            {(["Domain", "Repository", "Service", "Security", "Config", "Controller", "View"] as Layer[]).map((l) => (
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
                                href={`/steps/${item.stepSlug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-brand hover:underline font-semibold"
                              >
                                Step {String(item.stepNo).padStart(2, "0")} を開く →
                              </Link>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">目安 {item.minutes} 分</span>
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
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-lg font-bold text-emerald-900">完成おめでとうございます!</div>
              <p className="mt-2 text-sm text-emerald-800">
                全 {TOTAL_ITEMS} 項目を組み終わりました。次は{" "}
                <Link href="/steps/12-complete" className="underline font-semibold">
                  Step 12 の自己確認 12 問
                </Link>
                で理解度チェック。
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
