/**
 * HUD Lưu Thương Lệnh (R-LUU-1…5) — thiết kế 2026-11-16.13 (`LuuThuong-*`, `design/docs/screen_specs.md` "Trúc Lâm"):
 * "Rời tiệc" + viên "Lượt n / 8" (chấm tiến độ), 4 thẻ điểm, viên trạng thái (chén trôi / văn nhân nghĩ / đúng / uống
 * phạt / văn nhân đáp), thẻ câu ghép chữ (khung ghép theo kiểu, thời gian, 4 ô bộ thủ thẻ trúc), thẻ kết quả ván (hạng,
 * ấn "Thi khôi", bảng 4 dòng, lời Thi Ông, thưởng, "Ván mới" · "Rời tiệc"). Vẽ lại khi `LuuView` đổi. Dọc / ngang / máy
 * tính chỉ khác CSS (`luuHud.css`). Không biết tới luật — nơi ghép (`web/src/luuThuong.ts`) dựng `LuuView`.
 */
import './luuHud.css';
import { keyCap, trucLamFace } from './trucLamFaces';
import { cupIcon, ICON_AGAIN, ICON_BRUSH, ICON_CROSS, ICON_LEAVE, ICON_TICK, strokeIcon } from './trucLamIcons';
import { coinIcon } from './wallet';

export type LuuLayoutView = 'trai-phai' | 'tren-duoi' | 'bao';

export interface LuuSeatView {
  /** mã NPC; `null` = người chơi */
  npc: string | null;
  name: string;
  score: number;
  /** đang tới lượt */
  turn: boolean;
  /** vừa ghi điểm (quầng vàng + "+1") */
  gained: boolean;
}

export interface LuuDot {
  mine: boolean;
  state: 'cho' | 'dang' | 'dung' | 'sai';
}

export interface LuuTile {
  form: string;
  hv: string;
  state: 'thuong' | 'dung' | 'sai' | 'mo';
  /** văn nhân chọn ô này (huy hiệu chân dung) */
  npcPick?: string;
}

export interface LuuCardView {
  /** câu của người chơi (chạm được) */
  mine: boolean;
  /** câu của văn nhân: tên + mã */
  who?: { npc: string; name: string };
  /** đã chấm → hiện chữ đầy đủ */
  full: boolean;
  han: string;
  rest: string;
  layout: LuuLayoutView;
  at: 'dau' | 'cuoi';
  hv: string;
  pinyin: string;
  meaning: string;
  /** giây còn lại (chỉ lượt mình đang hỏi) */
  left: number | null;
  total: number;
  tiles: LuuTile[];
}

export type LuuStatus =
  | { kind: 'troi' }
  | { kind: 'nghi'; npc: string; name: string }
  | { kind: 'dung' }
  | { kind: 'phat' }
  | { kind: 'npc'; name: string; right: boolean };

export interface LuuResultView {
  title: string;
  /** ấn son "Thi khôi" (hạng 1 một mình — R-LUU-5) */
  seal: boolean;
  points: number;
  rows: { rank: number; npc: string | null; name: string; score: number; me: boolean }[];
  line: string;
  /** +n Văn tiền; `null` = đủ trần hôm nay; `undefined` = đang ghi */
  reward?: number | null;
}

export interface LuuView {
  turn: number;
  total: number;
  dots: LuuDot[];
  seats: LuuSeatView[];
  status: LuuStatus | null;
  card: LuuCardView | null;
  result: LuuResultView | null;
}

const T = {
  leave: 'Rời tiệc',
  turn: (n: number, m: number) => `Lượt ${n} / ${m}`,
  cup: 'Chén lệnh đang trôi',
  thinking: (name: string) => `${name} đang nghĩ`,
  compose: 'Ghép bộ thủ thành chữ',
  meaning: 'Nghĩa · âm',
  pick: 'Chọn bộ thủ còn thiếu',
  full: 'Chữ đầy đủ',
  seconds: (n: number) => `${n} giây`,
  npcCard: (name: string) => `Câu của ${name}`,
  npcHint: 'chạm không có gì',
  right: 'Đúng rồi! +1 điểm',
  penalty: 'Uống phạt một chén!',
  npcRight: (name: string) => `${name} đúng · +1`,
  npcWrong: (name: string) => `${name} chưa đúng`,
  seal: 'Thi khôi',
  points: (n: number) => `${n} điểm`,
  reward: (n: number) => `+${n} Văn tiền`,
  capped: 'Hôm nay trò chơi đã đủ thưởng',
  again: 'Ván mới',
  host: 'Thi Ông',
  keysHint: 'chọn bộ thủ',
  escHint: 'rời tiệc',
} as const;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function dots(): HTMLElement {
  const d = node('span', 'lt-dots');
  d.setAttribute('aria-hidden', 'true');
  d.append(node('span'), node('span'), node('span'));
  return d;
}

export class LuuHud {
  private readonly root = node('div');
  private key = '';

  constructor(private readonly on: { leave(): void; newRound(): void; pick(option: number): void }) {
    this.root.id = 'luuHud';
    this.root.hidden = true;
    document.body.append(this.root);
  }

  /** Vẽ theo [v]; `null` = ẩn (không ngồi tiệc). */
  render(v: LuuView | null): void {
    const key = v ? JSON.stringify(v) : '';
    if (key === this.key) return;
    this.key = key;
    this.root.hidden = !v;
    if (!v) {
      this.root.replaceChildren();
      return;
    }
    const parts: HTMLElement[] = [];
    if (v.result) parts.push(node('div', 'lt-dim'));
    parts.push(this.top(v), this.scores(v.seats));
    if (v.status && !v.result) parts.push(this.status(v.status));
    if (v.card && !v.result) parts.push(this.card(v.card));
    if (v.result) parts.push(this.result(v.result));
    if (v.card?.mine && !v.card.full && !v.result) parts.push(this.keysHint());
    this.root.replaceChildren(...parts);
  }

  private leaveButton(cls: string): HTMLButtonElement {
    const b = node('button', cls);
    b.type = 'button';
    b.append(strokeIcon(18, ICON_LEAVE), T.leave);
    b.addEventListener('click', () => this.on.leave());
    return b;
  }

  private top(v: LuuView): HTMLElement {
    const bar = node('div', 'lt-top');
    const leave = this.leaveButton('lt-pill lt-leave');
    leave.append(keyCap('Esc'));
    const prog = node('div', 'lt-pill lt-prog');
    const row = node('span', 'lt-prog-dots');
    row.setAttribute('role', 'progressbar');
    row.setAttribute('aria-label', `Lượt ${v.turn} trên ${v.total}`);
    for (const d of v.dots) row.append(node('span', `lt-dot ${d.mine ? 'mine' : 'npc'} ${d.state}`));
    prog.append(node('span', 'lt-prog-n', T.turn(v.turn, v.total)), row);
    bar.append(leave, prog);
    return bar;
  }

  private scores(seats: readonly LuuSeatView[]): HTMLElement {
    const list = node('div', 'lt-scores');
    list.setAttribute('role', 'list');
    list.setAttribute('aria-label', 'Bảng điểm');
    for (const s of seats) {
      const c = node('div', `lt-score${s.turn ? ' turn' : ''}${s.gained ? ' gained' : ''}`);
      c.setAttribute('role', 'listitem');
      c.setAttribute('aria-label', `${s.name}: ${s.score} điểm`);
      c.append(trucLamFace(s.npc, 28, 'lt-face'), node('span', 'lt-name', s.name), node('span', 'lt-num', String(s.score)));
      if (s.gained) c.append(node('span', 'lt-plus', '+1'));
      list.append(c);
    }
    return list;
  }

  private status(s: LuuStatus): HTMLElement {
    const wrap = node('div', `lt-status-wrap ${s.kind}`);
    const p = node('div', `lt-status ${s.kind}`);
    p.setAttribute('role', 'status');
    if (s.kind === 'troi') {
      const disc = node('span', 'lt-disc');
      disc.append(cupIcon(20));
      p.append(disc, T.cup, dots());
    } else if (s.kind === 'nghi') p.append(trucLamFace(s.npc, 26, 'lt-face'), T.thinking(s.name), dots());
    else if (s.kind === 'dung') p.append(strokeIcon(20, ICON_TICK, 2.6), T.right);
    else if (s.kind === 'phat') p.append(cupIcon(22), T.penalty);
    else {
      p.classList.toggle('right', s.right);
      p.append(strokeIcon(18, s.right ? ICON_TICK : ICON_CROSS, 2.6), s.right ? T.npcRight(s.name) : T.npcWrong(s.name));
    }
    wrap.append(p);
    return wrap;
  }

  /** Khung ghép: phần còn lại đúng chỗ theo kiểu, ô bộ thủ trống nét đứt; đã chấm → chữ đầy đủ. */
  private frame(c: LuuCardView): HTMLElement {
    const where = c.layout === 'bao' ? 'bao' : `${c.layout === 'trai-phai' ? 'tp' : 'td'}-${c.at}`;
    const f = node('div', `lt-frame ${where}`);
    f.append(node('span', 'lt-grid'));
    if (c.full) {
      const h = node('span', 'lt-han lt-full', c.han);
      h.lang = 'zh';
      f.append(h);
      return f;
    }
    const slot = node('span', 'lt-slot');
    slot.setAttribute('aria-label', c.layout === 'bao' ? 'Ô bộ thủ còn trống (bao ngoài)' : 'Ô bộ thủ còn trống');
    const rest = node('span', 'lt-rest');
    const h = node('span', 'lt-han', c.rest);
    h.lang = 'zh';
    rest.append(h);
    f.append(slot, rest);
    return f;
  }

  private card(c: LuuCardView): HTMLElement {
    const sec = node('section', `lt-card${c.mine ? ' mine' : ' npc'}${c.full ? ' full' : ''}`);
    sec.setAttribute('aria-label', 'Câu ghép chữ');
    sec.append(node('span', 'lt-leaf'));
    const head = node('div', 'lt-head');
    head.append(strokeIcon(16, ICON_BRUSH), node('span', 'lt-head-t', c.who ? T.npcCard(c.who.name) : T.compose));
    if (c.who) head.append(node('span', 'lt-head-hint', T.npcHint));
    const body = node('div', 'lt-body');
    const side = node('div', 'lt-side');
    if (c.full) {
      const big = node('span', 'lt-side-big');
      const h = node('span', 'lt-side-han', c.han);
      h.lang = 'zh';
      big.append(h, ` ${c.hv}`);
      const sub = node('span', 'lt-side-sub');
      sub.append(node('b', 'lt-py', c.pinyin), ` — ${c.meaning}`);
      side.append(node('span', 'lt-cap', T.full), big, sub);
    } else side.append(node('span', 'lt-cap', T.meaning), node('span', 'lt-mean', c.meaning), node('span', 'lt-py', c.pinyin), node('span', 'lt-hint', T.pick));
    body.append(this.frame(c), side);
    // thời gian (lượt mình đang hỏi): vạch ngắn dần, ≤ 5 giây đặc; không đỏ
    const time = node('div', 'lt-time');
    if (c.left !== null) {
      const n = Math.ceil(c.left);
      const bar = node('span', 'lt-bar');
      bar.setAttribute('role', 'timer');
      bar.setAttribute('aria-label', `Còn ${n} giây`);
      const fill = node('span', `lt-fill${n <= 5 ? ' low' : ''}`);
      fill.style.width = `${Math.max(0, Math.min(100, (c.left / c.total) * 100)).toFixed(1)}%`;
      bar.append(fill);
      time.append(bar, node('span', `lt-sec${n <= 5 ? ' low' : ''}`, T.seconds(n)));
    } else time.classList.add('off');
    const tiles = node('div', 'lt-tiles');
    c.tiles.forEach((t, i) => {
      const b = node('button', `lt-tile ${t.state}`);
      b.type = 'button';
      b.setAttribute('aria-label', `Bộ ${t.hv}`);
      const f = node('span', 'lt-tile-han', t.form);
      f.lang = 'zh';
      b.append(f, node('span', 'lt-tile-hv', t.hv));
      if (t.state === 'dung' || t.state === 'sai') {
        const m = node('span', `lt-mark ${t.state}`);
        m.append(strokeIcon(12, t.state === 'dung' ? ICON_TICK : ICON_CROSS, 3));
        b.append(m);
      }
      if (t.npcPick) {
        const badge = node('span', 'lt-pickby');
        badge.append(trucLamFace(t.npcPick, 22, 'lt-face'));
        b.append(badge);
      }
      if (c.mine && !c.full) {
        b.append(keyCap(String(i + 1)));
        b.addEventListener('click', () => this.on.pick(i));
      } else b.tabIndex = -1;
      tiles.append(b);
    });
    sec.append(head, body, time, tiles);
    return sec;
  }

  private keysHint(): HTMLElement {
    const h = node('div', 'lt-keys');
    h.append(keyCap('1'), '–', keyCap('4'), ` ${T.keysHint} · `, keyCap('Esc'), ` ${T.escHint}`);
    return h;
  }

  private result(r: LuuResultView): HTMLElement {
    const sec = node('section', 'lt-result');
    sec.setAttribute('aria-label', 'Kết quả');
    const face = node('span', 'lt-host');
    face.append(trucLamFace('thi-ong', 56, 'lt-face'));
    const tag = node('span', 'lt-host-name', T.host);
    const title = node('div', 'lt-title');
    title.append(node('span', 'lt-rank', r.title));
    if (r.seal) title.append(node('span', 'lt-seal', T.seal));
    title.append(node('span', 'lt-points', T.points(r.points)));
    const ol = node('ol', 'lt-board');
    for (const row of r.rows) {
      const li = node('li', row.me ? 'me' : '');
      li.append(node('span', 'lt-board-rank', String(row.rank)), trucLamFace(row.npc, 26, 'lt-face'), node('span', 'lt-board-name', row.name), node('span', 'lt-board-score', String(row.score)));
      ol.append(li);
    }
    const line = node('div', 'lt-line', `"${r.line}"`);
    const reward = node('div', `lt-reward${r.reward === null ? ' capped' : ''}`);
    if (r.reward === null) reward.textContent = T.capped;
    else if (r.reward !== undefined) reward.append(coinIcon(20), T.reward(r.reward));
    const btns = node('div', 'lt-btns');
    const again = node('button', 'lt-again');
    again.type = 'button';
    again.append(strokeIcon(18, ICON_AGAIN), T.again);
    again.addEventListener('click', () => this.on.newRound());
    btns.append(again, this.leaveButton('lt-leave2'));
    sec.append(face, tag, title, ol, line, reward, btns);
    return sec;
  }
}
