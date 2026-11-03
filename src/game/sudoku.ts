// Sudoku mantığı: tahta 81 elemanlı düz dizi, 0 = boş hücre

export type Level = 'easy' | 'medium' | 'hard' | 'expert';
export type Board = number[];
export type Puzzle = { puzzle: Board; solution: Board };
export type Unit = { name: string; cells: number[]; kind: 'box' | 'row' | 'col' };
export type Hint = {
  type: 'error' | 'naked' | 'hidden' | 'advanced';
  cell: number;
  value: number;
  area: number[];
  title: string;
  text: string;
};
export type NakedSingle = { type: 'naked'; cell: number; value: number; area: number[] };
export type HiddenSingle = { type: 'hidden'; cell: number; value: number; unit: Unit };
type Rng = () => number;

// Aynı tohumdan hep aynı sayıları üreten rastgele sayı üretici (günlük bulmaca için)
export function mulberry32(seed: number): Rng {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const shuffle = <T,>(arr: T[], rng: Rng): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function canPlace(board: Board, idx: number, n: number): boolean {
  const r = Math.floor(idx / 9);
  const c = idx % 9;
  for (let i = 0; i < 9; i++) {
    if (board[r * 9 + i] === n) return false;
    if (board[i * 9 + c] === n) return false;
  }
  const br = r - (r % 3);
  const bc = c - (c % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(br + i) * 9 + bc + j] === n) return false;
    }
  }
  return true;
}

function fillBoard(board: Board, rng: Rng): boolean {
  const idx = board.indexOf(0);
  if (idx === -1) return true;
  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
    if (canPlace(board, idx, n)) {
      board[idx] = n;
      if (fillBoard(board, rng)) return true;
      board[idx] = 0;
    }
  }
  return false;
}

// Çözüm sayısını (en fazla limit kadar) sayar
function countSolutions(board: Board, limit = 2): number {
  let best = -1;
  let bestCands: number[] = [];
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      const cands = [];
      for (let n = 1; n <= 9; n++) if (canPlace(board, i, n)) cands.push(n);
      if (cands.length === 0) return 0;
      if (best === -1 || cands.length < bestCands.length) {
        best = i;
        bestCands = cands;
        if (cands.length === 1) break;
      }
    }
  }
  if (best === -1) return 1;
  let total = 0;
  for (const n of bestCands) {
    board[best] = n;
    total += countSolutions(board, limit - total);
    board[best] = 0;
    if (total >= limit) break;
  }
  return total;
}

const REMOVE: Record<Level, number> = { easy: 41, medium: 50, hard: 56, expert: 60 };

// seed verilirse aynı seed her zaman aynı bulmacayı üretir
function generateOnce(level: Level, rng: Rng): Puzzle {
  const solution: Board = Array(81).fill(0);
  fillBoard(solution, rng);
  const puzzle = [...solution];
  const target = REMOVE[level];
  let removed = 0;
  for (const idx of shuffle([...Array(81).keys()], rng)) {
    if (removed >= target) break;
    const backup = puzzle[idx];
    puzzle[idx] = 0;
    if (countSolutions([...puzzle], 2) !== 1) {
      puzzle[idx] = backup;
    } else {
      removed++;
    }
  }
  return { puzzle, solution };
}

// Boş hücreler için olası sayıları not (bit maskesi) olarak doldurur
export function autoNotes(values: Board): number[] {
  return values.map((v, i) => {
    if (v !== 0) return 0;
    let mask = 0;
    for (let n = 1; n <= 9; n++) if (canPlace(values, i, n)) mask |= 1 << n;
    return mask;
  });
}

export function isPeer(a: number, b: number): boolean {
  const ra = Math.floor(a / 9);
  const ca = a % 9;
  const rb = Math.floor(b / 9);
  const cb = b % 9;
  return (
    ra === rb ||
    ca === cb ||
    (Math.floor(ra / 3) === Math.floor(rb / 3) &&
      Math.floor(ca / 3) === Math.floor(cb / 3))
  );
}

// ---------------------------------------------------------------------------
// Teknik tabanlı ipucu motoru (Sudoku Okulu ve akıllı ipucu için)
// ---------------------------------------------------------------------------

// Verilen tahtayı çözer (tek çözüm bekler); çözülemezse null döner
export function solve(board: Board): Board | null {
  const b = [...board];
  let best = -1;
  let bestCands: number[] = [];
  for (let i = 0; i < 81; i++) {
    if (b[i] === 0) {
      const cands = [];
      for (let n = 1; n <= 9; n++) if (canPlace(b, i, n)) cands.push(n);
      if (best === -1 || cands.length < bestCands.length) {
        best = i;
        bestCands = cands;
        if (cands.length <= 1) break;
      }
    }
  }
  if (best === -1) return b;
  for (const n of bestCands) {
    b[best] = n;
    const r = solve(b);
    if (r) return r;
  }
  return null;
}

// Bir hücrenin (satır, sütun, kutu) tüm komşuları
export const peersOf = (idx: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < 81; i++) if (i !== idx && isPeer(idx, i)) out.push(i);
  return out;
};

// Her boş hücre için olası sayılar (dizi)
export function candidates(values: Board): number[][] {
  return values.map((v, i) => {
    if (v !== 0) return [];
    const c: number[] = [];
    for (let n = 1; n <= 9; n++) if (canPlace(values, i, n)) c.push(n);
    return c;
  });
}

// 27 birim: 9 kutu, 9 satır, 9 sütun
export const UNITS: Unit[] = (() => {
  const u: Unit[] = [];
  for (let b = 0; b < 9; b++) {
    const cells: number[] = [];
    const br = Math.floor(b / 3) * 3;
    const bc = (b % 3) * 3;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cells.push((br + i) * 9 + bc + j);
    u.push({ name: `${b + 1}. kutu`, cells, kind: 'box' });
  }
  for (let r = 0; r < 9; r++) {
    u.push({ name: `${r + 1}. satır`, cells: [...Array(9).keys()].map((k) => r * 9 + k), kind: 'row' });
  }
  for (let c = 0; c < 9; c++) {
    u.push({ name: `${c + 1}. sütun`, cells: [...Array(9).keys()].map((k) => k * 9 + c), kind: 'col' });
  }
  return u;
})();

export const cellName = (i: number): string => `${Math.floor(i / 9) + 1}. satır ${(i % 9) + 1}. sütun`;

// Tek aday: hücrede yalnızca bir sayı mümkün
export function findNakedSingles(values: Board): NakedSingle[] {
  const cands = candidates(values);
  const out: NakedSingle[] = [];
  for (let i = 0; i < 81; i++) {
    if (values[i] === 0 && cands[i].length === 1) {
      out.push({
        type: 'naked',
        cell: i,
        value: cands[i][0],
        area: peersOf(i).filter((p) => values[p] !== 0),
      });
    }
  }
  return out;
}

// Tek yer: bir birimde bir sayı yalnızca tek hücreye sığıyor
export function findHiddenSingles(values: Board): HiddenSingle[] {
  const cands = candidates(values);
  const out: HiddenSingle[] = [];
  for (const unit of UNITS) {
    for (let n = 1; n <= 9; n++) {
      if (unit.cells.some((c) => values[c] === n)) continue;
      const spots = unit.cells.filter((c) => values[c] === 0 && cands[c].includes(n));
      if (spots.length === 1 && cands[spots[0]].length > 1) {
        out.push({ type: 'hidden', cell: spots[0], value: n, unit });
      }
    }
  }
  return out;
}

// Akıllı ipucu: önce hataları, sonra tek aday, sonra tek yer, yoksa ileri teknik
export function findHint(values: Board, solution: Board): Hint | null {
  const wrong = values.findIndex((v, i) => v !== 0 && v !== solution[i]);
  if (wrong !== -1) {
    return {
      type: 'error',
      cell: wrong,
      value: solution[wrong],
      area: [],
      title: 'Hata var',
      text: `${cellName(wrong)} hücresindeki ${values[wrong]} yanlış. Bu hücrenin doğru değeri ${solution[wrong]}.`,
    };
  }
  const naked = findNakedSingles(values)[0];
  if (naked) {
    return {
      ...naked,
      title: 'Tek Aday',
      text: `${cellName(naked.cell)} hücresine bak. Satırında, sütununda ve kutusunda zaten olan sayıları çıkarınca geriye sadece ${naked.value} kalıyor.`,
    };
  }
  const hidden = findHiddenSingles(values)[0];
  if (hidden) {
    return {
      type: 'hidden',
      cell: hidden.cell,
      value: hidden.value,
      area: hidden.unit.cells,
      title: 'Tek Yer',
      text: `${hidden.unit.name} içinde ${hidden.value} sayısı sadece tek bir hücreye sığıyor: ${cellName(hidden.cell)}.`,
    };
  }
  // İleri teknik gerekli: en az adayı olan hücreyi göster
  const cands = candidates(values);
  let best = -1;
  for (let i = 0; i < 81; i++) {
    if (values[i] === 0 && (best === -1 || cands[i].length < cands[best].length)) best = i;
  }
  if (best === -1) return null;
  return {
    type: 'advanced',
    cell: best,
    value: solution[best],
    area: [],
    title: 'İleri Teknik',
    text: `Basit bir yol kalmadı. ${cellName(best)} hücresi en az adaya sahip (${cands[best].join(', ')}). Doğru sayı ${solution[best]}.`,
  };
}

// Bulmacanın zorluk puanı: çözmek için gereken tekniklere göre
export function difficultyScore(puzzle: Board, solution: Board): number {
  const v = [...puzzle];
  let score = 0;
  for (let g = 0; g < 90 && v.includes(0); g++) {
    const h = findHint(v, solution);
    if (!h) break;
    if (h.type === 'hidden') score += 1;
    if (h.type === 'advanced') score += 5;
    v[h.cell] = h.value;
  }
  return score;
}

const MIN_SCORE: Record<Level, number> = { easy: 0, medium: 2, hard: 8, expert: 18 };

// Zorluk seviyesi hem silinen hücre sayısına hem gereken tekniklere göre ayarlanır
export function generatePuzzle(level: Level = 'easy', seed: number | null = null): Puzzle {
  const rng = seed == null ? Math.random : mulberry32(seed);
  const need = MIN_SCORE[level];
  let best = generateOnce(level, rng);
  if (need === 0) return best;
  let bestScore = difficultyScore(best.puzzle, best.solution);
  for (let attempt = 1; attempt < 14 && bestScore < need; attempt++) {
    const p = generateOnce(level, rng);
    const sc = difficultyScore(p.puzzle, p.solution);
    if (sc > bestScore) {
      best = p;
      bestScore = sc;
    }
  }
  return best;
}
