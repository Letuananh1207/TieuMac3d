/**
 * Viên "Đọc sách" (R-SACH-2; thiết kế 2026-11-13.28 `DocSach-*`, kiểu viên ngọc + hình minh hoạ 2026-11-16.2
 * `HinhMinhHoa-HUD-doc`): cao 52 ngay trên cụm nút hành động — hình Tiểu Mặc đọc sách + "Đọc sách"; tên cuốn ở nhãn trợ
 * năng. Hiện khi đang mượn sách, ở mọi khu, mọi vùng. DOM có sẵn trong index.html (#readBook).
 */
import { el } from './dom';
import { hinhImg } from './hinh';

export class ReadBookButton {
  private readonly root = el('readBook');
  private shown: string | null = null;

  constructor(onRead: () => void) {
    this.root.prepend(hinhImg('doc-sach-nut', 46));
    this.root.addEventListener('click', onRead);
  }

  /** [book] = cuốn đang mượn (`null` hoặc [show] sai → ẩn). */
  set(book: { id: string; title: string } | null, show: boolean): void {
    this.root.hidden = !book || !show;
    if (!book || book.id === this.shown) return;
    this.shown = book.id;
    this.root.setAttribute('aria-label', `Đọc sách — đang mượn ${book.title}`); // readBookLabel
  }
}
