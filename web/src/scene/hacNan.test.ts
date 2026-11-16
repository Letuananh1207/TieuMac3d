/**
 * Nắn dáng hạc model (V-20261116-104): đo model thật `design/models/hac.glb` trước / sau nắn so với hạc khối cũ — thân
 * thon, cổ dài, chân dài, sải giữ; dáng đứng / cưỡi vẫn đúng (R-HANH-5, L-22).
 */
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { blockCraneGeometry, Crane } from './hac';
import { legWeight } from './hacChan';
import { craneModelFrom, CRANE_MODEL_TUNE, CRANE_SPAN, type CraneModel } from './hacModel';
import { DEFAULT_SCENE } from './spec';
import { bakeTransforms } from './staticModel';

const spec = DEFAULT_SCENE.crane;
const K = spec.scale;
/** bề dày thân hạc khối (`hac.ts` bodyGeometry: cầu 0,5 × 0,66 → 0,66 m) × scale — lưới khối thưa, đo đỉnh không chuẩn */
const BLOCK_THICK = 0.66 * K;
const mat = (): THREE.Material => new THREE.MeshBasicMaterial();

/** Đọc hac.glb trên Node: bỏ vật liệu / ảnh (Node không giải mã ảnh) — chỉ cần lưới. */
async function hacGeometry(): Promise<THREE.BufferGeometry> {
  const buf = readFileSync(new URL('../../../design/models/hac.glb', import.meta.url));
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jsonLen))) as {
    meshes: { primitives: { material?: number }[] }[];
    [k: string]: unknown;
  };
  for (const m of json.meshes) for (const p of m.primitives) delete p.material;
  for (const k of ['materials', 'textures', 'images', 'samplers']) delete json[k];
  let js = new TextEncoder().encode(JSON.stringify(json));
  const padded = new Uint8Array(Math.ceil(js.length / 4) * 4).fill(0x20);
  padded.set(js);
  js = padded;
  const rest = buf.subarray(20 + jsonLen);
  const out = new Uint8Array(20 + js.length + rest.length);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, 0x46546c67, true);
  ov.setUint32(4, 2, true);
  ov.setUint32(8, out.length, true);
  ov.setUint32(12, js.length, true);
  ov.setUint32(16, 0x4e4f534a, true);
  out.set(js, 20);
  out.set(rest, 20 + js.length);
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync(out.buffer, '');
  const root = new THREE.Group();
  root.add(gltf.scene);
  return bakeTransforms(root)[0].geometry;
}

/** Số đo (m, đã nhân `crane.scale`) */
export interface Measures {
  span: number;
  /** đuôi → mỏ (bỏ chân) */
  length: number;
  /** bề dày thân ở chỗ ngồi */
  thick: number;
  /** bề ngang ngực (trước cánh, ngay sau gốc cổ) */
  chest: number;
  /** gốc cổ → khớp đầu */
  neck: number;
  /** hông → mút ngón */
  legs: number;
  /** đứng đáp: đỉnh đầu / chỗ ngồi cao */
  standTop: number;
  standSeat: number;
}

function standing(m: CraneModel): { c: Crane; pts: THREE.Vector3[] } {
  const c = new Crane(spec);
  c.useModel(m);
  c.fold = 1;
  c.stand = 1;
  c.update(0, 0, 4);
  c.root.updateMatrixWorld(true);
  const mesh = c.root.children.find((o): o is THREE.SkinnedMesh => o instanceof THREE.SkinnedMesh) as THREE.SkinnedMesh;
  const pos = m.geometry.getAttribute('position');
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < pos.count; i++) pts.push(mesh.applyBoneTransform(i, new THREE.Vector3().fromBufferAttribute(pos, i)));
  return { c, pts };
}

function measures(m: CraneModel, standsAlready = false): Measures {
  const s = m.shape;
  const p = m.geometry.getAttribute('position');
  let z0 = Infinity;
  let z1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  let chest = 0;
  const cz = s.neck ? s.neck.base[2] - 0.15 : s.seat[2];
  for (let i = 0; i < p.count; i++) {
    const [x, y, z] = [p.getX(i), p.getY(i), p.getZ(i)];
    if (Math.abs(x) > s.shoulder[0]) continue;
    if (s.legs && legWeight(x, y, z, s.legs).w > 0.3) continue;
    z0 = Math.min(z0, z);
    z1 = Math.max(z1, z);
    if (Math.abs(z - s.seat[2]) < 0.1 && Math.abs(x) < s.shoulder[0] * 0.6) [y0, y1] = [Math.min(y0, y), Math.max(y1, y)];
    if (Math.abs(z - cz) < 0.08) chest = Math.max(chest, Math.abs(x) * 2);
  }
  const d = (a: number[], b: number[]): number => Math.hypot(a[1] - b[1], a[2] - b[2]);
  let standTop = 0;
  let standSeat = 0;
  if (standsAlready) {
    m.geometry.computeBoundingBox();
    standTop = (m.geometry.boundingBox as THREE.Box3).max.y;
    standSeat = s.seat[1];
  } else {
    const { c, pts } = standing(m);
    standTop = Math.max(...pts.map((v) => v.y));
    standSeat = c.seat.position.y;
  }
  return {
    span: s.halfSpan * 2 * K,
    length: (z1 - z0) * K,
    thick: (y1 - y0) * K,
    chest: chest * K,
    neck: s.neck ? d(s.neck.base, s.neck.head) * K : 0,
    legs: s.legs ? d(s.legs.hip, s.legs.toe) * K : 0,
    standTop: standTop * K,
    standSeat: standSeat * K,
  };
}

describe('nắn dáng hạc model — V-20261116-104 (thân thon, cổ dài, chân dài như hạc khối)', () => {
  let raw: CraneModel;
  let nan: CraneModel;
  let before: Measures;
  let after: Measures;
  let block: Measures;
  beforeAll(async () => {
    const g = await hacGeometry();
    raw = craneModelFrom(g, mat());
    nan = craneModelFrom(g, mat(), CRANE_MODEL_TUNE, CRANE_MODEL_TUNE.nan);
    before = measures(raw);
    after = measures(nan);
    block = measures(craneModelFrom(blockCraneGeometry(spec), mat()), true);
  }, 30000);

  it('sải giữ 5,6 m (× scale) — bãi đáp, camera, đường bay không đổi', () => {
    expect(after.span).toBeCloseTo(CRANE_SPAN * K, 3);
    expect(before.span).toBeCloseTo(CRANE_SPAN * K, 3);
  });

  it('thân ngắn + mỏng hơn hẳn (gần hạc khối), cổ + chân dài hơn', () => {
    expect(after.length).toBeLessThan(before.length * 0.85);
    expect(after.thick).toBeLessThan(before.thick * 0.65);
    expect(after.thick).toBeLessThan(BLOCK_THICK * 1.2); // hạc khối: thân bầu dục dày 0,66 m (chưa scale)
    expect(after.length).toBeLessThan(block.length * 1.15);
    expect(after.chest).toBeLessThan(before.chest * 0.8);
    expect(after.neck).toBeGreaterThan(before.neck * 1.4);
    expect(after.legs).toBeGreaterThan(before.legs * 1.15);
    // tỉ lệ "cao gầy": cổ + chân so với dày thân
    expect((after.neck + after.legs) / after.thick).toBeGreaterThan(((before.neck + before.legs) / before.thick) * 2);
  });

  it('đứng đáp: chân chạm đất, chỗ ngồi 2,2–2,6 m, đầu cao hơn chỗ ngồi (cổ ngẩng) — cao hơn nhân vật ~2,1 m', () => {
    const { c, pts } = standing(nan);
    expect(Math.abs(Math.min(...pts.map((v) => v.y)))).toBeLessThan(0.05);
    const seat = c.seat.position.y * K;
    expect(seat).toBeGreaterThanOrEqual(2.2);
    expect(seat).toBeLessThanOrEqual(2.6);
    expect(after.standTop).toBeGreaterThan(seat + 0.5);
    expect(after.standTop).toBeGreaterThan(2.1);
  });

  it('chỗ ngồi không lún vào lưng sau nắn; vẫn đủ 13 xương, đo được chân + cổ', () => {
    const [sx, sy, sz] = nan.shape.seat;
    const p = nan.geometry.getAttribute('position');
    for (let i = 0; i < p.count; i++)
      if (Math.abs(p.getX(i) - sx) < 0.2 && Math.abs(p.getZ(i) - sz) < 0.2) expect(p.getY(i)).toBeLessThan(sy);
    expect(nan.shape.legs).toBeTruthy();
    expect(nan.shape.neck).toBeTruthy();
  });

  it('nắn không đổi lưới nguồn, không đổi số tam giác', () => {
    expect(nan.triangles).toBe(raw.triangles);
  });

  it.skip('in bảng số đo (bật tay khi cần cập nhật kế hoạch)', () => {
    console.table({ khoi: block, truoc: before, sau: after });
  });
});
