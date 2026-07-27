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
};

export const BOOT_STEPS: BootStepListItem[] = [
  { slug: "00-toc", number: 0, title: "目次" },
  { slug: "01-project-skeleton", number: 1, title: "プロジェクト骨組み" },
  { slug: "02-empty-boot", number: 2, title: "空アプリ起動 & DB 準備" },
  { slug: "02.5-hello-controller", number: 2.5, title: "はじめての Controller + JSP (Hello)" },
  { slug: "03-user-domain", number: 3, title: "User ドメイン" },
  { slug: "04-mapper", number: 4, title: "Mapper (SQL 係)" },
  { slug: "05-service", number: 5, title: "Service (業務ロジック係)" },
  { slug: "06-auth-foundation", number: 6, title: "認証基盤" },
  { slug: "07-login", number: 7, title: "ログイン画面" },
  { slug: "08-menu", number: 8, title: "メニュー画面" },
  { slug: "09-search", number: 9, title: "検索画面" },
  { slug: "10-user-info", number: 10, title: "ユーザ情報画面" },
  { slug: "11-edit", number: 11, title: "変更画面 & PRG パターン" },
  { slug: "12-complete", number: 12, title: "完成 & まとめ" },
  { slug: "12.5-optimistic-lock", number: 12.5, title: "楽観ロック (Optimistic Lock) の実演" },
  { slug: "13-service-test", number: 13, title: "Service の単体テスト (JUnit5 + Mockito)" },
  { slug: "14-mapper-test", number: 14, title: "Mapper 統合テスト" },
  { slug: "15-controller-test", number: 15, title: "Controller テスト (MockMvc)" },
];
