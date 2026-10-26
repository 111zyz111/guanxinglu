import { Solar, Lunar } from "lunar-typescript";

/**
 * 黄历 / 节气
 *
 * 数据来源分层，UI 上必须区分标注：
 *  - 农历日期、干支、节气时刻：由 lunar-typescript 按天文算法计算，可复算
 *  - 宜忌、彭祖百忌、冲煞、吉神方位：来自传统通书（《玉匣记》一系）的规则整理，
 *    属于文献传承而非天文计算，仅供文化了解
 */

export const SOLAR_TERMS = [
  "立春",
  "雨水",
  "惊蛰",
  "春分",
  "清明",
  "谷雨",
  "立夏",
  "小满",
  "芒种",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "处暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
  "冬至",
  "小寒",
  "大寒",
] as const;

export interface AlmanacDay {
  /** 公历 */
  solar: { year: number; month: number; day: number; weekday: string };
  /** 农历文本 */
  lunarText: string;
  lunarParts: { year: number; month: number; day: number; isLeap: boolean };
  ganzhi: { year: string; month: string; day: string; time?: string };
  zodiac: string;
  /** 当日节气名，非节气日为空串 */
  jieQi: string;
  /** 下一个节气 */
  nextJieQi: { name: string; date: string; daysAway: number } | null;
  /** 距下一个节气的天数 */
  yi: string[];
  ji: string[];
  chong: string;
  sha: string;
  pengZu: string;
  xiu: string;
  xiuLuck: string;
  /** 建除十二值星 */
  zhiXing: string;
  /** 今日节日 */
  festivals: string[];
  /** 星座 */
  xingZuo: string;
  /** 当日所处季节 */
  season: string;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function toSolarFromLunarYearTable(lunar: Lunar): Record<string, Solar> {
  return lunar.getJieQiTable() as unknown as Record<string, Solar>;
}

/** 取某天的黄历信息 */
export function getAlmanac(date: Date = new Date()): AlmanacDay {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();

  const todayKey = solar.toYmd();

  // 节气：以年度节气表为准。单个农历年的节气表不覆盖本年末的冬至，
  // 直接查表会漏判，因此统一走 getSolarTermsOfYear。
  const thisYear = getSolarTermsOfYear(solar.getYear());
  const todayJieQi = thisYear.find((t) => t.date === todayKey)?.name ?? "";

  // 下一个节气：跨年查找，避免 12 月末出现「没有下一个节气」
  const nextTerm =
    thisYear.find((t) => t.date > todayKey) ?? getSolarTermsOfYear(solar.getYear() + 1)[0];

  let nextJieQi: AlmanacDay["nextJieQi"] = null;
  if (nextTerm) {
    const [ny, nm, nd] = nextTerm.date.split("-").map(Number);
    const diff = Math.round(
      (Date.UTC(ny, nm - 1, nd) - Date.UTC(solar.getYear(), solar.getMonth() - 1, solar.getDay())) /
        86_400_000,
    );
    nextJieQi = { name: nextTerm.name, date: nextTerm.date, daysAway: diff };
  }

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      weekday: WEEKDAYS[solar.getWeek()],
    },
    lunarText: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    lunarParts: {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() < 0,
    },
    ganzhi: {
      year: lunar.getYearInGanZhiByLiChun(),
      month: lunar.getMonthInGanZhiExact(),
      day: lunar.getDayInGanZhiExact2(),
    },
    zodiac: lunar.getYearShengXiaoByLiChun(),
    jieQi: todayJieQi,
    nextJieQi,
    yi: lunar.getDayYi().slice(0, 12),
    ji: lunar.getDayJi().slice(0, 12),
    chong: `${lunar.getDayChongDesc()} ${lunar.getDaySha()}`,
    sha: lunar.getDaySha(),
    pengZu: `${lunar.getPengZuGan()}　${lunar.getPengZuZhi()}`,
    xiu: `${lunar.getXiu()}宿`,
    xiuLuck: lunar.getXiuLuck(),
    zhiXing: lunar.getZhiXing(),
    festivals: [...lunar.getFestivals(), ...lunar.getOtherFestivals()],
    xingZuo: solar.getXingZuo() + "座",
    season: lunar.getSeason(),
  };
}

/** 取某年的二十四节气表（按公历年内顺序） */
export function getSolarTermsOfYear(year: number): {
  name: string;
  date: string;
  month: number;
  day: number;
}[] {
  const result: { name: string; date: string; month: number; day: number }[] = [];
  const seen = new Set<string>();

  // 节气表按「农历年」组织，单个农历年的表不含本年末的冬至，
  // 因此需要同时探测前后相邻年份，再按公历年过滤。
  for (const [py, pm, pd] of [
    [year - 1, 12, 15],
    [year, 1, 15],
    [year, 6, 15],
    [year, 12, 15],
    [year + 1, 1, 15],
  ] as const) {
    const lunar = Solar.fromYmd(py, pm, pd).getLunar();
    const table = toSolarFromLunarYearTable(lunar);
    for (const [name, s] of Object.entries(table)) {
      if (!SOLAR_TERMS.includes(name as never)) continue;
      if (!s || s.getYear() !== year) continue;
      const key = `${name}-${s.toYmd()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ name, date: s.toYmd(), month: s.getMonth(), day: s.getDay() });
    }
  }

  return result.sort((a, b) => (a.month === b.month ? a.day - b.day : a.month - b.month));
}

/** 节气简介（本项目原创撰写） */
export const SOLAR_TERM_INTRO: Record<string, string> = {
  立春: "二十四节气之首，太阳到达黄经 315°。传统上以此为一年之始，八字换年亦以此为界。",
  雨水: "降水渐增，气温回升。农事上进入备耕阶段。",
  惊蛰: "春雷始鸣，蛰伏的虫类苏醒。八字定月以此时为二月之始。",
  春分: "昼夜等长，太阳直射赤道。此后北半球昼渐长。",
  清明: "天气清朗，草木繁茂。既是节气，也是传统祭扫节日。",
  谷雨: "雨生百谷，春季最后一个节气。",
  立夏: "夏季开始，万物进入生长旺季。",
  小满: "夏熟作物籽粒开始饱满，但尚未成熟。",
  芒种: "有芒作物成熟，也是播种最忙的时节。",
  夏至: "白昼最长，太阳到达北回归线。此后昼渐短。",
  小暑: "天气开始炎热，但尚未到极点。",
  大暑: "一年中最热的时段，雷雨频繁。",
  立秋: "秋季开始，暑气未消，所谓「秋后一伏」。",
  处暑: "暑气至此而止，天气转凉。",
  白露: "昼夜温差加大，清晨草木凝露。",
  秋分: "昼夜再次等长，此后北半球昼短夜长。",
  寒露: "露水寒凉，将要凝结。",
  霜降: "秋季最后一个节气，开始出现初霜。",
  立冬: "冬季开始，万物收藏。",
  小雪: "开始降雪，但雪量不大。",
  大雪: "降雪增多，气温显著下降。",
  冬至: "白昼最短。传统上有「冬至一阳生」之说，是重要的岁时节点。",
  小寒: "天气寒冷，但尚未到极点。",
  大寒: "一年中最冷的时段，也是二十四节气之末。",
};

/** 传统文化知识卡片（本项目原创撰写） */
export const CULTURE_CARDS: { title: string; text: string }[] = [
  {
    title: "为什么八字以立春换年",
    text:
      "干支纪年本与太阳位置绑定，立春是太阳黄经 315° 的时刻，代表阳气始生。" +
      "农历正月初一是月相周期的起点，属于另一套系统。命理取节气系统，故以立春为界。",
  },
  {
    title: "节气与农历月不是一回事",
    text:
      "农历月按朔望月划分（约 29.53 天），节气按太阳黄经每 15° 划分。" +
      "两者长度不同，因此同一个农历月里可能跨两个节气，这也是闰月产生的原因。",
  },
  {
    title: "「宜忌」是怎么来的",
    text:
      "黄历宜忌来自传统通书的规则表，依据干支、建除十二值星、二十八宿等要素组合而成，" +
      "属于文献传承的择日体系，不是天文计算结果。本工具如实标注其性质，供文化了解。",
  },
  {
    title: "真太阳时为什么重要",
    text:
      "中国全境统一使用东经 120° 的北京时间。乌鲁木齐实际经度约 87.6°，" +
      "当地太阳过中天比北京时间晚约 130 分钟。若严格按「日晷时间」排盘，需要做此校正。" +
      "是否校正属流派选择，本工具默认不校正。",
  },
];
