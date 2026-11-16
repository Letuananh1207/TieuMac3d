/**
 * Dò mắt trên model `.glb` (R-MAT-1, kế hoạch docs/tasks/2026-11-16-chop-mat.md Q1) — thuần (không three, không DOM), chạy
 * ở bước xử lý model (`scripts/mat-do.mjs` → `design/models/mat.json`), app chỉ đọc số sẵn.
 * 1. `chupMat`: dựng ảnh mặt trước **của chính model** — chiếu trực giao nhìn từ +z, chỉ tam giác thuộc đầu, màu lấy từ
 *    texture theo UV; mỗi điểm ảnh giữ vị trí 3D, pháp tuyến, UV của bề mặt gần nhất.
 * 2. `doMat`: tìm màu da (nhiều nhất ở nửa dưới mặt), vùng da liền chứa giữa mặt, các "lỗ" không phải da nằm trong mặt
 *    (mắt, lông mày, miệng); chọn **cặp** lỗ đối xứng qua trục đầu, cùng độ cao, đủ tối và không chạm tóc — miệng đứng
 *    giữa nên không thành cặp; lông mày mảnh + nhạt hơn mắt nên điểm thấp; tóc mái nối ra ngoài mặt nên bị loại.
 * 3. `luoiMi` (`matLuoi.ts`): lưới bề mặt ôm mặt quanh mỗi mắt (đẩy ra theo pháp tuyến), đổi sang khung xương `Head`; UV một texel da
 *    quanh mắt (mí cùng màu, cùng ngày đêm với mặt — dùng chung texture) và một texel viền mi tối.
 * `MAT_CHINH`: chỉnh tay theo model khi dò lệch (dời / co giãn elip, hoặc tắt chớp).
 */

/** Lưới đầu ở tư thế gốc (khung cảnh của file: mặt trước +z, lên +y). */
export interface LuoiDau {
  /** vị trí đỉnh (x, y, z) — đã áp xương tư thế gốc */
  pos: ArrayLike<number>;
  /** UV (u, v — v từ mép trên ảnh như glTF) */
  uv: ArrayLike<number>;
  index: ArrayLike<number>;
  /** 1 = đỉnh thuộc đầu (trọng số xương đầu ≥ 0,5) */
  dau: ArrayLike<number>;
}

/** Ảnh RGBA 8 bit (texture của model). */
export interface AnhTex {
  w: number;
  h: number;
  data: ArrayLike<number>;
}

/** Ảnh mặt trước: mỗi điểm ảnh — màu, độ sâu (`-Infinity` = trống), vị trí 3D, pháp tuyến, UV. */
export interface AnhMat {
  w: number;
  h: number;
  /** điểm ảnh (0, 0) ở (x0, y1) — góc trên trái; `s` điểm ảnh / đơn vị */
  x0: number;
  y1: number;
  s: number;
  rgb: Float32Array;
  z: Float32Array;
  p: Float32Array;
  n: Float32Array;
  uv: Float32Array;
}

/** Elip của một mắt trên ảnh (điểm ảnh) + mép dưới lông mày phía trên (`may`, y ảnh). */
export interface Elip {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  may: number;
}

export interface KetQuaDo {
  mat: [Elip, Elip] | null;
  /** màu da (0–255) */
  da: [number, number, number];
  /** lý do không dò được */
  loi?: string;
  /** điểm ảnh thuộc mặt (để vẽ ảnh soát) */
  mat_na: Uint8Array;
}

/** Chỉnh tay theo model: dời tâm (phần bán kính), co giãn bán kính; `tat` = không chớp (lý do). */
export interface MatChinh {
  dx?: number;
  dy?: number;
  kx?: number;
  ky?: number;
  tat?: string;
}

/** Chỉnh tay theo model (`npm run model:mat` áp trước khi dựng lưới; soát ảnh 2026-11-16: mọi model khác dò đúng). */
export const MAT_CHINH: Readonly<Record<string, MatChinh>> = {
  'su-phu': { tat: 'mắt vẽ sẵn nhắm cười (^^) — không có mắt mở để chớp' },
  'go-mo': { tat: 'mắt vẽ sẵn nhắm cười (^^) — không có mắt mở để chớp' },
};

export const luma = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;

/** Lấy màu texture (song tuyến) tại UV. */
export function mauTex(tex: AnhTex, u: number, v: number): [number, number, number] {
  const fx = Math.min(tex.w - 1, Math.max(0, u * tex.w - 0.5));
  const fy = Math.min(tex.h - 1, Math.max(0, v * tex.h - 0.5));
  const x = Math.floor(fx);
  const y = Math.floor(fy);
  const tx = fx - x;
  const ty = fy - y;
  const x2 = Math.min(tex.w - 1, x + 1);
  const y2 = Math.min(tex.h - 1, y + 1);
  const out: [number, number, number] = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const at = (xx: number, yy: number): number => tex.data[(yy * tex.w + xx) * 4 + c];
    out[c] = (at(x, y) * (1 - tx) + at(x2, y) * tx) * (1 - ty) + (at(x, y2) * (1 - tx) + at(x2, y2) * tx) * ty;
  }
  return out;
}

/** Dựng ảnh mặt trước của đầu, cạnh dài `size` điểm ảnh. */
export function chupMat(luoi: LuoiDau, tex: AnhTex, size = 320): AnhMat {
  const { pos, uv, index, dau } = luoi;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < dau.length; i++) {
    if (!dau[i]) continue;
    minX = Math.min(minX, pos[i * 3]);
    maxX = Math.max(maxX, pos[i * 3]);
    minY = Math.min(minY, pos[i * 3 + 1]);
    maxY = Math.max(maxY, pos[i * 3 + 1]);
  }
  const span = Math.max(maxX - minX, maxY - minY) * 1.04;
  const s = size / span;
  const x0 = (minX + maxX) / 2 - span / 2;
  const y1 = (minY + maxY) / 2 + span / 2;
  const w = size;
  const h = size;
  const img: AnhMat = {
    w, h, x0, y1, s,
    rgb: new Float32Array(w * h * 3),
    z: new Float32Array(w * h).fill(-Infinity),
    p: new Float32Array(w * h * 3),
    n: new Float32Array(w * h * 3),
    uv: new Float32Array(w * h * 2),
  };
  const P = (i: number, c: number): number => pos[i * 3 + c];
  for (let t = 0; t + 2 < index.length; t += 3) {
    const a = index[t];
    const b = index[t + 1];
    const c = index[t + 2];
    if (!dau[a] || !dau[b] || !dau[c]) continue;
    // pháp tuyến mặt (glTF: ngược chiều kim đồng hồ là mặt trước)
    const ux = P(b, 0) - P(a, 0), uy = P(b, 1) - P(a, 1), uz = P(b, 2) - P(a, 2);
    const vx = P(c, 0) - P(a, 0), vy = P(c, 1) - P(a, 1), vz = P(c, 2) - P(a, 2);
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    if (nz <= 0.02) continue;
    const sx = [a, b, c].map((i) => (P(i, 0) - x0) * s);
    const sy = [a, b, c].map((i) => (y1 - P(i, 1)) * s);
    const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0]);
    if (Math.abs(area) < 1e-9) continue;
    const bx0 = Math.max(0, Math.floor(Math.min(...sx)));
    const bx1 = Math.min(w - 1, Math.ceil(Math.max(...sx)));
    const by0 = Math.max(0, Math.floor(Math.min(...sy)));
    const by1 = Math.min(h - 1, Math.ceil(Math.max(...sy)));
    for (let py = by0; py <= by1; py++)
      for (let px = bx0; px <= bx1; px++) {
        const qx = px + 0.5;
        const qy = py + 0.5;
        const l1 = ((sx[1] - qx) * (sy[2] - qy) - (sx[2] - qx) * (sy[1] - qy)) / area;
        const l2 = ((sx[2] - qx) * (sy[0] - qy) - (sx[0] - qx) * (sy[2] - qy)) / area;
        const l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        const z = l1 * P(a, 2) + l2 * P(b, 2) + l3 * P(c, 2);
        const k = py * w + px;
        if (z <= img.z[k]) continue;
        img.z[k] = z;
        for (let q = 0; q < 3; q++) img.p[k * 3 + q] = l1 * P(a, q) + l2 * P(b, q) + l3 * P(c, q);
        img.n[k * 3] = nx;
        img.n[k * 3 + 1] = ny;
        img.n[k * 3 + 2] = nz;
        const u = l1 * uv[a * 2] + l2 * uv[b * 2] + l3 * uv[c * 2];
        const v = l1 * uv[a * 2 + 1] + l2 * uv[b * 2 + 1] + l3 * uv[c * 2 + 1];
        img.uv[k * 2] = u;
        img.uv[k * 2 + 1] = v;
        const col = mauTex(tex, u, v);
        img.rgb.set(col, k * 3);
      }
  }
  return img;
}

/** Ngưỡng màu da: khoảng cách RGB tới màu da. */
export const DA_NGUONG = 42;
/** Điểm ảnh "tối" (mắt, viền mi): độ sáng dưới phần này của da. */
export const TOI = 0.55;
/** Da: độ sáng trong khoảng này của màu da, tổng lệch sắc độ (r, g, b chia độ sáng) dưới `SAC_NGUONG`. */
const SANG_DA = [0.7, 1.3];
const SAC_NGUONG = 0.2;

interface Lo {
  px: number[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  cx: number;
  cy: number;
  toi: number;
  ra: boolean;
}

/** Dò cặp mắt trên ảnh mặt trước; `midX` = trục giữa đầu (đơn vị model, thường là x xương `Head`). */
export function doMat(img: AnhMat, midX: number): KetQuaDo {
  const { w, h, rgb, z, n } = img;
  const N = w * h;
  const co = (k: number): boolean => z[k] > -Infinity;
  const mid = (midX - img.x0) * img.s;
  let t0 = h;
  let b0 = -1;
  let l0 = w;
  let r0 = -1;
  for (let k = 0; k < N; k++)
    if (co(k)) {
      const x = k % w;
      const y = (k - x) / w;
      t0 = Math.min(t0, y); b0 = Math.max(b0, y); l0 = Math.min(l0, x); r0 = Math.max(r0, x);
    }
  const mat_na = new Uint8Array(N);
  const H = b0 - t0;
  const Wd = r0 - l0;
  // 1. màu da: ô màu nhiều nhất ở nửa dưới, giữa mặt, mặt quay ra trước
  const bins = new Map<number, { c: number; r: number; g: number; b: number }>();
  for (let y = Math.floor(t0 + 0.45 * H); y <= t0 + 0.88 * H; y++)
    for (let x = Math.floor(mid - 0.3 * Wd); x <= mid + 0.3 * Wd; x++) {
      const k = y * w + x;
      if (x < 0 || x >= w || !co(k) || n[k * 3 + 2] < 0.6) continue;
      const r = rgb[k * 3], g = rgb[k * 3 + 1], b = rgb[k * 3 + 2];
      if (luma(r, g, b) < 70) continue;
      const key = (Math.floor(r / 24) << 10) | (Math.floor(g / 24) << 5) | Math.floor(b / 24);
      const e = bins.get(key) ?? { c: 0, r: 0, g: 0, b: 0 };
      e.c++; e.r += r; e.g += g; e.b += b;
      bins.set(key, e);
    }
  let best = { c: 0, r: 0, g: 0, b: 0 };
  for (const e of bins.values()) if (e.c > best.c) best = e;
  if (!best.c) return { mat: null, da: [0, 0, 0], loi: 'không thấy màu da', mat_na };
  const da: [number, number, number] = [best.r / best.c, best.g / best.c, best.b / best.c];
  const lumDa = luma(...da);
  // da: cùng sắc độ (tỉ lệ kênh / độ sáng) với màu da, sáng tối trong khoảng — bóng nướng nửa mặt vẫn là da
  const sacDa = da.map((c) => c / lumDa);
  const laDa = (k: number): boolean => {
    if (!co(k)) return false;
    const l = luma(rgb[k * 3], rgb[k * 3 + 1], rgb[k * 3 + 2]);
    const ti = l / lumDa;
    if (ti < SANG_DA[0] || ti > SANG_DA[1]) return false;
    let d = 0;
    for (let c = 0; c < 3; c++) d += Math.abs(rgb[k * 3 + c] / l - sacDa[c]);
    return d < SAC_NGUONG;
  };

  // 2. vùng da liền chứa giữa mặt
  let seed = -1;
  let sd = Infinity;
  for (let y = Math.floor(t0 + 0.5 * H); y <= t0 + 0.85 * H; y++)
    for (let x = Math.floor(mid - 0.2 * Wd); x <= mid + 0.2 * Wd; x++) {
      const k = y * w + x;
      if (x < 0 || x >= w || !laDa(k)) continue;
      const d = Math.hypot(x - mid, y - (t0 + 0.65 * H));
      if (d < sd) { sd = d; seed = k; }
    }
  if (seed < 0) return { mat: null, da, loi: 'không thấy vùng da giữa mặt', mat_na };
  const lan = (start: number, ok: (k: number) => boolean, mark: Uint8Array | Int32Array, val: number): number[] => {
    const out: number[] = [];
    const st = [start];
    mark[start] = val;
    while (st.length) {
      const k = st.pop()!;
      out.push(k);
      const x = k % w;
      for (const m of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) {
        if (m < 0 || m >= N || mark[m] || !ok(m)) continue;
        mark[m] = val;
        st.push(m);
      }
    }
    return out;
  };
  lan(seed, laDa, mat_na, 1);
  // 3. "lỗ" trong mặt: không phải da nhưng nằm giữa mép mặt theo cả hàng lẫn cột
  const rowL = new Int32Array(h).fill(w), rowR = new Int32Array(h).fill(-1);
  const colT = new Int32Array(w).fill(h), colB = new Int32Array(w).fill(-1);
  for (let k = 0; k < N; k++)
    if (mat_na[k]) {
      const x = k % w, y = (k - x) / w;
      rowL[y] = Math.min(rowL[y], x); rowR[y] = Math.max(rowR[y], x);
      colT[x] = Math.min(colT[x], y); colB[x] = Math.max(colB[x], y);
    }
  const trong = (k: number): boolean => {
    if (mat_na[k]) return false;
    const x = k % w, y = (k - x) / w;
    return x > rowL[y] && x < rowR[y] && y > colT[x] && y < colB[x];
  };
  const nhan = new Int32Array(N);
  const los: Lo[] = [];
  for (let k = 0; k < N; k++) {
    if (nhan[k] || !trong(k)) continue;
    const px = lan(k, trong, nhan, los.length + 1);
    const lo: Lo = { px, minX: w, maxX: -1, minY: h, maxY: -1, cx: 0, cy: 0, toi: 0, ra: false };
    for (const q of px) {
      const x = q % w, y = (q - x) / w;
      lo.minX = Math.min(lo.minX, x); lo.maxX = Math.max(lo.maxX, x);
      lo.minY = Math.min(lo.minY, y); lo.maxY = Math.max(lo.maxY, y);
      lo.cx += x; lo.cy += y;
      if (luma(rgb[q * 3], rgb[q * 3 + 1], rgb[q * 3 + 2]) < TOI * lumDa) lo.toi++;
      // chạm ra ngoài mặt (tóc mái, mép đầu): láng giềng không phải da cũng không phải lỗ
      for (const m of [x > 0 ? q - 1 : -1, x < w - 1 ? q + 1 : -1, q - w, q + w])
        if (m < 0 || m >= N || (!mat_na[m] && !trong(m))) lo.ra = true;
    }
    lo.cx /= px.length;
    lo.cy /= px.length;
    los.push(lo);
  }
  // 4. chọn cặp
  const minA = Math.max(10, 0.0015 * H * Wd);
  const ung = los.filter((l) => l.px.length >= minA && l.toi >= 6 && l.cy > t0 + 0.25 * H);
  const caps: { a: Lo; b: Lo; d: number }[] = [];
  for (const a of ung)
    for (const b of ung) {
      if (!(a.cx < mid - 0.1 * Wd && b.cx > mid + 0.1 * Wd)) continue;
      const dy = Math.abs(a.cy - b.cy) / H;
      const lech = Math.abs(mid - a.cx - (b.cx - mid)) / Wd;
      const ti = Math.min(a.px.length, b.px.length) / Math.max(a.px.length, b.px.length);
      if (dy > 0.07 || lech > 0.12 || ti < 0.35) continue;
      const dang = (l: Lo): number => Math.min(1, (l.maxY - l.minY + 1) / (l.maxX - l.minX + 1) / 0.45);
      const d = (a.toi + b.toi) * (1 - lech * 4) * (1 - dy * 6) * ti * dang(a) * dang(b) * (a.ra || b.ra ? 0.25 : 1);
      if (d > 0) caps.push({ a, b, d });
    }
  caps.sort((p, q) => q.d - p.d);
  // lông mày đậm có thể điểm cao hơn mắt: cặp nằm ngay dưới cặp tốt nhất (chồng theo x) mà đủ tối → đó mới là mắt
  let chon = caps[0];
  for (let lap = 0; chon && lap < 3; lap++) {
    const c = chon;
    const duoi = caps.find((q) => q.d >= 0.2 * c.d && q.a.minY > c.a.maxY && q.b.minY > c.b.maxY && q.a.minX < c.a.maxX && q.a.maxX > c.a.minX && q.a.cy - c.a.cy < 0.13 * H);
    if (!duoi) break;
    chon = duoi;
  }
  const cap: [Lo, Lo] | null = chon ? [chon.a, chon.b] : null;
  if (!cap) return { mat: null, da, loi: 'không thấy cặp mắt đối xứng', mat_na };
  const elip = (l: Lo): Elip => {
    // mép dưới lông mày: dò lên từ đỉnh mắt (giữa ± nửa bán kính), gặp điểm không phải da đầu tiên sau ít nhất 1 hàng da
    const rx = (l.maxX - l.minX + 1) / 2;
    const ry = (l.maxY - l.minY + 1) / 2;
    const cx = (l.minX + l.maxX + 1) / 2;
    let may = l.minY - 1.6 * ry;
    for (let x = Math.round(cx - rx / 2); x <= cx + rx / 2; x++) {
      let thayDa = false;
      for (let y = l.minY - 1; y > l.minY - 1.6 * ry && y >= 0; y--) {
        const k = y * w + x;
        if (mat_na[k]) thayDa = true;
        else if (thayDa) { may = Math.max(may, y + 1); break; }
      }
    }
    return { cx, cy: (l.minY + l.maxY + 1) / 2, rx, ry, may };
  };
  return { mat: [elip(cap[0]), elip(cap[1])], da, mat_na };
}

/** Áp chỉnh tay lên một elip. */
export function apChinh(e: Elip, c: MatChinh | undefined): Elip {
  if (!c) return e;
  return { ...e, cx: e.cx + (c.dx ?? 0) * e.rx, cy: e.cy + (c.dy ?? 0) * e.ry, rx: e.rx * (c.kx ?? 1), ry: e.ry * (c.ky ?? 1) };
}

