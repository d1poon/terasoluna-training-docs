---
title: "プロジェクト骨組み (親 POM + 5 子モジュール)"
date: 2026-07-30
tags: [type/learning, type/training, tech/terasoluna, tech/maven]
step: 01
---

# Step 01 — プロジェクト骨組み (親 POM + 5 子モジュール)

## このステップのゴール

- `mvn archetype:generate` で TERASOLUNA blank archetype (5.11.0.RELEASE) から 5 モジュール構成のプロジェクトを生成する
- 生成物のファイル配置を目視で確認し、[[/steps-basic/00-modules-map|Step 00 の地図]]と照合する
- ルートで `mvn clean install` を通し、5 モジュール全てが `BUILD SUCCESS` することを確認する

まだアプリコードは書かない。**空の 5 モジュールが立ち上がる状態**を作る。

## 事前準備

- JDK 17+ が入っている (`java -version`)
- Maven 3.9+ にパスが通っている (`mvn -v`)
- インターネット接続 (初回だけ Maven Central + TERASOLUNA 依存を DL する)
- 社内プロキシ環境の場合は `~/.m2/settings.xml` にプロキシ設定 (詳細は [[/troubleshoot|トラブルシュート]] 参照)

## 用語 (プレースホルダについて)

- `projectName` = あなたのプロジェクト名。実プロジェクトでは社内命名規則に従う
- 本教材は具体例として `demo` を採用: `demo/`, `demo-web/`, `com.example.demo` のように登場する
- `<groupId>` `<artifactId>` は自プロジェクトのものに差し替えて使う

## 追加するファイル (0 個 / archetype 生成物を確認)

新規に手で書くファイルはこのステップにはない。archetype に生成させる。**このトラック (Security を使わない入門版) でも、生成コマンドは Security 版とまったく同じ**。「Security を使わない」のは Step 02 で `web.xml` を編集して無効化するからで、archetype 自体は Security 版と共通のものを使う。

### 1. archetype 生成コマンド

<div class="file-location">
  <div class="file-location-label">📍 実行する場所: 任意のワークスペースディレクトリ (例: <code>C:\workspace\</code>)</div>
  <div class="file-tree">
    <div class="ft-line">📁 workspace/</div>
    <div class="ft-line ft-l1">└ (このディレクトリで下のコマンドを実行、demo/ が生成される)</div>
  </div>
</div>

**PowerShell:**

```powershell
mvn archetype:generate `
    "-DarchetypeGroupId=org.terasoluna.gfw.blank" `
    "-DarchetypeArtifactId=terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype" `
    "-DarchetypeVersion=5.11.0.RELEASE" `
    "-DgroupId=com.example.demo" `
    "-DartifactId=demo" `
    "-Dversion=1.0.0-SNAPSHOT" `
    "-DinteractiveMode=false"
```

**bash / zsh:**

```bash
mvn archetype:generate \
    -DarchetypeGroupId=org.terasoluna.gfw.blank \
    -DarchetypeArtifactId=terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype \
    -DarchetypeVersion=5.11.0.RELEASE \
    -DgroupId=com.example.demo \
    -DartifactId=demo \
    -Dversion=1.0.0-SNAPSHOT \
    -DinteractiveMode=false
```

#### なぜこう書く

- **`-DarchetypeGroupId=org.terasoluna.gfw.blank`** — TERASOLUNA 公式の blank archetype 群を指す groupId (GFW 本体ライブラリの groupId `org.terasoluna.gfw` とは別物)
- **`-DarchetypeArtifactId=terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype`** — JSP + MyBatis3 の multi-project 版 archetype。他に `-thymeleaf-` / `-jpa-` バリアントがある
  - **なぜ `xmlconfig` が付く方か**: 同じ組み合わせには `xmlconfig` を含まない JavaConfig 版 (`terasoluna-gfw-multi-web-blank-jsp-mybatis3-archetype`) も存在するが、そちらは `SpringMvcConfig.java` / `SpringSecurityConfig.java` など **Java クラスで設定**する版で、XML は `web.xml` しか生成されない。本教材は `applicationContext.xml` / `demo-domain.xml` を編集する **XML 設定前提**の手順なので、**必ず `xmlconfig` が付く方**を指定すること
- **`-DarchetypeVersion=5.11.0.RELEASE`** — 今回は 5.11.0.RELEASE を使う。バージョンを固定しないと将来最新に引きずられる
- **`-DgroupId=com.example.demo`** — 自プロジェクトのパッケージ prefix。**実プロジェクトでは会社の命名規則に従う** (`jp.co.<company>.<project>` 等)
- **`-DartifactId=demo`** — Maven 上のプロジェクト名。生成されるディレクトリ名がこれになる (`demo/`)
- **`-Dversion=1.0.0-SNAPSHOT`** — バージョンは自由。SNAPSHOT を付けると変更頻度が高い間 Maven ローカルへのインストールが上書きになる
- **`-DinteractiveMode=false`** — 対話モード無効。CI やスクリプトでも回せる

> 💡 5.11.0.RELEASE 系の archetype は Java 17 前提。JDK 11 では起動でコケる。 [[/versions|バージョン一覧]] を参照。

### 2. 生成物の確認

コマンド実行後、`demo/` ディレクトリが作られる。中身:

<div class="file-location">
  <div class="file-location-label">📍 archetype 生成後のディレクトリ構造 (xmlconfig 版・実物確認済み)</div>
  <div class="file-tree">
    <div class="ft-line">📁 workspace/</div>
    <div class="ft-line ft-l1">📁 demo/</div>
    <div class="ft-line ft-l2 ft-file">📄 pom.xml <span class="ft-tag">親 POM</span></div>
    <div class="ft-line ft-l2">📁 demo-env/</div>
    <div class="ft-line ft-l3 ft-file">📄 pom.xml</div>
    <div class="ft-line ft-l3">📁 src/main/resources/</div>
    <div class="ft-line ft-l4 ft-file">📄 logback.xml</div>
    <div class="ft-line ft-l4">📁 META-INF/spring/</div>
    <div class="ft-line ft-l5 ft-file">📄 demo-env.xml</div>
    <div class="ft-line ft-l5 ft-file">📄 demo-infra.properties <span class="ft-tag">DB 接続情報</span></div>
    <div class="ft-line ft-l2">📁 demo-domain/</div>
    <div class="ft-line ft-l3 ft-file">📄 pom.xml</div>
    <div class="ft-line ft-l3">📁 src/main/java/com/example/demo/domain/</div>
    <div class="ft-line ft-l4">📁 model/ (空)</div>
    <div class="ft-line ft-l4">📁 repository/ (空)</div>
    <div class="ft-line ft-l4">📁 service/ (空)</div>
    <div class="ft-line ft-l3">📁 src/main/resources/META-INF/spring/</div>
    <div class="ft-line ft-l4 ft-file">📄 demo-domain.xml</div>
    <div class="ft-line ft-l4 ft-file">📄 demo-codelist.xml</div>
    <div class="ft-line ft-l4 ft-file">📄 demo-infra.xml <span class="ft-tag">MyBatis-Spring 橋渡し</span></div>
    <div class="ft-line ft-l3">📁 src/main/resources/META-INF/mybatis/</div>
    <div class="ft-line ft-l4 ft-file">📄 mybatis-config.xml <span class="ft-tag">MyBatis 全体設定</span></div>
    <div class="ft-line ft-l2">📁 demo-web/</div>
    <div class="ft-line ft-l3 ft-file">📄 pom.xml</div>
    <div class="ft-line ft-l3">📁 src/main/java/com/example/demo/app/ (空)</div>
    <div class="ft-line ft-l3">📁 src/main/webapp/</div>
    <div class="ft-line ft-l4">📁 WEB-INF/</div>
    <div class="ft-line ft-l5 ft-file">📄 web.xml <span class="ft-tag">DispatcherServlet 起動点</span></div>
    <div class="ft-line ft-l5">📁 views/ (JSP を置く)</div>
    <div class="ft-line ft-l3">📁 src/main/resources/META-INF/spring/</div>
    <div class="ft-line ft-l4 ft-file">📄 applicationContext.xml</div>
    <div class="ft-line ft-l4 ft-file">📄 spring-mvc.xml <span class="ft-tag">MVC 設定</span></div>
    <div class="ft-line ft-l4 ft-file">📄 spring-security.xml <span class="ft-tag">セキュリティ設定 (このトラックでは Step 02 で無効化)</span></div>
    <div class="ft-line ft-l4 ft-file">📄 application.properties</div>
    <div class="ft-line ft-l2">📁 demo-initdb/</div>
    <div class="ft-line ft-l3 ft-file">📄 pom.xml</div>
    <div class="ft-line ft-l3">📁 src/main/sqls/ (空。H2 開発では未使用。postgres/oracle 等外部 DB プロファイル向け)</div>
    <div class="ft-line ft-l2">📁 demo-selenium/</div>
    <div class="ft-line ft-l3 ft-file">📄 pom.xml</div>
    <div class="ft-line ft-l3">📁 src/test/ (研修では触らない)</div>
  </div>
</div>

`spring-security.xml` も他のファイルと同様に生成される。**このトラックではまだ何もしない** — Step 02 で `web.xml` から読み込みを外し、無効化する (ファイルは削除しない)。

### 3. 親 POM の要点

`demo/pom.xml` を開くと、次のような構造:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" ...>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example.demo</groupId>
    <artifactId>demo</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>                          <!-- ① -->

    <modules>
        <module>demo-env</module>                        <!-- ② -->
        <module>demo-domain</module>
        <module>demo-web</module>
        <module>demo-initdb</module>
        <module>demo-selenium</module>
    </modules>

    <parent>                                             <!-- ③ -->
        <groupId>org.terasoluna.gfw</groupId>
        <artifactId>terasoluna-gfw-parent</artifactId>
        <version>5.11.0.RELEASE</version>
        <relativePath />
    </parent>

    <properties>
        <encoding>UTF-8</encoding>
        <java-version>17</java-version>                  <!-- ④ -->
    </properties>
    <!-- ... dependencyManagement で子モジュール間の version 参照 ... -->
</project>
```

#### なぜこう書く

- **① `<packaging>pom</packaging>`** — 親モジュールは Java コードを持たない、ビルド指令 (`modules` の集約) だけ持つ
- **② `<modules>`** — 実行順序に意味がある。`demo-env` を最初に、`demo-web` を後に (依存解決順)
- **③ `<parent>` = `terasoluna-gfw-parent:5.11.0.RELEASE`** — このバージョンが Spring Boot 4.0.2 (= Spring Framework 7.0.3 / Spring Security 7.0.2) / MyBatis 3.5.19 / Jakarta EE 系のバージョンを一括管理する
- **④ `<java-version>17</java-version>`** — 5.11.0 系は Java 17 が必須

## 動作確認

### 3-a. ルートで初回 `mvn clean install`

```powershell
cd demo
mvn clean install
```

**期待するメッセージ (末尾):**

```
[INFO] Reactor Summary for demo 1.0.0-SNAPSHOT:
[INFO]
[INFO] demo ............................................... SUCCESS
[INFO] demo-env ........................................... SUCCESS
[INFO] demo-domain ........................................ SUCCESS
[INFO] demo-web ........................................... SUCCESS
[INFO] demo-initdb ........................................ SUCCESS
[INFO] demo-selenium ...................................... SUCCESS
[INFO] BUILD SUCCESS
```

5 モジュール全てが SUCCESS なら OK。**初回は依存 DL のため少し時間がかかる** (TERASOLUNA + Spring Boot + Jakarta EE の jar 群を Maven Central から取得するため)。焦らず終わるまで待ってください。**2 回目以降はキャッシュから取るので短い**です。

### 3-b. STS / Eclipse に import

- **File → Import → Existing Maven Projects**
- Root Directory に `demo/` を指定
- 6 個 (親 + 5 子) すべてにチェック
- **Finish**

Package Explorer に **6 個のプロジェクト**が並べば成功。

## よくある詰まり

- **archetype:generate で `-DarchetypeVersion` を省略**: 最新版が引かれてこの手順書と齟齬が出る。必ず明示
- **`xmlconfig` を付け忘れて JavaConfig 版を生成してしまう**: `-DarchetypeArtifactId` の `xmlconfig` を落とすと Java クラスで設定する版が生成され、`applicationContext.xml` 等の XML 編集手順と噛み合わなくなる。生成後に `demo-web/src/main/resources/META-INF/spring/applicationContext.xml` が存在するか確認
- **社内プロキシで DL がタイムアウト**: `~/.m2/settings.xml` にプロキシ設定 (Nexus/JFrog がある場合はそちらをミラーに)。詳細 → [[/troubleshoot]]
- **`mvn clean install` を子モジュールで先に流す**: 例えばルートで install する前に `cd demo-web && mvn install` すると、`demo-domain` / `demo-env` が Maven ローカルに未配布で解決失敗する。**必ずルート → 子** の順
- **`java-version` エラー**: JDK 11 or 8 だと `-source/-target 17 is not supported` で失敗。JDK 17+ に切り替える
- **`error creating archetype` (社内 CA 証明書 PKIX エラー)**: 社内 CA 未信頼で SSL 検証失敗。トラブルシュートページ [[/troubleshoot]] の PKIX セクション参照

## 次

→ [Step 02: 空アプリ起動 (Tomcat デプロイ動作確認 + Spring Security 無効化)](/steps-basic/02-empty-boot)
