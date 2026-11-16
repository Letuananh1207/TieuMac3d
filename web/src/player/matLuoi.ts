/**
 * Lưới mí quanh mắt đã dò (R-MAT-1, kế hoạch docs/tasks/2026-11-16-chop-mat.md) — thuần, chạy ở `scripts/mat-do.mjs`.
 * Kiểu dữ liệu `design/models/mat.json` (app đọc ở `miMat.ts`).
 */
import { DA_NGUONG, luma, TOI, type AnhMat, type Elip } from './matDo';

/** Một mắt trong `mat.json`: lưới bề mặt (khung xương `Head`), elip trong khung lưới, màu da quanh mắt + viền mi. */
export interface MatMot {
  /** (nu × nv) điểm, hàng theo v (từ trên xuống), mỗi điểm x, y, z */
  g: number[];
  /** elip mắt trong khung lưới 0…1: tâm u, tâm v, bán kính u, bán kính v */
  e: [number, number, number, number];
  /** màu da quanh mắt theo `VONG` hướng (góc 0 = phía phải ảnh, tăng theo chiều xuống), "#rrggbb" sRGB như texture */
  vong: string[];
  /** màu viền mi */
  mi: string;
}

/** Một model trong `mat.json`. */
export interface MatModel {
  /** số đỉnh của lưới — khác model đang nạp → dữ liệu cũ, không chớp */
  dinh: number;
  nu: number;
  nv: number;
  mat: MatMot[];
}

/** Lề lưới quanh elip (phần bán kính): ngang, trên, dưới — mí phủ kín nét mắt + viền mi vẽ trên texture. */
export const LE = { ngang: 1.18, tren: 1.2, duoi: 1.15 };
/** Mí đẩy ra khỏi mặt theo pháp tuyến: phần bề ngang mắt (đủ để nội suy lưới thưa không chìm dưới mặt cong). */
const DAY = 0.06;
const LUOI = 9;
/** Số hướng lấy màu da quanh mắt. */
export const VONG = 16;

/** Màu 0–255 → "#rrggbb". */
const hex = (c: readonly number[]): string =>
  `#${c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;

/**
 * Lưới bề mặt quanh một mắt (`LUOI`² điểm, đẩy ra theo pháp tuyến), đổi sang khung xương đầu bằng `veDau`; màu da quanh
 * mắt theo `VONG` hướng (mí tô màu đỉnh nội suy giữa các hướng → mép mí liền với da ngay ngoài nó; hướng không có da —
 * lông mày, tóc — lấy trung vị cả vòng); màu viền mi = trung vị 15 % điểm tối nhất nửa trên mắt. Thiếu bề mặt → `null`.
 */
export function luoiMi(img: AnhMat, e: Elip, da: readonly number[], veDau: (p: [number, number, number]) => [number, number, number]): MatMot | null {
  const { w, h } = img;
  const x0 = e.cx - e.rx * LE.ngang;
  const x1 = e.cx + e.rx * LE.ngang;
  const y0 = Math.max(e.cy - e.ry * LE.tren, Math.min(e.cy - e.ry, e.may + 0.5));
  const y1 = e.cy + e.ry * LE.duoi;
  const day = (DAY * 2 * e.rx) / img.s;
  const trungBinh = (x: number, y: number, r: number, buf: Float32Array): [number, number, number] | null => {
    const o: [number, number, number] = [0, 0, 0];
    let c = 0;
    for (let yy = Math.floor(y - r); yy <= y + r; yy++)
      for (let xx = Math.floor(x - r); xx <= x + r; xx++) {
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const k = yy * w + xx;
        if (img.z[k] === -Infinity) continue;
        o[0] += buf[k * 3];
        o[1] += buf[k * 3 + 1];
        o[2] += buf[k * 3 + 2];
        c++;
      }
    return c ? [o[0] / c, o[1] / c, o[2] / c] : null;
  };
  const g: number[] = [];
  for (let j = 0; j < LUOI; j++)
    for (let i = 0; i < LUOI; i++) {
      const x = x0 + ((x1 - x0) * i) / (LUOI - 1);
      const y = y0 + ((y1 - y0) * j) / (LUOI - 1);
      const p = trungBinh(x, y, 1.5, img.p);
      const nn = trungBinh(x, y, 4, img.n);
      if (!p || !nn) return null;
      const nl = Math.hypot(...nn) || 1;
      const q = veDau([p[0] + (nn[0] / nl) * day, p[1] + (nn[1] / nl) * day, p[2] + (nn[2] / nl) * day]);
      g.push(...q.map((v) => Math.round(v * 1e5) / 1e5));
    }
  const kc = (c: number[], d: readonly number[]): number => Math.hypot(c[0] - d[0], c[1] - d[1], c[2] - d[2]);
  const mau = (x: number, y: number): number[] | null => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= w || yi >= h || img.z[yi * w + xi] === -Infinity) return null;
    const k = (yi * w + xi) * 3;
    return [img.rgb[k], img.rgb[k + 1], img.rgb[k + 2]];
  };
  const trungVi = (cs: number[][]): number[] => [0, 1, 2].map((c) => cs.map((x) => x[c]).sort((a, b) => a - b)[cs.length >> 1]);
  const theoHuong: (number[] | null)[] = [];
  const caVong: number[][] = [];
  for (let a = 0; a < VONG; a++) {
    const t = (2 * Math.PI * a) / VONG;
    const cs: number[][] = [];
    for (let r = 1.15; r <= 1.5; r += 0.05) {
      const c = mau(e.cx + r * e.rx * Math.cos(t), e.cy + r * e.ry * Math.sin(t));
      if (c && kc(c, da) < DA_NGUONG * 1.4) cs.push(c);
    }
    caVong.push(...cs);
    theoHuong.push(cs.length >= 2 ? trungVi(cs.slice(0, 4)) : null);
  }
  if (!caVong.length) return null;
  const tb = trungVi(caVong);
  const lumDa = luma(da[0], da[1], da[2]);
  const toi: number[][] = [];
  for (let y = Math.floor(e.cy - e.ry); y <= e.cy; y++)
    for (let x = Math.floor(e.cx - e.rx); x <= e.cx + e.rx; x++) {
      const c = mau(x, y);
      if (c && luma(c[0], c[1], c[2]) < TOI * lumDa) toi.push(c);
    }
  if (!toi.length) return null;
  toi.sort((p, q) => luma(p[0], p[1], p[2]) - luma(q[0], q[1], q[2]));
  return {
    g,
    e: [(e.cx - x0) / (x1 - x0), (e.cy - y0) / (y1 - y0), e.rx / (x1 - x0), e.ry / (y1 - y0)].map((v) => Math.round(v * 1e4) / 1e4) as MatMot['e'],
    vong: theoHuong.map((c) => hex(c ?? tb)),
    mi: hex(trungVi(toi.slice(0, Math.max(1, Math.ceil(toi.length * 0.15))))),
  };
}

export { LUOI as MAT_LUOI };
