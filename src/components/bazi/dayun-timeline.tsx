"use client";

import { useMemo, useState } from "react";
import type { BaziChart } from "@/lib/bazi/types";
import { getTenGod } from "@/lib/bazi/engine";
import { ELEMENT_INK, GAN_ELEMENT } from "@/lib/bazi/constants";

/**
 * 大运时间轴
 * 横向可滚动，点击查看该运的流年。
 */
export function DaYunTimeline({ chart }: { chart: BaziChart }) {
  const yun = chart.yun;
  const currentYear = new Date().getFullYear();

  const entries = useMemo(() => (yun ? yun.daYun.filter((d) => d.ganZhi) : []), [yun]);
  const currentIndex = entries.findIndex(
    (d) => currentYear >= d.startYear && currentYear <= d.endYear,
  );

  const [selected, setSelected] = useState<number>(currentIndex >= 0 ? currentIndex : 0);

  if (!yun || entries.length === 0) {
    return (
      <div className="panel p-6">
        <p className="text-[0.8125rem] leading-[1.8] text-[var(--text-muted)]">
          未推大运。大运需以性别定顺逆（阳男阴女顺排、阴男阳女逆排），
          回到表单补充性别即可查看。
        </p>
      </div>
    );
  }

  const active = entries[selected];
  const activeTenGod = getTenGod(chart.dayMaster.gan, active.ganZhi[0]);

  return (
    <div className="panel p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-serif text-base tracking-[0.08em] text-[var(--text-primary)]">
          大运
        </h3>
        <p className="text-2xs tracking-[0.12em] text-[var(--text-muted)]">
          {yun.forward ? "顺排" : "逆排"}　{yun.startYear} 年 {yun.startMonth} 个月起运　
          <span className="tnum">{yun.startSolar}</span>
        </p>
      </div>

      {/* 时间轴 */}
      <div className="-mx-1 overflow-x-auto pb-3">
        <div className="flex min-w-max gap-1.5 px-1">
          {entries.map((d, i) => {
            const isCurrent = i === currentIndex;
            const isSelected = i === selected;
            return (
              <button
                key={`${d.ganZhi}-${d.startYear}`}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={isSelected}
                className={`group relative w-[4.6rem] shrink-0 border px-1 py-3 text-center transition-all duration-400 ${
                  isSelected
                    ? "border-[rgba(194,161,92,0.55)] bg-[rgba(194,161,92,0.1)]"
                    : "border-[rgba(194,161,92,0.12)] hover:border-[rgba(194,161,92,0.32)]"
                }`}
              >
                {isCurrent ? (
                  <span className="absolute inset-x-0 -top-px h-px bg-[var(--gold)]" aria-hidden="true" />
                ) : null}
                <span
                  className="block font-serif text-[1.15rem] leading-tight"
                  style={{ color: ELEMENT_INK[GAN_ELEMENT[d.ganZhi[0]]] ?? undefined }}
                >
                  <span className="text-[var(--text-primary)]">{d.ganZhi}</span>
                </span>
                <span className="mt-1 block text-[0.5625rem] tnum tracking-[0.06em] text-[var(--text-muted)]">
                  {d.startAge}–{d.endAge} 岁
                </span>
                <span className="block text-[0.5rem] tnum text-[var(--text-muted)]">
                  {d.startYear}
                </span>
                {isCurrent ? (
                  <span className="mt-1 block text-[0.5rem] tracking-[0.16em] text-[var(--gold)]">
                    当前
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* 选中运的流年 */}
      {active ? (
        <div className="mt-4 border-t border-[rgba(194,161,92,0.14)] pt-4">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-serif text-sm text-[var(--text-primary)]">
              {active.ganZhi} 运
            </p>
            <p className="text-2xs tracking-[0.1em] text-[var(--text-muted)]">
              <span className="tnum">
                {active.startYear}–{active.endYear}
              </span>
              　{active.startAge}–{active.endAge} 岁　天干{active.ganZhi[0]}为
              <span className="text-[var(--gold)]">{activeTenGod}</span>
            </p>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
            {active.liuNian.map((ln) => {
              const isNow = ln.year === currentYear;
              return (
                <div
                  key={ln.year}
                  className={`border px-1 py-2 text-center ${
                    isNow
                      ? "border-[rgba(168,65,47,0.5)] bg-[rgba(168,65,47,0.08)]"
                      : "border-[rgba(194,161,92,0.1)]"
                  }`}
                >
                  <p className="font-serif text-[0.8125rem] text-[var(--text-primary)]">
                    {ln.ganZhi}
                  </p>
                  <p className="mt-0.5 text-[0.5rem] tnum text-[var(--text-muted)]">{ln.year}</p>
                  <p className="text-[0.5rem] text-[var(--text-muted)]">{ln.tenGod}</p>
                </div>
              );
            })}
          </div>

          {yun.hourAssumed ? (
            <p className="mt-3 text-[0.7rem] leading-relaxed text-[var(--text-muted)]">
              时辰未知，起运时间以正午代入推算，实际年份可能有数月偏差。
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
