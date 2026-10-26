/**
 * 易经起卦
 *
 * 三种起卦法，全部为确定性算法（除铜钱摇卦本身依赖随机，但随机只用于
 * 产生「背/字」，不用于编造卦辞）：
 *   1. 梅花易数时间起卦 —— 以农历年月日时取数
 *   2. 数字起卦         —— 以两个任意正整数取数
 *   3. 铜钱摇卦         —— 三枚铜钱掷六次，逐爻生成
 *
 * 卦辞、爻辞全部来自公有领域的《周易》原文（维基文库整理本），
 * 本项目不做任何改写或杜撰。
 */

import { Solar } from "lunar-typescript";
import { HEXAGRAMS, type Hexagram } from "./hexagrams";

/** 八卦：先天数、二进制（自下而上，1 为阳） */
export const TRIGRAMS: {
  name: string;
  alias: string;
  number: number;
  bits: [number, number, number];
  image: string;
}[] = [
  { name: "乾", alias: "天", number: 1, bits: [1, 1, 1], image: "☰" },
  { name: "兑", alias: "泽", number: 2, bits: [1, 1, 0], image: "☱" },
  { name: "离", alias: "火", number: 3, bits: [1, 0, 1], image: "☲" },
  { name: "震", alias: "雷", number: 4, bits: [1, 0, 0], image: "☳" },
  { name: "巽", alias: "风", number: 5, bits: [0, 1, 1], image: "☴" },
  { name: "坎", alias: "水", number: 6, bits: [0, 1, 0], image: "☵" },
  { name: "艮", alias: "山", number: 7, bits: [0, 0, 1], image: "☶" },
  { name: "坤", alias: "地", number: 8, bits: [0, 0, 0], image: "☷" },
];

/** 传统名与简化名统一 */
const TRIGRAM_ALIAS: Record<string, string> = {
  乾: "乾",
  兌: "兑",
  兑: "兑",
  離: "离",
  离: "离",
  震: "震",
  巽: "巽",
  坎: "坎",
  艮: "艮",
  坤: "坤",
};

export function normalizeTrigram(name: string): string {
  return TRIGRAM_ALIAS[name] ?? name;
}

export function trigramByNumber(n: number): (typeof TRIGRAMS)[number] {
  const idx = ((n - 1) % 8 + 8) % 8;
  return TRIGRAMS[idx];
}

export function trigramByName(name: string): (typeof TRIGRAMS)[number] {
  const n = normalizeTrigram(name);
  return TRIGRAMS.find((t) => t.name === n) ?? TRIGRAMS[0];
}

/** 由六爻（自下而上）找卦 */
export function hexagramByLines(lines: number[]): Hexagram | undefined {
  const key = lines.join("");
  return HEXAGRAMS.find((h) => h.lines.join("") === key);
}

/** 由上下卦找卦 */
export function hexagramByTrigrams(lower: string, upper: string): Hexagram | undefined {
  const l = trigramByName(lower).name;
  const u = trigramByName(upper).name;
  return HEXAGRAMS.find((h) => h.lower === l && h.upper === u);
}

/* ------------------------------------------------------------------
 * 起卦方式
 * ------------------------------------------------------------------ */

export type CastMethod = "time" | "number" | "coin";

export interface CastResult {
  method: CastMethod;
  /** 本卦六爻，自下而上，1 = 阳，0 = 阴 */
  originalLines: number[];
  /** 动爻位置（1–6，自下而上），无动爻则为空 */
  movingLines: number[];
  /** 变卦六爻；无动爻时为 null */
  changedLines: number[] | null;
  original: Hexagram;
  changed: Hexagram | null;
  /** 起卦过程的可核对记录 */
  trace: CastTrace;
}

export interface CastTrace {
  method: CastMethod;
  /** 供人核对的计算步骤 */
  steps: { label: string; value: string }[];
  /** 铜钱摇卦的逐爻记录 */
  throws?: { coins: ("背" | "字")[]; value: number; yinYang: "阳" | "阴"; moving: boolean }[];
}

/** 农历月日与年支、时支的序数，供时间起卦使用 */
export interface LunarCastInput {
  /** 农历年支序数：子 1 … 亥 12 */
  yearBranchNumber: number;
  /** 农历月（闰月按本月计） */
  month: number;
  /** 农历日 */
  day: number;
  /** 时辰序数：子 1 … 亥 12 */
  hourBranchNumber: number;
}

function mod(n: number, m: number): number {
  const r = n % m;
  return r === 0 ? m : r;
}

/**
 * 梅花易数 · 时间起卦
 * 上卦 =（年支数 + 月 + 日）÷ 8 取余
 * 下卦 =（年支数 + 月 + 日 + 时支数）÷ 8 取余
 * 动爻 =（年支数 + 月 + 日 + 时支数）÷ 6 取余
 */
export function castByTime(input: LunarCastInput): CastResult {
  const { yearBranchNumber, month, day, hourBranchNumber } = input;
  const upperSum = yearBranchNumber + month + day;
  const lowerSum = upperSum + hourBranchNumber;

  const upperNum = mod(upperSum, 8);
  const lowerNum = mod(lowerSum, 8);
  const moving = mod(lowerSum, 6);

  const upper = trigramByNumber(upperNum);
  const lower = trigramByNumber(lowerNum);

  return assemble({
    method: "time",
    lowerBits: lower.bits,
    upperBits: upper.bits,
    moving: [moving],
    trace: {
      method: "time",
      steps: [
        { label: "年支数 + 月 + 日", value: `${yearBranchNumber} + ${month} + ${day} = ${upperSum}` },
        { label: "上卦（÷8 取余）", value: `${upperSum} ÷ 8 余 ${upperNum} → ${upper.name}${upper.image}` },
        {
          label: "上数 + 时支数",
          value: `${upperSum} + ${hourBranchNumber} = ${lowerSum}`,
        },
        { label: "下卦（÷8 取余）", value: `${lowerSum} ÷ 8 余 ${lowerNum} → ${lower.name}${lower.image}` },
        { label: "动爻（÷6 取余）", value: `${lowerSum} ÷ 6 余 ${moving} → 第 ${moving} 爻` },
      ],
    },
  });
}

/** 数字起卦：上卦 = a÷8 余，下卦 = b÷8 余，动爻 =（a+b）÷6 余 */
export function castByNumbers(a: number, b: number): CastResult {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0) {
    throw new Error("起卦数字需为正整数");
  }
  const upperNum = mod(a, 8);
  const lowerNum = mod(b, 8);
  const moving = mod(a + b, 6);

  const upper = trigramByNumber(upperNum);
  const lower = trigramByNumber(lowerNum);

  return assemble({
    method: "number",
    lowerBits: lower.bits,
    upperBits: upper.bits,
    moving: [moving],
    trace: {
      method: "number",
      steps: [
        { label: "第一数 ÷8 取余", value: `${a} ÷ 8 余 ${upperNum} → 上卦 ${upper.name}${upper.image}` },
        { label: "第二数 ÷8 取余", value: `${b} ÷ 8 余 ${lowerNum} → 下卦 ${lower.name}${lower.image}` },
        { label: "两数之和 ÷6 取余", value: `${a} + ${b} = ${a + b}，÷ 6 余 ${moving} → 第 ${moving} 爻` },
      ],
    },
  });
}

/** 铜钱摇卦：三枚铜钱掷六次，背=3、字=2，合计 6/7/8/9 */
export function castByCoins(throws: number[][]): CastResult {
  if (throws.length !== 6) throw new Error("摇卦需要六次结果");
  const lines: number[] = [];
  const moving: number[] = [];
  const records: NonNullable<CastTrace["throws"]> = [];

  throws.forEach((coins, i) => {
    if (coins.length !== 3) throw new Error("每次需三枚铜钱");
    const sum = coins.reduce((acc, c) => acc + (c === 1 ? 3 : 2), 0);
    const isYang = sum === 7 || sum === 9;
    const isMoving = sum === 6 || sum === 9;
    lines.push(isYang ? 1 : 0);
    if (isMoving) moving.push(i + 1);
    records.push({
      coins: coins.map((c) => (c === 1 ? "背" : "字")),
      value: sum,
      yinYang: isYang ? "阳" : "阴",
      moving: isMoving,
    });
  });

  return assemble({
    method: "coin",
    lowerBits: [lines[0], lines[1], lines[2]],
    upperBits: [lines[3], lines[4], lines[5]],
    moving,
    trace: {
      method: "coin",
      steps: [
        { label: "取象规则", value: "背记 3、字记 2；合计 6 老阴、7 少阳、8 少阴、9 老阳" },
        {
          label: "逐爻",
          value: records
            .map((r, i) => `${i + 1}爻 ${r.value}（${r.yinYang}${r.moving ? "·动" : ""}）`)
            .join("　"),
        },
      ],
      throws: records,
    },
  });
}

/** 由本卦六爻与动爻组装结果 */
function assemble(args: {
  method: CastMethod;
  lowerBits: number[];
  upperBits: number[];
  moving: number[];
  trace: CastTrace;
}): CastResult {
  const lines = [...args.lowerBits, ...args.upperBits];
  const original = hexagramByLines(lines);
  if (!original) throw new Error("未能匹配卦象，请检查输入");

  let changedLines: number[] | null = null;
  let changed: Hexagram | null = null;
  if (args.moving.length > 0) {
    changedLines = lines.map((v, i) => (args.moving.includes(i + 1) ? (v === 1 ? 0 : 1) : v));
    changed = hexagramByLines(changedLines) ?? null;
  }

  return {
    method: args.method,
    originalLines: lines,
    movingLines: [...args.moving].sort((a, b) => a - b),
    changedLines,
    original,
    changed,
    trace: args.trace,
  };
}

/**
 * 卦象的 Unicode 符号
 * Unicode 的 U+4DC0–U+4DFF 区段按《周易》通行本卦序排列，
 * 即 U+4DC0 = 乾（第一卦），U+4DFF = 未济（第六十四卦）。
 */
export function hexagramSymbol(kingWenNumber: number): string {
  return String.fromCodePoint(0x4dc0 + kingWenNumber - 1);
}

/* ------------------------------------------------------------------
 * 时间起卦的取数
 * ------------------------------------------------------------------ */

const ZHI_ORDER = "子丑寅卯辰巳午未申酉戌亥";

/** 小时（0–23）→ 时辰序数（子 1 … 亥 12） */
export function hourBranchNumber(hour: number): number {
  return Math.floor((((hour % 24) + 24) % 24 + 1) / 2) % 12 + 1;
}

/** 地支 → 序数（子 1 … 亥 12） */
export function branchNumber(zhi: string): number {
  const i = ZHI_ORDER.indexOf(zhi);
  return i >= 0 ? i + 1 : 1;
}

/**
 * 以公历时刻取农历年月日时，供梅花易数时间起卦使用。
 * 农历闰月按本月计（传统时间起卦不区分闰月）。
 */
export function lunarCastInputFromDate(date: Date): LunarCastInput & { lunarText: string } {
  const lunar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    0,
  ).getLunar();

  return {
    yearBranchNumber: branchNumber(lunar.getYearZhi()),
    month: Math.abs(lunar.getMonth()),
    day: lunar.getDay(),
    hourBranchNumber: hourBranchNumber(date.getHours()),
    lunarText: lunar.toString(),
  };
}

/** 「本卦之变卦」的题名；无动爻时为「某卦（静卦）」 */
export function formatCastTitle(result: CastResult): string {
  if (result.changed) return `${result.original.name}之${result.changed.name}`;
  return `${result.original.name}（静卦）`;
}

/** 起卦方法的中文名 */
export const CAST_METHOD_LABEL: Record<CastMethod, string> = {
  time: "时间起卦",
  number: "数字起卦",
  coin: "铜钱摇卦",
};
