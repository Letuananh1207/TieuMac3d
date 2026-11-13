/**
 * Bản đồ truyền tống (R-HANH-2, thiết kế 2026-11-13.9): 7 nơi trên tấm giấy `design/scene/ban-do/ban-do.json`
 * (toạ độ px theo ảnh 2048 × 1152), trạng thái từng nơi, nơi nào bị chạm. Thuần: không three, không DOM.
 */

/** Một nơi trên giấy: tâm (x, y) px, vùng chạm bán kính r px. */
export interface MapPlace {
  id: string;
  han: string;
  ten: string;
  x: number;
  y: number;
  r: number;
}

/** `mo` đã mở, đi được · `oDay` đang ở đây · `sapMo` mở nhưng chưa có cảnh · `khoa` chưa mở. */
export type PlaceState = 'mo' | 'oDay' | 'sapMo' | 'khoa';

export interface JourneyMapData {
  width: number;
  height: number;
  places: MapPlace[];
  /** số đo lớp trạng thái (`trangThai` của ban-do.json) — `scene/banDo.ts` vẽ theo */
  style: Record<string, unknown>;
}

/** Nơi trên bản đồ → mã cảnh: tông môn là `tong-mon` (scene/loadSpec.ts `HOME_SCENE`), vùng trùng mã. */
const HOME_PLACE = 'van-uyen';

// Vite đọc file lúc build (glob: chưa có file thì rỗng, không lỗi build) — như design/scene/scene.json.
const found = import.meta.glob('../../../design/scene/ban-do/ban-do.json', { eager: true, import: 'default' });
const raw = Object.values(found)[0] as { rong?: number; cao?: number; noi?: MapPlace[]; trangThai?: Record<string, unknown> } | undefined;

export const JOURNEY_MAP: JourneyMapData = {
  width: raw?.rong ?? 2048,
  height: raw?.cao ?? 1152,
  places: (raw?.noi ?? []).filter(
    (p) => typeof p.id === 'string' && [p.x, p.y, p.r].every((v) => typeof v === 'number') && typeof p.ten === 'string',
  ),
  style: raw?.trangThai ?? {},
};

/** Mã cảnh của một nơi trên bản đồ. */
export function placeScene(placeId: string, home: string): string {
  return placeId === HOME_PLACE ? home : placeId;
}

/**
 * Trạng thái từng nơi (R-HANH-1/2). `here` = mã cảnh đang ở; `open` = vùng đã mở (Flutter); `hasScene` = vùng có cảnh.
 * Tông môn luôn mở.
 */
export function placeStates(
  places: MapPlace[],
  here: string,
  home: string,
  open: readonly string[],
  hasScene: ReadonlySet<string>,
): Record<string, PlaceState> {
  const out: Record<string, PlaceState> = {};
  for (const p of places) {
    const scene = placeScene(p.id, home);
    if (scene === here) out[p.id] = 'oDay';
    else if (scene === home) out[p.id] = 'mo';
    else if (!open.includes(scene)) out[p.id] = 'khoa';
    else out[p.id] = hasScene.has(scene) ? 'mo' : 'sapMo';
  }
  return out;
}

/** Nơi có vùng chạm chứa điểm (px, py) của giấy; nhiều nơi chồng nhau thì lấy nơi gần tâm nhất. */
export function placeAt(places: MapPlace[], px: number, py: number): MapPlace | null {
  let best: MapPlace | null = null;
  let bestD = Infinity;
  for (const p of places) {
    const d = Math.hypot(px - p.x, py - p.y);
    if (d < p.r && d < bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}
