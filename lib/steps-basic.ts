// Step 06 で Spring Security を導入する主軸トラック (content/steps/) は
// 受講者にとって難易度が高いため、Security を一切使わない入門版を
// content/steps-basic/ に新設した。UI 上「入門: Spring Security なし版」
// セクションに表示する (Sidebar では主軸の直前に配置)。
//
// TERASOLUNA 版 (content/steps/) 用の lib/steps.ts と対にする形で、
// ここは content/steps-basic/ を読む server-only モジュール。
// クライアント側から呼ぶ場合は formatStepNumber (lib/step-format.ts) を利用する。
//
// 他エージェントが content/steps-basic/*.md を並行作成中のため、
// このモジュール実装時点ではディレクトリが存在しない可能性がある。
// lib/steps-boot.ts と同様に fs.existsSync で防御し、未作成でもビルドが落ちないようにする。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "steps-basic");

export type BasicStepMeta = {
  slug: string;
  number: number;
  title: string;
  date?: string;
};

export type BasicStep = BasicStepMeta & {
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

export function getAllBasicSteps(): BasicStepMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const steps = files.map<BasicStepMeta>((file) => {
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

export function getBasicStep(slug: string): BasicStep | null {
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
