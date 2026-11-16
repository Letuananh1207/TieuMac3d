/**
 * Nhà kín `nha-o` bằng model AI (`buildings[].model`, V-88 — kế hoạch docs/tasks/2026-11-16-nha-model.md). Model Tripo
 * (`design/models/<mã>.glb`, không-sáng) chỉ thay HÌNH bên ngoài: co riêng ba trục cho khớp khung bao bản khối (thân +
 * mái + bậc đá — `houseFrame`), quay `NHA_MODEL_TUNE.yaw`. Code giữ: va chạm + nền đi được (vỏ khối `nhaOBody`), biển
 * tên + 2 đèn lồng (`nhaODecor`, dựng ngay để gộp chung cảnh), tấm sáng hai ô cửa sổ ban đêm (R-NGAY-3), cổng vào nhà
 * (`portals`). Nạp sau khi cảnh gộp xong; thiếu file → bản khối; nạp lỗi → bản khối muộn (gộp riêng).
 * `khoi-gop` = model thế dựng từ chính bản khối (một lưới màu đỉnh) — thử đường co / dán biển khi chưa có file.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import type { Style } from './kien_truc/chi_tiet';
import { nhaODecor, nhaOFront, nhaOBody, type NhaOFront } from './kien_truc/nha_o';
import { lambert, windowGlowMaterial } from './materials';
import { markDynamic, mergeStatic } from './merge';
import { addShellColliders, buildWalkIn } from './rooms';
import type { BuildingSpec } from './spec';
import { bakeTransforms, loadStaticModel, staticModelUrl } from './staticModel';

/** Chỉnh tay khi đặt model thật (NV9). */
export const NHA_MODEL_TUNE = {
  /** quay thêm quanh trục đứng (rad) trước khi co — mặt tiền model phải nhìn +z */
  yaw: 0,
  /** lệch dáng (tỉ số co lớn nhất / nhỏ nhất − 1) quá mức này → cảnh báo: ảnh / model sai tỉ lệ (Q3) */
  skewWarn: 0.15,
  /** tấm sáng cửa sổ nhô trước mặt model bao nhiêu (m) — tránh chớp (z-fight) */
  glowLift: 0.02,
};
export type HouseTune = typeof NHA_MODEL_TUNE;

/** Màn tải chờ model nhà tối đa bấy nhiêu ms (Q4); quá hạn thì cảnh hiện trước, nhà model thêm vào khi nạp xong. */
export const HOUSE_WAIT_MS = 2000;

/** Chờ `ready` (model nhà) tối đa `ms` — không bao giờ lỗi; true = đã xong trong hạn. */
export function waitHouses(ready: Promise<unknown>, ms = HOUSE_WAIT_MS): Promise<boolean> {
  return Promise.race([ready.then(() => true, () => true), new Promise<boolean>((r) => setTimeout(() => r(false), ms))]);
}

/** Mã model thế (bản khối gộp một lưới) — Canvas 3D `&mau-nha=khoi-gop`. */
export const HOUSE_STAND_IN = 'khoi-gop';

/** Màu mặt bậc đá (phiếu `2026-11-16-anh-nha-ta`) — chỉ cho model thế. */
const STEP_COLOR = '#a8a194';

/** Khung bao các lưới trong `g`, theo toạ độ của chính `g` (bỏ vị trí / hướng của nó). */
function localBounds(g: THREE.Object3D): THREE.Box3 {
  g.updateMatrixWorld(true);
  const inv = g.matrixWorld.clone().invert();
  const out = new THREE.Box3();
  const b = new THREE.Box3();
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    out.union(b.copy(o.geometry.boundingBox as THREE.Box3).applyMatrix4(inv.clone().multiply(o.matrixWorld)));
  });
  return out;
}

/** Hộp bậc đá trước cửa (toạ độ nhà): rộng gian giữa, từ mép nền ra `stepRun`, cao bằng nền. */
function stepBox(f: NhaOFront): THREE.Box3 {
  return new THREE.Box3(new THREE.Vector3(-f.door / 2, 0, f.stepZ), new THREE.Vector3(f.door / 2, f.plat, f.stepZ + f.stepRun));
}

/** Khung model phải khớp (toạ độ nhà, chân y 0): thân + mái bản khối (`nhaOBody`) ∪ dải bậc đá. */
export function houseFrame(b: BuildingSpec, style: Style, body?: THREE.Object3D): THREE.Box3 {
  const g = body ?? buildWalkIn({ ...b, x: 0, z: 0, rotY: 0 }, style, nhaOBody).group;
  return localBounds(g).union(stepBox(nhaOFront(b, style)));
}

/**
 * Model thế từ bản khối: thân + mái + 2 bậc đá gộp MỘT lưới màu đỉnh (như một file Tripo), toạ độ nhà. Không sửa gì của
 * cảnh — chỉ để thử đường co / dán / tấm sáng khi chưa có `nha-ta.glb` (artifact Canvas 3D không nhúng được .glb lớn).
 */
export function houseStandIn(b: BuildingSpec, style: Style): { geometry: THREE.BufferGeometry; material: THREE.Material } {
  const g = buildWalkIn({ ...b, x: 0, z: 0, rotY: 0 }, style, nhaOBody).group;
  const f = nhaOFront(b, style);
  const s = stepBox(f);
  const run = f.stepRun / 2;
  for (const [i, k] of [[0, 2 / 3], [1, 1 / 3]] as const) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(f.door, f.plat * k, run), lambert(STEP_COLOR));
    m.position.set(0, (f.plat * k) / 2, s.min.z + run * (i + 0.5));
    g.add(m);
  }
  g.updateMatrixWorld(true);
  const inv = g.matrixWorld.clone().invert();
  const geos: THREE.BufferGeometry[] = [];
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || Array.isArray(o.material)) return;
    const src = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', src.getAttribute('position').clone());
    geo.applyMatrix4(inv.clone().multiply(o.matrixWorld));
    const c = (o.material as THREE.MeshLambertMaterial).color ?? new THREE.Color('#ffffff');
    const n = geo.getAttribute('position').count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) c.toArray(col, i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geos.push(geo);
  });
  const geometry = mergeGeometries(geos);
  if (!geometry) throw new Error('nhaModel: không gộp được model thế');
  geometry.computeVertexNormals();
  return { geometry, material: lambert('#ffffff', { vertexColors: true }) };
}

export interface FittedHouse {
  /** lưới model (toạ độ nhà) — 1 draw call */
  mesh: THREE.Mesh;
  /** hệ số co ba trục */
  scale: [number, number, number];
  /** lệch dáng: co lớn nhất / nhỏ nhất − 1 */
  skew: number;
  triangles: number;
}

/** Lưới model bất kỳ → co riêng từng trục cho khung bao trùng `frame` (sau khi quay `yaw`). Không sửa `src`. */
export function fitToFrame(src: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], frame: THREE.Box3, tune: HouseTune = NHA_MODEL_TUNE): FittedHouse {
  const g = src.clone();
  if (tune.yaw) g.rotateY(tune.yaw);
  g.computeBoundingBox();
  const b = g.boundingBox as THREE.Box3;
  const size = b.getSize(new THREE.Vector3());
  const want = frame.getSize(new THREE.Vector3());
  if (!(size.x > 0 && size.y > 0 && size.z > 0)) throw new Error('nhaModel: model dẹt / rỗng');
  const scale: [number, number, number] = [want.x / size.x, want.y / size.y, want.z / size.z];
  g.translate(-b.min.x, -b.min.y, -b.min.z);
  g.scale(...scale);
  g.translate(frame.min.x, frame.min.y, frame.min.z);
  if (g.getAttribute('normal')) g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  const mesh = new THREE.Mesh(g, material);
  mesh.name = 'nha-model';
  const triangles = (g.index ? g.index.count : g.getAttribute('position').count) / 3;
  return { mesh, scale, skew: Math.max(...scale) / Math.min(...scale) - 1, triangles };
}

/**
 * Tấm sáng hai ô cửa sổ (R-NGAY-3) — tia từ trước vào tâm mỗi ô tìm mặt model, tấm nhô `glowLift`; hai tấm một lưới.
 * Không ngày đêm → null.
 */
export function windowGlow(mesh: THREE.Mesh, f: NhaOFront, tune: HouseTune = NHA_MODEL_TUNE): THREE.Mesh | null {
  const mat = windowGlowMaterial();
  if (!mat) return null;
  mesh.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  const geos = f.windows.map((w) => {
    ray.set(new THREE.Vector3(w.x, w.y, w.z + 5), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(mesh, false)[0];
    const p = new THREE.PlaneGeometry(w.w, w.h);
    p.translate(w.x, w.y, (hit ? hit.point.z : w.z) + tune.glowLift);
    return p;
  });
  const geo = mergeGeometries(geos);
  if (!geo) return null;
  const m = new THREE.Mesh(geo, mat);
  m.name = 'nha-cua-so-sang';
  return m;
}

/** Nạp `.glb` → một lưới (các lưới con gộp; nhiều vật liệu → nhóm vật liệu). */
async function loadHouseGeometry(url: string): Promise<{ geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] }> {
  const meshes = bakeTransforms(await loadStaticModel(url));
  if (!meshes.length) throw new Error(`nhaModel: không có lưới (${url})`);
  const mats = meshes.map((m) => (Array.isArray(m.material) ? m.material[0] : m.material));
  const one = mats.every((m) => m === mats[0]);
  const geometry = meshes.length === 1 ? meshes[0].geometry : mergeGeometries(meshes.map((m) => m.geometry), !one);
  if (!geometry) throw new Error(`nhaModel: không gộp được ${meshes.length} lưới (${url})`);
  return { geometry, material: one ? mats[0] : mats };
}

export interface HouseReport {
  id: string;
  /** `model` = file nạp được · `the` = model thế · `khoi` = thiếu file / nạp lỗi → bản khối */
  source: 'model' | 'the' | 'khoi';
  fit?: Omit<FittedHouse, 'mesh'>;
}

/**
 * Nhà kín `nha-o` có `model`: va chạm + nền + biển + đèn dựng ngay (giống hệt bản khối), hình model thêm vào cảnh khi
 * nạp xong (`ready`). Thiếu file → `null` (nơi gọi dựng bản khối như cũ). `onAdded`: quét lại ngày đêm.
 */
export function addHouseModel(
  scene: THREE.Scene,
  colliders: Colliders,
  b: BuildingSpec,
  style: Style,
  y0 = 0,
  onAdded: () => void = () => {},
  tune: HouseTune = NHA_MODEL_TUNE,
): { pads: Pad[]; ready: Promise<HouseReport> } | null {
  const id = b.model ?? '';
  const standIn = id === HOUSE_STAND_IN;
  const url = standIn ? null : staticModelUrl(id);
  if (!standIn && !url) {
    console.warn(`buildings: thiếu design/models/${id}.glb — nhà "${b.id}" dùng bản khối`);
    return null;
  }
  const parts = buildWalkIn(b, style, nhaOBody, y0);
  const pads = addShellColliders(colliders, b, parts.shell, y0);
  // biển + đèn lồng: dựng ngay cạnh cảnh → gộp chung ảnh biển / vật liệu đèn của cảnh (không thêm draw call)
  const decor = new THREE.Group();
  decor.position.copy(parts.group.position);
  decor.rotation.copy(parts.group.rotation);
  nhaODecor(decor, b, style);
  scene.add(decor);
  const frame = houseFrame(b, style, parts.group);
  const front = nhaOFront(b, style);
  const source = standIn ? Promise.resolve(houseStandIn(b, style)) : loadHouseGeometry(url as string);
  const ready = source.then(
    ({ geometry, material }): HouseReport => {
      const fit = fitToFrame(geometry, material, frame, tune);
      if (fit.skew > tune.skewWarn)
        console.warn(`nhà "${b.id}": model lệch dáng ${Math.round(fit.skew * 100)} % (co ${fit.scale.map((v) => v.toFixed(2)).join(' × ')}) — xem lại ảnh / NHA_MODEL_TUNE`);
      const g = new THREE.Group();
      g.position.copy(parts.group.position);
      g.rotation.copy(parts.group.rotation);
      g.add(fit.mesh);
      const glow = windowGlow(fit.mesh, front, tune);
      if (glow) g.add(glow);
      markDynamic(g);
      scene.add(g);
      onAdded();
      const { mesh: _mesh, ...rest } = fit;
      return { id: b.id, source: standIn ? 'the' : 'model', fit: rest };
    },
    (e: unknown): HouseReport => {
      console.warn(`buildings: nạp model nhà "${b.id}" lỗi — dùng bản khối`, e);
      mergeStatic(parts.group, new Set()); // bản khối muộn: gộp riêng theo vật liệu (cảnh đã gộp xong)
      scene.add(parts.group);
      onAdded();
      return { id: b.id, source: 'khoi' };
    },
  );
  return { pads, ready };
}
