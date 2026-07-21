import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "steps");

export type StepMeta = {
  slug: string;         // "01-project-skeleton"
  number: number;       // 1
  title: string;        // "プロジェクト骨組み"
};

export type Step = StepMeta & {
  content: string;      // raw markdown
};

/** 全ステップの一覧 (番号順) */
export function getAllSteps(): StepMeta[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const steps = files.map<StepMeta>((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    const numMatch = slug.match(/^(\d+)-/);
    return {
      slug,
      number: numMatch ? parseInt(numMatch[1], 10) : 0,
      title: (data.title as string) || slug,
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
  const numMatch = slug.match(/^(\d+)-/);
  return {
    slug,
    number: numMatch ? parseInt(numMatch[1], 10) : 0,
    title: (data.title as string) || slug,
    content,
  };
}
