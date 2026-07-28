---
title: "認証基盤 (spring-security.xml)"
date: 2026-07-28
tags: [type/learning, type/training, tech/terasoluna, tech/spring-security]
step: 06
---

# Step 06 — 認証基盤 (spring-security.xml)

## このステップのゴール

- Spring Security を **XML 設定** (`spring-security.xml`) で構成する (TERASOLUNA 規約、Boot の Java Config とは書き方が異なる)
- BCrypt でパスワードをハッシュ化する PasswordEncoder を Bean 登録
- DB からユーザを引く `UserDetailsService` の実装を書く
- 起動時にサンプル user を 5 人 initdb で投入する

## 事前準備

- [Step 05](/steps/05-service) 完了 (UserService が動く状態)

## Spring Security の全体像 (先に俯瞰)

<div class="flow-vertical">
  <div class="flow-step">
    <span class="flow-step-badge">1</span>
    <div class="flow-step-content">
      <strong>Filter Chain</strong> — `web.xml` の `springSecurityFilterChain` が全リクエストを受け、認証状態を判定
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">2</span>
    <div class="flow-step-content">
      <strong>UserDetailsService</strong> — ログイン時、DB から user を引く担当 (このステップで自作する)
    </div>
  </div>
  <div class="flow-step">
    <span class="flow-step-badge">3</span>
    <div class="flow-step-content">
      <strong>PasswordEncoder</strong> — 入力パスワードをハッシュ化して DB の値と照合。BCrypt を使う
    </div>
  </div>
</div>

## 追加するファイル (3 つ)

### 1. `spring-security.xml` を書き換え

<div class="file-location">
  <div class="file-location-label">📍 archetype 生成品を書き換え</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-web/src/main/resources/META-INF/spring/</div>
    <div class="ft-line ft-l2 ft-file">📄 spring-security.xml <span class="ft-tag ft-tag--modify">書き換え</span></div>
  </div>
</div>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:sec="http://www.springframework.org/schema/security"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/security
           http://www.springframework.org/schema/security/spring-security.xsd">

    <sec:http auto-config="false" use-expressions="true">                     <!-- ① -->
        <sec:intercept-url pattern="/login" access="permitAll" />              <!-- ② -->
        <sec:intercept-url pattern="/resources/**" access="permitAll" />
        <sec:intercept-url pattern="/**" access="isAuthenticated()" />         <!-- ③ -->

        <sec:form-login
            login-page="/login"
            login-processing-url="/authenticate"
            username-parameter="id"                                            <!-- ④ -->
            password-parameter="password"
            default-target-url="/menu"
            authentication-failure-url="/login?error" />

        <sec:logout logout-url="/logout"
                    logout-success-url="/login?logout"
                    delete-cookies="JSESSIONID" />

        <sec:csrf />                                                           <!-- ⑤ -->
        <sec:session-management session-fixation-protection="changeSessionId" />  <!-- ⑥ -->
    </sec:http>

    <sec:authentication-manager>
        <sec:authentication-provider user-service-ref="userDetailsService">
            <sec:password-encoder ref="passwordEncoder" />                     <!-- ⑦ -->
        </sec:authentication-provider>
    </sec:authentication-manager>

    <bean id="passwordEncoder"
          class="org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder" />
</beans>
```

#### なぜこう書く

- **① `<sec:http auto-config="false" use-expressions="true">`** — TERASOLUNA では明示的な設定を推奨。`auto-config="false"` で「デフォルトのフィルタ配置を使わず、下の要素で自分で組む」宣言
- **② `<sec:intercept-url pattern="/login" access="permitAll" />`** — `/login` は認証前でも見られる。ログイン画面自体はゲートを通せない
- **③ `pattern="/**" access="isAuthenticated()"`** — 他のパスは全て「認証済み」を要求。パターンの順序が重要 (上から評価)
- **④ `username-parameter="id"`** — ログインフォームの `<input name="id">` から ID を受け取る (Boot 版と同じ)
- **⑤ `<sec:csrf />`** — CSRF 対策を有効化。POST 全部に token 埋め込みが必須になる
- **⑥ `session-fixation-protection="changeSessionId"`** — ログイン成功時にセッション ID を rotate。デフォルトだが明示
- **⑦ `<sec:password-encoder ref="passwordEncoder" />`** — 認証時にパスワード照合を BCrypt で行う

### 2. `UserDetailsServiceImpl.java` (Spring Security が呼ぶ user 引き係)

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-domain/</div>
    <div class="ft-line ft-l2">📁 src/main/java/</div>
    <div class="ft-line ft-l3">📁 com/example/demo/domain/service/userdetails/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l4 ft-file">📄 UserDetailsServiceImpl.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.demo.domain.service.userdetails;

import java.util.Collections;
import jakarta.inject.Inject;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.example.demo.domain.repository.user.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Inject
    UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        com.example.demo.domain.model.User user = userRepository.findById(id);
        if (user == null) {
            // ⚠️ セキュリティ上、「ID とパスワードのどちらが間違っているか」を漏らさない
            //    → メッセージは共通、詳細ログはサーバ側にのみ残す
            throw new UsernameNotFoundException("ID または パスワードが不正です");
        }
        return new User(
            user.getId(),
            user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}
```

#### 注意: 同名 `User` の混同に警戒

上のコードには 2 種類の `User` が登場する:

- `org.springframework.security.core.userdetails.User` — Spring Security の内部用
- `com.example.demo.domain.model.User` — 自作の Entity

**完全に別クラス**。import で片方だけを取り込むと片方を fully-qualified 名で書く必要がある (上の例では自作 User を FQN で書いた)。

### 3. データ投入 SQL

<div class="file-location">
  <div class="file-location-label">📍 このファイルを編集 (archetype が最初から生成する既存ファイル)</div>
  <div class="file-tree">
    <div class="ft-line">📁 demo/</div>
    <div class="ft-line ft-l1">📁 demo-env/</div>
    <div class="ft-line ft-l2">📁 src/main/resources/database/</div>
    <div class="ft-line ft-l3 ft-file">📄 H2-dataload.sql <span class="ft-tag ft-tag--modify">修正</span></div>
  </div>
</div>

新しいファイルを作るのではなく、`demo-env` モジュールに既にある `H2-dataload.sql` に追記する:

```sql
-- 5 名分のサンプルユーザ。パスワードは 'password' の BCrypt ハッシュ
INSERT INTO users (id, password, role) VALUES
    ('u001', '$2a$10$8HzTfSaJ4/JHR8p3ZO1MveXsRSc9fkfaK4hf3XkjXtoLzq7HxWJm2', 'ROLE_USER'),
    ('u002', '$2a$10$8HzTfSaJ4/JHR8p3ZO1MveXsRSc9fkfaK4hf3XkjXtoLzq7HxWJm2', 'ROLE_USER'),
    ('u003', '$2a$10$8HzTfSaJ4/JHR8p3ZO1MveXsRSc9fkfaK4hf3XkjXtoLzq7HxWJm2', 'ROLE_ADMIN'),
    ('u004', '$2a$10$8HzTfSaJ4/JHR8p3ZO1MveXsRSc9fkfaK4hf3XkjXtoLzq7HxWJm2', 'ROLE_ADMIN'),
    ('u005', '$2a$10$8HzTfSaJ4/JHR8p3ZO1MveXsRSc9fkfaK4hf3XkjXtoLzq7HxWJm2', 'ROLE_USER');
```

`demo-env.xml` の `<jdbc:initialize-database>` は archetype 生成時点で既に schema SQL と data SQL の両方 (`classpath:/database/${database}-schema.sql` / `${database}-dataload.sql`) を読む設定になっている ([[/steps/03-user-domain|Step 03]] 参照)。**XML の追記は不要** — 上の `H2-dataload.sql` の中身を書けば起動時に自動で流れる。

## 動作確認

Tomcat 起動 → http://localhost:8080/demo-web/ → Spring Security のデフォルトログイン画面が出る (Step 07 で自作 login.jsp に置き換える予定)。とりあえずここで停止する。

## よくある詰まり

- **`Invalid CSRF token`** — フォームに `<sec:csrf />` の token を hidden で入れ忘れ。Step 07 で対応
- **ログイン時 500 エラー**: `UserDetailsServiceImpl` が Bean 登録されていない → `context:component-scan` の base-package に `com.example.demo.domain.service` が含まれているか確認
- **`BadCredentialsException` (パスワード誤り)**: BCrypt ハッシュが古いバージョン (SHA-256 平文等) と混在。**必ず BCrypt ハッシュを DB に格納**
- **`UsernameNotFoundException` を無視して 200 OK が返る**: Spring Security 6+ ではデフォルトで例外を隠す挙動あり。`<sec:authentication-provider>` の設定を確認

## 次

→ [Step 07: ログイン画面 (LoginController + login.jsp)](/steps/07-login)
