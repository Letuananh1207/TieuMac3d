/**
 * Ghép tiểu nhị mang trà tới chỗ ngồi ở trà lâu (R-TRA-1; kế hoạch `docs/tasks/2026-11-16-tieu-nhi-mang-tra.md`) — tách khỏi
 * `main.ts` như `townNpcs.ts`. Người chơi ngồi một chỗ trong trà lâu (`SeatSpot.serve`) → máy trạng thái `zones/teaService.ts`
 * (chờ 2 s → đi → rót 2 s → về); đường dựng theo chỗ (`scene/teaPath.ts`, nhớ lại). Mỗi khung đặt tiểu nhị theo quãng `s`: vị
 * trí, độ cao đúng tầng (`heightAt(x, z, yTrước)`), hướng mặt xoay mượt, dáng đi, cầm ấm, rót; rời quầy gỡ vật cản, về quầy
 * gắn lại; đang về mà người chơi chắn trước mặt thì đứng chờ. Chỉ chạy khi cảnh có trà lâu + tiểu nhị là NPC biết đi (có model).
 */
import type { Circle } from './collision/colliders';
import type { XZ } from './collision/gridPath';
import { ROT, ROT_LEN } from './player/lamVuonDang';
import { NPC_RADIUS, type MovingNpc, type Npc } from './player/npc';
import { isBlocking } from './player/npcRoute';
import { polylineAt, TeaPaths, type TeaService as TeaStops } from './scene/teaPath';
import { TEA_SPEED, TeaService, type TeaOutput } from './zones/teaService';

export const TIEU_NHI = 'tieu-nhi';
/** Xoay mặt tối đa (rad/s) — quay đầu khi khách đứng dậy, quay về chỗ ngồi lúc rót. */
const TURN_RATE = 7;

export interface TieuNhiHost {
  /** mặt đất đi được; `fromY` = chân khung trước → chọn đúng tầng (thang, tầng 2) */
  heightAt(x: number, z: number, fromY?: number): number;
  colliders: { remove(o: Circle): void; addCircle(x: number, z: number, r: number): Circle };
  /** nói lên kênh chung */
  chatSay(npcId: string, text: string): void;
}

const isMoving = (n: Npc): n is MovingNpc => 'character' in n && 'motion' in n;
const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

export class TieuNhi {
  private readonly service = new TeaService();
  private readonly paths: TeaPaths;
  private readonly home: XZ;
  private readonly homeYaw: number;
  private seated: number | null = null;
  private out: TeaOutput | null = null;
  private yaw: number;

  /** Tiểu nhị (NPC biết đi) + trà lâu gần nhất có mốc phục vụ; thiếu một trong hai → `null` (không ai mang trà). */
  static create(npcs: readonly Npc[], services: readonly TeaStops[], host: TieuNhiHost): TieuNhi | null {
    const n = npcs.find((q) => q.id === TIEU_NHI);
    if (!n || !isMoving(n) || services.length === 0) return null;
    const d = (s: TeaStops): number => Math.hypot(s.behind[0][0][0] - n.spec.x, s.behind[0][0][1] - n.spec.z);
    const svc = [...services].sort((a, b) => d(a) - d(b))[0];
    return new TieuNhi(n, svc, host);
  }

  constructor(
    readonly npc: MovingNpc,
    readonly stops: TeaStops,
    private readonly host: TieuNhiHost,
  ) {
    this.home = [npc.spec.x, npc.spec.z];
    this.homeYaw = ((npc.spec.rotY ?? 0) * Math.PI) / 180;
    this.yaw = this.homeYaw;
    this.paths = new TeaPaths(stops, this.home);
  }

  /** Người chơi vừa ngồi (nút "Ngồi"): chỗ trong trà lâu này → tiểu nhị mang trà; chỗ khác → không. */
  sit(spot: { serve?: { room: string; i: number } }): void {
    this.seated = spot.serve && spot.serve.room === this.stops.room ? spot.serve.i : null;
  }

  /** Người chơi đứng dậy. */
  stand(): void {
    this.seated = null;
  }

  /** Chén trà khi nhìn từ mắt (`NgoiMat.setTea`): `false` chưa rót · `true` đã rót · `null` không phải chỗ tiểu nhị mang. */
  get tea(): boolean | null {
    if (this.seated === null || !this.paths.get(this.seated)) return null;
    return this.out?.served ?? false;
  }

  /** Đứng ở quầy → có nút "Nói chuyện" (R-NPC-3). */
  get canTalk(): boolean {
    return this.out?.canTalk ?? true;
  }

  /** Mỗi khung — gọi trước `showNearNpcs` (tiểu nhị đổi vị trí; ẩn ngoài 35 m vẫn đi tiếp). */
  update(dt: number, player: XZ): void {
    const n = this.npc;
    const at = n.root.position;
    const blocked = this.out?.phase === 've' && isBlocking(at.x, at.z, this.yaw, player[0], player[1]);
    const o = this.service.step({ dt, seated: this.seated, length: (i) => this.paths.get(i)?.length ?? null, blocked });
    this.out = o;
    let x = this.home[0];
    let z = this.home[1];
    let want = this.homeYaw;
    const line = o.route === null ? null : this.paths.get(o.route);
    if (line) {
      const p = polylineAt(line, o.s);
      x = p.x;
      z = p.z;
      want = o.phase === 've' ? p.yaw + Math.PI : p.yaw;
      if (o.phase === 'rot') want = this.stops.seats[o.route!]?.face ?? want; // quay về chỗ ngồi lúc rót
    }
    const turn = wrap(want - this.yaw);
    this.yaw = wrap(this.yaw + Math.sign(turn) * Math.min(Math.abs(turn), TURN_RATE * dt));
    const y = this.host.heightAt(x, z, at.y);
    at.set(x, Number.isFinite(y) ? y : at.y, z);
    n.character.facing.rotation.y = this.yaw;
    const walking = o.phase === 'di' || (o.phase === 've' && !blocked && o.s > 0);
    n.motion.mps = walking ? TEA_SPEED : 0;
    n.motion.hold = o.phase === 'di' || o.phase === 'rot' || o.phase === 've' ? ROT : undefined; // cầm ấm trà
    n.motion.work = o.phase === 'rot' ? { id: ROT, t: o.t, len: ROT_LEN } : undefined;
    n.motion.watch = o.canTalk;
    this.syncBlock(o.route === null);
    if (o.say) this.host.chatSay(n.id, o.say);
  }

  /** Vật cản tròn 0,45 chỉ khi đứng ở quầy (R-NPC-1, R-TRA-1). */
  private syncBlock(atCounter: boolean): void {
    const n = this.npc;
    if (!atCounter && n.block) {
      this.host.colliders.remove(n.block);
      n.block = undefined;
    } else if (atCounter && !n.block) n.block = this.host.colliders.addCircle(this.home[0], this.home[1], NPC_RADIUS);
  }
}
