---
title: "Repository 統合テスト (SpringExtension + XML Context + H2)"
date: 2026-07-30
tags: [type/learning, type/training, tech/mybatis, tech/junit5, tech/test]
step: 12
---

# Step 12 — Repository 統合テスト (SpringExtension + XML Context + H2)

## このステップのゴール

- Repository (`UserRepository`) を実 DB (H2 in-memory) に対して動作させる統合テスト
- SQL 側のバグ (LIKE パターン、`||` 演算子、typo) を検出する
- Service 単体テスト (Step 11) では見つからない「XML 側の問題」を捕まえる

> このステップのメソッド名・件数は [Step 03](/steps-basic/03-user-domain)・[Step 04](/steps-basic/04-repository) で定義した Entity / Repository / 初期データに合わせている。実際の定義と違う場合は件数・メソッド名ともに読み替えること。

## 事前準備

- [Step 11](/steps-basic/11-service-test) 完了
- `demo-env` の DDL / データ SQL (`H2-schema.sql` / `H2-dataload.sql`) が動く状態

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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

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
    void findAll_5件() {
        List<User> all = userRepository.findAll();
        assertEquals(5, all.size());                                          // ④
    }

    @Test
    void findById_u001() {
        User u = userRepository.findById("u001");
        assertNotNull(u);
        assertEquals("u001", u.getId());
    }

    @Test
    void findByRole_一般() {
        List<User> results = userRepository.findByRole("一般");
        assertEquals(2, results.size());                                      // ⑤
    }

    @Test
    void update_変更が反映される() {
        User target = userRepository.findById("u001");
        target.setRole("課長");

        int affected = userRepository.update(target);

        assertEquals(1, affected);
        User updated = userRepository.findById("u001");
        assertEquals("課長", updated.getRole());
    }
}
```

#### なぜこう書く

- **① `@ExtendWith(SpringExtension.class)`** — JUnit 5 + Spring TestContext を統合。Spring の DI がテスト内で使える
- **② `@ContextConfiguration`** — 実際の Spring 設定 XML を読み込む。demo-domain の Bean + MyBatis 設定 + DB 接続情報 (env)。**`@MybatisTest` のような Spring Boot 専用アノテーションは無い** — TERASOLUNA (非 Boot) では常にこの XML Context 方式
- **③ `@Transactional`** — 各テストメソッドの終わりで自動 rollback。テストが互いに影響しない
- **④ `H2-dataload.sql` の投入データを前提** — サンプルデータは 5 件 (Step 03/04 の想定)
- **⑤ 同上** — サンプルデータで role = 「一般」は 2 名という前提 (実際のデータと違う場合は数値を読み替える)

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

## Service モックテスト (Step 11) との違い

| 検出できるバグ | Service モック (Step 11) | Repository 統合 (このステップ) |
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
- **DB データが 0 件・件数が合わない**: `initialize-database` が test 実行時にも流れているか。`ignore-failures="ALL"` で silent skip されていないか。または `H2-dataload.sql` の実データ件数が Step 03/04 で決めた件数と違っていないか確認する

## 次

→ [Step 13: Controller テスト (MockMvc)](/steps-basic/13-controller-test)
