/** Nội dung một bài học chữ Hán, gắn với một vùng trong sân. */
export interface Lesson {
  han: string;
  pinyin: string;
  meaning: string;
  /** các dòng phụ: [nhãn, giá trị] */
  info: [string, string][];
}

/** Vùng tròn trên sân: người chơi bước vào thì hiện thẻ mời. */
export interface Zone {
  id: string;
  x: number;
  z: number;
  r: number;
  eyebrow: string;
  /** tiêu đề thẻ = before + chữ Hán (tô màu) + after */
  title: { before: string; han: string; after: string };
  /** chữ trên nút chính */
  go: string;
  lesson: Lesson;
}

export const ZONES: Zone[] = [
  {
    id: 'lop-hsk3',
    x: 0,
    z: -6.4,
    r: 2.6,
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
    x: -8.6,
    z: 4,
    r: 2.4,
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
