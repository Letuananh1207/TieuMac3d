/**
 * Bảng cách chơi Kỳ Văn Uyển (R-GIAO-2) — lớp phủ HUD web, thiết kế 2026-11-13.35 (`CachChoi-doc-co`, `-doc-dau`,
 * `-doc-dau-chua-hoc`, `-ngang`). Một khung cho cả hai trò, nội dung từ `zones/gameGuides.ts`. DOM có sẵn trong
 * index.html (#guidePanel); phần thân dựng bằng createElement / textContent.
 */
import { boldParts, type GameGuide } from '../zones/gameGuides';
import { portraitOf } from './dialogBox';
import { el } from './dom';

const SVG = 'http://www.w3.org/2000/svg';
/** Chữ Hán trong một đoạn (mẹo "木 là cái cây") — tô font Hán màu ngọc. */
const HAN = /(\p{Script=Han}+)/u;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function svg(tag: string, attrs: Record<string, string | number>): SVGElement {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

/** Đoạn chữ có `**đậm**` và chữ Hán → các nút DOM. */
function rich(text: string): Node[] {
  const out: Node[] = [];
  for (const part of boldParts(text)) {
    const pieces = part.text.split(HAN).filter(Boolean);
    const nodes = pieces.map((t): Node => {
      if (!HAN.test(t)) return document.createTextNode(t);
      const s = node('span', 'gp-han-inline', t);
      s.lang = 'zh';
      return s;
    });
    if (part.bold) {
      const b = node('b');
      b.append(...nodes);
      out.push(b);
    } else out.push(...nodes);
  }
  return out;
}

/** Lưới 7 × 7 trên nền gỗ, 5 quân đen liền chéo viền vàng + vạch nối, 4 quân trắng xen. */
function gomokuFigure(): SVGElement {
  const s = svg('svg', { viewBox: '0 0 168 168', role: 'img', 'aria-label': 'Hình minh hoạ: 5 quân đen liền chéo sáng lên, đen thắng' });
  s.append(svg('rect', { x: 0, y: 0, width: 168, height: 168, rx: 6, fill: '#E7D6B4' }));
  let d = '';
  for (let i = 12; i <= 156; i += 24) d += `M${i} 12V156M12 ${i}H156`;
  s.append(svg('path', { d, stroke: 'rgba(36,50,58,.45)', 'stroke-width': 1.2 }));
  s.append(svg('path', { d: 'M36 132L132 36', stroke: '#D4A64A', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.7 }));
  for (const [x, y] of [[36, 108], [108, 84], [132, 60], [60, 132]]) {
    s.append(svg('circle', { cx: x, cy: y, r: 9.5, fill: '#FFFFFF', stroke: 'rgba(36,50,58,.45)' }));
  }
  for (let k = 0; k < 5; k++) {
    const x = 36 + k * 24;
    const y = 132 - k * 24;
    s.append(svg('circle', { cx: x, cy: y, r: 12.5, fill: 'none', stroke: '#D4A64A', 'stroke-width': 3 }));
    s.append(svg('circle', { cx: x, cy: y, r: 9.5, fill: '#1E2226' }));
  }
  return s;
}

/** Thẻ 木 + 4 nghĩa (nghĩa đúng tô ngọc, có dấu ✓; 3 nghĩa kia mờ). */
function duelFigure(): HTMLElement {
  const row = node('div', 'gp-duel');
  row.setAttribute('role', 'img');
  row.setAttribute('aria-label', "Hình minh hoạ: thẻ bộ thủ 木 và 4 nghĩa, nghĩa đúng 'mộc — cây' tô xanh");
  const card = node('div', 'gp-card-han', '木');
  card.lang = 'zh';
  card.setAttribute('aria-hidden', 'true');
  const opts = node('div', 'gp-opts');
  opts.setAttribute('aria-hidden', 'true');
  const ok = node('span', 'ok', 'mộc — cây');
  const tick = node('span', 'tick');
  const t = svg('svg', { width: 11, height: 11, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  t.append(svg('path', { d: 'M5 12l5 5 9-10' }));
  tick.append(t);
  ok.append(tick);
  opts.append(ok, node('span', '', 'thuỷ — nước'), node('span', '', 'thổ — đất'), node('span', '', 'hoả — lửa'));
  row.append(card, opts);
  return row;
}

/** Biểu tượng ngọn lửa của ô "chưa học bộ nào". */
function flame(): SVGElement {
  const s = svg('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#24323A', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  s.append(svg('path', { d: 'M12 3c-3 4-6 6-6 10a6 6 0 0 0 12 0c0-4-3-6-6-10z' }), svg('path', { d: 'M12 14v4' }));
  return s;
}

export class GuidePanel {
  private readonly root = el('guidePanel');
  private readonly scroll = el('gpScroll');
  private readonly side = el('gpSide');
  private readonly main = el('gpMain');

  constructor(private readonly onClose: () => void) {
    el('gpClose').addEventListener('click', () => this.close());
    el('gpCloseTop').addEventListener('click', () => this.close());
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** Mở bảng của trò [g]; [tipName] = tên NPC cho "Mẹo của …"; [noneLearned] = chưa học bộ thủ nào (ô báo của Đấu chữ). */
  open(g: GameGuide, tipName: string, noneLearned: boolean): void {
    el('gpHan').textContent = g.han;
    el('gpName').textContent = g.name;
    el('gpIntro').textContent = g.intro;
    el('gpIntroRow').textContent = `· ${g.intro}`;
    el('guidePanel').querySelector('.gp-card')?.setAttribute('aria-label', `Cách chơi ${g.name}`);

    const side: HTMLElement[] = [];
    const main: HTMLElement[] = [];
    if (g.none && noneLearned) {
      const box = node('div', 'gp-none');
      box.setAttribute('role', 'note');
      const txt = node('div');
      const body = node('div', 'b');
      body.append(...rich(g.none.body));
      txt.append(node('div', 't', g.none.title), body);
      box.append(flame(), txt);
      main.push(box);
    }

    const fig = node('figure', g.figure === 'co' ? 'gp-fig' : 'gp-fig duel');
    const cap = node('figcaption');
    cap.append(...rich(g.caption));
    fig.append(g.figure === 'co' ? gomokuFigure() : duelFigure(), cap);
    side.push(fig);

    g.sections.forEach((sec, i) => {
      const row = node('div', 'gp-sec');
      const n = node('span', 'n', String(i + 1));
      n.setAttribute('aria-hidden', 'true');
      const c = node('div', 'c');
      const p = node('p');
      p.append(...rich(sec.body));
      c.append(node('h3', '', sec.title), p);
      row.append(n, c);
      main.push(row);
    });

    const tip = node('div', 'gp-tip');
    const url = portraitOf(g.tipBy);
    if (url) {
      const img = node('img');
      img.src = url;
      img.alt = tipName;
      tip.append(img);
    } else tip.append(node('span', 'ph'));
    const bub = node('div', 'bub');
    const say = node('div', 'say');
    say.append('"', ...rich(g.tip), '"');
    bub.append(node('div', 'by', `Mẹo của ${tipName}`), say);
    tip.append(bub);
    side.push(tip);

    this.side.replaceChildren(...side);
    this.main.replaceChildren(...main);
    this.root.hidden = false;
    this.scroll.scrollTop = 0;
    this.main.scrollTop = 0;
  }

  /** Đóng (nút "Đóng" / nút quay lại của máy). Không mở thì trả `false`. */
  close(): boolean {
    if (this.root.hidden) return false;
    this.root.hidden = true;
    this.onClose();
    return true;
  }
}
