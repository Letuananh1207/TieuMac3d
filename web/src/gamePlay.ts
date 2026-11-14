/**
 * Ghép trò chơi khu giao lưu (R-GIAO-1, R-CO-1..3, R-DAU-1/2): ngồi vào bàn, camera nhìn xuống bàn, chạm ô → quân / chạm
 * nghĩa, NPC đáp, hết ván → thẻ kết quả. Dựng `GameView` cho HUD (`ui/gameHud.ts`, thiết kế 2026-11-13.27). Cùng tầng
 * với `main.ts` (ghép lớp) — tách ra cho `main.ts` gọn.
 */
import * as THREE from 'three';
import type { Colliders } from './collision/colliders';
import { BLACK, Gomoku, WHITE, npcMove } from './games/gomoku';
import { makeQuestions, meaningLabel, radicalDetail } from './games/charDuel';
import { DuelRound } from './games/duelRound';
import type { GameNpc, GameResult, GameView } from './ui/gameView';
import { NPC_RADIUS, createNpc, type Npc } from './player/npc';
import type { BoardPoint, GameTable } from './scene/gameTable';
import type { SeatSpot } from './zones/seats';

/** R-GIAO-1: đứng cách ghế dưới khoảng này (m) thì Ngồi = ngồi vào bàn. */
export const TABLE_SIT_DIST = 1.5;

/** Ghế bàn chơi cho nút nổi (R-NGOI-1): chỗ ngồi + chỗ chơi + chỉ số ghế. */
export interface TableSeat extends SeatSpot {
  table: GameTable;
  seat: number;
}

/** Lời NPC (R-CO-3, R-DAU-1, R-DAU-2). `coThua` / `dauThua` = NPC thua (người thắng). */
export const GAME_LINES = {
  coThua: 'Đạo hữu cao tay quá!',
  coThang: 'Ha, lần này đệ thắng rồi!',
  coHoa: 'Ngang tài ngang sức!',
  dauChuaHoc: 'Con hãy tới Rừng trúc tu luyện trước, học vài bộ thủ rồi lại đây đấu với lão.',
  dauChuaHocRoi: 'Vâng, con đi đây (rời bàn)',
  dauThua: 'Khá lắm! Con nhớ bộ thủ chắc hơn lão tưởng.',
  dauThang: 'Lần này lão hơn một chút. Ôn thêm rồi lại đấu nhé con.',
  dauHoa: 'Ngang tay rồi — con với lão cùng đấu ván nữa chứ?',
} as const;

/** Phần của `PlayerController` mà trò chơi dùng (test thay bằng bản giả). */
export interface SeatablePlayer {
  readonly position: THREE.Vector3;
  readonly isSitting: boolean;
  moveTarget: THREE.Vector3 | null;
  toggleSit(): void;
}

export interface GamePlayHost {
  scene: THREE.Scene;
  colliders: Colliders;
  player: SeatablePlayer;
  /** đặt hướng nhìn nhân vật (radian) */
  face(rotY: number): void;
  groundAt(x: number, z: number): number;
  /** NPC `npcId` nói một câu qua khung thoại (lựa chọn [choice], mặc định "Vâng"); đóng khung → `onClose` */
  say(npcId: string, text: string, onClose: () => void, choice?: string): void;
  /** bộ thủ đã học (R-DAU-1) */
  learned(): ReadonlySet<string>;
  /** tên NPC theo mã (thẻ kết quả, thẻ điểm) */
  npcInfo?(npcId: string): { name: string; han?: string } | undefined;
}

interface Seated {
  table: GameTable;
  /** chỉ số ghế trong `table.seats` (bàn dài: 0 phía +z, 1 phía −z) */
  seat: number;
  gomoku: Gomoku | null;
  /** NPC đang "nghĩ": còn bao nhiêu giây (R-CO-2) */
  npcWait: number;
  /** đang hiện câu thoại (Đấu chữ chưa học) — không nhận chạm */
  speaking: boolean;
  /** ván Đấu chữ đang chơi */
  round: DuelRound | null;
  /** tỉ số phiên Ngũ Tử Kỳ: số ván thắng từ lúc ngồi (R-CO-3) */
  wins: { you: number; npc: number };
  /** thẻ kết quả ván vừa xong — chờ "Ván mới" / "Rời bàn" */
  result: GameResult | null;
}

export class GamePlay {
  private seated: Seated | null = null;
  private npcs: Npc[] = [];
  private readonly ray = new THREE.Raycaster();
  private readonly ndc = new THREE.Vector2();
  private readonly look = new THREE.Vector3();

  constructor(
    private readonly tables: readonly GameTable[],
    private readonly host: GamePlayHost,
  ) {}

  /** Dựng NPC đứng sau mỗi bàn (bản riêng — không nói chuyện, R-NPC-2 chỉ cho `npcs` của đặc tả). */
  async placeNpcs(): Promise<string[]> {
    const problems: string[] = [];
    for (const t of this.tables) {
      if (!t.npcSpot) continue; // bàn dài: NPC không đứng ở bàn, chỉ nói qua khung thoại (R-GIAO-1)
      const { x, z, rotY } = t.npcSpot;
      try {
        const npc = await createNpc({ id: t.spec.npc, x, z, rotY });
        if (!npc) {
          problems.push(`gameTables: thiếu model "${t.spec.npc}" — bàn "${t.spec.id}" không có NPC`);
          continue;
        }
        const y = this.host.groundAt(x, z);
        npc.root.position.set(x, Number.isFinite(y) ? y : 0, z);
        this.host.scene.add(npc.root);
        this.host.colliders.addCircle(x, z, NPC_RADIUS);
        this.npcs.push(npc);
      } catch (e) {
        problems.push(`gameTables: không nạp được NPC "${t.spec.npc}" — ${String(e)}`);
      }
    }
    return problems;
  }

  get active(): boolean {
    return this.seated !== null;
  }

  /** Ghế gần người chơi nhất (mọi chỗ chơi, mọi phía), dưới `TABLE_SIT_DIST`; không có → `undefined`. */
  private nearSeat(x: number, z: number): { table: GameTable; seat: number } | undefined {
    let best: { table: GameTable; seat: number } | undefined;
    let bestD = TABLE_SIT_DIST;
    for (const table of this.tables) {
      table.seats.forEach((s, seat) => {
        const d = Math.hypot(s.x - x, s.z - z);
        if (d < bestD) {
          bestD = d;
          best = { table, seat };
        }
      });
    }
    return best;
  }

  /** Ghế đang ngồi chơi (chỉ số trong `seats`); không ngồi → −1. */
  get seatIndex(): number {
    return this.seated?.seat ?? -1;
  }

  /** Mọi ghế bàn chơi (R-NGOI-1: nút nổi "Vào bàn"). */
  seatSpots(): TableSeat[] {
    return this.tables.flatMap((table) =>
      table.seats.map((s, seat) => ({ x: s.x, y: s.y, z: s.z, rotY: s.rotY, kind: 'ban-choi' as const, table, seat })),
    );
  }

  /** Bấm nút "Vào bàn" (R-NGOI-1): ngồi vào đúng ghế `spot`, ván mới ở chỗ đó; đang ngồi → `false`. */
  sitAt(spot: TableSeat): boolean {
    const p = this.host.player;
    if (p.isSitting || this.seated) return false;
    const { table, seat } = spot;
    const at = table.seats[seat];
    p.moveTarget = null;
    p.position.set(at.x, at.y, at.z);
    this.host.face(at.rotY);
    p.toggleSit();
    this.seated = { table, seat, gomoku: null, npcWait: 0, speaking: false, round: null, wins: { you: 0, npc: 0 }, result: null };
    if (table.spec.kind === 'co') this.newGomoku();
    else this.startDuel();
    return true;
  }

  /** Nút Ngồi (R-GIAO-1): đang đứng gần ghế một bàn → ngồi vào bàn, bắt đầu ván; trả `true` nếu đã xử lý. */
  trySit(): boolean {
    const p = this.host.player;
    if (p.isSitting || this.seated) return false;
    const near = this.nearSeat(p.position.x, p.position.z);
    if (!near) return false;
    const at = near.table.seats[near.seat];
    return this.sitAt({ x: at.x, y: at.y, z: at.z, rotY: at.rotY, kind: 'ban-choi', ...near });
  }

  private newGomoku(): void {
    const s = this.seated;
    if (!s) return;
    s.gomoku ??= new Gomoku();
    s.gomoku.reset();
    s.npcWait = 0;
    s.speaking = false;
    s.result = null;
    s.table.setStones(s.gomoku.cells);
    s.table.highlight([]);
    s.table.mark(null);
  }

  /** R-DAU-1: chưa học bộ nào → câu thoại + "Vâng, con đi đây (rời bàn)", không có ván; có → 10 câu (R-DAU-2). */
  private startDuel(): void {
    const s = this.seated;
    if (!s) return;
    s.result = null;
    const questions = makeQuestions([...this.host.learned()]);
    if (questions.length === 0) {
      s.speaking = true;
      s.round = null;
      s.table.showCard(null, s.seat);
      this.host.say(
        s.table.spec.npc,
        GAME_LINES.dauChuaHoc,
        () => {
          if (this.seated === s) this.stand();
        },
        GAME_LINES.dauChuaHocRoi,
      );
      return;
    }
    s.round = new DuelRound(questions);
    s.table.showCard(s.round.question?.radical.form ?? null, s.seat);
  }

  /** Rời bàn (nút "Rời bàn", phím Esc — R-GIAO-1): đứng dậy, ván bỏ, bàn dọn sạch. */
  stand(): void {
    if (!this.seated) return;
    if (this.host.player.isSitting) this.host.player.toggleSit();
    this.leave();
  }

  /** "Ván mới" trên thẻ kết quả (R-CO-3, R-DAU-2): bàn dọn, ván mới; vẫn ngồi. */
  newRound(): void {
    const s = this.seated;
    if (!s?.result) return;
    if (s.table.spec.kind === 'co') this.newGomoku();
    else this.startDuel();
  }

  /** Đứng dậy / rời bàn: ván bỏ, bàn dọn sạch (R-GIAO-1). */
  private leave(): void {
    const s = this.seated;
    if (!s) return;
    s.table.setStones(new Uint8Array(169));
    s.table.highlight([]);
    s.table.mark(null);
    s.table.showCard(null, s.seat);
    this.seated = null;
  }

  /** Chạm màn hình khi đang ngồi chơi: chạm vào bàn (không đi). Trả `true` = đã dùng chạm. */
  tap(clientX: number, clientY: number, camera: THREE.Camera): boolean {
    const s = this.seated;
    if (!s) return false;
    this.ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    this.ray.setFromCamera(this.ndc, camera);
    const hit = this.ray.intersectObject(s.table.top)[0];
    const pt = hit ? s.table.pointAt(hit.point) : null;
    if (pt) this.playAt(pt);
    return true;
  }

  /** Người đặt quân vào giao điểm `pt` (R-CO-1): chỉ lượt người, NPC không đang nghĩ, ván chưa xong; sai → bỏ qua. */
  playAt(pt: BoardPoint): boolean {
    const s = this.seated;
    const g = s?.gomoku;
    if (!s || !g || s.speaking || s.result || g.result || g.turn !== BLACK || s.npcWait > 0) return false;
    if (!g.play(pt.x, pt.y)) return false;
    s.table.setStones(g.cells);
    s.table.mark(pt); // chấm son: nước vừa đi
    if (g.result) this.endGomoku();
    else s.npcWait = 0.5 + Math.random() * 0.5; // R-CO-2: 0,5–1 giây
    return true;
  }

  /** Ván cờ đang chơi (đọc, cho test / HUD sau này). */
  get gomoku(): Gomoku | null {
    return this.seated?.gomoku ?? null;
  }

  /** Hết ván cờ (R-CO-3): 5 quân thắng sáng, cộng tỉ số phiên, thẻ kết quả. */
  private endGomoku(): void {
    const s = this.seated;
    const g = s?.gomoku;
    if (!s || !g?.result) return;
    s.table.highlight(g.result.line);
    s.table.mark(null);
    const w = g.result.winner;
    if (w === BLACK) s.wins.you++;
    else if (w === WHITE) s.wins.npc++;
    s.result = {
      outcome: w === BLACK ? 'thang' : w === WHITE ? 'thua' : 'hoa',
      you: s.wins.you,
      npc: s.wins.npc,
      line: w === BLACK ? GAME_LINES.coThua : w === WHITE ? GAME_LINES.coThang : GAME_LINES.coHoa,
    };
  }

  /** Người chạm một nghĩa Đấu chữ (R-DAU-2: chạm là chọn). */
  pick(option: number): boolean {
    const s = this.seated;
    if (!s?.round || s.result) return false;
    return s.round.choose(option);
  }

  /** Hết 10 câu (R-DAU-2): thẻ kết quả với điểm ván. */
  private endDuel(): void {
    const s = this.seated;
    const r = s?.round;
    if (!s || !r) return;
    const { nguoi, npc } = r.duel.score;
    const outcome = nguoi > npc ? 'thang' : nguoi < npc ? 'thua' : 'hoa';
    const line = outcome === 'thang' ? GAME_LINES.dauThua : outcome === 'thua' ? GAME_LINES.dauThang : GAME_LINES.dauHoa;
    s.result = { outcome, you: nguoi, npc, line };
    s.table.showCard(null, s.seat);
  }

  private npcOf(s: Seated): GameNpc {
    const id = s.table.spec.npc;
    const info = this.host.npcInfo?.(id);
    return { id, name: info?.name ?? id, han: info?.han };
  }

  /** Dữ liệu HUD khi đang ngồi chơi; không ngồi / đang thoại "chưa học" → `null`. */
  view(): GameView | null {
    const s = this.seated;
    if (!s || s.speaking) return null;
    const npc = this.npcOf(s);
    const g = s.gomoku;
    if (g) {
      const turn = s.result || g.result ? 'het' : s.npcWait > 0 || g.turn !== BLACK ? 'npc' : 'you';
      return { kind: 'co', npc, you: s.wins.you, npcWins: s.wins.npc, turn, result: s.result };
    }
    const r = s.round;
    const q = r?.question;
    if (!r || !q) return null;
    const cham = r.phase === 'cham' && !s.result;
    const by = r.lastBy === 'npc' ? 'npc' : 'you';
    const answer = `${q.radical.name} · ${q.radical.meaning}`;
    let toast: { right: boolean; text: string } | null = null;
    if (cham && by === 'you') toast = { right: r.lastRight, text: r.lastRight ? 'Đúng rồi! +1 điểm' : `Chưa đúng — ${answer}` };
    else if (cham) toast = { right: r.lastRight, text: r.lastRight ? `${npc.name} đúng · +1` : `${npc.name} sai — ${answer}` };
    return {
      kind: 'dau-chu',
      npc,
      step: r.shown,
      total: r.duel.questions.length,
      marks: r.marks.slice(),
      you: r.duel.score.nguoi,
      npcScore: r.duel.score.npc,
      answerer: q.answerer === 'npc' ? 'npc' : 'you',
      form: q.radical.form,
      detail: radicalDetail(q.radical),
      options: q.options.map((m) => meaningLabel(m)),
      phase: s.result ? 'het' : r.phase,
      optionMarks: q.options.map((_, i) => (!cham ? null : i === q.answer ? 'dung' : i === r.picked ? 'sai' : 'mo')),
      npcPick: cham && by === 'npc' ? r.picked : null,
      toast,
      scored: cham && r.lastRight ? by : null,
      result: s.result,
    };
  }

  /** Mỗi khung hình: NPC bàn cử động, NPC đi cờ khi hết giờ nghĩ, đứng dậy → bỏ ván. */
  update(dt: number): void {
    for (const npc of this.npcs) npc.update(dt);
    const s = this.seated;
    if (!s) return;
    if (!this.host.player.isSitting) {
      this.leave(); // kéo cần điều khiển / bấm Ngồi lần nữa → đứng dậy (R-DIEU-7)
      return;
    }
    const r = s.round;
    if (r && !s.result) {
      const before = r.shown;
      r.update(dt);
      if (r.phase === 'het') this.endDuel();
      else if (r.shown !== before) s.table.showCard(r.question?.radical.form ?? null, s.seat); // câu mới: lật thẻ
      return;
    }
    const g = s.gomoku;
    if (!g || s.npcWait <= 0) return;
    s.npcWait -= dt;
    if (s.npcWait > 0) return;
    s.npcWait = 0;
    const m = npcMove(g.cells, WHITE);
    g.play(m.x, m.y);
    s.table.setStones(g.cells);
    s.table.mark(m); // chấm son: nước NPC vừa đi
    if (g.result) this.endGomoku();
  }

  /**
   * Camera khi ngồi chơi: sau lưng người chơi, cao, nhìn xuống tâm bàn; lùi xa đủ để cả bàn lọt khung ngang (màn dọc).
   * Trả `false` khi không ngồi chơi (camera theo `OrbitCamera` như thường).
   */
  placeCamera(camera: THREE.PerspectiveCamera): boolean {
    const s = this.seated;
    if (!s) return false;
    const c = s.table.center;
    const halfH = THREE.MathUtils.degToRad(camera.fov) / 2;
    const halfW = Math.atan(Math.tan(halfH) * camera.aspect);
    const dist = Math.max(2.2, 0.85 / Math.tan(Math.min(halfW, halfH)));
    const pitch = 1.3; // ~75° nhìn xuống — camera ở trước đầu nhân vật, không bị che
    const back = Math.cos(pitch) * dist;
    const r = s.table.seats[s.seat].rotY; // sau lưng người ngồi: ngược hướng nhìn của ghế
    camera.position.set(c.x - Math.sin(r) * back, c.y + Math.sin(pitch) * dist, c.z - Math.cos(r) * back);
    camera.lookAt(this.look.copy(c));
    return true;
  }
}
