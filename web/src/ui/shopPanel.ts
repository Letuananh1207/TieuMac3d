/**
 * Tạp hoá 雜貨 bản HTML (R-TIEN-4, R-TIEN-6 — chế độ thử trình duyệt R-TIEN-7). Thiết kế design/docs/screen_specs.md "Tạp hoá
 * 雜貨" (artboard `CuaHang-doc`, `-doc-ngheo`, `-doc-xac-nhan`, `-doc-vua-mua`, `-doc-het`, `-ngang`; mục 2026-11-14.12) — cùng
 * màn với Flutter `shop_screen.dart`. Đầu ấn son + ví, tab, lưới 3 / 5 cột, tấm đáy xác nhận, tấm "Đã mua" 3 s, dải nghèo /
 * đã mua hết; "Đóng" + Esc. DOM gốc `#shopPanel` ở index.html (`#shop` là nút nổi "Vào tiệm"), phần trong dựng bằng createElement. Không giữ luật: chữ + trạng thái
 * ở `zones/shopView.ts`, mua qua [ShopPanelHost.buy] (`walletRoom.ts` → `zones/walletRules.ts`).
 */
import { boughtView, confirmView, POOR_HINT, SEED_GRID_HINT, SEED_QTY, seedCrop, seedLine, SHOP_TABS, shopBanner, shopGroups, stockLine, type DecorStock, type ShopCard, type ShopEntry, type ShopTab } from '../zones/shopView';
import type { CropId } from '../zones/vuon';
import { formatCoins } from '../zones/wallet';
import type { BuyResult } from '../zones/walletRules';
import { cropPicture, SEED_PACK } from './cropArt';
import { COIN, DECOR_PICTURES, STROKE, svgIcon, type SvgNode } from './decorIcons';
import { el } from './dom';
import { coinIcon } from './wallet';
import './shop.css';

/** Tấm "Đã mua" hiện 3 s; viên "−n" dưới ví 1,5 s (thiết kế). */
const BOUGHT_MS = 3000;
const DELTA_MS = 1500;

const ICON_CLOSE: readonly SvgNode[] = [['path', { d: 'M6 6l12 12M18 6L6 18' }]];
const ICON_BOOK: readonly SvgNode[] = [['path', { d: 'M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z' }], ['path', { d: 'M12 6v13' }]];

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function button(cls: string, label: string, icon?: SVGElement): HTMLButtonElement {
  const b = h('button', cls);
  b.type = 'button';
  if (icon) b.append(icon);
  b.append(label);
  return b;
}

/** Hình phẳng của vật (khung 64) cỡ [size] trên nền giấy; hạt → hình cây chín (+ gói hạt 26 góc dưới phải khi [pack]). */
function picture(item: ShopEntry, size: number, pack = false): Node[] {
  const c = seedCrop(item);
  if (!c) return [svgIcon(DECOR_PICTURES[item.id] ?? [], size, '0 0 64 64', { fill: 'none' })];
  const out: Node[] = [cropPicture(c.id, size)];
  if (pack) {
    const p = svgIcon(SEED_PACK, 26, '0 0 26 26');
    p.classList.add('pack');
    out.push(p);
  }
  return out;
}

export interface ShopPanelHost {
  /** mua một vật (hạt: [count] hạt — × 1 · × 5 · × 10); `ok` → số dư + sở hữu mới (đã ghi kho) */
  buy(item: ShopEntry, count: number): BuyResult;
  /** túi hạt hiện có (thẻ "Trong túi: n" — R-VUON-9) */
  bag(): Partial<Record<CropId, number>>;
  /** màn vừa đóng ("Đóng" / Esc) */
  closed(): void;
}

export class ShopPanel {
  private readonly root = el('shopPanel');
  private readonly num = h('span', 'num');
  private readonly walletBtn = h('div', 'sp-wallet');
  private readonly walletWrap = h('div', 'sp-walletWrap');
  private readonly tabs = h('div', 'sp-tabs');
  private readonly banner = h('div', 'sp-banner');
  private readonly list = h('div', 'sp-list');
  private readonly dim = h('div', 'sp-dim');
  private readonly confirm = h('section', 'sp-confirm');
  private readonly toast = h('div', 'sp-toast');
  private balance = 0;
  private stock: DecorStock = { owned: {}, placed: {} };
  private tab: ShopTab = 'all';
  private picked: ShopEntry | null = null;
  /** số hạt đang chọn trong hộp xác nhận (R-VUON-9) */
  private qty = 1;
  private readonly seedHint = h('p', 'sp-seedHint', SEED_GRID_HINT);
  private toastTimer = 0;
  private deltaTimer = 0;

  constructor(
    private readonly items: readonly ShopEntry[],
    private readonly host: ShopPanelHost,
  ) {
    this.root.replaceChildren(...this.build());
    this.root.hidden = true;
    // Esc: đóng hộp xác nhận, rồi đóng tiệm — bắt trước phím của cảnh (input/keyboard.ts)
    window.addEventListener(
      'keydown',
      (e) => {
        if (this.root.hidden || e.key !== 'Escape') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (this.picked) this.pick(null);
        else this.close();
      },
      true,
    );
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** Mở tiệm với số dư + số cái đồ trang trí (sở hữu / đang đặt) hiện tại; tab về "Tất cả". */
  open(balance: number, stock: DecorStock): void {
    this.balance = balance;
    this.stock = { owned: { ...stock.owned }, placed: { ...stock.placed } };
    this.tab = 'all';
    this.picked = null;
    this.toast.hidden = true;
    this.walletBtn.classList.remove('down');
    this.walletWrap.querySelector('.wl-delta')?.remove();
    this.root.hidden = false;
    this.render();
    this.list.scrollTop = 0;
  }

  close(): void {
    if (this.root.hidden) return;
    this.picked = null;
    window.clearTimeout(this.toastTimer);
    this.root.hidden = true;
    this.host.closed();
  }

  /** Khung tĩnh: núi nền, đầu (ấn son 雜貨 + tên + ví), hàng tab (+ "Đóng" ở ngang), dải, lưới + mờ đáy, "Đóng" (dọc). */
  private build(): Node[] {
    const hills = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hills.setAttribute('class', 'sp-hills');
    hills.setAttribute('aria-hidden', 'true');
    hills.setAttribute('viewBox', '0 0 390 300');
    hills.setAttribute('preserveAspectRatio', 'none');
    for (const [d, fill] of [
      ['M0 150 L40 110 L78 132 L130 70 L170 112 L205 92 L250 128 L300 64 L350 118 L390 96 L390 300 L0 300 Z', '#D3DDDA'],
      ['M0 210 L50 172 L96 196 L150 150 L200 190 L240 168 L292 206 L340 176 L390 200 L390 300 L0 300 Z', '#BFCFCB'],
    ]) {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', fill);
      hills.append(p);
    }

    const titles = h('div', 'sp-titles');
    const name = h('h1', '', 'Tạp hoá'); // shopName
    // shopSubtitle (đổi 2026-11-15.42)
    const seeds = this.items.some((i) => i.slot === 'hat');
    titles.append(name, h('span', 'sub', seeds ? 'Đồ trang trí Nhà của ta · mỗi cái đặt một chỗ · hạt giống cho Vườn rau' : 'Đồ trang trí Nhà của ta · mỗi cái đặt một chỗ'));
    const brand = h('div', 'sp-brand');
    const seal = h('span', 'sp-seal'); // ấn son chữ Việt "Tạp hoá" (2026-11-15.29 — không chữ Hán, R-HUD-4)
    seal.setAttribute('aria-hidden', 'true');
    seal.append(h('span', '', 'Tạp'), h('span', '', 'hoá'));
    brand.append(seal, titles);
    this.walletBtn.setAttribute('role', 'img');
    this.walletBtn.append(coinIcon(26), this.num);
    this.walletWrap.append(this.walletBtn);
    const head = h('header', 'sp-head');
    head.append(brand, this.walletWrap);

    this.tabs.setAttribute('role', 'tablist');
    const closeWide = button('sp-closeSmall', 'Đóng', svgIcon(ICON_CLOSE, 14, undefined, { ...STROKE, 'stroke-width': '2.4' })); // shopClose
    closeWide.addEventListener('click', () => this.close());
    const bar = h('div', 'sp-bar');
    bar.append(this.tabs, closeWide);

    this.banner.setAttribute('role', 'note');
    const listWrap = h('div', 'sp-listWrap');
    listWrap.append(this.list, h('div', 'sp-fade'));

    const close = button('sp-close', 'Đóng', svgIcon(ICON_CLOSE, 18, undefined, { ...STROKE, 'stroke-width': '2.4' })); // shopClose
    close.addEventListener('click', () => this.close());

    const wrap = h('div', 'sp-wrap');
    wrap.append(head, bar, this.banner, this.seedHint, listWrap, close);

    this.dim.setAttribute('aria-hidden', 'true');
    this.dim.addEventListener('click', () => this.pick(null));
    this.confirm.setAttribute('role', 'dialog');
    this.toast.setAttribute('role', 'status');
    return [hills, wrap, this.dim, this.confirm, this.toast];
  }

  private pick(item: ShopEntry | null): void {
    this.picked = item;
    this.qty = 1;
    this.render();
  }

  private render(): void {
    this.num.textContent = formatCoins(this.balance);
    this.walletBtn.setAttribute('aria-label', `Văn tiền: ${formatCoins(this.balance)}`); // walletLabel
    this.tabs.replaceChildren(
      ...SHOP_TABS.map(({ tab, label }) => {
        const b = button(tab === this.tab ? 'sp-tab on' : 'sp-tab', label);
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(tab === this.tab));
        b.addEventListener('click', () => {
          this.tab = tab;
          this.render();
          this.list.scrollTop = 0;
        });
        return b;
      }),
    );
    this.renderBanner();
    this.seedHint.hidden = this.tab !== 'hat'; // shopSeedSub — chỉ ở tab Hạt giống
    this.list.replaceChildren(
      ...shopGroups(this.items, this.balance, this.tab, this.picked?.id ?? null).map((g) => {
        const sec = h('section', 'sp-group');
        if (g.title) sec.append(h('h3', '', g.title));
        const ul = h('ul', 'sp-grid');
        ul.append(...g.cards.map((c) => this.card(c)));
        sec.append(ul);
        return sec;
      }),
    );
    this.renderConfirm();
  }

  private renderBanner(): void {
    const kind = shopBanner(this.items, this.balance);
    this.banner.hidden = kind === null;
    this.banner.className = `sp-banner ${kind ?? ''}`;
    const text = h('span');
    if (kind === 'poor') {
      for (const [part, bold] of POOR_HINT) text.append(bold ? h('b', '', part) : part); // shopPoorHint
      this.banner.replaceChildren(svgIcon(ICON_BOOK, 20, undefined, { ...STROKE, stroke: '#2B5446', 'stroke-width': '2.2' }), text);
    } else this.banner.replaceChildren();
  }

  /** Thẻ vật: ô hình, tên, "Trong túi: n · Đang đặt: m" / "Chưa có" (đồ trang trí) hoặc "Trong túi: n" (hạt), giá, nút Mua / Còn thiếu n. */
  private card(c: ShopCard): HTMLLIElement {
    const { item } = c;
    const li = h('li', `sp-card ${c.state}${c.picked ? ' picked' : ''}`);
    const art = h('div', 'art');
    art.append(...picture(item, 54, true));
    const price = h('div', 'price');
    price.append(svgIcon(COIN, 14, '0 0 100 100'), h('b', '', formatCoins(item.price)));
    const seed = seedLine(item, this.host.bag());
    if (seed) price.append(h('span', 'time', `· ${seed.time}`));
    const act = button(`act ${c.state}`, c.text); // shopBuy / shopShort
    if (c.state === 'short') act.setAttribute('aria-disabled', 'true');
    else act.addEventListener('click', () => this.pick(item));
    li.append(art, h('div', 'name', item.name));
    if (seed) li.append(h('div', seed.inBag > 0 ? 'inbag has' : 'inbag', seed.text)); // shopInBag
    const stock = stockLine(item, this.stock);
    if (stock) li.append(h('div', stock.has ? 'inbag has' : 'inbag', stock.text)); // shopInBagPlaced / shopNotOwned
    li.append(price, act);
    return li;
  }

  /** Tấm đáy xác nhận (cảnh tối 28 %): hình 76 + câu hỏi + dòng phụ, bảng Đang có / Giá / Còn lại, "Thôi" + "Mua · n". */
  private renderConfirm(): void {
    const item = this.picked;
    this.dim.hidden = !item;
    this.confirm.hidden = !item;
    if (!item) {
      this.confirm.replaceChildren();
      return;
    }
    const c = seedCrop(item);
    const v = confirmView(item, this.balance, c ? { count: this.qty, inBag: this.host.bag()[c.id] ?? 0 } : undefined, this.stock);
    this.confirm.setAttribute('aria-label', `Xác nhận mua ${item.name}`);
    const art = h('div', 'art');
    art.append(...picture(item, 64));
    const q = h('div', 'q');
    q.textContent = `${v.before} ${v.after}`; // shopConfirm / shopSeedConfirm
    const txt = h('div', 'txt');
    txt.append(q, h('div', 'sub', v.sub)); // shopConfirmSub
    const top = h('div', 'top');
    top.append(art, txt);
    const parts: HTMLElement[] = [top];
    if (c) {
      // chọn số hạt × 1 · × 5 · × 10 (R-VUON-9; viên cao 36, đang chọn nền slate)
      const qty = h('div', 'qty');
      qty.setAttribute('role', 'radiogroup');
      qty.setAttribute('aria-label', 'Số hạt'); // shopQty
      for (const k of SEED_QTY) {
        const b = button(k === this.qty ? 'on' : '', `× ${k}`);
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(k === this.qty));
        b.addEventListener('click', () => {
          this.qty = k;
          this.renderConfirm();
        });
        qty.append(b);
      }
      const block = h('div', 'qtyBlock');
      block.append(h('div', 'qtyLabel', 'Số hạt'), qty);
      parts.push(block);
    }
    const dl = h('dl');
    for (const [k, val] of v.rows) dl.append(h('dt', '', k), h('dd', '', val)); // shopHave, shopPrice, shopAfter
    const cancel = button('cancel', 'Thôi'); // shopCancel
    cancel.addEventListener('click', () => this.pick(null));
    // shopBuyFor; thiếu cho số hạt đã chọn → "Còn thiếu n" nét đứt (R-VUON-9)
    const buy = v.short > 0 ? button('buy short', v.buy) : button('buy', v.buy, coinIcon(20));
    if (v.short > 0) buy.setAttribute('aria-disabled', 'true');
    else buy.addEventListener('click', () => this.buy(item));
    const row = h('div', 'row');
    row.append(cancel, buy);
    this.confirm.replaceChildren(...parts, dl, row);
    if (!v.short) buy.focus({ preventScroll: true });
  }

  private buy(item: ShopEntry): void {
    const count = seedCrop(item) ? this.qty : 1;
    const r = this.host.buy(item, count);
    this.picked = null;
    this.qty = 1;
    if (r.ok) {
      this.balance = r.balance;
      this.stock = { ...this.stock, owned: { ...r.owned } };
      this.showBought(item);
      this.showDelta(item.price * count);
    }
    this.render();
  }

  /** Tấm "Đã mua {vật}" + "Về nhà để đặt — …" 3 s; không tự đưa về nhà. */
  private showBought(item: ShopEntry): void {
    const v = boughtView(item, stockLine(item, this.stock)?.inBag ?? 0);
    const art = h('div', 'art');
    art.append(...picture(item, 40));
    const b = h('b', '', v.title); // shopBought
    const txt = h('div', 'txt');
    txt.append(b, h('span', 'sub', v.sub)); // shopBoughtSub
    this.toast.replaceChildren(art, txt);
    this.toast.hidden = false;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toast.hidden = true), BOUGHT_MS);
  }

  /** Ví đầu màn: viền son + viên "−n" 1,5 s (như ví HUD vừa trừ). */
  private showDelta(amount: number): void {
    this.walletWrap.querySelector('.wl-delta')?.remove();
    const d = h('span', 'wl-delta down', `−${formatCoins(amount)}`);
    this.walletWrap.append(d);
    this.walletBtn.classList.add('down');
    window.clearTimeout(this.deltaTimer);
    this.deltaTimer = window.setTimeout(() => {
      d.remove();
      this.walletBtn.classList.remove('down');
    }, DELTA_MS);
  }
}
