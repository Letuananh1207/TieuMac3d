/**
 * Ghép vườn rau Nhà của ta (R-VUON-1…9): nạp vườn (`getGarden`; không có Flutter → ví thử, R-TIEN-7), vẽ dáng cây theo giờ
 * thật (`zones/vuon.ts` + `Date.now()`; ví thử có `?vuon=<hệ số>` lớn nhanh), đổi luống hoang khi mở ô, tìm luống / thùng
 * gần nhất (R-VUON-2/7), làm thao tác (`gardenAct` hoặc ví thử) rồi báo ví HUD. File gốc như `homeDecor.ts` — `main.ts` chỉ
 * tạo khi cảnh có `garden`.
 *
 * **HUD vườn chờ thiết kế** (phiếu `docs/phieu_thiet_ke/2026-11-15-vuon-trong-trot.md`): chưa có nút nổi. Tạm thời chỉ ở
 * chế độ gỡ lỗi `?debug`: phím **G** = thao tác ở luống gần nhất (Gieo hạt đầu tiên trong túi / Tưới / Thu / Mở ô), phím
 * **B** = "Bán hết" khi đứng cạnh thùng thu mua; `window.__hocXaVuon` để thử trong Console. Không có gì hiện trên màn.
 */
import type { TrialStore } from './bridge/browserStore';
import { getGarden, type FlutterBridge } from './bridge/flutterBridge';
import type { CropStage, PlotShow } from './scene/cayTrong';
import type { Garden3D } from './scene/vuonLuong';
import {
  BIN_RANGE,
  canWater,
  CROPS,
  cropOf,
  freshGarden,
  nearestPlot,
  openPlotLabel,
  plotButton,
  plotOf,
  plotState,
  remainingMs,
  remainingText,
  ripeCount,
  sellLabel,
  type Garden,
  type GardenAct,
  type GardenResult,
  type PlotButton,
} from './zones/vuon';
import { gardenTrialAct } from './zones/walletRules';

/** Kiểm đổi dáng mỗi chừng này (s) — cây lớn theo phút, không cần mỗi khung. */
const TICK_S = 1;

export interface HomeGardenDeps {
  garden: Garden3D;
  bridge: FlutterBridge;
  /** ví thử (không có Flutter — R-TIEN-7) */
  trial: TrialStore | null;
  /** hệ số lớn nhanh `?vuon=` (chỉ ví thử) */
  speed: number;
  /** ví HUD: tiền vừa đổi ([amount] âm = trừ) + nhãn (R-TIEN-5); [balance] = số dư mới */
  coins(amount: number, label: string, balance: number): void;
  /** `?debug`: bật phím thử G / B */
  debug: boolean;
}

/** Việc ở chỗ đứng (cho nút nổi khi có thiết kế — R-VUON-2): nút ở luống, nhãn thời gian, hay nút "Bán" ở thùng. */
export type GardenSpot =
  | { kind: 'plot'; plot: string; button: PlotButton | null; label: string | null; dist: number }
  | { kind: 'bin'; dist: number };

export class HomeGarden {
  private g: Garden = freshGarden();
  /** Flutter có mặt mà không trả vườn (bản cũ / lỗi) → chỉ xem (bridge.md `getGarden`) */
  private readOnly = false;
  private acc = TICK_S;
  private busy = false;
  private player = { x: 0, z: 0 };

  constructor(private readonly d: HomeGardenDeps) {
    if (d.debug) {
      window.addEventListener('keydown', (e) => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'g' || e.key === 'G') void this.debugPlot();
        else if (e.key === 'b' || e.key === 'B') void this.debugSell();
      });
      Object.assign(window, { __hocXaVuon: { state: () => this.g, act: (a: GardenAct) => this.act(a), spot: () => this.spot() } });
    }
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

  /** Nạp vườn đã lưu (R-VUON-1); báo Console số luống chín (tấm báo chờ thiết kế — R-VUON-6). */
  async load(): Promise<void> {
    const t = this.d.trial;
    if (t) this.g = t.wallet.garden;
    else {
      const g = await getGarden();
      this.readOnly = g === null;
      this.g = g ?? freshGarden();
    }
    this.redraw();
    const ripe = ripeCount(this.g, this.now, this.speed);
    if (ripe > 0) console.info(`Vườn rau: ${ripe} luống đã chín`);
  }

  /** Mỗi khung: vị trí người chơi (tìm luống gần); mỗi giây vẽ lại dáng nếu đổi. */
  update(dt: number, player: { x: number; z: number }): void {
    this.player = player;
    this.d.garden.crops.tick(dt); // nảy khi luống đổi dáng (cây chum)
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
  }

  /** Việc ở chỗ đứng (R-VUON-2, R-VUON-7): vật gần hơn thắng; không gần gì → `null`. */
  spot(): GardenSpot | null {
    const { x, z } = this.player;
    const near = nearestPlot(this.d.garden.plots, x, z);
    const b = this.d.garden.bin;
    const binDist = Math.hypot(b.x - x, b.z - z);
    if (binDist < BIN_RANGE && (!near || binDist < near.dist)) return { kind: 'bin', dist: binDist };
    if (!near) return null;
    const now = this.now;
    const st = plotState(this.g, near.id, now, this.speed);
    const p = plotOf(this.g, near.id);
    const button = plotButton(st, canWater(p, now, this.speed));
    const c = cropOf(p.crop);
    const label = !button && c ? `${c.name} · ${remainingText(remainingMs(p, now, this.speed))}` : null;
    return { kind: 'plot', plot: near.id, button, label, dist: near.dist };
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
      if (r.amount !== 0) this.d.coins(r.amount, this.label(a, r.amount), balance);
    }
    return r;
  }

  /** Nhãn ví (R-TIEN-5): mở ô / hạt / bán. */
  private label(a: GardenAct, amount: number): string {
    if (a.act === 'open') return openPlotLabel(-amount);
    if (a.act === 'sell') return sellLabel(amount);
    const c = a.act === 'buy' ? cropOf(a.crop) : undefined;
    return c ? `−${c.seed} · Hạt ${c.name}` : `${amount}`;
  }

  /* ---------- tạm: phím thử khi `?debug` (HUD chờ thiết kế) ---------- */

  private async debugPlot(): Promise<void> {
    const s = this.spot();
    if (!s || s.kind !== 'plot') return console.info('Vườn rau (thử): không đứng cạnh luống nào');
    if (!s.button) return console.info(`Vườn rau (thử): ${s.plot} — ${s.label ?? ''}`);
    const seed = CROPS.find((c) => (this.g.seeds[c.id] ?? 0) > 0);
    const a: GardenAct | null =
      s.button === 'gieo'
        ? seed
          ? { act: 'sow', plot: s.plot, crop: seed.id }
          : null
        : s.button === 'tuoi'
          ? { act: 'water', plot: s.plot }
          : s.button === 'thu'
            ? { act: 'harvest', plot: s.plot }
            : { act: 'open' };
    if (!a) return console.info('Vườn rau (thử): Túi hạt trống — mua hạt ở Tạp hoá trấn');
    console.info(`Vườn rau (thử): ${s.plot} ${s.button} →`, await this.act(a));
  }

  private async debugSell(): Promise<void> {
    if (this.spot()?.kind !== 'bin') return console.info('Vườn rau (thử): đứng cạnh thùng thu mua để bán');
    console.info('Vườn rau (thử): Bán hết →', await this.act({ act: 'sell', crop: null }));
  }
}
