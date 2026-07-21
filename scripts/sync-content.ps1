# Vault の terasoluna-build-*.md を content/steps/ に同期
# frontmatter に title を追加、ファイル名から terasoluna-build- を除去

param(
    [string]$VaultPath = "C:\Users\donpa\Obsidian\ai脳\05_Learning"
)

$dst = Join-Path $PSScriptRoot "..\content\steps"
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }

$titles = @{
    "00-toc"                = "目次"
    "01-project-skeleton"   = "プロジェクト骨組み"
    "02-empty-boot"         = "空アプリ起動 & DB 準備"
    "03-user-domain"        = "User ドメイン"
    "04-mapper"             = "Mapper (SQL 係)"
    "05-service"            = "Service (業務ロジック係)"
    "06-auth-foundation"    = "認証基盤"
    "07-login"              = "ログイン画面"
    "08-menu"               = "メニュー画面"
    "09-search"             = "検索画面"
    "10-user-info"          = "ユーザ情報画面"
    "11-edit"               = "変更画面 & PRG パターン"
    "12-complete"           = "完成 & まとめ"
}

$files = Get-ChildItem $VaultPath -Filter "terasoluna-build-*.md"
foreach ($f in $files) {
    $stem = $f.BaseName -replace "^terasoluna-build-", ""
    $title = $titles[$stem]
    if (-not $title) {
        Write-Warning "no title for $stem — skipping"
        continue
    }

    $raw = Get-Content $f.FullName -Raw -Encoding UTF8

    # 既存の frontmatter (--- ... ---) を捕捉
    if ($raw -match '(?s)^---\r?\n(.*?)\r?\n---\r?\n(.*)$') {
        $fm   = $Matches[1]
        $body = $Matches[2]
    } else {
        $fm   = ""
        $body = $raw
    }

    # YAML パーサが理解できない Obsidian wikilink を含む行を除去
    #   related: [[foo]] [[bar]]  や  tags に含まれる wikilink 記法など
    $fm = ($fm -split "`n" | Where-Object { $_ -notmatch '\[\[' }) -join "`n"

    # 既存 frontmatter に title を追加 (無ければ足す、あれば置き換え)
    if ($fm -match '(?m)^title:') {
        $fm = ($fm -replace '(?m)^title:.*$', "title: `"$title`"")
    } else {
        $fm = "title: `"$title`"`n$fm"
    }

    # Vault 内 wiki link を site の URL に置換
    #  [[terasoluna-build-01-project-skeleton|Step 01: ...]]  →  [Step 01: ...](/steps/01-project-skeleton)
    #  [[terasoluna-build-XX-yyy]]                            →  [XX-yyy](/steps/XX-yyy)
    $body = [regex]::Replace($body, '\[\[terasoluna-build-([0-9]+-[a-z-]+)\|([^\]]+)\]\]', {
        param($m)
        "[" + $m.Groups[2].Value + "](/steps/" + $m.Groups[1].Value + ")"
    })
    $body = [regex]::Replace($body, '\[\[terasoluna-build-([0-9]+-[a-z-]+)\]\]', {
        param($m)
        "[" + $m.Groups[1].Value + "](/steps/" + $m.Groups[1].Value + ")"
    })
    # 他ノートへの wiki link は URL に変えない (表示だけ整える)
    $body = [regex]::Replace($body, '\[\[([^\]|]+)\|([^\]]+)\]\]', '$2')
    $body = [regex]::Replace($body, '\[\[([^\]]+)\]\]', '$1')

    $out = "---`n$fm`n---`n$body"
    $outPath = Join-Path $dst "$stem.md"
    Set-Content -Path $outPath -Value $out -Encoding UTF8 -NoNewline
    Write-Host "  wrote  $outPath"
}

Write-Host "`nDone. $($files.Count) files synced." -ForegroundColor Green
