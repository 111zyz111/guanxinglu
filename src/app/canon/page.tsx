import type { Metadata } from "next";
import { GlossaryBrowser } from "@/components/canon/glossary-browser";
import { SectionHeading } from "@/components/ui/section-heading";
import { Callout } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "藏经 · 术语词典",
  description:
    "八字、十神、藏干、大运、真太阳时、梅花易数等传统命理术语的释义。每条术语区分「可计算的定义」与「传统的解释」。",
};

type SearchParams = Record<string, string | string[] | undefined>;

const SCHOOLS: { name: string; era: string; note: string }[] = [
  {
    name: "子平术",
    era: "宋以后为主流",
    note:
      "以日干为「我」，看月令、十神、格局与旺衰。徐大升《渊海子平》是这一体系的早期汇编，后世排盘工具大多沿此路径。本项目的四柱与十神框架属于这一路。",
  },
  {
    name: "盲派",
    era: "口传，成文较晚",
    note:
      "重视「象」与具体事项的对应，讲究口诀与师承，公开文献较少。同一命盘在盲派与子平术下的说法可能差别很大，这属于体系差异，不是谁算错了。",
  },
  {
    name: "调候派",
    era: "《穷通宝鉴》一系",
    note:
      "关注出生时的寒暖燥湿，主张先看气候是否得宜，再论旺衰。冬生喜火、夏生喜水的思路即出于此。",
  },
  {
    name: "紫微斗数",
    era: "另一套独立体系",
    note:
      "以十二宫与星曜排盘，与八字不共用一套符号。两者可以并看，但不能互相换算。本项目首期未纳入，已登记为后续方向。",
  },
];

const CLASSICS: { title: string; note: string }[] = [
  {
    title: "《渊海子平》",
    note: "旧题宋·徐大升编。子平术的早期汇编本，十神、格局、神煞的名目多出于此系文献。",
  },
  {
    title: "《三命通会》",
    note: "明·万民英撰。体量庞大，汇集了此前各家说法，是查考术语源流时最常被引用的一部。",
  },
  {
    title: "《滴天髓》",
    note: "旧题京图撰、刘基注，通行本经清代任铁樵增注。文字简奥，讲的是气势与流通，不是操作手册。",
  },
  {
    title: "《子平真诠》",
    note: "清·沈孝瞻撰。专论格局成败，逻辑相对清晰，是理解「格局」一词的常用入口。",
  },
  {
    title: "《周易》",
    note: "先秦成书，属公有领域。本项目的卦辞、爻辞即取自此书通行本原文，未作改写。",
  },
];

export default async function CanonPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const c = typeof sp.c === "string" ? sp.c : "全部";

  return (
    <div className="shell pb-24 pt-12">
      <header className="mb-8 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">藏经 · 词典</span>
        </div>
        <h1 className="font-serif text-[1.9rem] leading-tight tracking-[0.04em] text-[var(--text-primary)]">
          术语词典
        </h1>
        <p className="mt-3 text-pretty text-[0.875rem] leading-[1.95] text-[var(--text-secondary)]">
          命理的门槛，一半在术语。这一页不解释「你的命运」，只解释这些词到底在说什么。
          每条都尽量给出可核对的机械定义，再谈它在传统里被赋予的含义。
        </p>
      </header>

      <GlossaryBrowser initialQuery={q} initialCategory={c} />

      {/* 流派 */}
      <section className="pt-16">
        <SectionHeading
          eyebrow="流派"
          title="同一个盘，为什么说法不一样"
          description="命理不是一个统一的理论体系，而是若干并行传统。知道某一说法出自哪一派，比记住结论更有用。"
        />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {SCHOOLS.map((s) => (
            <article key={s.name} className="panel p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-[1.05rem] tracking-[0.08em] text-[var(--text-primary)]">
                  {s.name}
                </h3>
                <span className="text-[0.5625rem] tracking-[0.14em] text-[var(--text-muted)]">
                  {s.era}
                </span>
              </div>
              <p className="mt-2.5 text-[0.8125rem] leading-[1.95] text-[var(--text-secondary)]">
                {s.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 古籍 */}
      <section className="pt-16">
        <SectionHeading
          eyebrow="古籍"
          title="这些书是什么"
          description="只做书目性质的介绍，不摘录原文、不代拟注释。想读原书，请找正规出版的整理本。"
        />
        <dl className="mt-6 divide-y divide-[rgba(194,161,92,0.12)] border-y border-[rgba(194,161,92,0.12)]">
          {CLASSICS.map((b) => (
            <div key={b.title} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="font-serif text-[0.9375rem] tracking-[0.06em] text-[var(--gold-soft)]">
                {b.title}
              </dt>
              <dd className="text-[0.8125rem] leading-[1.9] text-[var(--text-secondary)]">{b.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10">
        <Callout tone="note" title="关于引用">
          本页除《周易》卦爻辞（先秦成书，属公有领域）外，不引用任何古籍原文。
          现代整理、注释、翻译版本受著作权保护，本项目不复制、不改写。
          术语释义与流派介绍为本项目自行撰写，若与你的师承说法不同，以你的师承为准。
        </Callout>
      </div>
    </div>
  );
}
