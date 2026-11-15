/**
 * Ghép làm vườn kiểu 摩尔 (V-73, R-VUON-2/3/10…13, R-AM-4): chạm luống → **vòng công cụ** quanh luống (`zones/vuonVong.ts`)
 * → chọn ô → nhân vật **tự đi tới** mép luống (`PlayerController.walkTo`) → **diễn** (`work`, dáng `player/lamVuonDang.ts`)
 * với hạt rơi / tia nước / sâu bay / cỏ bay / lấp lánh (`scene/vuonHat.ts`, `vuonSauCo.ts`, `cayTrong.ts`) + tiếng
 * (`ui/vuonSound.ts`) → diễn xong mới gọi luật (`act` của `homeGarden.ts` → `gardenAct` / ví thử). Mỗi lần một việc.
 *
 * HUD vòng (thiết kế 2026-11-16.4): `ui/gardenRing.ts` vẽ `ring()` mỗi khung, bấm ô → `choose` / `chooseSeed`. Chạm / click
 * luống = mở vòng (chạm bị nuốt — không đi), **E** mở vòng ở luống gần nhất (< 1,6 m), phím **1–6** chọn ô (1 = Tay giữa),
 * lưới hạt mở thì **1–n** chọn loại, **Esc** lưới → vòng → đóng. Ô mờ → viên lý do (`reason`); làm xong → chữ nổi (`float`).
 * Console `__hocXaVuon.vong(n) / chon(k) / dong() / ring() / xem()`.
 */
import type * as THREE from 'three';
import type { Character } from './player/character';
import { hasToolTip } from './player/character';
import type { PlayerController } from './player/controller';
import { WORK_FX, WORK_LEN } from './player/lamVuonDang';
import type { Garden3D } from './scene/vuonLuong';
import type { VuonSound, VuonTieng } from './ui/vuonSound';
import { cropOf, plotOf, type GardenAct, type Garden, type GardenResult } from './zones/vuon';
import { BUG_FLOAT, FERT_FLOAT, harvestFloat, PLOT_RANGE, SOW_FLOAT, WATER_FLOAT, WEED_FLOAT, type FloatText } from './zones/vuonHud';
import { fits, pickSeed, pickSlot, ringView, seedGrid, standSpot, whenChosen, type Pick, type RingView, type SlotId, type ToolId, type WorkKind } from './zones/vuonVong';
import type { CropId } from './zones/vuon';

/** Tiếng theo động tác (R-AM-4). */
const SOUND: Readonly<Record<WorkKind, VuonTieng>> = { gieo: 'rac', tuoi: 'tuoi', bat: 'tach', nho: 'poc', bon: 'phan', thu: 'bup' };
/** Chữ nổi khi làm xong (thu tính riêng — `harvestFloat`). */
const FLOAT: Readonly<Record<Exclude<WorkKind, 'thu'>, FloatText>> = { gieo: SOW_FLOAT, tuoi: WATER_FLOAT, bat: BUG_FLOAT, nho: WEED_FLOAT, bon: FERT_FLOAT };
/** Động tác → ô vòng (kiểm lại việc chờ lúc bắt đầu). */
const TOOL_OF: Readonly<Record<WorkKind, ToolId>> = { gieo: 'hat', tuoi: 'binh', bat: 'sau', nho: 'co', bon: 'phan', thu: 'tay' };
/** Đứng yên mà nhân vật dời quá chừng này (m) khi vòng mở, không phải tự đi / chạm để đi → joystick / phím → đóng vòng. */
const MOVE_CLOSE = 0.15;

export interface GardenWorkDeps {
  garden: Garden3D;
  player: PlayerController;
  character: Character;
  /** rào vườn (đặc tả `garden.fence`): vòng chỉ mở khi đứng trong rào; ra khỏi → đóng (R-VUON-2) */
  fence: { from: { x: number; z: number }; to: { x: number; z: number } };
  /** cạnh luống vuông (m — đặc tả `garden.size`): chạm trong luống = chọn luống */
  plotSize: number;
  sound: VuonSound | null;
  state(): Garden;
  now(): number;
  speed(): number;
  /** chạy luật (Flutter / ví thử) — kết quả được vẽ lại ở `homeGarden.ts` */
  act(a: GardenAct): Promise<GardenResult | null>;
  /** thu xong ở luống [i] → tấm báo "+n {cây} vào kho" (R-VUON-6) + quả bay vào Túi đồ */
  harvested(crop: string, got: number, i: number): void;
  /** chữ nổi trên luống [i] (R-VUON-13) */
  float(t: FloatText, i: number): void;
  /** viên lý do khi chạm ô mờ (R-VUON-2); [slot] = ô vừa chạm (`null` = phím / việc chờ) */
  reason(why: string, slot: SlotId | null): void;
  /** ô "Mở ô" trên vòng luống hoang → hộp xác nhận mở ô (R-VUON-8) */
  unlock(): void;
}

/** Việc: luống, thao tác, động tác, giây đã diễn (hiệu ứng theo mốc `WORK_FX`). */
interface Job {
  plot: string;
  i: number;
  act: GardenAct;
  work: WorkKind;
  t: number;
  phase: 'walk' | 'work';
}

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class GardenWork {
  /** luống đang mở vòng (`null` = đóng) */
  private ringPlot: string | null = null;
  /** lưới hạt đang mở trên vòng */
  private grid = false;
  /** chỗ đứng lúc mở vòng (dời bằng joystick → đóng) */
  private readonly ringFrom = { x: 0, z: 0 };
  private job: Job | null = null;
  /** việc chọn trong lúc đang diễn — diễn xong mới làm (R-VUON-13) */
  private pending: { plot: string; act: GardenAct; work: WorkKind } | null = null;
  private inside = false;
  private readonly tip: THREE.Vector3;
  private readonly dir: THREE.Vector3;

  constructor(private readonly d: GardenWorkDeps) {
    const v = d.player.position.clone();
    this.tip = v.clone();
    this.dir = v.clone();
    d.garden.crops.reduced = reducedMotion();
  }

  /** Đứng trong rào vườn — chạm cảnh mới cần dò luống. */
  get inFence(): boolean {
    return this.inside;
  }

  /** Vòng đang mở (HUD `gardenRing.ts` + Console); `null` = đóng. */
  ring(): (RingView & { grid: ReturnType<typeof seedGrid> | null }) | null {
    const id = this.ringPlot;
    if (!id) return null;
    const g = this.d.state();
    return { ...ringView(g, id, this.d.now(), this.d.speed()), grid: this.grid ? seedGrid(g) : null };
  }

  /** Đang đi tới / diễn ở luống [i] (homeGarden giữ sâu / cỏ đã bay khỏi luống tới khi luật ghi xong). */
  get doing(): { i: number; work: WorkKind; popped: boolean } | null {
    const j = this.job;
    if (!j) return null;
    const at = WORK_FX[j.work].at[0] ?? 0;
    return { i: j.i, work: j.work, popped: j.phase === 'work' && j.t >= at };
  }

  /** Mở vòng ở luống [id] (chạm / click / E). Ngoài rào → `false`. */
  openRing(id: string): boolean {
    if (!this.inside || !this.d.garden.plots.some((p) => p.id === id)) return false;
    this.ringPlot = id;
    this.grid = false;
    const pos = this.d.player.position;
    this.ringFrom.x = pos.x;
    this.ringFrom.z = pos.z;
    return true;
  }

  /** Đóng vòng (+ lưới hạt). `true` = vòng đang mở. */
  closeRing(): boolean {
    if (!this.ringPlot) return false;
    this.ringPlot = null;
    this.grid = false;
    return true;
  }

  /** Phím 1…n: lưới hạt mở → loại thứ n; vòng mở → ô thứ n (1 = Tay giữa). Không có vòng → `false`. */
  key(n: number): boolean {
    const id = this.ringPlot;
    if (!id) return false;
    const g = this.d.state();
    const now = this.d.now();
    const speed = this.d.speed();
    if (this.grid) {
      const s = seedGrid(g)[n - 1];
      if (s) this.apply(pickSeed(g, id, s.crop, now, speed), 'hat');
      return true;
    }
    const slot = ringView(g, id, now, speed).slots.find((s) => s.key === n);
    if (slot) this.apply(pickSlot(g, id, slot.id, now, speed), slot.id);
    return true;
  }

  /** Bấm ô [slot] trên vòng (HUD). */
  choose(slot: SlotId): void {
    const id = this.ringPlot;
    if (id) this.apply(pickSlot(this.d.state(), id, slot, this.d.now(), this.d.speed()), slot);
  }

  /** Bấm loại [crop] trong lưới hạt (HUD). */
  chooseSeed(crop: CropId): void {
    const id = this.ringPlot;
    if (id && this.grid) this.apply(pickSeed(this.d.state(), id, crop, this.d.now(), this.d.speed()), 'hat');
  }

  /** Esc: lưới hạt → về vòng; vòng → đóng. `true` = đã xử lý. */
  back(): boolean {
    if (this.grid) {
      this.grid = false;
      return true;
    }
    return this.closeRing();
  }

  /** E: mở vòng ở luống gần nhất trong 1,6 m. Không gần → `false` (E về việc khác). */
  use(): boolean {
    const near = this.nearest(PLOT_RANGE);
    return near ? this.openRing(near) : false;
  }

  /**
   * Chạm / click điểm sân [p]: trúng luống → mở vòng luống đó (chạm bị nuốt — không đi); chỗ khác khi vòng mở → đóng vòng
   * (cũng nuốt chạm); vòng đóng → `false` (đi như thường).
   */
  tapAt(p: { x: number; z: number } | null): boolean {
    const half = this.d.plotSize / 2 + 0.25;
    const hit = p && this.d.garden.plots.find((q) => Math.abs(q.x - p.x) <= half && Math.abs(q.z - p.z) <= half);
    if (hit) return this.openRing(hit.id);
    return this.closeRing();
  }

  /**
   * Mỗi khung: rào (ra → đóng vòng, bỏ việc đang đi tới), bận (trang trí / bản đồ / thoại / màn che → như trên), joystick khi
   * vòng mở → đóng, hiệu ứng theo giây động tác, tick sâu / bể hạt, lấp lánh vàng quanh cây chín.
   */
  update(dt: number, pos: { x: number; z: number }, busy: boolean, ripe: readonly number[]): void {
    const f = this.d.fence;
    this.inside = pos.x > Math.min(f.from.x, f.to.x) && pos.x < Math.max(f.from.x, f.to.x) && pos.z > Math.min(f.from.z, f.to.z) && pos.z < Math.max(f.from.z, f.to.z);
    if (!this.inside || busy) {
      this.closeRing();
      this.pending = null;
      if (this.job?.phase === 'walk') this.stop();
    } else if (this.ringPlot && !this.job && !this.d.player.moveTarget && Math.hypot(pos.x - this.ringFrom.x, pos.z - this.ringFrom.z) > MOVE_CLOSE) {
      this.closeRing(); // kéo joystick / phím đi (chạm để đi có `moveTarget` — vòng giữ)
    } else if (this.ringPlot && this.d.player.moveTarget) {
      this.ringFrom.x = pos.x;
      this.ringFrom.z = pos.z;
    }
    this.d.player.state.hold = this.job?.work;
    const j = this.job;
    if (j?.phase === 'work') {
      const t0 = j.t;
      j.t += dt;
      this.fx(j, t0, j.t, dt);
    }
    const { garden } = this.d;
    garden.pests.tick(dt);
    garden.hats.glow(
      ripe.map((i) => ({ x: garden.plots[i].x, y: garden.beds.topY(i) + 0.5, z: garden.plots[i].z })),
      dt,
    );
    garden.hats.tick(dt);
  }

  /* ---------- chọn ô ---------- */

  private apply(p: Pick, slot: SlotId | null): void {
    if (p.kind === 'no') return this.d.reason(p.why, slot);
    if (p.kind === 'grid') {
      this.grid = true;
      return;
    }
    this.closeRing();
    if (p.kind === 'open') return this.d.unlock();
    const job = { plot: p.plot, act: p.act, work: p.work };
    const when = whenChosen(this.job?.phase ?? null);
    if (when === 'cho') {
      this.pending = job;
      return;
    }
    if (when === 'doi') this.stop();
    this.start(job);
  }

  /** Bắt đầu đi tới luống. */
  private start(r: { plot: string; act: GardenAct; work: WorkKind }): void {
    const i = this.d.garden.plots.findIndex((p) => p.id === r.plot);
    const job: Job = { ...r, i, t: 0, phase: 'walk' };
    this.job = job;
    const at = standSpot(this.d.garden.plots[i], this.d.player.position);
    const ok = this.d.player.walkTo(at.x, at.z, at.faceX, at.faceZ, () => this.begin(job), () => this.cancel(job));
    if (!ok) this.stop();
  }

  /** Tới mép luống: diễn [WORK_LEN] giây; joystick trong lúc diễn → làm nốt, bỏ việc chờ. */
  private begin(job: Job): void {
    job.phase = 'work';
    job.t = 0;
    const ok = this.d.player.work(job.work, WORK_LEN[job.work], () => void this.finish(job), () => (this.pending = null));
    if (!ok) this.stop();
  }

  /** Diễn xong: ghi luật (giờ gieo = lúc này — R-VUON-3/13), hiệu ứng kết quả, rồi việc chờ (kiểm lại). */
  private async finish(job: Job): Promise<void> {
    const before = this.d.state();
    const crop = cropOf(plotOf(before, job.plot).crop);
    const r = await this.d.act(job.act);
    if (this.job === job) this.job = null;
    const { garden } = this.d;
    if (r?.ok) {
      const top = garden.beds.topY(job.i);
      const p = garden.plots[job.i];
      if (job.work === 'thu' && crop) {
        const pos = this.d.player.position;
        garden.crops.flyHarvest(job.i, { x: pos.x, y: pos.y + 2.4, z: pos.z });
        garden.hats.emit('gold', { x: p.x, y: top + 0.4, z: p.z }, { count: 8, radius: 0.5 });
        this.d.float(harvestFloat(before, job.plot, crop, r.got), job.i);
        this.d.harvested(crop.id, r.got, job.i);
      } else if (job.work !== 'thu') {
        if (job.work === 'bon') {
          garden.hats.emit('sparkle', { x: p.x, y: top + 0.2, z: p.z }, { radius: 0.5 });
          garden.crops.bounce(job.i);
        }
        this.d.float(FLOAT[job.work], job.i);
      }
    } else if (r) this.d.reason(`Không làm được (${r.reason})`, null);
    const next = this.pending;
    this.pending = null;
    if (!next || this.job) return;
    const a = next.act;
    const f = fits(this.d.state(), next.plot, TOOL_OF[next.work], this.d.now(), this.d.speed(), a.act === 'sow' ? a.crop : undefined);
    if (f.ok) this.start({ plot: next.plot, act: f.act, work: f.work });
    else this.d.reason(f.why, null);
  }

  /** Tự đi bị huỷ (joystick / chạm đi chỗ khác / kẹt): bỏ việc. */
  private cancel(job: Job): void {
    if (this.job === job) this.job = null;
  }

  private stop(): void {
    this.d.player.cancelAuto();
    this.job = null;
  }

  /** Hiệu ứng ở các mốc của động tác (theo `WORK_FX`) trong khoảng (t0, t1]. */
  private fx(j: Job, t0: number, t1: number, dt: number): void {
    const { garden, character, player } = this.d;
    const p = garden.plots[j.i];
    const top = garden.beds.topY(j.i);
    const at = (s: number): boolean => t0 < s && t1 >= s;
    const pos = player.position;
    const dx = p.x - pos.x;
    const dz = p.z - pos.z;
    const len = Math.hypot(dx, dz) || 1;
    const hand = { x: pos.x + (dx / len) * 0.55, y: top + 0.75, z: pos.z + (dz / len) * 0.55 };
    const down = { x: dx / len, y: -0.3, z: dz / len };
    const fx = WORK_FX[j.work];
    fx.at.forEach((s, k) => {
      if (!at(s)) return;
      if (k === 0) this.d.sound?.play(SOUND[j.work]);
      if (j.work === 'gieo') garden.hats.emit('seed', hand, { floor: top, dir: down });
      if (j.work === 'bon') garden.hats.emit('fert', hand, { floor: top, dir: down });
      if (j.work === 'bat') garden.pests.pop(j.i, 'bug');
      if (j.work === 'nho') {
        garden.pests.pop(j.i, 'weed');
        garden.hats.emit('dust', { x: p.x, y: top + 0.05, z: p.z }, { floor: top - 0.05 });
      }
    });
    if (j.work === 'tuoi' && fx.until && t1 > fx.at[0] && t0 < fx.until) {
      if (hasToolTip(character) && character.toolTip(this.tip, this.dir)) garden.hats.stream(this.tip, this.dir, dt, top);
      else garden.hats.stream(hand, down, dt, top);
    }
  }

  private nearest(range: number): string | null {
    const pos = this.d.player.position;
    let best: { id: string; d: number } | null = null;
    for (const p of this.d.garden.plots) {
      const dist = Math.hypot(p.x - pos.x, p.z - pos.z);
      if (dist < range && (!best || dist < best.d)) best = { id: p.id, d: dist };
    }
    return best?.id ?? null;
  }
}
