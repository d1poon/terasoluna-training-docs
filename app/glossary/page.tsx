import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export const metadata = { title: "用語集 | TERASOLUNA 研修" };

type Term = {
  term: string;
  category: string;
  short: string;
  detail: string;
  link?: { label: string; href: string };
};

const TERMS: Term[] = [
  // Java 基礎
  {
    term: "class (クラス)",
    category: "Java",
    short: "「もの」の設計図",
    detail: "たとえば User という設計図 (User.java) から「u001 さん」「u002 さん」という実物を作る。設計図に「フィールド (持ってるデータ)」と「メソッド (できる動作)」を書く。",
    link: { label: "Step 03 で解説", href: "/steps/03-user-domain" },
  },
  {
    term: "オブジェクト / インスタンス",
    category: "Java",
    short: "class から作った実物",
    detail: "User という class があるとき、new User() で作った実際の一個一個がオブジェクト。設計図 (class) → 実物 (object) の関係。",
  },
  {
    term: "メソッド",
    category: "Java",
    short: "class の中の「動作」",
    detail: "getId() setRole(...) など、class ができる 1 つの動作。関数のようなもの。",
  },
  {
    term: "フィールド (メンバ変数)",
    category: "Java",
    short: "class が持っている「データ」",
    detail: "private String id; など。オブジェクトが状態として保持する値。",
  },
  {
    term: "package (パッケージ)",
    category: "Java",
    short: "ファイルの住所",
    detail: "com.example.rolemgr.domain のように、フォルダ階層に対応する。同じ名前の class があってもパッケージが違えば別物として扱える。",
  },
  {
    term: "import",
    category: "Java",
    short: "他のクラスを短い名前で呼ぶ許可",
    detail: "java.util.List; を import すると、以降 List<User> と書ける。無いと java.util.List<User> と書く必要がある。",
  },
  {
    term: "private / public",
    category: "Java",
    short: "誰から見えるかの範囲",
    detail: "public = 全世界から見える。private = 同じ class の中だけ。フィールドは private が原則、メソッドは公開の必要があれば public。",
  },
  {
    term: "アノテーション (@)",
    category: "Java / Spring",
    short: "Java コードに貼るラベル",
    detail: "@Controller @Service @Component など。Spring はこのラベルを見て「これはコントローラー」「これはサービス」と判断する。",
  },

  // Spring / DI
  {
    term: "Bean",
    category: "Spring",
    short: "Spring 管理下のオブジェクト",
    detail: "@Controller や @Service を付けたクラスは、起動時に Spring が「Bean」として管理する。慣れないうちは「Spring が知ってて渡してくれるオブジェクト」と思えば OK。",
  },
  {
    term: "DI (Dependency Injection / 依存性注入)",
    category: "Spring",
    short: "「必要な部品を Spring が用意して渡してくれる」仕組み",
    detail: "Controller が Service を使いたいとき、自分で new しない。コンストラクタの引数に書いておくと Spring が渡してくれる。差し替えやテストが楽になる。",
  },
  {
    term: "コンポーネントスキャン",
    category: "Spring",
    short: "Spring 起動時に @Controller などを探す機能",
    detail: "@SpringBootApplication があるパッケージ配下を全部走査して、Bean として登録する。だからパッケージ構成が大事。",
  },
  {
    term: "@Autowired",
    category: "Spring",
    short: "「ここに Bean を注入して」の目印",
    detail: "コンストラクタが 1 つだけなら省略可能 (Spring 4.3+)。このガイドは省略スタイル。",
  },

  // Web / HTTP
  {
    term: "HTTP",
    category: "Web",
    short: "Web の通信規約",
    detail: "ブラウザとサーバがやり取りする言葉。「GET /foo でこのページください」「200 OK ここに HTML」みたいなやり取りが 1 リクエストの単位。",
  },
  {
    term: "リクエスト / レスポンス",
    category: "Web",
    short: "「注文」と「返答」",
    detail: "ブラウザからサーバへの投げが「リクエスト」、サーバから返ってくるのが「レスポンス」。1 回の画面遷移で 1 対の request/response が飛ぶ。",
  },
  {
    term: "GET",
    category: "Web",
    short: "「見たいだけ」「取ってくるだけ」のリクエスト",
    detail: "検索、画面表示など。何度実行しても副作用がないのが前提。URL のクエリパラメータ (?role=部長) はここに乗る。",
  },
  {
    term: "POST",
    category: "Web",
    short: "「サーバの状態を変える」リクエスト",
    detail: "登録、更新、削除など。body にデータを詰めて送る。ブラウザリロードで再送信 → 二重更新の危険があるため、PRG パターンで受ける。",
  },
  {
    term: "リダイレクト (302)",
    category: "Web",
    short: "「別 URL に行き直して」の返答",
    detail: "サーバが「別のところ行って」と Location ヘッダで指示、ブラウザが自動でその URL に GET を投げ直す。PRG パターンで使う。",
  },
  {
    term: "セッション",
    category: "Web",
    short: "客が来店してから帰るまで保持する箱",
    detail: "ログイン状態やその人だけの一時データを入れておく。Cookie の JSESSIONID がその鍵。ブラウザを閉じるかタイムアウトで消える。",
  },
  {
    term: "Cookie",
    category: "Web",
    short: "サーバとブラウザ間で共有する小さなデータ",
    detail: "ブラウザに保存され、以降のリクエスト全部に自動で付いていく。セッション ID などの識別子を保持する。",
  },
  {
    term: "CSRF",
    category: "Security",
    short: "他サイトから勝手に送信させる攻撃を防ぐ合言葉",
    detail: "フォームに hidden で埋め込み、POST 時にサーバが照合。合言葉なしの POST は Spring Security が 403 で弾く。",
  },
  {
    term: "認証 (Authentication)",
    category: "Security",
    short: "「あなた誰?」を確認する",
    detail: "ID/PW を突き合わせて、その人が本人かを判定。Spring Security が Filter で先に処理してくれる。",
  },
  {
    term: "認可 (Authorization)",
    category: "Security",
    short: "「あなた何していい?」を判定する",
    detail: "認証済みユーザが「この URL 開いていい?」「この操作していい?」の判定。ロール (ROLE_ADMIN 等) 単位で制御する。",
  },
  {
    term: "BCrypt",
    category: "Security",
    short: "パスワードを一方向にハッシュ化するアルゴリズム",
    detail: "DB には元のパスワードを保存しない。BCrypt でハッシュ化して保存し、ログイン時は「入力を同じ方式でハッシュ化して照合」。ソルト付きで実行のたびに値が変わる。",
  },

  // Spring MVC
  {
    term: "Controller",
    category: "Spring MVC",
    short: "リクエストを受けて処理を振り分ける層",
    detail: "@Controller アノテーション + @GetMapping/@PostMapping でどの URL を担当するか宣言。中で Service を呼び、最後に View 名を返す。",
  },
  {
    term: "Service",
    category: "Spring MVC",
    short: "業務ロジックの層",
    detail: "@Service アノテーション。Controller から呼ばれ、必要なら Mapper を呼ぶ。@Transactional でトランザクション境界を宣言。",
  },
  {
    term: "Repository / Mapper",
    category: "Spring MVC",
    short: "DB とやり取りする層 (SQL 発行係)",
    detail: "MyBatis の場合は @Mapper インターフェース + XML の SQL 集。JPA の場合は @Repository インターフェース。このガイドは MyBatis を採用。",
  },
  {
    term: "Model",
    category: "Spring MVC",
    short: "Controller が JSP に渡す「箱」",
    detail: "model.addAttribute(\"key\", value) で詰めると、JSP から ${key} で取り出せる。「View に見せたい値を積み込む荷台」。",
  },
  {
    term: "View",
    category: "Spring MVC",
    short: "画面の設計図 (JSP など)",
    detail: "Controller が return \"userInfo\" すると、Spring MVC が /WEB-INF/views/userInfo.jsp を実行して HTML を生成し、ブラウザに送る。",
  },
  {
    term: "DispatcherServlet",
    category: "Spring MVC",
    short: "リクエストの振り分け係",
    detail: "全リクエストの入口。URL とアノテーションを見て、どの Controller のメソッドを呼ぶか決める。Spring Boot が自動で用意してくれる。",
  },
  {
    term: "@RequestParam",
    category: "Spring MVC",
    short: "URL のクエリ (?role=xxx) を受け取る",
    detail: "@RequestParam String role とメソッドの引数に書くと、?role=部長 の 部長 が入る。required=false で「無くても OK」。",
  },
  {
    term: "Principal",
    category: "Spring Security",
    short: "「今ログインしている人」を表すオブジェクト",
    detail: "Controller のメソッド引数に Principal principal と書くと、Spring Security が「今の認証情報」を渡してくれる。principal.getName() でユーザ ID が取れる。",
  },

  // JSP
  {
    term: "JSP",
    category: "View",
    short: "サーバで HTML を組み立てるテンプレート",
    detail: "拡張子 .jsp。HTML + JSTL タグ + EL 式 で書く。サーバ内で処理されてから、純粋な HTML としてブラウザに送られる。",
  },
  {
    term: "EL 式 (${xxx})",
    category: "View",
    short: "サーバ側の変数を JSP に埋め込む記法",
    detail: "${user.role} は「user オブジェクトの getRole() を呼び出して結果を埋め込む」の意味。Model に addAttribute した値がここから見える。",
  },
  {
    term: "JSTL (<c:if> など)",
    category: "View",
    short: "JSP 用のタグライブラリ (条件分岐・繰り返し)",
    detail: "<c:if> <c:forEach> <c:choose> など。<%@ taglib prefix=\"c\" uri=\"jakarta.tags.core\" %> で有効化。",
  },

  // MyBatis
  {
    term: "MyBatis Mapper",
    category: "MyBatis",
    short: "Java の interface + XML の SQL の組",
    detail: "interface (メソッド定義) と XML (SQL 実体) を namespace = 完全修飾クラス名 で紐付ける。MyBatis が実行時に interface の実装を自動生成する。",
  },
  {
    term: "#{xxx} と ${xxx} (MyBatis XML)",
    category: "MyBatis",
    short: "パラメータ埋め込みの 2 種類",
    detail: "#{xxx} は PreparedStatement のプレースホルダ (安全)。${xxx} は文字列連結 (SQL インジェクション危険)。99% は #{xxx} を使う。",
  },
  {
    term: "@Transactional",
    category: "MyBatis / Spring",
    short: "トランザクション境界の宣言",
    detail: "メソッド開始時にトランザクション開始、正常終了で commit、例外で rollback。Service に付けるのが定石。readOnly = true で参照専用の最適化。",
  },

  // PRG etc
  {
    term: "PRG (Post-Redirect-Get) パターン",
    category: "Pattern",
    short: "更新後にリダイレクトして GET に戻すイディオム",
    detail: "更新 POST → サーバが redirect:/xxx を返す → ブラウザが自動で GET /xxx → 画面表示。この結果ブラウザリロードでの二重更新が起きない。",
    link: { label: "Step 11 で解説", href: "/steps/11-edit" },
  },
  {
    term: "IDOR (Insecure Direct Object Reference)",
    category: "Security",
    short: "URL の ID を書き換えて他人情報を盗む攻撃",
    detail: "?userId=u001 みたいに URL に ID がある場合、u001 → u002 に書き換えると他人が見えてしまう。対策: サーバ側で Principal からユーザ ID を確定する。",
  },
];

const CATEGORIES = ["Java", "Spring", "Spring MVC", "Spring Security", "MyBatis", "Web", "Security", "View", "Pattern"] as const;

export default function GlossaryPage() {
  const steps = getAllSteps();

  return (
    <div className="md:flex md:max-w-[80rem] md:mx-auto">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-12 md:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              分からない単語を引くところ
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              用語集
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              このアプリを組む上で出てくる用語を、1 行の意味 + 詳しい説明で並べています。
              Step ページを読みながら「これ何?」と思ったらここで確認してください。
            </p>
          </div>

          {/* Category chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <a
                key={cat}
                href={`#cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                className="inline-block px-3 py-1 text-xs md:text-sm bg-white border border-slate-200 rounded-full text-slate-700 hover:border-brand hover:text-brand transition-colors"
              >
                {cat}
              </a>
            ))}
          </div>

          {/* Grouped terms */}
          {CATEGORIES.map((cat) => {
            const items = TERMS.filter((t) => t.category === cat);
            if (items.length === 0) return null;
            return (
              <section
                key={cat}
                id={`cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                className="mb-10 scroll-mt-6"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-slate-900">
                  {cat}
                </h2>
                <div className="space-y-3">
                  {items.map((t, i) => (
                    <details
                      key={i}
                      className="bg-white rounded-xl border border-slate-200 open:shadow-sm"
                    >
                      <summary className="cursor-pointer p-4 hover:bg-slate-50 rounded-xl">
                        <div className="inline-flex flex-wrap items-baseline gap-x-3">
                          <span className="font-bold text-slate-900">
                            {t.term}
                          </span>
                          <span className="text-slate-600 text-sm">
                            — {t.short}
                          </span>
                        </div>
                      </summary>
                      <div className="px-4 pb-4 text-sm md:text-base text-slate-700 leading-relaxed">
                        {t.detail}
                        {t.link && (
                          <div className="mt-2">
                            <Link
                              href={t.link.href}
                              className="text-brand hover:underline text-sm"
                            >
                              → {t.link.label}
                            </Link>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}

          <div className="mt-10 pt-6 border-t border-slate-200 text-sm text-slate-600 text-center">
            まだ足りない用語があれば、Vault の <code>terasoluna-glossary.md</code> に追記してください
          </div>
        </main>
      </div>
    </div>
  );
}
