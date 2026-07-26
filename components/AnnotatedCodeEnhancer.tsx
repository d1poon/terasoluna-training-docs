"use client";
import { useEffect } from "react";

/**
 * AnnotatedCodeEnhancer — 番号付きコード注釈のポップオーバー表示
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
 * 動作:
 * - コード内の ①〜⑩ を丸バッジ化 (data-anno-mark 付き)
 * - 直後の <li>/<p> の <strong>①〜⑩</strong> ... を data-anno-note でマーク (中身がポップアップ本体になる)
 * - バッジをクリック / タップ → その注釈のポップアップを表示
 * - 外側クリック / Esc / スクロールで閉じる
 * - キーボード: Tab で バッジフォーカス → Enter/Space で開閉
 */

const CIRCLED_MAP: Record<string, number> = {
  "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5,
  "⑥": 6, "⑦": 7, "⑧": 8, "⑨": 9, "⑩": 10,
};

let popoverEl: HTMLDivElement | null = null;
let activeMark: HTMLElement | null = null;

export function AnnotatedCodeEnhancer() {
  useEffect(() => {
    const t = setTimeout(enhance, 200);
    return () => clearTimeout(t);
  }, []);
  return null;
}

function enhance() {
  // .prose 内だけでなく tsx ページの全 pre code を対象に。
  // ①〜⑩ 検出ガード (下の hasCircled) で無関係な code は素通り
  const codes = document.querySelectorAll<HTMLElement>("pre code");
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
  wireInteraction();
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
    const parts = text.split(/([①②③④⑤⑥⑦⑧⑨⑩])/);
    if (parts.length === 1) return;
    const frag = document.createDocumentFragment();
    parts.forEach((p) => {
      if (CIRCLED_MAP[p]) {
        const badge = document.createElement("button");
        badge.type = "button";
        badge.className = "anno-badge";
        badge.setAttribute("data-anno-mark", String(CIRCLED_MAP[p]));
        badge.setAttribute("data-anno-group", gid);
        badge.setAttribute(
          "aria-label",
          `注釈 ${CIRCLED_MAP[p]} 番を開く`
        );
        badge.setAttribute("aria-haspopup", "dialog");
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

function wireInteraction() {
  const doc = document as unknown as { __annoWired?: boolean };
  if (doc.__annoWired) return;
  doc.__annoWired = true;

  // クリック (デスクトップ + モバイル 共通): badge タップで popover 開閉
  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;

    // Close button of popover
    if (t.closest(".anno-popover-close")) {
      closePopover();
      return;
    }

    // Badge を押した
    const mark = t.closest("[data-anno-mark]") as HTMLElement | null;
    if (mark) {
      e.preventDefault();
      e.stopPropagation();
      if (activeMark === mark) {
        closePopover();
      } else {
        showPopover(mark);
      }
      return;
    }

    // popover 外をクリック → 閉じる
    if (popoverEl && !t.closest(".anno-popover")) {
      closePopover();
    }
  });

  // Esc で閉じる、Enter/Space で開閉
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePopover();
      return;
    }
    const focused = document.activeElement as HTMLElement | null;
    if (
      focused &&
      focused.matches("[data-anno-mark]") &&
      (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      if (activeMark === focused) {
        closePopover();
      } else {
        showPopover(focused);
      }
    }
  });

  // スクロールで閉じる — ただしモバイルの場合は popover が bottom-sheet 固定なので閉じない
  // (iOS Safari のバウンス scroll でタップ直後に即座に閉じる誤動作を防ぐ)
  let scrollBaseY = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (!popoverEl) return;
      if (isMobileViewport()) return; // モバイルは fixed 位置なので閉じない
      // デスクトップでも 30px 以上の意図的スクロールでのみ閉じる
      if (Math.abs(window.scrollY - scrollBaseY) > 30) {
        closePopover();
      }
    },
    { passive: true, capture: true }
  );
  // popover 表示時に scrollBaseY を初期化するため、showPopover から呼び出せるように window に保持
  (window as unknown as { __annoScrollBaseSet?: (y: number) => void }).__annoScrollBaseSet =
    (y: number) => (scrollBaseY = y);

  // リサイズで閉じる (viewport 変化で位置が破綻するため)
  window.addEventListener("resize", () => {
    if (popoverEl) closePopover();
  });
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 639px)").matches;
}

function showPopover(mark: HTMLElement) {
  closePopover();

  const gid = mark.dataset.annoGroup;
  const n = mark.dataset.annoMark;
  if (!gid || !n) return;

  const note = document.querySelector(
    `[data-anno-group="${gid}"][data-anno-note="${n}"]`
  ) as HTMLElement | null;
  if (!note) return;

  popoverEl = document.createElement("div");
  popoverEl.className = "anno-popover";
  popoverEl.setAttribute("role", "dialog");
  popoverEl.setAttribute("aria-modal", "false");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "anno-popover-close";
  closeBtn.setAttribute("aria-label", "閉じる");
  closeBtn.textContent = "✕";

  const body = document.createElement("div");
  body.className = "anno-popover-body";
  // Note (li or p) の中身をそのままコピー
  body.innerHTML = note.innerHTML;

  popoverEl.appendChild(closeBtn);
  popoverEl.appendChild(body);
  document.body.appendChild(popoverEl);

  // モバイルは CSS で bottom-sheet 固定にしているので位置計算スキップ
  if (!isMobileViewport()) {
    positionPopover(mark, popoverEl);
  }

  // スクロール基準を今の位置に更新 (誤動作防止)
  const setter = (window as unknown as { __annoScrollBaseSet?: (y: number) => void })
    .__annoScrollBaseSet;
  if (setter) setter(window.scrollY);

  activeMark = mark;
  mark.setAttribute("aria-expanded", "true");
}

function positionPopover(mark: HTMLElement, popover: HTMLDivElement) {
  const rect = mark.getBoundingClientRect();
  const popRect = popover.getBoundingClientRect();
  const gap = 10;
  const margin = 8;

  // 垂直方向: 下にスペースあれば下、なければ上
  let top: number;
  let placement: "below" | "above";
  if (
    rect.bottom + popRect.height + gap > window.innerHeight &&
    rect.top > popRect.height + gap
  ) {
    top = rect.top - popRect.height - gap + window.scrollY;
    placement = "above";
  } else {
    top = rect.bottom + gap + window.scrollY;
    placement = "below";
  }
  popover.classList.add(
    placement === "below" ? "anno-popover--below" : "anno-popover--above"
  );

  // 水平方向: badge の左端に揃える。画面外なら調整
  let left = rect.left + window.scrollX - 4;
  const maxLeft =
    window.innerWidth + window.scrollX - popRect.width - margin;
  const minLeft = window.scrollX + margin;
  if (left > maxLeft) left = maxLeft;
  if (left < minLeft) left = minLeft;

  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;

  // 矢印の位置調整 (badge の中心を指すように)
  const badgeCenterX = rect.left + rect.width / 2 + window.scrollX;
  const arrowOffset = badgeCenterX - left - 6;
  popover.style.setProperty(
    "--anno-arrow-left",
    `${Math.max(12, Math.min(popRect.width - 20, arrowOffset))}px`
  );
}

function closePopover() {
  if (popoverEl) {
    popoverEl.remove();
    popoverEl = null;
  }
  if (activeMark) {
    activeMark.removeAttribute("aria-expanded");
    activeMark = null;
  }
}
