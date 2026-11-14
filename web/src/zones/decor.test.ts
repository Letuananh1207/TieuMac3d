import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS, NEW_HOME, cleanHome, itemsForSlot, placeDecor, type DecorSlot, type HomeState } from './decor';

const vuon1: DecorSlot = { id: 'vuon-1', kind: 'vuon' };
const san2: DecorSlot = { id: 'san-2', kind: 'san' };
const trong1: DecorSlot = { id: 'trong-1', kind: 'trong' };

const put = (home: HomeState, slot: DecorSlot, id: string | null): HomeState => {
  const r = placeDecor(home, slot, id);
  if (!r.ok) throw new Error(r.reason);
  return r.home;
};

describe('danh mục và sở hữu (R-NHA-4)', () => {
  it('R-NHA-4: 13 vật — 5 vườn, 4 sân, 4 trong nhà; mã không trùng', () => {
    expect(DECOR_ITEMS).toHaveLength(13);
    expect(new Set(DECOR_ITEMS.map((i) => i.id)).size).toBe(13);
    expect(itemsForSlot(NEW_HOME, 'vuon').map((i) => i.name)).toEqual(['Trúc cảnh', 'Mai', 'Tùng', 'Đá Thái Hồ', 'Ao sen']);
    expect(itemsForSlot(NEW_HOME, 'san').map((i) => i.han).join('')).toBe('燈茶蘭爐');
    expect(itemsForSlot(NEW_HOME, 'trong').map((i) => i.name)).toEqual(['Tranh chữ', 'Kệ sách', 'Án đọc', 'Bình phong']);
  });

  it('R-NHA-4: mới cài app → sở hữu sẵn mọi vật, mọi ô trống', () => {
    expect(NEW_HOME.owned).toHaveLength(13);
    expect(NEW_HOME.placed).toEqual({});
  });

  it('R-NHA-4: vật chưa sở hữu → không đặt được', () => {
    const poor: HomeState = { placed: {}, owned: ['mai'] };
    expect(placeDecor(poor, vuon1, 'tung')).toEqual({ ok: false, reason: 'notOwned' });
    expect(itemsForSlot(poor, 'vuon').map((i) => i.id)).toEqual(['mai']);
  });

  it('R-NHA-4: gỡ vật khỏi ô không mất quyền sở hữu', () => {
    const h = put(put(NEW_HOME, vuon1, 'mai'), vuon1, null);
    expect(h.owned).toContain('mai');
    expect(itemsForSlot(h, 'vuon').some((i) => i.id === 'mai')).toBe(true);
  });
});

describe('đặt / thay / gỡ (R-NHA-2)', () => {
  it('R-NHA-2: ô vườn trống → Mai; chọn Tùng → thay; Gỡ → trống', () => {
    let h = put(NEW_HOME, vuon1, 'mai');
    expect(h.placed['vuon-1']).toBe('mai');
    h = put(h, vuon1, 'tung');
    expect(h.placed).toEqual({ 'vuon-1': 'tung' });
    h = put(h, vuon1, null);
    expect(h.placed).toEqual({});
  });

  it('R-NHA-2: vật sai loại ô → không đặt (Mai vào ô trong nhà)', () => {
    expect(placeDecor(NEW_HOME, trong1, 'mai')).toEqual({ ok: false, reason: 'wrongKind' });
    expect(placeDecor(NEW_HOME, vuon1, 'khong-co')).toEqual({ ok: false, reason: 'unknownItem' });
  });

  it('R-NHA-2: một vật đặt được ở nhiều ô cùng lúc', () => {
    const h = put(put(NEW_HOME, san2, 'den-long'), { id: 'san-3', kind: 'san' }, 'den-long');
    expect(h.placed).toEqual({ 'san-2': 'den-long', 'san-3': 'den-long' });
  });

  it('R-NHA-2: vật to chặn người đi, vật nhỏ không', () => {
    const blocking = DECOR_ITEMS.filter((i) => i.blocks).map((i) => i.id).sort();
    expect(blocking).toEqual(['ao-sen', 'ban-tra', 'binh-phong', 'da-thai-ho', 'ke-sach']);
  });

  it('R-NHA-2: không sửa nhà cũ (trả nhà mới)', () => {
    put(NEW_HOME, vuon1, 'mai');
    expect(NEW_HOME.placed).toEqual({});
  });
});

describe('nhà đã lưu (R-NHA-3)', () => {
  const slots = [vuon1, san2, trong1];

  it('R-NHA-3: nhà lưu đúng → giữ nguyên', () => {
    expect(cleanHome({ placed: { 'vuon-1': 'mai', 'san-2': 'den-long' } }, slots).placed).toEqual({ 'vuon-1': 'mai', 'san-2': 'den-long' });
  });

  it('R-NHA-3: bản mới bỏ ô vườn 1 → bỏ qua ô đó, Đèn lồng vẫn ở ô sân 2', () => {
    expect(cleanHome({ placed: { 'vuon-1': 'mai', 'san-2': 'den-long' } }, [san2, trong1]).placed).toEqual({ 'san-2': 'den-long' });
  });

  it('R-NHA-3: vật lạ, vật sai loại, dữ liệu hỏng → bỏ qua, không lỗi', () => {
    expect(cleanHome({ placed: { 'vuon-1': 'rong', 'trong-1': 'mai', 'san-2': 3 } }, slots).placed).toEqual({});
    expect(cleanHome(null, slots)).toEqual(NEW_HOME);
    expect(cleanHome('hỏng', slots).placed).toEqual({});
    expect(cleanHome({ placed: [] }, slots).placed).toEqual({});
  });
});
