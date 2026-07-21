import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export default function HomePage() {
  const steps = getAllSteps();
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar steps={steps} />

      <main className="flex-1 p-6 md:p-12 max-w-4xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            TERASOLUNA 5 相当 リファレンス実装
          </div>
          <h1 className="text-4xl font-bold mt-2 text-slate-900">
            役職編集アプリを 12 ステップで組み立てる
          </h1>
          <p className="mt-4 text-slate-700 text-lg leading-relaxed">
            Spring Boot + JSP + MyBatis + H2 で、ログイン → メニュー → 検索 → ユーザ情報 → 変更 の
            5 画面アプリをガンプラのように部品ごとに組み立てるガイドです。
          </p>
        </div>

        <section className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-3 text-slate-900">このガイドの特徴</h2>
          <ul className="space-y-2 text-slate-700">
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>各ステップは <strong>5〜15分</strong>。順番通りに進めれば必ず動く</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>コードは <strong>コピペOK</strong>。すべて手打ちしなくて良い</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>各ステップに「<strong>なぜこう書くか</strong>」の解説付き — 後輩に説明できる状態を目指す</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand font-bold">✓</span>
              <span>「<strong>動作確認</strong>」で次のステップ前に何ができるかを明示</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-bold mb-3 text-slate-900">前提</h2>
          <ul className="space-y-2 text-slate-700">
            <li>• JDK 17+ (JDK 24 でも可)</li>
            <li>• Maven (3.8+)</li>
            <li>• 好きなエディタ (STS4 / VSCode / IntelliJ どれでも)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">ステップ一覧</h2>
          <div className="grid gap-3">
            {steps.map((step) => (
              <Link
                key={step.slug}
                href={`/steps/${step.slug}`}
                className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-brand hover:shadow-sm transition-all"
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-brand font-mono font-bold text-lg w-10">
                    {String(step.number).padStart(2, "0")}
                  </span>
                  <span className="text-slate-900 font-semibold">{step.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500 text-center">
          Built for TERASOLUNA training · Spring Boot 3.4 · 2026
        </div>
      </main>
    </div>
  );
}
