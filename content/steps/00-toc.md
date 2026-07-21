---
title: "目次"
date: 2026-07-21
last_updated: 2026-07-21
tags: [type/learning, type/training, tech/terasoluna, tech/spring]
---

# 役職編集アプリ 組立ガイド (ガンプラ式)

> 12ステップで「役職編集アプリ」を組み立てる手順書。
> 部品ひとつずつ、順番通りに置いていけば必ず完成する。
> 各ステップは前のステップに依存する。飛ばさないこと。
> **公開版 (外部公開中)**: https://terasoluna-training-docs.vercel.app

---

## 完成イメージ

- 5画面: ログイン → メニュー → (検索 or ユーザ情報 → 変更) → 更新
- ID/PW 認証、部分一致検索、自分のユーザ情報を更新
- Spring Boot 3.4 + JSP + Spring Security + MyBatis + H2

## 前提

- JDK 17+ (JDK 24 でも動く)
- Maven (`C:\Users\donpa\Workspace\terasoluna-training\tools\apache-maven-3.9.9\` に展開済み)
- 作業フォルダ: `C:\Users\donpa\Workspace\terasoluna-training\reference-app\` (既に完成品あり — 新規に組む場合は別フォルダで)

---

## 12 ステップ一覧

各ステップの目安時間 = **5〜15分**（コピペしていくだけなら早い、理解しながらだと長め）。

| # | タイトル | 追加するファイル | このステップでできること |
|---|---|---|---|
| 01 | プロジェクト骨組み | `pom.xml`, `application.properties` | Maven ビルドできる空プロジェクト |
| 02 | 空アプリ起動 | `RolemgrApplication.java`, `schema.sql` | Spring Boot 起動、H2 コンソールで users テーブルが見える |
| 03 | User ドメイン | `User.java` | テーブル 1行 = 1オブジェクト の POJO |
| 04 | Mapper (SQL 係) | `UserMapper.java`, `UserMapper.xml` | (まだ画面はないが) SQL は書けた状態 |
| 05 | Service (業務ロジック係) | `UserService.java` | 3層のうち中間層完成 |
| 06 | 認証基盤 | `SecurityConfig.java`, `CustomUserDetailsService.java`, `DataInitializer.java` | 認証必須になる、DB にユーザ 5件入る |
| 07 | ログイン画面 | `LoginController.java`, `login.jsp` | `/login` にアクセスするとフォームが出る、実際にログインできる |
| 08 | メニュー画面 | `MenuController.java`, `menu.jsp`, `common/header.jsp` | ログイン後にメニューが出る、リンクは 2 つ |
| 09 | 検索画面 | `SearchController.java`, `search.jsp` | 役職テキスト検索 (部分一致) が動く |
| 10 | ユーザ情報画面 | `UserInfoController.java` (view), `userInfo.jsp` | 自分の ID/役職が表示される |
| 11 | 変更画面 | `UserInfoController.java` (edit + POST), `userInfoEdit.jsp` | 役職を書き換えて DB 更新できる、PRG パターンで画面が戻る |
| 12 | 完成 & まとめ | (なし、動作確認だけ) | 5画面全部つながる、後輩に教えられる状態 |

---

## 進め方

1. **上から順に読む**。ジャンプ厳禁。前のステップで置いた部品を次で使う
2. **各ステップの最後の「動作確認」を必ずやる**。動かない状態で先に進むと後で原因特定に何倍もかかる
3. **理解できない箇所は「なぜこう書く」節を読む**。ただの丸暗記ではなく、答えられる状態を目指す

## リンク

- [Step 01 → プロジェクト骨組み](/steps/01-project-skeleton)
- [Step 02 → 空アプリ起動](/steps/02-empty-boot)
- [Step 03 → User ドメイン](/steps/03-user-domain)
- [Step 04 → Mapper](/steps/04-mapper)
- [Step 05 → Service](/steps/05-service)
- [Step 06 → 認証基盤](/steps/06-auth-foundation)
- [Step 07 → ログイン画面](/steps/07-login)
- [Step 08 → メニュー画面](/steps/08-menu)
- [Step 09 → 検索画面](/steps/09-search)
- [Step 10 → ユーザ情報画面](/steps/10-user-info)
- [Step 11 → 変更画面](/steps/11-edit)
- [Step 12 → 完成 & まとめ](/steps/12-complete)

## 参考

- 教える側の全体ガイド: 05_Learning/terasoluna-teaching-guide
- プロジェクト状態: 02_Projects/terasoluna-training
- 踏み込んだ落とし穴: 01_Knowledge/spring-security-6-jsp-forward-loop
