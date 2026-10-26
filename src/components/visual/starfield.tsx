"use client";

import { useMemo } from "react";

/**
 * 星野背景
 *
 * 用固定种子的伪随机数生成星点，保证服务端与客户端渲染结果完全一致
 * （避免 hydration mismatch）。同时叠加一层缓慢漂移，制造呼吸感。
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  delay: number;
  duration: number;
}

export function Starfield({
  count = 110,
  seed = 20261026,
  className = "",
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.4 + rand() * 1.3,
      o: 0.12 + rand() * 0.6,
      delay: rand() * 8,
      duration: 5 + rand() * 7,
    }));
  }, [count, seed]);

  return (
    <div className={`starfield ${className}`} aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="animate-slow-drift"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r * 0.11}
            fill={i % 7 === 0 ? "var(--gold-soft)" : "#e8e2d2"}
            opacity={s.o}
            style={{
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * 星宿连线：几组固定的星点与细线，形成「观星」的意象。
 * 坐标经过手工排布，不依赖随机数。
 */
export function ConstellationMap({ className = "" }: { className?: string }) {
  const groups: { points: [number, number][]; closed?: boolean }[] = [
    { points: [[12, 26], [22, 18], [33, 24], [30, 36], [18, 38]], closed: true },
    { points: [[58, 14], [68, 10], [76, 18], [70, 27]] },
    { points: [[82, 40], [90, 48], [85, 58], [74, 54]] },
  ];

  return (
    <svg
      viewBox="0 0 100 70"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="var(--gold)"
      strokeWidth="0.12"
      opacity="0.35"
    >
      {groups.map((g, gi) => (
        <g key={gi}>
          <polyline
            points={[...g.points, ...(g.closed ? [g.points[0]] : [])]
              .map(([x, y]) => `${x},${y}`)
              .join(" ")}
            strokeDasharray="0.6 1.2"
          />
          {g.points.map(([x, y], pi) => (
            <circle key={pi} cx={x} cy={y} r="0.42" fill="var(--gold-soft)" stroke="none" />
          ))}
        </g>
      ))}
    </svg>
  );
}
