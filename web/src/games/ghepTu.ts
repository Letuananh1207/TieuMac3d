/**
 * Ghép từ cho Lưu Thương Lệnh (R-LUU-3, V-80 — thay ghép bộ thủ `ghepChu.ts` cũ): từ **hai chữ** đã học (`zones/tuVung`) —
 * hiện một chữ đúng vị trí trong từ, ô chữ còn lại trống; người chơi chọn chữ thiếu trong 4 ô. Mỗi ô ghi pinyin của chữ
 * đó (trong từ gốc của nó). Dữ liệu thuần — không three, không DOM.
 */
import { tachAmTiet } from '../zones/tuVung/thanh';
import { TU_VUNG, type Tu } from '../zones/tuVung/tu';

/** Một câu ghép: [word] = từ đáp án; [shown] hiện sẵn; [missing] = chữ phải chọn; [at] = vị trí ô trống (đầu / cuối từ). */
export interface GhepTu {
  word: Tu;
  shown: string;
  missing: string;
  at: 'dau' | 'cuoi';
  /** pinyin từng chữ của từ: [chữ 1, chữ 2] */
  pinyins: [string, string];
}

/** Một chữ làm ô chọn: chữ + pinyin của nó trong từ gốc. */
export interface ChuO {
  han: string;
  pinyin: string;
}

/** Pinyin từng chữ của từ hai chữ (hai âm tiết); khác → `null` (vd. 哪儿 nǎr — 儿 hoá). */
export function pinyinTungChu(t: Tu): [string, string] | null {
  const chars = [...t.han];
  const am = tachAmTiet(t.pinyin);
  if (chars.length !== 2 || !am || am.length !== 2 || am.some((a) => a.erhua)) return null;
  const raw = [...t.pinyin];
  return [raw.slice(am[0].start, am[0].end).join(''), raw.slice(am[1].start, am[1].end).join('')];
}

/** Các từ hai chữ (hai âm tiết) trong `pool` — từ hỏi được của Lưu Thương. */
export const tuHaiChu = (pool: readonly Tu[] = TU_VUNG): Tu[] => pool.filter((t) => pinyinTungChu(t) !== null);

/** Hai câu ghép của một từ (ẩn chữ đầu / chữ cuối); không phải từ hai chữ → rỗng. */
export function ghepCua(t: Tu): GhepTu[] {
  const py = pinyinTungChu(t);
  if (!py) return [];
  const [a, b] = [...t.han];
  return [
    { word: t, shown: b, missing: a, at: 'dau', pinyins: py },
    { word: t, shown: a, missing: b, at: 'cuoi', pinyins: py },
  ];
}

/** Mọi chữ làm ô được (chữ của từ 1–2 chữ), mỗi chữ một lần, kèm pinyin + mã từ gốc — ô nhiễu (R-LUU-3). */
export function chuNguon(pool: readonly Tu[] = TU_VUNG): (ChuO & { tu: string })[] {
  const out = new Map<string, ChuO & { tu: string }>();
  for (const t of pool) {
    if ([...t.han].length === 1) {
      if (!out.has(t.han)) out.set(t.han, { han: t.han, pinyin: t.pinyin, tu: t.id });
      continue;
    }
    const py = pinyinTungChu(t);
    if (!py) continue;
    [...t.han].forEach((c, i) => {
      if (!out.has(c)) out.set(c, { han: c, pinyin: py[i], tu: t.id });
    });
  }
  return [...out.values()];
}

/** Chữ [c] đặt vào ô trống có ghép với chữ hiện sẵn thành **một từ HSK khác** không (loại ô nhiễu cũng đúng — R-LUU-3). */
export function thanhTuKhac(g: GhepTu, c: string, pool: readonly Tu[] = TU_VUNG): boolean {
  const han = g.at === 'dau' ? c + g.shown : g.shown + c;
  return han !== g.word.han && pool.some((t) => t.han === han);
}

/** Dòng sau khi chấm (R-LUU-3): "péngyou — bạn bè". */
export const ghepDetail = (g: GhepTu): string => `${g.word.pinyin} — ${g.word.meaning}`;
