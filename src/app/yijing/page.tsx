"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  castByCoins,
  castByNumbers,
  castByTime,
  formatCastTitle,
  lunarCastInputFromDate,
  type CastMethod,
  type CastResult,
} from "@/lib/yijing/casting";
import { HexagramLines, HexagramTitle } from "@/components/yijing/hexagram-figure";
import { Callout } from "@/components/ui/empty-state";
import { saveRecord, loadSettings } from "@/lib/storage";

const METHODS: { key: CastMethod; label: string; hint: string }[] = [
  { key: "coin", label: "铜钱摇卦", hint: "三枚铜钱，摇六次" },
  { key: "time", label: "时间起卦", hint: "梅花易数，以时取数" },
  { key: "number", label: "数字起卦", hint: "心中默念，取两个数" },
];

export default function YijingPage() {
  const [method, setMethod] = useState<CastMethod>("coin");

  // 铜钱
  const [throws, setThrows] = useState<number[][]>([]);
  const [shaking, setShaking] = useState(false);
  const [coinFace, setCoinFace] = useState<number[]>([1, 1, 1]);

  // 数字
  const [numA, setNumA] = useState("");
  const [numB, setNumB] = useState("");
  const [numberError, setNumberError] = useState("");

  // 结果
  const [result, setResult] = useState<CastResult | null>(null);
  const [castAt, setCastAt] = useState<string | null>(null);
  const [lunarText, setLunarText] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<"idle" | "saved" | "off" | "failed">("idle");
  const [showTrace, setShowTrace] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setThrows([]);
    setError("");
    setNumberError("");
    setSaved("idle");
    setShowTrace(false);
  }, []);

  useEffect(() => {
    if (method !== "coin") setThrows([]);
  }, [method]);

  /* ------------------------- 铜钱 ------------------------- */

  function toss() {
    if (shaking || throws.length >= 6) return;
    setShaking(true);
    setError("");

    // 动画期间让铜钱快速翻转，落定后才写入结果
    const spin = setInterval(() => {
      setCoinFace([
        Math.random() < 0.5 ? 1 : 0,
        Math.random() < 0.5 ? 1 : 0,
        Math.random() < 0.5 ? 1 : 0,
      ]);
    }, 90);

    setTimeout(() => {
      clearInterval(spin);
      const coins = [
        Math.random() < 0.5 ? 1 : 0,
        Math.random() < 0.5 ? 1 : 0,
        Math.random() < 0.5 ? 1 : 0,
      ];
      setCoinFace(coins);
      const next = [...throws, coins];
      setThrows(next);
      setShaking(false);

      if (next.length === 6) {
        try {
          const r = castByCoins(next);
          setResult(r);
          setCastAt(new Date().toLocaleString("zh-CN", { hour12: false }));
        } catch (e) {
          setError(e instanceof Error ? e.message : "起卦失败");
        }
      }
    }, 820);
  }

  /* ------------------------- 时间 ------------------------- */

  function castTime() {
    const now = new Date();
    const input = lunarCastInputFromDate(now);
    const r = castByTime(input);
    setResult(r);
    setLunarText(input.lunarText);
    setCastAt(now.toLocaleString("zh-CN", { hour12: false }));
    setSaved("idle");
  }

  /* ------------------------- 数字 ------------------------- */

  function castNumber() {
    const a = Number(numA);
    const b = Number(numB);
    if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) {
      setNumberError("请填写两个正整数（1 以上）");
      return;
    }
    if (a > 999999 || b > 999999) {
      setNumberError("数字请控制在 999999 以内");
      return;
    }
    setNumberError("");
    setResult(castByNumbers(a, b));
    setCastAt(new Date().toLocaleString("zh-CN", { hour12: false }));
    setLunarText(null);
    setSaved("idle");
  }

  /* ------------------------- 保存 ------------------------- */

  const title = useMemo(() => (result ? formatCastTitle(result) : ""), [result]);

  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(t);
  }, [result]);

  function save() {
    if (!result) return;
    const settings = loadSettings();
    if (!settings.persistHistory) {
      setSaved("off");
      return;
    }
    const rec = saveRecord({
      type: "yijing",
      title,
      summary: `第 ${result.original.no} 卦　${result.movingLines.length > 0 ? `动爻 ${result.movingLines.join("、")}` : "静卦"}`,
      href: "/yijing",
      payload: {
        method: result.method,
        lines: result.originalLines,
        moving: result.movingLines,
        castAt,
      },
    });
    setSaved(rec ? "saved" : "failed");
  }

  const movingText = useMemo(() => {
    if (!result) return [];
    return result.movingLines
      .map((n) => result.original.yaoci[n - 1])
      .filter(Boolean);
  }, [result]);

  return (
    <div className="shell pb-24 pt-12">
      <header className="mb-10 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">问卦 · 易</span>
        </div>
        <h1 className="font-serif text-[1.9rem] leading-tight tracking-[0.04em] text-[var(--text-primary)]">
          起一卦
        </h1>
        <p className="mt-3 text-pretty text-[0.875rem] leading-[1.95] text-[var(--text-secondary)]">
          卦不是答案，是一个把处境说清楚的角度。起卦的每一步都可核对：
          取数规则写在下方，卦辞爻辞取自《周易》通行本原文，白话是本项目的转述。
        </p>
      </header>

      {/* 方法选择 */}
      <div className="seg mb-4 w-full sm:w-auto" role="group" aria-label="起卦方式">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            className="seg-item flex-1 sm:flex-none"
            data-active={method === m.key}
            aria-pressed={method === m.key}
            onClick={() => {
              setMethod(m.key);
              reset();
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 起卦操作区 */}
      <section className="panel p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-base tracking-[0.08em]">
            {METHODS.find((m) => m.key === method)?.label}
          </h2>
          <span className="text-2xs text-[var(--text-muted)]">
            {METHODS.find((m) => m.key === method)?.hint}
          </span>
        </div>

        {method === "coin" ? (
          <div>
            <div className="flex items-center justify-center gap-4 py-4 sm:gap-7 sm:py-7">
              {coinFace.map((face, i) => (
                <div
                  key={i}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(194,161,92,0.45)] sm:h-20 sm:w-20"
                  style={{
                    background:
                      "radial-gradient(circle at 34% 28%, rgba(226,203,150,0.22), rgba(12,16,22,0.9) 62%)",
                    boxShadow: "0 10px 26px -16px rgba(0,0,0,0.9), inset 0 0 0 4px rgba(194,161,92,0.08)",
                    animation: shaking ? `coin-flip 0.42s linear ${i * 0.05}s infinite` : undefined,
                    transform: shaking ? undefined : "none",
                  }}
                  aria-hidden="true"
                >
                  <span className="font-serif text-[1.15rem] text-[var(--gold-soft)]">
                    {shaking ? "?" : face === 1 ? "背" : "字"}
                  </span>
                </div>
              ))}
            </div>

            {/* 六爻进度 */}
            <div className="mx-auto mb-6 flex max-w-md items-end justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => {
                const t = throws[i];
                const sum = t ? t.reduce((acc, c) => acc + (c === 1 ? 3 : 2), 0) : null;
                const isYang = sum === 7 || sum === 9;
                const isMoving = sum === 6 || sum === 9;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-[7px] w-full items-center gap-[5px]">
                      {t ? (
                        isYang ? (
                          <span
                            className="h-full flex-1 rounded-[1px]"
                            style={{ background: isMoving ? "var(--cinnabar)" : "var(--gold-soft)" }}
                          />
                        ) : (
                          <>
                            <span
                              className="h-full flex-1 rounded-[1px]"
                              style={{ background: isMoving ? "var(--cinnabar)" : "var(--gold-soft)" }}
                            />
                            <span className="h-full w-[5px]" />
                            <span
                              className="h-full flex-1 rounded-[1px]"
                              style={{ background: isMoving ? "var(--cinnabar)" : "var(--gold-soft)" }}
                            />
                          </>
                        )
                      ) : (
                        <span className="h-px w-full bg-[rgba(236,230,216,0.12)]" />
                      )}
                    </div>
                    <span className="text-[0.5rem] tracking-[0.1em] text-[var(--text-muted)]">
                      {["初", "二", "三", "四", "五", "上"][i]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={toss}
                disabled={shaking || throws.length >= 6}
                className="btn btn-primary w-full sm:w-auto sm:!px-12"
              >
                {throws.length >= 6
                  ? "六爻已成"
                  : shaking
                    ? "摇动中…"
                    : `摇第 ${throws.length + 1} 爻`}
              </button>
              <p className="text-2xs tracking-[0.1em] text-[var(--text-muted)]">
                背记 3、字记 2；合计 6 老阴、7 少阳、8 少阴、9 老阳
              </p>
            </div>

            {throws.length > 0 && throws.length < 6 ? (
              <button type="button" onClick={reset} className="btn btn-quiet mx-auto mt-3 block">
                重新开始
              </button>
            ) : null}
          </div>
        ) : null}

        {method === "time" ? (
          <div>
            <p className="text-[0.8125rem] leading-[1.9] text-[var(--text-secondary)]">
              以当下时刻的农历年支数、月、日、时支数取卦。同一时辰内起卦，结果相同——
              这是梅花易数的规则，不是随机数。
            </p>
            <div className="mt-5 grid gap-2 border-y border-[rgba(194,161,92,0.12)] py-4 text-[0.75rem] leading-[1.8] text-[var(--text-muted)] sm:grid-cols-2">
              <p>上卦 =（年支数 + 月 + 日）÷ 8 取余</p>
              <p>下卦 =（年支数 + 月 + 日 + 时支数）÷ 8 取余</p>
              <p>动爻 =（年支数 + 月 + 日 + 时支数）÷ 6 取余</p>
              <p className="text-[var(--text-muted)]">余 0 作 8 或 6 计，与通行用法一致</p>
            </div>
            <button type="button" onClick={castTime} className="btn btn-primary mt-5 w-full sm:w-auto">
              以此刻起卦
            </button>
          </div>
        ) : null}

        {method === "number" ? (
          <div>
            <p className="text-[0.8125rem] leading-[1.9] text-[var(--text-secondary)]">
              心中先想清楚要问的事，再取两个正整数。数字本身没有吉凶，
              它只决定从六十四卦里取哪一卦。
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="num-a" className="field-label">
                  第一个数（取上卦）
                </label>
                <input
                  id="num-a"
                  type="number"
                  min={1}
                  max={999999}
                  value={numA}
                  onChange={(e) => {
                    setNumA(e.target.value);
                    setNumberError("");
                  }}
                  placeholder="例如 37"
                  className={`input tnum ${numberError ? "input-invalid" : ""}`}
                />
              </div>
              <div>
                <label htmlFor="num-b" className="field-label">
                  第二个数（取下卦）
                </label>
                <input
                  id="num-b"
                  type="number"
                  min={1}
                  max={999999}
                  value={numB}
                  onChange={(e) => {
                    setNumB(e.target.value);
                    setNumberError("");
                  }}
                  placeholder="例如 24"
                  className={`input tnum ${numberError ? "input-invalid" : ""}`}
                />
              </div>
            </div>
            {numberError ? (
              <p className="mt-2 text-2xs text-[var(--cinnabar)]" role="alert">
                {numberError}
              </p>
            ) : (
              <p className="mt-2 text-2xs text-[var(--text-muted)]">
                上卦 = 第一数 ÷ 8 取余，下卦 = 第二数 ÷ 8 取余，动爻 = 两数之和 ÷ 6 取余
              </p>
            )}
            <button type="button" onClick={castNumber} className="btn btn-primary mt-5 w-full sm:w-auto">
              起卦
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-2xs text-[var(--cinnabar)]" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {/* 结果 */}
      <div ref={resultRef}>
        {result ? (
          <div className="mt-6 space-y-4">
            {/* 卦象 */}
            <section className="panel overflow-hidden">
              <div className="grid gap-px sm:grid-cols-[1fr_auto_1fr]">
                <div className="p-6 sm:p-8">
                  <HexagramTitle hexagram={result.original} caption="本卦 · 当下" />
                  <div className="mx-auto mt-6 w-full max-w-[220px]">
                    <HexagramLines
                      lines={result.originalLines}
                      moving={result.movingLines}
                      animate
                    />
                  </div>
                  <p className="mt-6 text-center text-[0.75rem] leading-[1.85] text-[var(--text-secondary)]">
                    {result.original.plain}
                  </p>
                </div>

                <div className="flex items-center justify-center border-y border-[rgba(194,161,92,0.12)] px-4 py-3 sm:border-x sm:border-y-0 sm:py-0">
                  <span className="font-serif text-[1.1rem] text-[var(--gold)]">
                    {result.changed ? "之" : "·"}
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  {result.changed ? (
                    <>
                      <HexagramTitle hexagram={result.changed} caption="变卦 · 趋向" />
                      <div className="mx-auto mt-6 w-full max-w-[220px]">
                        <HexagramLines lines={result.changedLines ?? []} tone="dim" animate />
                      </div>
                      <p className="mt-6 text-center text-[0.75rem] leading-[1.85] text-[var(--text-secondary)]">
                        {result.changed.plain}
                      </p>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                      <p className="text-[0.5625rem] tracking-[0.3em] text-[var(--text-muted)]">
                        无动爻
                      </p>
                      <p className="mt-4 font-serif text-[1.5rem] tracking-[0.16em] text-[var(--text-primary)]">
                        静卦
                      </p>
                      <p className="mt-3 max-w-[16rem] text-[0.75rem] leading-[1.85] text-[var(--text-muted)]">
                        六爻皆不变，传统上以本卦卦辞为断，不看变卦。
                        事情的状态相对稳定，变化尚未发生。
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[rgba(194,161,92,0.12)] px-5 py-4 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.75rem] tracking-[0.08em] text-[var(--text-secondary)]">
                    {title}
                    {result.movingLines.length > 0
                      ? `　动爻 ${result.movingLines.map((n) => `第${n}爻`).join("、")}`
                      : "　静卦"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={save} className="btn btn-ghost !py-2 !text-[0.75rem]">
                      {saved === "saved" ? "已保存" : "保存这一卦"}
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="btn btn-quiet !py-2 !text-[0.75rem]"
                    >
                      再起一卦
                    </button>
                  </div>
                </div>
                {saved === "off" ? (
                  <p className="mt-2 text-2xs text-[var(--text-muted)]">
                    已在设置中关闭历史保存，本次结果不会留下记录。
                  </p>
                ) : null}
                {saved === "failed" ? (
                  <p className="mt-2 text-2xs text-[var(--cinnabar)]">
                    保存失败：浏览器存储不可用（可能是隐私模式）。
                  </p>
                ) : null}
              </div>
            </section>

            {/* 卦辞爻辞 */}
            <section className="paper-surface print-block">
              <div className="relative px-5 py-7 sm:px-9 sm:py-9">
                <div className="mb-5 flex items-baseline justify-between border-b border-[rgba(28,33,38,0.16)] pb-3">
                  <h3 className="font-serif text-[1.05rem] tracking-[0.1em] text-[var(--text-on-paper)]">
                    卦辞与爻辞
                  </h3>
                  <span className="text-[0.5625rem] tracking-[0.16em] text-[var(--text-on-paper-soft)]">
                    周易通行本原文
                  </span>
                </div>

                <p className="font-serif text-[1.05rem] leading-[2.1] tracking-[0.05em] text-[var(--text-on-paper)]">
                  <span className="mr-3 text-[0.75rem] tracking-[0.2em] text-[var(--text-on-paper-soft)]">
                    {result.original.name}　
                  </span>
                  {result.original.guaci}
                </p>

                <ul className="mt-5 space-y-2.5 border-t border-[rgba(28,33,38,0.1)] pt-4">
                  {result.original.yaoci.map((text, i) => {
                    const isMoving = result.movingLines.includes(i + 1);
                    return (
                      <li
                        key={i}
                        className={`font-serif text-[0.9375rem] leading-[1.95] tracking-[0.04em] ${
                          isMoving ? "text-[var(--text-on-paper)]" : "text-[var(--text-on-paper-soft)]"
                        }`}
                      >
                        <span
                          className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                            isMoving ? "bg-[var(--cinnabar)]" : "bg-transparent"
                          }`}
                          aria-hidden="true"
                        />
                        {text}
                      </li>
                    );
                  })}
                </ul>

                {movingText.length > 0 ? (
                  <div className="mt-6 border-t border-[rgba(28,33,38,0.16)] pt-4">
                    <p className="text-[0.625rem] tracking-[0.2em] text-[var(--text-on-paper-soft)]">
                      断卦提示
                    </p>
                    <p className="mt-2 text-[0.8125rem] leading-[1.95] text-[var(--text-on-paper)]">
                      有动爻时，传统上以动爻爻辞为主要参照（朱熹《易学启蒙》所载变占之法：
                      一爻动看本爻，多爻动则参看之卦）。本工具只呈现原文，判断留给你。
                    </p>
                  </div>
                ) : null}

                <p className="mt-5 text-[0.625rem] leading-[1.8] text-[var(--text-on-paper-soft)]">
                  原文保留繁体与通行本用字，未做改写。白话解读为本项目原创，不冒充古籍注疏。
                </p>
              </div>
            </section>

            {/* 起卦过程 */}
            <section className="panel">
              <button
                type="button"
                onClick={() => setShowTrace((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-7"
                aria-expanded={showTrace}
              >
                <span className="font-serif text-base tracking-[0.08em]">起卦过程</span>
                <span className="flex items-center gap-2 text-2xs text-[var(--text-muted)]">
                  可核对
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${showTrace ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ${
                  showTrace ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-[rgba(194,161,92,0.12)] px-5 py-5 sm:px-7">
                    <dl className="space-y-2 text-[0.75rem] leading-[1.8]">
                      {result.trace.steps.map((s) => (
                        <div key={s.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                          <dt className="w-40 shrink-0 text-[var(--text-muted)]">{s.label}</dt>
                          <dd className="text-[var(--text-secondary)]">{s.value}</dd>
                        </div>
                      ))}
                      {castAt ? (
                        <div className="flex flex-col gap-0.5 border-t border-[rgba(194,161,92,0.1)] pt-2 sm:flex-row sm:gap-3">
                          <dt className="w-40 shrink-0 text-[var(--text-muted)]">起卦时刻</dt>
                          <dd className="text-[var(--text-secondary)]">{castAt}</dd>
                        </div>
                      ) : null}
                      {lunarText ? (
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                          <dt className="w-40 shrink-0 text-[var(--text-muted)]">农历</dt>
                          <dd className="text-[var(--text-secondary)]">{lunarText}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                </div>
              </div>
            </section>

            <Callout tone="note" title="关于占卜的边界">
              卦象提供的是一套描述处境的词汇，不具备预测能力。
              重要决定请依靠事实、专业意见与你自己的判断，不要把卦象当作依据。
            </Callout>
          </div>
        ) : (
          <div className="mt-6 rounded-sm border border-dashed border-[rgba(194,161,92,0.18)] px-6 py-12 text-center">
            <p className="font-serif text-[1.05rem] tracking-[0.1em] text-[var(--text-secondary)]">
              尚未起卦
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[0.75rem] leading-[1.85] text-[var(--text-muted)]">
              上方选择一种方式开始。铜钱摇卦需要摇六次，逐爻成卦；
              时间与数字起卦一次即成。
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[rgba(194,161,92,0.12)] pt-6">
        <Link href="/canon?c=占卜" className="text-2xs tracking-[0.14em] text-[var(--gold)] hover:text-[var(--gold-soft)]">
          相关术语：本卦 / 变卦 / 动爻 / 梅花易数
        </Link>
      </div>
    </div>
  );
}
