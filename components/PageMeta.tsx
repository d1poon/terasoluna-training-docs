import Link from "next/link";
import { VERSIONS, TARGET_LABEL } from "@/lib/versions";

/**
 * ページヘッダ下に表示する「最終更新日 / 対象バージョン」バー。
 *
 * デフォルトは**主軸の TERASOLUNA multi-project スタック**を対象とする。
 * Boot 補助版 (/steps-boot/ 配下や Boot 前提の旧ページ) では
 * `targetVersion={TARGET_LABEL.boot}` を明示的に渡すこと。
 *
 * バージョン数値をここに直接書かない — 必ず lib/versions.ts の
 * VERSIONS / TARGET_LABEL を参照する (表記揺れ防止)。
 */
export function PageMeta({
  updated,
  targetVersion,
}: {
  /** ページ本体の最終更新日。省略時は VERSIONS.lastUpdated */
  updated?: string;
  /** そのページで扱う技術の対象バージョン。省略時は TERASOLUNA 主軸スタック */
  targetVersion?: string;
}) {
  const updatedStr = updated ?? VERSIONS.lastUpdated;
  const target = targetVersion ?? TARGET_LABEL.terasoluna;
  return (
    <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 border-b border-slate-100 pb-3">
      <span>
        <span className="text-slate-500">最終更新:</span>{" "}
        <time className="font-mono text-slate-700">{updatedStr}</time>
      </span>
      <span>
        <span className="text-slate-500">対象:</span>{" "}
        <span className="font-mono text-slate-700">{target}</span>
      </span>
      <Link
        href="/versions"
        className="text-brand underline decoration-dotted hover:decoration-solid"
      >
        全バージョン一覧
      </Link>
    </div>
  );
}
