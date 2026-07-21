/**
 * 実物の JSP 画面をブラウザ上で再現する見た目のフレーム。
 * すべての playground 画面で共通で使う。
 */
export function ScreenFrame({
  title,
  loginId,
  showMenuButton = true,
  showLogout = true,
  children,
}: {
  title: string;
  loginId?: string;
  showMenuButton?: boolean;
  showLogout?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border-2 border-slate-300 rounded-md shadow-inner max-w-2xl">
      {/* 見出し部（ブラウザバーっぽい飾り） */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 bg-slate-100 rounded-t-md">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
        <span className="ml-3 text-xs text-slate-500 font-mono">{title}</span>
      </div>

      {/* JSP のヘッダ相当 */}
      {(loginId || showLogout || showMenuButton) && (
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center gap-3 text-sm">
          {loginId && <span>{loginId}さん</span>}
          {showLogout && (
            <button className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-100">
              ログアウト
            </button>
          )}
          {showMenuButton && (
            <button className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-100">
              メニュー
            </button>
          )}
        </div>
      )}

      {/* 本文 */}
      <div className="p-6">{children}</div>
    </div>
  );
}
