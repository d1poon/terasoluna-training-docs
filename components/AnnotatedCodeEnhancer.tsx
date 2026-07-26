"use client";
import { useEffect } from "react";

/**
 * AnnotatedCodeEnhancer — 番号付きコード注釈の相互ハイライト
 *
 * Markdown の書き方:
 *   ```java
 *   @GetMapping("/x")                 // ①
 *   public String view(...) {         // ②
 *   }
 *   ```
 *
 *   - **① @GetMapping** — この URL を担当
 *   - **② メソッドシグネチャ** — 引数は Spring が渡す
 *
 * このコンポーネントが以下を行う:
 * - コード内の ①〜⑩ 文字を丸バッジに変換
 * - 直後の <ul>/<ol>/<p> で「<strong>①〜⑩</strong>」から始まる項目に data-anno-note を付ける
 * - コード側 badge と 注釈側 note を data-anno-group で同グループ化
 * - hover でグループ内の同番号を相互ハイライト
 */

const CIRCLED_MAP: Record<string, number> = {
  "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5,
  "⑥": 6, "⑦": 7, "⑧": 8, "⑨": 9, "⑩": 10,
};

export function AnnotatedCodeEnhancer() {
  useEffect(() => {
    // ページの hydration 完了を待って走査
    const t = setTimeout(enhance, 200);
    return () => clearTimeout(t);
  }, []);
  return null;
}

function enhance() {
  const codes = document.querySelectorAll<HTMLElement>(".prose pre code");
  let groupId = 0;
  codes.forEach((code) => {
    if (code.dataset.annoProcessed) return;
    const hasCircled = /[①②③④⑤⑥⑦⑧⑨⑩]/.test(code.textContent ?? "");
    if (!hasCircled) return;
    code.dataset.annoProcessed = "1";
    groupId++;
    const gid = String(groupId);
    wrapCircled(code, gid);
    const pre = code.closest("pre");
    if (pre) wrapNotes(pre, gid);
  });
  wireHover();
}

function wrapCircled(root: HTMLElement, gid: string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.textContent && /[①②③④⑤⑥⑦⑧⑨⑩]/.test(n.textContent)) {
      nodes.push(n as Text);
    }
  }
  nodes.forEach((textNode) => {
    const text = textNode.textContent ?? "";
    const re = /([①②③④⑤⑥⑦⑧⑨⑩])/g;
    if (!re.test(text)) return;
    const parts = text.split(/([①②③④⑤⑥⑦⑧⑨⑩])/);
    const frag = document.createDocumentFragment();
    parts.forEach((p) => {
      if (CIRCLED_MAP[p]) {
        const badge = document.createElement("span");
        badge.className = "anno-badge";
        badge.setAttribute("data-anno-mark", String(CIRCLED_MAP[p]));
        badge.setAttribute("data-anno-group", gid);
        badge.setAttribute("role", "button");
        badge.setAttribute("tabindex", "0");
        badge.setAttribute("aria-label", `注釈 ${CIRCLED_MAP[p]} 番`);
        badge.textContent = p;
        frag.appendChild(badge);
      } else if (p) {
        frag.appendChild(document.createTextNode(p));
      }
    });
    textNode.parentNode?.replaceChild(frag, textNode);
  });
}

function wrapNotes(pre: Element, gid: string) {
  let el = pre.nextElementSibling;
  let scanned = 0;
  const stopTags = new Set(["PRE", "H1", "H2", "H3", "H4", "HR"]);
  while (el && scanned < 15) {
    if (stopTags.has(el.tagName)) break;
    // <strong> の先頭 1 文字が丸数字なら、その container (li or p) を note 化
    const strongs = el.querySelectorAll("strong");
    strongs.forEach((s) => {
      const first = (s.textContent ?? "").charAt(0);
      const num = CIRCLED_MAP[first];
      if (!num) return;
      const container =
        (s.closest("li") as HTMLElement | null) ??
        (s.closest("p") as HTMLElement | null);
      if (container && !container.hasAttribute("data-anno-note")) {
        container.setAttribute("data-anno-note", String(num));
        container.setAttribute("data-anno-group", gid);
      }
    });
    scanned++;
    el = el.nextElementSibling;
  }
}

function wireHover() {
  const doc = document as unknown as { __annoHoverWired?: boolean };
  if (doc.__annoHoverWired) return;
  doc.__annoHoverWired = true;

  document.addEventListener("mouseover", (e) => {
    const t = e.target as HTMLElement;
    const mark = t.closest("[data-anno-mark]") as HTMLElement | null;
    if (mark) {
      activate(mark.dataset.annoGroup!, mark.dataset.annoMark!);
      return;
    }
    const note = t.closest("[data-anno-note]") as HTMLElement | null;
    if (note) {
      activate(note.dataset.annoGroup!, note.dataset.annoNote!);
    }
  });
  document.addEventListener("mouseout", (e) => {
    const t = e.target as HTMLElement;
    const rel = (e as MouseEvent).relatedTarget as HTMLElement | null;
    if (
      t.closest("[data-anno-mark], [data-anno-note]") &&
      !rel?.closest("[data-anno-mark], [data-anno-note]")
    ) {
      deactivateAll();
    }
  });
  // クリック (モバイル・キーボード) 対応: badge タップで対応 note にスクロール + 一時ハイライト
  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const mark = t.closest("[data-anno-mark]") as HTMLElement | null;
    if (!mark) return;
    const gid = mark.dataset.annoGroup!;
    const n = mark.dataset.annoMark!;
    activate(gid, n);
    const note = document.querySelector(
      `[data-anno-group="${gid}"][data-anno-note="${n}"]`
    ) as HTMLElement | null;
    if (note) {
      note.scrollIntoView({ behavior: "smooth", block: "nearest" });
      window.setTimeout(deactivateAll, 2000);
    }
  });
}

function activate(gid: string, n: string) {
  deactivateAll();
  document
    .querySelectorAll(
      `[data-anno-group="${gid}"][data-anno-mark="${n}"], [data-anno-group="${gid}"][data-anno-note="${n}"]`
    )
    .forEach((el) => el.classList.add("anno-active"));
}

function deactivateAll() {
  document
    .querySelectorAll(".anno-active")
    .forEach((el) => el.classList.remove("anno-active"));
}
