/**
 * Lưới hạc giả cho test (`hacChan.test.ts`, `hacModel.test.ts`) — không dùng trong app. Thuần (mảng số).
 */
type P = [number, number, number];

/** tam giác lưới vòng: `ring(i, k)` → điểm thứ k của vòng i (nRing vòng × nSeg điểm) */
export function grid(nRing: number, nSeg: number, ring: (i: number, k: number) => P, out: number[]): void {
  for (let i = 0; i < nRing - 1; i++)
    for (let k = 0; k < nSeg; k++) {
      const a = ring(i, k);
      const b = ring(i, (k + 1) % nSeg);
      const c = ring(i + 1, (k + 1) % nSeg);
      const d = ring(i + 1, k);
      out.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
}

/** ống tròn bán kính r từ a tới b (trục trong mặt phẳng y–z), dịch theo x */
function tube(a: P, b: P, r: number, out: number[]): void {
  const dz = b[2] - a[2];
  const dy = b[1] - a[1];
  const l = Math.hypot(dz, dy);
  const n: [number, number] = [dz / l, -dy / l]; // pháp tuyến trong y–z: (ny, nz)
  grid(9, 8, (i, k) => {
    const t = i / 8;
    const ph = (k / 8) * Math.PI * 2;
    const cx = a[0] + (b[0] - a[0]) * t + r * Math.cos(ph);
    return [cx, a[1] + dy * t + n[0] * r * Math.sin(ph), a[2] + dz * t + n[1] * r * Math.sin(ph)];
  }, out);
}

/**
 * Hạc giả tư thế bay như model Tripo: thân bầu dục (y 0,1…0,9 quanh z = 0), đuôi phía trên sau, cổ vươn ngang + đầu + mỏ trước, hai cánh
 * tấm mỏng, **hai chân duỗi thẳng ra sau** (hông z = −0,7 y 0,3 → cổ chân z = −2 y 0,12 → ngón z = −2,4 y 0,08, x = ±0,12).
 */
export function fakeFlyingCrane(): Float32Array {
  const p: number[] = [];
  grid(13, 16, (i, k) => {
    const th = (i / 12) * Math.PI;
    const ph = (k / 16) * Math.PI * 2;
    return [0.45 * Math.sin(th) * Math.cos(ph), 0.5 + 0.4 * Math.sin(th) * Math.sin(ph), 1.1 * Math.cos(th)];
  }, p);
  tube([0, 0.65, -1.0], [0, 0.6, -1.7], 0.18, p); // đuôi
  tube([0, 0.75, 0.9], [0, 0.85, 1.9], 0.12, p); // cổ vươn ngang
  grid(9, 10, (i, k) => {
    const th = (i / 8) * Math.PI;
    const ph = (k / 10) * Math.PI * 2;
    return [0.2 * Math.sin(th) * Math.cos(ph), 0.9 + 0.2 * Math.sin(th) * Math.sin(ph), 2.15 + 0.3 * Math.cos(th)];
  }, p); // đầu
  tube([0, 0.9, 2.4], [0, 0.85, 2.9], 0.04, p); // mỏ
  for (const x of [-0.12, 0.12]) {
    tube([x, 0.3, -0.6], [x, 0.12, -2.0], 0.06, p);
    tube([x, 0.12, -2.0], [x, 0.08, -2.4], 0.07, p);
  }
  for (const side of [-1, 1]) {
    // cánh: tấm mỏng hai mặt từ |x| 0,4 tới 2,8 ở y ≈ 0,8
    grid(25, 4, (i, k) => {
      const x = side * (0.4 + i * 0.1);
      const corner: [number, number][] = [[-0.5, -0.02], [0.4, -0.02], [0.4, 0.02], [-0.5, 0.02]];
      return [x, 0.8 + corner[k][1], corner[k][0]];
    }, p);
  }
  return Float32Array.from(p);
}
