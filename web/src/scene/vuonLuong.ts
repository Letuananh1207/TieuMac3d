/**
 * Vườn rau — phần đất + rào (R-VUON-1): 12 luống đất xới (một `InstancedMesh`, luống hoang tô màu đất hoang), cọc gỗ + búi
 * cỏ trên luống hoang (một `InstancedMesh`, đổi số lượng khi mở ô), rào tre thấp + thùng thu mua gộp một lưới tĩnh. Rào và
 * thùng có va chạm; luống thì không (thấp, đi qua được). Số đo / màu ở đặc tả `garden` (`scene/spec.ts`). Tổng 3 draw call;
 * đất khô / ẩm đổi màu instance (`setSoil` — 0 draw call). Sâu + cỏ: `vuonSauCo.ts`; bể hạt: `vuonHat.ts`.
 * Cây trên luống: `cayTrong.ts`.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Colliders } from '../collision/colliders';
import type { LookSpec } from './look';
import { softMaterial } from './materials';
import { markDynamic } from './merge';
import { seededRandom } from './random';
import type { GardenSpec } from './spec';
import type { GroundY } from './terrainHeight';
import { BIN_SIZE, borderBoxes, fenceBox, fenceSegments, type Box2 } from './vuonLayout';
import { CropLayer, painted } from './cayTrong';
import { HatPool } from './vuonHat';
import { PestLayer } from './vuonSauCo';

/** Một luống mẫu cạnh 1, cao 1: khối đất + 3 luống con (gờ xới) chạy theo x. */
function plotGeometry(g: GardenSpec): THREE.BufferGeometry {
  const base = new THREE.BoxGeometry(1, 0.7, 1).translate(0, 0.35, 0);
  const parts = [painted(base, g.colors.soil, 0.35)];
  for (const z of [-0.3, 0, 0.3]) parts.push(painted(new THREE.BoxGeometry(0.92, 0.3, 0.16).translate(0, 0.85, z), g.colors.furrow, 0.2));
  return mergeGeometries(parts) ?? parts[0];
}

/** Đất hoang mẫu (trên luống cạnh 1): cọc gỗ nghiêng + 3 búi cỏ dại. */
function wildGeometry(g: GardenSpec): THREE.BufferGeometry {
  const stake = painted(new THREE.BoxGeometry(0.07, 0.55, 0.07).translate(0, 0.27, 0), g.colors.stake, 0.3);
  stake.rotateZ(0.12).translate(0.3, 0, -0.28);
  const parts = [stake];
  const rand = seededRandom(17);
  for (const [x, z] of [[-0.25, 0.2], [0.1, -0.05], [-0.05, 0.32]]) {
    const tuft = painted(new THREE.ConeGeometry(0.11, 0.28 + rand() * 0.1, 5).translate(0, 0.14, 0), '#7c9a48', 0.45);
    parts.push(tuft.translate(x, 0, z));
  }
  return mergeGeometries(parts) ?? parts[0];
}

/** Bước đá cuội viền (m) — đá ~0,3 m sát nhau như ảnh concept V-82. */
const PEBBLE_STEP = 0.36;

/**
 * Viền đá cuội thấp quanh khung [b] (V-82): đá dẹt (khối 12 mặt ép) dọc bốn cạnh, cỡ + màu lệch nhẹ theo số giả ngẫu nhiên cố định,
 * cao ≤ 0,12 m — không va chạm, gộp vào lưới tĩnh của vườn (0 draw call thêm).
 */
function pebbleRing(b: Box2, color: string, groundY: GroundY): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  const rand = seededRandom(Math.round((b.x0 * 31 + b.z0 * 17) * 10) + 101);
  const base = new THREE.Color(color);
  const edge = (ax: number, az: number, bx: number, bz: number): void => {
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / PEBBLE_STEP));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      const r = 0.14 + rand() * 0.05;
      const geo = new THREE.IcosahedronGeometry(r, 0);
      geo.scale(1, 0.55 + rand() * 0.2, 0.9 + rand() * 0.2).rotateY(rand() * Math.PI);
      const shade = base.clone().multiplyScalar(0.88 + rand() * 0.2);
      out.push(painted(geo.translate(x, groundY(x, z) + r * 0.3, z), shade, 0.25));
    }
  };
  edge(b.x0, b.z0, b.x1, b.z0);
  edge(b.x1, b.z0, b.x1, b.z1);
  edge(b.x1, b.z1, b.x0, b.z1);
  edge(b.x0, b.z1, b.x0, b.z0);
  return out;
}

/** Rào tre (trụ mỗi ~0,6 m + 2 thanh ngang; vườn không rào: không có) + nền đất (+ viền đá cuội) + thùng thu mua gỗ có nắp — một lưới. */
function fenceAndBin(g: GardenSpec, groundY: GroundY): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const H = g.fence.height;
  const bamboo = new THREE.Color(g.colors.fence);
  for (const s of fenceSegments(g)) {
    const [ax, az] = s.from;
    const [bx, bz] = s.to;
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / 0.6));
    const along = Math.abs(bx - ax) > Math.abs(bz - az);
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n;
      const z = az + ((bz - az) * i) / n;
      const post = painted(new THREE.CylinderGeometry(0.04, 0.045, H + 0.08, 5).translate(x, groundY(x, z) + (H + 0.08) / 2, z), bamboo, 0.3);
      parts.push(post);
    }
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    const y0 = groundY(mx, mz);
    for (const h of [H * 0.45, H * 0.9]) {
      const rail = new THREE.BoxGeometry(along ? len : 0.04, 0.04, along ? 0.04 : len).translate(mx, y0 + h, mz);
      parts.push(painted(rail, bamboo.clone().multiplyScalar(0.92)));
    }
  }
  // nền đất nện trong rào / trong khung viền (không gạch — khác sân lát): tấm mỏng sát mặt đất
  const grounds = g.layout === 'mo' ? borderBoxes(g) : [fenceBox(g)];
  for (const { x0, x1, z0, z1 } of grounds) {
    const cx = (x0 + x1) / 2;
    const cz = (z0 + z1) / 2;
    parts.push(painted(new THREE.BoxGeometry(x1 - x0, 0.04, z1 - z0).translate(cx, groundY(cx, cz) + 0.005, cz), g.colors.ground));
    if (g.layout === 'mo') parts.push(...pebbleRing({ x0, x1, z0, z1 }, g.colors.stone, groundY));
  }
  // thùng thu mua: thân gỗ, đai sẫm, nắp hơi rộng
  const { w, d, h } = BIN_SIZE;
  const wood = new THREE.Color(g.colors.bin);
  const bin = [
    painted(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), wood, 0.4),
    painted(new THREE.BoxGeometry(w + 0.04, 0.06, d + 0.04).translate(0, h * 0.35, 0), wood.clone().multiplyScalar(0.7)),
    painted(new THREE.BoxGeometry(w + 0.1, 0.07, d + 0.1).translate(0, h + 0.035, 0), wood.clone().multiplyScalar(1.15)),
  ].map((p) => p.rotateY((g.bin.rotY * Math.PI) / 180).translate(g.bin.x, groundY(g.bin.x, g.bin.z), g.bin.z));
  parts.push(...bin);
  return mergeGeometries(parts) ?? parts[0];
}

/** Màu đất một luống đã mở (R-VUON-5). */
export type SoilLook = 'kho' | 'am' | 'thuong';

/** Màu instance nhân với màu đỉnh đất luống → ra màu [hex] (tỉ lệ từng kênh). */
export function soilTint(soil: string, hex: string): THREE.Color {
  const sc = new THREE.Color(soil);
  const c = new THREE.Color(hex);
  return new THREE.Color(c.r / (sc.r || 1), c.g / (sc.g || 1), c.b / (sc.b || 1));
}

export interface GardenBeds {
  /** đổi số luống đã mở (luống quá số này = đất hoang) */
  setOpen(open: number): void;
  /** đất luống thứ i (đếm từ 0): khô (nhạt — chờ tưới) · ẩm (sẫm — vừa tưới) · thường (R-VUON-5); luống hoang giữ màu hoang. Đổi màu instance — 0 draw call */
  setSoil(i: number, soil: SoilLook): void;
  /** mặt luống (y) của luống thứ i (đếm từ 0) — cây đặt lên đây */
  topY(i: number): number;
  readonly meshes: THREE.Object3D[];
}

/** Dựng đất + rào + thùng; va chạm rào + thùng đăng ký ngay. */
export function addGardenBeds(scene: THREE.Scene, colliders: Colliders, g: GardenSpec, look: LookSpec, groundY: GroundY = () => 0): GardenBeds {
  const mat = softMaterial(look.wrap);
  const n = g.plots.length;
  const beds = new THREE.InstancedMesh(plotGeometry(g), mat, n);
  const wild = new THREE.InstancedMesh(wildGeometry(g), softMaterial(look.wrap, THREE.FrontSide, { amp: look.wind * 0.6, tip: 0.3 }), n);
  const tops: number[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const rand = seededRandom(n * 53 + 11);
  const soil = new THREE.Color(1, 1, 1);
  // màu instance nhân với màu đỉnh: tỉ lệ đất hoang / đất luống → luống hoang ra màu `wild`
  const wildTint = soilTint(g.colors.soil, g.colors.wild);
  const tints: Record<SoilLook, THREE.Color> = { thuong: soil, kho: soilTint(g.colors.soil, g.fx.dry), am: soilTint(g.colors.soil, g.fx.wet) };
  const looks: SoilLook[] = g.plots.map(() => 'thuong');
  let opened = n;
  g.plots.forEach((p, i) => {
    const y = groundY(p.x, p.z);
    tops.push(y + g.height);
    m.compose(new THREE.Vector3(p.x, y - 0.04, p.z), q.identity(), new THREE.Vector3(g.size, g.height + 0.04, g.size));
    beds.setMatrixAt(i, m);
    beds.setColorAt(i, soil);
  });
  for (const o of [beds, wild]) {
    markDynamic(o);
    scene.add(o);
  }
  const fence = new THREE.Mesh(fenceAndBin(g, groundY), mat);
  markDynamic(fence);
  scene.add(fence);
  // va chạm: mỗi đoạn rào một hộp mỏng; thùng một hộp (thấp — không che camera)
  for (const s of fenceSegments(g)) {
    const [ax, az] = s.from;
    const [bx, bz] = s.to;
    colliders.add((ax + bx) / 2, (az + bz) / 2, Math.abs(bx - ax) + 0.12, Math.abs(bz - az) + 0.12);
  }
  const turned = Math.abs(g.bin.rotY) % 180 === 90;
  colliders.add(g.bin.x, g.bin.z, turned ? BIN_SIZE.d : BIN_SIZE.w, turned ? BIN_SIZE.w : BIN_SIZE.d);

  const up = new THREE.Vector3(0, 1, 0);
  const spin = g.plots.map(() => rand() * Math.PI * 2);
  const setOpen = (open: number): void => {
    opened = open;
    // luống hoang: đất nhạt + cọc + cỏ dại; luống đã mở: đất xới
    let k = 0;
    g.plots.forEach((p, i) => {
      const locked = Number(p.id.slice(2)) > open;
      beds.setColorAt(i, locked ? wildTint : tints[looks[i]]);
      if (!locked) return;
      wild.setMatrixAt(k++, m.compose(new THREE.Vector3(p.x, tops[i], p.z), q.setFromAxisAngle(up, spin[i]), new THREE.Vector3(g.size, 1, g.size)));
    });
    wild.count = k;
    wild.instanceMatrix.needsUpdate = true;
    if (beds.instanceColor) beds.instanceColor.needsUpdate = true;
  };
  setOpen(n);
  const setSoil = (i: number, s: SoilLook): void => {
    if (looks[i] === s || i < 0 || i >= n) return;
    looks[i] = s;
    if (Number(g.plots[i].id.slice(2)) > opened) return; // hoang: giữ màu hoang
    beds.setColorAt(i, tints[s]);
    if (beds.instanceColor) beds.instanceColor.needsUpdate = true;
  };
  return { setOpen, setSoil, topY: (i) => tops[i] ?? 0, meshes: [beds, wild, fence] };
}

export interface Garden3D {
  beds: GardenBeds;
  crops: CropLayer;
  /** sâu + cỏ dại trên luống (R-VUON-10/11) — 2 draw call khi có */
  pests: PestLayer;
  /** bể hạt: hạt rơi, tia nước, bụi, phân, lấp lánh (R-VUON-13) — 1 draw call khi có hạt bay */
  hats: HatPool;
  /** tâm luống theo thứ tự đặc tả (`o-1` …) */
  plots: readonly { id: string; x: number; z: number }[];
  bin: { x: number; z: number };
}

/** Vườn rau đủ phần: đất + rào + thùng + lớp cây (luống trống cả). Gọi từ `world.ts` khi `garden.enabled`. */
export function addGarden(scene: THREE.Scene, colliders: Colliders, g: GardenSpec, look: LookSpec, groundY: GroundY = () => 0, code = false): Garden3D {
  const beds = addGardenBeds(scene, colliders, g, look, groundY);
  // `code` = cây `chum` (V-60): cây dựng bằng code + nảy khi đổi dáng
  const spots = g.plots.map((p, i) => ({ x: p.x, y: beds.topY(i), z: p.z, size: g.size }));
  const crops = new CropLayer(scene, spots, look, g.cropScale, code);
  const pests = new PestLayer(scene, spots, g.fx, look);
  const hats = new HatPool(scene, g.fx);
  return { beds, crops, pests, hats, plots: g.plots, bin: { x: g.bin.x, z: g.bin.z } };
}
