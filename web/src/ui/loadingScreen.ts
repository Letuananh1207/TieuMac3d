import { el } from './dom';

/** Bằng `transition` của `#loading` trong style.css. */
const FADE_MS = 400;

/**
 * Màn tải (R-MAN-2): che và chặn chạm từ lúc mở trang tới khung hình đầu của cảnh, rồi mờ 0,4 s.
 * Tiến độ theo các bước dựng thật (`progress`), `done` khi đã vẽ khung đầu; `active` = còn đang hiện
 * (kể cả lúc mờ ra) → nơi gọi không nhận điều khiển.
 */
export class LoadingScreen {
  private readonly root = el('loading');
  private readonly bar = el('loadBar');
  private readonly fill = el('loadFill');
  private readonly status = el('loadStatus');
  active = true;

  constructor(site: { name: string; han: string }) {
    const han = el('loadHan');
    han.textContent = site.han;
    han.hidden = !site.han;
    el('loadName').textContent = site.name;
    this.progress(0);
  }

  /** 0..100 */
  progress(percent: number): void {
    const p = Math.round(Math.min(100, Math.max(0, percent)));
    this.fill.style.width = `${p}%`;
    this.bar.setAttribute('aria-valuenow', String(p));
    this.status.textContent = `Đang mở sơn môn… ${p}%`;
  }

  done(): void {
    this.progress(100);
    this.root.classList.add('done');
    window.setTimeout(() => {
      this.root.hidden = true;
      this.active = false;
    }, FADE_MS);
  }
}

/** Đợi trình duyệt vẽ xong một khung (để màn tải cập nhật trước việc nặng chạy đồng bộ). */
export function nextPaint(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}
