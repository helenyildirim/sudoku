import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyStats, recordResult } from '../src/game/progress';
import { fmtTime, longestStreak, seedFromKey } from '../src/dates';
import type { GameOutcome } from '../src/types';

const run = (patch: Partial<GameOutcome> = {}): GameOutcome => ({
  won: true,
  level: 'medium',
  seconds: 400,
  mistakes: 1,
  hints: 1,
  mode: 'normal',
  dateKey: null,
  ...patch,
});
const noDaily = { done: {} };

test('a win updates totals and best times', () => {
  const { stats, record } = recordResult(emptyStats(), noDaily, run());
  assert.equal(stats.played, 1);
  assert.equal(stats.won, 1);
  assert.equal(stats.bestTime, 400);
  assert.equal(stats.levels.medium.best, 400);
  assert.equal(record, true);
});

test('a loss counts as played but sets no time', () => {
  const { stats, record } = recordResult(emptyStats(), noDaily, run({ won: false }));
  assert.equal(stats.played, 1);
  assert.equal(stats.won, 0);
  assert.equal(stats.bestTime, null);
  assert.equal(record, false);
});

test('a slower win is not a record', () => {
  const first = recordResult(emptyStats(), noDaily, run({ seconds: 300 }));
  const second = recordResult(first.stats, noDaily, run({ seconds: 500 }));
  assert.equal(second.record, false);
  assert.equal(second.stats.levels.medium.best, 300);
});

test('recordResult does not change the stats it receives', () => {
  const stats = emptyStats();
  recordResult(stats, noDaily, run());
  assert.deepEqual(stats, emptyStats());
});

test('a daily win is saved under its date', () => {
  const { daily } = recordResult(emptyStats(), noDaily, run({ mode: 'daily', dateKey: '2026-11-03' }));
  assert.deepEqual(daily.done, { '2026-11-03': { seconds: 400 } });
});

test('a lost daily game is not saved', () => {
  const { daily } = recordResult(emptyStats(), noDaily, run({ won: false, mode: 'daily', dateKey: '2026-11-03' }));
  assert.equal(daily, noDaily);
});

test('an achievement unlocks only once', () => {
  const first = recordResult(emptyStats(), noDaily, run());
  assert.ok(first.newly.includes('first_win'));
  const second = recordResult(first.stats, noDaily, run());
  assert.ok(!second.newly.includes('first_win'));
});

test('a three day daily streak unlocks its achievement', () => {
  const daily = { done: { '2026-11-01': { seconds: 1 }, '2026-11-02': { seconds: 1 } } };
  const { newly } = recordResult(emptyStats(), daily, run({ mode: 'daily', dateKey: '2026-11-03' }));
  assert.ok(newly.includes('streak3'));
});

test('longestStreak counts across a month end and stops at gaps', () => {
  const done = { '2026-10-30': { seconds: 1 }, '2026-10-31': { seconds: 1 }, '2026-11-01': { seconds: 1 }, '2026-11-05': { seconds: 1 } };
  assert.equal(longestStreak(done), 3);
  assert.equal(longestStreak({}), 0);
});

test('fmtTime pads minutes and seconds', () => {
  assert.equal(fmtTime(65), '01:05');
  assert.equal(fmtTime(null), '--:--');
});

test('seedFromKey gives a different seed for each date', () => {
  assert.equal(seedFromKey('2026-11-03'), 20261103);
});
