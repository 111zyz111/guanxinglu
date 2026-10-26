import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "易经起卦",
  description:
    "以铜钱摇卦、梅花易数时间起卦或数字起卦得到本卦与变卦，查看《周易》卦辞、爻辞原文与白话解读，并可核对起卦过程。",
};

export default function YijingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
