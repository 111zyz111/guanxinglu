import type { BaziChart } from "@/lib/bazi/types";
import { ELEMENT_COLOR, ELEMENT_DESC, WU_XING } from "@/lib/bazi/constants";

/**
 * 五行分布
 *
 * 同时呈现两种口径，并说明差异：
 *  - 本气计数：4 天干 + 4 地支本气，共 8，直观可核对
 *  - 藏干加权：把地支藏干按本气/中气/余气加权，更接近实际力量分布
 */
export function WuXingChart({ chart }: { chart: BaziChart }) {
  const maxScore = Math.max(...WU_XING.map((e) => chart.elementScore[e]), 1);
  const totalScore = WU_XING.reduce((s, e) => s + chart.elementScore[e], 0);

  return (
    <div className="panel p-5 sm:p-7">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-base tracking-[0.08em] text-[var(--text-primary)]">
          五行分布
        </h3>
        <span className="text-2xs tracking-[0.14em] text-[var(--text-muted)]">
          合计 {totalScore.toFixed(1)}
        </span>
      </div>

      <div className="space-y-4">
        {WU_XING.map((e) => {
          const score = chart.elementScore[e];
          const count = chart.elementCount[e];
          const pct = totalScore > 0 ? (score / totalScore) * 100 : 0;
          const width = (score / maxScore) * 100;
          const missing = count === 0;

          return (
            <div key={e} className="grid grid-cols-[2.2rem_1fr_4.6rem] items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span
                  className="font-serif text-[1.15rem] leading-none"
                  style={{ color: ELEMENT_COLOR[e] }}
                >
                  {e}
                </span>
                {missing ? (
                  <span
                    className="text-[0.5rem] tracking-wider text-[var(--cinnabar)]"
                    title="八字本气中不见此五行"
                  >
                    缺
                  </span>
                ) : null}
              </div>

              <div
                className="relative h-[8px] overflow-hidden rounded-full bg-[rgba(236,230,216,0.1)]"
                role="img"
                aria-label={`${e}：加权 ${score.toFixed(1)}，本气 ${count}`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-1000 ease-ink"
                  style={{
                    width: `${width}%`,
                    // 底色保证在 color-mix 不受支持时仍可见；
                    // 渐变用 color-mix 由浅到实，避免对 CSS 变量做字符串拼接（var(--x)66 是非法值）
                    backgroundColor: ELEMENT_COLOR[e],
                    backgroundImage: `linear-gradient(90deg, color-mix(in srgb, ${ELEMENT_COLOR[e]} 38%, transparent), ${ELEMENT_COLOR[e]})`,
                    opacity: score > 0 ? 1 : 0,
                  }}
                />
              </div>

              <div className="flex items-baseline justify-end gap-2 text-2xs tnum">
                <span className="text-[var(--text-secondary)]">{score.toFixed(1)}</span>
                <span className="text-[var(--text-muted)]">{pct.toFixed(0)}%</span>
                <span className="w-4 text-right text-[var(--text-muted)]">×{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-[rgba(194,161,92,0.12)] pt-4 text-[0.75rem] leading-[1.75] text-[var(--text-muted)]">
        条形长度按「藏干加权」绘制，×后数字为「本气计数」。
        两种口径都会在命理实践中出现，前者更接近实际力量，后者便于核对。
      </p>

      {chart.missingElements.length > 0 ? (
        <p className="mt-2 text-[0.75rem] leading-[1.75] text-[var(--text-muted)]">
          <span className="text-[var(--cinnabar)]">缺</span>
          {chart.missingElements.join("、")}：仅表示八字本气中不见，
          <span className="text-[var(--text-secondary)]">不等于需要补</span>
          。是否引入该行要看整体结构。
        </p>
      ) : null}

      <div className="mt-5 grid gap-2 border-t border-[rgba(194,161,92,0.12)] pt-4">
        {WU_XING.filter((e) => chart.elementCount[e] > 0).map((e) => (
          <p key={e} className="text-[0.75rem] leading-[1.7] text-[var(--text-muted)]">
            <span style={{ color: ELEMENT_COLOR[e] }} className="font-serif">
              {e}
            </span>
            <span className="ml-2">{ELEMENT_DESC[e].trait}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

/** 旺衰刻度 */
export function StrengthMeter({ chart }: { chart: BaziChart }) {
  const { label, score, factors, method } = chart.strength;

  return (
    <div className="panel p-5 sm:p-7">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-base tracking-[0.08em] text-[var(--text-primary)]">
          旺衰评估
        </h3>
        <span className="text-2xs tracking-[0.14em] text-[var(--gold)]">
          {label}　{score}/100
        </span>
      </div>

      {/* 刻度条 */}
      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-full">
          <div className="h-full flex-[38] bg-[rgba(63,95,128,0.55)]" title="偏弱" />
          <div className="h-full flex-[24] bg-[rgba(194,161,92,0.4)]" title="中和" />
          <div className="h-full flex-[38] bg-[rgba(168,65,47,0.5)]" title="偏强" />
        </div>
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--ink-900)] bg-[var(--gold-soft)] shadow-[0_0_12px_rgba(194,161,92,0.7)] transition-[left] duration-1000 ease-ink"
          style={{ left: `${score}%` }}
          aria-hidden="true"
        />
        <div className="mt-2 flex justify-between text-[0.5625rem] tracking-[0.16em] text-[var(--text-muted)]">
          <span>偏弱</span>
          <span>中和</span>
          <span>偏强</span>
        </div>
      </div>

      <dl className="mt-6 space-y-3">
        {factors.map((f) => (
          <div key={f.key} className="border-l border-[rgba(194,161,92,0.2)] pl-3">
            <dt className="flex items-baseline gap-2 text-[0.8125rem] text-[var(--text-primary)]">
              <span className="font-serif">{f.key}</span>
              <span className="text-2xs tnum text-[var(--gold)]">{f.value}</span>
            </dt>
            <dd className="mt-1 text-[0.75rem] leading-[1.7] text-[var(--text-muted)]">
              {f.detail}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 border-t border-[rgba(194,161,92,0.12)] pt-4 text-[0.7rem] leading-[1.7] text-[var(--text-muted)]">
        {method}
      </p>
    </div>
  );
}
