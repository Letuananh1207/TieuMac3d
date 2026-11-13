/**
 * Vòng trận truyền tống (R-HANH-2): bước **từ ngoài vào** vòng (tâm nhân vật cách tâm vòng dưới `trigger` m) rồi ở
 * trong đủ `seconds` giây thì báo truyền tống. Ra khỏi vòng trước đó → huỷ (độ nạp tụt dần về 0 cho hiệu ứng tắt dần).
 * Đứng sẵn trong vòng lúc xuất hiện thì không tính — phải ra rồi vào lại. Thuần: không three, không DOM.
 */
/** Độ nạp tụt về 0 trong bấy nhiêu giây khi ra khỏi vòng (chỉ là hiệu ứng). */
const FADE_SECONDS = 0.5;

export class RingCharge {
  /** đã ra khỏi vòng ít nhất một lần kể từ lúc xuất hiện / truyền tống */
  private armed: boolean;
  private fired = false;
  /** số giây đã ở trong vòng lần này (ra khỏi vòng → về 0: huỷ hẳn, vào lại phải đủ lại từ đầu) */
  private held = 0;
  /** độ nạp cho hiệu ứng, 0 → 1 */
  charge = 0;

  constructor(
    private readonly center: { x: number; z: number },
    private readonly trigger: number,
    private readonly seconds: number,
    start: { x: number; z: number },
  ) {
    this.armed = !this.inside(start);
  }

  private inside(p: { x: number; z: number }): boolean {
    return Math.hypot(p.x - this.center.x, p.z - this.center.z) < this.trigger;
  }

  /** Sau khi đóng bản đồ: chờ ra khỏi vòng rồi vào lại mới nạp tiếp (R-HANH-2). */
  rearm(): void {
    this.fired = false;
    this.armed = false;
    this.held = 0;
    this.charge = 0;
  }

  /** Gọi mỗi khung hình. `true` đúng một lần: lúc nạp đầy (truyền tống). `enabled = false` (không có nơi đến) → không nạp. */
  update(p: { x: number; z: number }, dt: number, enabled = true): boolean {
    if (this.fired) return false;
    if (!this.inside(p)) {
      this.armed = true;
      this.held = 0;
      this.charge = Math.max(0, this.charge - dt / FADE_SECONDS);
      return false;
    }
    if (!this.armed || !enabled) return false;
    this.held += dt;
    this.charge = Math.min(1, this.held / this.seconds);
    if (this.held < this.seconds) return false;
    this.fired = true;
    return true;
  }
}
