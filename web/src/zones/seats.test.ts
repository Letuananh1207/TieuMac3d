import { describe, expect, it } from 'vitest';
import { SEAT_LABEL, seatInRange, type SeatSpot } from './seats';

const banTra: SeatSpot = { x: 10, y: 0, z: 10, rotY: 0, kind: 'ngoi' };
const banChoi: SeatSpot[] = [
  { x: -29.1, y: 0, z: 5, rotY: (3 * Math.PI) / 2, kind: 'ban-choi' },
  { x: -31.9, y: 0, z: 5, rotY: Math.PI / 2, kind: 'ban-choi' },
];
const anThu: SeatSpot = { x: 0, y: 3.2, z: 0, rotY: 0, kind: 'ngoi' };

describe('Nút nổi Ngồi', () => {
  it('R-NGOI-1: đứng ở (10; 11), cách bàn trà (10; 10) 1 m → nút "Ngồi"', () => {
    const s = seatInRange([banTra, ...banChoi], 10, 11, 0);
    expect(s).toBe(banTra);
    expect(SEAT_LABEL[s!.kind]).toBe('Ngồi');
  });

  it('R-NGOI-1: đi ra (10; 11,5) → không có chỗ trong tầm (nút ẩn)', () => {
    expect(seatInRange([banTra], 10, 11.5, 0)).toBeUndefined();
  });

  it('R-NGOI-1: đứng ở (−28; 5) → nút "Vào bàn" cho ghế (−29,1; 5) — tầm bàn chơi 1,5 m', () => {
    const s = seatInRange(banChoi, -28, 5, 0);
    expect(s).toBe(banChoi[0]);
    expect(SEAT_LABEL[s!.kind]).toBe('Vào bàn');
    // 1,3 m: trong tầm bàn chơi (1,5) nhưng ngoài tầm án thư / bàn trà (1,2)
    expect(seatInRange([{ ...banTra, x: 0, z: 0 }], 0, 1.3, 0)).toBeUndefined();
    expect(seatInRange([{ ...banChoi[0], x: 0, z: 0 }], 0, 1.3, 0)).toBeDefined();
  });

  it('R-NGOI-1: hai chỗ trong tầm → chỗ gần nhất', () => {
    expect(seatInRange(banChoi, -31, 5, 0)).toBe(banChoi[1]);
  });

  it('R-NGOI-1 / R-VA-4: chỗ ngồi khác tầng (tầng 2 ngay trên đầu) → không có nút', () => {
    expect(seatInRange([anThu], 0, 0.5, 0)).toBeUndefined();
    expect(seatInRange([anThu], 0, 0.5, 3.2)).toBe(anThu);
  });

  it('R-NGOI-1: đứng ở (−27; 7,5), ghế gần nhất (−29,1; 7,5) 2,1 m → không có nút', () => {
    expect(seatInRange([{ ...banChoi[0], z: 7.5 }], -27, 7.5, 0)).toBeUndefined();
  });
});
