/**
 * Gian trong (`gian-trong`) — cảnh riêng "Trong nhà" của Nhà của ta (R-NHA-1, V-68, V-71): một gian phòng rộng trống kiểu
 * nhà riêng 摩尔庄园 — sàn ván gỗ, tường vôi, chân tường + cột + xà gỗ, cửa sổ giấy, hai đèn lồng treo trên tường sau
 * (sáng về đêm). Trống: đồ do người chơi đặt vào ô `trong` (R-NHA-2).
 * **Không trần** (V-71) — camera cao nhìn chếch xuống cả phòng như nhà búp bê. Tường trước + hai hồi **cắt thấp** khi camera
 * ở phía ngoài tường đó (`Shell.cutaway`, `rooms.ts`): còn chân tường cao `CUT` + nẹp gỗ, phần trên ẩn — thấy trọn phòng.
 * Cửa ra ở **hồi tây**, đóng (hai cánh bức bàn), trước cửa có thảm mũi tên — ra bằng nút nổi "Ra sân" khi đứng trên thảm
 * (cổng `via: "nut"`, R-HANH-4); phòng kín bốn tường, không đi bộ ra được.
 */
import * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { markDynamic, mergeStatic } from '../merge';
import { addLanterns, hk, type Style } from './chi_tiet';
import { box, column, windowBox } from './hinh';
import type { LocalBox } from './noi_that';
import type { Cutaway, Shell } from './vao_trong';

/** Mặt sàn ván (m) — chân đồ trang trí ô `trong` (R-NHA-2). */
export const GIAN_TRONG_FLOOR = 0.03;
/** Cửa ra (đóng) giữa hồi tây, tâm theo z (toạ độ nhà) — vùng nút "Ra sân" trong đặc tả phủ thảm trước cửa (R-NHA-1). */
export const GIAN_TRONG_DOOR_Z = 2.6;
/** Tường cắt thấp còn cao bấy nhiêu (m) khi camera ở phía ngoài tường (V-71). */
export const GIAN_TRONG_CUT = 0.75;
const WALL = 0.24;
/** cửa ra: rộng, cao (m) */
const DOOR_W = 2;
const DOOR_H = 2.5;
/** chân tường gỗ cao */
const SKIRT = 0.35;
/** camera không sát tường quá chừng này (m, tính từ mặt trong tường) — lúc ngồi (camera ngồi giữ trong phòng) */
const CAM_GAP = 0.3;
/** giấy dán song cửa sổ, thảm cửa (chi tiết hình dạng, như `nha_o.ts`) */
const PAPER = '#efe4c8';
const MAT = '#8e3b2e';
const MAT_IN = '#b4614a';

/** Cửa sổ giấy có khung + song trên mặt trong tường; `alongX` = tường chạy theo x (trước / sau), `inward` = hướng vào phòng (±1). */
function addWindow(g: THREE.Group, style: Style, at: number, wallPos: number, alongX: boolean, inward: number): void {
  const [ww, wh, y] = [2.2, 1.3, 1.75];
  /** khối dài `len` dọc tường, sâu `depth`, lùi vào phòng `off` từ mặt tường */
  const put = (len: number, hh: number, depth: number, color: string, u: number, yy: number, off: number, paper = false): void => {
    const pos = wallPos + inward * off;
    const [sx, sz, px, pz] = alongX ? [len, depth, u, pos] : [depth, len, pos, u];
    g.add((paper ? windowBox : box)(sx, hh, sz, color, px, yy, pz));
  };
  put(ww, wh, 0.06, PAPER, at, y, 0.01, true);
  // khung + 4 song dọc + 1 song ngang (trước giấy)
  put(ww + 0.16, 0.1, 0.08, style.timber, at, y + wh / 2 + 0.05, 0.04);
  put(ww + 0.16, 0.12, 0.08, style.timber, at, y - wh / 2 - 0.06, 0.04);
  for (const s of [-1, 1]) put(0.08, wh, 0.08, style.timber, at + s * (ww / 2 + 0.04), y, 0.04);
  for (let i = 1; i < 5; i++) put(0.04, wh, 0.05, style.timber, at - ww / 2 + (i * ww) / 5, y, 0.05);
  put(ww, 0.04, 0.05, style.timber, at, y, 0.05);
}

/** Cửa đóng trên mặt trong hồi tây (`x` = mặt trong tường): khung + lanh tô, hai cánh bức bàn có nẹp ngang, hai núm. */
function addClosedDoor(g: THREE.Group, style: Style, leaf: string, x: number, z: number): void {
  for (const s of [-1, 1]) {
    g.add(box(0.1, DOOR_H + 0.16, 0.14, style.timber, x + 0.05, (DOOR_H + 0.16) / 2, z + s * (DOOR_W / 2 + 0.07)));
    g.add(box(0.06, DOOR_H, DOOR_W / 2 - 0.02, leaf, x + 0.03, DOOR_H / 2, z + (s * DOOR_W) / 4));
    g.add(box(0.05, 0.07, 0.07, style.timber, x + 0.085, 1.15, z + s * 0.12)); // núm cửa
  }
  g.add(box(0.1, 0.16, DOOR_W + 0.42, style.timber, x + 0.05, DOOR_H + 0.08, z));
  for (const y of [0.45, 1.35, 2.15]) g.add(box(0.03, 0.08, DOOR_W - 0.1, style.timber, x + 0.075, y, z));
}

/** Thảm trước cửa (sàn, tâm `x`, `z`) có mũi tên chỉ về cửa (−x) — chỗ đứng hiện nút "Ra sân". */
function addDoorMat(g: THREE.Group, x: number, z: number): void {
  g.add(box(1.1, 0.02, 2, MAT, x, GIAN_TRONG_FLOOR + 0.01, z));
  g.add(box(0.9, 0.022, 1.8, MAT_IN, x, GIAN_TRONG_FLOOR + 0.013, z));
  for (const s of [-1, 1]) {
    const bar = box(0.5, 0.012, 0.09, PAPER, x + 0.05, GIAN_TRONG_FLOOR + 0.03, z + s * 0.16);
    bar.rotation.y = -s * 0.7; // hai nét chữ V mũi nhọn về phía cửa
    g.add(bar);
  }
}

export function gianTrong(g: THREE.Group, b: BuildingSpec, style: Style): Shell {
  const { w, d } = b;
  const h = 4 * hk(style);
  const up = h - GIAN_TRONG_CUT; // phần tường trên (cắt được)
  const yUp = GIAN_TRONG_CUT + up / 2;
  const pillar = b.pillarColor ?? style.pillar;
  const iw = w / 2 - WALL; // nửa bề ngang lòng phòng
  const id = d / 2 - WALL;
  const sideLen = d - 2 * WALL; // hồi nằm giữa tường trước và sau (góc không chồng mặt)
  const boxes: LocalBox[] = [];
  // nhóm phần trên của tường cắt được: trước, hồi đông, hồi tây
  const front = new THREE.Group();
  const east = new THREE.Group();
  const west = new THREE.Group();
  g.add(front, east, west);
  const sideGroup = (s: number): THREE.Group => (s > 0 ? east : west);

  /* ---------- sàn ván + rãnh ván ---------- */
  g.add(box(w, 0.1, d, style.floor, 0, GIAN_TRONG_FLOOR - 0.05, 0));
  for (let x = -iw + 0.9; x < iw - 0.4; x += 0.9) g.add(box(0.03, 0.01, 2 * id, style.timber, x, GIAN_TRONG_FLOOR + 0.002, 0));

  /* ---------- tường vôi: sau (cả cao), trước + hai hồi (chân thấp + phần trên cắt được); phòng kín ---------- */
  g.add(box(w, h, WALL, style.wall, 0, h / 2, -d / 2 + WALL / 2));
  boxes.push({ x: 0, z: -d / 2 + WALL / 2, w, d: 0.3, h: Infinity });
  g.add(box(w, GIAN_TRONG_CUT, WALL, style.wall, 0, GIAN_TRONG_CUT / 2, d / 2 - WALL / 2));
  front.add(box(w, up, WALL, style.wall, 0, yUp, d / 2 - WALL / 2));
  boxes.push({ x: 0, z: d / 2 - WALL / 2, w, d: 0.3, h: Infinity });
  g.add(box(w + 0.06, 0.06, WALL + 0.06, style.timber, 0, GIAN_TRONG_CUT, d / 2 - WALL / 2)); // nẹp đầu tường thấp
  for (const s of [-1, 1]) {
    const x = s * (w / 2 - WALL / 2);
    g.add(box(WALL, GIAN_TRONG_CUT, sideLen, style.wall, x, GIAN_TRONG_CUT / 2, 0));
    sideGroup(s).add(box(WALL, up, sideLen, style.wall, x, yUp, 0));
    g.add(box(WALL + 0.06, 0.06, sideLen - 0.12, style.timber, x, GIAN_TRONG_CUT, 0));
    boxes.push({ x, z: 0, w: 0.3, d, h: Infinity });
  }

  /* ---------- chân tường gỗ (cố định), xà đỉnh tường (theo tường) ---------- */
  const t = 0.04;
  g.add(box(2 * iw, SKIRT, t, style.timber, 0, SKIRT / 2, -id + t / 2));
  g.add(box(2 * iw, SKIRT, t, style.timber, 0, SKIRT / 2, id - t / 2));
  for (const s of [-1, 1]) g.add(box(t, SKIRT, 2 * id - 2 * t, style.timber, s * (iw - t / 2), SKIRT / 2, 0));
  const tb = 0.1;
  g.add(box(2 * iw, 0.24, tb, style.timber, 0, h - 0.12, -id + tb / 2));
  front.add(box(2 * iw, 0.24, tb, style.timber, 0, h - 0.12, id - tb / 2));
  for (const s of [-1, 1]) sideGroup(s).add(box(tb, 0.24, 2 * id - 2 * tb, style.timber, s * (iw - tb / 2), h - 0.12, 0));

  /* ---------- cột: tường sau cả cao; tường cắt được thì cột cũng hai khúc ---------- */
  const post = (x: number, z: number, cut: THREE.Group | null): void => {
    if (!cut) return void g.add(column(0.13, h, pillar, x, 0, z, 8));
    g.add(column(0.13, GIAN_TRONG_CUT, pillar, x, 0, z, 8));
    cut.add(column(0.12, up, pillar, x, GIAN_TRONG_CUT, z, 8));
  };
  for (const sx of [-1, 1]) {
    post(sx * (iw - 0.12), -(id - 0.12), null);
    post(sx * (iw - 0.12), id - 0.12, front);
  }
  post(0, -id + 0.12, null);
  post(iw - 0.12, -id / 2, east);
  post(iw - 0.12, id / 2, east);
  post(-(iw - 0.12), -id / 2, west); // hồi tây: chỗ cột +id/2 là cửa

  /* ---------- cửa sổ giấy: hai ở tường sau, một mỗi hồi, hai ở tường trước ---------- */
  for (const x of [-iw / 2, iw / 2]) addWindow(g, style, x, -id, true, 1);
  addWindow(east, style, 0, iw, false, -1);
  addWindow(west, style, 0, -iw, false, 1);
  for (const x of [-iw / 2, iw / 2]) addWindow(front, style, x, id, true, -1);

  /* ---------- cửa ra (đóng, không cắt — luôn thấy) + thảm mũi tên ---------- */
  addClosedDoor(g, style, b.roofColor, -iw, GIAN_TRONG_DOOR_Z);
  addDoorMat(g, -iw + 0.75, GIAN_TRONG_DOOR_Z);

  /* ---------- hai đèn lồng treo cần gỗ trên tường sau (không trần) ---------- */
  const lampX = iw - 1.2;
  const lamps: [number, number, number][] = [-lampX, lampX].map((x) => [x, h - 1.3, -id + 0.45]);
  for (const [x] of lamps) {
    g.add(box(0.06, 0.06, 0.5, style.timber, x, h - 0.75, -id + 0.25)); // cần
    g.add(box(0.02, 0.32, 0.02, style.timber, x, h - 0.93, -id + 0.45)); // dây
  }
  addLanterns(g, lamps, style);

  // phần trên mỗi tường cắt được: gộp riêng theo màu (vài draw call), giữ khỏi khối gộp chung để ẩn / hiện
  const cutaway: Cutaway[] = [
    { group: front, axis: 'z', side: 1, at: d / 2 },
    { group: east, axis: 'x', side: 1, at: w / 2 },
    { group: west, axis: 'x', side: -1, at: w / 2 },
  ];
  for (const c of cutaway) {
    mergeStatic(c.group, new Set());
    markDynamic(c.group);
  }

  return {
    boxes,
    circles: [],
    pads: [{ x: 0, z: 0, w, d, y: GIAN_TRONG_FLOOR }],
    // "ở trong" (ánh sáng trong nhà ban đêm; lúc ngồi camera giữ trong phòng): lòng phòng chừa `CAM_GAP` sát tường
    floor: { x: 0, z: 0, w: 2 * (iw - CAM_GAP), d: 2 * (id - CAM_GAP) },
    cutaway,
  };
}
