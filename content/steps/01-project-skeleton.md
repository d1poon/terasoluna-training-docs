---
title: "プロジェクト骨組み"
date: 2026-07-21
tags: [type/learning, type/training, tech/terasoluna, tech/spring, tech/maven]
step: 01
---

# Step 01 — プロジェクト骨組み

## このステップのゴール

- Maven でビルドできる**空プロジェクト**を作る
- 依存関係 (Spring Boot / Security / MyBatis / H2 / JSP) を pom.xml に宣言
- アプリ設定を application.properties に書く

まだアプリコードは書かない。**部品を並べるための台**を作る段階。

## 事前準備

- JDK 17+ が入っている (`java -version` で確認)
- Maven が展開済み (`C:\Users\donpa\Workspace\terasoluna-training\tools\apache-maven-3.9.9\bin\mvn -v`)

## 追加するファイル (2つ)

### 1. `pom.xml` (プロジェクト直下)

Maven の心臓部。**どの依存ライブラリを使うか**、**どの Java バージョンで動かすか**をここで宣言する。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.0</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>rolemgr</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>war</packaging>

    <properties>
        <java.version>17</java.version>
        <mybatis-spring-boot.version>3.0.4</mybatis-spring-boot.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>${mybatis-spring-boot.version}</version>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.tomcat.embed</groupId>
            <artifactId>tomcat-embed-jasper</artifactId>
        </dependency>
        <dependency>
            <groupId>jakarta.servlet.jsp.jstl</groupId>
            <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
        </dependency>
        <dependency>
            <groupId>org.glassfish.web</groupId>
            <artifactId>jakarta.servlet.jsp.jstl</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

#### なぜこう書く

- **`<parent>`**: Spring Boot が「これ使うと安定するよ」というライブラリバージョンを一括継承。個別に version を書かなくていい
- **`<packaging>war</packaging>`**: JSP を使うので war 必須 (jar だと `src/main/webapp/` が認識されない)
- **`tomcat-embed-jasper`**: JSP を解釈するために必要。これがないと画面真っ白
- **`jakarta.servlet.jsp.jstl-api` + `-jstl`**: `<c:if>` などの JSTL タグを使うため。**API と実装は別依存**なことに注意

### 2. `src/main/resources/application.properties`

Spring Boot の**設定ファイル**。値を並べるだけ。

```properties
server.port=8080

# JSP のパス解決
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp

# H2 in-memory DB
spring.datasource.url=jdbc:h2:mem:rolemgr;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.sql.init.mode=always

# H2 コンソール (開発用)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# MyBatis
mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.configuration.map-underscore-to-camel-case=true

# ログ
logging.level.com.example.rolemgr=DEBUG
logging.level.org.springframework.security=INFO
```

#### なぜこう書く

- `spring.mvc.view.prefix/suffix`: Controller が `"login"` と返したら `/WEB-INF/views/login.jsp` に forward する仕組み。**この設定がないと画面が出ない**
- `spring.datasource.url` の `MODE=PostgreSQL`: H2 に PostgreSQL 方言で動いてもらう。将来 PostgreSQL に切り替える時に SQL 差分を小さくする布石
- `spring.sql.init.mode=always`: `schema.sql` を毎回実行 (embedded DB でなくても)
- `map-underscore-to-camel-case=true`: DB カラム `user_id` を Java の `userId` にマッピング

## ディレクトリ構造 (このステップ完了時)

```
reference-app/
├── pom.xml                               ← 追加
└── src/
    └── main/
        └── resources/
            └── application.properties     ← 追加
```

## 動作確認

```powershell
$env:MAVEN_HOME = "C:\Users\donpa\Workspace\terasoluna-training\tools\apache-maven-3.9.9"
$env:PATH = "$env:MAVEN_HOME\bin;$env:PATH"
cd C:\Users\donpa\Workspace\terasoluna-training\reference-app
mvn compile
```

出るべきメッセージ: **`BUILD SUCCESS`**

エラーが出たら:
- `pom.xml` の XML タグ閉じ忘れ (`</dependency>` など)
- インデントミス (実はどうでもいい、閉じ忘れをチェック)
- `mvn: command not found` → 環境変数の設定漏れ

## よくある詰まり

- **`mvn` が動かない** → `$env:MAVEN_HOME` と `$env:PATH` の両方が同じ PowerShell セッション内で設定されているか確認
- **依存解決で止まる** → 社内プロキシで maven central にアクセスできない場合あり。`~/.m2/settings.xml` にプロキシ設定が必要
- **Java version が違うと言われる** → `<java.version>17</java.version>` は「17以上ならOK」。JDK 24 でも動く

## 次

→ [Step 02: 空アプリ起動](/steps/02-empty-boot)
