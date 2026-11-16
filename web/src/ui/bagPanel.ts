/**
 * Tấm Túi đồ (R-TUI-1 — thiết kế 2026-11-15.35 `TuiDo-*`, sửa 2026-11-16.4 `TuiDo-vuon-{doc,ngang}`): dọc tấm đáy cao 600
 * (tay nắm, kính .97, cảnh tối 12 %, che thanh công cụ); ngang cột phải 340 từ mép safe. Đầu: hình túi + "Túi đồ" + viên số
 * dư + nút Đóng. **5 tab hình** dưới đầu tấm: Hạt giống · Đồ làm vườn · Nông sản · Sách · Trang trí (ô tab bo 12, hình 34 +
 * nhãn 10/700; tab mở nền trắng viền `jade` 2). Hạt giống / Nông sản = lưới ô vuông 72 (ngang 52) 4 cột (ngang 5), số góc
 * dưới phải; chạm → ô viền `jade` + thẻ chi tiết `slate` dưới lưới. Đồ làm vườn = "Nông cụ" (5 ô, không số) + "Vật tư"
 * (Phân bón × n) + chân. Tab thứ 4 **Lâm sản** (thiết kế 2026-11-16.13 `TuiDo-lam-san-*`): lưới ô búp măng, chạm → thẻ
 * "Măng to × 1 · Hái ở Trúc Lâm · bán cho Trúc Ông 8 Văn / cái"; trống → khung nét đứt. **Chỉ xem.** Đóng: nút Đóng, kéo tay nắm xuống, chạm
 * cảnh, nút quay lại. Dữ liệu dựng sẵn ở `zones/tuiDo.ts`. DOM dựng bằng createElement.
 */
import './bag.css';
import { MANG_PRICES } from '../zones/mang';
import { BAG_TABS, BAG_TEXT, BAG_TOOLS, type BagCrop, type BagForest, type BagTab, type BagView } from '../zones/tuiDo';
import { cropOf } from '../zones/vuon';
import { growText } from '../zones/vuonHud';
import type { SlotId } from '../zones/vuonVong';
import { formatCoins } from '../zones/wallet';
import { h } from './chatText';
import { cropPicture } from './cropArt';
import { COIN, DECOR_PICTURES, STROKE, svgIcon } from './decorIcons';
import { hinhImg, type HinhId } from './hinh';
import { shootIcon } from './trucLamIcons';
import { ICON_BOOK, ICON_CLOSE } from './toolbarIcons';
import { BUG_NET, FERT_BAG, HAND, WEED } from './vuonIcons';
import { coinIcon } from './wallet';

/** Kéo tay nắm xuống quá chừng này (px) → đóng. */
const DRAG_CLOSE_PX = 60;

const stroke = { ...STROKE, 'stroke-width': '2' };

/** Hình tab (hình minh hoạ đợt 1–2); Sách chưa có hình cuốn sách riêng → biểu tượng nét. */
const TAB_HINH: Readonly<Record<Exclude<BagTab, 'sach' | 'lam'>, HinhId>> = { hat: 'gieo', vuon: 'tuoi', nong: 'thu', trang: 'trang-tri' };

/** Hình nông cụ (hình đợt 2 hoặc hình giữ chỗ — `vuonIcons.ts`). */
function toolArt(id: SlotId, size: number): Element {
  if (id === 'binh') return hinhImg('tuoi', size);
  if (id === 'mo') return hinhImg('mo-o', size);
  if (id === 'hat') return hinhImg('gieo', size);
  return svgIcon({ tay: HAND, sau: BUG_NET, co: WEED, phan: FERT_BAG }[id], size, '0 0 48 48');
}

export class BagPanel {
  private readonly dim = h('div');
  private readonly root = h('section');
  private readonly coins = h('div', 'bg-coins');
  private readonly tabs = h('div', 'bg-tabs');
  private readonly list = h('div', 'bg-list');
  private readonly foot = h('div', 'bg-foot', BAG_TEXT.bagReadOnly);
  private open = false;
  private tab: BagTab = 'hat';
  private view: BagView | null = null;
  /** ô đang chọn (thẻ chi tiết) trong tab Hạt giống / Nông sản */
  private picked: string | null = null;

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
    const ring = h('span', 'bg-ring hinhRing');
    ring.append(hinhImg('tui-do', 34));
    const shut = h('button', 'bg-close');
    shut.type = 'button';
    shut.setAttribute('aria-label', BAG_TEXT.bagClose);
    shut.append(svgIcon(ICON_CLOSE, 18, undefined, stroke));
    shut.addEventListener('click', () => this.close());
    head.append(ring, h('h2', 'bg-title', BAG_TEXT.bagTitle), this.coins, shut);
    this.tabs.setAttribute('role', 'tablist');
    this.root.append(grip, head, this.tabs, this.list, this.foot);
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
    this.picked = null;
    document.body.classList.toggle('bag-open', on);
    if (on) this.list.scrollTop = 0;
  }

  /** Mở sẵn tab [tab] (và ô [picked]) — Canvas 3D chụp so thiết kế. */
  showTab(tab: BagTab, picked: string | null = null): void {
    this.tab = tab;
    this.picked = picked;
    this.draw();
  }

  /** Vẽ lại theo số đã lưu. */
  render(v: BagView): void {
    this.view = v;
    this.coins.hidden = v.coins === null;
    this.coins.replaceChildren(coinIcon(22), h('span', '', formatCoins(v.coins ?? 0)));
    this.coins.setAttribute('aria-label', `Văn tiền: ${v.coins ?? 0}`);
    this.draw();
  }

  private draw(): void {
    const v = this.view;
    if (!v) return;
    this.tabs.replaceChildren(
      ...BAG_TABS.map(({ tab, label }) => {
        const b = h('button', tab === this.tab ? 'bg-tab on' : 'bg-tab');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(tab === this.tab));
        b.append(tab === 'sach' ? svgIcon(ICON_BOOK, 30, undefined, stroke) : tab === 'lam' ? shootIcon(34) : hinhImg(TAB_HINH[tab], 34), h('span', '', label));
        b.addEventListener('click', () => {
          this.tab = tab;
          this.picked = null;
          this.draw();
          this.list.scrollTop = 0;
        });
        return b;
      }),
    );
    this.foot.textContent = this.tab === 'vuon' ? BAG_TEXT.bagToolsHint : this.tab === 'lam' ? BAG_TEXT.bagForestFoot : BAG_TEXT.bagReadOnly;
    this.list.replaceChildren(...this.body(v));
  }

  private body(v: BagView): HTMLElement[] {
    switch (this.tab) {
      case 'hat':
        return v.seeds.items.length ? this.cells(v.seeds.items, true) : [this.empty(v.seeds.empty)];
      case 'nong':
        return v.crops.items.length ? this.cells(v.crops.items, false) : [this.empty(v.crops.empty)];
      case 'lam':
        return v.forest.items.length ? this.forest(v.forest.items) : [this.forestEmpty()];
      case 'vuon':
        return [this.section(BAG_TEXT.bagToolsSection), this.tools(), this.section(BAG_TEXT.bagSuppliesSection), this.supplies(v.fert)];
      case 'sach':
        return [v.book.item ? this.bookRow(v.book.item.title) : this.empty(v.book.empty)];
      case 'trang':
        return [this.decor(v)];
    }
  }

  private section(title: string): HTMLElement {
    return h('h3', 'bg-sec', title);
  }

  /** Lưới ô vuông hạt / nông sản: số góc dưới phải; chạm → viền `jade` + thẻ chi tiết dưới lưới. */
  private cells(items: readonly BagCrop[], seed: boolean): HTMLElement[] {
    const grid = h('div', 'bg-cells');
    for (const c of items) {
      const b = h('button', c.crop === this.picked ? 'bg-cell on' : 'bg-cell');
      b.type = 'button';
      b.setAttribute('aria-label', `${c.name} × ${c.n}`);
      b.setAttribute('aria-pressed', String(c.crop === this.picked));
      b.append(cropPicture(c.crop, 52), h('span', 'bg-num', String(c.n)));
      b.addEventListener('click', () => {
        this.picked = this.picked === c.crop ? null : c.crop;
        this.draw();
      });
      grid.append(b);
    }
    const out: HTMLElement[] = [grid];
    const pick = items.find((c) => c.crop === this.picked);
    const crop = pick ? cropOf(pick.crop) : undefined;
    if (crop) {
      const card = h('div', 'bg-detail');
      const sell = h('span', 'bg-sell');
      sell.append('bán ', svgIcon(COIN, 13, '0 0 100 100'), ` ${crop.sell} / cái`); // gardenSellPrice
      card.append(h('b', '', crop.name));
      if (seed) card.append(h('span', '', `Lớn trong ${growText(crop)}`)); // gardenSeedGrown
      card.append(sell);
      out.push(card);
    }
    return out;
  }

  /** Nông cụ: ô vuông + tên 11/700, không số. */
  private tools(): HTMLElement {
    const grid = h('div', 'bg-cells tools');
    for (const t of BAG_TOOLS) {
      const cell = h('div', 'bg-tool');
      const sq = h('span', 'bg-cell');
      sq.append(toolArt(t.id, 46));
      cell.append(sq, h('span', 'bg-toolName', t.name));
      grid.append(cell);
    }
    return grid;
  }

  /** Vật tư: Phân bón × n (R-VUON-12). */
  private supplies(fert: number): HTMLElement {
    const grid = h('div', 'bg-cells tools');
    const cell = h('div', 'bg-tool');
    const sq = h('span', 'bg-cell');
    sq.setAttribute('aria-label', `${BAG_TEXT.bagFert} × ${fert}`);
    sq.append(svgIcon(FERT_BAG, 46, '0 0 48 48'), h('span', fert > 0 ? 'bg-num' : 'bg-num zero', String(fert)));
    cell.append(sq, h('span', 'bg-toolName', BAG_TEXT.bagFert));
    grid.append(cell);
    return grid;
  }

  /** Lâm sản (R-TUI-1, R-MANG-3/5): lưới ô búp măng + số; chạm → thẻ chi tiết (nơi hái, giá Trúc Ông). */
  private forest(items: readonly BagForest[]): HTMLElement[] {
    const grid = h('div', 'bg-cells');
    for (const c of items) {
      const b = h('button', c.kind === this.picked ? 'bg-cell on' : 'bg-cell');
      b.type = 'button';
      b.setAttribute('aria-label', `${c.name} × ${c.n}`);
      b.setAttribute('aria-pressed', String(c.kind === this.picked));
      b.append(shootIcon(46, c.kind === 'mang-to'), h('span', 'bg-num', String(c.n)));
      b.addEventListener('click', () => {
        this.picked = this.picked === c.kind ? null : c.kind;
        this.draw();
      });
      grid.append(b);
    }
    const out: HTMLElement[] = [grid];
    const pick = items.find((c) => c.kind === this.picked);
    if (pick) {
      const card = h('div', 'bg-detail bg-forest');
      const txt = h('div', 'bg-txt');
      txt.append(h('b', '', `${pick.name} × ${pick.n}`), h('span', '', `${BAG_TEXT.bagForestWhere} ${MANG_PRICES[pick.kind]} Văn / cái`));
      card.append(shootIcon(30, pick.kind === 'mang-to'), txt);
      out.push(card);
    }
    return out;
  }

  /** Lâm sản trống: khung nét đứt + búp măng mờ + "Chưa có lâm sản" + chỗ lấy. */
  private forestEmpty(): HTMLElement {
    const box = h('div', 'bg-forestEmpty');
    const pic = shootIcon(40);
    pic.classList.add('dim');
    box.append(pic, h('b', '', BAG_TEXT.bagForestEmptyTitle), h('span', '', BAG_TEXT.bagForestEmpty));
    return box;
  }

  private decor(v: BagView): HTMLElement {
    if (!v.decor.items.length) return this.empty(v.decor.empty);
    const decor = h('div', 'bg-decor');
    for (const d of v.decor.items) {
      const card = h('div', d.placed > 0 ? 'bg-card placed' : 'bg-card');
      const pic = h('div', 'bg-pic');
      const art = DECOR_PICTURES[d.id];
      if (art) pic.append(svgIcon(art, 34, '0 0 64 64'));
      card.append(pic, h('div', 'bg-name', d.name));
      card.append(h('span', 'bg-counts', d.text)); // bagDecorCounts (2026-11-15.42)
      decor.append(card);
    }
    return decor;
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
