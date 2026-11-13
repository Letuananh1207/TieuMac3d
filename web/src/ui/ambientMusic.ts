/**
 * Nhạc nền trà lâu (R-NHAC-1): bọc thẻ `<audio>`. Mỗi khung `update(dt, target)` — âm lượng đích do `main.ts` tính
 * theo khoảng cách (`zones/music.ts`); ở đây lên / xuống mượt, phát từ đúng đoạn của đài phát (theo đồng hồ thật), hết
 * bài thì sang bài kế theo giờ, về 0 thì dừng. WebView chặn tự phát khi chưa chạm → thử lại ở lần chạm kế tiếp.
 */
import { radioAt, rampVolume, type Track } from '../zones/music';

export class AmbientMusic {
  private readonly audio = new Audio();
  private volume = 0;
  private index = -1;
  /** đã gọi play() và chưa bị dừng */
  private wantPlaying = false;
  /** lần play() trước bị chặn (chưa có thao tác người dùng) → chờ lần chạm kế */
  private blocked = false;

  constructor(
    private readonly tracks: readonly Track[],
    /** tên file → URL (Vite) */
    private readonly urlOf: (file: string) => string | undefined,
    private readonly now: () => number = () => Date.now() / 1000,
  ) {
    this.audio.preload = 'auto';
    this.audio.volume = 0;
    this.audio.addEventListener('ended', () => {
      if (this.wantPlaying) this.start(); // sang bài đang phát theo giờ
    });
    const retry = (): void => {
      if (this.blocked && this.wantPlaying) this.start();
    };
    window.addEventListener('pointerdown', retry, { passive: true });
    window.addEventListener('keydown', retry);
  }

  /** Mỗi khung: `target` 0..1 (0 = ngoài tầm hoặc đang bị che / dừng). */
  update(dt: number, target: number): void {
    this.volume = rampVolume(this.volume, target, dt);
    this.audio.volume = Math.min(1, Math.max(0, this.volume));
    if (this.volume > 0 && !this.wantPlaying) this.start();
    else if (this.volume === 0 && this.wantPlaying) this.stop();
  }

  /** Dừng ngay (app xuống nền / tab ẩn): vòng lặp đã ngừng nên không còn khung để giảm dần. */
  stopNow(): void {
    this.volume = 0;
    this.audio.volume = 0;
    this.stop();
  }

  private start(): void {
    const r = radioAt(this.tracks, this.now());
    if (!r) return;
    const url = this.urlOf(this.tracks[r.index].file);
    if (!url) return;
    this.wantPlaying = true;
    if (this.index !== r.index || !this.audio.src) {
      this.index = r.index;
      this.audio.src = url;
    }
    const seek = (): void => {
      try {
        this.audio.currentTime = r.offset;
      } catch {
        // chưa nạp siêu dữ liệu — đặt lại khi nạp xong
      }
    };
    if (this.audio.readyState >= 1) seek();
    else this.audio.addEventListener('loadedmetadata', seek, { once: true });
    this.audio.play().then(
      () => (this.blocked = false),
      () => (this.blocked = true),
    );
  }

  private stop(): void {
    this.wantPlaying = false;
    this.blocked = false;
    this.audio.pause();
  }
}
