"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  loadHistory,
  deleteRecord,
  clearHistory,
  isStorageAvailable,
  estimateStorageSize,
  type HistoryRecord,
} from "@/lib/storage";
import { EmptyState, Callout } from "@/components/ui/empty-state";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

type Filter = "all" | "bazi" | "yijing";

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  const [size, setSize] = useState(0);

  useEffect(() => {
    setRecords(loadHistory());
    setStorageOk(isStorageAvailable());
    setSize(estimateStorageSize());
  }, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    return filter === "all" ? records : records.filter((r) => r.type === filter);
  }, [records, filter]);

  function remove(id: string) {
    const next = deleteRecord(id);
    setRecords(next);
    setPendingDelete(null);
    setSize(estimateStorageSize());
  }

  function clearAll() {
    clearHistory();
    setRecords([]);
    setConfirmClear(false);
    setSize(0);
  }

  return (
    <div className="shell-narrow pb-24 pt-12">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">记录 · 本地</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-[1.9rem] leading-tight tracking-[0.04em] text-[var(--text-primary)]">
              本地记录
            </h1>
            <p className="mt-3 max-w-md text-pretty text-[0.875rem] leading-[1.9] text-[var(--text-secondary)]">
              这些记录只存在这台设备的浏览器里，没有账号、没有云端同步，也没有任何上传。
              删除即从本地抹去，不可恢复。
            </p>
          </div>
          {records && records.length > 0 ? (
            <div className="shrink-0">
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={clearAll} className="btn btn-ghost !border-[rgba(168,65,47,0.5)] !text-[var(--cinnabar)] !py-2 !text-[0.75rem]">
                    确认全部删除
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="btn btn-quiet !py-2 !text-[0.75rem]"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="btn btn-quiet !py-2 !text-[0.75rem]"
                >
                  清空全部
                </button>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {!storageOk ? (
        <div className="mb-5">
          <Callout tone="warn" title="浏览器存储不可用">
            当前浏览器禁用了本地存储（可能处于隐私模式）。排盘与起卦仍可正常使用，
            但结果无法保存，关闭页面后即丢失。
          </Callout>
        </div>
      ) : null}

      {/* 筛选 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="seg" role="group" aria-label="记录类型">
          {[
            { v: "all" as Filter, l: "全部" },
            { v: "bazi" as Filter, l: "排盘" },
            { v: "yijing" as Filter, l: "起卦" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              className="seg-item"
              data-active={filter === o.v}
              aria-pressed={filter === o.v}
              onClick={() => setFilter(o.v)}
            >
              {o.l}
            </button>
          ))}
        </div>
        {records ? (
          <span className="text-2xs tracking-[0.1em] text-[var(--text-muted)]">
            共 {records.length} 条　占用约 {(size / 1024).toFixed(1)} KB
          </span>
        ) : null}
      </div>

      {/* 列表 */}
      {records === null ? (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="panel h-[4.5rem] animate-pulse opacity-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="录"
          title={records.length === 0 ? "还没有记录" : "这一类还没有记录"}
          description={
            records.length === 0
              ? "完成一次排盘或起卦后，结果会保存在这里，可随时回看或删除。"
              : "切换到「全部」看看，或去做一次新的测算。"
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/bazi" className="btn btn-primary">
                去排盘
              </Link>
              <Link href="/yijing" className="btn btn-ghost">
                去起卦
              </Link>
            </div>
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <li key={r.id} className="panel group relative">
              <div className="flex items-stretch">
                <Link href={r.href} className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3.5 sm:px-5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border font-serif text-[0.75rem] ${
                      r.type === "bazi"
                        ? "border-[rgba(194,161,92,0.3)] text-[var(--gold)]"
                        : "border-[rgba(79,127,107,0.4)] text-[#7fb59c]"
                    }`}
                    aria-hidden="true"
                  >
                    {r.type === "bazi" ? "柱" : "卦"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="font-serif text-[0.9375rem] tracking-[0.04em] text-[var(--text-primary)]">
                        {r.title}
                      </span>
                      <span className="text-[0.625rem] tnum text-[var(--text-muted)]">
                        {formatTime(r.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[0.75rem] text-[var(--text-secondary)]">
                      {r.summary}
                    </span>
                  </span>
                  <span className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>

                <div className="flex items-center border-l border-[rgba(194,161,92,0.1)] px-2">
                  {pendingDelete === r.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        className="px-2 py-1 text-[0.6875rem] text-[var(--cinnabar)] hover:underline"
                      >
                        删除
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(null)}
                        className="px-2 py-1 text-[0.6875rem] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(r.id)}
                      className="rounded p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--cinnabar)]"
                      aria-label={`删除记录 ${r.title}`}
                      title="删除这条记录"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Callout tone="note" title="关于这些数据">
          记录包含出生日期、时间与出生地经度。它们没有被发送到任何服务器，
          但如果你在共用设备上使用本工具，建议用完清除。
          分享链接时，链接里会带上排盘参数——发送前请确认对方可以知道这些信息。
        </Callout>
      </div>
    </div>
  );
}
