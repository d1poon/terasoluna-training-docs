import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export const metadata = { title: "Spring Boot vs TERASOLUNA | TERASOLUNA 研修" };

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
    note: "Mapper XML の中身 (SQL) は 1 文字も変わらない",
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
      label: "Maven archetype",
      lang: "bash",
      code: `mvn archetype:generate \\
  -DarchetypeGroupId=org.terasoluna.gfw.blank \\
  -DarchetypeArtifactId=terasoluna-gfw-web-blank-jsp-mybatis3 \\
  -DarchetypeVersion=5.7.1.RELEASE

# → 認証・Validation・共通例外ハンドラ入りの
#    完全動作 blank プロジェクトが生成される`,
    },
    note: "TERASOLUNA archetype は日本SIer案件でよく使う構成が全部入り",
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
    <div className="md:flex md:max-w-[80rem] md:mx-auto">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-12 md:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              フレームワーク比較
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              Spring Boot と TERASOLUNA
              <br className="md:hidden" />
              — 何が違って何が同じ?
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              このリファレンス実装は Spring Boot で組んでいますが、会社の研修課題は TERASOLUNA。
              「何が変わって、何が変わらないのか」を実物コードのサイドバイサイドで整理します。
            </p>
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
                <strong>完全に同じ</strong>。違いは「設定の書き方」「起動方法」「初期プロジェクトの構造」だけ。
              </p>
            </div>
          </section>

          {/* Section 2: 関係図 */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              2. 関係図
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 overflow-x-auto">
              <pre className="text-xs md:text-sm font-mono leading-relaxed text-slate-800">
{`┌─────────────────────────────────────────────────┐
│  Spring Framework 6                             │
│  DI コンテナ / AOP / トランザクション …           │
└─┬───────────────────────────────────────────────┘
  │
  ├─── Spring MVC        リクエスト処理 (Controller)
  ├─── Spring Security   認証・認可
  └─── Spring Data       DB アクセス抽象

     ↓ この上に、目的別のラッパーが 2 つある ↓

┌─────────────────────────┐  ┌─────────────────────────┐
│ Spring Boot 3           │  │ TERASOLUNA 5            │
│                         │  │                         │
│ 最小設定で使うラッパー   │  │ SIer案件向け             │
│ + application.properties│  │  テンプレート集         │
│ + 埋め込み Tomcat        │  │ + XML 設定ベース         │
│ + mvn spring-boot:run   │  │ + 標準 archetype 提供   │
│ + jar or war            │  │ + Validation / 共通例外 │
│                         │  │ + 外部 Tomcat に war    │
└─────────────────────────┘  └─────────────────────────┘

どちらも Spring がベース。書き方の流儀が違うだけ。`}
              </pre>
            </div>
          </section>

          {/* Section 3: 同じもの */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">
              3. 同じもの (Boot でも TERASOLUNA でも 1 文字も変わらない)
            </h2>
            <p className="text-slate-700 mb-4 text-sm md:text-base leading-relaxed">
              以下は Spring Boot で書いても TERASOLUNA で書いても<strong>まったく同じ書き方</strong>。
              このガイドで書いた Controller / Service / Mapper / JSP のコードはそのまま TERASOLUNA プロジェクトにコピペしても動く。
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
              下の対応表を頭に入れておけば、後輩が TERASOLUNA archetype で書いてきたコードも読み替えできる。
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
                    ["Java 17 + Spring Boot 3.4", "Java 11 + Spring 5.7 (TERASOLUNA 5.7 系の場合)"],
                    ["Controller / Service / Mapper のコード", "1 文字も変わらない"],
                    ["JSP + JSTL + EL 式", "1 文字も変わらない"],
                    ["MyBatis Mapper XML", "1 文字も変わらない"],
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

          {/* Section 7: 教える時 */}
          <section className="mb-10">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 md:p-6">
              <h3 className="font-bold text-amber-900 mb-2 text-base md:text-lg">
                💡 教える時の一言
              </h3>
              <p className="text-sm md:text-base text-amber-900 leading-relaxed">
                「Spring Boot も TERASOLUNA も、中で動いてるのは同じ <strong>Spring Framework</strong> なんだよ。
                Controller / Service / Mapper の書き方はまったく同じで、違うのは<strong>設定の書き方</strong>だけ。
                Boot はプロパティ 1 行、TERASOLUNA は XML で 5 行、みたいな違い」
                — この 1 発で、後輩の頭に地図ができる。
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
                <div className="text-2xl">🏛</div>
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
                <div className="text-2xl">📚</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Official
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  TERASOLUNA 5.x 開発ガイドライン ↗
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  日本語の公式ドキュメント。後輩に「詳しくはここ」と渡せる
                </div>
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
