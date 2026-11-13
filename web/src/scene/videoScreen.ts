/**
 * Màn chiếu rạp phim (R-RAP-2, R-RAP-3; quyết định decisions/0004-video-mang.md): một `HTMLVideoElement` phát link
 * trên mạng → `VideoTexture` trên mặt màn. Chưa phát / mất mạng / link lỗi → mặt màn vẽ chữ (canvas). Bắt đầu tắt tiếng
 * (WebView chỉ cho phát tiếng sau một lần chạm) — `unmute()` khi người chơi chạm màn hình. Không thư viện mới.
 */
import * as THREE from 'three';
import { makeCanvasTex } from './textures';

export interface Film {
  title: string;
  url: string;
  /** định dạng khác, thử khi `url` lỗi (vd. H.264 .mov → VP9 .webm) */
  fallback?: string;
}

const MSG_OFFLINE = 'Cần kết nối mạng để xem phim';
const MSG_ERROR = 'Không mở được phim';

export class VideoScreen {
  private readonly video = document.createElement('video');
  private readonly videoTex: THREE.VideoTexture;
  private readonly card: THREE.CanvasTexture;
  private readonly mat: THREE.MeshBasicMaterial;
  private films: Film[] = [];
  private index = 0;
  private wanted = false;
  /** tua tới đây khi video vừa nạp xong thông tin (đặt `currentTime` sớm hơn thì bị bỏ qua) */
  private seekTo = 0;
  /** vị trí đã xem của từng phim (giây) — ngồi lại thì xem tiếp (R-RAP-2) */
  private readonly resumeAt = new Map<number, number>();

  constructor(readonly mesh: THREE.Mesh) {
    const v = this.video;
    v.crossOrigin = 'anonymous'; // máy chủ phải cho nhúng (CORS) — không thì WebGL không đọc được khung hình
    v.playsInline = true;
    v.muted = true;
    v.preload = 'none';
    v.addEventListener('ended', () => this.next());
    v.addEventListener('loadedmetadata', () => {
      if (this.seekTo > 0) v.currentTime = this.seekTo;
      this.seekTo = 0;
    });
    v.addEventListener('error', () => {
      const film = this.films[this.index];
      const alt = film ? this.sources(film)[1] : undefined;
      if (alt && navigator.onLine && v.src !== alt) {
        v.src = alt; // máy không phát được định dạng chính → thử bản dự phòng
        if (this.wanted) v.play().catch(() => {});
        return;
      }
      this.fail(navigator.onLine ? MSG_ERROR : MSG_OFFLINE);
    });
    this.videoTex = new THREE.VideoTexture(v);
    this.videoTex.colorSpace = THREE.SRGBColorSpace;
    this.card = makeCanvasTex(512, 288, () => {});
    this.mat = new THREE.MeshBasicMaterial({ map: this.card });
    mesh.material = this.mat;
    this.drawCard('Rạp phim', '');
  }

  setFilms(films: Film[]): void {
    this.films = films;
    this.index = 0;
    this.drawCard(films[0]?.title ?? 'Chưa có phim', 'Ngồi xuống để xem');
  }

  get playing(): boolean {
    return this.wanted;
  }

  get muted(): boolean {
    return this.video.muted;
  }

  /** Có người ngồi: phát phim đang chọn (tiếp từ chỗ dừng). Không mạng → hiện chữ, không treo (R-RAP-3). */
  play(): void {
    const film = this.films[this.index];
    if (!film || this.wanted) return;
    this.wanted = true;
    if (!navigator.onLine) {
      this.fail(MSG_OFFLINE);
      return;
    }
    const v = this.video;
    if (v.src !== film.url && v.src !== film.fallback) {
      this.seekTo = this.resumeAt.get(this.index) ?? 0;
      v.src = this.sources(film)[0];
    }
    this.mat.map = this.videoTex;
    this.mat.needsUpdate = true;
    v.play().catch(() => this.fail(navigator.onLine ? MSG_ERROR : MSG_OFFLINE));
  }

  /** Đứng dậy / app xuống nền: dừng, nhớ chỗ (R-RAP-2). */
  pause(): void {
    if (!this.wanted) return;
    this.wanted = false;
    if (!this.video.paused) this.video.pause();
    this.resumeAt.set(this.index, this.video.currentTime);
  }

  /** Lần chạm đầu trong lúc xem: bật tiếng. */
  unmute(): void {
    this.video.muted = false;
  }

  private next(): void {
    this.resumeAt.delete(this.index);
    this.index = (this.index + 1) % Math.max(1, this.films.length);
    const film = this.films[this.index];
    if (!film) return;
    this.seekTo = 0;
    this.video.src = this.sources(film)[0];
    if (this.wanted) this.video.play().catch(() => this.fail(MSG_ERROR));
  }

  /**
   * Thứ tự thử: máy phát chắc được WebM VP9 (Android) → bản `.webm` trước; không (iOS) → bản chính H.264. Thử trên
   * Chrome không có H.264: file `.mov` vẫn "chạy" ra tiếng nhưng hình 0 × 0, không báo lỗi — nên phải chọn trước.
   */
  private sources(film: Film): string[] {
    const webm = [film.url, film.fallback].find((u) => u?.endsWith('.webm'));
    const other = [film.url, film.fallback].find((u) => u && u !== webm);
    const vp9 = this.video.canPlayType('video/webm; codecs="vp9"') === 'probably';
    return (vp9 ? [webm, other] : [other, webm]).filter((u): u is string => !!u);
  }

  private fail(msg: string): void {
    this.mat.map = this.card;
    this.mat.needsUpdate = true;
    this.drawCard(msg, this.films[this.index]?.title ?? '');
  }

  /** Mặt màn khi không có hình: nền tối, chữ ngà. */
  private drawCard(line: string, sub: string): void {
    const c = this.card.image as HTMLCanvasElement;
    const g = c.getContext('2d')!;
    g.fillStyle = '#1b1f24';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#efe6d2';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '700 30px Lora, "Han Serif", Georgia, serif';
    g.fillText(line, c.width / 2, c.height * 0.44, c.width - 40);
    if (sub) {
      g.font = '500 20px "Be Vietnam Pro", Lora, sans-serif';
      g.fillStyle = '#c4b08a';
      g.fillText(sub, c.width / 2, c.height * 0.62, c.width - 40);
    }
    this.card.needsUpdate = true;
  }
}
