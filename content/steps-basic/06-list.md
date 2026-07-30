---
title: "ユーザ一覧画面 (UserListController + list.jsp)"
date: 2026-07-30
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc, tech/jsp]
step: 06
---

# Step 06 — ユーザ一覧画面 (UserListController + list.jsp)

## このステップのゴール

- `/users` にアクセスすると全ユーザを一覧表示する画面を作る
- このトラック最初の画面 (認証が無いので「ログイン後に着地する画面」という前提は無く、`/users` が事実上の入口になる)
- 各行に詳細画面へのリンクを設置し、Step 08 につなげる

## 事前準備

- [Step 05](/steps-basic/05-service) 完了 (`UserService` が動く状態、`findAll()` を含む)

## なぜ「検索の空欄条件」ではなく `findAll()` を別に用意するのか

一覧を「役職検索を空欄で叩いた結果」として済ませることもできるが、この教材では別メソッドとして用意する。

- **画面の意図がコードにそのまま出る**: 一覧画面は「無条件で全件」、検索画面 (Step 07) は「条件付き」。メソッド名を分けることで、呼び出し側 (Controller) を見ただけで意図がわかる
- **将来の変更に強い**: 一覧だけソート順を変える、検索だけページングを付ける、といった画面ごとの要件差分に対応しやすい

## 追加するファイル (2 つ)

### 1. `UserListController.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l1">📁 userlist/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 UserListController.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.userlist;

import java.util.List;
import jakarta.inject.Inject;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.demo.domain.model.User;
import com.example.demo.domain.service.user.UserService;

@Controller
public class UserListController {

    @Inject
    UserService userService;                                                   // ①

    @GetMapping("/users")                                                      // ②
    public String list(Model model) {
        List<User> users = userService.findAll();                              // ③
        model.addAttribute("users", users);
        return "userlist/list";                                                // ④
    }
}
```

#### なぜこう書く

- **① `@Inject UserService`** — Step 05 で作った Service を注入。DI に `@Autowired` ではなく `@Inject` を使うのは TERASOLUNA 規約 ([[/steps-basic/05-service|Step 05]] 参照)
- **② `/users`** — このトラックの入口の URL。主軸トラック (Security 版) の `/menu` に相当するが、ログイン後の着地ではなく直接アクセスする画面
- **③ `userService.findAll()`** — 条件なしで全件取得
- **④ `return "userlist/list"`** — ViewResolver の prefix (`/WEB-INF/views/`) と合わせて `/WEB-INF/views/userlist/list.jsp` に解決される

### 2. `list.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l1">📁 userlist/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l2 ft-file">📄 list.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>ユーザ一覧 — demo</title>
</head>
<body>
    <h1>ユーザ一覧</h1>

    <p><a href="${pageContext.request.contextPath}/users/search">役職で検索する</a></p>

    <table>
        <thead>
            <tr><th>ID</th><th>名前</th><th>役職</th><th></th></tr>
        </thead>
        <tbody>
            <c:forEach var="u" items="${users}">
                <c:url var="detailUrl" value="/users/detail">                  <%-- ① --%>
                    <c:param name="id" value="${u.id}" />
                </c:url>
                <tr>
                    <td><c:out value="${u.id}" /></td>
                    <td><c:out value="${u.name}" /></td>                       <%-- ② --%>
                    <td><c:out value="${u.role}" /></td>
                    <td><a href="${detailUrl}">詳細</a></td>
                </tr>
            </c:forEach>
        </tbody>
    </table>
</body>
</html>
```

- **① `<c:url>` + `<c:param>`** — 動的な値 (`u.id`) を含む URL は文字列連結でなくこの組み合わせで組み立てる。`<c:param>` が値を URL エンコードしてくれるので、`id` に `&` 等の記号が入っても壊れない。素朴に `href="${pageContext.request.contextPath}/users/detail?id=${u.id}"` と書くと、値によっては URL が壊れたりエンコード漏れになったりする
- **② `${u.name}`** — [Step 03](/steps-basic/03-user-domain) で定義した `users` テーブルの `name` カラム。主軸トラックの `User` には無いフィールド (認証が無いぶん、一覧で「誰か」を判別できるよう `name` を持たせている)

## ディレクトリ構造 (このステップ完了時)

```
demo/demo-web/src/main/java/com/example/demo/app/
└── userlist/
    └── UserListController.java        ← 追加

demo/demo-web/src/main/webapp/WEB-INF/views/
└── userlist/
    └── list.jsp                       ← 追加
```

## 動作確認

STS の Servers ビューでサーバーを右クリック →「Restart」(未起動の場合は [Step 02](/steps-basic/02-empty-boot) の手順で起動する)。

`http://localhost:8080/demo-web/users` にアクセス → ユーザ一覧がテーブル表示される (件数は [Step 03](/steps-basic/03-user-domain) の初期データによる)。各行の「詳細」リンクは Step 08 まで 404 (`Resource Not Found Error!`)。「役職で検索する」リンクも Step 07 まで 404。

## よくある詰まり

- **一覧が空で表示される**: `users` テーブルに初期データが投入されていない ([Step 03](/steps-basic/03-user-domain) の DDL/データ投入を確認)、またはサーバー再起動を忘れている
- **`findAll` が見つからない (コンパイルエラー)**: `UserService` / `UserServiceImpl` に `findAll()` を追加し忘れている ([Step 05](/steps-basic/05-service) を参照して追記する)
- **`${u.name}` が空欄で出る**: Entity (`User.java`) に `name` フィールドと getter が無い、または `users` テーブルに `name` カラムが無い ([Step 03](/steps-basic/03-user-domain) の定義を確認)

## 次

→ [Step 07: 検索画面 (役職で絞り込み)](/steps-basic/07-search)
