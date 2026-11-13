/**
 * Hí đài 戲臺 (`hi-dai`, bản mẫu design/source/TienIch-kien-truc.dc.html): nền đá cao 1,5 m (ngang đầu người — như hí
 * đài thời Nguyên 1,4–1,6 m), tiền đài mở ba mặt, hai cột góc trước, tường hậu đài có hai cửa rèm đỏ (ra / vào) và bình
 * phong vẽ núi giữa; hậu đài sâu `BACK`; mái yết sơn quay đầu hồi ra trước, biển trên đầu hồi. Lên xuống bằng hai dốc
 * bậc sau lưng hậu đài (trái, phải); mép tiền đài chặn (R-VA-3).
 */
import * as THREE from 'three';
import type { BuildingSpec } from '../spec';
import { addBeamBand, addLanterns, addSign, hk, type Style } from './chi_tiet';
import { box, column } from './hinh';
import { gableHipRoof } from './mai';
import type { LocalBox } from './noi_that';
import type { LocalPad, Shell } from './vao_trong';

/** Nền sân khấu (m) — cỡ người, không nhân hệ số chiều cao. */
const STAGE = 1.5;
/** Hậu đài sâu (m). */
const BACK = 3;
/** Dốc bậc sau lưng: dài, rộng (m) — 1,5 / 3 → dốc ≈ 27° (≤ 35°, R-VA-2). */
const RAMP_RUN = 3;
const RAMP_W = 1.6;
const STEPS = 6;
/** Cửa rèm trên tường hậu đài: rộng, cao (m). */
const DOOR_W = 1.6;
const DOOR_H = 2.4;
const SCREEN = '#efe6d2';

export function hiDai(g: THREE.Group, b: BuildingSpec, style: Style, fade: THREE.Group): Shell {
  const { w, d } = b;
  const k = hk(style);
  const colH = 3 * k;
  const zWall = -d / 2 + BACK; // tường hậu đài (giữa tiền đài và hậu đài)
  const pillar = b.pillarColor ?? style.pillar;
  const boxes: LocalBox[] = [];
  const wallTop = STAGE + colH;

  /* ---------- nền + sàn gỗ ---------- */
  g.add(box(w, STAGE, d, style.base, 0, STAGE / 2, 0));
  g.add(box(w - 0.2, 0.05, d - BACK - 0.1, style.floor, 0, STAGE + 0.025, (zWall + d / 2) / 2));
  // mép tiền đài + hai mép bên tiền đài: chặn (không bước / nhảy lên xuống), thấp — không che camera
  boxes.push({ x: 0, z: d / 2 - 0.1, w, d: 0.2 });
  for (const s of [-1, 1]) boxes.push({ x: s * (w / 2 - 0.1), z: (zWall + d / 2) / 2, w: 0.2, d: d / 2 - zWall });

  /* ---------- tường hậu đài: 2 cửa rèm + bình phong ---------- */
  const dx = w * 0.3;
  const pieces: [number, number][] = [
    [-w / 2, -dx - DOOR_W / 2],
    [-dx + DOOR_W / 2, dx - DOOR_W / 2],
    [dx + DOOR_W / 2, w / 2],
  ];
  for (const [a, c] of pieces) {
    g.add(box(c - a, colH, 0.3, style.wall, (a + c) / 2, STAGE + colH / 2, zWall));
    boxes.push({ x: (a + c) / 2, z: zWall, w: c - a, d: 0.3, h: Infinity });
  }
  for (const s of [-1, 1]) {
    const x = s * dx;
    g.add(box(DOOR_W, colH - DOOR_H, 0.3, style.wall, x, STAGE + DOOR_H + (colH - DOOR_H) / 2, zWall)); // lanh tô
    g.add(box(DOOR_W + 0.1, 0.55, 0.08, style.lantern, x, STAGE + DOOR_H - 0.27, zWall + 0.2)); // rèm ngang
    for (const e of [-1, 1]) g.add(box(0.22, DOOR_H - 0.3, 0.06, style.lantern, x + e * (DOOR_W / 2 - 0.11), STAGE + (DOOR_H - 0.3) / 2 + 0.3, zWall + 0.2));
    g.add(box(DOOR_W + 0.2, 0.08, 0.1, style.gold, x, STAGE + DOOR_H + 0.04, zWall + 0.22));
  }
  const sw = 2 * dx - DOOR_W - 0.8;
  g.add(box(sw + 0.2, colH * 0.62, 0.1, style.timber, 0, STAGE + colH * 0.42, zWall + 0.18));
  g.add(box(sw, colH * 0.58, 0.12, SCREEN, 0, STAGE + colH * 0.42, zWall + 0.2));
  for (const [mx, mh, mw] of [
    [-sw * 0.18, 0.55, 0.42],
    [sw * 0.14, 0.75, 0.5],
  ]) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(sw * mw * 0.5, colH * mh * 0.4, 3), new THREE.MeshBasicMaterial({ color: style.ridge }));
    m.position.set(mx, STAGE + colH * 0.2 + (colH * mh * 0.4) / 2, zWall + 0.27);
    m.scale.z = 0.05;
    g.add(m);
  }

  /* ---------- hậu đài: tường bên + tường sau có 2 lối xuống dốc ---------- */
  const rx = w / 2 - 0.4 - RAMP_W / 2;
  for (const s of [-1, 1]) {
    g.add(box(0.3, colH, BACK, style.wall, s * (w / 2 - 0.15), STAGE + colH / 2, -d / 2 + BACK / 2));
    boxes.push({ x: s * (w / 2 - 0.15), z: -d / 2 + BACK / 2, w: 0.3, d: BACK, h: Infinity });
  }
  const rear: [number, number][] = [
    [-w / 2, -rx - RAMP_W / 2],
    [-rx + RAMP_W / 2, rx - RAMP_W / 2],
    [rx + RAMP_W / 2, w / 2],
  ];
  for (const [a, c] of rear) {
    g.add(box(c - a, colH, 0.3, style.wall, (a + c) / 2, STAGE + colH / 2, -d / 2 + 0.15));
    boxes.push({ x: (a + c) / 2, z: -d / 2 + 0.15, w: c - a, d: 0.3, h: Infinity });
  }
  const pads: LocalPad[] = [{ x: 0, z: 0, w, d, y: STAGE }];
  for (const s of [-1, 1]) {
    const x = s * rx;
    g.add(box(RAMP_W, colH - DOOR_H, 0.3, style.wall, x, STAGE + DOOR_H + (colH - DOOR_H) / 2, -d / 2 + 0.15));
    for (let i = 0; i < STEPS; i++) {
      const sh = (STAGE * (STEPS - i)) / (STEPS + 1);
      const depth = RAMP_RUN / STEPS;
      g.add(box(RAMP_W, sh, depth, style.base, x, sh / 2, -d / 2 - depth / 2 - i * depth));
    }
    pads.push({ x, z: -d / 2 - RAMP_RUN / 2, w: RAMP_W, d: RAMP_RUN, y: STAGE, ramp: { axis: 'z', at0: -d / 2, at1: -d / 2 - RAMP_RUN, y1: 0 } });
    // thành hai bên dốc: không bước ngang ra / vào giữa chừng
    for (const e of [-1, 1]) boxes.push({ x: x + e * (RAMP_W / 2 + 0.1), z: -d / 2 - RAMP_RUN / 2, w: 0.2, d: RAMP_RUN });
  }

  /* ---------- cột trước, xà, mái (mái mờ khi đứng trên sân khấu) ---------- */
  const circles: Shell['circles'] = [];
  for (const s of [-1, 1]) {
    const x = s * (w / 2 - 0.35);
    g.add(column(0.3, colH, pillar, x, STAGE, d / 2 - 0.35));
    g.add(column(0.25, colH, pillar, x, STAGE, zWall + 0.1));
    circles.push({ x, z: d / 2 - 0.35, r: 0.35 });
    g.add(box(1.2, 0.35, 0.2, style.timber, x - s * 0.75, wallTop - 0.45, d / 2 - 0.35)); // nhạn (雀替)
  }
  addBeamBand(fade, w - 0.4, d - 0.4, wallTop, style);
  const roof = new THREE.Group();
  roof.rotation.y = Math.PI / 2; // nóc chạy dọc z → đầu hồi quay ra trước
  fade.add(roof);
  const rh = 2.8 * k;
  gableHipRoof(roof, { y: wallTop + 0.5, w: d - 0.4, d: w - 0.4, over: 1.4, h: rh, color: b.roofColor, ridgeColor: b.trim ?? style.ridge });
  // gableHipRoof: thân hai mái từ y + 0,35h, sâu (w − 0,4) × 0,7 + 0,6 → đầu hồi ở z = (d − 0,4 + 0,6) / 2
  addSign(fade, b.title, wallTop + 0.5 + rh * 0.35 + (rh * 0.65) * 0.28, (d + 0.2) / 2 + 0.08, 0.6);
  const hw = w / 2 + 1.2;
  const hd = d / 2 + 1.2;
  addLanterns(fade, [[-hw, wallTop + 0.2, hd], [hw, wallTop + 0.2, hd]], style);

  return {
    boxes,
    circles,
    pads,
    floor: { x: 0, z: 0, w: w - 0.4, d: d - 0.4 },
  };
}
