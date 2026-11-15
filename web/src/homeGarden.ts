/**
 * Ghép vườn rau Nhà của ta (R-VUON-1…9): nạp vườn (`getGarden`; không có Flutter → ví thử, R-TIEN-7), vẽ dáng cây theo giờ
 * thật (`zones/vuon.ts` + `Date.now()`; ví thử có `?vuon=<hệ số>` lớn nhanh), đổi luống hoang khi mở ô, tìm luống / thùng
 * gần nhất (R-VUON-2/7), làm thao tác (`gardenAct` hoặc ví thử) rồi báo ví HUD. File gốc như `homeDecor.ts` — `main.ts` chỉ
 * tạo khi cảnh có `garden`.
 *
 * HUD (thiết kế 2026-11-15.29): nút nổi luống / thùng + nhãn đang lớn + dấu luống + tấm báo (`ui/gardenHud.ts`), bảng chọn
 * hạt / kho / mở ô (`ui/gardenPanel.ts`), chữ + số ở `zones/vuonHud.ts`. Bảng mở → nhân vật đứng yên (`active`). Chế độ gỡ
 * lỗi `?debug` vẫn có `window.__hocXaVuon` (state / act / spot) để thử trong Console.
 */
import * as THREE from 'three';
import type { TrialStore } from './bridge/browserStore';
import { getGarden, type FlutterBridge } from './bridge/flutterBridge';
import { GardenWork } from './gardenWork';
import type { Character } from './player/character';
import type { PlayerController } from './player/controller';
import type { CropStage, PlotShow } from './scene/cayTrong';
import type { Garden3D } from './scene/vuonLuong';
import { GardenHud, type MarkAt } from './ui/gardenHud';
import { GardenPanel } from './ui/gardenPanel';
import { VuonSound } from './ui/vuonSound';
import { maNgayVN } from './zones/gioVN';
import {
  cropOf,
  freshGarden,
  nextOpenPrice,
  plotIndex,
  plotOf,
  plotState,
  ripeCount,
  type CropId,
  type Garden,
  type GardenAct,
  type GardenResult,
} from './zones/vuon';
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
  pickSeedSub,
  pickSpot,
  plotMark,
  ripeToast,
  seedCards,
  storeView,
  unlockedToast,
  unlockView,
  type GardenBusy,
  type GardenSpot,
} from './zones/vuonHud';
import { fertLabel } from './zones/vuonCham';
import type { Holding } from './zones/vuonThanh';
import { gardenTrialAct } from './zones/walletRules';

/** Nút nổi trên mép xa luống (m trên mặt luống / ra mép) và trên thùng thu mua. */
const PLOT_ANCHOR_Y = 0.55;
const PLOT_ANCHOR_OUT = 0.8;
const BIN_ANCHOR_Y = 1.3;
/** Dấu luống (giọt / lấp lánh) nổi trên mặt luống (m). */
const MARK_Y = 0.5;

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
  /** rào vườn + cạnh luống (đặc tả `garden.fence`, `garden.size`) */
  fence: { from: { x: number; z: number }; to: { x: number; z: number } };
  plotSize: number;
}

export class HomeGarden {
  private g: Garden = freshGarden();
  /** Flutter có mặt mà không trả vườn (bản cũ / lỗi) → chỉ xem (bridge.md `getGarden`) */
  private readOnly = false;
  private acc = TICK_S;
  private busy = false;
  private player = { x: 0, z: 0 };
  private readonly hud: GardenHud;
  private readonly panel: GardenPanel;
  /** việc ở chỗ đứng (khung trước) — nút nổi bấm thì làm việc này */
  private here: GardenSpot | null = null;
  /** luống đang mở bảng chọn hạt */
  private sowPlot: string | null = null;
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
    this.hud = new GardenHud(d.garden.plots.length, () => void this.press());
    this.panel = new GardenPanel({
      sow: (crop) => void this.sow(crop),
      sell: (crop) => void this.sell(crop),
      unlock: () => void this.unlock(),
      close: () => this.closePanel(),
    });
    this.marks = d.garden.plots.map(() => null);
    this.sound = typeof window.AudioContext === 'function' ? new VuonSound() : null;
    this.work = new GardenWork({
      garden: d.garden,
      player: d.player,
      character: d.character,
      fence: d.fence,
      plotSize: d.plotSize,
      sound: this.sound,
      state: () => this.g,
      now: () => this.now,
      speed: () => this.speed,
      act: (a) => this.act(a),
      harvested: (crop, got) => {
        const c = cropOf(crop);
        if (c) this.hud.toast(harvestToast(c, got)); // R-VUON-6
      },
    });
    // thử làm vườn khi chưa có HUD (V-73): luôn có trong Console; `?debug` thêm state / act / spot như cũ
    const w = this.work;
    Object.assign(window, {
      __hocXaVuon: {
        cam: (n: number) => w.key(n),
        dung: () => w.use(),
        bo: () => w.drop(),
        luot: (ids: string[]) => w.sweep(ids),
        thanh: () => w.slots(),
        xem: () => this.d.garden.plots.map((p) => lookText(this.g, p.id, this.now, this.speed)),
        ...(d.debug ? { state: () => this.g, act: (a: GardenAct) => this.act(a), spot: () => this.spot() } : {}),
      },
    });
  }

  /** Bảng vườn đang mở → nhân vật đứng yên, không joystick (đặc tả "Vườn rau"). */
  get active(): boolean {
    return this.panel.isOpen;
  }

  /** Chạm cảnh khi bảng mở → đóng bảng; `true` = đã nhận chạm. */
  tap(point?: { x: number; z: number } | null): boolean {
    if (!this.panel.isOpen) return this.work.tapAt(point ?? null);
    this.closePanel();
    return true;
  }

  /** Nút quay lại / Esc: đóng bảng; `true` = đã xử lý. */
  back(): boolean {
    return this.panel.isOpen ? this.tap() : this.work.drop();
  }

  /** Phím 1…6 (cầm nông cụ, V-73); ngoài rào → `false`. */
  key(n: number): boolean {
    return !this.panel.isOpen && this.work.key(n);
  }

  /** Phím E (nút "Dùng"): đang cầm + gần luống → làm; không → `false` (E về việc khác). */
  use(): boolean {
    return !this.panel.isOpen && this.work.use();
  }

  /** Đang cầm nông cụ (thanh nông cụ — HUD chờ thiết kế). */
  get holding(): Holding | null {
    return this.work.holding;
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
   * Mỗi khung (sau `update`): nút nổi / nhãn ở chỗ đứng, dấu luống trong cảnh, ẩn khi bận (R-VUON-2). Bảng mở → không
   * nút. [busy] theo đặc tả (trang trí, bản đồ, thoại, ngồi, màn Flutter, màn tải).
   */
  frame(camera: THREE.Camera, busy: GardenBusy): void {
    this.camera = camera;
    const free = gardenHudShown(busy) && !this.panel.isOpen;
    if (!gardenHudShown(busy) && this.panel.isOpen) this.closePanel();
    this.busyNow = !gardenHudShown(busy) || this.panel.isOpen;
    this.sound?.setMuted(busy.covered || busy.loading);
    // đang cầm nông cụ → nút nổi cũ ẩn, E / chạm làm bằng công cụ (R-VUON-2 mới); vẫn giữ "Mở ô" / "Bán"
    const s0 = free ? this.spot() : null;
    const s = this.work.holding && s0?.kind !== 'bin' && !(s0?.kind === 'plot' && s0.button === 'mo-o') ? null : s0;
    this.here = s;
    this.hud.set(s, s ? this.anchorOf(s, camera) : null, nextOpenPrice(this.g));
    this.hud.follow(camera);
    this.hud.marksFollow(camera, this.markList(), !(busy.covered || busy.loading || busy.map));
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

  /** Điểm neo nút: trên mép xa của luống (phía xa camera) / trên thùng thu mua. */
  private anchorOf(s: GardenSpot, camera: THREE.Camera): THREE.Vector3 {
    const top = this.d.garden.beds.topY(0);
    if (s.kind === 'bin') return this.anchor.set(this.d.garden.bin.x, top + BIN_ANCHOR_Y, this.d.garden.bin.z);
    const i = plotIndex(s.plot) - 1;
    const p = this.d.garden.plots[i];
    const dx = p.x - camera.position.x;
    const dz = p.z - camera.position.z;
    const len = Math.hypot(dx, dz) || 1;
    return this.anchor.set(p.x + (dx / len) * PLOT_ANCHOR_OUT, this.d.garden.beds.topY(i) + PLOT_ANCHOR_Y, p.z + (dz / len) * PLOT_ANCHOR_OUT);
  }

  /** Dấu từng luống (giọt nước / lấp lánh) trong tầm 25 m. */
  private markList(): (MarkAt | null)[] {
    const { x, z } = this.player;
    const now = this.now;
    this.d.garden.plots.forEach((p, i) => {
      const far = Math.hypot(p.x - x, p.z - z) > MARK_RANGE;
      const mark = far ? null : plotMark(this.g, p.id, now, this.speed);
      this.marks[i] = mark ? { x: p.x, y: this.d.garden.beds.topY(i) + MARK_Y, z: p.z, mark } : null;
    });
    return this.marks;
  }

  /* ---------- thao tác từ HUD ---------- */

  /** Bấm nút nổi: Gieo → bảng hạt · Tưới / Thu → làm ngay · Mở ô → hộp xác nhận · Bán → bảng kho. */
  private async press(): Promise<void> {
    const s = this.here;
    if (!s || s.kind === 'grow') return;
    if (s.kind === 'bin') return this.openStore();
    if (s.button === 'gieo') {
      this.sowPlot = s.plot;
      this.d.onOpen();
      this.panel.showSeeds(pickSeedSub(s.plot), seedCards(this.g));
    } else if (s.button === 'tuoi') await this.act({ act: 'water', plot: s.plot });
    else if (s.button === 'thu') {
      const crop = cropOf(plotOf(this.g, s.plot).crop);
      const r = await this.act({ act: 'harvest', plot: s.plot });
      if (r?.ok && crop) this.hud.toast(harvestToast(crop, r.got)); // R-VUON-6
    } else this.openUnlock();
  }

  private openStore(): void {
    this.d.onOpen();
    this.panel.showStore(storeView(this.g, maNgayVN(this.now)), bagChips(this.g));
  }

  private openUnlock(): void {
    const v = unlockView(this.g, this.d.balance());
    if (!v) return;
    this.d.onOpen();
    this.panel.showUnlock(v);
  }

  private closePanel(): void {
    this.sowPlot = null;
    this.panel.close();
  }

  /** Chạm thẻ hạt → gieo ngay 1 hạt, bảng đóng (R-VUON-3). */
  private async sow(crop: CropId): Promise<void> {
    const plot = this.sowPlot;
    this.closePanel();
    if (plot) await this.act({ act: 'sow', plot, crop });
  }

  /** Bán một loại / "Bán hết" (R-VUON-7): bảng còn mở, vẽ lại (kho trống / còn lại); xu bay từ thùng. */
  private async sell(crop: CropId | null): Promise<void> {
    const r = await this.act({ act: 'sell', crop });
    if (r && this.panel.kind === 'kho') this.openStore();
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
