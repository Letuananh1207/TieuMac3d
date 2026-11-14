/**
 * Phát tiếng mõ (R-AM-1) bằng Web Audio: `AudioBuffer` (giải mã `nhac/mo.wav` một lần) → `GainNode` (âm lượng theo
 * khoảng cách) → `StereoPannerNode` (lệch tai). Âm lượng / lệch tính sẵn ở `zones/moGo.ts`. WebView chặn tiếng khi chưa
 * chạm → `AudioContext` mở (resume) ở lần chạm / phím kế tiếp; tiếng gõ lúc đang bị chặn thì bỏ, không phát bù. Màn che,
 * app xuống nền, tab ẩn: nơi gọi không gọi `strike` (và `suspend()` dừng hẳn ngữ cảnh).
 */

export class MoSound {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private loading: Promise<void> | null = null;

  constructor(private readonly url: string | undefined) {
    const unlock = (): void => {
      if (!this.ctx) this.ctx = makeContext();
      if (this.ctx && this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume().catch(() => {});
      void this.load();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  /** Gõ một tiếng: `volume` 0…1, `pan` −1…1. Chưa mở tiếng / chưa nạp / im (0) → bỏ qua. */
  strike(volume: number, pan: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.buffer || ctx.state !== 'running' || !(volume > 0)) return;
    const src = ctx.createBufferSource();
    src.buffer = this.buffer;
    src.playbackRate.value = 0.97 + Math.random() * 0.06; // mỗi tiếng hơi khác, nghe như gõ tay
    const gain = ctx.createGain();
    gain.gain.value = Math.min(1, volume);
    let tail: AudioNode = gain;
    if (typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      gain.connect(p);
      tail = p;
    }
    src.connect(gain);
    tail.connect(ctx.destination);
    src.start();
  }

  /** App xuống nền / tab ẩn: dừng ngữ cảnh (tiếng đang vang tắt luôn). */
  suspend(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend().catch(() => {});
  }

  /** Trở lại: mở lại ngữ cảnh (đã từng được người dùng mở). */
  resume(): void {
    if (this.ctx?.state === 'suspended' && !document.hidden) void this.ctx.resume().catch(() => {});
  }

  private load(): Promise<void> {
    if (this.loading || !this.url || !this.ctx) return this.loading ?? Promise.resolve();
    const ctx = this.ctx;
    this.loading = fetch(this.url)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((buf) => {
        this.buffer = buf;
      })
      .catch(() => {
        this.loading = null; // lỗi nạp → thử lại ở lần chạm sau
      });
    return this.loading;
  }
}

function makeContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  try {
    return Ctor ? new Ctor() : null;
  } catch {
    return null;
  }
}
