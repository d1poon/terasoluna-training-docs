import type { MetadataRoute } from "next";
import { getAllSteps } from "@/lib/steps";
import { getAllBootSteps } from "@/lib/steps-boot";
import { VERSIONS } from "@/lib/versions";

const SITE_URL = "https://terasoluna-training-docs.vercel.app";

// /mentor はユーザ判断で非表示化済み (app/mentor/page.tsx の HIDDEN フラグにより
// URL 直叩きでも 404 を返す)。検索エンジンにも「存在しないページ」として扱わせたいので
// sitemap から意図的に除外する (robots.ts 側でも disallow している)。
const STATIC_ROUTES = [
  "",
  "/architecture",
  "/build-order",
  "/db-connection",
  "/glossary",
  "/how-to",
  "/oracle-diff",
  "/playground",
  "/playground/login",
  "/playground/search",
  "/playground/edit",
  "/preface",
  "/security-checklist",
  "/spring-vs-terasoluna",
  "/terasoluna-multi-project",
  "/textbook",
  "/troubleshoot",
  "/versions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  // 各ページ個別の更新日を持たない静的ページは、サイト全体の最終更新日 (lib/versions.ts) で代用する
  const siteLastModified = new Date(VERSIONS.lastUpdated);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: siteLastModified,
  }));

  const stepEntries: MetadataRoute.Sitemap = getAllSteps().map((step) => ({
    url: `${SITE_URL}/steps/${step.slug}`,
    lastModified: step.date ? new Date(step.date) : siteLastModified,
  }));

  const bootStepEntries: MetadataRoute.Sitemap = getAllBootSteps().map((step) => ({
    url: `${SITE_URL}/steps-boot/${step.slug}`,
    lastModified: step.date ? new Date(step.date) : siteLastModified,
  }));

  return [...staticEntries, ...stepEntries, ...bootStepEntries];
}
