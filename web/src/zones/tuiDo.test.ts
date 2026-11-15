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

  it('R-TUI-1: đồ trang trí đã có, mỗi vật "Trong túi n · Đang đặt m" (mọi nơi); Mai 3 cái đặt 2 → "Trong túi 1 · Đang đặt 2"; bỏ mã lạ', () => {
    const mai = (x: number, scene = 'nha-ta') => ({ item: 'mai', scene, x, z: 4, rot: 0 });
    const v = bagView({ ...empty, garden: garden({ cai: 0 }, {}), home: { items: [mai(8), mai(10), { item: 'la', scene: 'nha-ta', x: 0, z: 0, rot: 0 }], owned: { mai: 3, 'truc-canh': 1, la: 2 } } });
    expect(v.decor.items).toEqual([
      { id: 'truc-canh', name: 'Trúc cảnh', inBag: 1, placed: 0, text: 'Trong túi 1 · Đang đặt 0' },
      { id: 'mai', name: 'Mai', inBag: 1, placed: 2, text: 'Trong túi 1 · Đang đặt 2' },
    ]);
    expect(v.decor.total).toBe(2);
    expect(v.seeds.items).toEqual([]);
    // dữ liệu ô cũ chưa chuyển: vật ở ô tính là đang đặt
    const old = bagView({ ...empty, home: { placed: { 'san-1': 'den-long' }, owned: ['den-long'] } });
    expect(old.decor.items).toEqual([{ id: 'den-long', name: 'Đèn lồng', inBag: 0, placed: 1, text: 'Trong túi 0 · Đang đặt 1' }]);
  });

  it('R-TUI-1: nhà bản cũ (thiếu owned) / chưa có → vật khởi đầu; ví chưa biết → không số dư', () => {
    const v = bagView({ garden: null, home: null, book: null, coins: null });
    expect(v.decor.items.map((d) => d.id)).toEqual(['truc-canh', 'den-long', 'tranh-chu']);
    expect(v.seeds.total).toBe(0);
    expect(v.coins).toBeNull();
  });
});
