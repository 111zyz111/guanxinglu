/**
 * AI 解读服务端封装
 *
 * 设计要点：
 *  1. 密钥只存在于服务端环境变量，永不下发到客户端，也不写入日志
 *  2. Provider 可配置（OpenAI 兼容 / Anthropic），不绑定单一厂商
 *  3. 送入模型的命盘数据由服务端重新计算，不信任客户端传来的四柱，
 *     从机制上杜绝「模型凭空生成排盘」
 *  4. 未配置密钥时返回 configured: false，前端回退到规则解读，功能不中断
 */

import type { BaziChart } from "../bazi/types";

export type ProviderKind = "openai" | "anthropic";

export interface AiConfig {
  provider: ProviderKind;
  baseUrl: string;
  apiKey: string;
  model: string;
}

/** 读取服务端配置；未配置齐全时返回 null */
export function readAiConfig(): AiConfig | null {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  const providerRaw = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  const provider: ProviderKind = providerRaw === "anthropic" ? "anthropic" : "openai";

  const defaultBase =
    provider === "anthropic" ? "https://api.anthropic.com/v1" : "https://api.openai.com/v1";
  const defaultModel = provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o-mini";

  return {
    provider,
    baseUrl: (process.env.AI_BASE_URL ?? defaultBase).replace(/\/+$/, ""),
    apiKey,
    model: process.env.AI_MODEL?.trim() || defaultModel,
  };
}

export function isAiConfigured(): boolean {
  return readAiConfig() !== null;
}

/* ------------------------------------------------------------------
 * 提示词
 * ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `你是「观星录」的传统文化解读助手，服务对象是对中国传统命理文化感兴趣的现代读者。

你必须遵守以下规则：

1. 只能使用用户消息中提供的排盘数据。四柱、五行数量、十神、大运年份等，全部以提供的数据为准。
   如果数据中没有某项内容，就明确说"这项数据本次未提供"，绝对不要自行补充或推测。
2. 不要编造古籍原文、书名、页码或名人背书。引用术语时用"传统上认为""命理典籍中常见的一种说法"这类表述。
3. 不做绝对化预测。不使用"一定会""必然""注定"这类断言。用"倾向于""传统解读认为""可以留意"。
4. 不涉及医疗诊断、投资建议、法律意见。若用户问及，说明这不是本工具的适用范围。
5. 不制造恐惧。不使用灾祸、血光、克亲、破财等恐吓性表述来诱导行为。
6. 遇到流派分歧时，说明存在不同口径，并指出本工具采用哪一种。
7. 语言风格：克制、清晰、有质感。避免堆砌玄学术语；必须使用术语时，随即用一句白话解释。
8. 篇幅控制在 600–900 字。使用小标题分段，不要用表格。

你的定位是"提供一套传统视角的自我观察词汇"，而不是"给出人生答案"。`;

function buildChartPayload(chart: BaziChart): string {
  const lines: string[] = [];

  lines.push("【排盘数据（由确定性算法计算，不可更改）】");
  lines.push(`公历：${chart.solar.year}-${chart.solar.month}-${chart.solar.day} ${String(chart.solar.hour).padStart(2, "0")}:${String(chart.solar.minute).padStart(2, "0")}`);
  lines.push(`农历：${chart.lunarText}`);
  lines.push(`生肖：${chart.zodiac}`);
  lines.push(
    `四柱：${chart.pillars.map((p) => `${p.label}柱 ${p.ganZhi}`).join("　")}` +
      (chart.hourKnown ? "" : "（时辰未知，无时柱）"),
  );
  lines.push(
    `日主：${chart.dayMaster.gan}${chart.dayMaster.element}（${chart.dayMaster.yinYang}）`,
  );
  lines.push("");

  lines.push("【四柱明细】");
  for (const p of chart.pillars) {
    lines.push(
      `${p.label}柱 ${p.ganZhi}：天干${p.gan}（${p.ganElement}）十神=${p.tenGodGan}；` +
        `地支${p.zhi}（${p.zhiElement}）藏干=${p.hidden
          .map((h) => `${h.stem}(${h.tenGod})`)
          .join("/")}；纳音=${p.naYin}；地势=${p.diShi}`,
    );
  }
  lines.push("");

  lines.push("【五行计数（天干+地支本气，共8）】");
  lines.push(
    Object.entries(chart.elementCount)
      .map(([k, v]) => `${k}:${v}`)
      .join("　"),
  );
  lines.push("【五行加权（含藏干，总和8）】");
  lines.push(
    Object.entries(chart.elementScore)
      .map(([k, v]) => `${k}:${v.toFixed(2)}`)
      .join("　"),
  );
  lines.push(`缺失五行：${chart.missingElements.length ? chart.missingElements.join("、") : "无"}`);
  lines.push("");

  lines.push("【十神统计（含藏干）】");
  lines.push(
    Object.entries(chart.tenGodCount)
      .map(([k, v]) => `${k}:${v}`)
      .join("　") || "无",
  );
  lines.push("");

  lines.push("【旺衰评估（本工具简化模型，非定论）】");
  lines.push(`${chart.strength.label}，综合 ${chart.strength.score}/100`);
  lines.push(chart.strength.factors.map((f) => `${f.key}：${f.value}`).join("　"));
  lines.push("");

  const rel = chart.relations;
  const relParts = [
    rel.ganHe.length ? `天干五合：${rel.ganHe.join("；")}` : "",
    rel.zhiChong.length ? `地支六冲：${rel.zhiChong.join("；")}` : "",
    rel.zhiHe.length ? `地支六合：${rel.zhiHe.join("；")}` : "",
    rel.sanHe.length ? `地支三合：${rel.sanHe.join("；")}` : "",
  ].filter(Boolean);
  if (relParts.length) {
    lines.push("【刑冲合会】");
    lines.push(relParts.join("\n"));
    lines.push("");
  }

  if (chart.yun) {
    lines.push("【大运】");
    lines.push(
      `${chart.yun.forward ? "顺" : "逆"}排，${chart.yun.startYear}年${chart.yun.startMonth}个月起运（约 ${chart.yun.startSolar}）`,
    );
    lines.push(
      chart.yun.daYun
        .filter((d) => d.ganZhi)
        .map((d) => `${d.ganZhi}(${d.startYear}-${d.endYear}, ${d.startAge}-${d.endAge}岁)`)
        .join("　"),
    );
    lines.push("");
  } else {
    lines.push("【大运】未推算（未指定性别或推算失败）");
    lines.push("");
  }

  lines.push("【计算口径】");
  lines.push(`年柱：${chart.meta.yearRule}`);
  lines.push(`月柱：${chart.meta.monthRule}`);
  lines.push(`日柱：${chart.meta.dayRule}`);
  lines.push(`真太阳时：${chart.meta.solarTimeNote}`);
  lines.push(`实际用于计算的时间：${chart.meta.effectiveTime}`);

  return lines.join("\n");
}

const USER_TEMPLATE = (chart: BaziChart, question?: string) => {
  const base = `${buildChartPayload(chart)}

请基于以上数据，写一份结构化的传统文化解读，包含：
一、命盘的整体气象（日主与月令的关系）
二、五行分布的结构特点，以及传统上如何看待这种分布
三、性格与行为倾向的传统解读（注意用"传统上认为"，不要断言）
四、在学习、职业、人际三个方向上可以自我观察的提示
五、大运与流年在此框架下的含义

最后加一小段说明：本解读基于传统理论框架，不构成任何预测或决策依据。`;

  return question?.trim()
    ? `${base}\n\n【用户追问】\n${question.trim()}`
    : base;
};

/* ------------------------------------------------------------------
 * 调用
 * ------------------------------------------------------------------ */

export interface AiResult {
  ok: boolean;
  text?: string;
  error?: string;
  /** 是否已完成配置 */
  configured: boolean;
}

export async function interpretChart(
  chart: BaziChart,
  question?: string,
  signal?: AbortSignal,
): Promise<AiResult> {
  const config = readAiConfig();
  if (!config) {
    return { ok: false, configured: false, error: "AI 服务未配置" };
  }

  const userContent = USER_TEMPLATE(chart, question);

  try {
    const text =
      config.provider === "anthropic"
        ? await callAnthropic(config, userContent, signal)
        : await callOpenAiCompatible(config, userContent, signal);

    return { ok: true, configured: true, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    // 注意：这里只记录错误类型，不记录密钥
    return { ok: false, configured: true, error: message };
  }
}

async function callOpenAiCompatible(
  config: AiConfig,
  userContent: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`模型服务返回 ${res.status}${detail ? `：${truncate(detail, 160)}` : ""}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("模型返回内容为空");
  return text;
}

async function callAnthropic(
  config: AiConfig,
  userContent: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${config.baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`模型服务返回 ${res.status}${detail ? `：${truncate(detail, 160)}` : ""}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content
    ?.filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("模型返回内容为空");
  return text;
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/* ------------------------------------------------------------------
 * 极简内存限流（单实例部署够用；多实例请换成 Redis 等共享存储）
 * ------------------------------------------------------------------ */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);

  if (list.length >= RATE_MAX) {
    const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - list[0])) / 1000);
    hits.set(key, list);
    return { allowed: false, retryAfter };
  }

  list.push(now);
  hits.set(key, list);

  // 防止 Map 无限增长
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > RATE_WINDOW_MS)) hits.delete(k);
    }
  }

  return { allowed: true, retryAfter: 0 };
}
