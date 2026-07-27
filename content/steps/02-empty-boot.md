---
title: "空アプリ起動 (Tomcat デプロイ確認)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/tomcat, tech/spring]
step: 02
---

# Step 02 — 空アプリ起動 (Tomcat デプロイ確認)

## このステップのゴール

- Step 01 で生成した 5 モジュールを Tomcat 11 (embedded/standalone) にデプロイして「白い画面」が出るところまで持っていく
- `web.xml` / `demo-web.xml` / `spring-mvc.xml` の役割を目視で確認する
- H2 in-memory DB が起動時にテーブルを持った状態になる (次 Step 03 の準備)

まだ Controller も画面も無い。**枠だけが動くこと**を確認する段階。

## 事前準備

- [Step 01](/steps/01-project-skeleton) 完了 (`mvn clean install` が全モジュールで SUCCESS)

## 追加するファイル (2 つ / 内容差し替え)

archetype 生成物にある空ファイルを、H2 で動く最小構成にする。

### 1. `demo-env/src/main/resources/jdbc.properties` を編集

<div class="file-location">
  <div class="file-location-label">📍 このファイルを編集</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-env/</div>
    <div class="ft-line ft-l2">📁 src/main/resources/</div>
    <div class="ft-line ft-l3 ft-file">📄 jdbc.properties <span class="ft-tag ft-tag--modify">修正</span></div>
  </div>
</div>

archetype デフォルトは PostgreSQL の想定コメント。H2 in-memory に切り替える:

```properties
# H2 in-memory 開発用 (Step 10 で PostgreSQL に切替)
database=H2

# Connection Pool (HikariCP 想定)
cp.maxActive=10
cp.maxIdle=8
cp.minIdle=2
cp.maxWait=60000

# JDBC 接続情報
jdbc.driverClassName=org.h2.Driver
jdbc.url=jdbc:h2:mem:demo;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
jdbc.username=sa
jdbc.password=
```

#### なぜこう書く

- **`jdbc:h2:mem:demo`** — メモリ上の DB。JVM 停止で消える
- **`DB_CLOSE_DELAY=-1`** — 接続が全部切れても DB を保持 (プールが再接続しても同じ DB を見る)
- **`MODE=PostgreSQL`** — H2 に「PostgreSQL の方言で動作」と指示。将来 PostgreSQL に切り替える時の SQL 差分を最小化
- **`sa` / 空パスワード** — H2 のデフォルト。開発用のみ、本番は絶対避ける

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

- `ContextLoaderListener` → `applicationContext.xml` を読み、`demo-web.xml` / `demo-domain.xml` / `demo-infra.xml` を集約ロード
- `DispatcherServlet` → `spring-mvc.xml` を読み、`/**` を受ける
- `springSecurityFilterChain` (Filter) → `spring-security.xml` に紐付き

このステップでは編集不要。中身の詳細は Step 06 (認証基盤) で扱う。

## ディレクトリ構造 (このステップ完了時)

Step 01 の生成物 + `jdbc.properties` を H2 用に書き換えた状態。

## 動作確認

### 3-a. ローカルの Tomcat 11 にデプロイ (Cargo プラグイン経由)

Cargo プラグインが `terasoluna-gfw-parent` の pluginManagement に用意されている。ルート `demo/` で:

```powershell
mvn -pl demo-web -am cargo:run
```

- `-pl demo-web` — この module だけ実行
- `-am` — 依存モジュール (`demo-domain`, `demo-env`) も一緒にビルド
- `cargo:run` — Tomcat 11.0.15 を自動 DL して起動、`demo-web.war` をデプロイ、フォアグラウンドで実行

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

- **`Table "USERS" not found`** — 起動時に schema.sql が実行されていない。**このステップではまだテーブルが無い**ので想定内。Step 04 で `demo-initdb` に schema.sql を配置してから解消する
- **`Failed to load driver class`** — `demo-env/pom.xml` に H2 依存を書き忘れ。上記 2 を追加
- **ポート 8080 が使用中** — 別プロセスが 8080 を掴んでいる。`cargo.servlet.port` を上書きするか、既存プロセスを停止 (詳細 [[/troubleshoot]])
- **`ContextLoaderListener` が `applicationContext.xml` を見つけられない** — Maven の resources ディレクトリ (`demo-web/src/main/resources/META-INF/spring/`) に置かれているか確認
- **Windows でパスに全角が含まれる**: `mvn cargo:run` が Tomcat の起動時 classpath 解決で失敗することがある。ワークスペースは半角パスに

## 次

→ [Step 03: User ドメイン (Entity)](/steps/03-user-domain)
