import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";

export const metadata = { title: "DB 接続の仕組み | TERASOLUNA 研修" };

export default function DbConnectionPage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 lg:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              DB Connection Deep Dive
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              DB 接続の仕組み
              <br className="md:hidden" />
              <span className="text-lg md:text-2xl text-slate-600 font-semibold">
                {" "}(TERASOLUNA multi-project)
              </span>
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              研修中に「DB に接続できない」で一番詰まる部分を、
              <strong>4 つのファイル・環境プロファイル・Connection Pool・エラー診断</strong>
              まで細かく解説。読み終えると <code>jdbc.properties</code> がどこで何をしているかがわかります。
            </p>
          </div>

          <PageMeta targetVersion="TERASOLUNA archetype 5.11.0 / Boot 3.4 / MyBatis 3.5.x" />

          {/* Section 1: なぜ難しい */}
          <Section id="why" title="1. なぜ DB 接続は難しく感じるのか">
            <p>
              TERASOLUNA (multi-project) では、DB 接続の設定が
              <strong> 3 つのファイル、複数のモジュール、環境プロファイル別</strong>
              に分散している。「1 箇所に書いてある」ものではないので、初見で迷子になる。
            </p>
            <div className="my-4 bg-rose-50 border border-rose-200 rounded-xl p-5">
              <div className="font-bold text-rose-900 mb-2">
                DB 接続に関わるファイル (最低これだけ)
              </div>
              <ul className="space-y-2 text-sm text-rose-900">
                <li>
                  ① <code>-env/src/main/resources/jdbc.properties</code>
                  <br />
                  <span className="text-xs pl-4 text-rose-700">
                    URL・ユーザ名・パスワード・ドライバクラスの 4 情報を書く
                  </span>
                </li>
                <li>
                  ② <code>-env/src/main/resources/META-INF/spring/&#123;projectName&#125;-env.xml</code>
                  <br />
                  <span className="text-xs pl-4 text-rose-700">
                    ① を読み込んで DataSource Bean を組み立てる
                  </span>
                </li>
                <li>
                  ③ <code>-domain/src/main/resources/META-INF/spring/&#123;projectName&#125;-infra.xml</code>
                  <br />
                  <span className="text-xs pl-4 text-rose-700">
                    DataSource を MyBatis (SqlSessionFactory) に橋渡し
                  </span>
                </li>
                <li>
                  ④ <code>-env/configs/&#123;profile&#125;/resources/jdbc.properties</code>
                  <br />
                  <span className="text-xs pl-4 text-rose-700">
                    test-server / production-server プロファイル用の上書き
                  </span>
                </li>
              </ul>
            </div>
            <Note>
              💡 Spring Boot 単一プロジェクト (このリファレンス) では
              <code>application.properties</code> 1 ファイルで済む。
              TERASOLUNA が難しく見える理由の大部分は、<strong>ファイルが複数モジュールに分散していること</strong>から来る。
            </Note>
          </Section>

          {/* Section 2: 4情報 */}
          <Section id="four-info" title="2. DB 接続に必要な「4 つの情報」">
            <p>
              どの環境・どのフレームワークでも、DB 接続に必要なのは以下の 4 つだけ:
            </p>
            <Table
              head={["情報", "何を指す", "H2 (dev) の例", "PostgreSQL (prod) の例"]}
              rows={[
                ["URL", "どこの DB か", "jdbc:h2:mem:rolemgr;MODE=PostgreSQL", "jdbc:postgresql://localhost:5432/rolemgr"],
                ["Username", "ログイン ID", "sa", "app_user"],
                ["Password", "ログインパスワード", "(空)", "secret123"],
                ["Driver class", "接続に使う Java クラス", "org.h2.Driver", "org.postgresql.Driver"],
              ]}
            />
            <p className="mt-4">
              この 4 情報が、TERASOLUNA では <code>jdbc.properties</code> にプロパティとして書かれる:
            </p>
            <CodeExample lang="properties" code={`# -env/src/main/resources/jdbc.properties
database=POSTGRESQL
database.url=jdbc:postgresql://localhost:5432/rolemgr
database.username=app_user
database.password=secret123
database.driverClassName=org.postgresql.Driver`} />
          </Section>

          {/* Section 3: JDBC URL */}
          <Section id="jdbc-url" title="3. JDBC URL の解剖">
            <p>
              URL は「どの DB サーバの、どの database か」を書いた住所文字列。パーツごとに分解して覚える:
            </p>

            {/* URL 分解: 色分けチップで各パーツを可視化 (レスポンシブ, wrap) */}
            <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-2 font-mono">例: PostgreSQL の JDBC URL</div>
              <div className="flex flex-wrap items-baseline gap-y-3 font-mono text-sm md:text-base">
                <UrlPart color="rose" label="プレフィックス">jdbc:</UrlPart>
                <UrlPart color="amber" label="ベンダー">postgresql</UrlPart>
                <UrlPart color="cyan" label="ホスト">://localhost</UrlPart>
                <UrlPart color="violet" label="ポート">:5432</UrlPart>
                <UrlPart color="emerald" label="DB 名">/rolemgr</UrlPart>
                <UrlPart color="slate" label="追加オプション (省略可)">?ssl=false</UrlPart>
              </div>
            </div>

            <Table
              head={["パーツ", "意味", "例"]}
              rows={[
                ["jdbc:", "プロトコル (必ずこれ)", "jdbc:"],
                ["postgresql / h2 / mysql / oracle", "DB ベンダー", "postgresql"],
                ["//localhost", "サーバのホスト名 or IP", "//localhost, //10.0.0.5"],
                [":5432", "サーバのポート番号", ":5432 (PostgreSQL), :3306 (MySQL)"],
                ["/rolemgr", "database 名 (どの DB か)", "/rolemgr"],
                ["?key=value&...", "追加オプション", "?ssl=false&currentSchema=public"],
              ]}
            />
            <div className="my-4 grid md:grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="font-bold text-emerald-900 text-sm mb-2">H2 (in-memory) の URL</div>
                <code className="text-xs text-emerald-800 block font-mono break-all">
                  jdbc:h2:mem:rolemgr;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
                </code>
                <div className="text-xs text-emerald-800 mt-2">
                  <code>mem:</code> = メモリ内 DB、<br />
                  <code>DB_CLOSE_DELAY=-1</code> = プロセス終了までDBを維持、<br />
                  <code>MODE=PostgreSQL</code> = PostgreSQL 方言で動く
                </div>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="font-bold text-cyan-900 text-sm mb-2">PostgreSQL (実 DB) の URL</div>
                <code className="text-xs text-cyan-800 block font-mono break-all">
                  jdbc:postgresql://db.example.com:5432/rolemgr
                </code>
                <div className="text-xs text-cyan-800 mt-2">
                  ネットワーク越しに <code>db.example.com</code> のポート <code>5432</code> にある <code>rolemgr</code> DB に接続
                </div>
              </div>
            </div>
          </Section>

          {/* Section 4: TERASOLUNA config layout */}
          <Section id="layout" title="4. TERASOLUNA での設定ファイル配置">
            <p>
              マルチプロジェクトなので、DB 関連の設定は<strong>複数モジュールに散らばる</strong>。
              下の図は、リクエストが DB に届くまでに<strong>Spring がどのファイルをどう読むか</strong>の流れ:
            </p>
            <div className="my-4 bg-white border border-slate-200 rounded-xl p-4 md:p-5">
              <div className="text-sm font-bold text-slate-800 mb-3">起動から DB 接続確立までの流れ</div>
              <ol className="space-y-3">
                <ChainStep n={1} title="Spring 起動">
                  Spring コンテナが初期化を開始
                </ChainStep>
                <ChainStep n={2} title="jdbc.properties を読み込む" file="-env/src/main/resources/jdbc.properties">
                  4 情報 (URL / username / password / driverClassName) を平文プロパティで置く
                </ChainStep>
                <ChainStep n={3} title="DataSource Bean を組み立てる" file="-env/META-INF/spring/{projectName}-env.xml">
                  <code>&lt;bean id=&quot;dataSource&quot; class=&quot;BasicDataSource&quot;&gt;</code> が上のプロパティを埋め込んで生成される
                </ChainStep>
                <ChainStep n={4} title="MyBatis に DataSource を渡す" file="-domain/META-INF/spring/{projectName}-infra.xml">
                  <code>&lt;bean id=&quot;sqlSessionFactory&quot;&gt;</code> が dataSource を参照 → Mapper が使える状態に
                </ChainStep>
                <ChainStep n={5} title="実際の DB (PostgreSQL / H2) に接続完了">
                  Mapper interface + XML の SQL が実行可能に
                </ChainStep>
              </ol>
            </div>
            <Table
              head={["#", "ファイル (どのモジュール)", "何を書く"]}
              rows={[
                ["①", "-env: jdbc.properties", "URL / ユーザ名 / パスワード / driver の 4 情報 (プロパティ形式)"],
                ["②", "-env: META-INF/spring/{name}-env.xml", "①のプロパティを読み込んで DataSource Bean を作る"],
                ["③", "-domain: META-INF/spring/{name}-infra.xml", "DataSource → SqlSessionFactory へ橋渡し、Mapper スキャン設定"],
                ["④", "-domain: META-INF/mybatis/mybatis-config.xml", "MyBatis 全体設定 (SQL キャッシュ、型エイリアスなど)"],
              ]}
            />
          </Section>

          {/* Section 5: Concrete XML examples */}
          <Section id="xml-examples" title="5. 実物の XML 設定を読む">
            <H3>5-1. jdbc.properties (プロパティ形式)</H3>
            <CodeExample lang="properties" code={`# -env/src/main/resources/jdbc.properties
database=POSTGRESQL
database.url=jdbc:postgresql://localhost:5432/rolemgr
database.username=app_user
database.password=secret123
database.driverClassName=org.postgresql.Driver

# コネクションプールのサイズ
cp.maxActive=96
cp.maxIdle=16
cp.minIdle=0
cp.maxWait=60000`} />

            <H3>5-2. -env.xml (DataSource Bean)</H3>
            <CodeExample lang="xml" code={`<!-- -env/src/main/resources/META-INF/spring/rolemgr-env.xml -->
<beans xmlns="http://www.springframework.org/schema/beans">

  <!-- プロパティを読み込む -->
  <context:property-placeholder
      location="classpath:/jdbc.properties" />

  <!-- コネクションプール (DBCP2) を DataSource として登録 -->
  <bean id="dataSource"
        class="org.apache.commons.dbcp2.BasicDataSource"
        destroy-method="close">
    <property name="driverClassName" value="\${database.driverClassName}"/>
    <property name="url"             value="\${database.url}"/>
    <property name="username"        value="\${database.username}"/>
    <property name="password"        value="\${database.password}"/>
    <property name="maxTotal"        value="\${cp.maxActive}"/>
    <property name="maxIdle"         value="\${cp.maxIdle}"/>
    <property name="minIdle"         value="\${cp.minIdle}"/>
    <property name="maxWaitMillis"   value="\${cp.maxWait}"/>
  </bean>

  <!-- トランザクションマネージャ -->
  <bean id="transactionManager"
        class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <property name="dataSource" ref="dataSource"/>
  </bean>

</beans>`} />

            <H3>5-3. -infra.xml (MyBatis 接続)</H3>
            <CodeExample lang="xml" code={`<!-- -domain/src/main/resources/META-INF/spring/rolemgr-infra.xml -->
<beans>

  <!-- ↑ で作った dataSource を使って SqlSessionFactory を作る -->
  <bean id="sqlSessionFactory"
        class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="dataSource"/>
    <property name="configLocation"
              value="classpath:/META-INF/mybatis/mybatis-config.xml"/>
    <property name="mapperLocations">
      <list>
        <value>classpath*:/com/example/rolemgr/domain/repository/**/*.xml</value>
      </list>
    </property>
  </bean>

  <!-- Mapper interface を自動スキャンして Bean 登録 -->
  <mybatis:scan
      base-package="com.example.rolemgr.domain.repository"/>

</beans>`} />
            <Note>
              💡 上の 3 ファイルが<strong>連鎖して</strong>DB 接続を成立させる。1 個でも書き漏れがあると接続できない。
            </Note>
          </Section>

          {/* Section 6: Connection Pool */}
          <Section id="pool" title="6. Connection Pool (コネクションプール) とは">
            <p>
              DB 接続は<strong>作るのに時間がかかる</strong> (TCP 接続 + 認証 + セッション初期化で数百 ms)。
              毎リクエストで作り直したら遅すぎる。だから起動時に<strong>複数の接続をあらかじめ用意しておく</strong>。これが Connection Pool。
            </p>
            <div className="my-4 bg-white border border-slate-200 rounded-xl p-4 md:p-5">
              <div className="text-sm font-bold text-slate-800 mb-3">Connection Pool の動きイメージ</div>
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-2 font-mono">起動時にあらかじめ N 個の接続を作っておく:</div>
                <div className="flex flex-wrap gap-1.5">
                  {["C1","C2","C3","C4","C5","C6","C7","C8"].map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1.5 bg-cyan-100 border border-cyan-400 text-cyan-900 rounded font-mono text-xs font-bold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="font-bold text-emerald-900 mb-1">✓ 空きがあるとき</div>
                  各リクエストがプールから 1 個借りて、処理が終わったら返す (作成コスト回避)
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="font-bold text-amber-900 mb-1">⏳ 空きが無いとき</div>
                  <code>maxWait</code> ms 以内で空くのを待つ。それでも取れなければタイムアウトエラー
                </div>
              </div>
            </div>
            <Table
              head={["プロパティ", "意味", "研修値", "本番値"]}
              rows={[
                ["maxTotal (maxActive)", "同時に開ける接続の最大数", "96", "同時ユーザ数 × 1.5 くらい"],
                ["maxIdle", "空きで保っておく最大数", "16", "maxTotal の 1/4 程度"],
                ["minIdle", "空きで保っておく最小数", "0", "起動時遅延を避けたいなら > 0"],
                ["maxWaitMillis (maxWait)", "空きが無い時に待つ最大 ms", "60000 (60秒)", "業務要件に合わせ短めに"],
              ]}
            />
            <Note>
              💡 「接続できない」エラーで多いのは、実は<strong>プールが枯渇して待たされてタイムアウト</strong>のパターン。maxTotal を増やすか、リクエストで長時間セッションを掴んでる箇所を疑う。
            </Note>
          </Section>

          {/* Section 7: profiles */}
          <Section id="profiles" title="7. 環境プロファイル (local / test-server / production-server)">
            <p>
              「開発中はローカル H2、テストサーバは共有 PostgreSQL、本番は本番 DB」のように、
              <strong>環境ごとに違う jdbc.properties を使いたい</strong>。
              TERASOLUNA archetype には Maven プロファイルが 3 種類標準で入っている:
            </p>
            <Table
              head={["プロファイル", "ビルドコマンド", "どのファイルが war に入る"]}
              rows={[
                ["local (デフォルト)", "mvn install", "-env/src/main/resources/ (jdbc.properties は H2 想定)"],
                ["test-server", "mvn install -P test-server", "-env/configs/test-server/resources/ で上書き"],
                ["production-server", "mvn install -P production-server", "-env/configs/production-server/resources/ で上書き"],
              ]}
            />
            <AsciiBox>
{`-env/
├── src/main/resources/
│   ├── jdbc.properties            ← local 用 (H2 in-memory 等)
│   ├── logback.xml
│   └── META-INF/spring/*.xml
└── configs/
    ├── test-server/resources/
    │   ├── jdbc.properties        ← test-server プロファイル時、こちらで上書き
    │   └── logback.xml
    └── production-server/resources/
        ├── jdbc.properties        ← production 用 (本番 PostgreSQL URL)
        └── logback.xml`}
            </AsciiBox>
            <Note>
              💡 <strong>同じ war を環境ごとに使い回さない</strong>のが TERASOLUNA の思想。
              各環境ごとにビルドし直して、その環境専用の war を作る。
            </Note>
          </Section>

          {/* Section 8: switching */}
          <Section id="switching" title="8. H2 → PostgreSQL に切り替える 3 手順">
            <ol className="list-decimal pl-6 space-y-3 text-sm md:text-base">
              <li>
                <strong>pom.xml に PostgreSQL の JDBC ドライバを追加</strong>
                <CodeExample lang="xml" code={`<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.4</version>
</dependency>`} />
              </li>
              <li>
                <strong><code>jdbc.properties</code> を PostgreSQL 用に書き換え</strong>
                <CodeExample lang="properties" code={`# Before (H2)
database.url=jdbc:h2:mem:rolemgr
database.driverClassName=org.h2.Driver

# After (PostgreSQL)
database.url=jdbc:postgresql://localhost:5432/rolemgr
database.username=app_user
database.password=secret
database.driverClassName=org.postgresql.Driver`} />
              </li>
              <li>
                <strong>DDL (schema.sql) を PostgreSQL 方言に合わせる</strong>
                <p className="text-sm text-slate-700 mt-2">
                  H2 の <code>MODE=PostgreSQL</code> で書いてあれば大抵そのまま通る。
                  ただし <code>IDENTITY</code> 型や <code>SERIAL</code>、大文字小文字の扱いは要注意。
                </p>
              </li>
            </ol>
          </Section>

          {/* Section 9: errors */}
          <Section id="errors" title="9. よくあるエラー診断">
            <p>「DB に接続できない」時、以下の順で原因を絞る:</p>
            <div className="space-y-4">
              <ErrorCase
                error="Cannot get JDBC Connection"
                cause="jdbc.url が違う / DB サーバが動いてない / ポート違い"
                fix={[
                  "PostgreSQL: psql -h localhost -U app_user -d rolemgr で繋がるか確認",
                  "サーバのプロセスが動いてるか (Windows のサービス、pg_ctl status)",
                  "URL のポート番号 (5432) が正しいか"
                ]}
              />
              <ErrorCase
                error="FATAL: password authentication failed"
                cause="username / password が違う、または pg_hba.conf の認証方式ミスマッチ"
                fix={[
                  "jdbc.properties の username / password を確認",
                  "本当にその user で psql ログインできるかコマンドラインで確認",
                  "PostgreSQL の pg_hba.conf を確認 (trust / md5 / scram-sha-256)"
                ]}
              />
              <ErrorCase
                error="database does not exist"
                cause="URL の DB 名がサーバ側に無い"
                fix={[
                  "psql で \\l を叩いて DB 一覧を確認",
                  "無ければ CREATE DATABASE rolemgr; を実行"
                ]}
              />
              <ErrorCase
                error="Invalid bound statement (not found)"
                cause="MyBatis Mapper interface と XML の紐付けミス"
                fix={[
                  "XML の namespace = Java interface の完全修飾名 が一致するか",
                  "<select id='X'> の X とメソッド名が一致するか",
                  "XML の場所が mapperLocations に含まれているか"
                ]}
              />
              <ErrorCase
                error="Communications link failure / Connection refused"
                cause="ネットワーク or サーバダウン"
                fix={[
                  "ping で DB サーバに届くか",
                  "telnet host 5432 でポート開いてるか",
                  "本番なら DBA に確認"
                ]}
              />
              <ErrorCase
                error="Pool exhausted (プール枯渇)"
                cause="コネクションプールが空 = 全接続が使用中"
                fix={[
                  "maxTotal を増やす",
                  "同時アクセスが本当にそんなに多いか調査",
                  "コネクションを掴んだまま長時間処理してる箇所を疑う (@Transactional が過大なメソッドに付いてないか)"
                ]}
              />
            </div>
          </Section>

          {/* Section 10: checklist */}
          <Section id="checklist" title="10. 動かない時のチェックリスト (この順で見る)">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ol className="list-decimal pl-6 space-y-2 text-sm md:text-base text-slate-700">
                <li>
                  <strong>DB サーバが動いているか</strong>
                  <code className="ml-2 text-xs bg-slate-100 px-1.5 py-0.5 rounded">psql -h ... -U ...</code>
                </li>
                <li>
                  <strong>jdbc.properties の 4 情報が正しいか</strong>
                  (URL / username / password / driverClassName)
                </li>
                <li>
                  <strong>pom.xml に該当 driver 依存があるか</strong>
                  (H2 なら com.h2database、PostgreSQL なら org.postgresql)
                </li>
                <li>
                  <strong>プロファイル指定が正しいか</strong>
                  (<code>mvn install -P production-server</code> のように build 時に <code>-P</code> を付けたか)
                </li>
                <li>
                  <strong>-env.xml の property-placeholder が jdbc.properties を指してるか</strong>
                  (パスミスがないか)
                </li>
                <li>
                  <strong>-infra.xml で dataSource を参照してるか</strong>
                  (<code>ref="dataSource"</code>)
                </li>
                <li>
                  <strong>Mapper interface パッケージが mybatis:scan に含まれるか</strong>
                </li>
                <li>
                  <strong>Mapper XML の namespace = interface 完全修飾名が一致するか</strong>
                </li>
                <li>
                  <strong>ログを見る</strong>: 起動時 Spring は「Loaded JDBC driver: ...」等を出す。ここで詰まってるなら driver 問題
                </li>
              </ol>
            </div>
          </Section>

          {/* Related */}
          <section className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              関連
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/terasoluna-multi-project"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm"
              >
                <div aria-hidden="true" className="text-2xl">🧱</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Related
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  TERASOLUNA マルチプロジェクト構造
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  -env / -domain / -web モジュールの全体像
                </div>
              </Link>
              <Link
                href="/glossary#cat-mybatis"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm"
              >
                <div aria-hidden="true" className="text-2xl">📖</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Ref
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  用語集 — MyBatis
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Mapper / SqlSessionFactory / @Transactional など
                </div>
              </Link>
            </div>
          </section>

          <PageFooter pageTitle="DB 接続の仕組み" slug="db-connection" />
        </main>
      </div>
    </div>
  );
}

/* ==================== helpers ==================== */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900 pb-2 border-b-2 border-brand">
        {title}
      </h2>
      <div className="space-y-3 text-slate-800 text-sm md:text-base leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base md:text-lg font-bold text-slate-900 mt-6 mb-2">
      {children}
    </h3>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-xs md:text-sm border border-slate-200 border-collapse">
        <thead>
          <tr className="bg-slate-100">
            {head.map((h, i) => (
              <th
                key={i}
                className="border border-slate-300 px-2 md:px-3 py-2 text-left font-semibold text-slate-800"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border border-slate-200 px-2 md:px-3 py-2 align-top text-slate-700 font-mono text-xs md:text-sm"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AsciiBox({ children }: { children: React.ReactNode }) {
  return (
    <pre className="my-3 bg-slate-900 text-slate-100 rounded-lg p-3 md:p-4 text-xs md:text-sm overflow-x-auto leading-relaxed">
      {children}
    </pre>
  );
}

function CodeExample({ lang, code }: { lang: string; code: string }) {
  return (
    <pre className="my-3 bg-slate-900 text-slate-100 rounded-lg p-3 md:p-4 text-xs md:text-sm overflow-x-auto leading-relaxed">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 text-xs md:text-sm text-amber-900">
      {children}
    </div>
  );
}

const URL_PART_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  rose:    { bg: "bg-rose-100",    text: "text-rose-900",    label: "text-rose-700" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-900",   label: "text-amber-700" },
  cyan:    { bg: "bg-cyan-100",    text: "text-cyan-900",    label: "text-cyan-700" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-900",  label: "text-violet-700" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-900", label: "text-emerald-700" },
  slate:   { bg: "bg-slate-100",   text: "text-slate-900",   label: "text-slate-600" },
};

function ChainStep({
  n,
  title,
  file,
  children,
}: {
  n: number;
  title: string;
  file?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 items-start">
      <span className="shrink-0 w-8 h-8 rounded-full bg-brand text-white font-bold flex items-center justify-center text-sm">
        {n}
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="font-semibold text-slate-900 text-sm md:text-base">{title}</div>
        {file && (
          <div className="mt-0.5 text-xs font-mono text-slate-500 break-all">{file}</div>
        )}
        <div className="mt-1 text-xs md:text-sm text-slate-700 leading-relaxed">
          {children}
        </div>
      </div>
    </li>
  );
}

function UrlPart({
  color,
  label,
  children,
}: {
  color: keyof typeof URL_PART_STYLES;
  label: string;
  children: React.ReactNode;
}) {
  const s = URL_PART_STYLES[color];
  return (
    <span className="inline-flex flex-col items-start">
      <span className={`text-[10px] ${s.label} font-semibold uppercase tracking-wider`}>
        {label}
      </span>
      <span className={`${s.bg} ${s.text} px-1.5 py-0.5 rounded font-bold`}>
        {children}
      </span>
    </span>
  );
}

function ErrorCase({
  error,
  cause,
  fix,
}: {
  error: string;
  cause: string;
  fix: string[];
}) {
  return (
    <div className="bg-white border border-rose-200 rounded-xl p-4 md:p-5">
      <div className="font-mono text-xs md:text-sm text-rose-800 font-semibold mb-2">
        ❌ {error}
      </div>
      <div className="text-sm text-slate-700 mb-2">
        <strong>原因:</strong> {cause}
      </div>
      <div className="text-sm text-slate-700">
        <strong>確認:</strong>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          {fix.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
