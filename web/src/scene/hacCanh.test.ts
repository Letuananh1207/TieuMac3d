import { describe, expect, it } from 'vitest';
import { blendBands, craneWeights, measureCrane, spanYaw, yawed } from './hacCanh';

/** Lưới giả: thân bầu dục + cổ vươn trước + chân + hai cánh tấm mỏng từ |x| = 0,35 tới 2,8 (vai thật 0,35). */
function fakeCrane(): Float32Array {
  const p: number[] = [];
  for (let a = 0; a <= 12; a++)
    for (let b = 0; b < 16; b++) {
      const th = (a / 12) * Math.PI;
      const ph = (b / 16) * Math.PI * 2;
      p.push(0.4 * Math.sin(th) * Math.cos(ph), 1.4 + 0.35 * Math.cos(th), 0.8 * Math.sin(th) * Math.sin(ph));
    }
  for (let k = 0; k <= 10; k++) for (const dx of [-0.05, 0.05]) p.push(dx, 1.6 + 0.07 * k, 0.7 + 0.09 * k);
  for (const x of [-0.1, 0.1]) for (let k = 0; k <= 8; k++) p.push(x, 0.1 + 0.1 * k, -0.6);
  for (const side of [-1, 1])
    for (let x = 0.35; x <= 2.8001; x += 0.05)
      for (let z = -0.5; z <= 0.4001; z += 0.1) for (const dy of [-0.02, 0.02]) p.push(side * x, 1.5 + 0.03 * x + dy, z);
  return Float32Array.from(p);
}

const pos = fakeCrane();
const shape = measureCrane(pos);
const w = craneWeights(pos, shape);
const count = pos.length / 3;
/** trọng số của xương `bone` ở đỉnh i */
const wOf = (i: number, bone: number): number => {
  let s = 0;
  for (let k = 0; k < 4; k++) if (w.index[i * 4 + k] === bone) s += w.weight[i * 4 + k];
  return s;
};
const find = (x: number, y: number, z: number): number => {
  let best = 0;
  let d = Infinity;
  for (let i = 0; i < count; i++) {
    const e = Math.hypot(pos[i * 3] - x, pos[i * 3 + 1] - y, pos[i * 3 + 2] - z);
    if (e < d) [best, d] = [i, e];
  }
  return best;
};

describe('hạc model — đo dáng, chia trọng số (kế hoạch 2026-11-16-hac-model NV1)', () => {
  it('đo vai sai ≤ 10 % nửa sải, khớp đầu cánh giữa vai và mút, nửa sải đúng', () => {
    expect(shape.halfSpan).toBeCloseTo(2.8, 2);
    expect(Math.abs(shape.shoulder[0] - 0.35)).toBeLessThanOrEqual(0.1 * shape.halfSpan);
    expect(shape.shoulder[1]).toBeGreaterThan(1.3);
    expect(shape.shoulder[1]).toBeLessThan(1.7);
    expect(shape.tip[0]).toBeGreaterThan(shape.shoulder[0] + 0.5);
    expect(shape.tip[0]).toBeLessThan(2.8);
  });

  it('đỉnh lưng = đỉnh thân (1,75), không lấy cổ / đầu; chỗ ngồi cao hơn 0,11 m, giữa hai vai', () => {
    expect(shape.backTop).toBeCloseTo(1.75, 2);
    expect(shape.seat[1]).toBeCloseTo(1.86, 2);
    expect(shape.seat[0]).toBe(0);
    expect(Math.abs(shape.seat[2])).toBeLessThan(0.3);
  });

  it('thân (giữa lưng, cổ, chân) đi theo gốc; mút cánh đi theo xương đầu cánh đúng bên', () => {
    for (const i of [find(0, 1.75, 0), find(0.05, 2.3, 1.6), find(0.1, 0.1, -0.6)]) expect(wOf(i, 0)).toBeCloseTo(1, 5);
    expect(wOf(find(2.8, 1.58, 0), 4)).toBeCloseTo(1, 5); // phải
    expect(wOf(find(-2.8, 1.58, 0), 2)).toBeCloseTo(1, 5); // trái
    expect(wOf(find(1.2, 1.54, 0), 3)).toBeGreaterThan(0.9); // giữa cánh phải: vai
  });

  it('dải chuyển mềm quanh vai: trọng số cánh tăng dần, không nhảy bậc', () => {
    const [a, b] = blendBands(shape).shoulder;
    expect(a).toBeLessThan(shape.shoulder[0]);
    expect(b).toBeGreaterThan(shape.shoulder[0]);
    const xs = Array.from({ length: 21 }, (_, k) => a + ((b - a) * k) / 20);
    const tmp = craneWeights(Float32Array.from(xs.flatMap((x) => [x, 1.5, 0])), shape);
    // phần thân = trọng số của xương 0 (thứ tự trong 4 ô theo độ nặng)
    const bodyW = (k: number): number => [0, 1, 2, 3].reduce((t, j) => t + (tmp.index[k * 4 + j] === 0 ? tmp.weight[k * 4 + j] : 0), 0);
    const wing = xs.map((_, k) => 1 - bodyW(k));
    expect(wing[0]).toBeCloseTo(0, 5);
    expect(wing[20]).toBeCloseTo(1, 5);
    for (let k = 1; k <= 20; k++) {
      expect(wing[k]).toBeGreaterThanOrEqual(wing[k - 1]);
      expect(wing[k] - wing[k - 1]).toBeLessThan(0.2);
    }
  });

  it('mọi đỉnh: tổng trọng số 1, không âm', () => {
    for (let i = 0; i < count; i++) {
      let s = 0;
      for (let k = 0; k < 4; k++) {
        expect(w.weight[i * 4 + k]).toBeGreaterThanOrEqual(0);
        s += w.weight[i * 4 + k];
      }
      expect(s).toBeCloseTo(1, 5);
    }
  });

  it('đối xứng: đỉnh soi gương qua x = 0 cùng trọng số, xương bên kia', () => {
    for (const [x, y, z] of [[0.4, 1.51, 0], [1.5, 1.55, -0.3], [2.4, 1.57, 0.2]]) {
      const r = find(x, y, z);
      const l = find(-x, y, z);
      expect(wOf(l, 0)).toBeCloseTo(wOf(r, 0), 5);
      expect(wOf(l, 1)).toBeCloseTo(wOf(r, 3), 5);
      expect(wOf(l, 2)).toBeCloseTo(wOf(r, 4), 5);
    }
  });

  it('lưới xoay 90° (sải dọc z) → spanYaw π/2, xoay về đo ra như cũ', () => {
    expect(spanYaw(pos)).toBe(0);
    const rot = yawed(pos, -Math.PI / 2);
    expect(spanYaw(rot)).toBeCloseTo(Math.PI / 2, 9);
    const back = measureCrane(yawed(rot, spanYaw(rot)));
    expect(back.halfSpan).toBeCloseTo(shape.halfSpan, 4);
    expect(back.shoulder[0]).toBeCloseTo(shape.shoulder[0], 4);
    expect(back.backTop).toBeCloseTo(shape.backTop, 4);
  });
});
