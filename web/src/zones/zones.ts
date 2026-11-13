/** Nội dung một bài học chữ Hán, gắn với một vật học trong nhà (R-VUNG-1). */
export interface Lesson {
  han: string;
  pinyin: string;
  meaning: string;
  /** các dòng phụ: [nhãn, giá trị] */
  info: [string, string][];
}

/** Vị trí vùng: tâm (x, z) và bán kính r. Lấy từ nhà trong đặc tả cảnh (`scene/spec.ts` → `zoneAnchors`). */
export interface ZoneAnchor {
  id: string;
  x: number;
  z: number;
  r: number;
}

/**
 * Nội dung vùng (bài học, nhà chứa nó) — không có vị trí; vị trí do nhà trong đặc tả cảnh quyết.
 * `interior` trùng `scene/spec` `InteriorKind`: lớp học (bảng đen, thầy) · thư viện (kệ sách, án đọc).
 */
export interface ZoneContent {
  id: string;
  /** kiểu nội thất của nhà neo vùng này */
  interior: 'lop-hoc' | 'thu-vien';
  /** chữ trên nút học nổi: "<action> <chữ Hán>" (vd. "Học chữ 快") */
  action: string;
  lesson: Lesson;
}

export const ZONE_CONTENT: ZoneContent[] = [
  {
    id: 'lop-hsk3',
    interior: 'lop-hoc',
    action: 'Học chữ',
    lesson: {
      han: '快',
      pinyin: 'kuài',
      meaning: 'nhanh; vui vẻ',
      info: [
        ['Bộ', '忄 tâm đứng'],
        ['Nét', '7'],
        ['Từ', '快乐 kuàilè · vui vẻ'],
        ['HSK', '2'],
      ],
    },
  },
  {
    id: 'thu-vien',
    interior: 'thu-vien',
    action: 'Ôn chữ',
    lesson: {
      han: '書',
      pinyin: 'shū',
      meaning: 'sách; viết',
      info: [
        ['Giản thể', '书'],
        ['Nét', '10'],
        ['Từ', '图书馆 túshūguǎn · thư viện'],
        ['HSK', '1'],
      ],
    },
  },
];

/** Vùng tròn quanh điểm học trong nhà: người chơi bước vào thì hiện nút học trên vật (R-VUNG-1). */
export type Zone = ZoneContent & ZoneAnchor;

/**
 * Ghép nội dung với vị trí theo `id`. Nội dung không có nhà nào neo, hoặc vị trí không có nội dung,
 * thì bỏ và ghi vào `problems` (Canvas 3D hiện ra để phiên thiết kế sửa).
 */
export function placeZones(content: ZoneContent[], anchors: ZoneAnchor[]): { zones: Zone[]; problems: string[] } {
  const problems: string[] = [];
  const byId = new Map(anchors.map((a) => [a.id, a]));
  const zones: Zone[] = [];
  for (const c of content) {
    const a = byId.get(c.id);
    if (a) zones.push({ ...c, x: a.x, z: a.z, r: a.r });
    else problems.push(`vùng "${c.id}": không nhà nào có zone.id này — nút học sẽ không hiện`);
  }
  const known = new Set(content.map((c) => c.id));
  for (const a of anchors) if (!known.has(a.id)) problems.push(`zone.id "${a.id}": chưa có nội dung bài học trong code`);
  return { zones, problems };
}
