/** Một hàng sổ từ: [chữ, pinyin, nghĩa, câu ví dụ, pinyin câu, nghĩa câu] — dạng mảng cho file dữ liệu gọn. */
export type WordRow = readonly [string, string, string, string, string, string];

/** Một trang sổ từ (R-SACH-3) — dạng gửi sang màn đọc Flutter (`openBook`, docs/bridge.md). */
export interface Word {
  han: string;
  pinyin: string;
  meaning: string;
  example: { han: string; pinyin: string; meaning: string };
}

export const toWord = ([han, pinyin, meaning, exHan, exPinyin, exMeaning]: WordRow): Word => ({
  han,
  pinyin,
  meaning,
  example: { han: exHan, pinyin: exPinyin, meaning: exMeaning },
});
