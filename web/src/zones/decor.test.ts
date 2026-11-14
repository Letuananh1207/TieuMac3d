import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS, NEW_HOME, STARTER_DECOR, catalogForSlot, cleanHome, decorItem, hanPrice, itemsForSlot, placeDecor, type DecorSlot, type HomeState } from './decor';

const vuon1: DecorSlot = { id: 'vuon-1', kind: 'vuon' };
const san2: DecorSlot = { id: 'san-2', kind: 'san' };
const trong1: DecorSlot = { id: 'trong-1', kind: 'trong' };

/** Nhà đã mua đủ 13 vật (để thử luật đặt / thay / gỡ không vướng sở hữu). */
const RICH: HomeState = { placed: {}, owned: DECOR_ITEMS.map((i) => i.id) };

const put = (home: HomeState, slot: DecorSlot, id: string | null): HomeState => {
  const r = placeDecor(home, slot, id);
  if (!r.ok) throw new Error(r.reason);
  return r.home;
};

describe('danh mục và sở hữu (R-NHA-4)', () => {
  it('R-NHA-4: 13 vật — 5 vườn, 4 sân, 4 trong nhà; mã không trùng', () => {
    expect(DECOR_ITEMS).toHaveLength(13);
    expect(new Set(DECOR_ITEMS.map((i) => i.id)).size).toBe(13);
    expect(itemsForSlot(RICH, 'vuon').map((i) => i.name)).toEqual(['Trúc cảnh', 'Mai', 'Tùng', 'Đá Thái Hồ', 'Ao sen']);
    expect(itemsForSlot(RICH, 'san').map((i) => i.han).join('')).toBe('燈茶蘭爐');
    expect(itemsForSlot(RICH, 'trong').map((i) => i.name)).toEqual(['Tranh chữ', 'Kệ sách', 'Án đọc', 'Bình phong']);
  });

  it('R-NHA-4: mới cài app → sở hữu sẵn Trúc cảnh, Đèn lồng, Tranh chữ; mọi ô trống', () => {
    expect(STARTER_DECOR).toEqual(['truc-canh', 'den-long', 'tranh-chu']);
    expect(NEW_HOME.owned).toEqual(STARTER_DECOR);
    expect(NEW_HOME.placed).toEqual({});
    expect(itemsForSlot(NEW_HOME, 'vuon').map((i) => i.id)).toEqual(['truc-canh']);
    expect(placeDecor(NEW_HOME, vuon1, 'mai')).toEqual({ ok: false, reason: 'notOwned' });
  });

  it('R-NHA-4: danh mục hiện cả vật chưa có — đã có trước, chưa có sau (rẻ → đắt)', () => {
    const vuon = catalogForSlot({ placed: {}, owned: [...STARTER_DECOR, 'tung'] }, 'vuon');
    expect(vuon.map((e) => `${e.item.id}:${e.owned}`)).toEqual([
      'truc-canh:true',
      'tung:true',
      'mai:false',
      'da-thai-ho:false',
      'ao-sen:false',
    ]);
    expect(catalogForSlot(NEW_HOME, 'trong').map((e) => e.item.price)).toEqual([40, 90, 120, 150]);
  });

  it('R-NHA-4: vật chưa sở hữu → không đặt được', () => {
    const poor: HomeState = { placed: {}, owned: ['mai'] };
    expect(placeDecor(poor, vuon1, 'tung')).toEqual({ ok: false, reason: 'notOwned' });
    expect(itemsForSlot(poor, 'vuon').map((i) => i.id)).toEqual(['mai']);
  });

  it('R-NHA-4: gỡ vật khỏi ô không mất quyền sở hữu', () => {
    const h = put(put(RICH, vuon1, 'mai'), vuon1, null);
    expect(h.owned).toContain('mai');
    expect(itemsForSlot(h, 'vuon').some((i) => i.id === 'mai')).toBe(true);
  });
});

describe('giá Tạp hoá (R-TIEN-4)', () => {
  it('R-TIEN-4: bảng giá 13 vật', () => {
    const price = Object.fromEntries(DECOR_ITEMS.map((i) => [i.name, i.price]));
    expect(price).toEqual({
      'Trúc cảnh': 30, 'Đèn lồng': 30, 'Tranh chữ': 40, 'Chậu lan': 50, Mai: 60, 'Lư hương': 70, Tùng: 80,
      'Án đọc': 90, 'Bàn trà': 100, 'Kệ sách': 120, 'Bình phong': 150, 'Đá Thái Hồ': 160, 'Ao sen': 200,
    });
  });

  it('R-TIEN-4: số chữ Hán của giá', () => {
    expect(hanPrice(30)).toBe('三十文');
    expect(hanPrice(100)).toBe('一百文');
    expect(hanPrice(120)).toBe('一百二十文');
    expect(hanPrice(160)).toBe('一百六十文');
    expect(hanPrice(200)).toBe('二百文');
    expect(hanPrice(105)).toBe('一百零五文');
    expect(hanPrice(15)).toBe('十五文');
    expect(decorItem('ao-sen')?.priceHan).toBe('二百文');
  });
});

describe('đặt / thay / gỡ (R-NHA-2)', () => {
  it('R-NHA-2: ô vườn trống → Mai; chọn Tùng → thay; Gỡ → trống', () => {
    let h = put(RICH, vuon1, 'mai');
    expect(h.placed['vuon-1']).toBe('mai');
    h = put(h, vuon1, 'tung');
    expect(h.placed).toEqual({ 'vuon-1': 'tung' });
    h = put(h, vuon1, null);
    expect(h.placed).toEqual({});
  });

  it('R-NHA-2: vật sai loại ô → không đặt (Mai vào ô trong nhà)', () => {
    expect(placeDecor(RICH, trong1, 'mai')).toEqual({ ok: false, reason: 'wrongKind' });
    expect(placeDecor(RICH, vuon1, 'khong-co')).toEqual({ ok: false, reason: 'unknownItem' });
  });

  it('R-NHA-2: một vật đặt được ở nhiều ô cùng lúc — mua một lần là đủ', () => {
    const h = put(put(NEW_HOME, san2, 'den-long'), { id: 'san-3', kind: 'san' }, 'den-long');
    expect(h.placed).toEqual({ 'san-2': 'den-long', 'san-3': 'den-long' });
  });

  it('R-NHA-2: vật to chặn người đi, vật nhỏ không', () => {
    const blocking = DECOR_ITEMS.filter((i) => i.blocks).map((i) => i.id).sort();
    expect(blocking).toEqual(['ao-sen', 'ban-tra', 'binh-phong', 'da-thai-ho', 'ke-sach']);
  });

  it('R-NHA-2: không sửa nhà cũ (trả nhà mới)', () => {
    put(NEW_HOME, vuon1, 'truc-canh');
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

  it('R-NHA-4: đọc owned; thiếu owned (bản cũ) → vật khởi đầu + vật đang đặt; mã lạ bỏ qua', () => {
    expect(cleanHome({ placed: {}, owned: ['truc-canh', 'mai', 'rong', 3] }, slots).owned).toEqual(['truc-canh', 'mai']);
    expect(cleanHome({ placed: { 'vuon-1': 'tung' } }, slots).owned).toEqual([...STARTER_DECOR, 'tung']);
    expect(cleanHome({ placed: { 'vuon-1': 'mai' }, owned: 'hỏng' }, slots).owned).toEqual([...STARTER_DECOR, 'mai']);
  });
});
