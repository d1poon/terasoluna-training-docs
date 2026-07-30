#!/usr/bin/env node
// content/steps-basic/*.md ⇔ lib/basic-steps-list.ts (BASIC_STEPS) と
// content/steps-boot/*.md  ⇔ lib/boot-steps-list.ts  (BOOT_STEPS) の二重管理を突合する。
//
// lib/*-steps-list.ts は client component (Sidebar / SearchPalette) から使うため
// node:fs を持てず、content/*.md の frontmatter と手動同期する必要がある。
// 過去に 15 件中 11 件の title ドリフトが発生した実績があるため、
// build 前段で機械チェックし、ズレたままデプロイされることを防ぐ。
//
// 新規依存を増やさないため、.ts ファイルは正規表現で
// `slug: "..."` / `title: "..."` を拾う簡易パースのみ行う。

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** frontmatter (--- ... ---) から title を抜き出す */
function extractFrontmatterTitle(mdText) {
  const fmMatch = mdText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return null;
  const titleMatch = fmMatch[1].match(/^title:\s*"([^"]*)"\s*$/m);
  return titleMatch ? titleMatch[1] : null;
}

/** content/steps-basic または content/steps-boot 配下の .md から { slug, title } の一覧を作る */
function readContentEntries(contentDir) {
  const files = readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  return files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const text = readFileSync(path.join(contentDir, filename), "utf8");
    const title = extractFrontmatterTitle(text);
    return { slug, title };
  });
}

/**
 * lib/*-steps-list.ts の配列リテラルを行単位の正規表現で拾う。
 * 各エントリは `{ slug: "...", ..., title: "...", ... },` の形で 1 行に収まっている前提。
 */
function readListEntries(listFilePath, arrayVarName) {
  const text = readFileSync(listFilePath, "utf8");
  const arrayMatch = text.match(
    new RegExp(`${arrayVarName}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`)
  );
  if (!arrayMatch) {
    throw new Error(`${listFilePath}: ${arrayVarName} の配列リテラルが見つかりません`);
  }
  const body = arrayMatch[1];
  const lines = body.split("\n").filter((l) => l.includes("slug:"));
  return lines.map((line) => {
    const slugMatch = line.match(/slug:\s*"([^"]*)"/);
    const titleMatch = line.match(/title:\s*"([^"]*)"/);
    return {
      slug: slugMatch ? slugMatch[1] : null,
      title: titleMatch ? titleMatch[1] : null,
    };
  });
}

/** 1 トラック分 (content vs list) を突合し、問題点の文字列配列を返す (空配列 = OK) */
function checkTrack(trackName, contentDir, listFilePath, arrayVarName) {
  const problems = [];
  const contentEntries = readContentEntries(contentDir);
  const listEntries = readListEntries(listFilePath, arrayVarName);

  const contentBySlug = new Map(contentEntries.map((e) => [e.slug, e]));
  const listBySlug = new Map(listEntries.map((e) => [e.slug, e]));

  // content にあって list に無い (list 側の欠落)
  for (const slug of contentBySlug.keys()) {
    if (!listBySlug.has(slug)) {
      problems.push(`  [missing in list] ${slug} が ${arrayVarName} に無い (content には存在)`);
    }
  }

  // list にあって content が無い (削除漏れ / typo)
  for (const slug of listBySlug.keys()) {
    if (!contentBySlug.has(slug)) {
      problems.push(`  [missing content] ${slug} が ${arrayVarName} にあるが content/${trackName}/ に対応する .md が無い`);
    }
  }

  // 両方にある slug の title 不一致
  for (const [slug, contentEntry] of contentBySlug) {
    const listEntry = listBySlug.get(slug);
    if (!listEntry) continue;
    if (contentEntry.title === null) {
      problems.push(`  [no frontmatter title] ${slug} の frontmatter に title が無い`);
      continue;
    }
    if (listEntry.title !== contentEntry.title) {
      problems.push(
        `  [title mismatch] ${slug}\n` +
          `    content : "${contentEntry.title}"\n` +
          `    ${arrayVarName.padEnd(12)}: "${listEntry.title}"`
      );
    }
  }

  return problems;
}

function main() {
  const tracks = [
    {
      name: "steps-basic",
      contentDir: path.join(ROOT, "content", "steps-basic"),
      listFilePath: path.join(ROOT, "lib", "basic-steps-list.ts"),
      arrayVarName: "BASIC_STEPS",
    },
    {
      name: "steps-boot",
      contentDir: path.join(ROOT, "content", "steps-boot"),
      listFilePath: path.join(ROOT, "lib", "boot-steps-list.ts"),
      arrayVarName: "BOOT_STEPS",
    },
  ];

  let hasProblems = false;

  for (const track of tracks) {
    const problems = checkTrack(
      track.name,
      track.contentDir,
      track.listFilePath,
      track.arrayVarName
    );
    if (problems.length > 0) {
      hasProblems = true;
      console.error(`\n✗ ${track.name}: ${problems.length} 件の不一致`);
      for (const p of problems) console.error(p);
    } else {
      console.log(`✓ ${track.name}: content/ と ${track.arrayVarName} は一致`);
    }
  }

  if (hasProblems) {
    console.error(
      "\ncontent/*.md と lib/*-steps-list.ts がズレています。上記を修正してください。"
    );
    process.exit(1);
  }

  console.log("\ncheck:steps OK — ドリフトなし");
}

main();
