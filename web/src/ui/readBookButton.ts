/**
 * Thẻ "Đọc sách" (R-SACH-2, thiết kế 2026-11-13.28 `DocSach-*`): kính sương cao 52 ngay trên cụm nút hành động — bìa
 * mini màu cuốn (số cấp chữ Hán) + "Đọc sách" + tên cuốn. Hiện khi đang mượn sách, ở mọi khu, mọi vùng. DOM có sẵn trong
 * index.html (#readBook).
 */
import { el } from './dom';

const LEVEL_HAN = ['', '一', '二', '三', '四', '五', '六'];
/** màu bìa theo cấp — cùng bảng với bìa Flutter (`app/lib/lesson/book_cover.dart`) */
const COVER = ['var(--jade)', 'var(--slate)', 'var(--lacquer)', 'var(--shelf-wood)', 'var(--shelf-shadow)', 'var(--jade)'];

export class ReadBookButton {
  private readonly root = el('readBook');
  private readonly cover = el('readBookCover');
  private readonly title = el('readBookTitle');
  private shown: string | null = null;

  constructor(onRead: () => void) {
    this.root.addEventListener('click', onRead);
  }

  /** [book] = cuốn đang mượn (`null` hoặc [show] sai → ẩn). */
  set(book: { id: string; title: string } | null, show: boolean): void {
    this.root.hidden = !book || !show;
    if (!book || book.id === this.shown) return;
    this.shown = book.id;
    const level = Number(book.id.replace(/\D/g, '')) || 1;
    this.cover.textContent = LEVEL_HAN[level] ?? '';
    this.cover.style.background = COVER[Math.min(COVER.length, Math.max(1, level)) - 1];
    this.title.textContent = book.title;
    this.root.setAttribute('aria-label', `Đọc sách — đang mượn ${book.title}`); // readBookLabel
  }
}
