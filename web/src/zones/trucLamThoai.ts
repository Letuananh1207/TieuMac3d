/**
 * Lời thoại 4 NPC trò chơi Trúc Lâm (V-66 B4): Thi Ông (chủ tiệc Lưu Thương — R-LUU-1), Tài Nữ, Tú Tài (văn nhân), Trúc
 * Ông (mua măng — R-MANG-5). Tên chỉ tiếng Việt (R-HUD-4). Lựa chọn có việc dùng `action: 'mini'` + `mini` (ghép:
 * `web/src/miniGames.ts`). Thuần — không three, không DOM.
 */
import type { Dialog, DialogChoice } from './dialogs';
import { MANG_PRICES, type MangState } from './mang';

const BYE: DialogChoice = { text: 'Thôi', next: null };

export const THI_ONG = 'thi-ong';
export const TRUC_ONG = 'truc-ong';

/** Thi Ông (R-LUU-1): "Dự tiệc Lưu Thương" · "Cách chơi" · "Thôi". */
export function thiOngDialog(): Dialog {
  return {
    npc: THI_ONG,
    name: 'Thi Ông',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: 'Chén lệnh trôi tới ai, người ấy ghép một chữ. Đạo hữu có muốn ngồi cùng?', // luuHostInvite (2026-11-16.13)
        choices: [{ text: 'Dự tiệc Lưu Thương', next: null, action: 'mini', mini: 'luu-du' }, { text: 'Cách chơi', next: null, action: 'mini', mini: 'luu-cach' }, BYE],
      },
    ],
  };
}

/** Tài Nữ, Tú Tài: một câu + mời gặp Thi Ông. */
export function vanNhanDialog(id: 'tai-nu' | 'tu-tai'): Dialog {
  const nu = id === 'tai-nu';
  return {
    npc: id,
    name: nu ? 'Tài Nữ' : 'Tú Tài',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: nu
          ? 'Chữ ghép như người kết bạn — mỗi nửa một tính, hợp lại thành nghĩa mới. Muốn thả chén thì thưa với Thi Ông.'
          : 'Tiểu sinh lần nào cũng uống chén phạt… Đạo hữu ngồi cùng cho vui! Thi Ông là chủ tiệc đấy.',
        choices: [{ text: 'Vâng', next: null }],
      },
    ],
  };
}

/** Tổng Văn tiền nếu bán hết túi (R-MANG-5). */
export function mangValue(bag: MangState['bag']): number {
  return (bag.mang ?? 0) * MANG_PRICES.mang + (bag['mang-to'] ?? 0) * MANG_PRICES['mang-to'];
}

/**
 * Trúc Ông (R-MANG-5, thiết kế 2026-11-16.13 `BanMang-doc-thoai` / `-trong`): có măng → "Bán măng" (mở bảng bán) · "Cách hái
 * măng" (bảng cách chơi — không có biển gỗ) · "Thôi"; túi trống → câu nhắc mưa chiều + "Vâng".
 */
export function trucOngDialog(bag: MangState['bag']): Dialog {
  const has = (bag.mang ?? 0) + (bag['mang-to'] ?? 0) > 0;
  return {
    npc: TRUC_ONG,
    name: 'Trúc Ông',
    start: 'chao',
    lines: [
      has
        ? {
            id: 'chao',
            text: 'Măng rừng sau mưa ngọt lắm. Con hái được bao nhiêu, lão mua bấy nhiêu.', // trucOngGreet
            choices: [
              { text: 'Bán măng', next: null, action: 'mini', mini: 'mang-ban' },
              { text: 'Cách hái măng', next: null, action: 'mini', mini: 'mang-cach' },
              BYE,
            ],
          }
        : { id: 'chao', text: 'Túi con còn trống. Mưa chiều xong là măng lại nhú.', choices: [{ text: 'Vâng', next: null }] }, // trucOngEmpty
    ],
  };
}
