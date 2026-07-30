// クライアント/サーバ両方で使う軽量関数。
// node:fs 等の Node 依存を持たないよう lib/steps.ts から切り出した。

/** ステップ番号の表示用文字列 (2 → "02", 2.5 → "02.5", 12.5 → "12.5") */
export function formatStepNumber(n: number): string {
  if (Number.isInteger(n)) return String(n).padStart(2, "0");
  const [intPart, decPart] = String(n).split(".");
  return `${intPart.padStart(2, "0")}.${decPart}`;
}
