/**
 * Ghép Hái măng sau mưa (R-MANG-1…5): lứa theo giờ VN (`?gio=14.8&toc=60` để thử), măng InstancedMesh (`scene/mangLam.ts`),
 * mưa phùn 14:50–15:00 (`scene/muaPhun.ts` + lớp xám nhẹ; mức Thấp không hạt), hái (phím **E** / `__hocXaMang.hai()`) →
 * `mangAct` hoặc ví thử, bán hết ở thoại Trúc Ông → ví HUD "+n · Bán măng". **HUD chờ thiết kế** (nút "Hái", nhãn "+1 Măng",
 * thẻ măng chữ, bảng bán): tới lúc đó gợi ý / kết quả in ra Console; câu măng chữ trả lời bằng `__hocXaMang.tra(i)`.
 */
import { getMang } from './bridge/flutterBridge';
import type { MiniFrame, MiniHost } from './miniGames';
import { addMangLam, mangSpotOk, type MangLam, type MangView } from './scene/mangLam';
import { addMuaPhun, type MuaPhun } from './scene/muaPhun';
import type { MiniGameSpec } from './scene/spec';
import type { LamSound } from './ui/lamSound';
import type { Dialog } from './zones/dialogs';
import {
  freshMang,
  mangInRange,
  mangOfDay,
  mangOn,
  mangPickLabel,
  mangQuestion,
  mangRadical,
  mangSellLabel,
  rainAt,
  sproutK,
  wavesOpen,
  type MangAct,
  type MangResult,
  type MangSpot,
  type MangState,
} from './zones/mang';
import { mangTrialAct } from './zones/walletRules';
import { TRUC_ONG, trucOngDialog } from './zones/trucLamThoai';
import type { Radical } from './zones/radicals';

type MangSpec = Extract<MiniGameSpec, { kind: 'hai-mang' }>;

const VN = 7 * 3_600_000;
const DAY = 86_400_000;
/** Câu măng chữ chờ trả lời tối đa (s) — quá thì hái như sai. */
const ASK_SECONDS = 20;

export class HaiMang {
  private state: MangState = freshMang();
  /** Flutter có mà không trả măng (bản cũ / lỗi) → chỉ xem */
  private readOnly = false;
  private day = -1;
  private spots: MangSpot[] = [];
  private readonly lam: MangLam;
  private readonly rain: MuaPhun | null;
  private readonly veil: HTMLElement;
  private lastKey = '';
  private near: MangSpot | null = null;
  private hinted = '';
  private busy = false;
  private ask: { spot: MangSpot; radical: Radical; options: string[]; answer: number; left: number } | null = null;
  private rainK = 0;
  raining = false;

  constructor(
    private readonly h: MiniHost,
    private readonly m: MangSpec,
    private readonly now: () => number,
    private readonly sound: LamSound | null,
  ) {
    this.ok = mangSpotOk(h.spec, h.colliders, h.groundAt);
    this.lam = addMangLam(h.scene, h.groundAt);
    this.rain = h.lowTier ? null : addMuaPhun(h.scene);
    // trời xám đi ~15 % khi mưa (R-MANG-2): lớp HTML trong suốt ngay trên cảnh, không hậu kỳ WebGL (như vignette)
    this.veil = document.createElement('div');
    this.veil.id = 'muaToi';
    this.veil.setAttribute('aria-hidden', 'true');
    Object.assign(this.veil.style, { position: 'fixed', inset: '0', pointerEvents: 'none', background: 'rgb(112,122,128)', opacity: '0' });
    document.querySelector('canvas')?.after(this.veil);
    window.addEventListener('keydown', (e) => this.onKey(e), true);
  }

  /** Nạp măng đã lưu (Flutter `getMang` / ví thử). */
  async load(): Promise<void> {
    const t = this.h.trial;
    if (t) {
      this.state = t.wallet.mang;
      return;
    }
    const s = await getMang();
    this.readOnly = s === null;
    this.state = s ?? freshMang();
  }

  /** Túi Lâm sản hiện có. */
  get bag(): MangState['bag'] {
    return this.state.bag;
  }

  dialog(npcId: string): Dialog | undefined {
    return npcId === TRUC_ONG ? trucOngDialog(this.state.bag) : undefined;
  }

  /** Chỗ mọc hợp lệ (R-MANG-1) — `scene/mangLam.ts` `mangSpotOk` (cùng hàm `scene:check` dùng). */
  private readonly ok: (x: number, z: number) => boolean;

  private ensureDay(day: number): void {
    if (day === this.day) return;
    this.day = day;
    this.spots = mangOfDay(day, this.m.areas, this.ok, this.m.gap ?? 3);
    this.state = mangOn(this.state, day);
  }

  update(f: MiniFrame): void {
    const ms = this.now();
    const day = Math.floor((ms + VN) / DAY);
    const sec = ((((ms + VN) % DAY) + DAY) % DAY) / 1000;
    this.ensureDay(day);
    // mưa phùn 14:50 → 15:00 (R-MANG-2)
    this.raining = rainAt(sec);
    this.rainK += ((this.raining ? 1 : 0) - this.rainK) * Math.min(1, f.dt / 2);
    this.rain?.update(f.dt, this.rainK, f.camera.position);
    this.veil.style.opacity = (0.15 * this.rainK).toFixed(3);
    // măng: lứa đã nhú, chưa hái, đang nhú 0,6 s
    const open = wavesOpen(sec);
    const picked = new Set(this.state.picked);
    const views: MangView[] = [];
    let key = '';
    for (const s of this.spots) {
      if (s.wave >= open || picked.has(s.id)) continue;
      const k = sproutK(sec, s.wave);
      views.push({ x: s.x, z: s.z, big: s.big, k });
      key += `${s.id}:${k.toFixed(2)};`;
    }
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lam.set(views);
    }
    // măng chữ đang chờ trả lời
    if (this.ask && (this.ask.left -= f.dt) <= 0) void this.pick(this.ask.spot, false);
    // gần măng (< 1,5 m) → gợi ý (nút "Hái" chờ thiết kế)
    const live = this.spots.filter((s) => s.wave < open && sproutK(sec, s.wave) >= 1);
    this.near = f.busy || this.h.player.isSitting ? null : mangInRange(live, picked, f.player.x, f.player.z);
    if (this.near && this.near.id !== this.hinted) {
      this.hinted = this.near.id;
      console.info(`Hái măng: ${this.near.big ? 'măng to' : 'măng'} ngay cạnh — phím E (hoặc __hocXaMang.hai())`);
    }
  }

  /** "Hái" măng gần nhất (R-MANG-3); măng to có bộ đã học → câu măng chữ trước (R-MANG-4). */
  tryPick(): boolean {
    const s = this.near;
    if (!s || this.busy || this.ask) return false;
    this.h.player.bow(); // cúi người (dáng hái riêng chờ thiết kế)
    const r = s.big ? mangRadical([...this.h.learned()], this.day, s.wave) : null;
    if (r) {
      const q = mangQuestion(r);
      this.ask = { spot: s, radical: r, ...q, left: ASK_SECONDS };
      console.info(`Măng chữ: bộ ${r.form} nghĩa là gì? ${q.options.map((o, i) => `${i + 1} ${o}`).join(' · ')} — __hocXaMang.tra(i)`);
      return true;
    }
    void this.pick(s, false);
    return true;
  }

  /** Trả lời câu măng chữ (1…3). */
  answer(i: number): boolean {
    const a = this.ask;
    if (!a) return false;
    void this.pick(a.spot, i - 1 === a.answer);
    return true;
  }

  private async pick(s: MangSpot, right: boolean): Promise<void> {
    this.ask = null;
    if (this.busy || this.readOnly) return;
    this.busy = true;
    try {
      const { res } = await this.act({ act: 'pick', id: s.id, right });
      if (res?.ok) {
        this.state = res.mang;
        this.sound?.snap();
        console.info(`${mangPickLabel(s.big, res.got)}${s.big && right ? ' (đáp đúng măng chữ)' : ''}`);
      } else console.info(`Hái măng: không được (${res ? res.reason : 'lỗi cầu nối'})`);
    } finally {
      this.busy = false;
    }
  }

  /** "Bán hết" cho Trúc Ông (R-MANG-5). */
  async sellAll(): Promise<void> {
    if (this.busy || this.readOnly) return;
    this.busy = true;
    try {
      const { res, balance } = await this.act({ act: 'sell', kind: null });
      if (res?.ok) {
        this.state = res.mang;
        this.h.coins(res.amount, mangSellLabel(res.amount), balance);
        this.h.say(TRUC_ONG, `Được ${res.got} măng, lão trả ${res.amount} Văn. Mai lại ghé nhé!`);
      } else this.h.say(TRUC_ONG, 'Túi con còn trống. Mưa chiều xong là măng lại nhú.');
    } finally {
      this.busy = false;
    }
  }

  /** Một thao tác: ví thử tự tính (R-TIEN-7); có Flutter → `mangAct` (Flutter tính + ghi). */
  private async act(a: MangAct): Promise<{ res: MangResult | null; balance: number }> {
    const t = this.h.trial;
    if (t) {
      const r = mangTrialAct(t.wallet, a, this.now());
      t.update(() => r.wallet);
      return { res: r.result, balance: r.wallet.coins };
    }
    const r = await this.h.bridge.mangAct(a);
    return { res: r, balance: r?.balance ?? 0 };
  }

  private onKey(e: KeyboardEvent): void {
    if (e.code !== 'KeyE' || e.repeat || !this.near) return;
    if (this.tryPick()) {
      e.stopImmediatePropagation(); // E = "Hái" khi đứng cạnh măng (không mở cửa / ngồi)
      e.preventDefault();
    }
  }

  /** Điều khiển thử trên Console (`__hocXaMang`). */
  console(): Record<string, unknown> {
    return {
      hai: () => this.tryPick(),
      tra: (i: number) => this.answer(i),
      ban: () => this.sellAll(),
      tui: () => ({ ...this.state.bag }),
      mang: () => this.spots.map((s) => ({ id: s.id, x: +s.x.toFixed(1), z: +s.z.toFixed(1), to: s.big, hai: this.state.picked.includes(s.id) })),
      mua: () => this.raining,
    };
  }
}
