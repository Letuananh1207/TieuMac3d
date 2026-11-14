/**
 * Ví Văn tiền 文錢 trên HUD (R-TIEN-1, R-TIEN-5) — thiết kế 2026-11-14.12 (`VanTien-HUD-doc`, `-ngang`, `-vi-trang-thai`,
 * `-hieu-ung`): viên kính góc trên phải (xu 26 + số), trạng thái thường / vừa cộng / vừa trừ / 0; chạm → thẻ "Văn tiền kiếm từ
 * đâu" (đóng khi chạm chỗ khác / 4 s); xu bay + nhãn lý do, xếp hàng, chỉ chạy khi ví hiện. DOM gốc #wallet trong index.html;
 * phần trong dựng bằng createElement. Số liệu do Flutter trả (`getProgress`, `earnGame`) — ở đây không tính tiền.
 */
import { balanceChange, coinsToFly, deltaText, formatCoins } from '../zones/wallet';
import { el } from './dom';
import './wallet.css';

const SVG = 'http://www.w3.org/2000/svg';

/** Đồng xu lỗ vuông (thiết kế "Đồng xu"): ≥ 30 px khắc 文 (trên) 錢 (dưới); nhỏ hơn chỉ vành + lỗ vuông. */
export function coinIcon(size: number): SVGSVGElement {
  const s = document.createElementNS(SVG, 'svg');
  s.setAttribute('viewBox', '0 0 100 100');
  s.setAttribute('width', String(size));
  s.setAttribute('height', String(size));
  s.setAttribute('aria-hidden', 'true');
  s.classList.add('coin');
  const add = (tag: string, attrs: Record<string, string>, text?: string): void => {
    const e = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text) e.textContent = text;
    s.append(e);
  };
  add('circle', { cx: '50', cy: '50', r: '48', class: 'rim' });
  add('circle', { cx: '50', cy: '50', r: '44', class: 'face' });
  add('circle', { cx: '50', cy: '50', r: '38', fill: 'none', stroke: '#b88f3a', 'stroke-width': '2' });
  add('rect', { x: '38', y: '38', width: '24', height: '24', fill: '#8a6a2a' });
  add('rect', { x: '41', y: '41', width: '18', height: '18', fill: '#f4f0e6' });
  if (size >= 30) {
    add('text', { x: '50', y: '30', 'text-anchor': 'middle', 'font-size': '20', class: 'ink' }, '文');
    add('text', { x: '50', y: '88', 'text-anchor': 'middle', 'font-size': '20', class: 'ink' }, '錢');
  }
  return s;
}

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Một khoản thưởng cần chạy hiệu ứng trên HUD. */
export interface WalletFx {
  amount: number;
  /** nhãn lý do ("+8 · Thắng Đấu chữ" / "Hôm nay trò chơi đã đủ thưởng") */
  label: string;
  /** điểm màn xu bật ra (hỏi lúc chạy — vd. chỗ bàn khi vừa rời bàn); `null` → không bay */
  from?: () => { x: number; y: number } | null;
}

/** Thẻ "kiếm từ đâu": 5 nguồn (bỏ "Đọc xong 1 chương" — quyết định 2, chưa có chương). Chuỗi `walletSource*`. */
const SOURCES: [string, string][] = [
  ['Học 1 bộ thủ mới', '+10'],
  ['Ôn đúng hạn (2/2 · 1/2)', '+5 · +2'],
  ['Xong nhiệm vụ ngày', '+20'],
  ['Chuỗi 7 ngày', '+50'],
  ['Trò chữ thắng · hoà · thua', '+8 · 5 · 3'],
];
const CARD_SECONDS = 4;
const COUNT_UP_MS = 600;
const COUNT_DOWN_MS = 400;
const DELTA_MS = 1500;
const FLIGHT_MS = 600;
const COIN_GAP_MS = 60;
const LABEL_MS = 1500; // giữ 1,2 s + mờ 0,3 s

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export class WalletHud {
  private readonly root = el('wallet');
  private readonly btn = el<HTMLButtonElement>('walletBtn');
  private readonly num = node('span', 'num', '0');
  private readonly delta = node('span', 'wl-delta');
  private readonly label = node('div', 'wl-label');
  private readonly card = node('section', 'wl-card');
  private readonly today = node('div', 'note');
  /** số đang hiện; `null` = chưa biết (không có Flutter → ví ẩn) */
  private shown: number | null = null;
  /** số dư thật mới nhất */
  private balance: number | null = null;
  private busy = false;
  private readonly queue: WalletFx[] = [];
  private playing = false;
  private cardTimer = 0;
  private countRaf = 0;
  private readonly reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    this.btn.replaceChildren(coinIcon(26), this.num);
    this.delta.hidden = true;
    this.label.hidden = true;
    this.label.setAttribute('role', 'status');
    const head = node('div', 'head');
    head.append(coinIcon(22), 'Văn tiền kiếm từ đâu'); // walletSourcesTitle
    this.card.append(head);
    for (const [what, much] of SOURCES) {
      const row = node('div', 'row');
      row.append(node('span', '', what), node('b', '', much));
      this.card.append(row);
    }
    this.card.append(this.today, node('div', 'note', 'Tiêu ở Tạp hoá phố chợ.')); // walletSpendHint
    this.card.hidden = true;
    this.card.setAttribute('aria-label', 'Văn tiền kiếm từ đâu');
    this.root.append(this.delta, this.label, this.card);
    this.setToday(0);
    this.btn.addEventListener('click', () => this.toggleCard());
    // chạm chỗ khác → đóng thẻ (R-TIEN-1)
    document.addEventListener('pointerdown', (e) => {
      if (!this.card.hidden && !this.root.contains(e.target as Node)) this.closeCard();
    }, true);
    this.root.hidden = true;
  }

  /** Số dư + thưởng trò hôm nay từ `getProgress` (`null` = không có Flutter → ví ẩn). Giảm → "−n" (về từ Tạp hoá). */
  sync(balance: number | null, gameToday: number): void {
    this.setToday(gameToday);
    this.balance = balance;
    if (balance === null || this.playing || this.queue.length) return; // đang chạy hiệu ứng: số cuối chốt sau
    const change = balanceChange(this.shown, balance);
    if (this.shown === null || change.kind === 'same') this.setNumber(balance);
    // tăng: màn Flutter đã chạy "+n" (R-TIEN-5) → chỉ đổi số; giảm: vừa mua ở Tạp hoá → viền son + "−n", đếm xuống
    else if (change.kind === 'up') this.setNumber(balance);
    else this.bump('down', deltaText(change), balance, COUNT_DOWN_MS);
    this.render();
  }

  /** Xếp hàng một khoản thưởng (trò ở bàn chơi — R-TIEN-3); [balance] = số dư sau khoản đó. Chạy khi ví hiện lại. */
  push(fx: WalletFx, balance: number, gameToday: number): void {
    this.setToday(gameToday);
    this.balance = balance;
    this.queue.push(fx);
    void this.run();
  }

  /** Mỗi khung: ví ẩn khi bận (bài, thẻ học, màn ôn, bản đồ, thoại, bàn chơi, màn Flutter, màn tải — R-TIEN-1). */
  update(busy: boolean): void {
    if (busy === this.busy) return;
    this.busy = busy;
    if (busy) this.closeCard();
    this.render();
    void this.run();
  }

  private render(): void {
    this.root.hidden = this.busy || this.shown === null;
  }

  private setToday(x: number): void {
    this.today.textContent = `Trò chơi tối đa 60 Văn tiền mỗi ngày. Hôm nay: ${formatCoins(x)} / 60.`; // walletGameCap
  }

  private setNumber(n: number): void {
    cancelAnimationFrame(this.countRaf);
    this.shown = n;
    this.num.textContent = formatCoins(n);
    this.btn.setAttribute('aria-label', `Văn tiền: ${formatCoins(n)}`); // walletLabel
  }

  /** Đếm số từ đang hiện tới [to] trong [ms]. */
  private countTo(to: number, ms: number): void {
    const from = this.shown ?? to;
    this.setNumber(to);
    if (this.reduce || from === to) return;
    this.num.textContent = formatCoins(from);
    const t0 = performance.now();
    const step = (t: number): void => {
      const k = Math.min(1, (t - t0) / ms);
      this.num.textContent = formatCoins(Math.round(from + (to - from) * k));
      if (k < 1) this.countRaf = requestAnimationFrame(step);
    };
    this.countRaf = requestAnimationFrame(step);
  }

  /** Viền jade / son + viên "+n" / "−n" dưới ví 1,5 s, số đếm tới [to]. */
  private bump(kind: 'up' | 'down', text: string, to: number, ms: number): void {
    this.btn.classList.remove('up', 'down');
    this.btn.classList.add(kind);
    this.delta.className = `wl-delta ${kind}`;
    this.delta.textContent = text;
    this.delta.hidden = false;
    this.countTo(to, ms);
    window.setTimeout(() => {
      if (this.delta.textContent !== text) return;
      this.delta.hidden = true;
      this.btn.classList.remove(kind);
    }, DELTA_MS);
  }

  private toggleCard(): void {
    if (this.card.hidden) {
      this.card.hidden = false;
      window.clearTimeout(this.cardTimer);
      this.cardTimer = window.setTimeout(() => this.closeCard(), CARD_SECONDS * 1000);
    } else this.closeCard();
  }

  private closeCard(): void {
    window.clearTimeout(this.cardTimer);
    this.card.hidden = true;
  }

  /** Chạy hàng hiệu ứng khi ví hiện; ví ẩn giữa chừng → khoản còn lại chờ lần hiện sau. */
  private async run(): Promise<void> {
    if (this.playing || this.busy || this.shown === null) return;
    this.playing = true;
    try {
      while (this.queue.length && !this.busy) {
        const fx = this.queue.shift();
        if (fx) await this.play(fx);
      }
    } finally {
      this.playing = false;
    }
    if (!this.queue.length && this.balance !== null && this.balance !== this.shown) this.setNumber(this.balance);
  }

  /** Một khoản: xu bay vào ví (ví nảy mỗi xu) → "+n" + nhãn lý do; đủ trần → chỉ nhãn mờ (R-TIEN-5). */
  private async play(fx: WalletFx): Promise<void> {
    const capped = fx.amount <= 0;
    if (!capped) {
      const from = this.reduce ? null : (fx.from?.() ?? null);
      if (from) await this.fly(from, coinsToFly(fx.amount));
      this.bump('up', deltaText({ kind: 'up', amount: fx.amount }), (this.shown ?? 0) + fx.amount, COUNT_UP_MS);
    }
    this.label.className = capped ? 'wl-label capped' : 'wl-label';
    this.label.replaceChildren(...(capped ? [] : [coinIcon(20)]), fx.label);
    this.label.hidden = false;
    this.label.classList.remove('fade');
    void this.label.offsetWidth; // chạy lại hoạt ảnh mờ
    this.label.classList.add('fade');
    await wait(LABEL_MS);
    this.label.hidden = true;
  }

  /** [n] xu bay cong từ [from] tới xu trong ví 0,6 s, cách nhau 0,06 s, xoay; mỗi xu chạm → ví nảy 1,08×. */
  private async fly(from: { x: number; y: number }, n: number): Promise<void> {
    const target = this.btn.querySelector('svg')?.getBoundingClientRect();
    if (!target || typeof document.body.animate !== 'function') return;
    const to = { x: target.left + target.width / 2, y: target.top + target.height / 2 };
    const ctrl = { x: from.x + (to.x - from.x) * 0.2, y: Math.min(from.y, to.y) - 80 };
    const frames: Keyframe[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * ctrl.x + t * t * to.x;
      const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * ctrl.y + t * t * to.y;
      frames.push({ transform: `translate(${x - 15}px, ${y - 15}px) rotate(${t * 360}deg) scale(${1 - t * 0.15})`, opacity: t > 0.9 ? 0.6 : 1 });
    }
    const flights = Array.from({ length: n }, (_, j) => {
      const c = coinIcon(30);
      c.classList.add('wl-fly');
      document.body.append(c);
      const a = c.animate(frames, { duration: FLIGHT_MS, delay: j * COIN_GAP_MS, easing: 'ease-in', fill: 'both' });
      return a.finished
        .catch(() => undefined)
        .then(() => {
          c.remove();
          this.btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 160 });
        });
    });
    await Promise.all(flights);
  }
}
