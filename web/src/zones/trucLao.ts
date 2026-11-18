/**
 * Thầy **Trúc Lão** ở Trúc Lâm (R-HANH-8, V-45, V-80): dạy **bài từ** mới (giáo trình `tuVung/bai.ts` — R-TU-1) + ôn từ đến
 * hạn qua khung thoại có sẵn (R-NPC-2). Lựa chọn theo tiến độ riêng của người chơi chỉ nằm trong khung thoại, cảnh không
 * đổi (R-VUNG-1). Tên bài chữ Việt (R-HUD-4). Thuần — không three, không DOM; ghép ở `web/src/trucLao.ts`.
 */
import type { Dialog, DialogChoice } from './dialogs';
import { BAI_HOC, type BaiHoc } from './tuVung/bai';
import { baiKeTiep, tuTheoMa } from './tuVung/tu';

/** Mã NPC (đặc tả cảnh `npcs[].id` trong `design/scene/rung-truc.json`; thiếu model → thế bằng khối — R-NPC-1). */
export const TRUC_LAO = 'truc-lao';

export interface TrucLaoInput {
  /** mã bài đã học */
  learned: Iterable<string>;
  /** mã từ đến hạn ôn hôm nay (R-ON-4) — tổng, không cắt 20 */
  due: readonly string[];
}

/** Số từ đến hạn (chỉ đếm mã từ có trong giáo trình). */
export function dueCount(due: readonly string[]): number {
  return due.filter((id) => tuTheoMa(id)).length;
}

const BYE: DialogChoice = { text: 'Tạm biệt', next: null };

/**
 * Khung thoại Trúc Lão theo tiến độ (R-HANH-8): "Học bài mới — <chủ đề>" (còn bài chưa học) · "Ôn từ đến hạn (n)" (n > 0) ·
 * "Tạm biệt". `again` = mở lại sau khi đóng màn bài / lượt ôn → câu "học tiếp".
 */
export function trucLaoDialog(input: TrucLaoInput, again = false, pool: readonly BaiHoc[] = BAI_HOC): Dialog {
  const next = baiKeTiep(input.learned, pool);
  const n = dueCount(input.due);
  const choices: DialogChoice[] = [
    ...(next ? [{ text: `Học bài mới — ${next.ten}`, next: null, action: 'truc' as const, truc: 'hoc' as const }] : []),
    ...(n > 0 ? [{ text: `Ôn từ đến hạn (${n})`, next: null, action: 'truc' as const, truc: 'on' as const }] : []),
    BYE,
  ];
  const text = !next
    ? `Cả giáo trình rừng trúc, cháu đã học hết.${n > 0 ? ' Còn vài từ đến hạn, ôn lại cho lời ở lâu.' : ' Nhớ ôn đúng hạn, lời sẽ ở lại lâu.'}`
    : again
      ? 'Tốt lắm. Trúc lên từng đốt, lời học từng bài — nghe kỹ, nói theo, học tiếp một bài nữa chứ?'
      : 'Lão giữ rừng trúc này đã lâu. Học tiếng cũng như trồng trúc: mỗi bài vài từ, nghe rồi nói theo, lên từng đốt mới thành cây. Cháu học bài nào?';
  return { npc: TRUC_LAO, name: 'Trúc Lão', start: 'chao', lines: [{ id: 'chao', text, choices }] };
}
