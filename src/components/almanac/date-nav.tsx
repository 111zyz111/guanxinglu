"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** 黄历页的日期导航：前一天 / 今天 / 后一天 + 直接选日期 */
export function DateNav({ current }: { current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);

  function go(date: string) {
    router.push(`/almanac?d=${date}`);
  }

  function shift(days: number) {
    const [y, m, d] = current.split("-").map(Number);
    const t = new Date(Date.UTC(y, m - 1, d));
    t.setUTCDate(t.getUTCDate() + days);
    const iso = t.toISOString().slice(0, 10);
    setValue(iso);
    go(iso);
  }

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => shift(-1)} className="btn btn-ghost !px-3 !py-2" aria-label="前一天">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <input
        type="date"
        value={value}
        min="1900-01-01"
        max="2100-12-31"
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value) go(e.target.value);
        }}
        className="input !w-auto !py-2 text-[0.8125rem]"
        aria-label="选择日期"
      />

      <button type="button" onClick={() => shift(1)} className="btn btn-ghost !px-3 !py-2" aria-label="后一天">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {current !== todayIso ? (
        <button type="button" onClick={() => go(todayIso)} className="btn btn-quiet !py-2">
          回到今天
        </button>
      ) : null}
    </div>
  );
}
