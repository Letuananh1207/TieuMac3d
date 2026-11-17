/**
 * Ghép 3 trò nhỏ Trúc Lâm (V-66 B4, kế hoạch `docs/tasks/2026-11-15-truc-lam-mini-game.md`): Lưu Thương Lệnh
 * (`luuThuong.ts`), Hái măng sau mưa (`haiMang.ts`), Đàn cầm (`danCam.ts`) — chỉ dựng trò có trong `miniGames` của đặc tả.
 * File này giữ phần chung (chỗ dựa `MiniHost`, đồng hồ thử `?gio=&toc=`, tiếng Trúc Lâm) để `main.ts` chỉ gọi vài dòng.
 * HUD cả 3 trò theo thiết kế 2026-11-16.13 (`ui/luuHud.ts`, `ui/mangHud.ts`, `ui/danCamHud.ts`); điều khiển thử trên Console
 * (`__hocXaLuu`, `__hocXaMang`, `__hocXaDanCam` — luôn có trên `window` khi cảnh có trò). Đang chơi → lớp `mini-play` trên
 * body (ẩn joystick, cụm nút, nút nổi); thẻ măng chữ → `mini-quiz` (chỉ ẩn joystick + cụm nút — R-MANG-4).
 */
import type * as THREE from 'three';
import type { TrialStore } from './bridge/browserStore';
import type { FlutterBridge, JourneyProgress } from './bridge/flutterBridge';
import type { Colliders } from './collision/colliders';
import { DanCam } from './danCam';
import { HaiMang } from './haiMang';
import { LuuThuong } from './luuThuong';
import type { PlayerController } from './player/controller';
import type { Character } from './player/character';
import type { Npc } from './player/npc';
import { docEpGio } from './scene/ngayDem';
import { miniGame, type SceneSpec } from './scene/spec';
import type { World } from './scene/world';
import { LamSound, ramp, RAIN_LEVEL, RAIN_RAMP_SECONDS } from './ui/lamSound';
import type { Dialog, DialogChoice } from './zones/dialogs';
import { miniGameSigns, type GameSign } from './zones/gameGuides';
import type { SeatSpot } from './zones/seats';
import type { GameEarning, GameKind, GameOutcome } from './zones/wallet';

/** Chỗ dựa `main.ts` đưa cho các trò. */
export interface MiniHost {
  spec: SceneSpec;
  world: World;
  scene: THREE.Scene;
  npcs: readonly Npc[];
  colliders: Colliders;
  player: PlayerController;
  character: Character;
  groundAt(x: number, z: number): number;
  bridge: FlutterBridge;
  /** ví thử (không có Flutter — R-TIEN-7); `null` = có Flutter */
  trial: TrialStore | null;
  progress(): JourneyProgress | null;
  /** từ đã học (tiến độ / ví thử) */
  learned(): ReadonlySet<string>;
  /** mức đồ hoạ (mưa: Thấp không hạt — R-MANG-2) */
  lowTier: boolean;
  /** NPC nói một câu trong khung thoại có sẵn; đóng → `then` */
  say(npc: string, text: string, then?: () => void): void;
  /** NPC nói lên kênh chung (bong bóng trên đầu) */
  chatSay(npc: string, text: string): void;
  /** mở bảng "Cách chơi" của trò */
  openGuide(kind: string): void;
  /** ngồi xuống chỗ [spot] (không góc từ mắt): camera ngôi 3 lùi [view.dist], ngẩng [view.pitch], lệch [view.side] rad */
  sit(spot: { x: number; y: number; z: number; rotY: number }, view: { dist: number; pitch: number; side?: number }): void;
  /** hết ván / bài: ghi thưởng (Flutter hoặc ví thử) + ví HUD "+n · …" */
  earn(game: GameKind, outcome: GameOutcome, song?: string): Promise<GameEarning | null>;
  /** tiền cộng ngoài trò (bán măng): ví HUD "+n · Bán măng" có xu bay */
  coins(amount: number, label: string, balance: number): void;
}

/** Khung hình cho các trò. */
export interface MiniFrame {
  dt: number;
  player: THREE.Vector3;
  camera: THREE.Camera;
  /** màn che / màn tải / đổi cảnh → tiếng mờ về 0 (R-AM-3) */
  covered: boolean;
  /** đang thoại / bản đồ / ngồi chỗ khác… → không hiện gợi ý hái */
  busy: boolean;
}

/** Đồng hồ (ms UTC) có ép giờ thử `?gio=14.8&toc=60` (như ngày đêm); app không có tham số → `Date.now()`. */
export function testClock(params: URLSearchParams): () => number {
  const ep = docEpGio(params);
  if (ep.gio === null && ep.toc === 1) return () => Date.now();
  const real0 = Date.now();
  const vn0 = ep.gio === null ? real0 : real0 + (ep.gio * 3600 - (((real0 / 1000 + 7 * 3600) % 86400) + 86400) % 86400) * 1000;
  return () => vn0 + (Date.now() - real0) * ep.toc;
}

export class MiniGames {
  readonly luu: LuuThuong | null;
  readonly mang: HaiMang | null;
  readonly dan: DanCam | null;
  readonly signs: GameSign[];
  private readonly sound: LamSound | null;
  private vol = { water: 0, rain: 0 };

  constructor(
    private readonly h: MiniHost,
    params: URLSearchParams,
  ) {
    const clock = testClock(params);
    const s = h.spec;
    const luu = miniGame(s.miniGames, 'luu-thuong');
    const mang = miniGame(s.miniGames, 'hai-mang');
    const dan = miniGame(s.miniGames, 'dan-cam');
    this.sound = luu || mang ? new LamSound(!!luu, !!mang) : null;
    this.luu = luu ? new LuuThuong(h, luu, this.sound) : null;
    this.mang = mang ? new HaiMang(h, mang, clock, this.sound) : null;
    this.dan = dan ? new DanCam(h, dan) : null;
    this.signs = miniGameSigns(s.miniGames);
    const w = window as unknown as Record<string, unknown>;
    if (this.luu) w.__hocXaLuu = this.luu.console();
    if (this.mang) w.__hocXaMang = this.mang.console();
    if (this.dan) w.__hocXaDanCam = this.dan.console();
  }

  /** Có trò nào đang chơi (ngồi tiệc / ngồi đàn / bảng bán măng) — ẩn thanh công cụ, bản đồ nhỏ, ví (R-THANH-1, R-TIEN-1). */
  get active(): boolean {
    return !!this.luu?.active || !!this.dan?.active || !!this.mang?.sellOpen;
  }

  /** Nhân vật đứng yên: thẻ măng chữ, bảng bán măng (R-MANG-4/5). */
  get frozen(): boolean {
    return !!this.mang?.quizOpen || !!this.mang?.sellOpen;
  }

  /** Vừa bán măng: ví hiện lại 2 s dù bảng bán còn mở (R-MANG-5). */
  get walletShown(): boolean {
    return !!this.mang?.walletFlash;
  }

  /** Đang ngồi ở chỗ của một trò (không góc từ mắt, không cuộn sách Ngồi ôn). */
  get seated(): boolean {
    return !!this.luu?.seated || !!this.dan?.seated;
  }

  async load(): Promise<void> {
    await this.mang?.load();
  }

  /** Thoại của NPC trò chơi; NPC khác → `undefined`. */
  dialog(npcId: string): Dialog | undefined {
    return this.luu?.dialog(npcId) ?? this.mang?.dialog(npcId);
  }

  handles(c: DialogChoice | undefined): c is DialogChoice {
    return c?.action === 'mini';
  }

  /** Lựa chọn có việc (gọi sau khi khung thoại đóng). */
  act(c: DialogChoice): void {
    if (c.mini === 'luu-du') this.luu?.join();
    else if (c.mini === 'luu-cach') this.h.openGuide('luu-thuong');
    else if (c.mini === 'mang-ban') this.mang?.openSell();
    else if (c.mini === 'mang-cach') this.h.openGuide('hai-mang');
  }

  /** Chỗ ngồi thêm cho nút nổi (đá đàn cầm — R-CAM-1). */
  seatSpots(): SeatSpot[] {
    return this.dan ? [this.dan.spot] : [];
  }

  /** Chỗ ngồi của cảnh có văn nhân ngồi → không hiện nút "Ngồi" (R-NGOI-1). */
  seatTaken(x: number, z: number): boolean {
    return !!this.luu?.taken(x, z);
  }

  /** Nút nổi "Ngồi đàn" được bấm → `true` (đã lo). */
  sit(spot: SeatSpot): boolean {
    if (spot.kind !== 'dan' || !this.dan) return false;
    this.dan.sit();
    return true;
  }

  /** Nút quay lại / Esc: đang chơi → đứng dậy, `true`. */
  back(): boolean {
    if (this.mang?.back()) return true;
    if (this.luu?.seated) return (this.luu.leave(), true);
    if (this.dan?.seated) return (this.dan.leave(), true);
    return false;
  }

  /** App xuống nền / tab ẩn → tắt tiếng ngay (R-AM-3). */
  setRunning(on: boolean): void {
    if (on) this.sound?.resume();
    else this.sound?.suspend();
    this.dan?.setRunning(on);
  }

  update(f: MiniFrame): void {
    document.body.classList.toggle('mini-play', this.active && !f.covered);
    document.body.classList.toggle('mini-quiz', !!this.mang?.quizOpen && !f.covered);
    this.luu?.update(f);
    this.mang?.update(f);
    this.dan?.update(f);
    const water = f.covered ? 0 : (this.luu?.waterLevel(f.player) ?? 0);
    const rain = f.covered ? 0 : this.mang?.raining ? RAIN_LEVEL : 0;
    this.vol.water = ramp(this.vol.water, water, f.dt);
    this.vol.rain = ramp(this.vol.rain, rain, f.dt, RAIN_RAMP_SECONDS / RAIN_LEVEL);
    this.sound?.setLevels(this.vol.water, this.vol.rain);
  }
}
