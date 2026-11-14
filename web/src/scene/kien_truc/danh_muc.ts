/**
 * Bộ asset kiến trúc chuẩn — bảng mẫu thuần (không three), khớp `design/kien_truc/danh_muc.md` (đã duyệt 2026-11-14).
 * Mọi số là mét trong cảnh, đã nhân thước đo chung `K` = 1,25. Cảnh chỉ dùng mẫu ở đây, ở một trong 3 cỡ S / M / L.
 * Hồ sơ: `docs/tham_khao/kien-truc-chuan.md`. Kế hoạch: `docs/tasks/2026-11-14-catalog-kien-truc.md`.
 */

import { MAU_DOT_2 } from './danh_muc_dot2';

/** Thước đo kiến trúc chung cho mọi map (thay `buildingStyle.heightScale` riêng từng map). */
export const K = 1.25;

export const CO = ['S', 'M', 'L'] as const;
export type Co = (typeof CO)[number];

/** Giọng vùng — quyết định độ dốc mái + độ vểnh đầu đao. */
export const GIONG = ['tong', 'thanh', 'giang-nam', 'duong'] as const;
export type Giong = (typeof GIONG)[number];

/** Kiểu mái (7) — `quyen-bong` = mái nóc tròn không bờ (vườn, hành lang). */
export const MAI = ['vu-dien', 'yet-son', 'huyen-son', 'nganh-son', 'toan-tiem', 'quyen-bong', 'bang'] as const;
export type Mai = (typeof MAI)[number];

/** Cấp bậc C1 (cung đình tối cao) … C6 (tạm, quân dụng). */
export type Cap = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Độ dốc mái theo giọng (độ): `hien` = đoạn dưới gần mép hiên, `noc` = đoạn trên gần nóc (Thanh lõm dần lên 27° → 42°);
 * `vinh` = cỡ đầu đao (Giang Nam vểnh cao nhất). Nguồn: 舉架 Thanh, 舉折 Tống (hồ sơ mục 4).
 */
export const DOC: Record<Giong, { hien: number; noc: number; vinh: number }> = {
  tong: { hien: 30, noc: 34, vinh: 1 },
  thanh: { hien: 27, noc: 42, vinh: 0.7 },
  'giang-nam': { hien: 30, noc: 32, vinh: 1.8 },
  duong: { hien: 24, noc: 27, vinh: 0.8 },
};

/** Một cỡ của một mẫu. `w` × `d` = thân (mét cảnh), `cot` = cao cột / tầng, `gian` = số gian mặt tiền. */
export interface CoMau {
  gian: number;
  w: number;
  d: number;
  cot: number;
  /** số tầng (lầu, các, tháp); mặc định 1 */
  tang?: number;
  /** số cạnh mặt bằng (đình, tháp); 0 / thiếu = chữ nhật */
  mat?: number;
  /** mái của cỡ này (thiếu = mái mặc định của mẫu) */
  mai?: Mai;
  /** hiên kép (2 tầng mái) */
  kep?: boolean;
  /** cấp hiển thị mặc định khi bày trong Catalog */
  cap: Cap;
  /** biến thể dáng của cỡ này (vd. hành lang `ven-kenh` một dốc, `bo-nui` leo dốc; lều `sap`, `quan`, `tron`) */
  bien?: string;
  /** lầu thành: cao đôn đài (m) */
  don?: number;
}

export type Nhom = 'nha' | 'noi' | 'vat';

export interface Mau {
  ma: string;
  ten: string;
  nhom: Nhom;
  /** việc dùng — để biện minh khi đặt (mục đích) */
  viec: string;
  /** cấp cho phép [thấp nhất, cao nhất] theo số (1 = cao nhất) */
  cap: [Cap, Cap];
  mai: Mai;
  co: Partial<Record<Co, CoMau>>;
  /** đi vào được (sàn, va chạm trong nhà) — dựng bằng hàm vào được hiện có */
  vao?: boolean;
  /** kiểu cũ trong code / cảnh sẽ chuyển sang mẫu này */
  thay: string;
  /** đợt dựng trong Catalog (1 = đợt đầu) */
  dot: 1 | 2 | 3 | 4;
}

/** Mẫu nhà — đợt 1 (8 dựng mới + 3 vào được dùng hàm hiện có), đợt 2 (8 nhà còn lại). Số theo `danh_muc.md` mục 1. */
export const MAU: readonly Mau[] = [
  {
    ma: 'dien',
    ten: 'Điện 殿',
    nhom: 'nha',
    viec: 'thờ, nghi lễ, việc chính của khu',
    cap: [1, 3],
    mai: 'yet-son',
    co: {
      S: { gian: 3, w: 13, d: 9, cot: 4, cap: 3 },
      M: { gian: 5, w: 21, d: 12, cot: 4.5, kep: true, cap: 2 },
      L: { gian: 7, w: 29, d: 15, cot: 5, mai: 'vu-dien', kep: true, cap: 1 },
    },
    thay: 'dien',
    dot: 1,
  },
  {
    ma: 'dien-vuong',
    ten: 'Điện vuông mái chóp (Trung Hoà)',
    nhom: 'nha',
    viec: 'điện nghỉ giữa hai điện lớn — khoảng lặng trên trục',
    cap: [1, 2],
    mai: 'toan-tiem',
    co: { M: { gian: 3, w: 11, d: 11, cot: 4.2, mat: 4, cap: 1 } },
    thay: 'dien (Trung Hoà Điện)',
    dot: 1,
  },
  {
    ma: 'sanh',
    ten: 'Sảnh 廳堂',
    nhom: 'nha',
    viec: 'giảng, tiếp khách, nhà chính khu vườn',
    cap: [3, 4],
    mai: 'yet-son',
    co: {
      S: { gian: 3, w: 12, d: 8, cot: 3.6, cap: 4 },
      M: { gian: 5, w: 19, d: 10, cot: 4, cap: 3 },
    },
    thay: 'giang-duong',
    dot: 1,
  },
  {
    ma: 'lau',
    ten: 'Lầu 樓 2 tầng mặt dài',
    nhom: 'nha',
    viec: 'trà lâu, tửu lâu, tàng thư — có hoạt động trong nhà',
    cap: [3, 4],
    mai: 'yet-son',
    co: {
      S: { gian: 3, w: 10.5, d: 8, cot: 3, tang: 2, cap: 4 },
      M: { gian: 5, w: 17, d: 10, cot: 3, tang: 2, cap: 4 },
      L: { gian: 6, w: 18, d: 9, cot: 3, tang: 2, cap: 3 },
    },
    vao: true,
    thay: 'tra-lau, lau-sach',
    dot: 1,
  },
  {
    ma: 'cac',
    ten: 'Các 閣 vuông có ban công',
    nhom: 'nha',
    viec: 'ngắm cảnh, thờ — công trình biểu tượng của vùng',
    cap: [3, 4],
    mai: 'yet-son',
    co: {
      S: { gian: 1, w: 6, d: 6, cot: 3, tang: 2, mai: 'toan-tiem', mat: 4, cap: 4 },
      M: { gian: 3, w: 11, d: 11, cot: 3.4, tang: 2, cap: 3 },
      L: { gian: 3, w: 13, d: 13, cot: 3.4, tang: 3, cap: 3 },
    },
    thay: 'Bồng Lai Các (lau-sach), Nguyệt Tuyền Các (nha-nho), Vọng Giang Lâu (thap)',
    dot: 1,
  },
  {
    ma: 'thap',
    ten: 'Tháp 塔',
    nhom: 'nha',
    viec: 'mốc nhìn xa, thờ',
    cap: [3, 4],
    mai: 'toan-tiem',
    co: {
      S: { gian: 1, w: 5, d: 5, cot: 3.6, tang: 5, mat: 8, cap: 4 },
      M: { gian: 1, w: 7, d: 7, cot: 3.7, tang: 7, mat: 8, cap: 4 },
      L: { gian: 1, w: 9, d: 9, cot: 3.8, tang: 9, mat: 8, cap: 3 },
    },
    thay: 'thap',
    dot: 1,
  },
  {
    ma: 'dinh',
    ten: 'Đình 亭',
    nhom: 'nha',
    viec: 'nghỉ chân, ngắm cảnh, che giếng / bia',
    cap: [4, 4],
    mai: 'toan-tiem',
    co: {
      S: { gian: 1, w: 3.75, d: 3.75, cot: 3, mat: 4, cap: 4 },
      M: { gian: 1, w: 5, d: 5, cot: 3.2, mat: 6, cap: 4 },
      L: { gian: 1, w: 6.25, d: 6.25, cot: 3.4, mat: 8, kep: true, cap: 4 },
    },
    thay: 'dinh',
    dot: 1,
  },
  {
    ma: 'ta',
    ten: 'Thuỷ tạ 榭',
    nhom: 'nha',
    viec: 'ngồi bên nước, nghe nhạc',
    cap: [4, 4],
    mai: 'quyen-bong',
    co: {
      S: { gian: 1, w: 5, d: 5, cot: 3, cap: 4 },
      M: { gian: 3, w: 11, d: 6, cot: 3.2, cap: 4 },
    },
    thay: 'Thuỷ các (nha-nho)',
    dot: 1,
  },
  {
    ma: 'nha-day',
    ten: 'Dãy nhà 1 tầng',
    nhom: 'nha',
    viec: 'đạo phòng, sương phòng, doanh trại, kho lương — ở, trọ, chứa',
    cap: [5, 5],
    mai: 'nganh-son',
    co: {
      S: { gian: 3, w: 12, d: 6, cot: 3.2, cap: 5 },
      M: { gian: 5, w: 20, d: 6, cot: 3.2, cap: 5 },
      L: { gian: 7, w: 28, d: 6, cot: 3.2, cap: 5 },
    },
    thay: 'Trúc Xá, Kho lương (nha-nho)',
    dot: 1,
  },
  {
    ma: 'nha-giang-nam',
    ten: 'Nhà gối sông · thuỷ các',
    nhom: 'nha',
    viec: 'ở, bến nhà, thuyền ghé',
    cap: [5, 5],
    mai: 'nganh-son',
    co: {
      S: { gian: 1, w: 4.5, d: 7, cot: 2.9, tang: 2, cap: 5 },
      M: { gian: 2, w: 9, d: 8, cot: 2.9, tang: 2, cap: 5 },
      L: { gian: 3, w: 12, d: 9, cot: 2.9, tang: 2, cap: 5 },
    },
    thay: 'Nhà ven sông, Thư phòng (nha-nho)',
    dot: 1,
  },
  {
    ma: 'cua-hang',
    ten: 'Cửa hàng 下店上宅',
    nhom: 'nha',
    viec: 'bán (có NPC / trò)',
    cap: [5, 5],
    mai: 'nganh-son',
    co: {
      S: { gian: 1, w: 4.5, d: 7.5, cot: 3, tang: 2, cap: 5 },
      M: { gian: 2, w: 9, d: 7.5, cot: 3, tang: 2, cap: 5 },
      L: { gian: 3, w: 13.5, d: 7.5, cot: 3, tang: 2, cap: 5 },
    },
    vao: true,
    thay: 'cua-hang',
    dot: 1,
  },
  {
    ma: 'hi-dai',
    ten: 'Hí đài 戲臺',
    nhom: 'nha',
    viec: 'biểu diễn, tụ tập',
    cap: [3, 3],
    mai: 'yet-son',
    co: { M: { gian: 1, w: 9, d: 9, cot: 3.5, cap: 3 } },
    vao: true,
    thay: 'hi-dai',
    dot: 1,
  },
  ...MAU_DOT_2,
];

/** Ngân sách mỗi công trình theo cấp: draw call, tam giác (`danh_muc.md` mục 0). */
export function nganSach(cap: Cap): { drawCalls: number; tris: number } {
  if (cap <= 2) return { drawCalls: 8, tris: 12000 };
  if (cap === 3) return { drawCalls: 6, tris: 8000 };
  if (cap === 4) return { drawCalls: 4, tris: 4000 };
  return { drawCalls: 3, tris: 2000 };
}

/** Nền theo cấp (m): C1 tu di 3 tầng rút gọn · C2 tu di · C3 đá · C4 · C5 · C6 không có. */
export function nenCao(cap: Cap): { cao: number; tuDi: 0 | 1 | 2 | 3 } {
  return [
    { cao: 6, tuDi: 3 },
    { cao: 2, tuDi: 1 },
    { cao: 1.2, tuDi: 0 },
    { cao: 0.6, tuDi: 0 },
    { cao: 0.4, tuDi: 0 },
    { cao: 0, tuDi: 0 },
  ][cap - 1] as { cao: number; tuDi: 0 | 1 | 2 | 3 };
}

/** Cột son từ C4 trở lên; C5–C6 gỗ mộc. */
export const cotSon = (cap: Cap): boolean => cap <= 4;

/** Mái đua (m) theo cấp và cao cột: 0,3 × cột (C4–C5) · 0,4 × (C1–C3). */
export const maiDua = (cap: Cap, cot: number): number => (cap <= 3 ? 0.4 : 0.3) * cot;

/** Lấy mẫu theo mã. */
export function mau(ma: string): Mau | undefined {
  return MAU.find((m) => m.ma === ma);
}

/** Màu ngói theo cấp + giọng: vàng chỉ C1 (cung), lục C2–C3 cung / tông môn, còn lại xám đen (`danh_muc.md` mục 0). */
export function ngoi(cap: Cap, giong: Giong): string {
  if (cap === 1 || (cap === 2 && giong === 'thanh')) return '#C9A13B';
  if (cap <= 3 && giong !== 'giang-nam' && giong !== 'duong') return '#2B5446';
  return '#4F5A63';
}
