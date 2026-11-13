/**
 * Model AI tĩnh cho cảnh (công trình, đồ vật — `/tai-nguyen`, quyết định 0003): `design/models/<mã>.glb`, Vite gói vào
 * bản build (offline). Lớp `scene/` không được import `player/` (0001) nên có bộ nạp riêng, không dùng `loadGlbModel`
 * (cái đó còn dựng khung xoay / nhún cho nhân vật).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const MODELS = import.meta.glob('../../../design/models/*.glb', { query: '?url', import: 'default', eager: true }) as Record<
  string,
  string
>;

/** Đường dẫn file đã gói của model `<mã>`; không có file → null (nơi gọi dùng bản khối). */
export function staticModelUrl(id: string): string | null {
  return MODELS[`../../../design/models/${id}.glb`] ?? null;
}

/**
 * Nạp model và chuẩn hoá: tâm ngang về gốc, đáy ở y = 0, giữ cỡ gốc (nơi gọi tự co giãn). Vật liệu giữ nguyên — model
 * nướng màu từ ảnh dùng không-sáng (`KHR_materials_unlit` → `MeshBasicMaterial`); thiếu pháp tuyến thì tự tính.
 */
export async function loadStaticModel(url: string): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;
  model.traverse((o) => {
    if (o instanceof THREE.Mesh && !o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals();
  });
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) throw new Error(`staticModel: model rỗng (${url})`);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
  const root = new THREE.Group();
  root.add(model);
  return root;
}

/**
 * Chân đế của model (gốc toạ độ của `root`, sau co giãn): đỉnh thấp hơn `band` × chiều cao, gom cụm theo x (khe > `gap` ×
 * bề ngang là cụm mới) → mỗi cụm một hộp [minX, maxX, minZ, maxZ]. Dùng làm vật cản trụ / chân (cổng 4 trụ → 4 hộp).
 */
export function footprints(root: THREE.Object3D, band = 0.06, gap = 0.03): [number, number, number, number][] {
  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert();
  const pts: THREE.Vector3[] = [];
  const v = new THREE.Vector3();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const m = toRoot.clone().multiply(o.matrixWorld);
    const pos = o.geometry.getAttribute('position');
    for (let i = 0; i < pos.count; i++) pts.push(v.fromBufferAttribute(pos, i).applyMatrix4(m).clone());
  });
  if (!pts.length) return [];
  const box = new THREE.Box3().setFromPoints(pts);
  const size = box.getSize(new THREE.Vector3());
  const low = pts.filter((p) => p.y < box.min.y + band * size.y).sort((a, b) => a.x - b.x);
  const out: [number, number, number, number][] = [];
  let cur: THREE.Vector3[] = [];
  const flush = (): void => {
    if (cur.length >= 8) {
      const b = new THREE.Box3().setFromPoints(cur);
      out.push([b.min.x, b.max.x, b.min.z, b.max.z]);
    }
    cur = [];
  };
  for (const p of low) {
    if (cur.length && p.x - cur[cur.length - 1].x > gap * size.x) flush();
    cur.push(p);
  }
  flush();
  return out;
}
