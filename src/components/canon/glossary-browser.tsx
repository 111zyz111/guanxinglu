"use client";

import { useMemo, useState } from "react";
import { GLOSSARY, type GlossaryEntry } from "@/lib/glossary";

const CATEGORIES: (GlossaryEntry["category"] | "全部")[] = [
  "全部",
  "基础",
  "结构",
  "十神",
  "历法",
  "占卜",
];

export function GlossaryBrowser({
  initialQuery = "",
  initialCategory = "全部",
}: {
  initialQuery?: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<GlossaryEntry["category"] | "全部">(
    CATEGORIES.includes(initialCategory as never)
      ? (initialCategory as GlossaryEntry["category"] | "全部")
      : "全部",
  );
  const [open, setOpen] = useState<string | null>(null);

  const results = useMemo(() => {
    const k = query.trim().toLowerCase();
    return GLOSSARY.filter((g) => {
      if (category !== "全部" && g.category !== category) return false;
      if (!k) return true;
      return (
        g.term.toLowerCase().includes(k) ||
        (g.pinyin ?? "").toLowerCase().includes(k) ||
        g.definition.toLowerCase().includes(k) ||
        (g.detail ?? "").toLowerCase().includes(k)
      );
    });
  }, [query, category]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { 全部: GLOSSARY.length };
    for (const g of GLOSSARY) map[g.category] = (map[g.category] ?? 0) + 1;
    return map;
  }, []);

  return (
    <div>
      {/* 检索 */}
      <div className="panel p-4 sm:p-5">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6" />
            <path d="M15 15l4.5 4.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索术语、释义或拼音，如「藏干」「真太阳时」「shi shen」"
            className="input !pl-9"
            aria-label="搜索术语"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`border px-2.5 py-1 text-[0.6875rem] tracking-[0.1em] transition-colors duration-300 ${
                category === c
                  ? "border-[rgba(194,161,92,0.5)] bg-[rgba(194,161,92,0.12)] text-[var(--gold-soft)]"
                  : "border-[rgba(194,161,92,0.16)] text-[var(--text-muted)] hover:border-[rgba(194,161,92,0.34)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {c}
              <span className="ml-1.5 tnum opacity-60">{counts[c] ?? 0}</span>
            </button>
          ))}
        </div>

        <p className="mt-3 text-2xs text-[var(--text-muted)]">
          共 {results.length} 条{query ? `（关键词「${query}」）` : ""}
        </p>
      </div>

      {/* 结果 */}
      {results.length === 0 ? (
        <div className="mt-4 rounded-sm border border-dashed border-[rgba(194,161,92,0.18)] px-6 py-14 text-center">
          <p className="font-serif text-[1.05rem] text-[var(--text-secondary)]">没有匹配的条目</p>
          <p className="mt-2 text-[0.75rem] text-[var(--text-muted)]">
            试试更短的关键词，或切换到「全部」分类。
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("全部");
            }}
            className="btn btn-ghost mt-5 !py-2 !text-[0.75rem]"
          >
            清空条件
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-px overflow-hidden border border-[rgba(194,161,92,0.14)] md:grid-cols-2">
          {results.map((g) => {
            const isOpen = open === g.term;
            return (
              <article
                key={g.term}
                className={`bg-[rgba(12,16,22,0.55)] transition-colors duration-300 ${
                  isOpen ? "bg-[rgba(194,161,92,0.05)]" : "hover:bg-[rgba(194,161,92,0.03)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : g.term)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span>
                    <span className="flex flex-wrap items-baseline gap-2">
                      <span className="font-serif text-[1.05rem] tracking-[0.06em] text-[var(--text-primary)]">
                        {g.term}
                      </span>
                      {g.pinyin ? (
                        <span className="text-[0.625rem] tracking-[0.12em] text-[var(--text-muted)]">
                          {g.pinyin}
                        </span>
                      ) : null}
                      <span className="border border-[rgba(194,161,92,0.22)] px-1.5 py-0.5 text-[0.5rem] tracking-[0.14em] text-[var(--gold)]">
                        {g.category}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-[1.85] text-[var(--text-secondary)]">
                      {g.definition}
                    </span>
                  </span>
                  <span
                    className={`mt-1 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-400 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-[rgba(194,161,92,0.12)] px-5 py-3.5 text-[0.75rem] leading-[1.9] text-[var(--text-muted)]">
                      {g.detail ?? "暂无进一步说明。"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
