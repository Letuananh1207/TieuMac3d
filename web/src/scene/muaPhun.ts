/**
 * Mưa phùn Trúc Lâm (R-MANG-2): vệt mưa mảnh rơi quanh camera — một `LineSegments` (**1 draw call**), ~700 vệt trong hộp
 * 24 × 10 × 24 m bám theo camera (đi đâu cũng mưa quanh mình), rơi nghiêng nhẹ theo gió. Độ đậm 0…1 (lên / xuống do nơi
 * ghép tính); 0 → không vẽ. Mức đồ hoạ Thấp: nơi ghép không dựng (chỉ tiếng + trời xám). Không chạm, không va chạm.
 */
import * as THREE from 'three';
import { markDynamic } from './merge';
import { seededRandom } from './random';

const HALF = 12;
const HEIGHT = 10;
const FALL = 6.5; // m/s
const DRIFT = 0.9; // m/s theo x (gió)
const STREAK = 0.32; // dài vệt (m)

export interface MuaPhun {
  readonly mesh: THREE.LineSegments;
  /** Mỗi khung: [level] 0…1, [eye] = vị trí camera. */
  update(dt: number, level: number, eye: THREE.Vector3): void;
}

export function addMuaPhun(scene: THREE.Scene, count = 700): MuaPhun {
  const rnd = seededRandom(1507);
  const base = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) base.set([(rnd() * 2 - 1) * HALF, rnd() * HEIGHT, (rnd() * 2 - 1) * HALF], i * 3);
  const pos = new Float32Array(count * 6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.LineBasicMaterial({ color: '#d8e2e6', transparent: true, opacity: 0, depthWrite: false, fog: true });
  const mesh = new THREE.LineSegments(geo, mat);
  mesh.frustumCulled = false;
  mesh.visible = false;
  markDynamic(mesh);
  scene.add(mesh);
  let t = 0;
  const wrap = (v: number, span: number): number => ((v % span) + span) % span;
  return {
    mesh,
    update(dt, level, eye) {
      mesh.visible = level > 0.01;
      if (!mesh.visible) return;
      t += dt;
      mat.opacity = 0.42 * Math.min(1, level);
      const dx = (DRIFT / FALL) * STREAK;
      for (let i = 0; i < count; i++) {
        const b = i * 3;
        // rơi theo thời gian, cuộn vòng trong hộp quanh camera (toạ độ hộp neo theo lưới để vệt không trượt theo người)
        const x = eye.x + wrap(base[b] + t * DRIFT - eye.x, HALF * 2) - HALF;
        const y = eye.y - 3 + wrap(base[b + 1] - t * FALL, HEIGHT);
        const z = eye.z + wrap(base[b + 2] - eye.z, HALF * 2) - HALF;
        pos.set([x, y, z, x - dx, y + STREAK, z], i * 6);
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}
