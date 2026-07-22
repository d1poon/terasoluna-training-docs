"use client";
import Link from "next/link";
import { useState } from "react";
import type { StepMeta } from "@/lib/steps";

type PhaseGroup = {
  key: string;
  emoji: string;
  name: string;
  desc: string;
  stepNumbers: number[];
};

const PHASE_GROUPS: PhaseGroup[] = [
  {
    key: "setup",
    emoji: "🔧",
    name: "下ごしらえ",
    desc: "01-02",
    stepNumbers: [0, 1, 2],
  },
  {
    key: "backend",
    emoji: "⚙️",
    name: "裏側 (Backend)",
    desc: "03-06",
    stepNumbers: [3, 4, 5, 6],
  },
  {
    key: "frontend",
    emoji: "🎨",
    name: "画面 (Frontend)",
    desc: "07-11",
    stepNumbers: [7, 8, 9, 10, 11],
  },
  {
    key: "wrap",
    emoji: "🎉",
    name: "完成",
    desc: "12",
    stepNumbers: [12],
  },
];

function findPhaseForStep(stepNum: number | undefined): string | null {
  if (stepNum === undefined) return null;
  const g = PHASE_GROUPS.find((p) => p.stepNumbers.includes(stepNum));
  return g?.key ?? null;
}

export function Sidebar({
  steps,
  currentSlug,
}: {
  steps: StepMeta[];
  currentSlug?: string;
}) {
  const currentStep = steps.find((s) => s.slug === currentSlug);
  const currentPhase = findPhaseForStep(currentStep?.number);
  const initialOpen = new Set<string>(currentPhase ? [currentPhase] : ["setup"]);

  const [openPhases, setOpenPhases] = useState<Set<string>>(initialOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  function togglePhase(key: string) {
    setOpenPhases((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return s;
    });
  }

  const stepsByNumber = new Map(steps.map((s) => [s.number, s]));

  const brandBlock = (
    <Link href="/" onClick={() => setMobileOpen(false)} className="block">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        TERASOLUNA 研修
      </div>
      <div className="text-base font-bold mt-1 text-slate-900 leading-tight">
        役職編集アプリ<br />
        組立ガイド
      </div>
    </Link>
  );

  const sidebarBody = (
    <>
      <div className="p-5 border-b border-slate-200">{brandBlock}</div>

      <nav className="p-3">
        {/* First-time visitor */}
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1 px-2">
          はじめに
        </div>
        <ul className="mb-4 space-y-0.5">
          <li>
            <Link
              href="/preface"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-brand/10 text-brand-dark font-semibold hover:bg-brand/20"
            >
              <span className="text-base">📗</span>
              <span>まず最初に読む</span>
            </Link>
          </li>
          <li>
            <Link
              href="/build-order"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className="text-base">✅</span>
              <span>作成順チェックリスト</span>
            </Link>
          </li>
          <li>
            <Link
              href="/how-to"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-orange-50 text-orange-900 font-semibold hover:bg-orange-100"
            >
              <span className="text-base">🍳</span>
              <span>「〜するには?」レシピ集</span>
            </Link>
          </li>
          <li>
            <Link
              href="/glossary"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className="text-base">📖</span>
              <span>用語集</span>
            </Link>
          </li>
          <li>
            <Link
              href="/spring-vs-terasoluna"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className="text-base">⚖️</span>
              <span>Boot vs TERASOLUNA</span>
            </Link>
          </li>
          <li>
            <Link
              href="/terasoluna-multi-project"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className="text-base">🧱</span>
              <span>TERASOLUNA マルチプロジェクト</span>
            </Link>
          </li>
        </ul>

        {/* Overview */}
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 px-2">
          Overview
        </div>
        <ul className="mb-4 space-y-0.5">
          <li>
            <Link
              href="/architecture"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className="text-base">🏛</span>
              <span>アーキテクチャ全体図</span>
            </Link>
          </li>
          <li>
            <Link
              href="/playground"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className="text-base">🕹</span>
              <span>触ってみるデモ</span>
            </Link>
          </li>
        </ul>

        {/* Steps grouped by phase (collapsible) */}
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 px-2">
          Steps
        </div>
        <ul className="space-y-1">
          {PHASE_GROUPS.map((phase) => {
            const isOpen = openPhases.has(phase.key);
            const phaseSteps = phase.stepNumbers
              .map((n) => stepsByNumber.get(n))
              .filter((s): s is StepMeta => Boolean(s));
            if (phaseSteps.length === 0) return null;
            const hasActive = phaseSteps.some((s) => s.slug === currentSlug);

            return (
              <li key={phase.key}>
                <button
                  type="button"
                  onClick={() => togglePhase(phase.key)}
                  className={
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors " +
                    (hasActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-100")
                  }
                >
                  <span className="text-base leading-none">{phase.emoji}</span>
                  <span className="flex-1 text-left leading-tight">
                    {phase.name}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">
                    {phase.desc}
                  </span>
                  <span
                    className={
                      "text-slate-400 text-xs transition-transform " +
                      (isOpen ? "rotate-90" : "")
                    }
                  >
                    ▸
                  </span>
                </button>

                {isOpen && (
                  <ul className="ml-2 mt-1 mb-2 border-l border-slate-200 pl-1 space-y-0.5">
                    {phaseSteps.map((step) => {
                      const active = step.slug === currentSlug;
                      return (
                        <li key={step.slug}>
                          <Link
                            href={`/steps/${step.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className={
                              "flex items-baseline gap-2 px-3 py-1.5 rounded-md text-sm transition-colors " +
                              (active
                                ? "bg-brand text-white font-semibold"
                                : "text-slate-700 hover:bg-slate-100")
                            }
                          >
                            <span
                              className={
                                "font-mono text-[11px] " +
                                (active ? "text-white/80" : "text-slate-400")
                              }
                            >
                              {String(step.number).padStart(2, "0")}
                            </span>
                            <span className="leading-tight">{step.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
        <p>Spring Boot 3.4 + JSP + MyBatis + H2</p>
        <p className="mt-1">教える立場のあなたのための教材</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="min-w-0">{brandBlock}</div>
        <button
          type="button"
          aria-label="メニュー"
          onClick={() => setMobileOpen(true)}
          className="ml-3 shrink-0 px-3 py-1.5 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
        >
          ☰ メニュー
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 z-50 w-72 max-w-[85vw] h-screen bg-white overflow-y-auto shadow-2xl">
            <div className="flex justify-end p-2">
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-1 text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>
            {sidebarBody}
          </aside>
        </>
      )}

      {/* Desktop sidebar (fixed, always visible on md+) */}
      <aside className="hidden md:block md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto bg-white border-r border-slate-200">
        {sidebarBody}
      </aside>
    </>
  );
}
