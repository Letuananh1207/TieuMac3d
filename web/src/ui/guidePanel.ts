/**
 * Bảng cách chơi Kỳ Văn Uyển (R-GIAO-2) — lớp phủ HUD web, thiết kế 2026-11-13.35 (`CachChoi-doc-co`, `-doc-dau`,
 * `-doc-dau-chua-hoc`, `-ngang`). Một khung cho cả hai trò, nội dung từ `zones/gameGuides.ts`. DOM có sẵn trong
 * index.html (#guidePanel); phần thân dựng bằng createElement / textContent. Cùng khung: hướng dẫn Khu tự học (R-VA-5,
 * thiết kế 2026-11-14.17 `TuHoc-doc`, `-doc-chua-hoc`, `-ngang`).
 */
import { boldParts, type GameGuide } from '../zones/gameGuides';
import { portraitOf } from './dialogBox';
import { el } from './dom';

const SVG = 'http://www.w3.org/2000/svg';
// mặt NPC chưa có chân dung riêng (thủ thư Điển Thư — `thu-thu-mat.png`, cắt lấy nửa trên)
const faces = import.meta.glob('../../../design/models/anh/thu-thu-mat.png', { eager: true, query: '?url', import: 'default' });
function faceOf(npc: string): string | undefined {
  const hit = Object.entries(faces).find(([p]) => p.endsWith(`/${npc}-mat.png`));
  return hit?.[1] as string | undefined;
}

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

/** Người ngồi xếp bằng trên bồ đoàn son, cuộn sách mở trên tay, vòng sáng nhập định + cuộn treo nhỏ 3 mục (R-ON-8). */
function studyFigure(): HTMLElement {
  const row = node('div', 'gp-study');
  row.setAttribute('role', 'img');
  row.setAttribute('aria-label', 'Hình minh hoạ: người ngồi bồ đoàn mở cuộn sách, cuộn có 3 mục — Ôn bộ đến hạn sáng, Học bộ mới mờ, Xem bộ đã học');
  const s = svg('svg', { viewBox: '-90 -165 180 175', 'aria-hidden': 'true' });
  const robe = { fill: '#F4F4EF', stroke: '#2B5446', 'stroke-width': 1.6 };
  s.append(
    svg('ellipse', { cx: 0, cy: -6, rx: 78, ry: 18, fill: 'rgba(255,236,190,.55)', stroke: 'rgba(212,166,74,.85)', 'stroke-width': 2 }),
    svg('rect', { x: -50, y: -22, width: 100, height: 18, rx: 5, fill: '#A8322A' }),
    svg('rect', { x: -44, y: -26, width: 88, height: 8, rx: 4, fill: '#B8483C' }),
    svg('ellipse', { cx: 0, cy: -30, rx: 46, ry: 13, ...robe }),
    svg('path', { d: 'M-24 -32 L-19 -84 Q0 -92 19 -84 L24 -32 Z', ...robe }),
    svg('path', { d: 'M-8 -86 L0 -72 L8 -86', fill: 'none', stroke: '#2B5446', 'stroke-width': 3 }),
    svg('circle', { cx: 0, cy: -114, r: 29, fill: '#F6DCC8' }),
    svg('path', { d: 'M-30 -114 Q-30 -146 0 -146 Q30 -146 30 -114 Q18 -128 0 -126 Q-18 -128 -30 -114 Z', fill: '#1F1A1A' }),
    svg('circle', { cx: 0, cy: -150, r: 10, fill: '#1F1A1A' }),
    svg('path', { d: 'M-14 -108 q4.5 3.4 9 0 M5 -108 q4.5 3.4 9 0', fill: 'none', stroke: '#1F1A1A', 'stroke-width': 2.2, 'stroke-linecap': 'round' }),
    svg('rect', { x: -30, y: -72, width: 60, height: 26, fill: '#E6DAC2', stroke: 'rgba(58,36,24,.35)' }),
    svg('rect', { x: 18, y: -54, width: 7, height: 7, fill: '#A8322A' }),
    svg('rect', { x: -36.5, y: -78, width: 7, height: 38, rx: 3.5, fill: '#3A2418' }),
    svg('rect', { x: 29.5, y: -78, width: 7, height: 38, rx: 3.5, fill: '#3A2418' }),
  );
  for (const [x, y] of [[-33, -79], [33, -79], [-33, -39], [33, -39]]) {
    s.append(svg('circle', { cx: x, cy: y, r: 4.4, fill: '#2B5446', stroke: '#D4A64A', 'stroke-width': 1.6 }));
  }
  const menu = node('div', 'gp-mini');
  menu.setAttribute('aria-hidden', 'true');
  menu.append(node('span', 'on', 'Ôn bộ đến hạn (2)'), node('span', 'off', 'Học bộ mới'), node('span', '', 'Xem bộ đã học'));
  row.append(s, menu);
  return row;
}

/** Biểu tượng ô "chưa học bộ nào": ngọn lửa (Đấu chữ) / bản đồ (khu tự học — đi Rừng trúc). */
function noticeIcon(icon: 'lua' | 'ban-do'): SVGElement {
  const s = svg('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#24323A', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  if (icon === 'ban-do') s.append(svg('path', { d: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z' }), svg('path', { d: 'M9 4v14M15 6v14' }));
  else s.append(svg('path', { d: 'M12 3c-3 4-6 6-6 10a6 6 0 0 0 12 0c0-4-3-6-6-10z' }), svg('path', { d: 'M12 14v4' }));
  return s;
}

/** Hình minh hoạ theo bảng. */
function figureOf(kind: GameGuide['figure']): Element {
  if (kind === 'co') return gomokuFigure();
  return kind === 'dau-chu' ? duelFigure() : studyFigure();
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

  /** Mở bảng [g]; [tipName] = tên NPC cho "Mẹo của …"; [noneLearned] = chưa học bộ thủ nào (ô báo của bảng có `none`). */
  open(g: GameGuide, tipName: string, noneLearned: boolean): void {
    el('gpEyebrow').textContent = g.eyebrow;
    el('gpHan').textContent = g.han;
    el('gpName').textContent = g.name;
    el('gpIntro').textContent = g.intro;
    el('gpIntroRow').textContent = `· ${g.intro}`;
    el('guidePanel').querySelector('.gp-card')?.setAttribute('aria-label', `${g.label} ${g.name}`);

    const side: HTMLElement[] = [];
    const main: HTMLElement[] = [];
    if (g.none && noneLearned) {
      const box = node('div', 'gp-none');
      box.setAttribute('role', 'note');
      const txt = node('div');
      const body = node('div', 'b');
      body.append(...rich(g.none.body));
      txt.append(node('div', 't', g.none.title), body);
      box.append(noticeIcon(g.none.icon), txt);
      main.push(box);
    }

    const fig = node('figure', g.figure === 'co' ? 'gp-fig' : g.figure === 'dau-chu' ? 'gp-fig duel' : 'gp-fig study');
    const cap = node('figcaption');
    cap.append(...rich(g.caption));
    fig.append(figureOf(g.figure), cap);
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
    const portrait = portraitOf(g.tipBy);
    const url = portrait ?? faceOf(g.tipBy);
    if (url) {
      const img = node('img', portrait ? undefined : 'face');
      img.src = url;
      img.alt = g.tipTitle ? '' : tipName; // có đầu ô mẹo ghi tên rồi → ảnh chỉ trang trí
      tip.append(img);
    } else tip.append(node('span', 'ph'));
    const bub = node('div', 'bub');
    const say = node('div', 'say');
    say.append('"', ...rich(g.tip), '"');
    const by = node('div', 'by');
    by.append(...rich(g.tipTitle ?? `Mẹo của ${tipName}`));
    bub.append(by, say);
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
