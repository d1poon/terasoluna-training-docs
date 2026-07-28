import type { MetadataRoute } from "next";

const SITE_URL = "https://terasoluna-training-docs.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /mentor はユーザ判断で非表示化済み (app/mentor/page.tsx の HIDDEN フラグで 404)。
      // URL を知っている人が直叩きすることはあり得るので、クロールも明示的に禁止する。
      disallow: "/mentor",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
