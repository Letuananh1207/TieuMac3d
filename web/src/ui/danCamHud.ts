/**
 * HUD Đàn cầm (R-CAM-1…4) — thiết kế 2026-11-16.13 (`DanCam-*`): tấm chọn "Đàn tự do" · "Theo bài" · "Đứng dậy", danh sách 3
 * bài (tốt nhất / đã thưởng hôm nay / độ dài), bàn dây sơn đen 2 hàng Bổng / Trầm × 5 phím (chạm / lướt = gảy), 5 làn nốt rơi
 * về vạch gảy vàng ("Hay" / "Được"), thẻ kết quả bài. Phần tĩnh vẽ lại khi `DanView` đổi; nốt rơi đặt mỗi khung (`frame`).
 * Không biết tới luật — nơi ghép (`web/src/danCam.ts`) đưa dữ liệu. DOM dựng bằng createElement.
 */
import './danCamHud.css';
import { keyCap } from './trucLamFaces';
import { ICON_AGAIN, ICON_BACK, ICON_LIST, ICON_NOTE, ICON_PAUSE, ICON_STAND, ICON_TICK, qinIcon, strokeIcon } from './trucLamIcons';
import { coinIcon } from './wallet';

export const CUNG = ['Cung', 'Thương', 'Giốc', 'Chuỷ', 'Vũ'] as const;

export interface DanSongRow {
  id: string;
  name: string;
  /** "0:45" */
  len: string;
  /** hạng tốt nhất hôm nay ("Thanh nhã"), chưa đàn → không có */
  best?: string;
  rewarded: boolean;
}

export type DanReward = { kind: 'coins'; n: number } | { kind: 'song' } | { kind: 'capped' };

export type DanView =
  | { mode: 'chon' }
  | { mode: 'bai'; songs: DanSongRow[] }
  | { mode: 'tudo' }
  | { mode: 'theo'; name: string; hay: number; duoc: number; progress: number; paused: boolean }
  | { mode: 'ketqua'; name: string; rank: string; pct: number; hay: number; duoc: number; miss: number; reward?: DanReward };

export interface DanNote {
  lane: number;
  /** 0 = đỉnh làn → 1 = vạch gảy (có thể > 1 khi đã qua) */
  k: number;
  mark: 'hay' | 'duoc' | null | undefined;
}

export interface DanHudHandlers {
  free(): void;
  songs(): void;
  stand(): void;
  back(): void;
  song(id: string): void;
  /** gảy phím bàn dây: hàng 0 = Bổng, 1 = Trầm */
  pluck(row: number, i: number): void;
  lane(i: number): void;
  pause(): void;
  again(): void;
}

const T = {
  title: 'Đàn cầm',
  place: 'Tảng đá đàn · Trúc Lâm',
  free: 'Đàn tự do',
  freeSub: 'Gảy tuỳ ý — không chấm điểm',
  song: 'Theo bài',
  songSub: '3 bài · chạm đúng lúc nốt rơi',
  stand: 'Đứng dậy',
  standSub: 'Rời tảng đá',
  note: 'mỗi bài thưởng 1 lần / ngày',
  best: (g: string) => `Tốt nhất: ${g}`,
  notToday: 'Chưa đàn hôm nay',
  rewarded: 'Đã thưởng hôm nay',
  high: 'Bổng',
  low: 'Trầm',
  hay: 'Hay',
  duoc: 'Được',
  miss: 'Trượt',
  again: 'Đàn lại',
  other: 'Chọn bài khác',
  songRewarded: 'Bài này hôm nay đã thưởng',
  capped: 'Hôm nay trò chơi đã đủ thưởng',
  reward: (n: number) => `+${n} Văn tiền`,
  pause: 'Tạm dừng',
  back: 'Quay lại',
} as const;

const HIGH_KEYS = ['Q', 'W', 'E', 'R', 'T'];
const LOW_KEYS = ['1', '2', '3', '4', '5'];
/** Phím sáng sau một lần gảy (s). */
const GLOW_MS = 300;
/** Chữ "Hay" / "Được" trên vạch (s). */
const JUDGE_MS = 500;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function button(cls: string, label?: string): HTMLButtonElement {
  const b = node('button', cls);
  b.type = 'button';
  if (label) b.setAttribute('aria-label', label);
  return b;
}

export class DanCamHud {
  private readonly root = node('div');
  private key = '';
  /** phím bàn dây [hàng][dây] */
  private keys: HTMLButtonElement[][] = [];
  private lanes: HTMLElement | null = null;
  private notePool: HTMLElement[] = [];
  private stats: { count: HTMLElement; bar: HTMLElement } | null = null;

  constructor(private readonly on: DanHudHandlers) {
    this.root.id = 'danHud';
    this.root.hidden = true;
    document.body.append(this.root);
  }

  /** Vẽ theo [v]; `null` = ẩn (không ngồi đàn). */
  render(v: DanView | null): void {
    // phần đổi mỗi khung của "Theo bài" (đếm Hay / Được, tiến độ) đặt riêng, không dựng lại cả làn
    const key = v ? JSON.stringify(v.mode === 'theo' ? { mode: v.mode, name: v.name, paused: v.paused } : v) : '';
    if (v?.mode === 'theo' && this.stats) {
      this.stats.count.textContent = `${T.hay} ${v.hay} · ${T.duoc} ${v.duoc}`;
      this.stats.bar.style.width = `${Math.round(v.progress * 100)}%`;
    }
    if (key === this.key) return;
    this.key = key;
    this.root.hidden = !v;
    this.keys = [];
    this.lanes = null;
    this.notePool = [];
    this.stats = null;
    if (!v) {
      this.root.className = '';
      this.root.replaceChildren();
      return;
    }
    this.root.className = `dc-${v.mode}`;
    if (v.mode === 'chon') this.root.replaceChildren(node('div', 'dc-dim'), this.chooser());
    else if (v.mode === 'bai') this.root.replaceChildren(node('div', 'dc-dim'), this.songList(v.songs));
    else if (v.mode === 'tudo') this.root.replaceChildren(...this.freeBoard());
    else if (v.mode === 'theo') this.root.replaceChildren(node('div', 'dc-dim dark'), ...this.songPlay(v));
    else this.root.replaceChildren(node('div', 'dc-dim'), this.result(v));
  }

  /** Phím [row, i] vừa gảy: dây lượn sóng sáng + quầng vàng → jade 0,3 s. */
  glow(row: number, i: number): void {
    const k = this.keys[row]?.[i];
    if (!k) return;
    k.classList.remove('hit');
    void k.offsetWidth; // chạy lại hoạt ảnh
    k.classList.add('hit');
    window.setTimeout(() => k.classList.remove('hit'), GLOW_MS);
  }

  /** Nốt rơi của khung này (chỉ khi "Theo bài"). */
  frame(notes: readonly DanNote[]): void {
    const box = this.lanes;
    if (!box) return;
    while (this.notePool.length < notes.length) {
      const n = node('span', 'dc-note');
      n.setAttribute('aria-hidden', 'true');
      box.append(n);
      this.notePool.push(n);
    }
    this.notePool.forEach((el, j) => {
      const n = notes[j];
      el.hidden = !n || n.mark === 'hay' || n.mark === 'duoc';
      if (!n || el.hidden) return;
      el.className = n.mark === null ? 'dc-note miss' : 'dc-note';
      el.style.left = `calc(${n.lane} * (var(--lane-w) + var(--lane-gap)) + var(--lane-w) / 2)`;
      el.style.top = `calc(var(--hit-y) * ${n.k.toFixed(4)})`;
    });
  }

  /** Chữ "Hay" / "Được" trên vạch ở làn [lane] + loé vàng. */
  judge(lane: number, j: 'hay' | 'duoc'): void {
    const box = this.lanes;
    if (!box) return;
    const x = `calc(${lane} * (var(--lane-w) + var(--lane-gap)) + var(--lane-w) / 2)`;
    const flash = node('span', 'dc-flash');
    const tag = node('span', `dc-judge ${j}`, j === 'hay' ? T.hay : T.duoc);
    tag.setAttribute('role', 'status');
    flash.style.left = tag.style.left = x;
    box.append(flash, tag);
    window.setTimeout(() => {
      flash.remove();
      tag.remove();
    }, JUDGE_MS);
  }

  private row(icon: Element, title: string, sub: string, cls: string, act: () => void, key?: string): HTMLButtonElement {
    const b = button(`dc-row ${cls}`);
    const disc = node('span', 'dc-disc');
    disc.append(icon);
    const txt = node('span', 'dc-row-t');
    txt.append(node('b', '', title), node('span', '', sub));
    b.append(disc, txt);
    if (key) b.append(keyCap(key));
    b.addEventListener('click', act);
    return b;
  }

  private chooser(): HTMLElement {
    const sec = node('section', 'dc-panel');
    sec.setAttribute('aria-label', T.title);
    const head = node('div', 'dc-head');
    head.append(node('span', 'dc-title', T.title), node('span', 'dc-sub', T.place));
    sec.append(
      head,
      this.row(qinIcon(20), T.free, T.freeSub, 'main', () => this.on.free(), '1'),
      this.row(strokeIcon(20, ICON_NOTE, 2), T.song, T.songSub, '', () => this.on.songs(), '2'),
      this.row(strokeIcon(20, ICON_STAND, 2), T.stand, T.standSub, '', () => this.on.stand(), 'Esc'),
    );
    return sec;
  }

  private songList(songs: readonly DanSongRow[]): HTMLElement {
    const sec = node('section', 'dc-panel');
    sec.setAttribute('aria-label', 'Theo bài — chọn bài');
    const head = node('div', 'dc-head');
    const back = button('dc-round', T.back);
    back.append(strokeIcon(18, ICON_BACK, 2.4));
    back.addEventListener('click', () => this.on.back());
    head.append(back, node('span', 'dc-title', T.song), node('span', 'dc-sub', T.note));
    const ul = node('ul', 'dc-songs');
    songs.forEach((s, i) => {
      const li = node('li');
      const b = button('dc-song');
      const tags = node('span', 'dc-tags');
      if (s.best) tags.append(node('span', 'dc-best', T.best(s.best)));
      if (s.rewarded) {
        const r = node('span', 'dc-rewarded');
        r.append(strokeIcon(12, ICON_TICK, 3), T.rewarded);
        tags.append(r);
      }
      if (!s.best && !s.rewarded) tags.append(node('span', 'dc-not', T.notToday));
      const mid = node('span', 'dc-song-t');
      mid.append(node('b', '', s.name), tags);
      b.append(node('span', 'dc-num', String(i + 1)), mid, node('span', 'dc-len', s.len));
      b.addEventListener('click', () => this.on.song(s.id));
      li.append(b);
      ul.append(li);
    });
    sec.append(head, ul);
    return sec;
  }

  private pill(icon: Element, text: string, act: () => void, cls = 'dc-pill'): HTMLButtonElement {
    const b = button(cls);
    b.append(icon, text);
    b.addEventListener('click', act);
    return b;
  }

  /** Đàn tự do: "Đứng dậy" trên phải, "Đàn tự do" · "Theo bài" trên bàn, bàn dây 2 hàng × 5 phím. */
  private freeBoard(): HTMLElement[] {
    const stand = this.pill(strokeIcon(18, ICON_STAND, 2.2), T.stand, () => this.on.stand(), 'dc-pill dc-stand');
    stand.append(keyCap('Esc'));
    const bar = node('div', 'dc-bar');
    const tag = node('div', 'dc-pill dc-mode');
    const disc = node('span', 'dc-disc on');
    disc.append(qinIcon(16));
    tag.append(disc, T.free);
    bar.append(tag, this.pill(strokeIcon(18, ICON_NOTE, 2), T.song, () => this.on.songs()));
    const board = node('section', 'dc-board');
    board.setAttribute('aria-label', 'Bàn dây đàn — 10 phím ngũ cung');
    const studs = node('div', 'dc-studs');
    studs.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 7; i++) studs.append(node('span'));
    board.append(studs);
    [T.high, T.low].forEach((label, row) => {
      const line = node('div', 'dc-line');
      const keys = node('div', 'dc-keys');
      const list: HTMLButtonElement[] = [];
      CUNG.forEach((name, i) => {
        const k = button('dc-key', `Dây ${name} ${label.toLowerCase()}`);
        k.dataset.row = String(row);
        k.dataset.i = String(i);
        k.append(node('span', 'dc-string'), keyCap(row === 0 ? HIGH_KEYS[i] : LOW_KEYS[i]));
        list.push(k);
        keys.append(k);
      });
      this.keys.push(list);
      line.append(node('span', 'dc-row-l', label), keys);
      board.append(line);
    });
    const names = node('div', 'dc-names');
    for (const n of CUNG) names.append(node('span', '', n));
    board.append(names);
    this.strum(board);
    return [stand, bar, board];
  }

  /** Chạm = gảy; giữ và lướt qua phím khác = gảy tiếp (R-CAM-2). */
  private strum(board: HTMLElement): void {
    let last: HTMLElement | null = null;
    let down = false;
    const at = (x: number, y: number): HTMLElement | null => (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('.dc-key') ?? null;
    const hit = (k: HTMLElement | null): void => {
      if (!k || k === last) return;
      last = k;
      const row = Number(k.dataset.row);
      const i = Number(k.dataset.i);
      this.glow(row, i);
      this.on.pluck(row, i);
    };
    board.addEventListener('pointerdown', (e) => {
      down = true;
      last = null;
      e.preventDefault();
      hit(at(e.clientX, e.clientY));
    });
    board.addEventListener('pointermove', (e) => {
      if (down) hit(at(e.clientX, e.clientY));
    });
    const up = (): void => {
      down = false;
      last = null;
    };
    board.addEventListener('pointerup', up);
    board.addEventListener('pointercancel', up);
    board.addEventListener('pointerleave', up);
  }

  /** Theo bài: tạm dừng · tên bài + đếm + tiến độ · đứng dậy; 5 làn + vạch gảy + vòng đích; tên dây dưới làn. */
  private songPlay(v: Extract<DanView, { mode: 'theo' }>): HTMLElement[] {
    const top = node('div', 'dc-top');
    const pause = button('dc-round glass', T.pause);
    pause.append(strokeIcon(18, v.paused ? ['M8 5l11 7-11 7z'] : ICON_PAUSE, 2.4));
    pause.addEventListener('click', () => this.on.pause());
    const info = node('div', 'dc-info');
    const l1 = node('div', 'dc-info-l1');
    const count = node('span', 'dc-count', `${T.hay} ${v.hay} · ${T.duoc} ${v.duoc}`);
    l1.append(node('span', '', v.name), count);
    const track = node('div', 'dc-track');
    track.setAttribute('role', 'progressbar');
    const fill = node('div', 'dc-track-fill');
    fill.style.width = `${Math.round(v.progress * 100)}%`;
    track.append(fill);
    info.append(l1, track);
    const stand = button('dc-round glass', T.stand);
    stand.append(strokeIcon(18, ICON_STAND, 2.2));
    stand.addEventListener('click', () => this.on.stand());
    top.append(pause, info, stand);
    this.stats = { count, bar: fill };
    const wrap = node('div', 'dc-lanes');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', '5 làn nốt');
    CUNG.forEach((name, i) => {
      const lane = button('dc-lane', `Làn ${name}`);
      lane.style.left = `calc(${i} * (var(--lane-w) + var(--lane-gap)))`;
      lane.append(node('span', 'dc-lane-string'), node('span', 'dc-target'), node('span', 'dc-lane-name', name), keyCap(LOW_KEYS[i]));
      lane.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.on.lane(i);
      });
      wrap.append(lane);
    });
    wrap.append(node('span', 'dc-hitline'));
    this.lanes = wrap;
    return [top, wrap];
  }

  private result(v: Extract<DanView, { mode: 'ketqua' }>): HTMLElement {
    const sec = node('section', 'dc-result');
    sec.setAttribute('aria-label', 'Kết quả bài');
    const badge = node('span', 'dc-badge');
    badge.append(qinIcon(28));
    const name = node('span', 'dc-badge-name', v.name);
    const head = node('div', 'dc-res-head');
    head.append(node('span', 'dc-rank', v.rank), node('span', 'dc-pct', `${v.pct} %`));
    const counts = node('div', 'dc-counts');
    const cell = (n: number, label: string, cls: string): HTMLElement => {
      const c = node('div', `dc-cell ${cls}`);
      c.append(node('b', '', String(n)), node('span', '', label));
      return c;
    };
    counts.append(cell(v.hay, T.hay, 'hay'), cell(v.duoc, T.duoc, 'duoc'), cell(v.miss, T.miss, 'miss'));
    const reward = node('div', 'dc-reward');
    if (v.reward?.kind === 'coins') reward.append(coinIcon(20), T.reward(v.reward.n));
    else if (v.reward) {
      reward.classList.add('off');
      reward.append(v.reward.kind === 'song' ? T.songRewarded : T.capped);
    }
    const btns = node('div', 'dc-btns');
    btns.append(
      this.pill(strokeIcon(18, ICON_AGAIN, 2.2), T.again, () => this.on.again(), 'dc-again'),
      this.pill(strokeIcon(16, ICON_LIST, 2.2), T.other, () => this.on.songs(), 'dc-other'),
    );
    const stand = button('dc-square', T.stand);
    stand.append(strokeIcon(20, ICON_STAND, 2.2));
    stand.addEventListener('click', () => this.on.stand());
    btns.append(stand);
    sec.append(badge, name, head, counts, reward, btns);
    return sec;
  }
}
