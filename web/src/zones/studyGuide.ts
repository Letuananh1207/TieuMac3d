/**
 * Hướng dẫn **Khu tự học** tầng 2 Tàng Thư Các (R-VA-5, thiết kế 2026-11-14.17): đứng gần biển gỗ "Khu tự học"
 * → nút nổi "Hướng dẫn" → bảng, cùng khung bảng cách chơi (`gameGuides.ts`, `ui/guidePanel.ts`). Chữ theo
 * `design/l10n/vi.arb` `studyGuide*`, nói đúng R-VA-4, R-ON-8, R-NGOI-1, R-VUNG-1. Thuần, không three, không DOM.
 */
import { gameGuide, type GameGuide, type GameSign } from './gameGuides';
import { LIBRARIAN } from './library';
import { placeName } from './journeyMap';

/** vùng học bộ thủ: tên lấy từ bản đồ (R-HANH-1), không viết cứng */
const FOREST = placeName('rung-truc');

/** Mã biển khu tự học trong danh sách biển có nút nổi (cạnh `kind` của bàn chơi). */
export const STUDY_KIND = 'tu-hoc';

export const STUDY_GUIDE: GameGuide = {
  label: 'Hướng dẫn',
  eyebrow: 'Tàng Thư Các · Hướng dẫn',
  name: 'Khu tự học',
  intro: 'Ngồi bồ đoàn, mở cuộn sách ôn bộ thủ đã học.',
  figure: 'tu-hoc',
  caption: `Ngồi **1 giây** → cuộn sách mở. Ở đây **ôn** và **xem bộ đã học**; học bộ mới ở ${FOREST}.`,
  sections: [
    {
      title: 'Ngồi vào bồ đoàn',
      body: 'Đứng gần một bồ đoàn đỏ → nút nổi **"Ngồi"**. Bấm → ngồi xếp bằng, quay mặt về phía nam. Bồ đoàn nào cũng được — 24 chỗ.',
    },
    {
      title: 'Cuộn sách ôn',
      body: 'Ngồi đủ **1 giây** → nhập định, cuộn sách mở trên tay. Chọn **"Ôn bộ đến hạn"** để ôn (ôn đúng được Văn tiền) hoặc **"Xem bộ đã học"** để mở lại thẻ cũ. Đóng thẻ / màn ôn → vẫn ngồi, cuộn sách hiện lại.',
    },
    {
      title: `Học bộ mới ở ${FOREST}`,
      body: `Trong trấn, **"Học bộ mới"** mờ, ghi "Học ở ${FOREST}". Muốn học bộ mới: ra **Truyền Tống Đài**, chọn ${FOREST} rồi Ngồi ôn ở đó.`,
    },
    {
      title: 'Đứng dậy',
      body: 'Bấm **"Đứng dậy"** trên cuộn sách → đứng khỏi bồ đoàn. Lúc cuộn sách mở, nhân vật ngồi yên.',
    },
  ],
  tipBy: LIBRARIAN,
  tipTitle: 'Lời thủ thư Điển Thư',
  tip: 'Mỗi ngày ôn một ít, chữ sẽ ở lại lâu. Số son trên nút **Ngồi ôn** là số bộ đến hạn hôm nay.',
  none: {
    icon: 'ban-do',
    title: 'Đạo hữu chưa học bộ thủ nào',
    body: `Cuộn sách ở đây chỉ để ôn, nên chưa có gì để ôn. Hãy tới **${FOREST}** học bộ đầu tiên — đi Truyền Tống Đài, chọn ${FOREST}.`,
  },
};

/** Biển "Khu tự học" (chân biển, toạ độ cảnh) → biển có nút nổi; chip dưới nút ghi "Khu tự học" (R-VA-5, R-HUD-4). */
export function studySign(at: { x: number; y: number; z: number }): GameSign {
  return { kind: STUDY_KIND, npc: LIBRARIAN, x: at.x, z: at.z, y: at.y, han: '', name: STUDY_GUIDE.name };
}

/** Bảng của một biển: khu tự học hay cách chơi trò [kind]; chưa có bảng → `null`. */
export function guideOf(kind: string): GameGuide | null {
  return kind === STUDY_KIND ? STUDY_GUIDE : gameGuide(kind);
}
