import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UNITS,
  autoNotes,
  candidates,
  canPlace,
  difficultyScore,
  findHiddenSingles,
  findHint,
  findNakedSingles,
  generatePuzzle,
  isPeer,
  mulberry32,
  peersOf,
  solve,
} from '../sudoku.js';

const LEVELS = ['easy', 'medium', 'hard', 'expert'];
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const isValidSolution = (board) =>
  board.length === 81 &&
  UNITS.every((unit) => {
    const cells = unit.cells ?? unit;
    return [...cells.map((i) => board[i])].sort((a, b) => a - b).join() === DIGITS.join();
  });

test('mulberry32 is deterministic for a seed', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 20; i++) assert.equal(a(), b());
});

test('there are 27 units and each cell has 20 peers', () => {
  assert.equal(UNITS.length, 27);
  for (let i = 0; i < 81; i++) {
    const peers = new Set(peersOf(i));
    assert.equal(peers.size, 20);
    assert.ok(!peers.has(i));
  }
});

test('isPeer matches row, column and box', () => {
  assert.ok(isPeer(0, 8));
  assert.ok(isPeer(0, 72));
  assert.ok(isPeer(0, 20));
  assert.ok(!isPeer(0, 40));
});

test('canPlace rejects row, column and box conflicts', () => {
  const board = Array(81).fill(0);
  board[0] = 5;
  assert.equal(canPlace(board, 8, 5), false);
  assert.equal(canPlace(board, 72, 5), false);
  assert.equal(canPlace(board, 10, 5), false);
  assert.equal(canPlace(board, 40, 5), true);
});

for (const level of LEVELS) {
  test(`${level} puzzles are valid and solve to their solution`, () => {
    for (let seed = 1; seed <= 3; seed++) {
      const { puzzle, solution } = generatePuzzle(level, seed);
      assert.ok(isValidSolution(solution));
      assert.ok(puzzle.includes(0));
      puzzle.forEach((v, i) => {
        if (v !== 0) assert.equal(v, solution[i]);
      });
      assert.deepEqual([...solve(puzzle)], [...solution]);
    }
  });
}

test('the same seed gives the same daily puzzle', () => {
  assert.deepEqual(generatePuzzle('medium', 20261102), generatePuzzle('medium', 20261102));
});

test('naked and hidden singles match the solution', () => {
  const { puzzle, solution } = generatePuzzle('medium', 7);
  for (const hint of [...findNakedSingles(puzzle), ...findHiddenSingles(puzzle)]) {
    assert.equal(hint.value, solution[hint.cell]);
  }
});

test('hints point out a wrong value first', () => {
  const { puzzle, solution } = generatePuzzle('easy', 3);
  const values = [...puzzle];
  const empty = values.indexOf(0);
  values[empty] = (solution[empty] % 9) + 1;
  const hint = findHint(values, solution);
  assert.equal(hint.type, 'error');
  assert.equal(hint.cell, empty);
  assert.equal(hint.value, solution[empty]);
});

test('hints return null on a finished board', () => {
  const { solution } = generatePuzzle('easy', 4);
  assert.equal(findHint(solution, solution), null);
});

test('following hints finishes the puzzle', () => {
  const { puzzle, solution } = generatePuzzle('hard', 5);
  const values = [...puzzle];
  for (let i = 0; i < 81 && values.includes(0); i++) {
    const hint = findHint(values, solution);
    values[hint.cell] = hint.value;
  }
  assert.deepEqual(values, solution);
});

test('candidates always contain the correct digit', () => {
  const { puzzle, solution } = generatePuzzle('hard', 6);
  const cands = candidates(puzzle);
  puzzle.forEach((v, i) => {
    if (v === 0) assert.ok(cands[i].includes(solution[i]));
  });
});

test('autoNotes returns one entry per cell', () => {
  const { puzzle } = generatePuzzle('easy', 8);
  assert.equal(autoNotes(puzzle).length, 81);
});

test('difficultyScore is zero for a solved board', () => {
  const { solution } = generatePuzzle('easy', 9);
  assert.equal(difficultyScore(solution, solution), 0);
});
