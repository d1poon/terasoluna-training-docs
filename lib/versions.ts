// サイト全体で参照するバージョン情報の集約点。
// 各ページから直接バージョン数値を書かず、必ずここを参照する。
// 更新: バージョンが変わったらここ 1 箇所だけ触れば全ページに反映される。
//
// TERASOLUNA 5.11.0.RELEASE (2025/2026 現在の最新安定版) の実際の pom.xml から取得した値。
// 出典: https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank/tree/5.11.0.RELEASE

export const VERSIONS = {
  // TERASOLUNA multi-project 本教材の"正"となる構成
  // 出典: https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank/tree/5.11.0.RELEASE
  terasolunaGfw: "5.11.0.RELEASE",
  // 2026-07-29 訂正: 従来 "jsp-mybatis3-archetype" (xmlconfig 無し) と記載していたが、
  // それは JavaConfig 版 (config/web/SpringMvcConfig.java 等を生成、XML は web.xml のみ)。
  // 本教材は applicationContext.xml / spring-security.xml / demo-domain.xml を編集する
  // XML 設定前提のため、正しくは xmlconfig が付く方。
  // 出典: https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank/blob/5.11.0.RELEASE/README.md
  //       (parts/XMLConfig*/ ツリーで確認)
  terasolunaBlankArchetype:
    "terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype (5.11.0.RELEASE)",
  // archetype の groupId (mvn archetype:generate 時の -DarchetypeGroupId)。
  // GFW 本体ライブラリの groupId (下の terasolunaGroupId = org.terasoluna.gfw) とは別物。
  // 出典: https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank/blob/5.11.0.RELEASE/README.md
  terasolunaArchetypeGroupId: "org.terasoluna.gfw.blank",
  // GFW 本体ライブラリ (terasoluna-gfw-parent / terasoluna-gfw-common 等) の groupId。
  // archetype 自体の groupId (terasolunaArchetypeGroupId) とは別物なので混同しないこと。
  // 出典: https://github.com/terasolunaorg/terasoluna-gfw/tree/5.11.0.RELEASE/terasoluna-gfw-parent
  terasolunaGroupId: "org.terasoluna.gfw",
  // 出典: https://github.com/terasolunaorg/terasoluna-gfw/tree/5.11.0.RELEASE/terasoluna-gfw-parent
  terasolunaParentBom: "5.11.0.RELEASE (terasoluna-gfw-parent)",
  // 出典: https://github.com/terasolunaorg/terasoluna-dependencies/tree/3.0.0.RELEASE
  terasolunaDependenciesBom: "3.0.0.RELEASE (terasoluna-dependencies)",

  // 依存 BOM から transitively 管理される Spring 系
  // terasoluna-dependencies 3.0.0.RELEASE が spring-boot-dependencies 4.0.2 を import。
  // 以下は spring-boot-dependencies 4.0.2 の pom から取得した確定値。
  springBoot: "4.0.2",
  springFramework: "7.0.3",
  springSecurity: "7.0.2",

  // Web / JSP / Validation
  // 出典: spring-boot-dependencies 4.0.2 経由で管理 (terasoluna-dependencies 3.0.0.RELEASE が import)
  jakartaServlet: "6.1.0",
  jakartaServletJspApi: "4.0.0",
  jakartaElApi: "6.0.1",
  // API (jakarta.servlet.jsp.jstl-api) と実装 (org.glassfish.web:jakarta.servlet.jsp.jstl) は
  // 別 artifact でバージョン番号も異なるため、まとめて "3.0" と書かず両方を明記する。
  jakartaJstl: "API 3.0.2 / 実装 (glassfish) 3.0.1 (Jakarta EE 準拠)",
  hibernateValidator: "9.1.0.Final",

  // MyBatis
  mybatis: "3.5.19",
  mybatisSpring: "4.0.0",

  // ランタイム / ビルド
  // 出典: https://github.com/terasolunaorg/terasoluna-gfw-web-multi-blank/blob/5.11.0.RELEASE/parts/XMLConfig-JSP/pom.xml の <java-version>
  // 2026-07-29 訂正: 「24 でも動作」は一次ソース未確認のため削除。archetype の指定値のみ記載。
  jdk: "17 (archetype の java-version 指定値)",
  maven: "3.9.9 (プロジェクト同梱、外部インストール不要)",
  mavenCompilerPlugin: "3.14.1",
  // 11.0.15 は terasoluna-gfw-parent pom.xml の <cargo.tomcat11.version> プロパティ由来
  // (archetype が想定する Tomcat のバージョンという位置付け)。本教材では Cargo プラグインは使わず、
  // STS4 の Servers ビューに登録した Tomcat (Run on Server) にデプロイする。
  // 出典: https://github.com/terasolunaorg/terasoluna-gfw/blob/5.11.0.RELEASE/terasoluna-gfw-parent/pom.xml (179-209行)
  tomcatDeployTarget: "11.0.15 (STS4 Servers ビューに登録した Tomcat v11.0 で Run on Server)",

  // DB (dev/prod ターゲット)
  h2: "2.x (dev in-memory)",
  postgresqlDriver: "42.7.9 (公式サンプルから)",
  oracleJdbc: "23.26.0.0.0 (ojdbc17)",

  // オプション: MapStruct / Lombok (使いたい場合)
  mapstruct: "1.6.3",
  lombok: "1.18.42",

  // === 補助: Boot 単一プロジェクト版 (先に本質を理解したい人向けに残す) ===
  // 注意: これは /steps-boot/ 配下の補助教材のみが対象。主軸 (/steps/) は上の
  // TERASOLUNA スタックを使う。両者を混同しないこと。
  bootMainVersion: "3.4.x",
  bootMainSpringSecurity: "6.x",
  // Spring Boot 3.4.x が管理する Spring Framework 系列。TERASOLUNA 5.11 系 (Spring Framework 7.0.3、
  // 上の springFramework を参照) とはメジャーバージョンが異なる。「共通の土台 = 同じバージョン」ではない点に注意。
  bootMainSpringFramework: "6.x",
  bootMainMybatisStarter: "3.0.4 (mybatis-spring-boot-starter)",

  // docs-site 自体
  siteVersion: "0.13.x",
  siteStack: "Next.js 16 + React 19 + Tailwind CSS 3",

  // 最終更新
  lastUpdated: "2026-07-29",
} as const;

/**
 * PageMeta 等で使う「対象バージョン」の定型文字列。
 * 各ページで手書きせず、必ずここを参照する (表記揺れ防止)。
 */
export const TARGET_LABEL = {
  /** 主軸: TERASOLUNA multi-project (/steps/ 配下、および TERASOLUNA 中心の解説ページ) */
  terasoluna: `TERASOLUNA ${VERSIONS.terasolunaGfw} / Spring Boot ${VERSIONS.springBoot} / JDK 17`,
  /** 補助: Boot 単一プロジェクト (/steps-boot/ 配下、および Boot 前提の旧ページ) */
  boot: `補助: Spring Boot ${VERSIONS.bootMainVersion} 単一プロジェクト版`,
  /** TERASOLUNA を主、Boot を対比で扱うページ */
  compare: `TERASOLUNA ${VERSIONS.terasolunaGfw} (主軸) / Spring Boot ${VERSIONS.bootMainVersion} (補助対比)`,
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
      {
        label: "archetype groupId",
        value: VERSIONS.terasolunaArchetypeGroupId,
        note: "mvn archetype:generate の -DarchetypeGroupId",
      },
      {
        label: "GFW groupId",
        value: VERSIONS.terasolunaGroupId,
        note: "terasoluna-gfw-parent 等 GFW 本体ライブラリの groupId (archetype groupId とは別物)",
      },
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
      {
        label: "Spring Boot BOM",
        value: VERSIONS.springBoot,
        note: "terasoluna-dependencies 3.0.0.RELEASE が import",
      },
      {
        label: "Spring Framework",
        value: VERSIONS.springFramework,
        note: "spring-boot-dependencies 4.0.2 の spring-framework.version",
      },
      {
        label: "Spring Security",
        value: VERSIONS.springSecurity,
        note: "spring-boot-dependencies 4.0.2 の spring-security.version",
      },
    ],
  },
  {
    key: "web-view",
    title: "Web / View / Validation",
    desc: "JSP + JSTL + Bean Validation (Jakarta EE 系)。",
    rows: [
      { label: "Jakarta Servlet API", value: VERSIONS.jakartaServlet },
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
      { label: "Tomcat (STS Run on Server)", value: VERSIONS.tomcatDeployTarget },
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
      { label: "Spring Framework", value: VERSIONS.bootMainSpringFramework, note: "TERASOLUNA 側 (7.0.3) とはメジャーバージョンが異なる" },
      { label: "Spring Security", value: VERSIONS.bootMainSpringSecurity },
      { label: "mybatis-spring-boot-starter", value: VERSIONS.bootMainMybatisStarter },
      { label: "JDK", value: "17 (Boot 3.4 系ベースライン)" },
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
