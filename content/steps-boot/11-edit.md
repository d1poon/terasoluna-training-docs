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

- [Step 10](/steps-boot/10-user-info) 完了

## 追加するファイル (1つ + 1修正)

### 1. `UserInfoController.java` に 2 メソッド追加

<div class="file-location">
  <div class="file-location-label">✏️ このファイルを編集 (Step 10 で作成済み)</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/main/java/</div>
    <div class="ft-line ft-l2">📁 com/example/rolemgr/</div>
    <div class="ft-line ft-l3">📁 controller/</div>
    <div class="ft-line ft-l4 ft-file">📄 UserInfoController.java <span class="ft-tag ft-tag--modify">修正</span></div>
  </div>
</div>

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

    @GetMapping("/user-info/edit")                                   // ①
    public String editForm(Principal principal, Model model) {
        String id = principal.getName();
        User user = userService.findById(id);                        // ②
        model.addAttribute("loginId", id);
        model.addAttribute("user", user);
        return "userInfoEdit";
    }

    @PostMapping("/user-info/edit")                                  // ③
    public String edit(@RequestParam String role, Principal principal) {  // ④
        userService.updateRole(principal.getName(), role);           // ⑤
        return "redirect:/user-info";                                // ⑥
    }
}
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `@GetMapping("/user-info/edit")`** — 変更画面の**表示**用 GET メソッド。フォームを描画するだけで、まだ DB は変更しない。
- **② `userService.findById(id)`** — フォームの初期値として「今の役職」を表示するため、まず現在値を取得する。編集画面は必ず「現在値ロード → 表示 → ユーザ入力 → 保存」の順。
- **③ `@PostMapping("/user-info/edit")`** — フォーム送信を受ける**同じ URL の POST 版**。GET と POST でメソッドを分けるのが Spring MVC の定石 (同名でも競合しない)。
- **④ `@RequestParam String role`** — フォームの `<input name="role">` から値を受け取る。null は許さない (フォーム側で `required` にしてある想定)。
- **⑤ `userService.updateRole(...)`** — Service 経由で DB を UPDATE。トランザクション境界は `@Service` の `@Transactional` に任せる。
- **⑥ `return "redirect:/user-info";`** — **PRG パターンの核心**。View 名でなく `redirect:` 接頭辞を返すと、Spring が「302 リダイレクトレスポンス」を作ってブラウザに返し、ブラウザは自動で `GET /user-info` を叩き直す。この結果**リロードで二重更新されない**。

### 2. `userInfoEdit.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/main/webapp/</div>
    <div class="ft-line ft-l2">📁 WEB-INF/</div>
    <div class="ft-line ft-l3">📁 views/</div>
    <div class="ft-line ft-l4 ft-file">📄 userInfoEdit.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

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

    <form action="<c:url value='/user-info/edit'/>" method="post">                      <%-- ① --%>
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />    <%-- ② --%>
        <label>役職:
            <input type="text" name="role" value="${user.role}" />                       <%-- ③ --%>
        </label>
        <button type="submit">変更する</button>
    </form>
</body>
</html>
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `<form action="/user-info/edit" method="post">`** — 送信先は Controller の `@PostMapping("/user-info/edit")` と同じ URL、method は必ず **POST** (状態を変えるため)。GET だと URL にパスワード相当の値が乗ってしまうこともある。
- **② `<input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />`** — CSRF 対策の合言葉。**この行がないと POST が Spring Security に 403 で弾かれる**。`_csrf` は Spring Security が JSP から見える場所に自動で置いてくれるオブジェクト。
- **③ `value="${user.role}"`** — フォームを開いた瞬間、入力欄に**現在の役職**が入っている状態にする。Controller の `editForm` メソッドが `model.addAttribute("user", user)` で詰めた値がここで拾える。ユーザが変更しない場合は現在値がそのまま送信される。

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
- ブラウザは POST 結果として `userInfo.jsp` を表示
- ユーザがブラウザリロードすると → **同じ POST がもう一度飛ぶ** → 更新が二重に走る
- ブラウザは大抵「フォーム再送信しますか?」と警告するが、ユーザに毎回判断させることになりユーザ体験としてよくない

**`return "redirect:/user-info";` にすると:**
- ブラウザは 302 レスポンス + Location ヘッダを受け取る
- ブラウザは自動的に `GET /user-info` を発行する
- 現在の URL バーが `/user-info` になる
- リロードしても GET なので副作用なし ✓

<div class="flow-diagram flow-diagram--good">
  <div class="flow-diagram-title">✅ PRG パターンの流れ (これが正解)</div>
  <div class="flow-vertical">
    <div class="flow-step">
      <span class="flow-step-badge">1</span>
      <div class="flow-step-content">
        <strong>ブラウザ</strong>: フォーム送信 <code>POST /user-info/edit</code>
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">2</span>
      <div class="flow-step-content">
        <strong>サーバ</strong>: DB を UPDATE、レスポンスとして <code>302 Location: /user-info</code> を返す
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">3</span>
      <div class="flow-step-content">
        <strong>ブラウザ</strong>: 302 を受けて自動で <code>GET /user-info</code> を送る (URL バーが <code>/user-info</code> に変わる)
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">4</span>
      <div class="flow-step-content">
        <strong>サーバ</strong>: 表示画面用の userInfo.jsp を返す (SELECT だけ、副作用なし)
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge flow-step-badge--yes">✓</span>
      <div class="flow-step-content">
        ユーザが F5 リロード → <code>GET /user-info</code> がもう 1 回飛ぶだけ、二重更新なし
      </div>
    </div>
  </div>
</div>

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
rolemgr/src/main/
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

→ [Step 12: 完成 & まとめ](/steps-boot/12-complete)
