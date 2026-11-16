/**
 * Hạc truyền tống bằng model (`design/models/hac.glb` — Tripo, tư thế bay lướt, KHÔNG rig; kế hoạch
 * docs/tasks/2026-11-16-hac-model.md). Nạp một lần, chuẩn hoá (sải dọc x, mũi +z, sải `CRANE_SPAN`, đáy y = 0, chỗ ngồi ở
 * z = `SEAT_Z` như bản khối), đo dáng + chia trọng số (`hacCanh.ts`, chân `hacChan.ts`) rồi tự gắn 13 xương: gốc · vai
 * + đầu cánh trái / phải · hông + gối + cổ chân trái / phải · gốc cổ + đầu (`hacCo.ts`) → `Crane.useModel` vỗ cánh, đứng
 * (L-22) bằng xương. Thiếu file / nạp lỗi → `null`, hạc giữ bản khối (`hac.ts`).
 * Lớp `scene/` không import `player/` (0001) → không dùng `autoRig.ts`; nạp bằng `staticModel.ts`.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CRANE_BONES, craneWeights, measureCrane, spanYaw, type CraneShape } from './hacCanh';
import { measureLegs } from './hacChan';
import { measureNeck } from './hacCo';
import { bakeTransforms, loadStaticModel, staticModelUrl } from './staticModel';

/** Sải cánh chuẩn (m, chưa nhân `crane.scale`) — bằng bản khối (Q4): bãi đáp, camera, đường bay giữ nguyên. */
export const CRANE_SPAN = 5.6;
/** z chỗ ngồi (như `SEAT_AT` của bản khối) */
const SEAT_Z = -0.1;

/** Chỉnh tay khi đặt model thật (NV8): mã file, hướng mũi, ép vai, độ nâng chỗ ngồi. */
export const CRANE_MODEL_TUNE = {
  id: 'hac',
  /** quay thêm quanh trục đứng (rad) sau khi tự đặt sải dọc x — mũi phải nhìn +z */
  yaw: 0,
  /** ép x vai (m, sau chuẩn cỡ) — `null` = tự đo */
  shoulderX: null as number | null,
  /** chỗ ngồi cao hơn đỉnh lưng (m) */
  seatLift: 0.11,
};
export type CraneTune = typeof CRANE_MODEL_TUNE;

export interface CraneModel {
  /** lưới đã chuẩn hoá, có `skinIndex` / `skinWeight` (dùng chung giữa các hạc — không dispose) */
  readonly geometry: THREE.BufferGeometry;
  /** vật liệu gốc — mỗi hạc dùng bản sao (ngày đêm nhân màu từng cảnh riêng) */
  readonly material: THREE.Material;
  readonly shape: CraneShape;
  readonly triangles: number;
}

const positions = (g: THREE.BufferGeometry): ArrayLike<number> => g.getAttribute('position').array;

/** Lưới bất kỳ (toạ độ model) → model hạc chuẩn hoá + trọng số. Không sửa `src`. */
export function craneModelFrom(src: THREE.BufferGeometry, material: THREE.Material, tune: CraneTune = CRANE_MODEL_TUNE): CraneModel {
  const g = src.clone();
  const yaw = spanYaw(positions(g)) + tune.yaw;
  if (yaw) g.rotateY(yaw);
  g.computeBoundingBox();
  const b = g.boundingBox as THREE.Box3;
  const half = (b.max.x - b.min.x) / 2;
  if (!(half > 0)) throw new Error('hacModel: lưới không có sải cánh');
  g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, 0);
  const k = CRANE_SPAN / 2 / half;
  g.scale(k, k, k);
  const opts = { shoulderX: tune.shoulderX, seatLift: tune.seatLift };
  g.translate(0, 0, SEAT_Z - measureCrane(positions(g), opts).seat[2]);
  const pos = positions(g);
  const shape: CraneShape = measureCrane(pos, opts);
  shape.legs = measureLegs(pos, g.index ? g.index.array : null, shape.halfSpan, shape.shoulder[0] * 0.9);
  shape.neck = measureNeck(pos, g.index ? g.index.array : null, shape.seat[2], shape.shoulder[0] * 0.9, shape.halfSpan);
  const w = craneWeights(pos, shape);
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(w.index, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(w.weight, 4));
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  g.computeBoundingSphere();
  const triangles = (g.index ? g.index.count : g.getAttribute('position').count) / 3;
  return { geometry: g, material, shape, triangles };
}

/**
 * Xương của một hạc (theo thứ tự `CRANE_BONES`) — đầu cánh là con của vai, gối con của hông, cổ chân con của gối, đầu con
 * của gốc cổ; không đo được chân / cổ → xương vẫn có (không đỉnh nào theo) cho đủ thứ tự.
 */
function craneBones(s: CraneShape): THREE.Bone[] {
  const bones = CRANE_BONES.map((name) => Object.assign(new THREE.Bone(), { name }));
  const [root, vaiT, dauT, vaiP, dauP, hongT, goiT, coT, hongP, goiP, coP, goCo, dauHac] = bones;
  for (const [vai, dau, side] of [[vaiT, dauT, -1], [vaiP, dauP, 1]] as const) {
    vai.position.set(side * s.shoulder[0], s.shoulder[1], s.shoulder[2]);
    dau.position.set(side * (s.tip[0] - s.shoulder[0]), s.tip[1] - s.shoulder[1], s.tip[2] - s.shoulder[2]);
    vai.add(dau);
    root.add(vai);
  }
  const L = s.legs;
  for (const [hong, goi, co, side] of [[hongT, goiT, coT, -1], [hongP, goiP, coP, 1]] as const) {
    if (L) {
      hong.position.set(side * L.hip[0], L.hip[1], L.hip[2]);
      goi.position.set(0, L.knee[1] - L.hip[1], L.knee[2] - L.hip[2]);
      co.position.set(0, L.ankle[1] - L.knee[1], L.ankle[2] - L.knee[2]);
    }
    goi.add(co);
    hong.add(goi);
    root.add(hong);
  }
  const N = s.neck;
  if (N) {
    goCo.position.set(...N.base);
    dauHac.position.set(0, N.head[1] - N.base[1], N.head[2] - N.base[2]);
  }
  goCo.add(dauHac);
  root.add(goCo);
  return bones;
}

/** Một SkinnedMesh hạc (vật liệu riêng) + xương; xương ở tư thế gốc = đúng dáng model. */
export function craneMesh(m: CraneModel): { mesh: THREE.SkinnedMesh; bones: THREE.Bone[]; material: THREE.Material } {
  const material = m.material.clone();
  const mesh = new THREE.SkinnedMesh(m.geometry, material);
  const bones = craneBones(m.shape);
  mesh.add(bones[0]);
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  mesh.name = 'hac-model';
  mesh.frustumCulled = false;
  return { mesh, bones, material };
}

/* ---------- nạp một lần ---------- */

const pending = new Map<string, Promise<CraneModel | null>>();
const ready = new Map<string, CraneModel>();

async function loadFrom(url: string, tune: CraneTune): Promise<CraneModel> {
  const root = await loadStaticModel(url);
  const meshes = bakeTransforms(root);
  if (!meshes.length) throw new Error(`hacModel: không có lưới (${url})`);
  const geos = meshes.map((m) => m.geometry);
  const geo = geos.length === 1 ? geos[0] : mergeGeometries(geos);
  if (!geo) throw new Error(`hacModel: không gộp được ${geos.length} lưới (${url})`);
  const mat = meshes[0].material;
  const model = craneModelFrom(geo, Array.isArray(mat) ? mat[0] : mat, tune);
  for (const g of new Set([geo, ...geos])) g.dispose();
  return model;
}

/** Nạp model hạc `id` (mặc định `hac`) một lần; không có file / lỗi → `null` (báo ở console). */
export function loadCraneModel(id: string = CRANE_MODEL_TUNE.id): Promise<CraneModel | null> {
  let p = pending.get(id);
  if (!p) {
    const url = staticModelUrl(id);
    const tune = { ...CRANE_MODEL_TUNE, id };
    p = url
      ? loadFrom(url, tune).then(
          (m) => (ready.set(id, m), m),
          (e: unknown) => (console.warn(`[hac] ${id}.glb nạp lỗi — dùng hạc khối`, e), null),
        )
      : Promise.resolve(null);
    pending.set(id, p);
  }
  return p;
}

/** Model đã nạp xong thì gọi ngay, chưa thì gọi khi nạp xong (Q2: đổi ngay khi hạc đã hiện); không có file → không gọi. */
export function withCraneModel(use: (m: CraneModel) => void, id: string = CRANE_MODEL_TUNE.id): void {
  const m = ready.get(id);
  if (m) use(m);
  else void loadCraneModel(id).then((r) => r && use(r));
}
