import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";
import { TARGET_LABEL, VERSIONS } from "@/lib/versions";

export const metadata = { title: "Spring Boot vs TERASOLUNA" };

type Comparison = {
  n: number;
  title: string;
  spring: { label: string; code: string; lang?: string };
  tera: { label: string; code: string; lang?: string };
  note?: string;
};

const COMPARISONS: Comparison[] = [
  {
    n: 1,
    title: "アプリのエントリポイント",
    spring: {
      label: "RolemgrApplication.java",
      lang: "java",
      code: `@SpringBootApplication
public class RolemgrApplication {
    public static void main(String[] args) {
        SpringApplication.run(RolemgrApplication.class, args);
    }
}`,
    },
    tera: {
      label: "web.xml (+ ContextLoaderListener)",
      lang: "xml",
      code: `<listener>
  <listener-class>
    org.springframework.web.context.ContextLoaderListener
  </listener-class>
</listener>
<context-param>
  <param-name>contextConfigLocation</param-name>
  <param-value>classpath:META-INF/spring/applicationContext.xml</param-value>
</context-param>
<servlet>
  <servlet-name>rolemgr</servlet-name>
  <servlet-class>
    org.springframework.web.servlet.DispatcherServlet
  </servlet-class>
</servlet>`,
    },
    note: "Spring Boot は Java コード 1 個で完結。TERASOLUNA は web.xml + XML 設定を組む",
  },
  {
    n: 2,
    title: "コンポーネントスキャン",
    spring: {
      label: "application 起動時に自動",
      lang: "java",
      code: `// @SpringBootApplication に @ComponentScan が含まれている。
// 別途書く必要なし。`,
    },
    tera: {
      label: "spring-mvc.xml",
      lang: "xml",
      code: `<context:component-scan
    base-package="com.example.rolemgr" />`,
    },
    note: "スキャン対象の package を明示するか、Boot に任せるか",
  },
  {
    n: 3,
    title: "データソース (DB 接続)",
    spring: {
      label: "application.properties",
      lang: "properties",
      code: `spring.datasource.url=jdbc:postgresql://localhost:5432/rolemgr
spring.datasource.username=sa
spring.datasource.password=`,
    },
    tera: {
      label: "applicationContext-jdbc.xml",
      lang: "xml",
      code: `<bean id="dataSource"
      class="org.apache.commons.dbcp2.BasicDataSource">
  <property name="driverClassName"
            value="org.postgresql.Driver" />
  <property name="url"
            value="jdbc:postgresql://localhost:5432/rolemgr" />
  <property name="username" value="sa" />
  <property name="password" value="" />
</bean>`,
    },
  },
  {
    n: 4,
    title: "Spring Security 設定",
    spring: {
      label: "SecurityConfig.java (Java Config)",
      lang: "java",
      code: `@Configuration
public class SecurityConfig {
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http)
      throws Exception {
    http.authorizeHttpRequests(auth -> auth
        .requestMatchers("/login").permitAll()
        .anyRequest().authenticated())
      .formLogin(form -> form.loginPage("/login"));
    return http.build();
  }
}`,
    },
    tera: {
      label: "spring-security.xml",
      lang: "xml",
      code: `<sec:http>
  <sec:intercept-url pattern="/login"
                     access="permitAll" />
  <sec:intercept-url pattern="/**"
                     access="isAuthenticated()" />
  <sec:form-login login-page="/login" />
  <sec:logout logout-url="/logout" />
</sec:http>
<sec:authentication-manager>
  <sec:authentication-provider
      user-service-ref="customUserDetailsService" />
</sec:authentication-manager>`,
    },
    note: "認可ルール・ログインフォームの書き方は思想が同じ、シンタックスだけ違う",
  },
  {
    n: 5,
    title: "MyBatis Mapper 登録",
    spring: {
      label: "application.properties",
      lang: "properties",
      code: `mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.configuration.map-underscore-to-camel-case=true`,
    },
    tera: {
      label: "applicationContext-mybatis.xml",
      lang: "xml",
      code: `<bean id="sqlSessionFactory"
      class="org.mybatis.spring.SqlSessionFactoryBean">
  <property name="dataSource" ref="dataSource" />
  <property name="mapperLocations"
            value="classpath:mapper/*.xml" />
  <property name="configuration">
    <bean class="org.apache.ibatis.session.Configuration">
      <property name="mapUnderscoreToCamelCase"
                value="true" />
    </bean>
  </property>
</bean>
<mybatis:scan base-package="com.example.rolemgr.repository" />`,
    },
    note: "Mapper XML の中身 (SQL) はそのままコピーできる (差分はほぼ設定側のみ)",
  },
  {
    n: 6,
    title: "View (JSP) の解決",
    spring: {
      label: "application.properties",
      lang: "properties",
      code: `spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp`,
    },
    tera: {
      label: "spring-mvc.xml",
      lang: "xml",
      code: `<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
  <property name="prefix" value="/WEB-INF/views/" />
  <property name="suffix" value=".jsp" />
</bean>`,
    },
    note: "Controller から返す View 名 (\"login\" 等) → JSP のパス解決。プロパティで書くか XML で書くか",
  },
  {
    n: 7,
    title: "起動 / デプロイ",
    spring: {
      label: "PowerShell / bash から",
      lang: "bash",
      code: `mvn spring-boot:run
# → 埋め込み Tomcat が起動、http://localhost:8080 で即動く
# war も jar もビルド可能`,
    },
    tera: {
      label: "Tomcat に war を配置",
      lang: "bash",
      code: `mvn clean package
# → target/rolemgr.war ができる

# それを Tomcat の webapps/ にコピー
cp target/rolemgr.war $CATALINA_HOME/webapps/

# Tomcat を起動
$CATALINA_HOME/bin/startup.sh`,
    },
    note: "Boot は「アプリの中に Tomcat」、TERASOLUNA は「外部の Tomcat にアプリを載せる」",
  },
  {
    n: 8,
    title: "初期プロジェクト生成",
    spring: {
      label: "Spring Initializr",
      lang: "bash",
      code: `# https://start.spring.io で GUI 生成
# または CLI
spring init --dependencies=web,security,mybatis rolemgr`,
    },
    tera: {
      label: "Maven multi-project archetype",
      lang: "bash",
      code: `mvn archetype:generate -B \\
  -DarchetypeGroupId=org.terasoluna.gfw.blank \\
  -DarchetypeArtifactId=terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype \\
  -DarchetypeVersion=5.11.0.RELEASE \\
  -DgroupId=com.example.rolemgr \\
  -DartifactId=rolemgr \\
  -Dversion=1.0.0-SNAPSHOT

# → 5 モジュール構成 (-web / -domain / -env / -initdb / -selenium)
#    認証・Validation・共通エラーページ・env プロファイル入り`,
    },
    note: "研修で使うのは multi-web-blank-xmlconfig-jsp-mybatis3-archetype 5.11.0.RELEASE (公式)。詳細は /terasoluna-multi-project を参照",
  },
];

const SAME_TABLE = [
  { concept: "Controller", both: "@Controller / @GetMapping / @PostMapping" },
  { concept: "Service", both: "@Service / @Transactional" },
  { concept: "Repository (Mapper)", both: "@Mapper (MyBatis) / XML の SQL" },
  { concept: "DI (依存性注入)", both: "コンストラクタ注入 or @Autowired" },
  { concept: "Model", both: "org.springframework.ui.Model" },
  { concept: "JSP + JSTL", both: "${var} / <c:if> / <c:forEach>" },
  { concept: "Principal", both: "認証済みユーザ情報の取得" },
  { concept: "MyBatis SQL", both: "#{param} / <select> / <update>" },
  { concept: "BCrypt", both: "BCryptPasswordEncoder" },
  { concept: "CSRF 対策", both: "Spring Security 標準機能" },
  { concept: "@RequestParam / @PathVariable", both: "URL パラメータ・パス変数の受け取り" },
  { concept: "redirect: / forward:", both: "View 名接頭辞" },
];

export default function SpringVsTerasolunaPage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main id="main" className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              補助: Boot からの読み替え表
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              Boot から TERASOLUNA への
              <br className="md:hidden" />
              読み替え表 (補助)
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              本教材の主軸は <Link href="/steps/00-modules-map" className="text-brand underline font-semibold">TERASOLUNA multi-project 版 Steps</Link> です。
              このページは、先に <Link href="/steps-boot/00-toc" className="text-brand underline">Spring Boot 補助版</Link> で本質を掴んだ人向けに、
              「同じ機能をそれぞれの流儀でどう書くか」の対応表を提供します。
            </p>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
              ⚠️ このページは<strong>比較・読み替えのための補助資料</strong>です。実プロジェクトの実装手順は <Link href="/steps/00-modules-map" className="underline">Step 00 (5 モジュールの地図)</Link> から順に進めてください。
            </div>
          </div>

          <PageMeta targetVersion={TARGET_LABEL.compare} />

          {/* Callout: multi-project pointer */}
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">🧱</span>
              <div className="flex-1">
                <div className="font-bold text-amber-900 mb-1">
                  実プロジェクトは 5 モジュールの multi-project 構成
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">
                  研修で使う TERASOLUNA archetype は{" "}
                  <code className="text-xs bg-white px-1.5 py-0.5 rounded">
                    terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype 5.11.0.RELEASE
                  </code>
                  。<code>-web</code> / <code>-domain</code> / <code>-env</code> /{" "}
                  <code>-initdb</code> / <code>-selenium</code> の 5 つに物理分割される。
                </p>
                <Link
                  href="/terasoluna-multi-project"
                  className="inline-block mt-3 text-sm bg-amber-900 text-white font-semibold px-3 py-1.5 rounded hover:bg-amber-800"
                >
                  マルチプロジェクト構造の詳細 →
                </Link>
              </div>
            </div>
          </div>

          {/* Section 1: 一言まとめ */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              1. 一言まとめ
            </h2>
            <div className="bg-brand/5 border-l-4 border-brand rounded-r-xl p-5">
              <p className="text-slate-800 text-base md:text-lg leading-relaxed">
                <strong>TERASOLUNA は「Spring + MyBatis + JSP + Bean Validation …」を日本のSIer案件向けにパッケージング・規約・イディオムを固めた「テンプレート集」</strong>
                です。
              </p>
              <p className="mt-3 text-sm md:text-base text-slate-700 leading-relaxed">
                つまり — 本質的な API (Controller / Service / Bean / DI / MyBatis / JSP) は
                <strong>ほぼ同じ</strong>。違いは「設定の書き方」「起動方法」「初期プロジェクトの構造」に集中する
                (バージョンや現場の追加規約により細部の作法は変わることがある)。
              </p>
            </div>
          </section>

          {/* Section 2: 関係図 (HTML カード形式) */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              2. 関係図
            </h2>

            {/* 土台: Spring Framework */}
            <div className="bg-white rounded-xl border-2 border-slate-300 p-5 mb-3">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                共通の土台
              </div>
              <div className="text-lg font-bold text-slate-900">
                🌱 Spring Framework
              </div>
              <div className="text-sm text-slate-600 mt-1">
                DI コンテナ / AOP / トランザクション管理 …の中核。
                共通なのは<strong>「Spring Framework という基盤」であってバージョンではない</strong>
                (TERASOLUNA {VERSIONS.terasolunaGfw} 系は Spring Framework {VERSIONS.springFramework}、
                Boot {VERSIONS.bootMainVersion} 系は Spring Framework {VERSIONS.bootMainSpringFramework} 系 — メジャーバージョンが異なる)
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                  <div className="font-semibold text-slate-800">Spring MVC</div>
                  <div className="text-xs text-slate-600 mt-0.5">リクエスト処理 (Controller)</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                  <div className="font-semibold text-slate-800">Spring Security</div>
                  <div className="text-xs text-slate-600 mt-0.5">認証・認可</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                  <div className="font-semibold text-slate-800">Spring Data</div>
                  <div className="text-xs text-slate-600 mt-0.5">DB アクセス抽象</div>
                </div>
              </div>
            </div>

            {/* 中間の説明 */}
            <div className="text-center text-sm text-slate-500 my-3">
              ↓ この上に「目的別のラッパー」が 2 つある ↓
            </div>

            {/* 2 つのラッパー */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="bg-white rounded-xl border-2 border-emerald-300 p-5">
                <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-1">
                  ラッパー ①
                </div>
                <div className="text-lg font-bold text-slate-900">
                  🚀 Spring Boot {VERSIONS.bootMainVersion}
                </div>
                <div className="text-sm text-slate-600 mt-1 mb-3">
                  最小設定で使うラッパー (本教材では<strong>補助版</strong>で採用)
                </div>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-emerald-600 shrink-0">✓</span>
                    <span><code className="text-xs bg-slate-100 px-1 rounded">application.properties</code> で設定</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 shrink-0">✓</span>
                    <span>埋め込み Tomcat が付属</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 shrink-0">✓</span>
                    <span><code className="text-xs bg-slate-100 px-1 rounded">mvn spring-boot:run</code> で起動</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 shrink-0">✓</span>
                    <span>jar or war のどちらでも作れる</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border-2 border-orange-300 p-5">
                <div className="text-xs uppercase tracking-wider text-orange-700 font-semibold mb-1">
                  ラッパー ②
                </div>
                <div className="text-lg font-bold text-slate-900">
                  🧱 TERASOLUNA {VERSIONS.terasolunaGfw}
                </div>
                <div className="text-sm text-slate-600 mt-1 mb-3">
                  日本の SIer 案件向けテンプレート集 (本教材の<strong>主軸</strong>)
                </div>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-orange-600 shrink-0">✓</span>
                    <span>XML 設定ベース</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600 shrink-0">✓</span>
                    <span>標準 archetype 提供</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600 shrink-0">✓</span>
                    <span>Validation / 共通例外ハンドラ組込</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600 shrink-0">✓</span>
                    <span>外部 Tomcat に war をデプロイ</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              💡 どちらも <strong>Spring Framework がベース</strong>。書き方の流儀が違うだけ。
            </div>
          </section>

          {/* Section 3: 同じもの */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              3. 同じもの (Boot でも TERASOLUNA でもコードはそのまま流用できる)
            </h2>
            <p className="text-slate-700 mb-4 text-sm md:text-base leading-relaxed">
              以下は Spring Boot で書いても TERASOLUNA で書いても<strong>基本の書き方はほぼ同じ</strong>。
              このガイドで書いた Controller / Service / Mapper / JSP のコードは、
              パッケージ名・namespace 等を揃えれば TERASOLUNA プロジェクトにそのままコピーして動かせるケースが多い
              (プロジェクト固有の親クラス継承等がある場合はその部分を差し替え)。
            </p>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      概念
                    </th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      両方で同じ書き方
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SAME_TABLE.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 md:px-4 py-3 font-semibold text-slate-900">
                        {row.concept}
                      </td>
                      <td className="px-3 md:px-4 py-3 font-mono text-xs md:text-sm text-slate-700">
                        {row.both}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: 違うもの (side-by-side) */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              4. 違うもの — 実物コードで並べる
            </h2>
            <p className="text-slate-700 mb-6 text-sm md:text-base leading-relaxed">
              以下 {COMPARISONS.length} 箇所が書き方の違い。<strong>やっている事は同じ</strong>ですが、Boot はコード・プロパティで書き、TERASOLUNA は XML で書く傾向があります。
            </p>
            <div className="space-y-8">
              {COMPARISONS.map((cmp) => (
                <div key={cmp.n} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-baseline gap-3">
                      <span className="text-brand font-mono font-bold text-sm">
                        #{String(cmp.n).padStart(2, "0")}
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-slate-900">
                        {cmp.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    {/* Spring Boot column */}
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-0.5 text-xs bg-emerald-100 text-emerald-900 rounded font-semibold">
                          Spring Boot
                        </span>
                        <span className="text-xs text-slate-500 font-mono truncate">
                          {cmp.spring.label}
                        </span>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto leading-relaxed">
                        <code>{cmp.spring.code}</code>
                      </pre>
                    </div>

                    {/* TERASOLUNA column */}
                    <div className="p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-0.5 text-xs bg-orange-100 text-orange-900 rounded font-semibold">
                          TERASOLUNA
                        </span>
                        <span className="text-xs text-slate-500 font-mono truncate">
                          {cmp.tera.label}
                        </span>
                      </div>
                      <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto leading-relaxed">
                        <code>{cmp.tera.code}</code>
                      </pre>
                    </div>
                  </div>

                  {cmp.note && (
                    <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 text-sm text-amber-900">
                      💡 {cmp.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: なぜ TERASOLUNA */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              5. なぜ TERASOLUNA を選ぶ?
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
              <p className="text-slate-700 leading-relaxed mb-4">
                TERASOLUNA が Spring Boot より優れているわけではない。
                <strong>日本のSIer現場での用途に最適化</strong>されている、というのが正確な言い方。
              </p>
              <ul className="space-y-3 text-sm md:text-base text-slate-700">
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">▪</span>
                  <span><strong>XML 設定を好む文化</strong>: Java コンパイル無しに設定変更・レビューできる。金融や行政系で好まれる</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">▪</span>
                  <span><strong>標準化された規約</strong>: 全プロジェクトで同じ書き方 → チーム移動しても即戦力</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">▪</span>
                  <span><strong>業務ロジックのパターン込み</strong>: 共通例外ハンドラ / 動的 SQL / 帳票 / ロギング 等が archetype に組み込み済み</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">▪</span>
                  <span><strong>NTT データの実運用ノウハウ</strong>: バージョンの組み合わせが実案件で検証済み</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold shrink-0">▪</span>
                  <span><strong>公式ドキュメントが日本語</strong>: 英語ドキュメントを訳す手間がない</span>
                </li>
              </ul>
              <div className="mt-5 pt-4 border-t border-slate-200 text-sm text-slate-600">
                逆に <strong>Spring Boot</strong> が向いているのは: 新規スタートアップ、クラウドネイティブ、小規模チーム、マイクロサービス、CI/CD で素早く回したい案件など
              </div>
            </div>
          </section>

          {/* Section 6: 対応表 */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              6. このリファレンス (Boot 版) を TERASOLUNA に読み替える
            </h2>
            <p className="text-slate-700 mb-4 text-sm md:text-base leading-relaxed">
              <strong>Controller / Service / Mapper のロジック自体は 1 行も変えなくて良い</strong>。
              下の対応表を頭に入れておけば、TERASOLUNA archetype で書かれたコードもスムーズに読める。
            </p>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      このリファレンス (Spring Boot)
                    </th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      TERASOLUNA の対応
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["RolemgrApplication.java (@SpringBootApplication)", "web.xml + applicationContext.xml"],
                    ["application.properties", "applicationContext-*.xml (機能別に分割)"],
                    ["SecurityConfig.java (Java Config)", "spring-security.xml"],
                    ["mybatis.mapper-locations プロパティ", "applicationContext-mybatis.xml の SqlSessionFactoryBean"],
                    ["spring.mvc.view.prefix プロパティ", "spring-mvc.xml の InternalResourceViewResolver"],
                    ["mvn spring-boot:run (埋め込み Tomcat)", "war ビルド → Tomcat の webapps/ に配置"],
                    [
                      `Java 17 + Spring Boot ${VERSIONS.bootMainVersion}`,
                      `Java 17 + Spring Boot ${VERSIONS.springBoot} / Framework ${VERSIONS.springFramework} (TERASOLUNA ${VERSIONS.terasolunaGfw}、BOM 管理)`,
                    ],
                    ["Controller / Service / Mapper のコード", "そのままコピーで動くケースが多い"],
                    ["JSP + JSTL + EL 式", "書き方は共通 (Jakarta EE 名前空間の差だけ注意)"],
                    ["MyBatis Mapper XML", "SQL 部分は共通、namespace のみプロジェクトに合わせる"],
                  ].map(([boot, tera], i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 md:px-4 py-3 font-mono text-xs md:text-sm text-slate-800">
                        {boot}
                      </td>
                      <td className="px-3 md:px-4 py-3 font-mono text-xs md:text-sm text-slate-800">
                        {tera}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 7: 一言で捉える */}
          <section className="mb-10">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 md:p-6">
              <h3 className="font-bold text-amber-900 mb-2 text-base md:text-lg">
                💡 1 行で覚えるならこう
              </h3>
              <p className="text-sm md:text-base text-amber-900 leading-relaxed">
                「Spring Boot も TERASOLUNA も、中で動いているのは同じ <strong>Spring Framework</strong>。
                Controller / Service / Mapper の書き方はまったく同じで、違うのは<strong>設定の書き方</strong>だけ。
                Boot はプロパティ 1 行、TERASOLUNA は XML で 5 行、というような違い」
                — この 1 文が頭に入っていると、両者を行き来した時に混乱しません。
              </p>
            </div>
          </section>

          {/* Related links */}
          <section className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              関連
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/architecture"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm transition-all"
              >
                <div aria-hidden="true" className="text-2xl">🏛</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Overview
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  アーキテクチャ全体図
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  どのファイルがどの層かの一覧 (Boot でも TERASOLUNA でも同じ)
                </div>
              </Link>
              <a
                href="http://terasolunaorg.github.io/guideline/current/ja/"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm transition-all"
              >
                <div aria-hidden="true" className="text-2xl">📚</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Official
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  TERASOLUNA 5.x 開発ガイドライン ↗
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  日本語の公式ドキュメント。詳細を確認したい時の一次情報源
                </div>
              </a>
            </div>
          </section>

          <PageFooter pageTitle="Spring Boot vs TERASOLUNA" slug="spring-vs-terasoluna" />
        </main>
      </div>
    </div>
  );
}
