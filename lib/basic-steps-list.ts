// クライアントコンポーネント (Sidebar / SearchPalette) から使う、
// 入門: Spring Security なし版 Step の静的リスト。
// content/steps-basic/*.md と対応。新規追加時はこの配列も更新する。
//
// Server-side の一次ソースは lib/steps-basic.ts (fs で読む)。
// このファイルはクライアントバンドルに載る前提なので fs は絶対に import しないこと
// (Client Component が fs を持つ lib を import すると Turbopack のビルドが
// 「chunking context does not support external modules」で落ちる実績がある)。

export type BasicStepListItem = {
  slug: string;
  number: number;
  title: string;
  /** SearchPalette のエントリ生成に使う 1 行説明 */
  desc: string;
};

export const BASIC_STEPS: BasicStepListItem[] = [
  { slug: "00-modules-map", number: 0, title: "5 モジュールの地図", desc: "TERASOLUNA multi-project の 5 モジュール構成を先に掴む (入門版)" },
  { slug: "01-project-skeleton", number: 1, title: "プロジェクト骨組み", desc: "archetype で親 POM + 5 子モジュールを生成" },
  { slug: "02-empty-boot", number: 2, title: "空アプリ起動 & DB 準備 & Security 無効化", desc: "Tomcat 起動確認 + H2 準備。Spring Security は無効化した状態で進める" },
  { slug: "02.5-hello-controller", number: 2.5, title: "はじめての Controller + JSP (Hello)", desc: "最小の Controller + JSP で最初の成功体験を作る" },
  { slug: "03-user-domain", number: 3, title: "User ドメイン", desc: "domain.model パッケージに Entity を集約" },
  { slug: "04-repository", number: 4, title: "Repository (SQL 係)", desc: "interface + XML で SQL を発行する層を作る" },
  { slug: "05-service", number: 5, title: "Service (業務ロジック係)", desc: "@Service + @Transactional で業務ロジックをまとめる" },
  { slug: "06-list", number: 6, title: "ユーザ一覧画面", desc: "認証なしで一覧表示の一気通貫を先に通す" },
  { slug: "07-search", number: 7, title: "検索画面", desc: "Form クラス + LIKE 検索を実装" },
  { slug: "08-detail", number: 8, title: "詳細画面", desc: "1 件取得して詳細を表示" },
  { slug: "09-edit", number: 9, title: "編集画面 & PRG パターン", desc: "POST → redirect の PRG パターンを実践" },
  { slug: "10-complete", number: 10, title: "完成 & まとめ", desc: "一覧・検索・詳細・編集の CRUD 一周を通し確認" },
  { slug: "11-service-test", number: 11, title: "Service の単体テスト (JUnit5 + Mockito)", desc: "@InjectMocks で Service をテスト" },
  { slug: "12-repository-test", number: 12, title: "Repository の統合テスト", desc: "Spring TestContext + H2 で実 SQL を検証" },
  { slug: "13-controller-test", number: 13, title: "Controller テスト (MockMvc)", desc: "standaloneSetup で URL / Model / View を検証" },
];
