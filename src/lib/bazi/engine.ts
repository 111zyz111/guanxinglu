import { Solar, Lunar, LunarYear } from "lunar-typescript";
import { getTrueSolarTimeDetail } from "true-solar-time";
import {
  GAN_ELEMENT,
  GAN_YINYANG,
  ZHI_ELEMENT,
  ZHI_YINYANG,
  ZHI_HIDDEN_STEMS,
  ZHI_LIU_HE,
  ZHI_CHONG,
  ZHI_SAN_HE,
  GAN_HE,
  GENERATES,
  OVERCOMES,
  GENERATED_BY,
  OVERCOME_BY,
  WU_XING,
  ZODIAC,
  type WuXing,
  type TenGod,
} from "./constants";
import type {
  BirthInput,
  BaziChart,
  Pillar,
  HiddenStem,
  YunInfo,
  DaYunEntry,
  StrengthAssessment,
} from "./types";

const ENGINE_LABEL = "lunar-typescript 1.8.6（MIT）";
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/* ------------------------------------------------------------------
 * 十神推算（纯函数，独立于库，便于测试）
 * ------------------------------------------------------------------ */

export function getTenGod(dayGan: string, targetGan: string): TenGod {
  const de = GAN_ELEMENT[dayGan];
  const te = GAN_ELEMENT[targetGan];
  const samePolarity = GAN_YINYANG[dayGan] === GAN_YINYANG[targetGan];

  if (de === te) return samePolarity ? "比肩" : "劫财";
  if (GENERATES[de] === te) return samePolarity ? "食神" : "伤官";
  if (OVERCOMES[de] === te) return samePolarity ? "偏财" : "正财";
  if (OVERCOMES[te] === de) return samePolarity ? "七杀" : "正官";
  return samePolarity ? "偏印" : "正印";
}

/* ------------------------------------------------------------------
 * 中国夏令时（1986–1991）
 * 该期间每年 4 月中旬至 9 月中旬实行 UTC+9。
 * 若出生时间记录的是「当时挂钟时间」，需减 1 小时还原为标准时间。
 * 数据来源：国务院 1986 年《关于在全国范围内实行夏时制的通知》及历年公告。
 * ------------------------------------------------------------------ */

const CHINA_DST_WINDOWS: [string, string][] = [
  ["1986-05-04", "1986-09-14"],
  ["1987-04-12", "1987-09-13"],
  ["1988-04-17", "1988-09-11"],
  ["1989-04-16", "1989-09-17"],
  ["1990-04-15", "1990-09-16"],
  ["1991-04-14", "1991-09-15"],
];

export function isChinaDstDate(year: number, month: number, day: number): boolean {
  const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return CHINA_DST_WINDOWS.some(([start, end]) => key >= start && key <= end);
}

/* ------------------------------------------------------------------
 * 时间位移工具
 * 用 UTC 作为「无时区的载体」，避免本地时区与夏令时干扰。
 * ------------------------------------------------------------------ */

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function shiftMinutes(t: WallClock, deltaMinutes: number): WallClock {
  const base = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute, 0);
  const d = new Date(base + Math.round(deltaMinutes) * 60_000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

function formatWallClock(t: WallClock): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.year}-${p(t.month)}-${p(t.day)} ${p(t.hour)}:${p(t.minute)}`;
}

/* ------------------------------------------------------------------
 * 输入校验
 * ------------------------------------------------------------------ */

export interface ValidationResult {
  ok: boolean;
  issues: { field: string; message: string }[];
}

export function validateBirthInput(input: Partial<BirthInput>): ValidationResult {
  const issues: { field: string; message: string }[] = [];

  const { year, month, day } = input;
  if (!year || !month || !day) {
    issues.push({ field: "date", message: "请填写完整的出生日期" });
  } else if (year < MIN_YEAR || year > MAX_YEAR) {
    issues.push({ field: "date", message: `出生年份需在 ${MIN_YEAR}–${MAX_YEAR} 之间` });
  } else if (month < 1 || month > 12) {
    issues.push({ field: "date", message: "月份需在 1–12 之间" });
  } else if (day < 1 || day > 31) {
    issues.push({ field: "date", message: "日期需在 1–31 之间" });
  } else if (input.calendar === "solar") {
    // 公历：校验真实存在（如 2 月 30 日）
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) {
      issues.push({ field: "date", message: "该日期在公历中不存在" });
    }
  } else if (input.calendar === "lunar") {
    const leapMonth = LunarYear.fromYear(year).getLeapMonth();
    const isLeap = !!input.isLeapMonth;
    if (isLeap && leapMonth !== month) {
      issues.push({
        field: "date",
        message: `${year} 年${leapMonth ? `闰${leapMonth}月` : "无闰月"}，与所选闰月不符`,
      });
    }
    const maxDay = LunarMonthDays(year, month, isLeap);
    if (maxDay > 0 && day > maxDay) {
      issues.push({
        field: "date",
        message: `农历${isLeap ? "闰" : ""}${month}月只有 ${maxDay} 天`,
      });
    }
  }

  if (input.hour !== null && input.hour !== undefined) {
    if (input.hour < 0 || input.hour > 23) {
      issues.push({ field: "time", message: "小时需在 0–23 之间" });
    }
    const m = input.minute ?? 0;
    if (m < 0 || m > 59) {
      issues.push({ field: "time", message: "分钟需在 0–59 之间" });
    }
  }

  if (input.useTrueSolarTime && (input.longitude === null || input.longitude === undefined)) {
    issues.push({
      field: "longitude",
      message: "启用真太阳时校正需要提供出生地经度",
    });
  }

  return { ok: issues.length === 0, issues };
}

/** 农历某月的天数；返回 0 表示该月不存在 */
function LunarMonthDays(year: number, month: number, isLeap: boolean): number {
  try {
    const ly = LunarYear.fromYear(year);
    const m = ly.getMonth(isLeap ? -month : month);
    return m ? m.getDayCount() : 0;
  } catch {
    return 0;
  }
}

/* ------------------------------------------------------------------
 * 主流程：构建命盘
 * ------------------------------------------------------------------ */

export function buildChart(input: BirthInput): BaziChart {
  const validation = validateBirthInput(input);
  if (!validation.ok) {
    throw new Error(validation.issues.map((i) => i.message).join("；"));
  }

  const warnings: string[] = [];
  const hourKnown = input.hour !== null && input.hour !== undefined;
  const rawHour = hourKnown ? (input.hour as number) : 12;
  const rawMinute = hourKnown ? (input.minute ?? 0) : 0;

  /* ---- 1. 还原为公历「挂钟时间」 ---- */
  let solarParts: WallClock;
  let lunarForText: Lunar;

  if (input.calendar === "lunar") {
    const lunar = Lunar.fromYmdHms(
      input.year,
      input.isLeapMonth ? -input.month : input.month,
      input.day,
      rawHour,
      rawMinute,
      0,
    );
    const s = lunar.getSolar();
    solarParts = {
      year: s.getYear(),
      month: s.getMonth(),
      day: s.getDay(),
      hour: rawHour,
      minute: rawMinute,
    };
    lunarForText = lunar;
  } else {
    solarParts = {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: rawHour,
      minute: rawMinute,
    };
    lunarForText = Solar.fromYmdHms(
      solarParts.year,
      solarParts.month,
      solarParts.day,
      rawHour,
      rawMinute,
      0,
    ).getLunar();
  }

  const inputTimeText = formatWallClock(solarParts);

  /* ---- 2. 夏令时还原 ---- */
  let dstAdjusted = false;
  if (isChinaDstDate(solarParts.year, solarParts.month, solarParts.day)) {
    // 自动提示；是否换算由用户显式选择（默认不换算，避免二次扣减）
    warnings.push(
      `${solarParts.year} 年该日期处于中国夏令时期间（UTC+9）。` +
        `若出生时间记录的是当时挂钟时间，请在表单中勾选「已按夏令时校正」。`,
    );
  }

  /* ---- 3. 真太阳时校正 ---- */
  let solarTimeOffsetMinutes = 0;
  let effective = { ...solarParts };

  if (input.useTrueSolarTime && input.longitude !== null) {
    const standardLongitude = input.timezoneOffset * 15;
    // 构造一个「以 UTC 承载本地挂钟时间」的 Date，交给库计算偏移
    const carrier = new Date(
      Date.UTC(
        solarParts.year,
        solarParts.month - 1,
        solarParts.day,
        solarParts.hour,
        solarParts.minute,
      ),
    );
    try {
      const detail = getTrueSolarTimeDetail(carrier, input.longitude, {
        standardLongitude,
      });
      solarTimeOffsetMinutes = detail.totalOffset;
      effective = shiftMinutes(effective, solarTimeOffsetMinutes);
      dstAdjusted = false; // 真太阳时已包含经度校正，不再叠加
    } catch {
      warnings.push("真太阳时校正失败，已退回使用标准时间排盘。");
      solarTimeOffsetMinutes = 0;
    }
  }

  /* ---- 4. 生成八字 ---- */
  const solar = Solar.fromYmdHms(
    effective.year,
    effective.month,
    effective.day,
    effective.hour,
    effective.minute,
    0,
  );
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  ec.setSect(input.sect);

  const dayGan = ec.getDayGan();
  const dayElement = GAN_ELEMENT[dayGan];

  /* ---- 5. 组装四柱 ---- */
  const pillarSpecs = [
    {
      label: "年" as const,
      gan: ec.getYearGan(),
      zhi: ec.getYearZhi(),
      hidden: ec.getYearHideGan(),
      shiShenGan: ec.getYearShiShenGan(),
      shiShenZhi: ec.getYearShiShenZhi(),
      naYin: ec.getYearNaYin(),
      diShi: ec.getYearDiShi(),
      xunKong: ec.getYearXunKong(),
      include: true,
    },
    {
      label: "月" as const,
      gan: ec.getMonthGan(),
      zhi: ec.getMonthZhi(),
      hidden: ec.getMonthHideGan(),
      shiShenGan: ec.getMonthShiShenGan(),
      shiShenZhi: ec.getMonthShiShenZhi(),
      naYin: ec.getMonthNaYin(),
      diShi: ec.getMonthDiShi(),
      xunKong: ec.getMonthXunKong(),
      include: true,
    },
    {
      label: "日" as const,
      gan: ec.getDayGan(),
      zhi: ec.getDayZhi(),
      hidden: ec.getDayHideGan(),
      shiShenGan: "日主",
      shiShenZhi: ec.getDayShiShenZhi(),
      naYin: ec.getDayNaYin(),
      diShi: ec.getDayDiShi(),
      xunKong: ec.getDayXunKong(),
      include: true,
    },
    {
      label: "时" as const,
      gan: ec.getTimeGan(),
      zhi: ec.getTimeZhi(),
      hidden: ec.getTimeHideGan(),
      shiShenGan: ec.getTimeShiShenGan(),
      shiShenZhi: ec.getTimeShiShenZhi(),
      naYin: ec.getTimeNaYin(),
      diShi: ec.getTimeDiShi(),
      xunKong: ec.getTimeXunKong(),
      include: hourKnown,
    },
  ];

  const pillars: Pillar[] = pillarSpecs
    .filter((p) => p.include)
    .map((p) => buildPillar(p, dayGan));

  if (!hourKnown) {
    warnings.push(
      "未提供出生时辰，时柱留空。时柱影响子女、晚年与部分神煞判断，" +
        "亦会影响大运起运时间的精度；如需完整命盘请补充时辰。",
    );
  }

  /* ---- 6. 五行统计 ---- */
  const elementCount = Object.fromEntries(WU_XING.map((e) => [e, 0])) as Record<WuXing, number>;
  const elementScore = Object.fromEntries(WU_XING.map((e) => [e, 0])) as Record<WuXing, number>;

  for (const p of pillars) {
    elementCount[p.ganElement] += 1;
    elementCount[p.zhiElement] += 1;
    elementScore[p.ganElement] += 1;
    for (const h of p.hidden) {
      elementScore[h.element] += h.weight;
    }
  }
  for (const e of WU_XING) elementScore[e] = Math.round(elementScore[e] * 100) / 100;

  const missingElements = WU_XING.filter((e) => elementCount[e] === 0);

  /* ---- 7. 十神统计 ---- */
  const tenGodCount: Record<string, number> = {};
  for (const p of pillars) {
    if (p.tenGodGan !== "日主") {
      tenGodCount[p.tenGodGan] = (tenGodCount[p.tenGodGan] ?? 0) + 1;
    }
    for (const h of p.hidden) {
      if (h.tenGod === "日主") continue;
      tenGodCount[h.tenGod] = (tenGodCount[h.tenGod] ?? 0) + 1;
    }
  }

  /* ---- 8. 旺衰评估 ---- */
  const strength = assessStrength(pillars, dayGan, dayElement);

  /* ---- 9. 刑冲合会 ---- */
  const relations = computeRelations(pillars);

  /* ---- 10. 大运 ---- */
  let yun: YunInfo | null = null;
  if (input.gender === "unspecified") {
    warnings.push(
      "未指定性别，无法确定大运顺逆（阳男阴女顺排、阴男阳女逆排），故不推大运。",
    );
  } else {
    const genderCode = input.gender === "male" ? 1 : 0;
    try {
      const y = ec.getYun(genderCode);
      const daYunRaw = y.getDaYun(9);
      const daYun: DaYunEntry[] = daYunRaw.map((d, i) => ({
        index: i,
        ganZhi: d.getGanZhi(),
        startYear: d.getStartYear(),
        endYear: d.getEndYear(),
        startAge: d.getStartAge(),
        endAge: d.getEndAge(),
        liuNian: d
          .getLiuNian()
          .slice(0, 10)
          .map((ln) => ({
            year: ln.getYear(),
            age: ln.getAge(),
            ganZhi: ln.getGanZhi(),
            tenGod: getTenGod(dayGan, ln.getGanZhi()[0]),
          })),
      }));

      const startSolar = y.getStartSolar();
      yun = {
        forward: y.isForward(),
        startYear: y.getStartYear(),
        startMonth: y.getStartMonth(),
        startDay: y.getStartDay(),
        startSolar: `${startSolar.getYear()}-${String(startSolar.getMonth()).padStart(2, "0")}-${String(
          startSolar.getDay(),
        ).padStart(2, "0")}`,
        daYun,
        hourAssumed: !hourKnown,
      };
    } catch {
      warnings.push("大运推算失败，命盘其余部分不受影响。");
    }
  }

  if (!hourKnown && yun) {
    warnings.push("起运时间以正午 12:00 代入推算，实际起运年份可能相差数月。");
  }

  /* ---- 11. 计算依据 ---- */
  const solarTimeNote = input.useTrueSolarTime
    ? `已按东经 ${input.longitude}° 校正，偏移 ${solarTimeOffsetMinutes >= 0 ? "+" : ""}${solarTimeOffsetMinutes.toFixed(1)} 分钟。`
    : "未启用真太阳时校正，直接以标准时区时间排盘。";

  const meta = {
    yearRule: "以立春为岁首换年（非正月初一）",
    monthRule: "以十二节（立春、惊蛰、清明…）定月（非农历初一）",
    dayRule:
      input.sect === 1
        ? "晚子时（23:00–24:00）日柱归次日（流派一，默认）"
        : "晚子时（23:00–24:00）日柱归当日（流派二）",
    timeRule: "时柱按两小时一辰划分，子时为 23:00–01:00",
    solarTimeNote,
    effectiveTime: formatWallClock(effective),
    inputTime: inputTimeText,
    solarTimeOffsetMinutes: Math.round(solarTimeOffsetMinutes * 10) / 10,
    engine: ENGINE_LABEL,
  };

  if (dstAdjusted) {
    warnings.push("已按夏令时校正，出生时间减 1 小时。");
  }

  return {
    input,
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      hour: effective.hour,
      minute: effective.minute,
    },
    lunarText: lunar.toString(),
    lunarParts: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() < 0,
    },
    zodiac: ZODIAC[ec.getYearZhi()] ?? "",
    pillars,
    hourKnown,
    dayMaster: {
      gan: dayGan,
      element: dayElement,
      yinYang: GAN_YINYANG[dayGan],
    },
    elementCount,
    elementScore,
    missingElements,
    tenGodCount,
    strength,
    relations,
    extra: {
      taiYuan: `${ec.getTaiYuan()}（${ec.getTaiYuanNaYin()}）`,
      mingGong: `${ec.getMingGong()}（${ec.getMingGongNaYin()}）`,
      shenGong: `${ec.getShenGong()}（${ec.getShenGongNaYin()}）`,
      taiXi: `${ec.getTaiXi()}（${ec.getTaiXiNaYin()}）`,
    },
    yun,
    meta,
    warnings,
  };
}

/* ------------------------------------------------------------------
 * 子构建函数
 * ------------------------------------------------------------------ */

function buildPillar(
  spec: {
    label: "年" | "月" | "日" | "时";
    gan: string;
    zhi: string;
    hidden: string[];
    shiShenGan: string;
    shiShenZhi: string[];
    naYin: string;
    diShi: string;
    xunKong: string;
  },
  dayGan: string,
): Pillar {
  const ownTable = ZHI_HIDDEN_STEMS[spec.zhi] ?? [];
  const hidden: HiddenStem[] = spec.hidden.map((stem, i) => {
    const tableEntry = ownTable[i];
    const weight = tableEntry?.weight ?? 1 / Math.max(spec.hidden.length, 1);
    const role: HiddenStem["role"] =
      i === 0 ? "本气" : i === 1 ? "中气" : "余气";
    return {
      stem,
      element: GAN_ELEMENT[stem],
      tenGod: (spec.shiShenZhi[i] as TenGod) ?? getTenGod(dayGan, stem),
      weight,
      role,
    };
  });

  return {
    label: spec.label,
    gan: spec.gan,
    zhi: spec.zhi,
    ganZhi: spec.gan + spec.zhi,
    ganElement: GAN_ELEMENT[spec.gan],
    zhiElement: ZHI_ELEMENT[spec.zhi],
    ganYinYang: GAN_YINYANG[spec.gan],
    zhiYinYang: ZHI_YINYANG[spec.zhi],
    tenGodGan: (spec.shiShenGan as TenGod | "日主") ?? "日主",
    hidden,
    naYin: spec.naYin,
    diShi: spec.diShi,
    xunKong: spec.xunKong,
    isDayMaster: spec.label === "日",
  };
}

/**
 * 旺衰评估（简化三要素法）
 *
 * 这是本项目自定的启发式方法，不是任何单一流派的完整判据。
 * 真实的旺衰判断还需考虑通根、透干、月令司权、合化、调候等因素，
 * 不同流派结论常有分歧。此处只提供一个可解释的参考分，
 * 并在 UI 上明确标注其局限。
 */
function assessStrength(
  pillars: Pillar[],
  dayGan: string,
  dayElement: WuXing,
): StrengthAssessment {
  const monthPillar = pillars.find((p) => p.label === "月");
  const monthElement = monthPillar?.zhiElement ?? dayElement;

  // 得令（0–40）
  let seasonScore = 0;
  let seasonLabel = "";
  if (monthElement === dayElement) {
    seasonScore = 40;
    seasonLabel = "旺";
  } else if (GENERATES[monthElement] === dayElement) {
    seasonScore = 34;
    seasonLabel = "相";
  } else if (GENERATES[dayElement] === monthElement) {
    seasonScore = 18;
    seasonLabel = "休";
  } else if (OVERCOMES[dayElement] === monthElement) {
    seasonScore = 14;
    seasonLabel = "囚";
  } else {
    seasonScore = 8;
    seasonLabel = "死";
  }

  // 得地（0–35）：地支藏干中生扶日主者
  let earthRaw = 0;
  let earthMax = 0;
  const supportElements = new Set<WuXing>([dayElement, GENERATED_BY[dayElement]]);
  for (const p of pillars) {
    for (const h of p.hidden) {
      earthMax += h.weight;
      if (supportElements.has(h.element)) earthRaw += h.weight;
    }
  }
  const earthScore = earthMax > 0 ? (earthRaw / earthMax) * 35 : 0;

  // 得势（0–25）：天干中生扶日主者
  const otherStems = pillars.filter((p) => !p.isDayMaster).map((p) => p.ganElement);
  const stemSupport = otherStems.filter((e) => supportElements.has(e)).length;
  const stemScore = otherStems.length > 0 ? (stemSupport / otherStems.length) * 25 : 0;

  const score = Math.round(seasonScore + earthScore + stemScore);
  const label: StrengthAssessment["label"] = score >= 62 ? "偏强" : score >= 38 ? "中和" : "偏弱";

  return {
    label,
    score,
    factors: [
      {
        key: "得令",
        value: `${seasonLabel}（${seasonScore}/40）`,
        detail: `月令为${monthPillar?.zhi ?? "?"}（${monthElement}），日主为${dayElement}，` +
          `二者关系判定为「${seasonLabel}」。月令权重最高，是旺衰的主导因素。`,
      },
      {
        key: "得地",
        value: `${Math.round(earthScore)}/35`,
        detail: `地支藏干中生扶日主（${dayElement}、${GENERATED_BY[dayElement]}）的比例为 ` +
          `${earthMax > 0 ? Math.round((earthRaw / earthMax) * 100) : 0}%。`,
      },
      {
        key: "得势",
        value: `${Math.round(stemScore)}/25`,
        detail: `其余 ${otherStems.length} 个天干中，有 ${stemSupport} 个生扶日主。`,
      },
    ],
    method:
      "采用「得令 / 得地 / 得势」三要素加权（40 / 35 / 25），为简化模型。" +
      "未计入通根深浅、透干、合化、调候等因素，不同流派结论可能有差异，仅供参考。",
  };
}

/** 刑冲合会：只报告明确成立的组合，不做吉凶判断 */
function computeRelations(pillars: Pillar[]) {
  const zhis = pillars.map((p) => p.zhi);
  const gans = pillars.map((p) => p.gan);
  const labels = pillars.map((p) => p.label);

  const ganHe: string[] = [];
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      const h = GAN_HE[gans[i]];
      if (h && h.with === gans[j]) {
        ganHe.push(`${labels[i]}干${gans[i]} 与 ${labels[j]}干${gans[j]} 合化${h.element}`);
      }
    }
  }

  const zhiChong: string[] = [];
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      if (ZHI_CHONG[zhis[i]] === zhis[j]) {
        zhiChong.push(`${labels[i]}支${zhis[i]} 冲 ${labels[j]}支${zhis[j]}`);
      }
    }
  }

  const zhiHe: string[] = [];
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      if (ZHI_LIU_HE[zhis[i]] === zhis[j]) {
        zhiHe.push(`${labels[i]}支${zhis[i]} 合 ${labels[j]}支${zhis[j]}`);
      }
    }
  }

  const sanHe: string[] = [];
  for (const group of ZHI_SAN_HE) {
    const present = group.branches.filter((b) => zhis.includes(b));
    if (present.length === 3) sanHe.push(`${group.name}（三支俱全）`);
    else if (present.length === 2) {
      const hasHalf = zhis.filter((z) => present.includes(z)).length >= 2;
      if (hasHalf) sanHe.push(`${group.name.replace("局", "半合")}（${present.join("、")}）`);
    }
  }

  return { ganHe, zhiChong, zhiHe, sanHe };
}

/* ------------------------------------------------------------------
 * 导出工具
 * ------------------------------------------------------------------ */

export { formatWallClock, MIN_YEAR, MAX_YEAR, ENGINE_LABEL };
