import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "本地记录",
  robots: { index: false, follow: false },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
