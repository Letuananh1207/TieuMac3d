/**
 * Ảnh mặt NPC cho khung thoại (R-NPC-2): ưu tiên ảnh cận mặt `design/models/anh/<mã>-mat.png`, không có thì chân dung
 * `<mã>-chan-dung.png` (dự phòng), không có nữa → không ảnh. Vite chép ảnh vào bản build (chạy offline).
 */
const files = import.meta.glob(['../../../design/models/anh/*-mat.png', '../../../design/models/anh/*-chan-dung.png'], {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export type FaceKind = 'mat' | 'chan-dung';

/** Chọn ảnh mặt của NPC `npc` trong bảng `đường dẫn → url` (thuần, để test). */
export function pickFace(npc: string, urls: Record<string, string>): { url: string; kind: FaceKind } | undefined {
  for (const kind of ['mat', 'chan-dung'] as const) {
    const hit = Object.entries(urls).find(([p]) => p.endsWith(`/${npc}-${kind}.png`));
    if (hit) return { url: hit[1], kind };
  }
  return undefined;
}

/** Ảnh mặt NPC trong bản build. */
export function npcFace(npc: string): { url: string; kind: FaceKind } | undefined {
  return pickFace(npc, files);
}
