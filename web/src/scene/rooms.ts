/**
 * Nhà vào được (giảng đường, thư viện): nhà rỗng có cửa giữa + nội thất, đi thẳng vào không chuyển cảnh.
 * Va chạm theo tường / lan can / đồ đạc (R-VA-3); sàn + dốc bậc thành "tấm" mặt đất; mái + tường trước mờ khi người
 * chơi đứng trong (R-HUD-2); hộp bắt chạm trên vật học (R-VUNG-2). Nhà quay bội 90° nên mọi hộp vẫn thẳng trục.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import type { Style } from './kien_truc/chi_tiet';
import { columnXs, giangDuong, HALL_FLOOR, type RoomParts } from './kien_truc/dien';
import { addInterior, type LocalBox } from './kien_truc/noi_that';
import { markDynamic, mergeStatic } from './merge';
import { rotateXZ, type BuildingSpec, type InteriorKind } from './spec';
import { signTex } from './textures';

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
  /** gọi mỗi khung: mờ dần mái + tường trước khi `inside` */
  update(dt: number, inside: boolean): void;
}

/** Mờ còn bao nhiêu khi ở trong, trong bao lâu (R-HUD-2). */
const FADED = 0.15;
const FADE_SECONDS = 0.3;
/** Bậc lên nền: 3 bậc sâu 0,45 m (kien_truc/chi_tiet `addSteps`), rộng 4 m; lan can chừa khe 4,4 m. */
const STEP_RUN = 1.35;
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
    const n = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 0.75),
      new THREE.MeshBasicMaterial({ map: signTex(b.notice[0], b.notice[1], { paper: true }) }),
    );
    n.position.set(-b.w / 2 + 1.4, 1.9, b.d / 2 - 0.1);
    n.rotation.y = 0.15;
    parts.front.add(n);
  }
  const furnished = addInterior(g, b, style, use.kind, HALL_FLOOR, use.han);
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
    // tường sau, hai tường bên, tường trước hai bên cửa
    { x: 0, z: -id / 2 + 0.125, w: iw, d: 0.3 },
    { x: -iw / 2 + 0.125, z: 0, w: 0.3, d: id },
    { x: iw / 2 - 0.125, z: 0, w: 0.3, d: id },
    ...[-1, 1].map((s) => ({ x: (s * (iw / 2 + door / 2)) / 2, z: id / 2, w: iw / 2 - door / 2, d: 0.3 })),
    ...furnished.boxes,
  ];
  for (const l of local) {
    const r = worldRect(b, l);
    colliders.add((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2, r.maxX - r.minX, r.maxZ - r.minZ);
  }
  // cột hiên trước (đứng trên hiên, ngoài tường trước)
  for (const x of columnXs(b.w, 2.5)) {
    const [cx, cz] = toWorld(b, x, b.d / 2 - 0.3);
    colliders.addCircle(cx, cz, 0.25);
  }

  /* ---------- mặt đất: nền đá + dốc bậc ---------- */
  const platform = worldRect(b, { x: 0, z: 0, w: pw, d: pd });
  const stepsRect = worldRect(b, { x: 0, z: pd / 2 + STEP_RUN / 2, w: STEP_WIDTH, d: STEP_RUN });
  const [x0, z0] = toWorld(b, 0, pd / 2);
  const [x1, z1] = toWorld(b, 0, pd / 2 + STEP_RUN);
  const axis = Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 'x' : 'z';
  const pads: Pad[] = [
    { ...platform, y: y0 + HALL_FLOOR },
    { ...stepsRect, y: y0 + HALL_FLOOR, ramp: { axis, at0: axis === 'x' ? x0 : z0, at1: axis === 'x' ? x1 : z1, y1: y0 } },
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

/** Điểm (x, z) có nằm trong hình chữ nhật không. */
export function inRect(r: Rect, x: number, z: number): boolean {
  return x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;
}

