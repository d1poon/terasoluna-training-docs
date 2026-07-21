---
title: "Service (業務ロジック係)"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring]
step: 05
---

# Step 05 — Service (業務ロジック係)

## このステップのゴール

- 3層アーキテクチャの**中間層** (Service) を作る
- Controller が Service を呼び、Service が Mapper を呼ぶ、という**呼び出し方向**を確立
- トランザクション境界をここに置く

## 事前準備

- [Step 04](/steps/04-mapper) 完了

## 追加するファイル (1つ)

### `src/main/java/com/training/rolemgr/service/UserService.java`

```java
package com.training.rolemgr.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.training.rolemgr.domain.User;
import com.training.rolemgr.repository.UserMapper;

@Service
@Transactional
public class UserService {

    private final UserMapper userMapper;

    /** コンストラクタ注入 (Spring 4.3+ なら @Autowired 省略可) */
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public User findById(String id) {
        return userMapper.findById(id);
    }

    @Transactional(readOnly = true)
    public List<User> searchByRole(String role) {
        return userMapper.findByRole(role == null ? "" : role);
    }

    public void updateRole(String id, String newRole) {
        userMapper.updateRole(id, newRole);
    }
}
```

## なぜ Service を分けるか (受講者から絶対来る質問)

Controller で直接 Mapper を呼べば動くのに、なぜ Service を挟む?

1. **トランザクション境界**を明示できる。`@Transactional` は Service に付けるのが定石
2. **業務ロジック**をここに集約 (例: 「役職が空文字なら全件検索扱い」のような判定)
3. **テストしやすい**: Controller は HTTP 変換のテスト、Service はロジックのテストと分離できる
4. **複数の Mapper を跨ぐ処理**をここに書ける (例: users と roles を JOIN 検索)

「今回は Mapper を素通しするだけじゃん」と思うかもしれないが、**将来ロジックが増える場所を先に用意しておく**のが正解。

## `@Transactional(readOnly = true)` の意味

- 参照系メソッドに付ける最適化ヒント
- 一部の DB (Oracle など) は「更新なし」と分かると内部でロックを緩めたりする
- H2 では大きな効果はないが、**書き方の慣習として身につける**

## コンストラクタ注入 vs フィールド注入

```java
// フィールド注入 (見かけるが非推奨)
@Autowired
private UserMapper userMapper;

// コンストラクタ注入 (推奨、これを使う)
private final UserMapper userMapper;
public UserService(UserMapper userMapper) {
    this.userMapper = userMapper;
}
```

コンストラクタ注入の利点:
- **`final`** にできる → 後から差し替えられない = 意図しない書き換え防止
- **`null` を許さない**依存を明示 (必須依存だとわかる)
- **テストで簡単にモック注入**できる (`new UserService(mockMapper)`)

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/java/com/training/rolemgr/
├── RolemgrApplication.java
├── domain/User.java
├── repository/UserMapper.java
└── service/
    └── UserService.java                   ← 追加
```

## 動作確認

`mvn compile` → **`BUILD SUCCESS`**

## 次

→ [Step 06: 認証基盤](/steps/06-auth-foundation)
