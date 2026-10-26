import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print relative mt-24 border-t border-[rgba(194,161,92,0.14)]">
      <div className="shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="seal h-7 w-7 text-[0.7rem]" aria-hidden="true">
              觀
            </span>
            <span className="font-serif text-base tracking-[0.22em]">观星录</span>
          </div>
          <p className="mt-4 max-w-sm text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">
            以可验证的历法计算为骨，以传统命理文献为参照，
            提供一个可以自己核对、自己判断的传统文化体验工具。
          </p>
        </div>

        <nav aria-label="页脚导航">
          <h3 className="eyebrow mb-4">探索</h3>
          <ul className="space-y-2 text-[0.8125rem] text-[var(--text-secondary)]">
            <li><Link href="/bazi" className="hover:text-[var(--gold-soft)]">八字排盘</Link></li>
            <li><Link href="/yijing" className="hover:text-[var(--gold-soft)]">易经起卦</Link></li>
            <li><Link href="/almanac" className="hover:text-[var(--gold-soft)]">黄历节气</Link></li>
            <li><Link href="/canon" className="hover:text-[var(--gold-soft)]">术语词典</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="eyebrow mb-4">说明</h3>
          <ul className="space-y-2 text-[0.8125rem] text-[var(--text-secondary)]">
            <li><Link href="/settings" className="hover:text-[var(--gold-soft)]">设置与隐私</Link></li>
            <li><Link href="/settings#about" className="hover:text-[var(--gold-soft)]">关于本项目</Link></li>
            <li><Link href="/settings#credits" className="hover:text-[var(--gold-soft)]">开源致谢</Link></li>
          </ul>
        </div>
      </div>

      <div className="shell border-t border-[rgba(194,161,92,0.1)] py-6">
        <p className="text-2xs leading-relaxed tracking-[0.08em] text-[var(--text-muted)]">
          本工具用于中国传统文化的学习与自我观察。命理属于传统文化范畴，
          不具备科学预测能力，不应作为医疗、投资、法律或重大人生决策的依据。
          所有出生信息默认仅保存在你的浏览器本地。
        </p>
      </div>
    </footer>
  );
}
