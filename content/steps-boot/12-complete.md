---
title: "完成 & まとめ"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring]
step: 12
---

# Step 12 — 完成 & まとめ

## このステップのゴール

- 全画面をひととおり操作して**5画面が繋がることを確認**
- 自分が組んだアプリの構造を**言葉で説明できる**か自己確認

新しいファイルは追加しない。**動作確認 + 振り返り**のステップ。

## 事前準備

- [Step 11](/steps/11-edit) まで完了

## 最終ディレクトリ構造

```
rolemgr/
├── pom.xml
└── src/main/
    ├── java/com/example/rolemgr/
    │   ├── RolemgrApplication.java
    │   ├── config/
    │   │   ├── SecurityConfig.java
    │   │   └── DataInitializer.java
    │   ├── controller/
    │   │   ├── LoginController.java
    │   │   ├── MenuController.java
    │   │   ├── SearchController.java
    │   │   └── UserInfoController.java
    │   ├── domain/
    │   │   └── User.java
    │   ├── repository/
    │   │   └── UserMapper.java
    │   ├── security/
    │   │   └── CustomUserDetailsService.java
    │   └── service/
    │       └── UserService.java
    ├── resources/
    │   ├── application.properties
    │   ├── schema.sql
    │   └── mapper/UserMapper.xml
    └── webapp/WEB-INF/views/
        ├── login.jsp
        ├── menu.jsp
        ├── search.jsp
        ├── userInfo.jsp
        ├── userInfoEdit.jsp
        └── common/header.jsp
```

**Step 01-11 で作成したファイル: 21 個** (Java 11、JSP 6、XML 1、properties 1、SQL 1、pom.xml 1)。手で書けば 45 分〜1.5 時間、コピペなら 15-30 分。

## 5画面 通し確認シナリオ

1. http://localhost:8080/ にアクセス
2. → `/login` に自動リダイレクト → ログイン画面
3. `u002` / `password` でログイン
4. → メニュー画面。「u002さん」と表示、リンク 2つ
5. 「ユーザーを検索する」→ 検索画面
6. 「長」を入力して検索 → 3件出る (部長・課長・係長)
7. 「メニュー」ボタン → メニュー画面に戻る
8. 「自分のユーザ情報を見る」→ 課長 と表示
9. 「変更する」→ 編集画面 → 「本部長」に変更 → 「変更する」ボタン
10. → ユーザ情報画面に戻る、「本部長」になっている
11. URL バーが `/user-info` になっている (PRG パターン動作)
12. F5 リロード → 何も起きない (2重更新なし)
13. 「ログアウト」→ 「ログアウトしました」でログイン画面へ
14. http://localhost:8080/h2-console → `SELECT * FROM users WHERE id='u002';` → 「本部長」になってる

## 自己確認 (この 12 個を自分の言葉で言える?)

以下、実装中や他人に説明する場面で出てきそうな質問。**答えられなければ該当ステップに戻る**。

| 質問 | 該当ステップ |
|---|---|
| 1. `pom.xml` の `<parent>` は何のため? | Step 01 |
| 2. なぜ `packaging=war` にした? `jar` じゃダメ? | Step 01 |
| 3. `@SpringBootApplication` は何をしている? | Step 02 |
| 4. なぜ `password` カラムが `VARCHAR(255)` ? | Step 02 |
| 5. なぜ Mapper interface と XML の 2つに分ける? | Step 04 |
| 6. `#{xxx}` と `${xxx}` の違いは? | Step 04 |
| 7. なぜ Controller が直接 Mapper を呼ばず、Service を挟む? | Step 05 |
| 8. `/WEB-INF/**` を permitAll しないとどうなる? | Step 06 |
| 9. なぜ POST `/login` の Controller を書かない? | Step 07 |
| 10. `Principal` はどこから来る? | Step 08 |
| 11. 検索は GET、更新は POST の理由は? | Step 09 |
| 12. PRG パターンとは? なぜ `redirect:` を付ける? | Step 11 |

## 3層構造の全体図 (最終形)

```
[ブラウザ] ─(HTTP)→ [Filter Chain: Spring Security]
                       │ (認証・CSRF・セッション)
                       ▼
                    [DispatcherServlet]
                       │ (URLからControllerを選ぶ)
                       ▼
                  [Controller]  ─→ Model + View名
                       │
                       ▼
                  [Service]      ─→ @Transactional 境界
                       │
                       ▼
                  [Mapper (interface)]
                       │
                       ▼
                  [Mapper XML]    ─→ SQL
                       │
                       ▼
                       DB (H2)
```

## この後どこへ

- 実装レシピを引く: [「〜するには?」レシピ集](/how-to)
- TERASOLUNA archetype との対応: [Boot vs TERASOLUNA](/spring-vs-terasoluna)
- 用語の再確認: [用語集](/glossary) (Ctrl+K で全ページ検索も可能)
- 別視点で全体像を眺める: [アーキテクチャ全体図](/architecture)

## おめでとう

ここまで通しで組んで動かせたなら、Spring Boot + JSP + MyBatis の基本構造は理解できています。実装で詰まった時や質問された時は、この build ガイドの該当ステップに戻って確認してください。

← [目次に戻る](/steps/00-toc)
