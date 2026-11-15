/**
 * Biển tên trò chơi ở Kỳ Văn Uyển + nội dung **bảng cách chơi** (R-GIAO-2, thiết kế 2026-11-13.35): đứng gần biển → nút
 * "Cách chơi" → bảng (`ui/guidePanel.ts`). Chữ theo `design/l10n/vi.arb` `guide*`, nói đúng R-GIAO-1, R-CO-1…3,
 * R-DAU-1…2. `**…**` = chữ đậm. Thuần, không three, không DOM. Cùng khung bảng: hướng dẫn Khu tự học (`studyGuide.ts`).
 */
import { placeName } from './journeyMap';

/** vùng học bộ thủ: tên lấy từ bản đồ (R-HANH-1), không viết cứng */
const FOREST = placeName('rung-truc');

/** Hai biển lệch cao hơn khoảng này (m) = khác tầng → không hiện nút (như chỗ ngồi, R-VA-4). */
const FLOOR_GAP = 1;

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
  /** độ cao chân biển (biển trên lầu — R-VA-5); không có = trên mặt đất, không xét tầng */
  y?: number;
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

/** Ô báo đầu vùng cuộn khi chưa học bộ thủ nào; `icon` = biểu tượng bên trái (lửa / bản đồ). */
export interface GuideNotice extends GuideSection {
  icon: 'lua' | 'ban-do';
}

/** Nội dung bảng cách chơi một trò (hoặc bảng hướng dẫn một khu — cùng khung). */
export interface GameGuide {
  /** tên bảng: "Cách chơi" / "Hướng dẫn" (nhãn trợ năng, "Cách chơi Ngũ Tử Kỳ") */
  label: string;
  /** dòng chữ nhỏ trên đầu bảng */
  eyebrow: string;
  /** tên Việt (Lora, đầu bảng — không kèm chữ Hán, R-HUD-4) */
  name: string;
  intro: string;
  /** hình minh hoạ: lưới cờ, thẻ bộ thủ + 4 nghĩa, hay người ngồi bồ đoàn + cuộn sách (khu tự học); `none` = chưa có hình
   *  (trò Trúc Lâm — chờ thiết kế), chỉ dòng chú thích */
  figure: 'co' | 'dau-chu' | 'tu-hoc' | 'none';
  caption: string;
  /** 4 mục: Mục tiêu · Mỗi lượt · Thắng · thua · hoà · Vào bàn · rời bàn */
  sections: GuideSection[];
  /** mã NPC cho mẹo (chân dung + tên) */
  tipBy: string;
  /** đầu ô mẹo; không có → "Mẹo của <tên NPC>" */
  tipTitle?: string;
  tip: string;
  /** ô báo đầu vùng cuộn khi chưa học bộ thủ nào (Đấu chữ — R-DAU-1; khu tự học — R-VA-5) */
  none?: GuideNotice;
}

const EYEBROW = 'Kỳ Văn Uyển · Cách chơi';

/** Mục 4 chung (guideSeatBody). */
const SEAT: GuideSection = {
  title: 'Vào bàn · rời bàn',
  body: 'Đứng gần một bồ đoàn → nút **"Vào bàn"**. Muốn đứng dậy: bấm **"Rời bàn"** góc trên trái — ván đang chơi bỏ, không tính.',
};

const GUIDES: Record<string, GameGuide> = {
  co: {
    label: 'Cách chơi',
    eyebrow: EYEBROW,
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
    label: 'Cách chơi',
    eyebrow: EYEBROW,
    name: 'Đấu chữ',
    intro: 'Ôn bộ thủ đã học — đấu 10 câu với Mặc Ông.',
    figure: 'dau-chu',
    caption: 'Mỗi câu một bộ thủ + **4 nghĩa, đúng một**. Chọn đúng → **+1 điểm**.',
    sections: [
      {
        title: 'Mục tiêu',
        body: `Đoán đúng nghĩa bộ thủ **nhiều hơn Mặc Ông**. Chỉ ôn bộ đã học ở ${FOREST} — không mở bài mới, không tính tiến độ.`,
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
      icon: 'lua',
      title: 'Đạo hữu chưa học bộ thủ nào',
      body: `Đấu chữ chỉ ôn bộ đã học, nên chưa chơi được. Hãy tới **${FOREST}** tu luyện trước — đi Truyền Tống Đài, chọn ${FOREST}.`,
    },
  },
};

/* ---------- 3 trò Trúc Lâm (V-66 B4 — R-LUU-1…5, R-MANG-1…5, R-CAM-1…4) ---------- */

const TRUC = 'Trúc Lâm · Cách chơi';

const TRUC_LAM_GUIDES: Record<string, GameGuide> = {
  'luu-thuong': {
    label: 'Cách chơi',
    eyebrow: TRUC,
    name: 'Lưu Thương Lệnh',
    intro: 'Thả chén theo mương — chén dừng trước ai, người đó ghép chữ.',
    figure: 'none',
    caption: 'Phần còn lại của chữ có sẵn — chọn **bộ thủ** cho đúng: 可 + **氵** = 河 (hà — sông).',
    sections: [
      {
        title: 'Vào tiệc',
        body: 'Nói chuyện với **Thi Ông** → **"Dự tiệc Lưu Thương"**. Cần đã học **ít nhất 3 bộ thủ**. Đạo hữu ngồi vào đệm trống gần nhất, cùng Thi Ông, Tài Nữ, Tú Tài.',
      },
      {
        title: 'Mỗi lượt',
        body: 'Ván **8 lượt** — đạo hữu 4 lượt. Chén lệnh viền vàng trôi 3–6 giây rồi dừng trước một người. Tới lượt đạo hữu: **chạm 1 trong 4 bộ thủ** trong 20 giây. Đúng **+1 điểm**; sai hay hết giờ thì uống chén phạt.',
      },
      {
        title: 'Thắng · thua · hoà',
        body: 'Hết 8 lượt, xếp hạng theo điểm. Hạng nhất một mình **thắng (+8 Văn)**, hạng nhất đồng **hoà (+5)**, còn lại **thua (+3)** — chung mức 60 Văn trò chơi mỗi ngày.',
      },
      { title: 'Rời tiệc', body: 'Bấm **"Rời tiệc"**, nút quay lại hoặc đi đi — đứng dậy cạnh đệm. Rời giữa ván không được thưởng.' },
    ],
    tipBy: 'thi-ong',
    tipTitle: 'Lời Thi Ông',
    tip: 'Nhìn phần còn lại mà đoán nghĩa: có nước thì là sông hồ, có cây thì là rừng.',
    none: {
      icon: 'lua',
      title: 'Đạo hữu chưa đủ 3 bộ thủ',
      body: `Lưu Thương cần ít nhất 3 bộ thủ đã học. Ngồi ôn ngay ở ${FOREST} để học bộ mới rồi lại thả chén.`,
    },
  },
  'hai-mang': {
    label: 'Cách chơi',
    eyebrow: TRUC,
    name: 'Hái măng sau mưa',
    intro: 'Mỗi ngày măng nhú trong rừng trúc — hái rồi bán cho Trúc Ông.',
    figure: 'none',
    caption: 'Hai lứa mỗi ngày: **5 giờ sáng** (8 măng) và **3 giờ chiều** sau cơn mưa phùn (6 măng).',
    sections: [
      { title: 'Tìm măng', body: 'Măng mọc giữa các khóm trúc thưa, mỗi ngày một chỗ khác. Mỗi lứa có **một măng to** vỏ vàng sẫm. Sang ngày mới, măng cũ héo hết.' },
      { title: 'Hái', body: 'Đứng sát măng → nút **"Hái"** (máy tính: phím **E**). Mỗi măng hái một lần.' },
      { title: 'Măng chữ', body: 'Măng to khắc một **bộ thủ đã học**. Đáp đúng nghĩa bộ đó → được **2 măng to**.' },
      { title: 'Bán măng', body: 'Mang về **Trúc Lư**, nói chuyện với **Trúc Ông**: Măng **3 Văn**, Măng to **8 Văn** một cái. Măng để trong túi không hỏng.' },
    ],
    tipBy: 'truc-ong',
    tipTitle: 'Lời Trúc Ông',
    tip: 'Mưa chiều tạnh là măng nhú — ra rừng lúc ba giờ là gặp ngay.',
  },
  'dan-cam': {
    label: 'Cách chơi',
    eyebrow: TRUC,
    name: 'Đàn cầm',
    intro: 'Ngồi sau tảng đá ở bãi giữa, gảy đàn năm âm cho thư thái.',
    figure: 'none',
    caption: 'Năm âm **Cung · Thương · Giốc · Chuỷ · Vũ** — gảy nốt nào cũng thuận tai.',
    sections: [
      { title: 'Ngồi đàn', body: 'Đứng sau tảng đá đàn → nút **"Ngồi đàn"**. Đi đi hoặc bấm nút quay lại để đứng dậy.' },
      { title: 'Đàn tự do', body: 'Chạm dây để gảy (máy tính: phím **1–5** quãng thấp, **Q W E R T** quãng cao). Không chấm điểm, đàn bao lâu tuỳ thích.' },
      { title: 'Theo bài', body: 'Chọn **Suối trúc**, **Mưa măng** hay **Trăng trên gò**: nốt rơi theo 5 làn, gảy khi nốt chạm vạch — **Hay**, **Được** hoặc trượt.' },
      { title: 'Thưởng', body: 'Hết bài: **Tri âm (+5 Văn)**, **Thanh nhã (+3)**, **Tập đàn (+1)**. Mỗi bài thưởng một lần mỗi ngày.' },
    ],
    tipBy: 'thi-ong',
    tipTitle: 'Lời Thi Ông',
    tip: 'Đàn chậm mà đều còn hơn nhanh mà vội — nghe nước suối mà theo nhịp.',
  },
};

/** Bảng cách chơi của trò [kind]; trò chưa có bảng → `null`. */
export function gameGuide(kind: string): GameGuide | null {
  return GUIDES[kind] ?? TRUC_LAM_GUIDES[kind] ?? null;
}

/** Trò nhỏ Trúc Lâm trong đặc tả cảnh (chỉ phần cần — zones không import scene): chỗ đặt nút "Cách chơi". */
export interface MiniGameLike {
  kind: string;
  guide?: [number, number];
  host?: string;
  buyer?: string;
}

/** Biển "Cách chơi" của các trò Trúc Lâm có `guide` (R-GIAO-2). */
export function miniGameSigns(list: readonly MiniGameLike[]): GameSign[] {
  return list.flatMap((m) => {
    const g = gameGuide(m.kind);
    return m.guide && g ? [{ kind: m.kind, npc: m.host ?? m.buyer ?? '', x: m.guide[0], z: m.guide[1], han: '', name: g.name }] : [];
  });
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

/**
 * Biển gần nhất trong tầm nút "Cách chơi" / "Hướng dẫn" (dưới [GUIDE_RANGE] m); không có → `null` (R-GIAO-2, R-VA-5).
 * [y] = chân nhân vật: bỏ biển khác tầng (biển có `y`, lệch cao > 1 m).
 */
export function signInRange(signs: readonly GameSign[], x: number, z: number, y?: number): GameSign | null {
  let best: GameSign | null = null;
  let bestD = GUIDE_RANGE;
  for (const s of signs) {
    if (y !== undefined && s.y !== undefined && Math.abs(s.y - y) > FLOOR_GAP) continue;
    const d = Math.hypot(x - s.x, z - s.z);
    if (d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}
