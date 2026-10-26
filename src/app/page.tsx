import Link from "next/link";
import { getAlmanac } from "@/lib/almanac";
import { Starfield, ConstellationMap } from "@/components/visual/starfield";
import { MountainRidge } from "@/components/visual/mountain";
import { SectionHeading } from "@/components/ui/section-heading";
import { RecentRecords } from "@/components/home/recent-records";
import {
  IconPillars,
  IconHexagram,
  IconSolarTerm,
  IconDialogue,
  IconCanon,
  IconArrow,
} from "@/components/visual/icons";

export const dynamic = "force-dynamic";

const ENTRIES = [
  {
    href: "/yijing",
    label: "问卦",
    en: "DIVINATION",
    icon: IconHexagram,
    title: "易经起卦",
    desc: "时间、数字或铜钱起卦，得本卦与变卦，附卦辞爻辞原文与白话。",
  },
  {
    href: "/almanac",
    label: "择时",
    en: "ALMANAC",
    icon: IconSolarTerm,
    title: "黄历节气",
    desc: "当日干支、二十四节气、宜忌与传统择日文化，逐日可查。",
  },
  {
    href: "/canon",
    label: "藏经",
    en: "GLOSSARY",
    icon: IconCanon,
    title: "术语词典",
    desc: "天干地支、十神、大运、真太阳时……把术语讲清楚，而不是堆砌。",
  },
  {
    href: "/bazi/reading",
    label: "知己",
    en: "SELF",
    icon: IconDialogue,
    title: "解读与追问",
    desc: "先由规则生成确定性解读，再由服务端把命盘结构交给模型，用现代语言转译。",
  },
];

export default function HomePage() {
  const almanac = getAlmanac();

  return (
    <>
      {/* ============ 主视觉 ============ */}
      <section className="relative isolate flex min-h-[88svh] items-center overflow-hidden">
        <Starfield count={130} />
        <ConstellationMap className="pointer-events-none absolute left-[5%] top-[9%] h-[34%] w-[38%] opacity-40" />
        <ConstellationMap className="pointer-events-none absolute right-[4%] top-[8%] h-[30%] w-[28%] rotate-[18deg] opacity-25" />
        <div className="vignette absolute inset-0" aria-hidden="true" />
        <MountainRidge className="mountain-ridge w-full opacity-90" />

        <div className="shell relative z-10 py-28 text-center">
          <div className="animate-fade-in">
            <div className="mb-8 flex items-center justify-center gap-4">
              <span className="h-px w-10 bg-[var(--gold-dim)]" aria-hidden="true" />
              <span className="eyebrow">中国传统命理文化</span>
              <span className="h-px w-10 bg-[var(--gold-dim)]" aria-hidden="true" />
            </div>

            <h1 className="animate-fade-up font-serif text-[2.6rem] leading-[1.1] tracking-[0.28em] text-[var(--text-primary)] sm:text-[3.6rem] sm:tracking-[0.34em] md:text-[4.2rem]">
              观星录
            </h1>

            <div className="mt-7 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(194,161,92,0.5)]" aria-hidden="true" />
              <span className="seal h-7 w-7 rotate-[-3deg] text-[0.6rem]" aria-hidden="true">
                印
              </span>
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(194,161,92,0.5)]" aria-hidden="true" />
            </div>

            <p
              className="mt-8 animate-fade-up font-serif text-[1.35rem] tracking-[0.34em] text-[var(--gold-soft)] sm:text-[1.7rem]"
              style={{ animationDelay: "120ms" }}
            >
              观天时，察己心
            </p>

            <p
              className="mx-auto mt-6 max-w-lg animate-fade-up text-pretty text-[0.875rem] leading-[2] text-[var(--text-secondary)]"
              style={{ animationDelay: "220ms" }}
            >
              以经过验证的历法算法完成排盘，以传统文献为参照提供解读。
              这里没有断言，只有一套可以自己核对的观察词汇。
            </p>

            <div
              className="mt-11 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "320ms" }}
            >
              <Link href="/bazi" className="btn btn-primary w-full sm:w-auto">
                开始排盘
                <IconArrow className="h-4 w-4" />
              </Link>
              <Link href="/yijing" className="btn btn-ghost w-full sm:w-auto">
                问一卦
              </Link>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center">
          <span className="text-[0.5625rem] tracking-[0.4em] text-[var(--text-muted)]">向下</span>
          <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[rgba(194,161,92,0.5)] to-transparent" />
        </div>
      </section>

      {/* ============ 今日 ============ */}
      <section className="shell -mt-6 pb-4">
        <div className="panel grid gap-px overflow-hidden md:grid-cols-[1.1fr_1fr_1.3fr]">
          <div className="p-6">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">今日</span>
              <span className="text-2xs tnum tracking-[0.1em] text-[var(--text-muted)]">
                {almanac.solar.year}.{String(almanac.solar.month).padStart(2, "0")}.
                {String(almanac.solar.day).padStart(2, "0")}　周{almanac.solar.weekday}
              </span>
            </div>
            <p className="mt-4 font-serif text-[1.5rem] leading-tight tracking-[0.06em] text-[var(--text-primary)]">
              {almanac.lunarText}
            </p>
            <p className="mt-2 text-[0.8125rem] tracking-[0.12em] text-[var(--gold)]">
              {almanac.ganzhi.year}年　{almanac.ganzhi.month}月　{almanac.ganzhi.day}日
            </p>
            <p className="mt-3 text-2xs tracking-[0.12em] text-[var(--text-muted)]">
              属{almanac.zodiac}　{almanac.xingZuo}　{almanac.zhiXing}日
            </p>
          </div>

          <div className="p-6 md:border-l md:border-[rgba(194,161,92,0.12)]">
            <span className="eyebrow">节气</span>
            <p className="mt-4 font-serif text-[1.25rem] text-[var(--text-primary)]">
              {almanac.jieQi ? `今日${almanac.jieQi}` : almanac.season}
            </p>
            {almanac.nextJieQi ? (
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
                距 <span className="text-[var(--gold)]">{almanac.nextJieQi.name}</span> 还有{" "}
                <span className="tnum">{almanac.nextJieQi.daysAway}</span> 天
                <br />
                <span className="text-2xs tnum text-[var(--text-muted)]">
                  {almanac.nextJieQi.date}
                </span>
              </p>
            ) : null}
            {almanac.festivals.length > 0 ? (
              <p className="mt-3 text-2xs tracking-[0.1em] text-[var(--text-muted)]">
                {almanac.festivals.join(" · ")}
              </p>
            ) : null}
          </div>

          <div className="p-6 md:border-l md:border-[rgba(194,161,92,0.12)]">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">宜忌</span>
              <span className="text-[0.5rem] tracking-[0.1em] text-[var(--text-muted)]">通书整理</span>
            </div>
            <div className="mt-4 space-y-2.5">
              <p className="text-[0.8125rem] leading-relaxed">
                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[rgba(79,127,107,0.22)] text-[0.5rem] text-[#7fb59c]">
                  宜
                </span>
                <span className="text-[var(--text-secondary)]">
                  {almanac.yi.slice(0, 6).join("　") || "—"}
                </span>
              </p>
              <p className="text-[0.8125rem] leading-relaxed">
                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[rgba(168,65,47,0.22)] text-[0.5rem] text-[#d08a7c]">
                  忌
                </span>
                <span className="text-[var(--text-secondary)]">
                  {almanac.ji.slice(0, 6).join("　") || "—"}
                </span>
              </p>
            </div>
            <Link
              href="/almanac"
              className="mt-4 inline-flex items-center gap-1.5 text-2xs tracking-[0.14em] text-[var(--gold)] hover:text-[var(--gold-soft)]"
            >
              查看完整黄历
              <IconArrow className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 入口 ============ */}
      <section className="shell pt-20">
        <SectionHeading
          eyebrow="五个入口"
          title="从一条线开始，而不是从一堆按钮开始"
          description="观星看结构，问卦看处境，择时看节律，藏经看依据。每条线都可以独立走完，也可以彼此印证。"
        />

        {/* 主入口：观星 */}
        <Link
          href="/bazi"
          className="panel panel-hover group mt-8 flex flex-col gap-6 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="flex items-start gap-5">
            <span className="mt-1 text-[var(--gold)]">
              <IconPillars className="h-9 w-9" />
            </span>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="eyebrow">观星</span>
                <span className="text-[0.5rem] tracking-[0.2em] text-[var(--text-muted)]">
                  FOUR PILLARS
                </span>
              </div>
              <h3 className="mt-2 font-serif text-[1.35rem] tracking-[0.06em] text-[var(--text-primary)]">
                八字排盘
              </h3>
              <p className="mt-2 max-w-md text-[0.8125rem] leading-[1.85] text-[var(--text-secondary)]">
                公历农历互转、四柱干支、五行分布、十神藏干、大运流年。
                立春换年、节气定月、真太阳时校正都可查、可切换。
              </p>
            </div>
          </div>

          {/* 迷你四柱示意：抽象线条，不冒充真实命盘 */}
          <div className="flex shrink-0 items-end gap-1.5 self-end sm:self-auto" aria-hidden="true">
            {["年", "月", "日", "时"].map((l, i) => (
              <div
                key={l}
                className="flex h-20 w-11 flex-col items-center justify-center gap-1.5 border border-[rgba(194,161,92,0.18)] transition-colors duration-500 group-hover:border-[rgba(194,161,92,0.4)]"
              >
                <span className="text-[0.5rem] tracking-[0.1em] text-[var(--text-muted)]">{l}</span>
                <span
                  className="mt-1 h-[3px] w-5 rounded-[1px] bg-[rgba(236,230,216,0.34)]"
                  style={{ opacity: 1 - i * 0.14 }}
                />
                <span
                  className="h-[3px] w-5 rounded-[1px] bg-[rgba(236,230,216,0.34)]"
                  style={{ opacity: 1 - i * 0.14 }}
                />
                <span className="mt-1 h-px w-6 bg-[rgba(194,161,92,0.24)]" />
              </div>
            ))}
          </div>
        </Link>

        {/* 四个次入口 */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ENTRIES.map((e) => {
            const Icon = e.icon;
            return (
              <Link key={e.href} href={e.href} className="panel panel-hover group flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--gold)] opacity-80 transition-opacity group-hover:opacity-100">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="text-[0.5rem] tracking-[0.18em] text-[var(--text-muted)]">
                    {e.en}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-[1.05rem] tracking-[0.08em] text-[var(--text-primary)]">
                  {e.title}
                </h3>
                <p className="mt-2 flex-1 text-[0.75rem] leading-[1.8] text-[var(--text-muted)]">
                  {e.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-2xs tracking-[0.14em] text-[var(--gold)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  进入
                  <IconArrow className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ 记录 ============ */}
      <section className="shell pt-20">
        <SectionHeading
          eyebrow="本地记录"
          title="最近的测算"
          description="保存在这台设备的浏览器里，不上传服务器。可随时删除。"
          action={
            <Link href="/history" className="btn btn-ghost">
              全部记录
            </Link>
          }
        />
        <div className="mt-6">
          <RecentRecords />
        </div>
      </section>

      {/* ============ 立场 ============ */}
      <section className="shell pt-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow">立场</span>
            <h2 className="mt-4 text-balance font-serif text-[1.6rem] leading-[1.4] text-[var(--text-primary)]">
              把可计算的，和可解释的，
              <br />
              分开摆放
            </h2>
          </div>

          <div className="space-y-5 text-[0.8125rem] leading-[2] text-[var(--text-secondary)]">
            <p>
              八字排盘的每一步都来自确定性的历法算法：节气时刻由太阳黄经算出，
              干支按六十甲子循环，结果可以拿任何一本万年历对照。
              这一部分是本工具最实在的地方，因此我们把「计算依据」直接摊开给你看。
            </p>
            <p>
              而「这个命盘意味着什么」，属于传统理论的解释范畴。
              不同流派对同一个盘可能给出不同结论，这不是算法错误，而是这门学问本来的样子。
              所以我们标注口径、列出分歧，而不是把某一家之说包装成唯一答案。
            </p>
            <p className="text-[var(--text-muted)]">
              命理不具备科学预测能力，也不该成为医疗、投资、法律或重大人生决策的依据。
              它能提供的，是一套关于性格与节律的传统观察词汇——用不用、怎么用，由你决定。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
