/** Joystick ảo xuất hiện ngay chỗ ngón tay chạm (nửa trái màn hình). */
export class Joystick {
  /** pointerId đang giữ joystick; null = không ai giữ */
  id: number | null = null;
  /** -1..1, x sang phải, y xuống dưới */
  x = 0;
  y = 0;
  private ox = 0;
  private oy = 0;
  private static readonly RADIUS = 50;

  constructor(
    private readonly el: HTMLElement,
    private readonly knob: HTMLElement,
    private readonly ghost: HTMLElement,
  ) {}

  start(pointerId: number, clientX: number, clientY: number): void {
    this.id = pointerId;
    this.ox = clientX;
    this.oy = clientY;
    this.x = this.y = 0;
    this.el.style.left = `${clientX}px`;
    this.el.style.top = `${clientY}px`;
    this.el.hidden = false;
    this.ghost.hidden = true;
    this.knob.style.transform = '';
  }

  move(clientX: number, clientY: number): void {
    const R = Joystick.RADIUS;
    let dx = clientX - this.ox;
    let dy = clientY - this.oy;
    const m = Math.hypot(dx, dy);
    if (m > R) {
      dx = (dx / m) * R;
      dy = (dy / m) * R;
    }
    this.x = dx / R;
    this.y = dy / R;
    this.knob.style.transform = `translate(${dx}px,${dy}px)`;
  }

  end(): void {
    this.id = null;
    this.x = this.y = 0;
    this.el.hidden = true;
    this.ghost.hidden = false;
  }
}
