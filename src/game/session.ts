// Bir oyun oturumundaki hamleler. Arayüzden bağımsız saf fonksiyonlar, böylece testlerle doğrulanabilir.
import { isPeer, type Board } from './sudoku';

export const MAX_MISTAKES = 3;
export const MAX_HINTS = 3;

export type BoardState = { values: Board; notes: number[] };

export const isLocked = (puzzle: Board, values: Board, solution: Board, cell: number): boolean =>
  puzzle[cell] !== 0 || values[cell] === solution[cell];

export const isSolved = (values: Board, solution: Board): boolean =>
  values.every((v, i) => v === solution[i]);

export const remaining = (values: Board, solution: Board, n: number): number =>
  9 - values.filter((v, i) => v === n && v === solution[i]).length;

export function toggleNote(notes: number[], cell: number, n: number): number[] {
  const next = [...notes];
  next[cell] ^= 1 << n;
  return next;
}

// Hücreye sayı yazar. Doğru sayı yazılınca aynı satır, sütun ve kutudaki notlardan silinir.
export function placeValue(state: BoardState, cell: number, n: number, correct: boolean): BoardState {
  const values = [...state.values];
  const notes = [...state.notes];
  values[cell] = n;
  notes[cell] = 0;
  if (correct) {
    for (let i = 0; i < 81; i++) if (isPeer(cell, i)) notes[i] &= ~(1 << n);
  }
  return { values, notes };
}

export function eraseCell(state: BoardState, cell: number): BoardState {
  const values = [...state.values];
  const notes = [...state.notes];
  values[cell] = 0;
  notes[cell] = 0;
  return { values, notes };
}
