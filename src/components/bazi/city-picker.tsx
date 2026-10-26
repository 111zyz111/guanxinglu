"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { REGIONS } from "@/lib/regions";

export interface CityValue {
  name: string;
  longitude: number;
}

/**
 * 出生地选择
 *
 * 用可搜索的输入框代替 4000 项的下拉列表。
 * 选中后回填经度；也允许只填经度不填地名（海外出生）。
 */
export function CityPicker({
  value,
  onChange,
  invalid,
}: {
  value: CityValue | null;
  onChange: (v: CityValue | null) => void;
  invalid?: boolean;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const [manualLon, setManualLon] = useState<string>(
    value && !REGIONS.some(([n]) => n === value.name) ? String(value.longitude) : "",
  );
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return REGIONS.slice(0, 8);
    return REGIONS.filter(([n]) => n.includes(q)).slice(0, 8);
  }, [query]);

  const applyManual = (raw: string) => {
    setManualLon(raw);
    const n = Number(raw);
    if (raw.trim() && Number.isFinite(n) && n >= -180 && n <= 180) {
      onChange({ name: query.trim() || "自定义地点", longitude: n });
    } else if (!raw.trim()) {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <div ref={boxRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="输入城市名，如「杭州」"
          className={`input ${invalid ? "input-invalid" : ""}`}
          autoComplete="off"
          aria-label="出生地"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setManualLon("");
              onChange(null);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--text-muted)] hover:text-[var(--cinnabar)]"
            aria-label="清除出生地"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : null}

        {open && results.length > 0 ? (
          <ul
            className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto border border-[rgba(194,161,92,0.24)] bg-[#0b0f14] py-1 shadow-2xl"
            role="listbox"
          >
            {results.map(([name, lon]) => (
              <li key={`${name}-${lon}`}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(name);
                    setManualLon("");
                    onChange({ name, longitude: lon });
                    setOpen(false);
                  }}
                  className="flex w-full items-baseline justify-between px-3 py-2 text-left text-[0.8125rem] text-[var(--text-secondary)] hover:bg-[rgba(194,161,92,0.1)] hover:text-[var(--text-primary)]"
                  role="option"
                  aria-selected={value?.name === name}
                >
                  <span>{name}</span>
                  <span className="text-2xs tnum text-[var(--text-muted)]">东经 {lon}°</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xs text-[var(--text-muted)]">或直接填经度</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min={-180}
          max={180}
          value={manualLon}
          onChange={(e) => applyManual(e.target.value)}
          placeholder="116.40"
          className="input !w-28 !py-1.5 !text-[0.75rem]"
          aria-label="出生地经度"
        />
        <span className="text-2xs text-[var(--text-muted)]">°（东经为正，西经为负）</span>
      </div>

      {value ? (
        <p className="text-2xs text-[var(--text-muted)]">
          已选：{value.name}　东经 {value.longitude}°
        </p>
      ) : null}
    </div>
  );
}
