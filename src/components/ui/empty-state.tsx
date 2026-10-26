import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon = "空",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(194,161,92,0.24)] font-serif text-sm text-[var(--gold-dim)]"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="font-serif text-base text-[var(--text-primary)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: "note" | "warn" | "info";
  title?: string;
  children: ReactNode;
}) {
  const toneMap = {
    note: {
      border: "rgba(194,161,92,0.22)",
      bg: "rgba(194,161,92,0.05)",
      accent: "var(--gold)",
    },
    warn: {
      border: "rgba(168,65,47,0.34)",
      bg: "rgba(168,65,47,0.07)",
      accent: "var(--cinnabar)",
    },
    info: {
      border: "rgba(79,127,107,0.3)",
      bg: "rgba(79,127,107,0.06)",
      accent: "var(--jade)",
    },
  }[tone];

  return (
    <div
      className="rounded-sm px-4 py-3.5"
      style={{
        borderLeft: `2px solid ${toneMap.accent}`,
        background: toneMap.bg,
        border: `1px solid ${toneMap.border}`,
        borderLeftWidth: "2px",
        borderLeftColor: toneMap.accent,
      }}
    >
      {title ? (
        <p className="mb-1.5 text-[0.8125rem] font-medium tracking-[0.08em] text-[var(--text-primary)]">
          {title}
        </p>
      ) : null}
      <div className="text-[0.8125rem] leading-[1.8] text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}
