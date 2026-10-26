/**
 * 八字基础常量表
 *
 * 说明：本文件只包含「静态对应关系」（天干地支的五行、阴阳、藏干等），
 * 不包含任何历法计算。历法部分全部交由 lunar-typescript（MIT）处理。
 * 这样做的目的是：所有可能出错的推演都在经过验证的库里，
 * 本项目只负责把库的结果组织成产品需要的结构。
 */

export type WuXing = "木" | "火" | "土" | "金" | "水";
export type YinYang = "阳" | "阴";

export const WU_XING: WuXing[] = ["木", "火", "土", "金", "水"];

/** 天干 → 五行 */
export const GAN_ELEMENT: Record<string, WuXing> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

/** 天干 → 阴阳 */
export const GAN_YINYANG: Record<string, YinYang> = {
  甲: "阳",
  乙: "阴",
  丙: "阳",
  丁: "阴",
  戊: "阳",
  己: "阴",
  庚: "阳",
  辛: "阴",
  壬: "阳",
  癸: "阴",
};

/** 地支 → 五行（本气） */
export const ZHI_ELEMENT: Record<string, WuXing> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

/** 地支 → 阴阳 */
export const ZHI_YINYANG: Record<string, YinYang> = {
  子: "阳",
  丑: "阴",
  寅: "阳",
  卯: "阴",
  辰: "阳",
  巳: "阴",
  午: "阳",
  未: "阴",
  申: "阳",
  酉: "阴",
  戌: "阳",
  亥: "阴",
};

/**
 * 地支藏干（按本气、中气、余气顺序）
 * 权重参考通行用法：本气 0.6 / 中气 0.3 / 余气 0.1；
 * 仅藏一位者取 1.0，藏两位者取 0.7 / 0.3。
 */
export const ZHI_HIDDEN_STEMS: Record<string, { stem: string; weight: number }[]> = {
  子: [{ stem: "癸", weight: 1 }],
  丑: [
    { stem: "己", weight: 0.6 },
    { stem: "癸", weight: 0.3 },
    { stem: "辛", weight: 0.1 },
  ],
  寅: [
    { stem: "甲", weight: 0.6 },
    { stem: "丙", weight: 0.3 },
    { stem: "戊", weight: 0.1 },
  ],
  卯: [{ stem: "乙", weight: 1 }],
  辰: [
    { stem: "戊", weight: 0.6 },
    { stem: "乙", weight: 0.3 },
    { stem: "癸", weight: 0.1 },
  ],
  巳: [
    { stem: "丙", weight: 0.6 },
    { stem: "庚", weight: 0.3 },
    { stem: "戊", weight: 0.1 },
  ],
  午: [
    { stem: "丁", weight: 0.7 },
    { stem: "己", weight: 0.3 },
  ],
  未: [
    { stem: "己", weight: 0.6 },
    { stem: "丁", weight: 0.3 },
    { stem: "乙", weight: 0.1 },
  ],
  申: [
    { stem: "庚", weight: 0.6 },
    { stem: "壬", weight: 0.3 },
    { stem: "戊", weight: 0.1 },
  ],
  酉: [{ stem: "辛", weight: 1 }],
  戌: [
    { stem: "戊", weight: 0.6 },
    { stem: "辛", weight: 0.3 },
    { stem: "丁", weight: 0.1 },
  ],
  亥: [
    { stem: "壬", weight: 0.7 },
    { stem: "甲", weight: 0.3 },
  ],
};

/** 五行相生：生我者 / 我生者 */
export const GENERATES: Record<WuXing, WuXing> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

/** 五行相克：我克者 */
export const OVERCOMES: Record<WuXing, WuXing> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

/** 反向索引 */
export const GENERATED_BY: Record<WuXing, WuXing> = {
  火: "木",
  土: "火",
  金: "土",
  水: "金",
  木: "水",
};

export const OVERCOME_BY: Record<WuXing, WuXing> = {
  土: "木",
  水: "土",
  火: "水",
  金: "火",
  木: "金",
};

/** 十神名称 */
export const TEN_GODS = [
  "比肩",
  "劫财",
  "食神",
  "伤官",
  "偏财",
  "正财",
  "七杀",
  "正官",
  "偏印",
  "正印",
] as const;

export type TenGod = (typeof TEN_GODS)[number];

/** 五行配色（与 globals.css 中的 CSS 变量保持一致，用于深色背景） */
export const ELEMENT_COLOR: Record<WuXing, string> = {
  木: "var(--wx-mu)",
  火: "var(--wx-huo)",
  土: "var(--wx-tu)",
  金: "var(--wx-jin)",
  水: "var(--wx-shui)",
};

/**
 * 五行「墨色」——用于宣纸浅色底的版本。
 * 深色背景上的金（#cfc9b8）在纸上会看不见，因此单独定义一套低明度色。
 */
export const ELEMENT_INK: Record<WuXing, string> = {
  木: "#3d6857",
  火: "#9a3826",
  土: "#8a6636",
  金: "#7d7150",
  水: "#32506c",
};

export const ELEMENT_DESC: Record<WuXing, { nature: string; trait: string }> = {
  木: {
    nature: "曲直",
    trait: "生发、条达。传统上关联成长、仁厚与规划能力，也关联固执与急于伸展。",
  },
  火: {
    nature: "炎上",
    trait: "温热、明亮。传统上关联表达、礼序与热情，也关联急躁与耗散。",
  },
  土: {
    nature: "稼穑",
    trait: "承载、化育。传统上关联稳定、信实与包容，也关联迟滞与过度保守。",
  },
  金: {
    nature: "从革",
    trait: "肃降、收敛。传统上关联决断、义气与条理，也关联严苛与锋利。",
  },
  水: {
    nature: "润下",
    trait: "流动、藏纳。传统上关联智慧、变通与洞察，也关联犹疑与漫无边界。",
  },
};

/** 五行旺相休囚死（相对月令） */
export const SEASON_STATE: Record<string, string> = {
  旺: "当令之气，力量最盛",
  相: "受令所生，力量次盛",
  休: "生令而泄，力量渐退",
  囚: "克令受制，力量受困",
  死: "被令所克，力量最弱",
};

/** 十二长生顺序 */
export const TWELVE_STAGES = [
  "长生",
  "沐浴",
  "冠带",
  "临官",
  "帝旺",
  "衰",
  "病",
  "死",
  "墓",
  "绝",
  "胎",
  "养",
] as const;

/** 地支六合 */
export const ZHI_LIU_HE: Record<string, string> = {
  子: "丑",
  丑: "子",
  寅: "亥",
  亥: "寅",
  卯: "戌",
  戌: "卯",
  辰: "酉",
  酉: "辰",
  巳: "申",
  申: "巳",
  午: "未",
  未: "午",
};

/** 地支六冲 */
export const ZHI_CHONG: Record<string, string> = {
  子: "午",
  午: "子",
  丑: "未",
  未: "丑",
  寅: "申",
  申: "寅",
  卯: "酉",
  酉: "卯",
  辰: "戌",
  戌: "辰",
  巳: "亥",
  亥: "巳",
};

/** 地支三合局 */
export const ZHI_SAN_HE: { branches: string[]; element: WuXing; name: string }[] = [
  { branches: ["申", "子", "辰"], element: "水", name: "申子辰合水局" },
  { branches: ["亥", "卯", "未"], element: "木", name: "亥卯未合木局" },
  { branches: ["寅", "午", "戌"], element: "火", name: "寅午戌合火局" },
  { branches: ["巳", "酉", "丑"], element: "金", name: "巳酉丑合金局" },
];

/** 天干五合 */
export const GAN_HE: Record<string, { with: string; element: WuXing }> = {
  甲: { with: "己", element: "土" },
  己: { with: "甲", element: "土" },
  乙: { with: "庚", element: "金" },
  庚: { with: "乙", element: "金" },
  丙: { with: "辛", element: "水" },
  辛: { with: "丙", element: "水" },
  丁: { with: "壬", element: "木" },
  壬: { with: "丁", element: "木" },
  戊: { with: "癸", element: "火" },
  癸: { with: "戊", element: "火" },
};

/** 十二生肖 */
export const ZODIAC: Record<string, string> = {
  子: "鼠",
  丑: "牛",
  寅: "虎",
  卯: "兔",
  辰: "龙",
  巳: "蛇",
  午: "马",
  未: "羊",
  申: "猴",
  酉: "鸡",
  戌: "狗",
  亥: "猪",
};
