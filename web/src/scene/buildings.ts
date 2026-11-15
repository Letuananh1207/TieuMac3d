import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { addSign, type Style } from './kien_truc/chi_tiet';
import { dien, giangDuong } from './kien_truc/dien';
import { BENCH_H, BENCH_RAIL_H, dinh, dinhBenches, dinhPillars, DINH_BASE_H } from './kien_truc/dinh';
import { nhaNho, thap } from './kien_truc/nha_thap';
import { nhaTranh } from './kien_truc/nha_tranh';
import type { Seat } from './seat';
import type { BuildingSpec } from './spec';
import { signMesh } from './signAtlas';
import { drawSign } from './textures';

export { addSign, type Style };

const KINDS = { 'giang-duong': giangDuong, dien, thap, 'nha-nho': nhaNho, dinh, 'nha-tranh': nhaTranh } as const;

/** Nền nhà mỗi kiểu rộng hơn thân bao nhiêu (tổng hai bên) — cũng là hộp va chạm. */
const FOOTPRINT_EXTRA = { 'giang-duong': 2, dien: 3, 'nha-nho': 0.8, 'nha-tranh': 0.6 } as const;

/** Vật cản tròn dọc một ghế tựa đình (m): bán kính, lệch ra ngoài so với tâm ghế — đứng dậy thì bị đẩy vào trong đình. */
const BENCH_HIT = { r: 0.28, out: 0.12 };

/**
 * Dựng một nhà theo `kind` (mặc định giảng đường), phong cách Trung Hoa (`kien_truc/`).
 * Va chạm = nền nhà; tháp = vật cản tròn bao chân tháp.
 */
/** Chỗ ngồi + mặt đi được của một nhà không vào được (đình: nền đá + ghế tựa); nhà kín: rỗng. */
export interface BuildingExtras {
  seats: Seat[];
  pads: Pad[];
}

/** `y0` = độ cao nền (bục khu khi có địa hình; cảnh phẳng = 0). */
export function addBuilding(scene: THREE.Scene, colliders: Colliders, b: BuildingSpec, style: Style, y0 = 0): BuildingExtras {
  // kiểu nhà vào được (trà lâu, hí đài…) dựng ở `rooms.ts` `addWalkIn` — tới đây thì coi như giảng đường kín
  const kind = b.kind && b.kind in KINDS ? (b.kind as keyof typeof KINDS) : 'giang-duong';
  const rot = b.rotY ?? 0;
  const g = new THREE.Group();
  g.position.set(b.x, y0, b.z);
  g.rotation.y = (rot * Math.PI) / 180;
  KINDS[kind](g, b, style);
  if (b.notice) {
    const notice = b.notice;
    const n = signMesh(1.5, 0.75, 512, 256, (c, w, h) => drawSign(c, w, h, notice[0], notice[1], { paper: true }));
    n.position.set(-b.w / 2 + 1.4, 1.9, b.d / 2 - 0.1);
    n.rotation.y = 0.15;
    g.add(n);
  }
  scene.add(g);
  if (kind === 'dinh') return { seats: dinhSeatsAndHits(colliders, b, y0), pads: [dinhPad(b, y0)] };
  if (kind === 'thap') {
    colliders.addCircle(b.x, b.z, Math.min(b.w, b.d) / 2 + 1);
    return { seats: [], pads: [] };
  }
  const extra = FOOTPRINT_EXTRA[kind];
  const [w, d] = [b.w + extra, b.d + extra];
  // quay 90 / 270 thì hộp va chạm đổi rộng ↔ sâu
  // nhà cao hơn tầm camera → luôn che tầm nhìn (R-DIEU-4)
  if (rot % 180 !== 0) colliders.add(b.x, b.z, d, w, Infinity);
  else colliders.add(b.x, b.z, w, d, Infinity);
  return { seats: [], pads: [] };
}

/** Nền đá đình: tấm tròn đi được cao `DINH_BASE_H` (đứng trên nền, không lún chân) — nội tiếp đường kính min(w, d). */
export function dinhPad(b: BuildingSpec, y0 = 0): Pad {
  const r = Math.min(b.w, b.d) / 2;
  return { minX: b.x - r, maxX: b.x + r, minZ: b.z - r, maxZ: b.z + r, y: y0 + DINH_BASE_H, round: true };
}

/**
 * Đình không tường: chỉ chân cột chặn, đi vào được. Ghế tựa (`benches`): vật cản tròn dọc ghế (không đi xuyên ghế) +
 * một chỗ ngồi giữa mỗi ghế, nhìn ra ngoài, tay đặt lên lan can tựa (R-NGOI-1). Toạ độ cảnh.
 */
export function dinhSeatsAndHits(colliders: Colliders, b: BuildingSpec, y0 = 0): Seat[] {
  const a = ((b.rotY ?? 0) * Math.PI) / 180;
  const toWorld = (x: number, z: number): [number, number] => [b.x + x * Math.cos(a) + z * Math.sin(a), b.z - x * Math.sin(a) + z * Math.cos(a)];
  for (const p of dinhPillars(b)) colliders.addCircle(...toWorld(p.x, p.z), p.r + 0.05);
  if (!b.benches) return [];
  const seats: Seat[] = [];
  for (const s of dinhBenches(b)) {
    const [ox, oz] = [Math.sin(s.rotY), Math.cos(s.rotY)];
    const [tx, tz] = [oz, -ox]; // dọc ghế
    for (const t of [-0.32, 0, 0.32]) {
      colliders.addCircle(...toWorld(s.x + ox * BENCH_HIT.out + tx * t * s.len, s.z + oz * BENCH_HIT.out + tz * t * s.len), BENCH_HIT.r);
    }
    const [x, z] = toWorld(s.x, s.z);
    seats.push({ x, z, y: y0 + DINH_BASE_H + BENCH_H, rotY: s.rotY + a, hold: 'lan-can', rail: { d: s.railX * ox + s.railZ * oz - (s.x * ox + s.z * oz), h: BENCH_RAIL_H } });
  }
  return seats;
}
