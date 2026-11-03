import type { Achievement } from './types';

// Başarımlar. check(stats, ctx): stats = genel istatistik, ctx = biten oyunun bilgisi
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', title: 'İlk Adım', desc: 'İlk oyununu bitir.', icon: 'flag', check: (s) => s.played >= 1 },
  { id: 'first_win', title: 'İlk Zafer', desc: 'Bir bulmacayı çöz.', icon: 'star', check: (s) => s.won >= 1 },
  { id: 'win10', title: '10 Zafer', desc: '10 bulmaca çöz.', icon: 'trophy', check: (s) => s.won >= 10 },
  { id: 'win50', title: '50 Zafer', desc: '50 bulmaca çöz.', icon: 'medal', check: (s) => s.won >= 50 },
  { id: 'perfect', title: 'Kusursuz', desc: 'Hiç hata yapmadan bir bulmaca çöz.', icon: 'shield-checkmark', check: (s, x) => x.won && x.mistakes === 0 },
  { id: 'nohint', title: 'Kendi Aklım', desc: 'İpucu kullanmadan bir bulmaca çöz.', icon: 'bulb', check: (s, x) => x.won && x.hints === 0 },
  { id: 'fast', title: 'Hızlı Parmaklar', desc: 'Orta veya üstü bir bulmacayı 5 dakikadan kısa sürede çöz.', icon: 'flash', check: (s, x) => x.won && x.seconds < 300 && x.level !== 'easy' },
  { id: 'hard', title: 'Zor Bulmaca', desc: 'Zor seviyede bir bulmaca çöz.', icon: 'flame', check: (s, x) => x.won && x.level === 'hard' },
  { id: 'expert', title: 'Uzman', desc: 'Uzman seviyede bir bulmaca çöz.', icon: 'diamond', check: (s, x) => x.won && x.level === 'expert' },
  { id: 'daily1', title: 'Günlük Başlangıç', desc: 'İlk günlük mücadeleni tamamla.', icon: 'calendar', check: (s, x) => x.dailyCount >= 1 },
  { id: 'streak3', title: '3 Gün Seri', desc: 'Günlük mücadeleyi 3 gün üst üste tamamla.', icon: 'ribbon', check: (s, x) => x.longest >= 3 },
  { id: 'streak7', title: '7 Gün Seri', desc: 'Günlük mücadeleyi 7 gün üst üste tamamla.', icon: 'rocket', check: (s, x) => x.longest >= 7 },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
