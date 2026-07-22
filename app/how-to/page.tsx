import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";

export const metadata = { title: "「〜するには?」レシピ集 | TERASOLUNA 研修" };

type CodeBlock = {
  label: string;
  lang: string;
  code: string;
};

type Recipe = {
  n: number;
  q: string;
  a: string;
  where?: string;
  code?: CodeBlock[];
  stepLink?: { label: string; href: string };
  note?: string;
};

type Category = {
  key: string;
  emoji: string;
  name: string;
  desc: string;
  recipes: Recipe[];
};

const CATEGORIES: Category[] = [
  {
    key: "screen",
    emoji: "🖼",
    name: "画面まわり",
    desc: "画面を作る / 遷移する / リンク・ボタン",
    recipes: [
      {
        n: 1,
        q: "画面遷移させるには?",
        a: "3 パターンある: (1) リンク `<a href>` で単純に飛ぶ、(2) フォーム送信で POST + 遷移、(3) Controller で `return \"redirect:/xxx\";` でサーバ側から別 URL に飛ばす。",
        where: "JSP 側 or Controller 側",
        code: [
          {
            label: "① リンクで遷移 (JSP)",
            lang: "jsp",
            code: `<a href="<c:url value='/menu'/>">メニューへ</a>`,
          },
          {
            label: "② フォームで POST 遷移 (JSP)",
            lang: "jsp",
            code: `<form action="<c:url value='/save'/>" method="post">
    <input type="hidden" name="\${_csrf.parameterName}" value="\${_csrf.token}" />
    <input type="text" name="role" />
    <button type="submit">送信</button>
</form>`,
          },
          {
            label: "③ Controller で redirect (Java)",
            lang: "java",
            code: `@PostMapping("/user-info/edit")
public String edit(@RequestParam String role, Principal principal) {
    userService.updateRole(principal.getName(), role);
    return "redirect:/user-info";   // ← ここで別 URL に飛ぶ
}`,
          },
        ],
        stepLink: { label: "Step 11 で PRG パターン", href: "/steps/11-edit" },
      },
      {
        n: 2,
        q: "リンクボタンを作るには?",
        a: "HTML の <code>&lt;a href=\"パス\"&gt;テキスト&lt;/a&gt;</code> を使う。JSP では コンテキストパス込みにするため <code>&lt;c:url&gt;</code> で囲むのが定石。ボタン風にしたければ CSS でスタイル付けか、<code>&lt;a&gt;&lt;button&gt;&lt;/button&gt;&lt;/a&gt;</code> で入れ子。",
        where: "JSP ファイル (webapp/WEB-INF/views/*.jsp)",
        code: [
          {
            label: "普通のリンク",
            lang: "jsp",
            code: `<a href="<c:url value='/menu'/>">メニューへ</a>`,
          },
          {
            label: "ボタン風リンク (見た目はボタン、動作はリンク)",
            lang: "jsp",
            code: `<a href="<c:url value='/user-info/edit'/>">
    <button type="button">変更する</button>
</a>`,
          },
        ],
        note: "<c:url> を使う理由: コンテキストパス (例: /rolemgr) が変わってもリンク切れしない",
      },
      {
        n: 3,
        q: "新しい画面 (URL) を追加するには?",
        a: "3 手順: (1) Controller に <code>@GetMapping(\"/xxx\")</code> のメソッドを追加、(2) <code>/WEB-INF/views/</code> に <code>xxx.jsp</code> を作る、(3) メソッドの <code>return \"xxx\";</code> と JSP のファイル名を合わせる。",
        where: "Controller + JSP を 1 セット",
        code: [
          {
            label: "Controller (SearchController.java の中に追加)",
            lang: "java",
            code: `@GetMapping("/hello")
public String hello(Model model) {
    model.addAttribute("msg", "こんにちは");
    return "hello";   // → /WEB-INF/views/hello.jsp に飛ぶ
}`,
          },
          {
            label: "JSP (src/main/webapp/WEB-INF/views/hello.jsp)",
            lang: "jsp",
            code: `<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>Hello</title></head>
<body>
    <h1>\${msg}</h1>
</body>
</html>`,
          },
        ],
      },
      {
        n: 4,
        q: "画面に変数を出すには?",
        a: "Controller で <code>model.addAttribute(\"name\", 値)</code> でセット → JSP で <code>\${name}</code> で埋め込む。",
        where: "Controller と JSP のペア",
        code: [
          {
            label: "Controller で値をセット",
            lang: "java",
            code: `model.addAttribute("loginId", "u001");
model.addAttribute("user", user);`,
          },
          {
            label: "JSP で表示",
            lang: "jsp",
            code: `<p>ID: \${loginId}</p>
<p>役職: \${user.role}</p>   <!-- user.getRole() が呼ばれる -->`,
          },
        ],
      },
    ],
  },
  {
    key: "layer",
    emoji: "🎯",
    name: "3 層構造まわり",
    desc: "Controller / Service / Mapper それぞれの作り方",
    recipes: [
      {
        n: 5,
        q: "Service を作るには?",
        a: "2 手順: (1) <code>@Service</code> を付けた class を作る、(2) 使いたい Controller のコンストラクタ引数に書く → Spring が自動で渡してくれる (DI)。",
        where: "-domain (TERASOLUNA) or src/main/java/.../service/ (Boot)",
        code: [
          {
            label: "1. Service class を作る",
            lang: "java",
            code: `package com.example.rolemgr.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.rolemgr.domain.User;
import com.example.rolemgr.repository.UserMapper;

@Service
@Transactional
public class UserService {

    private final UserMapper userMapper;

    // コンストラクタ引数 = 使いたい部品を並べる (Spring が渡してくれる)
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public User findById(String id) {
        return userMapper.findById(id);
    }
}`,
          },
          {
            label: "2. Controller から呼ぶ",
            lang: "java",
            code: `@Controller
public class UserInfoController {

    private final UserService userService;   // ← ここに書くだけ

    public UserInfoController(UserService userService) {
        this.userService = userService;      // ← Spring がセットしてくれる
    }

    @GetMapping("/user-info")
    public String view(Principal principal, Model model) {
        User user = userService.findById(principal.getName()); // ← 呼べる
        model.addAttribute("user", user);
        return "userInfo";
    }
}`,
          },
        ],
        stepLink: { label: "Step 05 で解説", href: "/steps/05-service" },
      },
      {
        n: 6,
        q: "Mapper (SQL) を追加するには?",
        a: "2 ファイル: (1) <code>@Mapper</code> interface にメソッド定義を追加、(2) 同名の XML に <code>&lt;select&gt;</code>/<code>&lt;update&gt;</code> を追加。<strong>XML の namespace は interface の完全修飾名</strong>、<strong>id はメソッド名</strong>と一致させる。",
        where: "-domain (TERASOLUNA) or repository/ + resources/mapper/ (Boot)",
        code: [
          {
            label: "1. UserMapper.java にメソッド追加",
            lang: "java",
            code: `@Mapper
public interface UserMapper {
    User findById(@Param("id") String id);
    List<User> findByRole(@Param("role") String role);
    int updateRole(@Param("id") String id, @Param("role") String role);
}`,
          },
          {
            label: "2. UserMapper.xml に SQL 追加",
            lang: "xml",
            code: `<mapper namespace="com.example.rolemgr.repository.UserMapper">
    <select id="findById" resultType="com.example.rolemgr.domain.User">
        SELECT id, password, role FROM users WHERE id = #{id}
    </select>
</mapper>`,
          },
        ],
        note: "#{name} は PreparedStatement のプレースホルダ (安全)。${name} は文字列連結 (危険) — 99% は #{name} を使う",
        stepLink: { label: "Step 04 で解説", href: "/steps/04-mapper" },
      },
      {
        n: 7,
        q: "Controller から DB のデータを取ってくるには? (フル通し)",
        a: "3 層積む: (1) Mapper に findXxx 追加、(2) Service にそれを呼ぶメソッド追加、(3) Controller で Service を呼び、Model にセット、JSP で表示。",
        where: "3 ファイルにまたがる (Mapper / Service / Controller)",
        code: [
          {
            label: "全体像 (1 リクエストの流れ)",
            lang: "java",
            code: `// ① Controller
@GetMapping("/user-info")
public String view(Principal principal, Model model) {
    User user = userService.findById(principal.getName()); // ② Service を呼ぶ
    model.addAttribute("user", user);
    return "userInfo";
}

// ② Service
public User findById(String id) {
    return userMapper.findById(id); // ③ Mapper を呼ぶ
}

// ③ Mapper (interface)
User findById(@Param("id") String id);

// ④ Mapper XML
// <select id="findById" resultType="...User">
//     SELECT * FROM users WHERE id = #{id}
// </select>

// ⑤ JSP で表示
// <p>役職: \${user.role}</p>`,
          },
        ],
      },
    ],
  },
  {
    key: "form",
    emoji: "📝",
    name: "フォーム & 入力",
    desc: "フォーム / 値の受け取り / バリデーション",
    recipes: [
      {
        n: 8,
        q: "フォームを作って値を受け取るには?",
        a: "JSP 側は <code>&lt;form action method&gt;</code> + <code>&lt;input name=\"xxx\"&gt;</code> + CSRF トークン hidden。Controller 側は <code>@RequestParam String xxx</code> で受け取る。",
        code: [
          {
            label: "JSP: フォーム (GET 検索)",
            lang: "jsp",
            code: `<form action="<c:url value='/search'/>" method="get">
    <label>役職:
        <input type="text" name="role" />
    </label>
    <button type="submit">検索</button>
</form>`,
          },
          {
            label: "Controller: 値を受け取る",
            lang: "java",
            code: `@GetMapping("/search")
public String search(@RequestParam(required = false) String role, Model model) {
    // role に <input name="role"> の値が入る
    List<User> results = userService.searchByRole(role);
    model.addAttribute("results", results);
    return "search";
}`,
          },
        ],
        note: "POST の時は CSRF トークン hidden が必須。無いと 403 で弾かれる",
      },
      {
        n: 9,
        q: "リストを繰り返し表示するには?",
        a: "JSTL の <code>&lt;c:forEach var=\"要素\" items=\"\${配列}\"&gt;</code> で繰り返し。",
        code: [
          {
            label: "JSP",
            lang: "jsp",
            code: `<table>
    <thead>
        <tr><th>ID</th><th>役職</th></tr>
    </thead>
    <tbody>
        <c:forEach var="u" items="\${results}">
            <tr>
                <td>\${u.id}</td>
                <td>\${u.role}</td>
            </tr>
        </c:forEach>
    </tbody>
</table>`,
          },
        ],
      },
      {
        n: 10,
        q: "条件で表示を切り替えるには?",
        a: "1 分岐なら <code>&lt;c:if&gt;</code>、if-else や複数分岐なら <code>&lt;c:choose&gt;</code> + <code>&lt;c:when&gt;</code> + <code>&lt;c:otherwise&gt;</code>。",
        code: [
          {
            label: "単純な if",
            lang: "jsp",
            code: `<c:if test="\${not empty errorMessage}">
    <p style="color:red;">\${errorMessage}</p>
</c:if>`,
          },
          {
            label: "if / else if / else",
            lang: "jsp",
            code: `<c:choose>
    <c:when test="\${not empty results}">
        <p>\${fn:length(results)} 件見つかりました</p>
    </c:when>
    <c:otherwise>
        <p>該当なし</p>
    </c:otherwise>
</c:choose>`,
          },
        ],
      },
      {
        n: 11,
        q: "入力チェック (Validation) をするには?",
        a: "TERASOLUNA なら Form クラスに <code>@NotEmpty</code> <code>@Size</code> 等のアノテーションを付け、Controller で <code>@Validated</code> + <code>BindingResult</code> で受け取る。研修レベルではまずは Controller 内で <code>if (role == null || role.isEmpty())</code> でも OK。",
        code: [
          {
            label: "Form クラス (TERASOLUNA スタイル)",
            lang: "java",
            code: `public class UserInfoForm {
    @NotEmpty
    @Size(max = 50)
    private String role;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}`,
          },
          {
            label: "Controller で受ける",
            lang: "java",
            code: `@PostMapping("/user-info/edit")
public String edit(@Validated UserInfoForm form,
                   BindingResult result,
                   Principal principal) {
    if (result.hasErrors()) {
        return "userInfoEdit";   // エラーがあれば戻す
    }
    userService.updateRole(principal.getName(), form.getRole());
    return "redirect:/user-info";
}`,
          },
        ],
      },
    ],
  },
  {
    key: "auth",
    emoji: "🔐",
    name: "認証まわり",
    desc: "ログインユーザ取得 / 保護",
    recipes: [
      {
        n: 12,
        q: "ログイン中のユーザ ID を取るには?",
        a: "Controller メソッドの引数に <code>Principal principal</code> と書く。<code>principal.getName()</code> でユーザ ID (= login 時に入力した ID) が取れる。",
        code: [
          {
            label: "Controller",
            lang: "java",
            code: `@GetMapping("/user-info")
public String view(Principal principal, Model model) {
    String id = principal.getName();   // ← "u001" などが取れる
    User user = userService.findById(id);
    model.addAttribute("user", user);
    return "userInfo";
}`,
          },
        ],
        note: "URL パラメータ (?userId=u001) で受け取ってはダメ。他人 ID に書き換えられて情報漏洩する (IDOR 脆弱性)",
      },
      {
        n: 13,
        q: "「このページはログインしてないと見られない」ようにするには?",
        a: "SecurityConfig で <code>.anyRequest().authenticated()</code>。このリファレンスは既に <code>/login</code> 以外全部認証必須になっている。",
        code: [
          {
            label: "SecurityConfig.java",
            lang: "java",
            code: `.authorizeHttpRequests(auth -> auth
    .requestMatchers("/login", "/css/**", "/WEB-INF/**").permitAll()
    .anyRequest().authenticated()   // ← 上記以外は認証必須
)`,
          },
        ],
        stepLink: { label: "Step 06 で解説", href: "/steps/06-auth-foundation" },
      },
      {
        n: 14,
        q: "パスワードを DB に保存するには?",
        a: "<strong>絶対に平文で保存しない</strong>。BCryptPasswordEncoder でハッシュ化してから保存。ログイン時は「入力パスワードを同じ方式でハッシュ化して照合」。",
        code: [
          {
            label: "ハッシュ化 & 保存",
            lang: "java",
            code: `String hashed = passwordEncoder.encode("password");
// hashed = "$2a$10$..." (60 文字、ソルト付き)

jdbc.update("INSERT INTO users(id, password, role) VALUES (?, ?, ?)",
    "u001", hashed, "部長");`,
          },
        ],
      },
    ],
  },
  {
    key: "routing",
    emoji: "🧭",
    name: "URL & ルーティング",
    desc: "URL を Controller に紐付ける / パラメータ",
    recipes: [
      {
        n: 15,
        q: "新しい URL を Controller に紐付けるには?",
        a: "メソッドに <code>@GetMapping(\"/xxx\")</code> または <code>@PostMapping(\"/xxx\")</code> を付ける。<code>@GetMapping({\"/\", \"/menu\"})</code> のように複数指定も可。",
        code: [
          {
            label: "Controller",
            lang: "java",
            code: `@GetMapping("/hello")           // GET /hello に来る
public String hello() { return "hello"; }

@PostMapping("/save")           // POST /save に来る
public String save() { return "redirect:/menu"; }

@GetMapping({"/", "/menu"})     // GET / と GET /menu の両方
public String menu() { return "menu"; }`,
          },
        ],
      },
      {
        n: 16,
        q: "URL のパラメータを受け取るには?",
        a: "3 パターン: (1) <code>?role=部長</code> = <code>@RequestParam</code>、(2) <code>/users/u001</code> = <code>@PathVariable</code>、(3) フォーム全体 = <code>@ModelAttribute Form</code>。",
        code: [
          {
            label: "クエリパラメータ",
            lang: "java",
            code: `@GetMapping("/search")
public String search(@RequestParam String role) { ... }
// URL: /search?role=部長`,
          },
          {
            label: "パス変数",
            lang: "java",
            code: `@GetMapping("/users/{id}")
public String show(@PathVariable String id) { ... }
// URL: /users/u001 → id = "u001"`,
          },
          {
            label: "フォーム全体",
            lang: "java",
            code: `@PostMapping("/register")
public String register(@ModelAttribute UserForm form) {
    form.getName(); form.getRole(); // フォームの各値
}`,
          },
        ],
      },
      {
        n: 17,
        q: "GET と POST どっちで書くの?",
        a: "<strong>見るだけ / 検索</strong> は GET (URL でブックマークできる、リロードで副作用なし)。<strong>登録・更新・削除</strong> (サーバの状態を変える) は POST。この原則を守るのが Web アプリのお作法。",
        code: [
          {
            label: "GET (検索)",
            lang: "java",
            code: `@GetMapping("/search")   // ✓ ブックマーク可、リロード安全`,
          },
          {
            label: "POST (更新)",
            lang: "java",
            code: `@PostMapping("/user-info/edit")  // ✓ サーバ状態を変える
public String edit(...) {
    userService.updateRole(...);
    return "redirect:/user-info";  // ← POST の後はリダイレクト (PRG)
}`,
          },
        ],
      },
    ],
  },
  {
    key: "misc",
    emoji: "🛠",
    name: "その他 (よくある詰まり)",
    desc: "CSS / エラー診断 / DB",
    recipes: [
      {
        n: 18,
        q: "CSS を当てるには?",
        a: "<code>src/main/webapp/resources/css/</code> に css を置いて、JSP で <code>&lt;link&gt;</code> で読み込む。<code>&lt;c:url&gt;</code> で囲むのを忘れずに。",
        code: [
          {
            label: "JSP",
            lang: "jsp",
            code: `<link rel="stylesheet"
      href="<c:url value='/resources/css/style.css'/>" />`,
          },
        ],
        note: "SecurityConfig の permitAll に /css/** or /resources/** を追加していないと、CSS ファイル自体が認証で弾かれて画面が真っ白になる",
      },
      {
        n: 19,
        q: "H2 コンソールで DB の中身を見るには?",
        a: "<code>http://localhost:8080/h2-console</code> にアクセス。JDBC URL: <code>jdbc:h2:mem:rolemgr</code>、User: <code>sa</code>、Password: 空。SELECT * FROM users で行が見える。",
        note: "SecurityConfig で /h2-console/** を permitAll、CSRF 無効化、frameOptions sameOrigin を設定していないと開けない",
      },
      {
        n: 20,
        q: "エラーの診断チートシート",
        a: "症状ごとの最初に疑うべき原因:",
        code: [
          {
            label: "よくあるエラー → 原因",
            lang: "text",
            code: `画面真っ白 (500)
  → <%@ page contentType %> または <%@ taglib %> が抜けてる
  → tomcat-embed-jasper 依存が入ってない

CSRF エラー 403
  → フォームに <input type="hidden" name="\${_csrf.parameterName}" ...> 抜け

Invalid bound statement (not found)
  → Mapper XML の namespace と Java の完全修飾名がずれてる
  → メソッド名と <select id="X"> の X がずれてる

無限リダイレクト (/login → /login)
  → SecurityConfig で /WEB-INF/** を permitAll し忘れ

JSP で \${xxx} が空表示
  → Controller で model.addAttribute し忘れ
  → JSP の \${xxx} の変数名スペルミス
  → User class に getter が無い

BCrypt matches が常に false
  → users.password カラムが VARCHAR(50) 等で短い (BCrypt は 60 文字)
  → password を平文のまま INSERT した`,
          },
        ],
      },
    ],
  },
];

function CodeBlock({ block }: { block: CodeBlock }) {
  return (
    <div>
      <div className="text-xs text-slate-500 font-mono mb-1">{block.label}</div>
      <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 md:p-4 text-xs md:text-sm overflow-x-auto leading-relaxed">
        <code className={`language-${block.lang}`}>{block.code}</code>
      </pre>
    </div>
  );
}

export default function HowToPage() {
  const steps = getAllSteps();
  const totalRecipes = CATEGORIES.reduce((s, c) => s + c.recipes.length, 0);

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              How-to Recipe Book
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              「〜するには?」
              <br className="md:hidden" />
              レシピ集
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              後輩から「これどうやるの?」と聞かれた時に開くページ。
              <strong>「1 行の答え + 実物コード」</strong>で並べてあります。全 {totalRecipes} レシピ。
            </p>
          </div>

          {/* Category chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 mr-1 self-center">
              目次:
            </span>
            {CATEGORIES.map((c) => (
              <a
                key={c.key}
                href={`#cat-${c.key}`}
                className="inline-block px-3 py-1 text-xs md:text-sm bg-white border border-slate-200 rounded-full text-slate-700 hover:border-brand hover:text-brand transition-colors"
              >
                {c.emoji} {c.name}
              </a>
            ))}
          </div>

          {/* Top-3 flagged */}
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5">
            <div className="text-sm font-bold text-amber-900 mb-2">
              💡 特に「詰まりそうな 3 つ」
            </div>
            <ul className="text-sm text-amber-900 space-y-1">
              <li>
                <a href="#recipe-1" className="hover:underline font-semibold">
                  Q1. 画面遷移させるには?
                </a>{" "}
                — 3 パターンある (リンク / フォーム POST / redirect)
              </li>
              <li>
                <a href="#recipe-2" className="hover:underline font-semibold">
                  Q2. リンクボタンを作るには?
                </a>{" "}
                — <code>&lt;a href&gt;</code> + <code>&lt;c:url&gt;</code>
              </li>
              <li>
                <a href="#recipe-5" className="hover:underline font-semibold">
                  Q5. Service を作るには?
                </a>{" "}
                — <code>@Service</code> + Controller のコンストラクタ引数
              </li>
            </ul>
          </div>

          {/* Recipes by category */}
          {CATEGORIES.map((cat) => (
            <section
              key={cat.key}
              id={`cat-${cat.key}`}
              className="mb-12 scroll-mt-6"
            >
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  <span className="mr-2">{cat.emoji}</span>
                  {cat.name}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{cat.desc}</p>
              </div>

              <div className="space-y-5">
                {cat.recipes.map((r) => (
                  <article
                    key={r.n}
                    id={`recipe-${r.n}`}
                    className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 scroll-mt-6"
                  >
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-brand text-white font-bold flex items-center justify-center text-sm">
                        {r.n}
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-slate-900 flex-1">
                        {r.q}
                      </h3>
                    </div>

                    <p
                      className="text-slate-700 text-sm md:text-base mb-4 leading-relaxed pl-11"
                      dangerouslySetInnerHTML={{ __html: `<strong className="text-brand-dark">A.</strong> ${r.a}` }}
                    />

                    {r.where && (
                      <div className="pl-11 mb-4 text-xs md:text-sm text-slate-500">
                        📍 <strong>書く場所</strong>: {r.where}
                      </div>
                    )}

                    {r.code && r.code.length > 0 && (
                      <div className="pl-0 md:pl-11 space-y-3">
                        {r.code.map((b, i) => (
                          <CodeBlock key={i} block={b} />
                        ))}
                      </div>
                    )}

                    {r.note && (
                      <div className="mt-4 pl-0 md:pl-11">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs md:text-sm text-amber-900">
                          💡 {r.note}
                        </div>
                      </div>
                    )}

                    {r.stepLink && (
                      <div className="mt-4 pl-0 md:pl-11">
                        <Link
                          href={r.stepLink.href}
                          className="text-brand hover:underline text-sm font-semibold"
                        >
                          → {r.stepLink.label}
                        </Link>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* Bottom banner */}
          <section className="mt-12 pt-8 border-t border-slate-200 bg-brand/5 border border-brand/30 rounded-xl p-5 md:p-6">
            <h2 className="text-lg font-bold mb-3 text-slate-900">
              👨‍🏫 教える時のコツ
            </h2>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed">
              後輩の質問には{" "}
              <strong>「何ページに書いてあるよ」ではなく、その場で 1 行答えて実物コードを見せる</strong>
              のが効きます。このページを別タブで開いておいて、質問が来たら該当 Q を開いて指差しながら答えるのがおすすめ。
            </p>
            <p className="mt-3 text-sm md:text-base text-slate-700 leading-relaxed">
              抜け漏れがあれば、このページに Q を追加してどんどん育ててください。
              vault の <code>05_Learning/</code> 配下に対応する Markdown を作れば、同期スクリプトでサイトに反映されます。
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
