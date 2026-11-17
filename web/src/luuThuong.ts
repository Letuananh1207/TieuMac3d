/**
 * Ghép Lưu Thương Lệnh ở Khúc Thuỷ Đài (R-LUU-1…5): thoại Thi Ông → ngồi đệm trống gần nhất (camera chéo cao, không góc từ
 * mắt) → vòng `LuuThuongRound` ↔ chén lệnh trên mương (`scene/channels.ts`) ↔ bong bóng văn nhân → `earnGame` khi hết ván.
 * HUD thiết kế 2026-11-16.13 (`ui/luuHud.ts`): thẻ câu ghép, 4 thẻ điểm, viên lượt, thẻ kết quả, "Rời tiệc"; chọn ô bằng chạm
 * hoặc phím **1–4**; thử trên Console: `__hocXaLuu.chon(i)`, `__hocXaLuu.vanMoi()`; rời: "Rời tiệc" / đi / Esc / nút quay lại.
 */
import type * as THREE from 'three';
import { canJoin, hostLine, LUU_HOST, LUU_NEED_LINE, LUU_NPCS, ranking, rankTitle, thiKhoi, type LuuSeat } from './games/luuThuong';
import { LUU_ANSWER_SECONDS, LuuThuongRound } from './games/luuThuongRound';
import type { MiniFrame, MiniHost } from './miniGames';
import { stopPoint, type ChannelPath, type CommandCup } from './scene/channels';
import type { MiniGameSpec } from './scene/spec';
import type { LamSound } from './ui/lamSound';
import { LuuHud, type LuuResultView, type LuuTile, type LuuView } from './ui/luuHud';
import { waterVolume } from './ui/lamSound';
import { ZitherSound } from './ui/zitherSound';
import type { Dialog } from './zones/dialogs';
import { thiOngDialog, vanNhanDialog } from './zones/trucLamThoai';

type LuuSpec = Extract<MiniGameSpec, { kind: 'luu-thuong' }>;

/** Camera ngồi tiệc: chéo cao nhìn xuống đài từ sau lưng (R-LUU-1). */
const FEAST_VIEW = { dist: 6.5, pitch: 0.82 };
/** Đệm "trùng" chỗ ngồi của cảnh (m). */
const SAME_SEAT = 0.2;

interface Cushion {
  index: number;
  x: number;
  y: number;
  z: number;
  rotY: number;
  /** điểm dừng chén trên mương (t 0…1) */
  stop: number;
}


export class LuuThuong {
  private readonly path: ChannelPath | null;
  private readonly cup: CommandCup | null;
  private readonly cushions: Cushion[];
  private readonly npcSeat = new Map<string, Cushion>();
  private round: LuuThuongRound | null = null;
  private mine: Cushion | null = null;
  private lastPhase = '';
  private result: LuuResultView | null = null;
  private readonly hud: LuuHud;
  private readonly zither = new ZitherSound('tranh');
  private readonly keys = (e: KeyboardEvent): void => this.onKey(e);

  constructor(
    private readonly h: MiniHost,
    m: LuuSpec,
    private readonly sound: LamSound | null,
  ) {
    this.path = h.world.channels.paths[m.channel] ?? null;
    this.cup = h.world.channels.command(m.channel);
    const seats = h.spec.seats;
    const yOf = (x: number, z: number): number => h.world.seats.find((s) => Math.hypot(s.x - x, s.z - z) < SAME_SEAT)?.y ?? h.groundAt(x, z);
    const cushion = (i: number): Cushion | null => {
      const s = seats[i];
      if (!s || !this.path) return null;
      return { index: i, x: s.x, y: yOf(s.x, s.z), z: s.z, rotY: ((s.rotY ?? 0) * Math.PI) / 180, stop: stopPoint(this.path, s).t };
    };
    this.cushions = m.seats.map(cushion).filter((c): c is Cushion => !!c);
    for (const n of m.npcs) {
      const c = cushion(n.seat);
      if (c) this.npcSeat.set(n.id, c);
    }
    this.zither.setLevel(1, 0); // tiếng gảy khi ghép đúng (R-LUU-3) — đầy, giữa hai tai
    this.hud = new LuuHud({ leave: () => this.leave(), newRound: () => this.newRound(), pick: (i) => this.round?.choose(i) });
    window.addEventListener('keydown', this.keys, true);
  }

  /** Đang có tiệc (ngồi đệm, ván đang chạy hoặc đã hết chờ ván mới). */
  get active(): boolean {
    return !!this.mine;
  }

  get seated(): boolean {
    return !!this.mine;
  }

  /** Đệm có văn nhân ngồi (R-NGOI-1: không hiện nút "Ngồi"). */
  taken(x: number, z: number): boolean {
    for (const c of this.npcSeat.values()) if (Math.hypot(c.x - x, c.z - z) < SAME_SEAT) return true;
    return false;
  }

  dialog(npcId: string): Dialog | undefined {
    if (npcId === LUU_HOST) return thiOngDialog();
    if (npcId === 'tai-nu' || npcId === 'tu-tai') return vanNhanDialog(npcId);
    return undefined;
  }

  /** Âm lượng róc rách theo khoảng cách tới mương (R-AM-3). */
  waterLevel(p: THREE.Vector3): number {
    if (!this.path) return 0;
    const q = this.path.pointAt(this.path.nearestT(p.x, p.z));
    return waterVolume(Math.hypot(q.x - p.x, q.z - p.z));
  }

  /** "Dự tiệc Lưu Thương" (R-LUU-1): đủ 3 bộ → ngồi đệm trống gần nhất, mở ván; thiếu → câu nhắc. */
  join(): void {
    if (this.mine || this.h.player.isSitting) return;
    if (!canJoin(this.h.learned())) {
      this.h.say(LUU_HOST, LUU_NEED_LINE);
      return;
    }
    const p = this.h.player.position;
    const c = [...this.cushions].sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
    if (!c) return;
    this.mine = c;
    this.h.sit(c, FEAST_VIEW);
    this.newRound();
  }

  /** "Ván mới" (R-LUU-5). */
  newRound(): void {
    if (!this.mine) return;
    this.round = new LuuThuongRound([...this.h.learned()]);
    this.lastPhase = '';
    this.result = null;
  }

  /** "Rời tiệc": đứng dậy cạnh đệm; giữa ván → không thưởng (R-LUU-5). */
  leave(): void {
    if (!this.mine) return;
    if (this.h.player.isSitting) this.h.player.toggleSit();
    this.end();
  }

  private end(): void {
    this.mine = null;
    this.round = null;
    this.result = null;
    this.cup?.place(null);
    this.hud.render(null);
  }

  update(f: MiniFrame): void {
    if (!this.mine) return;
    this.hud.render(f.busy ? null : this.view());
    if (!this.h.player.isSitting) {
      this.end(); // đi / nút đứng dậy → rời tiệc (R-LUU-1)
      return;
    }
    const r = this.round;
    if (!r) return;
    r.update(f.dt);
    const q = r.question;
    const seat = q ? (q.by === 'nguoi' ? this.mine : this.npcSeat.get(q.by)) : null;
    if (seat) this.cup?.place(seat.stop * r.drift, r.phase === 'troi' ? (1 - r.drift) * 6 : 0);
    if (r.stoppedNow) this.sound?.knock();
    const key = `${r.turn}:${r.phase}`;
    if (key === this.lastPhase) return;
    this.lastPhase = key;
    this.announce(r);
  }

  /** Mỗi lần đổi pha: bong bóng "…" văn nhân, tiếng gảy khi đúng, ghi thưởng khi hết ván. */
  private announce(r: LuuThuongRound): void {
    const q = r.question;
    if (r.phase === 'het') {
      void this.finish(r);
      return;
    }
    if (!q) return;
    if (r.phase === 'nghi' && q.by !== 'nguoi') this.h.chatSay(q.by, '…');
    else if (r.phase === 'cham' && q.by === 'nguoi' && r.lastRight) this.zither.pluck(69, 0.8);
  }

  private async finish(r: LuuThuongRound): Promise<void> {
    const outcome = r.outcome;
    const name = (s: LuuSeat): string => (s === 'nguoi' ? 'Đạo hữu' : (LUU_NPCS.find((n) => n.id === s)?.name ?? s));
    const result: LuuResultView = {
      title: rankTitle(r.scores),
      seal: thiKhoi(r.scores),
      points: r.scores.nguoi,
      rows: ranking(r.scores).map((x) => ({ rank: x.rank, npc: x.seat === 'nguoi' ? null : x.seat, name: name(x.seat), score: x.score, me: x.seat === 'nguoi' })),
      line: hostLine(outcome),
    };
    this.result = result;
    const e = await this.h.earn('luu-thuong', outcome);
    if (this.result === result) this.result = { ...result, reward: e ? (e.amount > 0 ? e.amount : e.capped ? null : 0) : undefined };
  }

  /** Dữ liệu HUD (thiết kế 2026-11-16.13) từ vòng đang chơi. */
  private view(): LuuView | null {
    const r = this.round;
    if (!r) return null;
    const q = r.question;
    const order = r.questions.map((x) => x.by);
    const dots = order.map((by, i) => ({
      mine: by === 'nguoi',
      state: i < r.marks.length ? (r.marks[i] ? 'dung' : 'sai') : i === r.turn && r.phase !== 'het' ? 'dang' : 'cho',
    })) as LuuView['dots'];
    const seatName = (s: LuuSeat): string => (s === 'nguoi' ? 'Đạo hữu' : (LUU_NPCS.find((n) => n.id === s)?.name ?? s));
    const seatOrder: LuuSeat[] = ['nguoi', 'thi-ong', 'tu-tai', 'tai-nu'];
    const live = r.phase !== 'het' && !!q;
    const seats = seatOrder.map((s) => ({
      npc: s === 'nguoi' ? null : s,
      name: seatName(s),
      score: r.scores[s],
      turn: live && q?.by === s,
      gained: live && r.phase === 'cham' && r.lastRight && q?.by === s,
    }));
    const v: LuuView = { turn: Math.min(r.questions.length, r.turn + 1), total: r.questions.length, dots, seats, status: null, card: null, result: r.phase === 'het' ? this.result : null };
    if (!live || !q) return v;
    const mine = q.by === 'nguoi';
    if (r.phase === 'tha' || r.phase === 'troi') v.status = { kind: 'troi' };
    else if (r.phase === 'nghi') v.status = { kind: 'nghi', npc: q.by, name: seatName(q.by) };
    else if (r.phase === 'cham') v.status = mine ? { kind: r.lastRight ? 'dung' : 'phat' } : { kind: 'npc', name: seatName(q.by), right: r.lastRight };
    if (r.phase === 'hoi' || r.phase === 'nghi' || r.phase === 'cham') {
      const full = r.phase === 'cham';
      const tiles: LuuTile[] = q.options.map((o, i) => {
        const state: LuuTile['state'] = !full ? 'thuong' : i === q.answer ? 'dung' : i === r.picked ? 'sai' : 'mo';
        return { form: o.han, hv: o.pinyin, state, ...(full && !mine && i === r.picked ? { npcPick: q.by } : {}) };
      });
      v.card = {
        mine,
        ...(mine ? {} : { who: { npc: q.by, name: seatName(q.by) } }),
        full,
        han: q.ghep.word.han,
        rest: q.ghep.shown,
        layout: 'trai-phai', // từ hai chữ: chữ trái – phải; ô trống ở đầu / cuối (R-LUU-3)
        at: q.ghep.at,
        hv: '',
        pinyin: q.ghep.word.pinyin,
        meaning: q.ghep.word.meaning,
        left: r.phase === 'hoi' ? Math.round(r.left * 4) / 4 : null,
        total: LUU_ANSWER_SECONDS,
        tiles,
      };
    }
    return v;
  }

  private onKey(e: KeyboardEvent): void {
    const r = this.round;
    if (!this.mine || !r || r.phase !== 'hoi') return;
    const i = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
    if (i < 0 || e.repeat) return;
    e.stopImmediatePropagation(); // phím số không sang thanh công cụ / biểu cảm
    e.preventDefault();
    r.choose(i);
  }

  /** Điều khiển thử trên Console (`__hocXaLuu`). */
  console(): Record<string, unknown> {
    return {
      vao: () => this.join(),
      chon: (i: number) => this.round?.choose(i - 1) ?? false,
      vanMoi: () => this.newRound(),
      roi: () => this.leave(),
      cau: () => this.round?.question,
      diem: () => this.round && { ...this.round.scores },
      pha: () => this.round?.phase ?? null,
    };
  }
}
