import type { Metadata } from "next";
import Link from "next/link";
import { getAlmanac, getSolarTermsOfYear, SOLAR_TERM_INTRO, CULTURE_CARDS } from "@/lib/almanac";
import { DateNav } from "@/components/almanac/date-nav";
import { Callout } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "黄历与节气",
  description:
    "查询任意日期的农历、干支、节气与黄历宜忌。日期与节气由天文算法计算，宜忌为传统通书整理，两者在页面上明确区分。",
};

type SearchParams = Record<string, string | string[] | undefined>;

function parseDate(raw: string | string[] | undefined): Date {
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (s && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    const probe = new Date(Date.UTC(y, m - 1, d));
    if (probe.getUTCFullYear() === y && probe.getUTCMonth() + 1 === m && probe.getUTCDate() === d) {
      return new Date(y, m - 1, d);
    }
  }
  return new Date();
}

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AlmanacPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const date = parseDate(sp.d);
  const iso = isoOf(date);
  const a = getAlmanac(date);
  const terms = getSolarTermsOfYear(date.getFullYear());

  const isToday = isoOf(new Date()) === iso;
  const termIntro = a.jieQi ? SOLAR_TERM_INTRO[a.jieQi] : undefined;
  const nextIntro = a.nextJieQi ? SOLAR_TERM_INTRO[a.nextJieQi.name] : undefined;

  return (
    <div className="shell pb-24 pt-12">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">择时 · 黄历</span>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-[1.9rem] leading-tight tracking-[0.04em] text-[var(--text-primary)]">
              {isToday ? "今日黄历" : "黄历"}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-[0.875rem] leading-[1.9] text-[var(--text-secondary)]">
              农历、干支、节气由天文算法计算，可拿万年历逐项核对。
              宜忌来自传统通书的规则整理，属于文献传承，不是天文结果——两者性质不同。
            </p>
          </div>
          <DateNav current={iso} />
        </div>
      </header>

      {/* 主卡 */}
      <section className="paper-surface print-block">
        <div className="relative grid gap-px sm:grid-cols-[1.15fr_1fr]">
          {/* 左：日期 */}
          <div className="px-6 py-7 sm:px-9 sm:py-9">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.625rem] tracking-[0.3em] text-[var(--text-on-paper-soft)]">
                公历
              </span>
              <span className="text-[0.625rem] tracking-[0.14em] text-[var(--text-on-paper-soft)]">
                星期{a.solar.weekday}
              </span>
            </div>

            <p className="mt-3 font-serif text-[2.6rem] leading-none tracking-[0.04em] text-[var(--text-on-paper)] tnum">
              {String(a.solar.month).padStart(2, "0")}
              <span className="mx-1 text-[1.2rem] text-[var(--text-on-paper-soft)]">/</span>
              {String(a.solar.day).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[0.75rem] tracking-[0.14em] text-[var(--text-on-paper-soft)] tnum">
              {a.solar.year} 年
            </p>

            <div className="mt-6 border-t border-[rgba(28,33,38,0.16)] pt-4">
              <p className="font-serif text-[1.3rem] leading-snug tracking-[0.06em] text-[var(--text-on-paper)]">
                {a.lunarText}
              </p>
              <p className="mt-2 text-[0.8125rem] tracking-[0.12em] text-[var(--text-on-paper-soft)]">
                {a.ganzhi.year}年　{a.ganzhi.month}月　{a.ganzhi.day}日
              </p>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.75rem]">
              {[
                ["生肖", `属${a.zodiac}`],
                ["星座", a.xingZuo],
                ["值星", `${a.zhiXing}日`],
                ["星宿", `${a.xiu}（${a.xiuLuck}）`],
                ["冲煞", a.chong],
                ["季节", a.season],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-8 shrink-0 text-[var(--text-on-paper-soft)]">{k}</dt>
                  <dd className="text-[var(--text-on-paper)]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 右：节气与宜忌 */}
          <div className="border-t border-[rgba(28,33,38,0.14)] px-6 py-7 sm:border-l sm:border-t-0 sm:px-9 sm:py-9">
            <span className="text-[0.625rem] tracking-[0.3em] text-[var(--text-on-paper-soft)]">
              节气
            </span>
            <p className="mt-3 font-serif text-[1.5rem] leading-tight text-[var(--text-on-paper)]">
              {a.jieQi ? `今日 ${a.jieQi}` : a.nextJieQi ? `下一个：${a.nextJieQi.name}` : "—"}
            </p>
            {a.jieQi ? (
              <p className="mt-2 text-[0.75rem] leading-[1.85] text-[var(--text-on-paper-soft)]">
                {termIntro}
              </p>
            ) : a.nextJieQi ? (
              <p className="mt-2 text-[0.75rem] leading-[1.85] text-[var(--text-on-paper-soft)]">
                还有 <span className="tnum">{a.nextJieQi.daysAway}</span> 天（
                <span className="tnum">{a.nextJieQi.date}</span>）。{nextIntro}
              </p>
            ) : null}

            {a.festivals.length > 0 ? (
              <p className="mt-3 inline-flex flex-wrap gap-x-2 gap-y-1">
                {a.festivals.map((f) => (
                  <span
                    key={f}
                    className="border border-[rgba(168,65,47,0.35)] px-1.5 py-0.5 text-[0.625rem] tracking-[0.1em] text-[var(--cinnabar)]"
                  >
                    {f}
                  </span>
                ))}
              </p>
            ) : null}

            <div className="mt-6 border-t border-[rgba(28,33,38,0.16)] pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.625rem] tracking-[0.3em] text-[var(--text-on-paper-soft)]">
                  宜忌
                </span>
                <span className="text-[0.5rem] tracking-[0.1em] text-[var(--text-on-paper-soft)]">
                  通书整理
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <p className="flex gap-2 text-[0.8125rem] leading-[1.85]">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[rgba(79,127,107,0.18)] text-[0.5rem] text-[#3d6b58]">
                    宜
                  </span>
                  <span className="text-[var(--text-on-paper)]">
                    {a.yi.length > 0 ? a.yi.slice(0, 8).join("　") : "—"}
                  </span>
                </p>
                <p className="flex gap-2 text-[0.8125rem] leading-[1.85]">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[rgba(168,65,47,0.14)] text-[0.5rem] text-[var(--cinnabar)]">
                    忌
                  </span>
                  <span className="text-[var(--text-on-paper)]">
                    {a.ji.length > 0 ? a.ji.slice(0, 8).join("　") : "—"}
                  </span>
                </p>
              </div>
              <p className="mt-4 text-[0.625rem] leading-[1.8] text-[var(--text-on-paper-soft)]">
                彭祖百忌：{a.pengZu}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-5 top-5 sm:right-8 sm:top-7" aria-hidden="true">
          <div className="seal h-10 w-10 rotate-[3deg] flex-col text-[0.55rem] leading-[1.1] opacity-75">
            <span>择时</span>
            <span>之印</span>
          </div>
        </div>
      </section>

      <p className="mt-3 text-2xs leading-[1.8] text-[var(--text-muted)]">
        宜忌与彭祖百忌为传统通书规则整理，不含天文计算，仅作文化了解；
        不构成对任何具体行为的建议。
      </p>

      {/* 二十四节气 */}
      <section className="pt-16">
        <SectionHeading
          eyebrow="节气"
          title={`${date.getFullYear()} 年二十四节气`}
          description="节气按太阳黄经每 15° 划分，时刻精确到分。八字定月用的正是这张表里的「十二节」。"
        />

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-[rgba(194,161,92,0.14)] sm:grid-cols-3 lg:grid-cols-4">
          {terms.map((t) => {
            const isCurrent = t.date === iso;
            const isPast = t.date < iso;
            return (
              <Link
                key={`${t.name}-${t.date}`}
                href={`/almanac?d=${t.date}`}
                className={`group relative flex items-baseline justify-between px-4 py-3.5 transition-colors duration-300 ${
                  isCurrent
                    ? "bg-[rgba(194,161,92,0.12)]"
                    : "bg-[rgba(12,16,22,0.5)] hover:bg-[rgba(194,161,92,0.06)]"
                }`}
              >
                <span
                  className={`font-serif text-[0.9375rem] tracking-[0.1em] ${
                    isCurrent
                      ? "text-[var(--gold-soft)]"
                      : isPast
                        ? "text-[var(--text-muted)]"
                        : "text-[var(--text-secondary)]"
                  }`}
                >
                  {t.name}
                </span>
                <span className="text-[0.625rem] tnum tracking-[0.06em] text-[var(--text-muted)]">
                  {String(t.month).padStart(2, "0")}.{String(t.day).padStart(2, "0")}
                </span>
                {isCurrent ? (
                  <span className="absolute left-0 top-0 h-full w-[2px] bg-[var(--gold)]" aria-hidden="true" />
                ) : null}
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-2xs text-[var(--text-muted)]">
          点击任一节气可跳到当天黄历。已过的节气显示为灰色。
        </p>
      </section>

      {/* 文化卡片 */}
      <section className="pt-16">
        <SectionHeading eyebrow="知识" title="为什么是这样" />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {CULTURE_CARDS.map((c) => (
            <article key={c.title} className="panel p-5 sm:p-6">
              <h3 className="font-serif text-[1.05rem] tracking-[0.06em] text-[var(--text-primary)]">
                {c.title}
              </h3>
              <p className="mt-2.5 text-[0.8125rem] leading-[1.95] text-[var(--text-secondary)]">
                {c.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <Callout tone="note" title="数据性质说明">
          本页的农历、干支、节气、星宿、值星均由 lunar-typescript 依天文算法与历法规则计算；
          宜忌、彭祖百忌来自传统通书的条目整理。前者可复算，后者属文献传承。
          把两者分开标注，是这个工具的基本立场。
        </Callout>
      </div>
    </div>
  );
}
