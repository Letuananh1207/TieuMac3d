import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS, decorItem, STARTER_DECOR } from './decor';
import { boughtView, cardState, confirmView, SEED_GRID_HINT, SEED_ITEMS, SEED_QTY, seedCrop, seedLine, SHOP_TABS, shopBanner, shopGroups } from './shopView';

const ALL = DECOR_ITEMS.map((i) => i.id);
const item = (id: string) => {
  const it = decorItem(id);
  if (!it) throw new Error(id);
  return it;
};

describe('Tạp hoá bản web — thẻ, tab, dải (R-TIEN-4)', () => {
  it('R-TIEN-4: mới mở → Trúc cảnh, Đèn lồng, Tranh chữ "Đã có"; có 40, Tùng 80 → "Còn thiếu 40"; đủ tiền → "Mua"', () => {
    for (const id of STARTER_DECOR) expect(cardState(item(id), STARTER_DECOR, 300)).toEqual({ state: 'owned', text: 'Đã có', short: 0 });
    expect(cardState(item('tung'), STARTER_DECOR, 40)).toEqual({ state: 'short', text: 'Còn thiếu 40', short: 40 });
    expect(cardState(item('mai'), STARTER_DECOR, 100)).toEqual({ state: 'buy', text: 'Mua', short: 0 });
  });

  it('R-TIEN-4: tab Tất cả · Vườn · Sân · Trong nhà; "Tất cả" chia nhóm có tiêu đề, theo thứ tự danh mục', () => {
    expect(SHOP_TABS.map((t) => t.label)).toEqual(['Tất cả', 'Vườn', 'Sân', 'Trong nhà', 'Hạt giống']);
    const all = shopGroups(DECOR_ITEMS, STARTER_DECOR, 300, 'all', null);
    expect(all.map((g) => g.title)).toEqual(['Vườn', 'Sân', 'Trong nhà']);
    expect(all[0].cards.map((c) => c.item.id)).toEqual(['truc-canh', 'mai', 'tung', 'da-thai-ho', 'ao-sen']);
    expect(all.flatMap((g) => g.cards).length).toBe(13);
    const san = shopGroups(DECOR_ITEMS, STARTER_DECOR, 300, 'san', 'ban-tra');
    expect(san).toHaveLength(1);
    expect(san[0].title).toBeNull();
    expect(san[0].cards.map((c) => [c.item.id, c.picked])).toEqual([['den-long', false], ['ban-tra', true], ['chau-lan', false], ['lu-huong', false]]);
  });

  it('R-TIEN-4: không mua nổi vật rẻ nhất còn thiếu → dải gợi ý; có đủ 13 món → dải đã mua hết', () => {
    expect(shopBanner(DECOR_ITEMS, STARTER_DECOR, 300)).toBeNull();
    expect(shopBanner(DECOR_ITEMS, STARTER_DECOR, 49)).toBe('poor'); // rẻ nhất còn thiếu: Chậu lan 50
    expect(shopBanner(DECOR_ITEMS, STARTER_DECOR, 50)).toBeNull();
    expect(shopBanner(DECOR_ITEMS, ALL, 0)).toBe('allBought');
  });

  it('R-TIEN-4: hộp xác nhận — đang có / giá / còn lại, nút "Mua · n"; báo "Đã mua …" — về nhà để đặt', () => {
    expect(confirmView(item('da-thai-ho'), 160)).toEqual({
      before: 'Mua Đá Thái Hồ',
      after: 'với 160 Văn tiền?',
      sub: 'Đặt ở ô Vườn · mua một lần, đặt được nhiều ô',
      rows: [['Đang có', '160'], ['Giá', '−160'], ['Còn lại', '0']],
      buy: 'Mua · 160',
      short: 0,
    });
    expect(confirmView(item('mai'), 100).rows[2]).toEqual(['Còn lại', '40']);
    expect(boughtView(item('ban-tra'))).toEqual({ title: 'Đã mua Bàn trà', sub: 'Về nhà để đặt — chạm ô Sân khi trang trí.' });
  });
});

describe('Tạp hoá — hạt giống (R-VUON-9)', () => {
  it('R-VUON-9: 8 thẻ hạt, mua nhiều lần (không "Đã có"); thiếu → "Còn thiếu 1"; chữ xác nhận + tấm đã mua', () => {
    expect(SEED_ITEMS.map((i) => `${i.name} ${i.price}`)).toEqual([
      'Hạt Cải ngọt 4', 'Hạt Củ cải 6', 'Hạt Ngô 8', 'Hạt Lúa 10', 'Hạt Bí đỏ 12', 'Hạt Hoa cúc 14', 'Hạt Dưa hấu 16', 'Hạt Trà 20',
    ]);
    const cai = SEED_ITEMS[0];
    expect(cardState(cai, [cai.id], 10).state).toBe('buy');
    expect(cardState(SEED_ITEMS[2], [], 7)).toEqual({ state: 'short', text: 'Còn thiếu 1', short: 1 });
    expect(seedCrop(cai)?.id).toBe('cai');
    expect(boughtView(cai)).toEqual({ title: 'Đã mua Hạt Cải ngọt', sub: 'Về Vườn rau để gieo — hạt ở trong túi hạt.' });
    // hạt không tính vào dải "đã có đủ 13 món"
    expect(shopBanner([...DECOR_ITEMS, ...SEED_ITEMS], ALL, 300)).toBe('allBought');
  });

  it('R-VUON-9: thẻ hạt "Trong túi: n" + thời gian; tab Hạt giống có dòng trên lưới', () => {
    expect(seedLine(SEED_ITEMS[2], { ngo: 1 })).toEqual({ inBag: 1, text: 'Trong túi: 1', time: '2 giờ' });
    expect(seedLine(SEED_ITEMS[1], {})).toEqual({ inBag: 0, text: 'Trong túi: 0', time: '1 giờ' });
    expect(seedLine(item('mai'), {})).toBeNull();
    expect(SEED_GRID_HINT).toContain('× 1 · × 5 · × 10');
  });

  it('R-VUON-9: có 1 280, × 5 Hạt Ngô → "Giá (5 hạt) −40", "Mua · 40"; có 50, × 10 → "Còn thiếu 30"', () => {
    const ngo = SEED_ITEMS[2];
    const v = confirmView(ngo, 1280, { count: 5, inBag: 1 });
    expect(`${v.before} ${v.after}`).toBe('Mua Hạt Ngô · 8 Văn tiền / hạt');
    expect(v.sub).toBe('Hạt vào túi hạt · gieo ở Vườn rau. Trong túi: 1.');
    expect(v.rows).toEqual([['Đang có', '1 280'], ['Giá (5 hạt)', '−40'], ['Còn lại', '1 240']]);
    expect(v.buy).toBe('Mua · 40');
    expect(v.short).toBe(0);
    const s = confirmView(ngo, 50, { count: 10, inBag: 0 });
    expect(s.short).toBe(30);
    expect(s.buy).toBe('Còn thiếu 30');
    expect(s.rows[2]).toEqual(['Còn lại', '—']);
    expect(SEED_QTY).toEqual([1, 5, 10]);
  });
});
