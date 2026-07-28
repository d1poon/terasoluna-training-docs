---
title: "Controller テスト (MockMvc)"
date: 2026-07-28
tags: [type/learning, type/training, tech/junit5, tech/spring-mvc, tech/test]
step: 15
---

# Step 15 — Controller テスト (MockMvc)

## このステップのゴール

- `SearchController` を MockMvc で URL / Model / View / Security 込みで検証する
- Service はモック、実 DB は触らない
- 3 段のテスト (単体 / 統合 / Web) が揃う

## 事前準備

- [Step 14](/steps/14-mapper-test) 完了

## 追加するファイル (1 つ)

### `SearchControllerTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/test/java/com/example/demo/app/search/</div>
    <div class="ft-line ft-l1 ft-file">📄 SearchControllerTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.search;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SearchControllerTest {

    @Mock
    UserService userService;

    @InjectMocks
    SearchController searchController;

    MockMvc mockMvc;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(searchController).build();   // ①
    }

    @Test
    void search_役職検索_結果表示() throws Exception {
        User u1 = new User(); u1.setId("u003"); u1.setRole("ROLE_ADMIN");
        User u2 = new User(); u2.setId("u004"); u2.setRole("ROLE_ADMIN");
        when(userService.searchByRole("ADMIN")).thenReturn(Arrays.asList(u1, u2));

        MvcResult result = mockMvc.perform(get("/search").param("role", "ADMIN")) // ②
               .andExpect(status().isOk())
               .andExpect(view().name("search/search"))                           // ③
               .andExpect(model().attributeExists("results"))
               .andReturn();                                                      // ④

        @SuppressWarnings("unchecked")
        List<User> results = (List<User>) result.getModelAndView().getModel().get("results");
        assertEquals(2, results.size());                                          // ⑤
    }
}
```

#### なぜこう書く

- **① `MockMvcBuilders.standaloneSetup(controller)`** — Controller 単体を MockMvc で駆動。Spring Security は含まない (認証をテスト対象外に)
- **② `mockMvc.perform(get(...).param(...))`** — 実際の HTTP リクエストと同等のオブジェクトを発火
- **③ `view().name("search/search")`** — Controller が返したビュー名を検証。JSP 自体はレンダリングしない (view() 名だけ確認)
- **④ `.andReturn()`** — `MvcResult` を受け取り、Model の中身を自分で取り出して検証する形にする。`model().attribute(...)` に `Matcher<T>` 以外 (ラムダ等) は渡せないため、要素数のような単純な検証は `andReturn()` 経由の方が素直
- **⑤ `assertEquals(2, results.size())`** — 取り出した `List<User>` を通常の JUnit アサーションで検証

## Spring Security 込みでテストする場合

`MockMvcBuilders.standaloneSetup` の代わりに `webAppContextSetup` を使い、`SecurityMockMvcConfigurers.springSecurity()` を適用する。詳細は Spring Security 公式ドキュメント参照 (本教材では標準の `standaloneSetup` で完結)。

## 3 段テストの全体像

<div class="flow-diagram">
  <div class="flow-diagram-title">テストピラミッド</div>
  <div class="flow-row">
    <div class="flow-node flow-node--legit">
      <div aria-hidden="true" class="flow-node-icon">🧪</div>
      <div class="flow-node-name">Step 13: Service 単体</div>
      <div class="flow-node-detail">
        Repository モック、msec で動く<br />
        <strong>数多く書く</strong>
      </div>
    </div>
    <div class="flow-arrow">
      <div class="flow-arrow-label">補完</div>
    </div>
    <div class="flow-node flow-node--server">
      <div aria-hidden="true" class="flow-node-icon">🗄</div>
      <div class="flow-node-name">Step 14: Repository 統合</div>
      <div class="flow-node-detail">
        H2 実 SQL<br />
        <strong>SQL バグを検出</strong>
      </div>
    </div>
  </div>
  <div class="flow-row">
    <div class="flow-node flow-node--attacker">
      <div aria-hidden="true" class="flow-node-icon">🌐</div>
      <div class="flow-node-name">Step 15: Controller MockMvc</div>
      <div class="flow-node-detail">
        URL / Model / View 検証<br />
        <strong>数少なく</strong> (画面全部書くと時間が飛ぶ)
      </div>
    </div>
  </div>
</div>

## 動作確認

```powershell
cd demo
mvn test
```

全モジュールのテストが green なら OK。

## よくある詰まり

- **`No qualifying bean of type` in MockMvc**: `standaloneSetup` は Bean を要求しない (Controller 単体駆動)。Bean エラーが出る場合は `webAppContextSetup` を使っているか、@ContextConfiguration が絡んでいる
- **`403 Forbidden`**: CSRF token が MockMvc の POST に含まれていない。`.with(csrf())` を追加
- **`404 Not Found`**: `@GetMapping` の URL と `perform(get("..."))` が不一致 (コピペのタイポ多発)

## 3 段テストで捕まえるバグ (振り返り)

| バグの種類 | Step 13 | Step 14 | Step 15 |
|---|---|---|---|
| Service ロジックの分岐ミス | ✅ | — | — |
| SQL の LIKE パターン間違い | ❌ | ✅ | — |
| Controller の URL マッピング違反 | ❌ | ❌ | ✅ |
| Form バインディングの誤り | ❌ | ❌ | ✅ |
| View 名の typo | ❌ | ❌ | ✅ |

## 次

これで demo (役職編集アプリ) は完成 + テスト網が張られた状態。実務では:

- CI (GitHub Actions / Jenkins) で PR 毎に `mvn test` 自動実行
- カバレッジは JaCoCo で計測、Coveralls に送る (`terasoluna-gfw-parent` に設定あり)
- 実運用中に見つかったバグは Step 13-15 のテストを 1 つ追加してから修正 (再発防止)

→ 教材は以上。[Home](/) に戻るか、[Boot 補助版](/steps-boot/00-toc) で異なる書き方も比較してみてください。
