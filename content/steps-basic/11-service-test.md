---
title: "Service 単体テスト (JUnit5 + Mockito)"
date: 2026-07-30
tags: [type/learning, type/training, tech/junit5, tech/mockito, tech/test]
step: 11
---

# Step 11 — Service 単体テスト (JUnit5 + Mockito)

## このステップのゴール

- `UserServiceImpl` の単体テストを Mockito で書く
- Repository を **モック** に差し替えて、Service の業務ロジックだけを検証する
- 「壊れないことを機械的に保証する網」を張る

> このステップのメソッド名・クラス名は [Step 04](/steps-basic/04-repository)・[Step 05](/steps-basic/05-service) で定義したものを前提にしている。実際に自分が付けた名前と違う場合は読み替えること。

## 事前準備

- [Step 10](/steps-basic/10-complete) 完了

## テストの位置付け (3 段)

- **Step 11 (このステップ)** — Service 単体、Repository はモック、DB は触らない、msec レベルで速い
- **Step 12** — Repository 統合テスト、H2 に実 SQL を流す、SQL バグを検出
- **Step 13** — Controller テスト、MockMvc で URL / Model / View を検証

このトラックには Spring Security が無いため、Step 13 の Controller テストは認証がらみの分岐を一切気にしなくてよい。3 段とも「業務ロジックが正しいか」だけに集中できるのがこのトラックの利点。

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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.domain.model.User;
import com.example.demo.domain.repository.user.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)                                            // ①
class UserServiceImplTest {

    @Mock                                                                      // ②
    UserRepository userRepository;

    @InjectMocks                                                               // ③
    UserServiceImpl userService;

    @Test
    void findAll_全件取得() {
        User u1 = new User(); u1.setId("u001"); u1.setName("田中"); u1.setRole("部長");
        User u2 = new User(); u2.setId("u002"); u2.setName("佐藤"); u2.setRole("課長");
        when(userRepository.findAll()).thenReturn(Arrays.asList(u1, u2));

        List<User> actual = userService.findAll();

        assertEquals(2, actual.size());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void findById_存在するユーザ() {
        User expected = new User();
        expected.setId("u001");
        expected.setRole("部長");
        when(userRepository.findById("u001")).thenReturn(expected);            // ④

        User actual = userService.findById("u001");

        assertEquals("u001", actual.getId());
        assertEquals("部長", actual.getRole());
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
    void update_リポジトリに委譲() {
        User target = new User();
        target.setId("u001");
        target.setName("田中");
        target.setRole("課長");

        userService.update(target);

        verify(userRepository).update(target);
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

→ [Step 12: Repository 統合テスト (SpringExtension + XML Context + H2)](/steps-basic/12-repository-test)
