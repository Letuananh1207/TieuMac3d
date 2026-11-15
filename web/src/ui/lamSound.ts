/**
 * Tiếng Trúc Lâm (R-AM-3) **tự tổng hợp** bằng Web Audio — không file, không mạng: róc rách mương (nhiễu hồng lọc dải,
 * lặp), mưa phùn (nhiễu trắng lọc cao, lặp), gỗ "cạch" khi chén lệnh dừng, "rắc" khi hái măng. Phần dựng mẫu + âm lượng
 * là hàm thuần (có test); lớp `LamSound` chỉ nối nút. WebView chặn tiếng khi chưa chạm → mở ở lần chạm / phím kế tiếp.
 */

/** Róc rách: gần hơn chừng này (m) → đầy; xa từ `WATER_SILENT` trở lên → tắt (R-AM-3). */
export const WATER_FULL = 4;
export const WATER_SILENT = 15;
/** Mưa phùn toàn cảnh (R-MANG-2, R-AM-3). */
export const RAIN_LEVEL = 0.25;
export const RAIN_RAMP_SECONDS = 2;
/** Màn che / đổi cảnh → mờ về 0 trong chừng này giây (như R-AM-2). */
export const LAM_RAMP_SECONDS = 1;

/** Âm lượng róc rách theo khoảng cách tới điểm mương gần nhất (chỉ x, z). */
export function waterVolume(dist: number): number {
  if (!(dist > WATER_FULL)) return 1;
  if (dist >= WATER_SILENT) return 0;
  return (WATER_SILENT - dist) / (WATER_SILENT - WATER_FULL);
}

/** Bước [v] về [target] trong [dt] giây, đi hết 0 ↔ 1 trong [seconds]. */
export function ramp(v: number, target: number, dt: number, seconds = LAM_RAMP_SECONDS): number {
  const step = Math.max(0, dt) / seconds;
  return v < target ? Math.min(target, v + step) : Math.max(target, v - step);
}

/** Dãy nhiễu có hạt (LCG) −1…1 — lần nào cũng như nhau. */
function noise(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 31 - 1;
  };
}

/** Chuẩn hoá đỉnh về [peak], mờ đầu / cuối [fade] mẫu (lặp không lách cách). */
function finish(out: Float32Array<ArrayBuffer>, peak: number, fade: number): Float32Array<ArrayBuffer> {
  let m = 0;
  for (const v of out) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < out.length; i++) out[i] *= peak / m;
  const f = Math.min(fade, Math.floor(out.length / 2));
  for (let i = 0; i < f; i++) {
    out[i] *= i / f;
    out[out.length - 1 - i] *= i / f;
  }
  return out;
}

/**
 * Mẫu lặp: `nuoc` = nhiễu hồng lọc dải (~300–1500 Hz) có "sóng" chậm → róc rách; `mua` = nhiễu trắng lọc cao (lách tách
 * mảnh). Dài [seconds].
 */
export function loopSamples(kind: 'nuoc' | 'mua', rate: number, seconds = 3, seed = 3): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.max(1, Math.round(rate * seconds)));
  const rnd = noise(seed);
  let lo = 0;
  let lo2 = 0;
  let pink = 0;
  for (let i = 0; i < out.length; i++) {
    const w = rnd();
    if (kind === 'nuoc') {
      pink = 0.97 * pink + 0.03 * w * 6; // trầm dần (gần nhiễu hồng)
      lo = lo + 0.18 * (pink - lo); // cắt cao
      lo2 = lo2 + 0.02 * (lo - lo2); // cắt thấp: lấy phần dải giữa
      const ripple = 0.6 + 0.4 * Math.sin((i / rate) * 2 * Math.PI * 1.7) * Math.sin((i / rate) * 2 * Math.PI * 0.43);
      out[i] = (lo - lo2) * ripple;
    } else {
      lo = lo + 0.5 * (w - lo);
      out[i] = (w - lo) * (0.7 + 0.3 * Math.abs(rnd()));
    }
  }
  return finish(out, 1, Math.round(rate * 0.05));
}

/** Gỗ "cạch" (chén lệnh dừng — R-LUU-2): sin ~950 Hz tắt nhanh + chút nhiễu gõ, dài 0,18 s. */
export function knockSamples(rate: number): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.round(rate * 0.18));
  const rnd = noise(11);
  for (let i = 0; i < out.length; i++) {
    const t = i / rate;
    out[i] = Math.sin(2 * Math.PI * 950 * t) * Math.exp(-t * 38) + 0.35 * rnd() * Math.exp(-t * 160);
  }
  return finish(out, 1, 8);
}

/** "Rắc" (hái măng — R-MANG-3): xung nhiễu lọc thấp + tiếng gỗ trầm, dài 0,14 s. */
export function snapSamples(rate: number): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.round(rate * 0.14));
  const rnd = noise(29);
  let lo = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / rate;
    lo = lo + 0.25 * (rnd() - lo);
    out[i] = lo * Math.exp(-t * 45) + 0.5 * Math.sin(2 * Math.PI * 420 * t) * Math.exp(-t * 60);
  }
  return finish(out, 1, 8);
}

type Ctx = AudioContext;

/** Nối tiếng: hai vòng lặp (nước, mưa) có âm lượng riêng + hai tiếng một lần. */
export class LamSound {
  private ctx: Ctx | null = null;
  private water: GainNode | null = null;
  private rain: GainNode | null = null;
  private knockBuf: AudioBuffer | null = null;
  private snapBuf: AudioBuffer | null = null;
  private levels = { water: 0, rain: 0 };

  constructor(
    private readonly withWater: boolean,
    private readonly withRain: boolean,
  ) {
    const unlock = (): void => {
      if (!this.ctx) this.open();
      if (this.ctx && this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  /** Mỗi khung: âm lượng róc rách + mưa (0…1, đã mượt). */
  setLevels(water: number, rain: number): void {
    this.levels = { water: Math.min(1, Math.max(0, water)), rain: Math.min(1, Math.max(0, rain)) };
    if (this.water) this.water.gain.value = this.levels.water * 0.35;
    if (this.rain) this.rain.gain.value = this.levels.rain;
  }

  knock(vol = 1): void {
    this.once(this.knockBuf, vol * 0.6);
  }

  snap(vol = 1): void {
    this.once(this.snapBuf, vol * 0.7);
  }

  suspend(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend().catch(() => {});
  }

  resume(): void {
    if (this.ctx?.state === 'suspended' && !document.hidden) void this.ctx.resume().catch(() => {});
  }

  private once(buf: AudioBuffer | null, vol: number): void {
    const ctx = this.ctx;
    if (!ctx || !buf || ctx.state !== 'running') return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
  }

  private buffer(ctx: Ctx, data: Float32Array<ArrayBuffer>): AudioBuffer {
    const b = ctx.createBuffer(1, data.length, ctx.sampleRate);
    b.copyToChannel(data, 0);
    return b;
  }

  private loop(ctx: Ctx, data: Float32Array<ArrayBuffer>): GainNode {
    const src = ctx.createBufferSource();
    src.buffer = this.buffer(ctx, data);
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
    return g;
  }

  private open(): void {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    try {
      this.ctx = Ctor ? new Ctor() : null;
    } catch {
      this.ctx = null;
    }
    const ctx = this.ctx;
    if (!ctx) return;
    const rate = ctx.sampleRate;
    if (this.withWater) this.water = this.loop(ctx, loopSamples('nuoc', rate, 3.2, 5));
    if (this.withRain) this.rain = this.loop(ctx, loopSamples('mua', rate, 2.6, 9));
    this.knockBuf = this.buffer(ctx, knockSamples(rate));
    this.snapBuf = this.buffer(ctx, snapSamples(rate));
    this.setLevels(this.levels.water, this.levels.rain);
  }
}
