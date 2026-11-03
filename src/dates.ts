// Tarih yardımcıları (cihazın yerel saatine göre)
import type { DailyDone } from './types';

export const keyOf = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const todayKey = () => keyOf(new Date());

// Aynı gün için hep aynı sayı: günlük bulmacanın tohumu
export const seedFromKey = (k: string): number => parseInt(k.replace(/-/g, ''), 10);

// Bugün (ya da bugün yoksa dün) dahil, üst üste kaç gün tamamlandı
export function currentStreak(done: DailyDone): number {
  const d = new Date();
  if (!done[keyOf(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (done[keyOf(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function longestStreak(done: DailyDone): number {
  const keys = Object.keys(done).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const [y, m, d] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev) {
      const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

const LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// İçinde bulunulan haftanın 7 günü (Pazartesi ile başlar)
export function weekDays() {
  const today = new Date();
  const idx = (today.getDay() + 6) % 7;
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - idx + i);
    out.push({ key: keyOf(d), label: LABELS[i], day: d.getDate(), isToday: i === idx });
  }
  return out;
}

export const fmtTime = (s: number | null): string =>
  s == null
    ? '--:--'
    : `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
