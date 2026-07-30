# TERASOLUNA 研修 — 役職編集アプリ 組立ガイド (公開版)

TERASOLUNA multi-project 構成で「役職編集アプリ」を組み立てる学習ガイドの公開サイト。

- **プロダクション**: https://terasoluna-training-docs.vercel.app
- **リポジトリ**: https://github.com/d1poon/terasoluna-training-docs

## 3 つのトラック

| トラック | ルート | 位置付け | 対象スタック |
|---|---|---|---|
| **主軸** | `/steps/` | 研修環境で実際に使う構成 | TERASOLUNA GFW 5.11.0.RELEASE (multi-project、5 モジュール) |
| **入門** | `/steps-basic/` | Step 06 の Spring Security で詰まった人の踏み台 | TERASOLUNA multi-project (Security 無効化した状態で CRUD だけ先に通す) |
| **補助** | `/steps-boot/` | 先に本質だけ掴みたい人向け | Spring Boot 3.4 (単一プロジェクト) |

**入門トラック (`/steps-basic/`) について**: スタック自体は主軸と同じ TERASOLUNA multi-project だが、
Spring Security の導入 (主軸 Step 06) を後回しにして、認証なしの状態で一覧・検索・詳細・編集の
CRUD 一気通貫を先に体験できるようにしたトラック。「Step 06 で Spring Security につまずいて先に進めなくなった」
受講者が、認証を後回しにして CRUD の流れだけ先に掴み、自信をつけてから主軸の Security 導入に戻ってこられるようにする踏み台。
慣れたら主軸の Step 06 (認証基盤) から合流する想定。

主軸の TERASOLUNA 側は `terasoluna-gfw-multi-web-blank-xmlconfig-jsp-mybatis3-archetype 5.11.0.RELEASE`
(groupId: `org.terasoluna.gfw.blank`、XML 設定版。`xmlconfig` の付かない同名 archetype は
Java クラスで設定する JavaConfig 版で別物) が生成する
`-web` / `-domain` / `-env` / `-initdb` / `-selenium` の 5 モジュール構成を「正」として書かれている。

## バージョンの単一の真実源

**バージョン数値をページに直書きしないこと。** 必ず `lib/versions.ts` を参照する。

- `VERSIONS.*` — 個別の値 (`springBoot`, `springFramework`, `terasolunaGfw` など)
- `TARGET_LABEL.terasoluna` / `.boot` / `.compare` — `PageMeta` の `targetVersion` に渡す定型ラベル

値は公式 pom.xml から取得した確定値。出典は `lib/versions.ts` のコメントおよび `TERASOLUNA_OFFICIAL` を参照。
サイト上の一覧は `/versions` に表示される。

現在の主要バージョン (詳細は `/versions`):

- TERASOLUNA GFW 5.11.0.RELEASE (parent BOM 5.11.0.RELEASE + dependencies BOM 3.0.0.RELEASE)
- Spring Boot 4.0.2 / Spring Framework 7.0.3 / Spring Security 7.0.2 (BOM 経由)
- JDK 17 / Tomcat 11.0.15 / MyBatis 3.5.19

## Stack (このサイト自体)

- Next.js 16 (App Router, Turbopack) + React 19
- Tailwind CSS 3
- Markdown (`content/steps/`, `content/steps-basic/`, `content/steps-boot/`) + `unified` + `rehype-highlight`

## ディレクトリ構成

```
app/
├── steps/[slug]/          主軸: TERASOLUNA multi-project 版
├── steps-basic/[slug]/    入門: Security なし版 (Step 06 でつまずいた人の踏み台)
├── steps-boot/[slug]/     補助: Boot 単一プロジェクト版
├── versions/              バージョン一覧 (lib/versions.ts の表示)
├── troubleshoot/          詰まりどころ 10 項目
├── security-checklist/    セキュリティ観点 10 項目
└── (その他 解説ページ)
content/
├── steps/                 主軸コンテンツ (Markdown)
├── steps-basic/           入門コンテンツ (Markdown)
└── steps-boot/            補助コンテンツ (Markdown)
lib/
├── versions.ts            ★ バージョンの単一の真実源
├── steps.ts               主軸 Step 読込 (server only, node:fs)
├── steps-basic.ts         入門 Step 読込 (server only, node:fs)
├── steps-boot.ts          補助 Step 読込 (server only, node:fs)
├── step-format.ts         client-safe な整形関数
├── basic-steps-list.ts    client-safe な入門 Step 一覧
└── boot-steps-list.ts     client-safe な補助 Step 一覧
```

> ⚠️ `lib/steps.ts` / `lib/steps-basic.ts` / `lib/steps-boot.ts` は `node:fs` を使う **server only**。
> Client Component (`"use client"`) からは import しないこと (Turbopack のビルドが落ちる)。
> クライアント側で Step 番号の整形が要る場合は `lib/step-format.ts` を使う。

## content と lib/*-steps-list.ts の二重管理チェック

`lib/basic-steps-list.ts` (`BASIC_STEPS`) / `lib/boot-steps-list.ts` (`BOOT_STEPS`) は
Sidebar / SearchPalette から使う client-safe な静的リストで、`content/steps-basic/` /
`content/steps-boot/` の Markdown frontmatter (`title`) と**手動同期**が必要な二重管理構造になっている。
ズレを検知するため `npm run check:steps` (`scripts/check-step-lists.mjs`) で
slug の過不足と title の不一致を機械チェックする。`npm run build` の前段でも自動実行されるため、
ズレたままではビルドが失敗する。

## Local Dev

```powershell
npm install
npm run dev
```

http://localhost:3000

## Deploy

```powershell
git push  # Vercel が GitHub 連携で自動デプロイ
```
