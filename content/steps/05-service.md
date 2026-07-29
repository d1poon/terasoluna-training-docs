---
title: "Service (interface + Impl)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/spring, tech/di]
step: 05
---

# Step 05 — Service (interface + Impl)

## このステップのゴール

- 3 層アーキテクチャの**中間層** (Service) を作る
- **TERASOLUNA 規約**: interface (`UserService`) + 実装 (`UserServiceImpl`) の**ペア**で作る
- **`@Service` / `@Transactional` は Impl 側** に付ける
- DI は **`@Inject`** (Boot 版の `@Autowired` から改める)

## 事前準備

- [Step 04](/steps/04-mapper) 完了 (Repository が動き、テーブルが作られている)

## なぜ interface + Impl のペアで作るのか (TERASOLUNA 規約の理由)

- **DI コンテナの疎結合**: interface を型として持ち回るので、実装差し替え (テスト時のスタブ / モック) がしやすい
- **同名 Impl が意図せず継承されるのを防ぐ**: `UserService` を継承したい場合、interface 実装を書き足すか、Impl を継承するかを明示的に選ぶ
- **公開 API と実装を分離**: Controller は `UserService` (interface) だけ import すれば良い、Impl の具体は隠せる

Spring 単体ならクラス直でも動くが、TERASOLUNA ではこの方針を全 Service に適用する。

## 追加するファイル (2 つ)

### 1. `UserService.java` (interface)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-domain/</div>
    <div class="ft-line ft-l2">📁 src/main/java/</div>
    <div class="ft-line ft-l3">📁 com/example/demo/domain/service/</div>
    <div class="ft-line ft-l4">📁 user/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l5 ft-file">📄 UserService.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.domain.service.user;                                  // ①

import java.util.List;
import com.example.demo.domain.model.User;

/**
 * User 関連の業務ロジック interface。
 * 実装は同一パッケージの UserServiceImpl。
 */
public interface UserService {                                                 // ②
    User findById(String id);
    List<User> searchByRole(String role);
    void updateRole(String id, String newRole);
}
```

#### なぜこう書く

- **① `package com.example.demo.domain.service.user`** — TERASOLUNA 規約: Service は `domain.service.<usecase>` パッケージ
- **② interface で公開 API を定義** — Controller や別 Service からは interface 経由でしか呼べない

### 2. `UserServiceImpl.java` (実装)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成 (interface と同じディレクトリ)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-domain/</div>
    <div class="ft-line ft-l2">📁 src/main/java/com/example/demo/domain/service/user/</div>
    <div class="ft-line ft-l3 ft-file">📄 UserService.java <span class="ft-tag ft-tag--modify">既存</span></div>
    <div class="ft-line ft-l3 ft-file">📄 UserServiceImpl.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.domain.service.user;

import java.util.List;
import jakarta.inject.Inject;                                                  // ①

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.model.User;
import com.example.demo.domain.repository.user.UserRepository;

@Service                                                                       // ②
@Transactional                                                                 // ③
public class UserServiceImpl implements UserService {                          // ④

    @Inject                                                                    // ⑤
    UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)                                            // ⑥
    public User findById(String id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> searchByRole(String role) {
        return userRepository.findByRole(role == null ? "" : role);
    }

    @Override
    public void updateRole(String id, String newRole) {
        userRepository.updateRole(id, newRole);
    }
}
```

#### なぜこう書く

- **① `import jakarta.inject.Inject`** — TERASOLUNA 規約: DI は **JSR-330 の `@Inject`** を使う。Spring 独自の `@Autowired` は使わない (Boot 版と大きく違う点)
- **② `@Service`** — 業務ロジック層の Bean と Spring に伝える。**Impl 側にのみ付ける** (interface には付けない)
- **③ `@Transactional` (クラス全体)** — このクラスの全 public メソッドをトランザクション境界に。**Impl 側にのみ付ける** (interface には付けない)
- **④ `implements UserService`** — interface を確実に実装。`@Override` を全メソッドに付けて実装漏れをコンパイル時に検出
- **⑤ `@Inject UserRepository userRepository`** — フィールド注入 (TERASOLUNA デフォルト)。コンストラクタ注入も許容だが、規約はフィールド + `@Inject`
- **⑥ `@Transactional(readOnly = true)`** — 参照系メソッドの最適化ヒント。書き込みしないことを DB に伝える

### `@Inject` vs `@Autowired` (よくある疑問)

| 観点 | `@Inject` (TERASOLUNA) | `@Autowired` (Spring) |
|---|---|---|
| 出所 | JSR-330 標準 (`jakarta.inject`) | Spring 独自 |
| 挙動 | Spring/CDI/Guice で同一に動く | Spring 専用 |
| `required` 属性 | 無い (Optional 化は Java 8 の `Optional` で) | あり |
| TERASOLUNA 規約 | ⭕ こちらを使う | ✕ 使わない |

**理由**: TERASOLUNA は将来的な DI コンテナ差し替え可能性 + 標準準拠を重視。「Spring 6/7 の @Autowired」→「別コンテナ」への移行が起きても Java 標準の `@Inject` は動く。

### 3. `demo-domain.xml` の `context:component-scan` を確認

archetype 生成品 `demo-domain/src/main/resources/META-INF/spring/demo-domain.xml` に、以下があるはず:

```xml
<context:component-scan base-package="com.example.demo.domain" />
```

**これが `@Service` を付けた Impl を Bean 登録している**。`base-package` は `domain.service` ではなく **`domain` 配下全体**である点に注意 (`domain.repository` 等も同じ scan の対象に入るが、Repository 自体の Bean 化は Step 04 の `<mybatis:scan>` が担う)。Boot の `@ComponentScan` 相当を XML で書く形。`demo-web` 側の `applicationContext.xml` には `context:component-scan` は無い。

## ディレクトリ構造 (このステップ完了時)

```
demo/demo-domain/src/main/java/com/example/demo/domain/
├── model/User.java
├── repository/user/
│   └── UserRepository.java (+ .xml は resources 側)
└── service/user/
    ├── UserService.java              ← 追加
    └── UserServiceImpl.java          ← 追加
```

## 動作確認

```powershell
cd demo
mvn -pl demo-domain -am compile
```

`BUILD SUCCESS` で OK。

## よくある詰まり

- **`@Autowired` を書いてしまう**: 動きはするが TERASOLUNA 規約違反。コードレビューで指摘される。**規約に則って `@Inject` に統一**
- **`@Service` を interface 側に付けてしまう**: interface は Bean 登録できない (Spring がインスタンス化できない)。必ず Impl 側
- **`@Transactional` を Impl に付け忘れ**: SQL 例外が rollback されず、部分更新が残る事故に。**クラス全体に付ける**のが安全
- **`UserRepository` が Bean 登録されていない (NoSuchBeanDefinitionException)**: `<mybatis:scan>` の base-package (Step 04) が repository を含んでいない
- **Impl と interface のメソッドシグネチャがズレる**: `@Override` を全メソッドに付けて、実装漏れをコンパイル時に検出する

## 次

→ [Step 06: 認証基盤 (spring-security.xml + BCrypt)](/steps/06-auth-foundation)
