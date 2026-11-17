/**
 * Câu hỏi ôn từ (R-TU-2, R-ON-2, R-ON-4) — thay câu đố bộ thủ cũ (`zones/review.ts`). Trang dựng câu, gửi Flutter qua
 * `openReview` / `openDaily` (docs/bridge.md); Flutter hiện màn ôn, chấm, lưu lịch. Thuần, không three, không DOM.
 */
import { bienThanh } from './thanh';
import { TU_VUNG, tuTheoMa, type Tu } from './tu';

/** Dạng câu: a chữ → nghĩa · b nghe → nghĩa · c chữ → pinyin · d nghĩa → chữ · e nghe → chữ (R-TU-2). */
export type DangCau = 'chu-nghia' | 'nghe-nghia' | 'chu-pinyin' | 'nghia-chu' | 'nghe-chu';

/** Số phương án mỗi câu (R-TU-2). */
export const SO_PHUONG_AN = 4;

/** Một lượt ôn tối đa chừng này từ (R-ON-4). */
export const TRAN_LUOT_ON = 20;

export interface CauHoi {
  kind: DangCau;
  /** chữ phương án: nghĩa (a, b), pinyin (c), chữ Hán (d, e) */
  options: string[];
  /** chỉ số đáp án trong `options` */
  answer: number;
}

export interface MucOn {
  word: Tu;
  questions: CauHoi[];
}

/** Bậc của lịch ôn (0 = bậc 1 ngày … 6 = 120 ngày; đã thuộc = 7) → hai dạng câu (R-ON-2); chưa có âm → câu nghe đổi sang câu chữ. */
export function dangTheoBac(bac: number, coAm: boolean): [DangCau, DangCau] {
  const pair: [DangCau, DangCau] = bac <= 1 ? ['chu-nghia', 'nghe-nghia'] : bac <= 3 ? ['chu-pinyin', 'nghia-chu'] : ['nghe-chu', 'chu-pinyin'];
  if (coAm) return pair;
  const doi = (d: DangCau): DangCau => (d === 'nghe-nghia' ? 'nghia-chu' : d === 'nghe-chu' ? 'chu-nghia' : d);
  return [doi(pair[0]), doi(pair[1])];
}

/** Các nghĩa con ("bố, ba" → ["bố", "ba"]) — hai từ chung một nghĩa con thì không cùng là phương án. */
function nghiaCon(m: string): string[] {
  return m
    .replace(/\(.*?\)/g, '')
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

const trungNghia = (a: Tu, b: Tu) => {
  const s = new Set(nghiaCon(a.meaning));
  return nghiaCon(b.meaning).some((x) => s.has(x));
};

const soChuCua = (t: Tu) => [...t.han].filter((c) => c !== '…').length;

function xao<T>(a: T[], rand: () => number): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Từ nhiễu theo thứ tự ưu tiên (R-TU-2): đã học → cùng cấp → còn lại; d / e ưu tiên cùng số chữ trong mỗi nhóm. */
function tuNhieu(tu: Tu, kind: DangCau, pool: readonly Tu[], learned: ReadonlySet<string>, rand: () => number): Tu[] {
  const ok = pool.filter((x) => x.id !== tu.id && x.han !== tu.han && !trungNghia(tu, x));
  const chu = kind === 'nghia-chu' || kind === 'nghe-chu';
  const rank = (x: Tu) =>
    (learned.has(x.id) ? 0 : x.cap === tu.cap ? 2 : 4) + (chu && soChuCua(x) !== soChuCua(tu) ? 1 : 0);
  // xáo trước rồi sắp ổn định theo hạng → trong cùng hạng thứ tự ngẫu nhiên
  return xao(ok, rand).sort((a, b) => rank(a) - rank(b));
}

const chuPhuongAn = (kind: DangCau, t: Tu) =>
  kind === 'chu-nghia' || kind === 'nghe-nghia' ? t.meaning : kind === 'chu-pinyin' ? t.pinyin : t.han;

/** Một câu dạng `kind` về từ `tu`: 3 nhiễu khác đáp án, khác nhau (R-TU-2); câu c nhiễu cùng âm khác thanh trước. */
export function cauHoi(
  kind: DangCau,
  tu: Tu,
  learned: Iterable<string> = [],
  pool: readonly Tu[] = TU_VUNG,
  rand: () => number = Math.random,
): CauHoi {
  const right = chuPhuongAn(kind, tu);
  const seen = new Set([right.toLowerCase()]);
  const picks: string[] = [];
  const add = (v: string) => {
    if (picks.length >= SO_PHUONG_AN - 1 || seen.has(v.toLowerCase())) return;
    seen.add(v.toLowerCase());
    picks.push(v);
  };
  if (kind === 'chu-pinyin') {
    for (const v of bienThanh(tu.pinyin)) add(v);
    const cung = pool.filter((x) => x.thanh.length === tu.thanh.length);
    for (const x of tuNhieu(tu, kind, cung, new Set(learned), rand)) add(x.pinyin);
  }
  for (const x of tuNhieu(tu, kind, pool, new Set(learned), rand)) add(chuPhuongAn(kind, x));
  // câu c: đổi thanh của nhiều âm tiết thì nhiều cách — xáo để đáp án không luôn ở ô "chưa đổi"
  const options = xao(picks, rand);
  const answer = Math.floor(rand() * (options.length + 1));
  options.splice(answer, 0, right);
  return { kind, options, answer };
}

/**
 * Lượt ôn (R-ON-2, R-ON-4): `due` = mã từ đến hạn đã theo thứ tự hỏi, `steps` = bậc tương ứng (thiếu → 0); tối đa
 * `TRAN_LUOT_ON` từ; mã lạ bỏ qua. `learned` = từ đã học (ưu tiên làm nhiễu).
 */
export function luotOn(
  due: readonly string[],
  steps: readonly number[] = [],
  learned: Iterable<string> = [],
  rand: () => number = Math.random,
  pool: readonly Tu[] = TU_VUNG,
): MucOn[] {
  const known = [...learned];
  const out: MucOn[] = [];
  due.forEach((id, i) => {
    if (out.length >= TRAN_LUOT_ON) return;
    const t = tuTheoMa(id) ?? pool.find((x) => x.id === id);
    if (!t) return;
    const [k1, k2] = dangTheoBac(steps[i] ?? 0, t.am);
    out.push({ word: t, questions: [cauHoi(k1, t, known, pool, rand), cauHoi(k2, t, known, pool, rand)] });
  });
  return out;
}

/** Câu "Từ này nghĩa là gì?" lẻ (dạng a) — măng chữ (R-MANG-4), câu nhanh cuối bài (R-HANH-3). */
export const cauNghia = (tu: Tu, learned: Iterable<string> = [], rand: () => number = Math.random) =>
  cauHoi('chu-nghia', tu, learned, TU_VUNG, rand);
