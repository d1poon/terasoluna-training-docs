---
title: "Repository 統合テスト (@MybatisTest + H2)"
date: 2026-07-28
tags: [type/learning, type/training, tech/mybatis, tech/junit5, tech/test]
step: 14
---

# Step 14 — Repository 統合テスト (@MybatisTest + H2)

## このステップのゴール

- Repository (`UserRepository`) を実 DB (H2 in-memory) に対して動作させる統合テスト
- SQL 側のバグ (LIKE パターン、`||` 演算子、typo) を検出する
- Service 単体テスト (Step 13) では見つからない「XML 側の問題」を捕まえる

## 事前準備

- [Step 13](/steps/13-service-test) 完了
- `demo-initdb` の DDL / データ SQL が動く状態

## 追加するファイル (1 つ)

### `UserRepositoryTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-domain/src/test/java/com/example/demo/domain/repository/user/</div>
    <div class="ft-line ft-l1 ft-file">📄 UserRepositoryTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.domain.repository.user;

import java.util.List;
import jakarta.inject.Inject;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.model.User;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)                                             // ①
@ContextConfiguration(locations = {
    "classpath:/META-INF/spring/demo-domain.xml",
    "classpath:/META-INF/spring/demo-infra.xml",
    "classpath:/META-INF/spring/demo-env.xml"                                  // ②
})
@Transactional                                                                 // ③
class UserRepositoryTest {

    @Inject
    UserRepository userRepository;

    @Test
    void findById_u001() {
        User u = userRepository.findById("u001");
        assertNotNull(u);
        assertEquals("u001", u.getId());
    }

    @Test
    void findByRole_部分一致_ADMIN() {
        List<User> admins = userRepository.findByRole("ADMIN");
        assertEquals(2, admins.size());                                        // ④
    }

    @Test
    void updateRole_変更が反映される() {
        int affected = userRepository.updateRole("u001", "ROLE_ADMIN");
        assertEquals(1, affected);
        User u = userRepository.findById("u001");
        assertEquals("ROLE_ADMIN", u.getRole());
    }
}
```

#### なぜこう書く

- **① `@ExtendWith(SpringExtension.class)`** — JUnit 5 + Spring TestContext を統合。Spring の DI がテスト内で使える
- **② `@ContextConfiguration`** — 実際の Spring 設定 XML を読み込む。demo-domain の Bean + MyBatis 設定 + DB 接続情報 (env)
- **③ `@Transactional`** — 各テストメソッドの終わりで自動 rollback。テストが互いに影響しない
- **④ initdb の投入データを前提** — サンプルデータで ROLE_ADMIN は 2 名 (u003, u004)

## demo-domain の pom.xml 依存確認

`terasoluna-gfw-parent` により Spring Test は既に test scope で解決される。加えて test 時の実行に H2 が必要 → `demo-env` の dependency が test scope でも効くよう `demo-domain/pom.xml` に:

```xml
<dependency>
    <groupId>${project.groupId}</groupId>
    <artifactId>demo-env</artifactId>
    <scope>test</scope>
</dependency>
```

## 動作確認

```powershell
cd demo
mvn -pl demo-domain test
```

すべてのテストが green なら OK。SQL バグがあれば「期待値 2 、実際 0」等で失敗する。

## Service モックテスト (Step 13) との違い

| 検出できるバグ | Service モック (Step 13) | Repository 統合 (このステップ) |
|---|---|---|
| Service 側のロジックミス | ✅ | ✅ (実行はできるがコスト高) |
| SQL の LIKE パターン間違い | ❌ | ✅ |
| XML の namespace typo | ❌ | ✅ (Invalid bound statement で失敗) |
| DB カラムの追加漏れ | ❌ | ✅ |
| Java コードの nullability バグ | ✅ | ✅ |

**両方書くのが正解**。Service モックで速く回し、Repository 統合で SQL の実挙動を保証する。

## よくある詰まり

- **`Invalid bound statement (not found)`**: XML の namespace が interface と typo。テストで初めて気づくのはよくある
- **`NoSuchBeanDefinitionException`**: `@ContextConfiguration` の locations が足りない。`demo-infra.xml` を忘れがち
- **DB データが 0 件**: `initialize-database` が test 実行時にも流れているか。`ignore-failures="ALL"` で silent skip されていないか

## 次

→ [Step 15: Controller テスト (MockMvc)](/steps/15-controller-test)
