/**
 * Nhà vào được (giảng đường, thư viện): nhà rỗng có cửa giữa + nội thất, đi thẳng vào không chuyển cảnh.
 * Va chạm theo tường / lan can / đồ đạc (R-VA-3); sàn + dốc bậc thành "tấm" mặt đất; mái + tường trước mờ khi người
 * chơi đứng trong (R-HUD-2); hộp bắt chạm trên vật học (R-VUNG-2). Nhà quay bội 90° nên mọi hộp vẫn thẳng trục.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { STEP_DEPTH, stepCount, type Style } from './kien_truc/chi_tiet';
import { columnXs, giangDuong, hallFloor, type RoomParts } from './kien_truc/dien';
import { cuaHang } from './kien_truc/cua_hang';
import { hiDai } from './kien_truc/hi_dai';
import { lauSach } from './kien_truc/lau_sach';
import { addInterior, type LocalBox } from './kien_truc/noi_that';
import { traLau } from './kien_truc/tra_lau';
import type { LocalPad, WalkInBuilder } from './kien_truc/vao_trong';
import type { Seat } from './seat';
import { markDynamic, mergeStatic, mergeVertexColors } from './merge';
import { rotateXZ, type BuildingSpec, type InteriorKind } from './spec';
import { signMesh } from './signAtlas';
import { drawSign } from './textures';

/** Nhà nào dùng nội thất nào: theo mã vùng bài học (nội dung bài ở code quyết). */
export interface InteriorUse {
  kind: InteriorKind;
  /** chữ Hán viết phấn trên bảng (lớp học) */
  han: string;
}

export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Room {
  zoneId: string;
  /** sàn trong nhà (trong tường) — "đang ở trong nhà" (R-HUD-1, R-HUD-2), giới hạn camera */
  floor: Rect;
  /** nền đá + dốc bậc: mặt đất cho nhân vật */
  pads: Pad[];
  /** hộp bắt chạm vô hình trên vật học, `userData.zoneId` */
  hits: THREE.Object3D[];
  /** điểm treo nút học nổi (toạ độ cảnh) */
  anchor: THREE.Vector3;
  /** chỗ thầy đứng + hướng nhìn (lớp học) */
  teacher?: { x: number; y: number; z: number; rotY: number };
  /** chỗ ngồi trong nhà (toạ độ cảnh) — án thư Tàng Thư Các (R-VA-4) */
  seats?: Seat[];
  /** gọi mỗi khung: mờ dần mái + tường trước khi `inside`; `y` = chân nhân vật (nhà nhiều tầng: tầng 2 không mờ sàn) */
  update(dt: number, inside: boolean, y?: number): void;
}

/** Mờ còn bao nhiêu khi ở trong, trong bao lâu (R-HUD-2). */
const FADED = 0.15;
const FADE_SECONDS = 0.3;
/** Bậc lên nền: `stepCount` bậc sâu 0,45 m (kien_truc/chi_tiet `addSteps`, hệ số 1 → 3 bậc), rộng 4 m; lan can chừa khe 4,4 m. */
const STEP_WIDTH = 4;
const RAIL_GAP = 4.4;
/** Cửa: chừa trong tường trước (khớp gian giữa để trống). */
const DOOR = { 'lop-hoc': 2.4, 'thu-vien': 2 } as const;

function toWorld(b: BuildingSpec, x: number, z: number): [number, number] {
  const [dx, dz] = rotateXZ(x, z, b.rotY ?? 0);
  return [b.x + dx, b.z + dz];
}

function worldRect(b: BuildingSpec, l: LocalBox): Rect {
  const [cx, cz] = toWorld(b, l.x, l.z);
  const [w, d] = (b.rotY ?? 0) % 180 !== 0 ? [l.d, l.w] : [l.w, l.d];
  return { minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 };
}

/** Làm mờ được: gộp các khối trong nhóm (ít draw call), mỗi vật liệu một bản riêng, không cho gộp chung với cảnh. */
function fadeable(group: THREE.Group): THREE.Material[] {
  mergeVertexColors(group); // mọi màu Lambert → 1 khối; còn lại (đèn lồng, biển) gộp theo vật liệu
  mergeStatic(group, new Set());
  const mats: THREE.Material[] = [];
  group.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || Array.isArray(o.material)) return;
    o.material = o.material.clone();
    mats.push(o.material);
  });
  markDynamic(group);
  return mats;
}

function setOpacity(mats: THREE.Material[], v: number): void {
  const solid = v >= 0.999;
  for (const m of mats) {
    if (m.transparent !== !solid) {
      m.transparent = !solid;
      m.needsUpdate = true;
    }
    m.opacity = v;
    m.depthWrite = solid; // mờ thì không che đồ đạc phía sau
  }
}

/** `y0` = độ cao nền (bục khu khi có địa hình; cảnh phẳng = 0). */
export function addRoomBuilding(scene: THREE.Scene, colliders: Colliders, b: BuildingSpec, style: Style, use: InteriorUse, y0 = 0): Room {
  const zoneId = b.zone?.id ?? b.id;
  const rot = b.rotY ?? 0;
  const g = new THREE.Group();
  g.position.set(b.x, y0, b.z);
  g.rotation.y = (rot * Math.PI) / 180;
  const parts: RoomParts = { roof: new THREE.Group(), front: new THREE.Group() };
  g.add(parts.roof, parts.front);
  giangDuong(g, b, style, parts);
  if (b.notice) {
    const notice = b.notice;
    const n = signMesh(1.5, 0.75, 512, 256, (c, w, h) => drawSign(c, w, h, notice[0], notice[1], { paper: true }));
    n.position.set(-b.w / 2 + 1.4, 1.9, b.d / 2 - 0.1);
    n.rotation.y = 0.15;
    parts.front.add(n);
  }
  const floorY = hallFloor(style);
  const furnished = addInterior(g, b, style, use.kind, floorY, use.han);
  scene.add(g);
  const mats = [...fadeable(parts.roof), ...fadeable(parts.front)];

  /* ---------- va chạm (R-VA-3) ---------- */
  const pw = b.w + 2;
  const pd = b.d + 2;
  const iw = b.w - 0.8;
  const id = b.d - 0.8;
  const door = DOOR[use.kind];
  const local: LocalBox[] = [
    // lan can quanh nền, chừa khe trước cho bậc
    { x: 0, z: -pd / 2 + 0.15, w: pw, d: 0.3 },
    { x: -pw / 2 + 0.15, z: 0, w: 0.3, d: pd },
    { x: pw / 2 - 0.15, z: 0, w: 0.3, d: pd },
    ...[-1, 1].map((s) => ({ x: (s * (pw / 2 + RAIL_GAP / 2)) / 2, z: pd / 2 - 0.15, w: pw / 2 - RAIL_GAP / 2, d: 0.3 })),
    // tường sau, hai tường bên, tường trước hai bên cửa — cao tới mái: che tầm nhìn camera (R-DIEU-4)
    { x: 0, z: -id / 2 + 0.125, w: iw, d: 0.3, h: Infinity },
    { x: -iw / 2 + 0.125, z: 0, w: 0.3, d: id, h: Infinity },
    { x: iw / 2 - 0.125, z: 0, w: 0.3, d: id, h: Infinity },
    ...[-1, 1].map((s) => ({ x: (s * (iw / 2 + door / 2)) / 2, z: id / 2, w: iw / 2 - door / 2, d: 0.3, h: Infinity })),
    ...furnished.boxes,
  ];
  for (const l of local) {
    const r = worldRect(b, l);
    colliders.add((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2, r.maxX - r.minX, r.maxZ - r.minZ, l.h ?? 0);
  }
  // cột hiên trước (đứng trên hiên, ngoài tường trước)
  for (const x of columnXs(b.w, 2.5)) {
    const [cx, cz] = toWorld(b, x, b.d / 2 - 0.3);
    colliders.addCircle(cx, cz, 0.25);
  }

  /* ---------- mặt đất: nền đá + dốc bậc ---------- */
  // dốc bậc: nền cao thì thêm bậc, dốc giữ ~24° (≤ 35°, R-VA-2)
  const run = stepCount(style) * STEP_DEPTH;
  const platform = worldRect(b, { x: 0, z: 0, w: pw, d: pd });
  const stepsRect = worldRect(b, { x: 0, z: pd / 2 + run / 2, w: STEP_WIDTH, d: run });
  const [x0, z0] = toWorld(b, 0, pd / 2);
  const [x1, z1] = toWorld(b, 0, pd / 2 + run);
  const axis = Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 'x' : 'z';
  const pads: Pad[] = [
    { ...platform, y: y0 + floorY },
    { ...stepsRect, y: y0 + floorY, ramp: { axis, at0: axis === 'x' ? x0 : z0, at1: axis === 'x' ? x1 : z1, y1: y0 } },
  ];

  /* ---------- vật học, thầy, nút ---------- */
  for (const h of furnished.hits) h.userData.zoneId = zoneId;
  const [ax, az] = toWorld(b, furnished.anchor.x, furnished.anchor.z);
  let teacher: Room['teacher'];
  if (furnished.teacher) {
    const [tx, tz] = toWorld(b, furnished.teacher.x, furnished.teacher.z);
    teacher = { x: tx, y: y0 + furnished.teacher.y, z: tz, rotY: (rot * Math.PI) / 180 }; // nhìn ra cửa (như nhà)
  }

  let opacity = 1;
  return {
    zoneId,
    floor: worldRect(b, { x: 0, z: 0, w: iw - 0.3, d: id - 0.3 }),
    pads,
    hits: furnished.hits,
    anchor: new THREE.Vector3(ax, y0 + furnished.anchor.y, az),
    teacher,
    update(dt, inside) {
      const target = inside ? FADED : 1;
      if (opacity === target) return;
      const step = ((1 - FADED) * dt) / FADE_SECONDS;
      opacity = opacity < target ? Math.min(target, opacity + step) : Math.max(target, opacity - step);
      setOpacity(mats, opacity);
    },
  };
}

/** Kiểu nhà vào được không gắn bài học (tiện ích tông môn — R-VA-3, R-HUD-2). */
export const WALK_IN: Partial<Record<NonNullable<BuildingSpec['kind']>, WalkInBuilder>> = {
  'hi-dai': hiDai,
  'tra-lau': traLau,
  'lau-sach': lauSach,
  'cua-hang': cuaHang,
};

function worldPad(b: BuildingSpec, p: LocalPad, y0: number): Pad {
  const r = { ...worldRect(b, p), ...(p.upper ? { upper: true } : {}) };
  if (!p.ramp) return { ...r, y: y0 + p.y };
  const { axis, at0, at1, y1 } = p.ramp;
  const [x0, z0] = toWorld(b, axis === 'x' ? at0 : p.x, axis === 'z' ? at0 : p.z);
  const [x1, z1] = toWorld(b, axis === 'x' ? at1 : p.x, axis === 'z' ? at1 : p.z);
  const wx = Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 'x' : 'z';
  return { ...r, y: y0 + p.y, ramp: { axis: wx, at0: wx === 'x' ? x0 : z0, at1: wx === 'x' ? x1 : z1, y1: y0 + y1 } };
}

/**
 * Nhà vào được không có bài học (trà lâu, hí đài, Tàng Thư Các, cửa hàng): dựng theo `WALK_IN`, mái / tầng trên mờ
 * khi đứng trong sàn (R-HUD-2), va chạm theo phần (R-VA-3). `zoneId` = mã nhà; không có vật học.
 */
export function addWalkIn(scene: THREE.Scene, colliders: Colliders, b: BuildingSpec, style: Style, build: WalkInBuilder, y0 = 0): Room {
  const g = new THREE.Group();
  g.position.set(b.x, y0, b.z);
  g.rotation.y = ((b.rotY ?? 0) * Math.PI) / 180;
  const fade = new THREE.Group();
  const fadeLow = new THREE.Group();
  g.add(fade, fadeLow);
  const shell = build(g, b, style, fade, fadeLow);
  scene.add(g);
  const mats = fadeable(fade);
  const lowMats = fadeLow.children.length > 0 ? fadeable(fadeLow) : [];
  for (const l of shell.boxes) {
    const r = worldRect(b, l);
    const range = {
      ...(l.minY !== undefined ? { minY: y0 + l.minY } : {}),
      ...(l.maxY !== undefined ? { maxY: y0 + l.maxY } : {}),
    };
    colliders.add((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2, r.maxX - r.minX, r.maxZ - r.minZ, l.h ?? 0, range);
  }
  for (const c of shell.circles) {
    const [cx, cz] = toWorld(b, c.x, c.z);
    colliders.addCircle(cx, cz, c.r);
  }
  let opacity = 1;
  let lowOpacity = 1;
  return {
    zoneId: b.id,
    floor: worldRect(b, shell.floor),
    pads: shell.pads.map((p) => worldPad(b, p, y0)),
    seats: (shell.seats ?? []).map((s) => {
      const [sx, sz] = toWorld(b, s.x, s.z);
      return { x: sx, y: y0 + s.y, z: sz, rotY: s.rotY + ((b.rotY ?? 0) * Math.PI) / 180 };
    }),
    hits: [],
    anchor: new THREE.Vector3(b.x, y0 + 2, b.z),
    update(dt, inside, y) {
      const step = ((1 - FADED) * dt) / FADE_SECONDS;
      const approach = (v: number, target: number): number =>
        v < target ? Math.min(target, v + step) : Math.max(target, v - step);
      const target = inside ? FADED : 1;
      if (opacity !== target) {
        opacity = approach(opacity, target);
        setOpacity(mats, opacity);
      }
      if (lowMats.length === 0) return;
      // tầng 2: sàn, tường, kệ tầng 2 hiện; ở tầng 1 mờ như mái (R-HUD-2)
      const up = shell.upperY !== undefined && y !== undefined && y >= y0 + shell.upperY;
      const lowTarget = inside && !up ? FADED : 1;
      if (lowOpacity !== lowTarget) {
        lowOpacity = approach(lowOpacity, lowTarget);
        setOpacity(lowMats, lowOpacity);
      }
    },
  };
}

/** Điểm (x, z) có nằm trong hình chữ nhật không. */
export function inRect(r: Rect, x: number, z: number): boolean {
  return x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;
}

