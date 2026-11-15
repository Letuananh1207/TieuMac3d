/**
 * Canvas 3D `?dang=vuon-rau` (V-52 NV7): duyệt hình vườn rau — 12 luống thật điền sẵn (8 cây chín ở o-1 … o-8, o-9 vừa gieo,
 * 3 luống hoang) + bảng mẫu **8 cây × 4 dáng** trên bãi cỏ tây (hàng bắc → nam: vừa gieo · mầm · đang lớn · chín; cột tây →
 * đông theo thứ tự bảng cây). Cùng code dựng như app (`scene/vuonLuong.ts`, `scene/cayTrong.ts`). `?dang=vuon` đã là dáng
 * "vươn vai" của nhân vật nên dùng tên `vuon-rau`. Chỉ trang thiết kế dùng, không vào app.
 */
import type * as THREE from 'three';
import { CROP_STAGES, CropLayer } from './scene/cayTrong';
import type { SceneSpec } from './scene/spec';
import type { Garden3D } from './scene/vuonLuong';
import { CROPS } from './zones/vuon';

/** Bảng mẫu: góc tây bắc + khoảng hai ô (m). */
const SAMPLE = { x0: -22.4, z0: -3.6, dx: 1.2, dz: 2.4, size: 1.1 };

/** `?dang=vuon-rau` → điền vườn + dựng bảng mẫu; trả dòng mô tả cho bảng Canvas 3D. Khác → `null`. */
export function addGardenPreview(scene: THREE.Scene, spec: SceneSpec, garden: Garden3D | null, params: URLSearchParams, groundY: (x: number, z: number) => number): string[] | null {
  if (params.get('dang') !== 'vuon-rau' || !garden) return null;
  garden.beds.setOpen(9);
  garden.crops.show(garden.plots.map((_, i) => (i < 8 ? { crop: CROPS[i].id, stage: 'chin' } : i === 8 ? { crop: 'cai', stage: 'vua-gieo' } : null)));
  const spots = CROP_STAGES.flatMap((_, r) => CROPS.map((_, c) => ({ x: SAMPLE.x0 + c * SAMPLE.dx, z: SAMPLE.z0 + r * SAMPLE.dz })));
  const sample = new CropLayer(scene, spots.map((p) => ({ ...p, y: groundY(p.x, p.z), size: SAMPLE.size })), spec.look, spec.garden.cropScale, spec.trees.crown === 'chum');
  sample.show(CROP_STAGES.flatMap((stage) => CROPS.map((c) => ({ crop: c.id, stage }))));
  return [
    `Vườn rau: o-1 … o-8 chín (${CROPS.map((c) => c.name).join(', ')}), o-9 vừa gieo, o-10 … o-12 hoang`,
    `Bảng mẫu bãi tây x ${SAMPLE.x0} … ${SAMPLE.x0 + 7 * SAMPLE.dx}: hàng z ${CROP_STAGES.map((s, i) => `${SAMPLE.z0 + i * SAMPLE.dz} ${s}`).join(' · ')}`,
  ];
}
