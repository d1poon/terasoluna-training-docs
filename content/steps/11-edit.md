---
title: "変更画面 & PRG パターン"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/jsp, tech/prg-pattern]
step: 11
---

# Step 11 — 変更画面 & 更新処理 (PRG パターン)

## このステップのゴール

- 変更フォーム (現在の役職を初期値に) を表示
- 送信 → DB 更新 → **リダイレクト**で表示画面 (`/user-info`) に戻る
- PRG (Post-Redirect-Get) パターンで**リロード二重更新を防ぐ**

## 事前準備

- [Step 10](/steps/10-user-info) 完了

## 追加するファイル (1つ + 1修正)

### 1. `UserInfoController.java` に 2 メソッド追加

Step 10 のファイルを開いて、`editForm` と `edit` を追加:

```java
package com.example.rolemgr.controller;

import java.security.Principal;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

    @GetMapping("/user-info/edit")
    public String editForm(Principal principal, Model model) {
        String id = principal.getName();
        User user = userService.findById(id);
        model.addAttribute("loginId", id);
        model.addAttribute("user", user);
        return "userInfoEdit";
    }

    @PostMapping("/user-info/edit")
    public String edit(@RequestParam String role, Principal principal) {
        userService.updateRole(principal.getName(), role);
        return "redirect:/user-info";
    }
}
```

### 2. `src/main/webapp/WEB-INF/views/userInfoEdit.jsp`

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="showMenuButton" value="true" />
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ユーザー情報変更画面</title>
</head>
<body>
    <%@ include file="common/header.jsp" %>

    <h1>ユーザー情報変更</h1>

    <p>ID: ${user.id}</p>

    <form action="<c:url value='/user-info/edit'/>" method="post">
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
        <label>役職:
            <input type="text" name="role" value="${user.role}" />
        </label>
        <button type="submit">変更する</button>
    </form>
</body>
</html>
```

## なぜこう書く

### PRG (Post-Redirect-Get) パターン
```java
@PostMapping("/user-info/edit")
public String edit(...) {
    userService.updateRole(...);
    return "redirect:/user-info";  // ← ここが肝
}
```

**もし `return "userInfo";` にしたら:**
- ブラウザは POST 結果として`userInfo.jsp`を表示
- ユーザがブラウザリロードすると→ **同じ POST がもう一度飛ぶ** → 更新が二重に走る
- ブラウザは大抵「フォーム再送信しますか?」と警告するがイマイチ

**`return "redirect:/user-info";` にすると:**
- ブラウザは 302 レスポンス + Location ヘッダを受け取る
- ブラウザは自動的に `GET /user-info` を発行する
- 現在の URL バーが `/user-info` になる
- リロードしても GET なので副作用なし ✓

これは**Web アプリのイディオム**。POST の後は必ずリダイレクト。

### `redirect:` 接頭辞
Spring MVC 独自の記法。View名の代わりに書くと、内部で `HttpServletResponse.sendRedirect(...)` が呼ばれる。

### `forward:` との違い

| 種類 | HTTP レベル | ブラウザから見える URL |
|---|---|---|
| `redirect:` | 302 レスポンス → ブラウザが再リクエスト (**2回目のリクエスト**) | 変わる (`/user-info` に) |
| `forward:` | サーバ内で別ハンドラに投げる (**1回目のリクエストのまま**) | 変わらない (`/user-info/edit` のまま) |

**PRG では redirect を使う**。forward だとリロード対策にならない。

### 入力の初期値 `value="${user.role}"`
- フォームを開いた時に現在の役職が入っている
- 空欄で送信すると空文字で更新される (バリデーション未実装の状態)。実案件では `<c:if test="${empty role}">` などで検証必須

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/
├── java/com/example/rolemgr/controller/
│   └── UserInfoController.java            ← 3メソッドに (view + editForm + edit)
└── webapp/WEB-INF/views/
    └── userInfoEdit.jsp                   ← 追加
```

## 動作確認

再起動 → ログイン → メニュー → 「自分のユーザ情報を見る」→ 「変更する」

- 現在の役職が入力欄に入っている
- 「社長」に書き換えて送信 → **URL バーが `/user-info` に変わる (PRG 動作)** → 表示画面に戻り、役職が「社長」になっている
- **F5 リロード** → 何も起きない (GET なので安全)。ユーザ情報画面がリロードされるだけ

## 次

→ [Step 12: 完成 & まとめ](/steps/12-complete)
