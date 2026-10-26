"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LunarYear } from "lunar-typescript";
import { validateBirthInput } from "@/lib/bazi/engine";
import { encodeBirthInput, loadSettings } from "@/lib/storage";
import type { BirthInput, Gender } from "@/lib/bazi/types";
import { CityPicker, type CityValue } from "@/components/bazi/city-picker";
import { Callout } from "@/components/ui/empty-state";

const CURRENT_YEAR = new Date().getFullYear();

function lunarMonthOptions(year: number) {
  if (!year) return [];
  try {
    const ly = LunarYear.fromYear(year);
    const leap = ly.getLeapMonth();
    const opts: { value: string; label: string; month: number; leap: boolean }[] = [];
    for (let m = 1; m <= 12; m++) {
      opts.push({ value: String(m), label: `${m} 月`, month: m, leap: false });
    }
    if (leap > 0) {
      opts.push({ value: `leap-${leap}`, label: `闰 ${leap} 月`, month: leap, leap: true });
    }
    return opts;
  } catch {
    return [];
  }
}

function lunarDayCount(year: number, month: number, leap: boolean): number {
  if (!year || !month) return 30;
  try {
    const ly = LunarYear.fromYear(year);
    const m = ly.getMonth(leap ? -month : month);
    return m ? m.getDayCount() : 30;
  } catch {
    return 30;
  }
}

export default function BaziFormPage() {
  const router = useRouter();
  const settings = useMemo(() => loadSettings(), []);

  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [solarDate, setSolarDate] = useState("");
  const [lunarYear, setLunarYear] = useState("");
  const [lunarMonth, setLunarMonth] = useState("");
  const [lunarDay, setLunarDay] = useState("");

  const [timeUnknown, setTimeUnknown] = useState(false);
  const [time, setTime] = useState("");

  const [gender, setGender] = useState<Gender>("unspecified");
  const [city, setCity] = useState<CityValue | null>(null);
  const [useTST, setUseTST] = useState(settings.defaultTrueSolarTime);
  const [sect, setSect] = useState<1 | 2>(settings.defaultSect);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const monthOpts = useMemo(
    () => lunarMonthOptions(Number(lunarYear) || 0),
    [lunarYear],
  );

  const selectedMonth = useMemo(() => {
    const o = monthOpts.find((m) => m.value === lunarMonth);
    return o ? { month: o.month, leap: o.leap } : { month: Number(lunarMonth) || 0, leap: false };
  }, [monthOpts, lunarMonth]);

  const dayCount = useMemo(
    () => lunarDayCount(Number(lunarYear) || 0, selectedMonth.month, selectedMonth.leap),
    [lunarYear, selectedMonth],
  );

  function buildInput(): BirthInput | null {
    let year = 0;
    let month = 0;
    let day = 0;
    let isLeapMonth = false;

    if (calendar === "solar") {
      if (!solarDate) {
        setErrors({ date: "请选择公历出生日期" });
        return null;
      }
      const [y, m, d] = solarDate.split("-").map(Number);
      year = y;
      month = m;
      day = d;
    } else {
      if (!lunarYear || !lunarMonth || !lunarDay) {
        setErrors({ date: "请完整选择农历年月日" });
        return null;
      }
      year = Number(lunarYear);
      month = selectedMonth.month;
      day = Number(lunarDay);
      isLeapMonth = selectedMonth.leap;
    }

    const [hh, mm] = timeUnknown || !time ? [null, null] : time.split(":").map(Number);

    return {
      calendar,
      year,
      month,
      day,
      hour: hh,
      minute: mm,
      isLeapMonth,
      gender,
      longitude: city?.longitude ?? null,
      locationName: city?.name ?? null,
      timezoneOffset: 8,
      useTrueSolarTime: useTST && city !== null,
      sect,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const input = buildInput();
    if (!input) {
      setSubmitting(false);
      return;
    }

    const result = validateBirthInput(input);
    if (!result.ok) {
      const map: Record<string, string> = {};
      for (const issue of result.issues) map[issue.field] = issue.message;
      setErrors(map);
      setSubmitting(false);
      return;
    }

    setErrors({});
    router.push(`/bazi/result?${encodeBirthInput(input)}`);
  }

  const years = useMemo(
    () => Array.from({ length: 201 }, (_, i) => 1900 + i),
    [],
  );

  return (
    <div className="shell-narrow pb-24 pt-12">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">观星 · 四柱</span>
        </div>
        <h1 className="font-serif text-[1.9rem] leading-tight tracking-[0.04em] text-[var(--text-primary)]">
          出生信息
        </h1>
        <p className="mt-3 text-pretty text-[0.875rem] leading-[1.9] text-[var(--text-secondary)]">
          以下信息只用于计算四柱，全部在你的浏览器内完成，不会上传服务器。
          只有在你主动点击「AI 解读」时，计算好的命盘结构才会发送到服务端。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* 历法 */}
        <section className="panel p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-base tracking-[0.08em]">历法</h2>
            <div className="seg" role="group" aria-label="历法选择">
              <button
                type="button"
                className="seg-item"
                data-active={calendar === "solar"}
                onClick={() => {
                  setCalendar("solar");
                  setErrors({});
                }}
              >
                公历
              </button>
              <button
                type="button"
                className="seg-item"
                data-active={calendar === "lunar"}
                onClick={() => {
                  setCalendar("lunar");
                  setErrors({});
                }}
              >
                农历
              </button>
            </div>
          </div>

          {calendar === "solar" ? (
            <div>
              <label htmlFor="solar-date" className="field-label">
                出生日期（公历）
              </label>
              <input
                id="solar-date"
                type="date"
                value={solarDate}
                min="1900-01-01"
                max="2100-12-31"
                onChange={(e) => {
                  setSolarDate(e.target.value);
                  setErrors((p) => ({ ...p, date: "" }));
                }}
                className={`input ${errors.date ? "input-invalid" : ""}`}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-error" : undefined}
              />
              {errors.date ? (
                <p id="date-error" className="mt-1.5 text-2xs text-[var(--cinnabar)]" role="alert">
                  {errors.date}
                </p>
              ) : (
                <span className="field-hint">支持 1900–2100 年。公历与农历会按天文算法精确互转。</span>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="lunar-year" className="field-label">
                  年
                </label>
                <select
                  id="lunar-year"
                  value={lunarYear}
                  onChange={(e) => {
                    setLunarYear(e.target.value);
                    setLunarMonth("");
                    setLunarDay("");
                    setErrors((p) => ({ ...p, date: "" }));
                  }}
                  className={`input ${errors.date ? "input-invalid" : ""}`}
                >
                  <option value="">请选择</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lunar-month" className="field-label">
                  月
                </label>
                <select
                  id="lunar-month"
                  value={lunarMonth}
                  disabled={!lunarYear}
                  onChange={(e) => {
                    setLunarMonth(e.target.value);
                    setLunarDay("");
                  }}
                  className={`input ${errors.date ? "input-invalid" : ""}`}
                >
                  <option value="">请选择</option>
                  {monthOpts.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lunar-day" className="field-label">
                  日
                </label>
                <select
                  id="lunar-day"
                  value={lunarDay}
                  disabled={!lunarMonth}
                  onChange={(e) => {
                    setLunarDay(e.target.value);
                    setErrors((p) => ({ ...p, date: "" }));
                  }}
                  className={`input ${errors.date ? "input-invalid" : ""}`}
                >
                  <option value="">请选择</option>
                  {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              {errors.date ? (
                <p className="col-span-3 mt-1 text-2xs text-[var(--cinnabar)]" role="alert">
                  {errors.date}
                </p>
              ) : (
                <span className="col-span-3 field-hint">
                  农历月份会自动包含该年的闰月；日数按大小月限制。
                </span>
              )}
            </div>
          )}
        </section>

        {/* 时间 */}
        <section className="panel p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-base tracking-[0.08em]">出生时间</h2>
            <label className="flex cursor-pointer items-center gap-2 text-2xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(e) => {
                  setTimeUnknown(e.target.checked);
                  if (e.target.checked) setTime("");
                }}
                className="h-3.5 w-3.5 accent-[var(--gold)]"
              />
              时辰未知
            </label>
          </div>

          <input
            type="time"
            value={time}
            disabled={timeUnknown}
            onChange={(e) => setTime(e.target.value)}
            className={`input ${timeUnknown ? "opacity-40" : ""} ${errors.time ? "input-invalid" : ""}`}
            aria-label="出生时间"
          />
          {errors.time ? (
            <p className="mt-1.5 text-2xs text-[var(--cinnabar)]" role="alert">
              {errors.time}
            </p>
          ) : (
            <span className="field-hint">
              {timeUnknown
                ? "时柱将留空，大运起运时间以正午推算并标注偏差。"
                : "不填等同于未知。时柱影响子女、晚年与大运精度。"}
            </span>
          )}
        </section>

        {/* 性别 */}
        <section className="panel p-5 sm:p-7">
          <h2 className="mb-1 font-serif text-base tracking-[0.08em]">性别</h2>
          <p className="mb-4 text-[0.75rem] leading-[1.75] text-[var(--text-muted)]">
            仅用于确定大运顺逆：阳男阴女顺排，阴男阳女逆排。
            不填则只排四柱，不推大运——本工具不会替你假设。
          </p>
          <div className="seg" role="group" aria-label="性别">
            {[
              { v: "male" as Gender, l: "男" },
              { v: "female" as Gender, l: "女" },
              { v: "unspecified" as Gender, l: "不填" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                className="seg-item"
                data-active={gender === o.v}
                onClick={() => setGender(o.v)}
                aria-pressed={gender === o.v}
              >
                {o.l}
              </button>
            ))}
          </div>
        </section>

        {/* 出生地 */}
        <section className="panel p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-base tracking-[0.08em]">出生地</h2>
            <span className="text-2xs text-[var(--text-muted)]">可选</span>
          </div>
          <CityPicker
            value={city}
            onChange={setCity}
            invalid={!!errors.longitude}
          />
          {errors.longitude ? (
            <p className="mt-1.5 text-2xs text-[var(--cinnabar)]" role="alert">
              {errors.longitude}
            </p>
          ) : null}

          <label
            className={`mt-4 flex cursor-pointer items-start gap-3 border-t border-[rgba(194,161,92,0.12)] pt-4 ${
              city ? "" : "opacity-50"
            }`}
          >
            <input
              type="checkbox"
              checked={useTST}
              disabled={!city}
              onChange={(e) => setUseTST(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-[var(--gold)]"
            />
            <span>
              <span className="block text-[0.8125rem] text-[var(--text-primary)]">
                启用真太阳时校正
              </span>
              <span className="mt-1 block text-2xs leading-[1.7] text-[var(--text-muted)]">
                按出生地经度与均时差修正时刻。中国统一用东经 120° 时间，
                西部地区差异可达两小时以上。默认关闭，因为多数排盘习惯直接用北京时间。
              </span>
            </span>
          </label>
        </section>

        {/* 高级 */}
        <section className="panel overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-7"
            aria-expanded={showAdvanced}
          >
            <span className="font-serif text-base tracking-[0.08em]">排盘口径（高级）</span>
            <span className="flex items-center gap-2 text-2xs text-[var(--text-muted)]">
              {sect === 1 ? "晚子时归次日" : "晚子时归当日"}
              <svg
                viewBox="0 0 24 24"
                className={`h-3.5 w-3.5 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-400 ${
              showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-[rgba(194,161,92,0.12)] px-5 py-5 sm:px-7">
                <p className="mb-3 text-[0.8125rem] text-[var(--text-primary)]">
                  子时换日规则
                </p>
                <div className="space-y-2">
                  {[
                    {
                      v: 1 as const,
                      t: "晚子时日柱归次日（流派一，默认）",
                      d: "23:00–24:00 出生者，日柱按第二天计算。当代排盘工具多采此法。",
                    },
                    {
                      v: 2 as const,
                      t: "晚子时日柱归当日（流派二）",
                      d: "23:00–24:00 出生者，日柱仍按当天计算。部分传统师承采此法。",
                    },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={`flex cursor-pointer gap-3 border px-3 py-2.5 transition-colors ${
                        sect === o.v
                          ? "border-[rgba(194,161,92,0.4)] bg-[rgba(194,161,92,0.06)]"
                          : "border-[rgba(194,161,92,0.12)] hover:border-[rgba(194,161,92,0.26)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="sect"
                        checked={sect === o.v}
                        onChange={() => setSect(o.v)}
                        className="mt-1 h-3.5 w-3.5 accent-[var(--gold)]"
                      />
                      <span>
                        <span className="block text-[0.8125rem] text-[var(--text-primary)]">
                          {o.t}
                        </span>
                        <span className="mt-0.5 block text-2xs leading-[1.7] text-[var(--text-muted)]">
                          {o.d}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <p className="mt-4 text-2xs leading-[1.8] text-[var(--text-muted)]">
                  年柱固定以立春换年、月柱固定以节气定月，这两项在命理界是主流共识，
                  本工具不提供切换，但会在结果页注明。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 提交 */}
        <div className="pt-2">
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? "排盘中…" : "开始排盘"}
          </button>
          <p className="mt-3 text-center text-2xs text-[var(--text-muted)]">
            结果保存在本机浏览器，可在「记录」页删除
          </p>
        </div>
      </form>

      <div className="mt-8">
        <Callout tone="note" title="关于准确性的说明">
          四柱计算依赖节气时刻，本工具使用 lunar-typescript 的天文算法，
          与通行万年历一致。但命理解读部分属于传统理论框架，
          不同流派对同一命盘可能给出不同结论——这不是计算错误。
        </Callout>
      </div>
    </div>
  );
}
