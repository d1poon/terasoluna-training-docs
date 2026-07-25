"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TERMS } from "@/lib/terms";

// 用語キー → 探す文字列パターン (英語版と日本語版の両方)。
// 配列の先頭から試して、最初にマッチした文字列を使う。
const ALIASES: Record<keyof typeof TERMS, string[]> = {
  // Java 基礎
  class: ["class"],
  object: ["オブジェクト", "インスタンス"],
  method: ["メソッド"],
  field: ["フィールド", "メンバ変数"],
  package: ["package", "パッケージ"],
  annotation: ["アノテーション"],
  private: ["private"],

  // Spring
  bean: ["Bean"],
  di: ["DI (Dependency Injection)", "Dependency Injection", "依存性注入", "DI"],

  // Spring MVC
  controller: ["Controller"],
  service: ["Service"],
  repository: ["Repository", "MyBatis Mapper"],
  model: ["Model"],
  view: ["View"],
  principal: ["Principal"],

  // MyBatis
  mapper: ["Mapper"],
  transactional: ["@Transactional"],

  // Web
  http: ["HTTP"],
  request: ["リクエスト"],
  response: ["レスポンス"],
  get: ["GET リクエスト", "GET"],
  post: ["POST リクエスト", "POST"],
  session: ["セッション"],

  // Security
  csrf: ["CSRF"],
  auth: ["認証"],
  bcrypt: ["BCrypt"],

  // JSP
  jsp: ["JSP"],
  el: ["EL 式"],
  jstl: ["JSTL"],

  // Pattern
  prg: ["PRG パターン", "PRG"],

  // DB
  table: ["テーブル"],
  column: ["カラム"],
  record: ["レコード"],
  pk: ["主キー", "Primary Key"],
};

const TERM_LINK_CLASS =
  "underline decoration-dotted decoration-slate-400 underline-offset-2 hover:text-brand hover:decoration-brand cursor-help";

/** 除外条件: これらの要素配下のテキストは触らない */
function isSkipped(el: Element | null): boolean {
  while (el) {
    const tag = el.tagName;
    if (
      tag === "CODE" ||
      tag === "PRE" ||
      tag === "A" ||
      tag === "BUTTON" ||
      tag === "H1" ||
      tag === "H2" ||
      tag === "H3" ||
      tag === "H4" ||
      tag === "H5" ||
      tag === "H6" ||
      tag === "SCRIPT" ||
      tag === "STYLE" ||
      el.hasAttribute("data-term") ||
      el.getAttribute("aria-haspopup") === "dialog"
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

function* walkTextNodes(root: Node): Generator<Text> {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      if (isSkipped(node.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) {
    yield node as Text;
  }
}

/** テキスト内で needle が単語境界にマッチするかチェック (英語のみ、日本語はスキップ) */
function isWordBoundary(text: string, idx: number, needleLen: number, needle: string): boolean {
  const isLatinStart = /^[A-Za-z@]/.test(needle);
  if (!isLatinStart) return true; // 日本語はそのまま OK
  const before = text[idx - 1];
  const after = text[idx + needleLen];
  if (before && /[A-Za-z0-9_]/.test(before)) return false;
  if (after && /[A-Za-z0-9_]/.test(after)) return false;
  return true;
}

/** テキストノード内の最初のマッチをラップする。成功したら true */
function wrapFirstMatch(
  textNode: Text,
  needle: string,
  termKey: string
): boolean {
  const text = textNode.textContent ?? "";
  const idx = text.indexOf(needle);
  if (idx === -1) return false;
  if (!isWordBoundary(text, idx, needle.length, needle)) return false;

  const parent = textNode.parentNode;
  if (!parent) return false;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + needle.length);
  const after = text.slice(idx + needle.length);

  if (before) parent.insertBefore(document.createTextNode(before), textNode);
  const span = document.createElement("span");
  span.setAttribute("data-term", termKey);
  span.className = TERM_LINK_CLASS;
  span.textContent = match;
  parent.insertBefore(span, textNode);
  if (after) parent.insertBefore(document.createTextNode(after), textNode);
  parent.removeChild(textNode);
  return true;
}

type PopoverState = {
  term: string;
  top: number;
  left: number;
  placement: "below" | "above";
};

export function TermActivator() {
  const [state, setState] = useState<PopoverState | null>(null);
  const [pathname, setPathname] = useState<string>("");

  // ページ遷移検知 (Next.js の router change 相当)
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // ページマウント後 (hydration 完了後) に DOM walker で用語をラップ
  useEffect(() => {
    // ページのハイドレーション完了を待つため少し遅延
    const timer = setTimeout(() => {
      const main = document.querySelector("main");
      if (!main) return;

      const wrapped = new Set<string>();
      const termKeys = Object.keys(ALIASES) as (keyof typeof TERMS)[];

      // 長い語 (「PRG パターン」等) を先にマッチしたいため長さ降順で
      termKeys.sort((a, b) => {
        const lenA = Math.max(...ALIASES[a].map((s) => s.length));
        const lenB = Math.max(...ALIASES[b].map((s) => s.length));
        return lenB - lenA;
      });

      for (const key of termKeys) {
        if (wrapped.has(key)) continue;
        for (const alias of ALIASES[key]) {
          let matched = false;
          for (const node of Array.from(walkTextNodes(main))) {
            if (wrapFirstMatch(node, alias, key)) {
              wrapped.add(key);
              matched = true;
              break;
            }
          }
          if (matched) break;
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  // グローバル クリック リスナー: data-term span をタップしたらポップオーバー
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;

      // T (aria-haspopup=dialog) は自前の handler があるので何もしない
      if (target.closest('button[aria-haspopup="dialog"]')) return;

      const termEl = target.closest("[data-term]") as HTMLElement | null;
      if (termEl) {
        e.preventDefault();
        e.stopPropagation();
        const term = termEl.dataset.term!;
        const rect = termEl.getBoundingClientRect();
        const popH = 240;
        const popW = 340;
        const gap = 8;

        let placement: "below" | "above" = "below";
        let top = rect.bottom + gap;
        if (top + popH > window.innerHeight && rect.top > popH + gap) {
          placement = "above";
          top = rect.top - popH - gap;
        }
        let left = rect.left;
        if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
        if (left < 8) left = 8;
        setState({ term, top, left, placement });
        return;
      }

      // 外側クリックで閉じる
      if (!target.closest("[data-term-popover]")) {
        setState(null);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // ホバーで開く (デスクトップのみ)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let hoverTimer: number | null = null;

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const termEl = target.closest("[data-term]") as HTMLElement | null;
      if (!termEl) return;
      if (hoverTimer) window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => {
        const term = termEl.dataset.term!;
        const rect = termEl.getBoundingClientRect();
        const popH = 240;
        const popW = 340;
        const gap = 8;
        let placement: "below" | "above" = "below";
        let top = rect.bottom + gap;
        if (top + popH > window.innerHeight && rect.top > popH + gap) {
          placement = "above";
          top = rect.top - popH - gap;
        }
        let left = rect.left;
        if (left + popW > window.innerWidth - 8)
          left = window.innerWidth - popW - 8;
        if (left < 8) left = 8;
        setState({ term, top, left, placement });
      }, 150);
    }

    function onOut(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-term]")) return;
      if (hoverTimer) window.clearTimeout(hoverTimer);
    }

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (hoverTimer) window.clearTimeout(hoverTimer);
    };
  }, []);

  // スクロール / Esc で閉じる
  useEffect(() => {
    if (!state) return;
    const onScroll = () => setState(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("keydown", onKey);
    };
  }, [state]);

  if (!state) return null;
  const info = TERMS[state.term];
  if (!info) return null;

  return (
    <div
      data-term-popover
      role="dialog"
      className="fixed z-50 w-[min(340px,calc(100vw-16px))] bg-white border border-slate-300 rounded-xl shadow-2xl p-4"
      style={{ top: state.top, left: state.left }}
    >
      <div
        className={
          "absolute w-3 h-3 bg-white border-slate-300 transform rotate-45 " +
          (state.placement === "below"
            ? "top-[-6px] border-t border-l"
            : "bottom-[-6px] border-b border-r")
        }
        style={{ left: 24 }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="font-bold text-slate-900 text-sm md:text-base">
          {info.term}
        </div>
        <button
          onClick={() => setState(null)}
          className="text-slate-400 hover:text-slate-700 text-xs"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>

      <div className="text-sm text-slate-800 mt-1 font-medium">
        {info.short}
      </div>

      <div className="text-xs md:text-sm text-slate-600 mt-2 pt-2 border-t border-slate-200 leading-relaxed">
        {info.detail}
      </div>

      {info.href && (
        <div className="mt-3">
          <Link
            href={info.href}
            onClick={() => setState(null)}
            className="inline-block text-xs text-brand hover:underline font-semibold"
          >
            → 詳しくはここ
          </Link>
        </div>
      )}
    </div>
  );
}
