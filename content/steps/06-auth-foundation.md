---
title: "認証基盤"
date: 2026-07-21
tags: [type/learning, type/training, tech/spring, tech/spring-security, tech/bcrypt]
step: 06
---

# Step 06 — 認証基盤 (3ファイル一気に)

## このステップのゴール

- Spring Security の**設定**を書く
- DB からユーザを引く仕組みを作る
- 起動時にサンプルユーザ 5 名を BCrypt ハッシュ付きで投入

このステップ後は「**認証しないと何も見えない**」状態になる。

## 事前準備

- [Step 05](/steps/05-service) 完了

---

## 🔰 その前に: Spring Security の全体像 (1 分で読む)

Step 06 では 3 ファイルを一気に書くが、その前にこの図が頭に入っているとコードが読みやすい。

<div class="flow-diagram">
  <div class="flow-diagram-title">🔐 Filter Chain の判定フロー</div>
  <div class="flow-vertical">
    <div class="flow-step">
      <span class="flow-step-badge">1</span>
      <div class="flow-step-content">
        ブラウザから <code>GET /menu</code> がサーバに届く
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">2</span>
      <div class="flow-step-content">
        <strong>Spring Security Filter Chain</strong> がリクエストを横取りして「認証済み?」を判定
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge flow-step-badge--yes">✓</span>
      <div class="flow-step-content">
        <strong>Yes (認証済み)</strong> → Controller へ通す
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge flow-step-badge--no">✗</span>
      <div class="flow-step-content">
        <strong>No (未認証)</strong> → <code>/login</code> にリダイレクト
      </div>
    </div>
  </div>
</div>

Spring Security は 3 つのピースの組み合わせで動く:

| ピース | 役割 | このステップで書くファイル |
|---|---|---|
| **① SecurityFilterChain** | 「どの URL を守るか」「どこにログインフォームがあるか」の**ルール設定** | `SecurityConfig.java` |
| **② UserDetailsService** | 「ID を渡すから、DB からユーザ情報を取ってきて」に応える**問い合わせ係** | `CustomUserDetailsService.java` |
| **③ PasswordEncoder** | パスワードをハッシュ化 / 照合する**暗号係** | `SecurityConfig.java` の中で `@Bean` として提供 |

さらにサンプルデータを DB に投入するために `DataInitializer.java` も追加する (これは Spring Security の部品ではなく、単に「起動時に 5 ユーザを入れる」ための便利クラス)。

<div class="flow-diagram">
  <div class="flow-diagram-title">🔑 ログイン時の流れ (3 ピースがどう連携するか)</div>
  <div class="flow-vertical">
    <div class="flow-step">
      <span class="flow-step-badge">1</span>
      <div class="flow-step-content">
        <strong>ログインボタン押下</strong> — ブラウザから <code>POST /login</code>
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">2</span>
      <div class="flow-step-content">
        <strong>SecurityFilterChain</strong> が <code>POST /login</code> をキャッチ
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">3</span>
      <div class="flow-step-content">
        <strong>UserDetailsService.loadUserByUsername("u001")</strong> → DB から User 1 件取得
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">4</span>
      <div class="flow-step-content">
        <strong>PasswordEncoder.matches(入力PW, DB のハッシュ)</strong> が true なら認証成功
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge flow-step-badge--yes">✓</span>
      <div class="flow-step-content">
        Session に「認証済み」のマークを付ける → <code>/menu</code> へリダイレクト
      </div>
    </div>
  </div>
</div>

上の 3 ファイルが下の 3 ステップに 1:1 で対応している、と押さえてから読むと詰まりにくい。

---

## 追加するファイル (3つ、一括で書く)

### 1. `src/main/java/com/example/rolemgr/security/CustomUserDetailsService.java`

Spring Security が「ユーザ ID から DB を引いてくれ」と依頼する係。

```java
package com.example.rolemgr.security;

import java.util.Collections;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.example.rolemgr.repository.UserMapper;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    public CustomUserDetailsService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        com.example.rolemgr.domain.User u = userMapper.findById(id);
        if (u == null) {
            throw new UsernameNotFoundException("ユーザが存在しません: " + id);
        }
        return new User(
                u.getId(),
                u.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
```

**注意**: `import` に `org.springframework.security.core.userdetails.User` (Spring 側) と `com.example.rolemgr.domain.User` (自作) が両方登場する。同名だが**完全に別クラス**。

### 2. `src/main/java/com/example/rolemgr/config/SecurityConfig.java`

Spring Security の**設定本体**。認可ルール、ログインパス、ハッシュ器を宣言。

```java
package com.example.rolemgr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/css/**", "/h2-console/**", "/WEB-INF/**").permitAll()  // ①
                .anyRequest().authenticated()                                                        // ②
            )
            .formLogin(form -> form
                .loginPage("/login")                                                                 // ③
                .loginProcessingUrl("/login")
                .usernameParameter("id")                                                             // ④
                .passwordParameter("password")
                .defaultSuccessUrl("/menu", true)                                                    // ⑤
                .failureUrl("/login?error")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )
            .csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**"))                            // ⑥
            .headers(h -> h.frameOptions(f -> f.sameOrigin()));                                      // ⑦

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {                                                       // ⑧
        return new BCryptPasswordEncoder();
    }
}
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `permitAll()`** — この 4 パス (`/login`, `/css/**`, `/h2-console/**`, `/WEB-INF/**`) は認証**なし**で見られる。ログイン画面自体は認証前でも見られないと詰むので必ず開放。`/WEB-INF/**` は JSP forward の再フィルタ問題を回避するため必要 (次節「なぜ」参照)。
- **② `.anyRequest().authenticated()`** — 上の 4 パス以外の**全 URL は認証必須**。未認証で叩くと `/login` にリダイレクトされる。
- **③ `.loginPage("/login")`** — 「認証が必要なとき、ここに飛ばす」のログインフォーム URL。同時に `loginProcessingUrl("/login")` で「POST 先も同じ /login」と宣言。
- **④ `.usernameParameter("id")`** — ログインフォームの `<input name="id">` から ID を受け取る。デフォルトは `username` だが、このアプリの命名に合わせて `id` に変更。JSP 側の name 属性と必ず揃える。
- **⑤ `.defaultSuccessUrl("/menu", true)`** — 認証成功時に飛ぶ URL。第 2 引数 `true` は「常にここに飛ぶ (どこから来たか関係なく)」の意味。
- **⑥ `.csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**"))`** — H2 コンソールは開発用の別 UI で CSRF トークンを送らないため、この URL だけ CSRF 保護を免除。**本番では H2 コンソール自体を無効化する**べき。
- **⑦ `.frameOptions(f -> f.sameOrigin())`** — H2 コンソールは iframe 内で動く UI なので、同一オリジンからの frame 埋め込みを許可。デフォルト (DENY) だとコンソールが真っ白になる。
- **⑧ `PasswordEncoder` の `@Bean`** — BCrypt をパスワード暗号化器として登録。認証時 Spring Security が自動的に `encoder.matches(入力, DB のハッシュ)` を呼ぶ。他クラスからも `@Autowired` で使える (DataInitializer で seed 投入時に使用)。

#### `/WEB-INF/**` が **なぜ** permitAll に必要か (超重要)

Spring Security 6 は **JSP への内部 forward も filter chain を再走**する。
- Controller が `"login"` を返す → ViewResolver が `/WEB-INF/views/login.jsp` に forward
- そこで再度 Spring Security が起動 → `/WEB-INF/...` は authenticated 対象 → `/login` にリダイレクト
- そのリダイレクト先でも同じ経路を通り → **無限リダイレクト**

`/WEB-INF/**` を permitAll しても Servlet コンテナ仕様で外部から直接アクセスできないので **セキュリティは下がらない**。

### 3. `src/main/java/com/example/rolemgr/config/DataInitializer.java`

起動時にサンプルユーザ 5 名を投入する係。パスワードは**その場で BCrypt でハッシュ化**。

```java
package com.example.rolemgr.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;

    public DataInitializer(JdbcTemplate jdbc, PasswordEncoder encoder) {
        this.jdbc = jdbc;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        String[][] seed = {
                {"u001", "password", "部長"},
                {"u002", "password", "課長"},
                {"u003", "password", "係長"},
                {"u004", "password", "主任"},
                {"u005", "password", "一般"}
        };
        for (String[] row : seed) {
            jdbc.update("INSERT INTO users (id, password, role) VALUES (?, ?, ?)",
                    row[0], encoder.encode(row[1]), row[2]);
        }
        System.out.println("[DataInitializer] 5 ユーザを初期投入。全員 password: password");
    }
}
```

#### なぜ SQL でなくコードで INSERT?

- **BCrypt ハッシュはランダムソルト付き** = 実行のたびに違う文字列になる
- `data.sql` に固定ハッシュを書くと、ハッシュ生成時のコード変更に追従できない
- **教材的にも**、「起動ログで BCrypt を実演する」意味がある

## ディレクトリ構造 (このステップ完了時)

```
rolemgr/src/main/java/com/example/rolemgr/
├── RolemgrApplication.java
├── config/
│   ├── SecurityConfig.java                ← 追加
│   └── DataInitializer.java               ← 追加
├── domain/User.java
├── repository/UserMapper.java
├── security/
│   └── CustomUserDetailsService.java      ← 追加
└── service/UserService.java
```

## 動作確認

```powershell
mvn spring-boot:run
```

期待するログ:
```
Global AuthenticationManager configured with UserDetailsService bean with name customUserDetailsService
Tomcat started on port 8080 (http)
Started RolemgrApplication in X.XXX seconds
[DataInitializer] 5 ユーザを初期投入。全員 password: password
```

### ブラウザ確認

1. **http://localhost:8080/** → Spring Security の**デフォルト**ログイン画面が出る
   - まだ自作 login.jsp が無いので Spring 提供の灰色フォーム
   - ID `u001`, Password `password` でログイン試みる
   - ログインは通る (`/menu` にリダイレクトされるが、まだ /menu Controller がないので 404 でも OK)
2. **http://localhost:8080/h2-console** → `SELECT * FROM users;` → **BCrypt ハッシュ**が入った 5 行が見える

## 次

→ [Step 07: ログイン画面](/steps/07-login)
