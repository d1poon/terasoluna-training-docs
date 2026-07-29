---
title: "Mapper の統合テスト (@MybatisTest)"
date: 2026-07-27
tags: [type/learning, type/training, tech/mybatis, tech/junit5, tech/test]
step: 14
---

# Step 14 — Mapper の統合テスト (`@MybatisTest`)

## このステップのゴール

- **実際に H2 に SQL を投げて** UserMapper が期待通り動くことを確認
- `@MybatisTest` で **Mapper 層だけを起動**する (軽い Spring Context)
- テスト間の**自動ロールバック**でデータ汚染を防ぐ

Step 13 (Mockito) では検出できなかった**SQL のバグ** (typo / 列名違い / JOIN 忘れ) をここで捕まえる。

## 事前準備

- [Step 13](/steps-boot/13-service-test) 完了

---

## 🔰 Mockito 単体テスト vs @MybatisTest 統合テストの棲み分け

<div class="flow-diagram">
  <div class="flow-diagram-title">🧪 テストの層別カバー範囲</div>
  <div class="flow-vertical">
    <div class="flow-step">
      <span class="flow-step-badge">1</span>
      <div class="flow-step-content">
        <strong>Step 13</strong> Mockito 単体テスト → <strong>Service の分岐 / 業務ロジック</strong>を保証。DB 無し・数秒で 100 パターン
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">2</span>
      <div class="flow-step-content">
        <strong>Step 14</strong> @MybatisTest 統合テスト → <strong>SQL / XML の namespace / #{} プレースホルダ</strong>が実 DB で機能するかを保証
      </div>
    </div>
    <div class="flow-step">
      <span class="flow-step-badge">3</span>
      <div class="flow-step-content">
        <strong>Step 15</strong> MockMvc テスト → <strong>Controller が HTTP を正しく捌く</strong>ことを保証
      </div>
    </div>
  </div>
</div>

**片方だけでは足りない**。同じ機能を Mockito と @MybatisTest の両方でテストするのではなく、**関心が違うから両方要る**。

---

## 追加するファイル (1つ)

### `UserMapperTest.java`

<div class="file-location">
  <div class="file-location-label">📍 このファイルをここに作成</div>
  <div class="file-tree">
    <div class="ft-line">📁 rolemgr/</div>
    <div class="ft-line ft-l1">📁 src/test/java/</div>
    <div class="ft-line ft-l2">📁 com/example/rolemgr/</div>
    <div class="ft-line ft-l3">📁 repository/ <span class="ft-tag">新規</span></div>
    <div class="ft-line ft-l4 ft-file">📄 UserMapperTest.java <span class="ft-tag">新規</span></div>
  </div>
</div>

```java
package com.example.rolemgr.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.jdbc.core.JdbcTemplate;

import com.example.rolemgr.domain.User;

@MybatisTest                                                              // ①
@AutoConfigureTestDatabase(replace = Replace.NONE)                        // ②
class UserMapperTest {

    @Autowired
    UserMapper userMapper;

    @Autowired
    JdbcTemplate jdbc;

    @BeforeEach
    void seed() {                                                         // ③
        jdbc.update("DELETE FROM users");
        jdbc.update("INSERT INTO users (id, password, role) VALUES (?, ?, ?)",
            "u001", "$2a$10$hash1", "部長");
        jdbc.update("INSERT INTO users (id, password, role) VALUES (?, ?, ?)",
            "u002", "$2a$10$hash2", "課長");
        jdbc.update("INSERT INTO users (id, password, role) VALUES (?, ?, ?)",
            "u003", "$2a$10$hash3", "係長");
    }

    @Test
    void findById_存在する_ID_で_ユーザ_1_件が_返る() {
        User u = userMapper.findById("u001");                             // ④

        assertThat(u).isNotNull();
        assertThat(u.getId()).isEqualTo("u001");
        assertThat(u.getRole()).isEqualTo("部長");
    }

    @Test
    void findById_存在しない_ID_で_null_が_返る() {
        User u = userMapper.findById("nobody");

        assertThat(u).isNull();
    }

    @Test
    void findByRole_部分一致で_複数件_返る() {
        List<User> users = userMapper.findByRole("長");                   // ⑤

        assertThat(users).hasSize(3);                                     // 部長・課長・係長
        assertThat(users).extracting(User::getId)
            .containsExactly("u001", "u002", "u003");
    }

    @Test
    void findByRole_該当なし_で_空リスト_が_返る() {
        List<User> users = userMapper.findByRole("社長");

        assertThat(users).isEmpty();
    }

    @Test
    void updateRole_役職が_更新される() {
        int affected = userMapper.updateRole("u001", "本部長");           // ⑥

        assertThat(affected).isEqualTo(1);
        User u = userMapper.findById("u001");
        assertThat(u.getRole()).isEqualTo("本部長");
    }
}
```

> 💡 コード内の丸数字を押すと、その行の説明がポップアップで表示されます。

- **① `@MybatisTest`** — MyBatis 関連の Bean (Mapper / SqlSessionFactory / DataSource) **だけ**を起動する軽量テスト。`@SpringBootTest` のようにアプリ全体を起動しないので**数倍速い**。
- **② `@AutoConfigureTestDatabase(replace = Replace.NONE)`** — デフォルトでは MyBatisTest は「in-memory の別 DB」に置き換えようとする。本設定で「`application.properties` で設定した H2 をそのまま使う」に指示。
- **③ `@BeforeEach seed()`** — 各テストの前に**テストデータを準備**。`@MybatisTest` はデフォルトで**トランザクションをテスト終了時にロールバック**するので、テスト同士がデータで干渉しない。
- **④ `userMapper.findById("u001")`** — 実際に H2 に `SELECT ... WHERE id = 'u001'` が飛ぶ。**Mapper interface と XML の紐付けが正しくない場合、ここで `Invalid bound statement` エラーで検出される**。
- **⑤ `userMapper.findByRole("長")`** — 部分一致 SQL (`LIKE '%長%'`) の実挙動を確認。Mockito では絶対検出できない **SQL 側のバグ (LIKE パターン間違い、`||` 演算子の可否)** がここで捕まる。
- **⑥ `updateRole` の戻り値 = 影響行数**。1 件更新なら 1、0 件なら 0 (該当行なし)。**楽観ロック実装の基礎**にもなる知識。

---

## 実行

```powershell
mvn test
```

Step 13 と合わせて 12 テストが全通ればOK:
```
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## テストが検出する典型的な SQL バグ

| 症状 | 原因 | この Step で検出できる? |
|---|---|---|
| `Invalid bound statement` | XML の namespace と Java の完全修飾名がズレ | ✅ すぐ検出 |
| 列名 typo (`WHERE ic = ?`) | XML の SQL のミス | ✅ 検出 |
| `#{id}` を `${id}` にした | SQL インジェクション脆弱性 | ⚠️ 動作は同じなのでテストでは見えない — code review で拾う |
| LIKE のパターン間違い (`%%%role%%` にしてしまった) | XML の文字列連結ミス | ✅ 結果件数で検出 |
| MyBatis の `resultType` が Java クラスと不整合 | XML の resultType 属性ミス | ✅ フィールドが null になり検出 |

## よくある詰まり

- **DB 接続エラー** → `application.properties` の `spring.datasource.url` が test プロファイル用に上書きされていないか確認。テスト時も `jdbc:h2:mem:rolemgr` が使われるべき
- **`@MybatisTest` で `@Service` の Bean が見つからない** — 正解。`@MybatisTest` は Mapper 層だけ起動する。Service を含めたい場合は `@SpringBootTest` を使う
- **テストデータが残る** — デフォルトはロールバックされるので残らない。もし残る場合は `@Transactional` が効いていない (親クラス設定を確認)

## 次

→ [Step 15: MockMvc で Controller のリクエスト〜View 名検証](/steps-boot/15-controller-test)
