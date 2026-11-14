import { describe, expect, it } from 'vitest';
import {
  aimArm,
  ARM_A,
  chibiPose,
  ease,
  handAt,
  HIP_X,
  HIP_Y,
  idleAction,
  lerp,
  type PoseMix,
  scrollGrip,
  SIT_DROP,
} from './chibiPose';
import { CUON_CAO, CUON_NUA_NGANG, CUON_TRUOC } from '../scene/cuonSachNhip';

const REST: PoseMix = { move: 0, run: 0, air: 0, sit: 0, bow: 0, stretch: 0, look: 0, walkT: 0, time: 0 };
const pose = (m: Partial<PoseMix>): ReturnType<typeof chibiPose> => chibiPose({ ...REST, ...m });
const dist = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

describe('Dáng chibi — đường cong nội suy', () => {
  it('ease: 0 → 0, 1 → 1, giữa = 0,5, kẹp ngoài 0..1, tăng đều', () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBeCloseTo(0.5);
    expect(ease(-2)).toBe(0);
    expect(ease(3)).toBe(1);
    for (let x = 0; x < 1; x += 0.05) expect(ease(x + 0.05)).toBeGreaterThanOrEqual(ease(x));
  });
  it('lerp', () => {
    expect(lerp(2, 4, 0.25)).toBe(2.5);
  });
});

describe('Dáng chibi — tay chỉ đúng chỗ (aimArm / handAt)', () => {
  it('tay nghỉ (góc 0) chỉ thẳng xuống; aimArm ngược với handAt', () => {
    const down = handAt(1, { x: 0, z: 0 });
    expect(down.y).toBeCloseTo(1.1 - 0.6);
    for (const d of [
      { x: -0.2, y: -0.3, z: 0.5 },
      { x: 0.3, y: 0.4, z: 0.1 },
      { x: 0, y: -1, z: 0 },
    ]) {
      const a = aimArm(d);
      const h = handAt(1, a);
      const len = Math.hypot(d.x, d.y, d.z);
      // tay chỉ đúng hướng d tính từ vai (+x)
      expect((h.x - 0.25) / 0.6).toBeCloseTo(d.x / len);
      expect((h.y - 1.1) / 0.6).toBeCloseTo(d.y / len);
      expect(h.z / 0.6).toBeCloseTo(d.z / len);
    }
  });
});

describe('Dáng chibi — trạng thái R-DIEU-5…8, R-ON-8', () => {
  it('đứng yên (pha 0): tay chữ A, chân thẳng, thân không hạ', () => {
    const p = pose({});
    expect(p.arms[0].z).toBeCloseTo(-ARM_A);
    expect(p.arms[1].z).toBeCloseTo(ARM_A);
    expect(p.legs[0].x).toBe(0);
    expect(p.legs[0].posY).toBe(HIP_Y);
    expect(p.body.y).toBeCloseTo(0);
  });

  it('đi: chân so le, tay vung ngược chân cùng phía; chạy đổ người và vung mạnh hơn đi (R-DIEU-5)', () => {
    const walk = pose({ move: 1, walkT: Math.PI / 2 });
    expect(walk.legs[0].x).toBeCloseTo(-walk.legs[1].x);
    expect(Math.sign(walk.arms[0].x)).toBe(-Math.sign(walk.legs[0].x));
    const run = pose({ move: 1, run: 1, walkT: Math.PI / 2 });
    expect(run.body.rx).toBeGreaterThan(walk.body.rx);
    expect(Math.abs(run.legs[0].x)).toBeGreaterThan(Math.abs(walk.legs[0].x));
    expect(Math.abs(run.arms[0].x)).toBeGreaterThan(Math.abs(walk.arms[0].x));
  });

  it('nhảy: tay giang cao hơn chữ A, một gối co ra trước (R-DIEU-6)', () => {
    const p = pose({ air: 1 });
    expect(p.arms[1].z).toBeGreaterThan(ARM_A);
    expect(p.arms[0].z).toBeLessThan(-ARM_A);
    expect(p.legs[0].x).toBeLessThan(-0.5);
  });

  it('ngồi xếp bằng: thân hạ SIT_DROP, hai ống chân bắt chéo trước bụng, ủng thò ra dưới gấu áo (R-DIEU-7)', () => {
    const p = pose({ sit: 1 });
    expect(p.body.y).toBeCloseTo(-SIT_DROP);
    for (const [i, s] of [
      [0, -1],
      [1, 1],
    ] as const) {
      const l = p.legs[i];
      // đế ủng (cách khớp hông ~0,33 m); chân xoay ZXY như tay → cùng công thức với handAt
      const len = 0.33;
      const foot = {
        x: s * HIP_X + len * Math.cos(l.x) * Math.sin(l.z),
        y: l.posY - len * Math.cos(l.x) * Math.cos(l.z),
        z: l.posZ - len * Math.sin(l.x),
      };
      expect(s * foot.x).toBeLessThan(0); // sang phía bên kia: bắt chéo
      expect(Math.hypot(foot.x, foot.z)).toBeGreaterThan(0.4); // ra tới mép gấu áo (bán kính ~0,5)
      expect(foot.y).toBeGreaterThan(0); // không chui xuống đất
      expect(foot.y).toBeLessThan(0.25);
    }
  });

  it('ngồi: hai bàn tay ở hai đầu cuộn sách Ngồi ôn, trước ngực (R-ON-8 — cuonSach.ts)', () => {
    const p = pose({ sit: 1 });
    for (const [i, s] of [
      [0, -1],
      [1, 1],
    ] as const) {
      const hand = handAt(s, p.arms[i]);
      // khung thân của người ngồi hạ SIT_DROP → đổi về khung `facing` (gốc = chân)
      const inFacing = { ...hand, y: hand.y - SIT_DROP };
      expect(dist(inFacing, { x: s * CUON_NUA_NGANG, y: CUON_CAO, z: CUON_TRUOC })).toBeLessThan(0.12);
      expect(dist(hand, scrollGrip(s))).toBeLessThan(0.05);
      expect(s * hand.x).toBeGreaterThan(CUON_NUA_NGANG); // ngoài đầu trục, không xuyên giấy
      expect(hand.z).toBeGreaterThan(0.4); // trước thân áo (bán kính ~0,35 ở ngực)
    }
  });

  it('chào 拱手: hai tay chắp gần nhau trước ngực, cúi người (R-DIEU-7)', () => {
    const p = pose({ bow: 1 });
    const l = handAt(-1, p.arms[0]);
    const r = handAt(1, p.arms[1]);
    expect(dist(l, r)).toBeLessThan(0.2);
    expect(l.z).toBeGreaterThan(0.4);
    expect(l.y).toBeGreaterThan(0.7);
    expect(p.body.rx).toBeGreaterThan(0.2);
  });

  it('chuyển dáng mượt: độ hoà đổi ít thì góc đổi ít (không nhảy cóc)', () => {
    for (const key of ['air', 'sit', 'bow', 'stretch'] as const) {
      let prev = pose({ move: 0.5, walkT: 1 });
      for (let t = 0.02; t <= 1.0001; t += 0.02) {
        const cur = pose({ move: 0.5, walkT: 1, [key]: t });
        expect(Math.abs(cur.arms[1].z - prev.arms[1].z)).toBeLessThan(0.1);
        expect(Math.abs(cur.legs[0].x - prev.legs[0].x)).toBeLessThan(0.1);
        expect(Math.abs(cur.body.y - prev.body.y)).toBeLessThan(0.02);
        prev = cur;
      }
    }
  });

  it('đứng lâu (R-DIEU-8): ≤ 6 s không gì; 6 → 8,5 s vươn vai; 14 → 16,5 s nhìn quanh; giữa các lần nghỉ', () => {
    expect(idleAction(5)).toEqual({ stretch: 0, look: 0 });
    expect(idleAction(7.25).stretch).toBeCloseTo(1);
    expect(idleAction(7.25).look).toBe(0);
    expect(idleAction(10)).toEqual({ stretch: 0, look: 0 });
    expect(idleAction(14.6).look).toBeCloseTo(1);
    expect(idleAction(22 + 1.25).stretch).toBeCloseTo(1);
    // vươn vai: hai tay giơ cao quá vai
    const p = pose({ stretch: 1 });
    expect(handAt(1, p.arms[1]).y).toBeGreaterThan(1.5);
    expect(pose({ look: 1 }).head.y).toBeGreaterThan(0.4);
  });
});
