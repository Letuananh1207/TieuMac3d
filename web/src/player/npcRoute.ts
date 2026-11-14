/**
 * NPC đi theo đường vòng cố định, chỗ đứng tính theo **đồng hồ thật** (R-NPC-7, R-NPC-8): mở app lúc nào cũng thấy NPC ở
 * đúng chỗ của giờ đó, hai máy cùng giờ thấy cùng chỗ. Lệch cục bộ khi bị chặn / đang thoại: đứng lại, tích "nợ" quãng
 * đường, sau đó đi nhanh ×1,3 cho tới hết nợ (đang ẩn thì nhảy thẳng về chỗ đúng). Thuần (không three, không DOM).
 * Hướng: yaw 0 = mặt nhìn về +z (như `rotY` của đặc tả), yaw = atan2(dx, dz).
 */

export type XZ = readonly [number, number];

/** Đường vòng khép kín (điểm cuối nối về điểm đầu). */
export interface Route {
  readonly points: readonly XZ[];
  /** quãng tích luỹ tới đầu mỗi đoạn; `cum[i]` = đầu đoạn i (điểm i → điểm i+1) */
  readonly cum: readonly number[];
  /** hướng (yaw, rad) của từng đoạn */
  readonly yaw: readonly number[];
  readonly length: number;
}

/** Dừng ở đầu mỗi giờ để gõ mõ, rao (R-NPC-8). */
export const HOUR_PAUSE_SEC = 12;
/** Đuổi kịp chỗ theo giờ: nhanh gấp chừng này (R-NPC-7). */
export const CATCH_UP = 1.3;
/** Bị chặn: người chơi trong cung ±60° phía trước, cách < 1,3 m (R-NPC-7). */
export const BLOCK_DIST = 1.3;
export const BLOCK_HALF_ANGLE = Math.PI / 3;
/** Chờ quá chừng này giây thì nói "nhường lão một bước" (một lần mỗi lần bị chặn). */
export const BLOCK_SAY_AFTER = 3;
/** Xoay mượt ở góc: bắt đầu xoay trước góc / xong sau góc chừng này mét. */
export const TURN_RADIUS = 0.8;

const DAY = 86_400;
const VN_OFFSET_SEC = 7 * 3600;

/** Dựng đường từ các điểm (≥ 2, khép kín). */
export function buildRoute(points: readonly XZ[]): Route {
  if (points.length < 2) throw new Error('route: cần ít nhất 2 điểm');
  const cum: number[] = [];
  const yaw: number[] = [];
  let len = 0;
  for (let i = 0; i < points.length; i++) {
    const [ax, az] = points[i];
    const [bx, bz] = points[(i + 1) % points.length];
    cum.push(len);
    yaw.push(Math.atan2(bx - ax, bz - az));
    len += Math.hypot(bx - ax, bz - az);
  }
  return { points, cum, yaw, length: len };
}

/**
 * Số giây NPC **đã đi** (không tính 12 s dừng đầu mỗi giờ) tính từ 0 giờ VN ngày 1970-01-01, tại mốc UTC `nowMs`.
 * Liên tục qua nửa đêm (không nhảy chỗ lúc 0 giờ).
 */
export function walkedSeconds(nowMs: number, pause = HOUR_PAUSE_SEC): number {
  const t = nowMs / 1000 + VN_OFFSET_SEC;
  const hours = Math.floor(t / 3600);
  const inHour = t - hours * 3600;
  return hours * (3600 - pause) + Math.max(0, inHour - pause);
}

/** Đang trong 12 s dừng đầu giờ? (giây trong giờ VN < `pause`) */
export function inHourPause(nowMs: number, pause = HOUR_PAUSE_SEC): boolean {
  const t = nowMs / 1000 + VN_OFFSET_SEC;
  return ((t % 3600) + 3600) % 3600 < pause;
}

/** Quãng đường (chưa quấn vòng) theo đồng hồ: giây đã đi × tốc độ. */
export function clockDistance(nowMs: number, speed: number, pause = HOUR_PAUSE_SEC): number {
  return walkedSeconds(nowMs, pause) * speed;
}

const wrapAngle = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));
const lerpAngle = (a: number, b: number, t: number): number => a + wrapAngle(b - a) * t;

/** Điểm + hướng ở quãng `s` (quấn vòng). Ở góc xoay mượt trong ±`TURN_RADIUS`. */
export function pointAt(route: Route, s: number): { x: number; z: number; yaw: number } {
  const L = route.length;
  const d = ((s % L) + L) % L;
  const n = route.points.length;
  let i = n - 1;
  while (i > 0 && route.cum[i] > d) i--;
  const segLen = (i + 1 < n ? route.cum[i + 1] : L) - route.cum[i];
  const t = segLen > 0 ? (d - route.cum[i]) / segLen : 0;
  const [ax, az] = route.points[i];
  const [bx, bz] = route.points[(i + 1) % n];
  const x = ax + (bx - ax) * t;
  const z = az + (bz - az) * t;
  // xoay mượt: gần cuối đoạn → nửa đầu của cú xoay sang đoạn sau; gần đầu đoạn → nửa sau của cú xoay từ đoạn trước
  const r = Math.min(TURN_RADIUS, segLen / 2);
  const toEnd = segLen - (d - route.cum[i]);
  const fromStart = d - route.cum[i];
  let yaw = route.yaw[i];
  if (r > 0 && toEnd < r) yaw = lerpAngle(route.yaw[i], route.yaw[(i + 1) % n], 0.5 * (1 - toEnd / r));
  else if (r > 0 && fromStart < r) yaw = lerpAngle(route.yaw[(i - 1 + n) % n], route.yaw[i], 0.5 + 0.5 * (fromStart / r));
  return { x, z, yaw: wrapAngle(yaw) };
}

/** Người chơi ở (px, pz) có chặn trước mặt NPC ở (x, z) hướng `yaw` không (R-NPC-7). */
export function isBlocking(x: number, z: number, yaw: number, px: number, pz: number): boolean {
  const dx = px - x;
  const dz = pz - z;
  const d = Math.hypot(dx, dz);
  if (d >= BLOCK_DIST) return false;
  if (d < 1e-6) return true;
  return Math.abs(wrapAngle(Math.atan2(dx, dz) - yaw)) <= BLOCK_HALF_ANGLE;
}

export interface WalkerStep {
  x: number;
  z: number;
  /** hướng mặt (rad) */
  yaw: number;
  /** tốc độ thật khung này (m/s) — cho dáng đi */
  mps: number;
  /** đúng khung này vừa bị chặn quá 3 s → nói "nhường lão một bước" một lần */
  sayBlocked: boolean;
}

export interface WalkerInput {
  /** quãng theo đồng hồ (`clockDistance`), chưa quấn vòng */
  target: number;
  /** đang thoại với người chơi → đứng lại, quay về phía người chơi */
  talking: boolean;
  /** NPC đang ẩn (ngoài 35 m) → nhảy thẳng về chỗ đúng */
  hidden: boolean;
  /** vị trí người chơi (x, z) — kiểm chặn, quay mặt khi thoại */
  player: XZ;
}

/**
 * Trạng thái đi của một NPC trên đường: bám quãng theo đồng hồ, đứng lại khi bị chặn / thoại, đuổi kịp ×1,3 sau đó.
 */
export class RouteWalker {
  private s: number | null = null;
  private blockedFor = 0;
  private said = false;
  private faceYaw = 0;

  constructor(
    private readonly route: Route,
    private readonly speed: number,
  ) {}

  /** Nợ quãng hiện tại (m) — cho test / gỡ lỗi. */
  debt(target: number): number {
    return this.s === null ? 0 : Math.max(0, target - this.s);
  }

  step(dt: number, inp: WalkerInput): WalkerStep {
    if (this.s === null || inp.hidden || inp.target < this.s || inp.target - this.s > this.route.length) this.s = inp.target;
    const here = pointAt(this.route, this.s);
    if (inp.talking) {
      this.blockedFor = 0;
      this.said = false;
      this.faceYaw = Math.atan2(inp.player[0] - here.x, inp.player[1] - here.z);
      return { x: here.x, z: here.z, yaw: this.faceYaw, mps: 0, sayBlocked: false };
    }
    const behind = inp.target - this.s;
    const wantsMove = behind > 1e-9;
    if (wantsMove && !inp.hidden && isBlocking(here.x, here.z, here.yaw, inp.player[0], inp.player[1])) {
      this.blockedFor += dt;
      const say = !this.said && this.blockedFor > BLOCK_SAY_AFTER;
      if (say) this.said = true;
      return { x: here.x, z: here.z, yaw: here.yaw, mps: 0, sayBlocked: say };
    }
    this.blockedFor = 0;
    this.said = false;
    const before = this.s;
    // bám đồng hồ: còn nợ quá một bước thường → đi nhanh ×1,3; không thì bám đúng chỗ
    if (behind <= this.speed * dt * 1.0001) this.s = inp.target;
    else this.s = Math.min(inp.target, this.s + this.speed * CATCH_UP * dt);
    const p = pointAt(this.route, this.s);
    return { x: p.x, z: p.z, yaw: p.yaw, mps: dt > 0 ? (this.s - before) / dt : 0, sayBlocked: false };
  }
}

/** Mốc ms bắt đầu ngày VN chứa `nowMs` (test / gỡ lỗi). */
export const startOfVnDayMs = (nowMs: number): number => (Math.floor((nowMs / 1000 + VN_OFFSET_SEC) / DAY) * DAY - VN_OFFSET_SEC) * 1000;
