/**
 * Kênh chung (R-CHAT-1, R-CHAT-3). `ChatChannel` là hợp đồng: giờ chạy `LocalChannel` (trong máy, chưa có máy chủ);
 * khi có backend thì viết kênh mạng cùng hợp đồng, phần giao diện không đổi.
 */
import { checkSend, type ChatMessage, type SendCheck, type Speaker } from './chatMessage';

/** Số tin khung kênh chung giữ lại (R-CHAT-3). */
export const CHAT_HISTORY = 50;
/** Khung thu gọn im lặng chừng này giây (không tin mới) thì mờ hết (R-CHAT-3). */
export const PANEL_IDLE_S = 10;

/** Khung thu gọn có hiện không: có tin và tin cuối chưa quá `PANEL_IDLE_S` giây. */
export function collapsedVisible(lastAt: number | undefined, now: number): boolean {
  return lastAt !== undefined && now - lastAt < PANEL_IDLE_S;
}

export type ChatListener = (msg: ChatMessage) => void;

export interface ChatChannel {
  /** Gửi tin của `speaker` lúc `now` (giây). Không gửi được → lý do, không ai nhận gì. */
  send(speaker: Speaker, raw: string, now: number): SendCheck;
  /** Nghe tin mới (kể cả tin của chính mình). Trả về hàm huỷ nghe. */
  subscribe(listener: ChatListener): () => void;
  /** Tin gần nhất, cũ → mới, tối đa `CHAT_HISTORY`. */
  history(): readonly ChatMessage[];
}

export class LocalChannel implements ChatChannel {
  private readonly messages: ChatMessage[] = [];
  private readonly listeners = new Set<ChatListener>();
  private readonly lastSent = new Map<string, number>();

  send(speaker: Speaker, raw: string, now: number): SendCheck {
    const check = checkSend(raw, now, this.lastSent.get(speaker.id));
    if (!check.ok) return check;
    this.lastSent.set(speaker.id, now);
    const msg: ChatMessage = { speaker, text: check.text, at: now };
    this.messages.push(msg);
    if (this.messages.length > CHAT_HISTORY) this.messages.splice(0, this.messages.length - CHAT_HISTORY);
    for (const l of [...this.listeners]) l(msg);
    return check;
  }

  subscribe(listener: ChatListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  history(): readonly ChatMessage[] {
    return this.messages;
  }
}
