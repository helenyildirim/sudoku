import type { ComponentProps } from 'react';
import type { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Board, Level } from './game/sudoku';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type McIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type GameMode = 'normal' | 'daily';
export type GameStatus = 'play' | 'won' | 'lost';
export type ThemeName = 'light' | 'dark';

export type Profile = { name: string };

export type Settings = {
  theme: ThemeName;
  boardColor: string;
  haptics: boolean;
  autoNotes: boolean;
  lessons: Record<string, boolean>;
  lessonsSeen: boolean;
};

export type SavedGame = {
  level: Level;
  puzzle: Board;
  solution: Board;
  mode: GameMode;
  dateKey: string | null;
  values: Board;
  notes: number[];
  mistakes: number;
  hints: number;
  seconds: number;
  status: GameStatus;
};

export type LevelStats = { played: number; won: number; best: number | null };

export type Stats = {
  played: number;
  won: number;
  bestTime: number | null;
  levels: Record<Level, LevelStats>;
  unlocked: Record<string, boolean>;
};

export type DailyDone = Record<string, { seconds: number }>;
export type DailyData = { done: DailyDone };

export type GameOutcome = Pick<SavedGame, 'level' | 'seconds' | 'mistakes' | 'hints' | 'mode' | 'dateKey'> & {
  won: boolean;
};
export type RunContext = GameOutcome & { longest: number; dailyCount: number };
export type FinishResult = { newly: string[]; record: boolean };

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: IconName;
  check: (stats: Stats, run: RunContext) => boolean;
};
