---
title: "メニュー画面 (MenuController + menu.jsp)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/jsp]
step: 08
---

# Step 08 — メニュー画面 (MenuController + menu.jsp)

## このステップのゴール

- ログイン後に着地する `/menu` 画面を作る
- 認証済みユーザ ID を JSP 側で表示する
- 検索画面 (Step 09) とユーザ情報画面 (Step 10) へのリンクを設置

## 事前準備

- [Step 07](/steps/07-login) 完了 (u001 でログインが通る状態)

## 追加するファイル (2 つ)

### 1. `MenuController.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 menu/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 MenuController.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.menu;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MenuController {

    @GetMapping("/menu")                                                       // ①
    public String view() {
        return "menu/menu";
    }
}
```

- **① `/menu`** — Spring Security の `default-target-url="/menu"` (Step 06) と対応。ログイン成功後にここに飛んでくる

### 2. `menu.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l1">📁 menu/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 menu.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>メニュー — demo</title>
</head>
<body>
    <h1>メニュー</h1>
    <p>こんにちは、<sec:authentication property="principal.username" /> さん</p>  <%-- ① --%>

    <nav>
        <ul>
            <li><a href="${pageContext.request.contextPath}/search">役職検索</a></li>
            <li><a href="${pageContext.request.contextPath}/user-info">自分のユーザ情報</a></li>
        </ul>
    </nav>

    <form action="${pageContext.request.contextPath}/logout" method="post">
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
        <button type="submit">ログアウト</button>
    </form>
</body>
</html>
```

- **① `<sec:authentication property="principal.username" />`** — 認証コンテキストから現在ログイン中の user ID を表示。**URL パラメータからでなく認証コンテキストから取る**のがセキュリティ的に正しい (詳細は [[/security-checklist#idor|IDOR 対策]] 参照)。`sec` prefix は共通 `include.jsp` で既に宣言済み ([[/steps/07-login|Step 07]] の「共通 include.jsp の自動前置」参照) なのでこの JSP で再宣言していない

## 動作確認

Tomcat 起動 → ログイン → `/menu` に着地 → 「こんにちは、u001 さん」が表示 → OK。検索/ユーザ情報リンクは 404 (次の Step で作る)。

## よくある詰まり

- **`<sec:authentication>` タグが未定義**: `demo-web` の pom に `terasoluna-gfw-security-web-dependencies` が入っていない、または (通常起きないが) `include.jsp` の自動前置設定が外れている
- **CSRF 403 (ログアウト時)**: ログアウトフォームにも CSRF token を埋め込む必要あり (`sec:csrf` が有効な限り)
- **`principal.username` が null**: 認証が通っていない (Spring Security のフィルタが働いていない) → spring-security.xml と web.xml の filter 設定を確認

## 次

→ [Step 09: 検索画面 (SearchController + Form + LIKE 検索)](/steps/09-search)
