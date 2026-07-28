import { unified } from "unified";
import type { Plugin } from "unified";
import type { Root } from "mdast";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

/**
 * remark プラグイン: mdast の先頭ノードが h1 見出しの場合、それを取り除く。
 *
 * content/steps, content/steps-boot の各 md は 1 行目が `# Step 07 — ...` の h1 で
 * 始まるが、ページ側 (app/steps/[slug]/page.tsx, app/steps-boot/[slug]/page.tsx) は
 * 既に `<h1>{step.title}</h1>` を描画しているため、本文をそのまま HTML 化すると
 * `.prose` 内に 2 つ目の h1 が出力されてしまう (SEO/アクセシビリティ上 NG)。
 * ここで AST 段階の先頭 h1 だけを除去して解決する (content 側の md ファイルには手を入れない)。
 *
 * 除去対象は「ルート直下の最初の子ノード」だけなので、unist-util-visit 等の
 * 全体走査は不要 — tree.children を直接見る素朴な実装で足りる。
 * h2/h3 以降の見出しやその他ノードの並び順には一切影響しない。
 */
const remarkRemoveLeadingH1: Plugin<[], Root> = () => {
  return (tree) => {
    const first = tree.children[0];
    if (first && first.type === "heading" && first.depth === 1) {
      tree.children.shift();
    }
  };
};

/** Markdown → HTML (Shiki 相当のシンタックスハイライトを highlight.js で付与) */
export async function renderMarkdown(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRemoveLeadingH1)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(result);
}

/**
 * Markdown 本文 (frontmatter 除去済み) から、meta description 用のプレーンテキストを抽出する。
 *
 * steps / steps-boot の frontmatter には description フィールドが無いため、
 * 本文冒頭 (先頭 h1 見出しを除く) から見出し・コードブロック・装飾記法を取り除いた
 * プレーンテキストを組み立て、およそ 100〜120 字に切り詰める。
 * frontmatter に description が追加された場合は、呼び出し側 (generateMetadata) で
 * そちらを優先し、この関数は fallback としてのみ使う想定。
 */
export function extractDescription(markdown: string, maxLength = 120): string {
  const lines = markdown.split("\n");
  const plainLines: string[] = [];
  let inCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (line.length === 0) continue;
    if (line.startsWith("#")) continue; // 見出し行 (h1〜h6) は概要文に使わない
    if (line.startsWith(">")) continue; // 引用/補足注記はスキップ
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) continue; // 区切り線 (thematic break)

    const listMatch = line.match(/^(?:[-*+]|\d+\.)\s+(.*)$/);
    plainLines.push(listMatch ? listMatch[1] : line);
  }

  let text = plainLines.join(" ");

  text = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 画像
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2") // [[path|label]] → label
    .replace(/\[\[([^\]]*)\]\]/g, "$1") // [[label]] → label
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) → text
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1") // bold/italic/strikethrough
    .replace(/\s+/g, " ")
    .trim();

  const chars = Array.from(text);
  if (chars.length <= maxLength) return text;
  return chars.slice(0, maxLength).join("") + "…";
}
