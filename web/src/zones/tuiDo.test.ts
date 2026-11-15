import { describe, expect, it } from 'vitest';
import { BAG_TEXT, bagView, type BagSource } from './tuiDo';
import { freshGarden, type Garden } from './vuon';

const garden = (seeds: Garden['seeds'], barn: Garden['barn']): Garden => ({ ...freshGarden(), seeds, barn });
const empty: BagSource = { garden: garden({}, {}), home: { placed: {}, owned: [] }, book: null, coins: 0 };

describe('túi đồ (R-TUI-1)', () => {
  it('R-TUI-1: ở Trúc Lâm, túi 3 hạt Cải ngọt, kho 4 Ngô, đang mượn HSK 1 → Cải ngọt × 3, Ngô × 4, HSK 1', () => {
    const v = bagView({ garden: garden({ cai: 3 }, { ngo: 4 }), home: null, book: { title: 'HSK 1', subtitle: 'Nhập môn' }, coins: 1280 });
    expect(v.seeds.items).toEqual([{ crop: 'cai', name: 'Cải ngọt', n: 3 }]);
    expect(v.crops.items).toEqual([{ crop: 'ngo', name: 'Ngô', n: 4 }]);
    expect(v.book.item?.title).toBe('HSK 1 · Nhập môn');
    expect(v.coins).toBe(1280);
  });

  it('R-TUI-1: số trên đầu mục = tổng số hạt / nông sản, số món đồ; theo thứ tự bảng cây', () => {
    const v = bagView({ ...empty, garden: garden({ bi: 3, cai: 2, ngo: 1 }, { bi: 4, cai: 3, ngo: 2, lua: 5 }) });
    expect(v.seeds.items.map((x) => x.name)).toEqual(['Cải ngọt', 'Ngô', 'Bí đỏ']);
    expect(v.seeds.total).toBe(6);
    expect(v.crops.total).toBe(14);
  });

  it('R-TUI-1: mục trống → dòng chỉ chỗ lấy (chưa có hạt → Tạp hoá)', () => {
    const v = bagView(empty);
    expect(v.seeds.items).toEqual([]);
    expect(v.seeds.empty).toBe('Chưa có hạt — mua ở Tạp hoá Khởi Nguyên Trấn');
    expect(v.crops.empty).toBe(BAG_TEXT.bagCropsEmpty);
    expect(v.book.item).toBeNull();
    expect(v.decor.items).toEqual([]);
    for (const s of Object.values(BAG_TEXT)) expect(s).not.toMatch(/\p{Script=Han}/u); // R-HUD-4
  });

  it('R-TUI-1: đồ trang trí đã có (R-NHA-4), vật đang đặt có dấu; bỏ mã lạ, số 0', () => {
    const v = bagView({ ...empty, garden: garden({ cai: 0 }, {}), home: { placed: { 'san-1': 'den-long', 'vuon-1': 'la' }, owned: ['den-long', 'truc-canh', 'la'] } });
    expect(v.decor.items).toEqual([
      { id: 'truc-canh', name: 'Trúc cảnh', placed: false },
      { id: 'den-long', name: 'Đèn lồng', placed: true },
    ]);
    expect(v.decor.total).toBe(2);
    expect(v.seeds.items).toEqual([]);
  });

  it('R-TUI-1: nhà bản cũ (thiếu owned) / chưa có → vật khởi đầu; ví chưa biết → không số dư', () => {
    const v = bagView({ garden: null, home: null, book: null, coins: null });
    expect(v.decor.items.map((d) => d.id)).toEqual(['truc-canh', 'den-long', 'tranh-chu']);
    expect(v.seeds.total).toBe(0);
    expect(v.coins).toBeNull();
  });
});
