/**
 * Túi đồ (R-TUI-1 — thiết kế 2026-11-18.13 kiểu 摩尔 "Giấy + son", ảnh mẫu `design/concept/tui-do-kieu-moly/giay-son.png`):
 * **cuốn sổ mở** giữa màn, giấy kem viền gỗ. Trang trái = thẻ nhân vật: dải tên, khung nhân vật 3D xoay được (`bagPortrait.ts`,
 * chỉ vẽ khi túi mở), huy hiệu ngọc góc, dòng tiền đồng + số Văn tiền. Trang phải = lưới ô giấy 3×4 (hình món + số góc dưới
 * phải; chạm → ô viền son + dòng chi tiết dưới lưới), lật trang "‹ 1/1 ›" (`bagPages.ts`). Cột tab chỉ hình dọc mép phải (tab
 * chọn nền son) — đủ 6 ngăn `BAG_TABS`. Nút đóng tròn son góc trên phải. Màn dọc: thẻ nhân vật thu gọn một hàng trên lưới (CSS).
 * **Chỉ xem.** Đóng: nút đóng, chạm cảnh, nút quay lại. Dữ liệu dựng sẵn ở `zones/tuiDo.ts`. DOM dựng bằng createElement.
 */
import './bag.css';
import { MANG_PRICES } from '../zones/mang';
import { BAG_TABS, BAG_TEXT, BAG_TOOLS, type BagTab, type BagView } from '../zones/tuiDo';
import { cropOf, type CropId } from '../zones/vuon';
import { growText } from '../zones/vuonHud';
import type { SlotId } from '../zones/vuonVong';
import { formatCoins } from '../zones/wallet';
import { bagPage } from './bagPages';
import { BagPortrait, type PortraitModel } from './bagPortrait';
import { h } from './chatText';
import { cropPicture } from './cropArt';
import { COIN, DECOR_PICTURES, STROKE, svgIcon, type SvgNode } from './decorIcons';
import { hinhImg, type HinhId } from './hinh';
import { shootIcon } from './trucLamIcons';
import { ICON_CLOSE } from './toolbarIcons';
import { BUG_NET, FERT_BAG, HAND, WEED } from './vuonIcons';
import { coinIcon } from './wallet';

/** Chữ riêng của khung sổ (chỉ tiếng Việt — R-HUD-4). Chưa có tên người chơi → dải tên ghi "Đệ tử". */
const UI_TEXT = { name: 'Đệ tử', prev: 'Trang trước', next: 'Trang sau', toolNote: 'Không hao, không có số' } as const;

/** Cỡ hình gốc trong ô (px) — CSS co theo cỡ ô. */
const ART = 52;

/** Hình tab: hình minh hoạ đợt 1–2; Lâm sản = búp măng nét (`trucLamIcons`). */
const TAB_HINH: Readonly<Record<Exclude<BagTab, 'lam' | 'sach'>, HinhId>> = { hat: 'gieo', vuon: 'tuoi', nong: 'thu', trang: 'trang-tri' };

/** Cuốn sách bìa nâu, dải ngọc (hình tạm — chưa có hình minh hoạ cuốn sách; tab Sách + ô sách). */
const BOOK: readonly SvgNode[] = [
  ['path', { d: 'M9 8.5c0-2 1.6-3.5 3.5-3.5H38v34H13c-2.2 0-4 1.8-4 4z', fill: '#B9773F', stroke: '#7E4F31', 'stroke-width': '2', 'stroke-linejoin': 'round' }],
  ['path', { d: 'M9 43c0-2.2 1.8-4 4-4h25v4.5H13', fill: '#FBF5EA', stroke: '#7E4F31', 'stroke-width': '2', 'stroke-linejoin': 'round' }],
  ['rect', { x: '17', y: '12', width: '15', height: '9', rx: '1.5', fill: '#F3D9A4', stroke: '#7E4F31', 'stroke-width': '1.6' }],
  ['path', { d: 'M30 39v8l3-2.2 3 2.2v-8z', fill: '#4FA383', stroke: '#2F6E55', 'stroke-width': '1.4', 'stroke-linejoin': 'round' }],
];
const bookIcon = (size: number): SVGElement => svgIcon(BOOK, size, '0 0 48 48');

/** Ngôi sao ngọc ở góc khung ảnh. */
const STAR: readonly SvgNode[] = [
  ['path', { d: 'M24 3l6.2 13 14.3 1.9-10.4 10 2.6 14.1L24 35.2 11.3 42l2.6-14.1L3.5 17.9 17.8 16z', fill: '#7CC7A6', stroke: '#3E8C6E', 'stroke-width': '2.4', 'stroke-linejoin': 'round' }],
  ['path', { d: 'M24 13c-4 4-4 9 0 12 3 2 2 6-2 7', fill: 'none', stroke: '#2F6E55', 'stroke-width': '2.4', 'stroke-linecap': 'round' }],
];

/** Một ô của lưới: hình, số (null = không số), dòng chi tiết khi chạm. */
interface Slot {
  key: string;
  label: string;
  art: () => Element;
  n: number | null;
  info: () => (string | Node)[];
}

/** Hình nông cụ (hình đợt 2 hoặc hình giữ chỗ — `vuonIcons.ts`). */
function toolArt(id: SlotId, size: number): Element {
  if (id === 'binh') return hinhImg('tuoi', size);
  if (id === 'mo') return hinhImg('mo-o', size);
  if (id === 'hat') return hinhImg('gieo', size);
  return svgIcon({ tay: HAND, sau: BUG_NET, co: WEED, phan: FERT_BAG }[id], size, '0 0 48 48');
}

/** "bán (đồng) n / cái" (gardenSellPrice). */
function sellLine(crop: CropId): HTMLElement {
  const sell = h('span', 'bg-sell');
  sell.append('bán ', svgIcon(COIN, 13, '0 0 100 100'), ` ${cropOf(crop)?.sell ?? 0} / cái`);
  return sell;
}

export class BagPanel {
  private readonly dim = h('div');
  private readonly root = h('section');
  private readonly coins = h('div', 'bg-coins');
  private readonly frame = h('div', 'bg-frame');
  private readonly grid = h('div', 'bg-grid');
  private readonly info = h('div', 'bg-info');
  private readonly pageNo = h('span', 'bg-pageNo');
  private readonly prev = h('button', 'bg-turn');
  private readonly next = h('button', 'bg-turn');
  private readonly tabs = h('div', 'bg-tabs');
  private readonly portrait: BagPortrait | null;
  private open = false;
  private tab: BagTab = 'hat';
  private view: BagView | null = null;
  /** ô đang chọn (dòng chi tiết) */
  private picked: string | null = null;
  private page = 0;

  constructor(
    private readonly close: () => void,
    private readonly read: () => void,
    /** dựng bản nhân vật cho thẻ (thiếu → khung chỉ có nền) */
    model?: () => Promise<PortraitModel>,
  ) {
    this.dim.id = 'bagDim';
    this.dim.hidden = true;
    this.dim.addEventListener('pointerdown', () => this.close()); // chạm cảnh → đóng
    this.root.id = 'bagPanel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-label', BAG_TEXT.bagTitle);
    this.root.hidden = true;

    // trang trái: thẻ nhân vật
    const left = h('div', 'bg-page bg-left');
    const badge = svgIcon(STAR, 40, '0 0 48 48');
    badge.classList.add('bg-badge');
    this.portrait = model ? new BagPortrait(model) : null;
    if (this.portrait) this.frame.append(this.portrait.host);
    this.frame.append(badge);
    const side = h('div', 'bg-side');
    side.append(h('div', 'bg-name', UI_TEXT.name), this.coins);
    left.append(this.frame, side);

    // trang phải: lưới + chi tiết + lật trang
    const right = h('div', 'bg-page bg-right');
    const pager = h('div', 'bg-pager');
    this.turnButton(this.prev, '‹', UI_TEXT.prev, -1);
    this.turnButton(this.next, '›', UI_TEXT.next, 1);
    pager.append(this.prev, this.pageNo, this.next);
    right.append(this.grid, this.info, pager);

    const book = h('div', 'bg-book');
    const paper = h('div', 'bg-paper');
    paper.append(left, right);
    const shut = h('button', 'bg-close');
    shut.type = 'button';
    shut.setAttribute('aria-label', BAG_TEXT.bagClose);
    shut.append(svgIcon(ICON_CLOSE, 22, undefined, { ...STROKE, 'stroke-width': '3.4' }));
    shut.addEventListener('click', () => this.close());
    book.append(paper, shut);
    this.tabs.setAttribute('role', 'tablist');
    this.root.append(book, this.tabs);
    document.body.append(this.dim, this.root);
  }

  get isOpen(): boolean {
    return this.open;
  }

  show(on: boolean): void {
    this.open = on;
    this.root.hidden = !on;
    this.dim.hidden = !on;
    this.picked = null;
    this.page = 0;
    document.body.classList.toggle('bag-open', on);
    if (on) this.portrait?.start();
    else this.portrait?.stop();
    this.draw();
  }

  /** Mở sẵn tab [tab] (và ô [picked]) — Canvas 3D chụp so thiết kế. */
  showTab(tab: BagTab, picked: string | null = null): void {
    this.tab = tab;
    this.picked = picked;
    this.page = 0;
    this.draw();
  }

  /** Vẽ lại theo số đã lưu. */
  render(v: BagView): void {
    this.view = v;
    this.coins.hidden = v.coins === null;
    this.coins.replaceChildren(coinIcon(34), h('span', '', formatCoins(v.coins ?? 0)));
    this.coins.setAttribute('aria-label', `Văn tiền: ${v.coins ?? 0}`);
    this.draw();
  }

  private turnButton(b: HTMLButtonElement, text: string, label: string, step: number): void {
    b.type = 'button';
    b.textContent = text;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', () => {
      this.page += step;
      this.picked = null;
      this.draw();
    });
  }

  private draw(): void {
    const v = this.view;
    if (!v || !this.open) return;
    this.tabs.replaceChildren(...BAG_TABS.map(({ tab, label }) => this.tabButton(tab, label)));
    const all = this.slots(v);
    const pg = bagPage(all, this.page);
    this.page = pg.page;
    const cells: HTMLElement[] = pg.items.map((s) => this.cell(s));
    while (cells.length < 12) cells.push(h('span', 'bg-cell empty'));
    this.grid.replaceChildren(...cells);
    this.pageNo.textContent = pg.label;
    this.prev.disabled = pg.page === 0;
    this.next.disabled = pg.page >= pg.pages - 1;
    const pick = all.find((s) => s.key === this.picked);
    this.info.className = pick ? 'bg-info on' : 'bg-info';
    this.info.replaceChildren(...(pick ? pick.info() : this.hint(v, all.length === 0)));
  }

  private tabButton(tab: BagTab, label: string): HTMLButtonElement {
    const b = h('button', tab === this.tab ? 'bg-tab on' : 'bg-tab');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', label);
    b.setAttribute('aria-selected', String(tab === this.tab));
    b.title = label;
    b.append(tab === 'lam' ? shootIcon(40) : tab === 'sach' ? bookIcon(40) : hinhImg(TAB_HINH[tab], 40));
    b.addEventListener('click', () => {
      this.tab = tab;
      this.picked = null;
      this.page = 0;
      this.draw();
    });
    return b;
  }

  private cell(s: Slot): HTMLButtonElement {
    const on = s.key === this.picked;
    const b = h('button', on ? 'bg-cell on' : 'bg-cell');
    b.type = 'button';
    b.setAttribute('aria-label', s.label);
    b.setAttribute('aria-pressed', String(on));
    b.append(s.art());
    if (s.n !== null) b.append(h('span', s.n > 0 ? 'bg-num' : 'bg-num zero', String(s.n)));
    b.addEventListener('click', () => {
      this.picked = on ? null : s.key;
      this.draw();
    });
    return b;
  }

  /** Dòng dưới lưới khi chưa chạm ô: ngăn trống → chỗ lấy; còn lại → "Chỉ xem…" của ngăn. */
  private hint(v: BagView, empty: boolean): HTMLElement[] {
    if (this.tab === 'lam') return empty ? [h('b', '', BAG_TEXT.bagForestEmptyTitle), h('span', '', BAG_TEXT.bagForestEmpty)] : [h('span', '', BAG_TEXT.bagForestFoot)];
    if (this.tab === 'vuon') return [h('span', '', BAG_TEXT.bagToolsHint)];
    if (empty) {
      const text = { hat: v.seeds.empty, nong: v.crops.empty, sach: v.book.empty, trang: v.decor.empty }[this.tab];
      return [h('span', '', text)];
    }
    return [h('span', '', BAG_TEXT.bagReadOnly)];
  }

  /** Các ô của ngăn đang mở, theo thứ tự dữ liệu `BagView`. */
  private slots(v: BagView): Slot[] {
    switch (this.tab) {
      case 'hat':
        return v.seeds.items.map((c) => ({
          key: c.crop,
          label: `${c.name} × ${c.n}`,
          art: () => cropPicture(c.crop, ART),
          n: c.n,
          info: () => [h('b', '', c.name), h('span', '', `Lớn trong ${growText(cropOf(c.crop)!)}`), sellLine(c.crop)], // gardenSeedGrown
        }));
      case 'nong':
        return v.crops.items.map((c) => ({ key: c.crop, label: `${c.name} × ${c.n}`, art: () => cropPicture(c.crop, ART), n: c.n, info: () => [h('b', '', c.name), sellLine(c.crop)] }));
      case 'lam':
        return v.forest.items.map((c) => ({
          key: c.kind,
          label: `${c.name} × ${c.n}`,
          art: () => shootIcon(ART, c.kind === 'mang-to'),
          n: c.n,
          info: () => [h('b', '', `${c.name} × ${c.n}`), h('span', '', `${BAG_TEXT.bagForestWhere} ${MANG_PRICES[c.kind]} Văn / cái`)],
        }));
      case 'vuon':
        return [
          ...BAG_TOOLS.map((t) => ({ key: t.id, label: t.name, art: () => toolArt(t.id, ART), n: null, info: () => [h('b', '', t.name), h('span', '', `${BAG_TEXT.bagToolsSection} · ${UI_TEXT.toolNote}`)] })),
          {
            key: 'phan-bon',
            label: `${BAG_TEXT.bagFert} × ${v.fert}`,
            art: () => svgIcon(FERT_BAG, ART, '0 0 48 48'),
            n: v.fert,
            info: () => [h('b', '', `${BAG_TEXT.bagFert} × ${v.fert}`), h('span', '', BAG_TEXT.bagSuppliesSection)], // R-VUON-12
          },
        ];
      case 'sach': {
        const book = v.book.item;
        if (!book) return [];
        return [{ key: 'sach', label: book.title, art: () => bookIcon(ART), n: null, info: () => [h('b', '', book.title), this.readButton(book.title)] }];
      }
      case 'trang':
        return v.decor.items.map((d) => ({
          key: d.id,
          label: `${d.name} · ${d.text}`,
          art: () => {
            const art = DECOR_PICTURES[d.id];
            return art ? svgIcon(art, ART, '0 0 64 64') : h('span', 'bg-noArt', d.name);
          },
          n: d.inBag,
          info: () => [h('b', '', d.name), h('span', '', d.text)], // bagDecorCounts (2026-11-15.42)
        }));
    }
  }

  private readButton(title: string): HTMLButtonElement {
    const btn = h('button', 'bg-read', BAG_TEXT.bagRead);
    btn.type = 'button';
    btn.setAttribute('aria-label', `Đọc ${title}`);
    btn.addEventListener('click', () => this.read());
    return btn;
  }
}
