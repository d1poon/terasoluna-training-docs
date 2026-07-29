---
title: "変更画面 & PRG パターン"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc]
step: 11
---

# Step 11 — 変更画面 & PRG パターン

## このステップのゴール

- 役職を変更する画面 (`/user-info/edit`) を作る
- **PRG (Post-Redirect-Get) パターン**: POST 成功後は `redirect:` で GET に切替え、リロードで二重更新を防ぐ
- `UserInfoUpdateForm` を新設 (Entity 直バインドしない)

## 事前準備

- [Step 10](/steps/10-user-info) 完了

## PRG パターンとは (概要)

<div class="flow-vertical">
  <div class="flow-step">
    <span class="flow-step-badge">1</span>
    <div class="flow-step-content">
      <strong>GET</strong> <code>/user-info/edit</code> — 変更画面表示 (現在の役職を初期値)
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">2</span>
    <div class="flow-step-content">
      <strong>POST</strong> <code>/user-info/edit</code> — フォーム送信 → Service で DB 更新
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">3</span>
    <div class="flow-step-content">
      Controller が <code>return "redirect:/user-info"</code> を返す → ブラウザに 302
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">4</span>
    <div class="flow-step-content">
      ブラウザが <strong>GET</strong> <code>/user-info</code> を叩く → 表示画面が出る
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge flow-step-badge--yes">5</span>
    <div class="flow-step-content">
      <strong>F5 リロードしても GET が再実行されるだけ</strong>、二重更新なし ✓
    </div>
  </div>
</div>

**PRG が無い場合**: POST 完了後の画面を F5 したブラウザが「同じ POST を再送するか?」と警告してきて、うっかり OK 押すと 2 回更新される。事故の原因。

## 追加するファイル (3 つ / 修正 1 つ)

### 1. `UserInfoUpdateForm.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/userinfo/</div>
    <div class="ft-line ft-l1 ft-file">📄 UserInfoController.java <span class="ft-tag ft-tag--modify">既存</span></div>
    <div class="ft-line ft-l1 ft-file">📄 UserInfoUpdateForm.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.userinfo;

import java.io.Serializable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * ユーザ情報変更画面の入力バインディング用 Form。
 */
public class UserInfoUpdateForm implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank                                                                  // ①
    @Size(max = 50)
    private String role;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

- **① `@NotBlank`** — 空文字を許可しない。null/空白のみを拒否。これがないとフォーム空欄で送信されて役職消去になる

### 2. `UserInfoController.java` に edit + update メソッド追加

<div class="file-location">
  <div class="file-location-label">📍 既存ファイルを修正</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/userinfo/</div>
    <div class="ft-line ft-l1 ft-file">📄 UserInfoController.java <span class="ft-tag ft-tag--modify">修正</span></div>
  </div>
</div>

Step 10 の `view()` メソッドに 2 つ追加:

```java
@GetMapping("/user-info/edit")
public String edit(Authentication auth, Model model) {
    String id = auth.getName();
    User user = userService.findById(id);
    UserInfoUpdateForm form = new UserInfoUpdateForm();
    form.setRole(user.getRole());                                              // ①
    model.addAttribute("userInfoUpdateForm", form);
    return "userinfo/userInfoEdit";
}

@PostMapping("/user-info/edit")
public String update(
        Authentication auth,
        @Valid @ModelAttribute UserInfoUpdateForm form,                        // ②
        BindingResult bindingResult,
        RedirectAttributes redirect) {
    if (bindingResult.hasErrors()) {
        return "userinfo/userInfoEdit";                                        // ③
    }
    userService.updateRole(auth.getName(), form.getRole());
    redirect.addFlashAttribute("message", "役職を更新しました");                 // ④
    return "redirect:/user-info";                                              // ⑤ PRG
}
```

追加 import:
```java
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
```

#### なぜこう書く

- **① `form.setRole(user.getRole())`** — 編集画面の初期値として「今の役職」を詰める
- **② `@Valid`** — Form の `@NotBlank` / `@Size` を発動させる
- **③ Validation エラー時は同じ画面**: bindingResult.hasErrors() が true なら redirect せずに `userInfoEdit.jsp` を返し、エラーメッセージを出す
- **④ `redirect.addFlashAttribute("message", "...")`** — Flash 属性はリダイレクト後の 1 リクエストだけ生存。userInfo.jsp で `${message}` として拾える
- **⑤ `return "redirect:/user-info"`** — PRG の Redirect 部分。**"redirect:" プレフィックスを Controller の return に書くだけ**で Spring MVC が 302 を返す

### 3. `userInfoEdit.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/userinfo/</div>
    <div class="ft-line ft-l1 ft-file">📄 userInfo.jsp <span class="ft-tag ft-tag--modify">既存</span></div>
    <div class="ft-line ft-l1 ft-file">📄 userInfoEdit.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>役職変更 — demo</title>
</head>
<body>
    <h1>役職を変更</h1>

    <form:form modelAttribute="userInfoUpdateForm" method="post"
               action="${pageContext.request.contextPath}/user-info/edit">
        <label>役職
            <form:input path="role" />
            <form:errors path="role" cssClass="error" />                       <%-- ① --%>
        </label>
        <button type="submit">更新</button>
    </form:form>

    <a href="${pageContext.request.contextPath}/user-info">キャンセル</a>
</body>
</html>
```

- **① `<form:errors path="role" />`** — バリデーションエラーメッセージを表示

## 動作確認

Tomcat 起動 → ログイン → メニュー → 自分のユーザ情報 → 「役職を変更する」 → 変更画面が表示 → 役職を書き換え → 更新 → **URL が `/user-info` に戻る (PRG)** → 「役職を更新しました」表示 → F5 で更新画面ではなく `/user-info` の GET が再実行される (二重更新なし) → OK。

## よくある詰まり

- **F5 で「フォーム再送信を確認」のダイアログが出る**: `redirect:` プレフィックスを書き忘れ、または `return "redirect:/user-info"` の代わりに `return "userinfo/userInfo"` を書いた
- **Flash メッセージが表示されない**: `model.addAttribute()` (通常属性) と `redirect.addFlashAttribute()` (Flash) を混同。**リダイレクトを跨ぐなら Flash**
- **Validation エラーが出ない**: `@Valid` の付け忘れ、または `BindingResult` の引数位置が Form の**直後**でないと動かない (Spring MVC の仕様)
- **`role` が空欄で送信されてもエラー無く更新される**: `@NotBlank` の import 誤り (`jakarta.validation.constraints.NotBlank` が正、Hibernate Validator 独自の org.hibernate は Deprecated)

## 次

→ [Step 12: 完成 & 通し動作確認](/steps/12-complete)
