import type { Metadata } from "next";
import { LoginPlayground } from "./LoginPlayground";

export const metadata: Metadata = {
  title: "ログイン (Playground)",
  description:
    "ID u001〜u005 / パスワード password でログイン画面の認証成功・失敗を体験できるデモ。Spring Security Filter の裏側の流れも解説。",
};

export default function LoginPlaygroundPage() {
  return <LoginPlayground />;
}
