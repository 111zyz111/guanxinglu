import type { WuXing, YinYang, TenGod } from "./constants";

export type CalendarType = "solar" | "lunar";
export type Gender = "male" | "female" | "unspecified";

/** 出生信息输入（表单与 URL 共用） */
export interface BirthInput {
  calendar: CalendarType;
  year: number;
  month: number;
  day: number;
  /** null 表示时辰未知 */
  hour: number | null;
  minute: number | null;
  /** 农历闰月标记，仅 calendar === "lunar" 时有效 */
  isLeapMonth: boolean;
  gender: Gender;
  /** 出生地经度（东经为正）；null 表示未提供 */
  longitude: number | null;
  /** 出生地名称，仅用于展示 */
  locationName: string | null;
  /** 时区偏移（小时），中国大陆为 8 */
  timezoneOffset: number;
  /** 是否启用真太阳时校正 */
  useTrueSolarTime: boolean;
  /** 子时换日流派：1 = 晚子时日柱算次日；2 = 晚子时日柱算当日 */
  sect: 1 | 2;
}

export interface HiddenStem {
  stem: string;
  element: WuXing;
  tenGod: TenGod | "日主";
  weight: number;
  role: "本气" | "中气" | "余气";
}

export interface Pillar {
  /** 年 / 月 / 日 / 时 */
  label: "年" | "月" | "日" | "时";
  gan: string;
  zhi: string;
  ganZhi: string;
  ganElement: WuXing;
  zhiElement: WuXing;
  ganYinYang: YinYang;
  zhiYinYang: YinYang;
  /** 天干十神（日柱为「日主」） */
  tenGodGan: TenGod | "日主";
  hidden: HiddenStem[];
  naYin: string;
  /** 十二长生（以日干为参照） */
  diShi: string;
  xunKong: string;
  isDayMaster: boolean;
}

export interface LiuNianEntry {
  year: number;
  age: number;
  ganZhi: string;
  /** 流年天干十神（相对日主） */
  tenGod: string;
}

export interface DaYunEntry {
  index: number;
  ganZhi: string;
  /** 起运前的空档期为 "" */
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  liuNian: LiuNianEntry[];
}

export interface YunInfo {
  /** true = 顺排，false = 逆排 */
  forward: boolean;
  startYear: number;
  startMonth: number;
  startDay: number;
  /** 起运公历日期（YYYY-MM-DD） */
  startSolar: string;
  daYun: DaYunEntry[];
  /** 时辰未知时，起运以正午代入推算 */
  hourAssumed: boolean;
}

export interface StrengthAssessment {
  /** 偏强 / 中和 / 偏弱 */
  label: "偏强" | "中和" | "偏弱";
  /** 0-100，越高越强 */
  score: number;
  /** 得令 / 得地 / 得势 三项说明 */
  factors: { key: string; value: string; detail: string }[];
  /** 判定所依据的方法说明 */
  method: string;
}

export interface ChartMeta {
  /** 年柱换年规则 */
  yearRule: string;
  /** 月柱定月规则 */
  monthRule: string;
  /** 日柱换日规则 */
  dayRule: string;
  /** 时柱规则 */
  timeRule: string;
  /** 真太阳时说明 */
  solarTimeNote: string;
  /** 实际用于计算的时间 */
  effectiveTime: string;
  /** 用户输入的原始时间 */
  inputTime: string;
  /** 真太阳时偏移（分钟），未启用则为 0 */
  solarTimeOffsetMinutes: number;
  /** 计算引擎 */
  engine: string;
}

export interface BaziChart {
  input: BirthInput;
  /** 用于计算的公历时刻 */
  solar: { year: number; month: number; day: number; hour: number; minute: number };
  /** 农历文本，如「一九九〇年腊月初五」 */
  lunarText: string;
  lunarParts: { year: number; month: number; day: number; isLeap: boolean };
  zodiac: string;
  /** 年、月、日、（时）四柱；时辰未知时长度 3 */
  pillars: Pillar[];
  hourKnown: boolean;
  dayMaster: { gan: string; element: WuXing; yinYang: YinYang };
  /** 八字本气计数（4 天干 + 4 地支本气，共 8） */
  elementCount: Record<WuXing, number>;
  /** 含藏干加权的五行分值（总和 8） */
  elementScore: Record<WuXing, number>;
  /** 缺失的五行 */
  missingElements: WuXing[];
  tenGodCount: Record<string, number>;
  strength: StrengthAssessment;
  relations: {
    ganHe: string[];
    zhiChong: string[];
    zhiHe: string[];
    sanHe: string[];
  };
  extra: {
    taiYuan: string;
    mingGong: string;
    shenGong: string;
    taiXi: string;
  };
  yun: YunInfo | null;
  meta: ChartMeta;
  warnings: string[];
}

/** 表单校验结果 */
export interface ValidationIssue {
  field: string;
  message: string;
}
