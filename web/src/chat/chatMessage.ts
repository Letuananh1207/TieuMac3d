/**
 * Tin nhắn kênh chung (R-CHAT-1): chuẩn hoá, kiểm độ dài, chống gửi dồn.
 * Thuần — không three, không DOM.
 */

/** Độ dài tối đa của một tin, đếm theo ký tự (chữ Hán / chữ có dấu = 1). */
export const MAX_CHAT_CHARS = 60;
/** Khoảng cách tối thiểu giữa hai tin của cùng người (giây). */
export const MIN_SEND_GAP_S = 1.5;

/** Người nói trên kênh: `id` duy nhất (người chơi: 'player', NPC: mã NPC). */
export interface Speaker {
  id: string;
  name: string;
  /** chữ Hán cạnh tên (NPC), vd. 小墨 */
  han?: string;
  kind: 'player' | 'npc' | 'other';
}

export interface ChatMessage {
  speaker: Speaker;
  text: string;
  /** Giờ gửi, giây theo đồng hồ của kênh. */
  at: number;
}

export type SendCheck = { ok: true; text: string } | { ok: false; reason: 'rong' | 'qua-dai' | 'cho' };

/** Bỏ khoảng trắng hai đầu, gộp khoảng trắng liền nhau thành một. */
export function normalizeChat(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

/** Số ký tự theo cách người đọc thấy (code point, NFC). */
export function chatLength(text: string): number {
  return Array.from(text.normalize('NFC')).length;
}

/**
 * Kiểm một tin trước khi gửi. `lastSentAt` = giờ gửi tin trước của người đó (chưa gửi → undefined).
 */
export function checkSend(raw: string, now: number, lastSentAt: number | undefined): SendCheck {
  const text = normalizeChat(raw).normalize('NFC');
  if (text.length === 0) return { ok: false, reason: 'rong' };
  if (chatLength(text) > MAX_CHAT_CHARS) return { ok: false, reason: 'qua-dai' };
  if (lastSentAt !== undefined && now - lastSentAt < MIN_SEND_GAP_S - 1e-9) return { ok: false, reason: 'cho' };
  return { ok: true, text };
}
