import type { Metadata } from "next";
import { EditPlayground } from "./EditPlayground";

export const metadata: Metadata = {
  title: "ユーザ情報変更 / PRG パターン (Playground)",
  description:
    "役職を書き換えて送信すると URL バーが /user-info/edit → /user-info に切り替わる、PRG (Post-Redirect-Get) パターンを可視化したデモ。",
};

export default function EditPlaygroundPage() {
  return <EditPlayground />;
}
