import { describe, expect, it } from 'vitest';
import { NEW_HOME, type DecorSlot, type HomeState } from './decor';
import { buyAtShopText, decorCards, panelHint, removeFrom, SLOT_LABEL, tapCard } from './decorMode';

const VUON: DecorSlot = { id: 'vuon-1', kind: 'vuon' };
const TRONG: DecorSlot = { id: 'trong-1', kind: 'trong' };
const SAN: DecorSlot = { id: 'san-1', kind: 'san' };

describe('chế độ trang trí (R-NHA-2, R-NHA-4)', () => {
  it('R-NHA-2: ô trong nhà → danh mục chỉ Tranh chữ, Kệ sách, Án đọc, Bình phong; không có Mai', () => {
    const names = decorCards(NEW_HOME, TRONG).map((c) => c.item.name);
    expect(names.sort()).toEqual(['Án đọc', 'Bình phong', 'Kệ sách', 'Tranh chữ'].sort());
    expect(names).not.toContain('Mai');
  });

  it('R-NHA-4: mới cài → ô vườn: Trúc cảnh đã có đứng đầu, Mai khoá giá 60, khoá xếp rẻ → đắt', () => {
    const cards = decorCards(NEW_HOME, VUON);
    expect(cards[0]).toMatchObject({ item: { id: 'truc-canh' }, state: 'owned' });
    expect(cards.slice(1).map((c) => [c.item.id, c.state, c.item.price])).toEqual([
      ['mai', 'locked', 60],
      ['tung', 'locked', 80],
      ['da-thai-ho', 'locked', 160],
      ['ao-sen', 'locked', 200],
    ]);
  });

  it('R-NHA-2: đặt Mai vào ô vườn trống → thay bằng Tùng → gỡ thì ô trống; vật đang đặt có dấu "đang đặt"', () => {
    let home: HomeState = { placed: {}, owned: ['truc-canh', 'mai', 'tung'] };
    expect(panelHint(home, VUON.id)).toBe('Chọn vật để đặt vào ô');
    const a = tapCard(home, VUON, 'mai');
    expect(a.kind).toBe('place');
    if (a.kind === 'place') home = a.home;
    expect(home.placed).toEqual({ 'vuon-1': 'mai' });
    expect(decorCards(home, VUON).find((c) => c.item.id === 'mai')?.state).toBe('placed');
    expect(panelHint(home, VUON.id)).toBe('Chạm vật khác để thay');
    expect(tapCard(home, VUON, 'mai').kind).toBe('none'); // chạm lại vật đang đặt: không đổi
    const b = tapCard(home, VUON, 'tung');
    if (b.kind === 'place') home = b.home;
    expect(home.placed).toEqual({ 'vuon-1': 'tung' });
    home = removeFrom(home, VUON) ?? home;
    expect(home.placed).toEqual({});
    expect(removeFrom(home, VUON)).toBeNull(); // ô trống: không có gì để gỡ
  });

  it('R-NHA-4: gỡ vật khỏi ô không mất sở hữu — mở lại danh mục vẫn "Đã có"', () => {
    const home = removeFrom({ placed: { 'vuon-1': 'truc-canh' }, owned: NEW_HOME.owned }, VUON);
    expect(home && decorCards(home, VUON)[0]).toMatchObject({ item: { id: 'truc-canh' }, state: 'owned' });
  });

  it('R-NHA-4: chạm thẻ khoá → tấm báo Tạp hoá, không đặt được', () => {
    const t = tapCard(NEW_HOME, VUON, 'mai');
    expect(t.kind).toBe('locked');
    if (t.kind === 'locked') expect(buyAtShopText(t.item, 25)).toBe('Mua Mai ở Tạp hoá phố chợ — 60 Văn tiền (đang có 25)');
  });

  it('R-NHA-2: vật sai loại ô không đặt được; một vật đặt ở nhiều ô cùng lúc', () => {
    expect(tapCard(NEW_HOME, SAN, 'truc-canh').kind).toBe('none');
    let home: HomeState = NEW_HOME;
    for (const id of ['san-1', 'san-2']) {
      const r = tapCard(home, { id, kind: 'san' }, 'den-long');
      if (r.kind === 'place') home = r.home;
    }
    expect(home.placed).toEqual({ 'san-1': 'den-long', 'san-2': 'den-long' });
  });

  it('R-NHA-2: tên loại ô trên viên nhắc', () => {
    expect([SLOT_LABEL.vuon.name, SLOT_LABEL.san.name, SLOT_LABEL.trong.name]).toEqual(['Ô vườn', 'Ô sân', 'Ô trong nhà']);
  });
});
