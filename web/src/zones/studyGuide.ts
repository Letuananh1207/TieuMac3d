/**
 * Hướng dẫn **Khu tự học** tầng 2 Tàng Thư Các (R-VA-5, thiết kế 2026-11-14.17): đứng gần biển gỗ "Khu tự học"
 * → nút nổi "Hướng dẫn" → bảng, cùng khung bảng cách chơi (`gameGuides.ts`, `ui/guidePanel.ts`). Chữ theo
 * `design/l10n/vi.arb` `studyGuide*` (V-45 đổi theo cuộn bảng chọn — chuỗi mới chờ thiết kế đặt), nói đúng R-VA-4, R-ON-8,
 * R-NGOI-1, R-VUNG-1, R-HANH-8. Thuần, không three, không DOM.
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
  intro: 'Ngồi bồ đoàn, mở cuộn bảng chọn: đọc sách, xem bộ đã học, nhiệm vụ hôm nay.',
  figure: 'tu-hoc',
  caption: `Ngồi **1 giây** → cuộn mở: **đọc sách**, **xem bộ đã học**, **nhiệm vụ hôm nay** (ôn ở đó); học bộ mới ở ${FOREST}.`,
  sections: [
    {
      title: 'Ngồi vào bồ đoàn',
      body: 'Đứng gần một bồ đoàn đỏ → nút nổi **"Ngồi"**. Bấm → ngồi xếp bằng, quay mặt về phía nam. Bồ đoàn nào cũng được — 24 chỗ.',
    },
    {
      title: 'Cuộn bảng chọn',
      body: 'Ngồi đủ **1 giây** → nhập định, cuộn mở trên tay. **"Đọc sách"** mở sổ từ đang mượn, **"Bộ đã học"** mở lại thẻ cũ, **"Nhiệm vụ hôm nay"** mở bảng nhiệm vụ — bấm **"Ôn ngay"** ở đó để ôn (ôn đúng được Văn tiền). Đóng sổ / bảng → vẫn ngồi, cuộn hiện lại.',
    },
    {
      title: `Học bộ mới ở ${FOREST}`,
      body: `Bộ thủ mới do **thầy Trúc Lão** dạy, ở bãi hạc đáp ${FOREST}. Bấm **Bản đồ**, chọn ${FOREST}, rồi nói chuyện với thầy → **"Học bộ mới"**.`,
    },
    {
      title: 'Đứng dậy',
      body: 'Bấm **"Đứng dậy"** trên cuộn sách → đứng khỏi bồ đoàn. Lúc cuộn sách mở, nhân vật ngồi yên.',
    },
  ],
  tipBy: LIBRARIAN,
  tipTitle: 'Lời thủ thư Điển Thư',
  tip: 'Mỗi ngày ôn một ít, chữ sẽ ở lại lâu. Số son trên nút **Tĩnh toạ** là số bộ đến hạn hôm nay.',
  none: {
    icon: 'ban-do',
    title: 'Đạo hữu chưa học bộ thủ nào',
    body: `Chưa có bộ nào để ôn. Hãy tới **${FOREST}** gặp thầy Trúc Lão học bộ đầu tiên — bấm Bản đồ, chọn ${FOREST}.`,
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
