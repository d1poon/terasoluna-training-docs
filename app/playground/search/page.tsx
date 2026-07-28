import type { Metadata } from "next";
import { SearchPlayground } from "./SearchPlayground";

export const metadata: Metadata = {
  title: "役職検索 (Playground)",
  description:
    "Mapper XML の LIKE '%role%' 部分一致検索をブラウザ上で再現したデモ。「長」で 3 件、空欄で 5 件など実際の挙動を試せる。",
};

export default function SearchPlaygroundPage() {
  return <SearchPlayground />;
}
