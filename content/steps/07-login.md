---
title: "ログイン画面"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/jsp, tech/spring-security, tech/jsp-basics]
step: 07
---

# Step 07 — ログイン画面 (JSP 入門込み)

## このステップのゴール

- 自作のログイン画面 (login.jsp) を表示できる
- ID/PW を入れてログイン → 成功したら `/menu` に遷移する
- **JSP・JSTL・EL 式が何かをこの Step で理解する**

## 事前準備

- [Step 06](/steps/06-auth-foundation) 完了

---

## 🔰 JSP 入門 (これがわかっていないと login.jsp を読めない)

### JSP とは

**JSP (Java Server Pages)** = 「サーバ側で Java の力を借りて HTML を作るテンプレート」。
拡張子は `.jsp`。以下の 3 種類の要素を組み合わせた HTML の変種:

| 種類 | 書き方 | 何をする |
|---|---|---|
| **HTML** | `<h1>ログイン</h1>` | そのまま表示される |
| **JSP ディレクティブ** | `<%@ page … %>` `<%@ taglib … %>` | ページ全体の設定 |
| **EL 式** | `${変数名}` | サーバ側の変数を埋め込む |
| **JSTL タグ** | `<c:if>` `<c:forEach>` | JSP 内の条件分岐・繰り返し |

**JSP は「サーバ側で」HTML を組み立ててからブラウザに送る**。ブラウザは組み上がった HTML しか見えないので、`${loginId}` みたいな書き方はブラウザに届く前に「u001」等に置き換わっている。

### JSP の置き場所

`src/main/webapp/WEB-INF/views/xxx.jsp`

- `WEB-INF/` は Servlet 仕様で「外から直接アクセスできない」場所。ブラウザが `http://.../WEB-INF/views/login.jsp` と叩いても 404 になる
- Controller が `return "login";` すると、Spring MVC が `/WEB-INF/views/login.jsp` に forward する (Step 01 で設定した `spring.mvc.view.prefix/suffix` の効果)

### `<%@ page contentType="text/html; charset=UTF-8" ... %>` の意味

- ファイルの先頭必須
- `contentType`: ブラウザに「これは UTF-8 の HTML だよ」と伝えるヘッダを設定
- 日本語が化ける時はここが疑わしい

### `<%@ taglib prefix="c" uri="jakarta.tags.core" %>` の意味

- JSTL (JSP Standard Tag Library) の Core タグ集を、`c:` プレフィックスで使うと宣言
- 以降 `<c:if>` `<c:forEach>` `<c:choose>` などが使える
- **Jakarta EE 版の URI に注意** (旧: `http://java.sun.com/jsp/jstl/core`)。Spring Boot 3 は Jakarta なので新しい方

### EL 式 `${xxx}` の意味

- Expression Language。Servlet のスコープ (request, session, application) から変数を探して埋め込む
- Controller の `model.addAttribute("loginId", "u001")` で置いた値がここで拾える
- `${user.role}` は「user オブジェクトの getRole() を呼び出して結果を埋め込む」
- `${_csrf.parameterName}` は Spring Security が自動で提供する CSRF トークンオブジェクト

### JSTL の代表タグ

```jsp
<c:if test="${条件}"> ... </c:if>                     ← 条件が true のとき中身を表示

<c:forEach var="要素" items="${配列}">                  ← 配列/リストで繰り返す
    ${要素}
</c:forEach>

<c:choose>                                             ← if / else if / else
    <c:when test="${条件A}"> A の場合 </c:when>
    <c:when test="${条件B}"> B の場合 </c:when>
    <c:otherwise> どれでもない場合 </c:otherwise>
</c:choose>

<c:set var="foo" value="bar" />                        ← 変数に値をセット

<c:url value='/login'/>                                ← コンテキストパス込み URL を生成
```

### HTML との違いを一枚で

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>       ← JSP 特有 (HTML 側は無視)
<%@ taglib prefix="c" uri="jakarta.tags.core" %>         ← JSP 特有
<!DOCTYPE html>
<html>
<body>
    <h1>ログイン ${userName}さん</h1>                     ← ${...} が JSP 特有 (HTML はそのまま表示するだけ)
    <c:if test="${loggedIn}">                             ← <c:xxx> が JSP 特有
        <a href="/menu">メニュー</a>
    </c:if>
</body>
</html>
```

**サーバが返す前に JSP が処理されて、以下のような純粋 HTML になる**:

```html
<!DOCTYPE html>
<html>
<body>
    <h1>ログイン u001さん</h1>
    <a href="/menu">メニュー</a>
</body>
</html>
```

ブラウザはこれを受け取って表示するだけ。ブラウザに JSP は届かない。

---

## 追加するファイル (2つ)

### 1. `src/main/java/com/example/rolemgr/controller/LoginController.java`

```java
package com.example.rolemgr.controller;

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

**GET のみ**の Controller。POST は Spring Security が自動処理してくれるので**書かない**。

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

## 一行ごとに何をしているか

| 行 | 何をしている |
|---|---|
| `<%@ page ... %>` | この JSP ファイルは UTF-8 の HTML を返す、と宣言 |
| `<%@ taglib prefix="c" ... %>` | `<c:if>` などの JSTL を使うと宣言 |
| `<c:if test="${not empty errorMessage}">` | サーバ側に `errorMessage` があるときだけ中身を表示 (Controller が `?error` 付きURLで来た時にセットする) |
| `<form action="<c:url value='/login'/>" method="post">` | フォーム送信先 = /login、送信方法 = POST |
| `<input type="hidden" name="${_csrf.parameterName}" ...>` | Spring Security の CSRF トークンを hidden で埋める |
| `<input type="text" name="id" required />` | ユーザID の入力欄。`name="id"` は Controller の `@RequestParam` や Spring Security の `.usernameParameter("id")` と対応 |

## なぜこう書く

### GET だけ書いて POST は書かない
Spring Security が POST `/login` を Filter で先に**横取り**する。Controller まで来ない。**認証コードを Controller に書かないのは正しい設計**。

### CSRF トークンの hidden 埋め込み
Spring Security の CSRF 保護。**この行が抜けると POST が 403 で弾かれる**。Spring Security が JSP からアクセスできる場所に `_csrf` オブジェクトを勝手に置いてくれている。

### form の `name="id"` `name="password"`
- SecurityConfig で `.usernameParameter("id")`, `.passwordParameter("password")` と指定したのでこの name で送る
- 変えたければ両方合わせて変える必要あり

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/
├── java/com/example/rolemgr/
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

## 触ってみる (site 上で動く)

**サイトのプレイグラウンドで実物と同じログイン画面を触れる**: [プレイグラウンド](/playground/login)

## よくある詰まり

- **無限リダイレクト** → SecurityConfig の `/WEB-INF/**` permitAll が抜けている (01_Knowledge/spring-security-6-jsp-forward-loop)
- **CSRF エラー (403)** → CSRF トークンの hidden が抜けてる
- **JSP が真っ白 or 500** → `<%@ taglib %>` の URI 誤り、または `tomcat-embed-jasper` 依存漏れ
- **日本語が化ける** → `<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>` が先頭にあるか

## 次

→ [Step 08: メニュー画面](/steps/08-menu)
