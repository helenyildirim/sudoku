import AsyncStorage from '@react-native-async-storage/async-storage';

const K = {
  profile: 'sudoku_profile_v1',
  settings: 'sudoku_settings_v1',
  stats: 'sudoku_stats_v1',
  daily: 'sudoku_daily_v1',
  game: 'sudoku_game_v2',
};

export const DEFAULT_SETTINGS = {
  theme: 'light',
  boardColor: '#1F6BF5',
  haptics: true,
  autoNotes: false,
  lessons: {},
  lessonsSeen: false,
};

const emptyLevel = () => ({ played: 0, won: 0, best: null });

export const DEFAULT_STATS = {
  played: 0,
  won: 0,
  bestTime: null,
  levels: {
    easy: emptyLevel(),
    medium: emptyLevel(),
    hard: emptyLevel(),
    expert: emptyLevel(),
  },
  unlocked: {},
};

export const DEFAULT_DAILY = { done: {} };

async function get(key, fallback) {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function set(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

export async function loadAll() {
  const [profile, settings, stats, daily, game] = await Promise.all([
    get(K.profile, null),
    get(K.settings, DEFAULT_SETTINGS),
    get(K.stats, DEFAULT_STATS),
    get(K.daily, DEFAULT_DAILY),
    get(K.game, null),
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
    game,
  };
}

export const saveProfile = (v) => set(K.profile, v);
export const saveSettings = (v) => set(K.settings, v);
export const saveStats = (v) => set(K.stats, v);
export const saveDaily = (v) => set(K.daily, v);
export const saveGame = (v) => set(K.game, v);
export const loadGame = () => get(K.game, null);

export async function clearProfile() {
  try {
    await AsyncStorage.removeItem(K.profile);
  } catch (e) {}
}

export async function clearGame() {
  try {
    await AsyncStorage.removeItem(K.game);
  } catch (e) {}
}
