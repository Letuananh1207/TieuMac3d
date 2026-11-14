/**
 * Ghép "ngồi — nhìn từ mắt nhân vật" (R-DIEU-7, R-NGOI-1, R-ON-8, R-GIAO-1, R-VA-4; kế hoạch
 * docs/tasks/2026-11-14-ngoi-goc-mat.md): mọi kiểu ngồi → camera trượt 0,4 s vào mắt, thân mình ẩn khỏi camera mình
 * (lớp vẽ — dáng ngồi trong cảnh không đổi), hai bàn tay khối + cuộn sách trước mắt / chén trà / sách mở / tay trên bàn
 * chơi; kéo để nhìn quanh có giới hạn, thả tay thì nhìn lại; đứng dậy → trượt về camera ngôi 3 như trước khi ngồi.
 *
 * `main.ts` (và Canvas 3D) chỉ: `sit(chỗ)` / `stand()`, chuyển kéo màn vào `drag`, mỗi khung `update` với camera ngôi 3
 * (OrbitCamera vẽ vào camera phụ) và camera bàn chơi (`GamePlay.placeCamera` vẽ vào camera phụ).
 * Chữ / mục trên cuộn (thiết kế 2026-11-14.21): `setMenu` vẽ các mục lên giấy (`ui/cuonMucPaint.ts`) — hiện khi giấy mở hết,
 * mờ → rõ 0,2 s; chạm mục dùng được → ngón trỏ chỉ vào + viền vàng 0,15 s rồi gọi `onPick` (R-ON-8).
 */
import * as THREE from 'three';
import {
  aimCamera,
  blendCamera,
  BODY_HIDE_AT,
  eyeAt,
  eyeFov,
  EyeLook,
  eyeSettings,
  stepBlend,
  type CamPose,
  type EyeSettings,
} from './input/eyeCamera';
import type { Character } from './player/character';
import { CUON_NUA_CAO, CUON_NUA_RONG, CuonSach } from './scene/cuonSach';
import { fitScroll } from './scene/cuonSachNhip';
import { LAYER_MAT, LAYER_THAN, setLayer, viewLayers } from './scene/layers';
import { isSoft, type LookSpec } from './scene/look';
import type { FirstPersonSpec } from './scene/spec';
import { CuonA11y, loadCuonFonts, paintCuon, type CuonPaintState } from './ui/cuonMucPaint';
import { cuonHit, cuonLayout, cuonUsable, type CuonLayout, type CuonRowId, type CuonView } from './zones/cuonMuc';
import { TayNgoi, worldToBody } from './scene/tayNgoi';
import {
  bookPose,
  railPose,
  reach,
  reachPhase,
  REACH_TOTAL,
  restPose,
  scrollPose,
  tablePose,
  teaPose,
  type HandsPose,
  type V3,
} from './scene/tayNgoiDang';

/** Chỗ đang ngồi — quyết camera, tay, vật cầm. */
export type SitPlace =
  /** Ngồi ôn tại chỗ, bồ đoàn khu tự học: hai tay cầm cuộn sách (R-ON-8) */
  | { kind: 'on' }
  /** án thư, bàn trà, đôn, sập, ghế lan can (R-NGOI-1) */
  | { kind: 'ngoi'; hold?: 'tra' | 'sach' | 'lan-can'; rail?: { d: number; h: number } }
  /** ghế bàn chơi: cúi nhìn bàn (R-GIAO-1) — `center` tâm chỗ chơi, `rotY` hướng nhìn của ghế */
  | { kind: 'ban-choi'; game: 'co' | 'dau-chu'; center: THREE.Vector3; rotY: number };

const DEG = Math.PI / 180;
/** quyển sách mở trên án (thân — R-NGOI-1) */
const BOOK: V3 = [0, -0.5, 0.46];
/** mặt bàn chơi: tay đặt ở mép phía mình cách tâm chỗ chơi (m), cách nhau (m); thẻ Đấu chữ 0,5 m — tay cầm hai góc gần */
const TABLE_EDGE = 0.86; // bàn cờ 13 × 13 rộng 1,2 m: hàng gần nhất cách tâm 0,6 — tay + ngón không che ô
const TABLE_SPREAD = 0.3;
const CARD_NEAR = 0.36; // thẻ 0,5 m: mép gần cách tâm 0,25 — ngón chỉ chạm mép thẻ, không che chữ
const CARD_SPREAD = 0.2;
/** Ghế lan can: tay với tới thanh cách mắt chừng này (m); lan can xa hơn → chỉ camera + tay nhoài tới (dáng ngồi ngoài
 *  cảnh không đổi) */
const RAIL_REACH = 0.58;

export class NgoiMat {
  private place: SitPlace | null = null;
  /** 0 = ngôi 3 · 1 = ngôi 1 (đều trong `blend` giây) */
  private w = 0;
  /** giây đã ngồi (nhịp chén trà) */
  private sitT = 0;
  private readonly s: EyeSettings;
  private readonly pitchOf: { study: number; seat: number; game: number };
  readonly look: EyeLook;
  private readonly scroll: CuonSach;
  private readonly hands: TayNgoi;
  private readonly eye = new THREE.Vector3();
  private readonly eyeCam = new THREE.Object3D();
  private readonly third: CamPose = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), fov: 55 };
  private readonly first: CamPose = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), fov: 55 };
  private readonly ray = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  /** đang trỏ / đặt quân: giây kể từ lúc chạm, điểm đích (thân), có cầm quân */
  private reachK = Infinity;
  private reachAt: V3 = [0, 0, 0];
  private reachStone = false;
  /** mục in trên giấy (thiết kế 2026-11-14.21) */
  private menu: CuonView | null = null;
  private onPick: ((id: CuonRowId) => void) | null = null;
  private layout: CuonLayout = cuonLayout(false);
  private readonly paperCanvas = document.createElement('canvas');
  private readonly paperTex = new THREE.CanvasTexture(this.paperCanvas);
  private readonly paint: CuonPaintState = { alpha: 0, press: null, flash: null };
  private paperOn = false;
  private dirty = true;
  /** giây còn lại: chữ mờ → rõ · viền vàng trước khi mở · chữ mờ đi trước khi đứng dậy · viền ngọc nhấp */
  private fadeIn = 0;
  private pressT = 0;
  private fadeOut = 0;
  private flashT = 0;
  private picked: CuonRowId | null = null;
  private readonly a11y = new CuonA11y((id) => this.pick(id));

  constructor(
    scene: THREE.Scene,
    private readonly character: Character,
    private readonly cam: { fov: number; firstPerson: FirstPersonSpec },
    look?: LookSpec,
  ) {
    const fp = cam.firstPerson;
    this.s = eyeSettings(fp);
    this.pitchOf = { study: fp.pitch.study * DEG, seat: fp.pitch.seat * DEG, game: fp.pitch.game * DEG };
    this.look = new EyeLook(this.s);
    setLayer(character.root, LAYER_THAN); // thân mình: chỉ camera ngôi 3 thấy (dáng ngồi không đổi)
    this.scroll = new CuonSach(scene, { layer: LAYER_MAT });
    this.hands = new TayNgoi(scene, character.palette ?? { sleeve: fp.sleeve, cuff: fp.cuff, skin: fp.skin }, look && isSoft(look) ? look.wrap : undefined);
    this.ray.layers.set(LAYER_MAT);
    this.paperTex.colorSpace = THREE.SRGBColorSpace;
    this.paperTex.anisotropy = 4;
    void loadCuonFonts().then(() => (this.dirty = true)); // chữ Việt (Lora, Be Vietnam Pro) nạp xong → vẽ lại giấy
  }

  /**
   * Các mục in trên cuộn (R-ON-8). `flash` = mục vừa dùng (đóng màn → viền ngọc nhấp 0,6 s); cuộn đang hiện chữ thì không
   * chạy lại nhịp mờ → rõ. `null` = bỏ mục (giấy trơn).
   */
  setMenu(view: CuonView | null, onPick?: (id: CuonRowId) => void, flash: CuonRowId | null = null): void {
    const wasShown = this.paperOn && this.menu !== null;
    this.menu = view;
    this.onPick = onPick ?? null;
    this.picked = null;
    this.pressT = 0;
    this.fadeOut = 0;
    this.paint.press = null;
    this.paint.flash = flash;
    this.flashT = flash ? 0.6 : 0;
    if (!wasShown) this.paint.alpha = 0;
    this.dirty = true;
    this.a11y.set(view);
  }

  /** Chọn một mục (chạm giấy / nút trợ năng): mục mờ bỏ qua; viền vàng 0,15 s rồi gọi `onPick` ("Đứng dậy": chữ mờ thêm 0,15 s). */
  private pick(id: CuonRowId): boolean {
    if (!this.menu || this.picked || !cuonUsable(this.menu, id)) return false;
    this.picked = id;
    this.pressT = 0.15;
    this.paint.press = id;
    this.dirty = true;
    return true;
  }

  /** Mỗi khung: giấy có chữ khi cuộn mở hết; nhịp mờ → rõ / nhấn / đứng dậy; vẽ lại ảnh giấy khi đổi. */
  private updatePaper(dt: number, landscape: boolean): void {
    const show = !!this.menu && this.place?.kind === 'on' && this.scroll.open;
    if (show !== this.paperOn) {
      this.paperOn = show;
      this.scroll.setPaper(show ? this.paperTex : null);
      if (show && this.paint.alpha < 1) this.fadeIn = 0.2;
      this.dirty = true;
    }
    if (!show) return;
    if (landscape !== this.layout.landscape) {
      this.layout = cuonLayout(landscape);
      this.dirty = true;
    }
    if (this.fadeIn > 0) {
      this.fadeIn = Math.max(0, this.fadeIn - dt);
      this.paint.alpha = 1 - this.fadeIn / 0.2;
      this.dirty = true;
    } else if (this.paint.alpha < 1 && !this.fadeOut && !this.picked) this.paint.alpha = 1;
    if (this.flashT > 0 && (this.flashT -= dt) <= 0) {
      this.paint.flash = null;
      this.dirty = true;
    }
    if (this.picked && this.pressT > 0 && (this.pressT -= dt) <= 0) {
      const id = this.picked;
      if (id === 'stand') this.fadeOut = 0.15;
      else {
        this.paint.press = null;
        this.picked = null;
        this.dirty = true;
        this.onPick?.(id);
      }
    }
    if (this.fadeOut > 0) {
      this.fadeOut = Math.max(0, this.fadeOut - dt);
      this.paint.alpha = this.fadeOut / 0.15;
      this.dirty = true;
      if (this.fadeOut === 0) {
        this.picked = null;
        this.onPick?.('stand');
      }
    }
    if (this.dirty && this.menu) {
      paintCuon(this.paperCanvas, this.layout, this.menu, this.paint);
      this.paperTex.needsUpdate = true;
      this.dirty = false;
    }
  }

  /** Ngồi xuống (mọi kiểu ngồi): bắt đầu trượt vào mắt. */
  sit(place: SitPlace): void {
    this.place = place;
    this.sitT = 0;
    this.reachK = Infinity;
    this.look.reset();
  }

  /** Đứng dậy: trượt về camera ngôi 3 (giữ khung mắt cuối cùng làm điểm đầu). */
  stand(): void {
    this.place = null;
  }

  /** Đang ngồi (đã gọi `sit`, chưa `stand`) — kéo màn là nhìn quanh, chụm / lăn không zoom. */
  get seated(): boolean {
    return this.place !== null;
  }

  /** Camera đang ở mắt (đủ gần để thân mình đã ẩn) — ẩn nhãn tên / bong bóng của chính mình. */
  get firstPerson(): boolean {
    return this.w >= BODY_HIDE_AT;
  }

  /** Kéo màn khi đang ngồi (trừ bàn chơi — chạm là chạm bàn, R-GIAO-1). */
  drag(dx: number, dy: number): void {
    const p = this.place;
    if (!p || p.kind === 'ban-choi') return;
    this.look.look(dx, dy, this.basePitch(p));
  }

  /** "Đứng dậy" trên bảng chọn: cuộn trước mắt cuộn lại cùng nhịp cuộn trước ngực (`NhapDinh.rollUpThen`). */
  rollUp(): void {
    this.scroll.rollUpThen(() => {});
  }

  /** Vừa đặt quân ở `at` (cảnh): tay phải cầm quân đưa tới rồi rút về (R-GIAO-1). */
  playAt(at: THREE.Vector3): void {
    this.reachAt = worldToBody(at, this.eye, this.character.facing.rotation.y);
    this.reachK = 0;
    this.reachStone = true;
  }

  /**
   * Chạm màn (client px) khi ngồi ôn: trúng giấy cuộn trước mắt → `true` (nuốt chạm). Trúng mục dùng được (chữ đã hiện)
   * → ngón trỏ tay phải chỉ vào, viền vàng 0,15 s rồi `onPick` (R-ON-8); mục mờ / chỗ trống → không gì.
   */
  tapScroll(x: number, y: number, camera: THREE.Camera): boolean {
    if (this.place?.kind !== 'on' || !this.firstPerson) return false;
    this.ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    this.ray.setFromCamera(this.ndc, camera);
    const hit = this.scroll.hitUv(this.ray);
    if (!hit) return false;
    const id = this.menu && this.paperOn && this.paint.alpha >= 1 ? cuonHit(this.layout, this.menu, hit.u, hit.v) : null;
    if (id && this.pick(id)) {
      this.reachAt = worldToBody(hit.point, this.eye, this.character.facing.rotation.y);
      this.reachK = 0;
      this.reachStone = false;
    }
    return true;
  }

  private readonly tmp = new THREE.Vector3();

  /** Ghế lan can xa quá tầm tay: mắt (camera + tay) nhoài tới trước chừng này (m) — chỉ camera mình, thân ngoài cảnh đứng yên. */
  private lean(p: SitPlace): number {
    return p.kind === 'ngoi' && p.hold === 'lan-can' && p.rail ? Math.max(0, p.rail.d - this.s.eyeFwd - RAIL_REACH) : 0;
  }

  private basePitch(p: SitPlace): number {
    return p.kind === 'on' ? this.pitchOf.study : p.kind === 'ngoi' ? this.pitchOf.seat : this.pitchOf.game;
  }

  private fov(aspect: number): number {
    return eyeFov(this.cam.fov, aspect, this.s.minHFov);
  }


  /**
   * Mỗi khung (sau khi OrbitCamera vẽ vào `third`, GamePlay vẽ vào `game` nếu đang ngồi chơi): đặt `camera` thật, lớp vẽ,
   * tay, cuộn. `studyT` = giây đã ngồi ôn (cuộn mở 0,3 → 1 s, R-ON-8); `null` = không có cuộn.
   */
  update(dt: number, camera: THREE.PerspectiveCamera, third: THREE.Camera, game: THREE.PerspectiveCamera | null, studyT: number | null): void {
    const p = this.place;
    this.w = stepBlend(this.w, p !== null, dt, this.s.blend);
    this.third.position.copy(third.position);
    this.third.quaternion.copy(third.quaternion);
    this.third.fov = this.cam.fov;
    const yaw = this.character.facing.rotation.y;
    const fov = this.fov(camera.aspect);
    if (p) {
      this.sitT += dt;
      this.look.update(dt);
      eyeAt(this.character.root.position, yaw, this.s, this.eye);
      const lean = this.lean(p);
      if (lean) this.eye.add(this.tmp.set(Math.sin(yaw) * lean, 0, Math.cos(yaw) * lean));
      if (p.kind === 'ban-choi' && game) {
        game.fov = fov;
        game.aspect = camera.aspect;
        this.first.position.copy(game.position);
        this.first.quaternion.copy(game.quaternion);
      } else {
        aimCamera(this.eyeCam, this.eye, yaw + this.look.yaw, this.basePitch(p) + this.look.pitch);
        this.first.position.copy(this.eyeCam.position);
        this.first.quaternion.copy(this.eyeCam.quaternion);
      }
      this.first.fov = fov;
    }
    if (this.w <= 0) {
      camera.position.copy(third.position);
      camera.quaternion.copy(third.quaternion);
      if (camera.fov !== this.cam.fov) {
        camera.fov = this.cam.fov;
        camera.updateProjectionMatrix();
      }
    } else blendCamera(camera, this.third, this.first, this.w);
    camera.updateMatrixWorld();
    const fp = this.firstPerson;
    viewLayers(camera, fp);

    // cuộn sách trước mắt (Ngồi ôn, bồ đoàn khu tự học)
    const cuonT = p?.kind === 'on' ? studyT : null;
    const { dist, side } = fitScroll(fov, camera.aspect, CUON_NUA_RONG, CUON_NUA_CAO);
    const base = p ? this.basePitch(p) : 0;
    const cy = Math.sin(base) * dist;
    const cz = Math.cos(base) * dist;
    this.scroll.setMount(-side, cy, cz, -base); // gốc cuộn quay theo hướng mặt: +x là bên trái người ngồi
    this.scroll.update(dt, this.eye, yaw, cuonT);
    this.updatePaper(dt, camera.aspect > 1);

    if (!p || !fp) {
      this.hands.hide();
      return;
    }
    this.hands.update(dt, this.eye, yaw, this.handsPose(p, dt, [side, cy, cz]), p.kind === 'ngoi' && p.hold === 'sach' ? BOOK : null);
  }

  private handsPose(p: SitPlace, dt: number, center: V3): HandsPose {
    let pose: HandsPose;
    if (p.kind === 'on') pose = this.scroll.shown ? scrollPose(center, [1, 0, 0], this.scroll.half) : restPose();
    else if (p.kind === 'ngoi')
      pose =
        p.hold === 'tra'
          ? teaPose(this.sitT)
          : p.hold === 'sach'
            ? bookPose(BOOK)
            : p.hold === 'lan-can' && p.rail
              ? railPose(p.rail.d - this.s.eyeFwd - this.lean(p), p.rail.h - this.s.eyeY)
              : restPose();
    else pose = this.tableHands(p);
    if (this.reachK < REACH_TOTAL) {
      this.reachK += dt;
      pose = reach(pose, this.reachAt, reachPhase(this.reachK), this.reachStone && this.reachK < REACH_TOTAL * 0.65);
    }
    return pose;
  }

  /** Bàn chơi: hai tay ở mép bàn phía mình (cờ) / cầm hai góc thẻ bộ thủ (Đấu chữ). */
  private tableHands(p: Extract<SitPlace, { kind: 'ban-choi' }>): HandsPose {
    const yaw = this.character.facing.rotation.y;
    // từ tâm chỗ chơi về phía người ngồi = ngược hướng nhìn của ghế; ngang = bên phải người ngồi
    const bx = -Math.sin(p.rotY);
    const bz = -Math.cos(p.rotY);
    const rx = -Math.cos(p.rotY);
    const rz = Math.sin(p.rotY);
    const near = p.game === 'co' ? TABLE_EDGE : CARD_NEAR;
    const spread = p.game === 'co' ? TABLE_SPREAD : CARD_SPREAD;
    const at = (k: number): V3 =>
      worldToBody(new THREE.Vector3(p.center.x + bx * near + rx * k, p.center.y + 0.025, p.center.z + bz * near + rz * k), this.eye, yaw);
    return tablePose(at(-spread), at(spread));
  }
}
