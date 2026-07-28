---
title: "User ドメイン (Entity)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/java]
step: 03
---

# Step 03 — User ドメイン (Entity)

## このステップのゴール

- `users` テーブルの 1 行を表す **Entity** (`User.java`) を作る
- `demo-domain` モジュールの `domain.model` パッケージに配置する
- DDL を `demo-env` の既存 `H2-schema.sql` に追記し、起動時にテーブルが作られるようにする

**なぜ Entity と DDL をペアで扱うか**: この 2 つが対応していないと Repository が動かない (Step 04 でつまづく)。ここで揃えておく。

## 事前準備

- [Step 02](/steps/02-empty-boot) 完了 (Tomcat 起動確認)

## 追加するファイル (2 つ)

### 1. `User.java` (Entity)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-domain/</div>
    <div class="ft-line ft-l2">📁 src/main/java/</div>
    <div class="ft-line ft-l3">📁 com/example/demo/domain/model/</div>
    <div class="ft-line ft-l4 ft-file">📄 User.java <span class="ft-tag">新規</span></div>
  </div>
</div>

**POJO** (Plain Old Java Object)。フィールドと getter/setter だけの素朴なクラス:

```java
package com.example.demo.domain.model;                                        // ①

import java.io.Serializable;

/**
 * users テーブル 1 行を表す Entity。
 * demo-domain モジュールの domain.model パッケージに配置する。
 */
public class User implements Serializable {                                    // ②

    private static final long serialVersionUID = 1L;

    private String id;                                                         // ③
    private String password;
    private String role;

    /** MyBatis がインスタンス化するため、引数なしコンストラクタが必要 */
    public User() {}                                                           // ④

    // === getter / setter ===
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

#### なぜこう書く

- **① `package com.example.demo.domain.model`** — TERASOLUNA 規約: Entity は `domain.model` パッケージに集約。usecase 別に分けない (User は複数機能から参照されるため)
- **② `implements Serializable`** — セッション格納や分散 cache に載る可能性を想定した TERASOLUNA 規約。付けておくのが安全
- **③ フィールド 3 つ** — DDL (次) と 1:1 対応。カラム追加は Entity 側の追加とセット
- **④ 引数なしコンストラクタ** — MyBatis の resultType 経由での自動マッピングに必須。省略すると `NoSuchMethodException` で落ちる

### 2. DDL: `H2-schema.sql` に追記

<div class="file-location">
  <div class="file-location-label">📍 このファイルを編集 (archetype が最初から生成する既存ファイル)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-env/</div>
    <div class="ft-line ft-l2">📁 src/main/resources/database/</div>
    <div class="ft-line ft-l3 ft-file">📄 H2-schema.sql <span class="ft-tag ft-tag--modify">修正</span></div>
  </div>
</div>

**DDL** (Data Definition Language、テーブル定義 SQL) は新しいファイルを作るのではなく、`demo-env` モジュールに既にある `H2-schema.sql` に追記する:

```sql
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id       VARCHAR(50)  PRIMARY KEY,
    password VARCHAR(255) NOT NULL,   -- BCrypt ハッシュ 60 文字、余裕を持たせて 255
    role     VARCHAR(50)  NOT NULL
);
```

### 3. 起動時に DDL を流す設定 (追加作業は不要)

`demo-env/src/main/resources/META-INF/spring/demo-env.xml` には、archetype 生成時点で既に次の設定が入っている:

```xml
<jdbc:initialize-database data-source="dataSource" ignore-failures="ALL">
    <jdbc:script location="classpath:/database/${database}-schema.sql" encoding="UTF-8" />
    <jdbc:script location="classpath:/database/${database}-dataload.sql" encoding="UTF-8" />
</jdbc:initialize-database>
```

`demo-infra.properties` の `database=H2` により `${database}` は `H2` に解決されるので、上記は実質 `classpath:/database/H2-schema.sql` を指す。**この XML は編集不要** — 上の 2 で `H2-schema.sql` の中身を書けば、アプリ起動時に自動で実行される。

## `domain.model` パッケージの位置付け

TERASOLUNA では Entity と DTO (と場合によっては値オブジェクト) を全て `domain.model` に集約する。「機能別」の分割はしない:

```
demo-domain/src/main/java/com/example/demo/domain/
├── model/                     ← Entity 全部 (User, Role, ...)
├── repository/
│   ├── user/                  ← usecase 別に分割 (Step 04)
│   └── role/
└── service/
    ├── user/                  ← usecase 別に分割 (Step 05)
    └── role/
```

**なぜ**: Entity は複数の usecase (登録・検索・変更) から参照される **共有資源**。usecase 別に置くと「どこにあるべきか」の判断が発散する。

## ディレクトリ構造 (このステップ完了時)

```
demo/
├── demo-env/
│   └── src/main/resources/database/
│       └── H2-schema.sql                ← 追記
├── demo-domain/
│   └── src/main/java/com/example/demo/domain/
│       └── model/
│           └── User.java                ← 追加
├── demo-web/          (未着手)
├── demo-initdb/       (H2 開発では未使用)
└── demo-selenium/
```

## 動作確認

```powershell
cd demo
mvn -pl demo-domain -am compile
```

`BUILD SUCCESS` で OK。まだ画面には反映されない (Repository が無いので DB は触られない)。

## よくある詰まり

- **package 宣言と物理パスが不一致**: `package com.example.demo.domain.model;` と書きつつ `src/main/java/com/example/demo/domain/` (`model/` の親) に置いてしまう。**必ずファイルの物理配置と package 宣言を一致させる**
- **`Serializable` の import 忘れ**: `import java.io.Serializable;` を書かないと未解決エラー。IDE の Organize Imports で解決
- **DDL の `DROP TABLE IF EXISTS` を書き忘れ**: 再起動時に「既存テーブルと重複」で落ちる。開発中は必ず `DROP` を先頭に

## 次

→ [Step 04: Repository (SQL 係)](/steps/04-mapper)
