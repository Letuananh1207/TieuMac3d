/**
 * Đài đá thấp + chỗ ngồi ngoài trời (V-66 B3 — Khúc Thuỷ Đài ở Trúc Lâm; hồ sơ `docs/tham_khao/lam-lai-vung.md` mục 5).
 * - Đài (`terraces`): khối đá đặc thẳng trục, mặt trên đi được (tấm `Pad` — R-VA-3), viền đá mặt trên sáng hơn thân, gờ
 *   đá chân. Mương / vật / chỗ ngồi trong chân đài đặt lên mặt đài (`onTerraces` bọc `groundY`).
 * - Chỗ ngồi (`seats`): đệm cỏ (bồ đoàn rơm trên chiếu) hoặc đá phẳng thấp; nút "Ngồi" (R-NGOI-1); không chặn người đi.
 * Đứng yên, gộp (`mergeStatic` / `mergeSoft`) — thêm ≈ 0 draw call.
 */
import * as THREE from 'three';
import type { Pad } from '../collision/ground';
import { box } from './kien_truc/hinh';
import { lambert } from './materials';
import { mergeVertexColors } from './merge';
import type { Seat } from './seat';
import type { OutdoorSeatSpec, TerraceSpec } from './spec';
import type { GroundY } from './terrainHeight';

/** Thân đài chìm xuống đất thêm bao nhiêu (m) — đất hơi lồi lõm không hở chân đài. */
const SINK = 0.4;
/** Viền đá mặt đài (m) — dày, rộng. */
const RIM_H = 0.08;
const RIM_W = 0.45;
/** Mặt ngồi cao hơn đất (m) theo kiểu chỗ ngồi. */
export const SEAT_TOP: Readonly<Record<NonNullable<OutdoorSeatSpec['kind']>, number>> = { dem: 0.14, da: 0.34 };

/** bồ đoàn rơm, chiếu trúc — cùng màu vật trúc (`vat_truc.ts`) để gộp chung draw call */
const RUSH = '#b49a6a';
const MAT = '#c8b27a';

/** Chữ nhật thẳng trục của đài (xoay 90 / 270 → đổi rộng ↔ sâu). Thuần. */
export function terraceRect(t: TerraceSpec): { minX: number; maxX: number; minZ: number; maxZ: number } {
  const [w, d] = (t.rotY ?? 0) % 180 !== 0 ? [t.d, t.w] : [t.w, t.d];
  return { minX: t.x - w / 2, maxX: t.x + w / 2, minZ: t.z - d / 2, maxZ: t.z + d / 2 };
}

/** Tấm đi được trên mặt mỗi đài (mặt = đất ở tâm đài + `h`). Thuần. */
export function terracePads(list: readonly TerraceSpec[], groundY: GroundY): Pad[] {
  return list.map((t) => ({ ...terraceRect(t), y: groundY(t.x, t.z) + t.h }));
}

/** Bọc `groundY`: trong chân một đài → mặt đài; ngoài → đất như cũ. Không có đài → trả lại `groundY`. Thuần. */
export function onTerraces(list: readonly TerraceSpec[], groundY: GroundY): GroundY {
  if (!list.length) return groundY;
  const pads = terracePads(list, groundY);
  return (x, z) => {
    for (const p of pads) if (x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ) return p.y;
    return groundY(x, z);
  };
}

/** Dựng các đài; trả về tấm đi được. */
export function addTerraces(scene: THREE.Scene, list: readonly TerraceSpec[], stone: string, rim: string, groundY: GroundY): Pad[] {
  const pads = terracePads(list, groundY);
  list.forEach((t, i) => {
    const r = terraceRect(t);
    const [w, d] = [r.maxX - r.minX, r.maxZ - r.minZ];
    const top = pads[i].y;
    const y0 = top - t.h - SINK;
    scene.add(box(w, top - y0, d, stone, t.x, (top + y0) / 2, t.z));
    // viền đá mặt trên (4 thanh) + gờ chân rộng hơn chút
    for (const s of [-1, 1]) {
      scene.add(box(w, RIM_H, RIM_W, rim, t.x, top + RIM_H / 2 - 0.02, t.z + s * (d / 2 - RIM_W / 2)));
      scene.add(box(RIM_W, RIM_H, d - 2 * RIM_W, rim, t.x + s * (w / 2 - RIM_W / 2), top + RIM_H / 2 - 0.02, t.z));
    }
    scene.add(box(w + 0.3, 0.14, d + 0.3, stone, t.x, top - t.h + 0.03, t.z));
  });
  return pads;
}

/**
 * Một đệm cỏ rời (bồ đoàn rơm trên chiếu) tại (x, y, z) — chỗ ngồi sau đá đàn cầm (R-CAM-1, V-66 B4). Dựng sau khi cảnh đã
 * gộp → tự gộp chiếu + đệm thành 1 khối màu theo đỉnh (1 draw call).
 */
export function addCushion(scene: THREE.Scene, x: number, y: number, z: number): THREE.Object3D {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 8), lambert(MAT));
  m.position.y = 0.01;
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.12, 10), lambert(RUSH));
  c.position.y = 0.08;
  g.add(m, c);
  scene.add(g);
  mergeVertexColors(g);
  return g;
}

/** Dựng chỗ ngồi ngoài trời; trả về chỗ ngồi (toạ độ cảnh) cho nút "Ngồi". `groundY` đã bọc đài (`onTerraces`). */
export function addOutdoorSeats(scene: THREE.Scene, list: readonly OutdoorSeatSpec[], stone: string, groundY: GroundY): Seat[] {
  const cushion = new THREE.CylinderGeometry(0.32, 0.35, 0.12, 10);
  const mat = new THREE.CylinderGeometry(0.5, 0.5, 0.02, 8);
  const rock = new THREE.DodecahedronGeometry(0.5, 0).scale(0.95, 0.42, 0.8);
  return list.map((s) => {
    const kind = s.kind ?? 'dem';
    const y = groundY(s.x, s.z);
    const rotY = ((s.rotY ?? 0) * Math.PI) / 180;
    if (kind === 'dem') {
      const m = new THREE.Mesh(mat, lambert(MAT));
      m.position.set(s.x, y + 0.01, s.z);
      const c = new THREE.Mesh(cushion, lambert(RUSH));
      c.position.set(s.x, y + 0.08, s.z);
      scene.add(m, c);
    } else {
      const m = new THREE.Mesh(rock, lambert(stone));
      m.position.set(s.x, y + 0.12, s.z);
      m.rotation.y = rotY;
      scene.add(m);
    }
    return { x: s.x, y: y + SEAT_TOP[kind], z: s.z, rotY };
  });
}
