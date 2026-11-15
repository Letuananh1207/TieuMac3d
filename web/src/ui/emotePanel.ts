/**
 * Bảng Biểu cảm (R-BIEU-1 — thiết kế 2026-11-15.35 `BieuCam-doc` / `-ngang`): tấm kính nổi ngay trên thanh công cụ, lưới
 * 4 × 2 ô trắng (hình + tên Việt), mũi nhọn trỏ ô Biểu cảm. Chạm ô → đóng + diễn; chạm ra ngoài (kể cả bắt đầu kéo
 * joystick) → đóng, không làm gì — chạm vẫn đi tiếp xuống cảnh. DOM dựng bằng createElement.
 */
import { EMOTES, type Emote } from '../zones/bieuCam';
import { h } from './chatText';
import { svgIcon } from './decorIcons';
import { EMOTE_ICONS } from './toolbarIcons';

export class EmotePanel {
  private readonly root = h('div');
  private readonly tip = h('div', 'ep-tip');
  private open = false;

  /**
   * [pick] = chọn một biểu cảm; [close] = đóng không chọn (chạm ngoài); [owner] = ô Biểu cảm trên thanh (chạm vào đó
   * không tính là chạm ngoài — nút tự bật / tắt).
   */
  constructor(
    pick: (e: Emote) => void,
    private readonly close: () => void,
    private readonly owner: () => HTMLElement,
  ) {
    this.root.id = 'emotePanel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', 'Biểu cảm');
    this.root.hidden = true;
    const grid = h('div', 'ep-grid');
    for (const e of EMOTES) {
      const b = h('button', 'ep-cell');
      b.type = 'button';
      b.append(svgIcon(EMOTE_ICONS[e.id], 32, '0 0 48 48'), h('span', 'ep-name', e.name));
      b.addEventListener('click', () => pick(e));
      grid.append(b);
    }
    this.tip.setAttribute('aria-hidden', 'true');
    this.root.append(grid, this.tip);
    document.body.append(this.root);
    // chạm ra ngoài → đóng (bắt ở pha capture: canvas / joystick vẫn nhận chạm như thường — R-BIEU-1)
    document.addEventListener(
      'pointerdown',
      (ev) => {
        if (!this.open) return;
        const t = ev.target as Node | null;
        if (t && (this.root.contains(t) || this.owner().contains(t))) return;
        this.close();
      },
      true,
    );
  }

  get isOpen(): boolean {
    return this.open;
  }

  /** Mở / đóng; [tipX] = toạ độ màn giữa ô Biểu cảm (mũi nhọn). */
  show(on: boolean, tipX = 0): void {
    this.open = on;
    this.root.hidden = !on;
    if (!on) return;
    const r = this.root.getBoundingClientRect();
    this.tip.style.left = `${Math.min(r.width - 24, Math.max(16, tipX - r.left)) - 8}px`;
  }
}
