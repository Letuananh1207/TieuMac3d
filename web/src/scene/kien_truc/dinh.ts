import * as THREE from 'three';
import { lambert } from '../materials';
import type { BuildingSpec } from '../spec';
import type { Style } from './chi_tiet';

/**
 * Đình nghỉ chân ở Rừng trúc (docs/tham_khao/rung-truc.md "Đình"): nền đá thấp, 4 / 6 cột gỗ mộc, mái chóp toản tiêm
 * (攢尖) ngói xám xanh hơi vểnh góc, chỏm gỗ; KHÔNG tường — đi vào được. Mộc mạc: không son, không ngói vàng (khác cấp
 * tông môn). Mặt bằng nội tiếp hình tròn đường kính min(w, d). Va chạm: chỉ chân cột (`dinhPillars`, buildings.ts).
 * `eaves: 2` (Vọng Trúc Đình — V-66 B3): mái chồng 重檐 — tầng dưới là vành mái quanh cột, cổ gỗ, tầng trên chóp nhọn
 * cao → mốc nhô trên ngọn trúc. `benches`: ghế tựa giữa các cột (lan can tựa phía ngoài), mỗi ghế một chỗ ngồi (`dinhBenches`).
 */

type Dinh = Pick<BuildingSpec, 'w' | 'd' | 'sides'>;

/** Nền đá cao (m) — thấp, bước lên được không cần bậc. */
export const DINH_BASE_H = 0.3;
/** Mặt ghế tựa cao hơn nền (m); lan can tựa cao hơn mặt ghế (m). */
export const BENCH_H = 0.45;
export const BENCH_RAIL_H = 0.42;
/** Ghế lùi vào trong so với đường nối hai cột (m) — người ngồi trên ghế, lan can ở mép ngoài. */
const BENCH_IN = 0.32;

const sidesOf = (b: Pick<BuildingSpec, 'sides'>): number => (b.sides === 6 ? 6 : 4);

/** Toạ độ cột (trong hệ của đình, trước khi xoay) + bán kính cột — dùng cho va chạm. */
export function dinhPillars(b: Dinh): { x: number; z: number; r: number }[] {
  const n = sidesOf(b);
  const R = Math.min(b.w, b.d) / 2 - 0.45;
  // 4 cột: đặt ở góc (lệch 45°) cho lối vào giữa cạnh; 6 cột: cột ở ±x → một cạnh quay về +z (lối vào trước / sau)
  const a0 = n === 4 ? Math.PI / 4 : 0;
  return Array.from({ length: n }, (_, i) => {
    const a = a0 + (i * 2 * Math.PI) / n;
    return { x: Math.cos(a) * R, z: Math.sin(a) * R, r: 0.16 };
  });
}

/** Cạnh giữa hai cột i, i + 1 có là lối vào không (cạnh trước +z và sau −z để trống). */
function isEntry(n: number, D: number, mx: number, mz: number): boolean {
  return n === 4 ? Math.abs(mz) > Math.abs(mx) : Math.abs(mz) > D * 0.3;
}

/** Một ghế tựa giữa hai cột (hệ của đình): tâm ghế, hướng nhìn ra ngoài (rad, 0 = +z), dài ghế, tâm lan can tựa. */
export interface DinhBench {
  x: number;
  z: number;
  rotY: number;
  len: number;
  railX: number;
  railZ: number;
}

/** Các ghế tựa của đình (`benches`) — chừa hai cạnh lối vào. Thuần (không three). */
export function dinhBenches(b: Dinh): DinhBench[] {
  const n = sidesOf(b);
  const D = Math.min(b.w, b.d);
  const p = dinhPillars(b);
  const out: DinhBench[] = [];
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const c = p[(i + 1) % n];
    const mx = (a.x + c.x) / 2;
    const mz = (a.z + c.z) / 2;
    if (isEntry(n, D, mx, mz)) continue;
    const m = Math.hypot(mx, mz);
    const [ox, oz] = [mx / m, mz / m]; // pháp tuyến ra ngoài
    out.push({ x: mx - ox * BENCH_IN, z: mz - oz * BENCH_IN, rotY: Math.atan2(ox, oz), len: Math.hypot(c.x - a.x, c.z - a.z) - 0.4, railX: mx, railZ: mz });
  }
  return out;
}

/** Mái chóp / vành mái n cạnh: đáy bán kính `eave`, đỉnh `top` (0 = nhọn), cao `h`; mép đáy vểnh lên `lift`. */
function roofRing(eave: number, top: number, h: number, n: number, rot: number, lift: number, sag: number): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(top, eave, h, n, 3, true, rot);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < -h / 2 + 0.01) pos.setY(i, y + lift); // mép mái vểnh
    else if (y < 0) pos.setY(i, y - sag); // võng nhẹ giữa sườn mái
  }
  geo.computeVertexNormals();
  return geo;
}

export function dinh(g: THREE.Group, b: BuildingSpec, style: Style): void {
  const n = sidesOf(b);
  const k = Math.min(3, Math.max(0.5, style.heightScale));
  const D = Math.min(b.w, b.d);
  const baseH = DINH_BASE_H;
  const colH = b.pillarH ?? 2.6 * k;
  // góc đầu của lăng trụ / chóp (three: đỉnh ở (sin θ, cos θ)) khớp vị trí cột
  const rot = n === 4 ? Math.PI / 4 : Math.PI / 6;
  const stone = lambert(style.stone);
  const wood = lambert(b.pillarColor ?? style.pillar);
  const roofMat = lambert(b.roofColor, { flatShading: true });
  const ridge = lambert(b.trim ?? style.ridge);

  // nền đá: lăng trụ n cạnh (thấp — bước lên được, không cần bậc)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(D / 2, D / 2 + 0.15, baseH, n, 1, false, rot), stone);
  base.position.y = baseH / 2;
  g.add(base);

  // cột + xà vòng
  const pillars = dinhPillars(b);
  for (const p of pillars) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, colH, 8), wood);
    c.position.set(p.x, baseH + colH / 2, p.z);
    g.add(c);
  }
  for (let i = 0; i < pillars.length; i++) {
    const a = pillars[i];
    const c = pillars[(i + 1) % pillars.length];
    const len = Math.hypot(c.x - a.x, c.z - a.z);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(len + 0.2, 0.18, 0.16), wood);
    beam.position.set((a.x + c.x) / 2, baseH + colH - 0.12, (a.z + c.z) / 2);
    beam.rotation.y = -Math.atan2(c.z - a.z, c.x - a.x);
    g.add(beam);
    // lan can thấp giữa các cột, chừa cạnh trước (+z) và cạnh sau làm lối vào (có ghế tựa thì lan can là tựa ghế)
    const mz = (a.z + c.z) / 2;
    if (b.benches || isEntry(n, D, (a.x + c.x) / 2, mz)) continue;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len - 0.3, 0.1, 0.1), wood);
    rail.position.set((a.x + c.x) / 2, baseH + 0.55, mz);
    rail.rotation.y = beam.rotation.y;
    g.add(rail);
  }
  if (b.benches) benches(g, b, wood);

  const eave = D / 2 + 0.9;
  const top = baseH + colH;
  const under = new THREE.Mesh(new THREE.CylinderGeometry(eave * 0.92, eave * 0.92, 0.08, n, 1, false, rot), wood);
  under.position.y = top + 0.05;
  g.add(under);
  let apex: number;
  if ((b.eaves ?? 1) >= 2) {
    // mái chồng: vành mái dưới (chóp cụt) → cổ gỗ n cạnh → chóp trên (đáy bằng ~2/3 vành dưới), mép vểnh hơn
    const h1 = 1.1 * k;
    const neckR = D * 0.3;
    const low = new THREE.Mesh(roofRing(eave, neckR, h1, n, rot, 0.32, 0.06 * k), roofMat);
    low.position.y = top + h1 / 2 - 0.05;
    const neckH = 1.0 * k;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(neckR * 0.9, neckR * 0.9, neckH + 0.3, n, 1, false, rot), wood);
    neck.position.y = top + h1 - 0.3 + (neckH + 0.3) / 2;
    const eave2 = neckR + 1.0;
    const h2 = eave2 * 1.35 * k;
    const y2 = top + h1 + neckH;
    const upper = new THREE.Mesh(roofRing(eave2, 0, h2, n, rot, 0.3, 0.12 * k), roofMat);
    upper.position.y = y2 + h2 / 2 - 0.05;
    const under2 = new THREE.Mesh(new THREE.CylinderGeometry(eave2 * 0.9, eave2 * 0.9, 0.08, n, 1, false, rot), wood);
    under2.position.y = y2 + 0.02;
    g.add(low, neck, upper, under2);
    apex = y2 + h2;
  } else {
    // mái chóp: hình chóp n cạnh, đáy vươn ra ngoài cột, vểnh nhẹ ở góc (đẩy đỉnh góc lên)
    const roofH = D * 0.42 * k;
    const roof = new THREE.Mesh(roofRing(eave, 0, roofH, n, rot, 0.28, 0.08 * k), roofMat);
    roof.position.y = top + roofH / 2 - 0.05;
    g.add(roof);
    apex = top + roofH;
  }
  // chỏm: bầu gỗ + mũi
  const big = (b.eaves ?? 1) >= 2 ? 1.5 : 1;
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.22 * big, 8, 6), ridge);
  knob.position.y = apex + 0.05;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1 * big, 0.45 * big, 6), ridge);
  tip.position.y = knob.position.y + 0.3 * big;
  g.add(knob, tip);
}

/** Đỉnh chỏm đình cao hơn nền đất bao nhiêu (m) — để kiểm mốc nhô trên ngọn trúc. Thuần. */
export function dinhHeight(b: Pick<BuildingSpec, 'w' | 'd' | 'eaves' | 'pillarH'>, heightScale = 1): number {
  const k = Math.min(3, Math.max(0.5, heightScale));
  const D = Math.min(b.w, b.d);
  const top = DINH_BASE_H + (b.pillarH ?? 2.6 * k);
  if ((b.eaves ?? 1) < 2) return top + D * 0.42 * k + 0.05 + 0.52;
  const eave2 = D * 0.3 + 1.0;
  return top + 1.1 * k + 1.0 * k + eave2 * 1.35 * k + 0.05 + 0.78;
}

/** Ghế tựa: mặt ghế gỗ trên hai chân, lan can tựa ở mép ngoài (thanh vịn + song đứng). */
function benches(g: THREE.Group, b: BuildingSpec, wood: THREE.Material): void {
  const y0 = DINH_BASE_H;
  for (const s of dinhBenches(b)) {
    const yaw = s.rotY + Math.PI / 2; // hộp dài theo x cục bộ → dọc cạnh
    const seat = new THREE.Mesh(new THREE.BoxGeometry(s.len, 0.07, 0.42), wood);
    seat.position.set(s.x, y0 + BENCH_H - 0.035, s.z);
    seat.rotation.y = yaw;
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(s.len, BENCH_H - 0.07, 0.06), wood);
    skirt.position.set(s.x, y0 + (BENCH_H - 0.07) / 2, s.z);
    skirt.rotation.y = yaw;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(s.len + 0.2, 0.08, 0.12), wood);
    rail.position.set(s.railX, y0 + BENCH_H + BENCH_RAIL_H, s.railZ);
    rail.rotation.y = yaw;
    const slats = new THREE.Mesh(new THREE.BoxGeometry(s.len, BENCH_RAIL_H, 0.04), wood);
    slats.position.set(s.railX, y0 + BENCH_H + BENCH_RAIL_H / 2, s.railZ);
    slats.rotation.y = yaw;
    g.add(seat, skirt, rail, slats);
  }
}
