import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { VERSION_GROUPS, REPO } from "@/lib/versions";

export const metadata = {
  title: "対象バージョン一覧",
  description:
    "本教材で扱う Spring Boot / TERASOLUNA archetype / JDK / Tomcat / MyBatis 等のバージョンをまとめて掲載。",
};

export default function VersionsPage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main id="main" className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              対象バージョン
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2 text-slate-900 leading-tight">
              バージョン一覧
            </h1>
            <p className="mt-3 text-slate-700 text-sm md:text-base leading-relaxed">
              本教材で採用しているバージョンを 1 箇所にまとめました。各ページはこの表を参照します。
              サイト内でバージョン表記を見かけた場合、正確な値はここを参照してください。
              <br />
              <strong className="text-slate-800">
                主軸 (/steps/) は TERASOLUNA multi-project、補助 (/steps-boot/) は Spring Boot 単一プロジェクトで、
                スタックが異なります。
              </strong>
              どちらの話をしているか、下の表のグループ名で確認してください。
            </p>
          </div>

          {VERSION_GROUPS.map((group) => (
            <section
              key={group.key}
              className="mb-8 bg-white border border-slate-200 rounded-xl p-5 md:p-6"
            >
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                {group.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{group.desc}</p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left bg-slate-50">
                      <th className="px-3 py-2 border border-slate-200 font-semibold w-1/3">
                        項目
                      </th>
                      <th className="px-3 py-2 border border-slate-200 font-semibold">
                        バージョン / 値
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={row.label}>
                        <td className="px-3 py-2 border border-slate-200 font-mono text-[13px] align-top">
                          {row.label}
                        </td>
                        <td className="px-3 py-2 border border-slate-200 align-top">
                          <span className="font-mono">{row.value}</span>
                          {row.note && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {row.note}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6">
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              バージョンが古い / 誤りを見つけたら
            </h2>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              教材上の記載と実行環境で挙動が変わった場合は、
              <Link
                href={`${REPO.newIssueUrl}?title=%5Bversions%5D+`}
                className="text-brand underline"
              >
                GitHub Issue
              </Link>
              でご報告ください。1 箇所直せば全ページに反映されます。
            </p>
          </section>

          <p className="text-xs text-slate-500 mt-6">
            出典コード: <code className="font-mono">lib/versions.ts</code>
          </p>
        </main>
      </div>
    </div>
  );
}
