/**
 * Chuyển nhà từ bản có ô (trước V-69) sang món đặt tự do (R-NHA-3): bảng **12 ô cũ đóng băng** (chép từ `design/scene/nha-ta.json` /
 * `nha-ta-trong.json` lúc bỏ ô — không đọc đặc tả, đặc tả đã bỏ `decorSlots`) + đổi `placed` (mã ô → mã vật) thành món đứng đúng chỗ
 * ô, làm tròn lưới 0,5 m, cùng hướng. Món đè chỗ nay không hợp lệ được dời / cất khi vào cảnh (`decorPlace.ts` `settleScene`). Số
 * cái đã tính đủ ở Flutter (`migrateOwnedCounts`) / ví thử → không mất cái nào. Thuần.
 */
import { decorItem, placedCount, type DecorCounts, type PlacedDecor } from './decor';
import { snap } from './decorPlace';

export interface LegacySlot {
  id: string;
  scene: 'nha-ta' | 'nha-ta-trong';
  x: number;
  z: number;
  rotY: number;
}

/** 12 ô cũ (9 ở sân, 3 ở gian trong) — đóng băng, không sửa. */
export const LEGACY_SLOTS: readonly LegacySlot[] = [
  { id: 'san-1', scene: 'nha-ta', x: -19, z: -3.2, rotY: 0 },
  { id: 'san-2', scene: 'nha-ta', x: -11, z: -3.2, rotY: 0 },
  { id: 'san-3', scene: 'nha-ta', x: -4, z: 8, rotY: 0 },
  { id: 'vuon-1', scene: 'nha-ta', x: -6, z: -13, rotY: 0 },
  { id: 'vuon-2', scene: 'nha-ta', x: -5.5, z: -7, rotY: 0 },
  { id: 'vuon-3', scene: 'nha-ta', x: -9, z: 6, rotY: 0 },
  { id: 'vuon-4', scene: 'nha-ta', x: 19.5, z: 0, rotY: 0 },
  { id: 'vuon-5', scene: 'nha-ta', x: 11, z: 2, rotY: 0 },
  { id: 'vuon-6', scene: 'nha-ta', x: 6, z: 4, rotY: 0 },
  { id: 'trong-1', scene: 'nha-ta-trong', x: -4, z: -3.6, rotY: 0 },
  { id: 'trong-2', scene: 'nha-ta-trong', x: 0, z: -3.6, rotY: 0 },
  { id: 'trong-3', scene: 'nha-ta-trong', x: 4, z: -3.6, rotY: 0 },
];

/**
 * Ô cũ → món (R-NHA-3): theo thứ tự bảng, mỗi ô có vật thành một món ở đúng chỗ ô (lưới 0,5) nếu vật còn trong danh mục, hợp nơi
 * của ô và số món chưa vượt số cái [owned]; ô lạ (bỏ từ trước) bỏ qua. Nối sau [items] đã có.
 */
export function migrateHome(items: readonly PlacedDecor[], placed: Readonly<Record<string, string>>, owned: DecorCounts): PlacedDecor[] {
  const out = [...items];
  for (const s of LEGACY_SLOTS) {
    const id = placed[s.id];
    const it = id ? decorItem(id) : undefined;
    if (!it || (it.where === 'trong') !== (s.scene === 'nha-ta-trong')) continue;
    if (placedCount(out, it.id) >= (owned[it.id] ?? 0)) continue;
    out.push({ item: it.id, scene: s.scene, x: snap(s.x), z: snap(s.z), rot: s.rotY });
  }
  return out;
}
