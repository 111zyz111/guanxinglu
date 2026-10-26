import Link from "next/link";
import type { Metadata } from "next";
import { buildChart } from "@/lib/bazi/engine";
import { decodeBirthInput } from "@/lib/storage";
import { PillarTable } from "@/components/bazi/pillar-table";
import { WuXingChart, StrengthMeter } from "@/components/bazi/wuxing-chart";
import { DaYunTimeline } from "@/components/bazi/dayun-timeline";
import { ResultActions } from "@/components/bazi/result-actions";
import { Callout } from "@/components/ui/empty-state";
import type { BirthInput } from "@/lib/bazi/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "命盘",
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

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const input = decodeBirthInput(toQuery(sp));

  if (!input) {
    return (
      <div className="shell-narrow pb-24 pt-16">
        <div className="panel p-8 text-center">
          <h1 className="font-serif text-xl text-[var(--text-primary)]">缺少出生信息</h1>
          <p className="mx-auto mt-3 max-w-sm text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">
            这个页面需要出生日期才能排盘。请回到表单填写，或从「记录」里选一条已有记录。
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/bazi" className="btn btn-primary">
              去填写
            </Link>
            <Link href="/history" className="btn btn-ghost">
              查看记录
            </Link>
          </div>
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
          <h1 className="font-serif text-xl text-[var(--text-primary)]">排盘失败</h1>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--cinnabar)]">
            {err instanceof Error ? err.message : "未知错误"}
          </p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">
            可能是日期超出支持范围（1900–2100），或农历闰月选择有误。
          </p>
          <Link href="/bazi" className="btn btn-ghost mt-6">
            返回修改
          </Link>
        </div>
      </div>
    );
  }

  const rel = chart.relations;
  const hasRelations =
    rel.ganHe.length + rel.zhiChong.length + rel.zhiHe.length + rel.sanHe.length > 0;

  return (
    <div className="shell pb-24 pt-10">
      {/* 头部 */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">命盘</span>
          <span className="text-2xs text-[var(--text-muted)]">
            {chart.meta.engine}
          </span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-[1.9rem] leading-tight tracking-[0.06em] text-[var(--text-primary)]">
              {chart.pillars.map((p) => p.ganZhi).join("　")}
            </h1>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
              {chart.lunarText}　属{chart.zodiac}　日主
              <span className="text-[var(--gold)]">
                {chart.dayMaster.gan}
                {chart.dayMaster.element}
              </span>
              {chart.hourKnown ? "" : "　（时辰未知）"}
            </p>
          </div>
          <Link href="/bazi" className="btn btn-quiet no-print self-start">
            重新排盘
          </Link>
        </div>
      </header>

      {/* 操作 */}
      <div className="mb-6">
        <ResultActions chart={chart} input={input as BirthInput} />
      </div>

      {/* 提示 */}
      {chart.warnings.length > 0 ? (
        <div className="no-print mb-6 space-y-2">
          {chart.warnings.map((w, i) => (
            <Callout key={i} tone="warn">
              {w}
            </Callout>
          ))}
        </div>
      ) : null}

      {/* 命盘 */}
      <PillarTable chart={chart} />

      {/* 五行 + 旺衰 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <WuXingChart chart={chart} />
        <StrengthMeter chart={chart} />
      </div>

      {/* 大运 */}
      <div className="mt-4">
        <DaYunTimeline chart={chart} />
      </div>

      {/* 关系 + 依据 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5 sm:p-6">
          <h3 className="mb-4 font-serif text-base tracking-[0.08em]">刑冲合会</h3>
          {hasRelations ? (
            <ul className="space-y-2 text-[0.8125rem] leading-[1.8] text-[var(--text-secondary)]">
              {rel.ganHe.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-[var(--gold)]">合</span>
                  {r}
                </li>
              ))}
              {rel.zhiHe.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-[var(--gold)]">合</span>
                  {r}
                </li>
              ))}
              {rel.zhiChong.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-[var(--cinnabar)]">冲</span>
                  {r}
                </li>
              ))}
              {rel.sanHe.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-[var(--jade)]">局</span>
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.8125rem] leading-[1.8] text-[var(--text-muted)]">
              四柱之间未见明显的天干五合、地支六冲、六合或三合。
            </p>
          )}
          <p className="mt-4 border-t border-[rgba(194,161,92,0.12)] pt-3 text-2xs leading-[1.8] text-[var(--text-muted)]">
            此处只列出结构关系，不做吉凶判断。冲主变动、合主牵连，但变动本身无好坏。
          </p>
        </div>

        <div className="panel p-5 sm:p-6">
          <h3 className="mb-4 font-serif text-base tracking-[0.08em]">计算依据</h3>
          <dl className="space-y-2.5 text-[0.75rem] leading-[1.7]">
            {[
              ["输入时间", chart.meta.inputTime],
              ["用于计算", chart.meta.effectiveTime],
              ["年柱", chart.meta.yearRule],
              ["月柱", chart.meta.monthRule],
              ["日柱", chart.meta.dayRule],
              ["时柱", chart.meta.timeRule],
              ["真太阳时", chart.meta.solarTimeNote],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-16 shrink-0 text-[var(--text-muted)]">{k}</dt>
                <dd className="text-[var(--text-secondary)]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-[rgba(194,161,92,0.12)] pt-3 text-2xs leading-[1.8] text-[var(--text-muted)]">
            年柱以立春换年、月柱以节气定月，这两项为命理界主流口径。
            若你的师承采用其他规则，结果会有差异，属正常现象。
          </p>
        </div>
      </div>

      {/* 底部说明 */}
      <div className="no-print mt-8">
        <Callout tone="note" title="怎么读这一页">
          上半部分的干支、五行计数、大运年份都是计算出来的，可以拿万年历逐项核对；
          旺衰评分是本工具的简化模型，解读文字属于传统理论框架。
          两者性质不同，请分开看待。
        </Callout>
      </div>
    </div>
  );
}
