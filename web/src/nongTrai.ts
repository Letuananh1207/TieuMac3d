/**
 * Ghép nông trại Nhà của ta (R-NONG-1…8 — thiết kế 2026-11-18.11, concept `design/concept/nong-trai-nha/`): nạp nông trại
 * (`getNong`; không Flutter → ví thử, R-TIEN-7), bật / tắt vật trong cảnh theo trạng thái (thóc, trứng, cỏ, sữa, dây giàn),
 * nút nổi ở công trình gần nhất (`ui/nongHud.ts`, phím E), câu cá (phao nhấp → chìm → "Giật cần!"), thao tác `nongAct`
 * rồi báo ví / tấm báo / chữ nổi qua HUD vườn (`homeGarden.ts`), bán ở thùng thu mua (móc `attachFarm`). File gốc như
 * `haiMang.ts` — `main.ts` chỉ tạo khi cảnh có `farm`. Thử trên Console: `__hocXaNong.state()`, `.bam()`.
 */
import * as THREE from 'three';
import type { TrialStore } from './bridge/browserStore';
import { getNong, type FlutterBridge } from './bridge/flutterBridge';
import type { HomeGarden } from './homeGarden';
import type { PlayerController } from './player/controller';
import type { Farm3D } from './scene/nongTrai';
import { NongHud } from './ui/nongHud';
import { maNgayVN } from './zones/gioVN';
import { addHay, freshNong, penFedToday, penReady, vineStage, type NongAct, type NongProduct, type NongResult, type NongState } from './zones/nong';
import { castPhase, doneFloat, farmButton, farmSpotAt, farmStoreRows, fishTick, refuseToast, type FarmSpot, type FishPhase } from './zones/nongHud';
import { sellLabel } from './zones/vuonHud';
import { nongTrialAct } from './zones/walletRules';

export interface NongTraiDeps {
  farm: Farm3D;
  garden: HomeGarden;
  bridge: FlutterBridge;
  trial: TrialStore | null;
  /** hệ số lớn nhanh `?vuon=` (chỉ ví thử — giàn) */
  speed: number;
  player: PlayerController;
  coins(amount: number, label: string, balance: number, from?: () => { x: number; y: number } | null): void;
}

const ANCHOR_Y = 1.6;

export class NongTrai {
  private s: NongState = freshNong();
  private readOnly = false;
  private busy = false;
  private fish: FishPhase = { kind: 'idle' };
  private spot: FarmSpot | null = null;
  private readonly hud: NongHud;
  private readonly anchor = new THREE.Vector3();

  constructor(private readonly d: NongTraiDeps) {
    this.hud = new NongHud(() => void this.press());
    d.garden.attachFarm({
      rows: () => farmStoreRows(this.s),
      sell: (item) => this.sell(item),
      weeded: () => {
        this.s = addHay(this.s, 1); // Flutter / ví thử đã ghi — trang giữ bản sao (R-NONG-5)
        this.d.garden.toast({ kind: 'thu', title: '+1 Cỏ khô vào kho', sub: 'Mang cho bò con ở chuồng đông nam', item: 'co-kho' });
      },
    });
    // thử trên Console: trạng thái, bấm nút, nhảy tới công trình (`toi('ga' | 'bo' | 'ben' | 'bau' | 'dua-leo')`)
    const f = d.farm;
    const bin = d.garden.binAt;
    const to: Record<FarmSpot | 'thung', [number, number]> = {
      thung: [bin.x - 1.4, bin.z + 0.6],
      ga: [f.coop.rect.x1 + 1, (f.coop.rect.z0 + f.coop.rect.z1) / 2],
      bo: [f.pen.rect.x0 - 1, (f.pen.rect.z0 + f.pen.rect.z1) / 2],
      ben: [f.pier.stand.x, f.pier.stand.z],
      bau: [f.trellis.roots.bau.x + 0.9, f.trellis.roots.bau.z],
      'dua-leo': [f.trellis.roots['dua-leo'].x - 0.9, f.trellis.roots['dua-leo'].z],
    };
    Object.assign(window, {
      __hocXaNong: {
        state: () => this.s,
        bam: () => this.press(),
        spot: () => this.spot,
        nut: () => document.querySelector('#farmBtn:not([hidden]) button')?.textContent ?? null,
        toi: (k: FarmSpot | 'thung') => {
          d.player.position.set(to[k][0], d.player.position.y, to[k][1]);
          d.player.snapToGround();
        },
      },
    });
  }

  /** Kho nông trại (túi đồ — R-NONG-8). */
  get kho(): NongState['kho'] {
    return this.s.kho;
  }

  private get now(): number {
    return Date.now();
  }

  private get speed(): number {
    return this.d.trial ? this.d.speed : 1;
  }

  async load(): Promise<void> {
    const t = this.d.trial;
    if (t) this.s = t.wallet.nong;
    else {
      const s = await getNong();
      this.readOnly = s === null;
      this.s = s ?? freshNong();
    }
    this.sync();
  }

  /** Vật trong cảnh theo trạng thái (thóc / trứng / cỏ / sữa / dây giàn). */
  private sync(): void {
    const today = maNgayVN(this.now);
    const f = this.d.farm;
    f.setCoop(penFedToday(this.s, 'ga', today), penReady(this.s, 'ga', today));
    f.setPen(penFedToday(this.s, 'bo', today), penReady(this.s, 'bo', today));
    for (const v of ['bau', 'dua-leo'] as const) f.setVine(v, vineStage(this.s, v, this.now, this.speed));
  }

  /** Mỗi khung: công trình gần, nút nổi, câu cá. [hidden] = HUD vườn đang ẩn (trang trí, bản đồ, thoại, ngồi, màn phủ, bảng vườn). */
  update(dt: number, pos: { x: number; z: number }, camera: THREE.Camera, hidden: boolean): void {
    const f = this.d.farm;
    this.spot = hidden ? null : farmSpotAt(pos, { coop: f.coop.rect, pen: f.pen.rect, pier: f.pier.rect, trellis: f.trellis.rect, trellisX: (f.trellis.rect.x0 + f.trellis.rect.x1) / 2 });
    // rời bến / bị che giữa lúc câu → thu cần, không tính (R-NONG-3)
    if (this.fish.kind !== 'idle' && this.spot !== 'ben') this.setFish({ kind: 'idle' });
    if (this.fish.kind !== 'idle') {
      const r = fishTick(this.fish, dt);
      if (r.missed) this.d.garden.floatAt({ text: 'Cá đã chạy', sub: null }, this.float());
      this.setFish(r.phase);
    }
    this.sync();
    const today = maNgayVN(this.now);
    const b = this.spot ? farmButton(this.spot, this.s, today, this.now, this.fish, this.speed) : null;
    this.hud.set(b && this.spot ? { ...b, at: this.anchorOf(this.spot) } : null);
    this.hud.follow(camera);
  }

  private setFish(p: FishPhase): void {
    this.fish = p;
    this.d.farm.bobber.set(p.kind === 'idle' ? 'off' : p.kind === 'bite' ? 'bite' : 'float');
  }

  private float(): THREE.Vector3 {
    return this.anchor.copy(this.d.farm.pier.float).setY(this.d.farm.pier.float.y + 0.4);
  }

  private anchorOf(s: FarmSpot): THREE.Vector3 {
    const f = this.d.farm;
    if (s === 'ga') return this.anchor.copy(f.coop.nest).setY(f.coop.nest.y + 1.2);
    if (s === 'bo') return this.anchor.copy(f.pen.trough).setY(f.pen.trough.y + ANCHOR_Y);
    if (s === 'ben') return this.anchor.copy(f.pier.stand).setY(f.pier.stand.y + 2.1);
    const r = f.trellis.roots[s];
    return this.anchor.copy(r).setY(r.y + ANCHOR_Y);
  }

  /** Phím E: có nút ở công trình gần → bấm; không → `false` (E về việc khác). */
  use(): boolean {
    if (!this.spot) return false;
    void this.press();
    return true;
  }

  /** Bấm nút nổi (R-NONG-2…6). */
  async press(): Promise<void> {
    const spot = this.spot;
    if (!spot || this.busy) return;
    const b = farmButton(spot, this.s, maNgayVN(this.now), this.now, this.fish, this.speed);
    if (!b.act) return;
    const f = this.d.farm;
    if (b.act === 'cast') {
      // đứng ở đầu bến quay mặt ra phao rồi quăng
      const go = (): void => this.setFish(castPhase(Math.random()));
      if (!this.d.player.walkTo(f.pier.stand.x, f.pier.stand.z, f.pier.float.x, f.pier.float.z, go)) go();
      return;
    }
    if (b.act === 'early') {
      this.setFish({ kind: 'idle' });
      this.d.garden.floatAt({ text: 'Sớm quá — cá chạy mất', sub: null }, this.float());
      return;
    }
    if (b.act === 'hook') {
      this.setFish({ kind: 'idle' });
      await this.run(spot, { act: 'fish' });
      return;
    }
    this.d.player.bow(); // cúi người (dáng riêng chưa có — như hái măng)
    await this.run(spot, b.act);
  }

  private async run(spot: FarmSpot, a: NongAct): Promise<void> {
    const r = await this.act(a);
    if (!r) return;
    const at = spot === 'ben' ? this.float() : this.anchorOf(spot).clone().setY(this.anchorOf(spot).y - 0.6);
    if (!r.ok) {
      const t = refuseToast(spot, r.reason);
      if (t) this.d.garden.toast({ kind: 'thu', ...t });
      return;
    }
    if (r.garden) this.d.garden.adopt(r.garden); // rắc thóc: kho Lúa −1 (R-NONG-2)
    this.d.garden.floatAt({ text: doneFloat(a, r.got, r.item), sub: null }, at);
    const item = a.act === 'take' ? (a.pen === 'ga' ? 'trung' : 'sua') : a.act === 'pick' ? a.vine : a.act === 'fish' ? r.item : undefined;
    if (item) {
      this.d.garden.flyAt(item, at);
      this.d.garden.toast({ kind: 'thu', title: doneFloat(a, r.got, r.item) + ' vào kho', sub: 'Bán ở thùng thu mua cạnh lối', item });
    }
  }

  /** Bán (thùng thu mua — R-NONG-7): ví "+n · Bán nông sản", xu bay từ thùng. `true` = bán được. */
  private async sell(item: NongProduct | null): Promise<boolean> {
    const r = await this.act({ act: 'sell', item });
    if (!r?.ok) return false;
    this.d.coins(r.amount, sellLabel(r.amount), r.balance, () => this.d.garden.binScreen);
    return true;
  }

  /** Một thao tác: ví thử tự tính; có Flutter → `nongAct`. Được → giữ trạng thái mới + vẽ lại. */
  private async act(a: NongAct): Promise<(NongResult & { balance: number }) | null> {
    if (this.busy) return null;
    const t = this.d.trial;
    let r: (NongResult & { balance: number }) | null;
    if (t) {
      const out = nongTrialAct(t.wallet, a, this.now, this.speed);
      t.update(() => out.wallet);
      r = { ...out.result, balance: out.wallet.coins };
    } else if (this.readOnly) {
      return null;
    } else {
      this.busy = true;
      r = await this.d.bridge.nongAct(a);
      this.busy = false;
    }
    if (r?.ok) {
      this.s = r.nong;
      this.sync();
    }
    return r;
  }
}
