import type { PointXZ } from '../collision/colliders';

/** Một khu có tên: hình chữ nhật từ góc `from` tới góc `to` ([x, z]). Trùng hình với `scene/spec` `AreaSpec`. */
export interface Area {
  name: string;
  from: [number, number];
  to: [number, number];
}

/** Tên nơi + các khu (đặc tả cảnh `site`). */
export interface Site {
  name: string;
  areas: Area[];
}

function inside(a: Area, p: PointXZ): boolean {
  const [x1, z1] = a.from;
  const [x2, z2] = a.to;
  return p.x >= Math.min(x1, x2) && p.x <= Math.max(x1, x2) && p.z >= Math.min(z1, z2) && p.z <= Math.max(z1, z2);
}

/**
 * Chữ chip HUD cho vị trí `p` (R-HUD-1): trong một khu → "<tên nơi> · <tên khu>", ngoài mọi khu → "<tên nơi>".
 * Khu chồng nhau → khu khai báo trước. Ranh giới tính là ở trong khu.
 */
export function placeLabel(site: Site, p: PointXZ): string {
  const area = site.areas.find((a) => inside(a, p));
  return area ? `${site.name} · ${area.name}` : site.name;
}

/** Theo dõi chữ chip theo vị trí người chơi; chỉ báo khi chữ đổi. */
export class AreaTracker {
  private current = '';

  constructor(
    private readonly site: Site,
    private readonly onChange: (label: string) => void,
  ) {}

  update(pos: PointXZ): void {
    const label = placeLabel(this.site, pos);
    if (label === this.current) return;
    this.current = label;
    this.onChange(label);
  }
}
