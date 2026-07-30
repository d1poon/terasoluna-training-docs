---
title: "完成 & 通し動作確認"
date: 2026-07-30
tags: [type/learning, type/training, tech/terasoluna]
step: 10
---

# Step 10 — 完成 & 通し動作確認

## このステップのゴール

- 4 画面 (一覧 → 検索 → 詳細 → 編集) を通しで動かして完成を確認
- モジュール別ファイルの一覧を目視で振り返り
- 自己確認 (自分の言葉で説明できるか)
- **このトラックで省いたもの (認証・認可・CSRF) を再確認し、Security 版につなげる**

## 事前準備

- [Step 09](/steps-basic/09-edit) 完了

## 完成した機能

- 全ユーザ一覧表示 ([Step 06](/steps-basic/06-list))
- 役職の部分一致検索 (LIKE) ([Step 07](/steps-basic/07-search))
- 一覧・検索結果からの詳細表示 ([Step 08](/steps-basic/08-detail))
- Form → Service → Repository の 3 層呼び出し
- PRG パターン (POST → Redirect → GET) ([Step 09](/steps-basic/09-edit))

**含まれていないもの**:

- ID/PW 認証・ログイン画面
- 認証コンテキストからの本人特定 (IDOR 対策)
- CSRF token

これらは [Step 09](/steps-basic/09-edit) の「認証が無いことの影響」で扱った通り、意図的に省いている。Spring Security 版 (`/steps/06-auth-foundation` 以降) で学ぶ。

## 通し動作確認

STS の Servers ビューでサーバーを右クリック →「Restart」(未起動の場合は [Step 02](/steps-basic/02-empty-boot) の手順で Run on Server から起動する)。

1. `http://localhost:8080/demo-web/users` → ユーザ一覧が表示される
2. 「役職で検索する」→ 役職名を入力 (例: 「課長」) → 該当行のみ表示 → 空欄で再検索 → 全件表示
3. 一覧または検索結果から任意の行の「詳細」→ ID・名前・役職が表示される
4. 「編集する」→ 新しい役職を入力 → 「更新」→ `/users/detail?id=...` に戻る (URL バーが変わる = PRG)
5. F5 リロード → 二重更新なし
6. 「一覧に戻る」→ 更新後の役職が一覧にも反映されていることを確認

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
    <div class="ft-line ft-l2 ft-file">📄 database/H2-schema.sql (Step 03 で追記)</div>
    <div class="ft-line ft-l2 ft-file">📄 database/H2-dataload.sql (Step 03 で追記)</div>
    <div class="ft-line ft-l1">📁 demo-domain/src/main/java/com/example/demo/domain/</div>
    <div class="ft-line ft-l2 ft-file">📄 model/User.java (Step 03)</div>
    <div class="ft-line ft-l2 ft-file">📄 repository/user/UserRepository.java (+ .xml は resources 側) (Step 04)</div>
    <div class="ft-line ft-l2 ft-file">📄 service/user/UserService.java + UserServiceImpl.java (Step 05)</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/java/com/example/demo/app/</div>
    <div class="ft-line ft-l2 ft-file">📄 userlist/UserListController.java (Step 06)</div>
    <div class="ft-line ft-l2 ft-file">📄 usersearch/UserSearchController.java + UserSearchForm.java (Step 07)</div>
    <div class="ft-line ft-l2 ft-file">📄 userdetail/UserDetailController.java + UserEditForm.java (Step 08 / 09)</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/webapp/WEB-INF/views/</div>
    <div class="ft-line ft-l2 ft-file">📄 userlist/list.jsp (Step 06)</div>
    <div class="ft-line ft-l2 ft-file">📄 usersearch/search.jsp (Step 07)</div>
    <div class="ft-line ft-l2 ft-file">📄 userdetail/detail.jsp + edit.jsp (Step 08 / 09)</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/resources/META-INF/spring/</div>
    <div class="ft-line ft-l2 ft-file">📄 applicationContext.xml</div>
    <div class="ft-line ft-l2 ft-file">📄 spring-mvc.xml</div>
    <div class="ft-line ft-l1">📁 demo-initdb/ <span class="ft-tag">H2 開発では未使用</span></div>
  </div>
</div>

> `spring-security.xml` は archetype 生成時点で `demo-web` に存在するが、[Step 02](/steps-basic/02-empty-boot) で読み込みを無効化しているためこのトラックでは使われない。主軸トラックとの構成差分はここが核心。

## 自己確認 11 問

以下 11 問を、他人に**自分の言葉**で説明できれば「理解できた」と言える:

1. TERASOLUNA multi-project の 5 モジュールをそれぞれ 1 行で説明せよ
2. 親 POM で `terasoluna-gfw-parent:5.11.0.RELEASE` を `<parent>` に指定すると何が起きる?
3. `-web` が `-domain` に依存するのは分かる。では `-env` はいつ差し込まれる?
4. Entity (`domain.model`) と Form (`app.<usecase>`) を分けるのはなぜか
5. Repository の interface を `UserRepository`、SQL XML を同じパッケージパスにミラー配置する理由は?
6. Service を interface + Impl のペアにする TERASOLUNA 規約の狙いは?
7. `@Autowired` ではなく `@Inject` を使う理由は?
8. 一覧・検索・詳細・編集の 4 画面はそれぞれ何の URL に対応し、何のビュー名を返すか?
9. PRG パターンは何を防ぐためのイディオムか?
10. `<c:out>` を書かず `${user.role}` 直出しすると何が起きる?
11. **このトラックには認証が無い。URL や hidden input の `id` を書き換えると何が起きるか。なぜそれが問題か。Spring Security 版ではどう対策しているか?**

答えられない問がある場合は該当 Step に戻って読み直し。特に 11 番は、このトラックを「CRUD の骨格を最短で掴むための入門版」として位置付けている理由そのものなので、曖昧なまま次に進まないこと。

## 次

→ [Step 11: Service の単体テスト](/steps-basic/11-service-test)
