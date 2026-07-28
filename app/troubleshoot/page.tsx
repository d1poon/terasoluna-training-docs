import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getAllSteps } from "@/lib/steps";
import { PageMeta } from "@/components/PageMeta";
import { PageFooter } from "@/components/PageFooter";
import { RelatedLinks } from "@/components/RelatedLinks";

export const metadata = {
  title: "トラブルシュート",
  description:
    "TERASOLUNA multi-project 特有のよくある詰まり (Invalid bound statement, PKIX, ポート競合, 文字化け 等)。",
};

type Trouble = {
  id: string;
  title: string;
  symptom: string;
  cause: string;
  fix: string;
  code?: { lang: string; text: string };
  refStep?: string;
  refStepHref?: string;
};

const TROUBLES: Trouble[] = [
  {
    id: "install-order",
    title: "1. `Could not resolve dependencies for demo-web`",
    symptom: "子モジュールを直接ビルドしようとすると、`demo-domain` や `demo-env` が見つからないと怒られる。",
    cause: "ルート親 POM から `mvn install` していないため、子モジュール間の依存が Maven ローカルリポジトリに配布されていない。",
    fix: "**必ずルート `demo/` で `mvn clean install` を先に実行**する。以降は個別モジュールでも動くようになる。STS で動作確認する場合は、この後 STS にインポートして「Run on Server」で起動する (Step 02 参照)。",
    code: {
      lang: "powershell",
      text: `cd demo
mvn clean install     # ← まずこれで 5 モジュール全部をローカルに install`,
    },
    refStep: "Step 01",
    refStepHref: "/steps/01-project-skeleton",
  },
  {
    id: "invalid-bound",
    title: "2. `Invalid bound statement (not found): ...UserRepository.findById`",
    symptom: "アプリ起動 or Repository 呼び出し時に、MyBatis がメソッドと XML を紐付けられずエラー。",
    cause: "**ほぼ全て**次の 4 パターン: (a) XML の `namespace` が Java interface と 1 文字違う typo、(b) XML の物理配置が interface と別パッケージパス、(c) `<mybatis:scan>` の base-package に含まれていない、(d) IDE のクラスパス設定が resources を見ていない。",
    fix: "順に確認: ① XML の namespace 属性を interface の完全修飾名と 1 文字ずつ照合。② XML の配置場所は `src/main/resources/com/example/demo/domain/repository/user/UserRepository.xml` (Java と同じパッケージパスを resources 側にミラー)。③ `demo-domain.xml` の `<mybatis:scan base-package=\"com.example.demo.domain.repository\" />` を確認。④ `mvn clean install` で resources を確実に配置。",
    refStep: "Step 04",
    refStepHref: "/steps/04-mapper",
  },
  {
    id: "pkix",
    title: "3. `PKIX path building failed` (社内 CA 証明書エラー)",
    symptom: "`mvn archetype:generate` や依存 DL で SSL 検証に失敗、`unable to find valid certification path` と出る。",
    cause: "社内プロキシ / MITM 装置 が発行する CA 証明書を JDK が信頼していない。",
    fix: "社内 IT に CA 証明書 (`.cer`) をもらい、JDK の truststore に import する。または `~/.m2/settings.xml` で社内 Nexus / JFrog をミラーとして登録し、社外接続を回避。",
    code: {
      lang: "powershell",
      text: `# JDK truststore に import (管理者 PowerShell)
$JAVA_HOME = "C:\\Program Files\\Java\\jdk-17"
& "$JAVA_HOME\\bin\\keytool.exe" -import -trustcacerts \`
    -alias company-ca \`
    -file company-ca.cer \`
    -keystore "$JAVA_HOME\\lib\\security\\cacerts" \`
    -storepass changeit`,
    },
  },
  {
    id: "port-conflict",
    title: "4. `Address already in use: bind` (ポート 8080 競合)",
    symptom: "STS で「Run on Server」を実行すると Tomcat が起動しない、8080 が使用中と表示される。",
    cause: "別プロセス (別の Tomcat / Node / IntelliJ の内蔵 サーバ 等) が 8080 を掴んでいる。",
    fix: "① 別プロセスを停止するか、② Servers ビューで対象サーバーをダブルクリック →「Ports」タブの「HTTP/1.1」を 8090 等に変更する。",
    code: {
      lang: "powershell",
      text: `# 使用中プロセスを特定して停止 (Windows)
netstat -ano | findstr ":8080"
taskkill /PID <PID> /F`,
    },
  },
  {
    id: "encoding",
    title: "5. 文字化け (JSP / URL / DB のいずれか)",
    symptom: "画面 or DB 保存された日本語が `??` や `\\u3042` になる、または UTF-8 文字が化ける。",
    cause: "JSP の contentType 宣言忘れ / web.xml の CharacterEncodingFilter 未設定 / DB 接続 URL に characterEncoding が付いていない / Tomcat の URI encoding がデフォルトのまま、のいずれか。",
    fix: "4 箇所を全て確認: ① JSP 冒頭に `<%@ page contentType=\"text/html; charset=UTF-8\" %>`。② `web.xml` に CharacterEncodingFilter (`encoding=UTF-8`, `forceEncoding=true`)。③ {projectName}-infra.properties の database.url に `?useUnicode=true&characterEncoding=UTF-8` (MySQL の場合、PostgreSQL/H2/Oracle は不要)。④ Tomcat の `server.xml` の Connector に `URIEncoding=\"UTF-8\"` (Tomcat 11 はデフォルト)。",
  },
  {
    id: "no-classdef",
    title: "6. `NoClassDefFoundError` (依存モジュールの build 順序)",
    symptom: "Tomcat 起動時に `NoClassDefFoundError: com.example.demo.domain.model.User` 等、他モジュールのクラスが見つからない。",
    cause: "`demo-web` の war をビルドする前に依存モジュール (`demo-domain`, `demo-env`) がローカルリポジトリに install されていない。",
    fix: "`mvn -pl demo-web -am install` の `-am` (also-make) オプションを付ける。依存モジュールも一緒にビルドされる。または ルートで `mvn install` を先に流す。",
  },
  {
    id: "jsp-not-found",
    title: "7. `Resource Not Found Error!` (404) — JSP が見つからない",
    symptom: "Controller が `\"userinfo/userInfo\"` を返しても、Tomcat 側で JSP が見つからない。archetype が生成する `web.xml` に `<error-page>` で 404 → `/WEB-INF/views/common/error/resourceNotFoundError.jsp` が設定されているため、この画面が表示される (Spring Boot の Whitelabel Error Page ではない)。",
    cause: "① JSP の物理配置と Controller の return 値パスが不一致。② ViewResolver の prefix/suffix と実配置が不整合。③ webapp/ の下に置いていない (resources/ に置いてしまった)。",
    fix: "① Controller の return `\"userinfo/userInfo\"` に対し、JSP は `demo-web/src/main/webapp/WEB-INF/views/userinfo/userInfo.jsp` にあるか。② `spring-mvc.xml` の InternalResourceViewResolver の prefix/suffix を確認。③ resources/ でなく webapp/ 配下であることを再確認。",
    refStep: "Step 07",
    refStepHref: "/steps/07-login",
  },
  {
    id: "csrf-403",
    title: "8. POST が全部 403 Forbidden (CSRF)",
    symptom: "GET は動くが POST が全て 403 で拒否される。",
    cause: "`<sec:csrf />` を spring-security.xml で有効化しているのに、フォームに CSRF token を hidden で埋め込んでいない。",
    fix: "全 POST form の直下に:",
    code: {
      lang: "jsp",
      text: `<form action="..." method="post">
    <input type="hidden"
           name="\${_csrf.parameterName}"
           value="\${_csrf.token}" />
    <!-- 以下入力欄 -->
</form>`,
    },
    refStep: "Step 07",
    refStepHref: "/steps/07-login",
  },
  {
    id: "jstl-taglib",
    title: "9. `<c:if>` タグがそのまま HTML に出力される (JSTL が動かない)",
    symptom: "JSP を開くと `<c:if test=\"${...}\">` の文字列がそのまま画面に表示され、条件分岐が効かない。",
    cause: "taglib 宣言の URI 自体が原因ではないことが多い。実際の原因は次のいずれか: ① `jakarta.servlet.jsp.jstl` の API / 実装 (glassfish) jar が web モジュールの依存に入っていない、② taglib 宣言そのものを書き忘れている、③ 共通の `include.jsp` を JSP 先頭で `<%@ include %>` し忘れている。",
    fix: "旧 URI (`http://java.sun.com/jsp/jstl/core`) と新 URI (`jakarta.tags.core`) は**どちらも有効**(JSTL 3.0 は旧 URI を後方互換としてサポートしており、公式 archetype が生成する `include.jsp` 自体が旧 URI を使っている)。新旧の混在だけ避ければ良く、まずは依存 jar と include 忘れを確認する:",
    code: {
      lang: "jsp",
      text: `<!-- 公式 archetype の include.jsp はこの旧 URI をそのまま使用 (これでも動く) -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!-- Jakarta EE の正式 URI (JSTL 3.0 以降)。こちらでも動く。プロジェクト内で統一すること -->
<%@ taglib prefix="c" uri="jakarta.tags.core" %>`,
    },
  },
  {
    id: "sts-import",
    title: "10. STS / Eclipse に import すると 1 プロジェクトしか出ない",
    symptom: "親 POM を import したのに、Package Explorer に demo だけが並び、demo-web 等が出ない。",
    cause: "import 時のダイアログで子モジュールにチェックが入っていない。",
    fix: "File → Import → Existing Maven Projects → Root Directory に `demo/` を指定 → **表示された 6 個 (親 + 5 子) すべてにチェック** → Finish。",
    refStep: "Step 01",
    refStepHref: "/steps/01-project-skeleton",
  },
  {
    id: "sts-no-tomcat",
    title: "11. 「Run on Server」でサーバー選択肢に Tomcat が出てこない",
    symptom: "`demo-web` を右クリック →「Run As」→「Run on Server」を選んでも、サーバー選択ダイアログに Tomcat が一覧に出ない (または一覧自体が空)。",
    cause: "STS の Servers ビューに Tomcat サーバーがまだ 1 つも登録されていない。初回はサーバー定義を自分で作成する必要がある。",
    fix: "サーバー選択ダイアログで Tomcat v11.0 Server をサーバー種別として選び、次の画面で Tomcat のインストールディレクトリを指定してサーバーを新規作成する。登録後は Servers ビューに表示され、以降は「Run on Server」で選択できるようになる。",
    refStep: "Step 02",
    refStepHref: "/steps/02-empty-boot",
  },
  {
    id: "sts-build-error",
    title: "12. STS にインポート直後にビルドエラーが出る",
    symptom: "Existing Maven Projects でインポートした直後、Package Explorer 上のプロジェクトに赤い ✗ (エラーマーカー) が付く。",
    cause: "インポート直後は Eclipse 側のプロジェクト設定と Maven (pom.xml) 側の設定にズレが生じ、ビルドエラー表示になることがある。",
    fix: "プロジェクト名を右クリック →「Maven」→「Update Project…」→ 対象プロジェクトにチェックが入った状態で「OK」。これでエラーが解消するケースがある (TERASOLUNA 公式ガイドラインの Note にも同様の手順が記載されている)。",
    refStep: "Step 02",
    refStepHref: "/steps/02-empty-boot",
  },
];

export default function TroubleshootPage() {
  const steps = getAllSteps();

  return (
    <div className="lg:flex mx-auto max-w-[80rem] xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <Sidebar steps={steps} />

      <div className="flex-1 min-w-0">
        <main id="main" className="mx-auto max-w-4xl px-4 py-6 lg:px-12 lg:py-12">
          <div className="mb-8 md:mb-10">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold">
              Troubleshoot
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
              トラブルシュート
              <span className="ml-2 text-lg md:text-2xl text-slate-500 font-semibold">
                ({TROUBLES.length} 項目)
              </span>
            </h1>
            <p className="mt-4 text-slate-700 text-base md:text-lg leading-relaxed">
              TERASOLUNA multi-project 特有の「よくある詰まり」を集約。
              エラーメッセージで検索して該当項目に当たるように、症状を先頭に置いています。
            </p>
          </div>

          <PageMeta />

          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 mr-1 self-center">目次:</span>
            {TROUBLES.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {t.title.replace(/^\d+\.\s*/, "").split("(")[0].split("—")[0].trim()}
              </a>
            ))}
          </div>

          <div className="space-y-6">
            {TROUBLES.map((t) => (
              <section
                key={t.id}
                id={t.id}
                className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 scroll-mt-6"
              >
                <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                  {t.title}
                </h2>
                <div className="mt-3 grid gap-3">
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <div className="text-xs uppercase tracking-wider text-rose-800 font-bold mb-1">
                      症状
                    </div>
                    <div className="text-sm text-rose-900 leading-relaxed">{t.symptom}</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="text-xs uppercase tracking-wider text-amber-800 font-bold mb-1">
                      原因
                    </div>
                    <div className="text-sm text-amber-900 leading-relaxed">{t.cause}</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="text-xs uppercase tracking-wider text-emerald-800 font-bold mb-1">
                      対処
                    </div>
                    <div className="text-sm text-emerald-900 leading-relaxed">{t.fix}</div>
                  </div>
                </div>
                {t.code && (
                  <pre className="mt-3 bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs md:text-sm">
                    <code className={`language-${t.code.lang}`}>{t.code.text}</code>
                  </pre>
                )}
                {t.refStep && t.refStepHref && (
                  <div className="mt-3 text-sm text-slate-600">
                    参照:{" "}
                    <Link href={t.refStepHref} className="text-brand underline">
                      {t.refStep}
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>

          <RelatedLinks
            items={[
              { href: "/steps/00-modules-map", emoji: "🗺", label: "Step 00 5 モジュールの地図", desc: "配置先の判断フロー" },
              { href: "/security-checklist", emoji: "🔒", label: "セキュリティチェックリスト", desc: "設定漏れの網羅" },
              { href: "/versions", emoji: "📦", label: "バージョン一覧", desc: "使用中のバージョン確認" },
              // /mentor は 2026-07-28 に非表示化
            ]}
          />

          <PageFooter pageTitle="トラブルシュート" slug="troubleshoot" />
        </main>
      </div>
    </div>
  );
}
