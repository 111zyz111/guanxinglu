"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "首页", sub: "Home" },
  { href: "/bazi", label: "观星", sub: "四柱" },
  { href: "/yijing", label: "问卦", sub: "易" },
  { href: "/almanac", label: "择时", sub: "黄历" },
  { href: "/canon", label: "藏经", sub: "词典" },
  { href: "/history", label: "记录", sub: "本地" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`no-print sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-[rgba(194,161,92,0.16)] bg-[rgba(8,11,15,0.82)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="观星录 首页">
          <span
            className="seal h-8 w-8 text-[0.8rem] transition-transform duration-500 group-hover:rotate-[-4deg]"
            aria-hidden="true"
          >
            觀
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[1.05rem] tracking-[0.22em] text-[var(--text-primary)]">
              观星录
            </span>
            <span className="mt-1 text-[0.5rem] tracking-[0.34em] text-[var(--text-muted)]">
              GUAN XING LU
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-[0.8125rem] tracking-[0.16em] transition-colors duration-300 ${
                  active
                    ? "text-[var(--gold-soft)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-1/2 h-px -translate-x-1/2 bg-[var(--gold)] transition-all duration-500 ${
                    active ? "w-5 opacity-90" : "w-0 opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/bazi" className="btn btn-primary hidden !px-5 !py-2 !text-[0.8125rem] sm:inline-flex">
            开始排盘
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-quiet md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "关闭菜单" : "打开菜单"}
          >
            <span className="flex flex-col gap-[5px]">
              <span
                className={`block h-px w-5 bg-current transition-transform duration-300 ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-current transition-opacity duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-current transition-transform duration-300 ${
                  open ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-[rgba(194,161,92,0.14)] bg-[rgba(8,11,15,0.96)] backdrop-blur-md transition-[max-height,opacity] duration-500 md:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="shell grid grid-cols-2 gap-px py-3" aria-label="移动导航">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-baseline gap-2 px-2 py-3 text-sm ${
                  active ? "text-[var(--gold-soft)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {item.label}
                <span className="text-2xs text-[var(--text-muted)]">{item.sub}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
