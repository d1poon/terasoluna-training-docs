---
title: "Controller のテスト (MockMvc + @WebMvcTest)"
date: 2026-07-27
tags: [type/learning, type/training, tech/mockmvc, tech/junit5, tech/test]
step: 15
---

# Step 15 — Controller のテスト (`MockMvc` + `@WebMvcTest`)

## このステップのゴール

- **実際に HTTP サーバを立てずに** Controller にリクエストを流す
- URL のルーティング / Model 詰め / View 名返却 が正しいことを検証
- `@MockBean` で Service をモック化して**Controller の関心だけ**をテストする
- Spring Security 環境下での**認証付き / CSRF 付き POST** のテスト方法

## 事前準備

- [Step 14](/steps-boot/14-mapper-test) 完了

---

## 🔰 MockMvc とは

`MockMvc` = 「HTTP サーバの動作を **メモリ内でシミュレート** するツール」。

- 本物の Tomcat を起動しない → **速い** (1 テスト 100 ms 未満)
- `mockMvc.perform(get("/search").param("role", "部長"))` で GET リクエストをシミュレート
- `.andExpect(status().isOk())` `.andExpect(view().name("search"))` で応答を検証
- Service 層は `@MockBean` で偽物に差し替え → Controller の責務だけを見る

---

## 追加するファイル (1つ)

### `SearchControllerTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/test/java/</div>
    <div class="ft-line ft-l2">📁 com/example/rolemgr/</div>
    <div class="ft-line ft-l3">📁 controller/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l4 ft-file">📄 SearchControllerTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.rolemgr.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request
    .SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request
    .MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result
    .MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result
    .MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result
    .MockMvcResultMatchers.view;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.rolemgr.domain.User;
import com.example.rolemgr.service.UserService;

@WebMvcTest(SearchController.class)                                        // ①
class SearchControllerTest {

    @Autowired
    MockMvc mockMvc;                                                       // ②

    @MockBean                                                              // ③
    UserService userService;

    @Test
    void GET_search_パラメータ無し_で_フォームだけ_表示() throws Exception {
        mockMvc.perform(get("/search").with(user("u001")))                 // ④
            .andExpect(status().isOk())
            .andExpect(view().name("search"))                              // ⑤
            .andExpect(model().attribute("loginId", "u001"))
            .andExpect(model().attributeDoesNotExist("results"));          // ⑥
    }

    @Test
    void GET_search_role指定_で_検索結果が_Model_に入る() throws Exception {
        User u1 = user("u001", "部長");
        User u2 = user("u002", "課長");
        when(userService.searchByRole(eq("長")))                            // ⑦
            .thenReturn(List.of(u1, u2));

        mockMvc.perform(get("/search").param("role", "長").with(user("u001")))
            .andExpect(status().isOk())
            .andExpect(view().name("search"))
            .andExpect(model().attribute("role", "長"))
            .andExpect(model().attribute("results", hasSize(2)));          // ⑧
    }

    @Test
    void 未認証_で_GET_search_は_ログインに_リダイレクト() throws Exception {
        mockMvc.perform(get("/search"))                                    // ⑨
            .andExpect(status().is3xxRedirection())
            .andExpect(view().name(org.springframework.test.web.servlet
                .result.MockMvcResultMatchers.redirectedUrl("http://localhost/login").toString()));
    }

    private static User user(String id, String role) {
        User u = new User();
        u.setId(id);
        u.setRole(role);
        return u;
    }
}
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `@WebMvcTest(SearchController.class)`** — **この Controller だけ**を起動する軽量テスト。Service / Mapper / DB は起動しない。Spring Security も同時に有効になる。
- **② `MockMvc`** — HTTP サーバのシミュレータ。`perform(get(...))` でリクエスト発行、`andExpect(...)` で応答検証。
- **③ `@MockBean UserService userService`** — `@WebMvcTest` は Service を起動しないため、モックとして差し込む。Controller が Service を呼ぶ挙動をここで制御。
- **④ `.with(user("u001"))`** — Spring Security Test の魔法。「u001 で認証済み」の状態を偽装。これがないと認証チェックで 401 / リダイレクトされる。
- **⑤ `view().name("search")`** — Controller が `return "search"` した ことを検証。実際の JSP は実行されない (テンプレート name だけ確認)。
- **⑥ `model().attributeDoesNotExist("results")`** — 初回アクセス時 (role パラメータなし) は `results` が Model に入っていないことを確認 = **3 状態分岐の 1 つ目**をテスト。
- **⑦ `when(userService.searchByRole(eq("長"))).thenReturn(...)`** — Mockito でスタブ。Service は本物ではなく、この偽物が「長」を受けたら 2 件返す。Controller のロジックだけをテスト。
- **⑧ `model().attribute("results", hasSize(2))`** — Hamcrest matcher で「Model の `results` は size=2 の何か」を検証。
- **⑨ `.with(user(...))` を付けない`** — 未認証状態のシミュレーション。`/search` は認証必須なので 302 リダイレクトが期待挙動。**セキュリティ設定が生きているかも同時に検証**できる。

---

## 実行

```powershell
mvn test
```

Step 13-15 で **合計 14 テスト**が全通ればOK:

```
[INFO] Tests run: 14, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## テスト戦略の全体像 (完成後)

<div class="flow-diagram flow-diagram--good">
  <div class="flow-diagram-title">✅ 3 層テストのカバー範囲</div>
  <div class="flow-row">
    <div class="flow-node">
      <div class="flow-node-icon">🧪</div>
      <div class="flow-node-name">Step 13: UserServiceTest</div>
      <div class="flow-node-detail">
        Mockito で Mapper を偽物化。<br>
        <strong>業務ロジックの分岐</strong>を全網羅
      </div>
    </div>
    <div class="flow-arrow">
      <div class="flow-arrow-label">補完</div>
      <div class="flow-arrow-note">DB は触らない</div>
    </div>
    <div class="flow-node">
      <div class="flow-node-icon">🗄</div>
      <div class="flow-node-name">Step 14: UserMapperTest</div>
      <div class="flow-node-detail">
        H2 に実際に SQL 発行。<br>
        <strong>XML の SQL の正しさ</strong>を保証
      </div>
    </div>
  </div>
  <div class="flow-row" style="margin-top:0.75rem">
    <div class="flow-node">
      <div class="flow-node-icon">🌐</div>
      <div class="flow-node-name">Step 15: SearchControllerTest</div>
      <div class="flow-node-detail">
        MockMvc で HTTP 層をシミュレート。<br>
        <strong>URL ルーティング + Model 詰め + View 名 + Security</strong>を保証
      </div>
    </div>
    <div class="flow-arrow">
      <div class="flow-arrow-label">補完</div>
      <div class="flow-arrow-note">実 HTTP は使わない</div>
    </div>
    <div class="flow-node">
      <div class="flow-node-icon">👁</div>
      <div class="flow-node-name">Step 12 で手動確認</div>
      <div class="flow-node-detail">
        実際にブラウザで <strong>5 画面通し操作</strong>。<br>
        自動テストでは拾えない見た目の問題
      </div>
    </div>
  </div>
</div>

## 次に手を出すべきテスト (発展課題)

このリファレンスはコアの 3 種を書いたが、実案件では以下も追加する:

- **`@SpringBootTest` + `TestRestTemplate`** — 実 HTTP + 実 DB の end-to-end
- **Selenium** (TERASOLUNA archetype に `-selenium` モジュールがある) — ブラウザ自動操作
- **`@DataJpaTest` / Testcontainers** — 本番 DB (PostgreSQL) と同じ engine でのテスト
- **Contract test** (Pact など) — 他システムとの連携部分

## 次

→ [Step 12: 完成 & まとめ](/steps-boot/12-complete) (自動テストが揃った状態で改めて動作確認)

戻る場合: → [Step 00: 目次](/steps-boot/00-toc)
