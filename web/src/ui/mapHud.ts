import { el } from './dom';

/** Bằng thời gian thẻ "sắp mở" tự ẩn (đặc tả "Bản đồ truyền tống": 3 s). */
const CARD_MS = 3000;

/** Một nơi chưa đi được (chưa có cảnh): chữ Hán + tên. */
export interface MapPlaceName {
  han: string;
  name: string;
}

/**
 * Lớp HUD của bản đồ truyền tống (R-HANH-2): lớp phủ khi mở, viên gợi ý, thẻ "sắp mở" khi chạm nơi chưa có cảnh (không
 * khoá vùng theo tiến độ — R-HANH-1), nút "Đóng bản đồ". Cuộn bản đồ là vật 3D (`scene/banDo.ts`); lớp này không biết
 * tới cảnh. Chuỗi: `design/l10n/vi.arb` `map*`.
 */
export class MapHud {
  private readonly root = el('mapHud');
  private readonly card = el('mapCard');
  private readonly title = el('mapCardTitle');
  private readonly sub = el('mapCardSub');
  private timer = 0;

  constructor(onClose: () => void) {
    el('mapClose').addEventListener('click', onClose);
  }

  show(on: boolean): void {
    this.root.hidden = !on;
    document.body.classList.toggle('map-open', on);
    if (!on) this.hideCard();
  }

  /** Thẻ "蓬萊 Bồng Lai — sắp mở" (mapSoon). */
  soon(n: MapPlaceName): void {
    const han = document.createElement('span');
    han.className = 'han';
    han.lang = 'zh';
    han.textContent = n.han;
    this.title.replaceChildren(han, document.createTextNode(` ${n.name} — sắp mở`));
    this.sub.hidden = true; // dòng "Bạn đã học N chữ" chỉ có nghĩa khi còn mốc mở vùng — đã bỏ
    this.card.hidden = false;
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.hideCard(), CARD_MS);
  }

  hideCard(): void {
    clearTimeout(this.timer);
    this.card.hidden = true;
  }
}
