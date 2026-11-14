/**
 * Chế độ trang trí Nhà của ta (R-NHA-2, R-NHA-4 — thiết kế 2026-11-14.13): chọn ô, thẻ danh mục theo ô (đang đặt / đã
 * có / khoá), chạm thẻ → đặt / thay hoặc tấm báo "Mua ở Tạp hoá", gỡ. Thuần: không DOM, không three; ghép ở `homeDecor.ts`.
 */
import { catalogForSlot, placeDecor, type DecorItem, type DecorSlot, type DecorSlotKind, type HomeState } from './decor';

/** Tên loại ô trên viên nhắc + đầu bảng (chuỗi `decorSlot*`); chữ Hán: 園 theo thiết kế, 院 / 房 theo tên khu cảnh. */
export const SLOT_LABEL: Readonly<Record<DecorSlotKind, { name: string; han: string }>> = {
  vuon: { name: 'Ô vườn', han: '園' },
  san: { name: 'Ô sân', han: '院' },
  trong: { name: 'Ô trong nhà', han: '房' },
};

/** Trạng thái thẻ: đang đặt ở ô này · đã có · chưa có (khoá — chỉ dẫn Tạp hoá). */
export type CardState = 'placed' | 'owned' | 'locked';

export interface DecorCard {
  item: DecorItem;
  state: CardState;
}

/** Thẻ danh mục cho ô: chỉ vật hợp loại ô; đã có trước, khoá sau (rẻ → đắt) — R-NHA-2, R-NHA-4. */
export function decorCards(home: HomeState, slot: DecorSlot): DecorCard[] {
  const here = home.placed[slot.id];
  return catalogForSlot(home, slot.kind).map(({ item, owned }) => ({
    item,
    state: !owned ? 'locked' : item.id === here ? 'placed' : 'owned',
  }));
}

/** Dòng phụ đầu bảng: ô trống "Chọn vật để đặt vào ô", có vật "Chạm vật khác để thay". */
export function panelHint(home: HomeState, slotId: string): string {
  return home.placed[slotId] ? 'Chạm vật khác để thay' : 'Chọn vật để đặt vào ô';
}

/** Tấm báo khi chạm thẻ khoá (`decorBuyAtShopDetail`) — không mua trong nhà (R-NHA-4). */
export function buyAtShopText(item: DecorItem, coins: number): string {
  return `Mua ${item.name} ở Tạp hoá phố chợ — ${item.price} Văn tiền (đang có ${coins})`;
}

/** Kết quả chạm một thẻ: đặt / thay (nhà mới) · khoá (tấm báo) · đang đặt rồi (không đổi). */
export type CardTap =
  | { kind: 'place'; home: HomeState; item: DecorItem }
  | { kind: 'locked'; item: DecorItem }
  | { kind: 'none' };

/** Chạm thẻ `itemId` khi đang chọn ô `slot` (R-NHA-2): vật đã có → đặt / thay; chưa có → khoá; vật đang đặt → không đổi. */
export function tapCard(home: HomeState, slot: DecorSlot, itemId: string): CardTap {
  const card = decorCards(home, slot).find((c) => c.item.id === itemId);
  if (!card || card.state === 'placed') return { kind: 'none' };
  if (card.state === 'locked') return { kind: 'locked', item: card.item };
  const r = placeDecor(home, slot, itemId);
  return r.ok ? { kind: 'place', home: r.home, item: card.item } : { kind: 'none' };
}

/** Gỡ vật khỏi ô (R-NHA-2); ô trống → `null`. Vật vẫn sở hữu (R-NHA-4). */
export function removeFrom(home: HomeState, slot: DecorSlot): HomeState | null {
  if (!home.placed[slot.id]) return null;
  const r = placeDecor(home, slot, null);
  return r.ok ? r.home : null;
}
