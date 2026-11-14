import type { MoveInput } from '../player/controller';

/** Hành động bằng phím (R-DIEU-6, R-DIEU-7) — trên điện thoại là nút (chờ thiết kế). */
export type KeyAction = 'jump' | 'bow' | 'sit' | 'seat' | 'back' | 'chat';

const ACTION_KEYS: Record<string, KeyAction> = { ' ': 'jump', f: 'bow', c: 'sit', e: 'seat', escape: 'back', enter: 'chat' };

/** Đang gõ chữ (ô nhập trò chuyện…) → phím không điều khiển nhân vật (R-CHAT, thiết kế 2026-11-14.9). */
function typingIn(t: EventTarget | null): boolean {
  return t instanceof HTMLElement && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
}

/** WASD / phím mũi tên (chạy; giữ Shift = đi bộ — R-DIEU-5), Space nhảy, F chào, C ngồi thiền, Enter trò chuyện — thử trên máy tính. */
export class Keyboard {
  private readonly keys: Record<string, boolean> = {};

  constructor(onAction?: (a: KeyAction) => void) {
    window.addEventListener('keydown', (e) => {
      if (typingIn(e.target)) {
        for (const k of Object.keys(this.keys)) this.keys[k] = false; // thả mọi phím đang giữ
        return;
      }
      const key = e.key.toLowerCase();
      this.keys[key] = true;
      const act = ACTION_KEYS[key];
      if (act && !e.repeat && onAction) {
        e.preventDefault(); // Space không cuộn trang
        onAction(act);
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  /** Ghi đè lên `out` nếu có phím đang giữ. */
  apply(out: MoveInput): void {
    const k = this.keys;
    if (k.w || k.arrowup) out.y = -1;
    if (k.s || k.arrowdown) out.y = 1;
    if (k.a || k.arrowleft) out.x = -1;
    if (k.d || k.arrowright) out.x = 1;
    if (k.shift && (out.x || out.y)) {
      // giữ Shift: đi bộ (đẩy ~60 %) thay vì chạy
      out.x *= 0.6;
      out.y *= 0.6;
    }
  }
}
