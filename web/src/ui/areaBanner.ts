import type { Area } from '../zones/areaTracker';
import { el } from './dom';

/** Thời gian giữ thẻ sau khi hiện xong (R-HUD-3). */
const HOLD_MS = 2000;
/** Bằng `transition` mờ ra của `#areaCard` trong style.css. */
const FADE_OUT_MS = 400;

/**
 * Thẻ tên khu giữa màn (R-HUD-3): chữ Hán + tên Việt, hiện dần 0,25 s, giữ 2 s, mờ ra 0,4 s.
 * Gọi `show` khi vào khu mới (`zones/AreaEntryTracker`); đang hiện mà gọi lại → thay chữ, đếm lại.
 * Không chặn chạm (`pointer-events: none` trong CSS).
 */
export class AreaBanner {
  private readonly card = el('areaCard');
  private readonly han = el('areaHan');
  private readonly name = el('areaName');
  private hold = 0;
  private hide = 0;

  show(area: Area): void {
    window.clearTimeout(this.hold);
    window.clearTimeout(this.hide);
    this.han.textContent = area.han ?? '';
    this.han.hidden = !area.han;
    this.name.textContent = area.name;
    this.card.hidden = false;
    // khung sau mới bật lớp `on` để trình duyệt chạy transition từ opacity 0
    requestAnimationFrame(() => {
      this.card.classList.add('on');
      this.hold = window.setTimeout(() => {
        this.card.classList.remove('on');
        this.hide = window.setTimeout(() => (this.card.hidden = true), FADE_OUT_MS);
      }, HOLD_MS);
    });
  }
}
