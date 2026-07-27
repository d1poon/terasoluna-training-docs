---
title: "検索画面 (Form クラス + LIKE 検索)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc, tech/jsp]
step: 09
---

# Step 09 — 検索画面 (Form クラス + LIKE 検索)

## このステップのゴール

- 役職 (`role`) の部分一致検索画面を作る
- **TERASOLUNA 規約**: 画面入力バインディングは Entity 直バインドでなく **Form クラスを別に立てる**
- SearchController → UserService → UserRepository の 3 層呼び出しを完成させる

## 事前準備

- [Step 08](/steps/08-menu) 完了

## なぜ Form クラスを別に作るのか

Entity (`User`) を `@ModelAttribute` に直接バインドすると:

- **セキュリティリスク**: 攻撃者が `password` や `role` を picking する余地 (Mass Assignment 脆弱性)
- **画面の都合が Entity に染み出す**: 画面固有の項目 (「検索キーワード」等) を Entity に混ぜたくない
- **Validation の分離**: 画面ごとに違う validation ルールを Entity に持たせるのは無理

→ **Form (Command Object) を用意して分離する**。TERASOLUNA では全画面共通の規約。

## 追加するファイル (3 つ)

### 1. `UserSearchForm.java` (画面入力バインディング用)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 search/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserSearchForm.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.search;

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

### 2. `SearchController.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/search/</div>
    <div class="ft-line ft-l1 ft-file">📄 SearchController.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.search;

import java.util.List;
import jakarta.inject.Inject;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

@Controller
public class SearchController {

    @Inject
    UserService userService;                                                   // ①

    @ModelAttribute("userSearchForm")                                          // ②
    public UserSearchForm setUpForm() {
        return new UserSearchForm();
    }

    @GetMapping("/search")
    public String search(@ModelAttribute UserSearchForm form, Model model) {   // ③
        List<User> results = userService.searchByRole(form.getRole());
        model.addAttribute("results", results);
        return "search/search";
    }
}
```

- **① `@Inject UserService`** — Step 05 で作った Service を注入
- **② `@ModelAttribute` セットアップメソッド** — GET でフォーム初期表示するとき、空の Form を Model に載せておく。JSP 側で `${userSearchForm.role}` として参照可能に
- **③ `@ModelAttribute UserSearchForm form`** — リクエストパラメータ `?role=部長` を Form の同名フィールドに自動バインド

### 3. `search.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l1">📁 search/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 search.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="form" uri="jakarta.tags.form" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>役職検索 — demo</title>
</head>
<body>
    <h1>役職検索</h1>

    <form:form modelAttribute="userSearchForm" method="get"
               action="${pageContext.request.contextPath}/search">
        <label>役職 (部分一致)
            <form:input path="role" />
        </label>
        <button type="submit">検索</button>
    </form:form>

    <c:if test="${not empty results}">
        <h2>結果 (${results.size()} 件)</h2>
        <table>
            <thead>
                <tr><th>ID</th><th>役職</th></tr>
            </thead>
            <tbody>
                <c:forEach var="u" items="${results}">
                    <tr>
                        <td><c:out value="${u.id}" /></td>                     <%-- ① --%>
                        <td><c:out value="${u.role}" /></td>
                    </tr>
                </c:forEach>
            </tbody>
        </table>
    </c:if>
</body>
</html>
```

- **① `<c:out value="${u.id}" />`** — HTML エスケープして出力。`${u.id}` 直出しは XSS 脆弱性。**JSP では常に `<c:out>` で包む**のが原則

## 動作確認

Tomcat 起動 → ログイン → メニュー → 「役職検索」リンク → 「長」で検索 → 3 件 (ROLE_USER が対象は 0 件だが、ROLE_ADMIN + 「長」を含めた検索は用途による)。空欄で検索 → 5 件全表示。

## よくある詰まり

- **`Neither BindingResult nor plain target object for bean name 'userSearchForm' available`**: `@ModelAttribute("userSearchForm")` セットアップメソッドを書き忘れ、または名前 (`userSearchForm`) が JSP の `<form:form modelAttribute>` と不一致
- **`<c:out>` を書き忘れ**: XSS 脆弱性の温床。**必ずエスケープ**する ([[/security-checklist#xss|セキュリティチェックリスト XSS 節]] 参照)
- **`form:input` タグ未定義**: `<%@ taglib prefix="form" uri="jakarta.tags.form" %>` の宣言忘れ、または旧 URI (`http://www.springframework.org/tags/form`) を使っている

## 次

→ [Step 10: ユーザ情報画面 (認証コンテキストから ID 取得)](/steps/10-user-info)
