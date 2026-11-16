import { describe, expect, it } from 'vitest';
import { craneWeights, measureCrane } from './hacCanh';
import { bodyPoint, legWeight, measureLegs, standPose } from './hacChan';
import { fakeFlyingCrane, grid } from './hacGia';

const pos = fakeFlyingCrane();
const shape = measureCrane(pos);
const legs = measureLegs(pos, null, shape.halfSpan, shape.shoulder[0] * 0.9);
const count = pos.length / 3;

/** áp dáng đứng lên một điểm theo trọng số chân (như da theo xương, chỉ quay quanh x) */
function posed(i: number, s: number, squat = 0): [number, number] {
  if (!legs) throw new Error('không có chân');
  const x = pos[i * 3];
  const y = pos[i * 3 + 1];
  const z = pos[i * 3 + 2];
  const p = standPose(legs, s, squat);
  const rot = (yy: number, zz: number, t: number): [number, number] => [yy * Math.cos(t) - zz * Math.sin(t), yy * Math.sin(t) + zz * Math.cos(t)];
  const body = bodyPoint(p, y, z);
  // chân: thân → hông quay (pitch + leg) quanh hông → cổ chân quay thêm `foot` quanh cổ chân
  const [hy, hz] = bodyPoint(p, legs.hip[1], legs.hip[2]);
  const tl = p.pitch + p.leg;
  const [ly, lz] = rot(y - legs.hip[1], z - legs.hip[2], tl);
  const leg: [number, number] = [hy + ly, hz + lz];
  const [ay, az] = rot(legs.ankle[1] - legs.hip[1], legs.ankle[2] - legs.hip[2], tl);
  const [fy, fz] = rot(y - legs.ankle[1], z - legs.ankle[2], tl + p.foot);
  const foot: [number, number] = [hy + ay + fy, hz + az + fz];
  const w = legWeight(x, y, z, legs);
  const wb = 1 - w.w;
  const wl = w.w * (1 - w.foot);
  const wf = w.w * w.foot;
  return [body[0] * wb + leg[0] * wl + foot[0] * wf, body[1] * wb + leg[1] * wl + foot[1] * wf];
}

describe('R-HANH-5 (L-22): hạc model đáp xuống đứng trên hai chân — đo chân, dáng đứng', () => {
  it('tìm được hai chân duỗi sau: hông sát thân, ngón ở mút sau, cổ chân giữa, đúng bên x', () => {
    expect(legs).not.toBeNull();
    if (!legs) return;
    expect(legs.hip[2]).toBeGreaterThan(-1.2);
    expect(legs.hip[2]).toBeLessThan(-0.5);
    expect(Math.abs(legs.hip[1] - 0.28)).toBeLessThan(0.15);
    expect(legs.toe[2]).toBeLessThan(-2.3);
    expect(legs.ankle[2]).toBeLessThan(-1.6);
    expect(legs.ankle[2]).toBeGreaterThan(-2.3);
    expect(Math.abs(legs.hip[0] - 0.12)).toBeLessThan(0.05);
    expect(legs.legR).toBeLessThan(0.15);
  });

  it('đỉnh chân theo hông / cổ chân; thân, đuôi (ngay trên chân), cánh không theo chân', () => {
    if (!legs) throw new Error('không có chân');
    expect(legWeight(0.12, 0.2, -1.4, legs).w).toBeCloseTo(1, 3); // ống chân
    expect(legWeight(-0.12, 0.2, -1.4, legs).side).toBe(-1);
    const toe = legWeight(0.12, 0.08, -2.4, legs);
    expect(toe.w * toe.foot).toBeGreaterThan(0.95); // ngón theo cổ chân
    expect(legWeight(0, 0.55, -1.5, legs).w).toBe(0); // đuôi
    expect(legWeight(0, 0.9, 0, legs).w).toBe(0); // lưng
    expect(legWeight(1.5, 0.8, -0.3, legs).w).toBe(0); // cánh
  });

  it('dải chuyển mềm ở hông: trọng số chân tăng dần dọc chân, không nhảy bậc', () => {
    if (!legs) throw new Error('không có chân');
    const dz = legs.ankle[2] - legs.hip[2];
    const dy = legs.ankle[1] - legs.hip[1];
    const ws = Array.from({ length: 41 }, (_, k) => {
      const t = -0.3 + (k / 40) * 0.6;
      return legWeight(legs.hip[0], legs.hip[1] + dy * t, legs.hip[2] + dz * t, legs).w;
    });
    expect(ws[0]).toBeLessThan(0.05);
    expect(ws[40]).toBeGreaterThan(0.95);
    for (let k = 1; k <= 40; k++) expect(Math.abs(ws[k] - ws[k - 1])).toBeLessThan(0.2);
  });

  it('trọng số da có chân: mọi đỉnh tổng 1, không âm', () => {
    const w = craneWeights(pos, { ...shape, legs });
    for (let i = 0; i < count; i++) {
      let s = 0;
      for (let k = 0; k < 4; k++) {
        expect(w.weight[i * 4 + k]).toBeGreaterThanOrEqual(0);
        s += w.weight[i * 4 + k];
      }
      expect(s).toBeCloseTo(1, 5);
    }
  });

  it('đứng (stand = 1): ống chân gần thẳng đứng, bàn chân chạm y = 0 (không lún, không lơ lửng), thân nâng, hơi ngẩng', () => {
    if (!legs) throw new Error('không có chân');
    let low = Infinity;
    for (let i = 0; i < count; i++) low = Math.min(low, posed(i, 1)[0]);
    expect(Math.abs(low)).toBeLessThan(0.04);
    const p = standPose(legs, 1);
    const [hy, hz] = bodyPoint(p, legs.hip[1], legs.hip[2]);
    const tl = p.pitch + p.leg;
    const ay = (legs.ankle[1] - legs.hip[1]) * Math.cos(tl) - (legs.ankle[2] - legs.hip[2]) * Math.sin(tl);
    const az = (legs.ankle[1] - legs.hip[1]) * Math.sin(tl) + (legs.ankle[2] - legs.hip[2]) * Math.cos(tl);
    expect(Math.atan2(Math.abs(az), -ay)).toBeLessThan(0.2); // lệch phương thẳng đứng < ~11°
    expect(hy + ay).toBeGreaterThan(0); // cổ chân trên đất
    expect(hz).toBeDefined();
    // lưng nâng ≈ chiều dài ống chân
    const back = bodyPoint(p, 0.9, 0);
    const leg = Math.hypot(legs.ankle[1] - legs.hip[1], legs.ankle[2] - legs.hip[2]);
    expect(back[0] - 0.9).toBeGreaterThan(leg * 0.8);
    expect(p.pitch).toBeLessThan(0); // mũi ngẩng
  });

  it('stand = 0: dáng bay nguyên vẹn (không dời, không quay)', () => {
    if (!legs) throw new Error('không có chân');
    const p = standPose(legs, 0);
    for (const v of [p.pitch, p.dy, p.dz, p.leg, p.foot]) expect(v).toBeCloseTo(0, 9);
  });

  it('nhún (squat = 1): thân hạ, bàn chân giữ nguyên chỗ trên đất', () => {
    if (!legs) throw new Error('không có chân');
    const toe = Array.from({ length: count }, (_, i) => i).reduce((b, i) => (pos[i * 3 + 2] < pos[b * 3 + 2] && pos[i * 3] > 0 ? i : b), 0);
    const a = posed(toe, 1, 0);
    const b = posed(toe, 1, 1);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeLessThan(0.05);
    expect(bodyPoint(standPose(legs, 1, 1), 0.9, 0)[0]).toBeLessThan(bodyPoint(standPose(legs, 1, 0), 0.9, 0)[0] - 0.15);
  });

  it('không có chân (thân chạm đất, không phần mảnh) → null', () => {
    const p: number[] = [];
    grid(13, 16, (i, k) => {
      const th = (i / 12) * Math.PI;
      const ph = (k / 16) * Math.PI * 2;
      return [0.45 * Math.sin(th) * Math.cos(ph), 0.4 + 0.4 * Math.sin(th) * Math.sin(ph), 1.1 * Math.cos(th)];
    }, p);
    expect(measureLegs(Float32Array.from(p), null, 2.8, 0.5)).toBeNull();
  });
});
