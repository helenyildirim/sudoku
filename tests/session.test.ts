import test from 'node:test';
import assert from 'node:assert/strict';
import { eraseCell, isLocked, isSolved, placeValue, remaining, toggleNote } from '../src/game/session';
import { generatePuzzle, isPeer } from '../src/game/sudoku';

const empty = () => ({ values: Array<number>(81).fill(0), notes: Array<number>(81).fill(0) });

test('toggleNote adds a note and removes it the second time', () => {
  const once = toggleNote(empty().notes, 10, 4);
  assert.equal(once[10], 1 << 4);
  assert.equal(toggleNote(once, 10, 4)[10], 0);
});

test('toggleNote does not change the original array', () => {
  const notes = empty().notes;
  toggleNote(notes, 0, 1);
  assert.equal(notes[0], 0);
});

test('a correct value removes that digit from peer notes only', () => {
  const state = empty();
  const mask = (1 << 5) | (1 << 7);
  state.notes = state.notes.map(() => mask);
  const next = placeValue(state, 40, 5, true);
  assert.equal(next.values[40], 5);
  assert.equal(next.notes[40], 0);
  for (let i = 0; i < 81; i++) {
    if (i === 40) continue;
    assert.equal(next.notes[i], isPeer(40, i) ? 1 << 7 : mask);
  }
});

test('a wrong value leaves peer notes alone', () => {
  const state = empty();
  state.notes = state.notes.map(() => 1 << 5);
  const next = placeValue(state, 40, 5, false);
  assert.equal(next.notes[41], 1 << 5);
  assert.equal(next.notes[40], 0);
});

test('placeValue and eraseCell do not change the previous state, so undo stays safe', () => {
  const state = empty();
  placeValue(state, 3, 9, true);
  eraseCell(state, 3);
  assert.deepEqual(state, empty());
});

test('eraseCell clears both the value and the notes', () => {
  const state = empty();
  state.values[5] = 2;
  state.notes[5] = 1 << 2;
  const next = eraseCell(state, 5);
  assert.equal(next.values[5], 0);
  assert.equal(next.notes[5], 0);
});

test('given and solved cells are locked, wrong and empty cells are not', () => {
  const { puzzle, solution } = generatePuzzle('easy', 11);
  const given = puzzle.findIndex((v) => v !== 0);
  const open = puzzle.indexOf(0);
  const values = [...puzzle];
  assert.equal(isLocked(puzzle, values, solution, given), true);
  assert.equal(isLocked(puzzle, values, solution, open), false);
  values[open] = (solution[open] % 9) + 1;
  assert.equal(isLocked(puzzle, values, solution, open), false);
  values[open] = solution[open];
  assert.equal(isLocked(puzzle, values, solution, open), true);
});

test('isSolved is true only for the exact solution', () => {
  const { puzzle, solution } = generatePuzzle('easy', 12);
  assert.equal(isSolved(solution, solution), true);
  assert.equal(isSolved(puzzle, solution), false);
});

test('remaining ignores wrong copies of a digit', () => {
  const { solution } = generatePuzzle('easy', 13);
  assert.equal(remaining(solution, solution, 1), 0);
  assert.equal(remaining(Array(81).fill(1), solution, 1), 0);
  assert.equal(remaining(Array(81).fill(0), solution, 1), 9);
});
