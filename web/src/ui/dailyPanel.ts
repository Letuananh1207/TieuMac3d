/**
 * Bảng nhiệm vụ hằng ngày 日課榜 trên web (R-NV-3) — khi không có màn Flutter (chạy trình duyệt). Theo thiết kế
 * 2026-11-13.25 `NhiemVu-doc` / `-ngang` (cùng bố cục `app/lib/lesson/daily_screen.dart`). DOM có sẵn trong index.html (#daily).
 */
import type { DailyBoardView } from '../zones/dailyBoard';
import { el } from './dom';

const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const SVG = 'http://www.w3.org/2000/svg';
/** Ô chữ đến hạn tối đa một hàng; thừa → "+n". */
const MAX_TILES = 6;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Dấu ✓ (vòng trạng thái, ngày đã tính). */
function check(size: number): SVGSVGElement {
  const s = document.createElementNS(SVG, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', String(size));
  s.setAttribute('height', String(size));
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(SVG, 'path');
  p.setAttribute('d', 'M5 12l5 5 9-10');
  s.append(p);
  return s;
}

function rule(): HTMLElement {
  const r = node('div', 'dl-rule');
  r.setAttribute('aria-hidden', 'true');
  r.append(node('span'), node('span', 'dot'), node('span'));
  return r;
}

export class DailyPanel {
  private readonly root = el('daily');
  private readonly card = el('dailyCard');
  private readonly closeBtn = el('dailyClose');

  constructor(private readonly onClose: () => void) {
    this.closeBtn.addEventListener('click', () => this.close());
  }

  /** Mở bảng; [dueForms] = chữ các bộ đến hạn; [onReview] = "Ôn ngay" (R-ON-5) — đóng bảng rồi mở lượt ôn. */
  open(v: DailyBoardView, dueForms: readonly string[], onReview: () => void): void {
    const now = new Date();
    const title = node('div', 'dl-title');
    const han = node('div', 'dl-han', '日課榜');
    han.lang = 'zh';
    const date = node('div', 'dl-date', 'Nhiệm vụ hằng ngày · ');
    date.append(node('span', 'wd', `${WEEKDAYS[now.getDay()]} `), `${now.getDate()}/${now.getMonth() + 1}`); // ngang: bỏ thứ
    title.append(han, date);

    let learnProg: HTMLElement | null = null;
    if (v.learn.count) {
      learnProg = node('span', 'dl-prog');
      const dots = node('span', 'dl-dots');
      dots.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 3; i++) dots.append(node('span', i < v.learn.dots ? 'on' : undefined));
      learnProg.append(dots, node('b', undefined, v.learn.count));
    }
    const learn = this.task('Lĩnh hội', v.learn.done, learnProg, v.learn.sub);

    const extra: HTMLElement[] = [];
    if (!v.review.done && dueForms.length) {
      const tiles = node('div', 'dl-tiles');
      for (const f of dueForms.slice(0, MAX_TILES)) {
        const t = node('span', undefined, f);
        t.lang = 'zh';
        tiles.append(t);
      }
      if (dueForms.length > MAX_TILES) tiles.append(node('span', 'more', `+${dueForms.length - MAX_TILES}`));
      const btn = node('button', 'dl-primary', 'Ôn ngay');
      btn.type = 'button';
      btn.addEventListener('click', () => {
        this.close();
        onReview();
      });
      extra.push(tiles, btn);
    }
    const reviewProg = v.review.done ? null : node('b', 'dl-prog', `còn ${v.review.left}`);
    const review = this.task('Ôn tập', v.review.done, reviewProg, v.review.sub, extra);

    const tasks = node('div', 'dl-tasks');
    tasks.append(learn, review);
    // dọc: tiêu đề · vạch · 2 việc · vạch · chuỗi; ngang (CSS grid): 2 việc trái | tiêu đề + chuỗi phải
    this.card.replaceChildren(title, rule(), tasks, rule(), this.streak(v));
    if (v.allDone) {
      const seal = node('div', 'dl-seal');
      seal.setAttribute('role', 'img');
      seal.setAttribute('aria-label', 'Hôm nay đã xong');
      const h = node('span', 'h', '畢');
      h.lang = 'zh';
      seal.append(h, node('span', 's', 'xong'));
      this.card.append(seal);
    }
    this.root.hidden = false;
  }

  close(): void {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.onClose();
  }

  private task(name: string, done: boolean, prog: HTMLElement | null, sub: string, extra: HTMLElement[] = []): HTMLElement {
    const sec = node('section', done ? 'dl-task done' : 'dl-task');
    const ring = node('span', 'dl-ring');
    ring.setAttribute('aria-hidden', 'true');
    if (done) ring.append(check(18));
    const row = node('div', 'dl-row');
    row.append(node('h2', undefined, name));
    if (prog) row.append(prog);
    const body = node('div', 'dl-body');
    body.append(row, node('div', 'dl-sub', sub), ...extra);
    sec.append(ring, body);
    return sec;
  }

  private streak(v: DailyBoardView): HTMLElement {
    const sec = node('section', 'dl-streak');
    sec.setAttribute('aria-label', 'Chuỗi ngày');
    const cur = node('div', 'dl-cur');
    cur.append(node('span', undefined, 'Tu liền'), node('span', 'n', String(v.streak)), node('span', undefined, 'ngày'));
    const best = node('span', 'dl-best', 'Kỷ lục ');
    best.append(node('b', undefined, String(v.best)), document.createTextNode(' ngày'));
    const head = node('div', 'dl-streak-head');
    head.append(cur, best);
    sec.append(head, this.week(v), node('div', 'dl-foot', v.footer));
    return sec;
  }

  /** Dải 7 ngày T2…CN: hôm nay + các ngày liền trước thuộc chuỗi (cùng tuần) — R-NV-2. */
  private week(v: DailyBoardView): HTMLElement {
    const today = (new Date().getDay() + 6) % 7;
    const prevDone = v.allDone ? v.streak - 1 : v.streak; // số ngày liền trước hôm nay đã được tính
    const strip = node('div', 'dl-week');
    DAY_LABELS.forEach((label, i) => {
      const ring = node('span');
      if (i === today) ring.className = v.allDone ? 'done today' : 'today';
      else if (i < today) ring.className = today - i <= prevDone ? 'done' : 'miss';
      if (ring.classList.contains('done')) ring.append(check(14));
      const d = node('div', 'dl-day');
      d.append(ring, node('span', i === today ? 'lbl now' : 'lbl', label));
      strip.append(d);
    });
    return strip;
  }
}
