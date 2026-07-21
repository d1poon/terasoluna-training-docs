---
title: "メニュー画面"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/jsp]
step: 08
---

# Step 08 — メニュー画面 & 共通ヘッダ

## このステップのゴール

- ログイン後の**メニュー画面** (2つのリンク) を表示
- 全画面で使いまわす**共通ヘッダ** (ユーザ名 + ログアウト + メニューボタン) を分離
- ログアウトも動く

## 事前準備

- [Step 07](/steps/07-login) 完了

## 追加するファイル (3つ)

### 1. `src/main/java/com/example/rolemgr/controller/MenuController.java`

```java
package com.example.rolemgr.controller;

import java.security.Principal;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MenuController {

    @GetMapping({"/", "/menu"})
    public String menu(Principal principal, Model model) {
        model.addAttribute("loginId", principal.getName());
        return "menu";
    }
}
```

### 2. `src/main/webapp/WEB-INF/views/common/header.jsp`

**全画面共通のヘッダ**。他の JSP から `<%@ include %>` される。

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<div style="border-bottom:1px solid #ccc; padding:8px; margin-bottom:16px;">
    <span>${loginId}さん</span>

    <form action="<c:url value='/logout'/>" method="post" style="display:inline; margin-left:16px;">
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
        <button type="submit">ログアウト</button>
    </form>

    <c:if test="${not empty showMenuButton}">
        <a href="<c:url value='/menu'/>" style="margin-left:8px;">
            <button type="button">メニュー</button>
        </a>
    </c:if>
</div>
```

### 3. `src/main/webapp/WEB-INF/views/menu.jsp`

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>メニュー画面</title>
</head>
<body>
    <%-- メニュー画面自体にはメニューボタン不要 --%>
    <%@ include file="common/header.jsp" %>

    <h1>メニュー</h1>

    <ul>
        <li><a href="<c:url value='/search'/>">ユーザーを検索する</a></li>
        <li><a href="<c:url value='/user-info'/>">自分のユーザ情報を見る</a></li>
    </ul>
</body>
</html>
```

## なぜこう書く

### `Principal principal` を Controller の引数に書くだけ
Spring MVC が自動で「今ログインしているユーザ情報」を注入してくれる。**セッションを直接触らない**のが正解。

### `@GetMapping({"/", "/menu"})`
`/` と `/menu` の**両方**でメニュー画面を出す。アプリのトップページとしても機能する。

### 共通ヘッダの `<%@ include file="..." %>` (静的 include)

| 種類 | 書き方 | 挙動 |
|---|---|---|
| **静的 include** | `<%@ include file="common/header.jsp" %>` | プリコンパイル時に**テキスト連結**。親の taglib 宣言を共有 |
| **動的 include** | `<jsp:include page="common/header.jsp" />` | 実行時に**別リクエスト**として実行。速度は落ちる |

今回はテンプレの共通化なので**静的 include** で十分。

### `${loginId}さん` の EL 式
- `${変数名}` は Servlet の request/session/application スコープから探して埋め込む
- Controller が `model.addAttribute("loginId", ...)` で置いた値がここで拾える
- **サーバ側の変数を HTML に埋め込む**のが JSP の本業

### ログアウトが POST の理由
GET だと「他サイトから `<img src='.../logout'>` を仕込まれる」だけでログアウトされてしまう (CSRF 攻撃)。POST + CSRF トークンで守る。

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/
├── java/com/example/rolemgr/
│   └── controller/
│       ├── LoginController.java
│       └── MenuController.java            ← 追加
└── webapp/WEB-INF/views/
    ├── login.jsp
    ├── menu.jsp                           ← 追加
    └── common/
        └── header.jsp                     ← 追加
```

## 動作確認

再起動 → http://localhost:8080/login → ログイン → `/menu` に遷移 → **「○○さん / ログアウト」** + **「ユーザーを検索する」「自分のユーザ情報を見る」の 2 リンク**が出る。

- 「ログアウト」ボタン → ログイン画面に戻る + 「ログアウトしました」の緑字
- リンクは 2 つとも 404 or Whitelabel (次のステップで作る)

## 次

→ [Step 09: 検索画面](/steps/09-search)
