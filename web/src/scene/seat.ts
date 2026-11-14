/** Chỗ ngồi dựng trong cảnh (án thư, bàn trà, ghế bàn chơi) — toạ độ cảnh (R-NGOI-1, R-VA-4). */
export interface Seat {
  x: number;
  y: number;
  z: number;
  /** hướng nhìn của người ngồi (radian, 0 = nhìn +z) */
  rotY: number;
  /** bồ đoàn khu tự học tầng 2 Tàng Thư Các: ngồi đủ 1 giây → cuộn sách Ngồi ôn (R-VA-4, R-ON-8) */
  study?: boolean;
  /** vật cầm khi nhìn từ mắt (R-NGOI-1): `tra` chén trà (bàn trà, đôn, sập) · `sach` sách mở trên án; không có = tay để yên */
  hold?: 'tra' | 'sach';
}
