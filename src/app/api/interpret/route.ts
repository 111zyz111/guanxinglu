import { NextResponse } from "next/server";
import { z } from "zod";
import { buildChart } from "@/lib/bazi/engine";
import { interpretChart, isAiConfigured, checkRateLimit } from "@/lib/ai/provider";
import type { BirthInput } from "@/lib/bazi/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BirthInputSchema = z.object({
  calendar: z.enum(["solar", "lunar"]),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23).nullable(),
  minute: z.number().int().min(0).max(59).nullable(),
  isLeapMonth: z.boolean(),
  gender: z.enum(["male", "female", "unspecified"]),
  longitude: z.number().min(-180).max(180).nullable(),
  locationName: z.string().max(64).nullable(),
  timezoneOffset: z.number().min(-12).max(14),
  useTrueSolarTime: z.boolean(),
  sect: z.union([z.literal(1), z.literal(2)]),
});

const RequestSchema = z.object({
  input: BirthInputSchema,
  question: z.string().max(500).optional(),
});

export async function GET() {
  return NextResponse.json({
    configured: isAiConfigured(),
    note: "POST 此接口，body 为 { input, question? }。排盘由服务端重新计算，不接受客户端传入的四柱。",
  });
}

export async function POST(req: Request) {
  // 限流：以转发头或连接地址作为键
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, configured: isAiConfigured(), error: "请求过于频繁，请稍后再试" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error:
          "尚未配置 AI 服务。请在服务端设置 AI_API_KEY（可选 AI_PROVIDER / AI_BASE_URL / AI_MODEL），" +
          "未配置时页面会使用内置的规则解读。",
      },
      { status: 200 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, configured: true, error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: "参数校验失败",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }

  // 关键：服务端重新排盘，杜绝客户端伪造四柱
  let chart;
  try {
    chart = buildChart(parsed.data.input as BirthInput);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: `排盘失败：${err instanceof Error ? err.message : "未知错误"}`,
      },
      { status: 422 },
    );
  }

  const result = await interpretChart(chart, parsed.data.question);

  return NextResponse.json({
    ok: result.ok,
    configured: result.configured,
    text: result.text,
    error: result.error,
  });
}
