import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { RelatedLinks } from "@/components/RelatedLinks";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";

export const metadata = { title: "H2 → Oracle 移行時の落とし穴 10 選 | TERASOLUNA 研修" };

type Pattern = {
  n: number;
  title: string;
  category: "型" | "NULL" | "関数" | "予約語/大文字" | "SQL 構文" | "文字列連結";
  h2Behavior: string;
  oracleBehavior: string;
  h2Code: string;
  oracleCode: string;
  note?: string;
};

const PATTERNS: Pattern[] = [
  {
    n: 1,
    title: "空文字 '' と NULL が同一視される",
    category: "NULL",
    h2Behavior: "空文字と NULL は別物として扱う (標準 SQL 準拠)",
    oracleBehavior: "**VARCHAR2 に INSERT された空文字 '' は自動的に NULL になる** (Oracle 固有・最大の罠)",
    h2Code: `-- H2 (両者は別)
SELECT * FROM users WHERE name = '';       -- 空文字の行がヒット
SELECT * FROM users WHERE name IS NULL;    -- NULL の行がヒット`,
    oracleCode: `-- Oracle (両者は同じ)
SELECT * FROM users WHERE name = '';       -- ← いつも 0 件!
SELECT * FROM users WHERE name IS NULL;    -- 空文字 INSERT した行もここに来る`,
    note: "Java 側で `if (name.isEmpty())` の分岐を書いていると Oracle で挙動が変わる。空文字を許容する仕様は Oracle では表現できないので、DB に載せる前に業務判断すべし",
  },
  {
    n: 2,
    title: "文字列連結演算子 `||` が動く / 動かない",
    category: "文字列連結",
    h2Behavior: "`||` が使える (標準 SQL / PostgreSQL / Oracle 準拠)",
    oracleBehavior: "`||` が使える。**ただし MySQL 移行の可能性がある場合は `CONCAT()` を使う癖を**",
    h2Code: `-- H2 / Oracle 両対応
WHERE role LIKE '%' || #{role} || '%'`,
    oracleCode: `-- 移植性重視なら CONCAT
WHERE role LIKE CONCAT('%', #{role}, '%')
-- MySQL は || が論理 OR になるので上のスタイルが必須`,
    note: "本教材は `||` を使っているが、実案件で MySQL DB の可能性があれば CONCAT に統一",
  },
  {
    n: 3,
    title: "NULL の代替値: `NVL` vs `COALESCE`",
    category: "関数",
    h2Behavior: "`COALESCE` は使える。`NVL` は互換モードで動く",
    oracleBehavior: "`NVL(x, default)` が定番。標準の `COALESCE(x, default)` も動くが、既存コードは `NVL` が多い",
    h2Code: `-- H2
SELECT COALESCE(role, '未設定') FROM users;`,
    oracleCode: `-- Oracle (現場で頻出)
SELECT NVL(role, '未設定') FROM users;
-- 3 引数版: NVL2(x, ifNotNull, ifNull) は Oracle 固有
SELECT NVL2(manager_id, 'has_manager', 'no_manager') FROM users;`,
    note: "実案件で Oracle を触るなら NVL は必須知識。既存プロジェクトのコードレビューで NVL が出てきても慌てないように",
  },
  {
    n: 4,
    title: "行数制限: `LIMIT` vs `ROWNUM` / `FETCH FIRST`",
    category: "SQL 構文",
    h2Behavior: "`LIMIT n` / `OFFSET n` が使える (PostgreSQL 互換)",
    oracleBehavior: "**`LIMIT` は使えない**。`ROWNUM <= n` (12c 未満) または `FETCH FIRST n ROWS ONLY` (12c+) を使う",
    h2Code: `-- H2 / PostgreSQL
SELECT * FROM users ORDER BY id LIMIT 10;
SELECT * FROM users ORDER BY id OFFSET 10 LIMIT 10;`,
    oracleCode: `-- Oracle 12c 以降 (推奨)
SELECT * FROM users ORDER BY id FETCH FIRST 10 ROWS ONLY;
SELECT * FROM users ORDER BY id OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;

-- Oracle 11g 以前 (古い現場ではまだ現役)
SELECT * FROM (
  SELECT u.*, ROWNUM r FROM (SELECT * FROM users ORDER BY id) u
) WHERE r <= 10;`,
  },
  {
    n: 5,
    title: "現在時刻: `NOW()` vs `SYSDATE` / `SYSTIMESTAMP`",
    category: "関数",
    h2Behavior: "`NOW()` / `CURRENT_TIMESTAMP` が使える",
    oracleBehavior: "`SYSDATE` (秒精度) / `SYSTIMESTAMP` (小数秒 + タイムゾーン) を使う",
    h2Code: `-- H2
UPDATE users SET updated_at = NOW() WHERE id = ?;
SELECT CURRENT_TIMESTAMP;`,
    oracleCode: `-- Oracle
UPDATE users SET updated_at = SYSDATE WHERE id = ?;   -- 秒精度
UPDATE users SET updated_at = SYSTIMESTAMP;           -- ミリ秒 + TZ
SELECT SYSTIMESTAMP FROM dual;                        -- FROM dual 忘れずに`,
    note: "**`FROM dual` (Oracle の疑似テーブル)** を忘れて `SELECT SYSDATE;` と書くと Oracle では動かない",
  },
  {
    n: 6,
    title: "VARCHAR の長さがバイト単位 vs 文字数単位",
    category: "型",
    h2Behavior: "`VARCHAR(255)` は 255 **文字** (マルチバイト文字も OK)",
    oracleBehavior: "**`VARCHAR2(255)` はデフォルトで 255 **バイト****。UTF-8 の日本語 (1 文字 3 バイト) は 85 文字しか入らない",
    h2Code: `-- H2 (255 文字入る)
name VARCHAR(255)   -- "あ" が 255 個入る`,
    oracleCode: `-- Oracle デフォルト (255 バイト = 日本語 85 文字)
name VARCHAR2(255)

-- 文字数指定にする (推奨)
name VARCHAR2(255 CHAR)   -- "あ" が 255 個入る
-- または DB 全体で NLS_LENGTH_SEMANTICS=CHAR に設定`,
    note: `Java 側で String name = "255 文字入力" を Oracle に UPDATE すると **ORA-12899 (value too large for column)** が出る。日本語カラムは 3 倍の余裕を持たせるか CHAR 指定必須`,
  },
  {
    n: 7,
    title: "識別子 (テーブル/カラム名) の大文字小文字扱い",
    category: "予約語/大文字",
    h2Behavior: "`users` `USERS` `Users` すべて同一視 (デフォルト)",
    oracleBehavior: "**引用符なしなら全て大文字に変換される**。`\"users\"` (引用符付き) は別物として扱う",
    h2Code: `-- H2 (全部通る)
SELECT * FROM users;
SELECT * FROM USERS;
SELECT * FROM Users;`,
    oracleCode: `-- Oracle
CREATE TABLE users (id NUMBER);   -- 内部的には USERS になる
SELECT * FROM users;              -- OK (大文字化されて USERS を探す)
SELECT * FROM Users;              -- OK (同じく大文字化)
SELECT * FROM "users";            -- ← ORA-00942 (小文字のテーブルなし)

-- 引用符付きで作るとハマる
CREATE TABLE "users" (id NUMBER); -- 明示的に小文字
SELECT * FROM users;              -- ← ORA-00942`,
    note: "**既存 Oracle DB でカラム名がなぜか小文字な場合は要注意**。過去のマイグレーションで引用符付き CREATE をされている",
  },
  {
    n: 8,
    title: "予約語がゆるい / 厳しい",
    category: "予約語/大文字",
    h2Behavior: "予約語のチェックが緩め。`status` `type` などがカラム名で使える",
    oracleBehavior: "予約語が厳しい。`type` `size` `date` などをカラム名にすると **`ORA-00904: invalid identifier`**",
    h2Code: `-- H2 (通る)
CREATE TABLE users (id INT, type VARCHAR(50), size INT);`,
    oracleCode: `-- Oracle NG (予約語)
CREATE TABLE users (id NUMBER, type VARCHAR2(50), size NUMBER);  -- エラー

-- 引用符付きで無理やり通せるが後々ハマるので避ける
CREATE TABLE users (id NUMBER, "type" VARCHAR2(50), "size" NUMBER);

-- 現実的な対応: 別名を付ける
CREATE TABLE users (id NUMBER, user_type VARCHAR2(50), user_size NUMBER);`,
    note: "移植性のため `type` `size` `date` `level` `number` などは**最初からカラム名に使わない**方が安全",
  },
  {
    n: 9,
    title: "日付型: `TIMESTAMP` の精度",
    category: "型",
    h2Behavior: "`TIMESTAMP` はナノ秒精度",
    oracleBehavior: "`DATE` は秒精度、`TIMESTAMP(6)` はマイクロ秒精度 (デフォルト)。**Oracle の DATE は時刻も含む** (JDBC ではよくハマる)",
    h2Code: `-- H2
created_at TIMESTAMP    -- ナノ秒精度`,
    oracleCode: `-- Oracle
created_at DATE                 -- 秒精度 (時刻含む、日付だけではない)
created_at TIMESTAMP            -- デフォルト TIMESTAMP(6) = マイクロ秒
created_at TIMESTAMP(9)         -- ナノ秒に上げる

-- Java 側のマッピング
-- java.sql.Date       ↔ Oracle DATE (時刻部分がゼロに切り詰められる)
-- java.sql.Timestamp  ↔ Oracle DATE or TIMESTAMP`,
    note: "**Oracle の DATE 型は「日付だけ」ではなく秒精度の日時**。Java で `LocalDate` にマッピングすると時刻情報が消える",
  },
  {
    n: 10,
    title: "BOOLEAN 型がない",
    category: "型",
    h2Behavior: "`BOOLEAN` 型が使える (TRUE / FALSE)",
    oracleBehavior: "**`BOOLEAN` はサポートされない** (Oracle 23c で初めて追加)。慣用として `CHAR(1) CHECK (col IN ('Y', 'N'))` や `NUMBER(1) CHECK (col IN (0, 1))`",
    h2Code: `-- H2
CREATE TABLE users (
  id INT,
  is_active BOOLEAN
);
UPDATE users SET is_active = TRUE WHERE id = 1;`,
    oracleCode: `-- Oracle 22c 以前 (現場のほぼ全部)
CREATE TABLE users (
  id NUMBER,
  is_active CHAR(1) CHECK (is_active IN ('Y', 'N'))
);
UPDATE users SET is_active = 'Y' WHERE id = 1;

-- Java 側は Boolean ↔ 'Y'/'N' の変換ロジックが必要
-- MyBatis なら typeHandler を書くのが定石`,
    note: "Java の `boolean` フィールドを Oracle にマッピングする際、**MyBatis に BooleanYNTypeHandler を書く**か、DB カラムを `NUMBER(1)` にして 0/1 で運用",
  },
];

const CATEGORY_COLORS: Record<Pattern["category"], string> = {
  "型": "bg-violet-100 text-violet-900",
  "NULL": "bg-rose-100 text-rose-900",
  "関数": "bg-amber-100 text-amber-900",
  "予約語/大文字": "bg-cyan-100 text-cyan-900",
  "SQL 構文": "bg-emerald-100 text-emerald-900",
  "文字列連結": "bg-slate-100 text-slate-900",
};

export default function OracleDiffPage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              For Production · 現場で踏む地雷
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              H2 で動いても Oracle で落ちる 10 パターン
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              本教材は開発の速さのため <strong>H2 in-memory DB</strong> で完結しています。
              しかし研修を終えた新人が現場に出ると、多くの場合 <strong>Oracle</strong> に切り替わります。
              このページは <strong>「H2 で動いていたのに Oracle で落ちる」典型パターン 10 個</strong> をまとめた早見表です。
            </p>
            <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-900">
              🚨 <strong>最大の罠は #1 (空文字 = NULL)</strong>。他は SQL レベルで見えるが、これは Java コードのロジックまで見直しが要る
            </div>
          </div>

          <PageMeta targetVersion="H2 2.x / Oracle 19c+ / MyBatis 3.5.x" />

          {/* パターン集 */}
          <div className="space-y-6">
            {PATTERNS.map((p) => (
              <article
                key={p.n}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-brand font-mono font-bold text-sm shrink-0">
                      #{String(p.n).padStart(2, "0")}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 flex-1 min-w-0">
                      {p.title}
                    </h3>
                    <span
                      className={
                        "inline-block text-xs font-semibold px-2 py-0.5 rounded " +
                        CATEGORY_COLORS[p.category]
                      }
                    >
                      {p.category}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  {/* H2 */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs bg-emerald-100 text-emerald-900 rounded font-semibold">
                        H2 (教材)
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                      {p.h2Behavior}
                    </p>
                    <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto leading-relaxed">
                      <code>{p.h2Code}</code>
                    </pre>
                  </div>

                  {/* Oracle */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs bg-rose-100 text-rose-900 rounded font-semibold">
                        Oracle (現場)
                      </span>
                    </div>
                    <p
                      className="text-sm text-slate-700 mb-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: p.oracleBehavior.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                    <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto leading-relaxed">
                      <code>{p.oracleCode}</code>
                    </pre>
                  </div>
                </div>

                {p.note && (
                  <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 text-sm text-amber-900">
                    💡 {p.note}
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* まとめ */}
          <section className="mt-10 bg-white rounded-xl border border-slate-200 p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-3 text-slate-900">
              移行前のチェックリスト
            </h2>
            <ol className="space-y-2 text-sm md:text-base text-slate-700 list-decimal pl-6">
              <li>Java コードで「空文字 vs NULL の分岐」がある箇所を全て洗い出す (最大の地雷)</li>
              <li>`LIMIT` を使っている SQL を全て `FETCH FIRST ROWS ONLY` に置換</li>
              <li>`NOW()` / `CURRENT_TIMESTAMP` を `SYSDATE` / `SYSTIMESTAMP` に、`FROM dual` を追加</li>
              <li>文字列カラムを `VARCHAR2(N CHAR)` に変更、または DB の `NLS_LENGTH_SEMANTICS` を CHAR に</li>
              <li>予約語 (`type` `size` `date` `level` `number`) をカラム名に使っていないか確認</li>
              <li>`BOOLEAN` 型を使っていないか、使っていたら `CHAR(1)` + typeHandler に置換</li>
              <li>Oracle にテスト環境を用意して、全画面通しで再度動作確認</li>
            </ol>
          </section>

          <RelatedLinks items={[
            { href: "/steps/04-mapper", emoji: "🗄", label: "Step 04: Mapper (SQL 係)", desc: "本教材の Mapper 実装 (H2 前提)" },
            { href: "/db-connection", emoji: "🔌", label: "DB 接続の仕組み", desc: "TERASOLUNA multi-project の DB 設定" },
            { href: "/how-to", emoji: "🍳", label: "「〜するには?」レシピ集", desc: "実装レシピ 20 個" },
            // /mentor は 2026-07-28 に非表示化
          ]} />

          <PageFooter pageTitle="H2 → Oracle 移行時の落とし穴 10 選" slug="oracle-diff" />
        </main>
      </div>
    </div>
  );
}
