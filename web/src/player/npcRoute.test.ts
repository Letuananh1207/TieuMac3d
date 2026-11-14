import { describe, expect, it } from 'vitest';
import {
  BLOCK_SAY_AFTER,
  buildRoute,
  clockDistance,
  inHourPause,
  isBlocking,
  pointAt,
  RouteWalker,
  walkedSeconds,
  type XZ,
} from './npcRoute';

/** Hình vuông 10 m × 10 m, đi ngược chiều kim đồng hồ nhìn từ trên: (0;0) → (0;10) → (10;10) → (10;0). */
const square: XZ[] = [
  [0, 0],
  [0, 10],
  [10, 10],
  [10, 0],
];
const vn = (h: number, mi = 0, s = 0): number => Date.UTC(2026, 10, 14, h - 7, mi, s);

describe('Đường đi Lão Canh', () => {
  it('R-NPC-7: đường khép kín — dài 40 m, điểm và hướng theo quãng, quấn vòng', () => {
    const r = buildRoute(square);
    expect(r.length).toBe(40);
    expect(pointAt(r, 5)).toMatchObject({ x: 0, z: 5 });
    expect(pointAt(r, 5).yaw).toBeCloseTo(0, 9); // đi về +z
    expect(pointAt(r, 15)).toMatchObject({ x: 5, z: 10 });
    expect(pointAt(r, 15).yaw).toBeCloseTo(Math.PI / 2, 9); // đi về +x
    const w = pointAt(r, 45);
    expect(w.x).toBeCloseTo(0, 9);
    expect(w.z).toBeCloseTo(5, 9);
  });

  it('R-NPC-7: ở góc xoay mượt — đúng góc là nửa đường giữa hai hướng, không giật', () => {
    const r = buildRoute(square);
    expect(pointAt(r, 10).yaw).toBeCloseTo(Math.PI / 4, 6);
    expect(pointAt(r, 9.99).yaw).toBeCloseTo(Math.PI / 4, 1);
    expect(pointAt(r, 10.01).yaw).toBeCloseTo(Math.PI / 4, 1);
  });

  it('R-NPC-7: chỗ đứng theo đồng hồ thật — cùng giờ thì cùng chỗ, mỗi giây đi đúng tốc độ', () => {
    const r = buildRoute(square);
    const a = pointAt(r, clockDistance(vn(10, 5), 1.1));
    const b = pointAt(r, clockDistance(vn(10, 5), 1.1));
    expect(a).toEqual(b);
    expect(clockDistance(vn(10, 5, 1), 1.1) - clockDistance(vn(10, 5), 1.1)).toBeCloseTo(1.1, 5);
  });

  it('R-NPC-8: đầu mỗi giờ dừng 12 s (quãng không tăng), sau đó đi tiếp', () => {
    expect(inHourPause(vn(9, 0, 5))).toBe(true);
    expect(inHourPause(vn(9, 0, 12))).toBe(false);
    expect(walkedSeconds(vn(9, 0, 11))).toBe(walkedSeconds(vn(9, 0, 0)));
    expect(walkedSeconds(vn(9, 0, 0)) - walkedSeconds(vn(8, 59, 59))).toBeCloseTo(1, 9);
    expect(walkedSeconds(vn(9, 0, 13)) - walkedSeconds(vn(9, 0, 12))).toBeCloseTo(1, 9);
  });

  it('R-NPC-7: qua nửa đêm không nhảy chỗ', () => {
    const t = Date.UTC(2026, 10, 14, 17, 0, 0); // 0:00 ngày 15 giờ VN
    expect(walkedSeconds(t + 15_000) - walkedSeconds(t - 1000)).toBeCloseTo(1 + 3, 9);
  });

  it('R-NPC-7: chặn = người chơi trước mặt trong ±60°, cách < 1,3 m', () => {
    expect(isBlocking(0, 0, 0, 0, 1)).toBe(true);
    expect(isBlocking(0, 0, 0, 0.5, 0.8)).toBe(true); // ~32°
    expect(isBlocking(0, 0, 0, 1, 0.2)).toBe(false); // ~79°, bên hông
    expect(isBlocking(0, 0, 0, 0, -1)).toBe(false); // sau lưng
    expect(isBlocking(0, 0, 0, 0, 1.3)).toBe(false);
  });

  it('R-NPC-7: bị chặn → đứng chờ; quá 3 s nói một lần; tránh ra → đi nhanh ×1,3 tới khi hết nợ', () => {
    const r = buildRoute(square);
    const w = new RouteWalker(r, 1.1);
    let target = 2;
    const far: XZ = [50, 50];
    w.step(0.1, { target, talking: false, hidden: false, player: far });
    const blocker: XZ = [0, 2.8]; // trước mặt (đi về +z), cách 0,8
    let said = 0;
    for (let i = 0; i < 50; i++) {
      target += 0.11;
      const st = w.step(0.1, { target, talking: false, hidden: false, player: blocker });
      expect(st.mps).toBe(0);
      expect(st.z).toBeCloseTo(2, 9);
      if (st.sayBlocked) said++;
    }
    expect(said).toBe(1);
    expect(BLOCK_SAY_AFTER).toBe(3);
    expect(w.debt(target)).toBeCloseTo(5.5, 6);
    const st = w.step(0.1, { target: target + 0.11, talking: false, hidden: false, player: far });
    expect(st.mps).toBeCloseTo(1.1 * 1.3, 6);
  });

  it('R-NPC-7: thoại 30 s → đứng, quay về phía người chơi; đóng → đuổi kịp trong ≈ 100 s', () => {
    const r = buildRoute(square);
    const w = new RouteWalker(r, 1.1);
    let target = 1;
    w.step(0.1, { target, talking: false, hidden: false, player: [50, 50] });
    for (let i = 0; i < 300; i++) {
      target += 0.11;
      const st = w.step(0.1, { target, talking: true, hidden: false, player: [2, 1] });
      expect(st.yaw).toBeCloseTo(Math.PI / 2, 6); // người chơi ở phía +x
    }
    expect(w.debt(target)).toBeCloseTo(33, 6);
    let t = 0;
    while (w.debt(target) > 1e-6 && t < 200) {
      target += 0.11;
      w.step(0.1, { target, talking: false, hidden: false, player: [50, 50] });
      t += 0.1;
    }
    expect(t).toBeGreaterThan(95);
    expect(t).toBeLessThan(105);
  });

  it('R-NPC-7: đang ẩn (ngoài 35 m) → nhảy thẳng về đúng chỗ theo giờ', () => {
    const r = buildRoute(square);
    const w = new RouteWalker(r, 1.1);
    w.step(0.1, { target: 1, talking: false, hidden: false, player: [50, 50] });
    for (let i = 0; i < 100; i++) w.step(0.1, { target: 1, talking: true, hidden: false, player: [2, 1] });
    const st = w.step(0.1, { target: 20, talking: false, hidden: true, player: [50, 50] });
    expect(w.debt(20)).toBe(0);
    expect(st.x).toBeCloseTo(10, 9);
    expect(st.z).toBeCloseTo(10, 9);
  });
});
