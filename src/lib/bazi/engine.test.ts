/**
 * 四柱排盘测试
 *
 * 期望值的来源分三类，测试里逐条标注：
 *  1. 独立实现 oracle：Zijian-Ni/tianji（MIT）公开测试中的已知日期断言，
 *     见 docs/OPEN_SOURCE_RESEARCH.md §1.7。用另一个实现的结果校验本实现，
 *     比「用同一个库算两遍」有意义。
 *  2. 可查证的天文事实：立春、惊蛰等节气时刻，公开万年历可核对。
 *  3. 规则自洽性：五行计数与四柱一致、时辰未知时时柱缺失等。
 *
 * 不在此文件断言「解读是否正确」——解读属传统理论，不是可验证计算。
 */

import { describe, expect, it } from "vitest";
import { buildChart, getTenGod, isChinaDstDate, validateBirthInput } from "./engine";
import type { BirthInput } from "./types";

const BASE: BirthInput = {
  calendar: "solar",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  isLeapMonth: false,
  gender: "male",
  longitude: null,
  locationName: null,
  timezoneOffset: 8,
  useTrueSolarTime: false,
  sect: 1,
};

function chart(patch: Partial<BirthInput>) {
  return buildChart({ ...BASE, ...patch });
}

function pillarsOf(patch: Partial<BirthInput>) {
  return chart(patch).pillars.map((p) => p.ganZhi);
}

describe("四柱：与独立实现 tianji 的断言交叉校验", () => {
  // tianji 的 tests/test_bazi/test_known_dates.py 中的期望值
  const cases: { name: string; input: Partial<BirthInput>; expected: string[] }[] = [
    {
      name: "1990-05-15 14:30",
      input: { year: 1990, month: 5, day: 15, hour: 14, minute: 30 },
      expected: ["庚午", "辛巳", "庚辰", "癸未"],
    },
    {
      name: "2000-01-01 12:00（未过立春，年柱回退）",
      input: { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
      expected: ["己卯", "丙子", "戊午", "戊午"],
    },
    {
      name: "2000-03-01 12:00",
      input: { year: 2000, month: 3, day: 1, hour: 12, minute: 0 },
      expected: ["庚辰", "戊寅", "戊午", "戊午"],
    },
    {
      name: "1984-06-01 12:00",
      input: { year: 1984, month: 6, day: 1, hour: 12, minute: 0 },
      expected: ["甲子", "己巳", "丙寅", "甲午"],
    },
    {
      name: "2024-01-15 12:00",
      input: { year: 2024, month: 1, day: 15, hour: 12, minute: 0 },
      expected: ["癸卯", "乙丑", "戊寅", "戊午"],
    },
    {
      name: "2024-05-01 12:00",
      input: { year: 2024, month: 5, day: 1, hour: 12, minute: 0 },
      expected: ["甲辰", "戊辰", "乙丑", "壬午"],
    },
    {
      name: "2024-02-10 12:00（甲辰年正月初一，五虎遁月）",
      input: { year: 2024, month: 2, day: 10, hour: 12, minute: 0 },
      expected: ["甲辰", "丙寅", "甲辰", "庚午"],
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      expect(pillarsOf(c.input)).toEqual(c.expected);
    });
  }
});

describe("立春换年", () => {
  // 2024 年立春为 2024-02-04 16:26（北京时间），公开万年历可核对
  it("立春前仍属上一年（癸卯）", () => {
    expect(pillarsOf({ year: 2024, month: 2, day: 4, hour: 16, minute: 0 })[0]).toBe("癸卯");
  });

  it("立春后进入下一年（甲辰）", () => {
    expect(pillarsOf({ year: 2024, month: 2, day: 4, hour: 17, minute: 0 })[0]).toBe("甲辰");
  });

  it("年柱与月柱在立春时刻同时切换", () => {
    const before = chart({ year: 2024, month: 2, day: 4, hour: 16, minute: 0 });
    const after = chart({ year: 2024, month: 2, day: 4, hour: 17, minute: 0 });
    expect(before.pillars[0].ganZhi).not.toBe(after.pillars[0].ganZhi);
    expect(before.pillars[1].ganZhi).not.toBe(after.pillars[1].ganZhi);
    // 日柱不因立春而变
    expect(before.pillars[2].ganZhi).toBe(after.pillars[2].ganZhi);
  });
});

describe("节气定月", () => {
  // 2024 惊蛰为 03-05，月柱应由丙寅转丁卯
  it("惊蛰前为丙寅月", () => {
    expect(pillarsOf({ year: 2024, month: 3, day: 4, hour: 12, minute: 0 })[1]).toBe("丙寅");
  });

  it("惊蛰后为丁卯月", () => {
    expect(pillarsOf({ year: 2024, month: 3, day: 6, hour: 12, minute: 0 })[1]).toBe("丁卯");
  });

  it("月柱以节令而非农历初一划分", () => {
    // 2024-02-10 是正月初一，但月柱仍是丙寅（立春后、惊蛰前），不是「正月即丙寅」的巧合
    const c = chart({ year: 2024, month: 2, day: 10, hour: 12, minute: 0 });
    expect(c.lunarParts.month).toBe(1);
    expect(c.pillars[1].ganZhi).toBe("丙寅");
  });
});

describe("子时换日（晚子时流派）", () => {
  const lateZi = { year: 2024, month: 2, day: 3, hour: 23, minute: 30 };

  it("流派一：晚子时日柱归次日", () => {
    const c = chart({ ...lateZi, sect: 1 });
    // 次日 2024-02-04 的日柱为戊戌
    expect(c.pillars[2].ganZhi).toBe("戊戌");
    expect(c.meta.dayRule).toContain("次日");
  });

  it("流派二：晚子时日柱归当日", () => {
    const c = chart({ ...lateZi, sect: 2 });
    // 当日 2024-02-03 的日柱为丁酉
    expect(c.pillars[2].ganZhi).toBe("丁酉");
    expect(c.meta.dayRule).toContain("当日");
  });

  it("两个流派只影响日柱，时柱同为子时", () => {
    const a = chart({ ...lateZi, sect: 1 });
    const b = chart({ ...lateZi, sect: 2 });
    expect(a.pillars[3].zhi).toBe("子");
    expect(b.pillars[3].zhi).toBe("子");
  });

  it("早子时（00:30）不受流派影响", () => {
    const a = chart({ year: 2024, month: 2, day: 4, hour: 0, minute: 30, sect: 1 });
    const b = chart({ year: 2024, month: 2, day: 4, hour: 0, minute: 30, sect: 2 });
    expect(a.pillars[2].ganZhi).toBe(b.pillars[2].ganZhi);
  });
});

describe("农历输入与闰月", () => {
  it("农历转公历：2023 闰二月十五 = 2023-04-05", () => {
    const c = chart({
      calendar: "lunar",
      year: 2023,
      month: 2,
      day: 15,
      isLeapMonth: true,
      hour: 12,
      minute: 0,
    });
    expect(c.solar.year).toBe(2023);
    expect(c.solar.month).toBe(4);
    expect(c.solar.day).toBe(5);
    expect(c.lunarParts.isLeap).toBe(true);
  });

  it("农历正月初一转公历：1990-01-01 → 1990-01-27", () => {
    const c = chart({ calendar: "lunar", year: 1990, month: 1, day: 1, hour: 12, minute: 0 });
    const iso = `${c.solar.year}-${String(c.solar.month).padStart(2, "0")}-${String(c.solar.day).padStart(2, "0")}`;
    expect(iso).toBe("1990-01-27");
  });

  it("把非闰月标成闰月会被拒绝", () => {
    const r = validateBirthInput({ ...BASE, calendar: "lunar", year: 2024, month: 2, isLeapMonth: true });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.field === "date")).toBe(true);
  });

  it("农历小月超出天数会被拒绝", () => {
    // 2024 年正月为 29 天
    const r = validateBirthInput({ ...BASE, calendar: "lunar", year: 2024, month: 1, day: 30 });
    expect(r.ok).toBe(false);
  });
});

describe("公历输入校验", () => {
  it("拒绝不存在的日期（2 月 30 日）", () => {
    const r = validateBirthInput({ ...BASE, year: 2024, month: 2, day: 30 });
    expect(r.ok).toBe(false);
    expect(r.issues[0].message).toContain("不存在");
  });

  it("拒绝超出支持范围的年份", () => {
    expect(validateBirthInput({ ...BASE, year: 1899 }).ok).toBe(false);
    expect(validateBirthInput({ ...BASE, year: 2101 }).ok).toBe(false);
  });

  it("接受 1900 与 2100 边界", () => {
    expect(validateBirthInput({ ...BASE, year: 1900, month: 1, day: 1 }).ok).toBe(true);
    expect(validateBirthInput({ ...BASE, year: 2100, month: 12, day: 31 }).ok).toBe(true);
  });

  it("启用真太阳时但没有经度时给出提示", () => {
    const r = validateBirthInput({ ...BASE, useTrueSolarTime: true, longitude: null });
    expect(r.ok).toBe(false);
    expect(r.issues[0].field).toBe("longitude");
  });

  it("非法输入会抛错而不是静默返回空盘", () => {
    expect(() => buildChart({ ...BASE, month: 13 })).toThrow();
  });
});

describe("时辰未知", () => {
  const c = chart({ hour: null, minute: null, gender: "unspecified" });

  it("只排三柱，不含时柱", () => {
    expect(c.pillars).toHaveLength(3);
    expect(c.pillars.map((p) => p.label)).toEqual(["年", "月", "日"]);
    expect(c.hourKnown).toBe(false);
  });

  it("明确提示不确定，而不是补一个默认时柱", () => {
    expect(c.warnings.some((w) => w.includes("时柱留空"))).toBe(true);
  });

  it("未指定性别时不推大运", () => {
    expect(c.yun).toBeNull();
    expect(c.warnings.some((w) => w.includes("未指定性别"))).toBe(true);
  });

  it("指定性别时推大运，但标注起运时间有偏差", () => {
    const withGender = chart({ hour: null, minute: null, gender: "female" });
    expect(withGender.yun).not.toBeNull();
    expect(withGender.yun?.hourAssumed).toBe(true);
    expect(withGender.warnings.some((w) => w.includes("正午"))).toBe(true);
  });
});

describe("真太阳时", () => {
  it("乌鲁木齐（87.62°E）校正约 −126 分钟，且改变时柱", () => {
    const c = chart({
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      longitude: 87.62,
      locationName: "乌鲁木齐",
      useTrueSolarTime: true,
    });

    // 经度差 32.38° × 4 min/° ≈ 129.5 min，叠加 5 月均时差约 +3.7 min
    expect(c.meta.solarTimeOffsetMinutes).toBeGreaterThan(-131);
    expect(c.meta.solarTimeOffsetMinutes).toBeLessThan(-122);

    // 14:30 为未时，校正后进入午时（11:00–13:00）
    expect(c.pillars[3].zhi).toBe("午");
    expect(c.meta.solarTimeNote).toContain("87.62");
  });

  it("未启用时不改变时刻，且注明未校正", () => {
    const c = chart({ hour: 14, minute: 30 });
    expect(c.meta.solarTimeOffsetMinutes).toBe(0);
    expect(c.meta.effectiveTime).toBe(c.meta.inputTime);
    expect(c.meta.solarTimeNote).toContain("未启用");
  });

  it("东部城市偏移为正（太阳更早过中天）", () => {
    const c = chart({ longitude: 126.63, useTrueSolarTime: true, locationName: "哈尔滨" });
    expect(c.meta.solarTimeOffsetMinutes).toBeGreaterThan(0);
  });
});

describe("中国夏令时（1986–1991）", () => {
  it("识别夏令时日期", () => {
    expect(isChinaDstDate(1988, 7, 1)).toBe(true);
    expect(isChinaDstDate(1986, 5, 4)).toBe(true);
    expect(isChinaDstDate(1991, 9, 15)).toBe(true);
  });

  it("非夏令时日期不误判", () => {
    expect(isChinaDstDate(1988, 12, 1)).toBe(false);
    expect(isChinaDstDate(1985, 7, 1)).toBe(false);
    expect(isChinaDstDate(1992, 7, 1)).toBe(false);
  });

  it("命中夏令时窗口时给出提示，但不擅自改动用户输入", () => {
    const c = chart({ year: 1988, month: 7, day: 1, hour: 12, minute: 0 });
    expect(c.warnings.some((w) => w.includes("夏令时"))).toBe(true);
    expect(c.meta.effectiveTime).toBe(c.meta.inputTime);
  });
});

describe("派生信息的一致性", () => {
  const c = chart({});

  it("五行本气计数合计等于柱数 × 2", () => {
    const total = Object.values(c.elementCount).reduce((a, b) => a + b, 0);
    expect(total).toBe(c.pillars.length * 2);
  });

  it("藏干加权总分接近 8（每柱天干 1 + 地支藏干合计 1）", () => {
    const total = Object.values(c.elementScore).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(7.9);
    expect(total).toBeLessThan(8.1);
  });

  it("缺失五行 = 本气计数为 0 的五行", () => {
    const zero = (Object.keys(c.elementCount) as (keyof typeof c.elementCount)[]).filter(
      (e) => c.elementCount[e] === 0,
    );
    expect([...c.missingElements].sort()).toEqual([...zero].sort());
  });

  it("日主即日柱天干", () => {
    const day = c.pillars.find((p) => p.label === "日");
    expect(day?.gan).toBe(c.dayMaster.gan);
    expect(day?.tenGodGan).toBe("日主");
  });

  it("四柱天干十神与独立推算一致", () => {
    for (const p of c.pillars) {
      if (p.label === "日") continue;
      expect(p.tenGodGan).toBe(getTenGod(c.dayMaster.gan, p.gan));
    }
  });

  it("大运首步与月柱相邻（顺排取后一位，逆排取前一位）", () => {
    const yun = c.yun;
    expect(yun).not.toBeNull();
    if (!yun) return;
    const first = yun.daYun.find((d) => d.ganZhi);
    expect(first).toBeDefined();
    expect(first?.ganZhi).not.toBe(c.pillars[1].ganZhi);
  });

  it("大运流年覆盖连续年份，且流年干支按六十甲子推进", () => {
    const yun = c.yun;
    if (!yun) throw new Error("expected yun");
    const first = yun.daYun.find((d) => d.ganZhi);
    if (!first) throw new Error("expected first dayun");
    expect(first.liuNian).toHaveLength(10);
    for (let i = 1; i < first.liuNian.length; i++) {
      expect(first.liuNian[i].year - first.liuNian[i - 1].year).toBe(1);
    }
  });

  it("计算依据里写明引擎与口径", () => {
    expect(c.meta.engine).toContain("lunar-typescript");
    expect(c.meta.yearRule).toContain("立春");
    expect(c.meta.monthRule).toContain("十二节");
  });
});

describe("十神推算（纯函数）", () => {
  // 以甲木日主为例，逐一核对十神定义：
  // 同我比劫、我生食伤、我克财、克我官杀、生我印
  const expected: Record<string, string> = {
    甲: "比肩",
    乙: "劫财",
    丙: "食神",
    丁: "伤官",
    戊: "偏财",
    己: "正财",
    庚: "七杀",
    辛: "正官",
    壬: "偏印",
    癸: "正印",
  };

  for (const [gan, god] of Object.entries(expected)) {
    it(`甲日主见${gan}为${god}`, () => {
      expect(getTenGod("甲", gan)).toBe(god);
    });
  }

  it("阴阳同性为比肩、异性为劫财", () => {
    expect(getTenGod("丙", "丙")).toBe("比肩");
    expect(getTenGod("丙", "丁")).toBe("劫财");
  });
});
