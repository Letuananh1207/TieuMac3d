/**
 * Chân hạc model (L-22): model Tripo tư thế bay, hai chân duỗi thẳng ra sau, không xương → code tự tìm chân, chia trọng
 * số cho xương hông + cổ chân, và tính dáng ĐỨNG (chân thẳng xuống đất, thân nâng bằng chiều dài chân, hơi ngẩng). Thuần
 * (mảng số, không three) — `hacModel.ts` dựng xương, `hac.ts` đặt góc.
 *
 * Cách tìm: chiếu phần giữa thân (|x| nhỏ, bỏ cánh) lên mặt bên (z, y) bằng cách tô các tam giác vào lưới ô; "mở" hình
 * (co rồi nở `OPEN` ô) giữ lại phần dày = thân; phần mảnh còn lại nối với ô thấp nhất = chân (cả hai chân chồng nhau khi
 * nhìn ngang — tách trái / phải theo dấu x). Ô chân sát thân = **hông**, ô chân xa hông nhất = **mút ngón**, **cổ chân**
 * ở `ANKLE_AT` chiều dài chân. Mọi góc quay của dáng đứng quanh trục x (chân nằm trong mặt phẳng dọc thân).
 */
import type { V3 } from './hacCanh';

export interface CraneLegs {
  /** khớp hông chân phải (x > 0; trái đối xứng) */
  hip: V3;
  /** khớp cổ chân phải */
  ankle: V3;
  /** mút ngón chân phải */
  toe: V3;
  /** bán kính ống chân (hông → cổ chân) / bàn chân (cổ chân → ngón), mặt bên — vùng da theo xương */
  legR: number;
  footR: number;
  /** nửa bề ngang một chân theo x quanh |x| = hip[0] */
  halfX: number;
  /** đáy bàn chân thấp hơn khớp cổ chân bấy nhiêu khi đứng (bàn chân nằm ngang) */
  footDrop: number;
}

/** cổ chân ở bấy nhiêu phần chiều dài hông → ngón */
const ANKLE_AT = 0.76;
/** ô lưới = nửa sải / bấy nhiêu */
const CELLS = 100;
/** "mở" hình bấy nhiêu ô (≈ 0,11 m với nửa sải 2,8) — chân mảnh hơn, thân dày hơn */
const OPEN = 4;

/** Dáng đứng (rad): thân ngẩng, chân nghiêng về trước, bàn chân chúi, nhún (chân nghiêng thêm, hông lùi + hạ). */
export const STAND = { pitch: 0.35, lean: 0.15, foot: 0.04, squat: 0.5, squatPitch: 0.3 };

const smooth = (a: number, b: number, v: number): number => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));
/** góc của véc-tơ (dz, dy) trong mặt bên; quay quanh x một góc θ (như three) làm góc này giảm θ */
const angleOf = (dz: number, dy: number): number => Math.atan2(dy, dz);

/** khoảng cách điểm (z, y) tới đoạn a → b */
function segDist(z: number, y: number, a: [number, number], b: [number, number]): number {
  const dz = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dz * dz + dy * dy || 1;
  const t = Math.min(1, Math.max(0, ((z - a[0]) * dz + (y - a[1]) * dy) / l2));
  return Math.hypot(z - a[0] - dz * t, y - a[1] - dy * t);
}

/**
 * Tìm hai chân. `index` = chỉ số tam giác (null = lưới không chỉ số, 3 đỉnh liên tiếp một tam giác). `xLim`: chỉ xét
 * phần |x| < xLim (bỏ cánh). Không thấy chân (không có phần mảnh nào chạm đất nối vào thân) → `null`.
 */
export function measureLegs(pos: ArrayLike<number>, index: ArrayLike<number> | null, halfSpan: number, xLim: number): CraneLegs | null {
  const nv = Math.floor(pos.length / 3);
  const c = halfSpan / CELLS;
  let z0 = Infinity;
  let z1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < nv; i++) {
    if (Math.abs(pos[i * 3]) >= xLim) continue;
    z0 = Math.min(z0, pos[i * 3 + 2]);
    z1 = Math.max(z1, pos[i * 3 + 2]);
    y0 = Math.min(y0, pos[i * 3 + 1]);
    y1 = Math.max(y1, pos[i * 3 + 1]);
  }
  if (!Number.isFinite(z0)) return null;
  const pad = OPEN + 2;
  const nz = Math.ceil((z1 - z0) / c) + 1 + pad * 2;
  const ny = Math.ceil((y1 - y0) / c) + 1 + pad * 2;
  const cz = (z: number): number => Math.floor((z - z0) / c) + pad;
  const cy = (y: number): number => Math.floor((y - y0) / c) + pad;
  const zOf = (u: number): number => z0 + (u - pad + 0.5) * c;
  const yOf = (v: number): number => y0 + (v - pad + 0.5) * c;
  const at = (u: number, v: number): number => v * nz + u;
  let sil: Uint8Array = new Uint8Array(nz * ny);

  // tô tam giác lên mặt bên
  const tri = (a: number, b: number, d: number): void => {
    const ids = [a, b, d];
    if (ids.every((i) => Math.abs(pos[i * 3]) >= xLim)) return;
    const P = ids.map((i) => [pos[i * 3 + 2], pos[i * 3 + 1]] as const);
    for (const [z, y] of P) sil[at(cz(z), cy(y))] = 1;
    const [A, B, C] = P;
    const den = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]);
    if (Math.abs(den) < 1e-12) return;
    const u0 = cz(Math.min(A[0], B[0], C[0]));
    const u1 = cz(Math.max(A[0], B[0], C[0]));
    const v0 = cy(Math.min(A[1], B[1], C[1]));
    const v1 = cy(Math.max(A[1], B[1], C[1]));
    for (let v = v0; v <= v1; v++)
      for (let u = u0; u <= u1; u++) {
        const z = zOf(u);
        const y = yOf(v);
        const l1 = ((B[1] - C[1]) * (z - C[0]) + (C[0] - B[0]) * (y - C[1])) / den;
        const l2 = ((C[1] - A[1]) * (z - C[0]) + (A[0] - C[0]) * (y - C[1])) / den;
        if (l1 >= -1e-9 && l2 >= -1e-9 && l1 + l2 <= 1 + 1e-9) sil[at(u, v)] = 1;
      }
  };
  if (index) for (let t = 0; t + 2 < index.length; t += 3) tri(index[t], index[t + 1], index[t + 2]);
  else for (let t = 0; t + 2 < nv; t += 3) tri(t, t + 1, t + 2);

  const morph = (src: Uint8Array, grow: boolean): Uint8Array => {
    const out = new Uint8Array(src.length);
    for (let v = 1; v < ny - 1; v++)
      for (let u = 1; u < nz - 1; u++) {
        let any = false;
        let all = true;
        for (let dv = -1; dv <= 1; dv++)
          for (let du = -1; du <= 1; du++) {
            const s = src[at(u + du, v + dv)];
            any ||= s === 1;
            all &&= s === 1;
          }
        out[at(u, v)] = (grow ? any : all) ? 1 : 0;
      }
    return out;
  };
  sil = morph(morph(sil, true), false); // lấp lỗ nhỏ
  let body: Uint8Array = sil;
  for (let k = 0; k < OPEN; k++) body = morph(body, false);
  for (let k = 0; k < OPEN; k++) body = morph(body, true);
  const near = morph(body, true);
  const thin = (u: number, v: number): boolean => sil[at(u, v)] === 1 && body[at(u, v)] === 0;

  // các mảng mảnh chạm đáy (3 hàng thấp nhất); lấy mảng lớn nhất
  let low = ny;
  for (let i = 0; i < sil.length && low === ny; i++) if (sil[i]) low = Math.floor(i / nz);
  const seen = new Uint8Array(nz * ny);
  let best: { cells: number[]; contact: number[] } | null = null;
  for (let v = low; v <= low + 2; v++)
    for (let u = 0; u < nz; u++) {
      if (!thin(u, v) || near[at(u, v)] || seen[at(u, v)]) continue;
      const cells: number[] = [];
      const contact: number[] = [];
      const stack = [at(u, v)];
      seen[at(u, v)] = 1;
      while (stack.length) {
        const i = stack.pop() as number;
        cells.push(i);
        const iu = i % nz;
        const iv = Math.floor(i / nz);
        for (let dv = -1; dv <= 1; dv++)
          for (let du = -1; du <= 1; du++) {
            const j = at(iu + du, iv + dv);
            if (seen[j] || !thin(iu + du, iv + dv)) continue;
            seen[j] = 1;
            if (near[j]) contact.push(j);
            else stack.push(j);
          }
      }
      if (contact.length && (!best || cells.length > best.cells.length)) best = { cells, contact };
    }
  if (!best) return null;

  const zy = (i: number): [number, number] => [zOf(i % nz), yOf(Math.floor(i / nz))];
  const hip: [number, number] = [0, 0];
  for (const i of best.contact) {
    const [z, y] = zy(i);
    hip[0] += z / best.contact.length;
    hip[1] += y / best.contact.length;
  }
  let toe = hip;
  for (const i of best.cells) {
    const p = zy(i);
    if (Math.hypot(p[0] - hip[0], p[1] - hip[1]) > Math.hypot(toe[0] - hip[0], toe[1] - hip[1])) toe = p;
  }
  const len = Math.hypot(toe[0] - hip[0], toe[1] - hip[1]);
  if (len < 0.1 * halfSpan) return null;
  const dir: [number, number] = [(toe[0] - hip[0]) / len, (toe[1] - hip[1]) / len];
  const along = ([z, y]: [number, number]): number => (z - hip[0]) * dir[0] + (y - hip[1]) * dir[1];
  // cổ chân: giữa các ô quanh `ANKLE_AT` chiều dài (theo đúng đường cong của chân)
  const ankle: [number, number] = [0, 0];
  let na = 0;
  for (const i of best.cells) {
    const p = zy(i);
    const a = along(p) / len;
    if (Math.abs(a - ANKLE_AT) < 0.04) {
      ankle[0] += p[0];
      ankle[1] += p[1];
      na++;
    }
  }
  if (na) [ankle[0], ankle[1]] = [ankle[0] / na, ankle[1] / na];
  else [ankle[0], ankle[1]] = [hip[0] + dir[0] * len * ANKLE_AT, hip[1] + dir[1] * len * ANKLE_AT];
  const ankleAlong = along(ankle);
  // bán kính: phân vị 85 % khoảng cách ô → trục (chỗ chân nối hông loe ra không làm bán kính phình)
  const dLeg: number[] = [];
  const dFoot: number[] = [];
  for (const i of best.cells) {
    const p = zy(i);
    if (along(p) < ankleAlong) dLeg.push(segDist(p[0], p[1], hip, ankle));
    else dFoot.push(segDist(p[0], p[1], ankle, toe));
  }
  const pct = (d: number[]): number => (d.length ? d.sort((a, b) => a - b)[Math.floor(d.length * 0.85)] : 0) + c / 2;
  const legR = Math.max(c, pct(dLeg));
  const footR = Math.max(c, pct(dFoot));
  // bề ngang theo x: các đỉnh nằm trong ô chân
  const inLeg = new Uint8Array(nz * ny);
  for (const i of best.cells) inLeg[i] = 1;
  let sx = 0;
  let n = 0;
  const xs: number[] = [];
  for (let i = 0; i < nv; i++) {
    const ax = Math.abs(pos[i * 3]);
    if (ax >= xLim || !inLeg[at(cz(pos[i * 3 + 2]), cy(pos[i * 3 + 1]))]) continue;
    sx += ax;
    n++;
    xs.push(ax);
  }
  const legX = n ? sx / n : 0;
  const halfX = xs.reduce((m, x) => Math.max(m, Math.abs(x - legX)), c);
  // đáy bàn chân khi đứng: quay các ô bàn chân quanh cổ chân tới hướng nằm ngang
  const turn = wrap(angleOf(toe[0] - ankle[0], toe[1] - ankle[1]) + STAND.foot);
  let footDrop = c / 2;
  for (const i of best.cells) {
    const p = zy(i);
    if (along(p) < ankleAlong - legR) continue;
    const dz = p[0] - ankle[0];
    const dy = p[1] - ankle[1];
    footDrop = Math.max(footDrop, -(dy * Math.cos(turn) - dz * Math.sin(turn)) + c / 2);
  }
  return {
    hip: [legX, hip[1], hip[0]],
    ankle: [legX, ankle[1], ankle[0]],
    toe: [legX, toe[1], toe[0]],
    legR,
    footR,
    halfX,
    footDrop,
  };
}

/**
 * Trọng số chân của một đỉnh: `w` (0…1, phần còn lại theo thân) · `foot` (phần của `w` theo cổ chân) · `side` (−1 trái,
 * 1 phải). Dải chuyển mềm quanh hông (dọc chân ± 1,5 bán kính, ngang chân 1,3 → 2,3 bán kính) — da hông uốn, không rách.
 */
export function legWeight(x: number, y: number, z: number, L: CraneLegs): { w: number; foot: number; side: number } {
  const side = x < 0 ? -1 : 1;
  const dx = Math.max(0, Math.abs(Math.abs(x) - L.hip[0]) - L.halfX);
  const H: [number, number] = [L.hip[2], L.hip[1]];
  const A: [number, number] = [L.ankle[2], L.ankle[1]];
  const T: [number, number] = [L.toe[2], L.toe[1]];
  const dz = A[0] - H[0];
  const dy = A[1] - H[1];
  const l1 = Math.hypot(dz, dy) || 1;
  const along = ((z - H[0]) * dz + (y - H[1]) * dy) / l1;
  const r1 = Math.hypot(segDist(z, y, H, A), dx);
  const r2 = Math.hypot(segDist(z, y, A, T), dx);
  const near = Math.max(1 - smooth(1.3 * L.legR, 2.3 * L.legR, r1), 1 - smooth(1.3 * L.footR, 2.3 * L.footR, r2));
  const band = 1.5 * L.legR;
  const w = smooth(-band, band, along) * near;
  const foot = smooth(-L.legR, L.legR, along - l1);
  return { w, foot, side };
}

export interface StandPose {
  /** xương gốc (thân): quay quanh x + dời (y, z) */
  pitch: number;
  dy: number;
  dz: number;
  /** xương hông: quay quanh x so với thân */
  leg: number;
  /** xương cổ chân: quay quanh x so với ống chân */
  foot: number;
}

/** quay (y, z) quanh x góc θ như three */
const rot = (y: number, z: number, t: number): [number, number] => [y * Math.cos(t) - z * Math.sin(t), y * Math.sin(t) + z * Math.cos(t)];

/**
 * Dáng đứng: `s` 0 (bay, chân duỗi sau) → 1 (đứng: chân thẳng xuống hơi chếch trước, bàn chân nằm ngang chạm y = 0,
 * thân nâng + ngẩng `STAND.pitch`); `squat` 0…1 nhún (hông lùi + hạ, chân nghiêng, bàn chân giữ nguyên chỗ, thân chúi).
 */
export function standPose(L: CraneLegs, s: number, squat = 0): StandPose {
  const H: [number, number] = [L.hip[2], L.hip[1]];
  const dA: [number, number] = [L.ankle[2] - H[0], L.ankle[1] - H[1]];
  const l1 = Math.hypot(dA[0], dA[1]);
  const psiD = angleOf(dA[0], dA[1]);
  const psiF = angleOf(L.toe[2] - L.ankle[2], L.toe[1] - L.ankle[1]);
  const q = squat * s;
  const pitch = s * -STAND.pitch + q * STAND.squatPitch;
  const psiT = -Math.PI / 2 + STAND.lean + q * STAND.squat;
  const legTotal = s * wrap(psiD - psiT);
  const footTotal = s * wrap(psiF + STAND.foot);
  // cổ chân khi đứng (không nhún): ngay dưới hông lệch theo `lean`, cao `footDrop` — nhún giữ nguyên chỗ này
  const psi0 = -Math.PI / 2 + STAND.lean;
  const ankleZ = H[0] + l1 * Math.cos(psi0);
  const hipStand: [number, number] = [ankleZ - l1 * Math.cos(psiT), L.footDrop - l1 * Math.sin(psiT)];
  const hz = H[0] + (hipStand[0] - H[0]) * s;
  const hy = H[1] + (hipStand[1] - H[1]) * s;
  const [ry, rz] = rot(H[1], H[0], pitch);
  return { pitch, dy: hy - ry, dz: hz - rz, leg: legTotal - pitch, foot: footTotal - legTotal };
}

/** Điểm (y, z) của thân sau dáng `p` (vd. chỗ ngồi). */
export function bodyPoint(p: StandPose, y: number, z: number): [number, number] {
  const [ry, rz] = rot(y, z, p.pitch);
  return [ry + p.dy, rz + p.dz];
}
