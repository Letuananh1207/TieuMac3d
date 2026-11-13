/**
 * Ngũ Tử Kỳ 五子棋 (R-CO-1..3): bàn 13 × 13 giao điểm, người cầm đen đi trước, NPC cầm trắng; từ 5 quân cùng màu liền
 * nhau (ngang, dọc, chéo) là thắng, bàn đầy là hoà. Logic thuần — không three, không DOM; cảnh vẽ bàn theo `cells`.
 */

export const BOARD_SIZE = 13;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;
export type Stone = typeof BLACK | typeof WHITE;
export type Cell = typeof EMPTY | Stone;

export interface Point {
  x: number;
  y: number;
}

export interface GomokuResult {
  /** bên thắng; `null` = hoà (bàn đầy) */
  winner: Stone | null;
  /** các quân thắng (từ 5 trở lên) — để làm sáng (R-CO-3); hoà thì rỗng */
  line: Point[];
}

/** Bốn hướng: ngang, dọc, chéo xuống, chéo lên. */
const DIRS: readonly (readonly [number, number])[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

const inside = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;

export class Gomoku {
  readonly cells = new Uint8Array(BOARD_SIZE * BOARD_SIZE);
  turn: Stone = BLACK;
  result: GomokuResult | null = null;
  moves = 0;

  at(x: number, y: number): Cell {
    return inside(x, y) ? (this.cells[y * BOARD_SIZE + x] as Cell) : EMPTY;
  }

  /** Đặt quân của bên đang tới lượt. Ô ngoài bàn / đã có quân / ván đã xong → `false`, không đổi gì (R-CO-1). */
  play(x: number, y: number): boolean {
    if (this.result || !inside(x, y) || this.at(x, y) !== EMPTY) return false;
    const stone = this.turn;
    this.cells[y * BOARD_SIZE + x] = stone;
    this.moves++;
    const line = winLine(this.cells, x, y);
    if (line) this.result = { winner: stone, line };
    else if (this.moves === BOARD_SIZE * BOARD_SIZE) this.result = { winner: null, line: [] };
    else this.turn = stone === BLACK ? WHITE : BLACK;
    return true;
  }

  reset(): void {
    this.cells.fill(EMPTY);
    this.turn = BLACK;
    this.result = null;
    this.moves = 0;
  }
}

/** Dãy quân liền nhau dài nhất (≥ 5) đi qua (x, y) cùng màu với quân ở đó; không có → `null`. */
export function winLine(cells: Uint8Array, x: number, y: number): Point[] | null {
  const stone = cells[y * BOARD_SIZE + x];
  if (stone === EMPTY) return null;
  for (const [dx, dy] of DIRS) {
    const run: Point[] = [{ x, y }];
    for (const s of [1, -1]) {
      let cx = x + dx * s;
      let cy = y + dy * s;
      while (inside(cx, cy) && cells[cy * BOARD_SIZE + cx] === stone) {
        run.push({ x: cx, y: cy });
        cx += dx * s;
        cy += dy * s;
      }
    }
    if (run.length >= 5) return run.sort((a, b) => a.x - b.x || a.y - b.y);
  }
  return null;
}

/* ---------- NPC (R-CO-2) ---------- */

/** Điểm một hướng theo số quân liền (kể cả quân vừa đặt) và số đầu còn trống. */
function shapeScore(count: number, openEnds: number): number {
  if (count >= 5) return 100000;
  if (openEnds === 0) return 0;
  if (count === 4) return openEnds === 2 ? 10000 : 1000;
  if (count === 3) return openEnds === 2 ? 1000 : 100;
  if (count === 2) return openEnds === 2 ? 100 : 10;
  return openEnds === 2 ? 10 : 1;
}

/** Điểm nếu `stone` đặt vào ô trống (x, y): cộng bốn hướng. */
function placeScore(cells: Uint8Array, x: number, y: number, stone: Stone): number {
  let total = 0;
  for (const [dx, dy] of DIRS) {
    let count = 1;
    let open = 0;
    for (const s of [1, -1]) {
      let cx = x + dx * s;
      let cy = y + dy * s;
      while (inside(cx, cy) && cells[cy * BOARD_SIZE + cx] === stone) {
        count++;
        cx += dx * s;
        cy += dy * s;
      }
      if (inside(cx, cy) && cells[cy * BOARD_SIZE + cx] === EMPTY) open++;
    }
    total += shapeScore(count, open);
  }
  return total;
}

/** Ô trống cách quân gần nhất ≤ 2 ô (bàn trống → tâm). */
function candidates(cells: Uint8Array): Point[] {
  const out: Point[] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (cells[y * BOARD_SIZE + x] !== EMPTY) continue;
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++) {
        for (let dx = -2; dx <= 2 && !near; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (inside(nx, ny) && cells[ny * BOARD_SIZE + nx] !== EMPTY) near = true;
        }
      }
      if (near) out.push({ x, y });
    }
  }
  const mid = (BOARD_SIZE - 1) / 2;
  return out.length ? out : [{ x: mid, y: mid }];
}

/**
 * Nước của NPC cầm `stone`: (1) có nước thắng ngay → đi nước đó; (2) đối thủ có nước thắng ngay → chặn; (3) còn lại
 * điểm cao nhất = tấn công + 0,9 × phòng thủ. Hoà điểm → `rng` chọn (mặc định ngẫu nhiên — mỗi ván một khác).
 */
export function npcMove(cells: Uint8Array, stone: Stone, rng: () => number = Math.random): Point {
  const foe: Stone = stone === BLACK ? WHITE : BLACK;
  const list = candidates(cells);
  const winsFor = (s: Stone): Point | undefined => list.find((p) => placeScore(cells, p.x, p.y, s) >= 100000);
  const win = winsFor(stone);
  if (win) return win;
  const block = winsFor(foe);
  if (block) return block;
  let best: Point[] = [];
  let bestScore = -1;
  for (const p of list) {
    const score = placeScore(cells, p.x, p.y, stone) + 0.9 * placeScore(cells, p.x, p.y, foe);
    if (score > bestScore) {
      bestScore = score;
      best = [p];
    } else if (score === bestScore) best.push(p);
  }
  return best[Math.min(best.length - 1, Math.floor(rng() * best.length))];
}
