/**
 * Ghép Đàn cầm ở bãi giữa Trúc Lâm (R-CAM-1…4): đệm cỏ sau tảng đá đàn + nút nổi "Ngồi đàn" (R-NGOI-1) → ngồi, camera thấp
 * chếch sau vai, dáng gảy → tấm chọn "Đàn tự do" · "Theo bài" · "Đứng dậy" (máy tính 1 / 2 / Esc). **Đàn tự do**: bàn dây 10
 * phím (chạm / lướt) hoặc phím 1–5 / Q W E R T (tiếng cổ cầm tự tổng hợp — `ZitherSound('cam')`). **Theo bài**: chọn 1 trong 3
 * bài, nốt rơi 5 làn (chạm làn / phím 1–5), hết bài → thẻ kết quả + `earnGame` `dan-cam` (1 lần / bài / ngày). HUD thiết kế
 * 2026-11-16.13 (`ui/danCamHud.ts`). Thử trên Console: `__hocXaDanCam.bai('suoi-truc', true)`.
 */
import { CAM_HIGH, CAM_KEYS, CAM_LOW, camSeatAt, RANK_NAME, rankOutcome, songById, songClock, songLaneOfKey, SongPlay, SONGS, type CamRank, type CamSong } from './games/danCam';
import type { MiniFrame, MiniHost } from './miniGames';
import { addCushion } from './scene/daiDa';
import type { MiniGameSpec } from './scene/spec';
import { DanCamHud, type DanNote, type DanReward, type DanView } from './ui/danCamHud';
import { ZitherSound } from './ui/zitherSound';
import { camSongDone } from './zones/walletRules';
import type { SeatSpot } from './zones/seats';

type DanSpec = Extract<MiniGameSpec, { kind: 'dan-cam' }>;
type Mode = 'chon' | 'bai' | 'tudo' | 'theo' | 'ketqua';

/** Camera ngồi đàn: thấp, gần, chếch sau vai phải nhìn qua đàn ra bãi (R-CAM-1). */
const CAM_VIEW = { dist: 3.4, pitch: 0.3, side: 0.55 };
/** Tay phải nhấc lên lại sau một lần gảy (s). */
const LIFT_SECONDS = 0.25;
/** Nốt hiện trên làn chừng này giây trước khi tới vạch. */
const LOOK_AHEAD = 2.5;
/** Hạng cao → thấp (chọn "tốt nhất"). */
const RANK_ORDER: readonly CamRank[] = ['tri-am', 'thanh-nha', 'tap-dan'];

const vnDay = (): number => Math.floor((Date.now() + 7 * 3_600_000) / 86_400_000);
const now = (): number => performance.now() / 1000;

export class DanCam {
  readonly spot: SeatSpot & { y: number };
  private on = false;
  private mode: Mode = 'chon';
  private play: SongPlay | null = null;
  private last: CamSong | null = null;
  private t0 = 0;
  private pausedAt: number | null = null;
  private result: Extract<DanView, { mode: 'ketqua' }> | null = null;
  private sinceNote = 1;
  private auto = false;
  private autoNext = 0;
  /** hạng tốt nhất / bài đã thưởng hôm nay (trong phiên; ví thử đọc thêm từ ví) */
  private best = new Map<string, CamRank>();
  private rewarded = new Set<string>();
  private memoDay = -1;
  private readonly zither = new ZitherSound('cam');
  private readonly hud: DanCamHud;

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
    this.hud = new DanCamHud({
      free: () => this.setMode('tudo'),
      songs: () => this.setMode('bai'),
      stand: () => this.leave(),
      back: () => this.setMode('chon'),
      song: (id) => void this.song(id),
      pluck: (row, i) => this.strum((row === 0 ? CAM_HIGH : CAM_LOW)[i]),
      lane: (i) => this.lane(i),
      pause: () => this.togglePause(),
      again: () => this.last && this.song(this.last.id),
    });
  }

  get seated(): boolean {
    return this.on;
  }

  get active(): boolean {
    return this.on;
  }

  /** "Ngồi đàn" (R-CAM-1): ngồi → tấm chọn chế độ. */
  sit(): void {
    if (this.on || this.h.player.isSitting) return;
    this.on = true;
    this.h.sit(this.spot, CAM_VIEW);
    this.setMode('chon');
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
    this.result = null;
    this.pausedAt = null;
    this.h.player.state.pluck = undefined;
    this.hud.render(null);
  }

  private setMode(m: Mode): void {
    if (m !== 'theo') {
      this.play = null;
      this.pausedAt = null;
    }
    if (m !== 'ketqua') this.result = null;
    this.mode = m;
  }

  setRunning(on: boolean): void {
    if (on) this.zither.resume();
    else this.zither.suspend();
  }

  /** Bắt đầu một bài (R-CAM-3); [tuDong] = máy tự gảy đúng nhịp (chỉ để thử luồng thưởng). */
  song(id: string, tuDong = false): boolean {
    const s = songById(id);
    if (!s || !this.on) return false;
    this.setMode('theo');
    this.play = new SongPlay(s);
    this.last = s;
    this.t0 = now();
    this.auto = tuDong;
    this.autoNext = 0;
    return true;
  }

  private songTime(): number {
    return this.pausedAt ?? now() - this.t0;
  }

  private togglePause(): void {
    if (!this.play) return;
    if (this.pausedAt === null) this.pausedAt = now() - this.t0;
    else {
      this.t0 = now() - this.pausedAt;
      this.pausedAt = null;
    }
  }

  private strum(midi: number): void {
    this.zither.pluck(midi, 0.8);
    this.sinceNote = 0;
  }

  /** Gảy làn [i] khi theo bài: chấm nốt gần nhất, hiện "Hay" / "Được". */
  private lane(i: number): void {
    const p = this.play;
    if (!p || this.pausedAt !== null) return;
    const j = p.hit(i, this.songTime());
    this.strum(CAM_LOW[i]);
    if (j) this.hud.judge(i, j);
  }

  private memo(): void {
    const d = vnDay();
    if (d === this.memoDay) return;
    this.memoDay = d;
    this.best.clear();
    this.rewarded.clear();
  }

  private view(): DanView {
    if (this.mode === 'bai') {
      this.memo();
      const cam = this.h.trial?.wallet.cam;
      return {
        mode: 'bai',
        songs: SONGS.map((s) => {
          const b = this.best.get(s.id);
          return { id: s.id, name: s.name, len: songClock(s), ...(b ? { best: RANK_NAME[b] } : {}), rewarded: this.rewarded.has(s.id) || (!!cam && camSongDone(cam, this.memoDay, s.id)) };
        }),
      };
    }
    if (this.mode === 'theo' && this.play) {
      const p = this.play;
      const t = this.songTime();
      const end = p.notes.length ? p.notes[p.notes.length - 1].t : 1;
      return {
        mode: 'theo',
        name: p.song.name,
        hay: p.marks.filter((m) => m === 'hay').length,
        duoc: p.marks.filter((m) => m === 'duoc').length,
        progress: Math.max(0, Math.min(1, t / end)),
        paused: this.pausedAt !== null,
      };
    }
    if (this.mode === 'ketqua' && this.result) return this.result;
    return { mode: this.mode === 'tudo' ? 'tudo' : 'chon' };
  }

  update(f: MiniFrame): void {
    if (!this.on) return;
    if (!this.h.player.isSitting) {
      this.stop(); // đi / nút đứng dậy → rời đàn; giữa bài không thưởng
      return;
    }
    this.sinceNote += f.dt;
    this.h.player.state.pluck = Math.min(1, this.sinceNote / LIFT_SECONDS); // dáng gảy (như Cầm Nương — R-NPC-9)
    this.hud.render(f.busy ? null : this.view());
    const p = this.play;
    if (!p || this.mode !== 'theo') return;
    const t = this.songTime();
    if (this.auto && this.pausedAt === null) {
      while (this.autoNext < p.notes.length && p.notes[this.autoNext].t <= t) {
        const n = p.notes[this.autoNext++];
        const j = p.hit(n.lane, n.t);
        this.strum(CAM_LOW[n.lane]);
        if (j) this.hud.judge(n.lane, j);
      }
    }
    p.update(t);
    const notes: DanNote[] = [];
    p.notes.forEach((n, i) => {
      const ahead = n.t - t;
      if (ahead > LOOK_AHEAD || ahead < -0.4) return;
      notes.push({ lane: n.lane, k: 1 - ahead / LOOK_AHEAD, mark: p.marks[i] });
    });
    this.hud.frame(notes);
    if (p.done(t)) void this.finish(p);
  }

  private async finish(p: SongPlay): Promise<void> {
    this.play = null;
    const rank = p.rank;
    const hay = p.marks.filter((m) => m === 'hay').length;
    const duoc = p.marks.filter((m) => m === 'duoc').length;
    const result: Extract<DanView, { mode: 'ketqua' }> = {
      mode: 'ketqua',
      name: p.song.name,
      rank: RANK_NAME[rank],
      pct: Math.round(p.ratio * 100),
      hay,
      duoc,
      miss: p.notes.length - hay - duoc,
    };
    this.memo();
    const prev = this.best.get(p.song.id);
    if (!prev || RANK_ORDER.indexOf(rank) < RANK_ORDER.indexOf(prev)) this.best.set(p.song.id, rank);
    this.mode = 'ketqua';
    this.result = result;
    const e = await this.h.earn('dan-cam', rankOutcome(rank), p.song.id);
    if (e && (e.amount > 0 || e.songDone)) this.rewarded.add(p.song.id);
    const reward: DanReward | undefined = !e ? undefined : e.amount > 0 ? { kind: 'coins', n: e.amount } : e.songDone ? { kind: 'song' } : e.capped ? { kind: 'capped' } : undefined;
    if (this.result === result) this.result = { ...result, ...(reward ? { reward } : {}) };
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.on || e.repeat) return;
    const own = (): void => {
      e.stopImmediatePropagation(); // phím đàn không sang điều khiển đi / thanh công cụ
      e.preventDefault();
    };
    if (this.mode === 'chon') {
      if (e.code === 'Digit1') (own(), this.setMode('tudo'));
      else if (e.code === 'Digit2') (own(), this.setMode('bai'));
      return;
    }
    if (this.mode === 'theo') {
      if (!(e.code in CAM_KEYS)) return;
      own();
      const lane = songLaneOfKey(e.code); // theo bài: chỉ phím 1–5 (R-CAM-3)
      if (lane !== null) this.lane(lane);
      return;
    }
    if (this.mode !== 'tudo' || !(e.code in CAM_KEYS)) return;
    own();
    const midi = CAM_KEYS[e.code];
    const low = CAM_LOW.indexOf(midi as (typeof CAM_LOW)[number]);
    const high = CAM_HIGH.indexOf(midi as (typeof CAM_HIGH)[number]);
    if (low >= 0) this.hud.glow(1, low);
    else if (high >= 0) this.hud.glow(0, high);
    this.strum(midi);
  }

  /** Điều khiển thử trên Console (`__hocXaDanCam`). */
  console(): Record<string, unknown> {
    return {
      ngoi: () => this.sit(),
      tuDo: () => this.setMode('tudo'),
      bai: (id: string, tuDong = false) => this.song(id, tuDong),
      gay: (code: string) => (code in CAM_KEYS ? (this.strum(CAM_KEYS[code]), true) : false),
      dung: () => this.leave(),
      baiList: () => SONGS.map((s) => s.id),
    };
  }
}
