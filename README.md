# TERASOLUNA 研修 — 役職編集アプリ 組立ガイド (公開版)

Spring Boot 3.4 + JSP + MyBatis + H2 で「役職編集アプリ」を 12 ステップで組み立てるガンプラ式ガイドの公開ホームページ。

- **プロダクション**: https://terasoluna-training.vercel.app (デプロイ後有効)
- **元コンテンツ**: Obsidian vault `05_Learning/terasoluna-build-*.md` (Claudian が管理)
- **リファレンス実装**: `C:\Users\donpa\Workspace\terasoluna-training\reference-app\`

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS 3
- Markdown (`content/steps/`) + `unified` + `rehype-highlight`

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

## コンテンツ更新フロー

1. Vault 側 `05_Learning/terasoluna-build-XX.md` を編集
2. `scripts/sync-content.ps1` を実行して `content/steps/` に反映 (前置 `terasoluna-build-` を除去 + `title` frontmatter を追加)
3. `git commit && git push` → 自動デプロイ
