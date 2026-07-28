---
title: "Mapper (SQL 係)"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/mybatis, tech/sql]
step: 04
---

# Step 04 — Mapper (SQL 係)

## このステップのゴール

- MyBatis の Mapper (SQL を発行する層) を作る
- Java 側は **メソッド定義だけ**、SQL は XML に切り出す
- 3層アーキテクチャの**一番下 (Repository 層)** が完成

## 事前準備

- [Step 03](/steps-boot/03-user-domain) 完了

## 追加するファイル (2つ、ペアで動く)

> 💡 **このステップで登場する用語**
> - **完全修飾名** = パッケージ名 + クラス名の全体。例: `com.example.rolemgr.repository.UserMapper`。「Java 全世界で 1 つに決まる名前」。
> - **namespace** = XML の中で「どの Java interface と紐付けるか」を書く属性。ここに Java の完全修飾名を入れることで、XML の SQL がその interface のメソッドと結びつく。

### 1. `UserMapper.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/main/java/</div>
    <div class="ft-line ft-l2">📁 com/example/rolemgr/</div>
    <div class="ft-line ft-l3">📁 repository/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l4 ft-file">📄 UserMapper.java <span class="ft-tag">新規</span></div>
  </div>
</div>

**インターフェース**。Java 側からは「このメソッドを呼ぶ」という契約だけ。

```java
package com.example.rolemgr.repository;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.rolemgr.domain.User;

@Mapper                                                                 // ①
public interface UserMapper {                                           // ②

    /** ログイン用: 主キーで1件取得 */
    User findById(@Param("id") String id);                              // ③

    /** 検索画面用: 役職 (部分一致) で0件以上取得 */
    List<User> findByRole(@Param("role") String role);

    /** 変更画面用: 役職を更新 */
    int updateRole(@Param("id") String id, @Param("role") String role); // ④
}
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。下の一覧も同じ内容です。

- **① `@Mapper`** — MyBatis に「これは Mapper インターフェースだよ」と知らせるラベル。起動時に MyBatis Spring Boot Starter が走査し、**実装クラスを自動生成**して Bean として DI 用に登録する。
- **② `interface UserMapper`** — 抽象メソッドの列挙のみで、**実装は書かない**。実装は MyBatis が実行時に (対応する XML の SQL を使って) 動的に生成する。
- **③ `User findById(@Param("id") String id)`** — 「id を渡すと User が 1 件返る」という契約。XML 側の `<select id="findById">` と名前で紐付く。戻り値型 `User` = 検索結果 1 行を詰めるオブジェクト。
- **④ `int updateRole(...)`** — 更新系メソッドは通常「更新した行数」を int で返す。`@Param` は引数が 2 つ以上あるときに必須 (XML 側から `#{id}` `#{role}` の名前で参照するため)。

### 2. `UserMapper.xml`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/main/resources/</div>
    <div class="ft-line ft-l2">📁 mapper/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l3 ft-file">📄 UserMapper.xml <span class="ft-tag">新規</span></div>
  </div>
</div>

**SQL 本体**。XML に切り出しておくと、DBA が SQL レビューしやすい (Java コードを読まなくていい)。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.rolemgr.repository.UserMapper">          <!-- ① -->

    <select id="findById" resultType="com.example.rolemgr.domain.User">  <!-- ② -->
        SELECT id, password, role
          FROM users
         WHERE id = #{id}                                                <!-- ③ -->
    </select>

    <select id="findByRole" resultType="com.example.rolemgr.domain.User">
        SELECT id, password, role
          FROM users
         WHERE role LIKE '%' || #{role} || '%'                           <!-- ④ -->
         ORDER BY id
    </select>

    <update id="updateRole">                                             <!-- ⑤ -->
        UPDATE users
           SET role = #{role}
         WHERE id = #{id}
    </update>

</mapper>
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `namespace="com.example.rolemgr.repository.UserMapper"`** — この XML がどの Java interface とペアなのかを**完全修飾名**で宣言。ここが interface のパスと 1 文字でも違うと `Invalid bound statement` エラーが出る。
- **② `<select id="findById" resultType="...User">`** — `id` = interface のメソッド名と一致させる。`resultType` = 結果 1 行を詰める Java クラスの完全修飾名。MyBatis は `SELECT` の各列を User の同名フィールドに詰めてくれる (`application.properties` の `map-underscore-to-camel-case=true` が snake→camel 変換もしてくれる)。
- **③ `WHERE id = #{id}`** — `#{id}` は Java メソッドの `@Param("id")` から値を受け取り、**PreparedStatement のプレースホルダ (`?`) として**バインドされる。SQL インジェクション安全。
- **④ `role LIKE '%' || #{role} || '%'`** — 部分一致検索。`||` は**SQL 標準の文字列連結**演算子 (H2 / PostgreSQL / Oracle で動く)。MySQL では `CONCAT('%', #{role}, '%')` に変える必要あり。
- **⑤ `<update id="updateRole">`** — 更新系は `<select>` ではなく `<update>` タグを使う (`<insert>` `<delete>` も同様)。戻り値の int は影響を受けた行数を返す。

## なぜこう書く

### ① `#{xxx}` と `${xxx}` の違い (絶対に混同しないこと)

XML の SQL の中で 一番目立つのがこれ。両者は見た目は似ているが**中身は別物**:

| | 内部動作 | SQL インジェクションのリスク | 使う場面 |
|---|---|---|---|
| `#{name}` | PreparedStatement のプレースホルダ (`?`) | 安全 | 99% はこれ |
| `${name}` | 文字列連結 (SQL に直接埋め込む) | 危険 | 動的なテーブル名など特殊ケース |

**迷ったら `#{}`** と覚える。ユーザ入力を受け取る箇所で `${}` を使うと SQL インジェクション攻撃を許すことになる。

### ② インターフェースと XML の紐付けルール

`namespace` を鍵に、Java 側の interface と XML の SQL がぴったり結合する:

- **XML の `namespace`** = **インターフェースの完全修飾名**
- **XML の `<select id="X">` の X** = **インターフェースのメソッド名 X**
- **`resultType`** = 結果の各行を詰めるクラスの完全修飾名

このルールを守れば、MyBatis が実行時にインターフェースの実装を自動生成してくれる (自分で `class UserMapperImpl` を書く必要がない)。

### ③ `@Mapper` アノテーション
- MyBatis Spring Boot Starter が起動時に走査し、**このインターフェースの実装を自動作成**して DI 用 Bean として登録
- Terasoluna archetype では `MapperScannerConfigurer` を XML で書くが、Boot は `@Mapper` だけで OK

### ④ `@Param` は何のため?
- 引数が **2 つ以上**あるとき、XML 側からアクセスする名前を明示する必要がある
- 引数が 1 つのときは省略しても動くが、**常に付けるのが安全**

## ディレクトリ構造 (このステップ完了時)

```
rolemgr/src/main/
├── java/com/example/rolemgr/
│   ├── RolemgrApplication.java
│   ├── domain/User.java
│   └── repository/
│       └── UserMapper.java                ← 追加
└── resources/
    ├── application.properties
    ├── schema.sql
    └── mapper/
        └── UserMapper.xml                 ← 追加
```

## 動作確認

```powershell
mvn compile
```

**`BUILD SUCCESS`** で OK。まだ画面には反映されない。

### 落とし穴

- **`Invalid bound statement (not found)`** エラー: XML の `namespace` と Java クラスのパスが 1 文字でも違うと出る。両者を並べて 1 文字ずつ目視で照合する
- **`resultType` に short name を書いても動く場合がある** (Boot の型エイリアス設定次第) が、**完全修飾名で書く方が確実**

## 次

→ [Step 05: Service](/steps-boot/05-service)
