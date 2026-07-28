"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TERMS } from "@/lib/terms";

type Position = { top: number; left: number; placement: "below" | "above" };

/**
 * 用語をホバー/タップすると、その場でポップオーバーで意味が出る。
 * ページ遷移せずに参照できるので「読みながら理解」を維持できる。
 *
 * 使い方:
 *   <T term="controller" />                     ← 用語辞書の term を表示
 *   <T term="service">サービス</T>              ← 表示テキストを差し替え
 */
export function T({
  term,
  children,
}: {
  term: keyof typeof TERMS;
  children?: React.ReactNode;
}) {
  const info = TERMS[term];
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position>({ top: 0, left: 0, placement: "below" });
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 位置計算 (画面端に近ければ反対側に flip)
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const popW = 340;
    const popH = 200;
    const gap = 8;

    let placement: Position["placement"] = "below";
    let top = rect.bottom + gap;
    if (top + popH > window.innerHeight && rect.top > popH + gap) {
      placement = "above";
      top = rect.top - popH - gap;
    }

    // 左端は入力位置起点、画面はみ出したら押し戻す
    let left = rect.left;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
    if (left < 8) left = 8;

    // position: fixed 使用のため scrollY/X は加えない (ビューポート基準)
    setPos({ top, left, placement });
  }, [open]);

  // クリック外し / Esc / スクロール で閉じる
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        anchorRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      // fixed 位置がスクロールで term から離れるので閉じる
      setOpen(false);
    }
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [open]);

  if (!info) {
    // 用語辞書に無ければそのまま表示 (fail-safe)
    return <span className="text-rose-700">{children ?? term}</span>;
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => {
          // デスクトップは軽くホバーで開く
          if (window.matchMedia("(hover: hover)").matches) setOpen(true);
        }}
        onMouseLeave={() => {
          // ホバー環境: 少し遅延して閉じる (popover を触れるように)
          if (window.matchMedia("(hover: hover)").matches) {
            setTimeout(() => {
              if (!popoverRef.current?.matches(":hover")) setOpen(false);
            }, 200);
          }
        }}
        className="inline underline decoration-dotted decoration-slate-400 underline-offset-2 hover:text-brand hover:decoration-brand cursor-help bg-transparent p-0 text-inherit font-inherit"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {children ?? info.term}
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          className="fixed z-50 w-[min(340px,calc(100vw-16px))] bg-white border border-slate-300 rounded-xl shadow-2xl p-4 term-popover-enter"
          style={{ top: pos.top, left: pos.left }}
          onMouseLeave={() => {
            if (window.matchMedia("(hover: hover)").matches) setOpen(false);
          }}
        >
          {/* 矢印 */}
          <div
            className={
              "absolute w-3 h-3 bg-white border-slate-300 transform rotate-45 " +
              (pos.placement === "below"
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
              onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                className="inline-block text-xs text-brand hover:underline font-semibold"
              >
                → 詳しくはここ
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
