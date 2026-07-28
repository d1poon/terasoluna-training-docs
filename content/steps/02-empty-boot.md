---
title: "空アプリ起動 (Tomcat デプロイ確認)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/tomcat, tech/spring]
step: 02
---

# Step 02 — 空アプリ起動 (Tomcat デプロイ確認)

## このステップのゴール

- Step 01 で生成した 5 モジュールを Tomcat 11 (embedded/standalone) にデプロイして「白い画面」が出るところまで持っていく
- `web.xml` / `spring-mvc.xml` の役割を目視で確認する
- H2 in-memory DB が起動時にテーブルを持った状態になる (次 Step 03 の準備)

まだ Controller も画面も無い。**枠だけが動くこと**を確認する段階。

## 事前準備

- [Step 01](/steps/01-project-skeleton) 完了 (`mvn clean install` が全モジュールで SUCCESS)

## 追加するファイル (2 つ / 内容確認 + 差し替え)

archetype 生成物は、実は**最初から H2 in-memory で動く設定を含んでいる**。以下で内容を確認する。

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

### 3. `demo-web/src/main/webapp/WEB-INF/web.xml` は archetype 生成品でそのまま OK

`web.xml` は Tomcat が最初に読むエントリポイント。archetype が生成する内容:

- `ContextLoaderListener` → `applicationContext.xml` を読み、`-domain` 側の設定 (`demo-domain.xml` / `demo-infra.xml` / `demo-codelist.xml`) や MyBatis 設定 (`mybatis-config.xml`) を import ([[/steps/01-project-skeleton|Step 01 の実物ファイル一覧]]参照)
- `DispatcherServlet` → `spring-mvc.xml` を読み、`/**` を受ける
- `springSecurityFilterChain` (Filter) → `spring-security.xml` に紐付き

このステップでは編集不要。中身の詳細は Step 06 (認証基盤) で扱う。

## ディレクトリ構造 (このステップ完了時)

Step 01 の生成物のまま (`demo-infra.properties` は既に H2 設定)。

## 動作確認

### 3-a. ローカルの Tomcat 11 にデプロイ (Cargo プラグイン経由)

Cargo プラグイン (`cargo-maven3-plugin` 1.10.25、Tomcat 11.0.15 自動 DL 込みのフル設定) は
`terasoluna-gfw-parent` の pluginManagement に定義されている。ただし archetype が生成する
`demo-web/pom.xml` 自体には `<plugin>` 宣言が無いため、環境によっては prefix 解決に失敗して
`No plugin found for prefix 'cargo'` と出ることがある (詳細・回避策は [[/troubleshoot|トラブルシュート #11]])。

まずはルート `demo/` で試す:

```powershell
mvn -pl demo-web -am cargo:run
```

**`No plugin found for prefix 'cargo'` が出た場合**は完全修飾で prefix 解決を回避:

```powershell
mvn -pl demo-web -am org.codehaus.cargo:cargo-maven3-plugin:run
```

- `-pl demo-web` — この module だけ実行
- `-am` — 依存モジュール (`demo-domain`, `demo-env`) も一緒にビルド
- `cargo:run` (または完全修飾の `org.codehaus.cargo:cargo-maven3-plugin:run`) — Tomcat 11.0.15 を自動 DL して起動、`demo-web.war` をデプロイ、フォアグラウンドで実行
- **初回は Tomcat 11.0.15 の zip を自動ダウンロードするため時間がかかる**。2 回目以降はローカルにキャッシュされ短くなる

期待するログ (末尾):

```
[INFO] [beddedLocalContainer] Tomcat 11.x started on port [8080]
```

### 3-b. ブラウザ確認

http://localhost:8080/demo-web/ にアクセス:

- **Spring Security のデフォルトログイン画面** (灰色の UI) が出る → OK。次 Step 07 で自作 login.jsp に置き換える
- ログを見て `Started ... in X seconds` が出ていれば起動成功

### 3-c. 停止

`Ctrl + C` で cargo:run を停止。

### 3-d. スタンドアロン Tomcat 11 に手動デプロイする場合

`demo-web` を war パッケージング:

```powershell
mvn -pl demo-web -am package
```

生成物: `demo-web/target/demo-web.war`。これを Tomcat の `webapps/` に配置してサーバ起動。

## よくある詰まり

- **`Table "USERS" not found`** — 起動時に H2-schema.sql が実行されていない。**このステップではまだテーブルが無い**ので想定内。Step 03 で `demo-env` の `H2-schema.sql` に DDL を追記してから解消する
- **`Failed to load driver class`** — `demo-env/pom.xml` に H2 依存を書き忘れ。上記 2 を追加
- **ポート 8080 が使用中** — 別プロセスが 8080 を掴んでいる。`cargo.servlet.port` を上書きするか、既存プロセスを停止 (詳細 [[/troubleshoot]])
- **`No plugin found for prefix 'cargo'`** — archetype 生成の `demo-web/pom.xml` に cargo プラグイン宣言が無いため、環境によっては起きる。完全修飾コマンド `org.codehaus.cargo:cargo-maven3-plugin:run` を使うか、`demo-web/pom.xml` に `<plugin>` 宣言を追加 (詳細 [[/troubleshoot]] #11)
- **`ContextLoaderListener` が `applicationContext.xml` を見つけられない** — Maven の resources ディレクトリ (`demo-web/src/main/resources/META-INF/spring/`) に置かれているか確認
- **Windows でパスに全角が含まれる**: `mvn cargo:run` が Tomcat の起動時 classpath 解決で失敗することがある。ワークスペースは半角パスに

## 次

→ [Step 03: User ドメイン (Entity)](/steps/03-user-domain)
