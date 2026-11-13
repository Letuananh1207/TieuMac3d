import { el } from './dom';

/** Bằng thời gian thẻ yêu cầu tự ẩn (đặc tả "Bản đồ truyền tống": 3 s). */
const CARD_MS = 3000;

/** Số kiểu Việt: 1 800 (cách hàng nghìn bằng khoảng trắng hẹp, như sổ quy tắc). */
function fmt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

/** Một nơi chưa đi được: tên + lý do (`chars` số chữ cần, `radicals` bộ thủ, không có = sắp mở). */
export interface MapNeed {
  han: string;
  name: string;
  chars?: number;
  radicals?: number;
}

/**
 * Lớp HUD của bản đồ truyền tống (R-HANH-2): lớp phủ khi mở, viên gợi ý, thẻ yêu cầu khi chạm nơi chưa đi được, nút
 * "Đóng bản đồ". Cuộn bản đồ là vật 3D (`scene/banDo.ts`); lớp này không biết tới cảnh. Chuỗi: `design/l10n/vi.arb` `map*`.
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

  /** Thẻ "蓬萊 Bồng Lai — cần 300 chữ · Bạn đã học 128 chữ." (mapNeedChars / mapNeedRadicals / mapSoon + mapLearnedCount) */
  need(n: MapNeed, learned: number): void {
    const han = document.createElement('span');
    han.className = 'han';
    han.lang = 'zh';
    han.textContent = n.han;
    const rest =
      n.chars !== undefined ? ` ${n.name} — cần ${fmt(n.chars)} chữ` : n.radicals !== undefined ? ` ${n.name} — cần học xong bộ thủ Rừng trúc` : ` ${n.name} — sắp mở`;
    this.title.replaceChildren(han, document.createTextNode(rest));
    this.sub.textContent = `Bạn đã học ${fmt(learned)} chữ.`;
    this.card.hidden = false;
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.hideCard(), CARD_MS);
  }

  hideCard(): void {
    clearTimeout(this.timer);
    this.card.hidden = true;
  }
}
