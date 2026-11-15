/**
 * Thanh công cụ đáy màn (R-THANH-1, R-HANH-7 — thiết kế 2026-11-15.35 `ThanhCongCu-*`): viên kính 5 ô bằng nhau Bản đồ ·
 * Về nhà · Biểu cảm · Túi đồ · Nhiệm vụ — hình minh hoạ đất sét (2026-11-16.2, bỏ đĩa ngọc của Bản đồ); chấm son số việc
 * còn lại trên Nhiệm vụ; trạng thái thường / nhấn / mờ / đang mở (CSS filter, toolbar.css). Ẩn → trượt xuống + mờ 0,2 s. Kèm tấm báo "Bạn đang ở Nhà của ta" (R-HANH-7).
 * Chạm thanh không tới canvas → không thành joystick, không xoay camera (R-DIEU-1). DOM dựng bằng createElement.
 */
import { HOME_HERE_SECONDS, HOME_HERE_TEXT, TOOL_NAMES, TOOL_ORDER, toolAria, type ToolId, type ToolbarView } from '../zones/thanhCongCu';
import { h } from './chatText';
import { STROKE, svgIcon } from './decorIcons';
import { hinhImg, type HinhId } from './hinh';
import { TOOL_ICONS } from './toolbarIcons';
import './toolbar.css';

/** Hình minh hoạ của 5 ô (thiết kế 2026-11-16.2 `HinhMinhHoa-HUD-doc`). */
const TOOL_HINH: Readonly<Record<ToolId, HinhId>> = { banDo: 'ban-do', veNha: 've-nha', bieuCam: 'bieu-cam', tuiDo: 'tui-do', nhiemVu: 'nhiem-vu' };

interface Cell {
  btn: HTMLButtonElement;
  disc: HTMLSpanElement;
  badge: HTMLSpanElement | null;
}

export class Toolbar {
  private readonly nav = h('nav');
  private readonly cells = new Map<ToolId, Cell>();
  private readonly toast = h('div');
  private toastLeft = 0;
  /** khoá trạng thái đã vẽ — chỉ đụng DOM khi đổi */
  private drawn = '';

  constructor(onPress: (id: ToolId) => void) {
    this.nav.id = 'toolbar';
    this.nav.setAttribute('aria-label', 'Thanh công cụ');
    for (const id of TOOL_ORDER) {
      const btn = h('button', `tb-cell tb-${id}`);
      btn.type = 'button';
      const disc = h('span', 'tb-disc');
      disc.append(hinhImg(TOOL_HINH[id], 44)); // hình minh hoạ 44 nhô 8 khỏi ô (2026-11-16.2)
      const badge = id === 'nhiemVu' ? h('span', 'tb-badge') : null;
      if (badge) {
        badge.setAttribute('aria-hidden', 'true');
        disc.append(badge);
      }
      btn.append(disc, h('span', 'tb-lbl', TOOL_NAMES[id]));
      // chạm nhả mới làm (như nút HTML); pointerdown không lan xuống canvas (R-DIEU-1)
      btn.addEventListener('click', () => onPress(id));
      this.nav.append(btn);
      this.cells.set(id, { btn, disc, badge });
    }
    this.toast.id = 'homeHere';
    this.toast.setAttribute('role', 'status');
    this.toast.hidden = true;
    this.toast.append(svgIcon(TOOL_ICONS.veNha, 18, undefined, { ...STROKE, 'stroke-width': '2' }), h('span', '', HOME_HERE_TEXT));
    document.body.append(this.nav, this.toast);
  }

  /** Vẽ trạng thái (mỗi khung; chỉ đổi DOM khi khác). `null` = chưa có ngữ cảnh → ẩn. */
  render(v: ToolbarView | null, dt: number): void {
    if (this.toastLeft > 0) {
      this.toastLeft -= dt;
      if (this.toastLeft <= 0 || !v?.visible) this.toast.hidden = true;
    }
    const key = v ? `${v.visible}|${v.badge}|${v.active}|${TOOL_ORDER.map((id) => +v.on[id]).join('')}` : 'none';
    if (key === this.drawn) return;
    this.drawn = key;
    const shown = !!v?.visible;
    this.nav.classList.toggle('tb-hidden', !shown);
    this.nav.setAttribute('aria-hidden', String(!shown));
    document.body.classList.toggle('toolbar-off', !shown);
    if (!v) return;
    for (const [id, c] of this.cells) {
      c.btn.classList.toggle('off', !v.on[id]);
      c.btn.classList.toggle('open', v.active === id);
      c.btn.tabIndex = shown ? 0 : -1;
      c.btn.setAttribute('aria-label', toolAria(id, v.badge));
      if (id === 'bieuCam' || id === 'tuiDo') c.btn.setAttribute('aria-expanded', String(v.active === id));
      if (c.badge) {
        c.badge.hidden = v.badge <= 0;
        c.badge.textContent = String(v.badge);
      }
    }
  }

  /** Tấm báo "Bạn đang ở Nhà của ta" khoảng 2 giây (R-HANH-7). */
  homeHere(): void {
    this.toast.hidden = false;
    this.toastLeft = HOME_HERE_SECONDS;
  }

  /** Ô Biểu cảm trên màn (mũi nhọn bảng Biểu cảm trỏ vào giữa ô). */
  cellRect(id: ToolId): DOMRect {
    return this.cells.get(id)!.btn.getBoundingClientRect();
  }

  /** Phần tử của một ô (chạm ra ngoài bảng Biểu cảm nhưng trúng ô Biểu cảm = bấm lại, không phải "chạm ngoài"). */
  cell(id: ToolId): HTMLElement {
    return this.cells.get(id)!.btn;
  }
}
