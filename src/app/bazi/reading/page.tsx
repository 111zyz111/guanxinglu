import Link from "next/link";
import type { Metadata } from "next";
import { buildChart } from "@/lib/bazi/engine";
import { buildRuleReading } from "@/lib/bazi/analysis";
import { decodeBirthInput } from "@/lib/storage";
import { AiReadingPanel } from "@/components/bazi/ai-reading-panel";
import { Callout } from "@/components/ui/empty-state";
import type { BirthInput } from "@/lib/bazi/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "解读",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function toQuery(sp: SearchParams): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") p.set(k, v);
    else if (Array.isArray(v) && v[0]) p.set(k, v[0]);
  }
  return p.toString();
}

const RELATED_TERMS = ["日主", "月令", "藏干", "十神", "大运", "真太阳时"];

export default async function ReadingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const query = toQuery(sp);
  const input = decodeBirthInput(query);

  if (!input) {
    return (
      <div className="shell-narrow pb-24 pt-16">
        <div className="panel p-8 text-center">
          <h1 className="font-serif text-xl text-[var(--text-primary)]">还没有命盘</h1>
          <p className="mx-auto mt-3 max-w-sm text-[0.8125rem] leading-[1.9] text-[var(--text-muted)]">
            解读必须基于真实排盘结果，所以这里不接受空参数。先填出生信息，排盘完成后会自动进入解读。
          </p>
          <Link href="/bazi" className="btn btn-primary mt-6">
            去填写出生信息
          </Link>
        </div>
      </div>
    );
  }

  let chart;
  try {
    chart = buildChart(input as BirthInput);
  } catch (err) {
    return (
      <div className="shell-narrow pb-24 pt-16">
        <div className="panel p-8">
          <h1 className="font-serif text-xl text-[var(--text-primary)]">无法排盘</h1>
          <p className="mt-3 text-[0.8125rem] leading-[1.9] text-[var(--cinnabar)]">
            {err instanceof Error ? err.message : "未知错误"}
          </p>
          <Link href="/bazi" className="btn btn-ghost mt-6">
            返回修改
          </Link>
        </div>
      </div>
    );
  }

  const sections = buildRuleReading(chart);
  const summary = `${chart.pillars.map((p) => p.ganZhi).join(" ")}　日主${chart.dayMaster.gan}${chart.dayMaster.element}${chart.strength.label}`;

  return (
    <div className="shell pb-24 pt-10">
      {/* 头部 */}
      <header className="mb-8 border-b border-[rgba(194,161,92,0.14)] pb-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">知己 · 解读</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-[1.75rem] leading-tight tracking-[0.06em] text-[var(--text-primary)]">
              {chart.pillars.map((p) => p.ganZhi).join("　")}
            </h1>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
              {chart.lunarText}　属{chart.zodiac}　日主
              <span className="text-[var(--gold)]">
                {chart.dayMaster.gan}
                {chart.dayMaster.element}
              </span>
              　{chart.strength.label}（{chart.strength.score}/100）
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Link href={`/bazi/result?${query}`} className="btn btn-ghost !py-2 !text-[0.75rem]">
              回到命盘
            </Link>
            <Link href="/bazi" className="btn btn-quiet !py-2 !text-[0.75rem]">
              重新排盘
            </Link>
          </div>
        </div>

        {/* 目录 */}
        <nav className="no-print mt-6 flex flex-wrap gap-x-4 gap-y-2" aria-label="解读目录">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-2xs tracking-[0.1em] text-[var(--text-muted)] transition-colors hover:text-[var(--gold-soft)]"
            >
              {s.title}
            </a>
          ))}
          <a
            href="#ai"
            className="text-2xs tracking-[0.1em] text-[var(--gold)] transition-colors hover:text-[var(--gold-soft)]"
          >
            AI 解读
          </a>
        </nav>
      </header>

      {/* 规则解读 */}
      <div className="space-y-4">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="panel scroll-mt-24 p-5 sm:p-7 print-block">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(194,161,92,0.12)] pb-3">
              <h2 className="font-serif text-[1.15rem] tracking-[0.08em] text-[var(--text-primary)]">
                {s.title}
              </h2>
              {s.subtitle ? (
                <span className="text-[0.6875rem] tracking-[0.08em] text-[var(--gold)]">
                  {s.subtitle}
                </span>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {s.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-[0.875rem] leading-[2.05] text-[var(--text-secondary)]"
                >
                  {p}
                </p>
              ))}
            </div>

            {s.items && s.items.length > 0 ? (
              <dl className="mt-4 grid gap-2 border-t border-[rgba(194,161,92,0.1)] pt-4 sm:grid-cols-2">
                {s.items.map((it) => (
                  <div key={it.label} className="flex flex-col gap-0.5">
                    <dt className="text-[0.75rem] tracking-[0.06em] text-[var(--text-primary)]">
                      {it.label}
                    </dt>
                    <dd className="text-[0.75rem] leading-[1.85] text-[var(--text-muted)]">
                      {it.text}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {s.note ? (
              <p className="mt-4 border-t border-[rgba(194,161,92,0.1)] pt-3 text-2xs leading-[1.85] text-[var(--text-muted)]">
                {s.note}
              </p>
            ) : null}
          </section>
        ))}
      </div>

      {/* AI */}
      <div className="mt-4">
        <AiReadingPanel input={input as BirthInput} summary={summary} />
      </div>

      {/* 术语 */}
      <section className="mt-4 panel p-5 sm:p-7">
        <h2 className="font-serif text-base tracking-[0.08em]">这一页用到的术语</h2>
        <p className="mt-1.5 text-[0.75rem] leading-[1.8] text-[var(--text-muted)]">
          读不懂某个词时，去词典看它的定义——那里只解释词义，不做吉凶判断。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {RELATED_TERMS.map((t) => (
            <Link
              key={t}
              href={`/canon?q=${encodeURIComponent(t)}`}
              className="border border-[rgba(194,161,92,0.22)] px-2.5 py-1 text-[0.75rem] tracking-[0.08em] text-[var(--text-secondary)] transition-colors hover:border-[rgba(194,161,92,0.5)] hover:text-[var(--gold-soft)]"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-3">
        {chart.warnings.length > 0 ? (
          <Callout tone="warn" title="计算上的不确定之处">
            <ul className="space-y-1.5">
              {chart.warnings.map((w, i) => (
                <li key={i}>· {w}</li>
              ))}
            </ul>
          </Callout>
        ) : null}

        <Callout tone="note" title="怎么读这一页">
          本页分两层：命盘结构、五行计数、大运年份是计算出来的，可以核对；
          对它们的解释属于传统理论框架，不同流派会有分歧。
          我们尽量把「这是算出来的」和「这是传统这么说的」分开写，
          但文字终究无法完全消除这层差异——请保留你自己的判断。
        </Callout>
      </div>
    </div>
  );
}
