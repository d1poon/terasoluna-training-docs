---
title: "Repository (SQL 係) + MyBatis 起動"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/mybatis, tech/sql]
step: 04
---

# Step 04 — Repository (SQL 係) + MyBatis 起動

## このステップのゴール

- MyBatis の Repository (SQL を発行する層) を作る
- **TERASOLUNA 規約**: interface 名は `UserRepository` (Boot 版 `UserMapper` から改名)
- XML は **Java interface と同じパッケージパス** に配置 (`resources/mapper/*.xml` 一括ではない)
- 起動時に initdb の DDL が流れ、H2 に空 users テーブルができるところまで通す

## 事前準備

- [Step 03](/steps/03-user-domain) 完了

## 用語

- **Repository** = SQL を発行する層。TERASOLUNA 規約の呼称。Boot 単一版では `Mapper` と呼んでいた
- **完全修飾名** = パッケージ名 + クラス名の全体 (例: `com.example.demo.domain.repository.user.UserRepository`)
- **namespace** = XML の中で「どの Java interface と紐付けるか」を書く属性。**Java interface の完全修飾名を入れる**

## 追加するファイル (3 つ)

### 1. `UserRepository.java` (interface)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-domain/</div>
    <div class="ft-line ft-l2">📁 src/main/java/</div>
    <div class="ft-line ft-l3">📁 com/example/demo/domain/repository/</div>
    <div class="ft-line ft-l4">📁 user/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l5 ft-file">📄 UserRepository.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.domain.repository.user;                              // ①

import java.util.List;
import org.apache.ibatis.annotations.Param;

import com.example.demo.domain.model.User;

/**
 * users テーブルへの CRUD を行う Repository (MyBatis)。
 * 実装は同一パッケージパスに置かれた UserRepository.xml が担う。
 */
public interface UserRepository {                                              // ②

    /** ログイン用: 主キーで 1 件取得 */
    User findById(@Param("id") String id);                                     // ③

    /** 検索画面用: 役職 (部分一致) で 0 件以上取得 */
    List<User> findByRole(@Param("role") String role);

    /** 変更画面用: 役職を更新。戻り値は影響行数 */
    int updateRole(@Param("id") String id, @Param("role") String role);        // ④
}
```

#### なぜこう書く

- **① `package com.example.demo.domain.repository.user`** — TERASOLUNA 規約: Repository は **usecase 別サブパッケージ** に置く (`user`, `role` など)。Entity (`domain.model`) は共有だが、Repository は usecase ごと
- **② `interface UserRepository`** — MyBatis が自動で実装クラスを生成する。手で `UserRepositoryImpl` を書く必要は無い
- **③ `@Param("id")`** — XML 側から `#{id}` で参照できるようにする。**引数 1 個でも書くのが安全** (2 個以上のときは省略不可)
- **④ 戻り値 `int`** — MyBatis の `<update>` タグは影響行数を返す。楽観ロック実装 (Step 12.5) で使う

> `@Mapper` アノテーションは **不要**。TERASOLUNA では XML 側の設定 (`mybatis:scan`) で Repository interface が Bean 登録される。Boot 版と大きく違う点。

### 2. `UserRepository.xml` (SQL 本体)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成 (Java と同じパッケージパスを resources 側にミラー)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-domain/</div>
    <div class="ft-line ft-l2">📁 src/main/resources/</div>
    <div class="ft-line ft-l3">📁 com/example/demo/domain/repository/</div>
    <div class="ft-line ft-l4">📁 user/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l5 ft-file">📄 UserRepository.xml <span class="ft-tag">新規</span></div>
  </div>
</div>

**重要**: 配置場所は `resources/mapper/UserRepository.xml` **ではない**。Java interface と**同じパッケージパスを `resources/` 配下にミラー**する。理由は MyBatis が Java の classpath 上で interface と同一階層の XML を自動探索するため。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.demo.domain.repository.user.UserRepository">    <!-- ① -->

    <select id="findById" resultType="com.example.demo.domain.model.User">     <!-- ② -->
        SELECT id, password, role
          FROM users
         WHERE id = #{id}                                                        <!-- ③ -->
    </select>

    <select id="findByRole" resultType="com.example.demo.domain.model.User">
        SELECT id, password, role
          FROM users
         WHERE role LIKE '%' || #{role} || '%'                                   <!-- ④ -->
         ORDER BY id
    </select>

    <update id="updateRole">                                                    <!-- ⑤ -->
        UPDATE users
           SET role = #{role}
         WHERE id = #{id}
    </update>

</mapper>
```

#### なぜこう書く

- **① `namespace="com.example.demo.domain.repository.user.UserRepository"`** — Java interface の完全修飾名を書く。**1 文字でも違うと `Invalid bound statement` エラーで落ちる**
- **② `resultType="com.example.demo.domain.model.User"`** — 結果 1 行を詰める Java クラスの完全修飾名。TERASOLUNA では Entity が `domain.model` にあるのでこのパス
- **③ `#{id}`** — PreparedStatement のプレースホルダ。バインドされる = SQL インジェクション安全。`${}` (文字列連結) は使わない
- **④ `LIKE '%' || #{role} || '%'`** — SQL 標準の文字列連結演算子 `||` を使う (H2 の `MODE=PostgreSQL` で有効)。MySQL では `CONCAT` が必要だが、TERASOLUNA 前提の Oracle/PostgreSQL では `||` が動く
- **⑤ `<update>` タグ** — INSERT/UPDATE/DELETE 用。戻り値は影響行数

### 3. `demo-domain.xml` の `mybatis:scan` を確認

archetype 生成品の `demo-domain/src/main/resources/META-INF/spring/demo-domain.xml` に、既に以下の記述があるはず (無ければ追加):

```xml
<mybatis:scan base-package="com.example.demo.domain.repository" />
```

**これが Repository interface を Bean 登録している核心**。`base-package` 以下の interface を自動走査し、XML と紐付けて Bean を生成する。Boot 版の `@Mapper` に相当する仕組み。

### 4. 起動時 DDL 実行の設定 (demo-env 側・確認のみ)

`demo-env/src/main/resources/META-INF/spring/demo-env.xml` には、archetype 生成時点で既に次の設定が入っている (Step 03 で触れた通り、読者側での追加は不要):

```xml
<jdbc:initialize-database data-source="dataSource" ignore-failures="ALL">
    <jdbc:script location="classpath:/database/${database}-schema.sql" encoding="UTF-8" />
    <jdbc:script location="classpath:/database/${database}-dataload.sql" encoding="UTF-8" />
</jdbc:initialize-database>
```

`demo-infra.properties` の `database=H2` により `${database}` は `H2` に解決される。つまり `demo-env/src/main/resources/database/H2-schema.sql` (Step 03 で追記した DDL) が起動時に自動で実行される。

## 動作確認

### 4-a. コンパイル

```powershell
cd demo
mvn -pl demo-domain -am compile
```

### 4-b. Tomcat 起動 → H2 コンソール確認

```powershell
mvn -pl demo-web -am cargo:run
```

http://localhost:8080/demo-web/h2-console/ (archetype デフォルトで有効) にアクセスし、`demo-infra.properties` と同じ接続情報でログイン。`SELECT * FROM users;` が「0 件」で通れば成功 (テーブルが作られている)。

## よくある詰まり

- **`Invalid bound statement (not found): com.example.demo.domain.repository.user.UserRepository.findById`** — 頻出。原因はほぼ以下のどれか:
  1. XML の `namespace` が interface と 1 文字違う (typo)
  2. XML の配置場所が interface と同じパッケージパスでない (`resources/mapper/` に置いてしまった)
  3. `<mybatis:scan base-package="..."/>` のパスが repository package を含んでいない
  4. IDE で resources が classpath として認識されていない (`mvn clean install` で解決することが多い)
- **`resultType` 探索エラー** — Entity の完全修飾名を正確に (`domain.model` の `.` を忘れがち)
- **DDL が流れない**: `demo-env.xml` の `<jdbc:initialize-database>` が読まれていない → `applicationContext.xml` の import に `demo-env.xml` が入っているか確認

## 次

→ [Step 05: Service (interface + Impl)](/steps/05-service)
