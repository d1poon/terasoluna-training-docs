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

  // Build / Maven
  maven: {
    term: "Maven",
    short: "Java 用のビルドツール + 依存管理システム",
    detail: "コンパイル・テスト・jar 作成・依存ライブラリ取得を自動化する。pom.xml に「使うライブラリ」を書くだけで、Maven Central から自動 DL してくれる。TERASOLUNA / Spring Boot どちらも Maven ベース。",
    href: "/glossary#cat-build",
  },
  pom: {
    term: "pom.xml",
    short: "Maven プロジェクトの設計書",
    detail: "「このプロジェクトが使うライブラリ (dependencies)」「Java のバージョン」「作る jar/war の名前」を書く。Maven はこれを読んで動く。build-order の 1 番目のファイル。",
    href: "/glossary#cat-build",
    color: "amber",
  },
  applicationProperties: {
    term: "application.properties",
    short: "TERASOLUNA では汎用プロパティ置換用ファイル",
    detail: "TERASOLUNA では spring-mvc.xml の <context:property-placeholder> から読み込まれる汎用プロパティ置換用ファイル (中身はコメント 1 行のみが標準)。server.port や spring.datasource.* は持たず、DB 接続情報は -env モジュールの demo-infra.properties という別ファイルにある。(Spring Boot 単一版では server.port=8080 などを書く設定ファイルで、application-dev.properties 等でプロファイル切替できる。)",
    href: "/glossary#cat-build",
  },

  // Spring
  springBoot: {
    term: "Spring Boot",
    short: "Spring を「設定ほぼ無しで」使えるようにしたもの",
    detail: "生の Spring は XML 設定が大量に必要だったが、Spring Boot は「デフォルトで動く」構成を最初から持っている。主軸の TERASOLUNA 5.11.0.RELEASE は BOM 経由で Spring Boot 4.0.2 を使う (設定は XML)。補助の Boot 版は 3.4 の単一プロジェクト。正確な値は /versions を参照。",
    href: "/glossary#cat-spring",
  },
  springBootApp: {
    term: "@SpringBootApplication",
    short: "「ここがアプリの入口」の目印 + 自動設定 ON",
    detail: "main メソッドを持つクラスに付ける。実質「@Configuration + @EnableAutoConfiguration + @ComponentScan」の合体。このアノテーションが付いた class があるパッケージ配下を Spring が全部走査する。",
    href: "/glossary#cat-spring",
  },

  // Spring MVC (追加)
  getMapping: {
    term: "@GetMapping",
    short: "GET リクエストを受け付ける URL の宣言",
    detail: "@GetMapping(\"/users\") と Controller のメソッドに付けると、GET /users がこのメソッドに来る。画面表示・検索・データ取得に使う。",
    href: "/glossary#cat-spring-mvc",
    color: "blue",
  },
  postMapping: {
    term: "@PostMapping",
    short: "POST リクエストを受け付ける URL の宣言",
    detail: "@PostMapping(\"/users/update\") で POST /users/update を担当。フォーム送信・登録・更新に使う。処理後は redirect:/xxx を返す (PRG パターン)。",
    href: "/glossary#cat-spring-mvc",
    color: "blue",
  },
  modelAttribute: {
    term: "@ModelAttribute",
    short: "フォーム送信された値をオブジェクトにまとめて受け取る",
    detail: "@PostMapping のメソッド引数に @ModelAttribute UserForm form と書くと、フォームの name=id / name=role が form.id / form.role に自動で入る。1 つ 1 つ @RequestParam で受けなくて済む (フォームバインディング)。",
    href: "/glossary#cat-spring-mvc",
  },
  validation: {
    term: "Validation (@Valid + BindingResult)",
    short: "フォーム入力チェックの3点セット",
    detail: "Form クラスに @NotBlank @Size 等 → Controller で @Valid @ModelAttribute Form form, BindingResult result と書く → result.hasErrors() でエラー時分岐、JSP は <form:errors path=\"xxx\"/> で表示。",
    href: "/glossary#cat-spring-mvc",
  },
  controllerAdvice: {
    term: "@ControllerAdvice",
    short: "全 Controller 共通の例外処理を1箇所に集める",
    detail: "@ControllerAdvice public class GlobalErrorHandler { @ExceptionHandler(...) } と書くと、どの Controller から出た例外もここに集まる。エラーページに飛ばす・ログ出す・共通処理を書く場所。",
    href: "/glossary#cat-spring-mvc",
    color: "rose",
  },

  // Java (追加)
  exception: {
    term: "Exception (例外)",
    short: "処理途中で起きたエラーを表すオブジェクト",
    detail: "NullPointerException / IOException / RuntimeException など。「異常事態が起きた」ことを呼び出し元に伝える仕組み。何もしないとスタックトレースが出て止まる。",
    href: "/glossary#cat-java",
  },
  tryCatch: {
    term: "try-catch",
    short: "例外を捕まえて処理する構文",
    detail: "try { 危険な処理 } catch (SomeException e) { エラー時の処理 } の形。DB 接続や File I/O のように「失敗しうる処理」を包む。Spring の場合、Web レイヤでは @ControllerAdvice で一括処理する方が多い。",
    href: "/glossary#cat-java",
  },
};
