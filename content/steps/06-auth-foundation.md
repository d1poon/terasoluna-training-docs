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
                .requestMatchers("/login", "/css/**", "/h2-console/**", "/WEB-INF/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("id")
                .passwordParameter("password")
                .defaultSuccessUrl("/menu", true)
                .failureUrl("/login?error")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )
            .csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**"))
            .headers(h -> h.frameOptions(f -> f.sameOrigin()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

#### `/WEB-INF/**` が **なぜ** permitAll に必要か (超重要)

Spring Security 6 は **JSP への内部 forward も filter chain を再走**する。
- Controller が "login" 返す → ViewResolver が `/WEB-INF/views/login.jsp` に forward
- そこで再度 Spring Security が起動 → `/WEB-INF/...` は authenticated 対象 → `/login` にリダイレクト
- そこがまた同じルートを通り → **無限リダイレクト**

`/WEB-INF/**` を permitAll しても Servlet コンテナ仕様で外部から直接アクセスできないので **セキュリティは下がらない**。

詳細: 01_Knowledge/spring-security-6-jsp-forward-loop

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
reference-app/src/main/java/com/example/rolemgr/
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
