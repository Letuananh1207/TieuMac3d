/**
 * Ghép làm vườn kiểu 摩尔 (V-73, R-VUON-2/3/10…13, R-AM-4): cầm nông cụ, chạm / lướt luống → hàng đợi → nhân vật **tự đi
 * tới** mép luống (`PlayerController.walkTo`) → **diễn** (`work`, dáng `player/lamVuonDang.ts`) với hạt rơi / tia nước / sâu bay /
 * cỏ bay / lấp lánh (`scene/vuonHat.ts`, `vuonSauCo.ts`, `cayTrong.ts`) + tiếng (`ui/vuonSound.ts`) → diễn xong mới gọi luật
 * (`act` của `homeGarden.ts` → `gardenAct` / ví thử). Luật thanh nông cụ thuần ở `zones/vuonThanh.ts`.
 *
 * **Tạm khi chưa có HUD** (phiếu `docs/phieu_thiet_ke/2026-11-15-vuon-mole.md`): phím **1–6** chọn ô (bấm 3 lần nữa = đổi
 * loại hạt), **E** dùng lên luống gần nhất (< 1,6 m), **Esc** bỏ cầm, click / chạm luống khi đang cầm = làm luống đó; Console
 * `__hocXaVuon.cam(n) / dung() / luot([...]) / thanh() / xem()`. Chữ nổi in Console (`console.info`) tới khi có thiết kế.
 */
import type * as THREE from 'three';
import type { Character } from './player/character';
import { hasToolTip } from './player/character';
import type { PlayerController } from './player/controller';
import { WORK_FX, WORK_LEN } from './player/lamVuonDang';
import type { Garden3D } from './scene/vuonLuong';
import type { VuonSound, VuonTieng } from './ui/vuonSound';
import { cropOf, plotOf, type Garden, type GardenAct, type GardenResult } from './zones/vuon';
import { BUG_FLOAT, FERT_FLOAT, harvestFloat, PLOT_RANGE, SOW_FLOAT, WATER_FLOAT, WEED_FLOAT, type FloatText } from './zones/vuonHud';
import {
  fits,
  holdAfter,
  nextSeed,
  queueAdd,
  queueNext,
  standSpot,
  TOOLS,
  toolOf,
  toolSlots,
  type Holding,
  type WorkKind,
} from './zones/vuonThanh';

/** Tiếng theo động tác (R-AM-4). */
const SOUND: Readonly<Record<WorkKind, VuonTieng>> = { gieo: 'rac', tuoi: 'tuoi', bat: 'tach', nho: 'poc', bon: 'phan', thu: 'bup' };
/** Chữ nổi khi làm xong (thu tính riêng — `harvestFloat`). */
const FLOAT: Readonly<Record<Exclude<WorkKind, 'thu'>, FloatText>> = { gieo: SOW_FLOAT, tuoi: WATER_FLOAT, bat: BUG_FLOAT, nho: WEED_FLOAT, bon: FERT_FLOAT };

export interface GardenWorkDeps {
  garden: Garden3D;
  player: PlayerController;
  character: Character;
  /** rào vườn (đặc tả `garden.fence`): ra khỏi → ẩn thanh, bỏ cầm (R-VUON-2) */
  fence: { from: { x: number; z: number }; to: { x: number; z: number } };
  /** cạnh luống vuông (m — đặc tả `garden.size`): chạm trong luống = chọn luống */
  plotSize: number;
  sound: VuonSound | null;
  state(): Garden;
  now(): number;
  speed(): number;
  /** chạy luật (Flutter / ví thử) — kết quả được vẽ lại ở `homeGarden.ts` */
  act(a: GardenAct): Promise<GardenResult | null>;
  /** thu xong → tấm báo đã thiết kế "+n {cây} vào kho" (R-VUON-6) */
  harvested(crop: string, got: number): void;
}

/** Việc đang làm: luống, thao tác, động tác, giây đã diễn (hiệu ứng theo mốc `WORK_FX`). */
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
  private hold: Holding | null = null;
  private queue: string[] = [];
  private job: Job | null = null;
  private inside = false;
  private readonly tip: THREE.Vector3;
  private readonly dir: THREE.Vector3;

  constructor(private readonly d: GardenWorkDeps) {
    const v = d.player.position.clone();
    this.tip = v.clone();
    this.dir = v.clone();
    d.garden.crops.reduced = reducedMotion();
  }

  /** Đang cầm gì (`null` = đi lại thường — nút nổi cũ của vườn hiện như trước). */
  get holding(): Holding | null {
    return this.hold;
  }

  /** Đang đi tới / diễn ở luống [i] (homeGarden giữ sâu / cỏ đã bay khỏi luống tới khi luật ghi xong). */
  get doing(): { i: number; work: WorkKind; popped: boolean } | null {
    const j = this.job;
    if (!j) return null;
    const at = WORK_FX[j.work].at[0] ?? 0;
    return { i: j.i, work: j.work, popped: j.phase === 'work' && j.t >= at };
  }

  /** Thanh 6 ô (cho Console / HUD sau thiết kế). */
  slots(): ReturnType<typeof toolSlots> {
    return toolSlots(this.d.state(), this.hold, this.d.now(), this.d.speed());
  }

  /** Phím 1…6 (R-VUON-2, máy tính): chọn ô; bấm lại ô Hạt giống → loại hạt kế; ngoài rào → `false` (phím về việc khác). */
  key(n: number): boolean {
    if (!this.inside || n < 1 || n > TOOLS.length) return false;
    const tool = TOOLS[n - 1].id;
    const g = this.d.state();
    if (tool === 'hat') {
      const crop = nextSeed(g, this.hold?.tool === 'hat' ? this.hold.crop : undefined);
      this.hold = { tool, crop };
      this.say(crop ? `Cầm hạt ${cropOf(crop)?.name}` : 'Túi hạt trống — mua hạt ở Tạp hoá trấn');
      if (!crop) this.hold = null;
    } else {
      this.hold = { tool };
      this.say(`Cầm ${toolOf(tool).name}${tool === 'phan' ? ` × ${g.fert}` : ''}`);
    }
    return true;
  }

  /** Esc: bỏ cầm + bỏ hàng đợi (động tác đang diễn làm nốt). `true` = đã xử lý. */
  drop(): boolean {
    if (!this.hold) return false;
    this.hold = null;
    this.queue = [];
    if (this.job?.phase === 'walk') this.stop();
    this.say('Bỏ cầm');
    return true;
  }

  /** E (nút "Dùng"): luống gần nhất trong 1,6 m. Không cầm / không gần → `false`. */
  use(): boolean {
    if (!this.hold) return false;
    const near = this.nearest(PLOT_RANGE);
    if (!near) return false;
    this.sweep([near]);
    return true;
  }

  /** Chạm / click điểm sân [p] khi đang cầm: trúng luống → làm luống đó. `true` = đã nhận chạm. */
  tapAt(p: { x: number; z: number } | null): boolean {
    if (!this.hold || !p) return false;
    const half = this.d.plotSize / 2 + 0.25;
    const hit = this.d.garden.plots.find((q) => Math.abs(q.x - p.x) <= half && Math.abs(q.z - p.z) <= half);
    if (!hit) return false;
    this.sweep([hit.id]);
    return true;
  }

  /** Lướt qua nhiều luống (R-VUON-2/13): xếp hàng làm lần lượt; luống không hợp → câu báo (chỉ khi chạm một luống). */
  sweep(ids: readonly string[]): void {
    if (!this.hold) return;
    const one = ids.length === 1;
    for (const id of ids) {
      if (one) {
        const f = fits(this.d.state(), id, this.hold, this.d.now(), this.d.speed());
        if (!f.ok) {
          this.say(f.why);
          continue;
        }
      }
      this.queue = queueAdd(this.queue, id, this.job?.plot ?? null);
    }
    if (!this.job) this.next();
  }

  /**
   * Mỗi khung: rào (ra → bỏ cầm), bận (trang trí / bản đồ / thoại / màn che → bỏ cầm + dừng), hiệu ứng theo giây động tác,
   * tick sâu / bể hạt, lấp lánh vàng quanh cây chín.
   */
  update(dt: number, pos: { x: number; z: number }, busy: boolean, ripe: readonly number[]): void {
    const f = this.d.fence;
    this.inside = pos.x > Math.min(f.from.x, f.to.x) && pos.x < Math.max(f.from.x, f.to.x) && pos.z > Math.min(f.from.z, f.to.z) && pos.z < Math.max(f.from.z, f.to.z);
    if ((!this.inside || busy) && (this.hold || this.queue.length)) {
      this.hold = null;
      this.queue = [];
      if (this.job?.phase === 'walk') this.stop();
    }
    this.d.player.state.hold = this.hold ? toolOf(this.hold.tool).work : undefined;
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

  /* ---------- hàng đợi ---------- */

  private next(): void {
    if (!this.hold) return;
    const r = queueNext(this.queue, this.d.state(), this.hold, this.d.now(), this.d.speed());
    this.queue = r.rest;
    if (r.stop) {
      this.say(r.stop);
      this.hold = null;
    }
    if (!r.job) return;
    const i = this.d.garden.plots.findIndex((p) => p.id === r.job!.plot);
    const job: Job = { ...r.job, i, t: 0, phase: 'walk' };
    this.job = job;
    const pos = this.d.player.position;
    const at = standSpot(this.d.garden.plots[i], pos);
    const ok = this.d.player.walkTo(at.x, at.z, at.faceX, at.faceZ, () => this.begin(job), () => this.cancel());
    if (!ok) this.stop();
  }

  /** Tới mép luống: diễn [WORK_LEN] giây; joystick trong lúc diễn → làm nốt, bỏ phần còn lại. */
  private begin(job: Job): void {
    job.phase = 'work';
    job.t = 0;
    const ok = this.d.player.work(job.work, WORK_LEN[job.work], () => void this.finish(job), () => (this.queue = []));
    if (!ok) this.stop();
  }

  /** Diễn xong: ghi luật (giờ gieo = lúc này — R-VUON-3/13), hiệu ứng kết quả, việc kế. */
  private async finish(job: Job): Promise<void> {
    const before = this.d.state();
    const crop = cropOf(plotOf(before, job.plot).crop);
    const r = await this.d.act(job.act);
    this.job = null;
    const { garden } = this.d;
    if (r?.ok) {
      const top = garden.beds.topY(job.i);
      const p = garden.plots[job.i];
      if (job.work === 'thu' && crop) {
        const pos = this.d.player.position;
        garden.crops.flyHarvest(job.i, { x: pos.x, y: pos.y + 2.4, z: pos.z });
        garden.hats.emit('gold', { x: p.x, y: top + 0.4, z: p.z }, { count: 8, radius: 0.5 });
        this.say(harvestFloat(before, job.plot, crop, r.got));
        this.d.harvested(crop.id, r.got);
      } else if (job.work !== 'thu') {
        if (job.work === 'bon') {
          garden.hats.emit('sparkle', { x: p.x, y: top + 0.2, z: p.z }, { radius: 0.5 });
          garden.crops.bounce(job.i);
        }
        this.say(FLOAT[job.work]);
      }
      if (this.hold) {
        const h = holdAfter(r.garden, this.hold);
        this.hold = h.holding;
        if (h.why) {
          this.say(h.why);
          this.queue = [];
        }
      }
    } else if (r) this.say(`Không làm được (${r.reason})`);
    this.next();
  }

  /** Tự đi bị huỷ (joystick / chạm đi chỗ khác / kẹt): bỏ việc + hàng đợi, vẫn cầm. */
  private cancel(): void {
    this.job = null;
    this.queue = [];
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

  /** Chữ nổi / câu báo — chưa có thiết kế HUD (R-VUON-13): in Console. */
  private say(t: string | FloatText): void {
    const f = typeof t === 'string' ? { text: t, sub: null } : t;
    console.info(`[Vườn] ${f.text}${f.sub ? ` · ${f.sub}` : ''}`);
  }
}
