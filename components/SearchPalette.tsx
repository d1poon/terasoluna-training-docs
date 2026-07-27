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
  { category: "まず読む", title: "まず最初に読む (Web アプリって何?)", href: "/preface", desc: "レストランメタファーで全体像 + 11 ステップフロー + 10 FAQ" },
  { category: "まず読む", title: "教科書 (ゼロから)", href: "/textbook", desc: "カラム・タグ・class から Java/DB/開発ツールまで 6 章" },
  { category: "まず読む", title: "用語集", href: "/glossary", desc: "40 用語 (Java / Spring / MyBatis / Web / Security)" },
  // リファレンス
  { category: "リファレンス", title: "作成順チェックリスト", href: "/build-order", desc: "全 22 ファイル通し番号 + localStorage 進捗" },
  { category: "リファレンス", title: "「〜するには?」レシピ集", href: "/how-to", desc: "20 レシピ (画面遷移 / リンク / Service 作成 / フォーム / DB / 認証 …)" },
  { category: "リファレンス", title: "DB 接続の仕組み", href: "/db-connection", desc: "jdbc.properties → -env.xml → -infra.xml、Connection Pool、エラー診断" },
  { category: "リファレンス", title: "セキュリティチェックリスト", href: "/security-checklist", desc: "ログイン失敗漏洩 / セッション固定 / CSRF / IDOR / XSS / SQLi / BCrypt など 10 項目" },
  { category: "リファレンス", title: "H2 → Oracle 落とし穴 10 選", href: "/oracle-diff", desc: "空文字 = NULL / SYSDATE / MERGE / 予約語 / ROWNUM など" },
  { category: "リファレンス", title: "メンター向けガイド", href: "/mentor", desc: "「答えを言わずに気付かせる」ためのステップ別ハマりどころ集" },
  { category: "リファレンス", title: "バージョン一覧", href: "/versions", desc: "Boot / archetype / JDK / Tomcat / MyBatis 等のバージョン集約" },
  // TERASOLUNA
  { category: "TERASOLUNA", title: "Boot vs TERASOLUNA", href: "/spring-vs-terasoluna", desc: "8 箇所のサイドバイサイド比較 + 12 概念の共通点" },
  { category: "TERASOLUNA", title: "マルチプロジェクト構造", href: "/terasoluna-multi-project", desc: "5 モジュール (-web / -domain / -env / -initdb / -selenium) の中身" },
  // 可視化
  { category: "可視化", title: "アーキテクチャ全体図", href: "/architecture", desc: "全 22 ファイルを 1 枚で。層バッジ・Step リンク付き" },
  { category: "可視化", title: "触ってみるデモ", href: "/playground", desc: "STS なしで login / search / edit を体験" },
  { category: "可視化", title: "Playground - ログイン", href: "/playground/login", desc: "ID + PW を入れて /menu 遷移まで模擬" },
  { category: "可視化", title: "Playground - 検索", href: "/playground/search", desc: "LIKE 検索をクライアント側で再現" },
  { category: "可視化", title: "Playground - 変更 (PRG)", href: "/playground/edit", desc: "URL バー切替アニメで PRG パターン可視化" },
  // Steps
  { category: "Steps", title: "Step 00 - 目次", href: "/steps/00-toc", desc: "12 ステップの目次" },
  { category: "Steps", title: "Step 01 - プロジェクト骨組み", href: "/steps/01-project-skeleton", desc: "pom.xml + application.properties" },
  { category: "Steps", title: "Step 02 - 空アプリ起動 & DB 準備", href: "/steps/02-empty-boot", desc: "RolemgrApplication + schema.sql" },
  { category: "Steps", title: "Step 02.5 - はじめての Controller + JSP (オプション)", href: "/steps/02.5-hello-controller", desc: "画面に自分の文字を出す最小の Controller + JSP。Step 03-06 の連続 BUILD SUCCESS 前の成功体験" },
  { category: "Steps", title: "Step 03 - User ドメイン", href: "/steps/03-user-domain", desc: "POJO + Java 基礎 (class/package/private/getter-setter)" },
  { category: "Steps", title: "Step 04 - Mapper (SQL 係)", href: "/steps/04-mapper", desc: "MyBatis interface + XML" },
  { category: "Steps", title: "Step 05 - Service", href: "/steps/05-service", desc: "@Service + @Transactional" },
  { category: "Steps", title: "Step 06 - 認証基盤", href: "/steps/06-auth-foundation", desc: "SecurityConfig + CustomUserDetailsService + DataInitializer" },
  { category: "Steps", title: "Step 07 - ログイン画面", href: "/steps/07-login", desc: "LoginController + login.jsp + JSP 入門" },
  { category: "Steps", title: "Step 08 - メニュー画面", href: "/steps/08-menu", desc: "MenuController + menu.jsp + 共通 header.jsp" },
  { category: "Steps", title: "Step 09 - 検索画面", href: "/steps/09-search", desc: "SearchController + LIKE 検索" },
  { category: "Steps", title: "Step 10 - ユーザ情報画面", href: "/steps/10-user-info", desc: "Principal からログイン ID を取る" },
  { category: "Steps", title: "Step 11 - 変更画面 (PRG パターン)", href: "/steps/11-edit", desc: "POST → redirect → GET のイディオム" },
  { category: "Steps", title: "Step 12 - 完成 & まとめ", href: "/steps/12-complete", desc: "5画面通し確認 + 自己確認 12 問" },
  { category: "Steps", title: "Step 12.5 - 楽観ロック (オプション)", href: "/steps/12.5-optimistic-lock", desc: "version カラム + WHERE version + 影響行数 0 → BusinessException" },
  { category: "Steps", title: "Step 13 - Service 単体テスト", href: "/steps/13-service-test", desc: "JUnit5 + Mockito + @ParameterizedTest" },
  { category: "Steps", title: "Step 14 - Mapper 統合テスト", href: "/steps/14-mapper-test", desc: "@MybatisTest で H2 に実 SQL" },
  { category: "Steps", title: "Step 15 - Controller テスト", href: "/steps/15-controller-test", desc: "MockMvc + @WebMvcTest" },
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
  const router = useRouter();

  // グローバルショートカット: ⌘K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      // 開いた直後に input にフォーカス
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
      setActiveIdx(0);
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
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <span className="text-slate-400">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDownInput}
                placeholder="ページ名・キーワードで検索…"
                className="flex-1 outline-none text-slate-900 placeholder:text-slate-400 text-sm md:text-base"
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
                <div className="p-6 text-center text-slate-500 text-sm">
                  該当なし
                </div>
              ) : (
                <ul className="py-2">
                  {results.map((r, i) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
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
