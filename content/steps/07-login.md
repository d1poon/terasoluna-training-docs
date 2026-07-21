---
title: "ログイン画面"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/jsp, tech/spring-security]
step: 07
---

# Step 07 — ログイン画面

## このステップのゴール

- 自作のログイン画面 (login.jsp) を表示できる
- ID/PW を入れてログイン → 認証成功したら `/menu` に遷移する (メニュー画面はまだ次のステップ)

## 事前準備

- [Step 06](/steps/06-auth-foundation) 完了

## 追加するファイル (2つ)

### 1. `src/main/java/com/training/rolemgr/controller/LoginController.java`

**GET のみ**の Controller。POST は Spring Security が自動処理してくれるので**書かない**。

```java
package com.training.rolemgr.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String loginForm(@RequestParam(required = false) String error,
                            @RequestParam(required = false) String logout,
                            Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "ID またはパスワードが違います");
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "ログアウトしました");
        }
        return "login";
    }
}
```

### 2. `src/main/webapp/WEB-INF/views/login.jsp`

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ログイン画面</title>
</head>
<body>
    <h1>ログイン</h1>

    <c:if test="${not empty errorMessage}">
        <p style="color:red;">${errorMessage}</p>
    </c:if>
    <c:if test="${not empty logoutMessage}">
        <p style="color:green;">${logoutMessage}</p>
    </c:if>

    <form action="<c:url value='/login'/>" method="post">
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />

        <div>
            <label>ユーザID:
                <input type="text" name="id" required />
            </label>
        </div>
        <div>
            <label>パスワード:
                <input type="password" name="password" required />
            </label>
        </div>
        <div style="margin-top:8px;">
            <button type="submit">ログイン</button>
        </div>
    </form>

    <p style="margin-top:16px; color:#666; font-size:12px;">
        研修用: id = u001〜u005, password = password
    </p>
</body>
</html>
```

## なぜこう書く

### GET だけ書いて POST は書かない
Spring Security が POST `/login` を Filter で先に**横取り**する。Controller まで来ない。**認証コードを Controller に書かないのは正しい設計**。

### `<%@ taglib prefix="c" uri="jakarta.tags.core" %>`
JSTL Core タグライブラリの宣言。**Jakarta 版の URI に注意** (旧: `http://java.sun.com/jsp/jstl/core`)。Spring Boot 3 = Jakarta なので新しい方。

### CSRF トークンの hidden 埋め込み
```jsp
<input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
```
Spring Security の CSRF 保護。**この行が抜けると POST が 403 で弾かれる**。Spring Security が JSP からアクセスできる場所に `_csrf` オブジェクトを勝手に置いてくれている。

### `<c:url value='/login'/>`
コンテキストパス (例: `/rolemgr`) が付いた URL を生成する JSTL タグ。コンテキストパスが変わってもリンク切れしない。今回はコンテキストパスなしで動くが、**慣習として付けておく**。

### form の `name="id"` `name="password"`
- SecurityConfig で `.usernameParameter("id")`, `.passwordParameter("password")` と指定したのでこの name で送る
- 変えたければ両方合わせて変える必要あり

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/
├── java/com/training/rolemgr/
│   ├── ...
│   └── controller/
│       └── LoginController.java           ← 追加
└── webapp/WEB-INF/views/
    └── login.jsp                          ← 追加
```

## 動作確認

```powershell
mvn spring-boot:run
```

http://localhost:8080/login にアクセス → **自作の「ログイン画面」**が表示される (Spring Security デフォルトの灰色フォームじゃない、こっちの HTML)

- ID `u001` / Password `password` → **`/menu` にリダイレクト → 404 or Whitelabel** (メニュー Controller は次のステップ)
- ID `u001` / Password `wrong` → 「ID またはパスワードが違います」の赤字

## よくある詰まり

- **無限リダイレクト** → SecurityConfig の `/WEB-INF/**` permitAll が抜けている
- **CSRF エラー (403)** → `<input type="hidden" name="${_csrf.parameterName}" ...>` が抜けてる
- **JSP が真っ白 or 500** → `<%@ taglib %>` の URI 誤り、または `tomcat-embed-jasper` 依存漏れ

## 次

→ [Step 08: メニュー画面](/steps/08-menu)
