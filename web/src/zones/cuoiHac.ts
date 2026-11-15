/**
 * Cưỡi hạc truyền tống (R-HANH-5, kế hoạch docs/tasks/2026-11-15-cuoi-hac.md): dòng thời gian ba khúc + luật bỏ qua +
 * quyết định có hoạt cảnh hay không. Thuần (không three, không DOM) — test `cuoiHac.test.ts`.
 *
 * Khúc `cat` (trang cũ): hạc đáp 0 → 0,8 s, nhân vật lên lưng tới 1,2 s, cất cánh, mây phủ 1,8 → 2,2 s → tải lại trang.
 * Khúc `bay` (trang mới): ít nhất 1,5 s và tới khi cảnh nơi đến dựng xong. Khúc `ha` (cảnh thật): 2 s.
 */

/** Số giây của hoạt cảnh (R-HANH-5). */
export const CRANE_TIMING = {
  /** hạc sà xuống đáp trước mặt */
  arrive: 0.8,
  /** nhân vật nhảy lên lưng xong (ngồi xếp bằng) */
  mount: 1.2,
  /** mây trắng bắt đầu phủ */
  veilFrom: 1.8,
  /** hết khúc cất cánh → tải lại trang */
  takeoff: 2.2,
  /** bay trên biển mây ít nhất */
  flyMin: 1.5,
  /** hạ cánh (cảnh thật) */
  land: 2,
  /** trong khúc hạ: hạc chạm đất, nhân vật nhảy xuống */
  jumpOff: 1.4,
  /** trong khúc hạ: camera bắt đầu về sau lưng */
  camBack: 1.8,
  /** hạc bay đi sau khi điều khiển được */
  leave: 3,
  /** mây phủ nhanh trước khi lộ cảnh thật (hết bay) */
  cover: 0.3,
  /** mây tan ra cảnh thật (hạ cánh / bỏ qua lúc bay) — như màn tải mờ (R-MAN-2) */
  uncover: 0.4,
  /** bỏ qua → vẫn mờ như màn tải (R-MAN-2) */
  skipFade: 0.4,
} as const;

export type CraneLeg = 'cat' | 'bay' | 'ha';

/**
 * Hoạt cảnh bật trong app (thiết kế màn mây + lớp chữ đã áp — 2026-11-15.9). `?hac` vẫn giữ làm cờ thử (bật cả khi
 * hằng này tắt để đo / so).
 */
export const CRANE_IN_APP = true;

/**
 * Đi bằng vòng trận (`vong`), thanh công cụ (`thanh` — nút Bản đồ / Về nhà, R-HANH-6/7) hay cổng đi bộ (`cong`).
 * Vòng trận và thanh cưỡi hạc; cổng đi bộ → màn tải.
 */
export type TravelHow = 'vong' | 'thanh' | 'cong';

/**
 * Có cưỡi hạc không (R-HANH-5/6/7): đi bằng bản đồ truyền tống / nút Về nhà, hoạt cảnh đang bật, máy không bật giảm
 * chuyển động, và **không đứng trong nhà** (`indoor` — trong chân một nhà vào được, kể cả tầng 2: hạc sà xuống xuyên mái).
 */
export function wantsCrane(o: { how: TravelHow; trial: boolean; reducedMotion: boolean; inApp?: boolean; indoor?: boolean }): boolean {
  return o.how !== 'cong' && ((o.inApp ?? CRANE_IN_APP) || o.trial) && !o.reducedMotion && !o.indoor;
}

/**
 * Tham số URL cho trang nơi đến (R-HANH-2/4/6/7): `vung=<mã>` (không có = Khởi Nguyên Trấn, mã `town`); cổng đi bộ thêm
 * `qua=<mã cảnh vừa rời>` (đứng ở cổng về); về trấn bằng bản đồ / thanh thêm `tu=<mã cảnh vừa rời>`; `keys` = tham số
 * thử trên trình duyệt giữ lại qua các chuyến.
 */
export function travelParams(to: string, from: string, how: TravelHow, town: string, keep: URLSearchParams, keys: readonly string[]): URLSearchParams {
  const next = new URLSearchParams();
  if (to !== town) next.set('vung', to);
  if (how === 'cong') next.set('qua', from);
  else if (to === town) next.set('tu', from);
  for (const k of keys) if (keep.has(k)) next.set(k, keep.get(k) ?? '');
  return next;
}

/** Trang mới có đang giữa chuyến bay không: URL có `den=hac` (do khúc cất cánh thêm) và máy không bật giảm chuyển động. */
export function arrivingByCrane(params: URLSearchParams, reducedMotion: boolean): boolean {
  return params.get('den') === 'hac' && !reducedMotion;
}

/** Gợi ý lúc bay: chạm để bỏ qua · đã chạm nhưng cảnh chưa xong → "sắp tới nơi". */
export type CraneHint = 'boQua' | 'sapToi';

/**
 * Đồng hồ một khúc. `update(dt, loaded)` — `loaded` chỉ có nghĩa với khúc `bay` (cảnh thật đã dựng + biên dịch xong).
 * Bỏ qua (R-HANH-5): `cat` → hết ngay (sang bay); `bay` → hết ngay khi cảnh xong, bỏ cả khúc hạ; `ha` → hết ngay.
 */
export class CraneClock {
  t = 0;
  skipped = false;
  private loaded = false;

  constructor(readonly leg: CraneLeg) {}

  update(dt: number, loaded = true): void {
    if (!this.done) this.t += dt;
    this.loaded = loaded;
  }

  skip(): void {
    this.skipped = true;
  }

  /** số giây của khúc (`bay`: tối thiểu) */
  get length(): number {
    return this.leg === 'cat' ? CRANE_TIMING.takeoff : this.leg === 'bay' ? CRANE_TIMING.flyMin : CRANE_TIMING.land;
  }

  get done(): boolean {
    if (this.leg === 'bay') return this.loaded && (this.skipped || this.t >= CRANE_TIMING.flyMin);
    return this.skipped || this.t >= this.length;
  }

  /** 0 → 1 trong khúc (bay: theo thời gian tối thiểu) */
  get k(): number {
    return Math.min(1, this.t / this.length);
  }

  /** mây phủ màn của khúc cất cánh 0 → 1 (1,8 → 2,2 s) */
  get veil(): number {
    if (this.leg !== 'cat') return 0;
    return clamp01((this.t - CRANE_TIMING.veilFrom) / (CRANE_TIMING.takeoff - CRANE_TIMING.veilFrom));
  }

  get hint(): CraneHint {
    return this.skipped && !this.loaded ? 'sapToi' : 'boQua';
  }

  /** bỏ qua lúc bay → không có khúc hạ cánh (đứng ngay ở chỗ xuất hiện) */
  get landsAfter(): boolean {
    return this.leg === 'bay' && !this.skipped;
  }
}

/** Các mốc trong khúc cất cánh / hạ cánh theo giây — cho phần dựng hình chọn dáng. */
export type DepartStage = 'den' | 'len' | 'bayLen';
export function departStage(t: number): DepartStage {
  return t < CRANE_TIMING.arrive ? 'den' : t < CRANE_TIMING.mount ? 'len' : 'bayLen';
}
export type LandStage = 'ha' | 'nhay' | 'veSau';
export function landStage(t: number): LandStage {
  return t < CRANE_TIMING.jumpOff ? 'ha' : t < CRANE_TIMING.camBack ? 'nhay' : 'veSau';
}

/**
 * Tổng số giây từ lúc chạm nơi đến tới lúc điều khiển được (ví dụ R-HANH-5), không tính nhịp tải lại trang.
 * `build`: giây dựng cảnh nơi đến (tính từ đầu khúc bay); `skipAt`: giây chạm bỏ qua trong khúc bay (không có = không chạm).
 */
export function craneTotal(build: number, skipAt?: number): number {
  const fly = skipAt !== undefined ? Math.max(build, Math.min(skipAt, CRANE_TIMING.flyMin)) : Math.max(build, CRANE_TIMING.flyMin);
  const land = skipAt !== undefined && skipAt < fly ? 0 : CRANE_TIMING.land;
  return CRANE_TIMING.takeoff + fly + land;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
