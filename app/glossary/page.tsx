import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { RelatedLinks } from "@/components/RelatedLinks";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";
import { GlossarySearch } from "./GlossarySearch";
import { TERMS } from "@/lib/glossary-terms";

export const metadata = { title: "用語集 | TERASOLUNA 研修" };

export default function GlossaryPage() {
  const steps = getAllSteps();
  const termCount = TERMS.length;

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              分からない単語を引くところ
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              用語集 <span className="text-slate-400 text-lg font-normal">({termCount} 語)</span>
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              このアプリを組む上で出てくる用語を、1 行の意味 + 詳しい説明で並べています。
              Step ページを読みながら「これ何?」と思ったらここで確認してください。
              上部の検索ボックスに単語を入れると絞り込めます。
            </p>
          </div>

          <PageMeta />

          <GlossarySearch />

          <RelatedLinks
            items={[
              {
                href: "/textbook",
                emoji: "📚",
                label: "教科書 (ゼロから)",
                desc: "カラム・タグ・class 等の基礎を章立てで",
              },
              {
                href: "/preface",
                emoji: "📗",
                label: "まず最初に読む",
                desc: "レストランメタファーで全体像を掴む",
              },
              {
                href: "/how-to",
                emoji: "🍳",
                label: "「〜するには?」レシピ集",
                desc: "画面遷移・Service 作成 等の実装レシピ",
              },
              {
                href: "/architecture",
                emoji: "🏛",
                label: "アーキテクチャ全体図",
                desc: "22 ファイルの層構造を 1 枚で",
              },
            ]}
          />

          <div className="mt-8 text-sm text-slate-600 text-center">
            分からない用語があっても、まずは Step ページで実際のコードと照らし合わせながら読むと理解が進みます
          </div>

          <PageFooter pageTitle="用語集" slug="glossary" />
        </main>
      </div>
    </div>
  );
}
