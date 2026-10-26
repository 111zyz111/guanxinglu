import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
        align === "center" ? "text-center sm:flex-col sm:items-center" : ""
      }`}
    >
      <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <div
            className={`mb-3 flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
          >
            <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
            <span className="eyebrow">{eyebrow}</span>
          </div>
        ) : null}
        <h2 className="text-balance text-[1.6rem] leading-[1.35] text-[var(--text-primary)] sm:text-[1.9rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-pretty text-sm leading-[1.85] text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
