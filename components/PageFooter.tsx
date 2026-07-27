import { REPO } from "@/lib/versions";

/**
 * ページ末尾に表示する「誤り報告」導線。
 * GitHub の New Issue 画面に、ページタイトル / slug を初期値付きで飛ばす。
 * サイト内で発見した記述ミス・古いバージョン記述・図解のズレなどを気軽に投げてもらう入口。
 */
export function PageFooter({
  pageTitle,
  slug,
}: {
  /** 誤り報告 Issue のタイトルに埋め込むページ名 (例: "Step 07 — ログイン") */
  pageTitle: string;
  /** URL パス相当。空白は avoid。例: "steps/07-login", "preface" */
  slug: string;
}) {
  const issueTitle = `[${slug}] `;
  const issueBody = [
    `> ページ: ${pageTitle}`,
    `> URL: /${slug}`,
    "",
    "## 気づいたこと",
    "",
    "",
    "## 期待していた記述 (あれば)",
    "",
    "",
  ].join("\n");
  const newIssueUrl =
    `${REPO.newIssueUrl}?title=${encodeURIComponent(issueTitle)}` +
    `&body=${encodeURIComponent(issueBody)}` +
    `&labels=${encodeURIComponent("docs")}`;

  return (
    <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 print:hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span>誤り・改善案を見つけた?</span>
        <a
          href={newIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand underline decoration-dotted hover:decoration-solid"
        >
          <span aria-hidden="true">🐙</span>
          <span>GitHub Issue で報告</span>
        </a>
        <a
          href={REPO.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-900 underline decoration-dotted hover:decoration-solid"
        >
          リポジトリを見る
        </a>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        フィードバックは公開 Issue として残るので、後から同じ疑問を持った方の役にも立ちます。
      </p>
    </footer>
  );
}
