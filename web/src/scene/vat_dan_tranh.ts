/**
 * Bục đàn (`buc-dan`, R-NPC-9): bục gỗ thấp viền son như sân diễn nhỏ, bồ đoàn cho nhạc công, bình phong ba tấm sau lưng, đàn cổ tranh 21 dây
 * (thân gỗ ngô đồng mặt cong, nhạc sơn hai đầu, dây tơ, nhạn đàn xếp chéo) trên giá thấp. Toàn khối Lambert tĩnh →
 * cảnh mềm gộp vào khối chung (0 draw call thêm); ~520 tam giác. Số đo ở `bucDan.ts`. Gốc ở tâm bục, mặt trước +z.
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { BUC_DAN, DAN_SEAT_Z, DAN_TRANH } from './bucDan';
import { lambert } from './materials';
import type { PropCollide } from './vat_truc';

/** gỗ ngô đồng thân đàn · nhạc sơn, giá (gỗ mun) · dây tơ · nhạn đàn (xương / ngà) · bồ đoàn */
const BODY = '#8a5530';
const EBONY = '#2a1a12';
const SILK = '#e2d5b6';
const PAPER = '#efe4c8';
const BRIDGE = '#f4ecd8';
const CUSHION = '#7a2b1c';

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, lambert(color));
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Độ cao mặt đàn (so với đáy thân) tại `z` cục bộ của đàn: mặt cong vồng lên giữa. */
const ARCH = 0.045;
const THICK = 0.06;
const faceY = (z: number): number => THICK + ARCH * (1 - ((2 * z) / DAN_TRANH.wide) ** 2);

/** Thân đàn: tiết diện mặt cong (5 điểm vồng + 2 góc đáy) đùn dọc x. */
function body(): THREE.BufferGeometry {
  const w = DAN_TRANH.wide;
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  for (let i = 0; i <= 4; i++) {
    const z = -w / 2 + (w * i) / 4;
    s.lineTo(z, faceY(z));
  }
  s.lineTo(w / 2, 0);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: DAN_TRANH.len, bevelEnabled: false, curveSegments: 1 });
  // hình vẽ trong mặt (x→z của đàn, y), đùn theo +z → quay cho thân nằm dọc x, tâm ở gốc
  geo.translate(0, 0, -DAN_TRANH.len / 2);
  geo.rotateY(Math.PI / 2);
  return geo;
}

/** Đàn cổ tranh đặt trên giá thấp; gốc ở sàn bục dưới tâm đàn. */
function danTranh(g: THREE.Group): void {
  const { len, wide, top, strings } = DAN_TRANH;
  const y0 = top - THICK - ARCH; // đáy thân đàn
  // giá đàn: hai chân gỗ
  const leg = new THREE.BoxGeometry(0.09, y0, wide * 0.9);
  for (const x of [-0.55, 0.55]) put(g, leg, EBONY, x, y0 / 2, 0);
  put(g, body(), BODY, 0, y0, 0);
  // nhạc sơn (gờ gác dây) hai đầu: đầu phải (dây ngắn, tay phải gảy) và đầu trái (trục lên dây)
  const ridge = new THREE.BoxGeometry(0.035, 0.03, wide * 0.92);
  const xR = len / 2 - 0.16;
  const xL = -len / 2 + 0.2;
  put(g, ridge, EBONY, xR, y0 + THICK + ARCH + 0.01, 0);
  put(g, ridge, EBONY, xL, y0 + THICK + ARCH + 0.01, 0);
  // dây tơ: tấm phẳng mảnh căng giữa hai nhạc sơn (2 tam giác mỗi dây), hơi cao hơn mặt đàn
  const span = xR - xL;
  const strip = new THREE.PlaneGeometry(span, 0.005).rotateX(-Math.PI / 2);
  // nhạn đàn: xếp chéo — dây trầm (phía nhạc công, −z) nhạn xa đầu phải, dây cao (+z) gần đầu phải
  const bridge = new THREE.BoxGeometry(0.018, 0.035, 0.022);
  for (let i = 0; i < strings; i++) {
    const t = i / (strings - 1);
    const z = -wide / 2 + 0.03 + (wide - 0.06) * t;
    const y = y0 + faceY(z);
    put(g, strip, SILK, (xL + xR) / 2, y + 0.03, z);
    put(g, bridge, BRIDGE, xR - 0.62 + 0.42 * t, y + 0.015, z);
  }
}

/** Bình phong ba tấm thấp sau lưng nhạc công (giấy dó khung gỗ) — làm nền khi nhìn từ giữa quảng trường. */
function screen(g: THREE.Group, style: Style, z: number): void {
  const { h } = BUC_DAN;
  const panel = new THREE.BoxGeometry(0.7, 1.15, 0.03);
  const post = new THREE.BoxGeometry(0.06, 1.3, 0.06);
  for (const x of [-0.74, 0, 0.74]) put(g, panel, PAPER, x, h + 0.7, z);
  for (const x of [-1.11, -0.37, 0.37, 1.11]) put(g, post, style.timber, x, h + 0.65, z);
  put(g, new THREE.BoxGeometry(2.3, 0.06, 0.07), style.timber, 0, h + 1.31, z);
}

/** Bục + bồ đoàn + đàn. Va chạm = cả bục (không ai đi lên — bục chỉ để nhìn). */
export function bucDan(g: THREE.Group, style: Style): [number, number] {
  const { w, d, h } = BUC_DAN;
  // chân bục viền son, mặt sàn gỗ nhô ra một chút
  put(g, new THREE.BoxGeometry(w - 0.12, h - 0.06, d - 0.12), style.pillar, 0, (h - 0.06) / 2, 0);
  put(g, new THREE.BoxGeometry(w, 0.06, d), style.floor, 0, h - 0.03, 0);
  put(g, new THREE.CylinderGeometry(0.38, 0.4, 0.08, 8), CUSHION, 0, h + 0.04, DAN_SEAT_Z);
  screen(g, style, -d / 2 + 0.2);
  const dan = new THREE.Group();
  dan.position.set(0, h, DAN_TRANH.z);
  danTranh(dan);
  g.add(dan);
  return [w, d];
}

/** Vật âm nhạc `kind` vào `g`; kiểu lạ → null. */
export function danTranhProp(kind: string, g: THREE.Group, style: Style): PropCollide | null {
  return kind === 'buc-dan' ? { box: bucDan(g, style) } : null;
}
