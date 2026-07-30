---
title: "編集画面 & PRG パターン"
date: 2026-07-30
tags: [type/learning, type/training, tech/terasoluna, tech/spring-mvc]
step: 09
---

# Step 09 — 編集画面 & PRG パターン

## このステップのゴール

- 詳細画面 (Step 08) から役職を変更する画面 (`/users/edit`) を作る
- **PRG (Post-Redirect-Get) パターン**: POST 成功後は `redirect:` で GET に切替え、リロードで二重更新を防ぐ
- `UserEditForm` を新設 (Entity 直バインドしない)
- **このトラックに認証が無いことで生じる注意点**を理解する (下記)

## 事前準備

- [Step 08](/steps-basic/08-detail) 完了

## 認証が無いことの影響 (重要)

> このトラックは認証を入れていないため、URL の `id` を書き換えれば誰の情報でも編集できてしまう。
> 実際のアプリでは「ログイン中の本人か」「編集権限を持つか」をサーバ側で必ず検証する必要がある。
> その実装は Spring Security 版の [Step 10: ユーザ情報画面](/steps/10-user-info) で扱う。

具体的には、下の `update()` メソッドは `UserEditForm` の `id` フィールド (hidden input で送信される) をそのまま `userService.findById()` / `userService.update()` に渡している。ブラウザの開発者ツールで hidden input の値を書き換えれば、フォームで開いていたのとは別の `id` を更新対象にできてしまう。

**この教材ではあえてこの状態のままにしている**。理由は、Step 06〜09 で最短距離で CRUD の骨格 (Controller → Form → Service → Repository) を掴んでもらうため。「認証・認可が無いと何が起きるか」を実際に手を動かして体感した上で、Spring Security 版で IDOR 対策 (`Authentication.getName()` を使う設計) を学ぶと理解が定着しやすい。

## PRG パターンとは (概要)

<div class="flow-vertical">
  <div class="flow-step">
    <span class="flow-step-badge">1</span>
    <div class="flow-step-content">
      <strong>GET</strong> <code>/users/edit?id=xxx</code> — 編集画面表示 (現在の役職を初期値)
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">2</span>
    <div class="flow-step-content">
      <strong>POST</strong> <code>/users/edit</code> — フォーム送信 → Service で DB 更新
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">3</span>
    <div class="flow-step-content">
      Controller が <code>return "redirect:/users/detail"</code> を返す → ブラウザに 302
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">4</span>
    <div class="flow-step-content">
      ブラウザが <strong>GET</strong> <code>/users/detail?id=xxx</code> を叩く → 詳細画面が出る
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

## 追加するファイル (2 つ / 修正 1 つ)

### 1. `UserEditForm.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/userdetail/</div>
    <div class="ft-line ft-l1 ft-file">📄 UserDetailController.java <span class="ft-tag ft-tag--modify">既存</span></div>
    <div class="ft-line ft-l1 ft-file">📄 UserEditForm.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.app.userdetail;

import java.io.Serializable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * ユーザ編集画面の入力バインディング用 Form。
 */
public class UserEditForm implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank                                                                  // ①
    private String id;

    @NotBlank                                                                  // ②
    @Size(max = 50)
    private String role;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

- **① `id` フィールド**: 編集対象を特定するために hidden input で往復させる。主軸トラック (Security 版) の `UserInfoUpdateForm` には無いフィールド — あちらは `Authentication.getName()` から対象を取るので Form に `id` を持つ必要が無い
- **② `@NotBlank` (role)** — 空文字を許可しない。これがないとフォーム空欄で送信されて役職消去になる

### 2. `UserDetailController.java` に edit + update メソッド追加

<div class="file-location">
  <div class="file-location-label">📍 既存ファイルを修正</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/java/com/example/demo/app/userdetail/</div>
    <div class="ft-line ft-l1 ft-file">📄 UserDetailController.java <span class="ft-tag ft-tag--modify">修正</span></div>
  </div>
</div>

Step 08 の `view()` メソッドに 2 つ追加:

```java
@GetMapping("/users/edit")
public String edit(@RequestParam String id, Model model) {
    User user = userService.findById(id);
    UserEditForm form = new UserEditForm();
    form.setId(user.getId());
    form.setRole(user.getRole());                                             // ①
    model.addAttribute("userEditForm", form);
    model.addAttribute("user", user);                                         // ②
    return "userdetail/edit";
}

@PostMapping("/users/edit")
public String update(
        @Valid @ModelAttribute UserEditForm form,                             // ③
        BindingResult bindingResult,
        RedirectAttributes redirect) {
    if (bindingResult.hasErrors()) {
        return "userdetail/edit";                                             // ④
    }
    User user = userService.findById(form.getId());                           // ⑤
    user.setRole(form.getRole());                                             // ⑥
    userService.update(user);                                                 // ⑦
    redirect.addFlashAttribute("message", "役職を更新しました");                 // ⑧
    redirect.addAttribute("id", form.getId());                                // ⑨
    return "redirect:/users/detail";                                          // ⑩ PRG
}
```

追加 import:
```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.validation.BindingResult;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
```

#### なぜこう書く

- **① `form.setRole(user.getRole())`** — 編集画面の初期値として「今の役職」を詰める
- **② `model.addAttribute("user", user)`** — 名前 (編集不可) を画面に表示するために渡す。編集できるのは役職のみ
- **③ `@Valid`** — Form の `@NotBlank` / `@Size` を発動させる
- **④ Validation エラー時は同じ画面**: `bindingResult.hasErrors()` が true なら redirect せずに `edit.jsp` を返し、エラーメッセージを出す
- **⑤ `userService.findById(form.getId())`** — [Step 04](/steps-basic/04-repository) の `UserRepository.update(User user)` は `name` / `role` をまとめて 1 回の `UPDATE` で書き込む設計になっている。**この画面で編集するのは役職だけ**なので、まず現在の `User` (`name` を含む) を取り直す
- **⑥ `user.setRole(form.getRole())`** — 取得した `User` の役職だけをフォームの入力値で上書きする。`name` はそのまま保持される
- **⑦ `userService.update(user)`** — [Step 05](/steps-basic/05-service) の `UserService#update(User user)` を呼ぶ。**`updateRole(id, role)` のような専用メソッドは無い** — Repository/Service の `update` は Entity 丸ごと 1 個を引数に取る設計
- **⑧ `redirect.addFlashAttribute("message", "...")`** — Flash 属性はリダイレクト後の 1 リクエストだけ生存。`detail.jsp` で `${message}` として拾える
- **⑨ `redirect.addAttribute("id", form.getId())`** — Flash ではない通常属性を `RedirectAttributes` に積むと、リダイレクト先の URL クエリパラメータとして自動的に付与される (`/users/detail?id=xxx`)
- **⑩ `return "redirect:/users/detail"`** — PRG の Redirect 部分。**"redirect:" プレフィックスを Controller の return に書くだけ**で Spring MVC が 302 を返す

### 3. `edit.jsp`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/demo-web/src/main/webapp/WEB-INF/views/userdetail/</div>
    <div class="ft-line ft-l1 ft-file">📄 detail.jsp <span class="ft-tag ft-tag--modify">既存</span></div>
    <div class="ft-line ft-l1 ft-file">📄 edit.jsp <span class="ft-tag">新規</span></div>
  </div>
</div>

```jsp
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <title>ユーザ編集 — demo</title>
</head>
<body>
    <h1>ユーザ編集</h1>

    <p>名前: <c:out value="${user.name}" /> (編集不可)</p>

    <form:form modelAttribute="userEditForm" method="post"
               action="${pageContext.request.contextPath}/users/edit">
        <form:hidden path="id" />                                              <%-- ① --%>
        <label>役職
            <form:input path="role" />
            <form:errors path="role" cssClass="error" />                       <%-- ② --%>
        </label>
        <button type="submit">更新</button>
    </form:form>

    <c:url var="detailUrl" value="/users/detail">
        <c:param name="id" value="${userEditForm.id}" />
    </c:url>
    <a href="${detailUrl}">キャンセル</a>
</body>
</html>
```

- **① `<form:hidden path="id" />`** — 編集対象の `id` を POST 本文に載せて往復させる。前述の通り、この値はサーバ側では検証されず信用される
- **② `<form:errors path="role" />`** — バリデーションエラーメッセージを表示

**この画面が POST を扱うため、実アプリでは CSRF 対策が必要になる。** 主軸トラック (Security 版) では `<sec:csrf />` により全 POST フォームに token の hidden input (`${_csrf.parameterName}` / `${_csrf.token}`) が要求されるが、このトラックには Spring Security が無いため CSRF 対策の仕組み自体が存在しない。この画面の `<form:form>` にも CSRF token は入れていない。詳細は Spring Security 版の [[/steps/06-auth-foundation|Step 06]] (`<sec:csrf />` の有効化) と
[[/steps/07-login|Step 07]] (CSRF token の埋め込み方) で扱う。

## 動作確認

Tomcat 起動 (未起動なら [Step 02](/steps-basic/02-empty-boot)) → `http://localhost:8080/demo-web/users` → 任意の行の「詳細」 → 「編集する」 → 編集画面が表示され、現在の役職が初期値で入っている → 役職を書き換え → 「更新」 → **URL が `/users/detail?id=...` に戻る (PRG)** → 「役職を更新しました」というメッセージと更新後の役職が表示される → F5 で編集画面が再送信されるのではなく `/users/detail` の GET が再実行される (二重更新なし) → OK。

## よくある詰まり

- **F5 で「フォーム再送信を確認」のダイアログが出る**: `redirect:` プレフィックスを書き忘れ、または `return "redirect:/users/detail"` の代わりに `return "userdetail/detail"` を書いた
- **Flash メッセージが表示されない**: `model.addAttribute()` (通常属性) と `redirect.addFlashAttribute()` (Flash) を混同。**リダイレクトを跨ぐなら Flash**
- **更新後に `/users/detail?id=` の後ろが空**: `redirect.addAttribute("id", form.getId())` を書き忘れている (Flash 属性と違い、こちらは明示的に積まないと URL に付与されない)
- **Validation エラーが出ない**: `@Valid` の付け忘れ、または `BindingResult` の引数位置が Form の**直後**でないと動かない (Spring MVC の仕様)
- **`role` が空欄で送信されてもエラー無く更新される**: `@NotBlank` の import 誤り (`jakarta.validation.constraints.NotBlank` が正)
- **更新後に名前が消える (`null` になる)**: `userService.findById(form.getId())` で現在の `User` を取り直さず `new User()` を組み立てて `userService.update(user)` に渡すと、フォームに無い `name` が `null` のまま `UPDATE users SET name = NULL, ...` されてしまう。[Step 04](/steps-basic/04-repository) の `update(User user)` は渡された `User` の全フィールドを書き込む設計であることに注意
- **hidden の `id` を書き換えると別人のデータが更新できてしまう**: これは実装漏れではなく、このトラックが認証を持たないことの想定された挙動。「認証が無いことの影響」節を参照

## 次

→ [Step 10: 完成 & まとめ](/steps-basic/10-complete)
