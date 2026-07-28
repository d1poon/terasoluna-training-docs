---
title: "Service 単体テスト (JUnit5 + Mockito)"
date: 2026-07-28
tags: [type/learning, type/training, tech/junit5, tech/mockito, tech/test]
step: 13
---

# Step 13 — Service 単体テスト (JUnit5 + Mockito)

## このステップのゴール

- `UserServiceImpl` の単体テストを Mockito で書く
- Repository を **モック** に差し替えて、Service の業務ロジックだけを検証する
- 「壊れないことを機械的に保証する網」を張る

## 事前準備

- [Step 12](/steps/12-complete) 完了

## テストの位置付け (3 段)

- **Step 13 (このステップ)** — Service 単体、Repository はモック、DB は触らない、msec レベルで速い
- **Step 14** — Repository 統合テスト、H2 に実 SQL を流す、SQL バグを検出
- **Step 15** — Controller テスト、MockMvc で URL / Model / View / Security を検証

## 追加するファイル (1 つ)

### `UserServiceImplTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-domain/src/test/java/com/example/demo/domain/service/user/</div>
    <div class="ft-line ft-l1 ft-file">📄 UserServiceImplTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.domain.service.user;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.domain.model.User;
import com.example.demo.domain.repository.user.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)                                            // ①
class UserServiceImplTest {

    @Mock                                                                      // ②
    UserRepository userRepository;

    @InjectMocks                                                               // ③
    UserServiceImpl userService;

    @Test
    void findById_存在するユーザ() {
        User expected = new User();
        expected.setId("u001");
        expected.setRole("ROLE_USER");
        when(userRepository.findById("u001")).thenReturn(expected);            // ④

        User actual = userService.findById("u001");

        assertEquals("u001", actual.getId());
        assertEquals("ROLE_USER", actual.getRole());
        verify(userRepository, times(1)).findById("u001");
    }

    @Test
    void searchByRole_null_を空文字扱いにする() {                              // ⑤
        when(userRepository.findByRole("")).thenReturn(Collections.emptyList());

        List<User> results = userService.searchByRole(null);

        assertTrue(results.isEmpty());
        verify(userRepository).findByRole("");
    }

    @Test
    void updateRole_リポジトリに委譲() {
        userService.updateRole("u001", "ROLE_ADMIN");

        verify(userRepository).updateRole("u001", "ROLE_ADMIN");
    }
}
```

#### なぜこう書く

- **① `@ExtendWith(MockitoExtension.class)`** — JUnit 5 の拡張ポイントで Mockito のライフサイクル管理を有効に
- **② `@Mock UserRepository`** — Repository を mock 化。実 DB は触らない
- **③ `@InjectMocks UserServiceImpl`** — テスト対象。`@Mock` フィールドを自動注入 (`@Inject` フィールドに mock がセットされる)
- **④ `when(...).thenReturn(...)`** — Repository がこう呼ばれたらこう返す、というスタブ
- **⑤ 業務ロジックの検証** — 「null なら空文字扱い」は Service 側のロジック。ここでバグると検索が壊れる

## demo-domain の pom.xml 依存確認

`terasoluna-gfw-parent` により JUnit 5 + Mockito は既に test scope で解決される。追加は不要。

## 動作確認

```powershell
cd demo
mvn -pl demo-domain test
```

すべてのテストが green (成功) なら OK。

## よくある詰まり

- **`NullPointerException` in `@InjectMocks`**: フィールドインジェクション (`@Inject`) の場合、`@InjectMocks` は `field.setAccessible(true)` を経由してリフレクションでフィールドに値を書き込むため、**`private` であっても注入自体は問題なく行われる** (Mockito の標準動作)。`NullPointerException` になる典型原因は、フィールドの型と `@Mock` の型が一致しない、または候補になる `@Mock` が複数あって曖昧なケース。package-private (デフォルト可視性) にすることがあるのは「テストコードから直接フィールドを参照・上書きしたい」といった可視性上の理由であり、Mockito の注入可否とは関係ない
- **`UnnecessaryStubbingException`**: `when().thenReturn()` を書いたのにその呼び出しが実際になかったケース。テストの意図と実装の乖離を示唆
- **`Method X was not called`**: `verify(...)` で「呼ばれるはず」と書いた呼び出しが無い。Service 側で条件分岐して呼ばない経路になっている可能性

## 次

→ [Step 14: Repository 統合テスト (@MybatisTest + H2)](/steps/14-mapper-test)
