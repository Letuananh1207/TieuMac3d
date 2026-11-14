/** Chỗ ngồi dựng trong cảnh (án thư, bàn trà, ghế bàn chơi) — toạ độ cảnh (R-NGOI-1, R-VA-4). */
export interface Seat {
  x: number;
  y: number;
  z: number;
  /** hướng nhìn của người ngồi (radian, 0 = nhìn +z) */
  rotY: number;
  /** bồ đoàn khu tự học tầng 2 Tàng Thư Các: ngồi đủ 1 giây → cuộn sách Ngồi ôn (R-VA-4, R-ON-8) */
  study?: boolean;
  /** vật cầm khi nhìn từ mắt (R-NGOI-1): `tra` chén trà (bàn trà, đôn, sập) · `sach` sách mở trên án · `lan-can` tay đặt
   *  lên lan can (`rail`); không có = tay để yên */
  hold?: 'tra' | 'sach' | 'lan-can';
  /** ghế lan can (R-VA-4): lan can cách chỗ ngồi `d` m theo hướng nhìn, mặt trên cao hơn mặt ngồi `h` m — tay đặt lên đó */
  rail?: { d: number; h: number };
}
