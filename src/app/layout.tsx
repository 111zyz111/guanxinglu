import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: {
    default: "观星录 · 中国传统命理文化",
    template: "%s · 观星录",
  },
  description:
    "观星录是一个中国传统命理文化的体验与研究工具。以可验证的历法算法完成八字排盘、易经起卦与黄历查询，用现代设计呈现东方美学。所有出生信息默认只保存在本地。",
  keywords: ["八字", "排盘", "易经", "黄历", "节气", "传统文化", "命理"],
  authors: [{ name: "观星录" }],
  openGraph: {
    title: "观星录 · 观天时，察己心",
    description:
      "以可验证的历法算法完成八字排盘、易经起卦与黄历查询的中国传统命理文化工具。",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#080b0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--gold)] focus:px-4 focus:py-2 focus:text-sm focus:text-black"
        >
          跳到主要内容
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
