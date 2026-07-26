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

### `UserService.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/main/java/</div>
    <div class="ft-line ft-l2">📁 com/example/rolemgr/</div>
    <div class="ft-line ft-l3">📁 service/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l4 ft-file">📄 UserService.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.rolemgr.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.rolemgr.domain.User;
import com.example.rolemgr.repository.UserMapper;

@Service                                                      // ①
@Transactional                                                // ②
public class UserService {

    private final UserMapper userMapper;                      // ③

    /** コンストラクタ注入 (Spring 4.3+ なら @Autowired 省略可) */
    public UserService(UserMapper userMapper) {               // ④
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)                           // ⑤
    public User findById(String id) {
        return userMapper.findById(id);
    }

    @Transactional(readOnly = true)
    public List<User> searchByRole(String role) {
        return userMapper.findByRole(role == null ? "" : role);
    }

    public void updateRole(String id, String newRole) {       // ⑥
        userMapper.updateRole(id, newRole);
    }
}
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `@Service`** — このクラスを Spring MVC の「業務ロジック係」として登録するラベル。実際の挙動は `@Component` と同じ (Bean 登録) だが、役割を名前で明示する。
- **② `@Transactional` (クラス全体)** — このクラスの**全 public メソッド**をトランザクション境界で包む。メソッド開始で BEGIN、正常終了で COMMIT、例外で ROLLBACK が自動で行われる。個別メソッドの `@Transactional` は上書き。
- **③ `private final UserMapper userMapper;`** — `final` で「後から差し替え不能」を宣言。null を許さないコンストラクタ注入の相棒。
- **④ `public UserService(UserMapper userMapper)`** — コンストラクタ引数に書くだけで Spring が Bean を渡してくれる (**コンストラクタ注入**、DI の推奨形式)。テストで `new UserService(mockMapper)` と書けば単体テストできる。
- **⑤ `@Transactional(readOnly = true)`** — 参照系メソッドの最適化ヒント。DB によっては読み取りロックを緩めるなどの高速化が働く (H2 では効果薄いが「意図の明示」として書く)。
- **⑥ `public void updateRole(...)`** — 更新系はクラス全体の `@Transactional` (readOnly=false) が適用され、SQL 例外時に自動でロールバックされる。

## なぜ Service を分けるか (よくある疑問)

Controller で直接 Mapper を呼べば動くのに、なぜ Service を挟むのか?

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
rolemgr/src/main/java/com/example/rolemgr/
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
