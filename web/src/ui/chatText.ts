import type { Speaker } from '../chat/chatMessage';

/** Một đoạn chữ Hán liền nhau. */
const HAN_RUN = /\p{Script=Han}+/gu;

/** Tạo phần tử kèm class (DOM bằng createElement — không innerHTML). */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/** Ghi câu vào `el`; chữ Hán trong câu bọc `<span lang="zh" class="han">` (Noto Serif SC 700 — thiết kế 2026-11-14.1). */
export function fillChatText(el: HTMLElement, text: string): void {
  el.replaceChildren();
  let last = 0;
  for (const m of text.matchAll(HAN_RUN)) {
    const i = m.index ?? 0;
    if (i > last) el.append(text.slice(last, i));
    const han = h('span', 'han', m[0]);
    han.lang = 'zh';
    el.append(han);
    last = i + m[0].length;
  }
  if (last < text.length) el.append(text.slice(last));
}

/** Tên người nói: mình → "Ta" (chuỗi `chatSelf`); NPC → tên tiếng Việt (tên nhân vật không kèm chữ Hán — người dùng 2026-11-14). */
export function speakerName(s: Speaker): HTMLElement {
  const b = h('b', s.kind === 'other' ? '' : 'jade', s.kind === 'player' ? 'Ta' : s.name);
  if (s.han) {
    const han = h('span', 'han', s.han);
    han.lang = 'zh';
    b.append(' ', han);
  }
  return b;
}
