/** Nội dung một bài học chữ Hán, gắn với một vùng trong sân. */
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

/** Nội dung vùng (chữ trên thẻ, bài học) — không có vị trí; vị trí do nhà trong đặc tả cảnh quyết. */
export interface ZoneContent {
  id: string;
  eyebrow: string;
  /** tiêu đề thẻ = before + chữ Hán (tô màu) + after */
  title: { before: string; han: string; after: string };
  /** chữ trên nút chính */
  go: string;
  lesson: Lesson;
}

export const ZONE_CONTENT: ZoneContent[] = [
  {
    id: 'lop-hsk3',
    eyebrow: 'Tùng tùng tùng! Giờ giảng',
    title: { before: 'Thầy giảng chữ ', han: '快', after: ' ở giảng đường' },
    go: 'Vào nghe giảng',
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
    eyebrow: 'Thư viện đang mở',
    title: { before: 'Ôn lại chữ ', han: '書', after: ' trong thư viện' },
    go: 'Vào đọc sách',
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

/** Vùng tròn trên sân: người chơi bước vào thì hiện thẻ mời. */
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
    else problems.push(`vùng "${c.id}": không nhà nào có zone.id này — thẻ mời sẽ không hiện`);
  }
  const known = new Set(content.map((c) => c.id));
  for (const a of anchors) if (!known.has(a.id)) problems.push(`zone.id "${a.id}": chưa có nội dung bài học trong code`);
  return { zones, problems };
}
