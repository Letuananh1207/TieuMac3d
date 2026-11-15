/**
 * Bảng Vườn rau (thiết kế 2026-11-15.29 `VuonRau-hat-*`, `VuonRau-kho-*`, `VuonRau-mo-o-*`): tấm đáy kiểu bảng danh mục
 * trang trí (dọc: cao 420 / 330, bo trên 20, tay nắm; ngang: cột phải 310) — kho nông sản (bán từng
 * loại / bán hết theo trần), hộp mở ô (cảnh tối 28 %); chọn hạt chuyển sang lưới hạt trên vòng công cụ (2026-11-16.4). Kéo tay nắm xuống / chạm cảnh → đóng. Không giữ luật — chữ + số ở
 * `zones/vuonHud.ts`, thao tác ở `homeGarden.ts`. DOM dựng bằng `createElement`.
 */
import type { CropId } from '../zones/vuon';
import { capLeftText, sellAllText, type StoreView, type UnlockView, UNLOCK_SUB } from '../zones/vuonHud';
import { cropPicture, ICON_BAG, ICON_CRATE, UNLOCK_PICTURE } from './cropArt';
import { COIN, STROKE, svgIcon, type SvgNode } from './decorIcons';
import { coinIcon } from './wallet';

/** Kéo tay nắm xuống quá ngần này (px) → đóng. */
const SWIPE_CLOSE_PX = 60;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function button(cls: string, ...kids: (Node | string)[]): HTMLButtonElement {
  const b = h('button', cls);
  b.type = 'button';
  b.append(...kids);
  return b;
}

const icon = (nodes: readonly SvgNode[], size: number, width = '2'): SVGElement => svgIcon(nodes, size, undefined, { ...STROKE, 'stroke-width': width });
const coin = (size: number): SVGElement => svgIcon(COIN, size, '0 0 100 100');

export interface GardenPanelHandlers {
  sell(crop: CropId | null): void;
  unlock(): void;
  close(): void;
}

export type PanelKind = 'kho' | 'mo-o';

export class GardenPanel {
  private readonly root = h('section');
  private readonly dim = h('div');
  private kindNow: PanelKind | null = null;

  constructor(private readonly on: GardenPanelHandlers) {
    this.root.id = 'gardenPanel';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.dim.id = 'gardenDim';
    this.dim.hidden = true;
    this.dim.addEventListener('click', () => on.close());
    document.body.append(this.dim, this.root);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  get kind(): PanelKind | null {
    return this.kindNow;
  }

  close(): void {
    this.root.hidden = true;
    this.dim.hidden = true;
    this.kindNow = null;
    document.body.classList.remove('garden-panel');
  }

  /** Kho nông sản (R-VUON-7): hàng × giá, "Bán" từng loại, chip túi hạt, nút lớn / dải đủ trần. */
  showStore(v: StoreView, bag: readonly { name: string; n: number }[]): void {
    const head = this.head(ICON_CRATE, 'Kho nông sản', v.soldText); // gardenStore, gardenSoldToday
    const bar = h('span', `vr-bar${v.sold >= 60 ? ' full' : ''}`);
    const fill = h('i');
    fill.style.width = `${Math.round(v.frac * 100)}%`;
    bar.append(fill);
    const sub = head.querySelector('.sub');
    if (sub) {
      const row = h('span', 'subRow');
      sub.replaceWith(row);
      row.append(sub, bar);
    }
    const parts: HTMLElement[] = [head];
    if (!v.rows.length) {
      parts.push(this.empty(ICON_CRATE, 'Kho trống — thu hoạch rồi mang tới đây', 'Luống chín có lấp lánh. Mỗi luống cho 2–4 cái (tưới càng đủ càng nhiều).'));
    } else {
      const list = h('ul', 'vr-rows');
      for (const r of v.rows) {
        const li = h('li');
        const pic = h('span', 'pic');
        pic.append(cropPicture(r.crop.id, 40));
        const name = h('span', 'name');
        name.append(h('b', '', r.crop.name), h('span', 'n', ` × ${r.count}`));
        const price = h('span', 'price');
        price.append(coin(12), `${r.crop.sell} / cái`);
        const txt = h('span', 'txt');
        txt.append(name, price);
        const sell = button(r.canSell ? 'vr-sell' : 'vr-sell off', 'Bán'); // gardenSell
        sell.setAttribute('aria-label', `Bán ${r.crop.name}`);
        if (r.canSell) sell.addEventListener('click', () => this.on.sell(r.crop.id));
        else sell.setAttribute('aria-disabled', 'true');
        li.append(pic, txt, sell);
        list.append(li);
      }
      parts.push(list);
    }
    const foot = h('div', 'vr-storeFoot');
    if (bag.length) {
      const chips = h('div', 'vr-bag');
      chips.append(icon(ICON_BAG, 16), h('span', 'lbl', 'Túi hạt:')); // gardenBag
      for (const c of bag) chips.append(h('span', 'chip', `${c.name} ${c.n}`));
      foot.append(chips);
    }
    if (v.rows.length) {
      if (v.capped) foot.append(h('div', 'vr-capped', 'Hôm nay thu mua đã đủ — mai bán tiếp')); // gardenCapReached
      else {
        if (v.overCap) foot.append(h('div', 'vr-capLeft', capLeftText(v.room))); // gardenCapLeft
        const all = button('vr-big', coinIcon(20), sellAllText(v)); // gardenSellAll / gardenSellUpTo
        all.addEventListener('click', () => this.on.sell(null));
        foot.append(all);
      }
    }
    parts.push(foot);
    this.open('kho', parts);
  }

  /** Hộp mở ô (R-VUON-8): hình đất hoang + khoá mở, Đang có / Giá / Còn lại, "Thôi" + "Mở · n" (thiếu → nét đứt). */
  showUnlock(v: UnlockView): void {
    const top = h('div', 'vr-unlockTop');
    const pic = h('span', 'pic');
    pic.append(svgIcon(UNLOCK_PICTURE, 76, '0 0 76 76'));
    const txt = h('div', 'txt');
    txt.append(h('h2', '', v.title), h('p', 'sub', UNLOCK_SUB)); // gardenUnlockTitle, gardenUnlockSub
    top.append(pic, txt);
    const dl = h('dl');
    v.rows.forEach(([k, val], i) => {
      const dd = h('dd');
      if (i !== 1 && val !== '—') dd.append(coin(18));
      dd.append(val);
      dl.append(h('dt', '', k), dd);
    });
    const cancel = button('vr-cancel', 'Thôi'); // gardenCancel
    cancel.addEventListener('click', () => this.on.close());
    const ok = v.short > 0 ? button('vr-big short', v.action) : button('vr-big', coinIcon(20), v.action); // gardenUnlockFor / gardenShort
    if (v.short > 0) ok.setAttribute('aria-disabled', 'true');
    else ok.addEventListener('click', () => this.on.unlock());
    const row = h('div', 'vr-row');
    row.append(cancel, ok);
    this.open('mo-o', [top, dl, row]);
  }

  private open(kind: PanelKind, parts: HTMLElement[]): void {
    const grip = h('div', 'grip');
    grip.setAttribute('aria-hidden', 'true');
    this.swipeToClose(grip);
    this.root.className = `vr-${kind}`;
    this.root.setAttribute('aria-label', kind === 'kho' ? 'Kho nông sản' : 'Mở ô đất');
    this.root.replaceChildren(grip, ...parts);
    this.root.hidden = false;
    this.dim.hidden = kind !== 'mo-o'; // hộp mở ô: cảnh tối 28 %
    this.kindNow = kind;
    document.body.classList.add('garden-panel');
  }

  private head(nodes: readonly SvgNode[], title: string, sub: string): HTMLElement {
    const head = h('header', 'vr-head');
    const ring = h('span', 'ring');
    ring.append(icon(nodes, 20));
    const titles = h('div', 'titles');
    titles.append(h('h2', '', title), h('span', 'sub', sub));
    head.append(ring, titles);
    return head;
  }

  private empty(nodes: readonly SvgNode[], title: string, hint: string): HTMLElement {
    const box = h('div', 'vr-empty');
    const ring = h('span', 'ring');
    ring.append(icon(nodes, 28));
    box.append(ring, h('b', '', title), h('span', 'hint', hint)); // gardenBagEmpty(Hint) / gardenStoreEmpty(Hint)
    return box;
  }

  /** Kéo tay nắm xuống → đóng. */
  private swipeToClose(grip: HTMLElement): void {
    let y0: number | null = null;
    grip.addEventListener('pointerdown', (e) => {
      y0 = e.clientY;
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener('pointerup', (e) => {
      if (y0 !== null && e.clientY - y0 > SWIPE_CLOSE_PX) this.on.close();
      y0 = null;
    });
  }
}
