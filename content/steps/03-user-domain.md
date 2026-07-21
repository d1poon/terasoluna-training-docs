---
title: "User ドメイン"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/java, tech/java-basics]
step: 03
---

# Step 03 — User ドメインクラス (Java 基礎込み)

## このステップのゴール

- `users` テーブルの 1行を Java オブジェクトで表す POJO を作る
- **Java の class・package・private・getter/setter が何かをこの Step で理解する**

このステップは短いが、**Java 全体を通じて何度も出てくる基本文法**が全部詰まっている。ここで一度腹落ちさせておく。

## 事前準備

- [Step 02](/steps/02-empty-boot) 完了

---

## 🔰 Java 基礎の前置き (これがわかっていないと読めない)

Java のコードは以下の 4 段で組み立てられている:

```
① パッケージ宣言   package com.example.rolemgr.domain;
② import          import java.util.List;
③ クラス宣言       public class User { … }
④ クラスの中身     フィールド + メソッド (getter/setter など)
```

### ① `package` = ファイルの住所

- `package com.example.rolemgr.domain;` = 「このファイルは `com.example.rolemgr.domain` という住所にある」という宣言
- **必ずファイルのある物理フォルダと一致させる**: `src/main/java/com/example/rolemgr/domain/User.java` に置かれていれば package も `com.example.rolemgr.domain`
- Java は「フルパス (package + クラス名)」でクラスを識別する。例: `com.example.rolemgr.domain.User`

### ② `import` = 他のクラスを短い名前で呼ぶ許可

- Java の標準に含まれる `java.lang.*` (String, System など) は import 不要
- それ以外は import しないと使えない、あるいは毎回フルパスで書く羽目になる
- 例: `import java.util.List;` があると以降 `List<User>` と書ける。無いと `java.util.List<User>` と書く必要がある

### ③ `class` = 「もの」の設計図

- Java の全ての コードは class の中に書く (関数だけの独立ファイルは作れない)
- **class の名前 = ファイル名** (`User.java` なら中の class は `class User`)
- `public class` の `public` は「他のパッケージからも見える」意味

### ④ フィールド + メソッド

- **フィールド (= メンバ変数)**: class が持つデータ。`private String id;` みたいなやつ
- **メソッド**: class の中の関数。getter/setter もメソッドの一種

### `private` `public` の違い

| 修飾子 | 誰から見える | 使うのは |
|---|---|---|
| `public` | 全世界 | class のメソッド、外に公開するAPI |
| `private` | 同じ class の中だけ | フィールド (直接触らせず getter/setter 経由に強制) |

**フィールドは private が原則**。理由は「外から `user.id = null;` みたいに勝手に書き換えられないため」。値のチェックを getter/setter に集約できる。これを**カプセル化 (encapsulation)** と呼ぶ。

### getter / setter とは

「private なフィールドの値を、メソッド経由で取ったり入れたりする」ための決まった書き方:

```java
private String id;                              // フィールド (外からは見えない)

public String getId() { return id; }            // ゲッター (値を取り出す)
public void setId(String id) { this.id = id; }  // セッター (値を入れる)
```

**なぜこんな回りくどいことを?**
- 将来「setter で null を弾きたい」「getter でログを出したい」等の変更を、**呼び出し側のコードを変えずに**追加できる
- MyBatis や JSP の EL (`${user.id}`) は「`getId()` が定義されているクラス」を暗黙に期待するので、この命名規則が事実上の必須

### `this.` の意味

```java
public void setId(String id) {
    this.id = id;
}
```

- `id` (右辺、引数の id) と `this.id` (左辺、フィールドの id) は別物
- `this` は「今操作している this オブジェクト自身」を指す
- 引数名とフィールド名がかぶった時、フィールドの方を指したいときに `this.` を付ける

---

## 追加するファイル (1つ)

### `src/main/java/com/example/rolemgr/domain/User.java`

```java
package com.example.rolemgr.domain;

/**
 * ユーザ ドメイン (= users テーブル 1行を表す POJO)
 *
 * POJO = Plain Old Java Object = 「フレームワークに縛られない普通の Java クラス」
 * 継承・特殊アノテーションなしで、フィールドと getter/setter だけを持つ
 */
public class User {

    // ---- フィールド (users テーブルの各カラムに対応) ----

    /** ユーザID (画面表示上の "ID: XXXX")、users テーブルの id カラム */
    private String id;

    /** BCrypt でハッシュ化されたパスワード、users テーブルの password カラム */
    private String password;

    /** 役職 (部長 / 課長 / 係長 / 主任 / 一般 など)、users テーブルの role カラム */
    private String role;

    // ---- getters / setters (私は private なので必ずここを経由してアクセスする) ----

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

## この class が実際に「1行 = 1オブジェクト」になる例

`SELECT * FROM users;` の結果:

| id | password | role |
|---|---|---|
| u001 | $2a$10$... | 部長 |
| u002 | $2a$10$... | 課長 |

これが MyBatis によって Java の世界に持ち込まれると:

```java
User u1 = new User();
u1.setId("u001");
u1.setPassword("$2a$10$...");
u1.setRole("部長");

User u2 = new User();
u2.setId("u002");
u2.setPassword("$2a$10$...");
u2.setRole("課長");
```

**1 行 = 1 個の User オブジェクト**。テーブル ⇄ オブジェクトの変換のためだけに存在する class。

## よく出る初心者の疑問

### Q: なぜ「Lombok」使わないの?
A: Lombok は `@Data` 一発で getter/setter を自動生成できる便利ライブラリ。**実案件では使う**。研修中は「まず生の Java を見せる」意図であえて手書き。

### Q: なぜ `new User()` で作れる? コンストラクタが無い
A: **コンストラクタを 1 個も書かないと、Java は暗黙で「引数なしコンストラクタ (デフォルトコンストラクタ)」を用意してくれる**。MyBatis はこのデフォルトコンストラクタで空の User を作って setter で値を詰めていく。

### Q: フィールドを `public` にすれば getter/setter いらないよね?
A: 動くけど**やらない**。理由:
- MyBatis や JSTL の EL は getter を期待している (`user.getId()` を呼ぶ)
- 将来のバリデーション追加が効かなくなる
- 業界の慣習に沿っていない → チームで読めない

### Q: `User` という名前が Spring Security の User と被る
A: パッケージが違えば別クラスとして共存できる。
- `com.example.rolemgr.domain.User` (自作)
- `org.springframework.security.core.userdetails.User` (Spring 側)
- 認証コード (Step 06 で書く) では両方登場 → 片方はフルパスで書く

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/java/com/example/rolemgr/
├── RolemgrApplication.java
└── domain/
    └── User.java                          ← 追加
```

## 動作確認

```powershell
mvn compile
```

**`BUILD SUCCESS`** が出れば OK。まだ画面には出ない。

## 次

→ [Step 04: Mapper](/steps/04-mapper)
