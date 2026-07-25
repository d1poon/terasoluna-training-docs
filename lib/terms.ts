/**
 * 用語辞書 — <T term="controller" /> でポップオーバー表示に使う。
 * 用語集ページ (/glossary) の内容と揃える。
 */
export type TermInfo = {
  term: string;
  short: string;         // 1 行の意味
  detail: string;        // 少し詳しい説明
  href?: string;         // 用語集の該当セクションへ (詳しくはこちら)
  color?: string;        // アクセントカラー
};

export const TERMS: Record<string, TermInfo> = {
  // Java
  class: {
    term: "class",
    short: "「もの」の設計図",
    detail: "たとえば User という設計図 (User.java) から「u001 さん」「u002 さん」の実物 (オブジェクト) が作れる。フィールド (持ってるデータ) とメソッド (できる動作) を書く。",
    href: "/glossary#cat-java",
  },
  object: {
    term: "オブジェクト / インスタンス",
    short: "class から作った実物",
    detail: "new User() で作った実際の一個一個がオブジェクト。設計図 (class) → 実物 (object) の関係。",
    href: "/glossary#cat-java",
  },
  method: {
    term: "メソッド",
    short: "class の中の動作",
    detail: "getId() setRole(...) など、class ができる 1 つの動作。関数のようなもの。",
    href: "/glossary#cat-java",
  },
  field: {
    term: "フィールド",
    short: "class が持っているデータ",
    detail: "private String id; など。オブジェクトが状態として保持する値。メンバ変数とも言う。",
    href: "/glossary#cat-java",
  },
  package: {
    term: "package",
    short: "ファイルの住所",
    detail: "com.example.rolemgr.domain のように、フォルダ階層に対応する。同じ名前の class があってもパッケージが違えば別物として扱える。",
    href: "/glossary#cat-java",
  },
  annotation: {
    term: "アノテーション (@)",
    short: "Java コードに貼るラベル",
    detail: "@Controller @Service @Component など。Spring はこのラベルを見て「これはコントローラー」「これはサービス」と判断する。",
    href: "/glossary#cat-java",
  },
  private: {
    term: "private",
    short: "同じ class 内だけ見える修飾子",
    detail: "外から user.id = null; のように直接書き換えられないよう、フィールドは private にして getter/setter 経由に強制する (カプセル化)。",
    href: "/glossary#cat-java",
  },

  // Spring
  bean: {
    term: "Bean",
    short: "Spring 管理下のオブジェクト",
    detail: "@Controller や @Service を付けたクラスは、起動時に Spring が「Bean」として管理する。慣れないうちは「Spring が知ってて渡してくれるオブジェクト」と思えば OK。",
    href: "/glossary#cat-spring",
    color: "brand",
  },
  di: {
    term: "DI (Dependency Injection / 依存性注入)",
    short: "「必要な部品を Spring が用意して渡してくれる」仕組み",
    detail: "Controller が Service を使いたいとき、自分で new しない。コンストラクタの引数に書いておくと Spring が渡してくれる。差し替えやテストが楽になる。",
    href: "/glossary#cat-spring",
    color: "brand",
  },

  // Spring MVC
  controller: {
    term: "Controller",
    short: "リクエストを受けて処理を振り分ける層",
    detail: "@Controller アノテーション + @GetMapping/@PostMapping でどの URL を担当するか宣言。中で Service を呼び、最後に View 名を返す。「ウェイター」役。",
    href: "/glossary#cat-spring-mvc",
    color: "blue",
  },
  service: {
    term: "Service",
    short: "業務ロジックの層",
    detail: "@Service アノテーション。Controller から呼ばれ、必要なら Mapper を呼ぶ。@Transactional でトランザクション境界を宣言。「シェフ」役。",
    href: "/glossary#cat-spring-mvc",
    color: "emerald",
  },
  repository: {
    term: "Repository / Mapper",
    short: "DB とやり取りする層 (SQL 発行係)",
    detail: "MyBatis の場合は @Mapper インターフェース + XML の SQL 集。「倉庫係」役。DB とだけやり取りする関心事の分離。",
    href: "/glossary#cat-spring-mvc",
    color: "cyan",
  },
  model: {
    term: "Model",
    short: "Controller が JSP に渡す「箱」",
    detail: "model.addAttribute(\"key\", value) で詰めると、JSP から ${key} で取り出せる。「View に見せたい値を積み込む荷台」。",
    href: "/glossary#cat-spring-mvc",
  },
  view: {
    term: "View",
    short: "画面の設計図 (JSP など)",
    detail: "Controller が return \"userInfo\" すると、Spring MVC が /WEB-INF/views/userInfo.jsp を実行して HTML を生成し、ブラウザに送る。",
    href: "/glossary#cat-spring-mvc",
    color: "indigo",
  },
  principal: {
    term: "Principal",
    short: "今ログインしている人を表すオブジェクト",
    detail: "Controller のメソッド引数に Principal principal と書くと、Spring Security が「今の認証情報」を渡してくれる。principal.getName() でユーザ ID が取れる。",
    href: "/glossary#cat-spring-security",
  },

  // MyBatis
  mapper: {
    term: "MyBatis Mapper",
    short: "Java の interface + XML の SQL の組",
    detail: "interface (メソッド定義) と XML (SQL 実体) を namespace = 完全修飾クラス名 で紐付ける。MyBatis が実行時に interface の実装を自動生成する。",
    href: "/glossary#cat-mybatis",
    color: "cyan",
  },
  transactional: {
    term: "@Transactional",
    short: "トランザクション境界の宣言",
    detail: "メソッド開始時にトランザクション開始、正常終了で commit、例外で rollback。Service に付けるのが定石。readOnly = true で参照専用の最適化。",
    href: "/glossary#cat-mybatis",
  },

  // Web
  http: {
    term: "HTTP",
    short: "Web の通信規約",
    detail: "ブラウザとサーバがやり取りする言葉。「GET /foo でこのページください」「200 OK ここに HTML」みたいなやり取りが 1 リクエストの単位。",
    href: "/glossary#cat-web",
  },
  request: {
    term: "リクエスト",
    short: "ブラウザからサーバへの「注文」",
    detail: "GET /path とか POST /path で、body に値を乗せて送る。1 回の画面遷移で 1 対の request/response が飛ぶ。",
    href: "/glossary#cat-web",
  },
  response: {
    term: "レスポンス",
    short: "サーバからブラウザへの「返答」",
    detail: "ステータスコード (200/302/403/404/500) + ヘッダ + body (HTML等)。ブラウザはこれを受け取って画面を描く。",
    href: "/glossary#cat-web",
  },
  get: {
    term: "GET",
    short: "「見るだけ」「取ってくるだけ」のリクエスト",
    detail: "検索、画面表示など。何度実行しても副作用がないのが前提。URL のクエリパラメータ (?role=部長) はここに乗る。",
    href: "/glossary#cat-web",
  },
  post: {
    term: "POST",
    short: "「サーバの状態を変える」リクエスト",
    detail: "登録、更新、削除など。body にデータを詰めて送る。ブラウザリロードで再送信 → 二重更新の危険があるため、PRG パターンで受ける。",
    href: "/glossary#cat-web",
  },
  session: {
    term: "セッション",
    short: "客が来店してから帰るまで保持する箱",
    detail: "ログイン状態やその人だけの一時データを入れておく。Cookie の JSESSIONID がその鍵。ブラウザを閉じるかタイムアウトで消える。",
    href: "/glossary#cat-web",
  },

  // Security
  csrf: {
    term: "CSRF",
    short: "他サイトから勝手に送信させる攻撃を防ぐ合言葉",
    detail: "フォームに hidden で埋め込み、POST 時にサーバが照合。合言葉なしの POST は Spring Security が 403 で弾く。",
    href: "/glossary#cat-security",
    color: "rose",
  },
  auth: {
    term: "認証 (Authentication)",
    short: "「あなた誰?」を確認する",
    detail: "ID/PW を突き合わせて、その人が本人かを判定。Spring Security が Filter で先に処理してくれる。",
    href: "/glossary#cat-security",
  },
  bcrypt: {
    term: "BCrypt",
    short: "パスワードを一方向にハッシュ化するアルゴリズム",
    detail: "DB には元のパスワードを保存しない。BCrypt でハッシュ化して保存し、ログイン時は「入力を同じ方式でハッシュ化して照合」。ソルト付きで実行のたびに値が変わる。",
    href: "/glossary#cat-security",
  },

  // JSP
  jsp: {
    term: "JSP",
    short: "サーバで HTML を組み立てるテンプレート",
    detail: "拡張子 .jsp。HTML + JSTL タグ + EL 式 で書く。サーバ内で処理されてから、純粋な HTML としてブラウザに送られる。",
    href: "/glossary#cat-view",
    color: "indigo",
  },
  el: {
    term: "EL 式 (${xxx})",
    short: "サーバ側の変数を JSP に埋め込む記法",
    detail: "${user.role} は「user オブジェクトの getRole() を呼び出して結果を埋め込む」の意味。Model に addAttribute した値がここから見える。",
    href: "/glossary#cat-view",
  },
  jstl: {
    term: "JSTL (<c:if> など)",
    short: "JSP 用のタグライブラリ (条件分岐・繰り返し)",
    detail: "<c:if> <c:forEach> <c:choose> など。<%@ taglib prefix=\"c\" uri=\"jakarta.tags.core\" %> で有効化。",
    href: "/glossary#cat-view",
  },

  // Pattern
  prg: {
    term: "PRG (Post-Redirect-Get) パターン",
    short: "更新後にリダイレクトして GET に戻すイディオム",
    detail: "更新 POST → サーバが redirect:/xxx を返す → ブラウザが自動で GET /xxx → 画面表示。この結果ブラウザリロードでの二重更新が起きない。",
    href: "/steps/11-edit",
    color: "amber",
  },

  // DB
  table: {
    term: "テーブル",
    short: "DB のデータの表",
    detail: "Excel の 1 シートに相当。users テーブル、roles テーブル、のような単位。",
    href: "/textbook#ch-db",
  },
  column: {
    term: "カラム (列)",
    short: "テーブルの縦 1 列",
    detail: "「何を保持するか」の項目。users テーブルなら id / password / role の 3 カラム。",
    href: "/textbook#ch-db",
  },
  record: {
    term: "レコード (行)",
    short: "テーブルの横 1 行",
    detail: "1 個のデータの塊。u001 / (hash) / 部長 の 1 行 = 1 レコード。",
    href: "/textbook#ch-db",
  },
  pk: {
    term: "主キー (Primary Key)",
    short: "レコードを一意に特定するカラム",
    detail: "同じ値の行が 2 つあってはいけない。users なら id カラム。",
    href: "/textbook#ch-db",
  },
};
