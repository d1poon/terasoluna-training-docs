import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export const metadata = { title: "はじめに | TERASOLUNA 研修" };

const roleTable = [
  { restaurant: "🍽 ウェイター", role: "Controller", file: "controller/*.java", desc: "注文票を受け取ってシェフに伝える" },
  { restaurant: "👨‍🍳 シェフ", role: "Service", file: "service/*.java", desc: "実際に料理を作る (業務ロジック)" },
  { restaurant: "🗄 倉庫係", role: "Mapper (Repository)", file: "repository/ + mapper/*.xml", desc: "冷蔵庫から材料を取り出す" },
  { restaurant: "❄ 冷蔵庫", role: "DB (H2)", file: "schema.sql (定義)", desc: "全部のデータが実際に入っている場所" },
  { restaurant: "🍽 お皿・盛り付け", role: "View (JSP)", file: "webapp/WEB-INF/views/*.jsp", desc: "料理を綺麗な形にしてお客に出す (HTML 生成)" },
  { restaurant: "📝 注文票の紙", role: "Model", file: "Controller の中で作る", desc: "Controller が View に渡すデータの箱" },
  { restaurant: "🥩 料理の材料", role: "User オブジェクト", file: "domain/User.java", desc: "システムを流れる「もの」" },
  { restaurant: "🛡 入口の警備員", role: "Spring Security", file: "config/SecurityConfig.java", desc: "認証してない客は入れない" },
];

const flowSteps = [
  { n: 1, actor: "🌐 ブラウザ", action: "URL を叩く / フォーム送信", detail: "GET /user-info をサーバに送る" },
  { n: 2, actor: "🛡 Spring Security", action: "認証済みか確認", detail: "OK なら通す (未認証なら /login へリダイレクト)" },
  { n: 3, actor: "🎯 DispatcherServlet", action: "どの Controller に渡す?", detail: "URL とアノテーションを見て振り分け" },
  { n: 4, actor: "🎨 Controller", action: "受け取って Service を呼ぶ", detail: "userService.findById(id) を実行" },
  { n: 5, actor: "⚙️ Service", action: "業務ロジック実行 + Mapper を呼ぶ", detail: "userMapper.findById(id) を実行" },
  { n: 6, actor: "💾 Mapper", action: "XML の SQL を発行", detail: "SELECT * FROM users WHERE id = ?" },
  { n: 7, actor: "❄ DB", action: "結果を返す", detail: "1 行のレコードが Mapper に戻る" },
  { n: 8, actor: "💾 → ⚙️ → 🎨", action: "戻り値が Controller まで返る", detail: "User オブジェクトが階層を逆流" },
  { n: 9, actor: "🎨 Controller", action: "Model に詰めて View 名を返す", detail: 'model.addAttribute + return "userInfo"' },
  { n: 10, actor: "🖼 View (JSP)", action: "Model の中身を HTML に埋める", detail: "${user.id} → u001, ${user.role} → 部長 …" },
  { n: 11, actor: "🌐 ブラウザ", action: "HTML を受け取り画面に描画", detail: "お客さんが画面を見る" },
];

const faqs = [
  {
    q: "Controller → どこにいくの?",
    a: "Controller は「勝手にどこかに行く」わけではありません。Controller のメソッドの中で書いてあるコードが上から順に実行されます。例えば `userService.findById(id)` という行があれば、そこで Service に処理が移ります。最後の `return \"userInfo\";` は「userInfo.jsp に行け」という指示です。",
  },
  {
    q: "class って結局何?",
    a: "「もの」の設計図です。たとえば「ユーザー」という設計図が User.java。この設計図から実際の「u001 さん」「u002 さん」を作れる (これをオブジェクトと呼ぶ)。設計図に「フィールド (持ってるデータ)」と「メソッド (できる動作)」を書きます。",
  },
  {
    q: "@Controller とか @Service って何?",
    a: "「アノテーション」と呼ばれる Java のラベルです。「この class はウェイターだよ」「これはシェフだよ」と Spring に教えるための貼り紙。Spring は起動時に貼り紙のあるクラスを集めて管理下に置きます (これを DI コンテナ と呼ぶ)。",
  },
  {
    q: "DI とか Bean って何?",
    a: "DI = Dependency Injection = 依存性注入。「Controller が Service を使いたい」時、自分で `new UserService()` するのでなく、Spring が「はい、これ使って」と渡してくれる仕組み。Spring が管理しているオブジェクトを Bean と呼びます。慣れないうちは「Spring が用意して渡してくれる」だけ覚えれば OK。",
  },
  {
    q: "なぜ Service を挟むの? Controller から直接 Mapper 呼べば?",
    a: "動きます。でも: (1) 業務ロジック (「役職が空なら全件検索」等) を書く場所が要る、(2) 複数の Mapper を跨ぐ処理をまとめる、(3) トランザクション境界を分かりやすく、(4) テストしやすい (Service だけ単独テストできる)。だから 3 層に分けるのが定石。",
  },
  {
    q: "JSP って何? HTML と何が違うの?",
    a: "JSP = Java Server Pages = 「サーバで Java の力を借りて HTML を組み立てるテンプレート」。`${user.id}` みたいな部分がサーバで「u001」に置き換わってから、ブラウザに HTML として送られます。ブラウザは JSP を見ることはできない (組み立て済みの HTML しか受け取らない)。",
  },
  {
    q: "GET と POST の違いは?",
    a: "どちらも HTTP リクエストの種類。GET = 「見たいだけ」「取ってくるだけ」(検索、画面表示)。POST = 「サーバの状態を変える」(更新、削除、新規登録)。GET はブラウザリロードで何度実行されても安全、POST はリロードで二重更新の危険があるので `redirect:` で GET に切り替える (これが PRG パターン)。",
  },
  {
    q: "CSRF って何?",
    a: "「他のサイトから勝手にあなたのアカウントで送信させる」攻撃を防ぐための合言葉。フォームに hidden で埋め込み、POST 送信時にサーバが照合。合言葉がない POST は Spring Security が 403 で拒否します。",
  },
  {
    q: "セッションって何?",
    a: "「お客さんがお店にいる間、その人だけの情報を保持する箱」。ログイン中のユーザ ID などをここに入れておく。ブラウザを閉じるかタイムアウトで消える。Cookie の JSESSIONID がセッションを識別する鍵。",
  },
  {
    q: "MyBatis と JPA/Hibernate の違いは?",
    a: "どちらも SQL とオブジェクトのブリッジ。JPA は「SQL を書かない、自動生成」。MyBatis は「SQL を自分で書く、細かく制御できる」。Terasoluna は MyBatis を採用。日本のSIer現場で「SQL を人間が見えるところに置きたい」ニーズが強いのが理由。",
  },
];

export default function PrefacePage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              まず最初に読むページ
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              Web アプリって
              <br className="md:hidden" />
              何をしてるの?
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              「Controller → どこに行くの?」がわからないレベルからでも読めるように、
              <strong>レストラン</strong>に例えて全体像を掴みます。
              このページを読むだけで、後輩に「そもそも Web アプリって何を繰り返してるの?」を説明できるようになります。
            </p>
          </div>

          {/* Section: Metaphor */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              1. アプリはただの「レストラン」
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6">
              <p className="text-slate-700 leading-relaxed">
                Web アプリケーションがしていることは、実は<strong>「お客さんが来て、注文して、料理を食べて、帰る」の繰り返し</strong>だけ。
                難しい単語を全部レストランに置き換えると、驚くほど単純です。
              </p>
              <ol className="mt-4 space-y-2 text-slate-700 list-decimal pl-6">
                <li>お客さん (= <strong>ブラウザ</strong>) がお店 (= <strong>サーバ</strong>) にやってくる</li>
                <li>お客さんが注文する (= <strong>URL を叩く / フォームを送信する</strong>)</li>
                <li>ウェイター (= <strong>Controller</strong>) が注文票を受け取る</li>
                <li>ウェイターがシェフ (= <strong>Service</strong>) に伝える</li>
                <li>シェフが倉庫係 (= <strong>Mapper</strong>) から材料を出させる</li>
                <li>倉庫係が冷蔵庫 (= <strong>DB</strong>) から材料を取ってくる</li>
                <li>シェフが料理を作る (= <strong>業務ロジック処理</strong>)</li>
                <li>ウェイターがお皿 (= <strong>JSP</strong>) に盛り付けてお客に出す</li>
                <li>お客が食べる (= <strong>ブラウザで画面を見る</strong>)</li>
              </ol>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                「難しい単語」に見えるだけで、やってることはこれだけ。
                Spring, MyBatis, JSP …これら全部、上の 9 ステップのどこかに配置されているだけです。
              </p>
            </div>
          </section>

          {/* Section: Role Table */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              2. 対応表 (この対応をまず頭に入れる)
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      レストラン
                    </th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200">
                      このアプリ
                    </th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200 hidden md:table-cell">
                      役割
                    </th>
                    <th className="px-3 md:px-4 py-3 font-semibold text-slate-700 border-b border-slate-200 hidden md:table-cell">
                      ファイル
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roleTable.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-3 md:px-4 py-3">{r.restaurant}</td>
                      <td className="px-3 md:px-4 py-3 font-semibold text-slate-900">
                        {r.role}
                      </td>
                      <td className="px-3 md:px-4 py-3 text-slate-600 hidden md:table-cell">
                        {r.desc}
                      </td>
                      <td className="px-3 md:px-4 py-3 font-mono text-xs text-slate-500 hidden md:table-cell">
                        {r.file}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              (スマホでは詳細列を省略。詳しくは <Link href="/architecture" className="text-brand hover:underline">アーキテクチャ全体図</Link> を参照)
            </p>
          </section>

          {/* Section: Flow — the answer to "Controller → doko?" */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">
              3. 「Controller → どこにいくの?」の答え
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              Controller は<strong>勝手にどこかに行くわけではない</strong>。
              Controller のメソッドの中で書いてあるコードが、上から順番に実行されるだけ。
              下の 11 ステップを追えば、1 回のリクエストが完結するまでの流れが全部見えます。
            </p>

            <div className="bg-white rounded-xl border border-slate-200 p-1 md:p-4">
              <ol className="space-y-1">
                {flowSteps.map((step) => (
                  <li
                    key={step.n}
                    className="flex gap-3 p-3 md:p-4 rounded-lg hover:bg-slate-50"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-brand text-white font-bold flex items-center justify-center text-sm">
                      {step.n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-semibold text-slate-900">
                          {step.actor}
                        </span>
                        <span className="text-slate-700 text-sm">
                          {step.action}
                        </span>
                      </div>
                      <div className="mt-1 text-xs md:text-sm text-slate-500 font-mono">
                        {step.detail}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-bold text-amber-900 mb-2">💡 教えるコツ</h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                「Controller の中で <code>userService.findById(id)</code> って書いてあるでしょ?
                この行が実行された瞬間に、Service に処理が飛ぶんだよ」と言えば伝わります。
                <br />
                Controller が「自動的に何かに行く」のではなく、<strong>Controller のコードが Service を呼ぶ</strong>、
                という理解に持っていくのがゴール。
              </p>
            </div>
          </section>

          {/* Section: Code walkthrough */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              4. 実物のコードで追う (Step 10 の view メソッド)
            </h2>
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 md:p-6 overflow-x-auto text-sm">
              <pre className="font-mono leading-relaxed">
{`@GetMapping("/user-info")              // ← ここに来ると呼ばれる
public String view(Principal principal, Model model) {

    String id = principal.getName();   // ログインユーザの ID を取り出す
                                        //   ↑ Spring Security が用意した Principal

    User user = userService.findById(id);
    //          ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ ここで Service に「行く」

    model.addAttribute("loginId", id); // JSP に見せたい値を Model に詰める
    model.addAttribute("user", user);

    return "userInfo";                  // ← ここで JSP に「行く」
    //     userInfo.jsp を実行しろ、と Spring MVC に指示
}`}
              </pre>
            </div>

            <p className="mt-4 text-slate-700 leading-relaxed">
              このあと <code className="text-brand-dark bg-slate-100 rounded px-1.5 py-0.5 text-sm">userInfo.jsp</code> が実行されます:
            </p>

            <div className="mt-3 bg-slate-900 text-slate-100 rounded-xl p-4 md:p-6 overflow-x-auto text-sm">
              <pre className="font-mono leading-relaxed">
{`<p>ID: \${user.id}</p>       <!-- Model に addAttribute した user から取り出して埋め込み -->
<p>役職: \${user.role}</p>   <!-- サーバ側で "部長" に置き換わってからブラウザに送られる -->`}
              </pre>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              5. よくある「そもそも」の疑問
            </h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 open:shadow-sm"
                >
                  <summary className="cursor-pointer p-4 md:p-5 font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">
                    Q{i + 1}. {f.q}
                  </summary>
                  <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm md:text-base text-slate-700 leading-relaxed">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Next */}
          <section className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
              このあとどこへ
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <NextCard
                href="/architecture"
                emoji="🏛"
                label="ARCHITECTURE"
                title="アーキテクチャ全体図"
                desc="全部品を1枚で見る。どのファイルがどの層かをここで押さえる"
              />
              <NextCard
                href="/glossary"
                emoji="📖"
                label="GLOSSARY"
                title="用語集"
                desc="Controller / Service / Bean / DI / …分からない単語をここで引く"
              />
              <NextCard
                href="/steps/01-project-skeleton"
                emoji="🚀"
                label="START"
                title="Step 01 から始める"
                desc="順番に組み立てる。1つ完了するごとに動かして確認"
              />
              <NextCard
                href="/playground"
                emoji="🕹"
                label="TRY"
                title="触ってみるデモ"
                desc="STS を起動しなくてもログイン・検索・変更を体験できる"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function NextCard({
  href,
  emoji,
  label,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  label: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-brand hover:shadow-sm transition-all"
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </div>
      <div className="text-base md:text-lg font-bold mt-1 text-slate-900">
        {title}
      </div>
      <div className="text-sm text-slate-600 mt-1 leading-relaxed">{desc}</div>
    </Link>
  );
}
