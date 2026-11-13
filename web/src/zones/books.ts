import { HSK1 } from './sach/hsk1';
import { HSK2 } from './sach/hsk2';
import { toWord, type Word, type WordRow } from './sach/word';

export type { Word } from './sach/word';

/**
 * Danh mục sách Tàng Thư Các (R-SACH-1): 6 cuốn sổ từ HSK 2.0, mỗi cuốn là các từ MỚI của cấp đó. Cuốn chưa soạn
 * (`rows` rỗng) hiện "Đang biên soạn", không mượn được. Dữ liệu thuần — gửi sang Flutter qua `openLibrary` / `openBook`.
 */
export interface Book {
  /** mã ASCII — tiến độ (Flutter) lưu mã này */
  id: string;
  /** tên trên gáy / danh mục, vd. "HSK 1" */
  title: string;
  /** dòng phụ, vd. "Sơ cấp · 150 từ" */
  subtitle: string;
  /** số từ dự kiến theo chuẩn (hiện khi chưa soạn) */
  planned: number;
}

interface BookData extends Book {
  rows: readonly WordRow[];
}

const DATA: readonly BookData[] = [
  { id: 'hsk1', title: 'HSK 1', subtitle: 'Nhập môn', planned: 150, rows: HSK1 },
  { id: 'hsk2', title: 'HSK 2', subtitle: 'Sơ cấp', planned: 150, rows: HSK2 },
  { id: 'hsk3', title: 'HSK 3', subtitle: 'Sơ trung cấp', planned: 300, rows: [] },
  { id: 'hsk4', title: 'HSK 4', subtitle: 'Trung cấp', planned: 600, rows: [] },
  { id: 'hsk5', title: 'HSK 5', subtitle: 'Trung cao cấp', planned: 1300, rows: [] },
  { id: 'hsk6', title: 'HSK 6', subtitle: 'Cao cấp', planned: 2500, rows: [] },
];

/** Mục danh mục: số từ thật + đã soạn chưa. */
export interface BookEntry extends Book {
  words: number;
  ready: boolean;
}

/** Danh mục 6 cuốn theo thứ tự cấp (R-SACH-1). */
export const BOOKS: readonly BookEntry[] = DATA.map(({ rows, ...b }) => ({ ...b, words: rows.length, ready: rows.length > 0 }));

/** Sổ từ của một cuốn (R-SACH-3); mã lạ hoặc chưa soạn → mảng rỗng. */
export function bookWords(id: string): Word[] {
  return (DATA.find((b) => b.id === id)?.rows ?? []).map(toWord);
}
