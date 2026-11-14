/**
 * Tường vôi mái ngói (粉牆黛瓦) + cổng — kiểu `walls.style: "voi"`. Tường dày `walls.thickness` (đoạn thêm có thể riêng).
 *
 * Hai kiểu cổng (`kind`):
 * - `trang` cổng trăng (月洞門): vòm tròn đường kính = bề rộng khe, nhưng không cao quá tường (đỉnh vòm cách đỉnh tường
 *   ≥ 0,6 m — tường thấp thì vòm thu nhỏ, tấm cổng vẫn che kín khe). Tâm vòm ở 0,6 bán kính trên mặt đất, nên lối đi ở
 *   mặt đất = dây cung = 1,6 × bán kính. Biển đá khắc (門額) giữa đỉnh vòm và đỉnh tường.
 * - `lau` cổng mái ngói (門樓): cửa chữ nhật khung gỗ, lối đi = rộng − 2 × 0,3; trụ tường dày hơn tường 0,3; mái ngói
 *   hai mái nhô 0,8 m ra mỗi mặt, cao hơn tường 0,6 m; biển gỗ dưới mái.
 * - `thanh` cổng thành (城門): cửa vòm (chữ nhật + nửa tròn trên) xuyên tường, lối đi = rộng − 2 × 0,3 như 門樓;
 *   hai cánh cửa son đinh vàng mở áp vào hai bên lòng cửa; trên tường là lầu cổng (城樓) thân son, mái hai tầng.
 * Biển: mỗi mặt cổng một biển theo `signs[<hướng mặt nhìn ra>]`. Va chạm khớp đúng phần tường hai bên lối đi.
 */
import * as THREE from 'three';
import type { Colliders } from '../../collision/colliders';
import { lambert } from '../materials';
import { signMesh } from '../signAtlas';
import { ASHLAR_TILE_M, ashlarTex, drawSign, drawStoneSign, meterUV, PLASTER_TILE_M, plasterTex } from '../textures';
import type { SceneSpec, WallSegment } from '../spec';
import { CORNER_EPS, gateFaces, ringRuns, segmentRuns, wallGates, type GatePlace, type Run } from '../walls';
import { box, prism } from './hinh';
import { roofMat } from './mai';

type Walls = SceneSpec['walls'];
type Style = SceneSpec['buildingStyle'];

/** Mỗi bên khe, tấm cổng lấn vào tường thêm bao nhiêu mét. */
const PAD = 1;
const ARC_LIFT = 0.6; // tâm vòm cao 0,6 r → dây cung mặt đất 0,8 × 2r
/** Khoảng tối thiểu từ đỉnh vòm tới đỉnh tường. */
const TOP_GAP = 0.6;
/** 門樓: khung gỗ mỗi bên, lối cao tối đa, đỉnh cổng cao hơn tường, trụ dày hơn tường. */
const LAU_FRAME = 0.3;
const LAU_CLEAR = 3.2;
const LAU_RISE = 0.6;
const LAU_EXTRA = 0.3;
/** Khung gỗ 門樓 nhô khỏi mặt vôi bấy nhiêu mét: hai mặt khác màu nằm trùng một mặt phẳng thì chớp (L-10). */
const PROUD = 0.03;

/** Bán kính vòm của khe rộng `width` trên tường cao `wallH`: nửa khe, thu lại cho đỉnh vòm vừa dưới tường. */
export const moonRadius = (width: number, wallH: number): number => Math.min(width / 2, (wallH - TOP_GAP) / (1 + ARC_LIFT));

/** Nửa bề rộng lối đi được ở mặt đất của vòm bán kính `r`. */
export const moonOpening = (r: number): number => Math.sqrt(1 - ARC_LIFT * ARC_LIFT) * r;

/** 門樓: nửa lối đi, chiều cao lối (thấp hơn tường ≥ 1 m). */
export const lauOpening = (width: number): number => width / 2 - LAU_FRAME;
export const lauClearHeight = (wallH: number): number => Math.min(LAU_CLEAR, wallH - 1);

/** Bề rộng một dòng chữ tính theo em: chữ Hán ≈ 1 em, chữ Latin (cả chữ Việt có dấu) ≈ 0,56 em, khoảng trắng 0,3 em. */
export function textEm(text: string): number {
  // so mã số (không viết dải chữ Hán dạng \u…: công cụ cắt font quét mã nguồn sẽ coi là chữ cần nạp)
  const han = (c: number): boolean => (c >= 0x3400 && c <= 0x9fff) || (c >= 0xf900 && c <= 0xfaff);
  return [...text].reduce((s, ch) => s + (han(ch.codePointAt(0)!) ? 1 : ch === ' ' ? 0.3 : 0.56), 0);
}

/** Nửa bề rộng lối đi ở mặt đất của một cổng. */
export function gateOpening(gp: Pick<GatePlace, 'kind' | 'width' | 'height'>): number {
  return gp.kind === 'trang' ? moonOpening(moonRadius(gp.width, gp.height)) : lauOpening(gp.width);
}

/** Hộp va chạm (tâm x, z; rộng theo x, sâu theo z; cao). */
export interface WallBox {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

const runBox = (axis: Run['axis'], fixed: number, along: number, len: number, t: number, h: number): WallBox =>
  axis === 'x' ? { x: along, z: fixed, w: len, d: t, h } : { x: fixed, z: along, w: t, d: len, h };

/**
 * Mọi hộp va chạm của tường vôi: các đoạn đã trừ tấm cổng, rồi phần tường hai bên lối đi của mỗi cổng. Cao = đỉnh
 * tường (cổng mái ngói: đỉnh cổng) + 0,5 — che tầm nhìn tới mái ngói trên tường (R-DIEU-4). Thuần, không three.
 */
export function plasterWallBoxes(w: Walls, extra: WallSegment[]): WallBox[] {
  const boxes = [...ringRuns(w, PAD), ...extra.flatMap((s) => segmentRuns(s, w, PAD))].map((r) =>
    runBox(r.axis, r.fixed, (r.a + r.b) / 2, r.b - r.a, r.thickness, r.height + 0.5),
  );
  for (const gp of wallGates(w, extra)) {
    const c = gateOpening(gp);
    const len = gp.width / 2 + PAD - c;
    const lau = gp.kind !== 'trang';
    const t = lau ? gp.thickness + LAU_EXTRA : gp.thickness;
    const h = (lau ? gp.height + LAU_RISE : gp.height) + 0.5;
    for (const s of [-1, 1]) boxes.push(runBox(gp.axis, gp.fixed, gp.at + s * (c + len / 2), len, t, h));
  }
  return boxes;
}

/** Vật liệu tường vôi + chân đá xếp (dùng chung mọi đoạn — một texture mỗi loại, 2026-11-13). */
interface WallMats {
  plaster: THREE.MeshLambertMaterial;
  ashlar: THREE.MeshLambertMaterial;
}

function wallMats(w: Walls, style: Style): WallMats {
  return {
    plaster: lambert(0xffffff, { map: plasterTex(w.color) }),
    ashlar: lambert(0xffffff, { map: ashlarTex(style.stone) }),
  };
}

/** Vôi cho tấm cổng trăng: UV của ExtrudeGeometry là mét theo hình → lặp ngang `PLASTER_TILE_M`, dọc đúng cao `h`. */
function panelMat(mats: WallMats, h: number): THREE.MeshLambertMaterial {
  const map = mats.plaster.map!.clone();
  map.repeat.set(1 / PLASTER_TILE_M, 1 / h);
  return lambert(0xffffff, { map });
}

/** Hộp vôi `w` × `h` × `d` (UV theo mét như thân tường), đáy ở y = `y0`. */
function plasterBox(mats: WallMats, w: number, h: number, d: number, x: number, y0: number): THREE.Mesh {
  const m = new THREE.Mesh(meterUV(new THREE.BoxGeometry(w, h, d), w, h, d, PLASTER_TILE_M, h), mats.plaster);
  m.position.set(x, y0 + h / 2, 0);
  return m;
}

/** Chân đá xếp dài `w`, dày `d`, tâm x. */
function ashlarFoot(mats: WallMats, w: number, d: number, x: number): THREE.Mesh {
  // dài hơn thân vôi 5 mm mỗi đầu: mặt đầu chân đá không trùng mặt đầu thân vôi (L-10: chớp)
  const m = new THREE.Mesh(meterUV(new THREE.BoxGeometry(w + 0.01, 0.5, d), w + 0.01, 0.5, d, ...ASHLAR_TILE_M), mats.ashlar);
  m.position.set(x, 0.25, 0);
  return m;
}

/** Đặt nhóm cổng / đoạn (dựng theo trục x cục bộ, mặt +z cục bộ) về chỗ của nó trên tường. */
function placeOnWall(grp: THREE.Object3D, axis: Run['axis'], fixed: number, along: number): void {
  if (axis === 'x') grp.position.set(along, 0, fixed);
  else {
    grp.position.set(fixed, 0, along);
    grp.rotation.y = Math.PI / 2; // +z cục bộ → +x thế giới (mặt `dong`), khớp `gateFaces`
  }
}

/** Một đoạn tường vôi: thân vôi, chân đá, mái ngói hai mái trên đỉnh, cửa sổ hoa cách nhau `windows` m. */
function plasterRun(g: THREE.Group, r: Run, w: Walls, style: Style, mats: WallMats): void {
  const len = r.b - r.a;
  const t = r.thickness;
  const run = new THREE.Group();
  placeOnWall(run, r.axis, r.fixed, (r.a + r.b) / 2);
  // thân vôi: v trải đúng chiều cao (ố chân tường ở dưới), u theo mét
  // góc: đoạn trục x dài thêm, đoạn trục z ngắn lại CORNER_EPS mỗi đầu → mặt ngoài ở góc không trùng nhau (L-10)
  const body = len + (r.axis === 'x' ? 2 : -2) * CORNER_EPS;
  run.add(plasterBox(mats, body, r.height, t, 0, 0), ashlarFoot(mats, body, t + 0.15, 0));
  const cap = new THREE.Mesh(prism(len + 0.3, t + 0.5, 0.5), roofMat(w.capColor));
  cap.position.y = r.height;
  run.add(cap);
  if (w.windows > 0 && len > w.windows) {
    const n = Math.floor(len / w.windows);
    const y = r.height * 0.58;
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (i + 0.5) * (len / n);
      run.add(box(1, 1, t + 0.14, style.timber, x, y, 0));
      run.add(box(0.86, 0.08, t + 0.16, w.color, x, y, 0));
      run.add(box(0.08, 0.86, t + 0.16, w.color, x, y, 0));
    }
  }
  g.add(run);
}

/** Biển hai mặt cổng: `make` dựng một tấm (mặt +z); mặt nào có chữ thì đặt tấm ở ±`z`, cao `y`. */
function addGateSigns(grp: THREE.Group, gp: GatePlace, y: number, z: number, make: (text: string) => THREE.Mesh): void {
  const [plus, minus] = gateFaces(gp.axis);
  for (const [side, s] of [
    [plus, 1],
    [minus, -1],
  ] as const) {
    const text = gp.signs[side];
    if (!text) continue;
    const m = make(text);
    m.position.set(0, y, s * z);
    if (s < 0) m.rotation.y = Math.PI;
    grp.add(m);
  }
}

/** Tấm tường có vòm trăng cho cổng `gp`, kèm biển đá trên vòm. */
function moonGate(g: THREE.Group, gp: GatePlace, w: Walls, style: Style, mats: WallMats): void {
  const t = gp.thickness;
  const r = moonRadius(gp.width, gp.height);
  const cy = ARC_LIFT * r;
  const c = moonOpening(r);
  const hw = gp.width / 2 + PAD;
  const h = Math.max(gp.height, cy + r + TOP_GAP);
  const start = Math.PI + Math.asin(ARC_LIFT); // điểm vòm chạm đất bên trái
  const end = -Math.asin(ARC_LIFT); // bên phải
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(-c, 0);
  shape.absarc(0, cy, r, start, end, true); // đi qua đỉnh vòm
  shape.lineTo(hw, 0);
  shape.lineTo(hw, h);
  shape.lineTo(-hw, h);
  shape.closePath();
  const depth = t + 0.1;
  const panel = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, -depth / 2),
    panelMat(mats, h),
  );
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.14, 5, 24, Math.PI + 2 * Math.asin(ARC_LIFT)), lambert(style.stone));
  rim.rotation.z = end;
  rim.position.y = cy;
  const cap = new THREE.Mesh(prism(2 * hw + 0.4, t + 0.6, 0.6), roofMat(w.capColor));
  cap.position.y = h;
  const grp = new THREE.Group();
  grp.add(panel, rim, cap);
  // chân đá chỉ ở hai bên vòm
  for (const s of [-1, 1]) grp.add(ashlarFoot(mats, hw - c, t + 0.2, (s * (hw + c)) / 2));
  // biển đá khắc giữa đỉnh vòm (+ viền đá) và đỉnh tường
  const room = h - (cy + r + 0.14);
  const sh = Math.min(0.5, room - 0.08);
  if (sh > 0.2) {
    addGateSigns(grp, gp, cy + r + 0.14 + room / 2, depth / 2 + 0.02, (text) => {
      // chữ cao 0,62 × biển (`drawStoneSign`) + lề hai bên
      const sw = Math.min(2 * c, 0.45 + textEm(text) * 0.7 * sh);
      return signMesh(sw, sh, Math.round(sw * 160), Math.round(sh * 160), (cx, pw, ph) => drawStoneSign(cx, pw, ph, text, style.stone));
    });
  }
  placeOnWall(grp, gp.axis, gp.fixed, gp.at);
  g.add(grp);
}

/** Cổng mái ngói (門樓) cho cổng `gp`: hai trụ vôi + mảng tường trên lối, khung gỗ, mái ngói nhô hai mặt, biển gỗ. */
function lauGate(g: THREE.Group, gp: GatePlace, w: Walls, style: Style, mats: WallMats): void {
  const o = lauOpening(gp.width);
  const hw = gp.width / 2 + PAD;
  const clear = lauClearHeight(gp.height);
  const top = gp.height + LAU_RISE;
  const t = gp.thickness + LAU_EXTRA;
  const grp = new THREE.Group();
  const pier = hw - o;
  for (const s of [-1, 1]) {
    const x = s * (o + pier / 2);
    grp.add(plasterBox(mats, pier, top, t, x, 0), ashlarFoot(mats, pier, t + 0.15, x));
    // khung cửa gỗ: trụ đứng áp mặt trong trụ vôi, nhô ra lối `PROUD` — mặt gỗ không trùng mặt vôi (L-10: chớp)
    grp.add(box(0.24, clear, t + 0.06, style.timber, s * (o + 0.12 - PROUD), clear / 2, 0));
  }
  grp.add(plasterBox(mats, 2 * o, top - clear, t, 0, clear));
  grp.add(box(2 * o + 0.48, 0.26, t + 0.06, style.timber, 0, clear + 0.13 - PROUD, 0)); // xà ngang trên lối, thò xuống
  grp.add(box(2 * hw + 0.2, 0.22, t + 0.3, style.timber, 0, top - 0.11 - PROUD, 0)); // dải xà dưới mái, đỉnh dưới đỉnh trụ
  const roof = new THREE.Mesh(prism(2 * hw + 0.8, t + 1.6, 0.9), roofMat(w.capColor));
  roof.position.y = top;
  grp.add(roof);
  // biển gỗ giữa xà lối và dải xà dưới mái
  const lo = clear + 0.26;
  const hi = top - 0.22;
  const sh = Math.min(0.8, hi - lo - 0.1);
  if (sh > 0.3) {
    addGateSigns(grp, gp, (lo + hi) / 2, t / 2 + 0.04, (text) => {
      // `drawSign` vẽ chữ 72 px trên ô 180 px / m → 0,4 m mỗi em, lề 0,36 m + viền
      const sw = Math.min(2 * o, 0.6 + textEm(text) * 0.4);
      return signMesh(sw, sh, Math.round(sw * 180), Math.round(sh * 180), (cx, pw, ph) => drawSign(cx, pw, ph, text));
    });
  }
  placeOnWall(grp, gp.axis, gp.fixed, gp.at);
  g.add(grp);
}

/** Cổng thành (城門): tấm tường có cửa vòm, hai cánh cửa son mở, lầu cổng hai tầng mái trên đỉnh. */
function thanhGate(g: THREE.Group, gp: GatePlace, w: Walls, style: Style, mats: WallMats): void {
  const o = lauOpening(gp.width);
  const hw = gp.width / 2 + PAD;
  const t = gp.thickness + LAU_EXTRA;
  const h = gp.height + LAU_RISE;
  const spring = Math.max(1.8, Math.min(LAU_CLEAR, h - 1.2) - o); // chân vòm: lòng cửa cao = spring + o
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(-o, 0);
  shape.lineTo(-o, spring);
  shape.absarc(0, spring, o, Math.PI, 0, true);
  shape.lineTo(o, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, h);
  shape.lineTo(-hw, h);
  shape.closePath();
  const grp = new THREE.Group();
  grp.add(
    new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 12 }).translate(0, 0, -t / 2),
      panelMat(mats, h),
    ),
  );
  for (const s of [-1, 1]) grp.add(ashlarFoot(mats, hw - o, t + 0.2, (s * (hw + o)) / 2));
  // hai cánh cửa son mở áp lòng cửa, mỗi cánh 3 × 3 đinh vàng
  const leafH = spring + o * 0.7;
  const stud = new THREE.SphereGeometry(0.06, 5, 4);
  const studMat = lambert(style.gold);
  for (const s of [-1, 1]) {
    const leaf = box(0.12, leafH, t * 0.45, w.color, s * (o - 0.08), leafH / 2, t * 0.2);
    grp.add(leaf);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const m = new THREE.Mesh(stud, studMat);
        m.position.set(s * (o - 0.16), leafH * (0.3 + 0.2 * i), t * 0.2 + (j - 1) * t * 0.12);
        grp.add(m);
      }
  }
  // lầu cổng: thân son lùi vào, mái dưới + mái trên (hai tầng)
  const towerW = Math.min(2 * hw - 0.4, gp.width + 1.2);
  grp.add(box(towerW + 0.6, 0.3, t + 0.6, style.stone, 0, h + 0.15, 0));
  grp.add(box(towerW, 1.8, t, w.color, 0, h + 1.2, 0));
  const lower = new THREE.Mesh(prism(towerW + 1.6, t + 1.8, 0.7), roofMat(w.capColor));
  lower.position.y = h + 2.1;
  const upperBody = box(towerW * 0.7, 1, t * 0.7, w.color, 0, h + 3.2, 0);
  const upper = new THREE.Mesh(prism(towerW * 0.7 + 1.4, t + 1.2, 1), roofMat(w.capColor));
  upper.position.y = h + 3.7;
  grp.add(lower, upperBody, upper);
  addGateSigns(grp, gp, h + 1.25, t / 2 + 0.04, (text) => {
    const sw = Math.min(towerW - 0.4, 0.6 + textEm(text) * 0.4);
    return signMesh(sw, 0.8, Math.round(sw * 180), 144, (cx, pw, ph) => drawSign(cx, pw, ph, text));
  });
  placeOnWall(grp, gp.axis, gp.fixed, gp.at);
  g.add(grp);
}

export function addPlasterWalls(scene: THREE.Scene, colliders: Colliders, w: Walls, extra: WallSegment[], style: Style): void {
  const g = new THREE.Group();
  const mats = wallMats(w, style);
  for (const r of [...ringRuns(w, PAD), ...extra.flatMap((s) => segmentRuns(s, w, PAD))]) plasterRun(g, r, w, style, mats);
  for (const gp of wallGates(w, extra)) ({ trang: moonGate, lau: lauGate, thanh: thanhGate })[gp.kind](g, gp, w, style, mats);
  for (const b of plasterWallBoxes(w, extra)) colliders.add(b.x, b.z, b.w, b.d, b.h);
  scene.add(g);
}
