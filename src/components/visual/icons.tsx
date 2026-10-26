/**
 * 入口图标：统一线性风格，1px 描边，currentColor 着色。
 * 全部手写 SVG，不使用任何第三方图标库，避免授权与风格不一致问题。
 */

type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 观星：四柱 */
export function IconPillars({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <rect x="3.5" y="4" width="4" height="16" rx="0.5" />
      <rect x="10" y="4" width="4" height="16" rx="0.5" />
      <rect x="16.5" y="4" width="4" height="16" rx="0.5" />
      <path d="M3.5 9.5h4M10 9.5h4M16.5 9.5h4M3.5 14.5h4M10 14.5h4M16.5 14.5h4" opacity="0.5" />
    </svg>
  );
}

/** 问卦：六爻 */
export function IconHexagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M5 5h14" />
      <path d="M5 9h5M14 9h5" />
      <path d="M5 13h14" />
      <path d="M5 17h5M14 17h5" />
      <path d="M5 21h14" opacity="0.45" />
    </svg>
  );
}

/** 择时：节气环 */
export function IconSolarTerm({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M19.4 4.6L18 6M6 18l-1.4 1.4" />
    </svg>
  );
}

/** 知己：对话 */
export function IconDialogue({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M4 6.5h16v10H10l-4.5 3.5v-3.5H4z" />
      <path d="M8 10.5h8M8 13.5h5" opacity="0.55" />
    </svg>
  );
}

/** 藏经：书册 */
export function IconCanon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M5 3.5h12.5a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5H5z" />
      <path d="M5 3.5A1.5 1.5 0 0 0 3.5 5v14A1.5 1.5 0 0 0 5 20.5" opacity="0.5" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" opacity="0.55" />
    </svg>
  );
}

/** 记录：卷轴 */
export function IconScroll({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M6 4.5h11a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2z" />
      <path d="M6 4.5a2 2 0 0 0-2 2v11" opacity="0.5" />
      <path d="M10 9h5M10 12.5h5" opacity="0.55" />
    </svg>
  );
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5" />
    </svg>
  );
}
