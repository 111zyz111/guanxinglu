import type { Hexagram } from "@/lib/yijing/hexagrams";

/**
 * 卦象线条
 *
 * 六爻自下而上绘制，但视觉上从上往下读，故渲染时反转。
 * 阳爻为一整条，阴爻为中断的两段；动爻在右侧标朱点。
 */
export function HexagramLines({
  lines,
  moving = [],
  tone = "gold",
  animate = false,
}: {
  lines: number[];
  moving?: number[];
  tone?: "gold" | "dim";
  animate?: boolean;
}) {
  const color = tone === "gold" ? "var(--gold-soft)" : "rgba(236,230,216,0.42)";
  const ordered = lines.map((v, i) => ({ value: v, position: i + 1 })).reverse();

  return (
    <div className="flex flex-col items-center gap-[7px]">
      {ordered.map(({ value, position }, idx) => {
        const isMoving = moving.includes(position);
        return (
          <div
            key={position}
            className="flex w-full items-center gap-2"
            style={
              animate
                ? {
                    animation: "fade-in 0.5s ease both",
                    animationDelay: `${idx * 90}ms`,
                  }
                : undefined
            }
          >
            <div className="flex h-[7px] flex-1 items-center gap-[9px]">
              {value === 1 ? (
                <span
                  className="h-full flex-1 rounded-[1px]"
                  style={{ background: isMoving ? "var(--cinnabar)" : color }}
                />
              ) : (
                <>
                  <span
                    className="h-full flex-1 rounded-[1px]"
                    style={{ background: isMoving ? "var(--cinnabar)" : color }}
                  />
                  <span className="h-full w-[9px] shrink-0" />
                  <span
                    className="h-full flex-1 rounded-[1px]"
                    style={{ background: isMoving ? "var(--cinnabar)" : color }}
                  />
                </>
              )}
            </div>
            <span className="w-3 shrink-0 text-[0.6875rem] leading-none text-[var(--cinnabar)]">
              {isMoving ? (value === 1 ? "○" : "×") : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** 卦名 + 上下卦 + 卦序（卦形由 HexagramLines 绘制，此处不再重复 Unicode 卦符） */
export function HexagramTitle({
  hexagram,
  caption,
}: {
  hexagram: Hexagram;
  caption: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[0.5625rem] tracking-[0.3em] text-[var(--text-muted)]">{caption}</p>
      <h3 className="mt-3 font-serif text-[1.65rem] tracking-[0.16em] text-[var(--gold-soft)]">
        {hexagram.name}
      </h3>
      <p className="mt-2 text-[0.6875rem] tracking-[0.12em] text-[var(--text-secondary)]">
        上{hexagram.upper}
        {hexagram.upperImage}　下{hexagram.lower}
        {hexagram.lowerImage}
      </p>
      <p className="mt-1 text-[0.5625rem] tracking-[0.2em] text-[var(--text-muted)]">
        第 {hexagram.no} 卦　{hexagram.theme}
      </p>
    </div>
  );
}
