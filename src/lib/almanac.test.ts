/**
 * 黄历与节气测试
 *
 * 断言的是「可查证的事实」：节气日期、农历日期、干支。
 * 宜忌属于传统通书整理，只测其存在性与非占位，不测「宜什么」是否正确——
 * 那是文献口径问题，没有唯一答案。
 */

import { describe, expect, it } from "vitest";
import { getAlmanac, getSolarTermsOfYear, SOLAR_TERMS, SOLAR_TERM_INTRO } from "./almanac";

describe("农历与干支", () => {
  const a = getAlmanac(new Date(2024, 1, 10)); // 2024-02-10 春节

  it("2024-02-10 为甲辰年正月初一", () => {
    expect(a.lunarParts).toMatchObject({ year: 2024, month: 1, day: 1, isLeap: false });
    expect(a.lunarText).toContain("正月初一");
  });

  it("干支按立春换年、节气定月", () => {
    expect(a.ganzhi.year).toBe("甲辰");
    expect(a.ganzhi.month).toBe("丙寅");
    expect(a.ganzhi.day).toBe("甲辰");
  });

  it("生肖随年柱（立春）", () => {
    expect(a.zodiac).toBe("龙");
  });

  it("识别节日", () => {
    expect(a.festivals).toContain("春节");
  });
});

describe("节气", () => {
  it("2024-02-04 为立春当日", () => {
    expect(getAlmanac(new Date(2024, 1, 4)).jieQi).toBe("立春");
  });

  it("2023-12-22 为冬至当日", () => {
    expect(getAlmanac(new Date(2023, 11, 22)).jieQi).toBe("冬至");
  });

  it("非节气日 jieQi 为空，并给出下一个节气", () => {
    const a = getAlmanac(new Date(2024, 1, 10));
    expect(a.jieQi).toBe("");
    expect(a.nextJieQi?.name).toBe("雨水");
    expect(a.nextJieQi?.date).toBe("2024-02-19");
    expect(a.nextJieQi?.daysAway).toBe(9);
  });

  it("下一个节气永远在未来", () => {
    for (const d of [new Date(2024, 0, 1), new Date(2024, 5, 15), new Date(2024, 11, 31)]) {
      const a = getAlmanac(d);
      expect(a.nextJieQi?.daysAway ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("年度二十四节气表", () => {
  const terms = getSolarTermsOfYear(2024);

  it("恰好 24 个节气", () => {
    expect(terms).toHaveLength(24);
    expect(new Set(terms.map((t) => t.name)).size).toBe(24);
  });

  it("按公历年内顺序排列", () => {
    for (let i = 1; i < terms.length; i++) {
      expect(terms[i].date > terms[i - 1].date).toBe(true);
    }
  });

  it("首尾为小寒与冬至", () => {
    expect(terms[0]).toMatchObject({ name: "小寒", date: "2024-01-06" });
    expect(terms[23]).toMatchObject({ name: "冬至", date: "2024-12-21" });
  });

  it("立春落在 2024-02-04", () => {
    expect(terms.find((t) => t.name === "立春")?.date).toBe("2024-02-04");
  });

  it("节气名全部落在标准二十四节气集合内", () => {
    for (const t of terms) {
      expect(SOLAR_TERMS.includes(t.name as never)).toBe(true);
    }
  });

  it("跨年边界（1 月 1 日 / 12 月 31 日）也能取到 24 个", () => {
    expect(getSolarTermsOfYear(2023)).toHaveLength(24);
    expect(getSolarTermsOfYear(2025)).toHaveLength(24);
  });

  it("每个节气都有简介文案", () => {
    for (const name of SOLAR_TERMS) {
      expect(SOLAR_TERM_INTRO[name]?.length ?? 0).toBeGreaterThanOrEqual(10);
    }
  });
});

describe("宜忌数据的性质", () => {
  const a = getAlmanac(new Date(2024, 5, 1));

  it("返回非空条目，而不是占位文案", () => {
    expect(a.yi.length).toBeGreaterThan(0);
    expect(a.ji.length).toBeGreaterThan(0);
    expect(a.yi.join("")).not.toContain("暂无");
  });

  it("同一天两次取值一致（无随机）", () => {
    const b = getAlmanac(new Date(2024, 5, 1));
    expect(b.yi).toEqual(a.yi);
    expect(b.ji).toEqual(a.ji);
  });

  it("彭祖百忌、冲煞、星宿均有内容", () => {
    expect(a.pengZu.length).toBeGreaterThan(0);
    expect(a.chong.length).toBeGreaterThan(0);
    expect(a.xiu.length).toBeGreaterThan(0);
  });
});
