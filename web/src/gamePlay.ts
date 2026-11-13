/**
 * Ghép trò chơi khu giao lưu (R-GIAO-1, R-CO-1..3, R-DAU-1): ngồi vào bàn, camera nhìn xuống bàn, chạm ô → quân,
 * NPC đáp, hết ván → NPC nói qua khung thoại. Cùng tầng với `main.ts` (ghép lớp) — tách ra cho `main.ts` gọn.
 * HUD trong ván (lượt, điểm, câu hỏi Đấu chữ) chờ thiết kế (phiếu 2026-11-13-tro-choi-giao-luu).
 */
import * as THREE from 'three';
import type { Colliders } from './collision/colliders';
import { BLACK, Gomoku, WHITE, npcMove } from './games/gomoku';
import { makeQuestions } from './games/charDuel';
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

/** Lời NPC (R-CO-3, R-DAU-1). */
export const GAME_LINES = {
  coThua: 'Đạo hữu cao tay quá!',
  coThang: 'Ha, lần này đệ thắng rồi!',
  coHoa: 'Ngang tài ngang sức!',
  dauChuaHoc: 'Con hãy tới Rừng trúc tu luyện trước, học vài bộ thủ rồi lại đây đấu với lão.',
  dauSapMo: 'Lão đang soạn đề đấu chữ, ít hôm nữa con quay lại nhé.',
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
  /** NPC `npcId` nói một câu qua khung thoại; đóng khung → `onClose` */
  say(npcId: string, text: string, onClose: () => void): void;
  /** bộ thủ đã học (R-DAU-1) */
  learned(): ReadonlySet<string>;
}

interface Seated {
  table: GameTable;
  /** chỉ số ghế trong `table.seats` (bàn dài: 0 phía +z, 1 phía −z) */
  seat: number;
  gomoku: Gomoku | null;
  /** NPC đang "nghĩ": còn bao nhiêu giây (R-CO-2) */
  npcWait: number;
  /** đang hiện câu kết / câu thoại — không nhận chạm */
  speaking: boolean;
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
    this.seated = { table, seat, gomoku: null, npcWait: 0, speaking: false };
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
    s.table.setStones(s.gomoku.cells);
    s.table.highlight([]);
  }

  /** R-DAU-1: chưa học bộ nào → câu thoại, không có ván. Đấu chữ đủ cần HUD (chờ thiết kế) → tạm báo sắp mở. */
  private startDuel(): void {
    const s = this.seated;
    if (!s) return;
    s.speaking = true;
    const none = makeQuestions([...this.host.learned()]).length === 0;
    this.host.say(s.table.spec.npc, none ? GAME_LINES.dauChuaHoc : GAME_LINES.dauSapMo, () => {
      if (this.seated === s) s.speaking = false;
    });
  }

  /** Đứng dậy / rời bàn: ván bỏ, bàn dọn sạch (R-GIAO-1). */
  private leave(): void {
    const s = this.seated;
    if (!s) return;
    s.table.setStones(new Uint8Array(169));
    s.table.highlight([]);
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
    if (!s || !g || s.speaking || g.result || g.turn !== BLACK || s.npcWait > 0) return false;
    if (!g.play(pt.x, pt.y)) return false;
    s.table.setStones(g.cells);
    s.table.highlight([]);
    if (g.result) this.endGomoku();
    else s.npcWait = 0.5 + Math.random() * 0.5; // R-CO-2: 0,5–1 giây
    return true;
  }

  /** Ván cờ đang chơi (đọc, cho test / HUD sau này). */
  get gomoku(): Gomoku | null {
    return this.seated?.gomoku ?? null;
  }

  private endGomoku(): void {
    const s = this.seated;
    const g = s?.gomoku;
    if (!s || !g?.result) return;
    s.table.highlight(g.result.line);
    s.speaking = true;
    const w = g.result.winner;
    const text = w === BLACK ? GAME_LINES.coThua : w === WHITE ? GAME_LINES.coThang : GAME_LINES.coHoa;
    this.host.say(s.table.spec.npc, text, () => {
      if (this.seated === s) this.newGomoku(); // R-CO-3: đóng thoại → ván mới, người đi trước
    });
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
    const g = s.gomoku;
    if (!g || s.npcWait <= 0) return;
    s.npcWait -= dt;
    if (s.npcWait > 0) return;
    s.npcWait = 0;
    const m = npcMove(g.cells, WHITE);
    g.play(m.x, m.y);
    s.table.setStones(g.cells);
    s.table.highlight(g.result ? [] : [m]); // vòng sáng nhỏ: nước NPC vừa đi
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
