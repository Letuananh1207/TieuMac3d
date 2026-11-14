/**
 * Cuộn sách trên tay khi Ngồi ôn (R-HANH-3, R-ON-8 — thiết kế 2026-11-14.10, tờ `NgoiOn-cuon-sach`): cuộn tay (thủ quyển) mở
 * ngang — 2 trục đứng + giấy giữa; không bám ngón tay, đặt theo hướng mặt nhân vật. Chỉ máy người học thấy.
 * Nhịp mở / thu: `cuonSachNhip.ts` (hàm thuần, có test). 5 draw call khi hiện, 0 khi ẩn.
 * Cỡ, chỗ đặt, màu theo đặc tả màn (không thuộc bố cục cảnh `scene.json`) — "gần đúng, chỉnh theo model nhân vật".
 * Hai bản: trước ngực (mặc định, lớp thân — người ngoài nhìn thấy) và trước mắt khi nhìn từ mắt (lớp ngôi 1 — R-DIEU-7,
 * R-ON-8): `update` với gốc = mắt, `setMount` đặt tâm cuộn theo khung màn (`fitScroll`), mặt giấy quay về mắt; giấy trước
 * có chỗ gắn `CanvasTexture` (`setPaper`) và tia dò ra toạ độ (u, v) trên giấy (`hitUv`).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { setLayer } from './layers';
import { lambert } from './materials';
import { markDynamic } from './merge';
import { CUON_AN, CUON_CAO, CUON_TRUOC, isOpen, poseOf, stepCuon, type CuonState } from './cuonSachNhip';

// cỡ (m) — nhân vật cao 2,1 m
const TRUC_DAI = 0.29;
const TRUC_R = 0.015; // Ø 0,03, trụ 8 cạnh
const DAU_R = 0.02; // đầu trục cầu Ø 0,04
const VIEN_R = 0.019; // viền vàng giữa trục và đầu trục
const GIAY_W = 0.26;
const GIAY_H = 0.25; // thiết kế 2026-11-14.21: giấy 0,26 × 0,25 (đổi từ 0,18) để 3 mục + "Đứng dậy" đủ cao chạm
const AN_CO = 0.03; // ấn son mặt sau
// chỗ: `CUON_CAO` / `CUON_TRUOC` (cuonSachNhip.ts — trước ngực người ngồi, tay chibi cầm hai đầu); mặt giấy ngửa 30° về phía mặt
const NGUA = Math.PI / 6;
// token (design/tokens/design_tokens.json): scroll-wood · jade · gold · map-paper · lacquer
const WOOD = '#3A2418';
const JADE = '#2B5446';
const GOLD = '#D4A64A';
const PAPER = '#F2EADA';
const LACQUER = '#A8322A';

/** Một trục: thân gỗ + hai đầu ngọc viền vàng, gộp màu theo đỉnh → 1 draw call. */
function trucGeometry(): THREE.BufferGeometry {
  const parts: [THREE.BufferGeometry, string][] = [[new THREE.CylinderGeometry(TRUC_R, TRUC_R, TRUC_DAI, 8), WOOD]];
  for (const s of [1, -1]) {
    const vien = new THREE.CylinderGeometry(VIEN_R, VIEN_R, 0.008, 8);
    vien.translate(0, s * (TRUC_DAI / 2 - 0.004), 0);
    const dau = new THREE.SphereGeometry(DAU_R, 8, 6);
    dau.translate(0, s * (TRUC_DAI / 2 + DAU_R * 0.6), 0);
    parts.push([vien, GOLD], [dau, JADE]);
  }
  const geos = parts.map(([g0, hex]) => {
    const g = g0.index ? g0.toNonIndexed() : g0;
    g.deleteAttribute('uv');
    const c = new THREE.Color(hex);
    const n = g.getAttribute('position').count;
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) colors.set([c.r, c.g, c.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  });
  return mergeGeometries(geos) ?? geos[0];
}

export interface CuonOptions {
  /** lớp vẽ (`layers.ts`); không có = lớp 0 */
  layer?: number;
}

/** Mép ngoài đầu trục tới tâm (m) khi mở hết — bề ngang cả cuộn = 2 × chừng này. */
export const CUON_NUA_RONG = GIAY_W / 2 + TRUC_R + DAU_R;
/** Nửa chiều cao cả cuộn (trục + đầu trục). */
export const CUON_NUA_CAO = TRUC_DAI / 2 + DAU_R * 1.6;

export class CuonSach {
  private readonly root = new THREE.Group();
  private readonly holder = new THREE.Group();
  private readonly trucs: THREE.Mesh[];
  private readonly giay: THREE.Mesh[];
  private readonly an: THREE.Mesh;
  private readonly mats: THREE.MeshLambertMaterial[];
  private state: CuonState = CUON_AN;
  private rollUp = false;
  private afterRoll: (() => void) | null = null;

  constructor(scene: THREE.Scene, opts: CuonOptions = {}) {
    const fade = { transparent: true };
    const trucMat = new THREE.MeshLambertMaterial({ vertexColors: true, ...fade });
    const truoc = lambert(PAPER, fade);
    const sau = lambert(new THREE.Color(PAPER).multiplyScalar(0.95), fade);
    const anMat = lambert(LACQUER, fade);
    this.mats = [trucMat, truoc, sau, anMat];

    const trucGeo = trucGeometry();
    this.trucs = [new THREE.Mesh(trucGeo, trucMat), new THREE.Mesh(trucGeo, trucMat)];
    // mặt trước (hướng về mặt nhân vật, −Z) và mặt sau (camera thường thấy, +Z); mỗi mặt một phía, không chồng nhau
    const truocGeo = new THREE.PlaneGeometry(GIAY_W, GIAY_H).rotateY(Math.PI);
    this.giay = [new THREE.Mesh(truocGeo, truoc), new THREE.Mesh(new THREE.PlaneGeometry(GIAY_W, GIAY_H), sau)];
    this.an = new THREE.Mesh(new THREE.PlaneGeometry(AN_CO, AN_CO), anMat);
    this.an.position.set(0, -GIAY_H / 2 + AN_CO * 0.9, 0.002);

    this.holder.position.set(0, CUON_CAO, CUON_TRUOC);
    this.holder.rotation.x = NGUA; // đỉnh giấy ngả ra trước → mặt giấy ngửa lên về phía mặt
    this.holder.add(...this.trucs, ...this.giay, this.an);
    this.root.add(this.holder);
    this.root.visible = false;
    markDynamic(this.root);
    if (opts.layer !== undefined) setLayer(this.root, opts.layer);
    scene.add(this.root);
  }

  /** Bản trước mắt: tâm cuộn (toạ độ gốc-mắt quay theo hướng mặt: x sang trái người ngồi, y lên, z trước), ngửa `tilt` rad. */
  setMount(x: number, y: number, z: number, tilt: number): void {
    this.holder.position.set(x, y, z);
    this.holder.rotation.x = tilt;
  }

  /** Gắn ảnh lên mặt giấy phía người cầm (chữ / mục trên cuộn — chờ thiết kế); `null` = giấy trơn. */
  setPaper(map: THREE.Texture | null): void {
    const m = this.giay[0].material as THREE.MeshLambertMaterial;
    m.map = map;
    m.color.set(map ? '#ffffff' : PAPER);
    m.needsUpdate = true;
  }

  /** Tia dò trúng mặt giấy phía người cầm → (u, v) (0..1, u từ trái sang phải, v từ dưới lên, như người cầm thấy) + điểm trúng. */
  hitUv(ray: THREE.Raycaster): { u: number; v: number; point: THREE.Vector3 } | null {
    if (!this.root.visible || !this.giay[0].visible) return null;
    const hit = ray.intersectObject(this.giay[0], false)[0];
    return hit?.uv ? { u: hit.uv.x, v: hit.uv.y, point: hit.point } : null;
  }

  /** Nửa khoảng cách hai trục hiện tại (m, đã nhân cỡ) — tay cầm ngoài chỗ này; 0 = chưa hiện. */
  get half(): number {
    if (!this.root.visible) return 0;
    return Math.abs(this.trucs[0].position.x) * this.holder.scale.x;
  }

  /** Đã mở hết (giấy giãn xong, chưa cuộn lại) — chữ trên giấy hiện từ lúc này (thiết kế 2026-11-14.21). */
  get open(): boolean {
    return this.root.visible && isOpen(this.state);
  }

  /** Đang hiện (đã qua 0,3 s ngồi, chưa tắt). */
  get shown(): boolean {
    return this.root.visible;
  }

  /**
   * "Đứng dậy" trên bảng: cuộn lại (hai trục chập về giữa 0,25 s) rồi gọi `done` để nhân vật đứng.
   * Cuộn chưa mở hết → gọi `done` ngay.
   */
  rollUpThen(done: () => void): void {
    if (!isOpen(this.state)) {
      done();
      return;
    }
    this.rollUp = true;
    this.afterRoll = done;
  }

  /** Mỗi khung. `t` = số giây đã ngồi ôn, `null` = không ngồi ôn; `yaw` = hướng mặt nhân vật. */
  update(dt: number, at: THREE.Vector3, yaw: number, t: number | null): void {
    const was = this.state.kind;
    this.state = stepCuon(this.state, dt, t, this.rollUp);
    this.rollUp = false;
    if (was === 'cuon' && this.state.kind !== 'cuon' && this.afterRoll) {
      const done = this.afterRoll;
      this.afterRoll = null;
      done();
    }
    const p = poseOf(this.state);
    this.root.visible = p.visible && p.scale > 0.001;
    if (!this.root.visible) return;
    this.root.position.copy(at);
    this.root.rotation.y = yaw;
    this.holder.scale.setScalar(p.scale);
    const half = (GIAY_W / 2) * p.mo;
    // trục nằm ngoài mép giấy (thiết kế 2026-11-14.21: trục chỉ lấn mép giấy ~4 px) — chữ sát lề không bị trục che
    const trucX = Math.max(TRUC_R, half + TRUC_R * 0.7 * p.mo);
    this.trucs[0].position.x = trucX;
    this.trucs[1].position.x = -trucX;
    for (const g of this.giay) {
      g.scale.x = Math.max(p.mo, 0.001);
      g.visible = p.mo > 0.02;
    }
    // ấn son ở góc dưới mặt sau — góc phải khi nhìn từ sau lưng (−X của nhân vật)
    this.an.visible = half > AN_CO * 1.5;
    this.an.position.x = -(half - AN_CO * 0.9);
    for (const m of this.mats) m.opacity = p.alpha;
  }
}
