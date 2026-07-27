// サイト全体で参照するバージョン情報の集約点。
// 各ページから直接バージョン数値を書かず、必ずここを参照する。
// 更新: バージョンが変わったらここ 1 箇所だけ触れば全ページに反映される。

export const VERSIONS = {
  // rolemgr リファレンス実装 (Spring Boot 系)
  springBoot: "3.4.x",
  springSecurity: "6.x",
  jdk: "17 (24 でも動作確認済み)",
  maven: "3.9.9",
  tomcatEmbedded: "10 (Spring Boot 3.4 同梱)",
  h2: "2.x",
  postgres: "16 (production ターゲット)",
  jsp: "3.1 (Jakarta EE 10)",
  jstl: "3.0 (Jakarta EE 10)",
  mybatis: "3.5.x + mybatis-spring-boot-starter 3.x",

  // TERASOLUNA archetype (multi-project)
  terasolunaArchetype: "5.11.0.RELEASE",
  terasolunaArchetypeId: "terasoluna-gfw-multi-web-blank-jsp-mybatis3-archetype",
  terasolunaGroupId: "org.terasoluna.gfw.blank",
  terasolunaTomcat: "9.x (TERASOLUNA 5.7 系との親和性)",
  terasolunaJdk: "11 (LTS サポート範囲)",

  // docs-site 自体
  siteVersion: "0.10.x",
  siteStack: "Next.js 16 + React 19 + Tailwind CSS 3",

  // 最終更新
  lastUpdated: "2026-07-27",
} as const;

// カテゴリ別の表示グルーピング (VersionsPage / VersionsSummary で使う)
export const VERSION_GROUPS: {
  key: string;
  title: string;
  desc: string;
  rows: { label: string; value: string; note?: string }[];
}[] = [
  {
    key: "rolemgr",
    title: "rolemgr リファレンス実装 (本教材の実装)",
    desc: "Step 01-15 で組み立てる Spring Boot ベースのアプリ。",
    rows: [
      { label: "Spring Boot", value: VERSIONS.springBoot },
      { label: "Spring Security", value: VERSIONS.springSecurity },
      { label: "JDK", value: VERSIONS.jdk },
      { label: "Maven", value: VERSIONS.maven, note: "ラッパー同梱、外部インストール不要" },
      { label: "Tomcat (embedded)", value: VERSIONS.tomcatEmbedded },
      { label: "JSP / JSTL", value: `${VERSIONS.jsp} / ${VERSIONS.jstl}` },
      { label: "MyBatis", value: VERSIONS.mybatis },
      { label: "H2 (dev)", value: VERSIONS.h2 },
      { label: "PostgreSQL (prod ターゲット)", value: VERSIONS.postgres, note: "Step 10 で切替体験" },
    ],
  },
  {
    key: "terasoluna",
    title: "TERASOLUNA archetype (現場想定)",
    desc: "本教材で「読み替え表」として言及する archetype。",
    rows: [
      { label: "archetype", value: VERSIONS.terasolunaArchetype },
      { label: "archetypeArtifactId", value: VERSIONS.terasolunaArchetypeId },
      { label: "archetypeGroupId", value: VERSIONS.terasolunaGroupId },
      { label: "Tomcat", value: VERSIONS.terasolunaTomcat },
      { label: "JDK", value: VERSIONS.terasolunaJdk },
    ],
  },
  {
    key: "site",
    title: "このドキュメントサイト",
    desc: "GitHub Pages / Vercel 上で公開されている本サイト自体。",
    rows: [
      { label: "サイトバージョン", value: VERSIONS.siteVersion },
      { label: "技術スタック", value: VERSIONS.siteStack },
      { label: "最終更新", value: VERSIONS.lastUpdated },
    ],
  },
];

// リポジトリ情報 (GitHub Issue リンク等で使う)
export const REPO = {
  owner: "d1poon",
  name: "terasoluna-training-docs",
  url: "https://github.com/d1poon/terasoluna-training-docs",
  issuesUrl: "https://github.com/d1poon/terasoluna-training-docs/issues",
  newIssueUrl: "https://github.com/d1poon/terasoluna-training-docs/issues/new",
} as const;
