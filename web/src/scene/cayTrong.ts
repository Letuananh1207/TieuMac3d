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
import { CODE_LOOKS, CODE_SOWN, codeShape, POP_S, popScale, type CodePart } from './cayTrongHinh';

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
 * Lớp cây gộp: `show(list)` — mỗi phần tử một luống (`null` = không cây) cùng thứ tự `spots`; chỉ dựng lại luống đổi dáng.
 * `code` (cây `chum`, V-60): hình dựng bằng code (`cayTrongHinh.ts`) thay mẫu Kenney, luống đổi sang dáng mới thì "nảy"
 * 0,6 → 1,1 → 1,0 trong `POP_S` (`tick` mỗi khung). Trả số tam giác đang vẽ (đo ngân sách).
 */
export class CropLayer {
  readonly mesh: THREE.Mesh;
  private shapes = new Map<CropShape, THREE.BufferGeometry>();
  private key = '';
  private last: readonly (PlotShow | null)[] = [];
  /** dáng đang dựng từng luống + hình luống (gốc toạ độ = tâm luống) */
  private plotKeys: string[] = [];
  private plotGeo: (THREE.BufferGeometry | null)[] = [];
  /** luống đang nảy → giây đã qua */
  private pops = new Map<number, number>();
  /** luống đang nảy mạnh (bón / vừa chín — R-VUON-13) → giây đã qua */
  private bounces = new Map<number, number>();
  /** quả đang bay khi thu: hình luống lúc thu + giây + đích */
  private flights: { geo: THREE.BufferGeometry; from: THREE.Vector3; to: THREE.Vector3 | null; t: number }[] = [];
  /** luống vừa thu (hình đã bay đi) — không vẽ chỗ cũ tới khi `show` đổi dáng */
  private flown = new Set<number>();
  /** lưới quả bay (1 draw call, chỉ khi đang bay) */
  readonly flyMesh: THREE.Mesh;
  /** giảm chuyển động (R-VUON-13): bỏ nảy mạnh + quả bay */
  reduced = false;

  constructor(
    scene: THREE.Scene,
    private readonly spots: readonly CropSpot[],
    look: LookSpec,
    private readonly scale: number,
    private readonly code = false,
  ) {
    // hình code đều kín / hai mặt → FrontSide; mẫu Kenney có mặt hở → DoubleSide
    const mat = softMaterial(look.wrap, code ? THREE.FrontSide : THREE.DoubleSide, { amp: look.wind * 0.5, tip: 0.5, world: true });
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    this.mesh.frustumCulled = false; // hình đổi luôn — khỏi tính lại khối bao mỗi lần
    markDynamic(this.mesh);
    scene.add(this.mesh);
    this.flyMesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    this.flyMesh.frustumCulled = false;
    this.flyMesh.visible = false;
    markDynamic(this.flyMesh);
    this.mesh.add(this.flyMesh); // lưới cây ở gốc toạ độ → con của nó vẫn là toạ độ thế giới
    if (!code && typeof window !== 'undefined' && Object.keys(MODELS).length)
      loadShapes()
        .then((m) => {
          this.shapes = m;
          this.key = '';
          this.plotKeys = [];
          this.show(this.last);
        })
        .catch((e: unknown) => console.warn('vườn rau: nạp hình cây design/models/thuc-vat/vuon lỗi — dùng hình dự phòng', e));
  }

  get triangles(): number {
    return (this.mesh.geometry.getAttribute('position')?.count ?? 0) / 3;
  }

  show(list: readonly (PlotShow | null)[]): void {
    this.last = list;
    const keys = list.map((s) => (s ? `${s.crop}:${s.stage}` : '-'));
    const key = keys.join(',') + `|${this.shapes.size}`;
    if (key === this.key) return;
    const first = this.plotKeys.length === 0;
    this.key = key;
    this.spots.forEach((spot, i) => {
      const k = keys[i] ?? '-';
      if (k === this.plotKeys[i]) return;
      this.plotGeo[i]?.dispose();
      this.plotGeo[i] = this.buildPlot(list[i] ?? null, spot, i);
      this.flown.delete(i);
      // đổi sang dáng mới (gieo, lớn lên) thì nảy; nhổ / thu (về trống) và lần dựng đầu thì không
      if (this.code && !first && k !== '-') this.pops.set(i, 0);
    });
    this.plotKeys = this.spots.map((_, i) => keys[i] ?? '-');
    this.compose();
  }

  /** Mỗi khung: luống đang nảy thì dựng lại lưới gộp với cỡ nảy (vài lần / giờ, mỗi lần ≤ 15 khung). */
  tick(dt: number): void {
    if (this.flights.length) this.fly(dt);
    if (!this.pops.size && !this.bounces.size) return;
    for (const [i, t] of this.pops) {
      if (t + dt >= POP_S) this.pops.delete(i);
      else this.pops.set(i, t + dt);
    }
    for (const [i, t] of this.bounces) {
      if (t + dt >= BOUNCE_S) this.bounces.delete(i);
      else this.bounces.set(i, t + dt);
    }
    this.compose();
  }

  /** Nảy mạnh luống [i] (bón — "Mau lớn!", vừa chín — R-VUON-13): co dãn kiểu thạch 0,5 s. Giảm chuyển động → bỏ qua. */
  bounce(i: number): void {
    if (this.reduced || !this.plotGeo[i]) return;
    this.bounces.set(i, 0);
    this.compose();
  }

  /**
   * Thu luống [i] (R-VUON-13): hình cây trên luống bay vòng lên rồi bay về [to] (thế giới — góc túi chiếu vào cảnh, thiếu =
   * bay thẳng lên rồi biến) trong `FLY_S`; chỗ cũ trống ngay. Giảm chuyển động → chỉ ẩn chỗ cũ.
   */
  flyHarvest(i: number, to?: { x: number; y: number; z: number }): void {
    const g = this.plotGeo[i];
    const spot = this.spots[i];
    if (!g || !spot || this.flown.has(i)) return;
    this.flown.add(i);
    if (!this.reduced) this.flights.push({ geo: g.clone(), from: new THREE.Vector3(spot.x, spot.y, spot.z), to: to ? new THREE.Vector3(to.x, to.y, to.z) : null, t: 0 });
    this.compose();
  }

  private fly(dt: number): void {
    const parts: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    for (const f of this.flights) f.t += dt;
    for (const f of this.flights.filter((x) => x.t >= FLY_S)) f.geo.dispose();
    this.flights = this.flights.filter((f) => f.t < FLY_S);
    for (const f of this.flights) {
      const p = flyPath(f.t, f.from, f.to);
      m.compose(v.set(p.x, p.y, p.z), q.setFromAxisAngle(up, f.t * 9), new THREE.Vector3(p.scale, p.scale, p.scale));
      parts.push(f.geo.clone().applyMatrix4(m));
    }
    this.flyMesh.geometry.dispose();
    this.flyMesh.geometry = parts.length ? (mergeGeometries(parts) ?? new THREE.BufferGeometry()) : new THREE.BufferGeometry();
    for (const g of parts) g.dispose();
    this.flyMesh.visible = parts.length > 0;
  }

  private buildPlot(s: PlotShow | null, spot: CropSpot, i: number): THREE.BufferGeometry | null {
    if (!s) return null;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const parts: THREE.BufferGeometry[] = [];
    const part = this.code ? codePart(s) : cropPart(s);
    const src = this.code ? codeShape((part as CodePart).shape) : (this.shapes.get((part as CropPart).shape) ?? fallback((part as CropPart).shape));
    const k = part.scale * this.scale * (spot.size / 1.6);
    clumpOffsets(part.count, spot.size).forEach(([dx, dz], j) => {
      // xoay mỗi khóm khác nhau theo luống + khóm (không lặp đều), không ngẫu nhiên theo lần dựng
      q.setFromAxisAngle(up, ((i * 7 + j * 3) % 8) * 0.785 + 0.3);
      m.compose(new THREE.Vector3(dx, -0.02, dz), q, new THREE.Vector3(k, k, k));
      parts.push(src.clone().applyMatrix4(m));
    });
    const g = parts.length > 1 ? mergeGeometries(parts) : parts[0];
    if (parts.length > 1) for (const x of parts) x.dispose();
    return g ?? null;
  }

  private compose(): void {
    const parts: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    const sc = new THREE.Matrix4();
    this.plotGeo.forEach((g, i) => {
      const spot = this.spots[i];
      if (!g || !spot || this.flown.has(i)) return;
      const pop = this.pops.has(i) ? popScale(this.pops.get(i) ?? POP_S) : 1;
      const b = this.bounces.has(i) ? bounceScale(this.bounces.get(i) ?? BOUNCE_S) : { xz: 1, y: 1 };
      m.makeTranslation(spot.x, spot.y, spot.z).multiply(sc.makeScale(pop * b.xz, pop * b.y, pop * b.xz));
      parts.push(g.clone().applyMatrix4(m));
    });
    this.mesh.geometry.dispose();
    this.mesh.geometry = parts.length ? (mergeGeometries(parts) ?? new THREE.BufferGeometry()) : new THREE.BufferGeometry();
    for (const g of parts) g.dispose();
  }
}

/** Nảy mạnh (bón / vừa chín) kéo dài (s). */
export const BOUNCE_S = 0.5;
/** Quả bay khi thu (s). */
export const FLY_S = 0.9;

/** Co dãn kiểu thạch lúc [t]: dẹt 0,8 → vươn cao 1,3 → dẹt nhẹ → 1 (giữ thể tích gần đúng: ngang ngược dọc). */
export function bounceScale(t: number): { xz: number; y: number } {
  const u = t / BOUNCE_S;
  if (u >= 1 || u < 0) return { xz: 1, y: 1 };
  const y = 1 + Math.sin(u * Math.PI * 2.5) * 0.3 * (1 - u) - (u < 0.15 ? 0.2 * Math.sin((u / 0.15) * Math.PI) : 0);
  return { xz: 1 / Math.sqrt(Math.max(0.5, y)), y };
}

/** Quỹ đạo quả bay lúc [t]: 40 % đầu bay vòng lên ~1,4 m (cỡ 0,8 → 1), rồi lao về [to] (thiếu → lên thêm) và co về 0,25. */
export function flyPath(t: number, from: { x: number; y: number; z: number }, to: { x: number; y: number; z: number } | null): { x: number; y: number; z: number; scale: number } {
  const u = Math.min(1, Math.max(0, t / FLY_S));
  const rise = Math.min(1, u / 0.4);
  const ease = rise * (2 - rise);
  const top = { x: from.x + Math.sin(rise * Math.PI) * 0.3, y: from.y + 1.4 * ease, z: from.z };
  if (u <= 0.4) return { ...top, scale: 0.8 + 0.2 * ease };
  const k = (u - 0.4) / 0.6;
  const kk = k * k;
  const end = to ?? { x: from.x, y: from.y + 2.6, z: from.z };
  const peak = { x: from.x, y: from.y + 1.4, z: from.z };
  return { x: peak.x + (end.x - peak.x) * kk, y: peak.y + (end.y - peak.y) * kk, z: peak.z + (end.z - peak.z) * kk, scale: 1 - 0.75 * k };
}

/** Dáng code của một luống (cây `chum`). Cây lạ → cải. */
export function codePart(show: PlotShow): CodePart {
  if (show.stage === 'vua-gieo') return CODE_SOWN;
  const look = CODE_LOOKS[show.crop] ?? CODE_LOOKS.cai;
  return look[CROP_STAGES.indexOf(show.stage) - 1];
}
