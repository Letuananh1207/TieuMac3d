/**
 * Biển tên trò chơi ở Kỳ Văn Uyển + lời giảng cách chơi (R-GIAO-2): đứng gần biển → nút "Cách chơi" → NPC của bàn giảng
 * luật trong khung thoại có sẵn, nhiều trang ("Tiếp" … "Đã hiểu"). Lời giảng tóm đúng R-GIAO-1, R-CO-1…3, R-DAU-1…2.
 * Thuần, không three, không DOM.
 */
import { DIALOGS, type Dialog } from './dialogs';

/** R-GIAO-2: đứng cách biển dưới khoảng này (m) thì hiện nút "Cách chơi". */
export const GUIDE_RANGE = 2.5;

/** Biển tên trò trong đặc tả cảnh (cùng dạng `gameTables[].sign` + `kind`, `npc` của bàn — zones không import scene). */
export interface GameSign {
  kind: string;
  npc: string;
  x: number;
  z: number;
  han: string;
  name: string;
}

/** Bàn chơi trong đặc tả cảnh (chỉ phần cần). */
export interface TableLike {
  kind: string;
  npc: string;
  sign?: { x: number; z: number; han: string; name: string };
}

/** Lời giảng từng trò, mỗi phần tử một trang. */
const PAGES: Record<string, string[]> = {
  co: [
    'Ngũ Tử Kỳ chơi trên bàn 13 × 13 giao điểm. Đạo hữu cầm quân đen, đi trước; Tiểu Mặc cầm quân trắng.',
    'Tới lượt mình, chạm vào một giao điểm còn trống để đặt quân. Ai có 5 quân liền nhau — ngang, dọc hay chéo — trước thì thắng! Đầy bàn mà chưa ai đủ 5 thì hoà.',
    'Tiểu Mặc chặn giỏi lắm đó: hàng 4 của đạo hữu là Tiểu Mặc chặn liền. Phải đánh hai đầu cùng lúc mới thắng được Tiểu Mặc!',
    'Muốn chơi thì lại gần một bồ đoàn rồi bấm "Vào bàn". Muốn nghỉ thì kéo cần điều khiển hoặc bấm Thiền — ván đó bỏ, không tính.',
  ],
  'dau-chu': [
    'Đấu chữ là ôn bộ thủ con đã học ở Rừng trúc. Mỗi ván 10 câu: mỗi câu một bộ thủ, kèm 4 nghĩa — chỉ một nghĩa đúng.',
    'Câu lẻ con chọn nghĩa, câu chẵn lão chọn. Đúng được 1 điểm. Hết 10 câu, ai nhiều điểm hơn thì thắng, bằng điểm thì hoà.',
    'Trò này chỉ để ôn, không mở bài mới, không tính vào tiến độ. Chưa học bộ nào thì hãy tới Rừng trúc tu luyện trước đã.',
    'Muốn đấu thì lại gần một bồ đoàn, bấm "Vào bàn". Muốn thôi thì kéo cần điều khiển hoặc bấm Thiền — ván đó bỏ.',
  ],
};

/** Các biển trong đặc tả cảnh (bàn có `sign`). */
export function gameSigns(tables: readonly TableLike[]): GameSign[] {
  return tables.flatMap((t) => (t.sign ? [{ kind: t.kind, npc: t.npc, ...t.sign }] : []));
}

/** Biển gần nhất trong tầm nút "Cách chơi" (dưới [GUIDE_RANGE] m); không có → `null` (R-GIAO-2). */
export function signInRange(signs: readonly GameSign[], x: number, z: number): GameSign | null {
  let best: GameSign | null = null;
  let bestD = GUIDE_RANGE;
  for (const s of signs) {
    const d = Math.hypot(x - s.x, z - s.z);
    if (d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}

/** Lời giảng của trò `sign.kind` thành hội thoại của NPC bàn: trang 1 … n, "Tiếp" sang trang sau, trang cuối "Đã hiểu". */
export function guideDialog(sign: Pick<GameSign, 'kind' | 'npc'>): Dialog {
  const pages = PAGES[sign.kind] ?? [];
  const who = DIALOGS.find((d) => d.npc === sign.npc);
  return {
    npc: sign.npc,
    name: who?.name ?? sign.npc,
    han: who?.han,
    start: 'trang-1',
    lines: pages.map((text, i) => ({
      id: `trang-${i + 1}`,
      text,
      choices:
        i < pages.length - 1
          ? [
              { text: 'Tiếp', next: `trang-${i + 2}` },
              { text: 'Đã hiểu', next: null },
            ]
          : [{ text: 'Đã hiểu', next: null }],
    })),
  };
}
