import type { BaziChart } from "./types";
import { ELEMENT_DESC, GENERATED_BY, OVERCOMES, WU_XING } from "./constants";
import { getTenGod } from "./engine";

export interface ReadingSection {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  items?: { label: string; text: string }[];
  note?: string;
}

/* ------------------------------------------------------------------
 * 日主（十天干）性格倾向
 * 传统命理以日干为「我」，其五行阴阳决定基本气质。
 * 以下文字为基于传统象义的现代转述，不是心理学结论。
 * ------------------------------------------------------------------ */

const DAY_MASTER_PROFILE: Record<string, { image: string; traits: string; shadow: string }> = {
  甲: {
    image: "参天之木",
    traits:
      "甲为阳木，象如乔木。传统上取其「直」与「向上」之意，常被描述为有主见、重原则、愿意承担，做事倾向于先立框架再推进。",
    shadow: "另一面是不易弯曲：认定的事很难被说服，遇到阻力时容易硬扛而不是绕行。",
  },
  乙: {
    image: "藤萝花草",
    traits:
      "乙为阴木，象如藤蔓花草。传统上取其「柔而能生」之意，常被描述为适应力强、善借势、细腻且懂得变通。",
    shadow: "另一面是依赖环境：缺少支撑时容易摇摆，也容易把「顺势」变成「随波」。",
  },
  丙: {
    image: "太阳之火",
    traits:
      "丙为阳火，象如日光。传统上取其「普照」之意，常被描述为外向、坦率、有感染力，愿意把能量投向外部世界。",
    shadow: "另一面是耗散：热度来得快也去得快，容易铺开太多而难以收束。",
  },
  丁: {
    image: "灯烛之火",
    traits:
      "丁为阴火，象如灯烛。传统上取其「照近」之意，常被描述为专注、敏锐、重感受，擅长在具体而微的事情上持续投入。",
    shadow: "另一面是内耗：对外温和，对内消耗大，情绪不易外露却积压得久。",
  },
  戊: {
    image: "城墙高山",
    traits:
      "戊为阳土，象如高山厚土。传统上取其「承载」之意，常被描述为稳重、可靠、能扛事，是他人愿意托付的类型。",
    shadow: "另一面是迟滞：改变的成本很高，容易在旧结构里待得太久。",
  },
  己: {
    image: "田园之土",
    traits:
      "己为阴土，象如耕田。传统上取其「化育」之意，常被描述为务实、细致、善于经营与照顾，重视具体可见的成果。",
    shadow: "另一面是过度操心：容易把别人的事揽到自己身上，边界感偏弱。",
  },
  庚: {
    image: "刀剑之金",
    traits:
      "庚为阳金，象如斧钺。传统上取其「决断」之意，常被描述为干脆、讲义气、执行力强，面对问题倾向直接处理。",
    shadow: "另一面是锋利：判断快、出手快，容易在关系里留下不必要的划痕。",
  },
  辛: {
    image: "珠玉之金",
    traits:
      "辛为阴金，象如珠玉。传统上取其「精炼」之意，常被描述为审美敏锐、讲究品质、重视细节与分寸。",
    shadow: "另一面是挑剔：对己对人标准都高，容易因为「不够好」而迟迟不开始。",
  },
  壬: {
    image: "江河之水",
    traits:
      "壬为阳水，象如大江。传统上取其「流动」之意，常被描述为视野开阔、思路活、善于连接不同的事物与人。",
    shadow: "另一面是漫无边界：兴趣铺得太广，容易在收口处失焦。",
  },
  癸: {
    image: "雨露之水",
    traits:
      "癸为阴水，象如雨露。传统上取其「渗透」之意，常被描述为感受力强、直觉准、善于体察未言明的部分。",
    shadow: "另一面是犹疑：想得比做得多，容易在权衡中错过时机。",
  },
};

/* ------------------------------------------------------------------
 * 十神简义
 * ------------------------------------------------------------------ */

const TEN_GOD_MEANING: Record<string, string> = {
  比肩: "同类、同辈。传统上对应自我主张、同侪关系与竞争意识。",
  劫财: "同类的另一面。传统上对应合作中的分利、朋友与资源分配。",
  食神: "我生之同阴阳。传统上对应表达、创造、享受与从容的产出。",
  伤官: "我生之异阴阳。传统上对应锋芒、突破常规的表达与不服管束。",
  偏财: "我克之同阴阳。传统上对应流动的资源、机会与人脉经营。",
  正财: "我克之异阴阳。传统上对应稳定的积累、务实与责任感。",
  七杀: "克我之同阴阳。传统上对应压力、挑战、执行力与被要求。",
  正官: "克我之异阴阳。传统上对应规范、秩序、职位与社会期待。",
  偏印: "生我之同阴阳。传统上对应非主流的学问、直觉与独处思考。",
  正印: "生我之异阴阳。传统上对应学习、庇护、系统的知识与支持。",
};

/* ------------------------------------------------------------------
 * 主构建函数
 * ------------------------------------------------------------------ */

export function buildRuleReading(chart: BaziChart): ReadingSection[] {
  const sections: ReadingSection[] = [];
  const dm = chart.dayMaster;
  const profile = DAY_MASTER_PROFILE[dm.gan];

  /* --- 1. 命盘结构 --- */
  const monthPillar = chart.pillars.find((p) => p.label === "月");
  const pillarText = chart.pillars.map((p) => `${p.label}柱 ${p.ganZhi}`).join("、");

  sections.push({
    id: "structure",
    title: "命盘结构",
    subtitle: `${pillarText}　日主${dm.gan}${dm.element}`,
    paragraphs: [
      `日主为${dm.gan}${dm.element}（${dm.yinYang}），生于${monthPillar?.zhi ?? "?"}月。` +
        `在传统命理中，日干代表「我」，其余七字围绕它构成关系网络，` +
        `而月令（月支）权重最高，是判断整体气象的起点。`,
      `本盘五行计数（天干与地支本气各计一）为：` +
        WU_XING.map((e) => `${e} ${chart.elementCount[e]}`).join("、") +
        `。若计入地支藏干并加权，则为：` +
        WU_XING.map((e) => `${e} ${chart.elementScore[e].toFixed(1)}`).join("、") +
        `。两种算法口径不同，前者直观，后者更接近实际力量分布。`,
    ],
    note: "五行计数是确定性计算结果，可直接核对；对其含义的解读属于传统理论框架。",
  });

  /* --- 2. 日主气质 --- */
  if (profile) {
    sections.push({
      id: "day-master",
      title: "日主气象",
      subtitle: `${dm.gan}${dm.element}　象如${profile.image}`,
      paragraphs: [profile.traits, profile.shadow],
      note: "这是传统象义的语言转述，用于自我观察，不构成性格测评或心理诊断。",
    });
  }

  /* --- 3. 五行分布 --- */
  const strong = [...WU_XING].sort((a, b) => chart.elementScore[b] - chart.elementScore[a]);
  const top = strong[0];
  const weak = chart.missingElements;

  const elementParas: string[] = [];
  elementParas.push(
    `本盘${top}的力量最集中（加权 ${chart.elementScore[top].toFixed(1)}）。` +
      ELEMENT_DESC[top].trait,
  );

  if (weak.length > 0) {
    elementParas.push(
      `八字本气中不见${weak.join("、")}。传统上「缺」不等于「需要补」——` +
        `是否需要在结构上引入该行，取决于日主强弱与整体流通，不能仅凭缺失就下结论。` +
        `这一点常被商业话术简化成「缺什么补什么」，是不准确的。`,
    );
  } else {
    elementParas.push("五行本气俱全，无明显缺失。");
  }

  const balanced = strong[0];
  const weakest = strong[strong.length - 1];
  elementParas.push(
    `最弱的是${weakest}（加权 ${chart.elementScore[weakest].toFixed(1)}）。` +
      `${top}与${weakest}之间的落差为 ${(chart.elementScore[top] - chart.elementScore[weakest]).toFixed(1)}，` +
      (chart.elementScore[top] - chart.elementScore[weakest] > 3
        ? "结构上偏于一边，传统思路会关注「泄」与「引」的方向。"
        : "分布相对均匀，传统思路会关注「流通」而非「补缺」。"),
  );

  sections.push({
    id: "elements",
    title: "五行分布",
    subtitle: `最盛 ${top}　最弱 ${balanced === weakest ? "—" : weakest}`,
    paragraphs: elementParas,
    items: WU_XING.map((e) => ({
      label: `${e}　${chart.elementScore[e].toFixed(1)}`,
      text: ELEMENT_DESC[e].trait,
    })),
  });

  /* --- 4. 强弱与取用思路 --- */
  const s = chart.strength;
  const dmElement = dm.element;
  const drain = OVERCOMES[dmElement]; // 我克
  const output = GENERATED_BY[dmElement]; // 生我

  const advice =
    s.label === "偏强"
      ? `日主${s.label}（${s.score}/100）。传统取用思路偏向「泄」与「克」：` +
        `以我克之${OVERCOMES[dmElement]}、我生之${GENERATED_BY[dmElement]}为疏导方向，` +
        `让过盛的能量有出口，而不是继续叠加同类。`
      : s.label === "偏弱"
        ? `日主${s.label}（${s.score}/100）。传统取用思路偏向「生」与「扶」：` +
          `以生我之${GENERATED_BY[dmElement]}与同类${dmElement}为支撑方向，先稳住根基再谈发挥。`
        : `日主${s.label}（${s.score}/100），生扶与克泄大致相当。` +
          `传统思路会转而看流通与调候，而非简单补泻。`;

  sections.push({
    id: "strength",
    title: "旺衰与取用",
    subtitle: `${s.label}　综合 ${s.score}/100`,
    paragraphs: [
      advice,
      `三项依据：${s.factors.map((f) => `${f.key} ${f.value}`).join("；")}。`,
      s.factors.map((f) => f.detail).join(" "),
    ],
    note: s.method,
  });

  /* --- 5. 十神结构 --- */
  const tenGodEntries = Object.entries(chart.tenGodCount).sort((a, b) => b[1] - a[1]);
  if (tenGodEntries.length > 0) {
    const dominant = tenGodEntries[0];
    sections.push({
      id: "ten-gods",
      title: "十神结构",
      subtitle: `以${dominant[0]}为多（${dominant[1]}见）`,
      paragraphs: [
        `十神描述的是「我」与其他七字之间的关系类型。本盘中出现最多的是${dominant[0]}，` +
          `${TEN_GOD_MEANING[dominant[0]] ?? ""}`,
        `需要说明：十神的多寡本身不带吉凶，传统判断更看重它落在哪一柱、是否得地、有无制化。` +
          `单纯按「某个十神多就是好/坏」来解读，是把结构问题简化成了标签。`,
      ],
      items: tenGodEntries.map(([god, count]) => ({
        label: `${god}　${count}见`,
        text: TEN_GOD_MEANING[god] ?? "（暂无释义）",
      })),
    });
  }

  /* --- 6. 刑冲合会 --- */
  const rel = chart.relations;
  const relLines: string[] = [];
  if (rel.ganHe.length) relLines.push(`天干五合：${rel.ganHe.join("；")}`);
  if (rel.zhiChong.length) relLines.push(`地支六冲：${rel.zhiChong.join("；")}`);
  if (rel.zhiHe.length) relLines.push(`地支六合：${rel.zhiHe.join("；")}`);
  if (rel.sanHe.length) relLines.push(`地支三合：${rel.sanHe.join("；")}`);

  sections.push({
    id: "relations",
    title: "刑冲合会",
    paragraphs:
      relLines.length > 0
        ? [
            ...relLines,
            "冲与合是结构上的「动」与「合」。传统上认为冲主变动、合主牵连，" +
              "但变动本身无吉凶，需结合所涉十神与所在柱位判断。",
          ]
        : ["本盘四柱之间未见明显的天干五合、地支六冲、六合或三合。"],
    note: "此处仅列出结构关系，不做吉凶判断。",
  });

  /* --- 7. 大运 --- */
  if (chart.yun) {
    const y = chart.yun;
    const currentYear = new Date().getFullYear();
    const current = y.daYun.find(
      (d) => d.ganZhi && currentYear >= d.startYear && currentYear <= d.endYear,
    );
    const upcoming = y.daYun.filter((d) => d.ganZhi && d.startYear > currentYear).slice(0, 3);

    const paras: string[] = [
      `本盘大运${y.forward ? "顺" : "逆"}排，${y.startYear} 年 ${y.startMonth} 个月起运` +
        `（约 ${y.startSolar}）。起运时间由出生时刻到相邻节气的距离折算，` +
        `每三日折一年。`,
    ];

    if (current) {
      paras.push(
        `当前处于 ${current.ganZhi} 运（${current.startYear}–${current.endYear} 年，` +
          `${current.startAge}–${current.endAge} 岁）。该运天干为${current.ganZhi[0]}，` +
          `相对日主为${chart.pillars[0] ? getTenGodLabel(chart, current.ganZhi[0]) : ""}。`,
      );
    } else if (upcoming.length > 0) {
      paras.push(
        `尚未进入首运，接下来依次为：${upcoming
          .map((d) => `${d.ganZhi}（${d.startYear} 起）`)
          .join("、")}。`,
      );
    }

    paras.push(
      "传统上把大运看作十年一个的「环境背景」，流年则是其中的年度变化。" +
        "大运本身不决定事件，它描述的是这段时间里哪一类关系被放大。",
    );

    sections.push({
      id: "dayun",
      title: "大运流年",
      subtitle: current ? `当前 ${current.ganZhi} 运` : "尚未起运",
      paragraphs: paras,
      items: y.daYun
        .filter((d) => d.ganZhi)
        .map((d) => ({
          label: `${d.ganZhi}　${d.startYear}–${d.endYear}`,
          text: `${d.startAge}–${d.endAge} 岁　天干${d.ganZhi[0]}为${getTenGodLabel(
            chart,
            d.ganZhi[0],
          )}`,
        })),
      note: y.hourAssumed
        ? "时辰未知，起运时间以正午代入推算，实际可能有数月偏差。"
        : undefined,
    });
  }

  /* --- 8. 反思问题 --- */
  sections.push({
    id: "reflection",
    title: "可以问自己的问题",
    subtitle: "把术语翻译成自我观察的入口",
    paragraphs: [
      "命理提供的是观察自己的另一套词汇，不是答案。下面几个问题，" +
        "比任何「你会怎样」的断言更值得花时间。",
    ],
    items: [
      {
        label: `关于「${dm.gan}${dm.element}」的气质`,
        text: `你身边的人会怎么描述你的${profile?.image ?? "气质"}？` +
          `这种特质在什么场合帮过你，又在什么场合让你吃过亏？`,
      },
      {
        label: `关于${top}偏盛`,
        text: `${top}的能量在你生活里具体表现为什么？` +
          `是行动多、想法多，还是情绪多？它有没有挤占别的部分？`,
      },
      {
        label: "关于偏弱的部分",
        text: weak.length
          ? `你的盘里不见${weak.join("、")}。回想一下，你是否常常觉得缺了某种"说不清"的东西？那可能更接近什么？`
          : "五行俱全不代表平衡。你觉得哪一部分最容易被忽略？",
      },
      {
        label: `关于${s.label}`,
        text:
          s.label === "偏强"
            ? "当你有余力时，你倾向于继续加码，还是分给别人？"
            : s.label === "偏弱"
              ? "当你感到撑不住时，你会求助，还是硬扛？"
              : "你更常在「过度用力」和「用力不足」之间偏向哪一边？",
      },
    ],
    note: "这些问题没有标准答案，也不该由工具替你回答。",
  });

  return sections;
}

/** 取天干相对日主的十神名（用于大运/流年文案） */
export function getTenGodLabel(chart: BaziChart, gan: string): string {
  return getTenGod(chart.dayMaster.gan, gan);
}

/* 术语词典已拆分至 @/lib/glossary，此处保留再导出以兼容旧引用 */
export { GLOSSARY, searchGlossary, type GlossaryEntry } from "../glossary";
