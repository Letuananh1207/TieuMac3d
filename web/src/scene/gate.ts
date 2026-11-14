import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './buildings';
import { addSign, hk } from './kien_truc/chi_tiet';
import { box } from './kien_truc/hinh';
import { hipRoof } from './kien_truc/mai';
import { rotateXZ, type GateSpec } from './spec';
import { squashFeet } from './gateFeet';
import { bakeTransforms, footprints, loadStaticModel } from './staticModel';

const P = 0.7; // cạnh trụ vuông
const SIDE = 3.5; // bề rộng gian bên
const LOW_BEAM = 6.2; // đáy xà thấp nhất của gian giữa (× hệ số chiều cao): cao hơn camera (~4,9 m) để camera không lọt sau biển
/**
 * Biển trống trên model cổng (phần của chiều cao / bề ngang model): tâm cao 0,67 H, lòng biển 0,247 W × 0,113 H — đo
 * trên ảnh thiết kế `design/models/anh/cong-son-mon-truoc.png`. Model cổng khác cần biển cùng chỗ.
 */
const MODEL_SIGN = { y: 0.67, w: 0.247, h: 0.113 };
/** Đế đá chân trụ model sau khi nén (L-5): cao 1,2 m (dưới vai nhân vật 2,1 m), bề ngang × 0,75 — giữ cỡ người. */
const FEET = { height: 1.2, shrink: 0.75 };

/** Bề ngang tổng (m) của cổng khối có khoảng trống giữa `width`: hai gian bên + bốn trụ + chân đá. */
export function gateSpan(width: number): number {
  return width + 4 * P + 2 * SIDE + 0.5;
}

/**
 * Cổng sơn môn (牌坊) 3 gian 4 trụ: gian giữa rộng `width`, cao hơn; hai gian bên 3,5 m; ba mái nhỏ đầu đao; biển chữ
 * (`hanTitle` hoặc `title`) giữa hai xà gian giữa; chân trụ đá. Va chạm chỉ ở bốn trụ.
 * Chiều cao trụ, xà, mái nhân `buildingStyle.heightScale`; bề rộng, biển, chân trụ giữ nguyên.
 */
export function addGate(scene: THREE.Scene, colliders: Colliders, gate: GateSpec, style: Style, y0 = 0): void {
  const rot = gate.rotY ?? 0;
  const roofColor = gate.roofColor ?? style.eave;
  const g = new THREE.Group();
  g.position.set(gate.x, y0, gate.z);
  g.rotation.y = (rot * Math.PI) / 180;

  const k = hk(style);
  const low = LOW_BEAM * k;
  const inner = gate.width / 2 + P / 2;
  const outer = inner + P + SIDE;
  const midTop = low + 1.6 * k;
  const sideBeam = low - 1.4 * k;
  const sideTop = sideBeam + 1.1 * k;
  const pillars: [number, number][] = [
    [-outer, sideTop],
    [-inner, midTop],
    [inner, midTop],
    [outer, sideTop],
  ];
  for (const [x, h] of pillars) {
    g.add(box(P + 0.5, 1, P + 0.5, style.stone, x, 0.5, 0));
    g.add(box(P, h, P, style.pillar, x, h / 2, 0));
  }
  // gian giữa: hai xà, biển ở giữa, mái
  const midSpan = 2 * inner + P + 0.6;
  g.add(box(midSpan, 0.5, 0.6, style.eave, 0, low + 0.25, 0));
  g.add(box(midSpan + 0.04, 0.12, 0.64, style.beamBlue, 0, low + 0.25, 0));
  g.add(box(midSpan, 0.4, 0.55, style.eave, 0, low + 1.4 * k - 0.01, 0)); // hạ 1 cm: mặt trên xà không trùng đỉnh cột giữa (L-10)
  // biển giữ cỡ, nằm giữa khoảng hai xà
  addSign(g, gate.hanTitle ?? gate.title, low + 0.82 + 0.7 * (k - 1), 0.32, Math.min(1.1, gate.width / 3));
  hipRoof(g, { y: midTop, w: 2 * inner + P, d: 1, over: 0.9, h: 1.3 * k, color: roofColor, ridgeColor: style.ridge });
  // hai gian bên: xà + mái thấp hơn
  for (const s of [-1, 1]) {
    const cx = (s * (inner + outer)) / 2;
    g.add(box(SIDE + P, 0.4, 0.5, style.eave, cx, sideBeam + 0.2, 0));
    g.add(box(SIDE + P, 0.35, 0.5, style.eave, cx, sideTop - 0.25, 0));
    const side = new THREE.Group();
    side.position.x = cx;
    hipRoof(side, { y: sideTop, w: SIDE + P, d: 0.9, over: 0.7, h: 1 * k, color: roofColor, ridgeColor: style.ridge });
    g.add(side);
  }

  scene.add(g);
  for (const [x] of pillars) {
    const [dx, dz] = rotateXZ(x, 0, rot);
    colliders.add(gate.x + dx, gate.z + dz, P + 0.5, P + 0.5);
  }
}

/**
 * Cổng bằng model AI (`gate.model`, file `url`): co đều cho bề ngang = `gateSpan(width)` × `modelScale` (giữ tỉ lệ ảnh
 * thiết kế), nén đế đá chân trụ về cỡ người (`squashFeet`, L-5), đáy chạm đất ở `y0`, mặt trước +z trước khi quay. Vật cản = chân đế đo từ lưới (`footprints` — bốn trụ); biển chữ (`hanTitle`
 * hoặc `title`) dán sát mặt trước biển trống của model. Nạp lỗi → ném, nơi gọi dựng cổng khối.
 */
export async function addGateModel(
  scene: THREE.Scene,
  colliders: Colliders,
  gate: GateSpec,
  url: string,
  y0 = 0,
): Promise<void> {
  const model = await loadStaticModel(url);
  const raw = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  const span = gateSpan(gate.width) * (gate.modelScale ?? 1);
  model.scale.setScalar(span / raw.x);
  const g = new THREE.Group();
  g.add(model);
  const H = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()).y;

  // L-5: đế đá của model cao ~1/6 cổng → nén về cỡ người, phần trên hạ xuống theo
  const centers = footprints(g).map(([x0, x1, z0, z1]): [number, number] => [(x0 + x1) / 2, (z0 + z1) / 2]);
  let drop = 0;
  for (const mesh of bakeTransforms(g)) {
    const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    drop = squashFeet(pos.array as Float32Array, centers, FEET);
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
  }
  const box = new THREE.Box3().setFromObject(g);

  // biển chữ: tia từ trước vào giữa biển trống → mặt biển; tấm chữ vừa lòng biển (90 %)
  const y = MODEL_SIGN.y * H - drop;
  const ray = new THREE.Raycaster(new THREE.Vector3(0, y, box.max.z + 1), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObject(g, true)[0];
  const scale = Math.min((0.9 * MODEL_SIGN.w * span) / 2.8, (0.9 * MODEL_SIGN.h * H) / 0.9);
  addSign(g, gate.hanTitle ?? gate.title, y, (hit ? hit.point.z : 0) + 0.04, scale);

  const rot = gate.rotY ?? 0;
  const turned = Math.abs(rot % 180) === 90; // vật cản thẳng trục: quay 90 / 270 thì đổi rộng ↔ sâu
  for (const [minX, maxX, minZ, maxZ] of footprints(g)) {
    const [dx, dz] = rotateXZ((minX + maxX) / 2, (minZ + maxZ) / 2, rot);
    const w = maxX - minX;
    const d = maxZ - minZ;
    colliders.add(gate.x + dx, gate.z + dz, turned ? d : w, turned ? w : d);
  }
  g.position.set(gate.x, y0, gate.z);
  g.rotation.y = (rot * Math.PI) / 180;
  scene.add(g);
}
