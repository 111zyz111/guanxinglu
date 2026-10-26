/**
 * 本地存储
 *
 * 隐私原则：
 *  - 出生信息、排盘结果、卦象全部只存在浏览器 localStorage，不上传服务器
 *  - 调用 AI 时只发送「已经计算好的命盘结构」，不发送姓名等身份信息
 *  - 用户可随时在「记录」页删除单条或全部
 *  - 若浏览器禁用 localStorage，所有功能仍可用，只是不保存历史
 */

import type { BirthInput } from "./bazi/types";

const HISTORY_KEY = "gxl.history.v1";
const SETTINGS_KEY = "gxl.settings.v1";
const MAX_RECORDS = 60;

export interface HistoryRecord {
  id: string;
  type: "bazi" | "yijing";
  createdAt: number;
  /** 列表标题，如「1990-05-15 14:30」或「乾之姤」 */
  title: string;
  /** 一句话摘要 */
  summary: string;
  /** 回看链接（含完整参数，可直接分享） */
  href: string;
  /** 八字：出生信息；易经：起卦记录 */
  payload: unknown;
}

export interface AppSettings {
  /** 默认子时换日流派 */
  defaultSect: 1 | 2;
  /** 默认是否启用真太阳时 */
  defaultTrueSolarTime: boolean;
  /** 是否保存历史记录 */
  persistHistory: boolean;
  /** 结果页默认展开「计算依据」 */
  showMetaByDefault: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultSect: 1,
  defaultTrueSolarTime: false,
  persistHistory: true,
  showMetaByDefault: false,
};

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    // 配额满或隐私模式禁用
    return false;
  }
}

/* ------------------------------ 历史记录 ------------------------------ */

export function loadHistory(): HistoryRecord[] {
  const raw = safeGet(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is HistoryRecord =>
        !!r && typeof r.id === "string" && typeof r.createdAt === "number",
    );
  } catch {
    return [];
  }
}

export function saveRecord(record: Omit<HistoryRecord, "id" | "createdAt">): HistoryRecord | null {
  const settings = loadSettings();
  if (!settings.persistHistory) return null;

  const list = loadHistory();

  // 去重：同一 href 在 10 分钟内重复访问不重复记录
  const top = list[0];
  if (top && top.href === record.href && Date.now() - top.createdAt < 10 * 60 * 1000) {
    return top;
  }

  const full: HistoryRecord = {
    ...record,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };

  const next = [full, ...list.filter((r) => r.href !== record.href)].slice(0, MAX_RECORDS);
  const ok = safeSet(HISTORY_KEY, JSON.stringify(next));
  return ok ? full : null;
}

export function deleteRecord(id: string): HistoryRecord[] {
  const list = loadHistory().filter((r) => r.id !== id);
  safeSet(HISTORY_KEY, JSON.stringify(list));
  return list;
}

export function clearHistory(): void {
  safeSet(HISTORY_KEY, JSON.stringify([]));
}

export function getRecord(id: string): HistoryRecord | undefined {
  return loadHistory().find((r) => r.id === id);
}

/* ------------------------------ 设置 ------------------------------ */

export function loadSettings(): AppSettings {
  const raw = safeGet(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  safeSet(SETTINGS_KEY, JSON.stringify(settings));
}

/* ------------------------------ 工具 ------------------------------ */

/** 判断本地存储是否可用（用于设置页提示） */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "__gxl_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/** 估算占用空间（字节） */
export function estimateStorageSize(): number {
  const raw = safeGet(HISTORY_KEY) ?? "";
  return new Blob([raw]).size;
}

/** 把出生信息编码为 URL 参数，便于分享与刷新还原 */
export function encodeBirthInput(input: BirthInput): string {
  const p = new URLSearchParams();
  p.set("cal", input.calendar);
  p.set("y", String(input.year));
  p.set("m", String(input.month));
  p.set("d", String(input.day));
  if (input.hour !== null) {
    p.set("h", String(input.hour));
    p.set("mi", String(input.minute ?? 0));
  }
  if (input.isLeapMonth) p.set("leap", "1");
  p.set("g", input.gender);
  if (input.longitude !== null) p.set("lon", String(input.longitude));
  if (input.locationName) p.set("loc", input.locationName);
  p.set("tz", String(input.timezoneOffset));
  if (input.useTrueSolarTime) p.set("tst", "1");
  p.set("sect", String(input.sect));
  return p.toString();
}

export function decodeBirthInput(search: string): BirthInput | null {
  const p = new URLSearchParams(search);
  const y = Number(p.get("y"));
  const m = Number(p.get("m"));
  const d = Number(p.get("d"));
  if (!y || !m || !d) return null;

  const hRaw = p.get("h");
  const lonRaw = p.get("lon");
  const g = p.get("g");
  const cal = p.get("cal");
  const sect = Number(p.get("sect"));

  return {
    calendar: cal === "lunar" ? "lunar" : "solar",
    year: y,
    month: m,
    day: d,
    hour: hRaw === null ? null : Number(hRaw),
    minute: hRaw === null ? null : Number(p.get("mi") ?? 0),
    isLeapMonth: p.get("leap") === "1",
    gender: g === "male" || g === "female" ? g : "unspecified",
    longitude: lonRaw === null ? null : Number(lonRaw),
    locationName: p.get("loc"),
    timezoneOffset: Number(p.get("tz") ?? 8),
    useTrueSolarTime: p.get("tst") === "1",
    sect: sect === 2 ? 2 : 1,
  };
}
