---
title: "検索画面 (Form クラス + LIKE 検索)"
date: 2026-07-30
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc, tech/jsp]
step: 07
---

# Step 07 — 検索画面 (Form クラス + LIKE 検索)

## このステップのゴール

- 役職 (`role`) の部分一致検索画面を作る
- **TERASOLUNA 規約**: 画面入力バインディングは Entity 直バインドでなく **Form クラスを別に立てる**
- Step 06 の「無条件一覧」に対して、こちらは「条件付き一覧」にあたる

## 事前準備

- [Step 06](/steps-basic/06-list) 完了

## なぜ Form クラスを別に作るのか

Entity (`User`) を `@ModelAttribute` に直接バインドすると:

- **セキュリティリスク**: 攻撃者が画面に無い項目まで送り込んで意図しないフィールドを埋められる (Mass Assignment 脆弱性)
- **画面の都合が Entity に染み出す**: 画面固有の項目 (「検索キーワード」等) を Entity に混ぜたくない
- **Validation の分離**: 画面ごとに違う validation ルールを Entity に持たせるのは無理

→ **Form (Command Object) を用意して分離する**。TERASOLUNA では全画面共通の規約。

## 追加するファイル (3 つ)

### 1. `UserSearchForm.java` (画面入力バインディング用)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 usersearch/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserSearchForm.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.usersearch;

import java.io.Serializable;
import jakarta.validation.constraints.Size;

/**
 * 検索画面の入力バインディング用 Form。
 * Entity (User) とは別に用意する — Mass Assignment 脆弱性の予防。
 */
public class UserSearchForm implements Serializable {

    private static final long serialVersionUID = 1L;

    @Size(max = 50)                                                            // ①
    private String role;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

- **① `@Size(max = 50)`** — Hibernate Validator (Bean Validation) の制約アノテーション。Controller で `@Valid` を付けると自動チェック

### 2. `UserSearchController.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/usersearch/</div>
    <div class="ft-line ft-l1 ft-file">📄 UserSearchController.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.usersearch;

import java.util.List;
import jakarta.inject.Inject;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

@Controller
public class UserSearchController {

    @Inject
    UserService userService;                                                   // ①

    @ModelAttribute("userSearchForm")                                          // ②
    public UserSearchForm setUpForm() {
        return new UserSearchForm();
    }

    @GetMapping("/users/search")                                               // ③
    public String search(@ModelAttribute UserSearchForm form, Model model) {
        List<User> results = userService.searchByRole(form.getRole());         // ④
        model.addAttribute("results", results);
        return "usersearch/search";                                           // ⑤
    }
}
```

#### なぜこう書く

- **① `@Inject UserService`** — Step 05 で作った Service を注入
- **② `@ModelAttribute` セットアップメソッド** — GET でフォーム初期表示するとき、空の Form を Model に載せておく。JSP 側で `${userSearchForm.role}` として参照可能に
- **③ `/users/search`** — Step 06 の `/users` (無条件一覧) に対する「条件付き一覧」の URL
- **④ `userService.searchByRole(form.getRole())`** — Step 05 で定義済みの検索メソッド。`role` が空なら全件ヒットする実装 ([Step 05](/steps-basic/05-service) 参照)
- **⑤ `return "usersearch/search"`** — `/WEB-INF/views/usersearch/search.jsp` に解決される

### 3. `search.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l1">📁 usersearch/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 search.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>役職検索 — demo</title>
</head>
<body>
    <h1>役職検索</h1>

    <form:form modelAttribute="userSearchForm" method="get"
               action="${pageContext.request.contextPath}/users/search">
        <label>役職 (部分一致)
            <form:input path="role" />
        </label>
        <button type="submit">検索</button>
    </form:form>

    <p><a href="${pageContext.request.contextPath}/users">一覧に戻る</a></p>

    <c:if test="${not empty results}">
        <h2>結果 (${results.size()} 件)</h2>
        <table>
            <thead>
                <tr><th>ID</th><th>名前</th><th>役職</th><th></th></tr>
            </thead>
            <tbody>
                <c:forEach var="u" items="${results}">
                    <c:url var="detailUrl" value="/users/detail">
                        <c:param name="id" value="${u.id}" />
                    </c:url>
                    <tr>
                        <td><c:out value="${u.id}" /></td>                     <%-- ① --%>
                        <td><c:out value="${u.name}" /></td>
                        <td><c:out value="${u.role}" /></td>
                        <td><a href="${detailUrl}">詳細</a></td>
                    </tr>
                </c:forEach>
            </tbody>
        </table>
    </c:if>
</body>
</html>
```

- **① `<c:out value="${u.id}" />`** — HTML エスケープして出力。`${u.id}` 直出しは XSS 脆弱性。**JSP では常に `<c:out>` で包む**のが原則

## ディレクトリ構造 (このステップ完了時)

```
demo/demo-web/src/main/java/com/example/demo/app/
└── usersearch/
    ├── UserSearchForm.java             ← 追加
    └── UserSearchController.java       ← 追加

demo/demo-web/src/main/webapp/WEB-INF/views/
└── usersearch/
    └── search.jsp                      ← 追加
```

## 動作確認

Tomcat 起動 (未起動なら [Step 02](/steps-basic/02-empty-boot)) → `http://localhost:8080/demo-web/users` → 「役職で検索する」リンク → `/users/search` に遷移。役職欄に [Step 03](/steps-basic/03-user-domain) の初期データに含まれる役職名 (例: 「課長」) を入力して検索 → 該当する行だけ表示される (件数は Step 03 の初期データによる)。空欄で検索 → 全件表示。各行の「詳細」リンクは Step 08 まで 404。

## よくある詰まり

- **`Neither BindingResult nor plain target object for bean name 'userSearchForm' available`**: `@ModelAttribute("userSearchForm")` セットアップメソッドを書き忘れ、または名前 (`userSearchForm`) が JSP の `<form:form modelAttribute>` と不一致
- **`<c:out>` を書き忘れ**: XSS 脆弱性の温床。**必ずエスケープ**する
- **`form:input` タグ未定義**: 通常は起きない (`form` prefix は共通 `include.jsp` で既に宣言済み)。起きる場合は `demo-web` の pom 依存不足を疑う
- **検索しても Step 06 の一覧と同じ件数しか出ない**: `userService.searchByRole()` が `role` を無視した実装になっていないか、[Step 05](/steps-basic/05-service) の Repository 呼び出しを確認

## 次

→ [Step 08: 詳細画面 (1 件を表示)](/steps-basic/08-detail)
