---
title: "完成 & 通し動作確認"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna]
step: 12
---

# Step 12 — 完成 & 通し動作確認

## このステップのゴール

- 5 画面 (login → menu → search → user-info → edit) を通しで動かして完成を確認
- モジュール別ファイルの一覧を目視で振り返り
- 自己確認 (自分の言葉で説明できるか)

## 完成した機能

- ID/PW 認証 (BCrypt ハッシュ、Spring Security)
- 部分一致検索 (LIKE)
- 認証コンテキストから ID 取得 (IDOR 耐性)
- Form → Service → Repository の 3 層呼び出し
- PRG パターン (POST → Redirect → GET)
- CSRF token 全 POST 埋め込み

## 通し動作確認

STS の Servers ビューでサーバーを右クリック →「Restart」(未起動の場合は [Step 02](/steps/02-empty-boot) の手順で Run on Server から起動する)。

1. http://localhost:8080/demo-web/ → `/login` にリダイレクト
2. ID: `u001`、パスワード: `password` → `/menu` に遷移
3. 「役職検索」→ 「ADMIN」で検索 → 2 件 (`ROLE_ADMIN` の u003, u004)
4. 「自分のユーザ情報」 → ID + 役職 表示
5. 「役職を変更する」 → 新役職入力 → 更新 → `/user-info` に戻る (URL バーが変わる = PRG)
6. F5 リロード → 二重更新なし
7. 「ログアウト」 → `/login?logout`

## 全ファイル一覧 (完成後)

<div class="file-location">
  <div class="file-location-label">📍 完成品のディレクトリ (主要ファイルのみ)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1 ft-file">📄 pom.xml (親 POM)</div>
    <div class="ft-line ft-l1">📁 demo-env/src/main/resources/</div>
    <div class="ft-line ft-l2 ft-file">📄 META-INF/spring/demo-infra.properties</div>
    <div class="ft-line ft-l2 ft-file">📄 logback.xml</div>
    <div class="ft-line ft-l2 ft-file">📄 META-INF/spring/demo-env.xml</div>
    <div class="ft-line ft-l2 ft-file">📄 database/H2-schema.sql</div>
    <div class="ft-line ft-l2 ft-file">📄 database/H2-dataload.sql</div>
    <div class="ft-line ft-l1">📁 demo-domain/src/main/java/com/example/demo/domain/</div>
    <div class="ft-line ft-l2 ft-file">📄 model/User.java</div>
    <div class="ft-line ft-l2 ft-file">📄 repository/user/UserRepository.java (+ .xml は resources 側)</div>
    <div class="ft-line ft-l2 ft-file">📄 service/user/UserService.java + UserServiceImpl.java</div>
    <div class="ft-line ft-l2 ft-file">📄 service/userdetails/UserDetailsServiceImpl.java</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l2 ft-file">📄 login/LoginController.java</div>
    <div class="ft-line ft-l2 ft-file">📄 menu/MenuController.java</div>
    <div class="ft-line ft-l2 ft-file">📄 search/SearchController.java + UserSearchForm.java</div>
    <div class="ft-line ft-l2 ft-file">📄 userinfo/UserInfoController.java + UserInfoUpdateForm.java</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l2 ft-file">📄 login/login.jsp</div>
    <div class="ft-line ft-l2 ft-file">📄 menu/menu.jsp</div>
    <div class="ft-line ft-l2 ft-file">📄 search/search.jsp</div>
    <div class="ft-line ft-l2 ft-file">📄 userinfo/userInfo.jsp + userInfoEdit.jsp</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/resources/META-INF/spring/</div>
    <div class="ft-line ft-l2 ft-file">📄 applicationContext.xml</div>
    <div class="ft-line ft-l2 ft-file">📄 spring-mvc.xml</div>
    <div class="ft-line ft-l2 ft-file">📄 spring-security.xml</div>
    <div class="ft-line ft-l1">📁 demo-initdb/ <span class="ft-tag">H2 開発では未使用</span></div>
  </div>
</div>

## 自己確認 12 問

以下 12 問を、他人に**自分の言葉**で説明できれば「理解できた」と言える:

1. TERASOLUNA multi-project の 5 モジュールをそれぞれ 1 行で説明せよ
2. 親 POM で `terasoluna-gfw-parent:5.11.0.RELEASE` を `<parent>` に指定すると何が起きる?
3. `-web` が `-domain` に依存するのは分かる。では `-env` はいつ差し込まれる?
4. Entity (`domain.model`) と Form (`app.<usecase>`) を分けるのはなぜか
5. Repository の interface を `UserRepository`、SQL XML を同じパッケージパスにミラー配置する理由は?
6. Service を interface + Impl のペアにする TERASOLUNA 規約の狙いは?
7. `@Autowired` ではなく `@Inject` を使う理由は?
8. spring-security.xml の `<sec:intercept-url pattern="/login" access="permitAll"/>` を書き忘れると何が起きる?
9. IDOR 対策として、なぜ URL パラメータの id でなく `Authentication.getName()` を使うのか?
10. CSRF token を hidden で form に埋め込まないとどうなる?
11. PRG パターンは何を防ぐためのイディオムか?
12. `<c:out>` を書かず `${user.role}` 直出しすると何が起きる?

答えられない問がある場合は該当 Step に戻って読み直し。

## 次

→ [Step 12.5: 楽観ロック実演 (オプション)](/steps/12.5-optimistic-lock) — 現場でほぼ必ず出るパターン、Step 13 の前にやると理解が深まる  
→ [Step 13: Service の単体テスト](/steps/13-service-test)
