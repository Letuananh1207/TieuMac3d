/**
 * Gian trong (`gian-trong`) — cảnh riêng "Trong nhà" của Nhà của ta (R-NHA-1, V-68): một gian phòng rộng trống kiểu
 * nhà riêng 摩尔庄园 — sàn ván gỗ, tường vôi, chân tường + cột + xà gỗ, cửa sổ giấy, trần gỗ có xà ngang, hai đèn lồng
 * treo (sáng về đêm), cửa ra giữa tường trước (+z). Trống: đồ do người chơi đặt vào ô `trong` (R-NHA-2).
 * Trần chỉ một mặt nhìn xuống (không gộp): camera bị kéo cao quá trần thì trần không che, nhìn từ trên vào phòng.
 * Ngoài cửa: hộp chặn vô hình quây ô cửa — ra ngoài chỉ bằng cổng đi bộ ở cửa (R-HANH-4).
 */
import * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { lambert } from '../materials';
import { markDynamic } from '../merge';
import { addLanterns, hk, type Style } from './chi_tiet';
import { box, column, windowBox } from './hinh';
import type { LocalBox } from './noi_that';
import type { Shell } from './vao_trong';

/** Mặt sàn ván (m) — chân đồ trang trí ô `trong` (R-NHA-2). */
export const GIAN_TRONG_FLOOR = 0.03;
const WALL = 0.24;
/** cửa ra: rộng, cao (m) */
const DOOR_W = 2;
const DOOR_H = 2.5;
/** chân tường gỗ cao */
const SKIRT = 0.35;
/** camera không sát tường quá chừng này (m, tính từ mặt trong tường) */
const CAM_GAP = 0.3;
/** giấy dán song cửa sổ (chi tiết hình dạng, như `nha_o.ts`) */
const PAPER = '#efe4c8';

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

export function gianTrong(g: THREE.Group, b: BuildingSpec, style: Style): Shell {
  const { w, d } = b;
  const h = 4 * hk(style);
  const pillar = b.pillarColor ?? style.pillar;
  const iw = w / 2 - WALL; // nửa bề ngang lòng phòng
  const id = d / 2 - WALL;
  const seg = (w - DOOR_W) / 2; // tường trước mỗi bên cửa
  const boxes: LocalBox[] = [];

  /* ---------- sàn ván + rãnh ván ---------- */
  g.add(box(w, 0.1, d, style.floor, 0, GIAN_TRONG_FLOOR - 0.05, 0));
  for (let x = -iw + 0.9; x < iw - 0.4; x += 0.9) g.add(box(0.03, 0.01, 2 * id, style.timber, x, GIAN_TRONG_FLOOR + 0.002, 0));

  /* ---------- tường vôi: sau, hai hồi, trước hai bên cửa + lanh tô ---------- */
  g.add(box(w, h, WALL, style.wall, 0, h / 2, -d / 2 + WALL / 2));
  boxes.push({ x: 0, z: -d / 2 + WALL / 2, w, d: 0.3, h: Infinity });
  for (const s of [-1, 1]) {
    g.add(box(WALL, h, d, style.wall, s * (w / 2 - WALL / 2), h / 2, 0));
    boxes.push({ x: s * (w / 2 - WALL / 2), z: 0, w: 0.3, d, h: Infinity });
    const cx = s * (DOOR_W / 2 + seg / 2);
    g.add(box(seg, h, WALL, style.wall, cx, h / 2, d / 2 - WALL / 2));
    boxes.push({ x: cx, z: d / 2 - WALL / 2, w: seg, d: 0.3, h: Infinity });
  }
  g.add(box(DOOR_W, h - DOOR_H, WALL, style.wall, 0, DOOR_H + (h - DOOR_H) / 2, d / 2 - WALL / 2));

  /* ---------- chân tường gỗ, cột, xà đỉnh tường ---------- */
  const trimAround = (hh: number, y: number, t: number): void => {
    g.add(box(2 * iw, hh, t, style.timber, 0, y, -id + t / 2));
    for (const s of [-1, 1]) {
      g.add(box(t, hh, 2 * id, style.timber, s * (iw - t / 2), y, 0));
      g.add(box(seg - WALL, hh, t, style.timber, s * (DOOR_W / 2 + (seg - WALL) / 2), y, id - t / 2));
    }
  };
  trimAround(SKIRT, SKIRT / 2, 0.04);
  trimAround(0.24, h - 0.12, 0.1);
  const posts: [number, number][] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) posts.push([sx * (iw - 0.12), sz * (id - 0.12)]);
  posts.push([0, -id + 0.12]);
  for (const s of [-1, 1]) posts.push([s * (DOOR_W / 2 + 0.12), id - 0.12], [s * (iw - 0.12), -id / 2], [s * (iw - 0.12), id / 2]);
  for (const [x, z] of posts) g.add(column(0.13, h, pillar, x, 0, z, 8));

  /* ---------- cửa sổ giấy: hai ở tường sau, một mỗi hồi, hai ở tường trước ---------- */
  for (const x of [-iw / 2, iw / 2]) addWindow(g, style, x, -id, true, 1);
  for (const s of [-1, 1]) addWindow(g, style, 0, s * iw, false, -s);
  for (const s of [-1, 1]) addWindow(g, style, s * (DOOR_W / 2 + seg / 2), id, true, -1);

  /* ---------- khung cửa ra + ngạch ---------- */
  for (const s of [-1, 1]) g.add(box(0.14, DOOR_H, WALL + 0.08, style.timber, s * (DOOR_W / 2 + 0.07), DOOR_H / 2, d / 2 - WALL / 2));
  g.add(box(DOOR_W + 0.42, 0.16, WALL + 0.08, style.timber, 0, DOOR_H + 0.08, d / 2 - WALL / 2));
  g.add(box(DOOR_W, 0.04, WALL, style.timber, 0, GIAN_TRONG_FLOOR + 0.02, d / 2 - WALL / 2));

  /* ---------- trần gỗ (một mặt, nhìn xuống) + xà ngang + đèn lồng treo ---------- */
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(2 * iw, 2 * id), lambert(b.roofColor));
  ceiling.rotation.x = Math.PI / 2; // pháp tuyến −y: chỉ thấy từ dưới
  ceiling.position.y = h;
  markDynamic(ceiling); // gộp khối cảnh dùng vật liệu hai mặt — trần phải giữ một mặt
  g.add(ceiling);
  for (const z of [-id / 2, 0, id / 2]) g.add(box(2 * iw, 0.22, 0.2, style.timber, 0, h - 0.11, z));
  const lamps: [number, number, number][] = [-w / 4, w / 4].map((x) => [x, h - 0.85, 0]);
  for (const [x] of lamps) g.add(box(0.02, 0.5, 0.02, style.timber, x, h - 0.47, 0));
  addLanterns(g, lamps, style);

  /* ---------- chặn ngoài cửa: túi nhỏ quây ô cửa (vô hình) ---------- */
  const pocket = 1.6;
  boxes.push({ x: 0, z: d / 2 + pocket, w: DOOR_W + 1.2, d: 0.3 });
  for (const s of [-1, 1]) boxes.push({ x: s * (DOOR_W / 2 + 0.45), z: d / 2 + pocket / 2, w: 0.3, d: pocket });

  return {
    boxes,
    circles: [],
    pads: [{ x: 0, z: 0, w, d, y: GIAN_TRONG_FLOOR }],
    // "ở trong" (ánh sáng trong nhà ban đêm, camera ≤ 6 m, giữ camera trong phòng): lòng phòng chừa `CAM_GAP` sát tường
    floor: { x: 0, z: 0, w: 2 * (iw - CAM_GAP), d: 2 * (id - CAM_GAP) },
  };
}
