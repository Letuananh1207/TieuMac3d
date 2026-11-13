import { describe, expect, it } from 'vitest';
import { BLACK, BOARD_SIZE, Gomoku, WHITE, npcMove } from './gomoku';

/** Đặt quân thẳng vào bàn (không theo lượt) để dựng thế cờ. */
function setup(stones: [number, number, number][]): Gomoku {
  const g = new Gomoku();
  for (const [x, y, s] of stones) g.cells[y * BOARD_SIZE + x] = s;
  g.moves = stones.length;
  return g;
}

describe('Ngũ Tử Kỳ', () => {
  it('R-CO-1: 5 quân ngang liền → đen thắng, 5 quân sáng', () => {
    const g = setup([3, 4, 5, 6].map((x) => [x, 7, BLACK]));
    expect(g.play(7, 7)).toBe(true);
    expect(g.result?.winner).toBe(BLACK);
    expect(g.result?.line).toHaveLength(5);
  });

  it('R-CO-1: 6 quân chéo liền cũng thắng', () => {
    const g = setup([
      [2, 2, BLACK],
      [3, 3, BLACK],
      [4, 4, BLACK],
      [5, 5, BLACK],
      [7, 7, BLACK],
    ]);
    g.play(6, 6);
    expect(g.result?.winner).toBe(BLACK);
    expect(g.result?.line).toHaveLength(6);
  });

  it('R-CO-1: chéo lên cũng tính', () => {
    const g = setup([0, 1, 2, 3].map((i) => [i, 10 - i, BLACK]));
    g.play(4, 6);
    expect(g.result?.winner).toBe(BLACK);
  });

  it('R-CO-1: 4 quân liền chưa thắng, đổi lượt', () => {
    const g = setup([3, 4, 5].map((x) => [x, 7, BLACK]));
    g.play(6, 7);
    expect(g.result).toBeNull();
    expect(g.turn).toBe(WHITE);
  });

  it('R-CO-1: chạm ô đã có quân hoặc ngoài bàn → không đổi gì, vẫn lượt người', () => {
    const g = setup([[3, 7, BLACK]]);
    expect(g.play(3, 7)).toBe(false);
    expect(g.play(-1, 0)).toBe(false);
    expect(g.play(13, 0)).toBe(false);
    expect(g.turn).toBe(BLACK);
    expect(g.moves).toBe(1);
  });

  it('R-CO-1: bàn đầy chưa ai thắng → hoà', () => {
    const g = new Gomoku();
    // màu theo (x + 2y) mod 4: ngang, chéo tối đa 2 liền, dọc xen kẽ — không có 5 liền ở hướng nào
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        g.cells[y * BOARD_SIZE + x] = (x + 2 * y) % 4 < 2 ? BLACK : WHITE;
      }
    }
    const last = BOARD_SIZE * BOARD_SIZE - 1;
    const stone = g.cells[last];
    g.cells[last] = 0;
    g.moves = last;
    g.turn = stone as 1 | 2;
    expect(g.play(BOARD_SIZE - 1, BOARD_SIZE - 1)).toBe(true);
    expect(g.result).toEqual({ winner: null, line: [] });
  });

  it('R-CO-1: ván xong thì không đặt thêm được', () => {
    const g = setup([3, 4, 5, 6].map((x) => [x, 7, BLACK]));
    g.play(7, 7);
    expect(g.play(0, 0)).toBe(false);
  });
});

describe('NPC Ngũ Tử Kỳ', () => {
  it('R-CO-2: chặn hàng 4 của người (một đầu đã bị chặn)', () => {
    const g = setup([
      [2, 7, WHITE],
      [3, 7, BLACK],
      [4, 7, BLACK],
      [5, 7, BLACK],
      [6, 7, BLACK],
    ]);
    expect(npcMove(g.cells, WHITE, () => 0)).toEqual({ x: 7, y: 7 });
  });

  it('R-CO-2: có nước thắng ngay thì thắng, không chặn', () => {
    const g = setup([
      [5, 2, WHITE],
      [5, 3, WHITE],
      [5, 4, WHITE],
      [5, 5, WHITE],
      [0, 0, BLACK],
      [1, 0, BLACK],
      [2, 0, BLACK],
      [3, 0, BLACK],
    ]);
    const m = npcMove(g.cells, WHITE, () => 0);
    expect(m.x).toBe(5);
    expect([1, 6]).toContain(m.y);
  });

  it('R-CO-2: chặn hàng 3 hở hai đầu', () => {
    const g = setup([
      [5, 6, BLACK],
      [6, 6, BLACK],
      [7, 6, BLACK],
      [6, 7, WHITE],
    ]);
    const m = npcMove(g.cells, WHITE, () => 0);
    expect(m.y).toBe(6);
    expect([4, 8]).toContain(m.x);
  });

  it('R-CO-2: nước NPC luôn là ô trống trên bàn', () => {
    const g = new Gomoku();
    for (let i = 0; i < 40 && !g.result; i++) {
      const p = g.turn === BLACK ? npcMove(g.cells, BLACK, Math.random) : npcMove(g.cells, WHITE, Math.random);
      expect(g.at(p.x, p.y)).toBe(0);
      expect(g.play(p.x, p.y)).toBe(true);
    }
  });
});
