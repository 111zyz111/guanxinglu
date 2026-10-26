"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { saveRecord, loadSettings } from "@/lib/storage";
import type { BaziChart } from "@/lib/bazi/types";
import type { BirthInput } from "@/lib/bazi/types";
import { encodeBirthInput } from "@/lib/storage";

export function ResultActions({
  chart,
  input,
}: {
  chart: BaziChart;
  input: BirthInput;
}) {
  const [saved, setSaved] = useState<"idle" | "saved" | "off" | "failed">("idle");
  const [copied, setCopied] = useState(false);

  const href = `/bazi/result?${encodeBirthInput(input)}`;

  useEffect(() => {
    const settings = loadSettings();
    if (!settings.persistHistory) {
      setSaved("off");
      return;
    }
    const rec = saveRecord({
      type: "bazi",
      title: `${chart.solar.year}-${String(chart.solar.month).padStart(2, "0")}-${String(
        chart.solar.day,
      ).padStart(2, "0")} ${String(chart.solar.hour).padStart(2, "0")}:${String(
        chart.solar.minute,
      ).padStart(2, "0")}`,
      summary: `${chart.pillars.map((p) => p.ganZhi).join(" ")}　日主${chart.dayMaster.gan}${chart.dayMaster.element}`,
      href,
      payload: input,
    });
    setSaved(rec ? "saved" : "failed");
  }, [chart, input, href]);

  async function handleShare() {
    const url = `${window.location.origin}${href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "观星录 · 命盘", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // 用户取消或剪贴板不可用：静默失败，不打扰
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <Link
        href={`/bazi/reading?${encodeBirthInput(input)}`}
        className="btn btn-primary flex-1 sm:flex-none"
      >
        AI 解读
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <button type="button" onClick={() => window.print()} className="btn btn-ghost">
        打印 / 存 PDF
      </button>

      <button type="button" onClick={handleShare} className="btn btn-ghost">
        {copied ? "链接已复制" : "分享链接"}
      </button>

      <span className="ml-auto text-2xs text-[var(--text-muted)]">
        {saved === "saved" ? "已保存到本机记录" : null}
        {saved === "off" ? "未开启历史保存" : null}
        {saved === "failed" ? "保存失败（浏览器存储不可用）" : null}
      </span>
    </div>
  );
}
