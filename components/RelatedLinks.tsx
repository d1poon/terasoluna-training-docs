import Link from "next/link";

export type RelatedItem = {
  href: string;
  emoji: string;
  label: string;
  desc: string;
};

/**
 * 各ページの下部に配置する「関連ページ」ブロック。
 * 「見返しやすさ」を高めるための横断リンク。
 */
export function RelatedLinks({
  title = "関連ページ",
  items,
}: {
  title?: string;
  items: RelatedItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-slate-900">
        <span aria-hidden="true">📎</span> {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-brand hover:shadow-sm transition-all"
          >
            <span className="text-2xl leading-none shrink-0">{it.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm md:text-base">
                {it.label}
              </div>
              <div className="text-xs md:text-sm text-slate-600 mt-1 leading-snug">
                {it.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** 用語集の該当セクションに飛ぶ小さいリンク (行内利用) */
export function T({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="underline decoration-dotted decoration-slate-400 underline-offset-2 hover:text-brand hover:decoration-brand"
    >
      {children}
    </Link>
  );
}
