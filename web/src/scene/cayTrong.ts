/**
 * Cây trên luống vườn rau (R-VUON-4): mỗi luống một dáng theo cây + giai đoạn (vừa gieo · mầm · đang lớn · chín), hình từ gói
 * **Kenney Nature Kit** (CC0 — `design/models/thuc-vat/vuon/*.glb`, đã nướng màu đỉnh bằng `npm run model:thuc-vat`, ghi ở
 * `design/models/LICENSES.md`). Mọi cây đang hiện **gộp một lưới** (1 draw call), dựng lại chỉ khi một luống đổi dáng (vài lần
 * / giờ). Vật liệu mềm có gió (ngọn lay). Hình nạp sau; chưa nạp xong / lỗi → khối dự phòng đúng chỗ, đúng màu.
 * Lớp scene không biết luật vườn: nhận `PlotShow` (mã cây + giai đoạn) từ file ghép `homeGarden.ts`.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { LookSpec } from './look';
import { softMaterial } from './materials';
import { markDynamic } from './merge';
import { bakeTransforms } from './staticModel';

/** Hình có màu đỉnh một màu (bỏ uv, không chỉ mục — để gộp). */
export function painted(g0: THREE.BufferGeometry, hex: string | THREE.Color, shadeBottom = 0): THREE.BufferGeometry {
  const g = g0.index ? g0.toNonIndexed() : g0;
  g.deleteAttribute('uv');
  const c = new THREE.Color(hex);
  const pos = g.getAttribute('position');
  g.computeBoundingBox();
  const { min, max } = g.boundingBox!;
  const span = max.y - min.y || 1;
  const col = new Float32Array(pos.count * 3);
  const t = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    // bóng nướng chân: tối dần xuống đáy
    const k = 1 - shadeBottom * (1 - (pos.getY(i) - min.y) / span);
    t.copy(c).multiplyScalar(k).toArray(col, i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

const MODELS = import.meta.glob('../../../design/models/thuc-vat/vuon/*.glb', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** Hình trong gói (tên file không đuôi). */
export type CropShape = 'la-a' | 'la-b' | 'cu-cai' | 'ngo-a' | 'ngo-c' | 'ngo-d' | 'lua-b' | 'bi' | 'cuc' | 'dua' | 'bui-nho' | 'bui' | 'dat';
const SHAPES: readonly CropShape[] = ['la-a', 'la-b', 'cu-cai', 'ngo-a', 'ngo-c', 'ngo-d', 'lua-b', 'bi', 'cuc', 'dua', 'bui-nho', 'bui', 'dat'];

/** Giai đoạn có cây — cùng chuỗi `PlotState` của `zones/vuon.ts` (hai lớp không import nhau). */
export type CropStage = 'vua-gieo' | 'mam' | 'lon' | 'chin';
export const CROP_STAGES: readonly CropStage[] = ['vua-gieo', 'mam', 'lon', 'chin'];

/** Một luống đang có cây: mã cây (`zones/vuon.ts` `CropId`) + giai đoạn. */
export interface PlotShow {
  crop: string;
  stage: CropStage;
}

/** Một dáng: hình + cỡ (nhân `cropScale`) + số khóm trên luống (1 · 2 · 4). */
export interface CropPart {
  shape: CropShape;
  scale: number;
  count: 1 | 2 | 4;
}

const p = (shape: CropShape, scale: number, count: 1 | 2 | 4): CropPart => ({ shape, scale, count });

/** Vừa gieo: 4 ụ đất (cây nào cũng vậy). */
const SOWN = p('dat', 1, 4);

/**
 * Dáng từng cây ở mầm · đang lớn · chín. Gói không có đậu xanh → cây `ngo` (Ngô, đủ 3 dáng); không có cải / trà → Cải ngọt
 * dùng lá `la-a` / `la-b`, Trà dùng bụi `bui-nho` / `bui`; lúa mầm / đang lớn dùng lá + ngô non (`crops_wheatStageA` quá nặng).
 */
export const CROP_LOOKS: Readonly<Record<string, readonly [CropPart, CropPart, CropPart]>> = {
  cai: [p('la-a', 0.6, 4), p('la-a', 1, 4), p('la-b', 1.1, 4)],
  'cu-cai': [p('la-a', 0.6, 4), p('la-b', 0.9, 4), p('cu-cai', 1.1, 4)],
  ngo: [p('ngo-a', 0.7, 4), p('ngo-c', 0.9, 2), p('ngo-d', 1, 2)],
  lua: [p('la-a', 0.5, 4), p('ngo-a', 0.75, 4), p('lua-b', 1.3, 1)],
  bi: [p('la-a', 0.7, 2), p('la-b', 1.2, 2), p('bi', 1.5, 1)],
  cuc: [p('la-a', 0.6, 4), p('bui-nho', 1.2, 4), p('cuc', 2.2, 4)],
  dua: [p('la-a', 0.7, 2), p('la-b', 1.2, 2), p('dua', 1.5, 1)],
  tra: [p('la-a', 0.6, 4), p('bui-nho', 1.5, 4), p('bui', 2.2, 2)],
};

/** Dáng của một luống. Cây lạ → lá. */
export function cropPart(show: PlotShow): CropPart {
  if (show.stage === 'vua-gieo') return SOWN;
  const look = CROP_LOOKS[show.crop] ?? CROP_LOOKS.cai;
  return look[CROP_STAGES.indexOf(show.stage) - 1];
}

/** Chỗ các khóm trên luống cạnh [size] (lệch tâm, m). */
export function clumpOffsets(count: 1 | 2 | 4, size: number): [number, number][] {
  const d = size * 0.24;
  if (count === 1) return [[0, 0]];
  if (count === 2) return [[-d, -d * 0.6], [d, d * 0.6]];
  return [[-d, -d], [d, -d], [-d, d], [d, d]];
}

/** Hình dự phòng (chưa nạp / lỗi): nón lá xanh; ụ đất nâu. */
function fallback(shape: CropShape): THREE.BufferGeometry {
  if (shape === 'dat') return painted(new THREE.SphereGeometry(0.16, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.4, 1), '#7a5a40');
  return painted(new THREE.ConeGeometry(0.15, 0.4, 5).translate(0, 0.2, 0), '#6f9e4c', 0.4);
}

/** Lưới gltf → chỉ vị trí + pháp tuyến + màu (float, không chỉ mục) để gộp được với nhau. */
function plain(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g0 = src.index ? src.toNonIndexed() : src.clone();
  const out = new THREE.BufferGeometry();
  const pos = g0.getAttribute('position');
  out.setAttribute('position', new THREE.BufferAttribute(Float32Array.from({ length: pos.count * 3 }, (_, i) => pos.getComponent(Math.floor(i / 3), i % 3)), 3));
  const c = g0.getAttribute('color');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) col.set(c ? [c.getX(i), c.getY(i), c.getZ(i)] : [0.4, 0.6, 0.3], i * 3);
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeVertexNormals();
  return out;
}

async function loadShapes(): Promise<Map<CropShape, THREE.BufferGeometry>> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const out = new Map<CropShape, THREE.BufferGeometry>();
  await Promise.all(
    SHAPES.map(async (s) => {
      const url = MODELS[`../../../design/models/thuc-vat/vuon/${s}.glb`];
      if (!url) return;
      const gltf = await loader.loadAsync(url);
      const meshes = bakeTransforms(gltf.scene);
      const parts = meshes.map((m) => plain(m.geometry));
      const g = parts.length > 1 ? mergeGeometries(parts) : parts[0];
      if (g) out.set(s, g);
    }),
  );
  return out;
}

/** Chỗ một luống trên cảnh: tâm + mặt luống (y) + cạnh. */
export interface CropSpot {
  x: number;
  y: number;
  z: number;
  size: number;
}

/**
 * Lớp cây gộp: `show(list)` — mỗi phần tử một luống (`null` = không cây) cùng thứ tự `spots`; chỉ dựng lại khi có luống đổi
 * dáng. Trả số tam giác đang vẽ (đo ngân sách).
 */
export class CropLayer {
  readonly mesh: THREE.Mesh;
  private shapes = new Map<CropShape, THREE.BufferGeometry>();
  private key = '';
  private last: readonly (PlotShow | null)[] = [];

  constructor(
    scene: THREE.Scene,
    private readonly spots: readonly CropSpot[],
    look: LookSpec,
    private readonly scale: number,
  ) {
    const mat = softMaterial(look.wrap, THREE.DoubleSide, { amp: look.wind * 0.5, tip: 0.5, world: true });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    this.mesh.frustumCulled = false; // hình đổi luôn — khỏi tính lại khối bao mỗi lần
    markDynamic(this.mesh);
    scene.add(this.mesh);
    if (typeof window !== 'undefined' && Object.keys(MODELS).length)
      loadShapes()
        .then((m) => {
          this.shapes = m;
          this.key = '';
          this.show(this.last);
        })
        .catch((e: unknown) => console.warn('vườn rau: nạp hình cây design/models/thuc-vat/vuon lỗi — dùng hình dự phòng', e));
  }

  get triangles(): number {
    return (this.mesh.geometry.getAttribute('position')?.count ?? 0) / 3;
  }

  show(list: readonly (PlotShow | null)[]): void {
    this.last = list;
    const key = list.map((s) => (s ? `${s.crop}:${s.stage}` : '-')).join(',') + `|${this.shapes.size}`;
    if (key === this.key) return;
    this.key = key;
    const parts: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    list.forEach((s, i) => {
      const spot = this.spots[i];
      if (!s || !spot) return;
      const part = cropPart(s);
      const src = this.shapes.get(part.shape) ?? fallback(part.shape);
      const k = part.scale * this.scale * (spot.size / 1.6);
      clumpOffsets(part.count, spot.size).forEach(([dx, dz], j) => {
        // xoay mỗi khóm khác nhau theo luống + khóm (không lặp đều), không ngẫu nhiên theo lần dựng
        q.setFromAxisAngle(up, ((i * 7 + j * 3) % 8) * 0.785 + 0.3);
        m.compose(new THREE.Vector3(spot.x + dx, spot.y - 0.02, spot.z + dz), q, new THREE.Vector3(k, k, k));
        parts.push(src.clone().applyMatrix4(m));
      });
    });
    this.mesh.geometry.dispose();
    this.mesh.geometry = parts.length ? (mergeGeometries(parts) ?? new THREE.BufferGeometry()) : new THREE.BufferGeometry();
    for (const g of parts) g.dispose();
  }
}
