---
title: "5 モジュールの地図"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/maven]
step: 00
---

# Step 00 — 5 モジュールの地図

## このステップのゴール

TERASOLUNA blank archetype (5.11.0.RELEASE) が生成する **5 つの Maven モジュール** の役割・依存関係・「どこに何を書くか」を掴む。
以降 Step 01 以降で新しいファイルを作るとき、迷わず配置先を決められる状態を目指す。

- 5 モジュールの役割を 1 行ずつ言える
- Controller / Entity / Repository / SQL / DDL / DB 接続情報 の**配置先**を即答できる
- STS / Eclipse に import するとプロジェクトが 5 個並ぶ理由を説明できる
- 依存方向 (`-web → -domain`、`-env` は実行時に注入される) が理解できている

> このステップはコードを書かない。読むだけの **地図**。焦らず、5 モジュールがそれぞれ何をしているのかが頭に入るまで読み返して大丈夫です。

## 前提

- Windows / macOS / Linux いずれかで、JDK 17 + Maven 3.9+ が使える状態
- 実プロジェクトでは `projectName` を自分のプロジェクト名 (社内命名規則に従う) に置き換える。本教材では**プレースホルダとして `demo`** を採用する。以降 コード中の `com.example.demo` / `demo-web` 等は「あなたのプロジェクトでは `com.example.<あなたの名前>` / `<あなたの名前>-web`」と読み替えて欲しい

## 5 モジュールの全体像

```
demo/                      ← 親 POM (packaging: pom)。ビルドの入口
├── demo-web/              ← Presentation 層 (Controller / JSP / spring-mvc.xml)
├── demo-domain/           ← Business + Data 層 (Service / Repository / Entity)
├── demo-env/              ← 環境依存の設定 (jdbc.properties / logback.xml)
├── demo-initdb/           ← DB 初期化 (DDL / データ投入 SQL)
└── demo-selenium/         ← E2E テスト (Selenium)。研修では触らないことが多い
```

### `demo/pom.xml` (親 POM) の役割

- `<packaging>pom</packaging>` — このモジュール自体はビルド成果物を持たない
- `<modules>` に 5 つの子モジュールを列挙 (`demo-env` を先に、`demo-web` を後にすると依存解決が素直)
- `<parent>` に `org.terasoluna.gfw:terasoluna-gfw-parent:5.11.0.RELEASE` を指定 → **Spring Boot 4.0.2 (= Spring Framework 7.0.3 / Spring Security 7.0.2) / MyBatis 3.5.19 / Jakarta EE 系のバージョンをここが管理**
- 詳細バージョンは [[/versions|バージョン一覧]] を参照

### 各モジュールの役割 1 行サマリ

| モジュール | 役割 | 主な中身 |
|---|---|---|
| `demo-web` | 画面まわり | Controller, JSP, Form, spring-mvc.xml, spring-security.xml |
| `demo-domain` | 業務+データ | Service (interface + Impl), Repository (interface + XML), Entity |
| `demo-env` | 環境依存 | `jdbc.properties`, `logback.xml`, プロファイル別設定 |
| `demo-initdb` | DB 初期化 | `CREATE TABLE` DDL, サンプルデータ INSERT |
| `demo-selenium` | E2E テスト | Selenium テストコード + WebDriver 設定 |

## モジュール依存の方向

<div class="flow-diagram">
  <div class="flow-diagram-title">ビルド時の依存 (コンパイル/パッケージング)</div>
  <div class="flow-row">
    <div class="flow-node flow-node--legit">
      <div aria-hidden="true" class="flow-node-icon">🎨</div>
      <div class="flow-node-name">demo-web</div>
      <div class="flow-node-detail">
        Controller が Service を呼ぶ → <strong>demo-domain に依存</strong><br />
        実行時は <strong>demo-env</strong> も要る (jdbc.properties)
      </div>
    </div>
    <div class="flow-arrow">
      <div class="flow-arrow-label">depends-on</div>
      <div class="flow-arrow-note">compile 時</div>
    </div>
    <div class="flow-node flow-node--server">
      <div aria-hidden="true" class="flow-node-icon">⚙️</div>
      <div class="flow-node-name">demo-domain</div>
      <div class="flow-node-detail">
        Service が Repository を呼ぶ (interface DI)<br />
        DB 接続情報は <strong>持たない</strong> (env に外出し)
      </div>
    </div>
  </div>
</div>

<div class="flow-diagram">
  <div class="flow-diagram-title">実行時の依存 (WAR 起動時に注入)</div>
  <div class="flow-vertical">
    <div class="flow-step">
      <span class="flow-step-badge">1</span>
      <div class="flow-step-content">
        <code>demo-web.war</code> を Tomcat にデプロイ
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">2</span>
      <div class="flow-step-content">
        <code>demo-env.jar</code> の中の <code>jdbc.properties</code> が classpath に載る
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">3</span>
      <div class="flow-step-content">
        <code>demo-domain.jar</code> の Repository が MyBatis 経由で DB (initdb で作られたテーブル) に接続
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge flow-step-badge--yes">4</span>
      <div class="flow-step-content">
        Controller → Service → Repository の呼び出しが動く
      </div>
    </div>
  </div>
</div>

**ポイント**: `demo-env` は`compile 時の依存` **ではなく** `実行時に差し込む` 存在。だから「本番と test で env だけ差し替える」ことができる。

## 「新しいファイルはどこに作る?」判断フロー

<div class="flow-vertical">
  <div class="flow-step">
    <span class="flow-step-badge">Q1</span>
    <div class="flow-step-content">
      <strong>DB のテーブル定義 / 初期データ?</strong><br />
      → <code>demo-initdb/src/main/sqls/</code>
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q2</span>
    <div class="flow-step-content">
      <strong>DB 接続情報 / logback / 環境ごとに変わる設定?</strong><br />
      → <code>demo-env/src/main/resources/</code>
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q3</span>
    <div class="flow-step-content">
      <strong>Entity (users テーブルの 1 行を表す POJO)?</strong><br />
      → <code>demo-domain/src/main/java/com/example/demo/domain/model/</code>
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q4</span>
    <div class="flow-step-content">
      <strong>Repository (SQL を発行する層)?</strong><br />
      Java interface → <code>demo-domain/src/main/java/com/example/demo/domain/repository/&lt;usecase&gt;/</code><br />
      SQL XML → <code>demo-domain/src/main/resources/com/example/demo/domain/repository/&lt;usecase&gt;/</code> (Java と同じパッケージパスをミラー)
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q5</span>
    <div class="flow-step-content">
      <strong>Service (業務ロジック)?</strong><br />
      → <code>demo-domain/src/main/java/com/example/demo/domain/service/&lt;usecase&gt;/</code><br />
      interface と Impl を <strong>ペアで作成</strong>
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q6</span>
    <div class="flow-step-content">
      <strong>Controller (URL を受ける)?</strong><br />
      → <code>demo-web/src/main/java/com/example/demo/app/&lt;usecase&gt;/</code>
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q7</span>
    <div class="flow-step-content">
      <strong>Form (画面入力バインディング用)?</strong><br />
      → <code>demo-web/src/main/java/com/example/demo/app/&lt;usecase&gt;/</code><br />
      Entity と <strong>別に</strong>作る (Entity 直バインドしない、後述の Step 09-11 参照)
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q8</span>
    <div class="flow-step-content">
      <strong>JSP?</strong><br />
      → <code>demo-web/src/main/webapp/WEB-INF/views/&lt;usecase&gt;/</code>
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">Q9</span>
    <div class="flow-step-content">
      <strong>Spring MVC / Security / MyBatis の設定 XML?</strong><br />
      → <code>demo-web/src/main/resources/META-INF/spring/</code> (web モジュールに集約)
    </div>
  </div>
</div>

**教訓**: 迷ったら「実行時にどこで参照されるか」を軸に判断する。Controller は画面から呼ばれる → `-web`、DDL は起動時に流れる → `-initdb`、DB 接続情報は環境で切り替わる → `-env`。

## STS / Eclipse に import した時の見え方

archetype 生成直後の親 POM (`demo/pom.xml`) を **Existing Maven Project** として import すると、Package Explorer に**プロジェクトが 5 個並ぶ**:

```
demo                (親 POM)
demo-web            (Presentation)
demo-domain         (Business + Data)
demo-env            (環境設定)
demo-initdb         (DB 初期化)
demo-selenium       (E2E テスト)
```

これは意図した挙動。「1 プロジェクトのつもりで開いたのに 5 個出る」ことに面食らわないように。
初回は必ずルート (`demo/`) で `mvn clean install` を実行し、モジュール間の依存を Maven ローカルリポジトリに配布してから、STS で各モジュールを開いていく。

## 「なぜ 5 つに分ける?」よくある疑問

- **1 プロジェクトで書けば良くない?** → 動きます。でも `demo-env` を独立させておくと「本番 / test / local」で env の中身だけ差し替えれば良くなる (WAR は同一)。Entity や Service を「別サーバの Web アプリからも呼びたい」時、demo-domain だけ jar 化して使い回せる
- **initdb は DB 一発作れば要らない?** → 開発中は毎回リセットしたい (H2 in-memory 前提)。本番デプロイ時は流さない (Flyway 等に置き換える)
- **selenium は要らない?** → 研修中はスキップして OK。運用フェーズで書き足す

## 動作確認 (このステップでやること)

コードは書かない。以下のイメージを頭に入れれば OK:

1. **親 POM は入口**: `cd demo && mvn clean install` で全モジュールが順にビルドされる
2. **-env は差し替え可**: 本番デプロイ時は `-P warpack` で env を war から除外し、サーバ側 classpath に本番用 env を配置する運用がある (Step 12 で扱う)
3. **-web が最終成果物**: 5 モジュールから `demo-web.war` が生成される、これを Tomcat にデプロイする

## よくある詰まり

- **`Could not resolve dependencies for demo-web`**: ルートから `mvn clean install` していない → 子モジュール間の依存 (`demo-domain`, `demo-env`) がローカルリポジトリに未配布。**まずルートで install してから -web だけ触る**
- **STS で「Maven の子プロジェクトが解決できない」**: import 時に「Existing Maven Projects」を選び、全モジュールにチェックを入れる。1 個だけ import すると親 POM が見つからず失敗
- **JSP 変更が反映されない**: `demo-web` の `webapp/` を触った後、`mvn compile` ではなく `mvn package` (or Tomcat 側の autoDeploy) が必要な場合あり

## 次

→ [Step 01: プロジェクト骨組み (親 POM + 5 子モジュール)](/steps/01-project-skeleton)
