import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "steps");

export type StepMeta = {
  slug: string;         // "01-project-skeleton"
  number: number;       // 1
  title: string;        // "プロジェクト骨組み"
  date?: string;        // frontmatter date (最終更新に流用)
};

export type Step = StepMeta & {
  content: string;      // raw markdown
};

/** frontmatter の date は YAML パーサが Date にすることがあるので文字列に正規化 */
function normalizeDate(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/** slug 先頭の数字部分 (2 or 2.5) を抽出 */
function extractNumber(slug: string): number {
  const m = slug.match(/^(\d+(?:\.\d+)?)-/);
  return m ? parseFloat(m[1]) : 0;
}

/** 全ステップの一覧 (番号順) */
export function getAllSteps(): StepMeta[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const steps = files.map<StepMeta>((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    return {
      slug,
      number: extractNumber(slug),
      title: (data.title as string) || slug,
      date: normalizeDate(data.date),
    };
  });
  return steps.sort((a, b) => a.number - b.number);
}

/** 特定ステップを取得 */
export function getStep(slug: string): Step | null {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    number: extractNumber(slug),
    title: (data.title as string) || slug,
    date: normalizeDate(data.date),
    content,
  };
}

// formatStepNumber は client-safe な lib/step-format.ts に定義。
// クライアント側からは lib/step-format から import する。
export { formatStepNumber } from "./step-format";
