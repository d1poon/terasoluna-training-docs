import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export default function PlaygroundIndex() {
  const steps = getAllSteps();
  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            Playground
          </div>
          <h1 className="text-4xl font-bold mt-2 text-slate-900">
            触ってみるデモ
          </h1>
          <p className="mt-4 text-slate-700 text-lg leading-relaxed">
            <strong>STS を立ち上げなくても</strong>、実物と同じ挙動をこのページ上で試せます。
            入力欄に値を入れてボタンを押すと、実物と同じ結果が返ってきます。
            「なぜこう動くのか」の答えは Step ページに戻って確認してください。
          </p>
        </div>

        <div className="grid gap-4">
          <PlaygroundCard
            href="/playground/login"
            step="Step 07"
            title="ログイン"
            desc="ID とパスワードを入れて認証。ID が u001〜u005、パスワード password で通る。それ以外はエラー"
          />
          <PlaygroundCard
            href="/playground/search"
            step="Step 09"
            title="役職検索 (部分一致)"
            desc="役職テキストを入れると、Mapper の LIKE 検索がクライアント側で再現される。「長」で 3件、空欄で 5件"
          />
          <PlaygroundCard
            href="/playground/edit"
            step="Step 11"
            title="ユーザ情報変更 (PRG パターン)"
            desc="役職を書き換えて送信 → 更新後に URL バーが /user-info に変わる (PRG) の動きを可視化"
          />
        </div>
        </main>
      </div>
    </div>
  );
}

function PlaygroundCard({
  href,
  step,
  title,
  desc,
}: {
  href: string;
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg border border-slate-200 p-5 hover:border-brand hover:shadow-sm transition-all"
    >
      <div className="flex items-baseline gap-3">
        <span className="text-brand font-mono text-xs">{step}</span>
        <span className="text-slate-900 font-bold">{title}</span>
      </div>
      <p className="mt-2 text-slate-700 text-sm leading-relaxed">{desc}</p>
    </Link>
  );
}
