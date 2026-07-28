import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { BuildOrderClient } from "./BuildOrderClient";

// このページはビルド時 (SSG) にはステップメタを埋め込まないので、
// サイドバー用のダミー steps を作る (実行時に何も参照しないため)
const DUMMY_STEPS = [
  { slug: "00-toc", number: 0, title: "目次" },
  { slug: "01-project-skeleton", number: 1, title: "プロジェクト骨組み" },
  { slug: "02-empty-boot", number: 2, title: "空アプリ起動 & DB 準備" },
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
];

export const metadata: Metadata = {
  title: "作成順チェックリスト",
  description:
    "Spring Boot 単一プロジェクト版の全 22 ファイルを作成順に並べたチェックリスト。1 番から順に組み立てれば動くところまで到達できる。進捗はブラウザに保存される。",
};

export default function BuildOrderPage() {
  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={DUMMY_STEPS} />

      <div className="flex-1 min-w-0">
        <BuildOrderClient />
      </div>
    </div>
  );
}
