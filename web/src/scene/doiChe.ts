/**
 * Ghép Đồi Chè (V-46): luống chè (`luongChe.ts`) + bướm ban ngày (`buom.ts`) + sương sớm (`suongSom.ts`). `world.ts` chỉ
 * gọi `addTeaGarden` (dựng), `update` (mỗi khung), `hour` (giờ VN — từ ngày đêm; tắt ngày đêm = luôn 12 giờ).
 * Mức đồ hoạ Thấp (`detail` < 1 — R-HIEU-1): chỉ luống, không bướm, không sương.
 */
import type * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { addButterflies, type ButterflySpot } from './buom';
import { addTeaRows } from './luongChe';
import { butterfliesOut, mistLevel } from './luongCheLayout';
import type { SceneSpec } from './spec';
import { addMist, type MistSheet } from './suongSom';
import type { GroundY } from './terrainHeight';

export interface TeaGarden {
  update(dt: number): void;
  /** giờ VN 0…24: bướm ra / về, sương dày / tan */
  hour(gio: number): void;
  /** các khối vẽ (mức Thấp: không bướm, không sương) — để test / đo */
  readonly parts: { rows: THREE.InstancedMesh; butterflies: THREE.InstancedMesh | null; mist: THREE.InstancedMesh | null };
}

/** Tấm sương mỗi bậc: gom đoạn luống cùng độ cao (±0,5 m) → hình chữ nhật bao + nới 1,5 m; nhiều nhất 3 tấm (bậc dài nhất). */
export function mistSheets(segs: { x: number; z: number; y: number; length: number; width: number; alongX: boolean }[]): MistSheet[] {
  const groups = new Map<number, typeof segs>();
  for (const s of segs) {
    const k = Math.round(s.y * 2);
    groups.set(k, [...(groups.get(k) ?? []), s]);
  }
  const sheets = [...groups.values()].map((list) => {
    const ext = list.map((s) => (s.alongX ? [s.x - s.length / 2, s.x + s.length / 2, s.z - s.width / 2, s.z + s.width / 2] : [s.x - s.width / 2, s.x + s.width / 2, s.z - s.length / 2, s.z + s.length / 2]));
    const x0 = Math.min(...ext.map((e) => e[0])) - 1.5;
    const x1 = Math.max(...ext.map((e) => e[1])) + 1.5;
    const z0 = Math.min(...ext.map((e) => e[2])) - 1.5;
    const z1 = Math.max(...ext.map((e) => e[3])) + 1.5;
    return { x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, y: Math.min(...list.map((s) => s.y)) };
  });
  return sheets.sort((a, b) => b.w * b.d - a.w * a.d).slice(0, 3);
}

export function addTeaGarden(scene: THREE.Scene, colliders: Colliders, spec: Pick<SceneSpec, 'teaRows' | 'teaStyle' | 'look' | 'dayNight'>, groundY: GroundY | undefined, detail: number): TeaGarden | null {
  if (!spec.teaRows.length) return null;
  const st = spec.teaStyle;
  const rows = addTeaRows(scene, colliders, spec.teaRows, st, spec.look, groundY);
  const rich = detail >= 1;
  const spots: ButterflySpot[] = rows.segments.map((s) => ({ x: s.x, y: s.y + s.height, z: s.z, alongX: s.alongX }));
  const flies = rich ? addButterflies(scene, spots, st.butterflies, st.butterflyColors) : null;
  const mist = rich ? addMist(scene, mistSheets(rows.segments), st.mist.color, st.mist.opacity) : null;
  const hour = (gio: number): void => {
    flies?.setOut(butterfliesOut(gio, spec.dayNight.moc));
    mist?.setLevel(mistLevel(gio, st.mist));
  };
  hour(12); // chưa có giờ (tắt ngày đêm) = ban ngày
  return {
    hour,
    parts: { rows: rows.mesh, butterflies: flies?.mesh ?? null, mist: mist?.mesh ?? null },
    update(dt) {
      flies?.update(dt);
      mist?.update(dt);
    },
  };
}
