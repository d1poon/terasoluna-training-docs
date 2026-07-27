import Link from "next/link";
import { VERSIONS } from "@/lib/versions";

/**
 * ページヘッダ下に表示する「最終更新日 / 対象バージョン」バー。
 * デフォルトで rolemgr スタック (Boot 3.4 + JDK 17) を対象とし、
 * バージョン欄は /versions ページへリンクさせて "詳しくはこちら" 導線にする。
 *
 * オプションで targetVersion を渡すと、そのページ固有の対象バージョン (例: "TERASOLUNA 5.11.0") を表示できる。
 */
export function PageMeta({
  updated,
  targetVersion,
}: {
  /** ページ本体の最終更新日。省略時は VERSIONS.lastUpdated */
  updated?: string;
  /** そのページで扱う技術の対象バージョン (省略時: rolemgr スタック要約) */
  targetVersion?: string;
}) {
  const updatedStr = updated ?? VERSIONS.lastUpdated;
  const target =
    targetVersion ?? `Spring Boot ${VERSIONS.springBoot} / JDK 17 / Maven ${VERSIONS.maven}`;
  return (
    <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 border-b border-slate-100 pb-3">
      <span>
        <span className="text-slate-400">最終更新:</span>{" "}
        <time className="font-mono text-slate-700">{updatedStr}</time>
      </span>
      <span>
        <span className="text-slate-400">対象:</span>{" "}
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
