---
title: "空アプリ起動 & DB 準備"
date: 2026-07-21
tags: [type/learning, type/training, tech/terasoluna, tech/spring, tech/h2]
step: 02
---

# Step 02 — 空アプリ起動 & DB 準備

## このステップのゴール

- Spring Boot が起動して、http://localhost:8080/ にアクセスできる状態にする
- H2 in-memory DB が立ち上がり、`users` テーブルが空で用意される
- `/h2-console` から中身が覗ける

まだ画面もロジックもない。**「箱が動くこと」を確認する**段階。

## 事前準備

- [Step 01](/steps/01-project-skeleton) 完了 (`mvn compile` が通る)

## 追加するファイル (2つ)

### 1. `src/main/java/com/training/rolemgr/RolemgrApplication.java`

**アプリのエントリポイント**。ここから起動する。

```java
package com.training.rolemgr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RolemgrApplication {
    public static void main(String[] args) {
        SpringApplication.run(RolemgrApplication.class, args);
    }
}
```

#### なぜこう書く

- **`@SpringBootApplication`**: 3つの機能をまとめた便利アノテーション
  - `@Configuration`: このクラスを Bean 定義の起点にする
  - `@EnableAutoConfiguration`: Spring Boot が pom.xml の依存を見て自動で設定してくれる (Tomcat 起動、DataSource 準備、etc)
  - `@ComponentScan`: このクラスと同じパッケージ (`com.training.rolemgr`) 以下を全部スキャンして `@Controller` / `@Service` / `@Repository` を Bean 登録
- **`SpringApplication.run(...)`**: 起動して、埋め込み Tomcat が上がる。それだけ

### 2. `src/main/resources/schema.sql`

**起動時に実行される DDL**。`users` テーブルを作る。

```sql
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id       VARCHAR(50)  PRIMARY KEY,
    password VARCHAR(255) NOT NULL,   -- BCrypt ハッシュ 60文字 → 余裕もって 255
    role     VARCHAR(50)  NOT NULL
);
```

#### なぜこう書く

- **`DROP TABLE IF EXISTS`**: 開発中の再起動で衝突しないように毎回作り直す
- **`VARCHAR(255)`**: BCrypt ハッシュは 60文字だが余裕を持たせる。50 だと切れて認証失敗する地雷
- 課題仕様には `password` はないが、**認証には必要**。実装で追加

## ディレクトリ構造 (このステップ完了時)

```
reference-app/
├── pom.xml
└── src/main/
    ├── java/com/training/rolemgr/
    │   └── RolemgrApplication.java        ← 追加
    └── resources/
        ├── application.properties
        └── schema.sql                     ← 追加
```

## 動作確認

```powershell
mvn spring-boot:run
```

期待するログ:
```
Tomcat started on port 8080 (http)
Started RolemgrApplication in X.XXX seconds
```

### ブラウザ確認 (2つ)

1. **http://localhost:8080/** → Spring Security の**デフォルトログイン画面** (灰色の UI) が出る。まだ自分の login.jsp を書いてないので Spring Security 提供のフォーム。**これで OK**
2. **http://localhost:8080/h2-console** → H2 のログイン画面
   - JDBC URL: `jdbc:h2:mem:rolemgr`
   - User: `sa`
   - Password: (空)
   - Connect → `SELECT * FROM users;` → 空テーブルが表示されれば成功

### 止める

`Ctrl + C` で停止。

## よくある詰まり

- **`Whitelabel Error Page`**: 正常。まだ Controller がないから
- **`Failed to determine a suitable driver class`**: `application.properties` の `spring.datasource.*` が抜けている
- **`Table "USERS" not found`**: `schema.sql` の場所が違う。必ず `src/main/resources/` 直下
- **H2 コンソールで「JDBC URL 違う」と怒られる**: URL に typo。`jdbc:h2:mem:rolemgr` を厳密に

## 次

→ [Step 03: User ドメイン](/steps/03-user-domain)
