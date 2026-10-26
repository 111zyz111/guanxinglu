/**
 * 起卦算法测试
 *
 * 起卦是确定性算法（除铜钱的随机落面本身），因此可以逐项核对：
 * 取数规则 → 上下卦 → 动爻 → 变卦。测试不涉及「解卦是否正确」，
 * 那是解释问题，不是计算问题。
 */

import { describe, expect, it } from "vitest";
import {
  castByCoins,
  castByNumbers,
  castByTime,
  formatCastTitle,
  hexagramByLines,
  hexagramByTrigrams,
  hexagramSymbol,
  hourBranchNumber,
  branchNumber,
  trigramByNumber,
} from "./casting";
import { HEXAGRAMS } from "./hexagrams";

describe("八卦取数", () => {
  it("先天数为 乾1 兑2 离3 震4 巽5 坎6 艮7 坤8", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8].map((n) => trigramByNumber(n).name)).toEqual([
      "乾",
      "兑",
      "离",
      "震",
      "巽",
      "坎",
      "艮",
      "坤",
    ]);
  });

  it("余数为 0 时按 8 计（坤）", () => {
    expect(trigramByNumber(0).name).toBe("坤");
    expect(trigramByNumber(16).name).toBe("坤");
  });

  it("超出 8 的数按循环取余", () => {
    expect(trigramByNumber(9).name).toBe("乾");
    expect(trigramByNumber(17).name).toBe("乾");
  });
});

describe("时辰序数", () => {
  it("子时跨日：23 点与 0 点同属子（1）", () => {
    expect(hourBranchNumber(23)).toBe(1);
    expect(hourBranchNumber(0)).toBe(1);
  });

  it("两小时一辰，依次推进", () => {
    expect(hourBranchNumber(1)).toBe(2); // 丑
    expect(hourBranchNumber(3)).toBe(3); // 寅
    expect(hourBranchNumber(5)).toBe(4); // 卯
    expect(hourBranchNumber(11)).toBe(7); // 午
    expect(hourBranchNumber(22)).toBe(12); // 亥
  });

  it("地支转序数", () => {
    expect(branchNumber("子")).toBe(1);
    expect(branchNumber("亥")).toBe(12);
  });
});

describe("梅花易数 · 时间起卦", () => {
  // 年支 1 + 月 1 + 日 1 = 3 → 上卦 离
  // 3 + 时支 1 = 4 → 下卦 震；4 ÷ 6 余 4 → 第 4 爻动
  const r = castByTime({ yearBranchNumber: 1, month: 1, day: 1, hourBranchNumber: 1 });

  it("上卦取下余数对应的卦", () => {
    expect(r.original.upper).toBe("离");
    expect(r.original.lower).toBe("震");
    expect(r.original.name).toBe("噬嗑");
  });

  it("动爻为总和除 6 的余数", () => {
    expect(r.movingLines).toEqual([4]);
  });

  it("变卦为动爻阴阳翻转后的卦", () => {
    expect(r.changed?.name).toBe("頤");
    expect(r.changedLines?.[3]).toBe(r.originalLines[3] === 1 ? 0 : 1);
  });

  it("过程记录包含每一步算式", () => {
    const labels = r.trace.steps.map((s) => s.label);
    expect(labels.length).toBeGreaterThanOrEqual(5);
    expect(r.trace.steps.some((s) => s.value.includes("余 4"))).toBe(true);
  });

  it("同一组取数结果完全一致（不是随机）", () => {
    const again = castByTime({ yearBranchNumber: 1, month: 1, day: 1, hourBranchNumber: 1 });
    expect(again.originalLines).toEqual(r.originalLines);
    expect(again.movingLines).toEqual(r.movingLines);
  });
});

describe("数字起卦", () => {
  it("8 与 8 → 坤为地，第 4 爻动，变雷地豫", () => {
    const r = castByNumbers(8, 8);
    expect(r.original.name).toBe("坤");
    expect(r.movingLines).toEqual([4]);
    expect(r.changed?.name).toBe("豫");
  });

  it("余 0 按 8 计，不落到空卦", () => {
    const r = castByNumbers(16, 24);
    expect(r.original.name).toBe("坤");
  });

  it("拒绝非正整数", () => {
    expect(() => castByNumbers(0, 5)).toThrow();
    expect(() => castByNumbers(-1, 5)).toThrow();
    expect(() => castByNumbers(1.5, 5)).toThrow();
  });

  it("动爻由两数之和决定", () => {
    const r = castByNumbers(7, 9); // 和 16，余 4
    expect(r.movingLines).toEqual([4]);
  });
});

describe("铜钱摇卦", () => {
  it("三背为老阳（9），阳爻且动", () => {
    const r = castByCoins([
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ]);
    expect(r.trace.throws?.[0]).toMatchObject({ value: 9, yinYang: "阳", moving: true });
    expect(r.originalLines[0]).toBe(1);
    expect(r.movingLines).toContain(1);
  });

  it("三字为老阴（6），阴爻且动", () => {
    const r = castByCoins([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ]);
    expect(r.trace.throws?.[0]).toMatchObject({ value: 6, yinYang: "阴", moving: true });
    expect(r.originalLines[0]).toBe(0);
  });

  it("一背两字为少阳（7），阳爻不动", () => {
    const r = castByCoins([
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
    ]);
    expect(r.trace.throws?.[0]).toMatchObject({ value: 7, moving: false });
    expect(r.movingLines).toEqual([]);
    expect(r.changed).toBeNull();
    expect(r.changedLines).toBeNull();
  });

  it("两背一字为少阴（8），阴爻不动", () => {
    const r = castByCoins([
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 0],
    ]);
    expect(r.trace.throws?.[0]).toMatchObject({ value: 8, yinYang: "阴", moving: false });
    expect(r.originalLines.every((l) => l === 0)).toBe(true);
    expect(r.original.name).toBe("坤");
  });

  it("六爻皆老阳为乾，六爻皆动则变为坤", () => {
    const r = castByCoins(Array.from({ length: 6 }, () => [1, 1, 1]));
    expect(r.original.name).toBe("乾");
    expect(r.movingLines).toEqual([1, 2, 3, 4, 5, 6]);
    expect(r.changed?.name).toBe("坤");
  });

  it("摇卦次数或铜钱数不对时报错", () => {
    expect(() => castByCoins([[1, 1, 1]])).toThrow();
    expect(() => castByCoins(Array.from({ length: 6 }, () => [1, 1]))).toThrow();
  });
});

describe("卦象数据完整性（64 卦）", () => {
  it("共 64 卦，卦序连续无重复", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    expect(new Set(HEXAGRAMS.map((h) => h.no)).size).toBe(64);
    expect(Math.min(...HEXAGRAMS.map((h) => h.no))).toBe(1);
    expect(Math.max(...HEXAGRAMS.map((h) => h.no))).toBe(64);
  });

  it("每卦六爻，且六爻组合唯一", () => {
    for (const h of HEXAGRAMS) {
      expect(h.lines).toHaveLength(6);
      expect(h.lines.every((v) => v === 0 || v === 1)).toBe(true);
    }
    expect(new Set(HEXAGRAMS.map((h) => h.lines.join(""))).size).toBe(64);
  });

  it("爻象与上下卦名一致", () => {
    for (const h of HEXAGRAMS) {
      const found = hexagramByTrigrams(h.lower, h.upper);
      expect(found?.no, `${h.name} 的上下卦与爻象不一致`).toBe(h.no);
    }
  });

  it("爻辞数量为 6（乾坤含用九用六则为 7）", () => {
    for (const h of HEXAGRAMS) {
      if (h.no === 1 || h.no === 2) expect(h.yaoci).toHaveLength(7);
      else expect(h.yaoci).toHaveLength(6);
    }
  });

  it("卦辞与卦旨不为空", () => {
    for (const h of HEXAGRAMS) {
      expect(h.guaci.length).toBeGreaterThan(0);
      expect(h.plain.length).toBeGreaterThan(0);
      expect(h.theme.length).toBeGreaterThan(0);
    }
  });

  it("由六爻可反查回同一卦", () => {
    for (const h of HEXAGRAMS) {
      expect(hexagramByLines(h.lines)?.no).toBe(h.no);
    }
  });
});

describe("卦象符号与题名", () => {
  it("Unicode 卦符按通行本卦序排列", () => {
    expect(hexagramSymbol(1)).toBe("䷀"); // 乾
    expect(hexagramSymbol(2)).toBe("䷁"); // 坤
    expect(hexagramSymbol(64)).toBe("䷿"); // 未济
  });

  it("有动爻时为「本卦之变卦」", () => {
    const r = castByNumbers(8, 8);
    expect(formatCastTitle(r)).toBe("坤之豫");
  });

  it("无动爻时标注静卦", () => {
    const r = castByCoins(Array.from({ length: 6 }, () => [1, 0, 0]));
    expect(r.changed).toBeNull();
    expect(formatCastTitle(r)).toBe("乾（静卦）");
  });
});
