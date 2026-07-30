---
title: "空アプリ起動 (Tomcat デプロイ確認 + Spring Security 無効化)"
date: 2026-07-30
tags: [type/learning, type/training, tech/terasoluna, tech/tomcat, tech/spring]
step: 02
---

# Step 02 — 空アプリ起動 (Tomcat デプロイ確認 + Spring Security 無効化)

## このステップのゴール

- Step 01 で生成した 5 モジュールを STS4 経由で Tomcat 11 にデプロイして「白い画面」が出るところまで持っていく
- `web.xml` を編集し、**Spring Security を無効化する** (このトラックの核心)
- `web.xml` / `spring-mvc.xml` の役割を目視で確認する
- H2 in-memory DB が起動時にテーブルを持った状態になる (次 Step 03 の準備)

まだ Controller も画面も無い。**枠だけが動くこと**を確認する段階。

## 事前準備

- [Step 01](/steps-basic/01-project-skeleton) 完了 (`mvn clean install` が全モジュールで SUCCESS、STS への import も完了)

## 追加するファイル (3 つ / 内容確認 + 差し替え)

archetype 生成物は、実は**最初から H2 in-memory で動く設定を含んでいる**。以下で内容を確認したうえで、`web.xml` を編集して Spring Security を無効化する。

### 1. `demo-env/src/main/resources/META-INF/spring/demo-infra.properties` を確認

<div class="file-location">
  <div class="file-location-label">📍 このファイルを確認 (archetype 生成時点で既に H2 設定)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-env/</div>
    <div class="ft-line ft-l2">📁 src/main/resources/META-INF/spring/</div>
    <div class="ft-line ft-l3 ft-file">📄 demo-infra.properties <span class="ft-tag">生成物そのまま</span></div>
  </div>
</div>

archetype はこの時点で既に H2 in-memory 向けの設定を生成している (PostgreSQL 用コメントを H2 に書き換える作業は不要):

```properties
database=H2
database.url=jdbc:h2:mem:demo;DB_CLOSE_DELAY=-1
database.username=sa
database.password=
database.driverClassName=org.h2.Driver

# connection pool
cp.maxActive=96
cp.maxIdle=16
cp.minIdle=0
cp.maxWait=60000
```

#### なぜこう書く

- **`database=H2`** — この値をキーに、後述 (Step 03/04) の `<jdbc:initialize-database>` が読みに行く DDL/データファイル名 (`H2-schema.sql` 等) が決まる
- **`jdbc:h2:mem:demo`** — メモリ上の DB。JVM 停止で消える
- **`DB_CLOSE_DELAY=-1`** — 接続が全部切れても DB を保持 (プールが再接続しても同じ DB を見る)
- **`sa` / 空パスワード** — H2 のデフォルト。開発用のみ、本番は絶対避ける
- **コネクションプールの実装** — ここに書くのは値だけ。実装 (Apache Commons DBCP2 `BasicDataSource`) は `demo-env.xml` 側にある ([[/db-connection|DB 接続の仕組み]] 参照)

### 2. H2 依存を `demo-env/pom.xml` に追加

`demo-env/pom.xml` の `<dependencies>` に H2 を明示追加 (archetype 生成物では PostgreSQL/Oracle がコメントアウト):

```xml
<dependencies>
    <!-- 既存の TERASOLUNA + Spring 依存はそのまま -->

    <!-- H2 in-memory DB (dev only) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

> Version は親 POM (`terasoluna-gfw-parent`) が管理しているので**書かない**。

### 3. `web.xml` を編集して Spring Security を無効化

<div class="file-location">
  <div class="file-location-label">📍 このファイルを編集 (archetype 生成品を書き換え)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/webapp/WEB-INF/</div>
    <div class="ft-line ft-l2 ft-file">📄 web.xml <span class="ft-tag ft-tag--modify">書き換え</span></div>
  </div>
</div>

archetype が生成する `web.xml` は、**最初から Spring Security が有効な状態**になっている。このトラックでは以下の **2 箇所を編集して無効化**する (`spring-security.xml` 自体は削除せず残す — 後で Security 版に進むときに復活させられるようにするため)。

**編集①: `contextConfigLocation` から `spring-security.xml` の行を削除**

生成直後:

```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <!-- Root ApplicationContext -->
    <param-value>
        classpath*:META-INF/spring/applicationContext.xml
        classpath*:META-INF/spring/spring-security.xml
    </param-value>
</context-param>
```

編集後:

```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <!-- Root ApplicationContext -->
    <param-value>
        classpath*:META-INF/spring/applicationContext.xml
    </param-value>
</context-param>
```

**編集②: `springSecurityFilterChain` の filter と filter-mapping を削除**

生成直後、以下の 8 行があるので**丸ごと削除**する:

```xml
<filter>
    <filter-name>springSecurityFilterChain</filter-name>
    <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
</filter>
<filter-mapping>
    <filter-name>springSecurityFilterChain</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

#### なぜこう書く

- **`spring-security.xml` を読み込みから外す (削除ではなく無効化)** — `contextConfigLocation` から参照を外すだけなので、Spring の起動時コンテナには `spring-security.xml` の Bean 定義が一切ロードされなくなる。ファイル自体は `demo-web/src/main/resources/META-INF/spring/spring-security.xml` にそのまま残っており、後で Security 版に進むときは、この 2 箇所を元に戻すだけで復活できる
- **`springSecurityFilterChain` フィルタを削除** — このフィルタが全リクエスト (`/*`) を横取りして認証状態を判定する仕組みそのもの。フィルタごと削除することで、**どの URL も認証なしでアクセスできる状態**になる。`contextConfigLocation` の編集だけだとフィルタは残ったまま `springSecurityFilterChain` という名前の Bean が見つからずエラーになるため、**①と②は必ずセットで行う**
- **他の filter (`MDCClearFilter` / `exceptionLoggingFilter` / `XTrackMDCPutFilter` / `CharacterEncodingFilter`) は削除しない** — Spring Security とは無関係の横断的関心事 (ログ相関 ID の付与、例外ログ、文字コード) を担っている。**特に `CharacterEncodingFilter` を誤って消すと日本語の文字化けが起きる**ので、web.xml を編集するときは springSecurityFilterChain 以外の filter に触れないよう注意する

### 4. `demo-web/src/main/webapp/WEB-INF/web.xml` のそれ以外の部分はそのまま OK

上記 2 箇所以外は archetype 生成品のまま変更不要:

- `ContextLoaderListener` → `applicationContext.xml` を読み、`-domain` 側の設定 (`demo-domain.xml` / `demo-infra.xml` / `demo-codelist.xml`) や MyBatis 設定 (`mybatis-config.xml`) を import ([[/steps-basic/01-project-skeleton|Step 01 の実物ファイル一覧]]参照)
- `DispatcherServlet` → `spring-mvc.xml` を読み、`/**` を受ける

## ディレクトリ構造 (このステップ完了時)

Step 01 の生成物のまま (`demo-infra.properties` は既に H2 設定、`web.xml` は上記 2 箇所を編集済み)。`spring-security.xml` ファイル自体は変更せず残っている。

## 動作確認

### 3-a. STS へのインポート状態を確認

[Step 01](/steps-basic/01-project-skeleton) の「STS / Eclipse に import」で、すでに Package Explorer に親 + 5 子モジュール、計 6 個のプロジェクトが並んでいるはず。

まだインポートしていない場合は `[File]` → `[Import]` → `[Maven]` → `[Existing Maven Projects]` → `[Next]` → Root Directory に `demo/` を指定 → `pom.xml` (親 POM) が選択された状態で `[Finish]`。1 個しか表示されない場合は [トラブルシュート #10](/troubleshoot#sts-import) を参照。

### 3-b. ビルドエラーが出たら

インポート直後、プロジェクトに赤い ✗ (エラーマーカー) が付くことがある。

プロジェクト名を右クリック → `[Maven]` → `[Update Project…]` → `[OK]` を押下する。これで解消するケースがある ([トラブルシュート #12](/troubleshoot#sts-build-error) も参照)。

### 3-c. サーバーの登録と起動

war をパッケージングするのは `demo-web` モジュールだけなので、「Run on Server」の対象は `demo-web` になります (親 pom や `demo-domain` ではありません)。

1. Package Explorer で `demo-web` を右クリック → `[Run As]` → `[Run on Server]`
2. サーバーの選択画面で **Tomcat v11.0 Server at localhost** を選び `[Next]`
3. 対象プロジェクトが「Configured」欄に入っていることを確認して `[Finish]`

**Servers ビューにサーバーが 1 つも登録されていない場合**は、手順 2 の画面でサーバーの新規作成が必要になる。サーバー種別として Tomcat v11.0 を選び、次の画面で Tomcat のインストールディレクトリを指定する (詳細は [トラブルシュート #11](/troubleshoot#sts-no-tomcat))。

これでサーバーが起動し、`demo-web` がデプロイされる。

### 3-d. アクセス確認

コンテキストパスは war 名に対応するため `http://localhost:8080/demo-web/` になります。

- **`/` へのアクセスは 404 (`Resource Not Found Error!` 画面) になる** → OK。このステップでは Controller が 1 つも無いため。上記の編集により `springSecurityFilterChain` 自体が存在しないので、**認証を求められることは一切ない** (ログイン画面へのリダイレクトも発生しない)。404 が出ていれば「war が正しくデプロイされ、Tomcat がリクエストを受けている」ことの確認になる
- Console ビューのログで起動完了のメッセージが出ていれば成功
- ログのどこにも `springSecurityFilterChain` の初期化メッセージが出ていないことも、無効化が効いている確認になる

想定と違うパスになっている場合は、Servers ビューで対象サーバーをダブルクリック →「Modules」タブで実際のコンテキストパスを確認できる。

### 3-e. 停止

Servers ビューでサーバーを選択し、赤い■ (Stop) ボタンをクリックする。または Console ビューの Terminate ボタンでも停止できる。

### 3-f. スタンドアロン Tomcat 11 に手動デプロイする場合

`demo-web` を war パッケージング:

```powershell
mvn -pl demo-web -am package
```

生成物: `demo-web/target/demo-web.war`。これを Tomcat の `webapps/` に配置してサーバ起動。

## よくある詰まり

- **`Table "USERS" not found`** — 起動時に H2-schema.sql が実行されていない。**このステップではまだテーブルが無い**ので想定内。Step 03 で `demo-env` の `H2-schema.sql` に DDL を追記してから解消する
- **`Failed to load driver class`** — `demo-env/pom.xml` に H2 依存を書き忘れ。上記 2 を追加
- **`No bean named 'springSecurityFilterChain' is defined`** — `web.xml` の filter/filter-mapping は削除したのに `contextConfigLocation` から `spring-security.xml` を外し忘れている (逆に filter だけ残して `contextConfigLocation` だけ外した場合も同様のエラーになる)。**編集①と②は必ずセットで行う**
- **日本語が文字化けする** — `CharacterEncodingFilter` を誤って削除していないか `web.xml` を確認する。Spring Security の無効化作業では**この filter に触れてはいけない**
- **ポート 8080 が使用中** — 別プロセスが 8080 を掴んでいる、または別の Tomcat と衝突している。Servers ビューで対象サーバーをダブルクリック →「Ports」タブで HTTP ポートを変更するか、既存プロセスを停止 (詳細 [トラブルシュート #4](/troubleshoot#port-conflict))
- **`ContextLoaderListener` が `applicationContext.xml` を見つけられない** — Maven の resources ディレクトリ (`demo-web/src/main/resources/META-INF/spring/`) に置かれているか確認
- **ワークスペースのパスに全角文字が含まれる**: Maven ビルドや Tomcat 起動時の classpath 解決でトラブルになることがある。ワークスペースは半角パスに置く

## 次

→ [Step 03: User ドメイン (Entity)](/steps-basic/03-user-domain)
