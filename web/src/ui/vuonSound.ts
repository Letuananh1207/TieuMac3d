/**
 * Tiếng vườn rau (R-AM-4) **tự tổng hợp** bằng Web Audio — không file, không mạng: rắc hạt, róc rách tưới, "tách" bắt sâu,
 * "pốc" nhổ cỏ, rắc phân, "ting" vừa chín, "bụp" thu. Dựng mẫu là hàm thuần (có test); lớp `VuonSound` chỉ nối nút. Màn che /
 * nền → im (`setMuted`, `suspend` — như R-AM-2); tiếng lỡ không phát bù. WebView chặn tiếng khi chưa chạm → mở ở lần chạm /
 * phím kế tiếp.
 */

export type VuonTieng = 'rac' | 'tuoi' | 'tach' | 'poc' | 'phan' | 'ting' | 'bup';
export const VUON_TIENG: readonly VuonTieng[] = ['rac', 'tuoi', 'tach', 'poc', 'phan', 'ting', 'bup'];

/** Độ dài từng tiếng (s): rắc hạt / phân theo nhịp vung tay, tưới bằng lúc rót (WORK_FX tưới 0,3 → 1,0 s). */
export const TIENG_LEN: Readonly<Record<VuonTieng, number>> = { rac: 0.4, tuoi: 0.75, tach: 0.08, poc: 0.16, phan: 0.42, ting: 0.9, bup: 0.22 };

/** Âm lượng riêng (so với nhau) — chuông "ting" nhỏ để không chói. */
const GAIN: Readonly<Record<VuonTieng, number>> = { rac: 0.45, tuoi: 0.35, tach: 0.5, poc: 0.6, phan: 0.4, ting: 0.3, bup: 0.55 };

/** Dãy nhiễu có hạt (LCG) −1…1 — lần nào cũng như nhau. */
function noise(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 31 - 1;
  };
}

/** Chuẩn hoá đỉnh 1, mờ đầu / cuối [fade] mẫu (không lách cách). */
function finish(out: Float32Array<ArrayBuffer>, fade: number): Float32Array<ArrayBuffer> {
  let m = 0;
  for (const v of out) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < out.length; i++) out[i] /= m;
  const f = Math.min(fade, Math.floor(out.length / 2));
  for (let i = 0; i < f; i++) {
    out[i] *= i / f;
    out[out.length - 1 - i] *= i / f;
  }
  return out;
}

/** Mẫu tiếng [id] ở tần số lấy mẫu [rate]. */
export function vuonSamples(id: VuonTieng, rate: number): Float32Array<ArrayBuffer> {
  const out = new Float32Array(Math.max(2, Math.round(rate * TIENG_LEN[id])));
  const rnd = noise(VUON_TIENG.indexOf(id) * 17 + 5);
  const TAU = Math.PI * 2;
  let lo = 0;
  let lo2 = 0;
  // rắc: chuỗi hạt lách tách — mỗi hạt một xung nhiễu lọc cao rất ngắn, rơi dày đầu, thưa cuối
  const grains: number[] = [];
  if (id === 'rac' || id === 'phan') {
    const n = id === 'rac' ? 22 : 16;
    for (let j = 0; j < n; j++) grains.push(Math.round(Math.pow((rnd() + 1) / 2, 1.6) * (out.length - rate * 0.02)));
  }
  for (let i = 0; i < out.length; i++) {
    const t = i / rate;
    const w = rnd();
    switch (id) {
      case 'rac':
      case 'phan': {
        let v = 0;
        for (const g of grains) {
          const d = (i - g) / rate;
          if (d >= 0 && d < 0.012) v += Math.exp(-d * (id === 'rac' ? 600 : 380));
        }
        lo = lo + (id === 'rac' ? 0.6 : 0.25) * (w - lo); // phân trầm, đục hơn hạt
        out[i] = v * (id === 'rac' ? w - lo : lo);
        break;
      }
      case 'tuoi': {
        // nước rót: nhiễu lọc dải + "bọt" lăn tăn, lên nhanh, tắt dần cuối
        lo = lo + 0.35 * (w - lo);
        lo2 = lo2 + 0.04 * (lo - lo2);
        const bub = 0.65 + 0.35 * Math.sin(TAU * 9 * t) * Math.sin(TAU * 23 * t + 1);
        const env = Math.min(1, t / 0.05) * Math.min(1, (TIENG_LEN.tuoi - t) / 0.2);
        out[i] = (lo - lo2) * bub * env;
        break;
      }
      case 'tach':
        // bắt sâu: tiếng tách gỗ cao, cực ngắn
        out[i] = Math.sin(TAU * 2300 * t) * Math.exp(-t * 90) + 0.4 * w * Math.exp(-t * 250);
        break;
      case 'poc': {
        // nhổ cỏ: "pốc" trầm — sin trượt 320 → 110 Hz + chút nhiễu đất
        const f = 110 + 210 * Math.exp(-t * 30);
        lo = lo + 0.1 * (w - lo);
        out[i] = Math.sin(TAU * f * t) * Math.exp(-t * 22) + 0.5 * lo * Math.exp(-t * 40);
        break;
      }
      case 'ting':
        // vừa chín: chuông nhỏ (La 6 + bồi âm), ngân 0,9 s
        out[i] = (Math.sin(TAU * 1760 * t) + 0.45 * Math.sin(TAU * 2637 * t) + 0.2 * Math.sin(TAU * 3520 * t)) * Math.exp(-t * 5.5);
        break;
      case 'bup': {
        // thu: "bụp" mềm — sin trượt 200 → 90 Hz, nhiễu lọc thấp
        const f = 90 + 110 * Math.exp(-t * 25);
        lo = lo + 0.08 * (w - lo);
        out[i] = Math.sin(TAU * f * t) * Math.exp(-t * 16) + 0.6 * lo * Math.exp(-t * 30);
        break;
      }
    }
  }
  return finish(out, Math.max(4, Math.round(rate * 0.004)));
}

/** Nối tiếng vườn: mỗi tiếng một bộ đệm dựng lúc mở; `play` phát một lần. */
export class VuonSound {
  private ctx: AudioContext | null = null;
  private bufs = new Map<VuonTieng, AudioBuffer>();
  private muted = false;

  constructor() {
    const unlock = (): void => {
      if (!this.ctx) this.open();
      if (this.ctx && this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  /** Màn che / bảng / đổi cảnh → im (tiếng lỡ không phát bù). */
  setMuted(m: boolean): void {
    this.muted = m;
  }

  /** Phát tiếng [id] (âm lượng 0…1). Chưa mở tiếng / đang im / tab ẩn → bỏ. */
  play(id: VuonTieng, vol = 1): void {
    const ctx = this.ctx;
    const buf = this.bufs.get(id);
    if (!ctx || !buf || this.muted || ctx.state !== 'running' || document.hidden) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    // lệch cao độ nhẹ mỗi lần (rắc / tách không lặp y hệt)
    if (id !== 'ting') src.playbackRate.value = 0.94 + Math.random() * 0.12;
    const g = ctx.createGain();
    g.gain.value = Math.min(1, Math.max(0, vol)) * GAIN[id];
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
  }

  suspend(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend().catch(() => {});
  }

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
    for (const id of VUON_TIENG) {
      const data = vuonSamples(id, ctx.sampleRate);
      const b = ctx.createBuffer(1, data.length, ctx.sampleRate);
      b.copyToChannel(data, 0);
      this.bufs.set(id, b);
    }
  }
}
