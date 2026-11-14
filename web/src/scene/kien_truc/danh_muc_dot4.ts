/**
 * Bảng mẫu đợt 4 của bộ asset chuẩn (`danh_muc.ts` gộp vào `MAU`): 11 vật sân có việc của `design/kien_truc/danh_muc.md`
 * mục 3 — chiếu bích, sư tử, hoa biểu, nhật quỹ + gia lượng (+ rùa, hạc), vạc nước, đỉnh / lư hương, giếng, đèn đá, bia,
 * cột cờ, đống củi báo hiệu. Mét cảnh (đã nhân K). Dựng: `mau_vat.ts` (chiếu bích, sư tử, hoa biểu, cột cờ, củi),
 * `mau_vat_2.ts` (nhật quỹ, vạc, đỉnh hương, giếng, đèn đá, bia).
 *
 * Quy ước số của vật sân: `w` × `d` = khoảng bày (vật đi **cặp** bày cả cặp: `w` = bề ngang cả cặp), `cot` = chiều cao
 * chính của một vật, `cap` = cấp sân bày kèm (cấp cho phép `[thấp nhất, cao nhất]`: thấp nhất = "cấp tối thiểu của sân").
 * `gian` = số vật dọc lối (đèn đá M), còn lại 1. Mặt trước nhìn +z (ra cổng); đông = +x, tây = −x (sân 坐北朝南).
 */
import type { Mau } from './danh_muc';

export const MAU_DOT_4: readonly Mau[] = [
  {
    ma: 'chieu-bich',
    ten: 'Chiếu bích 照壁',
    nhom: 'vat',
    viec: 'trên trục, đối diện cổng — che nhìn thẳng vào sân',
    cap: [1, 4],
    mai: 'huyen-son',
    co: {
      S: { gian: 1, w: 8, d: 0.8, cot: 4, cap: 4 },
      // Cửu Long Bích 九龍壁 (Bắc Hải 27 × 5 × 1,2 m ngoài đời): 9 rồng nổi trên nền lam, mái vũ điện ngói vàng
      L: { gian: 9, w: 30, d: 1.5, cot: 5, mai: 'vu-dien', cap: 1, bien: 'cuu-long' },
    },
    thay: '(mới)',
    dot: 4,
  },
  {
    ma: 'su-tu',
    ten: 'Sư tử đá 石獅 (cặp)',
    nhom: 'vat',
    viec: 'trấn cổng — đực (chân tú cầu) phía đông, cái (sư tử con) phía tây, nhìn từ trong ra',
    cap: [1, 3],
    mai: 'bang',
    co: { M: { gian: 1, w: 7, d: 1.8, cot: 2.5, cap: 3 } },
    thay: 'su-tu-dong',
    dot: 4,
  },
  {
    ma: 'hoa-bieu',
    ten: 'Hoa biểu 華表 (cặp)',
    nhom: 'vat',
    viec: 'hai bên trục trước cổng cung',
    cap: [1, 1],
    mai: 'bang',
    co: { L: { gian: 1, w: 12, d: 4.4, cot: 12, cap: 1 } },
    thay: '(mới)',
    dot: 4,
  },
  {
    ma: 'nhat-quy',
    ten: 'Nhật quỹ 日晷 + gia lượng 嘉量 (+ rùa, hạc đồng)',
    nhom: 'vat',
    viec: 'sân nền trước điện chính: nhật quỹ phía đông, gia lượng phía tây',
    cap: [1, 2],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 8, d: 1.6, cot: 1.5, cap: 2 },
      // + rùa đồng, hạc đồng mỗi thứ một cặp (đông – tây) giữa nhật quỹ và gia lượng
      M: { gian: 1, w: 14, d: 5, cot: 1.5, cap: 1, bien: 'du-bo' },
    },
    thay: 'nhat-quy, rua-dong, hac-dong',
    dot: 4,
  },
  {
    ma: 'vac-nuoc',
    ten: 'Vạc nước 銅缸 (cặp)',
    nhom: 'vat',
    viec: 'hai bên điện chính (nước chữa cháy)',
    cap: [1, 2],
    mai: 'bang',
    co: { M: { gian: 1, w: 8, d: 2.2, cot: 1.5, cap: 2 } },
    thay: '(mới)',
    dot: 4,
  },
  {
    ma: 'dinh-huong',
    ten: 'Đỉnh 鼎 · lư hương 香爐',
    nhom: 'vat',
    viec: 'giữa sân trước điện chính — đỉnh trước, lư sau',
    cap: [1, 3],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 2.2, d: 2.2, cot: 2.5, cap: 3 },
      M: { gian: 1, w: 2.2, d: 6, cot: 2.5, cap: 2, bien: 'dinh-lu' },
      // lò đan 丹爐 (Bồng Lai) — biến thể của đỉnh
      L: { gian: 1, w: 2.6, d: 2.6, cot: 2.8, cap: 3, bien: 'lo-dan' },
    },
    thay: 'dinh-dong, lo-dan',
    dot: 4,
  },
  {
    ma: 'gieng',
    ten: 'Giếng 井 (+ đình giếng)',
    nhom: 'vat',
    viec: 'trước bếp / điện phụ, giữa sân trạm',
    cap: [1, 5],
    mai: 'toan-tiem',
    co: {
      S: { gian: 1, w: 2.2, d: 2.2, cot: 0.7, cap: 5 },
      // đình giếng vuông cạnh 2,5, cột 2,5, mái chóp
      M: { gian: 1, w: 2.5, d: 2.5, cot: 2.5, cap: 5, bien: 'dinh-gieng' },
    },
    thay: 'well',
    dot: 4,
  },
  {
    ma: 'den-da',
    ten: 'Đèn đá 石燈',
    nhom: 'vat',
    viec: 'dọc lối, cách đều — dẫn đường; hoặc trên trục trước điện',
    cap: [1, 4],
    mai: 'bang',
    co: {
      S: { gian: 1, w: 0.8, d: 0.8, cot: 1.9, cap: 4 },
      // hàng 3 đèn cách đều 6 m dọc lối
      M: { gian: 3, w: 12.8, d: 0.8, cot: 1.9, cap: 4, bien: 'hang' },
    },
    thay: 'den-da, den-truc',
    dot: 4,
  },
  {
    ma: 'bia',
    ten: 'Bia 碑 · đình bia 碑亭',
    nhom: 'vat',
    viec: 'trên trục sau cổng, hoặc cặp đông – tây',
    cap: [1, 4],
    mai: 'yet-son',
    co: {
      S: { gian: 1, w: 1.6, d: 0.9, cot: 2.5, cap: 4 },
      // rùa đội bia (bí hí, C1–C2)
      M: { gian: 1, w: 2.8, d: 4.6, cot: 4, cap: 2, bien: 'rua' },
      // đình bia vuông: rùa đội bia M trong đình mở, mái yết sơn
      L: { gian: 1, w: 6.25, d: 6.25, cot: 4, cap: 2, bien: 'dinh-bia' },
    },
    thay: 'da-khac',
    dot: 4,
  },
  {
    ma: 'cot-co',
    ten: 'Cột cờ 旗杆 · phướn (cặp)',
    nhom: 'vat',
    viec: 'ngoài cổng (nha môn, chùa, doanh trại) — chân kẹp đá',
    cap: [1, 5],
    mai: 'bang',
    co: { M: { gian: 1, w: 7, d: 1.6, cot: 12, cap: 5 } },
    thay: 'co (cờ dọc)',
    dot: 4,
  },
  {
    ma: 'cui-bao-hieu',
    ten: 'Đống củi báo hiệu 積薪',
    nhom: 'vat',
    viec: 'sát phong hoả đài (Trường Thành, Tơ lụa)',
    cap: [6, 6],
    mai: 'bang',
    co: { S: { gian: 1, w: 3, d: 3, cot: 2, cap: 6 } },
    thay: '(mới)',
    dot: 4,
  },
];
