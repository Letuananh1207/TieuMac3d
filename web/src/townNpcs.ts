/**
 * Ghép hai NPC Khởi Nguyên Trấn (V-20261114-31; kế hoạch `docs/tasks/2026-11-14-npc-khat-nhi-go-mo.md`): Lão Canh đi vòng
 * theo đồng hồ GMT+7 (R-NPC-7), vật cản đi theo, bị chặn / đang thoại thì đứng; đầu giờ dừng 12 s gõ mõ + rao lên kênh
 * chung (R-NPC-8), tiếng mõ theo khoảng cách (R-AM-1); Tiểu Khất ngồi, thoại xin tiền + tin đồn (R-NPC-6, R-TIEN-8).
 * Tách khỏi main.ts như chatRoom.ts. Chỉ chạy khi cảnh có NPC đó (`npcs` của đặc tả + có model) — chưa có model thì không
 * có gì (Canvas 3D `?dang=go-mo` dùng model thế, `townPreview.ts`).
 */
import * as THREE from 'three';
import type { TrialStore } from './bridge/browserStore';
import type { FlutterBridge, JourneyProgress } from './bridge/flutterBridge';
import { NPC_HIDE_DIST, type MovingNpc, type Npc } from './player/npc';
import { buildRoute, clockDistance, HOUR_PAUSE_SEC, RouteWalker } from './player/npcRoute';
import { NPC_WALK_SPEED } from './scene/spec';
import { MoSound } from './ui/moSound';
import { ALMS_SHORT_REPLY, almsGreeting, almsThanks, KHAT_NHI, khatNhiDialog } from './zones/alms';
import type { Dialog, DialogChoice } from './zones/dialogs';
import { cauHoiGio, cauRaoHaiDong, giayTrongNgayVN, lechGioThu, maNgayVN } from './zones/gioVN';
import { moPan, moStrikes, moVolume, raoAt, strikesBetween } from './zones/moGo';
import { ALMS_COINS, almsLabel, giveTrialAlms, NO_ALMS, type AlmsRecord, type AlmsResult } from './zones/walletRules';

export const GO_MO = 'go-mo';
/** Bị chặn quá 3 s (R-NPC-7). */
export const NHUONG_BUOC = 'Đạo hữu nhường lão một bước nhé.';
/** Hai dòng rao cách nhau (s) — kênh chung cho mỗi người một tin / 1,5 s (R-CHAT-1). */
const RAO_GAP_MS = 1600;

const MO_URL = Object.values(import.meta.glob('./nhac/mo.wav', { query: '?url', import: 'default', eager: true }))[0] as string | undefined;

export interface TownNpcsHost {
  bridge: Pick<FlutterBridge, 'giveAlms'>;
  /** ví thử (không có Flutter — R-TIEN-7); `null` = có Flutter */
  trial: TrialStore | null;
  progress(): JourneyProgress | null;
  groundAt(x: number, z: number): number;
  /** NPC nói một câu trong khung thoại */
  say(npcId: string, text: string): void;
  /** NPC nói lên kênh chung */
  chatSay(npcId: string, text: string): void;
  /** ví HUD "−n · …" */
  spent(amount: number, label: string, balance: number, gameToday: number): void;
  /** vừa cho được: số dư + bản ghi mới (giữ bản tiến độ đang có cho khớp tới lần `getProgress` sau) */
  almsSaved(balance: number, alms: AlmsRecord): void;
}

export interface TownFrame {
  dt: number;
  player: THREE.Vector3;
  camera: THREE.Camera;
  /** mã NPC đang thoại với người chơi, không thoại → `null` */
  talkingTo: string | null;
  /** màn che (bài học / ôn / bảng / Tạp hoá) hoặc màn tải → không phát tiếng mõ (R-AM-1) */
  covered: boolean;
}

interface Walker {
  npc: MovingNpc;
  walker: RouteWalker;
  speed: number;
}

const isMoving = (n: Npc): n is MovingNpc => 'character' in n && 'motion' in n;

export class TownNpcs {
  private readonly walkers: Walker[] = [];
  private readonly khatNhi: MovingNpc | null;
  private readonly offsetMs: number;
  private readonly sound: MoSound | null;
  private prev: { hour: number; sec: number } | null = null;
  private readonly right = new THREE.Vector3();
  private busyAlms = false;

  constructor(
    npcs: readonly Npc[],
    private readonly host: TownNpcsHost,
    /** `?gio=08:59:50` (Canvas 3D) — đồng hồ bắt đầu ở giờ đó; app không có tham số này */
    gio: string | null = null,
  ) {
    for (const n of npcs) {
      if (!isMoving(n) || !n.spec.route) continue;
      const speed = n.spec.speed ?? NPC_WALK_SPEED;
      this.walkers.push({ npc: n, walker: new RouteWalker(buildRoute(n.spec.route), speed), speed });
    }
    const k = npcs.find((n) => n.id === KHAT_NHI);
    this.khatNhi = k && isMoving(k) ? k : null;
    this.offsetMs = lechGioThu(gio, Date.now()) ?? 0;
    this.sound = this.walkers.some((w) => w.npc.id === GO_MO) ? new MoSound(MO_URL) : null;
  }

  /** Có NPC nào của file này trong cảnh không. */
  get active(): boolean {
    return this.walkers.length > 0 || !!this.khatNhi;
  }

  /** Đồng hồ (ms UTC) — app: `Date.now()`; Canvas 3D có thể ép giờ. */
  nowMs(): number {
    return Date.now() + this.offsetMs;
  }

  /** Hội thoại động: Tiểu Khất theo ví + đã cho hôm nay (R-NPC-6). NPC khác → `undefined` (dùng `DIALOGS`). */
  dialog(npcId: string): Dialog | undefined {
    if (npcId !== KHAT_NHI || !this.khatNhi) return undefined;
    const { alms, balance } = this.wallet();
    return khatNhiDialog(alms, maNgayVN(this.nowMs()), balance);
  }

  handles(c: DialogChoice | undefined): c is DialogChoice {
    return c?.action === 'alms' || c?.action === 'gio';
  }

  /** Lựa chọn có `action` của file này (gọi sau khi khung thoại đóng). */
  act(c: DialogChoice): void {
    if (c.action === 'gio') this.host.say(GO_MO, cauHoiGio(this.nowMs()));
    else if (c.action === 'alms') void this.giveAlms();
  }

  /** App xuống nền / tab ẩn → tiếng mõ tắt; trở lại → mở lại (R-AM-1). */
  setRunning(on: boolean): void {
    if (on) this.sound?.resume();
    else this.sound?.suspend();
  }

  /** Mỗi khung — gọi trước `showNearNpcs` (NPC đi đổi vị trí). */
  update(f: TownFrame): void {
    if (!this.active) return;
    const now = this.nowMs();
    const sec = giayTrongNgayVN(now);
    const hour = Math.floor(sec / 3600);
    const inHour = sec - hour * 3600;
    const px = f.player.x;
    const pz = f.player.z;
    for (const w of this.walkers) {
      const n = w.npc;
      const dist = Math.hypot(n.root.position.x - px, n.root.position.z - pz);
      const st = w.walker.step(f.dt, { target: clockDistance(now, w.speed), talking: f.talkingTo === n.id, hidden: dist >= NPC_HIDE_DIST, player: [px, pz] });
      const y = this.host.groundAt(st.x, st.z);
      n.root.position.set(st.x, Number.isFinite(y) ? y : n.root.position.y, st.z);
      n.character.facing.rotation.y = st.yaw;
      n.motion.mps = st.mps;
      n.motion.strike = n.id === GO_MO && inHour < HOUR_PAUSE_SEC ? malletHeight(hour, inHour) : undefined;
      if (n.block) {
        n.block.x = st.x;
        n.block.z = st.z;
      }
      if (st.sayBlocked) this.host.chatSay(n.id, NHUONG_BUOC);
    }
    this.hourEvents(hour, inHour, f);
    this.prev = { hour, sec: inHour };
  }

  /** Đầu giờ: tiếng gõ (theo khoảng cách, im khi che) + rao hai dòng lên kênh chung (R-NPC-8, R-AM-1). */
  private hourEvents(hour: number, inHour: number, f: TownFrame): void {
    const mo = this.walkers.find((w) => w.npc.id === GO_MO);
    const p = this.prev;
    if (!mo || !p || p.hour !== hour) return;
    const hits = strikesBetween(hour, p.sec, inHour);
    if (hits && !f.covered && this.sound) {
      const at = mo.npc.root.position;
      const dx = at.x - f.player.x;
      const dz = at.z - f.player.z;
      const vol = moVolume(Math.hypot(dx, dz));
      this.right.setFromMatrixColumn(f.camera.matrixWorld, 0);
      const pan = moPan(this.right.x, this.right.z, dx, dz);
      for (let i = 0; i < hits; i++) this.sound.strike(vol, pan);
    }
    const r = raoAt(hour);
    if (p.sec < r && inHour >= r && inHour - p.sec < 0.5) {
      const [a, b] = cauRaoHaiDong(hour);
      this.host.chatSay(GO_MO, a);
      window.setTimeout(() => this.host.chatSay(GO_MO, b), RAO_GAP_MS);
    }
  }

  private wallet(): { alms: AlmsRecord; balance: number | null } {
    const t = this.host.trial;
    if (t) return { alms: t.wallet.alms, balance: t.wallet.coins };
    const p = this.host.progress();
    return { alms: p?.alms ?? { ...NO_ALMS }, balance: p?.coins ?? null };
  }

  /** "Cho 5 văn" (R-TIEN-8): ví thử tự tính, có Flutter thì Flutter tính + ghi. Được → "−5 · Cho Tiểu Khất" + tin đồn. */
  private async giveAlms(): Promise<void> {
    if (this.busyAlms) return;
    this.busyAlms = true;
    const today = maNgayVN(this.nowMs());
    let r: AlmsResult | null;
    const trial = this.host.trial;
    try {
      if (trial) {
        const g = giveTrialAlms(trial.wallet, today);
        trial.update(() => g.wallet);
        r = g.result;
      } else r = await this.host.bridge.giveAlms();
    } finally {
      this.busyAlms = false;
    }
    if (r?.ok) {
      this.host.almsSaved(r.balance, r.alms);
      this.host.spent(ALMS_COINS, almsLabel(), r.balance, this.host.progress()?.gameCoinsToday ?? 0);
      this.host.say(KHAT_NHI, almsThanks(today));
    } else if (r?.reason === 'given') this.host.say(KHAT_NHI, almsGreeting('da-cho', this.wallet().alms.count));
    else this.host.say(KHAT_NHI, ALMS_SHORT_REPLY); // thiếu tiền / Flutter lỗi / bản cũ
  }
}

/** Dùi khi gõ mõ: 1 = giơ cao, chạm mõ (0) đúng lúc mỗi tiếng gõ (R-NPC-8). */
export function malletHeight(hour: number, inHour: number): number {
  let h = 1;
  for (const t of moStrikes(hour)) h = Math.min(h, Math.min(1, Math.abs(inHour - t) / 0.25));
  return h;
}
