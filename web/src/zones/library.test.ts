import { describe, expect, it } from 'vitest';
import { checkDialog, DialogRunner } from './dialogs';
import { canBorrow, librarianDialog } from './library';

describe('Mượn sách Tàng Thư Các', () => {
  it('R-SACH-1: chưa mượn → mượn được cuốn đã soạn; cuốn đang biên soạn / mã lạ thì không', () => {
    expect(canBorrow(null, 'hsk1')).toBe('ok');
    expect(canBorrow(null, 'hsk3')).toBe('chua-soan');
    expect(canBorrow(null, 'abc')).toBe('khong-co');
  });

  it('R-SACH-1: mỗi lúc chỉ mượn 1 cuốn', () => {
    expect(canBorrow('hsk1', 'hsk2')).toBe('dang-muon');
  });

  it('R-SACH-1: chưa mượn → thoại có "Mượn sách", "Tạm biệt"; chọn cuốn trong khung thoại khi chưa có danh mục', () => {
    const d = librarianDialog(null, false);
    expect(checkDialog(d)).toEqual([]);
    const r = new DialogRunner(d);
    expect(r.start().choices.map((c) => c.text)).toEqual(['Mượn sách', 'Tạm biệt']);
    const pick = r.choose(0)!;
    expect(pick.choices.map((c) => c.book)).toEqual(['hsk1', 'hsk2', undefined]);
    expect(pick.choices[0]).toMatchObject({ next: null, action: 'borrow' });
  });

  it('R-SACH-1: có màn danh mục → "Mượn sách" đóng thoại rồi mở danh mục', () => {
    const d = librarianDialog(null, true);
    expect(checkDialog(d)).toEqual([]);
    expect(d.lines[0].choices[0]).toEqual({ text: 'Mượn sách', next: null, action: 'borrow' });
  });

  it('R-SACH-4: đang mượn → "Trả sách «HSK 1»" thay "Mượn sách"', () => {
    const d = librarianDialog('hsk1', true);
    expect(checkDialog(d)).toEqual([]);
    const texts = d.lines[0].choices.map((c) => c.text);
    expect(texts).toEqual(['Trả sách «HSK 1»', 'Tạm biệt']);
    expect(d.lines[0].choices[0].action).toBe('return');
  });
});
