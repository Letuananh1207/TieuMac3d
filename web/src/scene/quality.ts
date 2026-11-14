/**
 * Mức chất lượng theo máy + độ phân giải động (R-HIEU-1; kế hoạch docs/tasks/2026-11-14-muot-ma-nhu-game.md).
 * Như game di động: máy khoẻ vẽ nét (1,5×), máy yếu vẽ thưa điểm ảnh hơn để giữ mượt; chữ / nút là HTML nên luôn nét.
 * Thuần (không DOM, không three) — test được.
 */

export type Tier = 'thap' | 'vua' | 'cao';

export interface TierSpec {
  /** độ phân giải vẽ (pixelRatio) tối đa / tối thiểu bộ điều tiết được dùng */
  maxRatio: number;
  minRatio: number;
  /** khử răng cưa MSAA — chỉ đặt được lúc tạo WebGL */
  antialias: boolean;
}

export const TIERS: Record<Tier, TierSpec> = {
  cao: { maxRatio: 1.5, minRatio: 1.0, antialias: true },
  vua: { maxRatio: 1.25, minRatio: 0.85, antialias: true },
  thap: { maxRatio: 1.0, minRatio: 0.7, antialias: false },
};

/** GPU giả lập phần mềm hoặc đời cũ / yếu (Adreno ≤ 5xx, Mali-4xx / T / G31–G57, PowerVR). */
const WEAK = /swiftshader|llvmpipe|software|adreno[^0-9]*[2-5]\d\d\b|mali-(4\d\d|t\d+|g(31|51|52|57))\b|powervr/i;
/** Tầm trung: Adreno 6xx dưới 640, Mali-G7x. */
const MID = /adreno[^0-9]*6([0-3]\d)\b|mali-g7\d\b/i;

/**
 * Chọn mức theo tên GPU (WEBGL_debug_renderer_info) và RAM (GB, `navigator.deviceMemory` — có thể không có).
 * Đoán sai cũng không sao: bộ điều tiết độ phân giải sửa tiếp lúc chạy.
 */
export function pickTier(gpu: string, memoryGb?: number): Tier {
  let tier: Tier = WEAK.test(gpu) ? 'thap' : MID.test(gpu) ? 'vua' : 'cao';
  if (memoryGb !== undefined && memoryGb <= 3) tier = tier === 'cao' ? 'vua' : 'thap';
  return tier;
}

/** Ngân sách khung 60 fps (ms) và ngưỡng: chậm hơn `SLOW_MS` kéo dài → hạ; nhanh hơn `FAST_MS` kéo dài → thử nâng. */
const SLOW_MS = 19;
const FAST_MS = 17.6; // màn 60 Hz khoá ~16,7 ms: bám sát = dư sức
const STEP = 0.1;
/** chậm kéo dài bao lâu (ms) thì hạ; dư sức bao lâu thì nâng; nâng thất bại thì chờ bao lâu mới thử lại */
const DOWN_AFTER = 1000;
const UP_AFTER = 5000;
const RETRY_AFTER = 30_000;
/** trung bình trượt: trọng số khung mới (khựng lẻ không kéo trung bình lên mấy) */
const EWMA = 0.05;

/**
 * Độ phân giải động: gọi `update(ms)` mỗi khung với thời gian thật của khung; `ratio` = pixelRatio nên dùng.
 * Hạ / nâng từng bậc `STEP`, có trễ và chặn lật qua lật lại.
 */
export class ResolutionGovernor {
  ratio: number;
  private avg = 1000 / 60;
  private slowFor = 0;
  private fastFor = 0;
  /** thời gian từ lần nâng gần nhất (ms) — hạ ngay sau nâng = nâng thất bại */
  private sinceUp = Infinity;
  private blockUp = 0;

  constructor(
    readonly min: number,
    readonly max: number,
  ) {
    this.ratio = max;
  }

  /** Trả `true` nếu `ratio` vừa đổi (cần đặt lại pixelRatio). */
  update(ms: number): boolean {
    const clipped = Math.min(ms, 100); // một khung treo lâu (tab ẩn, GC) không kéo trung bình
    this.avg += (clipped - this.avg) * EWMA;
    this.sinceUp += ms;
    this.blockUp = Math.max(0, this.blockUp - ms);
    this.slowFor = this.avg > SLOW_MS ? this.slowFor + ms : 0;
    this.fastFor = this.avg < FAST_MS ? this.fastFor + ms : 0;
    if (this.slowFor >= DOWN_AFTER && this.ratio > this.min + 1e-9) {
      if (this.sinceUp < UP_AFTER) this.blockUp = RETRY_AFTER; // vừa nâng đã chậm → máy không gánh nổi mức đó
      this.ratio = Math.max(this.min, round(this.ratio - STEP));
      this.reset();
      return true;
    }
    if (this.fastFor >= UP_AFTER && this.blockUp === 0 && this.ratio < this.max - 1e-9) {
      this.ratio = Math.min(this.max, round(this.ratio + STEP));
      this.sinceUp = 0;
      this.reset();
      return true;
    }
    return false;
  }

  /** Đã ở độ nét thấp nhất mà trung bình vẫn chậm hơn ngân sách 60 fps (cho `FrameCap` xuống 30). */
  get strugglingAtMin(): boolean {
    return this.ratio <= this.min + 1e-9 && this.avg > SLOW_MS;
  }

  /** Đo lại từ đầu (vừa quay về 60 fps sau một quãng 30 fps). */
  restart(): void {
    this.reset();
  }

  private reset(): void {
    this.slowFor = 0;
    this.fastFor = 0;
    this.avg = 1000 / 60; // đo lại từ đầu ở độ phân giải mới
  }
}

const round = (v: number): number => Math.round(v * 100) / 100;

/** R-HIEU-2: chậm ở độ nét thấp nhất bao lâu thì xuống 30; ở 30 bao lâu thì thử lại 60; thử hỏng trong bao lâu. */
const TO_30_AFTER = 3000;
const RETRY_60_FIRST = 60_000;
const RETRY_60_MAX = 300_000;
const FAIL_WINDOW = 5000;
/** dung sai (ms): khung tới sớm hơn nhịp chút xíu vẫn vẽ (rAF lệch vài ms) */
const SLACK = 2;

/**
 * Khung hình đều (R-HIEU-2): tối đa 60 fps kể cả màn 120 Hz; máy không gánh nổi (độ nét đã ở đáy mà vẫn chậm) thì
 * 30 fps đều — mượt hơn 40–60 lúc nhanh lúc chậm, mát máy hơn. Thử lại 60 sau 60 s, hỏng thì chờ gấp đôi (tối đa 5 phút).
 */
export class FrameCap {
  fps: 60 | 30 = 60;
  private last = -Infinity;
  private slow = 0;
  private in30 = 0;
  private retryAfter = RETRY_60_FIRST;
  /** thời gian từ lần thử lại 60 gần nhất — xuống 30 trong FAIL_WINDOW = thử hỏng */
  private sinceRetry = Infinity;

  /** Gọi ở mỗi nhịp màn hình (`now` = performance.now()): `true` → vẽ khung này, `false` → bỏ qua nhịp này. */
  shouldRender(now: number): boolean {
    if (now - this.last < 1000 / this.fps - SLACK) return false;
    this.last = now;
    return true;
  }

  /** Gọi sau mỗi khung đã vẽ với thời gian khung (ms). Trả `true` nếu vừa đổi 60 ↔ 30. */
  observe(ms: number, gov: ResolutionGovernor): boolean {
    this.sinceRetry += ms;
    if (this.fps === 60) {
      this.slow = gov.strugglingAtMin ? this.slow + ms : 0;
      if (this.slow < TO_30_AFTER) return false;
      if (this.sinceRetry < FAIL_WINDOW + TO_30_AFTER) this.retryAfter = Math.min(RETRY_60_MAX, this.retryAfter * 2);
      this.fps = 30;
      this.slow = 0;
      this.in30 = 0;
      return true;
    }
    this.in30 += ms;
    if (this.in30 < this.retryAfter) return false;
    this.fps = 60;
    this.sinceRetry = 0;
    gov.restart();
    return true;
  }
}
