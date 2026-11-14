/**
 * Bong bóng trên đầu (R-CHAT-2): mỗi người tối đa một bong bóng, sống 6 giây, tin mới thay tin cũ.
 * Chỉ giữ trạng thái; vẽ + chiếu lên màn là việc của `ui/` (lọc xa / sau camera bằng `bubbleVisible`).
 */
import type { ChatMessage } from './chatMessage';

export const BUBBLE_SECONDS = 6;
/** Người nói xa camera hơn số này (m) → không vẽ bong bóng. */
export const BUBBLE_MAX_DIST = 25;
/** Hiện: phóng 90 → 100 % trong chừng này giây; mờ dần trong giây cuối (thiết kế 2026-11-14.1). */
export const BUBBLE_GROW_S = 0.15;
export const BUBBLE_FADE_S = 1;

/** Độ đậm + cỡ của bong bóng theo thời gian còn lại. */
export function bubbleLook(b: Bubble, now: number): { opacity: number; scale: number } {
  const age = now - (b.until - BUBBLE_SECONDS);
  const left = b.until - now;
  const grow = Math.min(1, Math.max(0, age / BUBBLE_GROW_S));
  return { opacity: Math.min(1, Math.max(0, left / BUBBLE_FADE_S)), scale: 0.9 + 0.1 * grow };
}

export interface Bubble {
  speakerId: string;
  text: string;
  until: number;
}

export class BubbleTimer {
  private readonly bubbles = new Map<string, Bubble>();

  /** Tin mới → bong bóng của người nói (thay bong bóng cũ, đếm lại từ giờ gửi). */
  push(msg: ChatMessage): void {
    this.bubbles.set(msg.speaker.id, { speakerId: msg.speaker.id, text: msg.text, until: msg.at + BUBBLE_SECONDS });
  }

  /** Bong bóng còn sống lúc `now`; bong bóng hết hạn bị bỏ. */
  active(now: number): Bubble[] {
    const out: Bubble[] = [];
    for (const [id, b] of this.bubbles) {
      if (now >= b.until) this.bubbles.delete(id);
      else out.push(b);
    }
    return out;
  }
}

/**
 * Có vẽ bong bóng không: `dist` = khoảng cách người nói → camera (m), `inFront` = người nói ở trước camera.
 */
export function bubbleVisible(dist: number, inFront: boolean): boolean {
  return inFront && dist <= BUBBLE_MAX_DIST;
}
