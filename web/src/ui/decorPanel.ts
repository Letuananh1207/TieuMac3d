/**
 * Túi đồ trang trí khi trang trí tự do (thiết kế 2026-11-15.42 `TrangTriTuDo-*`): dọc = khay đáy một hàng thẻ cuộn ngang (kéo tay
 * nắm lên → tấm 60 % màn lưới 3 cột), ngang / máy tính = cột phải lưới 3 cột; đầu khay "Túi đồ trang trí" / "Đồ trong nhà" + viên
 * đếm "n / 40 món"; thẻ "× n" · "Đặt hết · Mua thêm" · khoá "Mua ở Tạp hoá"; dải đủ trần; túi trống; khi cầm (điện thoại) khay thu
 * thành dải "Đang cầm: {vật} · trong túi còn n". Không giữ luật — `zones/decor.ts` `bagCards` tính thẻ, `homeDecor.ts` xử lý chạm.
 */
import type { BagCard } from '../zones/decor';
import { COIN, DECOR_PICTURES, ICON_BAG, ICON_LOCK, STROKE, svgIcon } from './decorIcons';

/** Kéo tay nắm quá ngần này (px) → mở / thu tấm đầy (dọc). */
const SWIPE_PX = 40;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/** Hình phẳng một vật trên thẻ (bản vẽ giữ chỗ `DECOR_PICTURES`). */
export function decorPicture(id: string, size: number): SVGElement {
  return svgIcon(DECOR_PICTURES[id] ?? [], size, '0 0 64 64', { fill: 'none' });
}

export interface TrayView {
  /** gian trong → "Đồ trong nhà", dòng "Gian trong · …" */
  indoor: boolean;
  /** số món đang đặt ở nơi này / trần */
  count: number;
  max: number;
  cards: readonly BagCard[];
}

export interface TrayHold {
  item: string;
  name: string;
  /** món đã đặt bị nhấc ("Đang dời") */
  lifted: boolean;
  /** trong túi còn (sau khi lấy) */
  left: number;
}

export interface TrayHandlers {
  card(itemId: string): void;
}

export class DecorTray {
  private readonly root = h('section');
  private readonly title = h('h2');
  private readonly count = h('span', 'dt-count');
  private readonly banner = h('div', 'dt-cap');
  private readonly list = h('ul', 'dt-list');
  private readonly empty = h('div', 'dt-empty');
  private readonly foot = h('p', 'dt-foot', 'Kéo lên để xem hết · có trong túi trước, rẻ → đắt'); // decorTrayHint
  private readonly strip = h('div');
  private flashId: string | null = null;
  private flashTimer = 0;
  private view: TrayView | null = null;

  constructor(private readonly on: TrayHandlers) {
    this.root.id = 'decorTray';
    this.root.hidden = true;
    this.root.setAttribute('aria-label', 'Túi đồ trang trí');
    const grip = h('div', 'grip');
    grip.setAttribute('aria-hidden', 'true');
    const head = h('header', 'dt-head');
    const ring = h('span', 'dt-ring');
    ring.append(svgIcon(ICON_BAG, 16, undefined, { ...STROKE, 'stroke-width': '2.2' }));
    head.append(ring, this.title, this.count);
    this.banner.setAttribute('role', 'note');
    this.empty.hidden = true;
    this.root.append(grip, head, this.banner, this.list, this.empty, this.foot);
    this.swipe(grip, head);
    this.strip.id = 'decorStrip';
    this.strip.hidden = true;
    this.strip.setAttribute('role', 'status');
    document.body.append(this.root, this.strip);
  }

  /** Bật / tắt khay (chế độ trang trí). */
  show(on: boolean): void {
    this.root.hidden = !on;
    if (!on) {
      this.strip.hidden = true;
      this.root.classList.remove('full');
      document.body.classList.remove('decor-holding');
    }
  }

  /** Vẽ lại thẻ + đầu khay. */
  render(v: TrayView): void {
    this.view = v;
    this.title.textContent = v.indoor ? 'Đồ trong nhà' : 'Túi đồ trang trí'; // decorBagTitleIndoor / decorBagTitle
    this.count.textContent = `${v.count} / ${v.max} món`; // decorCount
    const full = v.count >= v.max;
    this.count.classList.toggle('full', full);
    this.banner.hidden = !full;
    this.banner.textContent = `Đã đủ ${v.max} món — cất bớt để đặt thêm`; // decorCapFull / decorCapFullIndoor
    this.root.classList.toggle('capped', full);
    const any = v.cards.some((c) => c.state === 'bag');
    const owned = v.cards.some((c) => c.state !== 'locked');
    // túi trống: mọi món đã đặt (có đồ nhưng trong túi 0) — vẫn hiện thẻ "Đặt hết" / khoá bên dưới
    this.empty.hidden = any || !owned;
    if (!this.empty.hidden) {
      const ic = h('span', 'dt-emptyIc');
      ic.append(svgIcon(ICON_BAG, 26, undefined, { ...STROKE, 'stroke-width': '2' }));
      const txt = h('span');
      txt.append(h('b', '', 'Túi trống — mua thêm ở Tạp hoá phố chợ'), h('span', '', 'Mọi món đã đặt. Chạm một món trong sân → Cất để lấy lại vào túi.')); // decorBagEmpty / decorBagEmptyHint
      this.empty.replaceChildren(ic, txt);
    }
    this.list.replaceChildren(...v.cards.map((c) => this.card(c, full)));
  }

  /** Đang cầm (điện thoại): khay thu thành dải "Đang cầm / Đang dời"; `null` = mở lại khay. Máy tính giữ cột túi (CSS). */
  hold(v: TrayHold | null): void {
    document.body.classList.toggle('decor-holding', !!v);
    this.strip.hidden = !v;
    if (!v) return;
    this.root.classList.remove('full');
    const pic = h('span', 'ds-pic');
    pic.append(decorPicture(v.item, 28));
    const main = h('b', '', v.lifted ? `Đang dời: ${v.name}` : `Đang cầm: ${v.name}`); // decorMoving / decorHolding
    const sub = h('span', 'ds-sub', v.lifted ? ' · Huỷ = về chỗ cũ' : ` · trong túi còn ${v.left}`);
    this.strip.replaceChildren(pic, main, sub);
  }

  /** Viền `gold` 3 trên thẻ vừa chạm (thẻ khoá / đặt hết). */
  flash(id: string): void {
    this.flashId = id;
    window.clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => {
      this.flashId = null;
      if (this.view) this.render(this.view);
    }, 3000);
    if (this.view) this.render(this.view);
  }

  private card(c: BagCard, full: boolean): HTMLLIElement {
    const { item } = c;
    const btn = h('button', `dt-card ${c.state}${full && c.state === 'bag' ? ' capped' : ''}${this.flashId === item.id ? ' flash' : ''}`);
    btn.type = 'button';
    const pic = h('span', 'dt-pic');
    const art = h('span', 'art');
    art.append(decorPicture(item.id, 44));
    pic.append(art);
    const line = h('span', 'dt-line');
    if (c.state === 'bag') {
      const badge = h('span', 'dt-badge', `× ${c.inBag}`); // decorInBagBadge
      pic.append(badge);
      line.textContent = c.placed > 0 ? `Đang đặt ${c.placed}` : 'Chưa đặt'; // decorPlacedCount / decorNotPlaced
      btn.setAttribute('aria-label', `${item.name}, trong túi ${c.inBag}, đang đặt ${c.placed}`);
    } else {
      if (c.state === 'locked') {
        const lock = h('span', 'dt-lock');
        lock.setAttribute('aria-hidden', 'true');
        lock.append(svgIcon(ICON_LOCK, 13, undefined, { ...STROKE, 'stroke-width': '2.6' }));
        pic.append(lock);
      }
      line.textContent = c.state === 'locked' ? 'Mua ở Tạp hoá' : 'Đặt hết · Mua thêm'; // decorLocked / decorSoldOut
      btn.setAttribute('aria-label', `${item.name}, ${line.textContent}, ${item.price} Văn tiền`);
    }
    btn.append(pic, h('span', 'dt-name', item.name), line);
    if (c.state !== 'bag') {
      const price = h('span', 'dt-price');
      price.append(svgIcon(COIN, 12, '0 0 100 100'), h('b', '', String(item.price)));
      btn.append(price);
    }
    btn.addEventListener('click', () => this.on.card(item.id));
    const li = h('li');
    li.append(btn);
    return li;
  }

  /** Dọc: kéo tay nắm / đầu khay lên → tấm đầy 60 %; xuống → về một hàng. */
  private swipe(...grips: HTMLElement[]): void {
    let y0: number | null = null;
    for (const g of grips) {
      g.addEventListener('pointerdown', (e) => {
        y0 = e.clientY;
        g.setPointerCapture(e.pointerId);
      });
      g.addEventListener('pointerup', (e) => {
        if (y0 === null) return;
        const dy = e.clientY - y0;
        if (dy < -SWIPE_PX) this.root.classList.add('full');
        else if (dy > SWIPE_PX) this.root.classList.remove('full');
        y0 = null;
      });
    }
  }
}
