"use client";
import Link from "next/link";
import { useState } from "react";
import { ScreenFrame } from "@/components/playground/ScreenFrame";

const USERS = [
  { id: "u001", role: "部長" },
  { id: "u002", role: "課長" },
  { id: "u003", role: "係長" },
  { id: "u004", role: "主任" },
  { id: "u005", role: "一般" },
];

export default function SearchPlayground() {
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 実物の Mapper XML の LIKE '%role%' に相当するクライアント側の再現
  const results = submitted
    ? USERS.filter((u) => u.role.includes(role))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4 text-sm">
          <Link href="/playground" className="text-brand hover:underline">
            ← Playground
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/steps/09-search" className="text-slate-600 hover:text-brand">
            Step 09 のノートを読む
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          役職検索 (部分一致)
        </h1>
        <p className="mt-3 text-slate-700">
          Mapper XML の <code>WHERE role LIKE &apos;%role%&apos;</code>
          が client 側で再現されています。「長」で 3 件、「一」で 1 件、空欄で全 5 件、が返ります。
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div>
            <ScreenFrame title="/search — search.jsp" loginId="u001">
              <h2 className="text-lg font-bold mb-3">検索</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="flex items-center gap-2"
              >
                <label className="text-sm">役職:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="例: 長"
                  className="border border-slate-300 rounded px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-brand text-white rounded hover:bg-brand-dark"
                >
                  検索
                </button>
              </form>

              {submitted && (
                <div className="mt-4">
                  {results.length > 0 ? (
                    <table className="w-full text-sm border border-slate-300 border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-2 py-1 text-left">ID</th>
                          <th className="border border-slate-300 px-2 py-1 text-left">役職</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((u) => (
                          <tr key={u.id}>
                            <td className="border border-slate-300 px-2 py-1 font-mono">
                              {u.id}
                            </td>
                            <td className="border border-slate-300 px-2 py-1">{u.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-slate-600 text-sm">該当なし</p>
                  )}
                </div>
              )}
            </ScreenFrame>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-2">裏で何が起きているか</h3>
              <ol className="text-sm text-slate-700 space-y-2 list-decimal pl-5">
                <li>
                  <strong>ブラウザ</strong> → <code>GET /search?role=長</code>
                </li>
                <li>
                  <strong>SearchController</strong>
                  <code>@RequestParam(required=false) String role</code> で受ける
                </li>
                <li>
                  <strong>UserService.searchByRole(role)</strong> を呼ぶ
                </li>
                <li>
                  <strong>UserMapper.findByRole(role)</strong> →
                  <code>SELECT ... WHERE role LIKE &apos;%&apos; || #&#123;role&#125; || &apos;%&apos;</code>
                </li>
                <li>
                  結果 <code>List&lt;User&gt;</code> を Model に addAttribute → JSP の
                  <code>&lt;c:forEach&gt;</code> でテーブル描画
                </li>
              </ol>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-2">試してみて</h3>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
                <li>空欄で検索 → 全 5 件</li>
                <li>「長」→ 部長・課長・係長</li>
                <li>「主」→ 主任のみ</li>
                <li>「xyz」→ 該当なし</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-2">「なぜ検索は GET?」</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                URL がブックマークでき、リロードで再検索されても副作用がない (冪等)。
                更新は POST、検索は GET が HTTP のイディオム。詳しくは
                <Link href="/steps/09-search" className="text-brand hover:underline">
                  {" "}Step 09
                </Link>。
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
