"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Entry = {
  title: string;
  href: string;
  desc: string;
  category: string;
};

// 全ページ + 主要セクションを検索対象に
const INDEX: Entry[] = [
  // まず読む
  { category: "まず読む", title: "はじめに (Web アプリって何?)", href: "/preface", desc: "レストランメタファーで全体像 + 11 ステップフロー + 10 FAQ" },
  { category: "まず読む", title: "教科書 (ゼロから)", href: "/textbook", desc: "カラム・タグ・class から Java/DB/開発ツールまで 6 章" },
  { category: "まず読む", title: "用語集", href: "/glossary", desc: "Java / Spring / MyBatis / TERASOLUNA / Web / Security 用語" },
  // リファレンス
  { category: "リファレンス", title: "トラブルシュート", href: "/troubleshoot", desc: "Invalid bound statement / PKIX / ポート競合 / 文字化け 10 項目" },
  { category: "リファレンス", title: "DB 接続の仕組み", href: "/db-connection", desc: "demo-infra.properties → demo-env.xml → demo-infra.xml、Connection Pool、エラー診断" },
  { category: "リファレンス", title: "セキュリティチェックリスト", href: "/security-checklist", desc: "ログイン失敗漏洩 / セッション固定 / CSRF / IDOR / XSS / SQLi / BCrypt など 10 項目" },
  { category: "リファレンス", title: "H2 → Oracle 落とし穴 10 選", href: "/oracle-diff", desc: "空文字 = NULL / SYSDATE / MERGE / 予約語 / ROWNUM など" },
  // /mentor は 2026-07-28 に非表示化 (コード保持、Sidebar/SearchPalette から除外、URL は 404)
  { category: "リファレンス", title: "バージョン一覧", href: "/versions", desc: "TERASOLUNA 5.11.0 / Spring Boot 4.0.2 / Framework 7.0.3 / JDK 17 / Tomcat 11 等" },
  // TERASOLUNA
  { category: "TERASOLUNA", title: "マルチプロジェクト構造", href: "/terasoluna-multi-project", desc: "5 モジュール (-web / -domain / -env / -initdb / -selenium) の中身" },
  { category: "TERASOLUNA", title: "Boot からの読み替え表 (補助)", href: "/spring-vs-terasoluna", desc: "Boot 補助版で本質を掴んだあとの TERASOLUNA 版への対応表" },
  // 可視化
  { category: "可視化 (Boot 補助側)", title: "作成順チェックリスト (Boot 版)", href: "/build-order", desc: "Boot 単一プロジェクトの全 22 ファイル通し番号 + localStorage 進捗" },
  { category: "可視化 (Boot 補助側)", title: "アーキテクチャ全体図 (Boot 版)", href: "/architecture", desc: "Boot 単一プロジェクトの層構造。TERASOLUNA 版は Step 00 を参照" },
  { category: "可視化 (Boot 補助側)", title: "「〜するには?」レシピ集 (Boot 版寄り)", href: "/how-to", desc: "20 レシピ、現状 Boot 版寄り、TERASOLUNA 版対応は追加予定" },
  { category: "可視化", title: "触ってみるデモ (Playground)", href: "/playground", desc: "STS なしで login / search / edit を体験" },
  { category: "可視化", title: "Playground - ログイン", href: "/playground/login", desc: "ID + PW を入れて /menu 遷移まで模擬" },
  { category: "可視化", title: "Playground - 検索", href: "/playground/search", desc: "LIKE 検索をクライアント側で再現" },
  { category: "可視化", title: "Playground - 変更 (PRG)", href: "/playground/edit", desc: "URL バー切替アニメで PRG パターン可視化" },
  // Steps (TERASOLUNA 主軸)
  { category: "Steps (TERASOLUNA)", title: "Step 00 - 5 モジュールの地図", href: "/steps/00-modules-map", desc: "demo-web / -domain / -env / -initdb / -selenium の役割と依存方向" },
  { category: "Steps (TERASOLUNA)", title: "Step 01 - プロジェクト骨組み (親 POM + 5 子モジュール)", href: "/steps/01-project-skeleton", desc: "mvn archetype:generate で 5.11.0.RELEASE の 5 モジュール生成" },
  { category: "Steps (TERASOLUNA)", title: "Step 02 - 空アプリ起動 (Tomcat 11)", href: "/steps/02-empty-boot", desc: "Cargo プラグイン + H2 で最小起動確認" },
  { category: "Steps (TERASOLUNA)", title: "Step 02.5 - はじめての Controller + JSP (オプション)", href: "/steps/02.5-hello-controller", desc: "app.hello に最小 Controller、Step 03-06 前の成功体験" },
  { category: "Steps (TERASOLUNA)", title: "Step 03 - User ドメイン (Entity)", href: "/steps/03-user-domain", desc: "domain.model パッケージに Entity を集約" },
  { category: "Steps (TERASOLUNA)", title: "Step 04 - Repository (UserRepository + XML)", href: "/steps/04-mapper", desc: "interface + XML を同一パッケージパスにミラー配置、mybatis:scan" },
  { category: "Steps (TERASOLUNA)", title: "Step 05 - Service (interface + Impl)", href: "/steps/05-service", desc: "@Service + @Transactional は Impl、@Inject を使う" },
  { category: "Steps (TERASOLUNA)", title: "Step 06 - 認証基盤 (spring-security.xml)", href: "/steps/06-auth-foundation", desc: "XML 設定 + UserDetailsService + BCrypt" },
  { category: "Steps (TERASOLUNA)", title: "Step 07 - ログイン画面", href: "/steps/07-login", desc: "app.login.LoginController + login.jsp + CSRF" },
  { category: "Steps (TERASOLUNA)", title: "Step 08 - メニュー画面", href: "/steps/08-menu", desc: "app.menu + <sec:authentication> タグ" },
  { category: "Steps (TERASOLUNA)", title: "Step 09 - 検索画面 (Form クラス + LIKE)", href: "/steps/09-search", desc: "UserSearchForm 別クラス、Bean Validation" },
  { category: "Steps (TERASOLUNA)", title: "Step 10 - ユーザ情報画面 (認証コンテキストから ID)", href: "/steps/10-user-info", desc: "IDOR 対策として Authentication.getName()" },
  { category: "Steps (TERASOLUNA)", title: "Step 11 - 変更画面 (PRG パターン)", href: "/steps/11-edit", desc: "UserInfoUpdateForm + @Valid + redirect:/user-info" },
  { category: "Steps (TERASOLUNA)", title: "Step 12 - 完成 & 通し動作確認", href: "/steps/12-complete", desc: "5画面通し確認 + 自己確認 12 問" },
  { category: "Steps (TERASOLUNA)", title: "Step 12.5 - 楽観ロック (オプション)", href: "/steps/12.5-optimistic-lock", desc: "version カラム + WHERE version + BusinessException" },
  { category: "Steps (TERASOLUNA)", title: "Step 13 - Service 単体テスト", href: "/steps/13-service-test", desc: "JUnit5 + Mockito、@InjectMocks で UserServiceImpl" },
  { category: "Steps (TERASOLUNA)", title: "Step 14 - Repository 統合テスト", href: "/steps/14-mapper-test", desc: "Spring TestContext + @Transactional で H2 に実 SQL" },
  { category: "Steps (TERASOLUNA)", title: "Step 15 - Controller テスト (MockMvc)", href: "/steps/15-controller-test", desc: "standaloneSetup で URL / Model / View 検証" },
  // Steps-boot (補助)
  { category: "補助 Boot 版", title: "Boot 版目次", href: "/steps-boot/00-toc", desc: "先に Spring Boot 単一プロジェクトで本質を掴みたい人向け" },
  { category: "補助 Boot 版", title: "Boot Step 01 - プロジェクト骨組み", href: "/steps-boot/01-project-skeleton", desc: "spring-boot-starter-parent、単一プロジェクト" },
  { category: "補助 Boot 版", title: "Boot Step 06 - 認証基盤 (Java Config)", href: "/steps-boot/06-auth-foundation", desc: "SecurityConfig.java + BCryptPasswordEncoder Bean" },
];

// 曖昧マッチ (小文字化 + 部分文字列)
function score(entry: Entry, query: string): number {
  const q = query.toLowerCase();
  const title = entry.title.toLowerCase();
  const desc = entry.desc.toLowerCase();
  const cat = entry.category.toLowerCase();
  if (title.includes(q)) return 100 + (title.startsWith(q) ? 50 : 0);
  if (cat.includes(q)) return 50;
  if (desc.includes(q)) return 30;
  return 0;
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  // モーダルを開く直前にフォーカスされていた要素。閉じたときにここへ戻す。
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  // フォーカストラップ: モーダル内の最初/最後のフォーカス可能要素で Tab / Shift+Tab を折り返す
  function trapFocus(e: KeyboardEvent) {
    const modal = modalRef.current;
    if (!modal) return;
    const focusables = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (active === first || !active || !modal.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !active || !modal.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // グローバルショートカット: ⌘K / Ctrl+K + 開いている間の Esc / Tab トラップ
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        trapFocus(e);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      // 開く直前のフォーカス位置を保持しておき、閉じたときに復帰する
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      // 開いた直後に input にフォーカス
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
      setActiveIdx(0);
      previouslyFocusedRef.current?.focus();
      previouslyFocusedRef.current = null;
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return INDEX.slice(0, 12);
    return INDEX.map((e) => ({ entry: e, s: score(e, query) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 20)
      .map((r) => r.entry);
  }, [query]);

  useEffect(() => {
    if (activeIdx >= results.length) setActiveIdx(Math.max(0, results.length - 1));
  }, [results, activeIdx]);

  function onKeyDownInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[activeIdx];
      if (hit) {
        setOpen(false);
        router.push(hit.href);
      }
    }
  }

  return (
    <>
      {/* Trigger button - shown in sidebar / header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
        aria-label="検索を開く"
      >
        <span className="text-slate-500">🔍</span>
        <span className="flex-1 text-left text-slate-500">検索…</span>
        <kbd className="hidden md:inline text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-slate-500">
          Ctrl K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 md:pt-24 px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="サイト内検索"
            className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <span aria-hidden="true" className="text-slate-400">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDownInput}
                placeholder="ページ名・キーワードで検索…"
                className="flex-1 outline-none text-slate-900 placeholder:text-slate-500 text-sm md:text-base"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-haspopup="listbox"
                aria-controls="search-results-listbox"
                aria-autocomplete="list"
                aria-activedescendant={
                  results[activeIdx] ? `search-option-${activeIdx}` : undefined
                }
              />
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700 px-2"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm" role="status">
                  該当なし
                </div>
              ) : (
                <ul id="search-results-listbox" role="listbox" aria-label="検索結果" className="py-2">
                  {results.map((r, i) => (
                    <li key={r.href} role="presentation">
                      <Link
                        href={r.href}
                        id={`search-option-${i}`}
                        role="option"
                        aria-selected={i === activeIdx}
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={
                          "block px-4 py-2.5 " +
                          (i === activeIdx
                            ? "bg-brand/10"
                            : "hover:bg-slate-50")
                        }
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                            {r.category}
                          </span>
                          <span className="font-semibold text-sm text-slate-900">
                            {r.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                          {r.desc}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-slate-200 px-4 py-2 flex items-center gap-3 text-[10px] text-slate-500 bg-slate-50">
              <span>
                <kbd className="bg-white border border-slate-300 rounded px-1 py-0.5 font-mono">
                  ↑ ↓
                </kbd>{" "}
                選択
              </span>
              <span>
                <kbd className="bg-white border border-slate-300 rounded px-1 py-0.5 font-mono">
                  Enter
                </kbd>{" "}
                開く
              </span>
              <span>
                <kbd className="bg-white border border-slate-300 rounded px-1 py-0.5 font-mono">
                  Esc
                </kbd>{" "}
                閉じる
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
