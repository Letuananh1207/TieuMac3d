/**
 * Tiếng đàn cổ tranh (R-AM-2) **tự tổng hợp** bằng Web Audio — không file âm thanh, không tải mạng: mỗi nốt là một
 * `AudioBuffer` dựng bằng thuật toán dây gảy Karplus–Strong (`pluckSamples`, thuần — có test), dựng lần đầu cần tới rồi
 * giữ lại. Nốt → `GainNode` (lực gảy) → âm lượng chung (theo khoảng cách) → `StereoPannerNode` (lệch tai). WebView chặn
 * tiếng khi chưa chạm → `AudioContext` mở ở lần chạm / phím kế tiếp (như `moSound.ts`); nốt lúc đang bị chặn thì bỏ.
 */
import { midiHz } from '../zones/danTranh';

/** Dài mỗi nốt (s) — dây cổ tranh ngân lâu, tắt dần. */
const NOTE_SECONDS = 2.2;
/** Mỗi nốt vào âm lượng chung nhỏ lại chừng này (nhiều nốt chồng ngân không vỡ tiếng). */
const NOTE_GAIN = 0.32;

/**
 * Mẫu tiếng một dây gảy (Karplus–Strong): vòng trễ dài một chu kỳ, nạp nhiễu hạt giống cố định (lần nào cũng như nhau),
 * mỗi vòng lấy trung bình hai mẫu kề nhau rồi nhân hệ số tắt → tiếng dây ngân, cao âm tắt nhanh hơn trầm. Cuối nốt mờ
 * 0,15 s cho khỏi lách cách. Đỉnh ≈ 1.
 */
export function pluckSamples(freq: number, rate: number, seconds = NOTE_SECONDS, seed = 1): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.max(1, Math.round(rate * seconds)));
  const period = Math.max(2, Math.round(rate / freq));
  const ring = new Float32Array(period);
  let s = seed >>> 0 || 1;
  let prev = 0;
  for (let i = 0; i < period; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const noise = s / 2 ** 31 - 1;
    prev = 0.6 * noise + 0.4 * prev; // nhiễu hơi trầm: gảy bằng móng giữa dây, không chói
    ring[i] = prev;
  }
  // hệ số tắt mỗi vòng (mỗi chu kỳ dây): riêng nó cho −60 dB sau 2,4 s; bộ lọc trung bình làm nốt cao tắt nhanh hơn
  const decay = 0.001 ** (1 / (2.4 * freq));
  let idx = 0;
  let peak = 0;
  for (let i = 0; i < out.length; i++) {
    const a = ring[idx];
    const b = ring[(idx + 1) % period];
    out[i] = a;
    ring[idx] = decay * 0.5 * (a + b);
    idx = (idx + 1) % period;
    peak = Math.max(peak, Math.abs(a));
  }
  const fade = Math.min(out.length, Math.round(rate * 0.15));
  for (let i = 0; i < fade; i++) out[out.length - 1 - i] *= i / fade;
  if (peak > 0) for (let i = 0; i < out.length; i++) out[i] /= peak;
  return out;
}

export class ZitherSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pan: StereoPannerNode | null = null;
  private readonly buffers = new Map<number, AudioBuffer>();
  private level = 0;

  constructor() {
    const unlock = (): void => {
      if (!this.ctx) this.open();
      if (this.ctx && this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  /** Mỗi khung: âm lượng chung 0…1 (đã mượt theo khoảng cách / màn che) và lệch tai −1…1. */
  setLevel(volume: number, pan: number): void {
    this.level = Math.min(1, Math.max(0, volume));
    if (this.master) this.master.gain.value = this.level;
    if (this.pan) this.pan.pan.value = Math.max(-1, Math.min(1, pan));
  }

  /** Gảy một nốt; chưa mở tiếng / đang im (âm lượng 0) → bỏ qua. */
  pluck(midi: number, vel: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master || ctx.state !== 'running' || !(this.level > 0)) return;
    const src = ctx.createBufferSource();
    src.buffer = this.buffer(ctx, midi);
    const g = ctx.createGain();
    g.gain.value = NOTE_GAIN * Math.min(1, Math.max(0, vel));
    src.connect(g);
    g.connect(this.master);
    src.start();
  }

  /** App xuống nền / tab ẩn: dừng ngữ cảnh (tiếng đang ngân tắt luôn). */
  suspend(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend().catch(() => {});
  }

  /** Trở lại: mở lại ngữ cảnh (đã từng được người dùng mở). */
  resume(): void {
    if (this.ctx?.state === 'suspended' && !document.hidden) void this.ctx.resume().catch(() => {});
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
    this.master = ctx.createGain();
    this.master.gain.value = this.level;
    let tail: AudioNode = this.master;
    if (typeof ctx.createStereoPanner === 'function') {
      this.pan = ctx.createStereoPanner();
      this.master.connect(this.pan);
      tail = this.pan;
    }
    tail.connect(ctx.destination);
  }

  private buffer(ctx: AudioContext, midi: number): AudioBuffer {
    let b = this.buffers.get(midi);
    if (!b) {
      const data = pluckSamples(midiHz(midi), ctx.sampleRate, NOTE_SECONDS, midi * 7919);
      b = ctx.createBuffer(1, data.length, ctx.sampleRate);
      b.copyToChannel(data, 0);
      this.buffers.set(midi, b);
    }
    return b;
  }
}
