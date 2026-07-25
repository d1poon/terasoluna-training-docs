"use client";
import { useEffect, useRef, useState } from "react";

/**
 * ページマウント後、main 内の <pre> にコピー ボタンを追加する。
 * client-only。既存の <pre> markup を書き換えずに横から機能追加。
 */
export function EnableCodeCopy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 少し待ってから (SSG レンダリング後の hydration 後に走らせる)
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const pres = document.querySelectorAll<HTMLPreElement>("main pre");
    const cleanup: (() => void)[] = [];

    pres.forEach((pre) => {
      if (pre.dataset.copyReady === "1") return;
      pre.dataset.copyReady = "1";
      pre.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "コピー";
      btn.setAttribute("aria-label", "コード をコピー");
      btn.className =
        "absolute top-2 right-2 text-[10px] md:text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 px-2 py-1 rounded opacity-0 transition-opacity";
      pre.appendChild(btn);

      const showBtn = () => (btn.style.opacity = "1");
      const hideBtn = () => (btn.style.opacity = "0");
      pre.addEventListener("mouseenter", showBtn);
      pre.addEventListener("mouseleave", hideBtn);
      // モバイルではタップで表示
      pre.addEventListener("touchstart", showBtn, { passive: true });

      const onClick = async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          const prev = btn.textContent;
          btn.textContent = "✓ コピー済";
          btn.classList.add("bg-emerald-600");
          setTimeout(() => {
            btn.textContent = prev;
            btn.classList.remove("bg-emerald-600");
          }, 1500);
        } catch {
          btn.textContent = "✗ 失敗";
          setTimeout(() => (btn.textContent = "コピー"), 1500);
        }
      };
      btn.addEventListener("click", onClick);

      cleanup.push(() => {
        pre.removeEventListener("mouseenter", showBtn);
        pre.removeEventListener("mouseleave", hideBtn);
        btn.removeEventListener("click", onClick);
        btn.remove();
        pre.dataset.copyReady = "";
      });
    });

    return () => cleanup.forEach((c) => c());
  }, [ready]);

  return null; // このコンポーネント自体は何も描画しない
}
