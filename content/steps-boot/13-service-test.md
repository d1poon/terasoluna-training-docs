---
title: "Service の単体テスト (JUnit5 + Mockito)"
date: 2026-07-27
tags: [type/learning, type/training, tech/junit5, tech/mockito, tech/test]
step: 13
---

# Step 13 — Service の単体テスト (JUnit5 + Mockito)

## このステップのゴール

- **DB に触らずに** UserService の業務ロジックだけをテストする
- Mapper を **モック化** して Service の振る舞いを検証
- **`@ParameterizedTest` + 同値分割**で「試験項目表 → コード」の対応を体感する

「画面が動いた」で終わらず、**「なぜ動くか」を機械的に保証する**のがここからのフェーズ。

## 事前準備

- [Step 12](/steps-boot/12-complete) 完了 (アプリが 5 画面通しで動く)

---

## 🔰 なぜ単体テスト? なぜモック?

**業務ロジックの正しさ**と**DB の SQL の正しさ**は**別の関心事**。

- Service の同値分割 (「role が null / 空 / 存在する / 存在しない」で分岐が正しいか) は Mapper を**モック**すれば DB 無しで速く回せる
- 実 DB との疎通は次の Step 14 (`@MybatisTest`) に任せる
- **1 つの Service に 100 パターンの入力**を投げるとき、DB を立てていたら現実的に回らない — Mockito なら数秒

> 💡 **Mock** = 本物と同じ interface を持つ「偽物」。呼ばれた履歴と、事前に決めた戻り値を返す機能を持つ

---

## 依存の追加

<div class="file-location">
  <div class="file-location-label">✏️ このファイルを編集 (Step 01 で作成済み)</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1 ft-file">📄 pom.xml <span class="ft-tag ft-tag--modify">修正</span></div>
  </div>
</div>

`spring-boot-starter-test` は Boot に**元から含まれている**ので追加不要。JUnit5 / Mockito / AssertJ が一式入る。念のため `<dependencies>` に無ければ追加:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 追加するファイル (1つ)

### `UserServiceTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成 (テストは src/test/java 側)</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/test/java/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2">📁 com/example/rolemgr/</div>
    <div class="ft-line ft-l3">📁 service/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l4 ft-file">📄 UserServiceTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.rolemgr.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.rolemgr.domain.User;
import com.example.rolemgr.repository.UserMapper;

@ExtendWith(MockitoExtension.class)                                    // ①
class UserServiceTest {

    @Mock                                                              // ②
    UserMapper userMapper;

    @InjectMocks                                                       // ③
    UserService userService;

    @Test
    void findById_該当ユーザが返る() {
        User expected = user("u001", "$2a$10$hash", "部長");
        when(userMapper.findById("u001")).thenReturn(expected);        // ④

        User actual = userService.findById("u001");

        assertThat(actual).isEqualTo(expected);
    }

    @Test
    void findById_存在しない_ID_なら_null() {
        when(userMapper.findById("nobody")).thenReturn(null);

        User actual = userService.findById("nobody");

        assertThat(actual).isNull();
    }

    // ---- 同値分割: searchByRole の入力パターン全網羅 ----

    @ParameterizedTest(name = "role=\"{0}\" のとき Mapper には \"{1}\" が渡る")  // ⑤
    @MethodSource("searchByRoleCases")
    void searchByRole_null_は空文字に正規化される(String input,
                                                  String expectedPassedToMapper) {
        when(userMapper.findByRole(expectedPassedToMapper))            // ⑥
            .thenReturn(List.of());

        userService.searchByRole(input);

        verify(userMapper).findByRole(expectedPassedToMapper);         // ⑦
    }

    static Stream<Arguments> searchByRoleCases() {                     // ⑧
        return Stream.of(
            Arguments.of(null,        ""),      // 同値クラス: 未指定
            Arguments.of("",          ""),      // 同値クラス: 空文字
            Arguments.of("部長",      "部長"),  // 同値クラス: 通常文字
            Arguments.of("nobody",   "nobody")  // 同値クラス: マッチなし想定
        );
    }

    @Test
    void updateRole_Mapper_の_updateRole_が_呼ばれる() {
        userService.updateRole("u001", "課長");

        verify(userMapper).updateRole("u001", "課長");                 // ⑨
    }

    private static User user(String id, String password, String role) {
        User u = new User();
        u.setId(id);
        u.setPassword(password);
        u.setRole(role);
        return u;
    }
}
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `@ExtendWith(MockitoExtension.class)`** — JUnit5 に「Mockito の annotation (`@Mock` / `@InjectMocks`) を有効化しろ」と伝える。これがないと `@Mock` は無視される。
- **② `@Mock UserMapper userMapper`** — 本物の Mapper ではなく **Mockito が生成する偽物**を作る。デフォルトでは全メソッドが `null` / `0` / `false` / 空リストを返す。
- **③ `@InjectMocks UserService userService`** — テスト対象を実際に `new` し、コンストラクタ引数に `@Mock` のものを流し込む。つまり `new UserService(userMapper)` 相当が自動で行われる。
- **④ `when(userMapper.findById("u001")).thenReturn(expected)`** — **スタブ**。「もし id=u001 で呼ばれたらこの User を返せ」と偽物に指示する。これで Service を DB 無しで走らせられる。
- **⑤ `@ParameterizedTest`** — 同じテストメソッドを**引数だけ変えて複数回**実行する。「試験項目表の 1 行 = 1 回の実行」に対応。
- **⑥ 入力 `null` に対して `""` を期待** — Service の `role == null ? "" : role` ロジックのテスト。**null を空文字に正規化する仕様が守られているかを保証**。
- **⑦ `verify(userMapper).findByRole(expectedPassedToMapper)`** — 「Mapper の findByRole が指定した引数で 1 回呼ばれた」ことを検証。**振る舞い (呼び出し)** を確認する Mockito の書き方。
- **⑧ `Stream<Arguments>`** — `@MethodSource` に渡すテストデータ。**このメソッド = 試験項目表そのもの**。同値クラスを 1 行ずつ書いていく形なので、レビュー時に「表とコードが対応している」がすぐ分かる。
- **⑨ `verify(userMapper).updateRole("u001", "課長")`** — 更新系は「Mapper に正しい引数で処理が委譲されたか」だけ確認すればよい (DB の話は Step 14 で)。

---

## 実行

```powershell
mvn test
```

期待するログ:
```
[INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

IDE (STS4 / IntelliJ) から `UserServiceTest` を右クリック → Run で個別実行も可能。

---

## 試験項目表とコードの対応 (教育のキモ)

<div class="flow-diagram">
  <div class="flow-diagram-title">📋 同値分割 → @ParameterizedTest の写像</div>
  <div class="flow-vertical">
    <div class="flow-step">
      <span class="flow-step-badge">1</span>
      <div class="flow-step-content">
        <strong>試験項目表</strong> (Excel など) で入力を同値クラスに分割:
        <code>null</code> / <code>""</code> / <code>"部長"</code> / <code>"nobody"</code> の 4 分類
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">2</span>
      <div class="flow-step-content">
        各行に対して <strong>期待動作</strong>を書く: null は空文字扱い、通常文字は素通し
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">3</span>
      <div class="flow-step-content">
        <code>searchByRoleCases()</code> の <code>Arguments.of(入力, 期待)</code> がそのまま試験項目表の 1 行に対応
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge flow-step-badge--yes">✓</span>
      <div class="flow-step-content">
        表を追記する = テストが 1 行増える。<strong>設計書とコードの乖離が原理的に起きない</strong>
      </div>
    </div>
  </div>
</div>

## よくある詰まり

- **`NullPointerException` in userMapper.findById** — `@Mock` を書き忘れて null のまま呼ばれた。`@ExtendWith(MockitoExtension.class)` があるか確認
- **テストが 1 個しか実行されない** — `@ParameterizedTest` を `@Test` に書いてしまっている、または `@MethodSource` の名前が `static メソッド名`と一致していない
- **Boot 起動から遅い** — `@SpringBootTest` を付けてしまっていないか。今回は Spring Context 不要 (Mockito だけで動く)

## 次

→ [Step 14: @MybatisTest で SQL 疎通確認](/steps-boot/14-mapper-test)
