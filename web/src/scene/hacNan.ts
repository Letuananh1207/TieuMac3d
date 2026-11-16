/**
 * Nắn dáng hạc model một lần lúc nạp (V-20261116-104, kế hoạch docs/tasks/2026-11-16-hac-thon.md). Model Tripo kiểu chibi:
 * mình tròn, cổ ngắn, đầu to, cánh ngắn so với thân — chuẩn theo sải 5,6 m thì thân dài 5,6 m, dày 1,1 m (hạc khối 3,6 /
 * 0,65) → trông như vịt. Nắn trên lưới đã chuẩn theo sải, đo bằng `measureCrane` / `measureLegs` / `measureNeck`:
 * 1. **chân** dãn dọc trục hông → mút ngón (chỉ phần chân — trọng số mềm `legWeight`, hông không rách);
 * 2. **thân** co x (|x| < vai; ngoài vai cả cánh dời vào cho liền) + co y quanh trục thân — dải chuyển mềm sang gốc cánh
 *    (theo |x|), sang cổ (theo z); chân không bị co y mà đi theo hông;
 * 3. **cổ** dãn dọc trục gốc cổ → khớp đầu + vuốt mảnh dần; **đầu** thu nhỏ đều quanh khớp đầu;
 * 4. **cánh** dãn ra ngoài vai để khi thu cả con theo `size` (`hacModel.ts` chuẩn lại sải) sải cánh giữ nguyên.
 * Thuần (mảng số, không three). Mọi tham số ở `CRANE_MODEL_TUNE.nan`.
 */
import type { CraneShape } from './hacCanh';
import { legWeight, smooth } from './hacChan';

export interface CraneReshape {
  /** thu cả con (so với lúc chuẩn theo sải) — cánh dãn bù để sải giữ nguyên */
  size: number;
  /** thân co ngang (x) / co dày (y) phần này — 0 = giữ */
  bodyX: number;
  bodyY: number;
  /** cổ dài gấp bấy nhiêu (dọc trục) */
  neck: number;
  /** đầu (và mút cổ) thu còn phần này */
  head: number;
  /** ống chân + bàn chân dài gấp bấy nhiêu */
  legs: number;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Nắn `pos` (x, y, z liên tiếp — sửa tại chỗ) theo dáng `s` đo trên chính lưới đó (cần `s.legs`, `s.neck` nếu nắn chân / cổ). */
export function reshapeCrane(pos: Float32Array, s: CraneShape, r: CraneReshape): void {
  const n = Math.floor(pos.length / 3);
  const X0 = s.shoulder[0];
  // trục thân: giữa bề dày thân quanh chỗ ngồi
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < n; i++) {
    if (Math.abs(pos[i * 3]) < X0 * 0.6 && Math.abs(pos[i * 3 + 2] - s.seat[2]) < 0.15) {
      lo = Math.min(lo, pos[i * 3 + 1]);
      hi = Math.max(hi, pos[i * 3 + 1]);
    }
  }
  const yc = Number.isFinite(lo + hi) ? (lo + hi) / 2 : s.shoulder[1];
  const L = s.legs ?? null;
  const N = s.neck ?? null;
  // trục cổ trong mặt bên (z, y)
  const nb: [number, number] = N ? [N.base[2], N.base[1]] : [0, 0];
  const nLen = N ? Math.hypot(N.head[2] - N.base[2], N.head[1] - N.base[1]) : 0;
  const nd: [number, number] = N && nLen > 0 ? [(N.head[2] - N.base[2]) / nLen, (N.head[1] - N.base[1]) / nLen] : [1, 0];
  // trục chân
  const lLen = L ? Math.hypot(L.toe[2] - L.hip[2], L.toe[1] - L.hip[1]) : 0;
  const ld: [number, number] = L && lLen > 0 ? [(L.toe[2] - L.hip[2]) / lLen, (L.toe[1] - L.hip[1]) / lLen] : [0, -1];
  const squeezeY = (y: number, w: number): number => yc + (y - yc) * (1 - r.bodyY * w);
  const hipShift = L ? squeezeY(L.hip[1], 1) - L.hip[1] : 0;

  for (let i = 0; i < n; i++) {
    let x = pos[i * 3];
    let y = pos[i * 3 + 1];
    let z = pos[i * 3 + 2];
    const ax = Math.abs(x);
    const sg = x < 0 ? -1 : 1;
    // 1. chân: dãn dọc trục, phần ngoài hông
    const lw = L ? legWeight(x, y, z, L).w : 0;
    if (L && lw > 0) {
      const u = Math.max(0, (z - L.hip[2]) * ld[0] + (y - L.hip[1]) * ld[1]);
      const d = (r.legs - 1) * u * lw;
      z += ld[0] * d;
      y += ld[1] * d;
    }
    // 2. thân: co y (mềm theo |x| sang cánh, theo z sang cổ), chân đi theo hông
    const neckU = N ? (z - nb[0]) * nd[0] + (y - nb[1]) * nd[1] : -Infinity;
    const wy = (1 - smooth(X0 * 0.8, X0 * 1.6, ax)) * (1 - smooth(0, nLen * 0.4, neckU));
    y = (1 - lw) * squeezeY(y, wy) + lw * (y + hipShift);
    // co x: trong vai co theo tỉ lệ, ngoài vai dời vào bằng phần vai co (không rách gốc cánh)
    x = sg * (ax < X0 ? ax * (1 - r.bodyX) : ax - r.bodyX * X0);
    // 3. cổ + đầu (toạ độ theo trục cổ, tính lại sau khi co thân)
    if (N && nLen > 0) {
      const u = (z - nb[0]) * nd[0] + (y - nb[1]) * nd[1];
      if (u > 0) {
        const pz = z - nb[0] - nd[0] * u;
        const py = y - nb[1] - nd[1] * u;
        const along = u < nLen ? u * r.neck : nLen * r.neck + (u - nLen) * r.head;
        const k = 1 - (1 - r.head) * smooth(0, nLen, u);
        z = nb[0] + nd[0] * along + pz * k;
        y = nb[1] + nd[1] * along + py * k;
        x *= k;
      }
    }
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
  }
  // 4. cánh: dãn ngoài vai để sau khi thu `size` sải vẫn như cũ
  const X1 = X0 * (1 - r.bodyX);
  let half = 0;
  for (let i = 0; i < n; i++) half = Math.max(half, Math.abs(pos[i * 3]));
  const want = s.halfSpan / clamp01(r.size || 1);
  const kw = half > X1 ? (want - X1) / (half - X1) : 1;
  for (let i = 0; i < n; i++) {
    const ax = Math.abs(pos[i * 3]);
    if (ax > X1) pos[i * 3] = (pos[i * 3] < 0 ? -1 : 1) * (X1 + (ax - X1) * kw);
  }
}
