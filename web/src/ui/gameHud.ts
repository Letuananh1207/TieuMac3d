/**
 * HUD trò chơi Kỳ Văn Uyển (R-GIAO-1, R-CO-3, R-DAU-2) — thiết kế 2026-11-13.27 (`Co-doc-*`, `Co-ngang`, `Co-ket-qua`,
 * `Dau-doc-*`, `Dau-ngang`). Ngồi chơi: "Rời bàn", tỉ số / tiến độ, viên lượt (cờ) hoặc thẻ điểm + câu hỏi + 4 nghĩa
 * (Đấu chữ), thẻ kết quả ván. Vẽ lại khi `GameView` đổi. DOM gốc #game trong index.html; phần trong dựng bằng createElement.
 */
import { portraitOf } from './dialogBox';
import { el } from './dom';
import type { DuelView, GameNpc, GameResult, GameView, GomokuView } from './gameView';

const SVG = 'http://www.w3.org/2000/svg';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Biểu tượng nét (24 × 24) từ các path. */
function icon(size: number, paths: string[], stroke = 2.2): SVGSVGElement {
  const s = document.createElementNS(SVG, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', String(size));
  s.setAttribute('height', String(size));
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', String(stroke));
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  for (const d of paths) {
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', d);
    s.append(p);
  }
  return s;
}
const EXIT = ['M10 4H5v16h5', 'M14 8l4 4-4 4', 'M18 12H9'];
const TICK = ['M5 12l5 5 9-10'];
const CROSS = ['M6 6l12 12M18 6L6 18'];
const AGAIN = ['M4 12a8 8 0 1 0 2.4-5.7', 'M4 4v4h4'];

/** Chân dung tròn; không có ảnh (người chơi) → ô tròn trơn. */
function avatar(npc: string | null, size: number, cls = 'gh-ava'): HTMLElement {
  const url = npc ? portraitOf(npc) : undefined;
  if (!url) {
    const ph = node('span', `${cls} ph`);
    ph.style.width = ph.style.height = `${size}px`;
    return ph;
  }
  const img = node('img', cls);
  img.src = url;
  img.alt = '';
  img.width = img.height = size;
  return img;
}

/** Quân cờ nhỏ (đen / trắng) trong viên tỉ số, viên lượt. */
function stone(white: boolean): HTMLElement {
  const s = node('span', white ? 'gh-stone white' : 'gh-stone');
  s.setAttribute('aria-hidden', 'true');
  return s;
}

/** Ba chấm nhấp nháy "đang nghĩ". */
function dots(): HTMLElement {
  const d = node('span', 'gh-dots');
  d.setAttribute('aria-hidden', 'true');
  d.append(node('span'), node('span'), node('span'));
  return d;
}

/** "Mặc Ông đang nghĩ…" + chân dung. */
function thinking(npc: GameNpc): HTMLElement {
  const w = node('span', 'gh-think');
  w.append(avatar(npc.id, 32), node('span', '', `${npc.name} đang nghĩ`), dots());
  return w;
}

export class GameHud {
  private readonly root = el('game');
  private key = '';

  constructor(private readonly on: { leave(): void; newRound(): void; pick(option: number): void }) {}

  /** Vẽ theo [v]; `null` = ẩn (không ngồi chơi). */
  render(v: GameView | null): void {
    document.body.classList.toggle('at-table', v !== null);
    const key = v ? JSON.stringify(v) : '';
    if (key === this.key) return;
    this.key = key;
    this.root.hidden = !v;
    if (!v) {
      this.root.replaceChildren();
      return;
    }
    this.root.className = v.kind === 'co' ? 'gh-co' : 'gh-dau';
    const parts: HTMLElement[] = [this.leaveButton()];
    if (v.kind === 'co') parts.push(...this.gomoku(v));
    else parts.push(...this.duel(v));
    if (v.result) parts.push(this.resultCard(v.npc, v.result));
    this.root.replaceChildren(...parts);
  }

  private leaveButton(): HTMLElement {
    const b = node('button', 'gh-pill gh-leave');
    b.type = 'button';
    b.append(icon(18, EXIT), 'Rời bàn');
    b.addEventListener('click', () => this.on.leave());
    return b;
  }

  private gomoku(v: GomokuView): HTMLElement[] {
    const score = node('div', 'gh-pill gh-score');
    score.setAttribute('aria-label', `Tỉ số phiên: đạo hữu ${v.you}, ${v.npc.name} ${v.npcWins}`);
    const colon = node('span', 'colon', ':');
    score.append(stone(false), node('span', '', 'Đạo hữu'), node('span', 'num', String(v.you)), colon, node('span', 'num', String(v.npcWins)), node('span', '', v.npc.name), stone(true));

    const parts: HTMLElement[] = [score];
    if (v.turn !== 'het') {
      const turn = node('div', 'gh-pill gh-turn');
      turn.setAttribute('role', 'status');
      if (v.turn === 'you') {
        const hint = node('span', 'hint');
        hint.append('· ', stone(false), node('span', 'hint-text', ' chạm giao điểm để đặt'));
        turn.append(node('span', 'gh-dot'), node('span', '', 'Lượt đạo hữu'), hint);
      } else {
        turn.classList.add('npc');
        turn.append(thinking(v.npc));
      }
      parts.push(turn);
    }
    return parts;
  }

  private duel(v: DuelView): HTMLElement[] {
    // tiến độ: "Câu n / 10" + 10 chấm
    const prog = node('div', 'gh-pill gh-prog');
    const shown = Math.min(v.step + 1, v.total);
    const bar = node('span', 'bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', `Câu ${shown} trên ${v.total}`);
    for (let i = 0; i < v.total; i++) {
      const c = i < v.marks.length ? (v.marks[i] ? 'ok' : 'bad') : i === v.step ? 'now' : '';
      bar.append(node('span', c));
    }
    prog.append(node('span', 'step', `Câu ${shown} / ${v.total}`), bar);

    // hai thẻ điểm: Mặc Ông trái, Đạo hữu phải
    const card = (who: 'npc' | 'you'): HTMLElement => {
      const c = node('div', `gh-card ${who}`);
      const name = who === 'npc' ? v.npc.name : 'Đạo hữu';
      const n = who === 'npc' ? v.npcScore : v.you;
      c.setAttribute('aria-label', `${name}: ${n} điểm`);
      if (v.answerer === who && v.phase !== 'het') c.classList.add('turn');
      if (v.scored === who) c.classList.add('scored');
      c.append(avatar(who === 'npc' ? v.npc.id : null, 36), node('span', 'name', name), node('span', 'num', String(n)));
      return c;
    };
    const cards = node('div', 'gh-cards');
    cards.append(card('npc'), card('you'));

    // ô câu hỏi + 4 nghĩa
    const panel = node('div', 'gh-panel');
    if (v.toast) {
      const t = node('div', v.toast.right ? 'gh-toast ok' : 'gh-toast bad');
      t.setAttribute('role', 'status');
      t.append(icon(v.toast.right ? 18 : 16, v.toast.right ? TICK : CROSS, v.toast.right ? 3 : 3.2), v.toast.text);
      panel.append(t);
    }
    const ask = node('div', 'gh-ask');
    const q = node('div', 'q');
    const han = node('span', 'han', v.form);
    han.lang = 'zh';
    q.append('Bộ ', han, ' nghĩa là gì?');
    ask.append(q);
    if (v.phase === 'cham' || v.phase === 'het') ask.append(node('span', 'sub', v.detail));
    else if (v.phase === 'nghi') ask.append(thinking(v.npc));
    else {
      const sub = node('span', 'sub turn', 'Lượt đạo hữu');
      sub.append(node('span', 'more', ' · chạm một nghĩa'));
      ask.append(sub);
    }
    const opts = node('div', 'gh-opts');
    v.options.forEach((label, i) => {
      const b = node('button', 'gh-opt', label);
      b.type = 'button';
      const m = v.optionMarks[i];
      if (m) b.classList.add(m);
      if (v.phase !== 'hoi' && !m) b.classList.add('mo'); // lượt Mặc Ông: 4 ô mờ, không chạm được
      b.disabled = v.phase !== 'hoi';
      if (m === 'dung' || m === 'sai') {
        const badge = node('span', 'mk');
        badge.append(icon(m === 'dung' ? 13 : 14, m === 'dung' ? TICK : CROSS, m === 'dung' ? 3 : 3.2));
        b.append(badge);
      }
      if (v.npcPick === i) {
        const who = node('span', 'who');
        who.append(avatar(v.npc.id, 20), v.npc.name);
        b.prepend(who);
      }
      b.addEventListener('click', () => this.on.pick(i));
      opts.append(b);
    });
    panel.append(ask, opts);
    return v.result ? [prog, cards] : [prog, cards, panel]; // hết ván: thẻ kết quả thay ô câu hỏi
  }

  private resultCard(npc: GameNpc, r: GameResult): HTMLElement {
    const c = node('section', 'gh-result');
    c.setAttribute('aria-label', 'Kết quả ván');
    const tag = node('div', 'tag', npc.han ? `${npc.name} ${npc.han}` : npc.name);
    const head = node('div', 'head');
    const word = r.outcome === 'thang' ? 'Thắng' : r.outcome === 'thua' ? 'Thua' : 'Hoà';
    head.append(node('span', `out ${r.outcome}`, word), node('span', 'sc', `Tỉ số ${r.you} : ${r.npc}`));
    const line = node('div', 'line', `"${r.line}"`);
    const row = node('div', 'row');
    const again = node('button', 'again');
    again.type = 'button';
    again.append(icon(18, AGAIN, 2.4), 'Ván mới');
    again.addEventListener('click', () => this.on.newRound());
    const leave = node('button', 'leave');
    leave.type = 'button';
    leave.append(icon(18, EXIT), 'Rời bàn');
    leave.addEventListener('click', () => this.on.leave());
    row.append(again, leave);
    c.append(avatar(npc.id, 56, 'big'), tag, head, line, row);
    return c;
  }
}
