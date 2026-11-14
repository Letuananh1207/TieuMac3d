/**
 * Cổng đi bộ sang cảnh khác (R-HANH-4): tâm nhân vật bước **từ ngoài vào** vùng chữ nhật của cổng → báo sang ngay,
 * đúng một lần (không giữ như vòng trận). Xuất hiện / đứng sẵn trong vùng thì không tính — phải ra rồi vào lại; đang
 * bận (`enabled = false`: màn tải, bản đồ, thoại, trang trí…) mà ở trong vùng cũng phải ra rồi vào lại. Thuần.
 */
type XZ = readonly [number, number];

export class PortalTrigger {
  private readonly minX: number;
  private readonly maxX: number;
  private readonly minZ: number;
  private readonly maxZ: number;
  /** đã ở ngoài vùng ít nhất một lần kể từ lúc xuất hiện / lần bận gần nhất */
  private armed: boolean;
  private fired = false;

  constructor(area: { from: XZ; to: XZ }, start: { x: number; z: number }) {
    this.minX = Math.min(area.from[0], area.to[0]);
    this.maxX = Math.max(area.from[0], area.to[0]);
    this.minZ = Math.min(area.from[1], area.to[1]);
    this.maxZ = Math.max(area.from[1], area.to[1]);
    this.armed = !this.inside(start);
  }

  inside(p: { x: number; z: number }): boolean {
    return p.x >= this.minX && p.x <= this.maxX && p.z >= this.minZ && p.z <= this.maxZ;
  }

  /** Gọi mỗi khung hình. `true` đúng một lần: lúc bước vào vùng (sang cảnh). */
  update(p: { x: number; z: number }, enabled = true): boolean {
    if (this.fired) return false;
    if (!this.inside(p)) {
      this.armed = true;
      return false;
    }
    if (!enabled) this.armed = false;
    if (!this.armed) return false;
    this.fired = true;
    return true;
  }
}
