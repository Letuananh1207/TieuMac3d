import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { addSign, type Style } from './kien_truc/chi_tiet';
import { dien, giangDuong } from './kien_truc/dien';
import { dinh, dinhPillars } from './kien_truc/dinh';
import { nhaNho, thap } from './kien_truc/nha_thap';
import type { BuildingSpec } from './spec';
import { signMesh } from './signAtlas';
import { drawSign } from './textures';

export { addSign, type Style };

const KINDS = { 'giang-duong': giangDuong, dien, thap, 'nha-nho': nhaNho, dinh } as const;

/** Nền nhà mỗi kiểu rộng hơn thân bao nhiêu (tổng hai bên) — cũng là hộp va chạm. */
const FOOTPRINT_EXTRA = { 'giang-duong': 2, dien: 3, 'nha-nho': 0.8 } as const;

/**
 * Dựng một nhà theo `kind` (mặc định giảng đường), phong cách Trung Hoa (`kien_truc/`).
 * Va chạm = nền nhà; tháp = vật cản tròn bao chân tháp.
 */
/** `y0` = độ cao nền (bục khu khi có địa hình; cảnh phẳng = 0). */
export function addBuilding(scene: THREE.Scene, colliders: Colliders, b: BuildingSpec, style: Style, y0 = 0): THREE.Group {
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
  if (kind === 'dinh') {
    // đình không tường: chỉ chân cột chặn, đi vào được
    const a = (rot * Math.PI) / 180;
    for (const p of dinhPillars(b)) {
      colliders.addCircle(b.x + p.x * Math.cos(a) + p.z * Math.sin(a), b.z - p.x * Math.sin(a) + p.z * Math.cos(a), p.r + 0.05);
    }
    return g;
  }
  if (kind === 'thap') {
    colliders.addCircle(b.x, b.z, Math.min(b.w, b.d) / 2 + 1);
    return g;
  }
  const extra = FOOTPRINT_EXTRA[kind];
  const [w, d] = [b.w + extra, b.d + extra];
  // quay 90 / 270 thì hộp va chạm đổi rộng ↔ sâu
  // nhà cao hơn tầm camera → luôn che tầm nhìn (R-DIEU-4)
  if (rot % 180 !== 0) colliders.add(b.x, b.z, d, w, Infinity);
  else colliders.add(b.x, b.z, w, d, Infinity);
  return g;
}
