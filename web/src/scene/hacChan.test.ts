import { describe, expect, it } from 'vitest';
import { craneWeights, measureCrane } from './hacCanh';
import { legWeight, measureLegs } from './hacChan';
import type { V3 } from './hacCanh';
import { bodyPoint, rot, STAND, standPose, type StandPose } from './hacDang';
import { fakeFlyingCrane, grid } from './hacGia';

const pos = fakeFlyingCrane();
const shape = measureCrane(pos);
const legs = measureLegs(pos, null, shape.halfSpan, shape.shoulder[0] * 0.9);
const count = pos.length / 3;

const seat: [number, number] = [shape.seat[1], shape.seat[2]];
const pose = (s: number, squat = 0): StandPose => {
  if (!legs) throw new Error('không có chân');
  return standPose(legs, seat, s, squat);
};

/** khớp sau dáng `p` (y, z): hông · gối · cổ chân — như xương three (thân → hông → gối → cổ chân) */
function joints(p: StandPose): { hip: [number, number]; knee: [number, number]; ankle: [number, number]; t: [number, number, number] } {
  if (!legs) throw new Error('không có chân');
  const hip = bodyPoint(p, legs.hip[1], legs.hip[2]);
  const t1 = p.pitch + p.hip;
  const t2 = t1 + p.knee;
  const [ky, kz] = rot(legs.knee[1] - legs.hip[1], legs.knee[2] - legs.hip[2], t1);
  const knee: [number, number] = [hip[0] + ky, hip[1] + kz];
  const [ay, az] = rot(legs.ankle[1] - legs.knee[1], legs.ankle[2] - legs.knee[2], t2);
  return { hip, knee, ankle: [knee[0] + ay, knee[1] + az], t: [t1, t2, t2 + p.foot] };
}

/** áp dáng đứng lên đỉnh i theo trọng số chân (thân / hông / gối / cổ chân) */
function posed(i: number, s: number, squat = 0): [number, number] {
  if (!legs) throw new Error('không có chân');
  const [x, y, z] = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
  const p = pose(s, squat);
  const J = joints(p);
  const seg = (o: [number, number], from: V3, t: number): [number, number] => {
    const [ry, rz] = rot(y - from[1], z - from[2], t);
    return [o[0] + ry, o[1] + rz];
  };
  const parts: [[number, number], number][] = [];
  const w = legWeight(x, y, z, legs);
  parts.push([bodyPoint(p, y, z), 1 - w.w]);
  parts.push([seg(J.hip, legs.hip, J.t[0]), w.w * (1 - w.knee)]);
  parts.push([seg(J.knee, legs.knee, J.t[1]), w.w * (w.knee - w.foot)]);
  parts.push([seg(J.ankle, legs.ankle, J.t[2]), w.w * w.foot]);
  return parts.reduce<[number, number]>((o, [q, k]) => [o[0] + q[0] * k, o[1] + q[1] * k], [0, 0]);
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

  it('đứng (stand = 1): bàn chân chạm y = 0 (không lún, không lơ lửng), dưới khoảng giữa thân; chỗ ngồi cao STAND.seat; thân ngẩng', () => {
    if (!legs) throw new Error('không có chân');
    let low = Infinity;
    for (let i = 0; i < count; i++) low = Math.min(low, posed(i, 1)[0]);
    expect(Math.abs(low)).toBeLessThan(0.04);
    const p = pose(1);
    const J = joints(p);
    const foot = (J.ankle[1] + J.ankle[1] + Math.hypot(legs.toe[1] - legs.ankle[1], legs.toe[2] - legs.ankle[2])) / 2;
    const [sy, sz] = bodyPoint(p, seat[0], seat[1]);
    expect(Math.abs(foot - sz)).toBeLessThan(0.15); // giữa bàn chân ngay dưới chỗ ngồi
    expect(sy).toBeLessThanOrEqual(STAND.seat + 1e-6); // chân ngắn không với tới → hông hạ, chỗ ngồi thấp hơn chút
    expect(sy).toBeGreaterThan(STAND.seat - 0.15);
    expect(p.pitch).toBeLessThan(-0.35); // mũi ngẩng rõ (đuôi hạ)
  });

  it('chân khuỵu kiểu chim: gối nằm sau đường hông → cổ chân, chiều dài từng đoạn giữ nguyên', () => {
    if (!legs) throw new Error('không có chân');
    const J = joints(pose(1));
    const k = (J.knee[0] - J.hip[0]) / (J.ankle[0] - J.hip[0]);
    const lineZ = J.hip[1] + (J.ankle[1] - J.hip[1]) * k;
    expect(J.knee[1]).toBeLessThan(lineZ - 0.05);
    const len = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
    expect(len(J.hip, J.knee)).toBeCloseTo(Math.hypot(legs.knee[1] - legs.hip[1], legs.knee[2] - legs.hip[2]), 5);
  });

  it('stand = 0: dáng bay nguyên vẹn (không dời, không quay)', () => {
    const p = pose(0);
    for (const v of [p.pitch, p.dy, p.dz, p.hip, p.knee, p.foot]) expect(v).toBeCloseTo(0, 9);
  });

  it('nhún (squat = 1): thân hạ, bàn chân giữ nguyên chỗ trên đất', () => {
    const toe = Array.from({ length: count }, (_, i) => i).reduce((b, i) => (pos[i * 3 + 2] < pos[b * 3 + 2] && pos[i * 3] > 0 ? i : b), 0);
    const a = posed(toe, 1, 0);
    const b = posed(toe, 1, 1);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeLessThan(0.05);
    expect(bodyPoint(pose(1, 1), seat[0], seat[1])[0]).toBeLessThan(bodyPoint(pose(1, 0), seat[0], seat[1])[0] - 0.15);
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
