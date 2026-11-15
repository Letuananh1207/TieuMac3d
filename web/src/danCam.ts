/**
 * Ghép Đàn cầm ở bãi giữa Trúc Lâm (R-CAM-1…4): đệm cỏ sau tảng đá đàn + nút nổi "Ngồi đàn" (R-NGOI-1) → ngồi, camera thấp
 * chếch sau vai, dáng gảy; **đàn tự do** bằng phím 1–5 / Q W E R T (tiếng cổ cầm tự tổng hợp — `ZitherSound('cam')`);
 * **theo bài** bằng `__hocXaDanCam.bai('suoi-truc')` (phím đánh làn 1–5), hết bài → `earnGame` `dan-cam` (1 lần / bài / ngày).
 * **HUD chờ thiết kế** (tấm chọn chế độ, dây ngũ cung trên màn, làn nốt rơi, thẻ kết quả): tới lúc đó vào thẳng đàn tự do,
 * kết quả in ra Console.
 */
import { CAM_KEYS, CAM_LOW, camSeatAt, laneOfKey, RANK_NAME, rankOutcome, songById, SongPlay, SONGS } from './games/danCam';
import type { MiniFrame, MiniHost } from './miniGames';
import { addCushion } from './scene/daiDa';
import type { MiniGameSpec } from './scene/spec';
import { ZitherSound } from './ui/zitherSound';
import type { SeatSpot } from './zones/seats';

type DanSpec = Extract<MiniGameSpec, { kind: 'dan-cam' }>;

/** Camera ngồi đàn: thấp, gần, chếch sau vai phải nhìn qua đàn ra bãi (R-CAM-1). */
const CAM_VIEW = { dist: 3.4, pitch: 0.3, side: 0.55 };
/** Tay phải nhấc lên lại sau một lần gảy (s). */
const LIFT_SECONDS = 0.25;

export class DanCam {
  readonly spot: SeatSpot & { y: number };
  private on = false;
  private play: SongPlay | null = null;
  private t0 = 0;
  private sinceNote = 1;
  private auto = false;
  private autoNext = 0;
  private readonly zither = new ZitherSound('cam');

  constructor(
    private readonly h: MiniHost,
    m: DanSpec,
  ) {
    const p = h.spec.props[m.prop];
    const s = camSeatAt(p ?? { x: 0, z: 0 }, m.seat);
    const y = h.groundAt(s.x, s.z);
    addCushion(h.scene, s.x, y, s.z); // bồ đoàn rơm phía −z của đá (R-CAM-1)
    this.spot = { kind: 'dan', x: s.x, y, z: s.z, rotY: (s.rotY * Math.PI) / 180 };
    this.zither.setLevel(1, 0); // người ngồi đàn nghe đầy (chưa nhiều người — R-AM-3)
    window.addEventListener('keydown', (e) => this.onKey(e), true);
  }

  get seated(): boolean {
    return this.on;
  }

  get active(): boolean {
    return this.on;
  }

  /** "Ngồi đàn" (R-CAM-1): vào thẳng đàn tự do (tấm chọn chế độ chờ thiết kế). */
  sit(): void {
    if (this.on || this.h.player.isSitting) return;
    this.on = true;
    this.h.sit(this.spot, CAM_VIEW);
    console.info(`Đàn cầm: đàn tự do — phím 1–5 (quãng thấp), Q W E R T (quãng cao); theo bài: __hocXaDanCam.bai('${SONGS[0].id}') · ${SONGS.map((s) => `${s.id} = ${s.name}`).join(' · ')}`);
  }

  /** Đứng dậy cạnh đá; đang theo bài → bỏ, không thưởng (R-CAM-4). */
  leave(): void {
    if (!this.on) return;
    if (this.h.player.isSitting) this.h.player.toggleSit();
    this.stop();
  }

  private stop(): void {
    this.on = false;
    this.play = null;
    this.h.player.state.pluck = undefined;
  }

  setRunning(on: boolean): void {
    if (on) this.zither.resume();
    else this.zither.suspend();
  }

  /** Bắt đầu một bài (R-CAM-3); [tuDong] = máy tự gảy đúng nhịp (chỉ để thử luồng thưởng). */
  song(id: string, tuDong = false): boolean {
    const s = songById(id);
    if (!s || !this.on) return false;
    this.play = new SongPlay(s);
    this.t0 = performance.now() / 1000;
    this.auto = tuDong;
    this.autoNext = 0;
    console.info(`Đàn cầm: theo bài "${s.name}" — ${this.play.notes.length} nốt, phím 1–5 đánh làn Cung · Thương · Giốc · Chuỷ · Vũ`);
    return true;
  }

  private strum(midi: number): void {
    this.zither.pluck(midi, 0.8);
    this.sinceNote = 0;
  }

  update(f: MiniFrame): void {
    if (!this.on) return;
    if (!this.h.player.isSitting) {
      this.stop(); // đi / nút đứng dậy → rời đàn; giữa bài không thưởng
      return;
    }
    this.sinceNote += f.dt;
    this.h.player.state.pluck = Math.min(1, this.sinceNote / LIFT_SECONDS); // dáng gảy (như Cầm Nương — R-NPC-9)
    const p = this.play;
    if (!p) return;
    const t = performance.now() / 1000 - this.t0;
    if (this.auto) {
      while (this.autoNext < p.notes.length && p.notes[this.autoNext].t <= t) {
        const n = p.notes[this.autoNext++];
        p.hit(n.lane, n.t);
        this.strum(CAM_LOW[n.lane]);
      }
    }
    p.update(t);
    if (p.done(t)) void this.finish(p);
  }

  private async finish(p: SongPlay): Promise<void> {
    this.play = null;
    const rank = p.rank;
    const e = await this.h.earn('dan-cam', rankOutcome(rank), p.song.id);
    const hay = p.marks.filter((m) => m === 'hay').length;
    const duoc = p.marks.filter((m) => m === 'duoc').length;
    console.info(
      `Đàn cầm · "${p.song.name}": ${Math.round(p.ratio * 100)} % (Hay ${hay} · Được ${duoc} / ${p.notes.length}) → ${RANK_NAME[rank]}${e ? (e.songDone ? ' · bài này hôm nay đã thưởng' : ` · +${e.amount} Văn`) : ''}`,
    );
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.on || e.repeat || !(e.code in CAM_KEYS)) return;
    e.stopImmediatePropagation(); // W / E / R / T… không sang điều khiển đi / thanh công cụ
    e.preventDefault();
    const p = this.play;
    if (p) {
      const lane = laneOfKey(e.code);
      if (lane === null) return;
      const j = p.hit(lane, performance.now() / 1000 - this.t0);
      this.strum(CAM_LOW[lane]);
      if (j) console.info(j === 'hay' ? 'Hay' : 'Được');
      return;
    }
    this.strum(CAM_KEYS[e.code]);
  }

  /** Điều khiển thử trên Console (`__hocXaDanCam`). */
  console(): Record<string, unknown> {
    return {
      ngoi: () => this.sit(),
      bai: (id: string, tuDong = false) => this.song(id, tuDong),
      gay: (code: string) => (code in CAM_KEYS ? (this.strum(CAM_KEYS[code]), true) : false),
      dung: () => this.leave(),
      baiList: () => SONGS.map((s) => s.id),
    };
  }
}
