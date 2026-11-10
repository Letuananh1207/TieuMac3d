import type { MoveInput } from '../player/controller';

/** WASD / phím mũi tên, để thử nhanh trên máy tính. */
export class Keyboard {
  private readonly keys: Record<string, boolean> = {};

  constructor(onFirstInput: () => void) {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      onFirstInput();
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
  }
}
