/**
 * Mẹo / tin đồn Tiểu Khất kể sau khi được cho tiền (R-NPC-6). Mỗi câu ghi mã luật nó nói tới — đổi luật đó thì soát lại
 * câu (test `alms.test.ts` kiểm mã luật có trong sổ). Chỉ tiếng Việt (R-HUD-4), không chữ Hán.
 */

export interface TinDon {
  /** mã luật câu này nói tới (để soát khi đổi luật) */
  rule: string;
  text: string;
}

export const TIN_DON: readonly TinDon[] = [
  { rule: 'R-TIEN-3', text: 'Nghe đồn Kỳ Văn Uyển đánh một ván Đấu chữ thắng được 8 văn đó, thua cũng được 3 văn!' },
  { rule: 'R-TIEN-2', text: 'Tiểu khất nghe nói học xong một bài từ mới là được thưởng 10 văn. Đạo hữu chăm học là giàu to!' },
  { rule: 'R-NV-1', text: 'Đạo hữu xem bảng nhiệm vụ hằng ngày trước cổng nam chưa? Làm xong cả hai việc được 20 văn đó.' },
  { rule: 'R-NV-2', text: 'Nghe nói ai làm nhiệm vụ đủ 7 ngày liền thì được thưởng thêm 50 văn. Tiểu khất mà biết chữ thì đã làm rồi…' },
  { rule: 'R-TIEN-4', text: 'Tạp hoá bên kia bán chậu Mai 60 văn, Ao sen tận 200 văn. Mua về đặt ở nhà đẹp lắm!' },
  { rule: 'R-NHAC-1', text: 'Trà lâu bên Đồi Chè có tiếng đàn cổ cầm suốt ngày. Vào lúc nào cũng nghe đúng khúc đang dạo.' },
  { rule: 'R-CO-1', text: 'Chơi Ngũ Tử Kỳ thì nhớ: ai xếp được 5 quân liền nhau, ngang dọc hay chéo, là thắng.' },
  { rule: 'R-HANH-2', text: 'Đứng vào vòng trận ở Truyền Tống Đài một lúc là đi được tới vùng khác. Tiểu khất chưa dám thử.' },
  { rule: 'R-SACH-1', text: 'Thủ thư ở Tàng Thư Các cho mượn sách HSK, mỗi lần một cuốn thôi đó.' },
  { rule: 'R-NHA-1', text: 'Đạo hữu có nhà riêng mà! Chạm "Nhà của ta" trên bản đồ truyền tống là về được ngay.' },
  { rule: 'R-NPC-8', text: 'Lão Canh đầu giờ nào cũng gõ mõ rao giờ. Đêm khuya canh năm lão gõ tận năm tiếng.' },
];

/** Tin đồn của ngày VN [day] (`maNgayVN`): đổi mỗi ngày theo lượt, hết danh sách thì quay lại (R-NPC-6). */
export function tinDonCuaNgay(day: number, list: readonly TinDon[] = TIN_DON): TinDon {
  const n = list.length;
  return list[((day % n) + n) % n];
}
