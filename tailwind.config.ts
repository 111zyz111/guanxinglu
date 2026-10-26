import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "var(--ink-900)",
          800: "var(--ink-800)",
          700: "var(--ink-700)",
          600: "var(--ink-600)",
          500: "var(--ink-500)",
        },
        paper: {
          DEFAULT: "var(--paper)",
          deep: "var(--paper-deep)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          soft: "var(--gold-soft)",
          dim: "var(--gold-dim)",
        },
        cinnabar: "var(--cinnabar)",
        jade: "var(--jade)",
        dai: "var(--dai)",
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1.1rem", letterSpacing: "0.08em" }],
      },
      letterSpacing: {
        seal: "0.35em",
      },
      transitionTimingFunction: {
        ink: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "draw-line": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.85" },
        },
        "slow-drift": {
          "0%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(-12px,8px,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 1.1s ease both",
        "draw-line": "draw-line 1.2s cubic-bezier(0.22,1,0.36,1) both",
        twinkle: "twinkle 6s ease-in-out infinite",
        "slow-drift": "slow-drift 26s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
