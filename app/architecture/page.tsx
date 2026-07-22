import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

type LayerRow = {
  icon: string;
  layer: string;
  dir: string;
  file: string;
  step: string; // "01" or "07-11"
  color: string;
};

const layerRows: LayerRow[] = [
  { icon: "🚀", layer: "Entry",       dir: "com/training/rolemgr/",         file: "RolemgrApplication.java",         step: "02",    color: "bg-slate-100 text-slate-800" },
  { icon: "🧩", layer: "Domain",      dir: "domain/",                       file: "User.java",                       step: "03",    color: "bg-amber-100 text-amber-900" },
  { icon: "💾", layer: "Repository",  dir: "repository/",                   file: "UserMapper.java (interface)",     step: "04",    color: "bg-cyan-100 text-cyan-900" },
  { icon: "💾", layer: "SQL",         dir: "resources/mapper/",             file: "UserMapper.xml",                  step: "04",    color: "bg-cyan-100 text-cyan-900" },
  { icon: "⚙️", layer: "Service",     dir: "service/",                      file: "UserService.java",                step: "05",    color: "bg-emerald-100 text-emerald-900" },
  { icon: "🔐", layer: "Security",    dir: "security/",                     file: "CustomUserDetailsService.java",   step: "06",    color: "bg-rose-100 text-rose-900" },
  { icon: "⚙", layer: "Config",       dir: "config/",                       file: "SecurityConfig.java",             step: "06",    color: "bg-purple-100 text-purple-900" },
  { icon: "⚙", layer: "Config",       dir: "config/",                       file: "DataInitializer.java",            step: "06",    color: "bg-purple-100 text-purple-900" },
  { icon: "🎨", layer: "Controller",  dir: "controller/",                   file: "LoginController.java",            step: "07",    color: "bg-blue-100 text-blue-900" },
  { icon: "🖼", layer: "View",        dir: "webapp/WEB-INF/views/",         file: "login.jsp",                       step: "07",    color: "bg-indigo-100 text-indigo-900" },
  { icon: "🎨", layer: "Controller",  dir: "controller/",                   file: "MenuController.java",             step: "08",    color: "bg-blue-100 text-blue-900" },
  { icon: "🖼", layer: "View",        dir: "webapp/WEB-INF/views/",         file: "menu.jsp",                        step: "08",    color: "bg-indigo-100 text-indigo-900" },
  { icon: "🖼", layer: "View 共通",   dir: "webapp/WEB-INF/views/common/",  file: "header.jsp",                      step: "08",    color: "bg-indigo-100 text-indigo-900" },
  { icon: "🎨", layer: "Controller",  dir: "controller/",                   file: "SearchController.java",           step: "09",    color: "bg-blue-100 text-blue-900" },
  { icon: "🖼", layer: "View",        dir: "webapp/WEB-INF/views/",         file: "search.jsp",                      step: "09",    color: "bg-indigo-100 text-indigo-900" },
  { icon: "🎨", layer: "Controller",  dir: "controller/",                   file: "UserInfoController.java (view)",  step: "10",    color: "bg-blue-100 text-blue-900" },
  { icon: "🖼", layer: "View",        dir: "webapp/WEB-INF/views/",         file: "userInfo.jsp",                    step: "10",    color: "bg-indigo-100 text-indigo-900" },
  { icon: "🎨", layer: "Controller",  dir: "controller/",                   file: "UserInfoController.java (edit)",  step: "11",    color: "bg-blue-100 text-blue-900" },
  { icon: "🖼", layer: "View",        dir: "webapp/WEB-INF/views/",         file: "userInfoEdit.jsp",                step: "11",    color: "bg-indigo-100 text-indigo-900" },
  { icon: "📄", layer: "App 設定",    dir: "resources/",                    file: "application.properties",          step: "01",    color: "bg-slate-100 text-slate-800" },
  { icon: "🗄", layer: "DDL",         dir: "resources/",                    file: "schema.sql",                      step: "02",    color: "bg-slate-100 text-slate-800" },
  { icon: "🔧", layer: "ビルド",       dir: "(root)",                        file: "pom.xml",                         step: "01",    color: "bg-slate-100 text-slate-800" },
];

const stepSlugMap: Record<string, string> = {
  "01": "01-project-skeleton",
  "02": "02-empty-boot",
  "03": "03-user-domain",
  "04": "04-mapper",
  "05": "05-service",
  "06": "06-auth-foundation",
  "07": "07-login",
  "08": "08-menu",
  "09": "09-search",
  "10": "10-user-info",
  "11": "11-edit",
  "12": "12-complete",
};

const layerRoles = [
  { icon: "🎨", name: "Controller", desc: "「HTTP のことしか知らない」 リクエストを受けて Model 作って View 名を返す" },
  { icon: "⚙️", name: "Service",    desc: "「業務のことしか知らない」 ロジック + トランザクション境界" },
  { icon: "💾", name: "Repository (Mapper)", desc: "「DB のことしか知らない」 SQL を書く" },
  { icon: "🧩", name: "Domain",     desc: "「状態を持つ もの」 各層の間を流れるデータ" },
  { icon: "⚙", name: "Config",      desc: "「起動時の準備」 Bean 定義 + 初期投入" },
  { icon: "🔐", name: "Security",   desc: "「認証のための係」 Spring Security から DB を引く仕組み" },
  { icon: "🖼", name: "View (JSP)", desc: "「画面の設計図」 Controller の Model を HTML にする" },
];

export default function ArchitecturePage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-5xl px-4 py-6 lg:px-12 lg:py-12">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold">
            Architecture Overview
          </div>
          <h1 className="text-4xl font-bold mt-2 text-slate-900">
            アーキテクチャ全体図
          </h1>
          <p className="mt-4 text-slate-700 text-lg leading-relaxed">
            12 ステップで組み立てるアプリの<strong>全部品を一枚で見る</strong>ページ。
            「どのファイルがどの層のもので、どの Step で作ったか」を突き合わせる用。
          </p>
        </div>

        {/* Big picture */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">リクエストの流れ</h2>
          <div className="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
            <div className="space-y-2 text-sm md:text-base">
              <FlowBox label="ブラウザ" icon="🌐" />
              <FlowArrow label="HTTP" />
              <FlowBox
                label="Spring Security Filter"
                sub="認証・CSRF・セッション（未認証なら /login に飛ばす）"
                icon="🛡"
                bg="bg-rose-50 border-rose-200"
              />
              <FlowArrow />
              <FlowBox
                label="DispatcherServlet"
                sub="URL を見て呼ぶ Controller を決める"
                icon="🎯"
              />
              <FlowArrow />
              <FlowBox
                label="Controller 層"
                sub="controller/  ← HTTP → Java の型に変換、Model + View 名"
                icon="🎨"
                bg="bg-blue-50 border-blue-200"
              />
              <FlowArrow />
              <FlowBox
                label="Service 層"
                sub="service/  ← 業務ロジック + @Transactional 境界"
                icon="⚙️"
                bg="bg-emerald-50 border-emerald-200"
              />
              <FlowArrow />
              <FlowBox
                label="Repository / Mapper 層"
                sub="repository/ + resources/mapper/  ← MyBatis で SQL"
                icon="💾"
                bg="bg-cyan-50 border-cyan-200"
              />
              <FlowArrow />
              <FlowBox
                label="DB (H2 in-memory)"
                sub="users テーブル"
                icon="🗄"
                bg="bg-slate-100 border-slate-300"
              />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-600">
              <div className="font-semibold text-slate-800 mb-2">支援する部品:</div>
              <ul className="space-y-1">
                <li>🧩 <strong>Domain</strong> <code className="text-xs">domain/User.java</code> — 各層を流れる POJO</li>
                <li>🔐 <strong>Security</strong> <code className="text-xs">security/*</code> — DB からユーザを引く係</li>
                <li>⚙ <strong>Config</strong> <code className="text-xs">config/*</code> — Bean 定義と起動時処理</li>
                <li>🖼 <strong>View</strong> <code className="text-xs">webapp/WEB-INF/views/*.jsp</code> — Model を HTML 化</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 層の役割 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">層の役割 (1 行)</h2>
          <div className="grid gap-2">
            {layerRoles.map((r) => (
              <div
                key={r.name}
                className="bg-white rounded-lg border border-slate-200 p-4 flex gap-4 items-start"
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="font-bold text-slate-900">{r.name}</div>
                  <div className="text-sm text-slate-700 mt-1">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ファイル一覧 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">
            全ファイル一覧 <span className="text-base text-slate-500 font-normal">(Step 番号から該当ステップへリンク)</span>
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-3 py-2 font-semibold text-slate-700">Layer</th>
                  <th className="px-3 py-2 font-semibold text-slate-700">ディレクトリ</th>
                  <th className="px-3 py-2 font-semibold text-slate-700">ファイル</th>
                  <th className="px-3 py-2 font-semibold text-slate-700">Step</th>
                </tr>
              </thead>
              <tbody>
                {layerRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-2">
                      <span
                        className={
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium " +
                          row.color
                        }
                      >
                        <span>{row.icon}</span>
                        <span>{row.layer}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">
                      {row.dir}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-800">
                      {row.file}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/steps/${stepSlugMap[row.step]}`}
                        className="text-brand font-mono hover:underline"
                      >
                        Step {row.step}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500 mt-2">合計 22 ファイル</p>
        </section>

        {/* なぜ層に分けるか */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">
            なぜ層に分けるか
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-rose-200 p-5">
              <div className="font-bold text-rose-800 mb-2">分けない場合</div>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                <li>全部が 1 つの Controller に集まる → 数百行の巨大クラス</li>
                <li>テストできない (HTTP・業務ロジック・DB が絡まる)</li>
                <li>SQL を変えるだけでも Controller 全体を触る羽目に</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg border border-emerald-200 p-5">
              <div className="font-bold text-emerald-800 mb-2">分けた場合</div>
              <ul className="space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                <li>各層は自分の関心事だけを見る</li>
                <li>モックで差し替えて<strong>単体テスト</strong>できる</li>
                <li>変更範囲が予測可能 (SQL 変更なら Mapper だけ)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next actions */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">次にどこへ</h2>
          <div className="grid gap-3">
            <Link
              href="/"
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-brand transition-colors"
            >
              <div className="text-xs text-slate-500">HOME</div>
              <div className="text-slate-900 font-semibold mt-1">
                目次を見る (12 ステップ一覧)
              </div>
            </Link>
            <Link
              href="/steps/01-project-skeleton"
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-brand transition-colors"
            >
              <div className="text-xs text-slate-500">START</div>
              <div className="text-slate-900 font-semibold mt-1">
                Step 01 から組み立てを始める
              </div>
            </Link>
            <Link
              href="/steps/12-complete"
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-brand transition-colors"
            >
              <div className="text-xs text-slate-500">CHECKLIST</div>
              <div className="text-slate-900 font-semibold mt-1">
                Step 12 の自己確認 12 問を見る
              </div>
            </Link>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
}

function FlowBox({
  label,
  sub,
  icon,
  bg = "bg-white border-slate-200",
}: {
  label: string;
  sub?: string;
  icon?: string;
  bg?: string;
}) {
  return (
    <div
      className={
        "rounded-lg border p-3 md:p-4 flex items-start gap-3 " + bg
      }
    >
      {icon && <span className="text-2xl leading-none">{icon}</span>}
      <div>
        <div className="font-bold text-slate-900">{label}</div>
        {sub && <div className="text-sm text-slate-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1 text-slate-400">
      <span className="text-xl leading-none">▼</span>
      {label && <span className="text-xs mt-1">{label}</span>}
    </div>
  );
}
