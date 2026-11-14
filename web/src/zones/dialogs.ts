/**
 * Hội thoại với NPC (R-NPC-2): dữ liệu lời thoại + bộ chạy hội thoại. Không three, không DOM — khung thoại (giao diện)
 * chờ thiết kế (phiếu `docs/phieu_thiet_ke/2026-11-13-hoi-thoai-npc.md`), nối ở `main.ts`.
 */

/** Một lựa chọn của người chơi. `next` = mã câu tiếp theo; `null` = đóng khung thoại (Tạm biệt). */
export interface DialogChoice {
  text: string;
  next: string | null;
  /** đóng khung thoại rồi làm việc này: `daily` = mở bảng nhiệm vụ hằng ngày (R-NV-3); `borrow` = mượn cuốn `book`, hoặc
   *  mở danh mục khi không có `book` (R-SACH-1); `return` = trả sách đang mượn (R-SACH-4); `journey` = trận sư đọc tiến
   *  độ hành trình (R-NPC-5) */
  action?: 'daily' | 'borrow' | 'return' | 'journey';
  /** mã sách cho `action: 'borrow'` */
  book?: string;
}

/** Một câu NPC nói, kèm các lựa chọn (1–3; câu nào cũng có "Tạm biệt"). */
export interface DialogLine {
  id: string;
  text: string;
  choices: DialogChoice[];
}

/** Hội thoại của một NPC (`npc` = mã NPC trong đặc tả cảnh `npcs[].id`). */
export interface Dialog {
  npc: string;
  /** tên hiện trên khung thoại */
  name: string;
  han?: string;
  start: string;
  lines: DialogLine[];
}

const BYE: DialogChoice = { text: 'Tạm biệt', next: null };
const OTHER: DialogChoice = { text: 'Hỏi chuyện khác', next: 'chao' };

/** Lời thoại các NPC. Tiểu Mặc: vui vẻ, hiếu động, tự xưng bằng tên, gọi người chơi là "đạo hữu" (không phân nam nữ). */
export const DIALOGS: Dialog[] = [
  {
    npc: 'tieu-mac',
    name: 'Tiểu Mặc',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: 'Đạo hữu mới đến Khởi Nguyên Trấn à? Ai cũng bắt đầu từ đây đó! Hôm nay Tiểu Mặc được giao trông bảng nhiệm vụ hằng ngày của trấn.',
        choices: [
          { text: 'Tiểu Mặc đứng đây làm gì?', next: 'don-khach' },
          { text: 'Hôm nay có việc gì?', next: null, action: 'daily' },
          BYE,
        ],
      },
      {
        id: 'don-khach',
        text: 'Trông bảng nhiệm vụ, đón người mới chứ sao! Việc trấn giao mỗi ngày đều dán ở bảng này — đạo hữu nhớ ghé xem nha. Ai bước qua cổng trăng kia là bắt đầu đường tu chữ — học thêm một chữ, thêm một phần tu vi.',
        choices: [{ text: 'Tu chữ ở đâu?', next: 'tu-chu' }, OTHER, BYE],
      },
      {
        id: 'tu-chu',
        text: 'Sư phụ Mặc Ông đứng ở Truyền Tống Đài ngoài cổng đông đó! Đạo hữu tới hỏi thầy, thầy chỉ cho cách sang Rừng trúc tu chữ.',
        choices: [{ text: 'Hôm nay Tiểu Mặc thế nào?', next: 'hom-nay' }, OTHER, BYE],
      },
      {
        id: 'hom-nay',
        text: 'Vui lắm! Sáng nay Tiểu Mặc luyện kiếm xong còn thuộc thêm ba chữ mới. Đạo hữu cũng cố lên nha!',
        choices: [{ text: 'Tiểu Mặc giỏi quá!', next: 'khen' }, OTHER, BYE],
      },
      {
        id: 'khen',
        text: 'Hì hì, đạo hữu khen làm Tiểu Mặc đỏ mặt mất. Mau đi tu kẻo Tiểu Mặc bỏ xa đấy!',
        choices: [OTHER, BYE],
      },
    ],
  },
  // Sư phụ Mặc Ông: hiền, thanh nhã, xưng "lão phu", gọi người chơi là "con" (không phân nam nữ).
  {
    npc: 'su-phu',
    name: 'Mặc Ông',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: 'Con đến rồi đấy à. Lão phu là Mặc Ông, giữ Truyền Tống Đài này. Khởi Nguyên Trấn là nơi mọi người bắt đầu, đường nào cũng qua đây — muốn học, con phải đi qua đài sang các vùng.',
        choices: [
          { text: 'Thưa thầy, đi thế nào ạ?', next: 'di' },
          { text: 'Thưa thầy, học thế nào ạ?', next: 'hoc' },
          BYE,
        ],
      },
      {
        id: 'di',
        text: 'Bước vào vòng trận giữa đài, đứng yên một lát cho trận sáng lên, bản đồ truyền tống sẽ hiện. Chạm nơi đã mở là đi. Lúc muốn về, cứ vào vòng trận ở vùng đó, chọn Khởi Nguyên Trấn.',
        choices: [{ text: 'Con đi được những đâu ạ?', next: 'vung' }, OTHER, BYE],
      },
      {
        id: 'vung',
        text: 'Rừng trúc mở sẵn cho người mới. Học đủ bộ thủ ở Rừng trúc thì Giang Nam mở; học càng nhiều chữ, càng nhiều vùng mở ra.',
        choices: [{ text: 'Sang đó học thế nào ạ?', next: 'hoc' }, OTHER, BYE],
      },
      {
        id: 'hoc',
        text: 'Sang Rừng trúc, tìm chỗ yên tĩnh mà ngồi thiền. Tâm tĩnh thì chữ tự hiện: nét, âm, nghĩa. Mỗi lần ngồi lĩnh hội một chữ — chậm mà chắc, chớ vội.',
        choices: [{ text: 'Con nhớ rồi ạ', next: 'nho' }, OTHER, BYE],
      },
      {
        id: 'nho',
        text: 'Tốt. Nhớ một chữ hôm nay, mai ôn lại một lần — chữ ấy là của con.',
        choices: [{ text: 'Thầy ở tông lâu chưa ạ?', next: 'lau' }, OTHER, BYE],
      },
      {
        id: 'lau',
        text: 'Lâu lắm rồi, tóc lão phu bạc cùng mấy chồng sách trong Tàng Thư Các. Tiểu Mặc ngoài sân kia cũng là học trò lão phu đấy.',
        choices: [OTHER, BYE],
      },
    ],
  },
  // Tiểu nhị trà lâu (R-NPC-3): lanh lợi, xưng "tiểu nhân", gọi "khách quan" (không phân nam nữ).
  {
    npc: 'tieu-nhi',
    name: 'Tiểu nhị',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: 'Khách quan mời vào! Phẩm Minh Các có trà ngon, có đàn hay — khách quan muốn ngồi dưới này hay lên lầu ạ?',
        choices: [
          { text: 'Quán có trà gì?', next: 'tra' },
          { text: 'Lên lầu ngồi thế nào?', next: 'lau' },
          BYE,
        ],
      },
      {
        id: 'tra',
        text: 'Long Tỉnh Tây Hồ thơm cốm non, Bích La Xuân xoăn như ốc, Thiết Quan Âm đậm vị, còn Phổ Nhĩ để lâu năm thì càng uống càng êm. Khách quan cứ chọn chỗ ngồi, trà sẽ có ngay!',
        choices: [{ text: 'Tiếng nhạc ở đâu ra vậy?', next: 'nhac' }, { text: 'Hỏi chuyện khác', next: 'chao' }, BYE],
      },
      {
        id: 'nhac',
        text: 'Đàn cổ cầm của quán phát suốt ngày đó ạ! Vào quán là nghe, ra xa thì nhỏ dần. Ai đến lúc nào cũng nghe cùng một khúc — như cả tông đang ngồi chung một bàn.',
        choices: [{ text: 'Lên lầu ngồi thế nào?', next: 'lau' }, { text: 'Hỏi chuyện khác', next: 'chao' }, BYE],
      },
      {
        id: 'lau',
        text: 'Thang ở ngoài hồi bên phải, khách quan đi thẳng lên là tới. Trên lầu có sập trà ngồi đôi, ghế sát lan can ngắm núi, bàn dài cho cả hội. Dưới này thì ngồi đôn quanh bàn trà — đến gần chỗ nào ưng thì bấm Ngồi.',
        choices: [{ text: 'Quán có trà gì?', next: 'tra' }, { text: 'Hỏi chuyện khác', next: 'chao' }, BYE],
      },
    ],
  },
  // Quản sự Kỳ Văn Uyển (R-NPC-4): chừng mực, xưng "tại hạ", gọi "đạo hữu".
  {
    npc: 'quan-su',
    name: 'Quản sự',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: 'Đạo hữu đến chơi à? Tại hạ trông coi Kỳ Văn Uyển. Trong sân có hai bàn đá dài: một bàn Ngũ Tử Kỳ, một bàn Đấu chữ — mỗi bàn ba chỗ, ai đến trước ngồi trước.',
        choices: [
          { text: 'Ngũ Tử Kỳ chơi thế nào?', next: 'co' },
          { text: 'Đấu chữ là gì?', next: 'dau' },
          BYE,
        ],
      },
      {
        id: 'co',
        text: 'Đạo hữu cầm quân đen, đi trước; Tiểu Mặc cầm quân trắng. Mỗi lượt đặt một quân vào giao điểm trống. Bên nào có 5 quân liền nhau theo hàng ngang, dọc hay chéo trước thì thắng.',
        choices: [{ text: 'Vào bàn thế nào?', next: 'vao' }, { text: 'Hỏi chuyện khác', next: 'chao' }, BYE],
      },
      {
        id: 'dau',
        text: 'Mặc Ông ra 10 câu, mỗi câu một bộ thủ đạo hữu đã học cùng bốn nghĩa — chọn nghĩa đúng. Chỉ là ôn cho nhớ, không ghi gì vào tiến độ, thua cũng chẳng mất gì.',
        choices: [{ text: 'Vào bàn thế nào?', next: 'vao' }, { text: 'Hỏi chuyện khác', next: 'chao' }, BYE],
      },
      {
        id: 'vao',
        text: 'Đến gần một ghế bên bàn, nút "Vào bàn" hiện lên thì bấm. Muốn xem kỹ luật, đọc biển "Cách chơi" ở đầu mỗi bàn.',
        choices: [{ text: 'Hỏi chuyện khác', next: 'chao' }, BYE],
      },
    ],
  },
  // Trận sư Truyền Tống Đài (R-NPC-5): trầm tĩnh, xưng "bần đạo", gọi "đạo hữu"; đọc tiến độ + vùng đi được (`tranSu.ts`).
  {
    npc: 'tran-su',
    name: 'Trận sư',
    start: 'chao',
    lines: [
      {
        id: 'chao',
        text: 'Bần đạo giữ trận đồ của Truyền Tống Đài. Mỗi vùng là một nút trên trận đồ — vùng nào dựng xong thì nút ấy sáng, ai cũng đi được.',
        choices: [
          { text: 'Ta đi được những đâu?', next: null, action: 'journey' },
          { text: 'Trận đồ là gì?', next: 'tran' },
          BYE,
        ],
      },
      {
        id: 'tran',
        text: 'Bước vào vòng trận giữa đài, đứng yên chốc lát cho trận sáng lên, bản đồ truyền tống sẽ mở. Vùng nào đã sáng thì chạm là đi; vùng còn mờ là sắp mở, chờ thêm ít lâu.',
        choices: [{ text: 'Ta đi được những đâu?', next: null, action: 'journey' }, { text: 'Hỏi chuyện khác', next: 'chao' }, BYE],
      },
    ],
  },
];

/** Lỗi dữ liệu hội thoại: câu bắt đầu / câu tiếp không tồn tại, câu thiếu "Tạm biệt", quá 3 lựa chọn, mã trùng. */
export function checkDialog(d: Dialog): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  for (const l of d.lines) {
    if (ids.has(l.id)) out.push(`${d.npc}: câu "${l.id}" trùng mã`);
    ids.add(l.id);
  }
  if (!ids.has(d.start)) out.push(`${d.npc}: câu bắt đầu "${d.start}" không có`);
  for (const l of d.lines) {
    if (l.choices.length < 1 || l.choices.length > 3) out.push(`${d.npc}/${l.id}: cần 1–3 lựa chọn`);
    if (!l.choices.some((c) => c.next === null)) out.push(`${d.npc}/${l.id}: thiếu lựa chọn đóng (Tạm biệt)`);
    for (const c of l.choices) if (c.next !== null && !ids.has(c.next)) out.push(`${d.npc}/${l.id}: "${c.text}" trỏ tới câu không có "${c.next}"`);
  }
  return out;
}

/** Chạy một hội thoại: mở ở câu bắt đầu, chọn lựa chọn thứ i → câu tiếp, hoặc đóng. */
export class DialogRunner {
  private line: DialogLine | null = null;

  constructor(readonly dialog: Dialog) {}

  /** Câu đang hiện; `null` = khung thoại đóng. */
  get current(): DialogLine | null {
    return this.line;
  }

  get open(): boolean {
    return this.line !== null;
  }

  start(): DialogLine {
    this.line = this.byId(this.dialog.start);
    return this.line;
  }

  /** Chọn lựa chọn thứ `i` của câu đang hiện. Trả về câu tiếp, hoặc `null` nếu đóng. Đang đóng / sai chỉ số → không đổi. */
  choose(i: number): DialogLine | null {
    const c = this.line?.choices[i];
    if (!c) return this.line;
    this.line = c.next === null ? null : this.byId(c.next);
    return this.line;
  }

  close(): void {
    this.line = null;
  }

  private byId(id: string): DialogLine {
    const l = this.dialog.lines.find((x) => x.id === id);
    if (!l) throw new Error(`Hội thoại ${this.dialog.npc}: không có câu "${id}"`);
    return l;
  }
}
