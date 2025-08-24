export function getCurrentWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

export function addTodayToWeek(): void {
  try {
    const key = `learning:week:${getCurrentWeekKey()}`;
    const raw = localStorage.getItem(key);
    const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    const today = new Date();
    const day = today.toISOString().slice(0, 10);
    set.add(day);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getWeekCount(): number {
  try {
    const key = `learning:week:${getCurrentWeekKey()}`;
    const raw = localStorage.getItem(key);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function setLastProgressDate(dateIso: string): void {
  try {
    localStorage.setItem('learning:lastProgressDate', dateIso);
  } catch {}
}

export function getLastProgressDate(): string | null {
  try {
    return localStorage.getItem('learning:lastProgressDate');
  } catch {
    return null;
  }
}

export function isSkipDay(today = new Date()): boolean {
  try {
    const last = getLastProgressDate();
    if (!last) return false;
    const lastDate = new Date(last);
    const diff = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
    return diff >= 2; // 1日以上空いたら gentle message
  } catch {
    return false;
  }
}
