/**
 * Thầy **Trúc Lão** ở Trúc Lâm (R-HANH-8, V-45): dạy bộ thủ mới + ôn bộ đến hạn qua khung thoại có sẵn (R-NPC-2) — thay
 * mục "Học bộ mới" / "Ôn bộ đến hạn" cũ trên cuộn khi ngồi (R-ON-8). Lựa chọn theo tiến độ riêng của người chơi chỉ nằm
 * trong khung thoại, cảnh không đổi (R-VUNG-1). Tên bộ ghi chữ Việt (R-HUD-4). Thuần — không three, không DOM;
 * ghép ở `web/src/trucLao.ts`.
 */
import type { Dialog, DialogChoice } from './dialogs';
import { RADICALS, type Radical } from './radicals';

/** Mã NPC (đặc tả cảnh `npcs[].id` trong `design/scene/rung-truc.json`; thiếu model → thế bằng khối — R-NPC-1). */
export const TRUC_LAO = 'truc-lao';

export interface TrucLaoInput {
  /** mã bộ đã học */
  learned: Iterable<string>;
  /** mã bộ đến hạn ôn hôm nay (R-ON-4) */
  due: readonly string[];
}

/** Bộ chưa học đầu tiên theo thứ tự học của Trúc Lâm (R-HANH-3); học đủ → `null`. */
export function nextRadical(learned: Iterable<string>, pool: readonly Radical[] = RADICALS): Radical | null {
  const known = new Set(learned);
  return pool.find((r) => !known.has(r.id)) ?? null;
}

/** Số bộ đến hạn (chỉ đếm mã có trong bộ thủ). */
export function dueCount(due: readonly string[], pool: readonly Radical[] = RADICALS): number {
  const known = new Set(pool.map((r) => r.id));
  return due.filter((id) => known.has(id)).length;
}

const BYE: DialogChoice = { text: 'Tạm biệt', next: null };

/**
 * Khung thoại Trúc Lão theo tiến độ (R-HANH-8): "Học bộ mới — bộ <tên>" (còn bộ chưa học) · "Ôn bộ đến hạn (n)" (n > 0) ·
 * "Tạm biệt". `again` = mở lại sau khi đóng thẻ / lượt ôn → câu "học tiếp".
 */
export function trucLaoDialog(input: TrucLaoInput, again = false, pool: readonly Radical[] = RADICALS): Dialog {
  const next = nextRadical(input.learned, pool);
  const n = dueCount(input.due, pool);
  const choices: DialogChoice[] = [
    ...(next ? [{ text: `Học bộ mới — bộ ${next.name}`, next: null, action: 'truc' as const, truc: 'hoc' as const }] : []),
    ...(n > 0 ? [{ text: `Ôn bộ đến hạn (${n})`, next: null, action: 'truc' as const, truc: 'on' as const }] : []),
    BYE,
  ];
  const text = !next
    ? `Năm mươi bộ thủ của rừng trúc, đạo hữu đã học đủ.${n > 0 ? ' Còn vài bộ đến hạn, ôn lại cho chữ ở lâu.' : ' Nhớ ôn đúng hạn, chữ sẽ ở lại lâu.'}`
    : again
      ? 'Tốt lắm. Trúc lên từng đốt, chữ học từng bộ — học tiếp một bộ nữa chứ?'
      : 'Lão giữ rừng trúc này đã lâu. Chữ cũng như trúc: mỗi bộ thủ là một đốt, lên từng đốt mới thành cây. Đạo hữu muốn học bộ nào?';
  return { npc: TRUC_LAO, name: 'Trúc Lão', start: 'chao', lines: [{ id: 'chao', text, choices }] };
}
