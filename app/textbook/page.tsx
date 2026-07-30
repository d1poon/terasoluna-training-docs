import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";
import { TERMS } from "@/lib/glossary-terms";

export const metadata = { title: "ゼロから始める 教科書" };

const CHAPTERS = [
  { n: 1, id: "web", emoji: "🌐", title: "Web アプリって何?" },
  { n: 2, id: "html", emoji: "📄", title: "HTML の基礎" },
  { n: 3, id: "db", emoji: "🗄", title: "データベース (DB) の基礎" },
  { n: 4, id: "java", emoji: "☕", title: "Java の基礎文法" },
  { n: 5, id: "web-parts", emoji: "🎯", title: "Web アプリの部品 (層の話)" },
  { n: 6, id: "tools", emoji: "🛠", title: "開発ツール (STS / Maven / Git)" },
];

export default function TextbookPage() {
  const steps = getAllSteps();
  const termCount = TERMS.length;

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main id="main" className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 lg:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              For Beginners · 完全ゼロから
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              ゼロから始める 教科書
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              「カラムって何?」「タグって?」「リクエストって?」 レベルからでも読める、
              <strong>本当のゼロから始まる教科書</strong>。学習を始める前や、Step で詰まった時にここを開いて確認してください。
            </p>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
              💡 このページは<strong>Web / DB / Java が初めて</strong>の方向け。ある程度知識のある方は
              <Link href="/preface" className="text-brand underline">まず最初に読む (レストランメタファー)</Link>
              や <Link href="/how-to" className="text-brand underline">レシピ集</Link> の方が先に読むと効率的です。
              実装は主軸から進め、Step 06 の Spring Security で難しく感じたら入門版 (Security なし) に切り替え可能です。
            </div>
          </div>

          <PageMeta />

          {/* Table of contents */}
          <section className="mb-10 bg-white rounded-xl border border-slate-200 p-5 md:p-6">
            <h2 className="text-base font-bold mb-3 text-slate-900">目次</h2>
            <ol className="space-y-2">
              {CHAPTERS.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#ch-${c.id}`}
                    className="flex items-baseline gap-3 text-slate-700 hover:text-brand"
                  >
                    <span className="text-brand font-mono font-bold w-8 shrink-0">
                      {c.n}.
                    </span>
                    <span className="text-lg leading-none">{c.emoji}</span>
                    <span>{c.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          {/* Chapter 1: Web アプリって何? */}
          <Chapter n={1} id="web" emoji="🌐" title="Web アプリって何?">
            <p>
              Web アプリとは、<strong>ブラウザ</strong> (Chrome, Edge, Safari など) から使うアプリのこと。
              普段使っている Twitter、YouTube、社内システムも全部 Web アプリ。
              仕組みは驚くほどシンプルで、<strong>「クライアント (ブラウザ) がサーバーに『これください』と頼む」</strong>を繰り返しているだけ。
            </p>

            <H3>1-1. クライアント と サーバー</H3>
            <Table
              head={["登場人物", "何をする", "普段目にする例"]}
              rows={[
                ["クライアント", "サーバに『これください』と頼む", "あなたのブラウザ"],
                ["サーバー", "頼まれたものを返す", "会社の共用マシン、AWS の EC2 など"],
                ["データベース (DB)", "データを永続的に保存する", "サーバの中で動く、目に見えない"],
              ]}
            />

            <H3>1-2. リクエスト と レスポンス</H3>
            <p>
              クライアントが「これください」と送る紙が <strong>リクエスト</strong>、サーバーが「はいこれ」と返すのが <strong>レスポンス</strong>。
              画面を 1 回開くたびに、この 1 対のやり取りが飛ぶ。
            </p>
            <AsciiBox>
{`[ブラウザ] ─── リクエスト ───▶ [サーバー]
[ブラウザ] ◀── レスポンス ─── [サーバー]

  例:
  1. ブラウザ: 「/user-info 見せて」
  2. サーバー: 「はい、これが HTML」
  3. ブラウザ: HTML を解釈して画面を描く`}
            </AsciiBox>

            <H3>1-3. URL の中身</H3>
            <p>
              URL は「サーバのどこにあるものを見たいか」を書いた住所。以下 5 パーツ:
            </p>
            <AsciiBox>
{`https://example.com:8080/user-info?role=部長
──┬── ──┬────── ──┬─ ──────┬────── ──────┬──────
  │     │         │        │              │
プロトコル ホスト   ポート   パス          クエリパラメータ
(暗号化)   (どのサーバ)      (何のページ)   (追加の絞込条件)`}
            </AsciiBox>
            <Table
              head={["パーツ", "意味", "例"]}
              rows={[
                ["プロトコル", "通信方法。https は暗号化あり", "http:// / https://"],
                ["ホスト", "どのサーバに行くか", "example.com"],
                ["ポート", "サーバ内のどのプログラムか (省略時 http=80, https=443)", ":8080"],
                ["パス", "サーバの中のどの機能か", "/user-info"],
                ["クエリパラメータ", "追加の絞込条件。? で始まり & で複数繋げる", "?role=部長&order=asc"],
              ]}
            />

            <H3>1-4. GET と POST</H3>
            <Table
              head={["種類", "用途", "リロードで再送される?"]}
              rows={[
                ["GET", "見るだけ / 検索 (状態を変えない)", "安全"],
                ["POST", "登録・更新・削除 (状態を変える)", "危険 → 二重更新の恐れ"],
              ]}
            />
            <Note>
              後で出てくる <strong>PRG パターン</strong> は、POST の後に GET にリダイレクトすることでリロードの危険を回避する仕組み。
            </Note>
          </Chapter>

          {/* Chapter 2: HTML */}
          <Chapter n={2} id="html" emoji="📄" title="HTML の基礎">
            <p>
              <strong>HTML</strong> = HyperText Markup Language。ブラウザに<strong>何をどう表示するか</strong>を指示するテキスト。
              サーバーから届く「レスポンス」の中身がこの HTML。
            </p>

            <H3>2-1. タグ と 属性 と 要素</H3>
            <AsciiBox>
{`<a href="/menu">メニューへ</a>
 └┬┘ └────┬──────┘ └────┬────┘ └─┬─┘
  │       │            │          │
 開始タグ  属性         中身       終了タグ
 (a)     (href="/menu") (テキスト) (</a>)

これ全部で「1 個の要素」`}
            </AsciiBox>
            <Table
              head={["用語", "意味", "例"]}
              rows={[
                ["タグ", "<>で囲まれた印。開始と終了がある", "<a>, </a>"],
                ["属性", "タグに付ける情報。key=\"value\" 形式", "href=\"/menu\", class=\"btn\""],
                ["要素", "開始タグ + 中身 + 終了タグ の全体", "<a>...</a>"],
                ["属性値", "属性の右側の値。必ずダブルクォートで囲む", "\"/menu\""],
              ]}
            />

            <H3>2-2. よく使うタグ 10 個</H3>
            <Table
              head={["タグ", "何を表す", "例"]}
              rows={[
                ["<h1>〜<h6>", "見出し (大きい順)", "<h1>タイトル</h1>"],
                ["<p>", "段落 (パラグラフ)", "<p>文章</p>"],
                ["<a>", "リンク (別のページに飛ぶ)", "<a href=\"/menu\">メニュー</a>"],
                ["<img>", "画像 (終了タグなし)", "<img src=\"logo.png\">"],
                ["<ul> + <li>", "箇条書きリスト", "<ul><li>A</li><li>B</li></ul>"],
                ["<div>", "区切り (意味なし、レイアウト用)", "<div>...</div>"],
                ["<span>", "行内区切り (テキスト内の一部だけスタイル付けたい時)", "<span>ここだけ赤</span>"],
                ["<table><tr><td>", "表 (table→行→セル)", "後述"],
                ["<form>", "入力フォーム (サーバに送信)", "後述"],
                ["<input> / <button>", "入力欄・ボタン", "後述"],
              ]}
            />

            <H3>2-3. フォーム (ユーザ入力を送る)</H3>
            <CodeExample lang="html" code={`<form action="/search" method="get">
    <label>役職:
        <input type="text" name="role" />
    </label>
    <button type="submit">検索</button>
</form>`} />
            <Table
              head={["属性 / タグ", "役割"]}
              rows={[
                ["form の action", "どの URL に送るか"],
                ["form の method", "GET (URL に載せる) or POST (body に載せる)"],
                ["input の type", "text (文字) / password (伏字) / hidden (見えない) / checkbox など"],
                ["input の name", "サーバ側で受け取る時の変数名 (必須)"],
                ["button の type=submit", "押すとフォームが送信される"],
              ]}
            />

            <H3>2-4. リンクボタンの作り方</H3>
            <p>
              「ボタンをクリックしたら別のページに飛ぶ」 → <code>&lt;a href&gt;</code> を使う。
              見た目をボタンっぽくしたければ CSS で装飾するか、<code>&lt;a&gt;&lt;button&gt;&lt;/button&gt;&lt;/a&gt;</code> で入れ子。
            </p>
            <CodeExample lang="html" code={`<a href="/menu">メニューへ</a>

<!-- ボタン風に見せたい -->
<a href="/menu"><button type="button">メニュー</button></a>`} />
          </Chapter>

          {/* Chapter 3: DB */}
          <Chapter n={3} id="db" emoji="🗄" title="データベース (DB) の基礎">
            <p>
              <strong>データベース (DB)</strong> = データを整理して保存しておく箱。
              アプリを再起動しても消えないよう、DB に永続的に置いておく。
            </p>

            <H3>3-1. テーブル / カラム / レコード</H3>
            <p>
              DB のデータは<strong>表 (テーブル)</strong> の形で持つ。Excel の 1 シートを想像してほしい。
            </p>
            <div className="mt-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
              ⚠️ この例は Spring Security を使う主軸トラック (<code>/steps/</code>) の users テーブルです。
              入門トラック (<code>/steps-basic/</code>) では認証を扱わないため、実際のテーブルは
              <code>id / name / role</code> の 3 カラムで <code>password</code> は存在しません。
            </div>
            <div className="my-4 overflow-x-auto">
              <table className="text-sm border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-3 py-2">id</th>
                    <th className="border border-slate-300 px-3 py-2">password</th>
                    <th className="border border-slate-300 px-3 py-2">role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-3 py-2 font-mono">u001</td>
                    <td className="border border-slate-300 px-3 py-2 font-mono text-xs">$2a$10$...</td>
                    <td className="border border-slate-300 px-3 py-2">部長</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-2 font-mono">u002</td>
                    <td className="border border-slate-300 px-3 py-2 font-mono text-xs">$2a$10$...</td>
                    <td className="border border-slate-300 px-3 py-2">課長</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-2 font-mono">u003</td>
                    <td className="border border-slate-300 px-3 py-2 font-mono text-xs">$2a$10$...</td>
                    <td className="border border-slate-300 px-3 py-2">係長</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-xs text-slate-500 mt-2">↑ users という名前のテーブル</div>
            </div>
            <Table
              head={["用語", "意味", "上の表の例"]}
              rows={[
                ["テーブル", "データの表全体 (Excel シート相当)", "users"],
                ["カラム (列)", "縦の 1 列。「何を保持するか」の項目", "id, password, role"],
                ["レコード (行)", "横の 1 行。1 個のデータの塊", "u001 / $2a$... / 部長 の 1 行"],
                ["セル", "レコード × カラム の交点、1 個の値", "u001, 部長, など"],
              ]}
            />

            <H3>3-2. 主キー (Primary Key)</H3>
            <p>
              テーブルの中で「絶対に重複しない、この 1 行を指す ID」になるカラム。
              <code>users</code> テーブルなら <code>id</code> カラム。同じ <code>u001</code> を持つ行は 1 つしか作れない。
            </p>

            <H3>3-3. SQL の 4 命令</H3>
            <p>
              DB を操作する言葉が <strong>SQL</strong>。覚える基本は 4 つだけ:
            </p>
            <Table
              head={["命令", "何をする", "例"]}
              rows={[
                ["SELECT", "取ってくる (読む)", "SELECT * FROM users;"],
                ["INSERT", "新しい行を追加する", "INSERT INTO users VALUES ('u006', '...', '主任');"],
                ["UPDATE", "既存の行を書き換える", "UPDATE users SET role='部長' WHERE id='u002';"],
                ["DELETE", "行を消す", "DELETE FROM users WHERE id='u005';"],
              ]}
            />

            <H3>3-4. WHERE 句 (絞込条件)</H3>
            <CodeExample lang="sql" code={`-- 全部
SELECT * FROM users;

-- id が u001 の 1 行だけ
SELECT * FROM users WHERE id = 'u001';

-- 役職に「長」を含む行 (部長・課長・係長)
SELECT * FROM users WHERE role LIKE '%長%';

-- 更新
UPDATE users SET role = '本部長' WHERE id = 'u002';`} />

            <H3>3-5. 用語まとめ</H3>
            <Table
              head={["用語", "日本語での言い方", "解説"]}
              rows={[
                ["Table", "表", "データの集まりの単位"],
                ["Column", "カラム / 列 / 項目", "縦方向。何を保持するかの定義"],
                ["Row / Record", "行 / レコード", "横方向。1 個のデータ"],
                ["Primary Key (PK)", "主キー", "レコードを一意に特定するカラム"],
                ["Foreign Key (FK)", "外部キー", "別テーブルの PK を参照する繋がり"],
                ["Index", "インデックス", "検索を速くするための索引 (研修では触らない)"],
                ["Schema", "スキーマ", "テーブル構造の定義 (schema.sql 参照)"],
                ["DDL", "データ定義言語", "CREATE TABLE 等、構造を作る SQL"],
                ["DML", "データ操作言語", "SELECT / INSERT / UPDATE / DELETE"],
              ]}
            />
          </Chapter>

          {/* Chapter 4: Java */}
          <Chapter n={4} id="java" emoji="☕" title="Java の基礎文法">
            <p>
              <strong>Java</strong> は硬い型付け言語。ファイル名 = クラス名 (原則) で、拡張子は <code>.java</code>。
              以下、研修中に必要な最小文法を並べる。
            </p>

            <H3>4-1. 変数 と 型</H3>
            <CodeExample lang="java" code={`String name = "u001";        // 文字列
int count = 10;              // 整数
long bigNumber = 100000L;    // 大きい整数
double price = 100.5;        // 小数
boolean isAdmin = true;      // 真偽値 (true / false)`} />
            <Note>
              Java は「型を最初に書く」言語。<code>String</code> と書いたらそこには文字列しか入れられない。
              間違えるとコンパイルエラーで即怒られる = <strong>実行前に間違いに気付ける</strong>のが利点。
            </Note>

            <H3>4-2. if / for / while</H3>
            <CodeExample lang="java" code={`// if 分岐
if (count > 10) {
    System.out.println("多い");
} else if (count > 5) {
    System.out.println("普通");
} else {
    System.out.println("少ない");
}

// for 繰り返し
for (int i = 0; i < 5; i++) {
    System.out.println(i);   // 0, 1, 2, 3, 4
}

// 拡張 for (配列/リストを 1 つずつ)
List<User> users = ...;
for (User u : users) {
    System.out.println(u.getId());
}

// while 繰り返し
while (count > 0) {
    count--;
}`} />

            <H3>4-3. class と オブジェクト</H3>
            <p>
              <strong>class</strong> = 「もの」の<strong>設計図</strong>。<strong>オブジェクト</strong> = 設計図から作った<strong>実物</strong>。
            </p>
            <CodeExample lang="java" code={`// 設計図 (User.java)
public class User {
    private String id;
    private String role;

    // ↓ getter (値を取り出すメソッド)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

// 使う側 (別のファイル)
User u = new User();        // 実物を作る
u.setId("u001");            // 値を入れる
u.setRole("部長");
System.out.println(u.getId());  // → u001`} />

            <H3>4-4. メソッド</H3>
            <CodeExample lang="java" code={`// メソッドの構造
public String hello(String name) {
//  │      │      │       │
//  │      │      │       └── 引数 (受け取る値)
//  │      │      └── メソッド名
//  │      └── 戻り値の型 (何を返すか)
//  └── アクセス修飾子 (public = 誰からでも呼べる)

    return "こんにちは、" + name + "さん!";  // ← 戻り値
}

// 呼び出す側
String msg = hello("u001");  // → "こんにちは、u001さん!"`} />
            <Table
              head={["修飾子", "誰から見える", "使う場面"]}
              rows={[
                ["public", "全世界", "外から呼ばれるメソッド"],
                ["private", "同じ class の中だけ", "フィールド、内部ヘルパーメソッド"],
                ["protected", "同じ package + 継承先", "研修レベルではあまり使わない"],
                ["(何も書かない)", "同じ package の中だけ", "パッケージ内部用"],
              ]}
            />

            <H3>4-5. package と import</H3>
            <CodeExample lang="java" code={`package com.example.rolemgr.domain;   // ← このファイルの「住所」
                                        // フォルダ src/main/java/com/example/rolemgr/domain/ に置く

import java.util.List;                  // ← 他の class を短い名前で使う許可
import com.example.rolemgr.repository.UserMapper;

public class UserService {
    public List<User> findAll() { ... }    // ↑ import してるので "List" と書ける
}`} />

            <H3>4-6. アノテーション</H3>
            <p>
              <code>@Controller</code> <code>@Service</code> <code>@GetMapping</code> のような <strong>@ から始まる印</strong>。
              Java コードに「ラベル」を貼る仕組み。Spring はこのラベルを見て「これはコントローラだよね」と判断する。
            </p>
            <CodeExample lang="java" code={`@Controller                    // ← この class はコントローラ
public class MenuController {

    @GetMapping("/menu")       // ← このメソッドは GET /menu に対応
    public String menu(Model model) {
        return "menu";
    }
}`} />
          </Chapter>

          {/* Chapter 5: Web parts */}
          <Chapter n={5} id="web-parts" emoji="🎯" title="Web アプリの部品 (層の話)">
            <p>
              このアプリは 3 つの<strong>層 (レイヤー)</strong> に分かれている。それぞれ役割が違う。
              まず頭に入れておきたい対応関係:
            </p>
            <AsciiBox>
{`[ブラウザ]
    │  リクエスト
    ▼
┌──────────────┐
│ Controller   │  HTTP を受けて処理を振り分ける係
│ (@Controller)│  「注文票を読む ウェイター」
└──────┬───────┘
       │ userService.findById(...) を呼ぶ
       ▼
┌──────────────┐
│ Service      │  業務ロジック係。何をやるか
│ (@Service)   │  「料理を作る シェフ」
└──────┬───────┘
       │ userMapper.findById(...) を呼ぶ
       ▼
┌──────────────┐
│ Mapper       │  SQL を発行して DB とやり取り
│ (@Mapper)    │  「材料を出す 倉庫係」
└──────┬───────┘
       ▼
     [DB]`}
            </AsciiBox>

            <Table
              head={["層", "役割 (1行)", "アノテーション", "何を知ってる"]}
              rows={[
                ["Controller", "HTTP を受けて Model + View を返す", "@Controller", "HTTP のことだけ"],
                ["Service", "業務ロジック + トランザクション制御", "@Service", "業務のことだけ"],
                ["Repository / Mapper", "DB とやり取り (SQL)", "@Mapper", "DB のことだけ"],
                ["Domain (Entity)", "各層を流れる POJO (データの塊)", "(何もなし)", "自分の状態だけ"],
                ["View (JSP)", "Model を HTML に描画", "(HTML + JSP)", "見せ方だけ"],
              ]}
            />

            <H3>5-1. なぜ分けるの?</H3>
            <p>
              全部を 1 個の class に書いたら数百行の巨大クラスになる。分けるメリット:
            </p>
            <ul>
              <li>各層は<strong>自分の関心事だけ</strong>を見る</li>
              <li>単体テストしやすい (Service だけ、Mapper だけ、を独立にテスト)</li>
              <li>変更範囲が予測可能 (SQL 変えるなら Mapper だけ、画面変えるなら View だけ)</li>
            </ul>

            <H3>5-2. JSP とは</H3>
            <p>
              <strong>JSP</strong> (Java Server Pages) = 「サーバ側で HTML を組み立てるためのテンプレート」。
              拡張子は <code>.jsp</code>。書き方は「HTML の中に Java の力を借りるための特殊な記号 (<code>${"$"}{"{...}"}</code> や <code>&lt;c:if&gt;</code>) を混ぜたもの」。
            </p>
            <CodeExample lang="jsp" code={`<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<body>
    <h1>こんにちは、\${user.id}さん!</h1>   <!-- サーバ側で "u001" に置き換わる -->
    <c:if test="\${user.role == '部長'}">
        <p>あなたは部長です</p>
    </c:if>
</body>
</html>`} />
            <Note>
              JSP は<strong>サーバー内で処理されて、純粋な HTML になってからブラウザに送られる</strong>。
              ブラウザは <code>${"$"}{"{...}"}</code> や <code>&lt;c:if&gt;</code> を見ることは絶対にない。
            </Note>

            <H3>5-3. DI (依存性注入) とは</H3>
            <p>
              Controller が Service を使いたい時、自分で <code>new UserService()</code> しない。
              Spring が「はい、これ使って」と勝手に渡してくれる。この仕組みが <strong>DI (Dependency Injection)</strong>。
            </p>
            <CodeExample lang="java" code={`@Controller
public class UserInfoController {

    private final UserService userService;   // ← 使いたい部品を宣言

    // コンストラクタ引数に書いておく = Spring に「これください」と依頼
    public UserInfoController(UserService userService) {
        this.userService = userService;      // ← Spring がセットしてくれる
    }

    // メソッド内で普通に使える
    public String view(...) {
        User u = userService.findById(...);
    }
}`} />
          </Chapter>

          {/* Chapter 6: Tools */}
          <Chapter n={6} id="tools" emoji="🛠" title="開発ツール (STS / Maven / Git)">
            <H3>6-1. STS (Spring Tool Suite)</H3>
            <p>
              Spring 開発用の <strong>IDE</strong> (統合開発環境)。Eclipse ベース。研修ではこれでコードを書く。
            </p>
            <Table
              head={["やりたいこと", "STS の操作"]}
              rows={[
                ["新しい .java ファイルを作る", "右クリック → New → Class"],
                ["新しい .jsp ファイルを作る", "webapp/WEB-INF/views/ で 右クリック → New → File"],
                ["エラーの場所を見る", "画面下部の Problems タブ、または赤い×アイコン"],
                ["Tomcat 起動 / 停止", "画面下部 Servers タブ、緑三角 or 赤四角"],
                ["ログを見る", "画面下部 Console タブ"],
                ["ファイル検索", "Ctrl + H (Search) または Ctrl + Shift + R (File)"],
              ]}
            />

            <H3>6-2. Maven</H3>
            <p>
              <strong>ビルドツール</strong> + <strong>依存管理ツール</strong>。<code>pom.xml</code> に「使いたいライブラリ」を書いておくと、Maven が自動でダウンロードしてくれる。
            </p>
            <Table
              head={["コマンド", "何をする"]}
              rows={[
                ["mvn compile", "Java をコンパイルする"],
                ["mvn test", "テストを走らせる"],
                ["mvn package", "war (or jar) を作る"],
                ["mvn install", "ローカルの Maven リポジトリに入れる"],
                ["mvn clean", "target/ フォルダを消す (ビルド結果クリア)"],
              ]}
            />

            <H3>6-3. Git (バージョン管理) の最低限</H3>
            <Table
              head={["コマンド", "何をする", "例え"]}
              rows={[
                ["git status", "今の状態を見る", "「何を変更中?」"],
                ["git add ファイル", "変更をステージに載せる", "「これをコミットの候補にする」"],
                ["git commit -m \"...\"", "スナップショットを保存", "「今の状態をセーブ」"],
                ["git push", "自分のマシンから GitHub に送る", "「サーバに保存」"],
                ["git pull", "GitHub から取ってくる", "「サーバから取り込む」"],
                ["git log", "履歴を見る", "「これまでのセーブ一覧」"],
              ]}
            />

            <H3>6-4. ログの見方</H3>
            <p>
              アプリが動くと、Console にログが出る。以下の 4 レベルを知っておくとよい:
            </p>
            <Table
              head={["レベル", "意味", "見た目"]}
              rows={[
                ["ERROR", "エラー (何かが動かなかった)", "赤字"],
                ["WARN", "警告 (動くけど気になる)", "黄字"],
                ["INFO", "情報 (普通の動作)", "白字"],
                ["DEBUG", "詳細 (開発中の確認用)", "灰字"],
              ]}
            />
            <Note>
              エラーが出たら<strong>スタックトレース (連なった "at ..." の行) の一番上</strong>を見る。
              「どこで、なぜ、どんな例外が投げられたか」がわかる。
            </Note>
          </Chapter>

          {/* Next steps */}
          <section className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              教科書を読み終えたら
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/preface"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm"
              >
                <div aria-hidden="true" className="text-2xl">📗</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Start
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  はじめに (レストランメタファーで全体像)
                </div>
              </Link>
              <Link
                href="/glossary"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm"
              >
                <div aria-hidden="true" className="text-2xl">📖</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Ref
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  用語集 ({termCount} 用語)
                </div>
              </Link>
              <Link
                href="/steps/01-project-skeleton"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm"
              >
                <div aria-hidden="true" className="text-2xl">🚀</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Do
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  Step 01 から実際に組み立てる
                </div>
              </Link>
              <Link
                href="/playground"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm"
              >
                <div aria-hidden="true" className="text-2xl">🕹</div>
                <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Try
                </div>
                <div className="text-base font-bold mt-1 text-slate-900">
                  触ってみるデモ
                </div>
              </Link>
            </div>
          </section>

          <PageFooter pageTitle="ゼロから始める 教科書" slug="textbook" />
        </main>
      </div>
    </div>
  );
}

/* ==================== Helper components ==================== */

function Chapter({
  n,
  id,
  emoji,
  title,
  children,
}: {
  n: number;
  id: string;
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`ch-${id}`} className="mb-14 scroll-mt-6">
      <div className="mb-4 pb-3 border-b-2 border-brand">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Chapter {n}
        </div>
        <h2 className="text-xl md:text-2xl font-bold mt-1 text-slate-900">
          <span className="mr-2">{emoji}</span>
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-slate-800 text-sm md:text-base leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base md:text-lg font-bold text-slate-900 mt-6 mb-2">
      {children}
    </h3>
  );
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: string[][];
}) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-xs md:text-sm border border-slate-200 border-collapse">
        <thead>
          <tr className="bg-slate-100">
            {head.map((h, i) => (
              <th
                key={i}
                className="border border-slate-300 px-2 md:px-3 py-2 text-left font-semibold text-slate-800"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="border border-slate-200 px-2 md:px-3 py-2 align-top text-slate-700"
                >
                  {j === 0 ? <code className="font-mono">{cell}</code> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AsciiBox({ children }: { children: React.ReactNode }) {
  return (
    <pre className="my-3 bg-slate-900 text-slate-100 rounded-lg p-3 md:p-4 text-xs md:text-sm overflow-x-auto leading-relaxed">
      {children}
    </pre>
  );
}

function CodeExample({ lang, code }: { lang: string; code: string }) {
  return (
    <pre className="my-3 bg-slate-900 text-slate-100 rounded-lg p-3 md:p-4 text-xs md:text-sm overflow-x-auto leading-relaxed">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 text-xs md:text-sm text-amber-900">
      💡 {children}
    </div>
  );
}
