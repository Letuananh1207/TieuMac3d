import { el } from './dom';

/** Bằng `transition` của `#loading` trong style.css. */
const FADE_MS = 400;

/** Tên nơi trên màn tải: `loadName` khi có (gian trong Nhà của ta: "Trong nhà" — V-68), không thì tên nơi. */
type LoadSite = { name: string; loadName?: string };
const loadName = (site: LoadSite): string => site.loadName || site.name;

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

  constructor(site: LoadSite) {
    el('loadName').textContent = loadName(site);
    this.progress(0);
  }

  /** 0..100 */
  progress(percent: number): void {
    const p = Math.round(Math.min(100, Math.max(0, percent)));
    this.fill.style.width = `${p}%`;
    this.bar.setAttribute('aria-valuenow', String(p));
    this.status.textContent = `Đang mở đường… ${p}%`;
  }

  /** Hiện lại (đổi vùng — R-MAN-2, R-HANH-2): tên Việt nơi đến (R-HUD-4); trang sắp tải lại nên không cần `done`. */
  show(site: LoadSite): void {
    el('loadName').textContent = loadName(site);
    this.root.hidden = false;
    this.root.classList.remove('done');
    this.active = true;
    this.progress(0);
  }

  done(): void {
    this.progress(100);
    this.root.classList.add('done');
    window.setTimeout(() => {
      this.root.hidden = true;
      this.active = this.held;
    }, FADE_MS);
  }

  private held = false;

  /**
   * Giữ "đang tải" mà không hiện màn (hoạt cảnh cưỡi hạc — R-HANH-5): nơi gọi vẫn thấy `active` → nhân vật đứng yên,
   * HUD ẩn như lúc màn tải. Thả (`false`) khi hoạt cảnh xong.
   */
  hold(on: boolean): void {
    this.held = on;
    this.active = on || !this.root.hidden;
  }
}

/** Đợi trình duyệt vẽ xong một khung (để màn tải cập nhật trước việc nặng chạy đồng bộ). */
export function nextPaint(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}
