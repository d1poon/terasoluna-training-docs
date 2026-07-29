---
title: "ログイン画面 (LoginController + login.jsp)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc, tech/jsp]
step: 07
---

# Step 07 — ログイン画面 (LoginController + login.jsp)

## このステップのゴール

- 独自の login 画面を作る (Step 06 で `login-page="/login"` を明示したため Spring Security の自動生成ログイン画面は無効化されており、ここで作る `login.jsp` が `/login` の最初の実体になる — それまでは `/login` は 404 だった)
- Controller を `demo-web` の `app.login` パッケージに配置 (TERASOLUNA 規約: **usecase 別サブパッケージ**)
- JSP のフォームに CSRF token を埋め込む
- 実物のログイン (u001 / password) が通ってメニュー画面 (Step 08) にリダイレクトされる (メニュー未作成でも 404 エラー画面が出れば OK)

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
- **② `@Controller`** — Spring MVC の Controller として Bean 登録。`spring-mvc.xml` の `<context:component-scan base-package="com.example.demo.app" />` が拾う (Step 05 で見た `demo-domain.xml` 側の component-scan は `com.example.demo.domain` 配下が対象。**web 側と domain 側で別々にスキャン設定がある**)
- **③ `@GetMapping("/login")`** — GET /login リクエストを受ける。Spring Security 側で `permitAll` に指定した URL (Step 06 参照)
- **④ `return "login/login"`** — ビュー名。`spring-mvc.xml` の `<mvc:view-resolvers>` (`<mvc:jsp prefix="/WEB-INF/views/" />`、詳細は後述) で `/WEB-INF/views/login/login.jsp` に解決される

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
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>ログイン — demo</title>
</head>
<body>
    <h1>ログイン</h1>

    <c:if test="${param.error != null}">                                    <!-- ② -->
        <div class="error">ID または パスワードが違います</div>
    </c:if>
    <c:if test="${param.logout != null}">
        <div class="info">ログアウトしました</div>
    </c:if>

    <form action="${pageContext.request.contextPath}/authenticate" method="post">
        <input type="hidden"
               name="${_csrf.parameterName}"                                <!-- ③ -->
               value="${_csrf.token}" />

        <label>ID
            <input type="text" name="id" required autofocus />              <!-- ④ -->
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
- **② `<c:if test="${param.error != null}">`** — Spring Security が `?error` パラメータで戻すので、それを検出してメッセージ表示。**「ID とパスワードのどちらが間違いか」は漏らさない**。`c` prefix をこの JSP で宣言していない理由は次節参照
- **③ CSRF token の hidden 埋め込み** — `<sec:csrf />` を spring-security.xml で有効化しているので必須。書き忘れると全 POST が 403 で拒否される
- **④ `name="id"` / `name="password"`** — spring-security.xml で `username-parameter="id"` / `password-parameter="password"` と対応

## 共通 `include.jsp` の自動前置 (taglib 宣言が不要な理由)

archetype 生成品の `demo-web/src/main/webapp/WEB-INF/views/common/include.jsp` に、taglib 宣言がまとまっている:

```jsp
<%@ page session="false"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib uri="http://www.springframework.org/security/tags" prefix="sec"%>
<%@ taglib uri="http://terasoluna.org/tags" prefix="t"%>
<%@ taglib uri="http://terasoluna.org/functions" prefix="f"%>
```

`web.xml` の `<jsp-config><jsp-property-group><include-prelude>` にこの `include.jsp` が指定されているため、**このファイルは全ての JSP の先頭に自動で前置される**。つまり `c` / `fmt` / `spring` / `form` / `sec` / `t` / `f` の 7 prefix は、どの JSP を書いても最初から使える状態にある。

- **各 JSP で改めて `taglib` 宣言する必要は無い**。上の `login.jsp` の例で `<%@ taglib prefix="c" ...%>` を書いていないのはこのため
- 同じ prefix を別の URI で再宣言すると JSP 変換エラーになりうるので、**再宣言はしない**のが正しい
- `c` / `form` の URI は旧来のままで Jakarta 化されていない (`http://java.sun.com/jsp/jstl/core`、Spring 独自の `http://www.springframework.org/tags/form`)。**`jakarta.tags.core` や `jakarta.tags.form` という URI は存在しない** — Spring の form タグはそもそも JSTL ではなく Spring 独自の名前空間なので、「Jakarta 化」の対象外

以降の Step のコード例では、この前提に従って taglib 宣言行を省略する。

## `spring-mvc.xml` の ViewResolver を確認

archetype 生成品 `demo-web/src/main/resources/META-INF/spring/spring-mvc.xml` に、以下があるはず (MVC 名前空間の省略記法。生の `InternalResourceViewResolver` Bean 定義ではない):

```xml
<mvc:view-resolvers>
    <mvc:bean-name />
    <mvc:jsp prefix="/WEB-INF/views/" />
</mvc:view-resolvers>
```

`<mvc:jsp prefix="/WEB-INF/views/" />` (suffix は既定で `.jsp`) の設定により、Controller が `"login/login"` を返すと `/WEB-INF/views/login/login.jsp` が描画される。

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

STS の Servers ビューでサーバーを右クリック →「Restart」(未起動の場合は [Step 02](/steps/02-empty-boot) の手順で Run on Server から起動する)。

http://localhost:8080/demo-web/login にアクセス:

1. **自作の login.jsp** が出る (Step 06 まででは `/login` は 404 だった) → OK
2. ID: `u001`、パスワード: `password` → ログインボタン
3. リダイレクトで `/menu` に飛ぶ → **`Resource Not Found Error!` の画面**が出れば OK (Step 08 で menu を作る)

> archetype が生成する `web.xml` には `<error-page>` で 404 → `/WEB-INF/views/common/error/resourceNotFoundError.jsp` が設定済みなので、404 のときはこの画面が出ます。Spring Boot の Whitelabel Error Page ではありません。

## よくある詰まり

- **CSRF 403** — CSRF hidden を忘れ、または `${_csrf.parameterName}` のスペルミス。`view-source:` で HTML を確認して token が入っているかチェック
- **文字化け**: `<%@ page contentType="text/html; charset=UTF-8" %>` を書き忘れ or `web.xml` の CharacterEncodingFilter 設定漏れ
- **404 `/authenticate`**: spring-security.xml の `login-processing-url="/authenticate"` と form の `action` が不一致
- **`login/login.jsp` が見つからない**: JSP の物理配置は `/WEB-INF/views/login/login.jsp`。ViewResolver の prefix/suffix と 実配置が対応しているか確認
- **JSTL のタグが `<c:if>` そのまま表示される (レンダリングされない)**: JSP 内で `taglib` を独自の誤った URI (`jakarta.tags.core` 等、存在しない) で再宣言してしまっている可能性が高い。`c`/`form`/`sec` 等は共通 `include.jsp` の自動前置で既に使える状態なので、再宣言は不要かつ避けるべき (本 Step 冒頭の「共通 include.jsp の自動前置」参照)
- **JSP forward による Spring Security の再フィルタで無限リダイレクト**: 5.11.0 系ではあまり出ないが、Boot 単一版で踏んだ既知バグ。関連: [[/steps-boot/06-auth-foundation]] の Boot 版参照

## 次

→ [Step 08: メニュー画面 (MenuController + menu.jsp)](/steps/08-menu)
