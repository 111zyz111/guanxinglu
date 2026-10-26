"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadHistory, deleteRecord, type HistoryRecord } from "@/lib/storage";
import { EmptyState } from "@/components/ui/empty-state";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function RecentRecords({ limit = 3 }: { limit?: number }) {
  const [records, setRecords] = useState<HistoryRecord[] | null>(null);

  useEffect(() => {
    setRecords(loadHistory());
  }, []);

  // 加载中：保持占位高度，避免布局跳动
  if (records === null) {
    return (
      <div className="grid gap-3 sm:grid-cols-3" aria-hidden="true">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="panel h-[5.5rem] animate-pulse opacity-40" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        title="还没有记录"
        description="完成一次排盘或起卦后，结果会保存在这台设备的浏览器里，可随时回看或删除。"
        action={
          <Link href="/bazi" className="btn btn-ghost">
            去排一次盘
          </Link>
        }
        icon="录"
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {records.slice(0, limit).map((r) => (
        <li key={r.id} className="panel panel-hover group relative">
          <Link href={r.href} className="block px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-2xs tracking-[0.2em] text-[var(--gold)]">
                {r.type === "bazi" ? "排盘" : "起卦"}
              </span>
              <span className="text-[0.625rem] tnum text-[var(--text-muted)]">
                {formatTime(r.createdAt)}
              </span>
            </div>
            <p className="mt-2 font-serif text-[0.9375rem] text-[var(--text-primary)]">
              {r.title}
            </p>
            <p className="mt-1 line-clamp-1 text-[0.75rem] text-[var(--text-muted)]">
              {r.summary}
            </p>
          </Link>
          <button
            type="button"
            onClick={() => setRecords(deleteRecord(r.id))}
            className="absolute right-2 top-2 rounded p-1.5 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--cinnabar)] focus-visible:opacity-100 group-hover:opacity-100"
            aria-label={`删除记录 ${r.title}`}
            title="删除这条记录"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
