import { describe, expect, it } from 'vitest';
import { STARTER_COUNTS } from './decor';
import { bagKey, boughtView, cardState, isFertEntry, confirmView, DECOR_ENTRIES, SEED_GRID_HINT, SEED_ITEMS, SEED_QTY, seedCrop, seedLine, SHOP_TABS, shopBanner, shopSubtitle, FERT_SHORT, shopGroups, stockLine } from './shopView';

const DECOR_ITEMS = DECOR_ENTRIES;
const item = (id: string) => {
  const it = DECOR_ENTRIES.find((i) => i.id === id);
  if (!it) throw new Error(id);
  return it;
};

describe('Tạp hoá bản web — thẻ theo cái, tab, dải (R-TIEN-4)', () => {
  it('R-TIEN-4: nút luôn "Mua" (cả vật đã có); có 40, Tùng 80 → "Còn thiếu 40"', () => {
    expect(cardState(item('truc-canh'), 300)).toEqual({ state: 'buy', text: 'Mua', short: 0 });
    expect(cardState(item('tung'), 40)).toEqual({ state: 'short', text: 'Còn thiếu 40', short: 40 });
  });

  it('R-TIEN-4: thẻ "Trong túi: n · Đang đặt: m"; chưa có cái nào → "Chưa có"; mới cài Trúc cảnh "Trong túi: 1"', () => {
    const stock = { owned: { ...STARTER_COUNTS, mai: 2 }, placed: { mai: 1 } };
    expect(stockLine(item('mai'), stock)).toEqual({ inBag: 1, placed: 1, has: true, text: 'Trong túi: 1 · Đang đặt: 1' });
    expect(stockLine(item('truc-canh'), stock)?.text).toBe('Trong túi: 1 · Đang đặt: 0');
    expect(stockLine(item('tung'), stock)).toMatchObject({ has: false, text: 'Chưa có' });
    expect(stockLine(SEED_ITEMS[1], stock)).toBeNull();
  });

  it('R-TIEN-4: tab Tất cả · Ngoài trời · Trong nhà · Làm vườn; "Tất cả" chia nhóm có tiêu đề, theo thứ tự danh mục', () => {
    expect(SHOP_TABS.map((t) => t.label)).toEqual(['Tất cả', 'Ngoài trời', 'Trong nhà', 'Làm vườn']);
    const all = shopGroups(DECOR_ITEMS, 300, 'all', null);
    expect(all.map((g) => g.title)).toEqual(['Ngoài trời', 'Trong nhà']);
    expect(all[0].cards.map((c) => c.item.id)).toEqual(['truc-canh', 'mai', 'tung', 'da-thai-ho', 'ao-sen', 'den-long', 'ban-tra', 'chau-lan', 'lu-huong']);
    expect(all.flatMap((g) => g.cards).length).toBe(13);
    const trong = shopGroups(DECOR_ITEMS, 300, 'trong', 'ke-sach');
    expect(trong).toHaveLength(1);
    expect(trong[0].title).toBeNull();
    expect(trong[0].cards.map((c) => [c.item.id, c.picked])).toEqual([['tranh-chu', false], ['ke-sach', true], ['an-doc', false], ['binh-phong', false]]);
  });

  it('R-TIEN-4: không mua nổi đồ trang trí rẻ nhất → dải gợi ý; không còn dải "đã mua hết"', () => {
    expect(shopBanner(DECOR_ITEMS, 300)).toBeNull();
    expect(shopBanner(DECOR_ITEMS, 29)).toBe('poor'); // rẻ nhất: Trúc cảnh / Đèn lồng 30
    expect(shopBanner(DECOR_ITEMS, 30)).toBeNull();
  });

  it('R-TIEN-4: hộp xác nhận × 1 — đang có / giá / còn lại, "Mỗi lần mua 1 cái vào túi …"; báo "Đã mua … · Trong túi k"', () => {
    expect(confirmView(item('da-thai-ho'), 160, undefined, { owned: {}, placed: {} })).toEqual({
      before: 'Mua Đá Thái Hồ',
      after: 'với 160 Văn tiền?',
      sub: 'Mỗi lần mua 1 cái vào túi · đặt ở sân Nhà của ta. Đang có: 0 trong túi, 0 đang đặt.',
      rows: [['Đang có', '160'], ['Giá', '−160'], ['Còn lại', '0']],
      buy: 'Mua · 160',
      short: 0,
    });
    expect(confirmView(item('ke-sach'), 200, undefined, { owned: { 'ke-sach': 2 }, placed: { 'ke-sach': 1 } }).sub).toBe(
      'Mỗi lần mua 1 cái vào túi · đặt ở gian trong Nhà của ta. Đang có: 1 trong túi, 1 đang đặt.',
    );
    expect(confirmView(item('mai'), 100).rows[2]).toEqual(['Còn lại', '40']);
    expect(boughtView(item('ban-tra'), 2)).toEqual({ title: 'Đã mua Bàn trà', sub: 'Trong túi 2 · về nhà để đặt' });
  });
});

describe('Tạp hoá — hạt giống (R-VUON-9)', () => {
  it('R-VUON-9: 8 thẻ hạt, mua nhiều lần (không "Đã có"); thiếu → "Còn thiếu 1"; chữ xác nhận + tấm đã mua', () => {
    expect(SEED_ITEMS.map((i) => `${i.name} ${i.price}`)).toEqual([
      'Phân bón 10', 'Hạt Cải ngọt 4', 'Hạt Củ cải 6', 'Hạt Ngô 8', 'Hạt Lúa 10', 'Hạt Bí đỏ 12', 'Hạt Hoa cúc 14', 'Hạt Dưa hấu 16', 'Hạt Trà 20',
    ]);
    const cai = SEED_ITEMS[1];
    expect(cardState(cai, 10).state).toBe('buy');
    expect(cardState(SEED_ITEMS[3], 7)).toEqual({ state: 'short', text: 'Còn thiếu 1', short: 1 });
    expect(seedCrop(cai)?.id).toBe('cai');
    expect(boughtView(cai)).toEqual({ title: 'Đã mua Hạt Cải ngọt', sub: 'Về Vườn rau để gieo — hạt ở trong túi hạt.' });
    // hạt rẻ không làm mất dải nghèo của đồ trang trí
    expect(shopBanner([...DECOR_ITEMS, ...SEED_ITEMS], 20)).toBe('poor');
  });

  it('R-VUON-9: thẻ hạt "Trong túi: n" + thời gian; tab Làm vườn có dòng trên lưới', () => {
    expect(seedLine(SEED_ITEMS[3], { ngo: 1 })).toEqual({ inBag: 1, text: 'Trong túi: 1', time: '2 giờ' });
    expect(seedLine(SEED_ITEMS[2], {})).toEqual({ inBag: 0, text: 'Trong túi: 0', time: '1 giờ' });
    expect(seedLine(item('mai'), {})).toBeNull();
    expect(SEED_GRID_HINT).toContain('× 1 · × 5 · × 10');
  });

  it('R-VUON-9: có 1 280, × 5 Hạt Ngô → "Giá (5 hạt) −40", "Mua · 40"; có 50, × 10 → "Còn thiếu 30"', () => {
    const ngo = SEED_ITEMS[3];
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

  it('R-VUON-12: thẻ Phân bón 10 Văn / bao đứng đầu tab Làm vườn; có 40, × 5 → "Giá (5 bao) −50", "Còn thiếu 10"; tấm đã mua', () => {
    const phan = SEED_ITEMS[0];
    expect(FERT_SHORT).toBe('chín nhanh gấp đôi');
    expect(shopSubtitle(true)).toBe('Đồ trang trí Nhà của ta · hạt giống, phân bón cho Vườn rau');
    expect(isFertEntry(phan)).toBe(true);
    expect(bagKey(phan)).toBe('phan');
    expect(seedLine(phan, { phan: 3 })).toEqual({ inBag: 3, text: 'Trong túi: 3', time: null });
    const v = confirmView(phan, 40, { count: 5, inBag: 3 });
    expect(`${v.before} ${v.after}`).toBe('Mua Phân bón · 10 Văn tiền / bao');
    expect(v.sub).toBe('Phân vào túi · bón ở Vườn rau cho mau lớn. Trong túi: 3.');
    expect(v.rows[1]).toEqual(['Giá (5 bao)', '−50']);
    expect(v.buy).toBe('Còn thiếu 10');
    expect(boughtView(phan).sub).toBe('Về Vườn rau để bón — phân ở trong túi.');
  });
});
