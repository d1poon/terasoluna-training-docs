import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { BuildOrderClient } from "./BuildOrderClient";

export const metadata: Metadata = {
  title: "作成順チェックリスト",
  description:
    "Spring Boot 単一プロジェクト版の全 22 ファイルを作成順に並べたチェックリスト。1 番から順に組み立てれば動くところまで到達できる。進捗はブラウザに保存される。",
};

export default function BuildOrderPage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <BuildOrderClient />
      </div>
    </div>
  );
}
