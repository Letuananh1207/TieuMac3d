import { chatLength, MAX_CHAT_CHARS, normalizeChat, type ChatMessage, type SendCheck } from '../chat/chatMessage';
import { collapsedVisible } from '../chat/chatChannel';
import { fillChatText, h, speakerName } from './chatText';
import './chat.css';

/** Đếm chữ hiện từ số này (thiết kế 2026-11-14.1). */
const COUNT_FROM = 50;
const ICON = 'http://www.w3.org/2000/svg';

function icon(size: number, paths: string[], width = 2): SVGSVGElement {
  const svg = document.createElementNS(ICON, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', String(width));
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const d of paths) {
    const p = document.createElementNS(ICON, 'path');
    p.setAttribute('d', d);
    svg.append(p);
  }
  return svg;
}

function clock(at: number): string {
  const d = new Date(at * 1000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export interface ChatPanelHost {
  /** Gửi câu đang gõ; trả về kết quả kiểm R-CHAT-1. */
  send(raw: string): SendCheck;
  /** Còn bao nhiêu giây mới gửi tiếp được (0 = gửi được). */
  waitLeft(): number;
  /** Ô nhập mở / đóng (main: ẩn joystick, cụm nút; phím không điều khiển). */
  onOpenChange(open: boolean): void;
}

/**
 * Trò chuyện kênh chung — thiết kế 2026-11-14.1: nút "Trò chuyện", khung thu gọn (3 tin cuối, không bắt chạm),
 * khung mở rộng + ô nhập sát bàn phím. Gửi xong đóng ô nhập (R-CHAT-3). DOM dựng bằng createElement.
 */
export class ChatPanel {
  private readonly root = h('div');
  private readonly btnWrap = h('div', '', '');
  private readonly feed = h('div');
  private readonly box = h('section');
  private readonly list = h('ol', 'cx-list');
  private readonly scroller = h('div', 'cx-scroll');
  private readonly empty = h('div', 'cx-empty');
  private readonly pill = h('button', 'cx-new');
  private readonly form = h('form');
  private readonly field = h('label', 'cx-field');
  private readonly input = h('input');
  private readonly count = h('span', 'cx-count');
  private readonly sendBtn = h('button', 'cx-send');
  private readonly spinner = icon(18, ['M12 3a9 9 0 0 1 8.5 6'], 3);
  private readonly note = h('div', 'cx-note');
  private lastAt: number | undefined;
  private unread = 0;
  private open = false;
  private feedShown = false;
  private hiddenNow = false;

  constructor(private readonly host: ChatPanelHost) {
    this.root.id = 'chat';
    document.body.append(this.root);

    // nút "Trò chuyện" trên cụm hành động
    this.btnWrap.id = 'chatBtn';
    const btn = h('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Trò chuyện');
    btn.append(icon(24, ['M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M8 10h8M8 13h5']));
    btn.addEventListener('click', () => this.show());
    const key = h('kbd', 'key', 'Enter');
    key.setAttribute('aria-hidden', 'true');
    this.btnWrap.append(btn, h('span', 'lbl', 'Trò chuyện'), key);

    // khung thu gọn
    this.feed.id = 'chatFeed';
    this.feed.setAttribute('aria-label', 'Kênh chung, 3 tin gần nhất');

    // khung mở rộng
    this.box.id = 'chatBox';
    this.box.setAttribute('aria-label', 'Kênh chung');
    const head = h('header', 'cx-head');
    const dot = h('span', 'dot');
    dot.setAttribute('aria-hidden', 'true');
    const han = h('span', 'han', '傳音');
    han.lang = 'zh';
    const close = h('button', 'cx-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Đóng kênh chung');
    close.append(icon(18, ['M6 6l12 12M18 6L6 18'], 2.4));
    close.addEventListener('click', () => this.hide());
    head.append(dot, h('h2', '', 'Kênh chung'), han, h('span', 'grow'), close);
    this.empty.append(h('b', '', 'Chưa ai lên tiếng…'), h('span', '', 'Hãy chào đồng môn một câu.'));
    this.pill.type = 'button';
    this.pill.hidden = true;
    this.pill.addEventListener('click', () => this.toBottom());
    this.scroller.append(this.list);
    this.scroller.addEventListener('scroll', () => {
      if (this.atBottom()) this.setUnread(0);
    });
    const body = h('div', 'cx-body');
    body.append(this.scroller, this.empty, this.pill);
    this.box.append(head, body);

    // ô nhập + Gửi
    this.form.id = 'chatForm';
    this.form.setAttribute('aria-label', 'Gửi tin lên kênh chung');
    this.input.type = 'text';
    this.input.placeholder = 'Nói gì đó với đồng môn…';
    this.input.setAttribute('aria-label', 'Tin nhắn');
    this.input.autocomplete = 'off';
    this.input.enterKeyHint = 'send';
    this.input.addEventListener('input', () => this.refreshInput());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    });
    this.field.append(this.input, this.count);
    this.sendBtn.type = 'submit';
    this.spinner.classList.add('spin');
    this.sendBtn.append(icon(18, ['M4 12l16-8-6 16-2-6-8-2z'], 2.2), this.spinner, document.createTextNode('Gửi'));
    const row = h('div', 'cx-row');
    row.append(this.field, this.sendBtn);
    this.form.append(row, this.note);
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });

    this.root.append(this.btnWrap, this.feed, this.box, this.form);
    this.box.hidden = true;
    this.form.hidden = true;
    this.renderEmpty();
  }

  get isOpen(): boolean {
    return this.open;
  }

  /** Mở ô nhập + khung mở rộng (nút "Trò chuyện", phím Enter). */
  show(): void {
    if (this.open || this.hiddenNow) return;
    this.open = true;
    this.box.hidden = false;
    this.form.hidden = false;
    this.root.classList.add('open');
    this.host.onOpenChange(true);
    this.refreshInput();
    this.toBottom();
    this.input.focus();
  }

  /** Đóng ô nhập (×, chạm cảnh, Esc, nút quay lại). Trả về `true` nếu vừa đóng. */
  hide(): boolean {
    if (!this.open) return false;
    this.open = false;
    this.input.blur();
    this.box.hidden = true;
    this.form.hidden = true;
    this.root.classList.remove('open');
    this.host.onOpenChange(false);
    return true;
  }

  /** Tin mới trên kênh. */
  add(msg: ChatMessage): void {
    this.lastAt = msg.at;
    const stick = this.atBottom();
    const li = h('li', `cx-msg cx-${msg.speaker.kind}`);
    const top = h('div', 'cx-who');
    top.append(speakerName(msg.speaker), h('span', 'cx-time', clock(msg.at)));
    const say = h('div', 'cx-say');
    fillChatText(say, msg.text);
    li.append(top, say);
    this.list.append(li);
    while (this.list.children.length > 50) this.list.firstElementChild?.remove();
    this.renderEmpty();
    if (stick || !this.open) this.toBottom();
    else this.setUnread(this.unread + 1);

    const line = h('div', `cf-line cf-${msg.speaker.kind}`);
    line.append(speakerName(msg.speaker), ' ');
    const text = h('span');
    fillChatText(text, msg.text);
    line.append(text);
    this.feed.append(line);
    while (this.feed.children.length > 3) this.feed.firstElementChild?.remove();
  }

  /** Mỗi khung: `hidden` = bận (bài học, thoại, bàn chơi, bản đồ, màn tải) → ẩn nút + khung, đóng ô nhập. */
  update(now: number, hidden: boolean): void {
    if (hidden !== this.hiddenNow) {
      this.hiddenNow = hidden;
      this.root.classList.toggle('busy', hidden);
      if (hidden) this.hide();
    }
    const feed = !hidden && collapsedVisible(this.lastAt, now);
    if (feed !== this.feedShown) {
      this.feedShown = feed;
      this.feed.classList.toggle('show', feed);
    }
    if (this.open) {
      this.refreshWait();
      // bàn phím máy: thanh nhập bám mép trên bàn phím (iOS thu nhỏ visualViewport, Android thu nhỏ cửa sổ)
      const vv = window.visualViewport;
      const kb = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      this.root.style.setProperty('--kb', `${kb}px`);
      // bàn phím hạ (máy tính, bàn phím rời) → thanh nhập chừa vùng bị che dưới đáy
      this.root.style.setProperty('--form-sa', kb > 0 ? '0px' : 'var(--sa-bottom)');
    }
  }

  private submit(): void {
    const r = this.host.send(this.input.value);
    if (r.ok) {
      this.input.value = '';
      this.hide(); // gửi xong → đóng ô nhập (R-CHAT-3)
      return;
    }
    this.refreshInput(r.reason);
  }

  private refreshInput(reason?: 'rong' | 'qua-dai' | 'cho'): void {
    const n = chatLength(normalizeChat(this.input.value));
    const tooLong = n > MAX_CHAT_CHARS;
    this.count.hidden = n < COUNT_FROM;
    this.count.textContent = `${n}/${MAX_CHAT_CHARS}`;
    this.field.classList.toggle('bad', tooLong);
    this.form.classList.toggle('empty', n === 0);
    this.note.classList.toggle('bad', tooLong);
    this.note.textContent = tooLong ? 'Quá dài — tối đa 60 chữ' : '';
    this.note.setAttribute('role', tooLong ? 'alert' : 'status');
    if (reason === 'cho') this.refreshWait();
    this.sendBtn.disabled = n === 0 || tooLong || this.host.waitLeft() > 0;
  }

  private refreshWait(): void {
    const waiting = this.host.waitLeft() > 0;
    if (waiting === this.form.classList.contains('wait')) return;
    this.form.classList.toggle('wait', waiting);
    if (waiting && !this.note.classList.contains('bad')) this.note.textContent = 'Chờ chút rồi gửi tiếp…';
    if (!waiting) this.refreshInput();
  }

  private renderEmpty(): void {
    this.empty.hidden = this.list.children.length > 0;
  }

  private atBottom(): boolean {
    const s = this.scroller;
    return s.scrollHeight - s.scrollTop - s.clientHeight < 8;
  }

  private toBottom(): void {
    this.scroller.scrollTop = this.scroller.scrollHeight;
    this.setUnread(0);
  }

  private setUnread(n: number): void {
    this.unread = n;
    this.pill.hidden = n === 0;
    if (n > 0) {
      this.pill.replaceChildren(document.createTextNode(`Tin mới · ${n}`), icon(14, ['M12 5v14M6 13l6 6 6-6'], 2.6));
    }
  }
}
