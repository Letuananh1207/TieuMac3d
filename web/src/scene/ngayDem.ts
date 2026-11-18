/**
 * Ngày đêm theo giờ Việt Nam (kế hoạch docs/tasks/2026-11-14-ngay-dem.md; R-NGAY-1…4): giờ GMT+7 từ đồng hồ máy → pha +
 * các hệ số mượt (`dem` mức đêm, `hoang` mức nhuộm cam bình minh / hoàng hôn, `den` độ sáng đèn). Kèm trường đặc tả
 * `dayNight` (mặc định tắt = cảnh như cũ) và bảng màu đêm chung. Thuần (không three, không DOM) — test được.
 */

/** Mốc giờ (giờ thập phân 0…24, giờ VN). */
export interface MocGio {
  /** bình minh: từ … đến … (hết bình minh = bắt đầu ngày) */
  sangTu: number;
  sangDen: number;
  /** hoàng hôn: từ … đến … (hết hoàng hôn = bắt đầu đêm) */
  chieuTu: number;
  chieuDen: number;
  /** đèn bật dần buổi chiều, tắt dần buổi sáng */
  denBatTu: number;
  denBatDen: number;
  denTatTu: number;
  denTatDen: number;
}

/**
 * Trường đặc tả `dayNight`. Màu đêm là bảng chung xanh tím (quyết định 1C — chỉnh từng vùng sau qua `/canh`). Hệ số
 * cường độ (`*Scale`) nhân với số ban ngày của cảnh — cảnh nào cũng tối theo cùng tỉ lệ dù đèn ban ngày khác nhau.
 */
export interface DayNightSpec {
  enabled: boolean;
  /**
   * Giờ cố định của cảnh (0…24, vd. 21 = luôn đêm hội — chợ đêm `giang-nam`, V-108): cảnh đứng yên ở giờ này, không theo
   * đồng hồ (R-NGAY-1). −1 (mặc định) = theo giờ Việt Nam như cũ. `?gio=` / thanh trượt Canvas 3D vẫn ép được.
   */
  gioCoDinh: number;
  moc: MocGio;
  dem: {
    sky: { top: string; middle: string; horizon: string };
    fog: string;
    /** ánh sáng chung đêm: hemi (màu trời / đất, hệ số), trăng thay nắng (màu, hệ số so với nắng) */
    light: { skyColor: string; groundColor: string; hemiScale: number; moonColor: string; moonScale: number };
    /** nhân màu vật không chịu sáng: gần (biển, chữ, model `.glb` không-sáng) · xa (núi xa, mây, biển mây) · nước */
    tint: { near: string; far: string; water: string };
    /** độ phát sáng đèn lồng / đèn đá lúc đèn sáng hẳn (0…1), cửa sổ (0…1) */
    lampGlow: number;
    windowGlow: number;
    /** màu sáng của cửa sổ ban đêm */
    windowColor: string;
    /** tối mép màn ban đêm (cảnh mềm) */
    vignette: number;
    vignetteColor: string;
    /** sao: số điểm (0 = tắt), màu, cỡ (px) */
    stars: { count: number; color: string; size: number };
    /** trăng: màu, đường kính góc (độ), hướng (vị trí như `light.sunPosition`) */
    moon: { color: string; size: number; position: [number, number, number] };
  };
  /** bình minh / hoàng hôn: chân trời, giữa trời, nắng, sương ngả về các màu này lúc `hoang` = 1 */
  hoang: { horizon: string; middle: string; sunColor: string; fog: string };
  /** trong nhà ban đêm (quyết định 3B): ánh sáng vàng ấm khi đứng trên sàn nhà vào được */
  trongNha: { skyColor: string; groundColor: string; hemiScale: number };
}

export const DEFAULT_MOC: MocGio = {
  sangTu: 5,
  sangDen: 6.5,
  chieuTu: 17,
  chieuDen: 18.75,
  denBatTu: 17.5,
  denBatDen: 18.5,
  denTatTu: 5.5,
  denTatDen: 6.5,
};

export const DEFAULT_DAY_NIGHT: DayNightSpec = {
  enabled: false,
  gioCoDinh: -1,
  moc: DEFAULT_MOC,
  dem: {
    sky: { top: '#141a3e', middle: '#2e3a74', horizon: '#5a5a92' },
    fog: '#2e3866',
    light: { skyColor: '#8494d8', groundColor: '#38385a', hemiScale: 0.55, moonColor: '#b0c0ff', moonScale: 0.38 },
    tint: { near: '#b4bce0', far: '#5c6aa0', water: '#6e7cb4' },
    lampGlow: 1,
    windowGlow: 0.7,
    windowColor: '#ffc870',
    vignette: 0.45,
    vignetteColor: '#141a3a',
    stars: { count: 320, color: '#eef0ff', size: 2.2 },
    moon: { color: '#fbf4d8', size: 4, position: [14, 16, -12] },
  },
  hoang: { horizon: '#f2a66e', middle: '#b87896', sunColor: '#ffb27a', fog: '#b98a8c' },
  trongNha: { skyColor: '#ffe4b8', groundColor: '#6a4a32', hemiScale: 0.95 },
};

/** Mức tối nhất cho phép (R-NGAY-4: đêm vẫn chơi rõ, không tối đen) — `checkDayNight` báo khi đặc tả tối hơn. */
export const MIN_NIGHT_HEMI = 0.4;
export const MIN_NEAR_TINT = 0.6;

/** Giờ VN (GMT+7) thập phân 0…24 từ mốc UTC `nowMs` (`Date.now()`) — không đọc múi giờ của máy (R-NGAY-1). */
export function gioVN(nowMs: number): number {
  const h = (nowMs / 3_600_000 + 7) % 24;
  return h < 0 ? h + 24 : h;
}

export type Pha = 'sang' | 'ngay' | 'chieu' | 'dem';

export interface PhaNgay {
  pha: Pha;
  /** mức đêm 0 (ngày) … 1 (đêm) */
  dem: number;
  /** mức nhuộm cam / hồng bình minh, hoàng hôn 0…1 (đỉnh giữa mỗi chặng chuyển) */
  hoang: number;
  /** độ sáng đèn 0 (tắt) … 1 (sáng hẳn) */
  den: number;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number): number => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Pha + hệ số theo giờ `gio` (0…24, quá khoảng thì quấn vòng) — liên tục mọi giờ, kể cả qua 0 h (R-NGAY-2). */
export function phaNgay(gio: number, moc: MocGio = DEFAULT_MOC): PhaNgay {
  const g = ((gio % 24) + 24) % 24;
  const pha: Pha = g >= moc.sangTu && g < moc.sangDen ? 'sang' : g >= moc.sangDen && g < moc.chieuTu ? 'ngay' : g >= moc.chieuTu && g < moc.chieuDen ? 'chieu' : 'dem';
  const noon = (moc.sangDen + moc.chieuTu) / 2;
  // buổi sáng (trước trưa): đêm lùi dần qua bình minh; buổi chiều: đêm tới dần qua hoàng hôn
  const buoiSang = g < noon;
  const dem = buoiSang ? 1 - smooth(moc.sangTu, moc.sangDen, g) : smooth(moc.chieuTu, moc.chieuDen, g);
  const t = buoiSang ? clamp01((g - moc.sangTu) / (moc.sangDen - moc.sangTu)) : clamp01((g - moc.chieuTu) / (moc.chieuDen - moc.chieuTu));
  const hoang = t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
  const den = buoiSang ? 1 - smooth(moc.denTatTu, moc.denTatDen, g) : smooth(moc.denBatTu, moc.denBatDen, g);
  return { pha, dem, hoang, den };
}

/** Lệch lớn nhất giữa hai trạng thái (để chỉ áp lại khi đổi đáng kể). */
export const lechPha = (a: PhaNgay, b: PhaNgay): number => Math.max(Math.abs(a.dem - b.dem), Math.abs(a.hoang - b.hoang), Math.abs(a.den - b.den));

/** Nội suy số. */
export const tronSo = (a: number, b: number, k: number): number => a + (b - a) * clamp01(k);

/** Nội suy màu "#rrggbb" (theo từng kênh số hex). */
export function tronMau(a: string, b: string, k: number): string {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const t = clamp01(k);
  let out = 0;
  for (const s of [16, 8, 0]) out |= Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t) << s;
  return `#${out.toString(16).padStart(6, '0')}`;
}

/** Độ sáng 0…1 của màu (trung bình kênh). */
const sang = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  return (((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255)) / 765;
};

/** Lỗi khoảng giá trị của `dayNight` (bổ sung cho kiểm kiểu chung). */
export function checkDayNight(d: DayNightSpec): string[] {
  const out: string[] = [];
  const m = d.moc;
  const inDay = (k: keyof MocGio): boolean => m[k] >= 0 && m[k] < 24;
  for (const k of Object.keys(m) as (keyof MocGio)[]) if (!inDay(k)) out.push(`dayNight.moc.${k}: 0…24 (đang ${m[k]})`);
  if (!(m.sangTu < m.sangDen && m.sangDen < m.chieuTu && m.chieuTu < m.chieuDen)) out.push('dayNight.moc: cần sangTu < sangDen < chieuTu < chieuDen');
  if (!(m.denTatTu < m.denTatDen && m.denTatDen < m.denBatTu && m.denBatTu < m.denBatDen)) out.push('dayNight.moc: cần denTatTu < denTatDen < denBatTu < denBatDen');
  if (d.gioCoDinh !== -1 && !(d.gioCoDinh >= 0 && d.gioCoDinh < 24)) out.push(`dayNight.gioCoDinh: −1 (theo đồng hồ) hoặc 0…24 (đang ${d.gioCoDinh})`);
  const unit: [string, number][] = [
    ['dem.lampGlow', d.dem.lampGlow],
    ['dem.windowGlow', d.dem.windowGlow],
    ['dem.vignette', d.dem.vignette],
    ['dem.light.hemiScale', d.dem.light.hemiScale],
    ['dem.light.moonScale', d.dem.light.moonScale],
  ];
  for (const [k, v] of unit) if (v < 0 || v > 1) out.push(`dayNight.${k}: 0…1 (đang ${v})`);
  if (d.trongNha.hemiScale < 0 || d.trongNha.hemiScale > 1.5) out.push(`dayNight.trongNha.hemiScale: 0…1,5 (đang ${d.trongNha.hemiScale})`);
  // R-NGAY-4: đêm vẫn chơi rõ
  if (d.dem.light.hemiScale < MIN_NIGHT_HEMI) out.push(`dayNight.dem.light.hemiScale: đêm tối quá (tối thiểu ${MIN_NIGHT_HEMI} — R-NGAY-4)`);
  if (sang(d.dem.tint.near) < MIN_NEAR_TINT) out.push(`dayNight.dem.tint.near: chữ / biển tối quá (độ sáng tối thiểu ${MIN_NEAR_TINT} — R-NGAY-4)`);
  if (d.dem.stars.count < 0 || d.dem.stars.count > 1000) out.push(`dayNight.dem.stars.count: 0…1000 (đang ${d.dem.stars.count})`);
  if (d.dem.stars.size <= 0 || d.dem.stars.size > 4) out.push(`dayNight.dem.stars.size: 0…4 px (đang ${d.dem.stars.size})`);
  if (d.dem.moon.size < 0 || d.dem.moon.size > 15) out.push(`dayNight.dem.moon.size: 0…15° (đang ${d.dem.moon.size})`);
  if (d.dem.moon.position[1] <= 0) out.push('dayNight.dem.moon.position: trăng phải ở trên chân trời (y > 0)');
  return out;
}

/** Giờ ép bằng tham số URL (thử / Canvas 3D): `?gio=21` (đứng yên ở 21 h), `?gio=17&toc=60` (1 phút thật = 1 giờ). */
export interface EpGio {
  /** giờ bắt đầu; `null` = giờ VN thật lúc mở */
  gio: number | null;
  /** tốc độ đồng hồ (1 = thật; 0 = đứng yên) */
  toc: number;
}

export function docEpGio(params: URLSearchParams): EpGio {
  const g = params.get('gio');
  const t = params.get('toc');
  const gio = g !== null && g !== '' && Number.isFinite(Number(g)) ? ((Number(g) % 24) + 24) % 24 : null;
  const tocRaw = t !== null && t !== '' && Number.isFinite(Number(t)) ? Math.max(0, Number(t)) : null;
  // ép giờ mà không nói tốc độ → đứng yên ở giờ đó; không ép gì → đồng hồ thật
  return { gio, toc: tocRaw ?? (gio === null ? 1 : 0) };
}

/**
 * Giờ trong game lúc `nowMs`, biết lúc bắt đầu `startMs` và giờ ép (`toc` 1 + không ép = giờ VN thật). `coDinh` ≥ 0 =
 * giờ cố định của cảnh (`dayNight.gioCoDinh`) thay đồng hồ thật khi không ép bằng `?gio=`.
 */
export function gioLuc(ep: EpGio, startMs: number, nowMs: number, coDinh = -1): number {
  if (ep.gio === null && coDinh >= 0) return coDinh;
  if (ep.gio === null && ep.toc === 1) return gioVN(nowMs);
  const base = ep.gio ?? gioVN(startMs);
  const h = base + ((nowMs - startMs) / 3_600_000) * ep.toc;
  return ((h % 24) + 24) % 24;
}

/** Nhãn giờ "21:05" (bảng gỡ lỗi). */
export function nhanGio(gio: number): string {
  const m = Math.floor((((gio % 24) + 24) % 24) * 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export const TEN_PHA: Record<Pha, string> = { sang: 'bình minh', ngay: 'ngày', chieu: 'hoàng hôn', dem: 'đêm' };
