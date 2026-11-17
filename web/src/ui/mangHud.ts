/**
 * HUD Hái măng sau mưa (R-MANG-1…5) — thiết kế 2026-11-16.13 (`HaiMang-*`, `BanMang-*`, `TrucLam-nut-trang-thai`):
 * nút nổi "Hái" neo trên măng gần nhất (măng to viền vàng + nhãn "Măng to"; máy tính phím E), nhãn bay "+1 Măng", chip lứa
 * măng dưới bản đồ nhỏ, thẻ măng chữ (vỏ măng khắc từ đã học, 4 phương án, đúng / sai tự đóng 1,5 s), bảng bán cho Trúc Ông
 * (dòng Măng / Măng to + "Bán", "Bán hết · +n", bán xong giữ bảng mở với "Đã bán"). Không biết tới luật — nơi ghép
 * (`web/src/haiMang.ts`) đưa dữ liệu. DOM dựng bằng createElement.
 */
import * as THREE from 'three';
import './mangHud.css';
import { keyCap, trucLamFace } from './trucLamFaces';
import { ICON_CROSS, shootIcon, strokeIcon } from './trucLamIcons';
import { coinIcon } from './wallet';

export interface MangPickView {
  x: number;
  y: number;
  z: number;
  big: boolean;
}

export interface MangQuizView {
  /** chữ của từ khắc trên vỏ măng */
  han: string;
  options: { meaning: string; hv: string }[];
  /** đã trả lời: ô chọn + đúng / sai */
  picked: number | null;
  answer: number;
  /** chữ báo sau khi trả lời */
  verdict?: string;
}

export interface MangSellRow {
  kind: 'mang' | 'mang-to';
  name: string;
  n: number;
  price: number;
  sold: boolean;
}

export interface MangSellView {
  rows: MangSellRow[];
  /** tổng nếu bán hết phần còn lại; 0 = đã bán hết */
  all: number;
}

const T = {
  pick: 'Hái',
  big: 'Măng to',
  quizTag: 'Măng chữ · măng to',
  quiz: 'Từ này nghĩa là gì?',
  quizSub: 'Đúng được gấp đôi',
  sellTitle: 'Bán măng cho Trúc Ông',
  sellSub: 'Không giới hạn · măng không hỏng trong túi',
  sell: 'Bán',
  sold: 'Đã bán',
  soldAll: 'Đã bán hết',
  sellAll: (n: number) => `Bán hết · +${n}`,
  price: (n: number) => `${n} / cái`,
  close: 'Đóng',
  hint: 'hái măng gần nhất · WASD đi',
} as const;

/** Nhãn bay lên 40 px trong 0,9 s rồi mờ. */
const FLY_MS = 900;
/** Thẻ măng chữ tự đóng sau khi trả lời (s). */
export const QUIZ_CLOSE_SECONDS = 1.5;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export class MangHud {
  private readonly btn = node('div');
  private readonly btnTag = node('span', 'mh-tag', T.big);
  private readonly btnDisc = node('span', 'mh-disc');
  private readonly chip = node('div');
  private readonly hint = node('div', 'mh-hint');
  private readonly quizRoot = node('div');
  private readonly sellRoot = node('div');
  private readonly v = new THREE.Vector3();
  private target: MangPickView | null = null;
  private bigShown: boolean | null = null;
  private quizKey = '';
  private sellKey = '';

  constructor(
    private readonly on: { pick(): void; answer(i: number): void; sell(kind: 'mang' | 'mang-to' | null): void; closeSell(): void },
  ) {
    this.btn.id = 'mangPick';
    this.btn.hidden = true;
    const b = node('button', 'mh-btn');
    b.type = 'button';
    b.setAttribute('aria-label', 'Hái măng');
    b.append(this.btnDisc, T.pick, keyCap('E'));
    b.addEventListener('click', () => this.on.pick());
    this.btn.append(this.btnTag, b, node('span', 'mh-tip'));
    this.chip.id = 'mangChip';
    this.chip.hidden = true;
    this.chip.setAttribute('role', 'status');
    this.hint.hidden = true;
    this.hint.append(keyCap('E'), ` ${T.hint}`);
    this.quizRoot.id = 'mangQuiz';
    this.quizRoot.hidden = true;
    this.sellRoot.id = 'mangSell';
    this.sellRoot.hidden = true;
    document.body.append(this.chip, this.btn, this.hint, this.quizRoot, this.sellRoot);
  }

  /** Măng gần nhất trong tầm (`null` = ẩn nút "Hái"). */
  setPick(p: MangPickView | null): void {
    this.target = p;
    this.btn.hidden = !p;
    this.hint.hidden = !p;
    if (p && p.big !== this.bigShown) {
      this.bigShown = p.big;
      this.btn.classList.toggle('big', p.big);
      this.btnDisc.replaceChildren(shootIcon(28, p.big));
    }
  }

  /** Mỗi khung: đặt nút trên măng theo camera; điểm ra sau camera thì giấu. */
  follow(camera: THREE.Camera): void {
    const p = this.target;
    if (!p || this.btn.hidden) return;
    const pt = this.screen(p, camera);
    this.btn.style.visibility = pt ? 'visible' : 'hidden';
    if (!pt) return;
    this.btn.style.left = `${Math.min(window.innerWidth - 70, Math.max(70, pt.x))}px`;
    this.btn.style.top = `${Math.min(window.innerHeight - 110, Math.max(120, pt.y))}px`;
  }

  /** Chip lứa măng (`null` = ẩn). */
  setChip(text: string | null): void {
    this.chip.hidden = text === null;
    if (text === null || this.chip.textContent === text) return;
    this.chip.replaceChildren(shootIcon(20), text);
  }

  /** Nhãn bay "+1 Măng" từ chỗ măng. */
  fly(text: string, big: boolean, at: { x: number; y: number; z: number }, camera: THREE.Camera): void {
    const pt = this.screen(at, camera) ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const f = node('div', big ? 'mh-fly big' : 'mh-fly');
    f.setAttribute('role', 'status');
    f.append(shootIcon(22, big), text);
    f.style.left = `${pt.x}px`;
    f.style.top = `${pt.y}px`;
    document.body.append(f);
    window.setTimeout(() => f.remove(), FLY_MS + 50);
  }

  /** Thẻ măng chữ (`null` = đóng). */
  quiz(v: MangQuizView | null): void {
    const key = v ? JSON.stringify(v) : '';
    if (key === this.quizKey) return;
    this.quizKey = key;
    this.quizRoot.hidden = !v;
    if (!v) {
      this.quizRoot.replaceChildren();
      return;
    }
    const card = node('section', 'mh-quiz');
    card.setAttribute('aria-label', 'Câu hỏi măng chữ');
    const top = node('div', 'mh-q-top');
    const shell = node('div', 'mh-shell');
    shell.append(shootIcon(104, true));
    const rad = node('span', `mh-carve${[...v.han].length > 1 ? ' mh-carve-2' : ''}`, v.han);
    rad.lang = 'zh';
    shell.append(rad);
    const txt = node('div', 'mh-q-txt');
    txt.append(node('span', 'mh-q-tag', T.quizTag), node('span', 'mh-q-title', T.quiz), node('span', 'mh-q-sub', T.quizSub));
    top.append(shell, txt);
    const opts = node('div', 'mh-opts');
    v.options.forEach((o, i) => {
      const done = v.picked !== null;
      const state = !done ? '' : i === v.answer ? ' right' : i === v.picked ? ' wrong' : ' dim';
      const b = node('button', `mh-opt${state}`);
      b.type = 'button';
      b.append(node('span', 'mh-opt-m', o.meaning), ...(o.hv ? [node('span', 'mh-opt-hv', o.hv)] : []), keyCap(String(i + 1)));
      if (!done) b.addEventListener('click', () => this.on.answer(i));
      opts.append(b);
    });
    card.append(top, opts);
    if (v.verdict) {
      const right = v.picked === v.answer;
      const verdict = node('div', `mh-verdict${right ? ' right' : ''}`, v.verdict);
      verdict.setAttribute('role', 'status');
      const bar = node('span', 'mh-close-bar');
      bar.style.animationDuration = `${QUIZ_CLOSE_SECONDS}s`;
      card.append(verdict, bar);
    }
    this.quizRoot.replaceChildren(node('div', 'mh-dim'), card);
  }

  /** Bảng bán cho Trúc Ông (`null` = đóng). */
  sell(v: MangSellView | null): void {
    const key = v ? JSON.stringify(v) : '';
    if (key === this.sellKey) return;
    this.sellKey = key;
    this.sellRoot.hidden = !v;
    if (!v) {
      this.sellRoot.replaceChildren();
      return;
    }
    const sec = node('section', 'mh-sell');
    sec.setAttribute('aria-label', T.sellTitle);
    const head = node('div', 'mh-s-head');
    const name = node('div', 'mh-s-name');
    name.append(node('span', 'mh-s-title', T.sellTitle), node('span', 'mh-s-sub', T.sellSub));
    const shut = node('button', 'mh-s-close');
    shut.type = 'button';
    shut.setAttribute('aria-label', T.close);
    shut.append(strokeIcon(18, ICON_CROSS, 2.4), keyCap('Esc'));
    shut.addEventListener('click', () => this.on.closeSell());
    head.append(trucLamFace('truc-ong', 40, 'tl-face'), name, shut);
    const ul = node('ul', 'mh-rows');
    for (const r of v.rows) {
      const li = node('li', r.sold ? 'sold' : '');
      const pic = node('span', 'mh-pic');
      pic.append(shootIcon(34, r.kind === 'mang-to'));
      const mid = node('span', 'mh-mid');
      const price = node('span', 'mh-price');
      price.append(coinIcon(14), T.price(r.price));
      mid.append(node('span', 'mh-row-n', `${r.name} × ${r.n}`), price);
      li.append(pic, mid);
      if (r.sold) li.append(node('span', 'mh-sold', T.sold));
      else {
        const b = node('button', 'mh-one', T.sell);
        b.type = 'button';
        b.addEventListener('click', () => this.on.sell(r.kind));
        li.append(b);
      }
      ul.append(li);
    }
    const all = node('button', v.all > 0 ? 'mh-all' : 'mh-all done');
    all.type = 'button';
    if (v.all > 0) {
      all.append(T.sellAll(v.all), coinIcon(18), keyCap('Enter'));
      all.addEventListener('click', () => this.on.sell(null));
    } else {
      all.disabled = true;
      all.textContent = T.soldAll;
    }
    sec.append(node('span', 'mh-grip'), head, ul, node('div', 'mh-gap'), all);
    this.sellRoot.replaceChildren(node('div', 'mh-dim'), sec);
  }

  private screen(p: { x: number; y: number; z: number }, camera: THREE.Camera): { x: number; y: number } | null {
    this.v.set(p.x, p.y, p.z).project(camera);
    if (this.v.z > 1) return null;
    return { x: ((this.v.x + 1) / 2) * window.innerWidth, y: ((1 - this.v.y) / 2) * window.innerHeight };
  }
}
