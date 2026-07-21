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

- [Step 03](/steps/03-user-domain) 完了

## 追加するファイル (2つ、ペアで動く)

### 1. `src/main/java/com/example/rolemgr/repository/UserMapper.java`

**インターフェース**。Java 側からは「このメソッドを呼ぶ」という契約だけ。

```java
package com.example.rolemgr.repository;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.rolemgr.domain.User;

@Mapper
public interface UserMapper {

    /** ログイン用: 主キーで1件取得 */
    User findById(@Param("id") String id);

    /** 検索画面用: 役職 (部分一致) で0件以上取得 */
    List<User> findByRole(@Param("role") String role);

    /** 変更画面用: 役職を更新 */
    int updateRole(@Param("id") String id, @Param("role") String role);
}
```

### 2. `src/main/resources/mapper/UserMapper.xml`

**SQL 本体**。XML に切り出しておくと、DBA が SQL レビューしやすい (Java コードを読まなくていい)。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.rolemgr.repository.UserMapper">

    <select id="findById" resultType="com.example.rolemgr.domain.User">
        SELECT id, password, role
          FROM users
         WHERE id = #{id}
    </select>

    <select id="findByRole" resultType="com.example.rolemgr.domain.User">
        SELECT id, password, role
          FROM users
         WHERE role LIKE '%' || #{role} || '%'
         ORDER BY id
    </select>

    <update id="updateRole">
        UPDATE users
           SET role = #{role}
         WHERE id = #{id}
    </update>

</mapper>
```

## なぜこう書く

### インターフェースと XML の紐付けルール
- **XML の `namespace`** = **インターフェースの完全修飾名**
- **XML の `<select id="X">` の X** = **インターフェースのメソッド名 X**
- **`resultType`** = 結果の各行を詰めるクラスの完全修飾名

このルールを守れば、MyBatis が実行時にインターフェースの実装を自動生成してくれる。

### `#{xxx}` と `${xxx}` の違い (絶対に混同しないこと)

| | 内部動作 | SQLインジェクションのリスク | 使う場面 |
|---|---|---|---|
| `#{name}` | PreparedStatement のプレースホルダ (`?`) | 安全 | 99% はこれ |
| `${name}` | 文字列連結 (SQL に直接埋め込む) | 危険 | 動的なテーブル名など特殊ケース |

### `@Mapper` アノテーション
- MyBatis Spring Boot Starter が起動時に走査し、**このインターフェースの実装を自動作成**して DI 用 Bean として登録
- Terasoluna archetype では `MapperScannerConfigurer` を XML で書くが、Boot は `@Mapper` だけで OK

### `@Param` は何のため?
- 引数が **2 つ以上**あるとき、XML 側からアクセスする名前を明示する必要がある
- 1 引数のときは省略しても動くが、**常に付けるのが安全**

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/
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

- **`Invalid bound statement (not found)`** エラー: XML の `namespace` と Java クラスのパスが 1文字でも違うと出る。目 grep でチェック
- **`resultType` に short name を書いても動く場合がある** (Boot の型エイリアス設定次第) が、**完全修飾名で書く方が確実**

## 次

→ [Step 05: Service](/steps/05-service)
