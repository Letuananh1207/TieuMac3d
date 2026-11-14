/**
 * Ghép hoạt cảnh cưỡi hạc truyền tống (R-HANH-5, kế hoạch docs/tasks/2026-11-15-cuoi-hac.md) — `main.ts` chỉ gọi vài chỗ.
 * - `CraneRide('cat')` trang cũ: hạc sà xuống đáp trước mặt, nhân vật nhảy lên lưng, hạc vút lên, mây phủ → tải lại trang.
 * - `CraneFlight` trang mới (`?den=hac`): cảnh bay biển mây riêng (`scene/bayMay.ts`) vẽ trong lúc cảnh thật dựng ngầm.
 * - `CraneRide('ha')` cảnh thật: hạc lượn hạ xuống bãi đáp, nhân vật nhảy xuống đúng chỗ xuất hiện, camera về sau lưng;
 *   rồi hạc bay đi (3 s) và gỡ khỏi cảnh.
 * Hiện chỉ bật ở chế độ thử `?hac` (`CRANE_IN_APP` = false — chờ thiết kế màn mây + lớp chữ); lớp chữ tạm `ui/craneHud.ts`.
 */
import * as THREE from 'three';
import type { Character } from './player/character';
import { buildFlight, type FlightScene } from './scene/bayMay';
import { Crane } from './scene/hac';
import { arriveCurve, bezier, curveHeading, departCamera, ease, easeOut, jumpArc, landCamera, landCurve, landingPad, leaveCurve, lerp3, mountPad, takeoffCurve, type Curve, type V3 } from './scene/hacDuong';
import { docEpGio, gioLuc, phaNgay } from './scene/ngayDem';
import type { SceneSpec, XZ } from './scene/spec';
import { CraneHud } from './ui/craneHud';
import { CRANE_TIMING as T, CraneClock, arrivingByCrane, departStage, landStage, wantsCrane, type TravelHow } from './zones/cuoiHac';

export const prefersReducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** chế độ thử: `?hac` (giữ qua các chuyến — `main.ts` `travel`) */
export const craneTrial = (params: URLSearchParams): boolean => params.has('hac');
export const craneDeparts = (params: URLSearchParams, how: TravelHow): boolean => wantsCrane({ how, trial: craneTrial(params), reducedMotion: prefersReducedMotion() });
export const craneArrives = (params: URLSearchParams): boolean => arrivingByCrane(params, prefersReducedMotion());

/** đêm (theo giờ VN + `?gio`) → mây chàm */
function isNight(spec: SceneSpec, params: URLSearchParams): { gio: number; night: boolean } {
  const gio = gioLuc(docEpGio(params), Date.now(), Date.now());
  return { gio, night: spec.dayNight.enabled && phaNgay(gio, spec.dayNight.moc).dem > 0.5 };
}

/** lớp phủ tạm của hoạt cảnh (mây trắng / chàm theo giờ) */
export const craneHud = (spec: SceneSpec, params: URLSearchParams): CraneHud => new CraneHud(isNight(spec, params).night);

const pose = (c: Character, dt: number, sit: number, air = false, vy = 0): void => c.animate(dt, 0, { mps: 0, air, vy, sit, bow: 0, idle: 0 });
const v3 = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

export interface RideOpts {
  scene: THREE.Scene;
  character: Character;
  spec: SceneSpec;
  /** chỗ nhân vật đứng (cất cánh: đang đứng; hạ cánh: chỗ xuất hiện) + hướng nhìn */
  at: XZ;
  heading: number;
  groundAt(x: number, z: number): number;
  /** cất cánh: camera lúc bắt đầu; hạ cánh: camera sau lưng của trò chơi lúc xuất hiện */
  camera: { pos: V3; look: V3 };
  hud: CraneHud;
  /** cất cánh: mây đã phủ kín → tải lại trang · hạ cánh: nhân vật đã đứng ở chỗ xuất hiện → trả điều khiển */
  onEnd(): void;
}

/** Khúc cất cánh / hạ cánh trên cảnh thật. `owns` = còn giữ nhân vật + camera (main.ts không cập nhật chúng). */
export class CraneRide {
  readonly clock: CraneClock;
  private readonly crane: Crane;
  private readonly pad: XZ;
  private readonly padY: number;
  private readonly curves: { a: Curve; b: Curve };
  private readonly seat = new THREE.Vector3();
  private readonly look = new THREE.Vector3();
  private fade = -1;
  private ended = false;
  private leaving = -1;
  owns = true;
  finished = false;

  constructor(
    readonly leg: 'cat' | 'ha',
    private readonly o: RideOpts,
  ) {
    this.clock = new CraneClock(leg);
    this.crane = new Crane(o.spec.crane);
    this.pad = leg === 'cat' ? mountPad(o.at, o.heading) : landingPad(o.at, o.heading, o.spec.crane.padOffset);
    this.padY = o.groundAt(...this.pad);
    this.curves =
      leg === 'cat'
        ? { a: arriveCurve(this.pad, this.padY, o.heading), b: takeoffCurve(this.pad, this.padY, o.heading) }
        : { a: landCurve(this.pad, this.padY, o.heading), b: leaveCurve(this.pad, this.padY, o.heading) };
    o.scene.add(this.crane.root);
    o.hud.capture(() => this.skip());
    o.hud.hint('boQua');
    if (leg === 'ha') o.hud.veil(1);
  }

  skip(): void {
    if (!this.owns || this.clock.skipped) return;
    this.clock.skip();
    if (this.leg === 'cat') this.fade = 0;
  }

  /** Mỗi khung, SAU khi main.ts đặt camera thường: đặt hạc, nhân vật, camera của hoạt cảnh. */
  update(dt: number, camera: THREE.Camera): void {
    if (this.leaving >= 0) return this.updateLeave(dt);
    this.clock.update(dt);
    if (this.leg === 'cat') this.updateDepart(dt, camera);
    else this.updateLand(dt, camera);
  }

  private placeCrane(c: Curve, k: number, fold: number): V3 {
    const p = bezier(c, k);
    this.crane.root.position.set(...p);
    this.crane.root.rotation.set(0, curveHeading(c, k, this.o.heading), 0);
    this.crane.fold = fold;
    return p;
  }

  private updateDepart(dt: number, camera: THREE.Camera): void {
    const { character: ch, heading } = this.o;
    const t = this.clock.t;
    const st = departStage(t);
    let at: V3;
    if (st === 'den') {
      const k = t / T.arrive;
      at = this.placeCrane(this.curves.a, easeOut(k), clamp01((k - 0.75) / 0.25));
      pose(ch, dt, 0);
    } else if (st === 'len') {
      at = this.placeCrane(this.curves.a, 1, 1);
      const k = (t - T.arrive) / (T.mount - T.arrive);
      const from: V3 = [this.o.at[0], this.o.groundAt(...this.o.at), this.o.at[1]];
      ch.root.position.set(...jumpArc(from, v3(this.crane.seatWorld(this.seat)), k, 0.8));
      ch.facing.rotation.y = heading;
      pose(ch, dt, 0, k < 1, k < 0.5 ? 3 : -3);
    } else {
      const k = (t - T.mount) / (T.takeoff - T.mount);
      at = this.placeCrane(this.curves.b, ease(k) ** 1.3, clamp01(1 - k * 4));
    }
    this.crane.update(dt, st === 'len' ? 0 : st === 'den' ? 0.6 : 0.7, st === 'den' ? 5 : 6);
    if (st !== 'den') this.ride(dt, st === 'len' ? 0 : clamp01((t - T.mount) * 6), st === 'len');
    const cam = departCamera(this.o.camera.pos, at, heading, t / T.takeoff);
    camera.position.set(...cam);
    // điểm nhìn trượt dần từ chỗ đang nhìn sang hạc (không giật ngẩng lên lúc hạc còn trên cao)
    const lk = lerp3(this.o.camera.look, [at[0], at[1] + 1.4, at[2]], ease(t / T.mount));
    camera.lookAt(this.look.set(...lk));
    // bỏ qua → mây phủ trong 0,4 s (như màn tải mờ) rồi sang bay
    if (this.fade >= 0) this.fade += dt;
    const veil = Math.max(this.clock.veil, this.fade >= 0 ? this.fade / T.skipFade : 0);
    this.o.hud.veil(veil);
    if (!this.ended && veil >= 1) {
      this.ended = true;
      this.o.onEnd();
    }
  }

  /** nhân vật ngồi trên lưng hạc; `jumping` = đang trong cung nhảy (đã đặt chỗ, chỉ dựng dáng) */
  private ride(dt: number, sit: number, jumping = false): void {
    const ch = this.o.character;
    if (jumping) return;
    ch.root.position.copy(this.crane.seatWorld(this.seat));
    ch.facing.rotation.y = this.crane.root.rotation.y;
    pose(ch, dt, sit);
  }

  private updateLand(dt: number, camera: THREE.Camera): void {
    const { character: ch, at, heading } = this.o;
    const t = this.clock.t;
    const ground: V3 = [at[0], this.o.groundAt(...at), at[1]];
    this.o.hud.veil(1 - t / T.cover);
    if (this.clock.done) return this.land();
    const st = landStage(t);
    let p: V3;
    if (st === 'ha') {
      const k = t / T.jumpOff;
      p = this.placeCrane(this.curves.a, easeOut(k), clamp01((k - 0.8) / 0.2));
      this.crane.update(dt, 0.6 * (1 - k * 0.7), 4, 0.4);
      this.ride(dt, 1);
    } else {
      p = this.placeCrane(this.curves.a, 1, 1);
      this.crane.update(dt, 0, 4);
      const k = clamp01((t - T.jumpOff) / (T.camBack - T.jumpOff));
      ch.root.position.set(...(k < 1 ? jumpArc(v3(this.crane.seatWorld(this.seat)), ground, k, 0.5) : ground));
      ch.facing.rotation.y = heading;
      pose(ch, dt, 0, k < 1, k < 0.4 ? 2 : -4);
    }
    const cam = landCamera(this.o.camera, p, v3(ch.root.position), clamp01((t - T.camBack) / (T.land - T.camBack)));
    camera.position.set(...cam.pos);
    camera.lookAt(this.look.set(...cam.look));
  }

  /** hạ xong (hoặc bỏ qua): đứng đúng chỗ xuất hiện, trả điều khiển, hạc bay đi */
  private land(): void {
    const { character: ch, at, heading } = this.o;
    ch.root.position.set(at[0], this.o.groundAt(...at), at[1]);
    ch.facing.rotation.y = heading;
    pose(ch, 0, 0);
    this.o.hud.veil(0);
    this.o.hud.hint(null);
    this.o.hud.capture(null);
    this.owns = false;
    this.leaving = 0;
    this.o.onEnd();
  }

  private updateLeave(dt: number): void {
    this.leaving += dt;
    const k = this.leaving / T.leave;
    this.placeCrane(this.curves.b, ease(k), clamp01(1 - this.leaving * 3));
    this.crane.update(dt, 0.75, 6);
    if (k >= 1) {
      this.crane.dispose();
      this.finished = true;
    }
  }
}

/**
 * Khúc bay (trang mới): vẽ cảnh bay bằng vòng lặp riêng tới khi cảnh thật dựng xong và đủ 1,5 s (hoặc đã chạm bỏ qua),
 * mây phủ 0,3 s rồi dừng + giải phóng. Nhân vật (dùng chung với cảnh thật) được mượn vào cảnh bay chỉ trong lúc vẽ.
 */
export class CraneFlight {
  readonly clock = new CraneClock('bay');
  readonly hud: CraneHud;
  private readonly flight: FlightScene;
  private rider: Character | null = null;
  private loaded = false;
  private progressK = 0;
  private covering = -1;
  private last = performance.now();
  private resolveEnd: (lands: boolean) => void = () => {};
  private readonly ended: Promise<boolean>;
  private firstFrame: () => void = () => {};
  /** vẽ xong khung đầu → màn tải cũ mờ đi */
  readonly started: Promise<void>;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    spec: SceneSpec,
    params: URLSearchParams,
    detail: number,
    colorManaged: boolean,
  ) {
    const { gio, night } = isNight(spec, params);
    this.hud = new CraneHud(night);
    this.flight = buildFlight(spec, detail, gio, colorManaged);
    this.hud.capture(() => this.clock.skip());
    this.place = spec.site.name;
    this.ended = new Promise((r) => (this.resolveEnd = r));
    this.started = new Promise((r) => (this.firstFrame = r));
    requestAnimationFrame(this.loop);
  }

  private readonly place: string;

  /** nhân vật ngồi trên lưng (khi model đã nạp) */
  setRider(c: Character): void {
    this.rider = c;
  }

  /** tiến độ dựng cảnh thật 0…1 */
  progress(k: number): void {
    this.progressK = Math.max(this.progressK, k);
  }

  /** cảnh thật đã dựng + biên dịch xong → chờ hết khúc bay; `true` = có khúc hạ cánh (không bị bỏ qua) */
  finish(): Promise<boolean> {
    this.loaded = true;
    this.progressK = 1;
    return this.ended;
  }

  private readonly loop = (now: number): void => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.clock.update(dt, this.loaded);
    const el = this.renderer.domElement;
    this.flight.update(dt, el.clientWidth / Math.max(1, el.clientHeight));
    this.draw(dt);
    this.firstFrame();
    if (this.clock.done && this.covering < 0) {
      this.covering = 0;
      this.hud.flying(null);
    }
    if (this.covering >= 0) {
      this.covering += dt;
      this.hud.veil(this.covering / T.cover);
      if (this.covering >= T.cover) {
        this.hud.capture(null);
        this.flight.dispose();
        this.resolveEnd(this.clock.landsAfter);
        return;
      }
    } else this.hud.flying(this.place, this.progressK, this.clock.hint);
    requestAnimationFrame(this.loop);
  };

  /** vẽ cảnh bay; nhân vật mượn vào cảnh bay rồi trả lại đúng chỗ cũ (cha, vị trí, hướng) */
  private draw(dt: number): void {
    const r = this.rider;
    if (!r) return this.renderer.render(this.flight.scene, this.flight.camera);
    const parent = r.root.parent;
    const pos = r.root.position.clone();
    const yaw = r.facing.rotation.y;
    this.flight.scene.add(r.root);
    r.root.position.copy(this.flight.seat);
    r.facing.rotation.y = this.flight.heading;
    pose(r, dt, 1);
    this.renderer.render(this.flight.scene, this.flight.camera);
    if (parent) parent.add(r.root);
    else this.flight.scene.remove(r.root);
    r.root.position.copy(pos);
    r.facing.rotation.y = yaw;
  }
}

/** Bỏ `den=hac` khỏi URL sau khi hạ (tải lại tay thì không bay lại). */
export function clearCraneParam(): void {
  const p = new URLSearchParams(location.search);
  if (!p.has('den')) return;
  p.delete('den');
  history.replaceState(history.state, '', `${location.pathname}?${p.toString()}`);
}

/** Camera hiện tại → vị trí + điểm nhìn (10 m trước mặt). */
export function cameraPose(camera: THREE.Camera): { pos: V3; look: V3 } {
  const d = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10).add(camera.position);
  return { pos: v3(camera.position), look: v3(d) };
}
