/**
 * Mí mắt bằng code (R-MAT-1, R-MAT-2 — kế hoạch docs/tasks/2026-11-16-chop-mat.md): hai miếng mí ôm mặt gắn vào xương
 * `Head`, dựng từ số dò sẵn `design/models/mat.json` (`npm run model:mat`). Mí trên khép xuống (chớp, lim dim, nhắm), mí dưới
 * đẩy lên (híp cong ^^). Màu đỉnh = màu da ngay quanh mắt (lấy từ texture model khi dò — mép mí liền với da), viền mi = màu
 * nét mi; vật liệu sao từ mặt (không-sáng — tối theo ngày đêm `apGio.ts` như mặt). Hai mắt một lưới, một vật liệu; mở hẳn →
 * ẩn (+0 draw call).
 * Dựng đồng bộ lúc nạp model (trước khi `ngoiMat.ts` gán lớp, `apGio.ts` quét vật liệu).
 */
import * as THREE from 'three';
import type { MatModel, MatMot } from './matLuoi';

/** Số đo dò sẵn theo tên model (file sinh; thiếu file / thiếu mục → không chớp). */
const DATA = (Object.values(import.meta.glob('../../../design/models/mat.json', { eager: true, import: 'default' }))[0] ?? {}) as Record<
  string,
  MatModel | string
>;

/** Số cột mỗi mí (ngang mắt). */
const COT = 6;
/** Mí phủ ra ngoài elip mắt (phần bán kính): ngang, trên, dưới — kín nét mắt + viền mi vẽ trên texture. */
const PHU = { ngang: 1.12, tren: 1.12, duoi: 1.08 };
/** Viền mi tối ở mép mí trên: phần chiều cao mắt (đủ dày khi khép hẳn). */
const VIEN = 0.13;
/** Hình mí: siêu elip mũ 3 — góc mắt vẽ kiểu bo tròn vẫn được phủ. */
const MU = 3;
/** Hàng đỉnh mỗi cột: mí trên 4 (3 ô da) + viền 2 + mí dưới 3 (2 ô). */
const HANG = 9;

/**
 * Toạ độ (u, v) trong khung lưới của đỉnh hàng `j` cột `i` cho mí trên khép `tren`, mí dưới `duoi` (0…1, tổng ≤ 1).
 * u trái → phải, v trên → dưới. Thuần — test `miMat.test.ts`.
 */
export function miUv(e: MatMot['e'], i: number, j: number, tren: number, duoi: number): [number, number] {
  const [cu, cv, ru, rv] = e;
  const q = (2 * i) / COT - 1;
  const u = cu + q * ru * PHU.ngang;
  const hq = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(q), MU)), 1 / MU);
  const top = Math.max(0, cv - rv * PHU.tren * hq);
  const bot = Math.min(1, cv + rv * PHU.duoi * hq);
  const H = bot - top;
  const a = Math.min(1, Math.max(0, tren));
  const b = Math.min(1 - a, Math.max(0, duoi));
  const mep = top + a * H; // mép mí trên
  const vien = Math.min(a * H, VIEN * H * Math.min(1, a * 4));
  const mepDuoi = Math.max(mep, bot - b * H);
  let v: number;
  if (j <= 3) v = top + ((mep - vien - top) * j) / 3; // da mí trên
  else if (j === 4) v = mep - vien; // viền mi (2 hàng riêng — UV tối)
  else if (j === 5) v = mep;
  else v = mepDuoi + ((bot - mepDuoi) * (j - 6)) / 2; // mí dưới
  return [u, v];
}

/** "#rrggbb" sRGB (như texture) → màu tuyến tính cho màu đỉnh (shader giải mã texture sRGB về tuyến tính, màu đỉnh thì không). */
export function tuyenTinh(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number): number => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)];
}

/** Màu da cho đỉnh (u, v): nội suy giữa hai hướng quanh tâm elip gần nhất (`vong` — góc 0 phía phải, tăng theo chiều xuống). */
export function mauVong(vong: readonly (readonly number[])[], e: MatMot['e'], u: number, v: number): readonly number[] {
  const n = vong.length;
  const a = Math.atan2((v - e[1]) / e[3], (u - e[0]) / e[2]);
  const f = (((a / (2 * Math.PI)) * n) % n + n) % n;
  const i = Math.floor(f);
  const t = f - i;
  const p = vong[i];
  const q = vong[(i + 1) % n];
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
}

/** Đỉnh (u, v) → điểm trên lưới bề mặt (song tuyến), ghi vào `out[o..o+2]`. */
function diemLuoi(m: MatModel, g: readonly number[], u: number, v: number, out: Float32Array, o: number): void {
  const fx = Math.min(m.nu - 1.0001, Math.max(0, u * (m.nu - 1)));
  const fy = Math.min(m.nv - 1.0001, Math.max(0, v * (m.nv - 1)));
  const i = Math.floor(fx);
  const j = Math.floor(fy);
  const tx = fx - i;
  const ty = fy - j;
  for (let c = 0; c < 3; c++) {
    const at = (ii: number, jj: number): number => g[(jj * m.nu + ii) * 3 + c];
    out[o + c] = (at(i, j) * (1 - tx) + at(i + 1, j) * tx) * (1 - ty) + (at(i, j + 1) * (1 - tx) + at(i + 1, j + 1) * tx) * ty;
  }
}

/** Mí của một nhân vật. */
export interface MiMat {
  readonly mesh: THREE.Mesh;
  /** mí trên khép `tren`, mí dưới đẩy lên `duoi` (0…1); cả hai ~0 → ẩn */
  dat(tren: number, duoi: number): void;
}

/** Tìm số đo của model: đúng số đỉnh, ưu tiên mục có tên nằm trong đường dẫn file. */
export function timMat(data: Readonly<Record<string, MatModel | string>>, url: string, dinh: number): MatModel | null {
  const hop = Object.entries(data).filter((e): e is [string, MatModel] => typeof e[1] === 'object' && e[1].dinh === dinh);
  const file = url.split(/[\\/]/).pop() ?? '';
  return (hop.find(([k]) => file.startsWith(`${k}.`) || file.startsWith(`${k}-`)) ?? hop[0])?.[1] ?? null;
}

/**
 * Dựng mí cho [model] (cây cảnh của file `.glb`, xương chuẩn) gắn vào xương [head]. Không có số đo / số đỉnh lệch (model
 * đã thay mà chưa dò lại) / không có lưới da → `null` (nhân vật không chớp, không lỗi).
 */
export function createMiMat(model: THREE.Object3D, head: THREE.Bone, url: string, data: Readonly<Record<string, MatModel | string>> = DATA): MiMat | null {
  let skin: THREE.SkinnedMesh | null = null;
  model.traverse((o) => {
    if (!skin && (o as THREE.SkinnedMesh).isSkinnedMesh) skin = o as THREE.SkinnedMesh;
  });
  const s = skin as THREE.SkinnedMesh | null;
  if (!s || Array.isArray(s.material)) return null;
  const m = timMat(data, url, s.geometry.getAttribute('position').count);
  if (!m || m.mat.length !== 2) return null;
  const nv = COT + 1;
  const perEye = nv * HANG;
  const pos = new Float32Array(perEye * 2 * 3);
  const col = new Float32Array(perEye * 2 * 3);
  const vong = m.mat.map((e) => e.vong.map(tuyenTinh));
  const vien = m.mat.map((e) => tuyenTinh(e.mi));
  const idx: number[] = [];
  m.mat.forEach((_e, k) => {
    const base = k * perEye;
    // ô: (j, j+1) trừ chỗ nối da ↔ viền (3–4) và viền ↔ mí dưới (5–6) — đỉnh riêng, màu không loang
    for (let i = 0; i < COT; i++)
      for (const j of [0, 1, 2, 4, 6, 7]) {
        const a = base + i * HANG + j;
        const b = a + HANG;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
  });
  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', posAttr);
  const colAttr = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('color', colAttr);
  geo.setIndex(idx);
  // khối bao: cả lưới bề mặt (mọi độ khép nằm trong) — tính một lần
  const all = m.mat.flatMap((e) => e.g);
  geo.boundingSphere = new THREE.Sphere().setFromPoints(
    Array.from({ length: all.length / 3 }, (_, i) => new THREE.Vector3(all[i * 3], all[i * 3 + 1], all[i * 3 + 2])),
  );
  // vật liệu sao từ mặt: cùng màu / kiểu (không-sáng → `apGio.ts` tối theo đêm như mặt), màu đỉnh thay texture, nhích lên
  // trước mặt để không lẫn độ sâu
  const mat = (s.material as THREE.Material).clone() as THREE.MeshBasicMaterial;
  if ('map' in mat) mat.map = null;
  mat.vertexColors = true;
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -2;
  mat.polygonOffsetUnits = -4;
  mat.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'mi-mat';
  mesh.visible = false;
  head.add(mesh);
  let last = -1;
  return {
    mesh,
    dat(tren, duoi) {
      const a = Math.min(1, Math.max(0, tren));
      const b = Math.min(1 - a, Math.max(0, duoi));
      mesh.visible = a + b > 0.02;
      if (!mesh.visible) return;
      const key = Math.round(a * 1000) * 1001 + Math.round(b * 1000);
      if (key === last) return;
      last = key;
      m.mat.forEach((e, k) => {
        for (let i = 0; i <= COT; i++)
          for (let j = 0; j < HANG; j++) {
            const [u, v] = miUv(e.e, i, j, a, b);
            const o = (k * perEye + i * HANG + j) * 3;
            diemLuoi(m, e.g, u, v, pos, o);
            const c = j === 4 || j === 5 ? vien[k] : mauVong(vong[k], e.e, u, v);
            col[o] = c[0];
            col[o + 1] = c[1];
            col[o + 2] = c[2];
          }
      });
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    },
  };
}
