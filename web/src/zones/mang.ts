/**
 * Hái măng sau mưa ở Trúc Lâm (R-MANG-1…5). Hai phần:
 * - **chỗ mọc** (chỉ ở trang — cần cảnh): hạt giống = ngày giờ VN + lứa → mọi máy cùng ngày thấy cùng chỗ (`mangOfDay`);
 * - **luật hái / bán / giá** — bản TS chép `app/lib/journey/mang.dart` (một nguồn ở Dart; đổi luật → sửa cả hai, test hai
 *   phía cùng ví dụ sổ). Có Flutter: trang chỉ gửi `mangAct`; không có Flutter: luật chạy trên ví thử (R-TIEN-7).
 * Thuần — không three, không DOM.
 */
import { cauNghia } from './tuVung/cauHoi';
import { TU_VUNG, type Tu } from './tuVung/tu';

export interface MangWave {
  /** giây trong ngày giờ VN lúc nhú */
  at: number;
  count: number;
}

/** Lứa sáng 5:00 (8) và lứa sau mưa 15:00 (6) — R-MANG-1 (`mangWaves` ở Dart). */
export const MANG_WAVES: readonly MangWave[] = [
  { at: 5 * 3600, count: 8 },
  { at: 15 * 3600, count: 6 },
];
/** Mưa phùn trước lứa chiều chừng này giây (14:50 → 15:00 — R-MANG-2). */
export const MANG_RAIN_SECONDS = 600;
/** Măng nhú trong chừng này giây (R-MANG-2). */
export const MANG_SPROUT_SECONDS = 0.6;
/** Tầm nút "Hái" (R-MANG-3). */
export const MANG_PICK_RANGE = 1.5;
/** Giá bán cho Trúc Ông (R-MANG-5) — `mangPrices` ở Dart. */
export const MANG_PRICES = { mang: 3, 'mang-to': 8 } as const;
export type MangKind = keyof typeof MANG_PRICES;

/* ---------- chỗ mọc (R-MANG-1) ---------- */

export interface MangArea {
  from: [number, number];
  to: [number, number];
}

export interface MangSpot {
  /** `<ngày>-<lứa>-<số>` */
  id: string;
  wave: number;
  index: number;
  x: number;
  z: number;
  /** măng to (số 0 của lứa) */
  big: boolean;
}

/** Số giả ngẫu nhiên có hạt (mulberry32) — mọi máy cùng hạt ra cùng dãy. */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Chỗ mọc của cả ngày [day] (cả hai lứa): trong [areas] (chọn vùng theo diện tích), [ok](x, z) = nền đi được, không trên
 * lối / nước / vật cản (cảnh tự kiểm, kể cả cách mép lối ≥ 1 m); cách nhau ≥ [gap] m — kể cả với lứa trước. Tìm không ra
 * chỗ (cảnh chật) → lứa ít măng hơn, không lỗi.
 */
export function mangOfDay(day: number, areas: readonly MangArea[], ok: (x: number, z: number) => boolean, gap = 3, waves = MANG_WAVES): MangSpot[] {
  const rects = areas.map((a) => ({
    x0: Math.min(a.from[0], a.to[0]),
    z0: Math.min(a.from[1], a.to[1]),
    w: Math.abs(a.to[0] - a.from[0]),
    d: Math.abs(a.to[1] - a.from[1]),
  }));
  const total = rects.reduce((s, r) => s + r.w * r.d, 0);
  const out: MangSpot[] = [];
  if (!(total > 0)) return out;
  waves.forEach((w, wave) => {
    const rng = seededRng(day * 7919 + wave * 104729 + 17);
    for (let index = 0; index < w.count; index++) {
      for (let tries = 0; tries < 80; tries++) {
        let k = rng() * total;
        const r = rects.find((q) => (k -= q.w * q.d) < 0) ?? rects[rects.length - 1];
        const x = r.x0 + rng() * r.w;
        const z = r.z0 + rng() * r.d;
        if (!ok(x, z) || out.some((s) => Math.hypot(s.x - x, s.z - z) < gap)) continue;
        out.push({ id: `${day}-${wave}-${index}`, wave, index, x, z, big: index === 0 });
        break;
      }
    }
  });
  return out;
}

/** Lứa đã nhú lúc [sec] (giây trong ngày giờ VN): 0 trước 5:00, 1 từ 5:00, 2 từ 15:00. */
export const wavesOpen = (sec: number, waves = MANG_WAVES): number => waves.filter((w) => sec >= w.at).length;

/** Đang mưa phùn lúc [sec] (14:50 ≤ giờ < 15:00 — R-MANG-2). */
export const rainAt = (sec: number): boolean => {
  const at = MANG_WAVES[1].at;
  return sec >= at - MANG_RAIN_SECONDS && sec < at;
};

/** Măng lứa [wave] nhú tới đâu lúc [sec] (0…1 trong 0,6 s sau giờ lứa; trước giờ → 0). */
export function sproutK(sec: number, wave: number, waves = MANG_WAVES): number {
  const d = sec - (waves[wave]?.at ?? Infinity);
  return d <= 0 ? 0 : Math.min(1, d / MANG_SPROUT_SECONDS);
}

/** Măng gần nhất trong tầm hái (R-MANG-3) chưa hái; không có → `null`. */
export function mangInRange<T extends { x: number; z: number; id: string }>(spots: readonly T[], picked: ReadonlySet<string>, x: number, z: number, range = MANG_PICK_RANGE): T | null {
  let best: T | null = null;
  let bestD = range;
  for (const s of spots) {
    if (picked.has(s.id)) continue;
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

/* ---------- măng chữ (R-MANG-4) ---------- */

/**
 * Từ khắc trên măng to lứa [wave] ngày [day] (R-MANG-4): một từ đã học (theo thứ tự đã học), ưu tiên từ 1–2 chữ (vừa vỏ
 * măng); chưa học → `null`.
 */
export function mangWord(learnedIds: readonly string[], day: number, wave: number, pool: readonly Tu[] = TU_VUNG): Tu | null {
  const learned = learnedIds.map((id) => pool.find((t) => t.id === id)).filter((t): t is Tu => !!t);
  const short = learned.filter((t) => [...t.han].length <= 2);
  const list = short.length ? short : learned;
  if (!list.length) return null;
  return list[(((day * 2 + wave) % list.length) + list.length) % list.length];
}

/** Câu "Từ này nghĩa là gì?" 4 phương án (dạng a — R-TU-2): nghĩa đúng + 3 nghĩa nhiễu, ưu tiên từ đã học. */
export function mangQuestion(t: Tu, learnedIds: readonly string[] = [], rng: () => number = Math.random): { options: string[]; answer: number } {
  const q = cauNghia(t, learnedIds, rng);
  return { options: q.options, answer: q.answer };
}

/* ---------- luật hái / bán (chép `mang.dart`) ---------- */

export interface MangState {
  /** ngày giờ VN của `picked` */
  day: number;
  picked: string[];
  bag: Partial<Record<MangKind, number>>;
}

export const freshMang = (day = -1): MangState => ({ day, picked: [], bag: {} });

/** Sang ngày [today]: măng đã hái hôm trước bỏ (măng cũ héo), túi giữ. */
export const mangOn = (s: MangState, today: number): MangState => (s.day === today ? s : { day: today, picked: [], bag: s.bag });

/** Đọc bản đã lưu / câu trả lời `getMang`; sai dạng → túi trống. */
export function parseMang(v: unknown): MangState {
  if (!v || typeof v !== 'object') return freshMang();
  const o = v as Record<string, unknown>;
  const day = typeof o.day === 'number' && Number.isInteger(o.day) ? o.day : -1;
  const picked = Array.isArray(o.picked) ? [...new Set(o.picked.filter((x): x is string => typeof x === 'string'))] : [];
  const bag: MangState['bag'] = {};
  if (o.bag && typeof o.bag === 'object') {
    for (const k of Object.keys(MANG_PRICES) as MangKind[]) {
      const n = (o.bag as Record<string, unknown>)[k];
      if (typeof n === 'number' && Number.isInteger(n) && n > 0) bag[k] = n;
    }
  }
  return { day, picked, bag };
}

export type MangError = 'picked' | 'day' | 'not-yet' | 'empty' | 'bad';
export type MangResult = { ok: true; mang: MangState; amount: number; got: number } | { ok: false; reason: MangError };

const VN_OFFSET_MS = 7 * 3_600_000;
const vnDayOf = (ms: number): number => Math.floor((ms + VN_OFFSET_MS) / 86_400_000);
const vnSecOf = (ms: number): number => ((((ms + VN_OFFSET_MS) % 86_400_000) + 86_400_000) % 86_400_000) / 1000;

/** Hái [id] lúc [nowMs] (R-MANG-3/4) — như `pickMang` ở Dart. */
export function pickMang(s: MangState, id: string, nowMs: number, right = false, learnedAny = false): MangResult {
  const m = /^(\d+)-(\d+)-(\d+)$/.exec(id);
  if (!m) return { ok: false, reason: 'bad' };
  const [day, wave, index] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const w = MANG_WAVES[wave];
  if (!w) return { ok: false, reason: 'bad' };
  const today = vnDayOf(nowMs);
  if (day !== today) return { ok: false, reason: 'day' };
  if (vnSecOf(nowMs) < w.at || index >= w.count) return { ok: false, reason: 'not-yet' };
  const cur = mangOn(s, today);
  if (cur.picked.includes(id)) return { ok: false, reason: 'picked' };
  const kind: MangKind = index === 0 ? 'mang-to' : 'mang';
  const got = index === 0 && right && learnedAny ? 2 : 1;
  return { ok: true, mang: { day: today, picked: [...cur.picked, id], bag: { ...cur.bag, [kind]: (cur.bag[kind] ?? 0) + got } }, amount: 0, got };
}

/** Bán cho Trúc Ông (R-MANG-5): [kind] một loại, `null` = bán hết — như `sellMang` ở Dart. */
export function sellMang(s: MangState, kind: MangKind | null): MangResult {
  if (kind !== null && !(kind in MANG_PRICES)) return { ok: false, reason: 'bad' };
  const kinds = kind === null ? (Object.keys(MANG_PRICES) as MangKind[]) : [kind];
  let amount = 0;
  let got = 0;
  const bag = { ...s.bag };
  for (const k of kinds) {
    const n = bag[k] ?? 0;
    if (n <= 0) continue;
    amount += n * MANG_PRICES[k];
    got += n;
    delete bag[k];
  }
  if (!got) return { ok: false, reason: 'empty' };
  return { ok: true, mang: { ...s, bag }, amount, got };
}

/** Nhãn bán (R-TIEN-5): "+23 · Bán măng". */
export const mangSellLabel = (amount: number): string => `+${amount} · Bán măng`;

/**
 * Chữ trên chip lứa măng (thiết kế 2026-11-16.13 `TrucLam-nut-trang-thai`, chuỗi `mangToday`…`mangDone`): đang mưa →
 * "Đang mưa phùn — măng sắp nhú"; hái hết măng của ngày → "Đã hái hết · Mai măng lại nhú"; hết lứa đã nhú, còn lứa sau →
 * "Lứa chiều nhú sau mưa · 15:00"; còn lại "Măng hôm nay · đã hái n / m". [perWave] = số chỗ mọc từng lứa hôm nay.
 */
export function mangChip(sec: number, picked: number, raining: boolean, perWave: readonly number[], waves = MANG_WAVES): string {
  const total = perWave.reduce((a, n) => a + n, 0);
  if (raining) return 'Đang mưa phùn — măng sắp nhú';
  if (total > 0 && picked >= total) return 'Đã hái hết · Mai măng lại nhú';
  const open = wavesOpen(sec, waves);
  const openTotal = perWave.slice(0, open).reduce((a, n) => a + n, 0);
  const next = waves[open];
  if (open > 0 && next && picked >= openTotal) {
    const h = Math.floor(next.at / 3600);
    const m = Math.floor((next.at % 3600) / 60);
    return `Lứa chiều nhú sau mưa · ${h}:${String(m).padStart(2, '0')}`;
  }
  return `Măng hôm nay · đã hái ${picked} / ${total}`;
}
/** Nhãn hái (R-MANG-3): "+1 Măng" / "+2 Măng to". */
export const mangPickLabel = (big: boolean, got: number): string => `+${got} ${big ? 'Măng to' : 'Măng'}`;

/** Thao tác `mangAct` (docs/bridge.md). */
export type MangAct = { act: 'pick'; id: string; right?: boolean } | { act: 'sell'; kind: MangKind | null };

/** Đọc câu trả lời `mangAct`; sai dạng → `null`. */
export function parseMangReply(v: unknown): (MangResult & { balance: number }) | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const balance = typeof o.balance === 'number' && Number.isFinite(o.balance) && o.balance >= 0 ? o.balance : null;
  if (balance === null) return null;
  if (o.ok === true) {
    const n = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0);
    return { ok: true, mang: parseMang(o.mang), amount: n(o.amount), got: n(o.got), balance };
  }
  const reasons: MangError[] = ['picked', 'day', 'not-yet', 'empty', 'bad'];
  if (o.ok === false && reasons.includes(o.reason as MangError)) return { ok: false, reason: o.reason as MangError, balance };
  return null;
}
