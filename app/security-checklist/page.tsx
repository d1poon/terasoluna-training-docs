import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { RelatedLinks } from "@/components/RelatedLinks";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";

export const metadata = {
  title: "セキュリティチェックリスト | TERASOLUNA 研修",
  description:
    "ログイン失敗メッセージのユーザ存在漏洩、セッション固定攻撃、ログアウト処理、認可 (IDOR) 等、実装時に踏みがちなセキュリティ観点を 1 ページに集約。",
};

type Item = {
  id: string;
  title: string;
  bad: string;
  good: string;
  code: string;
  codeLang: string;
  refStep?: string;
  refStepHref?: string;
};

const ITEMS: Item[] = [
  {
    id: "login-message",
    title: "1. ログイン失敗メッセージからユーザ存在を漏らさない",
    bad: '「そのIDは登録されていません」「パスワードが違います」の 2 種類を出す → 攻撃者に「u001 は存在する」が漏れる (ユーザ列挙攻撃)',
    good: 'ID・パスワードいずれの失敗でも「ID またはパスワードが違います」の 1 メッセージに統一する。ログには詳細を残して良い (ログは非公開)',
    codeLang: "java",
    code: `// SecurityConfig.java — Spring Security デフォルトはこれになっている
http.formLogin(f -> f
    .loginPage("/login")
    .failureUrl("/login?error")     // ← "error" 1 種だけ
    .permitAll()
);

// login.jsp — 失敗時は 1 メッセージだけ
<c:if test="\${param.error != null}">
    <div class="error">ID またはパスワードが違います</div>
</c:if>`,
    refStep: "Step 06 認証基盤",
    refStepHref: "/steps/06-auth-foundation",
  },
  {
    id: "session-fixation",
    title: "2. セッション固定攻撃対策 (ログイン成功時にセッション再生成)",
    bad: "ログイン前後で同じセッション ID を使い続ける → 攻撃者が事前に自分の JSESSIONID を被害者に踏ませ、被害者ログイン後にそのまま乗っ取れる",
    good: "ログイン成功時にセッション ID を **再生成 (rotate)** する。Spring Security 6 のデフォルト動作は changeSessionId なので、明示指定は不要だが確認しておく",
    codeLang: "java",
    code: `// SecurityConfig.java (Spring Security 6 のデフォルトは changeSessionId、確認のため明示)
http.sessionManagement(s -> s
    .sessionFixation(f -> f.changeSessionId())   // ← ログイン成功時に ID rotate
    .maximumSessions(1)                          // ← 同時ログイン制御が要るなら
);`,
    refStep: "Step 06 認証基盤",
    refStepHref: "/steps/06-auth-foundation",
  },
  {
    id: "logout",
    title: "3. ログアウトは POST + セッション破棄 + Cookie 削除",
    bad: 'GET /logout でセッションだけクリア → CSRF で勝手にログアウトさせられる、JSESSIONID Cookie は残る',
    good: "POST /logout で、セッション破棄 + JSESSIONID Cookie 削除 + CSRF トークン確認をセットで行う。JSP のログアウトリンクは form + button で POST 化",
    codeLang: "java",
    code: `// SecurityConfig.java
http.logout(l -> l
    .logoutUrl("/logout")                        // POST /logout
    .logoutSuccessUrl("/login?logout")
    .invalidateHttpSession(true)                 // ← セッション破棄
    .deleteCookies("JSESSIONID")                 // ← Cookie も削除
);

// header.jsp — form + button で POST 送信
<form action="/logout" method="post" style="display:inline">
    <input type="hidden" name="\${_csrf.parameterName}" value="\${_csrf.token}" />
    <button type="submit">ログアウト</button>
</form>`,
    refStep: "Step 08 メニュー画面",
    refStepHref: "/steps/08-menu",
  },
  {
    id: "csrf",
    title: "4. CSRF 対策は POST 全部に必須",
    bad: "POST フォームに CSRF トークンを埋め忘れる → Spring Security が 403 で拒否 (対策自体は自動、忘れると自分が困る)。もしくは REST API で `csrf().disable()` を安易にする",
    good: "JSP のすべての POST form に `<input type=\"hidden\" name=\"${_csrf.parameterName}\" value=\"${_csrf.token}\" />` を必ず埋める。API は CSRF を無効化するのでなく Cookie ベースにするか、Same-Origin 制約を効かせる",
    codeLang: "jsp",
    code: `<!-- どの POST フォームでも必ず先頭に埋める -->
<form action="/user-info/edit" method="post">
    <input type="hidden" name="\${_csrf.parameterName}" value="\${_csrf.token}" />
    <!-- 以下入力欄 -->
</form>

<!-- ヘッダ経由でも渡せる (Ajax の場合) -->
<meta name="_csrf" content="\${_csrf.token}" />
<meta name="_csrf_header" content="\${_csrf.headerName}" />`,
    refStep: "Step 07 ログイン",
    refStepHref: "/steps/07-login",
  },
  {
    id: "idor",
    title: "5. IDOR (認可漏れ): URL パラメータで他人の情報を触れないか?",
    bad: "`GET /user-info?id=u002` で誰でも他人の情報を見られる。URL を書き換えるだけで管理者権限相当の画面に到達できる",
    good: "認証済みユーザの ID は `Authentication.getName()` から取り、URL パラメータの id は信用しない。管理者機能は `@PreAuthorize(\"hasRole('ADMIN')\")` で保護",
    codeLang: "java",
    code: `// UserInfoController.java
@GetMapping("/user-info")
public String view(Authentication auth, Model model) {
    String id = auth.getName();              // ← URL からでなく認証コンテキストから
    User user = userService.findById(id);
    model.addAttribute("user", user);
    return "userInfo";
}

// 管理者専用画面はメソッドレベルで保護
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/users")
public String adminList(Model model) { ... }`,
    refStep: "Step 10 ユーザ情報画面",
    refStepHref: "/steps/10-user-info",
  },
  {
    id: "password-storage",
    title: "6. パスワードは平文保存 NG (BCrypt 一択)",
    bad: "MD5 / SHA-1 の単純ハッシュ、salt なしハッシュ、独自暗号化 (可逆) → レインボーテーブルで一瞬で復元される",
    good: "`BCryptPasswordEncoder` を使う。salt 自動生成 + 計算量を上げてブルートフォース対策。SHA-256 を素で使うのは NG",
    codeLang: "java",
    code: `// SecurityConfig.java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();     // ← これだけ
}

// パスワード保存時
String hash = passwordEncoder.encode(rawPassword);
userMapper.insertUser(id, hash, role);

// 検証時 (通常は Spring Security が自動で行うので手書き不要)
boolean ok = passwordEncoder.matches(rawInput, storedHash);`,
    refStep: "Step 06 認証基盤",
    refStepHref: "/steps/06-auth-foundation",
  },
  {
    id: "xss",
    title: "7. XSS: JSP 出力は必ず HTML エスケープ",
    bad: "`${user.name}` で生出力 → `<script>alert(1)</script>` を入力されると実行される",
    good: "JSTL の `<c:out value=\"${user.name}\" />` か Spring 標準の HTML エスケープを常時 ON にする。EL 式 `${...}` はデフォルトでエスケープされない事に注意 (JSP 2.x 系)",
    codeLang: "jsp",
    code: `<!-- NG: そのまま出力 -->
<div>\${user.name}</div>

<!-- OK: JSTL でエスケープ (default は escapeXml=true) -->
<c:out value="\${user.name}" />

<!-- OK: Spring の <spring:message> は HTML エスケープされる -->
<spring:message code="hello.message" htmlEscape="true" />

<!-- web.xml か Boot なら application.properties で全体 ON -->
spring.mvc.contentnegotiation.default-content-type=text/html; charset=UTF-8`,
    refStep: "Step 07 ログイン",
    refStepHref: "/steps/07-login",
  },
  {
    id: "sql-injection",
    title: "8. SQL インジェクション: MyBatis の `${}` を避けて `#{}` を使う",
    bad: '`WHERE role = \'${role}\'` (`${}` はリテラル埋め込み) → 引用符エスケープなしで文字列がそのまま SQL に混入、`\' OR \'1\'=\'1` で全件抜かれる',
    good: '`WHERE role = #{role}` (`#{}` は PreparedStatement のプレースホルダ) → JDBC ドライバがバインドしてくれるので安全。テーブル名やソート順など動的な部分でどうしても `${}` を使う場合は許容値をホワイトリスト検証',
    codeLang: "xml",
    code: `<!-- NG: 直接埋め込み -->
<select id="findByRole">
    SELECT * FROM users WHERE role = '\${role}'
</select>

<!-- OK: PreparedStatement バインド -->
<select id="findByRole">
    SELECT * FROM users WHERE role = #{role}
</select>

<!-- ソート順など動的部分でどうしても \${} が要るならホワイトリスト -->
<select id="findWithSort">
    SELECT * FROM users
    ORDER BY \${sortColumn}
    <!-- ↑ sortColumn は enum やホワイトリストで事前検証してから渡す -->
</select>`,
    refStep: "Step 04 Mapper",
    refStepHref: "/steps/04-mapper",
  },
  {
    id: "error-leak",
    title: "9. 例外スタックトレースを画面に出さない",
    bad: "本番で `Whitelabel Error Page` に SQL 文やスタックトレースが出る → DB スキーマ・パス・使用フレームワークが特定される",
    good: "本番プロファイルではカスタムエラーページ (`/error/500.html`) を返し、詳細はサーバログにのみ残す。`server.error.include-stacktrace=never` を設定",
    codeLang: "properties",
    code: `# application-prod.properties (本番プロファイル)
server.error.include-message=never
server.error.include-stacktrace=never
server.error.include-exception=false
server.error.include-binding-errors=never
server.error.whitelabel.enabled=false

# カスタムエラーページ (src/main/resources/templates/error/500.html を返す)`,
  },
  {
    id: "brute-force",
    title: "10. ブルートフォース対策 (ログイン試行制限)",
    bad: "ログイン失敗を何度でも許可する → 総当たり攻撃で弱いパスワードを持つアカウントが破られる",
    good: "IP + アカウント別に失敗回数を数え、閾値超えでロックまたは CAPTCHA。Spring Security 単体には機能ないので Bucket4j / Resilience4j / Redis で実装、または AWS WAF などの前段で対応",
    codeLang: "java",
    code: `// AuthenticationFailureHandler で失敗を記録
@Component
public class LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {
    private final FailureAttemptService attempts;

    @Override
    public void onAuthenticationFailure(HttpServletRequest req, HttpServletResponse res,
                                         AuthenticationException e) {
        String id = req.getParameter("id");
        String ip = req.getRemoteAddr();
        attempts.record(id, ip);
        if (attempts.isLocked(id)) {
            res.sendRedirect("/login?locked");
            return;
        }
        super.onAuthenticationFailure(req, res, e);
    }
}`,
  },
];

export default function SecurityChecklistPage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          {/* Hero */}
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              Security Checklist
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              セキュリティチェックリスト
              <br className="md:hidden" />
              <span className="text-lg md:text-2xl text-slate-500 font-semibold">
                {" "}({ITEMS.length} 項目)
              </span>
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              本教材で作った rolemgr は「動く」ところまでを最優先しているため、
              セキュリティの観点は各 Step に散らばっています。
              このページは<strong>「本番公開する前に一度チェックしたい」観点を 1 ページに集約</strong>したもの。
              初学者が踏みがちな順に並べています。
            </p>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <strong>⚠️ 免責:</strong> このページは網羅ではなく、初学者が最初に押さえるべき観点の入口です。
              本番システムには追加の対策 (WAF / IDS / 定期的な依存脆弱性スキャン / ペネトレーションテスト等) が必要です。
              OWASP Top 10 も併せて参照してください。
            </div>
          </div>

          <PageMeta targetVersion="Spring Security 6.x / Spring Boot 3.4" />

          {/* TOC chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 mr-1 self-center">目次:</span>
            {ITEMS.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {i + 1}. {item.title.replace(/^\d+\.\s*/, "")}
              </a>
            ))}
          </div>

          {/* Items */}
          <div className="space-y-8">
            {ITEMS.map((item) => (
              <section
                key={item.id}
                id={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 scroll-mt-6"
              >
                <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                  {item.title}
                </h2>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <div className="text-xs uppercase tracking-wider text-rose-800 font-bold mb-1">
                      ❌ よくある NG
                    </div>
                    <div className="text-sm text-rose-900 leading-relaxed">{item.bad}</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="text-xs uppercase tracking-wider text-emerald-800 font-bold mb-1">
                      ✅ 対策
                    </div>
                    <div className="text-sm text-emerald-900 leading-relaxed">{item.good}</div>
                  </div>
                </div>

                <pre className="mt-4 bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs md:text-sm">
                  <code className={`language-${item.codeLang}`}>{item.code}</code>
                </pre>

                {item.refStep && item.refStepHref && (
                  <div className="mt-3 text-sm text-slate-600">
                    実装参考:{" "}
                    <Link href={item.refStepHref} className="text-brand underline">
                      {item.refStep}
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Runbook */}
          <section className="mt-12 bg-brand/5 border border-brand/30 rounded-xl p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3">
              🔒 公開前セルフチェック フロー
            </h2>
            <ol className="space-y-2 text-sm md:text-base text-slate-700 list-decimal pl-6">
              <li>上から順に 10 項目、自作アプリで該当箇所を実際にコードで見て確認</li>
              <li>問題があれば該当 Step に戻って修正</li>
              <li>依存ライブラリの既知脆弱性を <code>mvn dependency-check</code> や GitHub Dependabot でスキャン</li>
              <li>本番プロファイルで起動して、意図的に間違ったログイン・URL 直叩き・XSS payload 入力を試す</li>
              <li>ログに機密情報が漏れていないか (パスワード平文が出ていないか) を検索</li>
            </ol>
          </section>

          <RelatedLinks
            items={[
              {
                href: "/steps/06-auth-foundation",
                emoji: "🔐",
                label: "Step 06 認証基盤",
                desc: "SecurityConfig / BCrypt / UserDetailsService の実装",
              },
              {
                href: "/steps/07-login",
                emoji: "🔑",
                label: "Step 07 ログイン",
                desc: "ログインフォーム / CSRF トークン埋め込み",
              },
              {
                href: "/oracle-diff",
                emoji: "🏛",
                label: "H2 → Oracle 落とし穴",
                desc: "本番 DB 移行時の類似地雷リスト",
              },
              // /mentor は 2026-07-28 に非表示化
            ]}
          />

          <PageFooter pageTitle="セキュリティチェックリスト" slug="security-checklist" />
        </main>
      </div>
    </div>
  );
}
