/**
 * Hai bàn tay khi nhìn từ mắt lúc ngồi (R-DIEU-7, R-NGOI-1, R-GIAO-1) — dựng bằng khối trong code, low-poly: ống tay áo
 * 6 cạnh thon + viền cổ tay gọn, cổ tay, lòng bàn tay, ba ngón gộp co thành móc (ôm quanh trục cuộn / mép bàn), ngón cái
 * khép, ngón trỏ riêng (co khi cầm, duỗi khi trỏ). Màu theo đỉnh, Lambert (cảnh "mềm": vật liệu mềm wrap như cảnh),
 * không bóng. Chỉ camera ngôi 1 thấy (lớp `LAYER_MAT`). Vật cầm: chén trà, quân cờ, quyển sách mở.
 * Draw call: 2 mỗi tay (tay + ngón trỏ) + chén / quân / sách khi hiện → 4–6.
 * Dáng (thuần, có test): `tayNgoiDang.ts`.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LAYER_MAT, setLayer } from './layers';
import { softMaterial } from './materials';
import { markDynamic } from './merge';
import { SHOULDER_L, SHOULDER_R, type HandPose, type HandsPose, type V3 } from './tayNgoiDang';

export interface HandPalette {
  sleeve: string;
  cuff: string;
  skin: string;
}

// cỡ (m) — nhìn sát mắt (~0,4–0,6 m) nên thon, gọn; bàn tay ~ bề ngang 5 cm
const SLEEVE_LEN = 0.24;
const SLEEVE_R0 = 0.026; // cổ tay
const SLEEVE_R1 = 0.038; // phía khuỷu (hơi loe)
/** gốc ngón trỏ (khung tay) */
const INDEX_AT: readonly [number, number] = [0.06, 0.012]; // [z, y]
// token (design/tokens/design_tokens.json): scroll-wood · map-paper · lacquer — sách, chén
const WOOD = '#3A2418';
const PAPER = '#F2EADA';
const CUP = '#e9e2d0';
const TEA = '#8a6a2e';
const STONE = '#0b0b0d';

/** Hình có màu theo đỉnh (bỏ uv) — để gộp nhiều khối khác màu thành một draw call. */
function colored(g0: THREE.BufferGeometry, hex: string): THREE.BufferGeometry {
  const g = g0.index ? g0.toNonIndexed() : g0;
  g.deleteAttribute('uv');
  const c = new THREE.Color(hex);
  const n = g.getAttribute('position').count;
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) colors.set([c.r, c.g, c.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

const boxAt = (w: number, h: number, d: number, x: number, y: number, z: number, rx = 0): THREE.BufferGeometry => {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rx) g.rotateX(rx);
  return g.translate(x, y, z);
};

/**
 * Một tay (khung riêng: cổ tay = gốc, +z = hướng ngón, +y = mu bàn tay, −y = lòng bàn tay). `side` +1 = tay phải
 * (ngón cái ở +x — phía giữa thân), −1 = tay trái.
 */
function handGeometry(side: 1 | -1, pal: HandPalette): { arm: THREE.BufferGeometry; index: THREE.BufferGeometry } {
  const sleeve = new THREE.CylinderGeometry(SLEEVE_R0, SLEEVE_R1, SLEEVE_LEN, 6).rotateX(Math.PI / 2).translate(0, 0, -SLEEVE_LEN / 2 - 0.03);
  const cuff = new THREE.CylinderGeometry(SLEEVE_R0 + 0.003, SLEEVE_R0 + 0.003, 0.016, 6).rotateX(Math.PI / 2).translate(0, 0, -0.022);
  const hook = new THREE.BoxGeometry(0.034, 0.015, 0.028).rotateX(Math.PI / 2); // đốt ngoài gập xuống phía lòng tay
  const thumb = new THREE.BoxGeometry(0.015, 0.015, 0.034).rotateX(0.5).rotateY(-side * 0.45);
  const parts: [THREE.BufferGeometry, string][] = [
    [sleeve, pal.sleeve],
    [cuff, pal.cuff],
    [boxAt(0.03, 0.024, 0.028, 0, 0, -0.002), pal.skin], // cổ tay
    [boxAt(0.05, 0.02, 0.05, 0, 0, 0.034), pal.skin], // lòng bàn tay
    [boxAt(0.034, 0.016, 0.03, -side * 0.008, -0.002, 0.072), pal.skin], // ba ngón: đốt gần
    [hook.translate(-side * 0.008, -0.016, 0.092), pal.skin], // ba ngón: đốt ngoài co (ôm trục)
    [thumb.translate(side * 0.026, -0.014, 0.034), pal.skin], // ngón cái khép vào lòng
  ];
  const arm = mergeGeometries(parts.map(([g, c]) => colored(g, c)))!;
  const index = colored(boxAt(0.013, 0.015, 0.05, 0, 0, 0.025), pal.skin);
  return { arm, index };
}

/** Quyển sách mở (án thư): hai trang nghiêng thành chữ V nông + bìa gỗ — một draw call. */
function bookGeometry(): THREE.BufferGeometry {
  const parts: [THREE.BufferGeometry, string][] = [];
  for (const s of [-1, 1]) {
    const page = new THREE.BoxGeometry(0.15, 0.008, 0.21).rotateZ(-s * 0.12).translate(s * 0.077, 0.012, 0);
    const cover = new THREE.BoxGeometry(0.16, 0.006, 0.22).rotateZ(-s * 0.12).translate(s * 0.08, 0.003, 0);
    parts.push([page, PAPER], [cover, WOOD]);
  }
  return mergeGeometries(parts.map(([g, c]) => colored(g, c)))!;
}

/** Chén trà (trong tay phải): thân chén + mặt nước trà. */
function cupGeometry(): THREE.BufferGeometry {
  const body = new THREE.CylinderGeometry(0.021, 0.015, 0.03, 8);
  const tea = new THREE.CylinderGeometry(0.019, 0.019, 0.003, 8).translate(0, 0.012, 0);
  return mergeGeometries([colored(body, CUP), colored(tea, TEA)])!;
}

interface HandParts {
  root: THREE.Group;
  index: THREE.Mesh;
  side: 1 | -1;
  shoulder: V3;
  /** dáng đang vẽ (trượt êm về dáng đích) */
  pos: THREE.Vector3;
  palm: THREE.Vector3;
  point: number;
  /** hướng cẳng tay (vai → cổ tay) */
  dir: THREE.Vector3;
  ready: boolean;
}

const tmpX = new THREE.Vector3();
const tmpY = new THREE.Vector3();
const tmpZ = new THREE.Vector3();
const tmpV = new THREE.Vector3();
const tmpM = new THREE.Matrix4();

/** Toạ độ thân → cảnh: mắt `eye`, hướng mặt `yaw` (0 = nhìn +z; bên phải người ngồi = (−cos, 0, sin)). */
export function bodyToWorld(v: V3, eye: THREE.Vector3, yaw: number, out = new THREE.Vector3()): THREE.Vector3 {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return out.set(eye.x - c * v[0] + s * v[2], eye.y + v[1], eye.z + s * v[0] + c * v[2]);
}

/** Hướng thân → cảnh (không dời gốc). */
function dirToWorld(v: V3, yaw: number, out: THREE.Vector3): THREE.Vector3 {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return out.set(-c * v[0] + s * v[2], v[1], s * v[0] + c * v[2]);
}

/** Cảnh → toạ độ thân (ngược `bodyToWorld`). */
export function worldToBody(p: THREE.Vector3, eye: THREE.Vector3, yaw: number): V3 {
  const dx = p.x - eye.x;
  const dz = p.z - eye.z;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [-c * dx + s * dz, p.y - eye.y, s * dx + c * dz];
}

export class TayNgoi {
  readonly root = new THREE.Group();
  private readonly hands: HandParts[];
  private readonly cup: THREE.Mesh;
  private readonly stone: THREE.Mesh;
  private readonly book: THREE.Mesh;
  private readonly mats: THREE.MeshLambertMaterial[] = [];

  /** `wrap` = cảnh "mềm" (`look.style: mem`): vật liệu mềm như cảnh (mặt khuất nắng không đen); không có = Lambert. */
  constructor(scene: THREE.Scene, pal: HandPalette, wrap?: number) {
    const mat = wrap === undefined ? new THREE.MeshLambertMaterial({ vertexColors: true }) : softMaterial(wrap);
    this.mats.push(mat);
    const make = (side: 1 | -1, shoulder: V3): HandParts => {
      const g = handGeometry(side, pal);
      const root = new THREE.Group();
      const arm = new THREE.Mesh(g.arm, mat);
      const index = new THREE.Mesh(g.index, mat);
      index.position.set(side * 0.017, INDEX_AT[1] - 0.012, INDEX_AT[0]); // gốc ngón trỏ ở mép lòng bàn tay phía ngón cái
      root.add(arm, index);
      this.root.add(root);
      return { root, index, side, shoulder, pos: new THREE.Vector3(), palm: new THREE.Vector3(0, -1, 0), point: 0, dir: new THREE.Vector3(0, 0, 1), ready: false };
    };
    this.hands = [make(-1, SHOULDER_L), make(1, SHOULDER_R)];
    this.cup = new THREE.Mesh(cupGeometry(), mat);
    this.root.add(this.cup); // đặt theo tay phải mỗi khung, luôn dựng đứng (không đổ trà)
    this.stone = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 5).scale(1, 0.45, 1), new THREE.MeshLambertMaterial({ color: STONE }));
    this.stone.position.set(0.016, -0.012, 0.105); // kẹp giữa đầu ngón trỏ và ngón cái
    this.hands[1].root.add(this.stone);
    this.book = new THREE.Mesh(bookGeometry(), mat);
    this.root.add(this.book);
    this.root.visible = false;
    setLayer(this.root, LAYER_MAT);
    markDynamic(this.root);
    scene.add(this.root);
  }

  /** Ẩn (đứng dậy / chưa sang ngôi 1); lần hiện sau tay đặt thẳng vào dáng, không trượt từ chỗ cũ. */
  hide(): void {
    this.root.visible = false;
    for (const h of this.hands) h.ready = false;
  }

  /**
   * Mỗi khung khi đang ngôi 1: dáng `pose` (toạ độ thân) → cảnh theo mắt `eye`, hướng mặt `yaw`. Tay trượt êm về dáng
   * (không giật khi đổi dáng). `book` = chỗ đặt quyển sách mở (thân), không có = ẩn.
   */
  update(dt: number, eye: THREE.Vector3, yaw: number, pose: HandsPose, book: V3 | null = null): void {
    this.root.visible = true;
    const k = 1 - Math.exp(-dt * 14);
    this.place(this.hands[0], pose.left, eye, yaw, k);
    this.place(this.hands[1], pose.right, eye, yaw, k);
    this.cup.visible = pose.cup;
    if (pose.cup) {
      // chén trong lòng tay phải: trước lòng bàn tay một chút, hơi về phía ngón
      const r = this.hands[1];
      this.cup.position.copy(r.pos).addScaledVector(r.palm, 0.028).addScaledVector(r.dir, 0.045);
    }
    this.stone.visible = pose.stone;
    this.book.visible = book !== null;
    if (book) {
      bodyToWorld(book, eye, yaw, this.book.position);
      this.book.rotation.set(0, yaw + Math.PI, 0);
    }
  }

  private place(h: HandParts, p: HandPose, eye: THREE.Vector3, yaw: number, k: number): void {
    const want = bodyToWorld(p.pos, eye, yaw, tmpV);
    const palm = dirToWorld(p.palm, yaw, tmpY);
    if (!h.ready) {
      h.pos.copy(want);
      h.palm.copy(palm).normalize();
      h.point = p.point;
      h.ready = true;
    } else {
      h.pos.lerp(want, k);
      h.palm.lerp(palm, k).normalize();
      h.point += (p.point - h.point) * k;
    }
    // khung tay: z = hướng cẳng tay (vai → cổ tay), y = mu bàn tay (ngược lòng), x = y × z
    const shoulder = bodyToWorld(h.shoulder, eye, yaw, tmpX);
    tmpZ.subVectors(h.pos, shoulder).normalize();
    h.dir.copy(tmpZ);
    tmpY.copy(h.palm).addScaledVector(tmpZ, -h.palm.dot(tmpZ));
    if (tmpY.lengthSq() < 1e-6) tmpY.set(0, -1, 0);
    tmpY.normalize().negate();
    tmpX.crossVectors(tmpY, tmpZ);
    tmpM.makeBasis(tmpX, tmpY, tmpZ);
    h.root.position.copy(h.pos);
    h.root.quaternion.setFromRotationMatrix(tmpM);
    // ngón trỏ: co (gập xuống ôm theo ba ngón kia) ↔ duỗi thẳng
    h.index.rotation.x = (1 - h.point) * 1.5;
  }
}
