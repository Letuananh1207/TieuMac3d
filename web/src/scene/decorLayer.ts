/**
 * Đồ trang trí đặt tự do trong cảnh (R-NHA-2, R-NHA-7 — V-69): dựng theo **danh sách món**, **InstancedMesh theo mã vật** (mỗi phần
 * hình của vật một InstancedMesh → ≤ 13 mã × 1–2 phần ≈ 15 draw call **bất kể số món**), vật cản theo món (vật to); món đang cầm vẽ
 * riêng thành **bóng ma** (mờ .85, phủ `jade` khi hợp lệ / `lacquer` khi sai) + khung chân theo hướng + mũi tên mặt trước + lưới 0,5 m
 * 4 × 4 m quanh món + gạch vùng cấm (thiết kế 2026-11-15.42 `TrangTriTuDo-dau`). Ghép (khi nào cầm, chuột / chạm, HUD) ở lớp gốc.
 */
import * as THREE from 'three';
import type { Box, Circle, Colliders } from '../collision/colliders';
import { pointInRect, rectCorners, type Rect } from '../collision/footprint';
import { DECOR_SHAPES, buildDecorItem, decorBlocks, disposeDecorItem } from './decorItems';
import { hallFloor } from './kien_truc/dien';
import { GIAN_TRONG_FLOOR } from './kien_truc/gian_trong';
import { NHA_O_FLOOR } from './kien_truc/nha_o';
import { markDynamic } from './merge';
import type { BuildingSpec, SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';

/** Điểm (x, z) có nằm trong chân nhà `b` (chữ nhật thẳng trục, đổi rộng ↔ sâu khi xoay 90 / 270) không. */
export function insideBuilding(b: BuildingSpec, x: number, z: number, margin = 0): boolean {
  const [w, d] = (b.rotY ?? 0) % 180 !== 0 ? [b.d, b.w] : [b.w, b.d];
  return Math.abs(x - b.x) <= w / 2 - margin && Math.abs(z - b.z) <= d / 2 - margin;
}

/**
 * Độ cao chân món ở (x, z): trong nhà = mặt sàn nhà chứa điểm (`gian-trong`: sàn ván; `nha-o`: sàn nền thấp; kiểu khác: sàn điện);
 * ngoài nhà = mặt đất (`groundY`, không địa hình = 0).
 */
export function decorFloorY(spec: Pick<SceneSpec, 'buildings' | 'buildingStyle'>, x: number, z: number, groundY?: GroundY): number {
  const home = spec.buildings.find((b) => insideBuilding(b, x, z));
  if (home?.kind === 'gian-trong') return GIAN_TRONG_FLOOR;
  if (home) return home.kind === 'nha-o' ? NHA_O_FLOOR : hallFloor(spec.buildingStyle);
  return groundY ? groundY(x, z) : 0;
}

/** Một món cần vẽ (theo dạng danh sách món `zones/decor.ts` + `blocks` của danh mục). */
export interface LayerItem {
  item: string;
  x: number;
  z: number;
  rot: number;
  blocks: boolean;
}

/** Bóng ma món đang cầm: chỗ thử + hợp lệ hay không. */
export interface GhostState {
  item: string;
  x: number;
  z: number;
  rot: number;
  ok: boolean;
}

/** Màu dấu (token thiết kế `design/tokens/design_tokens.json`): jade (hợp lệ), lacquer (sai). */
export interface GhostColors {
  jade: string;
  lacquer: string;
}

const RAD = Math.PI / 180;
/** Món tối đa một cảnh (sân 40 / gian trong 20) — sức chứa mỗi InstancedMesh. */
const CAPACITY = 40;

interface Part {
  mesh: THREE.InstancedMesh;
  local: THREE.Matrix4;
}

export class DecorLayer {
  /** gốc mọi vật trang trí (`markDynamic` — `mergeStatic` không gộp) */
  readonly root = new THREE.Group();
  private readonly parts = new Map<string, Part[]>();
  private items: LayerItem[] = [];
  private blocks: (Box | Circle)[] = [];
  private readonly ghost = new THREE.Group();
  private ghostItem: string | null = null;
  private ghostMats: THREE.MeshLambertMaterial[] = [];
  private readonly marks: GhostMarks;
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly up = new THREE.Vector3(0, 1, 0);

  constructor(
    scene: THREE.Scene,
    private readonly colliders: Colliders,
    private readonly spec: SceneSpec,
    private readonly groundY: GroundY | undefined,
    private readonly colors: GhostColors,
  ) {
    this.root.name = 'decor';
    markDynamic(this.root);
    scene.add(this.root);
    this.ghost.visible = false;
    this.root.add(this.ghost);
    this.marks = new GhostMarks(this.root, (x, z) => this.floorY(x, z), colors);
  }

  /** Độ cao chân món ở (x, z). */
  floorY(x: number, z: number): number {
    return decorFloorY(this.spec, x, z, this.groundY);
  }

  /** Vật cản đang do lớp này thêm (để dựng vùng đặt chỉ với vật cản tĩnh của cảnh). */
  ownBlocks(): ReadonlySet<Box | Circle> {
    return new Set(this.blocks);
  }

  /** Món đang vẽ (thứ tự như `setItems`). */
  get placed(): readonly LayerItem[] {
    return this.items;
  }

  /** Phần hình (InstancedMesh) của vật — dựng lần đầu cần, sức chứa `CAPACITY`. */
  private partsOf(id: string): Part[] {
    const had = this.parts.get(id);
    if (had) return had;
    const g = buildDecorItem(id, this.spec);
    const out: Part[] = [];
    if (g) {
      g.updateMatrixWorld(true);
      g.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const im = new THREE.InstancedMesh(o.geometry, o.material, CAPACITY);
        im.name = `decor:${id}`;
        im.count = 0;
        im.frustumCulled = false; // khung bao của InstancedMesh là của hình gốc ở (0, 0) — món trải khắp sân
        im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.root.add(im);
        out.push({ mesh: im, local: o.matrixWorld.clone() });
      });
    }
    this.parts.set(id, out);
    return out;
  }

  /** Vẽ lại cả danh sách món + thay vật cản (mở cảnh, đặt / nhấc / cất). Món quá sức chứa bị bỏ (trần món đã chặn trước). */
  setItems(items: readonly LayerItem[]): void {
    this.items = [...items];
    const count = new Map<string, number>();
    for (const parts of this.parts.values()) for (const p of parts) p.mesh.count = 0;
    for (const it of this.items) {
      const parts = this.partsOf(it.item);
      const n = count.get(it.item) ?? 0;
      if (n >= CAPACITY) continue;
      count.set(it.item, n + 1);
      this.q.setFromAxisAngle(this.up, it.rot * RAD);
      this.m.compose(new THREE.Vector3(it.x, this.floorY(it.x, it.z), it.z), this.q, new THREE.Vector3(1, 1, 1));
      for (const p of parts) {
        p.mesh.setMatrixAt(n, new THREE.Matrix4().multiplyMatrices(this.m, p.local));
        p.mesh.count = n + 1;
      }
    }
    for (const parts of this.parts.values()) for (const p of parts) p.mesh.instanceMatrix.needsUpdate = true;
    for (const b of this.blocks) this.colliders.remove(b);
    this.blocks = [];
    for (const it of this.items) {
      for (const b of decorBlocks({ x: it.x, z: it.z, rotY: it.rot }, it.item, it.blocks)) {
        this.blocks.push(b.kind === 'box' ? this.colliders.add(b.x, b.z, b.w, b.d) : this.colliders.addCircle(b.x, b.z, b.r));
      }
    }
  }

  /** Món dưới điểm (x, z) của mặt sân (chân món chứa điểm, nới 0,15 m); món sau cùng ưu tiên. Không có → −1. */
  pick(x: number, z: number): number {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      const s = DECOR_SHAPES[it.item];
      if (s && pointInRect(footRect(it), x, z, 0.15)) return i;
    }
    return -1;
  }

  /** Bóng ma món đang cầm (`null` = không cầm) + khung chân, lưới, gạch vùng cấm. */
  setGhost(g: GhostState | null): void {
    if (!g) {
      this.ghost.visible = false;
      this.marks.show(null);
      return;
    }
    if (g.item !== this.ghostItem) this.buildGhost(g.item);
    this.ghost.visible = true;
    this.ghost.position.set(g.x, this.floorY(g.x, g.z) + 0.02, g.z);
    this.ghost.rotation.y = g.rot * RAD;
    const tint = new THREE.Color(g.ok ? this.colors.jade : this.colors.lacquer);
    for (const m of this.ghostMats) {
      // phủ cùng màu: nhân màu đỉnh về phía jade / lacquer + phát sáng nhẹ (thấy rõ cả dưới nắng)
      m.color.set('#ffffff').lerp(tint, 0.45);
      m.emissive.copy(tint);
      m.emissiveIntensity = 0.35;
    }
    this.marks.show({ rect: footRect(g), ok: g.ok, front: g.rot });
  }

  /** Vùng cấm gạch chéo khi đang cầm (chữ nhật / tròn) — đặt một lần khi vào cảnh. */
  setKeepOut(rects: readonly Rect[], circles: readonly Circle[]): void {
    this.marks.setKeepOut(rects, circles);
  }

  /** Điểm trên đỉnh món ở (x, z) (neo nút / viên lý do): tâm + chiều cao vật. */
  topOf(item: string, x: number, z: number): THREE.Vector3 {
    return new THREE.Vector3(x, this.floorY(x, z) + (DECOR_SHAPES[item]?.h ?? 0), z);
  }

  /** Số draw call của đồ trang trí (đo ngân sách — InstancedMesh có món + bóng ma + dấu). */
  drawCalls(): number {
    let n = 0;
    for (const parts of this.parts.values()) for (const p of parts) if (p.mesh.count > 0) n++;
    if (this.ghost.visible) this.ghost.traverse((o) => void (o instanceof THREE.Mesh && n++));
    return n + this.marks.drawCalls();
  }

  private buildGhost(item: string): void {
    for (const c of [...this.ghost.children]) {
      c.removeFromParent();
      disposeDecorItem(c);
    }
    for (const m of this.ghostMats) m.dispose();
    this.ghostMats = [];
    this.ghostItem = item;
    const g = buildDecorItem(item, this.spec);
    if (!g) return;
    g.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const src = o.material as THREE.MeshLambertMaterial;
      const m = src.clone();
      m.transparent = true;
      m.opacity = 0.85;
      m.depthWrite = true;
      this.ghostMats.push(m);
      o.material = m;
      o.renderOrder = 3;
    });
    this.ghost.add(g);
  }
}

/** Chân món theo hướng (như `footprint` ở zones/decorPlace.ts). */
function footRect(it: { item: string; x: number; z: number; rot: number }): Rect {
  const s = DECOR_SHAPES[it.item] ?? { w: 1, d: 1 };
  return { x: it.x, z: it.z, w: s.w, d: s.round ? s.w : s.d, rot: s.round ? 0 : it.rot };
}

/* ---------- dấu trong cảnh: khung chân, mũi tên, lưới, vùng cấm ---------- */

const LIFT = 0.05;
const EDGE = 0.06;
const GRID_HALF = 2; // lưới 4 × 4 m quanh món
const GRID_STEP = 0.5;

function overlay(color: string, opacity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
}

/** Khung chân + mũi tên + lưới + vùng cấm (dựng lại hình nhỏ mỗi lần dời — vài chục đỉnh). */
class GhostMarks {
  private readonly fill: THREE.Mesh;
  private readonly edge: THREE.Mesh;
  private readonly arrow: THREE.Mesh;
  private readonly grid: THREE.LineSegments;
  private readonly keep: THREE.Mesh;
  private readonly fillMat: THREE.MeshBasicMaterial;
  private readonly edgeMat: THREE.MeshBasicMaterial;
  private readonly arrowMat: THREE.MeshBasicMaterial;

  constructor(
    parent: THREE.Object3D,
    private readonly y: (x: number, z: number) => number,
    private readonly colors: GhostColors,
  ) {
    this.fillMat = overlay(colors.jade, 0.22);
    this.edgeMat = overlay(colors.jade, 1);
    this.arrowMat = overlay('#ffffff', 0.95);
    this.fill = new THREE.Mesh(new THREE.BufferGeometry(), this.fillMat);
    this.edge = new THREE.Mesh(new THREE.BufferGeometry(), this.edgeMat);
    this.arrow = new THREE.Mesh(new THREE.BufferGeometry(), this.arrowMat);
    this.grid = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false }));
    this.keep = new THREE.Mesh(new THREE.BufferGeometry(), overlay(colors.lacquer, 0.12));
    for (const [i, o] of [this.keep, this.grid, this.fill, this.edge, this.arrow].entries()) {
      o.visible = false;
      o.renderOrder = 2 + i;
      o.frustumCulled = false;
      parent.add(o);
    }
  }

  drawCalls(): number {
    return [this.keep, this.grid, this.fill, this.edge, this.arrow].filter((o) => o.visible).length;
  }

  /** Vùng cấm: chữ nhật chia ô 1 m bám mặt đất, tròn 16 cạnh. */
  setKeepOut(rects: readonly Rect[], circles: readonly Circle[]): void {
    const pos: number[] = [];
    const tri = (a: [number, number], b: [number, number], c: [number, number]): void => {
      for (const [x, z] of [a, b, c]) pos.push(x, this.y(x, z) + LIFT, z);
    };
    for (const r of rects) {
      const nx = Math.max(1, Math.ceil(r.w));
      const nz = Math.max(1, Math.ceil(r.d));
      const c = Math.cos(r.rot * RAD);
      const s = Math.sin(r.rot * RAD);
      const at = (u: number, v: number): [number, number] => {
        const a = -r.w / 2 + (u / nx) * r.w;
        const b = -r.d / 2 + (v / nz) * r.d;
        return [r.x + c * a + s * b, r.z - s * a + c * b];
      };
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < nz; j++) {
          tri(at(i, j), at(i, j + 1), at(i + 1, j));
          tri(at(i + 1, j), at(i, j + 1), at(i + 1, j + 1));
        }
      }
    }
    for (const ci of circles) {
      for (let k = 0; k < 16; k++) {
        const a0 = (k / 16) * Math.PI * 2;
        const a1 = ((k + 1) / 16) * Math.PI * 2;
        tri([ci.x, ci.z], [ci.x + Math.cos(a1) * ci.r, ci.z + Math.sin(a1) * ci.r], [ci.x + Math.cos(a0) * ci.r, ci.z + Math.sin(a0) * ci.r]);
      }
    }
    this.keep.geometry.dispose();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    this.keep.geometry = g;
  }

  show(v: { rect: Rect; ok: boolean; front: number } | null): void {
    const on = !!v;
    for (const o of [this.keep, this.grid, this.fill, this.edge, this.arrow]) o.visible = on;
    if (!v) return;
    const col = v.ok ? this.colors.jade : this.colors.lacquer;
    this.fillMat.color.set(col);
    this.edgeMat.color.set(col);
    const c = rectCorners(v.rect).map(([x, z]) => [x, this.y(x, z) + LIFT, z] as const);
    this.setGeo(this.fill, [...c[0], ...c[1], ...c[2], ...c[0], ...c[2], ...c[3]]);
    // viền dày ~6 cm (dải tam giác trong mép chân — đường 1 px không thấy trên điện thoại)
    const inner = rectCorners({ ...v.rect, w: Math.max(0.05, v.rect.w - EDGE * 2), d: Math.max(0.05, v.rect.d - EDGE * 2) }).map(([x, z]) => [x, this.y(x, z) + LIFT, z] as const);
    const edge: number[] = [];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      edge.push(...c[i], ...c[j], ...inner[i], ...inner[i], ...c[j], ...inner[j]);
    }
    this.setGeo(this.edge, edge);
    // mũi tên mặt trước: tam giác trắng ở giữa cạnh +z riêng (c[2]–c[3])
    const mx = (c[2][0] + c[3][0]) / 2;
    const mz = (c[2][2] + c[3][2]) / 2;
    const fx = Math.sin(v.front * RAD);
    const fz = Math.cos(v.front * RAD);
    const y = this.y(mx, mz) + LIFT + 0.01;
    this.setGeo(this.arrow, [mx + fx * 0.28, y, mz + fz * 0.28, mx - fz * 0.2, y, mz + fx * 0.2, mx + fz * 0.2, y, mz - fx * 0.2]);
    // lưới 0,5 m, 4 × 4 m quanh món, bám mặt đất từng đoạn
    const gx = Math.round(v.rect.x / GRID_STEP) * GRID_STEP;
    const gz = Math.round(v.rect.z / GRID_STEP) * GRID_STEP;
    const lines: number[] = [];
    const n = (GRID_HALF * 2) / GRID_STEP;
    for (let i = 0; i <= n; i++) {
      const t = -GRID_HALF + i * GRID_STEP;
      for (let k = 0; k < n; k++) {
        const a = -GRID_HALF + k * GRID_STEP;
        const b = a + GRID_STEP;
        lines.push(gx + a, this.y(gx + a, gz + t) + LIFT, gz + t, gx + b, this.y(gx + b, gz + t) + LIFT, gz + t);
        lines.push(gx + t, this.y(gx + t, gz + a) + LIFT, gz + a, gx + t, this.y(gx + t, gz + b) + LIFT, gz + b);
      }
    }
    this.setGeo(this.grid, lines);
  }

  private setGeo(o: THREE.Mesh | THREE.LineSegments, pos: number[]): void {
    // mặt hướng lên hay xuống tuỳ thứ tự góc — vẽ cả hai mặt
    if (o instanceof THREE.Mesh) (o.material as THREE.Material).side = THREE.DoubleSide;
    o.geometry.dispose();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    o.geometry = g;
  }
}
