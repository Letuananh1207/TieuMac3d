/**
 * Dải kho đồ trang trí khi trang trí tự do (V-75 — theo người dùng, học bố cục dải kho 摩尔 bản web; chưa có trên canvas, ghi lệch
 * `docs/testing/gui_thiet_ke_2026-11-16.md`): dải gỗ đáy màn ở **mọi màn** — hàng tab trên (viên đếm "n / 40 món" · Tất cả · nhóm có
 * món), khung giấy một hàng **ô vuông** (hình món + số trong túi góc dưới phải + tên), mũi tên lật trang trái / phải (+ vuốt ngang,
 * cuộn chuột), nút tròn "Xong" góc phải. **Chỉ đồ còn trong túi**; túi trống → một dòng nhắc. Khi cầm (điện thoại) dải thu thành dải
 * "Đang cầm: {vật} · trong túi còn n" (V-69). Không giữ luật — `zones/decorStock.ts` lọc / tab / trang, `homeDecor.ts` xử lý chạm.
 */
import { pageSlice, perPage, stockTabs, tabCards, type StockCard, type StockTab } from '../zones/decorStock';
import { DECOR_PICTURES, ICON_BAG, ICON_CHECK, STROKE, svgIcon } from './decorIcons';

/** Vuốt ngang quá ngần này (px) → lật trang. */
const SWIPE_PX = 40;
/** Khe giữa hai ô (px) — trùng `gap` của `.dt-list` ở decor.css. */
const GAP = 8;
/** Cuộn chuột: tối đa một trang mỗi ngần này (ms). */
const WHEEL_MS = 260;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/** Hình phẳng một vật trên ô (bản vẽ giữ chỗ `DECOR_PICTURES`). */
export function decorPicture(id: string, size: number): SVGElement {
  return svgIcon(DECOR_PICTURES[id] ?? [], size, '0 0 64 64', { fill: 'none' });
}

/** Mũi tên tam giác lật trang. */
function arrow(dir: 'prev' | 'next'): SVGElement {
  const d = dir === 'prev' ? 'M15 5L7 12l8 7z' : 'M9 5l8 7-8 7z';
  return svgIcon([['path', { d }]], 20, undefined, { fill: 'currentColor' });
}

export interface TrayView {
  /** gian trong → nhãn "Đồ trong nhà" */
  indoor: boolean;
  /** số món đang đặt ở nơi này / trần */
  count: number;
  max: number;
  /** đồ còn trong túi hợp nơi (`bagStock`) */
  cards: readonly StockCard[];
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
  /** nút tròn "Xong" — thoát chế độ trang trí */
  done(): void;
}

export class DecorTray {
  private readonly root = h('section');
  private readonly count = h('span', 'dt-count');
  private readonly tabsEl = h('div', 'dk-tabs');
  private readonly prev = h('button', 'dk-arrow prev');
  private readonly next = h('button', 'dk-arrow next');
  private readonly port = h('div', 'dk-port');
  private readonly list = h('ul', 'dt-list');
  private readonly empty = h('div', 'dt-empty');
  private readonly banner = h('div', 'dt-cap');
  private readonly strip = h('div');
  private tab: StockTab = 'tat-ca';
  private page = 0;
  private pages = 1;
  private flashId: string | null = null;
  private flashTimer = 0;
  private wheelAt = 0;
  private swiped = false;
  private view: TrayView | null = null;

  constructor(private readonly on: TrayHandlers) {
    this.root.id = 'decorTray';
    this.root.hidden = true;
    this.root.setAttribute('aria-label', 'Túi đồ trang trí');
    const top = h('div', 'dk-top');
    this.tabsEl.setAttribute('role', 'tablist');
    top.append(this.count, this.tabsEl);
    const box = h('div', 'dk-box');
    for (const [b, dir, label] of [[this.prev, -1, 'Trang trước'], [this.next, 1, 'Trang sau']] as const) {
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.append(arrow(dir < 0 ? 'prev' : 'next'));
      b.addEventListener('click', () => this.turn(dir));
    }
    this.empty.hidden = true;
    this.port.append(this.list, this.empty);
    box.append(this.prev, this.port, this.next);
    const close = h('button', 'dk-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Xong'); // decorDone
    close.append(svgIcon(ICON_CHECK, 22, undefined, { ...STROKE, 'stroke-width': '3' }), h('span', 'lbl', 'Xong'));
    close.addEventListener('click', () => on.done());
    this.banner.setAttribute('role', 'note');
    this.banner.hidden = true;
    this.root.append(this.banner, top, box, close);
    this.gestures();
    this.strip.id = 'decorStrip';
    this.strip.hidden = true;
    this.strip.setAttribute('role', 'status');
    document.body.append(this.root, this.strip);
    window.addEventListener('resize', () => {
      if (!this.root.hidden && this.view) this.render(this.view);
    });
  }

  /** Bật / tắt dải (chế độ trang trí); bật → về tab Tất cả, trang đầu. */
  show(on: boolean): void {
    this.root.hidden = !on;
    if (on) {
      this.tab = 'tat-ca';
      this.page = 0;
    } else {
      this.strip.hidden = true;
      document.body.classList.remove('decor-holding');
    }
  }

  /** Vẽ lại tab + một trang ô. */
  render(v: TrayView): void {
    this.view = v;
    this.count.textContent = `${v.indoor ? 'Trong nhà · ' : ''}${v.count} / ${v.max} món`; // decorCount
    const full = v.count >= v.max;
    this.count.classList.toggle('full', full);
    this.banner.hidden = !full;
    this.banner.textContent = `Đã đủ ${v.max} món — cất bớt để đặt thêm`; // decorCapFull / decorCapFullIndoor
    const tabs = stockTabs(v.cards);
    if (!tabs.some((t) => t.id === this.tab)) this.tab = 'tat-ca';
    this.tabsEl.replaceChildren(
      ...tabs.map((t) => {
        const b = h('button', `dk-tab${t.id === this.tab ? ' on' : ''}`, t.name);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(t.id === this.tab));
        b.addEventListener('click', () => {
          this.tab = t.id;
          this.page = 0;
          if (this.view) this.render(this.view);
        });
        return b;
      }),
    );
    const empty = !v.cards.length;
    this.empty.hidden = !empty;
    this.list.hidden = empty;
    this.root.classList.toggle('empty', empty);
    if (empty) {
      this.empty.replaceChildren(svgIcon(ICON_BAG, 20, undefined, { ...STROKE, 'stroke-width': '2.2' }), h('span', '', 'Túi trống — mua đồ ở Tạp hoá')); // decorBagEmpty
      this.list.replaceChildren();
      this.pages = 1;
    } else {
      const cell = parseFloat(getComputedStyle(this.root).getPropertyValue('--dk-cell')) || 64;
      const s = pageSlice(tabCards(v.cards, this.tab), perPage(this.port.clientWidth, cell, GAP), this.page);
      this.page = s.page;
      this.pages = s.pages;
      this.list.replaceChildren(...s.items.map((c) => this.card(c, full)));
    }
    this.prev.disabled = this.page <= 0;
    this.next.disabled = this.page >= this.pages - 1;
    this.root.classList.toggle('one-page', this.pages <= 1);
  }

  /** Đang cầm (điện thoại): dải thu thành dải "Đang cầm / Đang dời"; `null` = mở lại dải. Máy tính giữ dải (CSS). */
  hold(v: TrayHold | null): void {
    document.body.classList.toggle('decor-holding', !!v);
    this.strip.hidden = !v;
    if (!v) return;
    const pic = h('span', 'ds-pic');
    pic.append(decorPicture(v.item, 28));
    const main = h('b', '', v.lifted ? `Đang dời: ${v.name}` : `Đang cầm: ${v.name}`); // decorMoving / decorHolding
    const sub = h('span', 'ds-sub', v.lifted ? ' · Huỷ = về chỗ cũ' : ` · trong túi còn ${v.left}`);
    this.strip.replaceChildren(pic, main, sub);
  }

  /** Viền `gold` 3 s trên ô vừa chạm mà không lấy được (đủ trần). */
  flash(id: string): void {
    this.flashId = id;
    window.clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => {
      this.flashId = null;
      if (this.view) this.render(this.view);
    }, 3000);
    if (this.view) this.render(this.view);
  }

  private turn(d: number): void {
    const p = Math.min(this.pages - 1, Math.max(0, this.page + d));
    if (p === this.page || !this.view) return;
    this.page = p;
    this.render(this.view);
  }

  private card(c: StockCard, full: boolean): HTMLLIElement {
    const { item } = c;
    const btn = h('button', `dt-card${full ? ' capped' : ''}${this.flashId === item.id ? ' flash' : ''}`);
    btn.type = 'button';
    btn.title = item.name;
    btn.setAttribute('aria-label', `${item.name}, trong túi ${c.inBag}, đang đặt ${c.placed}`);
    const pic = h('span', 'dt-pic');
    pic.append(decorPicture(item.id, 44), h('span', 'dt-badge', String(c.inBag))); // decorInBagBadge
    btn.append(pic, h('span', 'dt-name', item.name));
    btn.addEventListener('click', () => {
      if (!this.swiped) this.on.card(item.id);
    });
    const li = h('li');
    li.append(btn);
    return li;
  }

  /** Vuốt ngang trên hàng ô (điện thoại) / cuộn chuột trên dải (máy tính) → lật trang. */
  private gestures(): void {
    let x0: number | null = null;
    this.port.addEventListener('pointerdown', (e) => {
      x0 = e.clientX;
      this.swiped = false;
    });
    this.port.addEventListener('pointermove', (e) => {
      if (x0 !== null && Math.abs(e.clientX - x0) > 12) this.swiped = true;
    });
    const end = (e: PointerEvent): void => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (dx < -SWIPE_PX) this.turn(1);
      else if (dx > SWIPE_PX) this.turn(-1);
      window.setTimeout(() => (this.swiped = false), 0);
    };
    this.port.addEventListener('pointerup', end);
    this.port.addEventListener('pointercancel', () => (x0 = null));
    this.root.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const now = performance.now();
        if (Math.abs(d) < 4 || now - this.wheelAt < WHEEL_MS) return;
        this.wheelAt = now;
        this.turn(d > 0 ? 1 : -1);
      },
      { passive: false },
    );
  }
}
