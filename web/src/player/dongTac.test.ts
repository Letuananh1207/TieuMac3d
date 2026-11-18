import { describe, expect, it } from 'vitest';
import { CHAY, DongTac, LOOK_MAX, NGOI, NOD_TIME, SIT_DROP, TINH, TINH_IDS, lookYaw } from './dongTac';

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
      let maxAngle = 0;
      for (let i = 0; i < 20 * 60; i++) {
        const p = d.update(1 / 60, { mps: 0 });
        maxShift = Math.max(maxShift, Math.abs(p.j.hips[2]));
        maxLook = Math.max(maxLook, Math.abs(p.j.head[1]));
        for (const e of Object.values(p.j)) for (const v of e) maxAngle = Math.max(maxAngle, Math.abs(v));
      }
      expect(maxAngle).toBeLessThan(1.6);
      expect(maxShift).toBeGreaterThan(TINH[id].donTam * 0.3);
      expect(maxLook).toBeGreaterThan(0.02);
    }
  });
});

describe('R-DIEU-5/6/7: chạy, nhảy, ngồi (nhân vật chính xương chuẩn)', () => {
  const maxOver = (d: DongTac, secs: number, mps: number, f: (p: DongTac['pose']) => number): number => {
    let m = 0;
    for (let i = 0; i < secs * 60; i++) m = Math.max(m, f(d.update(1 / 60, { mps })));
    return m;
  };
  it('R-DIEU-5: chạy hết tốc — bước dài hơn, khuỷu gập ~CHAY.khuyu, đổ người nhiều hơn đi bộ', () => {
    const walk = new DongTac(TINH['hoat-bat']);
    const runner = new DongTac(TINH['hoat-bat']);
    run(walk, 2, CHAY.tu);
    run(runner, 2, CHAY.toi);
    expect(runner.running).toBeGreaterThan(0.95);
    expect(walk.running).toBeLessThan(0.01);
    const thighW = maxOver(walk, 1, CHAY.tu, (p) => Math.abs(p.j.upLegL[0]));
    const thighR = maxOver(runner, 1, CHAY.toi, (p) => Math.abs(p.j.upLegL[0]));
    expect(thighR).toBeGreaterThan(thighW + 0.2);
    expect(-runner.pose.j.foreL[0]).toBeGreaterThan(CHAY.khuyu * 0.9);
    expect(runner.pose.j.spine[0]).toBeGreaterThan(walk.pose.j.spine[0]);
  });
  it('R-DIEU-5: nhịp bước khi chạy chậm lại theo CHAY.nhipGiam (bước dài, không đạp nhanh)', () => {
    const a = new DongTac(TINH['hoat-bat']);
    run(a, 2, CHAY.toi);
    const p0 = a.stepPhase;
    run(a, 1, CHAY.toi);
    expect(a.stepPhase - p0).toBeCloseTo(TINH['hoat-bat'].nhip * (1 - CHAY.nhipGiam) * CHAY.toi, 0);
  });
  it('R-DIEU-6: nhảy — gối trước co lên (đùi ra trước, gối gập), tay giang; chạm đất thì về', () => {
    const d = new DongTac(TINH['hoat-bat']);
    run(d, 1, 0);
    for (let i = 0; i < 30; i++) d.update(1 / 60, { mps: 0, air: true });
    expect(d.airborne).toBeGreaterThan(0.95);
    expect(d.pose.j.upLegL[0]).toBeLessThan(-0.6);
    expect(d.pose.j.legL[0]).toBeGreaterThan(1);
    expect(d.pose.j.armL[2]).toBeGreaterThan(-TINH['hoat-bat'].haTay + 0.4);
    run(d, 1, 0);
    expect(d.airborne).toBeLessThan(0.01);
    expect(Math.abs(d.pose.j.upLegL[0])).toBeLessThan(0.1);
  });
  it('R-DIEU-7: ngồi — thân hạ đúng sitDrop, đùi ra trước, gối gập, tay đặt lên gối', () => {
    const d = new DongTac(TINH['hoat-bat']);
    for (let i = 0; i < 60; i++) d.update(1 / 60, { mps: 0, sit: 1, sitDrop: 0.42 });
    expect(d.pose.lift).toBeLessThan(-0.42 + 0.03);
    expect(d.pose.lift).toBeGreaterThan(-0.42 - 0.03);
    expect(d.pose.j.upLegL[0]).toBeCloseTo(NGOI.dui, 6);
    expect(d.pose.j.legR[0]).toBeCloseTo(NGOI.goi, 6);
    expect(d.pose.j.upLegL[2]).toBeGreaterThan(0); // dạng ra (trái +x)
    expect(d.pose.j.upLegR[2]).toBeLessThan(0);
    expect(d.pose.j.foreL[0]).toBeCloseTo(-NGOI.khuyu, 6);
    // không truyền độ hạ → SIT_DROP
    const e = new DongTac(TINH['hoat-bat']);
    for (let i = 0; i < 60; i++) e.update(1 / 60, { mps: 0, sit: 1 });
    expect(e.pose.lift).toBeCloseTo(-SIT_DROP, 1);
  });
  it('R-DIEU-7: sit = 0 không đổi dáng đứng', () => {
    const a = new DongTac(TINH['diem-tinh'], 4);
    const b = new DongTac(TINH['diem-tinh'], 4);
    for (let i = 0; i < 120; i++) {
      const pa = a.update(1 / 60, { mps: 0 });
      const pb = b.update(1 / 60, { mps: 0, sit: 0, air: false });
      expect(pb.lift).toBeCloseTo(pa.lift, 9);
      expect(pb.j.armL[2]).toBeCloseTo(pa.j.armL[2], 9);
    }
  });
});
