// TERASOLUNA multi-project 移行に伴い、旧 Boot 単一プロジェクト版のコンテンツを
// content/steps-boot/ に退避した。UI 上「補助: Boot 版」セクションに表示する。
//
// TERASOLUNA 版 (content/steps/) 用の lib/steps.ts と対にする形で、
// ここは content/steps-boot/ を読む server-only モジュール。
// クライアント側から呼ぶ場合は formatStepNumber (lib/step-format.ts) を利用する。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "steps-boot");

export type BootStepMeta = {
  slug: string;
  number: number;
  title: string;
  date?: string;
};

export type BootStep = BootStepMeta & {
  content: string;
};

function normalizeDate(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function extractNumber(slug: string): number {
  const m = slug.match(/^(\d+(?:\.\d+)?)-/);
  return m ? parseFloat(m[1]) : 0;
}

export function getAllBootSteps(): BootStepMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const steps = files.map<BootStepMeta>((file) => {
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

export function getBootStep(slug: string): BootStep | null {
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
