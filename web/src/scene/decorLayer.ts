/**
 * Đặt đồ trang trí vào ô của cảnh (R-NHA-2): mỗi ô một nhóm, `set` dựng lại đúng ô đó + thay vật cản; dấu ô mờ trên
 * nền chỉ hiện trong chế độ trang trí (thiết kế 2026-11-14.13: trống = trắng nét đứt · có vật = ánh vàng viền `gold` ·
 * đang chọn = `jade` + quầng). Ghép (khi nào bật chế độ, chạm ô, nút nổi DOM) ở lớp gốc — không ở đây.
 * Draw call: mỗi vật 1 (đèn lồng, tranh chữ 2); dấu ô 3 InstancedMesh + 1 nhóm ô đang chọn (3) — chỉ khi trang trí.
 */
import * as THREE from 'three';
import type { Box, Circle, Colliders } from '../collision/colliders';
import { DECOR_SHAPES, buildDecorItem, decorBlock, disposeDecorItem } from './decorItems';
import { insideBuilding } from './decorSlots';
import { hallFloor } from './kien_truc/dien';
import { NHA_O_FLOOR } from './kien_truc/nha_o';
import { markDynamic } from './merge';
import type { DecorSlotSpec, SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';

/**
 * Độ cao chân vật ở ô: ô trong nhà = mặt sàn nhà chứa ô (`nha-o`: sàn nền thấp; kiểu khác: sàn điện); ngoài nhà = mặt
 * đất (`groundY`, không địa hình = 0).
 */
export function slotFloorY(spec: Pick<SceneSpec, 'buildings' | 'buildingStyle'>, slot: DecorSlotSpec, groundY?: GroundY): number {
  const home = spec.buildings.find((b) => insideBuilding(b, slot.x, slot.z));
  if (home) return home.kind === 'nha-o' ? NHA_O_FLOOR : hallFloor(spec.buildingStyle);
  return groundY ? groundY(slot.x, slot.z) : 0;
}

/** Trạng thái dấu một ô. */
export type SlotMark = 'trong' | 'co-vat' | 'chon';

/** Dấu ô: đang chọn > có vật > trống. */
export function slotMark(slotId: string, placed: Readonly<Record<string, string>>, selected: string | null): SlotMark {
  if (slotId === selected) return 'chon';
  return placed[slotId] ? 'co-vat' : 'trong';
}

/** Vật đang có trong ô, theo dạng danh mục (`DecorItem` của zones thoả kiểu này). */
export interface PlacedItem {
  id: string;
  blocks: boolean;
}

interface SlotState {
  slot: DecorSlotSpec;
  y: number;
  group: THREE.Group;
  item: string | null;
  block: Box | Circle | null;
}

export class DecorLayer {
  /** gốc mọi vật trang trí (`markDynamic` — `mergeStatic` không gộp, dựng lại được từng ô) */
  readonly root = new THREE.Group();
  private readonly slots = new Map<string, SlotState>();

  constructor(
    scene: THREE.Scene,
    private readonly colliders: Colliders,
    private readonly spec: SceneSpec,
    groundY?: GroundY,
  ) {
    this.root.name = 'decor';
    markDynamic(this.root);
    scene.add(this.root);
    for (const slot of spec.decorSlots) {
      const group = new THREE.Group();
      group.position.set(slot.x, slotFloorY(spec, slot, groundY), slot.z);
      group.rotation.y = THREE.MathUtils.degToRad(slot.rotY ?? 0);
      this.root.add(group);
      this.slots.set(slot.id, { slot, y: group.position.y, group, item: null, block: null });
    }
  }

  /** Đặt / thay vật ở ô (`null` = gỡ): dựng lại hình ô đó, thay vật cản (vật to). Ô lạ / vật như cũ → bỏ qua. */
  set(slotId: string, item: PlacedItem | null): void {
    const s = this.slots.get(slotId);
    if (!s || (item?.id ?? null) === s.item) return;
    for (const old of [...s.group.children]) {
      old.removeFromParent();
      disposeDecorItem(old);
    }
    if (s.block) this.colliders.remove(s.block);
    s.block = null;
    s.item = null;
    if (!item) return;
    const mesh = buildDecorItem(item.id, this.spec);
    if (!mesh) return;
    s.group.add(mesh);
    s.item = item.id;
    const b = decorBlock(s.slot, item.id, item.blocks);
    if (b?.kind === 'box') s.block = this.colliders.add(b.x, b.z, b.w, b.d);
    else if (b?.kind === 'circle') s.block = this.colliders.addCircle(b.x, b.z, b.r);
  }

  /** Đặt cả nhà một lần (mở cảnh / nạp nhà đã lưu): ô không có trong `placed` thành trống. */
  setAll(placed: Readonly<Record<string, string>>, lookup: (itemId: string) => PlacedItem | undefined): void {
    for (const id of this.slots.keys()) this.set(id, placed[id] ? lookup(placed[id]) ?? null : null);
  }

  /** Điểm neo nút nổi trên ô (toạ độ cảnh): ô trống = trên nền; có vật = trên đỉnh vật. Ô lạ → `null`. */
  anchor(slotId: string): THREE.Vector3 | null {
    const s = this.slots.get(slotId);
    if (!s) return null;
    const top = s.item ? DECOR_SHAPES[s.item]?.h ?? 0 : 0;
    return new THREE.Vector3(s.slot.x, s.y + top + 0.15, s.slot.z);
  }
}

/* ---------- dấu ô ---------- */

/** Màu dấu ô = token thiết kế (`design/tokens/design_tokens.json`): `white`, `aura-light`, `gold`, `jade`. */
export interface MarkerColors {
  white: string;
  aura: string;
  gold: string;
  jade: string;
}

/** Bán kính dấu ô trên nền (m) — vừa chân vật lớn nhất (bàn trà 1,76 m) nhìn từ camera chơi. */
export const MARKER_R = 0.85;
const RING = 0.07;
const DASHES = 14;

/** Vòng nét đứt: `DASHES` cung, mỗi cung nửa khoảng — nằm ngang (xz). */
function dashedRing(r0: number, r1: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const step = (Math.PI * 2) / DASHES;
  for (let i = 0; i < DASHES; i++) parts.push(new THREE.RingGeometry(r0, r1, 4, 1, i * step, step * 0.55));
  const pos: number[] = [];
  for (const p of parts) {
    const g = p.toNonIndexed();
    pos.push(...(g.getAttribute('position').array as Float32Array));
    g.dispose();
    p.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.rotateX(-Math.PI / 2);
  return g;
}

function flat(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  return geo.rotateX(-Math.PI / 2);
}

function overlay(color: string, opacity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
}

export interface DecorMarkers {
  /** bật / tắt mọi dấu (chế độ trang trí) */
  show(on: boolean): void;
  /** vẽ lại theo trạng thái từng ô (ô không có trong `marks` = trống) */
  mark(marks: Readonly<Record<string, SlotMark>>): void;
  /** mỗi khung: quầng ô đang chọn thở nhẹ */
  update(dt: number): void;
}

/** Dấu ô mờ trên nền, một lớp cho mọi ô của cảnh; ẩn sẵn. `floorY(slot)` = độ cao nền ô (`slotFloorY`). */
export function addDecorMarkers(scene: THREE.Scene, slots: readonly DecorSlotSpec[], floorY: (s: DecorSlotSpec) => number, colors: MarkerColors): DecorMarkers {
  const n = Math.max(1, slots.length);
  const fill = new THREE.InstancedMesh(flat(new THREE.CircleGeometry(MARKER_R, 28)), overlay('#ffffff', 0.35), n);
  const dashed = new THREE.InstancedMesh(dashedRing(MARKER_R - RING, MARKER_R), overlay(colors.white, 0.9), n);
  const solid = new THREE.InstancedMesh(flat(new THREE.RingGeometry(MARKER_R - RING, MARKER_R, 28)), overlay(colors.gold, 0.9), n);
  const sel = new THREE.Group();
  const selFill = new THREE.Mesh(flat(new THREE.CircleGeometry(MARKER_R, 28)), overlay(colors.jade, 0.22));
  const selRing = new THREE.Mesh(flat(new THREE.RingGeometry(MARKER_R - RING * 1.4, MARKER_R, 28)), overlay(colors.jade, 1));
  const haloMat = overlay(colors.jade, 0.45);
  const halo = new THREE.Mesh(flat(new THREE.RingGeometry(MARKER_R, MARKER_R + 0.22, 28)), haloMat);
  sel.add(selFill, selRing, halo);
  const all: THREE.Object3D[] = [fill, dashed, solid, sel];
  all.forEach((o, i) => {
    o.renderOrder = 2 + i;
    o.visible = false;
    markDynamic(o);
    scene.add(o);
  });
  const ys = slots.map((s) => floorY(s) + 0.03);
  const m = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const tint = new THREE.Color();
  let on = false;
  let hasSel = false;
  let t = 0;
  const api: DecorMarkers = {
    show(v) {
      on = v;
      for (const o of [fill, dashed, solid]) o.visible = v;
      sel.visible = v && hasSel;
    },
    mark(marks) {
      hasSel = false;
      slots.forEach((s, i) => {
        const k = marks[s.id] ?? 'trong';
        m.makeTranslation(s.x, ys[i], s.z);
        fill.setMatrixAt(i, k === 'chon' ? hidden : m);
        fill.setColorAt(i, tint.set(k === 'co-vat' ? colors.aura : colors.white));
        dashed.setMatrixAt(i, k === 'trong' ? m : hidden);
        solid.setMatrixAt(i, k === 'co-vat' ? m : hidden);
        if (k === 'chon') {
          hasSel = true;
          sel.position.set(s.x, ys[i] + 0.005, s.z);
        }
      });
      for (const im of [fill, dashed, solid]) im.instanceMatrix.needsUpdate = true;
      if (fill.instanceColor) fill.instanceColor.needsUpdate = true;
      sel.visible = on && hasSel;
    },
    update(dt) {
      if (!sel.visible) return;
      t += dt;
      haloMat.opacity = 0.35 + 0.15 * Math.sin(t * 3);
    },
  };
  api.mark({});
  return api;
}
