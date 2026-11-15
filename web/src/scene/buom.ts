/**
 * Bướm lượn quanh luống chè ban ngày (V-46): mỗi con hai cánh tứ giác (4 tam giác), mọi cánh một `InstancedMesh` (1 draw
 * call), bay vòng lượn + vỗ cánh bằng cập nhật ma trận trên CPU mỗi khung (≤ 60 ma trận — không shader mới). Không va chạm
 * (R-VA-1: thứ động chỉ để nhìn). Bật / tắt theo giờ ở `doiChe.ts` (`butterfliesOut`); mức đồ hoạ Thấp không dựng.
 */
import * as THREE from 'three';
import { markDynamic } from './merge';
import { seededRandom } from './random';

/** Một chỗ bướm quanh quẩn: tâm (mặt hái luống), lượn dọc theo trục luống. */
export interface ButterflySpot {
  x: number;
  y: number;
  z: number;
  alongX: boolean;
}

export interface Butterflies {
  mesh: THREE.InstancedMesh;
  update(dt: number): void;
  setOut(on: boolean): void;
}

/** cỡ cánh (hệ số trên hình gốc sải ~0,34 m) — bướm cảnh hoạt hình to hơn thật cho nhìn thấy từ camera chơi */
const WING = 1.6;

/** Nửa cánh: gốc ở trục z (bản lề), xoè ra +x; mép trước rộng hơn mép sau như cánh bướm. */
function wingGeometry(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const v = [0, 0, 0.05, 0.17, 0, 0.12, 0.15, 0, -0.06, 0, 0, -0.05];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.scale(WING, WING, WING);
  g.computeVertexNormals();
  return g;
}

export function addButterflies(scene: THREE.Scene, spots: ButterflySpot[], count: number, colors: string[], seed = 46): Butterflies | null {
  const n = Math.max(0, Math.round(count));
  if (!n || !spots.length) return null;
  const rand = seededRandom(seed * 977 + n);
  const mesh = new THREE.InstancedMesh(wingGeometry(), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), n * 2);
  const palette = colors.map((c) => new THREE.Color(c));
  const flies = Array.from({ length: n }, (_, i) => {
    const s = spots[Math.floor(rand() * spots.length)];
    const c = palette[i % palette.length];
    mesh.setColorAt(i * 2, c);
    mesh.setColorAt(i * 2 + 1, c);
    return {
      s,
      // lệch tâm dọc luống, pha / nhịp riêng
      off: (rand() - 0.5) * 2,
      ph: [rand() * 6.28, rand() * 6.28, rand() * 6.28, rand() * 6.28],
      speed: 0.7 + rand() * 0.6,
      flap: 13 + rand() * 6,
    };
  });
  markDynamic(mesh);
  mesh.frustumCulled = false; // bay quanh luống — cả đàn vài chục điểm, không đáng tính khung nhìn
  scene.add(mesh);
  let t = 0;
  const o = new THREE.Object3D();
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const at = (f: (typeof flies)[number], time: number, out: THREE.Vector3): THREE.Vector3 => {
    const k = time * f.speed;
    const a = f.off + Math.sin(k * 0.45 + f.ph[0]) * 2.2 + Math.sin(k * 1.3 + f.ph[1]) * 0.5; // dọc luống
    const b = Math.sin(k * 0.6 + f.ph[2]) * 1.0; // ngang luống, sang rãnh bên cạnh
    const y = f.s.y + 0.35 + Math.sin(k * 1.1 + f.ph[3]) * 0.25 + Math.abs(Math.sin(k * 4.3 + f.ph[1])) * 0.12;
    return f.s.alongX ? out.set(f.s.x + a, y, f.s.z + b) : out.set(f.s.x + b, y, f.s.z + a);
  };
  const update = (dt: number): void => {
    if (!mesh.visible) return;
    t += dt;
    flies.forEach((f, i) => {
      at(f, t, p0);
      at(f, t + 0.05, p1);
      const heading = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      const beat = 0.25 + 0.95 * (0.5 + 0.5 * Math.sin(t * f.flap + f.ph[2]));
      for (const side of [1, -1]) {
        o.position.copy(p0);
        o.rotation.set(0, heading, side * beat, 'YXZ');
        o.scale.set(side, 1, 1);
        o.updateMatrix();
        mesh.setMatrixAt(i * 2 + (side > 0 ? 0 : 1), o.matrix);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return {
    mesh,
    update,
    setOut(on) {
      mesh.visible = on;
    },
  };
}
