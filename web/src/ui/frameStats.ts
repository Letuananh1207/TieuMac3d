/**
 * Thống kê thời gian khung cho bảng gỡ lỗi (đo hiệu năng — kế hoạch 2026-11-14-muot-ma-nhu-game).
 * Game đo "ms / khung" chứ không chỉ fps: 60 fps = 16,7 ms, 30 fps = 33,3 ms. "1 % chậm nhất" cho thấy giật mà fps
 * trung bình che mất; khung > `HITCH_MS` là một lần khựng người chơi thấy được.
 */
export const HITCH_MS = 50;

export interface FrameStats {
  fps: number;
  avgMs: number;
  /** trung bình 1 % khung chậm nhất */
  p99Ms: number;
  /** số khung chậm hơn `HITCH_MS` */
  hitches: number;
}

export function frameStats(ms: readonly number[]): FrameStats {
  if (!ms.length) return { fps: 0, avgMs: 0, p99Ms: 0, hitches: 0 };
  const total = ms.reduce((a, b) => a + b, 0);
  const avgMs = total / ms.length;
  // trung bình 1 % khung chậm nhất (ít nhất 1 khung) — "1 % low" như các công cụ đo game
  const worst = [...ms].sort((a, b) => b - a).slice(0, Math.max(1, Math.floor(ms.length / 100)));
  const p99Ms = worst.reduce((a, b) => a + b, 0) / worst.length;
  const hitches = ms.filter((t) => t > HITCH_MS).length;
  return { fps: 1000 / avgMs, avgMs, p99Ms, hitches };
}

/** Cửa sổ trượt: giữ các khung gần nhất có tổng thời gian không quá `spanMs`. */
export class FrameWindow {
  readonly values: number[] = [];
  private total = 0;

  constructor(private readonly spanMs: number) {}

  push(ms: number): void {
    this.values.push(ms);
    this.total += ms;
    while (this.total > this.spanMs && this.values.length > 1) this.total -= this.values.shift()!;
  }

  clear(): void {
    this.values.length = 0;
    this.total = 0;
  }
}
