---
title: "検索画面"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/jsp, tech/mybatis]
step: 09
---

# Step 09 — 検索画面

## このステップのゴール

- 役職テキストを入れて検索 → 部分一致で users を絞り込み → 結果を同画面下に表示
- 空文字なら全件表示

## 事前準備

- [Step 08](/steps/08-menu) 完了

## 追加するファイル (2つ)

### 1. `src/main/java/com/example/rolemgr/controller/SearchController.java`

```java
package com.example.rolemgr.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.rolemgr.domain.User;
import com.example.rolemgr.service.UserService;

@Controller
public class SearchController {

    private final UserService userService;

    public SearchController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/search")
    public String search(@RequestParam(required = false) String role,
                         Principal principal,
                         Model model) {
        model.addAttribute("loginId", principal.getName());
        model.addAttribute("role", role);
        if (role != null) {
            List<User> results = userService.searchByRole(role);
            model.addAttribute("results", results);
        }
        return "search";
    }
}
```

### 2. `src/main/webapp/WEB-INF/views/search.jsp`

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="showMenuButton" value="true" />
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>検索画面</title>
</head>
<body>
    <%@ include file="common/header.jsp" %>

    <h1>検索</h1>

    <form action="<c:url value='/search'/>" method="get">
        <label>役職:
            <input type="text" name="role" value="${role}" />
        </label>
        <button type="submit">検索</button>
    </form>

    <c:if test="${results != null}">
        <c:choose>
            <c:when test="${not empty results}">
                <table border="1" style="margin-top:16px; border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="padding:4px 12px;">ID</th>
                            <th style="padding:4px 12px;">役職</th>
                        </tr>
                    </thead>
                    <tbody>
                        <c:forEach var="u" items="${results}">
                            <tr>
                                <td style="padding:4px 12px;">${u.id}</td>
                                <td style="padding:4px 12px;">${u.role}</td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
            </c:when>
            <c:otherwise>
                <p style="margin-top:16px;">該当なし</p>
            </c:otherwise>
        </c:choose>
    </c:if>
</body>
</html>
```

## なぜこう書く

### 検索は GET
- URL がブックマーク可能 (`?role=部長` を共有できる)
- サーバ状態を変えない = 何度実行しても安全 (冪等)
- ブラウザのリロードで再検索されても副作用なし

**更新は POST**、**検索は GET** は HTTP の基本原則。

### `@RequestParam(required = false)`
初回アクセス (`/search`) は `role` パラメータなし → **必須にしない**指定。

### `<c:set var="showMenuButton" value="true" />`
共通ヘッダ (`header.jsp`) で `<c:if test="${not empty showMenuButton}">` で「メニュー」ボタンを出すためのフラグ。メニュー画面では省略、他の画面ではセットする。

### `<c:choose>` / `<c:when>` / `<c:otherwise>`
JSTL の if-else 構造。「results が空リスト」と「results が null (検索未実行)」を区別する必要があるため、外側の `<c:if test="${results != null}">` と組み合わせて 3 状態を分けている。

| results の状態 | 意味 | 画面表示 |
|---|---|---|
| null | まだ検索していない | フォームだけ |
| 空リスト | 検索したが該当0件 | 「該当なし」 |
| 1件以上 | ヒット | テーブル表示 |

### 部分一致検索 (`LIKE`)
Mapper XML で書いた:
```sql
WHERE role LIKE '%' || #{role} || '%'
```
- `#{role}` は PreparedStatement のパラメータなので SQLインジェクション安全
- `||` は SQL 標準の**文字列連結** (Oracle / PostgreSQL / H2 で動く)。MySQL は `CONCAT()` が必要

## ディレクトリ構造 (このステップ完了時)

```
reference-app/src/main/
├── java/com/example/rolemgr/controller/
│   └── SearchController.java              ← 追加
└── webapp/WEB-INF/views/
    └── search.jsp                         ← 追加
```

## 動作確認

再起動 → ログイン → メニューから「ユーザーを検索する」→ 検索画面。

- 空欄で検索 → 5 件全部出る (全員が LIKE '%%' にマッチ)
- 「部」→ 部長 (u001) だけ出る
- 「長」→ 部長 + 課長 + 係長 の 3 件
- 「xyz」→ 「該当なし」

## 次

→ [Step 10: ユーザ情報画面](/steps/10-user-info)
