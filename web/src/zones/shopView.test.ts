import { describe, expect, it } from 'vitest';
import { DECOR_ITEMS, decorItem, STARTER_DECOR } from './decor';
import { boughtView, cardState, confirmView, SHOP_TABS, shopBanner, shopGroups } from './shopView';

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
    expect(SHOP_TABS.map((t) => t.label)).toEqual(['Tất cả', 'Vườn', 'Sân', 'Trong nhà']);
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
    });
    expect(confirmView(item('mai'), 100).rows[2]).toEqual(['Còn lại', '40']);
    expect(boughtView(item('ban-tra'))).toEqual({ title: 'Đã mua Bàn trà', sub: 'Về nhà để đặt — chạm ô Sân khi trang trí.' });
  });
});
