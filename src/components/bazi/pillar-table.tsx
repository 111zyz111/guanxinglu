import type { BaziChart } from "@/lib/bazi/types";
import { ELEMENT_INK } from "@/lib/bazi/constants";

/**
 * 命盘四柱表
 *
 * 刻意放在「宣纸」底上：深色界面里的浅色纸面，是这一页的视觉重心，
 * 也让密集的信息变得可读。所有数值都来自 buildChart 的计算结果。
 */
export function PillarTable({ chart }: { chart: BaziChart }) {
  const labels = ["年柱", "月柱", "日柱", "时柱"] as const;
  const columns = labels.map((label, i) => {
    const p = chart.pillars[i];
    return { label, pillar: p ?? null };
  });

  return (
    <div className="paper-surface print-block">
      <div className="relative px-4 py-6 sm:px-8 sm:py-8">
        {/* 表头：农历与干支 */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[rgba(28,33,38,0.16)] pb-4">
          <div>
            <p className="font-serif text-[1.05rem] tracking-[0.06em] text-[var(--text-on-paper)]">
              {chart.lunarText}
            </p>
            <p className="mt-1 text-2xs tracking-[0.14em] text-[var(--text-on-paper-soft)]">
              {chart.solar.year} 年 {chart.solar.month} 月 {chart.solar.day} 日{" "}
              {String(chart.solar.hour).padStart(2, "0")}:
              {String(chart.solar.minute).padStart(2, "0")}
              {chart.hourKnown ? "" : "（时辰未知）"}
              　属{chart.zodiac}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs tracking-[0.2em] text-[var(--text-on-paper-soft)]">日主</span>
            <span
              className="font-serif text-[1.35rem] leading-none"
              style={{ color: ELEMENT_INK[chart.dayMaster.element] }}
            >
              {chart.dayMaster.gan}
              <span className="ml-1 text-[0.75rem] align-top">{chart.dayMaster.element}</span>
            </span>
          </div>
        </div>

        {/* 四柱 */}
        <div className="grid grid-cols-4 gap-px">
          {columns.map(({ label, pillar }, idx) => {
            const isDay = label === "日柱";
            return (
              <div
                key={label}
                className={`relative px-1 py-2 sm:px-3 ${
                  isDay ? "bg-[rgba(168,65,47,0.045)]" : ""
                }`}
              >
                {/* 柱名 */}
                <p className="mb-3 text-center text-2xs tracking-[0.28em] text-[var(--text-on-paper-soft)]">
                  {label}
                </p>

                {pillar ? (
                  <>
                    {/* 天干十神 */}
                    <p className="mb-1 text-center text-[0.6875rem] tracking-[0.1em] text-[var(--text-on-paper-soft)]">
                      {pillar.tenGodGan}
                    </p>

                    {/* 天干 */}
                    <p
                      className="text-center font-serif text-[2.1rem] leading-[1.15] sm:text-[2.6rem]"
                      style={{ color: ELEMENT_INK[pillar.ganElement] }}
                    >
                      {pillar.gan}
                    </p>

                    {/* 地支 */}
                    <p
                      className="mt-1 text-center font-serif text-[2.1rem] leading-[1.15] sm:text-[2.6rem]"
                      style={{ color: ELEMENT_INK[pillar.zhiElement] }}
                    >
                      {pillar.zhi}
                    </p>

                    {/* 藏干 */}
                    <div className="mt-3 border-t border-[rgba(28,33,38,0.1)] pt-2">
                      <p className="text-center text-[0.625rem] tracking-[0.1em] text-[var(--text-on-paper-soft)]">
                        藏干
                      </p>
                      <p className="mt-1 text-center text-[0.75rem] leading-[1.6] text-[var(--text-on-paper)]">
                        {pillar.hidden.map((h, i) => (
                          <span key={h.stem}>
                            {i > 0 ? " " : ""}
                            <span style={{ color: ELEMENT_INK[h.element] }}>{h.stem}</span>
                            <span className="text-[0.5625rem] text-[var(--text-on-paper-soft)]">
                              {h.tenGod === "日主" ? "" : h.tenGod}
                            </span>
                          </span>
                        ))}
                      </p>
                    </div>

                    {/* 纳音 / 地势 / 旬空 */}
                    <dl className="mt-2 space-y-1 border-t border-[rgba(28,33,38,0.1)] pt-2 text-center">
                      <div>
                        <dt className="text-[0.5625rem] tracking-[0.14em] text-[var(--text-on-paper-soft)]">
                          纳音
                        </dt>
                        <dd className="text-[0.6875rem] leading-tight text-[var(--text-on-paper)]">
                          {pillar.naYin}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.5625rem] tracking-[0.14em] text-[var(--text-on-paper-soft)]">
                          地势
                        </dt>
                        <dd className="text-[0.6875rem] leading-tight text-[var(--text-on-paper)]">
                          {pillar.diShi}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.5625rem] tracking-[0.14em] text-[var(--text-on-paper-soft)]">
                          旬空
                        </dt>
                        <dd className="text-[0.6875rem] leading-tight text-[var(--text-on-paper)]">
                          {pillar.xunKong}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10">
                    <span className="text-[0.6875rem] tracking-[0.1em] text-[var(--text-on-paper-soft)]">
                      时辰未知
                    </span>
                    <span className="font-serif text-[2.1rem] leading-none text-[rgba(28,33,38,0.16)]">
                      空
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 印章 */}
        <div className="pointer-events-none absolute right-4 top-4 sm:right-7 sm:top-6" aria-hidden="true">
          <div className="seal h-10 w-10 rotate-[3deg] flex-col text-[0.55rem] leading-[1.1] opacity-80">
            <span>观星</span>
            <span>录印</span>
          </div>
        </div>
      </div>

      {/* 胎元等 */}
      <div className="grid grid-cols-2 gap-px border-t border-[rgba(28,33,38,0.14)] bg-[rgba(28,33,38,0.05)] sm:grid-cols-4">
        {[
          ["胎元", chart.extra.taiYuan],
          ["命宫", chart.extra.mingGong],
          ["身宫", chart.extra.shenGong],
          ["胎息", chart.extra.taiXi],
        ].map(([k, v]) => (
          <div key={k} className="bg-[var(--paper)] px-3 py-2.5 text-center">
            <p className="text-[0.5625rem] tracking-[0.18em] text-[var(--text-on-paper-soft)]">{k}</p>
            <p className="mt-0.5 font-serif text-[0.8125rem] text-[var(--text-on-paper)]">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
