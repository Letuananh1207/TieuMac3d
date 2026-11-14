/**
 * Bảng mẫu đợt 2 của bộ asset chuẩn (`danh_muc.ts` gộp vào `MAU`): 8 nhà còn lại của `design/kien_truc/danh_muc.md`
 * mục 1 — hành lang, thạch phảng, nhà đất, từ miếu, lầu thành, địch lâu, phong hoả đài, lều (+ lều chỉ huy). Mét cảnh,
 * đã nhân K. Dựng: `mau_nha_2.ts` (vườn / thờ / cổng), `mau_bien.ts` (biên ải, tạm).
 */
import type { Mau } from './danh_muc';

export const MAU_DOT_2: readonly Mau[] = [
  {
    ma: 'lang',
    ten: 'Hành lang 廊',
    nhom: 'nha',
    viec: 'nối nhà, che mưa, dẫn đường — đi xuyên được',
    cap: [4, 5],
    mai: 'quyen-bong',
    co: {
      // mỗi gian 3,75 (đoạn thẳng chuẩn), lòng 1,9; Catalog bày 3 / 3 / 5 gian
      S: { gian: 3, w: 11.25, d: 1.9, cot: 3.1, cap: 4 },
      M: { gian: 3, w: 11.25, d: 3, cot: 3.1, cap: 5, bien: 'ven-kenh' },
      L: { gian: 5, w: 18.75, d: 1.9, cot: 3.1, cap: 4, bien: 'bo-nui' },
    },
    thay: '(mới)',
    dot: 2,
  },
  {
    ma: 'phuong',
    ten: 'Thạch phảng 舫',
    nhom: 'nha',
    viec: 'ngồi bên nước, biểu tượng vườn',
    cap: [4, 4],
    mai: 'quyen-bong',
    // 3 đoạn: mũi (đình mở) · khoang giữa (mái quyển bồng thấp) · đuôi lầu 2 tầng (yết sơn)
    co: { M: { gian: 3, w: 18, d: 5, cot: 2.8, tang: 2, cap: 4 } },
    thay: '(mới)',
    dot: 2,
  },
  {
    ma: 'nha-dat',
    ten: 'Nhà đất nện 夯土',
    nhom: 'nha',
    viec: 'ở, chứa (biên ải, Tơ lụa)',
    cap: [6, 6],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 5, d: 5, cot: 3.2, cap: 6 },
      M: { gian: 2, w: 10, d: 5, cot: 3.2, cap: 6 },
      L: { gian: 3, w: 15, d: 15, cot: 3.2, cap: 6, bien: 'chu-u' },
    },
    thay: 'nha-dat (props)',
    dot: 2,
  },
  {
    ma: 'tu-mieu',
    ten: 'Từ / miếu 祠廟 (một viện)',
    nhom: 'nha',
    viec: 'thờ, kể chuyện vùng — một viện có cổng, sân, điện',
    cap: [3, 4],
    mai: 'yet-son',
    co: {
      S: { gian: 3, w: 15, d: 20, cot: 3.4, cap: 4 },
      M: { gian: 3, w: 20, d: 30, cot: 3.8, cap: 3 },
    },
    thay: 'Khương Nữ Từ (nha-nho)',
    dot: 2,
  },
  {
    ma: 'lau-thanh',
    ten: 'Lầu trên đôn đài 城樓',
    nhom: 'nha',
    viec: 'cổng chính + mốc nhìn xa',
    cap: [2, 3],
    mai: 'yet-son',
    co: {
      S: { gian: 3, w: 12, d: 8, cot: 3.4, tang: 1, kep: true, cap: 3, don: 5 },
      M: { gian: 3, w: 20, d: 12, cot: 3.6, tang: 2, kep: true, cap: 3, don: 7 },
      // đôn chữ 凹: thân giữa 40 × 14, hai cánh chìa ra trước; lầu 9 gian vũ điện kép (Ngọ Môn)
      L: { gian: 9, w: 40, d: 30, cot: 4.2, tang: 1, mai: 'vu-dien', kep: true, cap: 2, bien: 'chu-ao', don: 9 },
    },
    thay: 'quan-thanh, ngo-mon, cong-quan (props)',
    dot: 2,
  },
  {
    ma: 'dich-lau',
    ten: 'Địch lâu rỗng 空心敵台',
    nhom: 'nha',
    viec: 'canh, bắn, trú — mặt nóc lên được',
    cap: [5, 6],
    mai: 'nganh-son',
    // thân gạch C6, chòi 鋪房 trên nóc C5
    co: { M: { gian: 3, w: 12.5, d: 12.5, cot: 14, cap: 6 } },
    thay: 'dich-lau (props)',
    dot: 2,
  },
  {
    ma: 'phong-hoa',
    ten: 'Phong hoả đài 烽燧',
    nhom: 'nha',
    viec: 'báo hiệu (khói ngày, lửa đêm)',
    cap: [6, 6],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 7.5, d: 7.5, cot: 10, cap: 6 },
      // đất nện: tháp đáy 9 cao 12 + sân 坞 13 × 11 phía trước → cả cụm 13 × 20
      M: { gian: 1, w: 13, d: 20, cot: 12, cap: 6, bien: 'dat' },
    },
    thay: 'phong-hoa, phong-hoa-dat (props)',
    dot: 2,
  },
  {
    ma: 'leu',
    ten: 'Lều · sạp',
    nhom: 'nha',
    viec: 'trọ tạm, buôn bán',
    cap: [6, 6],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 2.5, d: 1.9, cot: 2.6, cap: 6, bien: 'sap' },
      M: { gian: 1, w: 4, d: 5, cot: 2.8, cap: 6, bien: 'quan' },
      L: { gian: 1, w: 6.5, d: 6.5, cot: 1.7, cap: 6, bien: 'tron' },
    },
    thay: 'leu, leu-vai, lau-say, sap-o',
    dot: 2,
  },
  {
    ma: 'leu-chi-huy',
    ten: 'Lều chỉ huy (soái trướng)',
    nhom: 'nha',
    viec: 'trại quân: nơi bàn việc, có sa bàn',
    cap: [6, 6],
    mai: 'bang',
    co: { L: { gian: 3, w: 8, d: 10, cot: 3, cap: 6 } },
    thay: 'soai-truong',
    dot: 2,
  },
];
