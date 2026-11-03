import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyStats } from './game/progress';
import type { DailyData, GameMode, Profile, SavedGame, Settings, Stats } from './types';

const K = {
  profile: 'sudoku_profile_v1',
  settings: 'sudoku_settings_v1',
  stats: 'sudoku_stats_v1',
  daily: 'sudoku_daily_v1',
  game: 'sudoku_game_v2',
  dailyGame: 'sudoku_game_daily_v1',
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  boardColor: '#1F6BF5',
  haptics: true,
  autoNotes: false,
  lessons: {},
  lessonsSeen: false,
};

export const DEFAULT_STATS: Stats = emptyStats();

export const DEFAULT_DAILY: DailyData = { done: {} };

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function loadAll() {
  const [profile, settings, stats, daily, game, dailyGame] = await Promise.all([
    get<Profile | null>(K.profile, null),
    get(K.settings, DEFAULT_SETTINGS),
    get(K.stats, DEFAULT_STATS),
    get(K.daily, DEFAULT_DAILY),
    get<SavedGame | null>(K.game, null),
    get<SavedGame | null>(K.dailyGame, null),
  ]);
  return {
    profile,
    settings: { ...DEFAULT_SETTINGS, ...settings },
    stats: {
      ...DEFAULT_STATS,
      ...stats,
      levels: { ...DEFAULT_STATS.levels, ...(stats.levels || {}) },
      unlocked: stats.unlocked || {},
    },
    daily: { done: (daily && daily.done) || {} },
    // Eski sürümler tek kayıt kullanıyordu: günlük oyun orada olabilir
    game: game && game.mode === 'daily' ? null : game,
    dailyGame: dailyGame || (game && game.mode === 'daily' ? game : null),
  };
}

export const saveProfile = (v: Profile) => set(K.profile, v);
export const saveSettings = (v: Settings) => set(K.settings, v);
export const saveStats = (v: Stats) => set(K.stats, v);
export const saveDaily = (v: DailyData) => set(K.daily, v);
const gameKey = (mode: GameMode) => (mode === 'daily' ? K.dailyGame : K.game);

export const saveGame = (v: SavedGame) => set(gameKey(v.mode), v);
export const loadGame = (mode: GameMode = 'normal') => get<SavedGame | null>(gameKey(mode), null);

export async function clearProfile() {
  try {
    await AsyncStorage.removeItem(K.profile);
  } catch {}
}

export async function clearGame(mode: GameMode = 'normal') {
  try {
    await AsyncStorage.removeItem(gameKey(mode));
  } catch {}
}
