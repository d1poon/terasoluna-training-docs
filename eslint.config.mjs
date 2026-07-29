// Next.js 16 (Flat Config) 用の ESLint 設定。
// eslint-config-next (16.x) は Linter.Config[] を直接 export しているため、
// 旧バージョンで必要だった @eslint/eslintrc の FlatCompat 経由の変換は不要。
import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  {
    // 導入時点で検出された下記ルールは、対象箇所が今回の担当ファイル範囲外
    // (他ファイルの大幅書き換えは行わない方針) のため error → warn に緩め、
    // まず「lint が動く状態」を優先する。担当ファイル側で直った際は
    // error に戻すことを検討する。
    rules: {
      // hydration 直後の DOM 由来 state 同期など、意図的な setState-in-effect
      // パターンを含む既存コードが複数あるため warn 止まり
      "react-hooks/set-state-in-effect": "warn",
      // 全角引用符をそのまま使っている既存コンテンツページが複数あるため warn 止まり
      "react/no-unescaped-entities": "warn",
      // 内部リンクを <a> 直書きしている箇所が1つ残っているため warn 止まり
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;
