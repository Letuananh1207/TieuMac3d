/**
 * Ghép vườn rau Nhà của ta (R-VUON-1…9): nạp vườn (`getGarden`; không có Flutter → ví thử, R-TIEN-7), vẽ dáng cây theo giờ
 * thật (`zones/vuon.ts` + `Date.now()`; ví thử có `?vuon=<hệ số>` lớn nhanh), đổi luống hoang khi mở ô, tìm luống / thùng
 * gần nhất (R-VUON-2/7), làm thao tác (`gardenAct` hoặc ví thử) rồi báo ví HUD. File gốc như `homeDecor.ts` — `main.ts` chỉ
 * tạo khi cảnh có `garden`.
 *
 * HUD (thiết kế 2026-11-15.29 + 2026-11-16.4): vòng công cụ quanh luống + lưới hạt (`ui/gardenRing.ts`), chữ nổi
 * (`ui/gardenFloat.ts`), nút "Bán" ở thùng + nhãn đang lớn + hàng dấu luống + tấm báo (`ui/gardenHud.ts`), bảng kho / mở ô
 * (`ui/gardenPanel.ts`), chữ + số ở `zones/vuonHud.ts`, `zones/vuonVongHud.ts`. Bảng mở → nhân vật đứng yên (`active`). Chế
 * độ gỡ lỗi `?debug` vẫn có `window.__hocXaVuon` (state / act / spot) để thử trong Console.
 */
import * as THREE from 'three';
import type { TrialStore } from './bridge/browserStore';
import { getGarden, type FlutterBridge } from './bridge/flutterBridge';
import { GardenWork } from './gardenWork';
import type { Character } from './player/character';
import type { PlayerController } from './player/controller';
import type { CropStage, PlotShow } from './scene/cayTrong';
import type { GardenSpec } from './scene/spec';
import type { Garden3D } from './scene/vuonLuong';
import { GardenFloat } from './ui/gardenFloat';
import { GardenHud, type MarkAt } from './ui/gardenHud';
import { GardenPanel, type FarmStoreRow } from './ui/gardenPanel';
import type { NongItem, NongProduct } from './zones/nong';
import { GardenRing } from './ui/gardenRing';
import { VuonSound } from './ui/vuonSound';
import { maNgayVN } from './zones/gioVN';
import { cropOf, freshGarden, nextOpenPrice, plotOf, plotState, ripeCount, type CropId, type Garden, type GardenAct, type GardenResult } from './zones/vuon';
import {
  bagChips,
  gardenHudShown,
  harvestToast,
  lookText,
  MARK_RANGE,
  nearestPlot,
  openPlotLabel,
  plotLook,
  seedLabel,
  sellLabel,
  pickSpot,
  ripeToast,
  seedCards,
  storeView,
  unlockedToast,
  unlockView,
  type GardenBusy,
  type GardenSpot,
} from './zones/vuonHud';
import { fertLabel } from './zones/vuonCham';
import { plotBadges } from './zones/vuonVongHud';
import { dangBanMay } from './input/cheDoNhap';
import { gardenTrialAct } from './zones/walletRules';

/** Nhãn đang lớn trên luống (m trên mặt luống) và nút "Bán" trên thùng thu mua. */
const PLOT_ANCHOR_Y = 0.55;
const BIN_ANCHOR_Y = 1.3;
/** Hàng dấu luống nổi trên mặt luống (m); xa hơn [MARK_FULL] m → chỉ dấu đầu (đặc tả "xa / đông"). */
const MARK_Y = 0.5;
const MARK_FULL = 12;
/** Chữ nổi bắt đầu trên mặt luống (m). */
const FLOAT_Y = 0.9;

/** Kiểm đổi dáng mỗi chừng này (s) — cây lớn theo phút, không cần mỗi khung. */
const TICK_S = 1;

export interface HomeGardenDeps {
  garden: Garden3D;
  bridge: FlutterBridge;
  /** ví thử (không có Flutter — R-TIEN-7) */
  trial: TrialStore | null;
  /** hệ số lớn nhanh `?vuon=` (chỉ ví thử) */
  speed: number;
  /** ví HUD: tiền vừa đổi ([amount] âm = trừ) + nhãn (R-TIEN-5); [balance] = số dư mới; [from] = điểm màn xu bay ra */
  coins(amount: number, label: string, balance: number, from?: () => { x: number; y: number } | null): void;
  /** số dư hiện tại (hộp mở ô — đang có / còn lại) */
  balance(): number;
  /** bảng vườn vừa mở: dừng joystick / bỏ đích đi */
  onOpen(): void;
  /** `?debug`: `window.__hocXaVuon` để thử trong Console */
  debug: boolean;
  /** làm vườn kiểu 摩尔 (V-73): nhân vật tự đi tới luống + diễn (`gardenWork.ts`) */
  player: PlayerController;
  character: Character;
  /** đặc tả vườn (rào / vườn không rào V-82, cạnh luống) — `gardenWork.ts` */
  spec: GardenSpec;
}

/** Điểm màn ô Túi đồ trên thanh công cụ (quả bay khi thu); thanh ẩn → `null`. */
function bagPoint(): { x: number; y: number } | null {
  const b = document.querySelector('#toolbar:not(.tb-hidden) .tb-tuiDo .tb-disc')?.getBoundingClientRect();
  return b && b.width > 0 ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null;
}

/** Móc nông trại (R-NONG-5/7 — `nongTrai.ts`): hàng bán ở thùng, bán, nhổ cỏ → cỏ khô. */
export interface FarmHooks {
  rows(): FarmStoreRow[];
  sell(item: NongProduct | null): Promise<boolean>;
  weeded(): void;
}

export class HomeGarden {
  private farm: FarmHooks | null = null;
  private g: Garden = freshGarden();
  /** Flutter có mặt mà không trả vườn (bản cũ / lỗi) → chỉ xem (bridge.md `getGarden`) */
  private readOnly = false;
  private acc = TICK_S;
  private busy = false;
  private player = { x: 0, z: 0 };
  private readonly hud: GardenHud;
  private readonly panel: GardenPanel;
  private readonly ring: GardenRing;
  private readonly floats = new GardenFloat();
  private camera: THREE.Camera | null = null;
  private readonly anchor = new THREE.Vector3();
  private readonly v = new THREE.Vector3();
  private readonly marks: (MarkAt | null)[];
  /** cầm nông cụ, hàng đợi, đi tới + diễn (V-73) */
  readonly work: GardenWork;
  private readonly sound: VuonSound | null;
  /** dáng luống lần vẽ trước — luống vừa chín lúc đang ở vườn → nảy + "ting" (R-VUON-13, R-AM-4) */
  private stages: (string | null)[] = [];
  private busyNow = false;
  private ripeIdx: number[] = [];

  constructor(private readonly d: HomeGardenDeps) {
    this.hud = new GardenHud(d.garden.plots.length, () => this.openStore());
    this.panel = new GardenPanel({
      sell: (crop) => void this.sell(crop),
      sellFarm: (item) => void this.sellFarm(item),
      unlock: () => void this.unlock(),
      close: () => this.closePanel(),
    });
    this.marks = d.garden.plots.map(() => null);
    this.sound = typeof window.AudioContext === 'function' ? new VuonSound() : null;
    this.work = new GardenWork({
      garden: d.garden,
      player: d.player,
      character: d.character,
      spec: d.spec,
      sound: this.sound,
      state: () => this.g,
      now: () => this.now,
      speed: () => this.speed,
      act: (a) => this.act(a),
      harvested: (crop, got, i) => {
        const c = cropOf(crop);
        if (!c) return;
        this.hud.toast(harvestToast(c, got)); // R-VUON-6
        const from = this.screenOf(i, FLOAT_Y);
        if (from) this.floats.fly(c.id, from, bagPoint());
      },
      float: (t, i) => {
        const at = this.screenOf(i, FLOAT_Y);
        if (at) this.floats.show(t, at);
      },
      reason: (why, slot) => this.ring.reason(why, slot),
      unlock: () => this.openUnlock(), // ô "Mở ô" trên vòng luống hoang (R-VUON-8)
    });
    this.ring = new GardenRing({
      slot: (id) => this.work.choose(id),
      seed: (crop) => this.work.chooseSeed(crop),
      back: () => void this.work.back(),
    });
    // thử vòng công cụ khi chưa có HUD (V-73): luôn có trong Console; `?debug` thêm state / act / spot như cũ
    const w = this.work;
    Object.assign(window, {
      __hocXaVuon: {
        vong: (n: number) => w.openRing(`o-${n}`),
        chon: (k: number) => w.key(k),
        dong: () => w.closeRing(),
        ring: () => w.ring(),
        xem: () => this.d.garden.plots.map((p) => lookText(this.g, p.id, this.now, this.speed)),
        ...(d.debug
          ? {
              state: () => this.g,
              act: (a: GardenAct) => this.act(a),
              spot: () => this.spot(),
              // nhảy tới mép nam luống [n] (thử nhanh)
              toi: (n = 1) => {
                const p = d.garden.plots[n - 1];
                d.player.position.set(p.x, d.player.position.y, p.z + 1.2);
                d.player.snapToGround();
              },
            }
          : {}),
      },
    });
  }

  /** Nông trại gắn vào (bảng kho có thêm hàng sản phẩm, nhổ cỏ → cỏ khô — R-NONG-5/7). */
  attachFarm(hooks: FarmHooks): void {
    this.farm = hooks;
  }

  /** Tấm báo vườn (dùng chung cho nông trại). */
  toast(t: Parameters<GardenHud['toast']>[0]): void {
    this.hud.toast(t);
  }

  /** Chữ nổi tại điểm cảnh [at] (nông trại). */
  floatAt(t: Parameters<GardenFloat['show']>[0], at: THREE.Vector3): void {
    const p = this.project(at);
    if (p) this.floats.show(t, p);
  }

  /** Vật bay từ điểm cảnh [at] vào ô Túi đồ (nông trại). */
  flyAt(item: CropId | NongItem, at: THREE.Vector3): void {
    const p = this.project(at);
    if (p) this.floats.fly(item, p, bagPoint());
  }

  /** Vườn mới từ thao tác ngoài vườn (rắc thóc trừ 1 Lúa — R-NONG-2). */
  adopt(g: Garden): void {
    this.g = g;
    this.redraw();
  }

  private project(at: THREE.Vector3): { x: number; y: number } | null {
    const cam = this.camera;
    if (!cam) return null;
    const v = this.v.copy(at).project(cam);
    if (v.z > 1) return null;
    return { x: ((v.x + 1) / 2) * window.innerWidth, y: ((1 - v.y) / 2) * window.innerHeight };
  }

  /** Bảng vườn đang mở → nhân vật đứng yên, không joystick (đặc tả "Vườn rau"). */
  get active(): boolean {
    return this.panel.isOpen;
  }

  /** Chạm cảnh khi bảng mở → đóng bảng; `true` = đã nhận chạm. Bảng đóng: chạm luống → vòng công cụ (V-73). */
  tap(point?: { x: number; z: number } | null): boolean {
    if (!this.panel.isOpen) return this.work.tapAt(point ?? null);
    this.closePanel();
    return true;
  }

  /** Nút quay lại / Esc: đóng bảng; `true` = đã xử lý. */
  back(): boolean {
    return this.panel.isOpen ? this.tap() : this.work.back();
  }

  /** Phím 1…6: ô vòng công cụ / loại hạt trong lưới (V-73); vòng đóng → `false`. */
  key(n: number): boolean {
    return !this.panel.isOpen && this.work.key(n);
  }

  /** Phím E: gần luống (< 1,6 m) → mở vòng công cụ luống đó; không → `false` (E về việc khác). */
  use(): boolean {
    return !this.panel.isOpen && this.work.use();
  }

  /** Chạm cảnh cần dò luống (vòng công cụ): trong vườn, hoặc vườn không rào — chạm luống từ xa tự đi tới (V-82). */
  get picks(): boolean {
    return this.work.picks;
  }

  /** Vườn đang có (sau `load`). */
  get state(): Garden {
    return this.g;
  }

  private get now(): number {
    return Date.now();
  }

  /** Hệ số lớn nhanh chỉ ở ví thử — Flutter kiểm giờ thật. */
  private get speed(): number {
    return this.d.trial ? this.d.speed : 1;
  }

  /**
   * Nạp vườn đã lưu (R-VUON-1). [arrive] = vừa vào Nhà của ta → có luống chín thì tấm báo "Vườn rau: n luống đã chín"
   * (R-VUON-6); nạp lại sau `resume` (Tạp hoá vừa bán hạt) thì không báo lại.
   */
  async load(arrive = true): Promise<void> {
    const t = this.d.trial;
    if (t) this.g = t.wallet.garden;
    else {
      const g = await getGarden();
      this.readOnly = g === null;
      this.g = g ?? freshGarden();
    }
    this.redraw();
    const ripe = ripeCount(this.g, this.now, this.speed);
    if (arrive && ripe > 0) this.hud.toast(ripeToast(ripe));
  }

  /**
   * Mỗi khung (sau `update`): vòng công cụ neo theo luống, nhãn / nút "Bán" ở chỗ đứng khi vòng đóng, hàng dấu luống, ẩn khi
   * bận (R-VUON-2). [busy] theo đặc tả (trang trí, bản đồ, thoại, ngồi, màn Flutter, màn tải).
   */
  frame(camera: THREE.Camera, busy: GardenBusy, dt = 0): void {
    this.camera = camera;
    const free = gardenHudShown(busy) && !this.panel.isOpen;
    if (!gardenHudShown(busy) && this.panel.isOpen) this.closePanel();
    this.busyNow = !gardenHudShown(busy) || this.panel.isOpen;
    this.sound?.setMuted(busy.covered || busy.loading);
    const ring = free ? this.work.ring() : null;
    const i = ring ? this.d.garden.plots.findIndex((p) => p.id === ring.plot) : -1;
    this.ring.render(
      {
        view: ring ? { ...ring, grid: ring.grid ? seedCards(this.g) : null } : null,
        anchor: ring ? this.screenOf(i, 0) : null,
        corners: ring ? this.cornersOf(i, camera) : null,
        unlockPrice: nextOpenPrice(this.g),
        hint: free && !ring && this.work.inFence && dangBanMay(),
      },
      dt,
    );
    const s = free && !ring ? this.spot() : null;
    this.hud.set(s, s ? this.anchorOf(s) : null);
    this.hud.follow(camera);
    const fertLit = ring?.slots.some((x) => x.id === 'phan' && x.lit) ?? false;
    this.hud.marksFollow(camera, this.markList(ring?.plot ?? null, fertLit), !(busy.covered || busy.loading || busy.map));
  }

  /** Mỗi khung: vị trí người chơi (tìm luống gần); mỗi giây vẽ lại dáng nếu đổi. */
  update(dt: number, player: { x: number; z: number }): void {
    this.player = player;
    this.d.garden.crops.tick(dt); // nảy khi luống đổi dáng (cây chum)
    this.work.update(dt, player, this.busyNow, this.ripeIdx);
    this.acc += dt;
    if (this.acc < TICK_S) return;
    this.acc = 0;
    this.redraw();
  }

  private redraw(): void {
    const { garden } = this.d;
    garden.beds.setOpen(this.g.open);
    const now = this.now;
    const shows: (PlotShow | null)[] = garden.plots.map((p) => {
      const st = plotState(this.g, p.id, now, this.speed);
      const crop = plotOf(this.g, p.id).crop;
      return crop && st !== 'hoang' && st !== 'trong' ? { crop, stage: st as CropStage } : null;
    });
    garden.crops.show(shows);
    // đất khô / ẩm, sâu, cỏ (R-VUON-5/10/11 — V-73); sâu / cỏ đang bay khỏi luống giữ ẩn tới khi luật ghi xong
    const doing = this.work.doing;
    const looks = garden.plots.map((p) => plotLook(this.g, p.id, now, this.speed));
    looks.forEach((l, i) => garden.beds.setSoil(i, l.soil));
    garden.pests.show(
      looks.map((l, i) => {
        const hide = doing?.i === i && doing.popped;
        return {
          bug: l.bug && !(hide && doing.work === 'bat'),
          weeds: hide && doing.work === 'nho' ? 0 : l.weeds,
        };
      }),
    );
    // vừa chín lúc đang ở vườn → nảy + "ting" (lần vẽ đầu không tính)
    const first = this.stages.length === 0;
    shows.forEach((s, i) => {
      const was = this.stages[i];
      if (!first && s?.stage === 'chin' && was !== 'chin' && was != null) {
        garden.crops.bounce(i);
        this.sound?.play('ting');
      }
    });
    this.stages = shows.map((s) => s?.stage ?? null);
    this.ripeIdx = shows.flatMap((s, i) => (s?.stage === 'chin' ? [i] : []));
  }

  /** Việc ở chỗ đứng (R-VUON-2, R-VUON-7): vật gần hơn thắng; không gần gì → `null`. */
  spot(): GardenSpot | null {
    const { x, z } = this.player;
    const near = nearestPlot(this.d.garden.plots, x, z);
    const b = this.d.garden.bin;
    return pickSpot(this.g, near, Math.hypot(b.x - x, b.z - z), this.now, this.speed);
  }

  /** Điểm neo: trên luống đang lớn / trên thùng thu mua. */
  private anchorOf(s: GardenSpot): THREE.Vector3 {
    const { garden } = this.d;
    if (s.kind === 'bin') return this.anchor.set(garden.bin.x, garden.beds.topY(0) + BIN_ANCHOR_Y, garden.bin.z);
    const i = garden.plots.findIndex((p) => p.id === s.plot);
    const p = garden.plots[i];
    return this.anchor.set(p.x, garden.beds.topY(i) + PLOT_ANCHOR_Y, p.z);
  }

  /** Điểm màn của tâm mặt luống [i] (+ [up] m); ra sau camera → `null`. */
  private screenOf(i: number, up: number): { x: number; y: number } | null {
    const cam = this.camera;
    const p = this.d.garden.plots[i];
    if (!cam || !p) return null;
    const v = this.v.set(p.x, this.d.garden.beds.topY(i) + up, p.z).project(cam);
    if (v.z > 1) return null;
    return { x: ((v.x + 1) / 2) * window.innerWidth, y: ((1 - v.y) / 2) * window.innerHeight };
  }

  /** 4 góc mặt luống [i] trên màn (viền vàng khi vòng mở). */
  private cornersOf(i: number, camera: THREE.Camera): { x: number; y: number }[] | null {
    const p = this.d.garden.plots[i];
    if (!p) return null;
    const half = this.d.spec.size / 2;
    const y = this.d.garden.beds.topY(i);
    const out: { x: number; y: number }[] = [];
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const v = this.v.set(p.x + dx * half, y, p.z + dz * half).project(camera);
      if (v.z > 1) return null;
      out.push({ x: ((v.x + 1) / 2) * window.innerWidth, y: ((1 - v.y) / 2) * window.innerHeight });
    }
    return out;
  }

  /** Hàng dấu từng luống trong tầm 25 m (≤ 3 — sâu · cỏ · khô; chín một mình; "bón được" ở luống đang mở vòng). */
  private markList(open: string | null, fertLit: boolean): (MarkAt | null)[] {
    const { x, z } = this.player;
    const now = this.now;
    this.d.garden.plots.forEach((p, i) => {
      const dist = Math.hypot(p.x - x, p.z - z);
      if (dist > MARK_RANGE) {
        this.marks[i] = null;
        return;
      }
      const ripe = plotState(this.g, p.id, now, this.speed) === 'chin';
      const badges = plotBadges(plotLook(this.g, p.id, now, this.speed), ripe, fertLit && p.id === open, dist > MARK_FULL);
      this.marks[i] = { x: p.x, y: this.d.garden.beds.topY(i) + MARK_Y, z: p.z, badges };
    });
    return this.marks;
  }

  /* ---------- thao tác từ HUD ---------- */

  private openStore(): void {
    this.d.onOpen();
    this.panel.showStore(storeView(this.g, maNgayVN(this.now)), bagChips(this.g), this.farm?.rows() ?? []);
  }

  private openUnlock(): void {
    const v = unlockView(this.g, this.d.balance());
    if (!v) return;
    this.d.onOpen();
    this.panel.showUnlock(v);
  }

  private closePanel(): void {
    this.panel.close();
  }

  /** Bán một loại / "Bán hết" (R-VUON-7): bảng còn mở, vẽ lại (kho trống / còn lại); xu bay từ thùng. */
  private async sell(crop: CropId | null): Promise<void> {
    const r = await this.act({ act: 'sell', crop });
    // "Bán hết" bán cả sản phẩm nông trại (R-NONG-7)
    const f = crop === null && this.farm ? await this.farm.sell(null) : false;
    if ((r || f) && this.panel.kind === 'kho') this.openStore();
  }

  /** Bán một loại sản phẩm nông trại (R-NONG-7): bảng còn mở, vẽ lại. */
  private async sellFarm(item: NongProduct): Promise<void> {
    const ok = await this.farm?.sell(item);
    if (ok && this.panel.kind === 'kho') this.openStore();
  }

  /** Chỗ thùng thu mua trong cảnh (thử trên Console — `__hocXaNong.toi('thung')`). */
  get binAt(): { x: number; z: number } {
    return this.d.garden.bin;
  }

  /** Điểm màn của thùng thu mua (xu bay khi bán nông trại). */
  get binScreen(): { x: number; y: number } | null {
    return this.binPoint();
  }

  /** "Mở · n" (R-VUON-8): mở ô kế tiếp, tấm báo "Đã mở luống n". */
  private async unlock(): Promise<void> {
    const n = this.g.open + 1;
    const r = await this.act({ act: 'open' });
    this.closePanel();
    if (r?.ok) this.hud.toast(unlockedToast(n));
  }

  /** Điểm màn của thùng thu mua (xu bay khi bán); ra sau camera → không bay. */
  private binPoint(): { x: number; y: number } | null {
    const cam = this.camera;
    if (!cam) return null;
    const b = this.d.garden.bin;
    const p = this.v.set(b.x, this.d.garden.beds.topY(0) + 0.6, b.z).project(cam);
    if (p.z > 1) return null;
    return { x: ((p.x + 1) / 2) * window.innerWidth, y: ((1 - p.y) / 2) * window.innerHeight };
  }

  /** Làm một thao tác: ví thử tự tính; có Flutter → `gardenAct`. Được → vẽ lại + báo ví HUD. */
  async act(a: GardenAct): Promise<GardenResult | null> {
    if (this.busy) return null;
    const t = this.d.trial;
    let r: GardenResult | null;
    let balance = 0;
    if (t) {
      const out = gardenTrialAct(t.wallet, a, this.now, this.speed);
      t.update(() => out.wallet);
      r = out.result;
      balance = out.wallet.coins;
    } else if (this.readOnly) {
      r = { ok: false, reason: 'locked', short: 0 };
    } else {
      this.busy = true;
      const reply = await this.d.bridge.gardenAct(a);
      this.busy = false;
      r = reply;
      balance = reply?.balance ?? 0;
    }
    if (r?.ok) {
      this.g = r.garden;
      this.redraw();
      if (a.act === 'weed') this.farm?.weeded(); // nhổ cỏ → +1 Cỏ khô (R-NONG-5)
      if (r.amount !== 0) this.d.coins(r.amount, this.label(a, r.amount), balance, a.act === 'sell' ? () => this.binPoint() : undefined);
    }
    return r;
  }

  /** Nhãn ví (R-TIEN-5): mở ô / hạt / bán. */
  private label(a: GardenAct, amount: number): string {
    if (a.act === 'open') return openPlotLabel(-amount);
    if (a.act === 'sell') return sellLabel(amount);
    if (a.act !== 'buy') return `${amount}`;
    if ('item' in a) return fertLabel(a.count ?? 1);
    const c = cropOf(a.crop);
    return c ? seedLabel(c, a.count ?? 1) : `${amount}`;
  }
}
