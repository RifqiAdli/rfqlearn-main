import type { SessionRecord, AppSettings } from "@/types/rfqlearn";

const HISTORY_KEY = "rfqlearn_history";
const SETTINGS_KEY = "rfqlearn_settings";

const DEFAULT_SETTINGS: AppSettings = { name: "", defaultLang: "id" };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getHistory(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse<SessionRecord[]>(localStorage.getItem(HISTORY_KEY), []);
}

export function saveSession(session: SessionRecord) {
  const all = getHistory();
  all.unshift(session);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
}

export function deleteSession(id: string) {
  const all = getHistory().filter((s) => s.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...safeParse<Partial<AppSettings>>(localStorage.getItem(SETTINGS_KEY), {}) };
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function computeStreak(history: SessionRecord[]): number {
  if (!history.length) return 0;
  const days = new Set(history.map((s) => new Date(s.date).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
