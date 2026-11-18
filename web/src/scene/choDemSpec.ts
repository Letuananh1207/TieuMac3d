/**
 * Đặc tả vật Chợ Đêm Đèn Hoa (V-108, concept `design/concept/cho-dem-den-hoa/`): Cây Đèn Trăm Tầng, sạp chợ mái vải,
 * bến gỗ có đèn. Thuần dữ liệu (không three) — `spec.ts` gộp vào `SceneSpec`, `vat_cho_dem.ts` dựng. Mặc định rỗng =
 * cảnh cũ không đổi.
 */

/**
 * Cây Đèn Trăm Tầng 燈樹: trục son cao `height` giữa đài đá bát giác hai bậc (bán kính ngoài `baseRadius`, có lan can,
 * chừa lối bậc phía +z), quanh trục `tiers` vòng đèn lồng tròn — vòng dưới bán kính `bottomRadius`, nhỏ dần tới
 * `topRadius` — đỉnh một đèn hoa sen. Đài đi lên được (R-VA-3: mỗi bậc ≤ 0,6 m).
 */
export interface LanternTreeSpec {
  x: number;
  z: number;
  /** cao trục (m) */
  height: number;
  tiers: number;
  bottomRadius: number;
  topRadius: number;
  baseRadius: number;
  /** khoảng hai đèn trên một vòng (m) — số đèn mỗi vòng = chu vi / khoảng */
  spacing?: number;
}

/** Sạp chợ: 4 cột gỗ + mái vải dốc ra trước, quầy hàng, đèn nhỏ hai góc trước; mặt trước (quầy) nhìn +z. */
export interface StallSpec {
  x: number;
  z: number;
  /** 0 · 90 · 180 · 270 — va chạm là hộp thẳng trục */
  rotY?: number;
  /** màu mái vải: chỉ số trong `choDemStyle.awnings` (0 đỏ · 1 vàng · 2 chàm) */
  color?: number;
}

/** Bến gỗ nhỏ trên mặt nước: sàn ván từ bờ (x, z) chạy theo hướng `rotY` (0 = +z) dài `length`, cột đèn hai góc đầu xa. */
export interface PierSpec {
  x: number;
  z: number;
  rotY?: number;
  length: number;
  width: number;
  /** mặt nước thấp hơn bờ bao nhiêu (khớp `water[].sunk`) */
  sunk?: number;
}

/** Màu chung vật chợ đêm (phiếu concept: son `#B8432F`, vàng đèn `#FFC27A`, giấy đèn `#F6D9A6`, đá `#A8A194`). */
export interface ChoDemStyle {
  /** trục + vòng + nan cây đèn */
  pole: string;
  /** lòng đèn lồng (tự sáng ban đêm) */
  lantern: string;
  /** chóp + tua đèn */
  trim: string;
  /** đèn hoa sen đỉnh */
  lotus: string;
  /** đài đá, bậc */
  stone: string;
  /** lan can đá */
  rail: string;
  /** cột sạp, quầy, ván bến */
  wood: string;
  /** mặt quầy, thùng hàng */
  counter: string;
  /** mái vải sạp: đỏ · vàng · chàm */
  awnings: [string, string, string];
  /** hàng bày trên quầy (3 màu xen) */
  goods: [string, string, string];
}

export const DEFAULT_CHO_DEM_STYLE: ChoDemStyle = {
  pole: '#b8432f',
  lantern: '#ffc27a',
  trim: '#c0503a',
  lotus: '#ffd9a0',
  stone: '#a8a194',
  rail: '#d8d0c0',
  wood: '#6a4a34',
  counter: '#8a6448',
  awnings: ['#b8433a', '#d9a842', '#3f4f86'],
  goods: ['#d0a060', '#9a5a3a', '#c8c0a8'],
};
