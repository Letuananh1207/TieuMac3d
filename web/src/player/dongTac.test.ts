import { describe, expect, it } from 'vitest';
import { DongTac, LOOK_MAX, NOD_TIME, TINH, TINH_IDS, lookYaw } from './dongTac';

const deg = (r: number): number => (r * 180) / Math.PI;
const run = (d: DongTac, secs: number, mps: number, look: number | null = null): void => {
  for (let i = 0; i < secs * 60; i++) d.update(1 / 60, { mps, look });
};

describe('R-NPC-10: nhìn người chơi', () => {
  it('R-NPC-10: thủ thư nhìn nam ở (0; 0) — người chơi (1; 3) phía trước → quay ~18°', () => {
    expect(deg(lookYaw(0, 0, 0, 1, 3)!)).toBeCloseTo(18.4, 0);
  });
  it('R-NPC-10: người chơi gần ngang vai (3,9; 0,5) → kẹp ở 70°', () => {
    expect(lookYaw(0, 0, 0, 3.9, 0.5)).toBeCloseTo(LOOK_MAX, 6);
  });
  it('R-NPC-10: sau lưng (0; −2) hoặc xa 5 m (0; 5) → không quay', () => {
    expect(lookYaw(0, 0, 0, 0, -2)).toBeNull();
    expect(lookYaw(0, 0, 0, 0, 5)).toBeNull();
  });
  it('R-NPC-10: đang thoại thì nhìn cả khi người chơi hơi lệch sau (vẫn kẹp 70°)', () => {
    const y = lookYaw(0, 0, 0, 1, -0.3, true);
    expect(y).not.toBeNull();
    expect(Math.abs(y!)).toBeLessThanOrEqual(LOOK_MAX + 1e-9);
  });
  it('R-NPC-10: tính theo hướng NPC — NPC nhìn đông (rotY 90°), người chơi phía đông → nhìn thẳng', () => {
    expect(lookYaw(0, 0, Math.PI / 2, 3, 0)).toBeCloseTo(0, 6);
  });
  it('R-NPC-10: đầu quay mượt về phía người chơi, thân (hông) không xoay; người chơi đi khỏi → quay về', () => {
    const d = new DongTac(TINH['diem-tinh'], 1);
    const want = lookYaw(0, 0, 0, 1, 3)!;
    d.update(1 / 60, { mps: 0, look: want });
    expect(d.pose.j.head[1]).toBeLessThan(want * 0.5); // không giật ngay
    run(d, 3, 0, want);
    const total = d.pose.j.head[1] + d.pose.j.neck[1] + d.pose.j.chest[1];
    expect(total).toBeCloseTo(want, 1);
    expect(d.pose.j.hips[1]).toBeCloseTo(0, 6);
    run(d, 6, 0, null);
    expect(Math.abs(d.pose.j.neck[1])).toBeLessThan(0.05);
  });
});

describe('R-NPC-10: gật đầu khi thoại', () => {
  it('R-NPC-10: gật một lần — đầu cúi rồi về, hết sau NOD_TIME', () => {
    const d = new DongTac(TINH['diem-tinh'], 2);
    run(d, 1, 0);
    const before = d.pose.j.head[0];
    d.nodOnce();
    run(d, NOD_TIME / 2, 0);
    expect(d.pose.j.head[0] - before).toBeGreaterThan(0.08);
    run(d, NOD_TIME, 0);
    expect(Math.abs(d.pose.j.head[0] - before)).toBeLessThan(0.05);
  });
});

describe('R-NPC-10: đi / đứng mềm', () => {
  it('R-NPC-10: nhịp bước theo tốc độ — đi nhanh gấp đôi thì pha chạy gấp đôi', () => {
    const a = new DongTac(TINH['diem-tinh']);
    const b = new DongTac(TINH['diem-tinh']);
    run(a, 2, 1.2);
    run(b, 2, 2.4);
    expect(b.stepPhase / a.stepPhase).toBeCloseTo(2, 1);
  });
  it('R-NPC-10: bắt đầu / dừng có đà — không bật lên đủ bước ngay khung đầu', () => {
    const d = new DongTac(TINH['diem-tinh']);
    d.update(1 / 60, { mps: 1.1 });
    expect(d.moving).toBeLessThan(0.15);
    run(d, 2, 1.1);
    expect(d.moving).toBeGreaterThan(0.8);
    d.update(1 / 60, { mps: 0 });
    expect(d.moving).toBeGreaterThan(0.7);
    run(d, 3, 0);
    expect(d.moving).toBeLessThan(0.01);
  });
  it('R-NPC-10: tay vung ngược chân cùng bên, vai xoay ngược hông', () => {
    const d = new DongTac(TINH['hoat-bat']);
    run(d, 2, 1.1);
    let checked = 0;
    for (let i = 0; i < 120; i++) {
      const p = d.update(1 / 60, { mps: 1.1 });
      const { upLegL, armL, hips, chest } = p.j;
      if (Math.abs(upLegL[0]) > 0.1) {
        // đùi trái ra trước (x âm) → tay trái ra sau (x lớn hơn mức đứng)
        expect(Math.sign(upLegL[0] + 0) === Math.sign(-(armL[0] + TINH['hoat-bat'].tayTruoc))).toBe(true);
        expect(Math.sign(hips[1])).toBe(-Math.sign(chest[1]));
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(10);
  });
  it('R-NPC-10: hông nhún 2 lần mỗi chu kỳ bước', () => {
    const d = new DongTac(TINH['diem-tinh']);
    run(d, 3, 1.1);
    const start = d.stepPhase;
    let peaks = 0;
    let a = d.pose.lift;
    let b = d.update(1 / 120, { mps: 1.1 }).lift;
    while (d.stepPhase - start < 2 * Math.PI) {
      const c = d.update(1 / 120, { mps: 1.1 }).lift;
      if (b > a && b >= c) peaks++;
      a = b;
      b = c;
    }
    expect(peaks).toBe(2);
  });
  it('R-NPC-10: đứng xem 20 giây — có dồn trọng tâm, có nhìn quanh, góc trong giới hạn', () => {
    for (const id of TINH_IDS) {
      const d = new DongTac(TINH[id], 3);
      let maxShift = 0;
      let maxLook = 0;
      for (let i = 0; i < 20 * 60; i++) {
        const p = d.update(1 / 60, { mps: 0 });
        maxShift = Math.max(maxShift, Math.abs(p.j.hips[2]));
        maxLook = Math.max(maxLook, Math.abs(p.j.head[1]));
        for (const e of Object.values(p.j)) for (const v of e) expect(Math.abs(v)).toBeLessThan(1.6);
      }
      expect(maxShift).toBeGreaterThan(TINH[id].donTam * 0.3);
      expect(maxLook).toBeGreaterThan(0.02);
    }
  });
});
