import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";
import { InPageToc } from "@/components/InPageToc";
import { RelatedLinks } from "@/components/RelatedLinks";
import { getAllSteps, formatStepNumber } from "@/lib/steps";
import { getAllBasicSteps, getBasicStep } from "@/lib/steps-basic";
import { renderMarkdown, extractDescription } from "@/lib/markdown";

export async function generateStaticParams() {
  return getAllBasicSteps().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const step = getBasicStep(slug);
  if (!step) return {};

  // 入門版であることを title に明示し、/steps/ (主軸) や /steps-boot/ (補助) 側と
  // 検索結果で区別できるようにする
  const title = `Step ${formatStepNumber(step.number)} — ${step.title} (入門版・Security なし)`;
  // 本文がほぼ主軸と同じため extractDescription() の抜粋も一致してしまう。
  // description にも入門版と分かる接頭辞を付け、重複コンテンツ扱いのリスクを下げる。
  const description = `入門版 (Spring Security なし): ${extractDescription(step.content)}`;

  return {
    title,
    description,
    alternates: { canonical: `/steps-basic/${slug}` },
  };
}

export default async function BasicStepPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const step = getBasicStep(slug);
  if (!step) notFound();

  const steps = getAllSteps(); // Sidebar は主軸 (TERASOLUNA) の Steps を表示
  const basicSteps = getAllBasicSteps();
  const html = await renderMarkdown(step.content);

  const idx = basicSteps.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? basicSteps[idx - 1] : null;
  const next = idx < basicSteps.length - 1 ? basicSteps[idx + 1] : null;

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} currentSlug={slug} currentTrack="basic" />

      <div className="flex-1 min-w-0">
        {/* xl+ では本文と右レール目次 (InPageToc) を横並びにする。
            xl 未満では InPageToc 側が display:none になるため、この行自体は
            何も変えない素の div として振る舞い、レイアウトは従来通り。 */}
        <div className="toc-row xl:flex xl:items-start xl:justify-center">
          <main
            id="main"
            className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12 xl:mx-0 xl:min-w-0"
          >
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r px-4 py-3 text-sm text-emerald-900">
              <div className="font-semibold mb-1">入門: Spring Security なし版</div>
              <p className="leading-relaxed">
                このページは、<strong>認証を後回しにして CRUD の流れだけを先に通す</strong>ための入門教材です。
                スタック自体は主軸と同じ TERASOLUNA multi-project ですが、Step 06 で Security を導入する前に
                一覧・検索・詳細・編集の一気通貫を体験できます。
                慣れたら <Link href="/steps/06-auth-foundation" className="underline">主軸 (Security あり) 版</Link> のセキュリティ導入から合流してください。
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <div className="text-sm text-emerald-600 font-mono">
                Step {formatStepNumber(step.number)} (入門版)
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mt-1 text-slate-900 leading-tight">
                {step.title}
              </h1>
            </div>

            <PageMeta updated={step.date} />

            <article
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <RelatedLinks
              title="関連ページ"
              items={[
                { href: "/steps/00-modules-map", emoji: "🗺", label: "主軸 (Security あり) 版へ", desc: "研修環境で実際に使う TERASOLUNA multi-project 版" },
                { href: "/preface", emoji: "📗", label: "まず最初に読む", desc: "レストランメタファーで全体像" },
                { href: "/security-checklist", emoji: "🔒", label: "セキュリティ チェックリスト", desc: "入門版を終えて Security に進む前後の確認事項" },
              ]}
            />

            <PageFooter
              pageTitle={`Basic Step ${formatStepNumber(step.number)} — ${step.title}`}
              slug={`steps-basic/${slug}`}
            />

            <nav className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
              {prev ? (
                <Link
                  href={`/steps-basic/${prev.slug}`}
                  className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors"
                >
                  <div className="text-xs text-slate-500">← 前へ (入門版)</div>
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
                  href={`/steps-basic/${next.slug}`}
                  className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-brand transition-colors md:text-right"
                >
                  <div className="text-xs text-slate-500">次へ (入門版) →</div>
                  <div className="text-slate-900 font-semibold mt-1 text-sm md:text-base">
                    {formatStepNumber(next.number)}. {next.title}
                  </div>
                </Link>
              ) : (
                <Link
                  href="/steps/06-auth-foundation"
                  className="block p-4 bg-white rounded-lg border border-brand transition-colors md:text-right"
                >
                  <div className="text-xs text-brand">主軸 (Security あり) 版へ進む →</div>
                  <div className="text-slate-900 font-semibold mt-1">
                    Step 06. 認証基盤 (Spring Security)
                  </div>
                </Link>
              )}
            </nav>
          </main>

          <InPageToc />
        </div>
      </div>
    </div>
  );
}
