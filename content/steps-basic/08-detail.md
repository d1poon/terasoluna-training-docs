---
title: "詳細画面 (UserDetailController + detail.jsp)"
date: 2026-07-30
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc, tech/jsp]
step: 08
---

# Step 08 — 詳細画面 (UserDetailController + detail.jsp)

## このステップのゴール

- 一覧 (Step 06) / 検索結果 (Step 07) から選んだ 1 件のユーザ情報を表示する画面を作る
- URL のクエリパラメータ (`?id=`) で対象を指定する
- Step 09 の編集画面に向けた素材 (Controller・Form の置き場所) を揃える

## 事前準備

- [Step 07](/steps-basic/07-search) 完了

## URL 設計についての注記

主軸トラック (Security 版) の「ユーザ情報画面」は、`Authentication.getName()` でログイン中の ID を取得するため URL にパラメータを持たない (`/user-info`)。

このトラックには認証が無く「自分」という概念が無いため、**表示対象を URL パラメータ (`?id=`) で明示する**設計にする。`/users/{id}` のような path variable ではなく `/users/detail?id=xxx` のクエリパラメータ形式を採用する ([[/steps-basic/06-list|Step 06]] の一覧・[[/steps-basic/07-search|Step 07]] の検索結果と同じ `<c:url>` + `<c:param>` の組み立て方に揃えている)。

## 追加するファイル (2 つ)

### 1. `UserDetailController.java` (view メソッド)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 userdetail/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserDetailController.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.userdetail;

import jakarta.inject.Inject;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

@Controller
public class UserDetailController {

    @Inject
    UserService userService;

    @GetMapping("/users/detail")                                              // ①
    public String view(@RequestParam String id, Model model) {                 // ②
        User user = userService.findById(id);                                  // ③
        model.addAttribute("user", user);
        return "userdetail/detail";                                           // ④
    }
}
```

#### なぜこう書く

- **① `/users/detail`** — 一覧・検索結果の「詳細」リンク先 ([Step 06](/steps-basic/06-list)・[Step 07](/steps-basic/07-search) で `<c:url>` により生成済み)
- **② `@RequestParam String id`** — クエリパラメータ `?id=` を受け取る。**主軸トラックの `Authentication auth` の代わりに URL パラメータを信頼する**のがこのトラックの設計。信頼できる根拠 (認証) が無い状態でパラメータを信頼している点は、Step 09 で明示的に注意点として扱う
- **③ `userService.findById(id)`** — [Step 05](/steps-basic/05-service) で定義済みの取得メソッド
- **④ `return "userdetail/detail"`** — `/WEB-INF/views/userdetail/detail.jsp` に解決される

### 2. `detail.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l1">📁 userdetail/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 detail.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>ユーザ詳細 — demo</title>
</head>
<body>
    <h1>ユーザ詳細</h1>

    <c:if test="${not empty message}">
        <div class="info"><c:out value="${message}" /></div>                    <%-- ① --%>
    </c:if>

    <table>
        <tr><th>ID</th><td><c:out value="${user.id}" /></td></tr>
        <tr><th>名前</th><td><c:out value="${user.name}" /></td></tr>
        <tr><th>役職</th><td><c:out value="${user.role}" /></td></tr>
    </table>

    <c:url var="editUrl" value="/users/edit">
        <c:param name="id" value="${user.id}" />
    </c:url>
    <a href="${editUrl}">編集する</a>
    <a href="${pageContext.request.contextPath}/users">一覧に戻る</a>
</body>
</html>
```

- **① Flash メッセージの表示** — Step 09 で PRG 後の「更新しました」を Flash 経由で受け取る想定。今 Step では常に空

## ディレクトリ構造 (このステップ完了時)

```
demo/demo-web/src/main/java/com/example/demo/app/
└── userdetail/
    └── UserDetailController.java       ← 追加

demo/demo-web/src/main/webapp/WEB-INF/views/
└── userdetail/
    └── detail.jsp                      ← 追加
```

## 動作確認

Tomcat 起動 (未起動なら [Step 02](/steps-basic/02-empty-boot)) → `http://localhost:8080/demo-web/users` → 任意の行の「詳細」リンク → `/users/detail?id=...` に遷移し、ID・名前・役職が表示される → OK。[Step 07](/steps-basic/07-search) の検索結果からの「詳細」リンクでも同様に確認する。「編集する」リンクは Step 09 まで 404。

## よくある詰まり

- **存在しない `id` で `NullPointerException`**: 一覧・検索から辿らず、`?id=` に手入力で存在しないユーザ ID を渡すと `userService.findById(id)` が `null` を返し、JSP の `${user.id}` 参照で例外になる。この教材ではあえて防御コードを入れていない (「URL の id を信用しきってよいのか」を Step 09 で扱うための伏線)
- **`400 Bad Request`**: `/users/detail` に `id` パラメータを付けずにアクセスした場合、`@RequestParam String id` は必須パラメータ扱いのため 400 エラーになる。存在しない URL にアクセスしたときの `404 Resource Not Found Error!` (archetype の `<error-page>` 経由) とは別物
- **`${u.name}` や `${user.name}` が空欄**: [Step 03](/steps-basic/03-user-domain) の `User` Entity に `name` フィールド・getter が無い

## 次

→ [Step 09: 編集画面 + PRG パターン](/steps-basic/09-edit)
