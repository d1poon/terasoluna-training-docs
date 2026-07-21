import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps, getStep } from "@/lib/steps";
import { renderMarkdown } from "@/lib/markdown";

export async function generateStaticParams() {
  return getAllSteps().map((s) => ({ slug: s.slug }));
}

export default async function StepPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const step = getStep(slug);
  if (!step) notFound();

  const steps = getAllSteps();
  const html = await renderMarkdown(step.content);

  const idx = steps.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? steps[idx - 1] : null;
  const next = idx < steps.length - 1 ? steps[idx + 1] : null;

  return (
    <div className="md:flex md:max-w-[80rem] md:mx-auto">
      <Sidebar steps={steps} currentSlug={slug} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-12 md:py-12">
          <div className="mb-6 md:mb-8">
            <div className="text-sm text-brand font-mono">
              Step {String(step.number).padStart(2, "0")}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1 text-slate-900 leading-tight">
              {step.title}
            </h1>
          </div>

          <article
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <nav className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
            {prev ? (
              <Link
                href={`/steps/${prev.slug}`}
                className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors"
              >
                <div className="text-xs text-slate-500">← 前へ</div>
                <div className="text-slate-900 font-semibold mt-1 text-sm md:text-base">
                  {String(prev.number).padStart(2, "0")}. {prev.title}
                </div>
              </Link>
            ) : (
              <Link
                href="/"
                className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors"
              >
                <div className="text-xs text-slate-500">← 目次へ</div>
                <div className="text-slate-900 font-semibold mt-1">Home</div>
              </Link>
            )}
            {next ? (
              <Link
                href={`/steps/${next.slug}`}
                className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors md:text-right"
              >
                <div className="text-xs text-slate-500">次へ →</div>
                <div className="text-slate-900 font-semibold mt-1 text-sm md:text-base">
                  {String(next.number).padStart(2, "0")}. {next.title}
                </div>
              </Link>
            ) : (
              <Link
                href="/"
                className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors md:text-right"
              >
                <div className="text-xs text-slate-500">完了 →</div>
                <div className="text-slate-900 font-semibold mt-1">目次に戻る</div>
              </Link>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}
