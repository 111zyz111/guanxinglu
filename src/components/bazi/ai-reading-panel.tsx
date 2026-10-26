"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { BirthInput } from "@/lib/bazi/types";

type Status = "idle" | "loading" | "done" | "error";

interface Props {
  input: BirthInput;
  /** 命盘摘要，用于未生成时的提示 */
  summary: string;
}

export function AiReadingPanel({ input, summary }: Props) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/interpret")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) => {
        if (alive) setConfigured(!!d.configured);
      })
      .catch(() => {
        if (alive) setConfigured(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function run(q?: string) {
    setStatus("loading");
    setError("");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, question: q }),
        signal: controller.signal,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        configured?: boolean;
        text?: string;
        error?: string;
      };

      if (!data.ok || !data.text) {
        setConfigured(!!data.configured);
        setError(data.error ?? "模型未返回内容");
        setStatus("error");
        return;
      }
      setText(data.text);
      setAsked(q ?? null);
      setStatus("done");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError("网络请求失败，请检查连接后重试");
      setStatus("error");
    }
  }

  function onSubmitQuestion(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 2) {
      setError("问题太短了，写清楚一点会更有帮助");
      return;
    }
    setQuestion("");
    run(q);
  }

  return (
    <section id="ai" className="scroll-mt-24">
      <div className="panel p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-serif text-[1.15rem] tracking-[0.08em] text-[var(--text-primary)]">
              AI 语言转译
            </h2>
            <p className="mt-1 text-[0.75rem] leading-[1.8] text-[var(--text-muted)]">
              排盘由服务端重新计算，模型只负责把结构讲成人话。它拿不到也不允许编造四柱。
            </p>
          </div>
          <span
            className={`text-2xs tracking-[0.12em] ${
              configured === null
                ? "text-[var(--text-muted)]"
                : configured
                  ? "text-[#7fb59c]"
                  : "text-[var(--cinnabar)]"
            }`}
          >
            {configured === null ? "检测中…" : configured ? "模型已配置" : "模型未配置"}
          </span>
        </div>

        {/* 未配置 */}
        {configured === false ? (
          <div className="mt-5 border border-[rgba(194,161,92,0.18)] bg-[rgba(194,161,92,0.04)] px-4 py-4">
            <p className="text-[0.8125rem] leading-[1.9] text-[var(--text-secondary)]">
              当前部署没有配置模型密钥，因此这一块暂时不生成文字。
              上方基于规则的解读不依赖 AI，功能完整；配置密钥后会多出语言层面的转译与追问能力。
            </p>
            <pre className="mt-3 overflow-x-auto rounded-sm border border-[rgba(194,161,92,0.16)] bg-[rgba(8,11,15,0.7)] px-3.5 py-3 text-[0.6875rem] leading-[1.9] text-[var(--text-secondary)]">
{`AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini`}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/settings" className="btn btn-ghost !py-2 !text-[0.75rem]">
                查看配置说明
              </Link>
            </div>
          </div>
        ) : null}

        {/* 生成按钮 */}
        {configured !== false ? (
          <div className="mt-5">
            {status === "idle" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.8125rem] leading-[1.85] text-[var(--text-secondary)]">
                  {summary}。发送给模型的内容只有排盘结构，不含姓名等身份信息。
                </p>
                <button
                  type="button"
                  onClick={() => run()}
                  className="btn btn-primary shrink-0"
                  disabled={configured === null}
                >
                  生成解读
                </button>
              </div>
            ) : null}

            {status === "loading" ? (
              <div>
                <div className="flex items-center gap-2 text-[0.75rem] tracking-[0.1em] text-[var(--gold)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--gold)]" />
                  正在生成…
                </div>
                <div className="mt-3 space-y-2" aria-hidden="true">
                  {[100, 96, 88, 94, 70].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 animate-pulse rounded bg-[rgba(236,230,216,0.07)]"
                      style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {status === "error" ? (
              <div className="rounded-sm border border-[rgba(168,65,47,0.34)] bg-[rgba(168,65,47,0.06)] px-4 py-3">
                <p className="text-[0.8125rem] leading-[1.8] text-[var(--cinnabar)]">{error}</p>
                <button
                  type="button"
                  onClick={() => run(asked ?? undefined)}
                  className="btn btn-quiet mt-2 !px-0 !py-1 !text-[0.75rem]"
                >
                  重试
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* 结果 */}
        {status === "done" && text ? (
          <div className="mt-5">
            <article className="border-t border-[rgba(194,161,92,0.14)] pt-5">
              <div className="space-y-3.5">
                {text.split(/\n+/).map((line, i) => {
                  const t = line.trim();
                  if (!t) return null;
                  const isHeading = /^[一二三四五六七八九十]+[、.]/.test(t) || /^#{1,3}\s/.test(t);
                  if (isHeading) {
                    return (
                      <h3
                        key={i}
                        className="pt-2 font-serif text-[1rem] tracking-[0.06em] text-[var(--gold-soft)]"
                      >
                        {t.replace(/^#{1,3}\s/, "")}
                      </h3>
                    );
                  }
                  return (
                    <p
                      key={i}
                      className="text-[0.875rem] leading-[2] text-[var(--text-secondary)]"
                    >
                      {t.replace(/^\*\*(.+?)\*\*/, "$1")}
                    </p>
                  );
                })}
              </div>

              <p className="mt-5 border-t border-[rgba(194,161,92,0.12)] pt-3 text-2xs leading-[1.8] text-[var(--text-muted)]">
                以上文字由语言模型基于上方排盘数据生成，属传统理论框架下的转译，
                不构成预测或决策依据。若与你的师承说法不同，以你的师承为准。
              </p>

              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setText("");
                  setAsked(null);
                }}
                className="btn btn-quiet mt-2 !px-0 !text-[0.75rem]"
              >
                重新生成
              </button>
            </article>
          </div>
        ) : null}

        {/* 追问 */}
        {configured ? (
          <form onSubmit={onSubmitQuestion} className="mt-5 border-t border-[rgba(194,161,92,0.12)] pt-5">
            <label htmlFor="follow-up" className="field-label">
              继续追问
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="follow-up"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setError("");
                }}
                placeholder="例如：这个盘在职业方向上，传统上会关注哪些线索？"
                className="input flex-1"
                maxLength={500}
                disabled={status === "loading"}
              />
              <button
                type="submit"
                className="btn btn-ghost shrink-0"
                disabled={status === "loading" || question.trim().length < 2}
              >
                追问
              </button>
            </div>
            <p className="mt-2 text-2xs text-[var(--text-muted)]">
              追问同样只发送排盘结构与你的问题。涉及医疗、投资、法律的问题，模型会被要求说明不在适用范围。
            </p>
          </form>
        ) : null}
      </div>
    </section>
  );
}
