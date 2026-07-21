---
title: "ユーザ情報画面"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/jsp]
step: 10
---

# Step 10 — ユーザ情報画面

## このステップのゴール

- 自分の ID と役職を表示する画面を作る
- 「変更する」ボタンを付けて、次のステップに繋げる

**セキュリティの要点**: URL に user_id を含めない。**サーバ側で「ログイン中のユーザ ID」を確定**する。他人の情報が漏れない設計。

## 事前準備

- [Step 09](/steps/09-search) 完了

## 追加するファイル (2つ)

### 1. `src/main/java/com/example/rolemgr/controller/UserInfoController.java`

**Step 11 で編集メソッドも追加する**ので、今は表示メソッドだけ書く。

```java
package com.example.rolemgr.controller;

import java.security.Principal;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.rolemgr.domain.User;
import com.example.rolemgr.service.UserService;

@Controller
public class UserInfoController {

    private final UserService userService;

    public UserInfoController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user-info")
    public String view(Principal principal, Model model) {
        String id = principal.getName();
        User user = userService.findById(id);
        model.addAttribute("loginId", id);
        model.addAttribute("user", user);
        return "userInfo";
    }
}
```

### 2. `src/main/webapp/WEB-INF/views/userInfo.jsp`

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="showMenuButton" value="true" />
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ユーザー情報画面</title>
</head>
<body>
    <%@ include file="common/header.jsp" %>

    <h1>ユーザー情報</h1>

    <p>ID: ${user.id}</p>
    <p>役職: ${user.role}</p>

    <a href="<c:url value='/user-info/edit'/>">
        <button type="button">変更する</button>
    </a>
</body>
</html>
```

## なぜこう書く

### URL に user_id を含めない
悪い設計例:
```
GET /user-info?userId=u001
```
→ ブラウザで手動で `u001` を `u002` に書き換えるだけで**他人の情報が見える** (IDOR 脆弱性)。

正しい設計:
```java
String id = principal.getName();  // サーバが「認証済みユーザ」を決定
```
→ URL パラメータでは指定不可。書き換え不能。

### `${user.role}` の EL 式
- `user` は Model に addAttribute した `com.example.rolemgr.domain.User`
- `user.role` は自動的に `user.getRole()` を呼び出す (**JavaBean 規約**)
- **getter がないと空表示になる**。getter を書き忘れると詰まる

### 「変更する」ボタンをリンクにする
`<a href="..."><button>変更する</button></a>` は HTML5 では厳密には invalid (`<a>` の中に `<button>`)。**正しくは:**
```html
<a href="<c:url value='/user-info/edit'/>">変更する</a>
```
もしくは form + POST でリダイレクト。**教材では見た目重視で妥協**しているだけなので、コードレビューでは指摘してあげる。

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/
├── java/com/example/rolemgr/controller/
│   └── UserInfoController.java            ← 追加
└── webapp/WEB-INF/views/
    └── userInfo.jsp                       ← 追加
```

## 動作確認

再起動 → ログイン → メニュー → 「自分のユーザ情報を見る」

- `u001` でログインなら:
  - ID: u001
  - 役職: 部長
- 「変更する」ボタンを押す → `/user-info/edit` に飛ぶ → 404 or Whitelabel (Step 11 で作る)

## 次

→ [Step 11: 変更画面](/steps/11-edit)
