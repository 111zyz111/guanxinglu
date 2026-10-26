/**
 * 术语词典（藏经模块）
 *
 * 独立于排盘引擎，避免把历法库打进词典页的客户端包。
 * 释义为本项目原创撰写，术语体系参照传统命理通行分类。
 */

export interface GlossaryEntry {
  term: string;
  pinyin?: string;
  category: "基础" | "十神" | "结构" | "历法" | "占卜";
  definition: string;
  detail?: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "八字",
    pinyin: "bā zì",
    category: "基础",
    definition: "以出生年、月、日、时的天干地支共八个字表示出生时刻的记法，又称四柱。",
    detail:
      "年柱、月柱、日柱、时柱各两字，合为八字。其推演依赖历法：年以立春为界，月以节气为界，日按干支循环，时按十二时辰划分。",
  },
  {
    term: "四柱",
    category: "基础",
    definition: "年柱、月柱、日柱、时柱的合称，每柱由一个天干和一个地支组成。",
    detail: "传统上以年柱为根、月柱为苗、日柱为花、时柱为果，但这是比喻而非严格因果。",
  },
  {
    term: "日主",
    pinyin: "rì zhǔ",
    category: "基础",
    definition: "日柱的天干，代表「我」，是全部十神关系的参照点。",
    detail: "日主的五行与阴阳决定其余七字与它的关系类型，因此排盘必先定日主。",
  },
  {
    term: "天干",
    category: "基础",
    definition: "甲乙丙丁戊己庚辛壬癸，共十个，分属五行阴阳。",
    detail: "甲丙戊庚壬为阳，乙丁己辛癸为阴。甲乙木、丙丁火、戊己土、庚辛金、壬癸水。",
  },
  {
    term: "地支",
    category: "基础",
    definition: "子丑寅卯辰巳午未申酉戌亥，共十二个，对应十二时辰与十二生肖。",
    detail: "地支各藏一到三个天干，称「藏干」，是判断地支实际力量的关键。",
  },
  {
    term: "月令",
    pinyin: "yuè lìng",
    category: "结构",
    definition: "月柱的地支，代表出生时所处的节气时段，在旺衰判断中权重最高。",
    detail: "传统上「月令为重」，因为它决定了全局的寒暖燥湿与五行的当令状态。",
  },
  {
    term: "藏干",
    category: "结构",
    definition: "地支内部所藏的天干，分本气、中气、余气三层。",
    detail:
      "例如寅藏甲丙戊：甲为本气、丙为中气、戊为余气。只看地支表面五行会低估或高估实际力量，故需看藏干。",
  },
  {
    term: "十神",
    category: "十神",
    definition: "以日主为参照，描述其余天干与日主关系的十种称谓。",
    detail:
      "比肩、劫财（同类）；食神、伤官（我生）；偏财、正财（我克）；七杀、正官（克我）；偏印、正印（生我）。",
  },
  {
    term: "比肩 / 劫财",
    category: "十神",
    definition: "与日主同五行者。同阴阳为比肩，异阴阳为劫财。",
    detail: "传统上对应同辈、合作、竞争与资源分配。",
  },
  {
    term: "食神 / 伤官",
    category: "十神",
    definition: "日主所生者。同阴阳为食神，异阴阳为伤官。",
    detail: "传统上对应表达、创造与产出。伤官更带锋芒与突破常规的意味。",
  },
  {
    term: "正财 / 偏财",
    category: "十神",
    definition: "日主所克者。异阴阳为正财，同阴阳为偏财。",
    detail: "传统上正财对应稳定积累，偏财对应流动机会。",
  },
  {
    term: "正官 / 七杀",
    category: "十神",
    definition: "克日主者。异阴阳为正官，同阴阳为七杀。",
    detail: "传统上正官对应规范与职位，七杀对应压力与挑战。",
  },
  {
    term: "正印 / 偏印",
    category: "十神",
    definition: "生日主者。异阴阳为正印，同阴阳为偏印。",
    detail: "传统上正印对应系统学习与庇护，偏印对应直觉与非主流学问。",
  },
  {
    term: "纳音",
    category: "结构",
    definition: "六十甲子按固定规则对应的一种五行称谓，如「海中金」「炉中火」。",
    detail: "纳音是独立于正五行的另一套体系，传统上用于辅助取象，不宜与正五行混用。",
  },
  {
    term: "十二长生",
    category: "结构",
    definition: "描述天干在十二地支上的气势消长，依次为长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养。",
    detail: "它是「气势阶段」的比喻，不是字面上的生死。",
  },
  {
    term: "大运",
    category: "结构",
    definition: "以十年为单位的运势分段，由月柱起，按年干阴阳与性别决定顺排或逆排。",
    detail:
      "阳男阴女顺排，阴男阳女逆排。起运时间由出生时刻到相邻节气的距离折算，三日折一年。",
  },
  {
    term: "流年",
    category: "结构",
    definition: "以年为单位逐年推演的干支，与所行大运共同构成时间维度。",
  },
  {
    term: "真太阳时",
    category: "历法",
    definition: "以太阳实际过中天为正午的时间，需按经度与均时差校正。",
    detail:
      "中国统一使用东经 120° 的北京时间，但乌鲁木齐实际经度约 87.6°，两者相差近 130 分钟。" +
      "是否校正属于流派选择，本工具默认不校正，可手动开启。",
  },
  {
    term: "节气",
    category: "历法",
    definition: "按太阳黄经每 15° 划分的二十四个时间点，是八字定月与定年的依据。",
    detail:
      "十二「节」（立春、惊蛰、清明…）用于定月，十二「气」（雨水、春分、谷雨…）用于气候描述。",
  },
  {
    term: "立春换年",
    category: "历法",
    definition: "八字以立春为一年之始，而非农历正月初一。",
    detail:
      "因此正月初一至立春之间出生的人，其年柱仍属上一年。这是初学者最常出错的地方之一。",
  },
  {
    term: "子时换日",
    category: "历法",
    definition: "关于 23:00–24:00（晚子时）出生者日柱归属的分歧。",
    detail:
      "一派认为晚子时已属次日，日柱取次日（流派一）；另一派认为仍属当日（流派二）。本工具默认流派一，可切换。",
  },
  {
    term: "本卦 / 变卦",
    category: "占卜",
    definition: "起卦所得的原卦为本卦；有动爻变化后得到的卦为变卦。",
    detail: "传统上以本卦看当下处境，以变卦看发展趋向。",
  },
  {
    term: "动爻",
    category: "占卜",
    definition: "卦中发生阴阳变化的爻，由起卦过程中的老阳（9）或老阴（6）产生。",
    detail: "动爻是解读的焦点，爻辞即针对该爻的说明。",
  },
  {
    term: "梅花易数",
    category: "占卜",
    definition: "相传为邵雍所传的起卦法，以时间、数字或外应取数成卦。",
    detail:
      "时间起卦以上卦=（年+月+日）÷8 取余，下卦=（年+月+日+时）÷8 取余，动爻=总和÷6 取余。",
  },
  {
    term: "六爻",
    category: "占卜",
    definition: "以三枚铜钱摇六次成卦的占法，配合纳甲、六亲、世应等体系解读。",
    detail: "本工具实现了摇卦与卦象生成，纳甲装卦体系暂未纳入。",
  },
  {
    term: "旺相休囚死",
    category: "结构",
    definition: "五行相对月令的五种状态：当令者旺、令生者相、生令者休、克令者囚、令克者死。",
  },
];

export function searchGlossary(keyword: string): GlossaryEntry[] {
  const k = keyword.trim().toLowerCase();
  if (!k) return GLOSSARY;
  return GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(k) ||
      (g.pinyin ?? "").toLowerCase().includes(k) ||
      g.definition.toLowerCase().includes(k) ||
      (g.detail ?? "").toLowerCase().includes(k),
  );
}
