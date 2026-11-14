import { BOOKS, type BookEntry } from './books';
import type { Dialog, DialogChoice } from './dialogs';

/**
 * Mượn / trả sách ở Tàng Thư Các (R-SACH-1, R-SACH-4) — luật thuần, không DOM. Cuốn đang mượn lưu ở Flutter
 * (`getProgress.book`, docs/bridge.md); trình duyệt thường giữ trong bộ nhớ trang.
 */

/** Mã NPC thủ thư (đặc tả cảnh `npcs[].id`, model `design/models/thu-thu.glb`). */
export const LIBRARIAN = 'thu-thu';

export type BorrowCheck = 'ok' | 'dang-muon' | 'chua-soan' | 'khong-co';

/** Mượn được cuốn `id` không, khi đang mượn `borrowed` (R-SACH-1: mỗi lúc 1 cuốn, cuốn chưa soạn không mượn). */
export function canBorrow(borrowed: string | null, id: string): BorrowCheck {
  const b = BOOKS.find((x) => x.id === id);
  if (!b) return 'khong-co';
  if (!b.ready) return 'chua-soan';
  return borrowed ? 'dang-muon' : 'ok';
}

/** Cuốn đang mượn (mã lạ → `null`). */
export const borrowedBook = (borrowed: string | null): BookEntry | null => BOOKS.find((b) => b.id === borrowed) ?? null;

const BYE: DialogChoice = { text: 'Tạm biệt', next: null };

/**
 * Hội thoại thủ thư theo việc đang mượn: chưa mượn → "Mượn sách"; đang mượn → "Trả sách «…»" (R-SACH-1/4).
 * `catalog` = có màn danh mục (Flutter) → "Mượn sách" mở danh mục; không → chọn cuốn ngay trong khung thoại (các cuốn
 * đã soạn, tối đa 2 — khung thoại 1–3 lựa chọn).
 */
export function librarianDialog(borrowed: string | null, catalog: boolean): Dialog {
  const book = borrowedBook(borrowed);
  const ready = BOOKS.filter((b) => b.ready);
  const pick: DialogChoice[] = ready.slice(0, 2).map((b) => ({ text: `${b.title} · ${b.subtitle}`, next: null, action: 'borrow', book: b.id }));
  const borrow: DialogChoice = catalog ? { text: 'Mượn sách', next: null, action: 'borrow' } : { text: 'Mượn sách', next: 'chon' };
  return {
    npc: LIBRARIAN,
    name: 'Điển Thư',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: book
          ? `Đạo hữu đang giữ cuốn sổ từ ${book.title}. Đọc xong muốn đổi cuốn khác thì trả lại cho ta trước nhé.`
          : 'Tàng Thư Các cho mượn sổ từ Hán ngữ theo sáu cấp HSK. Mượn rồi cứ mang theo mà đọc, đi đâu cũng được — mỗi lần một cuốn.',
        choices: book ? [{ text: `Trả sách «${book.title}»`, next: null, action: 'return' }, BYE] : [borrow, BYE],
      },
      {
        id: 'chon',
        text: `Sổ từ đã soạn xong: ${ready.map((b) => b.title).join(', ')}. Các cấp sau còn đang biên soạn. Đạo hữu mượn cuốn nào?`,
        choices: [...pick, BYE],
      },
    ],
  };
}
