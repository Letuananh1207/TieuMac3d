import type { FlutterBridge } from './bridge/flutterBridge';
import { BOOKS, bookWords } from './zones/books';
import type { Dialog, DialogChoice } from './zones/dialogs';
import { borrowedBook, canBorrow, LIBRARIAN, librarianDialog } from './zones/library';

/** Việc của `main.ts` mà quầy sách cần: mở thoại, nói một câu, che cảnh khi Flutter mở màn danh mục. */
export interface DeskHost {
  /** mở khung thoại với hội thoại `d` (bắt đầu ở `d.start`) */
  talk(d: Dialog): void;
  /** thủ thư nói một câu (khung thoại "Vâng") */
  say(text: string): void;
  /** Flutter đã mở màn của nó → trang dừng, chờ `resume` */
  cover(): void;
}

/**
 * Quầy mượn sách Tàng Thư Các (R-SACH-1, R-SACH-4) — ghép luật `zones/library.ts` với cầu nối và khung thoại.
 * Cuốn đang mượn: Flutter lưu (`getProgress.book`); trình duyệt thường giữ ở đây. Danh mục + sổ từ là màn Flutter
 * (`openLibrary`, `openBook` — thiết kế 2026-11-13.28).
 */
export class LibraryDesk {
  /** "Mượn sách" mở màn danh mục Flutter (thiết kế 2026-11-13.28); trình duyệt thường → chọn trong khung thoại */
  private readonly catalog = true;

  /** đang mở màn danh mục Flutter (đóng → `sync` biết vừa mượn ở đó) */
  private catalogOpen = false;

  constructor(
    private readonly bridge: FlutterBridge,
    private borrowed: string | null,
    private readonly host: DeskHost,
  ) {}

  /** mã sổ từ đang mượn (R-SACH-2) */
  get book(): string | null {
    return this.borrowed;
  }

  /** Flutter trả lời `getProgress` (sau `resume`) → nhận cuốn đang mượn mới nhất; vừa mượn ở màn danh mục → thủ thư giao sách. */
  sync(book: string | null): void {
    const gave = this.catalogOpen && !this.borrowed && !!book;
    this.catalogOpen = false;
    this.borrowed = book;
    if (gave) this.host.say(handOver(book));
  }

  /** Mở sổ từ cuốn đang mượn (nút "Đọc sách" — R-SACH-3). `false` = không có màn đọc (trình duyệt thường). */
  async read(): Promise<boolean> {
    const book = borrowedBook(this.borrowed);
    if (!book) return false;
    if (!(await this.bridge.openBook(book, bookWords(book.id)))) return false;
    this.host.cover();
    return true;
  }

  /** Hội thoại thủ thư theo việc đang mượn. */
  dialog(): Dialog {
    return librarianDialog(this.borrowed, this.catalog);
  }

  /** Lựa chọn có việc của quầy sách? (`main.ts` gọi `act` sau khi khung thoại đóng) */
  static handles(c: DialogChoice | undefined): c is DialogChoice {
    return c?.action === 'borrow' || c?.action === 'return';
  }

  /** Làm việc của lựa chọn sau khi khung thoại đóng. */
  act(c: DialogChoice): void {
    if (c.action === 'return') void this.giveBack();
    else if (c.action === 'borrow') void (c.book ? this.borrow(c.book) : this.openCatalog());
  }

  private async openCatalog(): Promise<void> {
    if (await this.bridge.openLibrary(BOOKS, this.borrowed)) {
      this.catalogOpen = true;
      this.host.cover(); // chọn xong → Flutter ghi mượn → `resume` → main hỏi lại getProgress → `sync`
      return;
    }
    this.host.talk({ ...this.dialog(), start: 'chon' }); // chưa có màn danh mục → chọn trong khung thoại
  }

  private async borrow(id: string): Promise<void> {
    const check = canBorrow(this.borrowed, id);
    if (check !== 'ok') {
      this.host.say(check === 'chua-soan' ? 'Cuốn này còn đang biên soạn, đạo hữu chờ ít hôm nhé.' : 'Đạo hữu trả cuốn đang giữ trước đã.');
      return;
    }
    await this.bridge.borrowBook(id); // không có Flutter → chỉ giữ trong trang
    this.borrowed = id;
    this.host.say(handOver(id));
  }

  private async giveBack(): Promise<void> {
    const title = borrowedBook(this.borrowed)?.title;
    if (!title) return;
    await this.bridge.returnBook();
    this.borrowed = null;
    this.host.say(`Ta nhận lại sổ từ ${title} rồi. Muốn mượn cuốn khác cứ nói ta.`);
  }
}

/** Câu thủ thư giao sách (R-SACH-1). */
function handOver(id: string): string {
  return `Đây, sổ từ ${borrowedBook(id)?.title ?? id}. Cứ mang theo mà đọc, đi đâu cũng được — muốn đổi cuốn thì đem trả cho ta.`;
}

export { LIBRARIAN };
