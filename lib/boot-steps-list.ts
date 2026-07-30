// クライアントコンポーネント (Sidebar / SearchPalette) から使う、
// 補助: Boot 版 Step の静的リスト。
// content/steps-boot/*.md と対応。新規追加時はこの配列も更新する。
//
// Server-side の一次ソースは lib/steps-boot.ts (fs で読む)。
// このファイルはクライアントバンドルに載る前提なので fs は使わない。

export type BootStepListItem = {
  slug: string;
  number: number;
  title: string;
  /** SearchPalette のエントリ生成に使う 1 行説明 */
  desc: string;
};

export const BOOT_STEPS: BootStepListItem[] = [
  { slug: "00-toc", number: 0, title: "目次", desc: "Boot 補助トラック 18 ページの目次と使い方" },
  { slug: "01-project-skeleton", number: 1, title: "プロジェクト骨組み", desc: "spring-boot-starter-parent で単一プロジェクトの空プロジェクトを作る" },
  { slug: "02-empty-boot", number: 2, title: "空アプリ起動 & DB 準備", desc: "Tomcat 起動確認 + H2 in-memory DB の準備" },
  { slug: "02.5-hello-controller", number: 2.5, title: "はじめての Controller + JSP (Hello)", desc: "最小の Controller + JSP で最初の成功体験を作る" },
  { slug: "03-user-domain", number: 3, title: "User ドメイン", desc: "users テーブルの 1 行を表す POJO (Entity) を作る" },
  { slug: "04-mapper", number: 4, title: "Mapper (SQL 係)", desc: "MyBatis Mapper + XML で SQL を発行する層を作る" },
  { slug: "05-service", number: 5, title: "Service (業務ロジック係)", desc: "Controller → Service → Mapper の呼び出し方向を確立" },
  { slug: "06-auth-foundation", number: 6, title: "認証基盤", desc: "SecurityConfig.java + BCryptPasswordEncoder で認証基盤を作る" },
  { slug: "07-login", number: 7, title: "ログイン画面", desc: "login.jsp + Spring Security でログイン画面を実装" },
  { slug: "08-menu", number: 8, title: "メニュー画面", desc: "ログイン後のメニュー画面と共通ヘッダを作る" },
  { slug: "09-search", number: 9, title: "検索画面", desc: "役職テキストの部分一致検索を実装" },
  { slug: "10-user-info", number: 10, title: "ユーザ情報画面", desc: "自分のユーザ情報を表示する画面を作る" },
  { slug: "11-edit", number: 11, title: "変更画面 & PRG パターン", desc: "PRG パターンで変更画面のリロード二重更新を防ぐ" },
  { slug: "12-complete", number: 12, title: "完成 & まとめ", desc: "5 画面の通し動作確認とまとめ" },
  { slug: "12.5-optimistic-lock", number: 12.5, title: "楽観ロック (Optimistic Lock) の実演", desc: "version カラムで楽観ロック (Optimistic Lock) を実演" },
  { slug: "13-service-test", number: 13, title: "Service の単体テスト (JUnit5 + Mockito)", desc: "Mapper をモック化して Service の単体テスト" },
  { slug: "14-mapper-test", number: 14, title: "Mapper の統合テスト (@MybatisTest)", desc: "@MybatisTest で Mapper 層の統合テスト" },
  { slug: "15-controller-test", number: 15, title: "Controller のテスト (MockMvc + @WebMvcTest)", desc: "@WebMvcTest + MockMvc で Controller テスト" },
];
