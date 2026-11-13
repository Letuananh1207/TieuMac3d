import { describe, expect, it } from 'vitest';
import type { FlutterBridge } from './bridge/flutterBridge';
import { LibraryDesk } from './libraryDesk';
import type { Dialog } from './zones/dialogs';

/** Cầu nối giả: `native` = có Flutter ghi được; ghi lại sự kiện đã gửi. */
function setup(borrowed: string | null, native = false) {
  const sent: string[] = [];
  const said: string[] = [];
  const talks: Dialog[] = [];
  const ok = (type: string) => async (): Promise<boolean> => (sent.push(type), native);
  const bridge = { borrowBook: ok('borrowBook'), returnBook: ok('returnBook'), openLibrary: ok('openLibrary') } as unknown as FlutterBridge;
  const desk = new LibraryDesk(bridge, borrowed, { talk: (d) => talks.push(d), say: (t) => said.push(t), cover: () => sent.push('cover') });
  return { desk, sent, said, talks };
}
const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe('Quầy mượn sách', () => {
  it('R-SACH-1: chưa có màn danh mục → "Mượn sách" mở bước chọn cuốn trong khung thoại → chọn HSK 1 → đang mượn', async () => {
    const { desk, sent, said, talks } = setup(null);
    const d = desk.dialog();
    const muon = d.lines[0].choices[0];
    expect(muon.text).toBe('Mượn sách');
    expect(muon.next).toBe('chon'); // chưa có danh mục: chọn ngay trong thoại
    const pick = d.lines.find((l) => l.id === 'chon')!.choices[0];
    desk.act(pick);
    await flush();
    expect(desk.book).toBe('hsk1');
    expect(sent).toEqual(['borrowBook']);
    expect(said[0]).toContain('HSK 1');
    expect(talks).toEqual([]);
  });

  it('R-SACH-1: không mượn được cuốn đang biên soạn, hay khi đang giữ cuốn khác', async () => {
    const a = setup(null);
    a.desk.act({ text: 'HSK 3', next: null, action: 'borrow', book: 'hsk3' });
    await flush();
    expect(a.desk.book).toBeNull();
    expect(a.said[0]).toContain('biên soạn');
    const b = setup('hsk1');
    b.desk.act({ text: 'HSK 2', next: null, action: 'borrow', book: 'hsk2' });
    await flush();
    expect(b.desk.book).toBe('hsk1');
    expect(b.sent).toEqual([]);
  });

  it('R-SACH-4: đang mượn → thoại "Trả sách «HSK 1»" → trả → lần sau lại có "Mượn sách"', async () => {
    const { desk, sent } = setup('hsk1', true);
    const tra = desk.dialog().lines[0].choices[0];
    expect(tra.text).toBe('Trả sách «HSK 1»');
    desk.act(tra);
    await flush();
    expect(desk.book).toBeNull();
    expect(sent).toEqual(['returnBook']);
    expect(desk.dialog().lines[0].choices[0].text).toBe('Mượn sách');
  });

  it('R-SACH-2: getProgress báo cuốn đang mượn (vd. sau màn danh mục Flutter) → quầy nhận theo', () => {
    const { desk } = setup(null);
    desk.sync('hsk2');
    expect(desk.dialog().lines[0].choices[0].text).toBe('Trả sách «HSK 2»');
  });
});
