import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export const metadata = { title: "TERASOLUNA マルチプロジェクト構造 | TERASOLUNA 研修" };

type ModuleInfo = {
  key: string;
  name: string;
  suffix: string;
  role: string;
  desc: string;
  contents: { path: string; desc: string }[];
  color: string;
};

const MODULES: ModuleInfo[] = [
  {
    key: "web",
    name: "-web モジュール",
    suffix: "projectName-web",
    role: "Presentation 層 (画面まわり)",
    desc: "Controller・JSP・Spring MVC / Security の XML 設定 が全部ここ",
    color: "bg-blue-50 border-blue-200",
    contents: [
      { path: "src/main/java/com/example/myapp/app/", desc: "Controllers (app.<usecase>.XxxxController)" },
      { path: "src/main/webapp/WEB-INF/web.xml", desc: "サーブレット設定 (DispatcherServlet 起動点)" },
      { path: "src/main/webapp/WEB-INF/views/", desc: "JSP (welcome/, common/error/, layout/ など)" },
      { path: "src/main/resources/META-INF/spring/spring-mvc.xml", desc: "Spring MVC の設定 (ViewResolver など)" },
      { path: "src/main/resources/META-INF/spring/spring-security.xml", desc: "認証・認可の設定" },
      { path: "src/main/resources/META-INF/spring/application.properties", desc: "アプリレベルの設定" },
      { path: "src/main/resources/i18n/application-messages.properties", desc: "画面メッセージの i18n" },
      { path: "src/main/resources/ValidationMessages.properties", desc: "バリデーションメッセージ" },
    ],
  },
  {
    key: "domain",
    name: "-domain モジュール",
    suffix: "projectName-domain",
    role: "Business + Data 層 (裏側)",
    desc: "Service・Repository・Entity・MyBatis Mapper が全部ここ",
    color: "bg-emerald-50 border-emerald-200",
    contents: [
      { path: "src/main/java/com/example/myapp/domain/model/", desc: "Entity クラス (User.java など)" },
      { path: "src/main/java/com/example/myapp/domain/repository/<usecase>/", desc: "Repository (Mapper) インターフェース" },
      { path: "src/main/java/com/example/myapp/domain/service/<usecase>/", desc: "Service クラス" },
      { path: "src/main/resources/com/example/myapp/domain/repository/<usecase>/XxxRepository.xml", desc: "MyBatis SQL 本体 (Java と同じパッケージパスで置く)" },
      { path: "src/main/resources/META-INF/mybatis/mybatis-config.xml", desc: "MyBatis 全体設定" },
      { path: "src/main/resources/META-INF/spring/projectName-infra.xml", desc: "MyBatis と Spring の橋渡し" },
    ],
  },
  {
    key: "env",
    name: "-env モジュール",
    suffix: "projectName-env",
    role: "環境依存の設定",
    desc: "本番 / テスト / ローカル でのみ差し替わる設定ファイル",
    color: "bg-purple-50 border-purple-200",
    contents: [
      { path: "src/main/resources/logback.xml", desc: "ロガー設定 (デフォルトは local 用)" },
      { path: "configs/test-server/resources/", desc: "test-server プロファイル用ファイル (logback.xml, jdbc.properties)" },
      { path: "configs/production-server/resources/", desc: "production-server プロファイル用ファイル" },
    ],
  },
  {
    key: "initdb",
    name: "-initdb モジュール",
    suffix: "projectName-initdb",
    role: "DB 初期化スクリプト",
    desc: "起動時に流す DDL / データ投入 SQL",
    color: "bg-amber-50 border-amber-200",
    contents: [
      { path: "src/main/sqls/", desc: "DDL / データ投入 SQL (H2, PostgreSQL 別に置ける)" },
    ],
  },
  {
    key: "selenium",
    name: "-selenium モジュール",
    suffix: "projectName-selenium",
    role: "E2E テスト",
    desc: "Selenium での結合テスト。研修では触らないことが多い",
    color: "bg-slate-50 border-slate-200",
    contents: [
      { path: "src/test/", desc: "Selenium テストコード + WebDriver 設定" },
      { path: "src/test/resources/META-INF/spring/selenium.properties", desc: "Selenium 用プロパティ" },
    ],
  },
];

const FILE_MAPPING = [
  { boot: "RolemgrApplication.java",         tera: "web.xml (DispatcherServlet 起動)",              teraModule: "-web" },
  { boot: "application.properties",          tera: "META-INF/spring/application.properties",         teraModule: "-web" },
  { boot: "SecurityConfig.java",             tera: "META-INF/spring/spring-security.xml",             teraModule: "-web" },
  { boot: "config/DataInitializer.java",     tera: "-initdb モジュールの SQL / -domain の初期化 Bean", teraModule: "-initdb / -domain" },
  { boot: "controller/LoginController.java", tera: "app/login/LoginController.java",                  teraModule: "-web" },
  { boot: "controller/UserInfoController.java", tera: "app/userinfo/UserInfoController.java",        teraModule: "-web" },
  { boot: "controller/SearchController.java",tera: "app/search/SearchController.java",                teraModule: "-web" },
  { boot: "controller/MenuController.java",  tera: "app/menu/MenuController.java",                    teraModule: "-web" },
  { boot: "webapp/WEB-INF/views/login.jsp",  tera: "webapp/WEB-INF/views/login/login.jsp",            teraModule: "-web" },
  { boot: "webapp/WEB-INF/views/menu.jsp",   tera: "webapp/WEB-INF/views/menu/menu.jsp",              teraModule: "-web" },
  { boot: "domain/User.java",                tera: "domain/model/User.java",                          teraModule: "-domain" },
  { boot: "service/UserService.java",        tera: "domain/service/user/UserService.java",            teraModule: "-domain" },
  { boot: "repository/UserMapper.java",      tera: "domain/repository/user/UserRepository.java",      teraModule: "-domain" },
  { boot: "resources/mapper/UserMapper.xml", tera: "resources/com/example/myapp/domain/repository/user/UserRepository.xml", teraModule: "-domain" },
  { boot: "security/CustomUserDetailsService.java", tera: "domain/service/userdetails/UserDetailsServiceImpl.java", teraModule: "-domain" },
  { boot: "resources/schema.sql",            tera: "src/main/sqls/H2-schema.sql (等)",                teraModule: "-initdb" },
  { boot: "(なし、Spring Boot 内蔵)",        tera: "logback.xml + jdbc.properties",                    teraModule: "-env" },
];

export default function TerasolunaMultiProjectPage() {
  const steps = getAllSteps();

  return (
    <div className="md:flex md:max-w-[80rem] md:mx-auto">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-12 md:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              TERASOLUNA 実際の構造
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              マルチプロジェクト構造
              <br className="md:hidden" />
              <span className="text-lg md:text-2xl text-slate-600 font-semibold">
                {" "}(blank-jsp / mybatis3)
              </span>
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              研修で実際に使うのは <a href="https://terasolunaorg.github.io/guideline/current/ja/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">TERASOLUNA GFW 公式ガイドライン</a> の
              <strong> blank-jsp マルチプロジェクト archetype</strong>。
              このリファレンス実装 (Spring Boot 単一プロジェクト) との違いと対応を整理します。
            </p>
          </div>

          {/* Section 1: One-line */}
          <section className="mb-10">
            <div className="bg-brand/5 border-l-4 border-brand rounded-r-xl p-5">
              <p className="text-slate-800 text-base md:text-lg leading-relaxed">
                <strong>TERASOLUNA の実プロジェクトは 5 つの Maven モジュールに物理分割されている</strong>: <code>-web</code> / <code>-domain</code> / <code>-env</code> / <code>-initdb</code> / <code>-selenium</code>。
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-700">
                Controller はどこ? Service はどこ? が最初にわからないと詰まる。
                下のセクションで<strong>「何がどのモジュールに入るか」を全部整理</strong>してあります。
              </p>
            </div>
          </section>

          {/* Section 2: Archetype command */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              1. Maven archetype で生成する
            </h2>
            <p className="text-slate-700 text-sm md:text-base mb-4 leading-relaxed">
              下のコマンド 1 発で、5 モジュール構成の空プロジェクトができる。認証・Validation・エラーページも全部組み込み済み。
            </p>
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 md:p-5 overflow-x-auto text-xs md:text-sm">
              <pre className="font-mono leading-relaxed">
{`mvn archetype:generate -B \\
  -DarchetypeGroupId=org.terasoluna.gfw.blank \\
  -DarchetypeArtifactId=terasoluna-gfw-multi-web-blank-jsp-mybatis3-archetype \\
  -DarchetypeVersion=5.11.0.RELEASE \\
  -DgroupId=com.example.rolemgr \\
  -DartifactId=rolemgr \\
  -Dversion=1.0.0-SNAPSHOT`}
              </pre>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <div className="font-semibold text-slate-900 mb-1">
                  archetype ID の 4 パターン
                </div>
                <ul className="space-y-1 text-slate-700">
                  <li>· <code className="text-xs">...blank-jsp-mybatis3-archetype</code></li>
                  <li>· <code className="text-xs">...blank-jsp-jpa-archetype</code></li>
                  <li>· <code className="text-xs">...blank-thymeleaf-mybatis3-archetype</code></li>
                  <li>· <code className="text-xs">...blank-thymeleaf-jpa-archetype</code></li>
                </ul>
                <p className="mt-2 text-xs text-slate-500">View 系 × ORM 系 の組み合わせ</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <div className="font-semibold text-slate-900 mb-1">研修で使うのはこれ</div>
                <p className="text-slate-700">
                  <strong>jsp × mybatis3</strong> = SIer 現場で最頻。日本 SIer は SQL を明示的に書きたい要件が多いため MyBatis 選択が多数。
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: 5 modules */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              2. 5 モジュールそれぞれの中身
            </h2>
            <div className="space-y-4">
              {MODULES.map((m) => (
                <div
                  key={m.key}
                  className={"rounded-xl border p-5 md:p-6 " + m.color}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <h3 className="text-base md:text-lg font-bold text-slate-900">
                      {m.name}
                    </h3>
                    <code className="text-xs text-slate-600 font-mono">
                      {m.suffix}
                    </code>
                  </div>
                  <div className="text-sm md:text-base font-semibold text-slate-800 mb-1">
                    役割: {m.role}
                  </div>
                  <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                    {m.desc}
                  </p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                      主なファイル
                    </div>
                    <ul className="space-y-1.5 text-xs md:text-sm">
                      {m.contents.map((c, i) => (
                        <li key={i}>
                          <code className="text-slate-800 font-mono block">
                            {c.path}
                          </code>
                          <span className="text-slate-600 block ml-3 mt-0.5">
                            {c.desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Package convention */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              3. パッケージ命名規則 (app / domain)
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
              <p className="text-slate-700 mb-4 text-sm md:text-base leading-relaxed">
                TERASOLUNA は「Web 側 = <code>app.*</code>」「業務 + データ側 = <code>domain.*</code>」で厳密に分ける慣習があります。<strong>この慣習を守れば、Controller と Service が違うモジュールに置かれていても迷わない</strong>。
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-bold text-blue-900 mb-2">
                    -web モジュール側
                  </div>
                  <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto leading-relaxed">
{`com.example.rolemgr.app
├── login/
│   ├── LoginController.java
│   └── LoginForm.java   ← フォームクラス
├── menu/
│   └── MenuController.java
├── search/
│   ├── SearchController.java
│   └── SearchForm.java
└── userinfo/
    ├── UserInfoController.java
    └── UserInfoForm.java`}
                  </pre>
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900 mb-2">
                    -domain モジュール側
                  </div>
                  <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto leading-relaxed">
{`com.example.rolemgr.domain
├── model/
│   └── User.java   ← Entity
├── repository/
│   └── user/
│       ├── UserRepository.java   ← interface
│       └── UserRepository.xml    ← SQL
└── service/
    ├── user/
    │   └── UserService.java
    └── userdetails/
        └── UserDetailsServiceImpl.java
                       ← 認証用`}
                  </pre>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600 border-t border-slate-200 pt-3">
                💡 <strong>Repository の interface と MyBatis の XML は同じパッケージパスで置く</strong>のが規約 (namespace 自動解決のため)。この点だけ Spring Boot 版と違う (Boot は <code>resources/mapper/</code> に集約でも動く)。
              </div>
            </div>
          </section>

          {/* Section 5: Boot -> TERASOLUNA mapping */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              4. このリファレンス (Boot 単一) → TERASOLUNA (multi) 対応表
            </h2>
            <p className="text-slate-700 mb-4 text-sm md:text-base leading-relaxed">
              このガイドで作った 22 ファイルが、TERASOLUNA archetype ならどのモジュールのどこに行くか:
            </p>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      このリファレンス (Boot)
                    </th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      TERASOLUNA での場所
                    </th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      モジュール
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FILE_MAPPING.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 md:px-4 py-2 font-mono text-xs text-slate-800">
                        {row.boot}
                      </td>
                      <td className="px-3 md:px-4 py-2 font-mono text-xs text-slate-800">
                        {row.tera}
                      </td>
                      <td className="px-3 md:px-4 py-2 text-xs">
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {row.teraModule}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Build profiles */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              5. env プロファイル (local / test-server / production-server)
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
              <p className="text-slate-700 mb-4 text-sm md:text-base leading-relaxed">
                TERASOLUNA archetype には Maven プロファイルが 3 つ標準で入っています。ビルド時に <code>-P</code> でどのプロファイルを使うか指定 → 該当ディレクトリの設定ファイル (logback.xml, jdbc.properties …) を war に組み込む。
              </p>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="font-bold text-emerald-900">local</div>
                  <div className="text-xs text-emerald-800 mt-1">
                    開発者ローカル用。デフォルト。H2 in-memory、詳細ログ、ホットリロード等
                  </div>
                  <code className="text-xs text-emerald-700 block mt-2">
                    mvn install
                  </code>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="font-bold text-amber-900">test-server</div>
                  <div className="text-xs text-amber-800 mt-1">
                    テスト環境用。ステージング DB、テスト用ログレベル
                  </div>
                  <code className="text-xs text-amber-700 block mt-2">
                    mvn install -P test-server
                  </code>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <div className="font-bold text-rose-900">production-server</div>
                  <div className="text-xs text-rose-800 mt-1">
                    本番用。本番 DB、INFO ログ、パフォーマンス最適化
                  </div>
                  <code className="text-xs text-rose-700 block mt-2">
                    mvn install -P production-server
                  </code>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600 border-t border-slate-200 pt-3">
                💡 <strong>同じ war ファイルを環境ごとに使い回さない</strong>のが TERASOLUNA の設計思想。プロファイル別にビルドし直すことで、Java コードは 1 バージョンでも環境ごとに専用の war を作る。
              </div>
            </div>
          </section>

          {/* Section 7: How to read a TERASOLUNA project */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              6. 後輩の TERASOLUNA プロジェクトを見せられたら
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
              <p className="text-slate-700 mb-4 text-sm md:text-base leading-relaxed">
                後輩が「動きません」と言って TERASOLUNA プロジェクトを持ってきた時の見方:
              </p>
              <ol className="space-y-3 text-sm md:text-base text-slate-700 list-decimal pl-6">
                <li>
                  <strong>parent の pom.xml</strong> を見て、 5 モジュールが揃っているか確認
                </li>
                <li>
                  問題が<strong>画面表示</strong>なら <code>-web/</code> の
                  <code> app.&lt;usecase&gt;.XxxController</code> と対応する
                  <code> webapp/WEB-INF/views/&lt;usecase&gt;/</code> の JSP を見る
                </li>
                <li>
                  問題が<strong>DB アクセス</strong>なら <code>-domain/</code> の
                  <code> domain.repository.&lt;usecase&gt;.XxxRepository.java</code> と
                  同じパスに置いてある <code>XxxRepository.xml</code> の SQL を見る
                </li>
                <li>
                  問題が<strong>認証</strong>なら <code>-web/src/main/resources/META-INF/spring/spring-security.xml</code>
                </li>
                <li>
                  問題が<strong>DB 接続できない</strong>なら <code>-env/</code> の
                  <code> jdbc.properties</code> と、
                  ビルド時にどのプロファイル (-P) を指定したか
                </li>
                <li>
                  問題が<strong>起動しない</strong>なら <code>-web/</code> の
                  <code> webapp/WEB-INF/web.xml</code> と Spring 設定 XML の読み込み順
                </li>
              </ol>
            </div>
          </section>

          {/* Related */}
          <section className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              関連
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/spring-vs-terasoluna"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm transition-all"
              >
                <div className="text-2xl">⚖️</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Compare
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  Boot vs TERASOLUNA (書き方の違い)
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  設定ファイルの書き方比較 (application.properties vs spring-security.xml など)
                </div>
              </Link>
              <a
                href="https://terasolunaorg.github.io/guideline/current/ja/ImplementationAtEachLayer/BlankProject.html"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm transition-all"
              >
                <div className="text-2xl">📚</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Official
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  ブランクプロジェクトの詳細 (公式) ↗
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  TERASOLUNA 公式ガイドラインの該当セクション
                </div>
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
