/**
 * Bảng mẫu đợt 3 của bộ asset chuẩn (`danh_muc.ts` gộp vào `MAU`): phần nối của `design/kien_truc/danh_muc.md` mục 2 —
 * bài phường, sơn môn, cổng trên tường (trăng · môn lâu · thuỳ hoa), tường 4 kiểu, cầu 4 kiểu, nền, lan can, bậc.
 * Mẫu có nhiều kiểu tách mỗi kiểu một hàng (như `dien-vuong`, `leu-chi-huy`): `cong-*` = `cong-tuong` kiểu `*`,
 * `tuong-*`, `cau-*`. Mét cảnh (đã nhân K); chi tiết cỡ người (bậc, lan can) không nhân.
 * Dựng: `mau_noi.ts` (cổng, tường), `mau_cau.ts` (cầu), `mau_nen.ts` (nền, lan can, bậc).
 *
 * Quy ước số của phần nối: `w` = bề ngang mẫu bày (dọc trục x), `d` = bề sâu / dày, `cot` = chiều cao chính của mẫu
 * (bài phường: xà thấp nhất · tường: cao thân · cầu: nhịp lớn nhất · nền: cao nền · lan can: cao lan can · bậc: cao nền).
 */
import type { Mau } from './danh_muc';

export const MAU_DOT_3: readonly Mau[] = [
  {
    ma: 'bai-phuong',
    ten: 'Bài phường 牌坊 / bài lâu 牌樓',
    nhom: 'noi',
    viec: 'cổng biểu trưng — mốc dẫn đường trên trục',
    cap: [3, 4],
    mai: 'huyen-son',
    co: {
      // S không mái (trụ xuyên trời 沖天柱), M / L có mái từng gian (bài lâu); xà thấp nhất ≥ 6 m
      S: { gian: 1, w: 4.5, d: 1, cot: 6, cap: 4, bien: 'khong-mai' },
      M: { gian: 3, w: 15, d: 1.2, cot: 6, cap: 3 },
      L: { gian: 5, w: 25, d: 1.4, cot: 6.2, cap: 3 },
    },
    thay: 'cong-truc, cổng gates',
    dot: 3,
  },
  {
    ma: 'son-mon',
    ten: 'Sơn môn 山門',
    nhom: 'noi',
    viec: 'cổng chính trên trục, 3 cửa',
    cap: [3, 3],
    mai: 'yet-son',
    co: { S: { gian: 3, w: 13, d: 6, cot: 4, cap: 3 } },
    thay: '(mới)',
    dot: 3,
  },
  {
    ma: 'cong-trang',
    ten: 'Cổng trăng 月洞門 (cong-tuong · trang)',
    nhom: 'noi',
    viec: 'cửa vào sân, khung cảnh vườn',
    cap: [4, 5],
    mai: 'bang',
    co: {
      // cot = cao tường chứa cổng: vòm ∅ cần tường ≥ 1,6 × r + 0,6 (đỉnh vòm cách đỉnh tường 0,6 — `tuong.ts`);
      // đã duyệt 2026-11-14: giữ ∅ 4 / 6,4, tường quanh cổng M / L nâng lên 3,8 / 5,8 (tường vôi đứng riêng 3,5 / 4,5)
      S: { gian: 1, w: 2.5, d: 0.35, cot: 2.6, cap: 5 },
      M: { gian: 1, w: 4, d: 0.5, cot: 3.8, cap: 4 },
      L: { gian: 1, w: 6.4, d: 0.5, cot: 5.8, cap: 4 },
    },
    thay: 'walls.gates[].kind = trang',
    dot: 3,
  },
  {
    ma: 'cong-lau',
    ten: 'Môn lâu 門樓 (cong-tuong · lau)',
    nhom: 'noi',
    viec: 'cửa vào sân có mái',
    cap: [4, 5],
    mai: 'bang',
    co: {
      // w = lối đi; khe cổng = lối + 2 × 0,3 khung gỗ
      M: { gian: 1, w: 3, d: 0.5, cot: 3.5, cap: 4 },
      L: { gian: 1, w: 5.8, d: 0.5, cot: 4.5, cap: 4 },
    },
    thay: 'walls.gates[].kind = lau',
    dot: 3,
  },
  {
    ma: 'cong-thuy-hoa',
    ten: 'Thuỳ hoa môn 垂花門 (cong-tuong · thuy-hoa)',
    nhom: 'noi',
    viec: 'cửa vào sân trong (nhà chính, viện)',
    cap: [4, 4],
    mai: 'quyen-bong',
    co: { S: { gian: 1, w: 3.5, d: 3, cot: 4, cap: 4 } },
    thay: '(mới) walls.gates[].kind = thuy-hoa',
    dot: 3,
  },
  {
    ma: 'tuong-voi',
    ten: 'Tường vôi 粉牆 / 院牆',
    nhom: 'noi',
    viec: 'chia sân (S), tường viện (M), tường bao (L)',
    cap: [4, 5],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 12, d: 0.35, cot: 2.5, cap: 5 },
      M: { gian: 1, w: 16, d: 0.5, cot: 3.5, cap: 4 },
      L: { gian: 1, w: 20, d: 0.5, cot: 4.5, cap: 4 },
    },
    thay: 'walls, wallSegments (voi)',
    dot: 3,
  },
  {
    ma: 'tuong-cung',
    ten: 'Tường cung đỏ 宮牆',
    nhom: 'noi',
    viec: 'bao cung (Tử Cấm Thành)',
    cap: [1, 2],
    mai: 'bang',
    co: { L: { gian: 1, w: 20, d: 1.5, cot: 8.5, cap: 1 } },
    thay: 'tường cung (cung_dien.ts)',
    dot: 3,
  },
  {
    ma: 'tuong-thanh',
    ten: 'Tường thành gạch Minh 城牆 + đoạ khẩu',
    nhom: 'noi',
    viec: 'phòng thủ (Trường Thành) — mặt tường đi được',
    cap: [6, 6],
    mai: 'bang',
    co: { L: { gian: 1, w: 20, d: 6, cot: 9, cap: 6 } },
    thay: 'thanh_luy.ts, wallSegments follow',
    dot: 3,
  },
  {
    ma: 'tuong-dat',
    ten: 'Tường đất nện 夯土牆',
    nhom: 'noi',
    viec: 'bao dịch trạm, đồn (Tơ lụa)',
    cap: [6, 6],
    mai: 'bang',
    co: { L: { gian: 1, w: 20, d: 1.5, cot: 5, cap: 6 } },
    thay: 'tho-bich',
    dot: 3,
  },
  {
    ma: 'cau-vom',
    ten: 'Cầu vòm 拱橋',
    nhom: 'noi',
    viec: 'qua kênh / hồ — mốc giữa nước',
    cap: [2, 4],
    mai: 'bang',
    co: {
      // w = dài cầu; L 3 nhịp 8 · 10 · 8 (cung đình rộng 7)
      S: { gian: 1, w: 10, d: 3, cot: 8, cap: 4 },
      M: { gian: 1, w: 17, d: 5, cot: 14, cap: 4 },
      L: { gian: 3, w: 30, d: 7, cot: 10, cap: 2 },
    },
    thay: 'bridges vom',
    dot: 3,
  },
  {
    ma: 'cau-bang',
    ten: 'Cầu bằng 平橋 · cửu khúc 九曲橋',
    nhom: 'noi',
    viec: 'qua ao, suối nhỏ',
    cap: [4, 4],
    mai: 'bang',
    co: {
      S: { gian: 3, w: 8, d: 2.5, cot: 0.6, cap: 4 },
      // cửu khúc: 9 đoạn vuông góc nhau, lòng 3
      M: { gian: 9, w: 20, d: 3, cot: 0.6, cap: 4, bien: 'cuu-khuc' },
    },
    thay: 'bridges da',
    dot: 3,
  },
  {
    ma: 'cau-mai',
    ten: 'Cầu có mái 廊橋',
    nhom: 'noi',
    viec: 'qua suối, chỗ nghỉ giữa cầu — mốc',
    cap: [4, 4],
    mai: 'huyen-son',
    co: { L: { gian: 5, w: 25, d: 6.5, cot: 3.2, cap: 4 } },
    thay: '(mới)',
    dot: 3,
  },
  {
    ma: 'cau-treo',
    ten: 'Cầu treo 索橋',
    nhom: 'noi',
    viec: 'qua vực (Bồng Lai)',
    cap: [5, 5],
    mai: 'bang',
    co: { S: { gian: 1, w: 16, d: 1.5, cot: 3, cap: 5 } },
    thay: 'bridges treo',
    dot: 3,
  },
  {
    ma: 'nen',
    ten: 'Nền 台基 · tu di 須彌座',
    nhom: 'noi',
    viec: 'nâng cấp bậc của nhà',
    cap: [1, 3],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 12, d: 8, cot: 1.2, cap: 3 },
      M: { gian: 1, w: 16, d: 12, cot: 2, cap: 2 },
      // Tam Đài hình chữ 土: trước 30 × 20, eo 14 × 6, sau 24 × 12 (tầng dưới cùng); 3 tầng tu di, tổng cao 6
      L: { gian: 3, w: 30, d: 38, cot: 6, cap: 1, bien: 'chu-tho' },
    },
    thay: 'terrain.plateaus (nền nhà)',
    dot: 3,
  },
  {
    ma: 'lan-can',
    ten: 'Lan can gỗ · đá trắng · đá chạm 螭首',
    nhom: 'noi',
    viec: 'chặn mép nền, cầu, ban công',
    cap: [1, 4],
    mai: 'bang',
    co: {
      // w = dài đoạn bày (mô-đun 1,9 với đá), d = sâu nền đỡ, cot = cao lan can (không nhân K)
      S: { gian: 5, w: 8, d: 3, cot: 0.9, cap: 4 },
      M: { gian: 5, w: 9.5, d: 4, cot: 1.1, cap: 3 },
      L: { gian: 5, w: 9.5, d: 5, cot: 1.1, cap: 1 },
    },
    thay: 'fences, lanCan.ts',
    dot: 3,
  },
  {
    ma: 'bac',
    ten: 'Bậc 踏跺',
    nhom: 'noi',
    viec: 'lên nền',
    cap: [1, 4],
    mai: 'bang',
    co: {
      // w = rộng lối bậc, d = sâu khối nền bày kèm, cot = cao nền; bậc 0,15 × 0,32 (không nhân K)
      S: { gian: 1, w: 3, d: 3, cot: 0.6, cap: 4, bien: 'nhu-y' },
      M: { gian: 1, w: 4, d: 4, cot: 1.2, cap: 3, bien: 'chui-dai' },
      L: { gian: 3, w: 7, d: 6, cot: 1.95, cap: 1, bien: 'ngu-lo' },
    },
    thay: 'stairs',
    dot: 3,
  },
];
