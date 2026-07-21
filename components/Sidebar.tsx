import Link from "next/link";
import type { StepMeta } from "@/lib/steps";

export function Sidebar({
  steps,
  currentSlug,
}: {
  steps: StepMeta[];
  currentSlug?: string;
}) {
  return (
    <aside className="w-full md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto bg-white border-r border-slate-200">
      <div className="p-5 border-b border-slate-200">
        <Link href="/" className="block">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            TERASOLUNA 研修
          </div>
          <div className="text-base font-bold mt-1 text-slate-900 leading-tight">
            役職編集アプリ<br />組立ガイド
          </div>
        </Link>
      </div>

      <nav className="p-4">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 px-2">
          Overview
        </div>
        <ul className="mb-4 space-y-0.5">
          <li>
            <Link
              href="/architecture"
              className={
                "flex items-baseline gap-2 px-3 py-2 rounded-md text-sm transition-colors " +
                (currentSlug === "__architecture__"
                  ? "bg-brand text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100")
              }
            >
              <span className="text-base leading-none">🏛</span>
              <span className="leading-tight">アーキテクチャ全体図</span>
            </Link>
          </li>
          <li>
            <Link
              href="/playground"
              className={
                "flex items-baseline gap-2 px-3 py-2 rounded-md text-sm transition-colors " +
                (currentSlug === "__playground__"
                  ? "bg-brand text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100")
              }
            >
              <span className="text-base leading-none">🕹</span>
              <span className="leading-tight">触ってみるデモ</span>
            </Link>
          </li>
        </ul>

        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2 px-2">
          Steps
        </div>
        <ul className="space-y-0.5">
          {steps.map((step) => {
            const active = step.slug === currentSlug;
            return (
              <li key={step.slug}>
                <Link
                  href={`/steps/${step.slug}`}
                  className={
                    "flex items-baseline gap-2 px-3 py-2 rounded-md text-sm transition-colors " +
                    (active
                      ? "bg-brand text-white font-semibold"
                      : "text-slate-700 hover:bg-slate-100")
                  }
                >
                  <span
                    className={
                      "font-mono text-xs " +
                      (active ? "text-white/80" : "text-slate-400")
                    }
                  >
                    {String(step.number).padStart(2, "0")}
                  </span>
                  <span className="leading-tight">{step.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
        <p>Spring Boot 3.4 + JSP + MyBatis + H2</p>
        <p className="mt-1">研修用リファレンス</p>
      </div>
    </aside>
  );
}
