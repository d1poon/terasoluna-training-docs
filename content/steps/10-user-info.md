---
title: "ユーザ情報画面 (認証コンテキストから ID 取得)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/spring-security]
step: 10
---

# Step 10 — ユーザ情報画面 (認証コンテキストから ID 取得)

## このステップのゴール

- 自分のユーザ情報 (ID + 役職) を表示する画面を作る
- **IDOR 対策**: URL パラメータからでなく **認証コンテキスト** (`Authentication`) から現在ユーザ ID を取る
- Step 11 の変更画面 (POST + PRG パターン) に向けた素材を揃える

## 事前準備

- [Step 09](/steps/09-search) 完了

## 追加するファイル (2 つ)

### 1. `UserInfoController.java` (view メソッド)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 userinfo/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserInfoController.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.userinfo;

import jakarta.inject.Inject;

import org.springframework.security.core.Authentication;                       // ①
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

@Controller
public class UserInfoController {

    @Inject
    UserService userService;

    @GetMapping("/user-info")
    public String view(Authentication auth, Model model) {                     // ②
        String id = auth.getName();                                            // ③
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "userinfo/userInfo";
    }
}
```

#### なぜこう書く

- **① `import org.springframework.security.core.Authentication`** — Spring Security の認証情報オブジェクト。DispatcherServlet が引数として自動で渡してくれる
- **② `Authentication auth`** — メソッド引数に取るだけで DI される
- **③ `auth.getName()`** — 現在ログイン中のユーザ ID (Spring Security の principal.username)。**URL パラメータの id は信用しない** — この違いが IDOR 対策の核

**IDOR 脆弱性の説明**: もし `@GetMapping("/user-info/{id}")` にして URL の id をそのまま使ったら、`u001` のセッションで `/user-info/u003` を叩けば他人の情報が見られてしまう。認証コンテキストから取れば、URL に何が来ようと自分の情報しか見られない。詳細は [[/security-checklist#idor|セキュリティチェックリスト IDOR 節]] 参照。

### 2. `userInfo.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l1">📁 userinfo/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 userInfo.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>ユーザ情報 — demo</title>
</head>
<body>
    <h1>ユーザ情報</h1>

    <c:if test="${not empty message}">
        <div class="info"><c:out value="${message}" /></div>                    <%-- ① --%>
    </c:if>

    <table>
        <tr><th>ID</th><td><c:out value="${user.id}" /></td></tr>
        <tr><th>役職</th><td><c:out value="${user.role}" /></td></tr>
    </table>

    <a href="${pageContext.request.contextPath}/user-info/edit">役職を変更する</a>
    <a href="${pageContext.request.contextPath}/menu">メニューに戻る</a>
</body>
</html>
```

- **① Flash メッセージの表示** — Step 11 で PRG 後の "更新しました" を Flash 経由で受け取る想定。今 Step では常に空

## 動作確認

Tomcat 起動 → ログイン → メニュー → 「自分のユーザ情報」 → `/user-info` に自分の ID / 役職が表示 → OK。「役職を変更する」リンクは Step 11 で作るまで 404。

## よくある詰まり

- **`user` が null**: DB に該当 ID がない (initdb で投入した u001-u005 以外でログイン試みた等)。実際にはあり得ないが、防御的に `if (user == null)` を Controller に追加する選択肢もある
- **`auth` が null**: Spring Security が動いていない、または `permitAll` になっている URL でこのメソッドが呼ばれた → spring-security.xml の `intercept-url` を確認
- **`principal.username` と `auth.getName()` の値が違う**: 認証プロバイダの実装依存。通常は同一だが、カスタム UserDetails で override している場合は要確認

## 次

→ [Step 11: 変更画面 (POST + PRG パターン)](/steps/11-edit)
