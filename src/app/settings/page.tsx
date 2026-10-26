"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadSettings,
  saveSettings,
  isStorageAvailable,
  estimateStorageSize,
  clearHistory,
  loadHistory,
  type AppSettings,
} from "@/lib/storage";
import { Callout } from "@/components/ui/empty-state";

interface AiStatus {
  state: "loading" | "configured" | "unconfigured" | "error";
  message?: string;
}

const CREDITS = [
  {
    name: "lunar-typescript",
    version: "1.8.6",
    license: "MIT",
    url: "https://github.com/6tail/lunar-typescript",
    note: "公农历互转、二十四节气、四柱、十神、藏干、纳音、大运、黄历。本项目全部历法与排盘计算来自此库，未自行实现历法算法。",
  },
  {
    name: "true-solar-time",
    version: "1.2.1",
    license: "MIT",
    url: "https://www.npmjs.com/package/true-solar-time",
    note: "真太阳时校正（均时差 + 经度时差），基于 Jean Meeus 天文算法。",
  },
  {
    name: "Zijian-Ni/tianji",
    version: "—",
    license: "MIT",
    url: "https://github.com/Zijian-Ni/tianji",
    note: "仅作为测试基准使用：其公开的已知日期断言用于交叉校验本项目的四柱结果，未引入任何代码。",
  },
  {
    name: "Next.js / React",
    version: "15 / 19",
    license: "MIT",
    url: "https://nextjs.org",
    note: "应用框架与 UI 运行时。",
  },
  {
    name: "Tailwind CSS",
    version: "3.4",
    license: "MIT",
    url: "https://tailwindcss.com",
    note: "样式工具链。设计变量全部以 CSS 自定义属性定义。",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [storageOk, setStorageOk] = useState(true);
  const [recordCount, setRecordCount] = useState(0);
  const [size, setSize] = useState(0);
  const [toast, setToast] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [ai, setAi] = useState<AiStatus>({ state: "loading" });

  useEffect(() => {
    setSettings(loadSettings());
    setStorageOk(isStorageAvailable());
    setRecordCount(loadHistory().length);
    setSize(estimateStorageSize());

    fetch("/api/interpret")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) =>
        setAi({ state: d.configured ? "configured" : "unconfigured" }),
      )
      .catch(() => setAi({ state: "error" }));
  }, []);

  function update(patch: Partial<AppSettings>) {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    setToast("已保存");
    setTimeout(() => setToast(""), 1600);
  }

  function handleClear() {
    clearHistory();
    setRecordCount(0);
    setSize(0);
    setConfirmClear(false);
    setToast("本地记录已清空");
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <div className="shell-narrow pb-24 pt-12">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[var(--gold-dim)]" aria-hidden="true" />
          <span className="eyebrow">设置 · 说明</span>
        </div>
        <h1 className="font-serif text-[1.9rem] leading-tight tracking-[0.04em] text-[var(--text-primary)]">
          设置与关于
        </h1>
        <p className="mt-3 text-pretty text-[0.875rem] leading-[1.9] text-[var(--text-secondary)]">
          本工具没有账号系统，没有服务端数据库。这里能调的都是排盘口径与本地存储行为。
        </p>
      </header>

      {toast ? (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-sm border border-[rgba(194,161,92,0.4)] bg-[rgba(12,16,22,0.95)] px-4 py-2 text-[0.75rem] tracking-[0.1em] text-[var(--gold-soft)] shadow-lg"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {settings === null ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="panel h-28 animate-pulse opacity-40" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 排盘口径 */}
          <section className="panel p-5 sm:p-7">
            <h2 className="font-serif text-base tracking-[0.08em]">排盘默认口径</h2>
            <p className="mt-1.5 text-[0.75rem] leading-[1.8] text-[var(--text-muted)]">
              只影响新建表单的默认值，已保存的记录不受影响。
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-[0.8125rem] text-[var(--text-primary)]">晚子时（23:00–24:00）日柱</p>
                <div className="seg" role="group" aria-label="子时换日规则">
                  <button
                    type="button"
                    className="seg-item"
                    data-active={settings.defaultSect === 1}
                    aria-pressed={settings.defaultSect === 1}
                    onClick={() => update({ defaultSect: 1 })}
                  >
                    归次日（流派一）
                  </button>
                  <button
                    type="button"
                    className="seg-item"
                    data-active={settings.defaultSect === 2}
                    aria-pressed={settings.defaultSect === 2}
                    onClick={() => update({ defaultSect: 2 })}
                  >
                    归当日（流派二）
                  </button>
                </div>
              </div>

              <ToggleRow
                title="默认启用真太阳时校正"
                desc="按出生地经度与均时差修正。需要填写出生地才会生效。"
                checked={settings.defaultTrueSolarTime}
                onChange={(v) => update({ defaultTrueSolarTime: v })}
              />

              <ToggleRow
                title="保存测算历史"
                desc="关闭后，排盘与起卦结果不会写入本地记录。"
                checked={settings.persistHistory}
                onChange={(v) => update({ persistHistory: v })}
              />

              <ToggleRow
                title="结果页默认展开「计算依据」"
                desc="开启后，命盘页的计算口径面板直接展开。"
                checked={settings.showMetaByDefault}
                onChange={(v) => update({ showMetaByDefault: v })}
              />
            </div>
          </section>

          {/* 本地数据 */}
          <section className="panel p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-base tracking-[0.08em]">本地数据</h2>
                <p className="mt-1.5 text-[0.75rem] leading-[1.8] text-[var(--text-muted)]">
                  浏览器 localStorage，{storageOk ? "当前可用" : "当前不可用"}。
                  共 {recordCount} 条记录，约 {(size / 1024).toFixed(1)} KB。
                </p>
              </div>
              {recordCount > 0 ? (
                confirmClear ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="btn btn-ghost !py-2 !text-[0.75rem] !border-[rgba(168,65,47,0.5)] !text-[var(--cinnabar)]"
                    >
                      确认删除
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="btn btn-quiet !py-2 !text-[0.75rem]"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="btn btn-quiet shrink-0 !py-2 !text-[0.75rem]"
                  >
                    清空记录
                  </button>
                )
              ) : (
                <Link href="/bazi" className="btn btn-quiet shrink-0 !py-2 !text-[0.75rem]">
                  去排盘
                </Link>
              )}
            </div>

            {!storageOk ? (
              <div className="mt-4">
                <Callout tone="warn">
                  浏览器禁用了本地存储（可能处于隐私模式）。排盘与起卦仍可用，但关闭页面后结果不会保留。
                </Callout>
              </div>
            ) : null}
          </section>

          {/* AI 状态 */}
          <section className="panel p-5 sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-base tracking-[0.08em]">AI 解读服务</h2>
              <span
                className={`text-2xs tracking-[0.12em] ${
                  ai.state === "configured"
                    ? "text-[#7fb59c]"
                    : ai.state === "loading"
                      ? "text-[var(--text-muted)]"
                      : "text-[var(--cinnabar)]"
                }`}
              >
                {ai.state === "loading"
                  ? "检测中…"
                  : ai.state === "configured"
                    ? "已配置"
                    : ai.state === "unconfigured"
                      ? "未配置"
                      : "检测失败"}
              </span>
            </div>

            <p className="mt-2 text-[0.8125rem] leading-[1.9] text-[var(--text-secondary)]">
              {ai.state === "configured"
                ? "服务端已配置模型密钥。在命盘页点击「AI 解读」时，服务端会重新计算命盘，再把结构化的排盘数据交给模型。浏览器不会接触密钥。"
                : "未配置模型密钥时，命盘页仍会给出基于规则的确定性解读——排盘、五行统计、十神结构与取用思路都不依赖 AI。配置后可额外获得语言层面的转译与追问。"}
            </p>

            <details className="mt-4 border-t border-[rgba(194,161,92,0.12)] pt-4">
              <summary className="cursor-pointer text-[0.75rem] tracking-[0.08em] text-[var(--gold)] hover:text-[var(--gold-soft)]">
                如何配置（服务端环境变量）
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-sm border border-[rgba(194,161,92,0.16)] bg-[rgba(8,11,15,0.7)] px-4 py-3 text-[0.6875rem] leading-[1.9] text-[var(--text-secondary)]">
{`# .env.local（不要提交到 Git）
AI_PROVIDER=openai          # 或 anthropic
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini`}
              </pre>
              <p className="mt-2 text-2xs leading-[1.8] text-[var(--text-muted)]">
                兼容任何 OpenAI Chat Completions 协议的网关（国内模型服务多可直连）。
                密钥只读自服务端环境变量，不写入日志、不下发前端。
              </p>
            </details>
          </section>

          {/* 隐私 */}
          <section className="panel p-5 sm:p-7">
            <h2 className="font-serif text-base tracking-[0.08em]">隐私</h2>
            <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-[1.9] text-[var(--text-secondary)]">
              <li>· 出生日期、时间、出生地只在浏览器内参与计算，默认不上传。</li>
              <li>· 没有账号、没有埋点、没有第三方分析脚本、没有广告 SDK。</li>
              <li>
                · 只有你主动点击「AI 解读」时，服务端才会收到排盘所需的出生信息（不含姓名，
                因为本工具根本不收集姓名）。
              </li>
              <li>· 历史记录可逐条删除或一键清空，删除即从本地抹去。</li>
              <li>· 分享链接会把排盘参数编码进 URL，发送前请确认对方可以知道这些信息。</li>
            </ul>
          </section>

          {/* 关于 */}
          <section id="about" className="panel scroll-mt-24 p-5 sm:p-7">
            <h2 className="font-serif text-base tracking-[0.08em]">关于观星录</h2>
            <div className="mt-3 space-y-3 text-[0.8125rem] leading-[1.95] text-[var(--text-secondary)]">
              <p>
                这个工具想做的是把两件事分开摆放：一件是可计算的，一件是可解释的。
                节气时刻、干支循环、五行计数属于前者，可以拿任何一本万年历逐项核对；
                「这个盘意味着什么」属于后者，是传统理论的解释，不同流派会有不同说法。
              </p>
              <p>
                所以我们不在页面上写「你一定会怎样」。命理不具备科学预测能力，
                也不该成为医疗、投资、法律或重大人生决策的依据。
                它能提供的，是一套关于性格与节律的传统观察词汇——用不用、怎么用，由你决定。
              </p>
              <p className="text-[var(--text-muted)]">
                产品方向是「东方命理 + 个人成长」：观星（八字）、问卦（易）、择时（黄历）、
                藏经（术语）、知己（把术语翻译成自我反思的问题）。
                首期完成前四项，知己以解读页的形式部分实现。
              </p>
            </div>
          </section>

          {/* 开源致谢 */}
          <section id="credits" className="panel scroll-mt-24 p-5 sm:p-7">
            <h2 className="font-serif text-base tracking-[0.08em]">开源致谢</h2>
            <p className="mt-1.5 text-[0.75rem] leading-[1.8] text-[var(--text-muted)]">
              排盘算法不是本项目发明的。以下依赖均为 MIT / Apache-2.0 许可，允许商用；
              完整清单与许可证原文见仓库 <code className="text-[var(--text-secondary)]">THIRD_PARTY_LICENSES.md</code>。
            </p>

            <ul className="mt-4 divide-y divide-[rgba(194,161,92,0.12)] border-y border-[rgba(194,161,92,0.12)]">
              {CREDITS.map((c) => (
                <li key={c.name} className="py-3.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-serif text-[0.9375rem] text-[var(--gold-soft)] hover:underline"
                    >
                      {c.name}
                    </a>
                    <span className="text-[0.625rem] tnum text-[var(--text-muted)]">{c.version}</span>
                    <span className="border border-[rgba(194,161,92,0.24)] px-1.5 py-0.5 text-[0.5rem] tracking-[0.1em] text-[var(--gold)]">
                      {c.license}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.75rem] leading-[1.8] text-[var(--text-secondary)]">{c.note}</p>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-2xs leading-[1.8] text-[var(--text-muted)]">
              字体使用系统自带中文衬线字体栈，不打包任何字体文件；星图、山水、印章、
              图标全部为本项目手写 SVG 与 CSS 生成；《周易》卦爻辞取自公有领域原文。
            </p>
          </section>

          <p className="pt-2 text-center text-2xs tracking-[0.1em] text-[var(--text-muted)]">
            观星录 · 观天时，察己心
          </p>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-t border-[rgba(194,161,92,0.1)] pt-4">
      <span>
        <span className="block text-[0.8125rem] text-[var(--text-primary)]">{title}</span>
        <span className="mt-1 block text-2xs leading-[1.7] text-[var(--text-muted)]">{desc}</span>
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`flex h-5 w-9 items-center rounded-full border px-0.5 transition-colors duration-300 ${
            checked
              ? "border-[rgba(194,161,92,0.6)] bg-[rgba(194,161,92,0.3)]"
              : "border-[rgba(236,230,216,0.2)] bg-[rgba(236,230,216,0.06)]"
          }`}
          aria-hidden="true"
        >
          <span
            className={`h-3.5 w-3.5 rounded-full transition-transform duration-300 ${
              checked ? "translate-x-4 bg-[var(--gold-soft)]" : "translate-x-0 bg-[rgba(236,230,216,0.5)]"
            }`}
          />
        </span>
      </span>
    </label>
  );
}
