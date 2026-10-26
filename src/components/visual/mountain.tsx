/**
 * 山影
 * 三层叠压的山脊剪影，用极低对比度的渐变制造纵深，
 * 避免使用任何位图素材。
 */
export function MountainRidge({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ridge-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2a36" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0a0e13" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="ridge-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16222d" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#080b0f" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="ridge-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e161d" stopOpacity="1" />
          <stop offset="100%" stopColor="#060809" stopOpacity="1" />
        </linearGradient>
      </defs>

      <path
        d="M0,210 L120,150 L210,186 L320,110 L420,168 L520,120 L640,180 L760,132 L880,176 L1000,124 L1120,170 L1240,138 L1340,180 L1440,150 L1440,320 L0,320 Z"
        fill="url(#ridge-far)"
      />
      <path
        d="M0,250 L110,206 L230,240 L340,180 L450,232 L560,190 L690,238 L820,196 L940,244 L1060,200 L1180,242 L1300,204 L1440,246 L1440,320 L0,320 Z"
        fill="url(#ridge-mid)"
      />
      <path
        d="M0,290 L140,262 L280,288 L420,254 L560,286 L700,258 L840,290 L980,262 L1120,292 L1260,266 L1440,294 L1440,320 L0,320 Z"
        fill="url(#ridge-near)"
      />
    </svg>
  );
}
