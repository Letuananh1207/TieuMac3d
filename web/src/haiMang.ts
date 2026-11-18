/**
 * Ghép Hái măng sau mưa (R-MANG-1…5): lứa theo giờ VN (`?gio=14.8&toc=60` để thử), măng InstancedMesh (`scene/mangLam.ts`),
 * mưa phùn 14:50–15:00 (`scene/muaPhun.ts` + lớp xám nhẹ; mức Thấp không hạt), hái (nút "Hái" / phím **E**) → `mangAct`
 * hoặc ví thử; thoại Măng bà bà "Bán măng" → bảng bán → ví HUD "+n · Bán măng". HUD thiết kế 2026-11-16.13 (`ui/mangHud.ts`):
 * nút "Hái", nhãn "+1 Măng", chip lứa măng, thẻ măng chữ (phím 1–3), bảng bán (Enter bán hết, Esc / nút quay lại đóng).
 * Thử trên Console: `__hocXaMang.hai()`, `.tra(i)`, `.bang()`, `.ban()`.
 */
import type * as THREE from 'three';
import { getMang } from './bridge/flutterBridge';
import type { MiniFrame, MiniHost } from './miniGames';
import { addMangLam, mangSpotOk, type MangLam, type MangView } from './scene/mangLam';
import { addMuaPhun, type MuaPhun } from './scene/muaPhun';
import type { MiniGameSpec } from './scene/spec';
import type { LamSound } from './ui/lamSound';
import { MangHud, QUIZ_CLOSE_SECONDS, type MangQuizView, type MangSellView } from './ui/mangHud';
import type { Dialog } from './zones/dialogs';
import {
  freshMang,
  MANG_PRICES,
  mangChip,
  mangInRange,
  mangOfDay,
  mangOn,
  mangPickLabel,
  mangQuestion,
  mangWord,
  mangSellLabel,
  rainAt,
  sproutK,
  wavesOpen,
  type MangAct,
  type MangKind,
  type MangResult,
  type MangSpot,
  type MangState,
} from './zones/mang';
import type { Tu } from './zones/tuVung/tu';
import { phatTu } from './ui/amTu';
import { mangValue, TRUC_ONG, trucOngDialog } from './zones/trucLamThoai';
import { mangTrialAct } from './zones/walletRules';

type MangSpec = Extract<MiniGameSpec, { kind: 'hai-mang' }>;

const VN = 7 * 3_600_000;
const DAY = 86_400_000;
/** Câu măng chữ chờ trả lời tối đa (s) — quá thì hái như sai. */
const ASK_SECONDS = 20;
/** Bán xong: ví hiện lại chừng này giây (R-MANG-5). */
const COIN_FLASH_SECONDS = 2;
/** Nút "Hái" cao hơn gốc măng (m): măng thường / măng to. */
const PICK_Y = { small: 0.55, big: 1.0 };
const EMPTY_LINE = 'Túi cháu còn trống. Mưa chiều xong là măng lại nhú.';

interface Ask {
  spot: MangSpot;
  word: Tu;
  options: string[];
  answer: number;
  /** giây còn lại (chờ trả lời, hoặc chờ tự đóng sau khi trả lời) */
  left: number;
  picked: number | null;
}

export class HaiMang {
  private state: MangState = freshMang();
  /** Flutter có mà không trả măng (bản cũ / lỗi) → chỉ xem */
  private readOnly = false;
  private day = -1;
  private spots: MangSpot[] = [];
  private readonly lam: MangLam;
  private readonly rain: MuaPhun | null;
  private readonly veil: HTMLElement;
  private readonly hud: MangHud;
  private lastKey = '';
  private near: MangSpot | null = null;
  private busy = false;
  private ask: Ask | null = null;
  /** bảng bán đang mở: các loại có lúc mở (dòng giữ lại, bán xong → "Đã bán") */
  private selling: MangKind[] | null = null;
  private coinFlash = 0;
  private camera: THREE.Camera | null = null;
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
    this.hud = new MangHud({
      pick: () => this.tryPick(),
      answer: (i) => this.answer(i + 1),
      sell: (k) => void this.sell(k),
      closeSell: () => this.closeSell(),
    });
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

  /** Thẻ măng chữ đang mở (nhân vật đứng yên, ẩn joystick + cụm nút — R-MANG-4). */
  get quizOpen(): boolean {
    return !!this.ask;
  }

  /** Bảng bán đang mở (như ngồi bàn chơi — R-MANG-5, R-THANH-1). */
  get sellOpen(): boolean {
    return !!this.selling;
  }

  /** Vừa bán: ví hiện lại 2 s (R-MANG-5). */
  get walletFlash(): boolean {
    return this.coinFlash > 0;
  }

  dialog(npcId: string): Dialog | undefined {
    return npcId === TRUC_ONG ? trucOngDialog(this.state.bag) : undefined;
  }

  /** "Bán măng" ở thoại Măng bà bà: mở bảng bán (túi trống → lời nhắc). */
  openSell(): void {
    const kinds = (Object.keys(MANG_PRICES) as MangKind[]).filter((k) => (this.state.bag[k] ?? 0) > 0);
    if (!kinds.length) {
      this.h.say(TRUC_ONG, EMPTY_LINE);
      return;
    }
    this.selling = kinds;
  }

  closeSell(): void {
    this.selling = null;
  }

  /** Nút quay lại / Esc: đóng bảng bán → `true`. */
  back(): boolean {
    if (!this.selling) return false;
    this.closeSell();
    return true;
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
    this.camera = f.camera;
    if (this.coinFlash > 0) this.coinFlash -= f.dt;
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
    // măng chữ: chờ trả lời (quá giờ = sai) → đã trả lời, tự đóng sau 1,5 s
    const a = this.ask;
    if (a && (a.left -= f.dt) <= 0) {
      if (a.picked === null) void this.pick(a.spot, false);
      this.ask = null;
    }
    // gần măng (< 1,5 m) → nút "Hái" trên măng gần nhất (R-MANG-3)
    const live = this.spots.filter((s) => s.wave < open && sproutK(sec, s.wave) >= 1);
    const blocked = f.busy || this.h.player.isSitting || !!this.ask || !!this.selling;
    this.near = blocked ? null : mangInRange(live, picked, f.player.x, f.player.z);
    const n = this.near;
    this.hud.setPick(n && { x: n.x, y: this.h.groundAt(n.x, n.z) + (n.big ? PICK_Y.big : PICK_Y.small), z: n.z, big: n.big });
    this.hud.follow(f.camera);
    // chip lứa măng dưới bản đồ nhỏ (chỉ cảnh có trò hái măng — Trúc Lâm)
    const perWave: number[] = [];
    for (const s of this.spots) perWave[s.wave] = (perWave[s.wave] ?? 0) + 1;
    const chipOff = f.busy || this.h.player.isSitting || !!this.selling;
    this.hud.setChip(chipOff ? null : mangChip(sec, this.state.picked.length, this.raining, [...perWave].map((x) => x ?? 0)));
    this.hud.quiz(this.quizView());
    this.hud.sell(f.covered ? null : this.sellView());
  }

  private quizView(): MangQuizView | null {
    const a = this.ask;
    if (!a) return null;
    const t = a.word;
    // đáp xong hiện nghĩa đúng + pinyin (R-MANG-4; phát âm khi có âm — R-AM-5)
    const verdict = a.picked === null ? {} : { verdict: a.picked === a.answer ? `Đúng! ${t.pinyin} — ×2, được 2 Măng to` : `Chưa đúng — ${t.han} ${t.pinyin} · ${t.meaning}. Vẫn được 1 Măng to` };
    return { han: t.han, options: a.options.map((m) => ({ meaning: m, hv: '' })), picked: a.picked, answer: a.answer, ...verdict };
  }

  private sellView(): MangSellView | null {
    if (!this.selling) return null;
    const bag = this.state.bag;
    return {
      rows: this.selling.map((k) => ({ kind: k, name: k === 'mang' ? 'Măng' : 'Măng to', n: bag[k] ?? 0, price: MANG_PRICES[k], sold: (bag[k] ?? 0) <= 0 })),
      all: mangValue(bag),
    };
  }

  /** "Hái" măng gần nhất (R-MANG-3); măng to khi đã học từ → thẻ măng chữ trước (R-MANG-4). */
  tryPick(): boolean {
    const s = this.near;
    if (!s || this.busy || this.ask) return false;
    this.h.player.bow(); // cúi người (dáng hái riêng chưa có)
    const learned = [...this.h.learned()];
    const w = s.big ? mangWord(learned, this.day, s.wave) : null;
    if (w) {
      const q = mangQuestion(w, learned);
      this.ask = { spot: s, word: w, ...q, left: ASK_SECONDS, picked: null };
      return true;
    }
    void this.pick(s, false);
    return true;
  }

  /** Trả lời thẻ măng chữ (1…4): hiện đúng / sai rồi tự đóng sau 1,5 s (R-MANG-4). */
  answer(i: number): boolean {
    const a = this.ask;
    if (!a || a.picked !== null || i < 1 || i > a.options.length) return false;
    a.picked = i - 1;
    a.left = QUIZ_CLOSE_SECONDS;
    phatTu(a.word); // hiện đáp án → phát âm khi có âm (R-MANG-4, R-AM-5)
    void this.pick(a.spot, i - 1 === a.answer, true);
    return true;
  }

  private async pick(s: MangSpot, right: boolean, keepQuiz = false): Promise<void> {
    if (!keepQuiz) this.ask = null;
    if (this.busy || this.readOnly) return;
    this.busy = true;
    try {
      const { res } = await this.act({ act: 'pick', id: s.id, right });
      if (res?.ok) {
        this.state = res.mang;
        this.sound?.snap();
        if (this.camera) this.hud.fly(mangPickLabel(s.big, res.got), s.big, { x: s.x, y: this.h.groundAt(s.x, s.z) + 0.6, z: s.z }, this.camera);
      } else console.info(`Hái măng: không được (${res ? res.reason : 'lỗi cầu nối'})`);
    } finally {
      this.busy = false;
    }
  }

  /** Bán một loại / hết (`null`) cho Măng bà bà (R-MANG-5): bảng giữ mở, ví hiện lại 2 s với "+n · Bán măng". */
  async sell(kind: MangKind | null): Promise<void> {
    if (this.busy || this.readOnly) return;
    this.busy = true;
    try {
      const { res, balance } = await this.act({ act: 'sell', kind });
      if (res?.ok) {
        this.state = res.mang;
        this.coinFlash = COIN_FLASH_SECONDS;
        this.h.coins(res.amount, mangSellLabel(res.amount), balance);
      }
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
    if (e.repeat) return;
    const own = (): void => {
      e.stopImmediatePropagation(); // phím của thẻ / bảng không sang điều khiển đi / thanh công cụ
      e.preventDefault();
    };
    if (this.ask) {
      const i = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
      if (i >= 0 && this.answer(i + 1)) own();
      return;
    }
    if (this.selling) {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        own();
        void this.sell(null); // máy tính: Enter = Bán hết (R-MANG-5)
      }
      return;
    }
    if (e.code !== 'KeyE' || !this.near) return;
    if (this.tryPick()) own(); // E = "Hái" khi đứng cạnh măng (không mở cửa / ngồi)
  }

  /** Điều khiển thử trên Console (`__hocXaMang`). */
  console(): Record<string, unknown> {
    return {
      hai: () => this.tryPick(),
      tra: (i: number) => this.answer(i),
      bang: () => this.openSell(),
      ban: () => this.sell(null),
      tui: () => ({ ...this.state.bag }),
      mang: () => this.spots.map((s) => ({ id: s.id, x: +s.x.toFixed(1), z: +s.z.toFixed(1), to: s.big, hai: this.state.picked.includes(s.id) })),
      mua: () => this.raining,
    };
  }
}
