/**
 * Luống chè Đồi Chè (V-46) — phần thuần (không three, không DOM): chia đoạn mẫu, hộp va chạm, chỗ cấm cỏ, giờ bướm bay /
 * sương sớm, kiểm đặc tả. Dựng hình ở `luongChe.ts`, bướm `buom.ts`, sương `suongSom.ts`.
 */
import type { MocGio } from './ngayDem';
import type { SceneSpec, TeaRowSpec, TeaStyle } from './spec';

/** Hai đoạn mẫu liền nhau chồng mép bao nhiêu (m) — che khe ở chỗ nối. */
export const TEA_OVERLAP = 0.3;

export interface TeaSegment {
  x: number;
  z: number;
  /** dài theo trục x (không thì theo z) */
  alongX: boolean;
  length: number;
  width: number;
  height: number;
}

export interface TeaBox {
  x: number;
  z: number;
  /** rộng theo x, sâu theo z */
  w: number;
  d: number;
}

const sizeOf = (row: TeaRowSpec, st: TeaStyle): { width: number; height: number } => ({
  width: row.width ?? st.width,
  height: row.height ?? st.height,
});

/** Chia một luống thành các đoạn mẫu dài ≤ `segment`, chồng mép `TEA_OVERLAP`, phủ đúng từ `from` tới `to`. */
export function teaSegments(row: TeaRowSpec, st: TeaStyle): TeaSegment[] {
  const alongX = Math.abs(row.to[0] - row.from[0]) >= Math.abs(row.to[1] - row.from[1]);
  const a = alongX ? Math.min(row.from[0], row.to[0]) : Math.min(row.from[1], row.to[1]);
  const len = alongX ? Math.abs(row.to[0] - row.from[0]) : Math.abs(row.to[1] - row.from[1]);
  const seg = Math.max(TEA_OVERLAP * 2, st.segment);
  const n = Math.max(1, Math.ceil((len - TEA_OVERLAP) / (seg - TEA_OVERLAP)));
  const length = (len + TEA_OVERLAP * (n - 1)) / n;
  const { width, height } = sizeOf(row, st);
  return Array.from({ length: n }, (_, i) => {
    const c = a + length / 2 + i * (length - TEA_OVERLAP);
    return alongX ? { x: c, z: row.from[1], alongX, length, width, height } : { x: row.from[0], z: c, alongX, length, width, height };
  });
}

/** Hộp va chạm cả luống (chặn người như hàng rào thấp — không che camera). */
export function teaBox(row: TeaRowSpec, st: TeaStyle): TeaBox {
  const { width } = sizeOf(row, st);
  const alongX = Math.abs(row.to[0] - row.from[0]) >= Math.abs(row.to[1] - row.from[1]);
  const x = (row.from[0] + row.to[0]) / 2;
  const z = (row.from[1] + row.to[1]) / 2;
  const len = alongX ? Math.abs(row.to[0] - row.from[0]) : Math.abs(row.to[1] - row.from[1]);
  return alongX ? { x, z, w: len, d: width } : { x, z, w: width, d: len };
}

/** Điểm (x, z) nằm trong luống nào không (nới thêm `pad` m) — cỏ / hoa không mọc trong luống. */
export function insideTea(rows: TeaRowSpec[], st: TeaStyle, x: number, z: number, pad = 0): boolean {
  return rows.some((r) => {
    const b = teaBox(r, st);
    return Math.abs(x - b.x) <= b.w / 2 + pad && Math.abs(z - b.z) <= b.d / 2 + pad;
  });
}

/** Bướm bay ban ngày: từ hết bình minh tới đầu hoàng hôn (6:30–17:00 với mốc mặc định), đêm không có. */
export function butterfliesOut(gio: number, moc: MocGio): boolean {
  const g = ((gio % 24) + 24) % 24;
  return g >= moc.sangDen && g < moc.chieuTu;
}

const smooth = (a: number, b: number, v: number): number => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Độ đặc sương sớm 0…1 theo giờ VN: ngoài [from, to) = 0; dày dần trong ¼ đầu, đặc nhất tới nửa khoảng, mờ dần tới `to`
 * (mặc định 5–9 giờ: dày dần 5–6, đặc nhất 6–7, tan dần 7–9).
 */
export function mistLevel(gio: number, mist: Pick<TeaStyle['mist'], 'from' | 'to'>): number {
  const g = ((gio % 24) + 24) % 24;
  const { from, to } = mist;
  if (g < from || g >= to) return 0;
  const span = to - from;
  return smooth(from, from + span * 0.25, g) * (1 - smooth(from + span * 0.5, to, g));
}

/** Kiểm `teaStyle` (chỉ khi có luống). */
export function checkTea(s: Pick<SceneSpec, 'teaRows' | 'teaStyle'>): string[] {
  if (!s.teaRows.length) return [];
  const out: string[] = [];
  const t = s.teaStyle;
  const range = (k: string, v: number, lo: number, hi: number, why = ''): void => {
    if (!(v >= lo && v <= hi)) out.push(`teaStyle.${k}: ${lo}…${hi}${why} (đang ${v})`);
  };
  range('width', t.width, 0.4, 2);
  range('height', t.height, 0.4, 1.2, ' — cao quá hông thì che nhân vật');
  range('segment', t.segment, 2, 12);
  range('wind', t.wind, 0, 1);
  range('butterflies', t.butterflies, 0, 60);
  range('mist.opacity', t.mist.opacity, 0, 1);
  if (!(t.mist.from >= 0 && t.mist.from < t.mist.to && t.mist.to <= 24)) out.push('teaStyle.mist: cần 0 ≤ from < to ≤ 24');
  s.teaRows.forEach((r, i) => {
    const h = r.height ?? t.height;
    if (h > 1.2) out.push(`teaRows[${i}].height: ≤ 1,2 m (đang ${h})`);
  });
  return out;
}
