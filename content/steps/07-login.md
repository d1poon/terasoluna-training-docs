---
title: "ログイン画面 (LoginController + login.jsp)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc, tech/jsp]
step: 07
---

# Step 07 — ログイン画面 (LoginController + login.jsp)

## このステップのゴール

- 独自の login 画面を作り、Spring Security デフォルトの灰色 UI から置き換える
- Controller を `demo-web` の `app.login` パッケージに配置 (TERASOLUNA 規約: **usecase 別サブパッケージ**)
- JSP のフォームに CSRF token を埋め込む
- 実物のログイン (u001 / password) が通ってメニュー画面 (Step 08) にリダイレクトされる (メニュー未作成でも Whitelabel 404 が出れば OK)

## 事前準備

- [Step 06](/steps/06-auth-foundation) 完了 (spring-security.xml と DB に u001〜u005 が入った状態)

## 追加するファイル (2 つ)

### 1. `LoginController.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成 (usecase 別サブパッケージ)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-web/</div>
    <div class="ft-line ft-l2">📁 src/main/java/</div>
    <div class="ft-line ft-l3">📁 com/example/demo/app/</div>
    <div class="ft-line ft-l4">📁 login/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l5 ft-file">📄 LoginController.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.login;                                            // ①

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller                                                                    // ②
public class LoginController {

    @GetMapping("/login")                                                      // ③
    public String view() {
        return "login/login";                                                  // ④
    }
}
```

#### なぜこう書く

- **① `package com.example.demo.app.login`** — TERASOLUNA 規約: Controller は `demo-web` モジュールの **`app.<usecase>`** サブパッケージに配置 (`app.login`, `app.menu`, `app.userinfo` など)
- **② `@Controller`** — Spring MVC の Controller として Bean 登録。`context:component-scan` の base-package `com.example.demo.app` が拾う
- **③ `@GetMapping("/login")`** — GET /login リクエストを受ける。Spring Security 側で `permitAll` に指定した URL (Step 06 参照)
- **④ `return "login/login"`** — ビュー名。`spring-mvc.xml` の InternalResourceViewResolver 設定 (prefix=`/WEB-INF/views/`, suffix=`.jsp`) で `/WEB-INF/views/login/login.jsp` に解決される

### 2. `login.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-web/</div>
    <div class="ft-line ft-l2">📁 src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l3">📁 login/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l4 ft-file">📄 login.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>                          <!-- ① -->
<%@ taglib prefix="c" uri="jakarta.tags.core" %>                            <!-- ② -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>ログイン — demo</title>
</head>
<body>
    <h1>ログイン</h1>

    <c:if test="${param.error != null}">                                    <!-- ③ -->
        <div class="error">ID または パスワードが違います</div>
    </c:if>
    <c:if test="${param.logout != null}">
        <div class="info">ログアウトしました</div>
    </c:if>

    <form action="${pageContext.request.contextPath}/authenticate" method="post">
        <input type="hidden"
               name="${_csrf.parameterName}"                                <!-- ④ -->
               value="${_csrf.token}" />

        <label>ID
            <input type="text" name="id" required autofocus />              <!-- ⑤ -->
        </label>
        <label>パスワード
            <input type="password" name="password" required />
        </label>
        <button type="submit">ログイン</button>
    </form>
</body>
</html>
```

#### なぜこう書く

- **① `<%@ page contentType="text/html; charset=UTF-8" %>`** — UTF-8 で HTML を返す宣言。日本語文字化けの防衛線
- **② `<%@ taglib prefix="c" uri="jakarta.tags.core" %>`** — JSTL Core (Jakarta EE 版)。旧 `http://java.sun.com/jsp/jstl/core` は Jakarta では動かない
- **③ `<c:if test="${param.error != null}">`** — Spring Security が `?error` パラメータで戻すので、それを検出してメッセージ表示。**「ID とパスワードのどちらが間違いか」は漏らさない**
- **④ CSRF token の hidden 埋め込み** — `<sec:csrf />` を spring-security.xml で有効化しているので必須。書き忘れると全 POST が 403 で拒否される
- **⑤ `name="id"` / `name="password"`** — spring-security.xml で `username-parameter="id"` / `password-parameter="password"` と対応

## `spring-mvc.xml` の ViewResolver を確認

archetype 生成品 `demo-web/src/main/resources/META-INF/spring/spring-mvc.xml` に、以下があるはず:

```xml
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/WEB-INF/views/" />
    <property name="suffix" value=".jsp" />
</bean>
```

これで Controller が `"login/login"` を返すと `/WEB-INF/views/login/login.jsp` が描画される。

## ディレクトリ構造 (このステップ完了時)

```
demo/demo-web/src/main/
├── java/com/example/demo/app/
│   └── login/
│       └── LoginController.java              ← 追加
├── webapp/WEB-INF/views/
│   └── login/
│       └── login.jsp                          ← 追加
└── resources/META-INF/spring/
    ├── spring-mvc.xml                         (既存)
    └── spring-security.xml                    (Step 06 で編集)
```

## 動作確認

```powershell
cd demo
mvn -pl demo-web -am cargo:run
```

http://localhost:8080/demo-web/login にアクセス:

1. **自作の login.jsp** が出る (Step 06 時点の灰色 UI ではない) → OK
2. ID: `u001`、パスワード: `password` → ログインボタン
3. リダイレクトで `/menu` に飛ぶ → **404 Whitelabel Error Page** が出れば OK (Step 08 で menu を作る)

## よくある詰まり

- **CSRF 403** — CSRF hidden を忘れ、または `${_csrf.parameterName}` のスペルミス。`view-source:` で HTML を確認して token が入っているかチェック
- **文字化け**: `<%@ page contentType="text/html; charset=UTF-8" %>` を書き忘れ or `web.xml` の CharacterEncodingFilter 設定漏れ
- **404 `/authenticate`**: spring-security.xml の `login-processing-url="/authenticate"` と form の `action` が不一致
- **`login/login.jsp` が見つからない**: JSP の物理配置は `/WEB-INF/views/login/login.jsp`。ViewResolver の prefix/suffix と 実配置が対応しているか確認
- **JSTL のタグが `<c:if>` そのまま表示される (レンダリングされない)**: `taglib` 宣言の URI が旧 (`http://java.sun.com/...`) → **Jakarta EE 系は `jakarta.tags.core`** に更新
- **JSP forward による Spring Security の再フィルタで無限リダイレクト**: 5.11.0 系ではあまり出ないが、Boot 単一版で踏んだ既知バグ。関連: [[/steps-boot/06-auth-foundation]] の Boot 版参照

## 次

→ [Step 08: メニュー画面 (MenuController + menu.jsp)](/steps/08-menu)
