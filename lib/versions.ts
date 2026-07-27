// サイト全体で参照するバージョン情報の集約点。
// 各ページから直接バージョン数値を書かず、必ずここを参照する。
// 更新: バージョンが変わったらここ 1 箇所だけ触れば全ページに反映される。
//
// TERASOLUNA 5.11.0.RELEASE (2025/2026 現在の最新安定版) の実際の pom.xml から取得した値。
// 出典: https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank/tree/5.11.0.RELEASE

export const VERSIONS = {
  // TERASOLUNA multi-project 本教材の"正"となる構成
  terasolunaGfw: "5.11.0.RELEASE",
  terasolunaBlankArchetype:
    "terasoluna-gfw-multi-web-blank-jsp-mybatis3-archetype (5.11.0.RELEASE)",
  terasolunaGroupId: "org.terasoluna.gfw",
  terasolunaParentBom: "5.11.0.RELEASE (terasoluna-gfw-parent)",
  terasolunaDependenciesBom: "3.0.0.RELEASE (terasoluna-dependencies)",

  // 依存 BOM から transitively 管理される Spring 系
  // terasoluna-dependencies 3.0.0.RELEASE が spring-boot-dependencies 4.0.2 を import しているため
  springBoot: "4.0.2 (managed via terasoluna-dependencies BOM)",
  springFramework: "7.x (Spring Boot 4.0.2 経由で管理)",
  springSecurity: "7.x (Spring Boot 4.0.2 経由で管理)",

  // Web / JSP / Validation
  jakartaServletJspApi: "4.0.0",
  jakartaElApi: "6.0.1",
  jakartaJstl: "3.0 (Jakarta EE 準拠、glassfish 実装同梱)",
  hibernateValidator: "9.1.0.Final",

  // MyBatis
  mybatis: "3.5.19",
  mybatisSpring: "4.0.0",

  // ランタイム / ビルド
  jdk: "17 (公式指定、24 でも動作)",
  maven: "3.9.9 (プロジェクト同梱、外部インストール不要)",
  mavenCompilerPlugin: "3.14.1",
  tomcatDeployTarget: "11.0.15 (Cargo プラグイン想定)",

  // DB (dev/prod ターゲット)
  h2: "2.x (dev in-memory)",
  postgresqlDriver: "42.7.9 (公式サンプルから)",
  oracleJdbc: "23.26.0.0.0 (ojdbc17)",

  // オプション: MapStruct / Lombok (使いたい場合)
  mapstruct: "1.6.3",
  lombok: "1.18.42",

  // === 補助: Boot 単一プロジェクト版 (先に本質を理解したい人向けに残す) ===
  bootMainVersion: "3.4.x",
  bootMainSpringSecurity: "6.x",
  bootMainMybatisStarter: "3.0.4 (mybatis-spring-boot-starter)",

  // docs-site 自体
  siteVersion: "0.12.x",
  siteStack: "Next.js 16 + React 19 + Tailwind CSS 3",

  // 最終更新
  lastUpdated: "2026-07-28",
} as const;

// カテゴリ別の表示グルーピング (VersionsPage / VersionsSummary で使う)
export const VERSION_GROUPS: {
  key: string;
  title: string;
  desc: string;
  rows: { label: string; value: string; note?: string }[];
}[] = [
  {
    key: "terasoluna",
    title: "TERASOLUNA multi-project (本教材の主軸)",
    desc: "5.11.0.RELEASE 系 (2025-2026 時点の最新安定版)。",
    rows: [
      { label: "TERASOLUNA GFW", value: VERSIONS.terasolunaGfw },
      { label: "archetype", value: VERSIONS.terasolunaBlankArchetype },
      { label: "groupId", value: VERSIONS.terasolunaGroupId },
      { label: "parent BOM", value: VERSIONS.terasolunaParentBom },
      { label: "dependencies BOM", value: VERSIONS.terasolunaDependenciesBom },
      { label: "JDK 要件", value: VERSIONS.jdk },
      {
        label: "Maven Compiler Plugin",
        value: VERSIONS.mavenCompilerPlugin,
        note: "TERASOLUNA parent pom が管理",
      },
    ],
  },
  {
    key: "spring-managed",
    title: "Spring 系 (BOM 経由で管理)",
    desc:
      "terasoluna-dependencies 3.0.0.RELEASE が spring-boot-dependencies 4.0.2 を import しているため、Spring Framework / Spring Security の実バージョンはそこから決まる。",
    rows: [
      { label: "Spring Boot BOM", value: VERSIONS.springBoot },
      { label: "Spring Framework", value: VERSIONS.springFramework },
      { label: "Spring Security", value: VERSIONS.springSecurity },
    ],
  },
  {
    key: "web-view",
    title: "Web / View / Validation",
    desc: "JSP + JSTL + Bean Validation (Jakarta EE 系)。",
    rows: [
      { label: "Jakarta Servlet JSP API", value: VERSIONS.jakartaServletJspApi },
      { label: "Jakarta EL API", value: VERSIONS.jakartaElApi },
      { label: "Jakarta JSTL", value: VERSIONS.jakartaJstl },
      { label: "Hibernate Validator", value: VERSIONS.hibernateValidator },
    ],
  },
  {
    key: "persistence",
    title: "永続化 (MyBatis + DB)",
    desc: "MyBatis 3 と、公式サンプルにコメントアウトで示される DB ドライバ。",
    rows: [
      { label: "MyBatis", value: VERSIONS.mybatis },
      { label: "mybatis-spring", value: VERSIONS.mybatisSpring },
      { label: "H2 (dev)", value: VERSIONS.h2 },
      { label: "PostgreSQL Driver", value: VERSIONS.postgresqlDriver },
      { label: "Oracle JDBC (ojdbc17)", value: VERSIONS.oracleJdbc },
    ],
  },
  {
    key: "runtime",
    title: "ランタイム / ツール",
    desc: "実行環境 と ビルドツール。",
    rows: [
      { label: "JDK", value: VERSIONS.jdk },
      { label: "Maven", value: VERSIONS.maven },
      { label: "Tomcat (Cargo)", value: VERSIONS.tomcatDeployTarget },
      {
        label: "MapStruct",
        value: VERSIONS.mapstruct,
        note: "オプション、TERASOLUNA parent が pluginManagement",
      },
      { label: "Lombok", value: VERSIONS.lombok, note: "オプション" },
    ],
  },
  {
    key: "boot-supplementary",
    title: "補助: Boot 単一プロジェクト版 (`/steps-boot/`)",
    desc:
      "本教材の主軸は TERASOLUNA multi-project だが、先に Spring Boot で本質を理解したい人向けに残した補助版。",
    rows: [
      { label: "Spring Boot", value: VERSIONS.bootMainVersion },
      { label: "Spring Security", value: VERSIONS.bootMainSpringSecurity },
      { label: "mybatis-spring-boot-starter", value: VERSIONS.bootMainMybatisStarter },
      { label: "JDK", value: "17 (24 でも動作)" },
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

// 公式 TERASOLUNA リポジトリ情報 (Step 内でユーザに参照リンクを提示する用)
export const TERASOLUNA_OFFICIAL = {
  archetypeRepoUrl:
    "https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank",
  archetypeTagUrl:
    "https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank/tree/5.11.0.RELEASE",
  guidelineUrl: "https://terasolunaorg.github.io/guideline/current/ja/",
  parentBomRepoUrl:
    "https://github.com/terasolunaorg/terasoluna-gfw/tree/5.11.0.RELEASE/terasoluna-gfw-parent",
  dependenciesBomRepoUrl:
    "https://github.com/terasolunaorg/terasoluna-dependencies/tree/3.0.0.RELEASE",
} as const;
