/**
 * Tấm Túi đồ (R-TUI-1 — thiết kế 2026-11-15.35 `TuiDo-*`): dọc tấm đáy cao 600 (tay nắm, kính .97, cảnh tối 12 %, che
 * thanh công cụ); ngang cột phải 340 từ mép safe. Đầu: vòng ngọc + "Túi đồ" + viên số dư + nút Đóng. 4 mục cuộn (không
 * tab): Hạt giống, Nông sản (chip hình cây + "× n"), Sách (bìa + tên + "Đọc"), Đồ trang trí (thẻ nhỏ, "Đang đặt"); mục
 * trống → khung nét đứt + dòng chỉ chỗ lấy. **Chỉ xem.** Đóng: nút Đóng, kéo tay nắm xuống, chạm cảnh, nút quay lại.
 * Dữ liệu dựng sẵn ở `zones/tuiDo.ts`. DOM dựng bằng createElement.
 */
import { BAG_TEXT, type BagCrop, type BagForest, type BagView } from '../zones/tuiDo';
import { formatCoins } from '../zones/wallet';
import { h } from './chatText';
import { cropPicture } from './cropArt';
import { DECOR_PICTURES, STROKE, svgIcon } from './decorIcons';
import { ICON_BOOK, ICON_CLOSE, TOOL_ICONS } from './toolbarIcons';
import { coinIcon } from './wallet';

/** Kéo tay nắm xuống quá chừng này (px) → đóng. */
const DRAG_CLOSE_PX = 60;

const stroke = { ...STROKE, 'stroke-width': '2' };

export class BagPanel {
  private readonly dim = h('div');
  private readonly root = h('section');
  private readonly coins = h('div', 'bg-coins');
  private readonly list = h('div', 'bg-list');
  private open = false;

  constructor(
    private readonly close: () => void,
    private readonly read: () => void,
  ) {
    this.dim.id = 'bagDim';
    this.dim.hidden = true;
    this.dim.addEventListener('pointerdown', () => this.close()); // chạm cảnh → đóng
    this.root.id = 'bagPanel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', BAG_TEXT.bagTitle);
    this.root.hidden = true;

    const grip = h('div', 'bg-grip');
    grip.setAttribute('aria-hidden', 'true');
    const head = h('div', 'bg-head');
    const ring = h('span', 'bg-ring');
    ring.append(svgIcon(TOOL_ICONS.tuiDo, 20, undefined, stroke));
    const shut = h('button', 'bg-close');
    shut.type = 'button';
    shut.setAttribute('aria-label', BAG_TEXT.bagClose);
    shut.append(svgIcon(ICON_CLOSE, 18, undefined, stroke));
    shut.addEventListener('click', () => this.close());
    head.append(ring, h('h2', 'bg-title', BAG_TEXT.bagTitle), this.coins, shut);
    this.root.append(grip, head, this.list, h('div', 'bg-foot', BAG_TEXT.bagReadOnly));
    document.body.append(this.dim, this.root);
    this.dragToClose(grip, head);
  }

  get isOpen(): boolean {
    return this.open;
  }

  show(on: boolean): void {
    this.open = on;
    this.root.hidden = !on;
    this.dim.hidden = !on;
    this.root.style.transform = '';
    document.body.classList.toggle('bag-open', on);
    if (on) this.list.scrollTop = 0;
  }

  /** Vẽ lại theo số đã lưu. */
  render(v: BagView): void {
    this.coins.hidden = v.coins === null;
    this.coins.replaceChildren(coinIcon(22), h('span', '', formatCoins(v.coins ?? 0)));
    this.coins.setAttribute('aria-label', `Văn tiền: ${v.coins ?? 0}`);
    const out: HTMLElement[] = [];
    out.push(...this.section(BAG_TEXT.bagSeeds, v.seeds.total, v.seeds.items.length ? this.chips(v.seeds.items, 'bg-seeds') : this.empty(v.seeds.empty)));
    out.push(...this.section(BAG_TEXT.bagCrops, v.crops.total, v.crops.items.length ? this.chips(v.crops.items, 'bg-crops') : this.empty(v.crops.empty)));
    out.push(...this.section(v.book.title, v.book.item ? 1 : 0, v.book.item ? this.bookRow(v.book.item.title) : this.empty(v.book.empty)));
    let decor: HTMLElement;
    if (v.decor.items.length) {
      decor = h('div', 'bg-decor');
      for (const d of v.decor.items) {
        const card = h('div', d.placed > 0 ? 'bg-card placed' : 'bg-card');
        const pic = h('div', 'bg-pic');
        const art = DECOR_PICTURES[d.id];
        if (art) pic.append(svgIcon(art, 34, '0 0 64 64'));
        card.append(pic, h('div', 'bg-name', d.name));
        card.append(h('span', 'bg-counts', d.text)); // bagDecorCounts (2026-11-15.42)
        decor.append(card);
      }
    } else decor = this.empty(v.decor.empty);
    out.push(...this.section(BAG_TEXT.bagDecor, v.decor.total, decor));
    // ngăn Lâm sản (R-TUI-1, V-66 B4): cùng kiểu chip "tên × n" của Nông sản; hình măng chờ thiết kế (phiếu 2026-11-15-truc-lam-mini-game)
    out.push(...this.section(BAG_TEXT.bagForest, v.forest.total, v.forest.items.length ? this.chips(v.forest.items, 'bg-crops') : this.empty(v.forest.empty)));
    this.list.replaceChildren(...out);
  }

  private section(title: string, n: number, body: HTMLElement): HTMLElement[] {
    const head = h('h3', 'bg-sec', title);
    head.append(h('span', 'bg-count', String(n)));
    return [head, body];
  }

  private chips(items: readonly (BagCrop | BagForest)[], cls: string): HTMLElement {
    const grid = h('div', `bg-chips ${cls}`);
    for (const c of items) {
      const chip = h('div', 'bg-chip');
      const pic = h('span', 'bg-crop');
      if ('crop' in c) pic.append(cropPicture(c.crop, 30));
      const txt = h('div', 'bg-txt');
      txt.append(h('div', 'bg-name', c.name), h('div', 'bg-n', `× ${c.n}`));
      chip.append(pic, txt);
      grid.append(chip);
    }
    return grid;
  }

  private bookRow(title: string): HTMLElement {
    const row = h('div', 'bg-book');
    const cover = h('span', 'bg-cover');
    cover.setAttribute('aria-hidden', 'true');
    const btn = h('button', 'bg-read');
    btn.type = 'button';
    btn.append(svgIcon(ICON_BOOK, 16, undefined, stroke), BAG_TEXT.bagRead);
    btn.setAttribute('aria-label', `Đọc ${title}`);
    btn.addEventListener('click', () => this.read());
    row.append(cover, h('div', 'bg-name', title), btn);
    return row;
  }

  private empty(text: string): HTMLElement {
    return h('div', 'bg-empty', text);
  }

  /** Kéo tay nắm / đầu tấm xuống → đóng (dọc). */
  private dragToClose(...handles: HTMLElement[]): void {
    let start: { id: number; y: number } | null = null;
    for (const el of handles) {
      el.addEventListener('pointerdown', (e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        start = { id: e.pointerId, y: e.clientY };
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', (e) => {
        if (start?.id !== e.pointerId) return;
        this.root.style.transform = `translateY(${Math.max(0, e.clientY - start.y)}px)`;
      });
      const end = (e: PointerEvent): void => {
        if (start?.id !== e.pointerId) return;
        const dy = e.clientY - start.y;
        start = null;
        this.root.style.transform = '';
        if (dy > DRAG_CLOSE_PX) this.close();
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }
  }
}
