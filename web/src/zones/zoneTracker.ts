import type { PointXZ } from '../collision/colliders';
import type { Zone } from './zones';

/** Theo dõi người chơi đang đứng trong vùng nào; báo khi vào / ra. */
export class ZoneTracker {
  current: Zone | null = null;

  constructor(
    private readonly zones: Zone[],
    private readonly onChange: (zone: Zone | null) => void,
  ) {}

  update(pos: PointXZ): void {
    const z = this.zones.find((zone) => Math.hypot(pos.x - zone.x, pos.z - zone.z) < zone.r) ?? null;
    if (z === this.current) return;
    this.current = z;
    this.onChange(z);
  }
}
