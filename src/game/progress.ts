// Biten oyunu istatistiklere, günlük seriye ve başarımlara işler.
import { ACHIEVEMENTS } from '../achievements';
import { longestStreak } from '../dates';
import type { DailyData, FinishResult, GameOutcome, LevelStats, Stats } from '../types';

const emptyLevel = (): LevelStats => ({ played: 0, won: 0, best: null });

export const emptyStats = (): Stats => ({
  played: 0,
  won: 0,
  bestTime: null,
  levels: { easy: emptyLevel(), medium: emptyLevel(), hard: emptyLevel(), expert: emptyLevel() },
  unlocked: {},
});

export function recordResult(
  stats: Stats,
  daily: DailyData,
  res: GameOutcome,
): FinishResult & { stats: Stats; daily: DailyData } {
  const st: Stats = JSON.parse(JSON.stringify(stats));
  const lv = st.levels[res.level];
  const prevBest = lv.best;
  st.played += 1;
  lv.played += 1;
  if (res.won) {
    st.won += 1;
    lv.won += 1;
    if (st.bestTime == null || res.seconds < st.bestTime) st.bestTime = res.seconds;
    if (lv.best == null || res.seconds < lv.best) lv.best = res.seconds;
  }

  let nextDaily = daily;
  if (res.won && res.mode === 'daily' && res.dateKey) {
    nextDaily = { ...daily, done: { ...daily.done, [res.dateKey]: { seconds: res.seconds } } };
  }

  const run = {
    ...res,
    longest: longestStreak(nextDaily.done),
    dailyCount: Object.keys(nextDaily.done).length,
  };
  const newly = ACHIEVEMENTS.filter((a) => !st.unlocked[a.id] && a.check(st, run)).map((a) => a.id);
  newly.forEach((id) => {
    st.unlocked[id] = true;
  });
  return { stats: st, daily: nextDaily, newly, record: res.won && (prevBest == null || res.seconds < prevBest) };
}
