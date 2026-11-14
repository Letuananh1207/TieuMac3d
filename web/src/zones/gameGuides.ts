/**
 * Biển tên trò chơi ở Kỳ Văn Uyển + nội dung **bảng cách chơi** (R-GIAO-2, thiết kế 2026-11-13.35): đứng gần biển → nút
 * "Cách chơi" → bảng (`ui/guidePanel.ts`). Chữ theo `design/l10n/vi.arb` `guide*`, nói đúng R-GIAO-1, R-CO-1…3,
 * R-DAU-1…2. `**…**` = chữ đậm. Thuần, không three, không DOM.
 */

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

/** Một mục đánh số của bảng. */
export interface GuideSection {
  title: string;
  body: string;
}

/** Nội dung bảng cách chơi một trò. */
export interface GameGuide {
  /** tên Hán (đầu bảng) */
  han: string;
  /** tên Việt (Lora, cạnh tên Hán) */
  name: string;
  intro: string;
  /** hình minh hoạ: lưới cờ hay thẻ bộ thủ + 4 nghĩa */
  figure: 'co' | 'dau-chu';
  caption: string;
  /** 4 mục: Mục tiêu · Mỗi lượt · Thắng · thua · hoà · Vào bàn · rời bàn */
  sections: GuideSection[];
  /** mã NPC cho mẹo (chân dung + tên) */
  tipBy: string;
  tip: string;
  /** ô báo đầu vùng cuộn khi chưa học bộ thủ nào (chỉ Đấu chữ — R-DAU-1) */
  none?: GuideSection;
}

/** Mục 4 chung (guideSeatBody). */
const SEAT: GuideSection = {
  title: 'Vào bàn · rời bàn',
  body: 'Đứng gần một bồ đoàn → nút **"Vào bàn"**. Muốn đứng dậy: bấm **"Rời bàn"** góc trên trái — ván đang chơi bỏ, không tính.',
};

const GUIDES: Record<string, GameGuide> = {
  co: {
    han: '五子棋',
    name: 'Ngũ Tử Kỳ',
    intro: 'Cờ năm quân — đấu với Tiểu Mặc.',
    figure: 'co',
    caption: '**5 quân đen liền chéo** sáng lên — đen thắng. Ngang, dọc hay chéo đều được.',
    sections: [
      { title: 'Mục tiêu', body: 'Xếp **5 quân đen liền nhau** — ngang, dọc hoặc chéo — trước Tiểu Mặc.' },
      {
        title: 'Mỗi lượt',
        body: 'Bàn 13 × 13 giao điểm. Đạo hữu cầm **quân đen, đi trước**; Tiểu Mặc cầm trắng. Tới lượt: **chạm một giao điểm trống** để đặt quân.',
      },
      {
        title: 'Thắng · thua · hoà',
        body: 'Ai có 5 quân trở lên liền nhau trước thì thắng. Đầy bàn mà chưa ai đủ 5 → **hoà**. Hết ván, 5 quân thắng sáng lên rồi ván mới bắt đầu — đạo hữu lại đi trước.',
      },
      SEAT,
    ],
    tipBy: 'tieu-mac',
    tip: 'Hàng 4 của đạo hữu, đệ luôn chặn! Muốn thắng phải mở **hai đường** cùng lúc.',
  },
  'dau-chu': {
    han: '鬥字',
    name: 'Đấu chữ',
    intro: 'Ôn bộ thủ đã học — đấu 10 câu với Mặc Ông.',
    figure: 'dau-chu',
    caption: 'Mỗi câu một bộ thủ + **4 nghĩa, đúng một**. Chọn đúng → **+1 điểm**.',
    sections: [
      {
        title: 'Mục tiêu',
        body: 'Đoán đúng nghĩa bộ thủ **nhiều hơn Mặc Ông**. Chỉ ôn bộ đã học ở Rừng trúc — không mở bài mới, không tính tiến độ.',
      },
      {
        title: 'Mỗi lượt',
        body: 'Ván 10 câu, hai bên thay phiên: câu **1, 3, 5, 7, 9** đạo hữu chạm một nghĩa; câu **2, 4, 6, 8, 10** Mặc Ông nghĩ 1–2 giây rồi chọn. Sau mỗi câu, nghĩa đúng hiện ra một chút.',
      },
      { title: 'Thắng · thua · hoà', body: 'Hết 10 câu: nhiều điểm hơn thì **thắng**, bằng điểm thì **hoà**.' },
      SEAT,
    ],
    tipBy: 'su-phu',
    tip: 'Nhìn hình mà đoán: 木 là cái cây — trên có cành, dưới có rễ.',
    none: {
      title: 'Đạo hữu chưa học bộ thủ nào',
      body: 'Đấu chữ chỉ ôn bộ đã học, nên chưa chơi được. Hãy tới **Rừng trúc** tu luyện trước — đi Truyền Tống Đài, chọn Rừng trúc.',
    },
  },
};

/** Bảng cách chơi của trò [kind]; trò chưa có bảng → `null`. */
export function gameGuide(kind: string): GameGuide | null {
  return GUIDES[kind] ?? null;
}

/** Tách "a **b** c" thành phần thường / đậm (dựng DOM bằng textContent, không innerHTML). */
export function boldParts(text: string): { text: string; bold: boolean }[] {
  return text
    .split('**')
    .map((t, i) => ({ text: t, bold: i % 2 === 1 }))
    .filter((p) => p.text.length > 0);
}

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
