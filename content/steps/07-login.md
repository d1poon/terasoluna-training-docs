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

- JSP ファイルの先頭に必ず書く
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

@Controller                                                                  // ①
public class LoginController {

    @GetMapping("/login")                                                    // ②
    public String loginForm(@RequestParam(required = false) String error,    // ③
                            @RequestParam(required = false) String logout,
                            Model model) {                                   // ④
        if (error != null) {                                                 // ⑤
            model.addAttribute("errorMessage", "ID またはパスワードが違います");
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "ログアウトしました");
        }
        return "login";                                                      // ⑥
    }
}
```

> 💡 コード内の丸数字 (①〜⑥) を押すと、その行の説明がポップアップで表示されます。下の一覧も同じ内容です。

- **① `@Controller`** — このクラスを Spring MVC の「Web の窓口係」として登録するラベル。起動時にコンポーネントスキャンで拾われて Bean になる。
- **② `@GetMapping("/login")`** — GET リクエストの `/login` がこのメソッドに来る、という宣言。ブラウザで `http://.../login` を開いた瞬間、下のコードが実行される。
- **③ `@RequestParam(required = false) String error`** — URL の `?error` パラメータを受け取る。`required = false` なので付いていない場合は `null` になる (エラーで戻された時だけ `?error` 付きで飛んでくる)。
- **④ `Model model`** — Spring MVC が自動で用意してくれる「JSP に渡すデータの箱」。この引数に書くだけで注入される (DI)。
- **⑤ `if (error != null)`** — エラー付きで戻された場合だけ、赤字メッセージ用のキーを Model に詰める。JSP 側で `${errorMessage}` で拾って表示。
- **⑥ `return "login";`** — 「`login.jsp` を実行しろ」の指示。実際は `spring.mvc.view.prefix/suffix` の設定で `/WEB-INF/views/login.jsp` に forward される。

**GET のみ**の Controller。POST は Spring Security が自動処理してくれるので**書かない**。

### 2. `src/main/webapp/WEB-INF/views/login.jsp`

```jsp
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>    <%-- ① --%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>                            <%-- ② --%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ログイン画面</title>
</head>
<body>
    <h1>ログイン</h1>

    <c:if test="${not empty errorMessage}">                                 <%-- ③ --%>
        <p style="color:red;">${errorMessage}</p>
    </c:if>
    <c:if test="${not empty logoutMessage}">
        <p style="color:green;">${logoutMessage}</p>
    </c:if>

    <form action="<c:url value='/login'/>" method="post">                   <%-- ④ --%>
        <input type="hidden" name="${_csrf.parameterName}"                  <%-- ⑤ --%>
               value="${_csrf.token}" />

        <div>
            <label>ユーザID:
                <input type="text" name="id" required />                    <%-- ⑥ --%>
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

> 💡 コード内の丸数字 (①〜⑥) を押すと、その行の説明がポップアップで表示されます。下の一覧も同じ内容です。

- **① `<%@ page contentType="text/html; charset=UTF-8" %>`** — この JSP は「UTF-8 の HTML」を返すと宣言。日本語が化けないようにする最重要行、JSP ファイルの先頭に必ず書く。
- **② `<%@ taglib prefix="c" uri="jakarta.tags.core" %>`** — JSTL の Core タグ集を `c:` プレフィックスで使うと宣言。この行があるから `<c:if>` や `<c:forEach>` が使える。
- **③ `<c:if test="${not empty errorMessage}">`** — サーバ側 (Controller) が `errorMessage` を Model に詰めていた時だけ、中の赤字を表示する。「値があれば表示、無ければスキップ」の書き方。
- **④ `<form action="<c:url value='/login'/>" method="post">`** — フォーム送信先を `/login`、送信方法を POST に指定。`<c:url>` はコンテキストパスを自動で付けてくれるヘルパー。
- **⑤ `<input type="hidden" name="${_csrf.parameterName}" ...>`** — Spring Security の CSRF 合言葉をフォームに埋め込む。**この行が抜けると POST が 403 で弾かれる**。詳細は次の「なぜこう書く」節。
- **⑥ `<input type="text" name="id" required />`** — ユーザ ID の入力欄。`name="id"` は Controller の `@RequestParam` および SecurityConfig の `.usernameParameter("id")` と対応。**3 箇所で名前を揃える必要**あり。

## なぜこう書く

### GET だけ書いて POST は書かない
Spring Security が POST `/login` を Filter で先に**横取り**する。Controller まで来ない。**認証コードを Controller に書かないのは正しい設計**。

### CSRF トークンの hidden 埋め込み
Spring Security の CSRF 保護。**この行が抜けると POST が 403 で弾かれる**。Spring Security が JSP からアクセスできる場所に `_csrf` オブジェクトを勝手に置いてくれている。

#### CSRF 攻撃と対策の流れ (図)

<div class="flow-diagram flow-diagram--bad">
  <div class="flow-diagram-title">🚫 CSRF 攻撃のシナリオ (対策無しだとこう抜かれる)</div>
  <div class="flow-row">
    <div class="flow-node flow-node--attacker">
      <div class="flow-node-icon">🕷</div>
      <div class="flow-node-name">攻撃者のサイト</div>
      <div class="flow-node-detail">
        隠された HTML で銀行サイトへ POST を仕込む
        <code>&lt;img src="bank/transfer?to=..."&gt;</code>
      </div>
    </div>
    <div class="flow-arrow">
      <div class="flow-arrow-label">自動送信</div>
      <div class="flow-arrow-note">ブラウザは Cookie (JSESSIONID) を勝手に付ける</div>
    </div>
    <div class="flow-node flow-node--server">
      <div class="flow-node-icon">🏦</div>
      <div class="flow-node-name">銀行サーバ</div>
      <div class="flow-node-detail">
        <span class="flow-check-ok">✓</span> Session: OK<br>
        <span class="flow-check-ng">✗</span> 合言葉 (CSRF token): 無し<br>
        <span class="flow-verdict-bad">→ 403 で拒否</span>
      </div>
    </div>
  </div>
  <div class="flow-footnote">
    ブラウザは <strong>JSESSIONID を自動で付けてしまう</strong>ので、
    サーバ側は「正規サイトからの POST」と「攻撃者サイトからの POST」を Cookie だけでは区別できない。
    そのため合言葉 (CSRF トークン) が必要。
  </div>
</div>

**対策**: 正規サイトが発行するフォームだけに hidden な合言葉 (`_csrf.token`) を埋め込む。
攻撃者のサイトは合言葉を知らないので、POST しても弾かれる。

<div class="flow-diagram flow-diagram--good">
  <div class="flow-diagram-title">✅ 対策済み: 正規フォーム経由の POST</div>
  <div class="flow-row">
    <div class="flow-node flow-node--legit">
      <div class="flow-node-icon">🏛</div>
      <div class="flow-node-name">正規サイト (自分の Web アプリ)</div>
      <div class="flow-node-detail">
        フォームに hidden で合言葉を埋め込む
        <code>&lt;input name="_csrf" value="ABC123"&gt;</code>
      </div>
    </div>
    <div class="flow-arrow">
      <div class="flow-arrow-label">POST + 合言葉</div>
      <div class="flow-arrow-note">Cookie と CSRF token の両方を送る</div>
    </div>
    <div class="flow-node flow-node--server">
      <div class="flow-node-icon">🏦</div>
      <div class="flow-node-name">銀行サーバ</div>
      <div class="flow-node-detail">
        <span class="flow-check-ok">✓</span> Session: OK<br>
        <span class="flow-check-ok">✓</span> 合言葉: 一致<br>
        <span class="flow-verdict-good">→ 200 通す</span>
      </div>
    </div>
  </div>
</div>

### form の `name="id"` `name="password"`
- SecurityConfig で `.usernameParameter("id")`, `.passwordParameter("password")` と指定したのでこの name で送る
- 変えたければ両方合わせて変える必要あり

## ディレクトリ構造 (このステップ完了時)

```
rolemgr/src/main/
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

- **無限リダイレクト** → SecurityConfig の `/WEB-INF/**` permitAll が抜けている ([Step 06 参照](/steps/06-auth-foundation))
- **CSRF エラー (403)** → フォーム内の CSRF トークン hidden が抜けている
- **JSP が真っ白 or 500** → `<%@ taglib %>` の URI 誤り、または `tomcat-embed-jasper` 依存漏れ
- **日本語が化ける** → `<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>` が先頭にあるか

## 次

→ [Step 08: メニュー画面](/steps/08-menu)
