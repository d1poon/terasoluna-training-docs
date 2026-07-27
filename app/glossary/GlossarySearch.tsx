"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TERMS, CATEGORIES, type GlossaryTerm } from "@/lib/glossary-terms";

/** カテゴリ ID (URL アンカー) を作る */
function catId(cat: string): string {
  return `cat-${cat.replace(/\s+/g, "-").toLowerCase()}`;
}

/** 用語を検索クエリでフィルタする */
function filterTerms(query: string, activeCategory: string | null): GlossaryTerm[] {
  const q = query.trim().toLowerCase();
  return TERMS.filter((t) => {
    if (activeCategory && t.category !== activeCategory) return false;
    if (!q) return true;
    return (
      t.term.toLowerCase().includes(q) ||
      t.short.toLowerCase().includes(q) ||
      t.detail.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });
}

export function GlossarySearch() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterTerms(query, activeCategory),
    [query, activeCategory]
  );

  // カテゴリ別グルーピング
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const arr = map.get(t.category) ?? [];
      arr.push(t);
      map.set(t.category, arr);
    }
    return map;
  }, [filtered]);

  const totalCount = TERMS.length;
  const hitCount = filtered.length;
  const isSearching = query.trim().length > 0 || activeCategory !== null;

  return (
    <>
      {/* Search box */}
      <div className="mb-4 sticky top-0 bg-slate-50/95 backdrop-blur-sm py-3 z-10 -mx-4 px-4 lg:mx-0 lg:px-0 lg:static lg:bg-transparent lg:py-0 lg:backdrop-blur-none">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="用語名・意味・カテゴリで検索… (例: Bean, セキュリティ, Maven)"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-sm md:text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 placeholder:text-slate-400"
            aria-label="用語集を検索"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-sm"
              aria-label="検索クリア"
            >
              ✕
            </button>
          )}
        </div>
        {isSearching && (
          <div className="mt-2 text-xs text-slate-500">
            {hitCount} / {totalCount} 件ヒット
            {activeCategory && (
              <span className="ml-2 inline-flex items-center gap-1 bg-brand/10 text-brand-dark px-2 py-0.5 rounded">
                {activeCategory}
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="text-brand-dark/70 hover:text-brand-dark"
                  aria-label="カテゴリフィルタ解除"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Category chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={
            "inline-block px-3 py-1 text-xs md:text-sm rounded-full transition-colors " +
            (activeCategory === null
              ? "bg-brand text-white border border-brand"
              : "bg-white border border-slate-200 text-slate-700 hover:border-brand hover:text-brand")
          }
        >
          全て
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={
              "inline-block px-3 py-1 text-xs md:text-sm rounded-full transition-colors " +
              (activeCategory === cat
                ? "bg-brand text-white border border-brand"
                : "bg-white border border-slate-200 text-slate-700 hover:border-brand hover:text-brand")
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {hitCount === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div aria-hidden="true" className="text-4xl mb-2">🔍</div>
          <div className="text-base">「{query}」に一致する用語がありません</div>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory(null);
            }}
            className="mt-3 text-sm text-brand hover:underline"
          >
            検索条件をリセット
          </button>
        </div>
      )}

      {/* Grouped terms */}
      {CATEGORIES.map((cat) => {
        const items = groupedByCategory.get(cat) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={cat} id={catId(cat)} className="mb-10 scroll-mt-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 flex items-baseline gap-2">
              {cat}
              <span className="text-xs font-normal text-slate-500">
                ({items.length})
              </span>
            </h2>
            <div className="space-y-3">
              {items.map((t, i) => (
                <details
                  key={`${cat}-${i}`}
                  className="bg-white rounded-xl border border-slate-200 open:shadow-sm"
                  // 検索中は自動的に開く (該当箇所が見えるように)
                  open={isSearching && query.trim().length > 0}
                >
                  <summary className="cursor-pointer p-4 hover:bg-slate-50 rounded-xl">
                    <div className="inline-flex flex-wrap items-baseline gap-x-3">
                      <span className="font-bold text-slate-900">{t.term}</span>
                      <span className="text-slate-600 text-sm">— {t.short}</span>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 text-sm md:text-base text-slate-700 leading-relaxed">
                    {t.detail}
                    {t.link && (
                      <div className="mt-2">
                        <Link
                          href={t.link.href}
                          className="text-brand hover:underline text-sm"
                        >
                          → {t.link.label}
                        </Link>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
