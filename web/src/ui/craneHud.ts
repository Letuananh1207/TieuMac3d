/**
 * Lớp phủ cưỡi hạc (R-HANH-5) theo thiết kế 2026-11-15.9 (`design/docs/screen_specs.md` "Cưỡi hạc"): màn mây (nền + 5 mây
 * phồng), khối chữ trên (dòng phụ "Cưỡi hạc tới", tên nơi đến, vạch tiến độ không số %), gợi ý dưới ("Chạm để bỏ qua" /
 * "Sắp tới nơi" + 3 chấm), bắt chạm cả màn để bỏ qua. DOM có sẵn trong `index.html` (`#crane`) để trang mới hiện màn mây
 * trước khi JS chạy; CSS `style.css` (`.hc-*`, biến `--hc-*`). Lớp `html.hac` bật lớp này + ẩn màn tải / HUD trò chơi;
 * `html.hac-dem` màu đêm. Độ mờ từng lớp theo nhịp thuần `craneView.ts`.
 */
import type { CraneHint } from '../zones/cuoiHac';
import { el } from './dom';
import { hintText, type CraneFrame } from './craneView';

/** khoá sessionStorage trang cũ để lại cho màn mây của trang mới (đọc ở `index.html`) */
const KEY_NAME = 'hac-ten';
const KEY_INSET = 'hac-inset';
const INSETS = ['--inset-top', '--inset-right', '--inset-bottom', '--inset-left'] as const;

export class CraneHud {
  private readonly root = el('crane');
  private readonly veilEl = el('craneVeil');
  private readonly text = el('craneText');
  private readonly bar = el('craneBar');
  private readonly hintEl = el('craneHint');
  private onTap: () => void = () => {};
  private shownHint: CraneHint | null = null;
  private shownProgress = -1;

  /** `night` → mây chàm; `place` tên nơi đến (chỉ tiếng Việt — R-HUD-4) */
  constructor(
    readonly night: boolean,
    private readonly place: string,
  ) {
    const html = document.documentElement;
    html.classList.add('hac');
    html.classList.toggle('hac-dem', night);
    el('craneName').textContent = place;
    el('craneSkip').textContent = hintText('boQua');
    el('craneWait').textContent = hintText('sapToi');
    this.hint('boQua');
    this.root.addEventListener('pointerdown', this.tap);
  }

  private readonly tap = (e: PointerEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.onTap();
  };

  /** bắt chạm cả màn (chặn điều khiển) trong hoạt cảnh; `null` = thả (lớp vẫn hiện nhưng chạm xuyên xuống cảnh) */
  capture(onTap: (() => void) | null): void {
    this.onTap = onTap ?? (() => {});
    this.root.style.pointerEvents = onTap ? 'auto' : 'none';
  }

  /** độ mờ màn mây / khối chữ / gợi ý */
  frame(f: CraneFrame): void {
    this.veilEl.style.opacity = f.veil.toFixed(3);
    this.text.style.opacity = f.text.toFixed(3);
    this.hintEl.style.opacity = f.hint.toFixed(3);
  }

  /** tiến độ dựng cảnh nơi đến 0…1 (vạch, không số %) */
  progress(k: number): void {
    const p = Math.round(Math.min(1, Math.max(0, k)) * 100);
    if (p === this.shownProgress) return;
    this.shownProgress = p;
    this.bar.style.setProperty('--p', String(p / 100));
    this.bar.setAttribute('aria-valuenow', String(p));
  }

  /** đổi gợi ý (chữ chéo mờ 0,2 s trong CSS) */
  hint(h: CraneHint): void {
    if (h === this.shownHint) return;
    this.shownHint = h;
    this.hintEl.classList.toggle('cho', h === 'sapToi');
  }

  /**
   * Trang cũ sắp tải lại (hết khúc cất cánh): để lại tên nơi + vùng bị che cho màn mây của trang mới (index.html) —
   * chữ có ngay, không nhảy. Không ghi được (chế độ riêng tư…) thì trang mới tự điền khi JS chạy.
   */
  handOver(): void {
    try {
      const style = document.documentElement.style;
      sessionStorage.setItem(KEY_NAME, this.place);
      sessionStorage.setItem(KEY_INSET, JSON.stringify(Object.fromEntries(INSETS.map((k) => [k, style.getPropertyValue(k)]).filter(([, v]) => v))));
    } catch {
      // không có sessionStorage → bỏ qua
    }
  }

  /** hết hoạt cảnh: tắt lớp, hiện lại HUD trò chơi */
  remove(): void {
    this.capture(null);
    this.root.removeEventListener('pointerdown', this.tap);
    document.documentElement.classList.remove('hac', 'hac-dem');
    try {
      sessionStorage.removeItem(KEY_NAME);
      sessionStorage.removeItem(KEY_INSET);
    } catch {
      // không có sessionStorage → bỏ qua
    }
  }
}
