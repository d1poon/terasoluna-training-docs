import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";
import { getAllSteps, formatStepNumber } from "@/lib/steps";
import { getAllBootSteps, getBootStep } from "@/lib/steps-boot";
import { renderMarkdown } from "@/lib/markdown";
import { TARGET_LABEL } from "@/lib/versions";

export async function generateStaticParams() {
  return getAllBootSteps().map((s) => ({ slug: s.slug }));
}

export default async function BootStepPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const step = getBootStep(slug);
  if (!step) notFound();

  const steps = getAllSteps(); // Sidebar は TERASOLUNA 側の Steps を表示
  const bootSteps = getAllBootSteps();
  const html = await renderMarkdown(step.content);

  const idx = bootSteps.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? bootSteps[idx - 1] : null;
  const next = idx < bootSteps.length - 1 ? bootSteps[idx + 1] : null;

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 rounded-r px-4 py-3 text-sm text-amber-900">
            <div className="font-semibold mb-1">補助: Spring Boot 単一プロジェクト版</div>
            <p className="leading-relaxed">
              このページは「先に Spring Boot で本質を掴んでから TERASOLUNA multi-project へ読み替える」ための<strong>補助教材</strong>です。
              研修環境で実際に使うのは <Link href="/steps/00-modules-map" className="underline">TERASOLUNA multi-project 版</Link> の方なので、
              こちらだけを読んで研修に臨まないでください。
            </p>
          </div>

          <div className="mb-6 md:mb-8">
            <div className="text-sm text-amber-600 font-mono">
              Step {formatStepNumber(step.number)} (Boot 版)
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1 text-slate-900 leading-tight">
              {step.title}
            </h1>
          </div>

          <PageMeta updated={step.date} targetVersion={TARGET_LABEL.boot} />

          <article
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <PageFooter
            pageTitle={`Boot Step ${formatStepNumber(step.number)} — ${step.title}`}
            slug={`steps-boot/${slug}`}
          />

          <nav className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
            {prev ? (
              <Link
                href={`/steps-boot/${prev.slug}`}
                className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors"
              >
                <div className="text-xs text-slate-500">← 前へ (Boot 版)</div>
                <div className="text-slate-900 font-semibold mt-1 text-sm md:text-base">
                  {formatStepNumber(prev.number)}. {prev.title}
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
                href={`/steps-boot/${next.slug}`}
                className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors md:text-right"
              >
                <div className="text-xs text-slate-500">次へ (Boot 版) →</div>
                <div className="text-slate-900 font-semibold mt-1 text-sm md:text-base">
                  {formatStepNumber(next.number)}. {next.title}
                </div>
              </Link>
            ) : (
              <Link
                href="/steps/00-modules-map"
                className="block p-4 bg-white rounded-lg border border-brand transition-colors md:text-right"
              >
                <div className="text-xs text-brand">TERASOLUNA 版へ進む →</div>
                <div className="text-slate-900 font-semibold mt-1">
                  Step 00. 5 モジュールの地図
                </div>
              </Link>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}
