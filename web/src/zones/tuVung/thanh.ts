/**
 * Pinyin → âm tiết + thanh điệu (R-TU-1, R-TU-4) và đổi thanh một âm tiết (nhiễu "cùng âm khác thanh" của câu c — R-TU-2).
 * Thuần, không three, không DOM. Tách âm tiết bằng bảng phụ âm đầu + vần chuẩn (có quay lui), không cần từ điển.
 */

/** Nguyên âm có dấu → [nguyên âm gốc, thanh 1–4]. */
const MARKS: Record<string, [string, number]> = {};
for (const [base, marked] of [
  ['a', 'āáǎà'],
  ['e', 'ēéěè'],
  ['i', 'īíǐì'],
  ['o', 'ōóǒò'],
  ['u', 'ūúǔù'],
  ['ü', 'ǖǘǚǜ'],
] as const) {
  [...marked].forEach((c, k) => (MARKS[c] = [base, k + 1]));
}
const MARKED: Record<string, string> = {};
for (const [c, [base, t]] of Object.entries(MARKS)) MARKED[`${base}${t}`] = c;

const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w', ''];
const FINALS = [
  'iang', 'iong', 'uang', 'ueng', 'iao', 'ian', 'ing', 'uai', 'uan', 'üan', 'ang', 'eng', 'ong', 'ai', 'ei', 'ao', 'ou',
  'an', 'en', 'er', 'ia', 'ie', 'in', 'iu', 'ua', 'uo', 'ui', 'un', 'ün', 'üe', 'ue', 'a', 'o', 'e', 'i', 'u', 'ü',
];

/** Một âm tiết trong chuỗi pinyin gốc: vị trí [start, end), thanh (0 = nhẹ), có "-r" 儿 hoá không. */
export interface AmTiet {
  start: number;
  end: number;
  thanh: number;
  erhua: boolean;
}

/** Chuỗi bỏ dấu, chữ thường — cùng độ dài với chuỗi gốc (mỗi nguyên âm có dấu là một ký tự). */
function plain(s: string): string {
  return [...s.toLowerCase()].map((c) => MARKS[c]?.[0] ?? c).join('');
}

const isLetter = (c: string) => /[a-zü]/.test(c);

/**
 * Tách `pinyin` thành âm tiết; không tách được (chữ lạ, âm sai) → `null`. Dấu cách, "'", "…", "-", dấu câu là chỗ ngắt.
 * "-r" cuối âm (儿 hoá, vd. "yìdiǎnr") gắn vào âm trước, đánh dấu `erhua`.
 */
export function tachAmTiet(pinyin: string): AmTiet[] | null {
  const raw = [...pinyin];
  const p = [...plain(pinyin)];
  const out: AmTiet[] = [];
  const go = (i: number): boolean => {
    while (i < p.length && !isLetter(p[i])) i++;
    if (i >= p.length) return true;
    for (const ini of INITIALS) {
      if (p.slice(i, i + ini.length).join('') !== ini) continue;
      const j = i + ini.length;
      for (const fin of FINALS) {
        if (p.slice(j, j + fin.length).join('') !== fin) continue;
        if (ini === '' && !/^[aoe]/.test(fin)) continue; // âm không phụ âm đầu chỉ bắt đầu a / o / e (i, u, ü viết y / w)
        if (ini !== '' && fin === 'er') continue; // "er" chỉ đứng một mình (zhèr = zhè + r 儿 hoá)
        const end = j + fin.length;
        let thanh = 0;
        for (let k = i; k < end; k++) thanh = MARKS[raw[k].toLowerCase()]?.[1] ?? thanh;
        out.push({ start: i, end, thanh, erhua: false });
        if (go(end)) return true;
        // "-r" 儿 hoá: chữ r sau âm, không mở đầu âm tiết kế
        if (p[end] === 'r' && !/[aeiouü]/.test(p[end + 1] ?? '')) {
          out[out.length - 1] = { start: i, end: end + 1, thanh, erhua: true };
          if (go(end + 1)) return true;
        }
        out.pop();
      }
    }
    return false;
  };
  return go(0) ? out : null;
}

/** Thanh từng âm tiết (1–4, 0 = nhẹ); không tách được → `null`. */
export function thanhCua(pinyin: string): number[] | null {
  return tachAmTiet(pinyin)?.map((a) => a.thanh) ?? null;
}

/** Số chữ Hán của một từ (bỏ "…" của từ hai phần như 虽然…但是). */
export function soChu(han: string): number {
  return [...han].filter((c) => /\p{Script=Han}/u.test(c)).length;
}

/** Số chữ phải khớp với số âm tiết: chữ 儿 của âm 儿 hoá không có âm tiết riêng (R-TU-4). */
export function khopSoChu(han: string, pinyin: string): boolean {
  const am = tachAmTiet(pinyin);
  if (!am) return false;
  return am.length + am.filter((a) => a.erhua).length === soChu(han);
}

/** Đặt thanh `t` (0–4) cho một âm tiết (không dấu hoặc có dấu); giữ chữ hoa đầu. Dấu đặt ở a / e, "ou" ở o, còn lại nguyên âm cuối. */
export function datThanh(amTiet: string, t: number): string {
  const chars = [...amTiet];
  const up = chars.map((c) => c !== c.toLowerCase());
  const base = [...plain(amTiet)];
  const s = base.join('');
  let k = s.search(/[ae]/);
  if (k < 0) k = s.indexOf('ou');
  if (k < 0) for (let j = base.length - 1; j >= 0 && k < 0; j--) if (/[iouü]/.test(base[j])) k = j;
  if (k >= 0 && t > 0) base[k] = MARKED[`${base[k]}${t}`] ?? base[k];
  return base.map((c, j) => (up[j] ? c.toUpperCase() : c)).join('');
}

/**
 * Pinyin "cùng âm khác thanh" (nhiễu câu c — R-TU-2): đổi thanh **một** âm tiết sang mỗi thanh 1–4 khác thanh gốc; âm tiết
 * đầu trước. Âm nhẹ (0) cũng đổi được (吧 ba → bā, bá, bǎ, bà). Trả theo thứ tự, không trùng, khác `pinyin`.
 */
export function bienThanh(pinyin: string): string[] {
  const am = tachAmTiet(pinyin);
  if (!am) return [];
  const out: string[] = [];
  for (const a of am) {
    const coreEnd = a.erhua ? a.end - 1 : a.end;
    const chars = [...pinyin];
    const syl = chars.slice(a.start, coreEnd).join('');
    for (let t = 1; t <= 4; t++) {
      if (t === a.thanh) continue;
      const v = [...chars.slice(0, a.start), datThanh(syl, t), ...chars.slice(coreEnd)].join('');
      if (v !== pinyin && !out.includes(v)) out.push(v);
    }
  }
  return out;
}

/** Chữ đa âm thường gặp — `tu:check` cảnh báo để người dùng soát tai (R-TU-4). */
export const CHU_DA_AM = new Set([...'了的地得行还长觉着都只重好少为便种看教发乐相要难分数没空当处']);
