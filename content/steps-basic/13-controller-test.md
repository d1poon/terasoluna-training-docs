---
title: "Controller テスト (MockMvc)"
date: 2026-07-30
tags: [type/learning, type/training, tech/junit5, tech/spring-mvc, tech/test]
step: 13
---

# Step 13 — Controller テスト (MockMvc)

## このステップのゴール

- 一覧・検索・詳細を担う 3 つの Controller を、それぞれ対応する MockMvc テストで検証する
- Service はモック、実 DB は触らない
- 3 段のテスト (単体 / 統合 / Web) が揃う

このトラックには Spring Security が無いため、認証設定や CSRF トークンを一切考えずに `MockMvcBuilders.standaloneSetup(...)` だけで完結する。「GET したら期待のビュー名が返る」「Model に期待のデータが入る」という**素直な形**でテストが書けるのが、Security 版に対するこのトラックの利点。

> クラス名・URL・ビュー名は [Step 06](/steps-basic/06-list)・[Step 07](/steps-basic/07-search)・[Step 08](/steps-basic/08-detail)・[Step 09](/steps-basic/09-edit) で定義した 3 つの Controller (`UserListController` / `UserSearchController` / `UserDetailController`) にそれぞれ対応させている。**一覧と検索は別 Controller・別 URL・別ビュー**である点に注意 (1 つの Controller に統合されているわけではない)。

## 事前準備

- [Step 12](/steps-basic/12-repository-test) 完了

## 追加するファイル (3 つ)

### 1. `UserListControllerTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/test/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 userlist/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserListControllerTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.userlist;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class UserListControllerTest {

    @Mock
    UserService userService;

    @InjectMocks
    UserListController userListController;

    MockMvc mockMvc;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userListController).build();   // ①
    }

    @Test
    void list_全件表示() throws Exception {
        User u1 = new User(); u1.setId("u001"); u1.setName("佐藤 太郎"); u1.setRole("部長");
        User u2 = new User(); u2.setId("u002"); u2.setName("鈴木 花子"); u2.setRole("課長");
        User u3 = new User(); u3.setId("u003"); u3.setName("高橋 次郎"); u3.setRole("主任");
        User u4 = new User(); u4.setId("u004"); u4.setName("田中 美咲"); u4.setRole("一般");
        User u5 = new User(); u5.setId("u005"); u5.setName("伊藤 健一"); u5.setRole("一般");
        when(userService.findAll()).thenReturn(Arrays.asList(u1, u2, u3, u4, u5)); // ②

        mockMvc.perform(get("/users"))                                          // ③
               .andExpect(status().isOk())
               .andExpect(view().name("userlist/list"))                        // ④
               .andExpect(model().attribute("users", hasSize(5)));              // ⑤
    }
}
```

#### なぜこう書く

- **① `MockMvcBuilders.standaloneSetup(controller)`** — Controller 単体を MockMvc で駆動。Security 版と違い、認証設定 (`spring-security.xml`) 自体がこのトラックには存在しないので、余計な設定を意識する必要がない
- **② `userService.findAll()` をモック** — [Step 06](/steps-basic/06-list) の一覧は「無条件で全件」。`searchByRole` ではない点に注意 (検索は別 Controller)
- **③ `mockMvc.perform(get("/users"))`** — 実際の HTTP リクエストと同等のオブジェクトを発火。POST が絡まないこの画面では CSRF トークンも不要
- **④ `view().name("userlist/list")`** — Controller が返したビュー名を検証。JSP 自体はレンダリングしない (view() 名だけ確認)
- **⑤ `model().attribute("users", hasSize(5))`** — Hamcrest の `Matcher` (`hasSize`) を渡す正しい書き方。ラムダは渡せないので注意

### 2. `UserSearchControllerTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/test/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 usersearch/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserSearchControllerTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.usersearch;

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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class UserSearchControllerTest {

    @Mock
    UserService userService;

    @InjectMocks
    UserSearchController userSearchController;

    MockMvc mockMvc;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userSearchController).build();
    }

    @Test
    void search_役職検索_結果表示() throws Exception {
        User u1 = new User(); u1.setId("u004"); u1.setName("田中 美咲"); u1.setRole("一般");
        User u2 = new User(); u2.setId("u005"); u2.setName("伊藤 健一"); u2.setRole("一般");
        when(userService.searchByRole("一般")).thenReturn(Arrays.asList(u1, u2));  // ①

        MvcResult result = mockMvc.perform(get("/users/search").param("role", "一般")) // ②
               .andExpect(status().isOk())
               .andExpect(view().name("usersearch/search"))                    // ③
               .andExpect(model().attributeExists("results"))                  // ④
               .andReturn();                                                   // ⑤

        @SuppressWarnings("unchecked")
        List<User> results = (List<User>) result.getModelAndView().getModel().get("results");
        assertEquals(2, results.size());                                       // ⑥
    }
}
```

#### なぜこう書く

- **① `userService.searchByRole("一般")` をモック** — [Step 05](/steps-basic/05-service) の Service インターフェース通り。Repository 側は `findByRole` だが Service は `searchByRole` という別名である点に注意
- **② `get("/users/search").param("role", "一般")`** — [Step 06](/steps-basic/06-list) の `/users` (無条件一覧) とは**別 URL**。`role` は `UserSearchForm` にバインドされる
- **③ `view().name("usersearch/search")`** — 一覧の `userlist/list` とは別のビュー名
- **④ `model().attributeExists("results")`** — [Step 07](/steps-basic/07-search) の Controller は Model キーを **`results`** で `addAttribute` している。一覧の `users` と混同しないこと
- **⑤ `.andReturn()`** — `MvcResult` を受け取り、Model の中身を自分で取り出して検証する形にする。`model().attribute(...)` に `Matcher<T>` 以外 (ラムダ等) は渡せないため、要素数のような単純な検証は `andReturn()` 経由の方が素直
- **⑥ `assertEquals(2, results.size())`** — 取り出した `List<User>` を通常の JUnit アサーションで検証

### 3. `UserDetailControllerTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/test/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 userdetail/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserDetailControllerTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.userdetail;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.flash;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class UserDetailControllerTest {

    @Mock
    UserService userService;

    @InjectMocks
    UserDetailController userDetailController;

    MockMvc mockMvc;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userDetailController).build();
    }

    @Test
    void view_詳細表示() throws Exception {
        User user = new User();
        user.setId("u001"); user.setName("佐藤 太郎"); user.setRole("部長");
        when(userService.findById("u001")).thenReturn(user);                    // ①

        mockMvc.perform(get("/users/detail").param("id", "u001"))               // ②
               .andExpect(status().isOk())
               .andExpect(view().name("userdetail/detail"))                     // ③
               .andExpect(model().attribute("user", user));                     // ④
    }

    @Test
    void update_成功時はPRGで詳細画面へリダイレクト() throws Exception {
        User user = new User();
        user.setId("u001"); user.setName("佐藤 太郎"); user.setRole("部長");
        when(userService.findById("u001")).thenReturn(user);                    // ⑤

        mockMvc.perform(post("/users/edit")                                     // ⑥
                       .param("id", "u001")
                       .param("role", "課長"))
               .andExpect(status().is3xxRedirection())
               .andExpect(redirectedUrl("/users/detail?id=u001"))               // ⑦
               .andExpect(flash().attributeExists("message"));                  // ⑧

        verify(userService).update(                                             // ⑨
                argThat(u -> "u001".equals(u.getId()) && "課長".equals(u.getRole())));
    }
}
```

#### なぜこう書く

- **① `userService.findById("u001")` をモック** — [Step 08](/steps-basic/08-detail) の `view()` メソッドが呼ぶ
- **② `get("/users/detail").param("id", "u001")`** — `@RequestParam String id` はクエリパラメータで渡す。path variable ではない
- **③ `view().name("userdetail/detail")`** — 一覧・検索とはまた別のビュー名
- **④ `model().attribute("user", user)`** — モックが返すのと同じ `User` インスタンス参照なので、`User` に `equals()` を実装していなくても (デフォルトの参照比較で) 一致する
- **⑤ `userService.findById("u001")` をモック** — [Step 09](/steps-basic/09-edit) の `update()` 内部でも `findById` が呼ばれる (フォームに無い `name` を保持するため現在の `User` を取り直す設計)
- **⑥ `post("/users/edit").param("id", ...).param("role", ...)`** — `@ModelAttribute UserEditForm` にバインドされる。CSRF トークンはこのトラックに存在しないので不要
- **⑦ `redirectedUrl("/users/detail?id=u001")`** — [Step 09](/steps-basic/09-edit) の `redirect.addAttribute("id", form.getId())` により、リダイレクト先 URL にクエリパラメータとして `id` が付与される。`/users/detail` だけでは一致しない
- **⑧ `flash().attributeExists("message")`** — [Step 09](/steps-basic/09-edit) の `redirect.addFlashAttribute("message", ...)` を検証。Flash 属性は通常の `model()` ではなく `flash()` で確認する
- **⑨ `verify(userService).update(argThat(...))`** — `redirectedUrl` と `flash().attributeExists` はリダイレクト先の URL とフラッシュメッセージの有無しか見ておらず、`userService.update(user)` が実際に呼ばれたかどうかは検証していない。**仮に Controller から `userService.update(user);` を消してもこのテストはそれまで通ってしまう**。`argThat` で「id はフォームの `u001` のまま、role はフォーム入力の `課長` に書き換わっている」ところまで検証することで、その抜け穴を塞ぐ

## 3 段テストの全体像

<div class="flow-diagram">
  <div class="flow-diagram-title">テストピラミッド</div>
  <div class="flow-row">
    <div class="flow-node flow-node--legit">
      <div aria-hidden="true" class="flow-node-icon">🧪</div>
      <div class="flow-node-name">Step 11: Service 単体</div>
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
      <div class="flow-node-name">Step 12: Repository 統合</div>
      <div class="flow-node-detail">
        H2 実 SQL<br />
        <strong>SQL バグを検出</strong>
      </div>
    </div>
  </div>
  <div class="flow-row">
    <div class="flow-node flow-node--attacker">
      <div aria-hidden="true" class="flow-node-icon">🌐</div>
      <div class="flow-node-name">Step 13: Controller MockMvc</div>
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

- **`No qualifying bean of type` in MockMvc**: `standaloneSetup` は Bean を要求しない (Controller 単体駆動)。Bean エラーが出る場合は `webAppContextSetup` を使っているか、`@ContextConfiguration` が絡んでいる
- **`404 Not Found`**: `@GetMapping` / `@PostMapping` の URL と `perform(get("..."))` / `perform(post("..."))` が不一致 (コピペのタイポ多発)。一覧 `/users`・検索 `/users/search`・詳細 `/users/detail`・編集 `/users/edit` は**別 Controller・別 URL**なので取り違えに注意
- **`view()` の期待値が実際と違う**: ビュー名は Controller の戻り値の文字列そのもの。`userlist/list` (一覧) / `usersearch/search` (検索) / `userdetail/detail` (詳細) / `userdetail/edit` (編集) はそれぞれ別物。JSP の物理配置とは別なので、対応する Controller の実装 ([Step 06](/steps-basic/06-list)〜[Step 09](/steps-basic/09-edit)) を見て正確な文字列を確認する
- **Model 属性名の取り違え**: 一覧は `users`、検索は `results`、詳細・編集は `user` / `userEditForm` と Controller ごとに異なる。`model().attributeExists(...)` で確認する属性名は必ず該当 Controller の実装を見て確認する
- **`redirectedUrl(...)` が一致しない**: PRG のリダイレクト先は `redirect.addAttribute("id", ...)` で積んだクエリパラメータ込みの文字列で比較する必要がある。`/users/detail` だけでは一致しない ([Step 09](/steps-basic/09-edit) 参照)

## 3 段テストで捕まえるバグ (振り返り)

| バグの種類 | Step 11 | Step 12 | Step 13 |
|---|---|---|---|
| Service ロジックの分岐ミス | ✅ | — | — |
| SQL の LIKE パターン間違い | ❌ | ✅ | — |
| Controller の URL マッピング違反 | ❌ | ❌ | ✅ |
| Form バインディングの誤り | ❌ | ❌ | ✅ |
| View 名の typo | ❌ | ❌ | ✅ |

## 次

これで入門版 (役職一覧・検索・編集アプリ) は完成 + テスト網が張られた状態。Spring Security が無い分、Controller テストが素直に書けることを体感できたはず。

次のステップは、**このトラックで作ったアプリに認証を足していく**こと。Security 版トラックの [Step 00: 5 モジュールの地図](/steps/00-modules-map) から読み進め、[Step 06: 認証基盤](/steps/06-auth-foundation) でここまで作ったアプリのどこに `spring-security.xml` や `UserDetailsService` が追加されるのかを確認する。このトラックは Security 版への踏み台として設計されている。

- [Step 00: 5 モジュールの地図 (Security 版の入口)](/steps/00-modules-map)
- [Step 06: 認証基盤 (spring-security.xml)](/steps/06-auth-foundation)
