"use client";
import Link from "next/link";
import { useState } from "react";
import { ScreenFrame } from "@/components/playground/ScreenFrame";

const SEED = {
  u001: { pw: "password", role: "部長" },
  u002: { pw: "password", role: "課長" },
  u003: { pw: "password", role: "係長" },
  u004: { pw: "password", role: "主任" },
  u005: { pw: "password", role: "一般" },
} as Record<string, { pw: string; role: string }>;

export default function LoginPlayground() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [state, setState] = useState<"form" | "error" | "success">("form");
  const [loggedInAs, setLoggedInAs] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = SEED[id];
    if (u && u.pw === pw) {
      setLoggedInAs(id);
      setState("success");
    } else {
      setState("error");
    }
  }

  function reset() {
    setId("");
    setPw("");
    setState("form");
    setLoggedInAs(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4 text-sm">
          <Link href="/playground" className="text-brand hover:underline">
            ← Playground
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/steps/07-login" className="text-slate-600 hover:text-brand">
            Step 07 のノートを読む
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">ログイン画面 (触ってみる)</h1>
        <p className="mt-3 text-slate-700">
          実物と同じ login.jsp の見た目と挙動。ID <code>u001</code>〜<code>u005</code> / パスワード <code>password</code> で通ります。
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div>
            {state === "success" && loggedInAs ? (
              <ScreenFrame
                title="/menu — メニュー画面"
                loginId={loggedInAs}
                showLogout={true}
                showMenuButton={false}
              >
                <h2 className="text-lg font-bold mb-3">メニュー</h2>
                <ul className="list-disc pl-6 space-y-1 text-brand">
                  <li>ユーザーを検索する</li>
                  <li>自分のユーザ情報を見る</li>
                </ul>
                <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-900">
                  <strong>認証成功。</strong> Spring Security が `POST /login` を Filter で処理し、SecurityConfig の <code>.defaultSuccessUrl(&quot;/menu&quot;, true)</code> でここに来ました。
                </div>
                <button
                  onClick={reset}
                  className="mt-4 px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-slate-50"
                >
                  もう一度
                </button>
              </ScreenFrame>
            ) : (
              <ScreenFrame title="/login — login.jsp" showLogout={false} showMenuButton={false}>
                <h2 className="text-lg font-bold mb-3">ログイン</h2>

                {state === "error" && (
                  <p className="text-red-600 mb-3 text-sm">ID またはパスワードが違います</p>
                )}

                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <label className="block text-sm">
                      ユーザID:
                      <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        required
                        className="ml-2 border border-slate-300 rounded px-2 py-1 text-sm"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm">
                      パスワード:
                      <input
                        type="password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        required
                        className="ml-2 border border-slate-300 rounded px-2 py-1 text-sm"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-brand text-white rounded hover:bg-brand-dark"
                  >
                    ログイン
                  </button>
                </form>

                <p className="mt-6 text-xs text-slate-500">
                  研修用: id = u001〜u005, password = password
                </p>
              </ScreenFrame>
            )}
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-2">裏で何が起きているか</h3>
              <ol className="text-sm text-slate-700 space-y-2 list-decimal pl-5">
                <li>
                  <strong>ブラウザ</strong>が <code>POST /login</code> に form を送信
                </li>
                <li>
                  <strong>Spring Security Filter</strong> が横取り
                  (Controller には来ない)
                </li>
                <li>
                  <strong>CustomUserDetailsService</strong> が <code>UserMapper.findById(id)</code> で DB を引く
                </li>
                <li>
                  返ってきた password(BCrypt) と入力 password を <strong>BCryptPasswordEncoder</strong> で照合
                </li>
                <li>一致 → <code>/menu</code> にリダイレクト / 不一致 → <code>/login?error</code></li>
              </ol>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold text-slate-900 mb-2">実物との違い</h3>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
                <li>CSRF トークンは省略 (本物は hidden で送る)</li>
                <li>認証は JS で判定 (本物は DB + BCrypt)</li>
                <li>実物の完全動作: <a href="/steps/07-login" className="text-brand hover:underline">Step 07</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
