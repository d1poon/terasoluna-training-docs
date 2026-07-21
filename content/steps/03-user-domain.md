---
title: "User ドメイン"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/java]
step: 03
---

# Step 03 — User ドメインクラス

## このステップのゴール

- `users` テーブルの 1行を Java オブジェクトで表す POJO を作る
- getter / setter を全部書く

**このステップは 5分で終わる**。極めてシンプル。ただし後の全ステップの土台。

## 事前準備

- [Step 02](/steps/02-empty-boot) 完了

## 追加するファイル (1つ)

### `src/main/java/com/training/rolemgr/domain/User.java`

```java
package com.training.rolemgr.domain;

/**
 * ユーザ ドメイン (= users テーブル 1行を表す POJO)
 */
public class User {

    private String id;
    private String password;
    private String role;

    // ---- getters / setters ----
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

## なぜこう書く

- **フィールド名は DB カラム名に対応**: `id` / `password` / `role`。MyBatis が自動で結び付けてくれる
- **`@Entity` は付けない**: JPA / Hibernate なら必要。MyBatis はいらない
- **Lombok の `@Data` を使わない**: 研修中は「Java 生の書き方」を見せるため。実案件では Lombok 使って OK
- **アクセス修飾子は private**: フィールドは外から直接触らせない。getter/setter 経由でアクセス (カプセル化)

## 「User」という名前が Spring Security の User と被る話

- パッケージが違うので**共存できる**: `com.training.rolemgr.domain.User` と `org.springframework.security.core.userdetails.User`
- 後で認証コードを書く時、両方を import すると片方をフルパスで書く必要が出る
- 気になるなら `UserEntity` に改名しても OK。この教材では課題仕様に合わせて `User` を採用

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/java/com/training/rolemgr/
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
