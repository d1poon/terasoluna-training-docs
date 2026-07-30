import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { BuildOrderBasicClient } from "./BuildOrderBasicClient";

export const metadata: Metadata = {
  title: "作成順チェックリスト (入門版)",
  description:
    "Spring Security なし・入門トラック (/steps-basic/) 向けの全 22 項目を作成順に並べたチェックリスト。1 番から順に組み立てれば一覧・検索・詳細・編集の 4 画面が動くところまで到達できる。進捗はブラウザに保存される。",
};

export default function BuildOrderBasicPage() {
  // Sidebar の「Steps (TERASOLUNA)」セクションは主軸トラックの一覧を出す共通部分なので、
  // どのページからでも実データ (content/steps/) を渡す。
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} currentTrack="basic" />

      <div className="flex-1 min-w-0">
        <BuildOrderBasicClient />
      </div>
    </div>
  );
}
