"use client";
import Link from "next/link";
import { useState } from "react";
import { ScreenFrame } from "@/components/playground/ScreenFrame";

export default function EditPlayground() {
  const [role, setRole] = useState("課長");
  const [editing, setEditing] = useState(false);
  const [draftRole, setDraftRole] = useState("課長");
  const [urlBar, setUrlBar] = useState("/user-info");
  const [redirecting, setRedirecting] = useState(false);

  function startEdit() {
    setDraftRole(role);
    setEditing(true);
    setUrlBar("/user-info/edit");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // POST /user-info/edit を模擬
    setUrlBar("/user-info/edit (POST 送信中...)");
    setRedirecting(true);
    // PRG: サーバから 302 が返ってきた体で 500ms 後に GET /user-info へ
    setTimeout(() => {
      setRole(draftRole);
      setEditing(false);
      setRedirecting(false);
      setUrlBar("/user-info"); // ← URL バーが変わる!
    }, 600);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4 text-sm">
          <Link href="/playground" className="text-brand hover:underline">
            ← Playground
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/steps/11-edit" className="text-slate-600 hover:text-brand">
            Step 11 のノートを読む
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          ユーザ情報変更 (PRG パターン)
        </h1>
        <p className="mt-3 text-slate-700">
          POST → Redirect → GET のリレー動作を可視化。
          「変更する」ボタンを押した後、上の URL バーが <code>/user-info/edit</code>
          → <code>/user-info</code> に切り替わる瞬間に注目。
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div>
            {/* URL バー */}
            <div className="mb-3 bg-slate-800 text-slate-100 rounded-t-md px-3 py-2 font-mono text-xs">
              <span className="text-slate-400">🌐 http://localhost:8080</span>
              <span
                className={
                  "ml-1 " +
                  (redirecting
                    ? "text-yellow-300 animate-pulse"
                    : "text-emerald-300 font-bold")
                }
              >
                {urlBar}
              </span>
            </div>

            {editing ? (
              <ScreenFrame
                title="userInfoEdit.jsp"
                loginId="u002"
                showMenuButton={true}
              >
                <h2 className="text-lg font-bold mb-3">ユーザー情報変更</h2>
                <p className="mb-3">ID: u002</p>
                <form onSubmit={submit} className="flex items-center gap-2">
                  <label className="text-sm">役職:</label>
                  <input
                    type="text"
                    value={draftRole}
                    onChange={(e) => setDraftRole(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-brand text-white rounded hover:bg-brand-dark"
                    disabled={redirecting}
                  >
                    {redirecting ? "送信中..." : "変更する"}
                  </button>
                </form>
              </ScreenFrame>
            ) : (
              <ScreenFrame
                title="userInfo.jsp"
                loginId="u002"
                showMenuButton={true}
              >
                <h2 className="text-lg font-bold mb-3">ユーザー情報</h2>
                <p>ID: u002</p>
                <p className="mb-4">役職: <strong>{role}</strong></p>
                <button
                  onClick={startEdit}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-100"
                >
                  変更する
                </button>
              </ScreenFrame>
            )}
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-2">PRG (Post-Redirect-Get) とは</h3>
              <ol className="text-sm text-slate-700 space-y-2 list-decimal pl-5">
                <li>
                  ブラウザ → <code>POST /user-info/edit</code> (更新)
                </li>
                <li>
                  Controller: <code>userService.updateRole(...)</code> → DB 更新
                </li>
                <li>
                  Controller が <code>&quot;redirect:/user-info&quot;</code> を返す
                </li>
                <li>
                  Spring MVC → ブラウザに <code>302 Found</code> + <code>Location: /user-info</code>
                </li>
                <li>
                  <strong>ブラウザが自動で <code>GET /user-info</code> を発行</strong> → URL バーが変わる
                </li>
              </ol>
            </div>

            <div className="bg-white border border-emerald-200 rounded-lg p-4">
              <h3 className="font-bold text-emerald-800 mb-2">なぜこれで安全?</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                更新完了後の画面は <strong>GET</strong> なので、
                ユーザが <kbd className="px-1.5 py-0.5 border border-slate-300 rounded text-xs bg-slate-50">F5</kbd> でリロードしても
                「もう一度更新される」ことがない。POST のまま返すと二重更新の危険があります。
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-2">実物との違い</h3>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
                <li>本物は DB 更新後にリダイレクト</li>
                <li>本物は CSRF トークンつきの POST</li>
                <li>詳細: <Link href="/steps/11-edit" className="text-brand hover:underline">Step 11</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
