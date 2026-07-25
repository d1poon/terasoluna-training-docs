"use client";
import { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/**
 * ページ内の <h2>/<h3> を自動で収集して、右レール (lg+) に sticky で表示する。
 * スクロールに応じて active 表示を切り替える。
 */
export function InPageToc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // 見出しを収集 + ID を生成
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(
      "main h2, main h3"
    );
    const list: Heading[] = [];
    nodes.forEach((n, idx) => {
      // ID 無ければ自動付与 (テキストベース、日本語も OK)
      if (!n.id) {
        const base = (n.textContent ?? "")
          .toLowerCase()
          .replace(/[^\w\p{L}\p{N}]+/gu, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 40) || `heading-${idx}`;
        n.id = `h-${base}-${idx}`;
      }
      list.push({
        id: n.id,
        text: n.textContent?.trim() ?? "",
        level: n.tagName === "H2" ? 2 : 3,
      });
    });
    setHeadings(list);
  }, []);

  // スクロール監視で active 見出しを判定
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // 画面内に入ってる中で 一番上のものを active に
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null; // 見出し少ないなら出さない

  return (
    <aside className="hidden xl:block w-56 shrink-0 pl-6">
      <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 px-1">
          このページの目次
        </div>
        <ul className="space-y-0.5 text-xs">
          {headings.map((h) => {
            const isActive = h.id === activeId;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={
                    "block py-1 border-l-2 transition-colors " +
                    (h.level === 3 ? "pl-5 " : "pl-3 ") +
                    (isActive
                      ? "border-brand text-brand font-semibold"
                      : "border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400")
                  }
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
