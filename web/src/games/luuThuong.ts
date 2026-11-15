/**
 * Lưu Thương Lệnh 流觴令 ở Khúc Thuỷ Đài (R-LUU-1…5): 8 lượt, người chơi 4 + 3 văn nhân 4; chén dừng trước ai người đó
 * ghép bộ thủ vào phần còn lại thành chữ (chọn 1 trong 4 bộ). Chỉ ôn — không ghi tiến độ học (như R-DAU-1).
 * Logic thuần — không three, không DOM. Vòng thời gian: `luuThuongRound.ts`.
 */
import { RADICALS, type Radical } from '../zones/radicals';
import { formsChar, GHEP_CHU, type GhepChar } from './ghepChu';

export const LUU_TURNS = 8;
export const LUU_PLAYER_TURNS = 4;
/** Cần học ít nhất chừng này bộ có chữ ghép mới vào tiệc (R-LUU-1). */
export const LUU_MIN_RADICALS = 3;
export const LUU_OPTIONS = 4;

/** Văn nhân ngồi tiệc (R-LUU-4): mã NPC → xác suất đúng. Thứ tự = thứ tự đệm trong đặc tả (`npcs` của mục `luu-thuong`). */
export const LUU_NPCS = [
  { id: 'thi-ong', name: 'Thi Ông', accuracy: 0.75 },
  { id: 'tai-nu', name: 'Tài Nữ', accuracy: 0.7 },
  { id: 'tu-tai', name: 'Tú Tài', accuracy: 0.6 },
] as const;
export type LuuNpcId = (typeof LUU_NPCS)[number]['id'];
/** Người tới lượt: `nguoi` hoặc mã văn nhân. */
export type LuuSeat = 'nguoi' | LuuNpcId;

export const LUU_HOST: LuuNpcId = 'thi-ong';

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Các bộ đã học có chữ ghép (R-LUU-1). */
export function ghepRadicals(learnedIds: Iterable<string>): string[] {
  const has = new Set(GHEP_CHU.map((c) => c.radical));
  return [...new Set(learnedIds)].filter((id) => has.has(id));
}

/** Vào tiệc được chưa (R-LUU-1): ≥ 3 bộ đã học có chữ ghép. */
export const canJoin = (learnedIds: Iterable<string>): boolean => ghepRadicals(learnedIds).length >= LUU_MIN_RADICALS;

/** Thứ tự lượt hợp lệ (R-LUU-2): 8 lượt, người đúng 4, mỗi văn nhân 1–2, người không quá 2 lượt liền. */
export function validOrder(order: readonly LuuSeat[]): boolean {
  if (order.length !== LUU_TURNS) return false;
  if (order.filter((s) => s === 'nguoi').length !== LUU_PLAYER_TURNS) return false;
  for (const n of LUU_NPCS) {
    const k = order.filter((s) => s === n.id).length;
    if (k < 1 || k > 2) return false;
  }
  for (let i = 2; i < order.length; i++) if (order[i] === 'nguoi' && order[i - 1] === 'nguoi' && order[i - 2] === 'nguoi') return false;
  return true;
}

/** Thứ tự lượt ngẫu nhiên hợp lệ (R-LUU-2). */
export function turnOrder(rng: () => number = Math.random): LuuSeat[] {
  const extra = LUU_NPCS[Math.floor(rng() * LUU_NPCS.length) % LUU_NPCS.length].id; // văn nhân được 2 lượt
  const base: LuuSeat[] = ['nguoi', 'nguoi', 'nguoi', 'nguoi', ...LUU_NPCS.map((n) => n.id), extra];
  for (let tries = 0; tries < 200; tries++) {
    const o = shuffle(base, rng);
    if (validOrder(o)) return o;
  }
  // rng xấu (test) → thứ tự cố định hợp lệ
  return ['nguoi', LUU_NPCS[0].id, 'nguoi', LUU_NPCS[1].id, 'nguoi', LUU_NPCS[2].id, 'nguoi', extra];
}

export interface LuuQuestion {
  char: GhepChar;
  /** 4 mã bộ thủ khác nhau */
  options: string[];
  /** chỉ số bộ đúng trong `options` */
  answer: number;
  /** ai trả lời */
  by: LuuSeat;
}

/** 4 ô bộ thủ (R-LUU-3): 1 đúng + 3 nhiễu, ưu tiên bộ đã học, bỏ bộ ghép với phần còn lại thành chữ khác. */
export function radicalOptions(c: GhepChar, learnedIds: readonly string[], rng: () => number = Math.random, pool: readonly Radical[] = RADICALS): string[] {
  const okWrong = (id: string): boolean => id !== c.radical && !formsChar(id, c.rest);
  const learned = shuffle(pool.filter((r) => learnedIds.includes(r.id) && okWrong(r.id)), rng).map((r) => r.id);
  const others = shuffle(pool.filter((r) => !learnedIds.includes(r.id) && okWrong(r.id)), rng).map((r) => r.id);
  const wrong = [...learned, ...others].slice(0, LUU_OPTIONS - 1);
  return shuffle([c.radical, ...wrong], rng);
}

/** 8 câu của một ván (R-LUU-3): chữ của bộ đã học, không lặp chữ (hết chữ mới lặp lại). */
export function makeQuestions(learnedIds: readonly string[], order: readonly LuuSeat[], rng: () => number = Math.random): LuuQuestion[] {
  const ids = ghepRadicals(learnedIds);
  const chars = GHEP_CHU.filter((c) => ids.includes(c.radical));
  if (!chars.length) return [];
  let bag: GhepChar[] = [];
  return order.map((by) => {
    if (!bag.length) bag = shuffle(chars, rng);
    const char = bag.pop() as GhepChar;
    const options = radicalOptions(char, ids, rng);
    return { char, options, answer: options.indexOf(char.radical), by };
  });
}

/** Lựa chọn của văn nhân [by] (R-LUU-4): đúng theo xác suất riêng, sai thì một ô nhiễu. */
export function npcChoice(q: LuuQuestion, rng: () => number = Math.random): number {
  const acc = LUU_NPCS.find((n) => n.id === q.by)?.accuracy ?? 0.7;
  if (rng() < acc) return q.answer;
  const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
  return wrong[Math.min(wrong.length - 1, Math.floor(rng() * wrong.length))];
}

export type LuuScores = Record<LuuSeat, number>;

export const emptyScores = (): LuuScores => ({ nguoi: 0, 'thi-ong': 0, 'tai-nu': 0, 'tu-tai': 0 });

/** Bảng xếp hạng (R-LUU-5): điểm giảm dần, bằng điểm cùng hạng (hạng 1, 1, 3, 4). */
export function ranking(s: LuuScores): { seat: LuuSeat; score: number; rank: number }[] {
  const rows = (Object.keys(s) as LuuSeat[]).map((seat) => ({ seat, score: s[seat] })).sort((a, b) => b.score - a.score); // sắp ổn định: bằng điểm → người chơi đứng trước
  return rows.map((r) => ({ ...r, rank: 1 + rows.filter((o) => o.score > r.score).length }));
}

/** Kết quả của người chơi (R-LUU-5): hạng 1 một mình = thắng, hạng 1 đồng = hoà, còn lại = thua. */
export function luuOutcome(s: LuuScores): 'thang' | 'hoa' | 'thua' {
  const top = Math.max(...Object.values(s));
  if (s.nguoi < top) return 'thua';
  return Object.values(s).filter((v) => v === top).length > 1 ? 'hoa' : 'thang';
}

/** Lời Thi Ông trên thẻ kết quả. */
export function hostLine(outcome: 'thang' | 'hoa' | 'thua'): string {
  if (outcome === 'thang') return 'Đạo hữu ghép chữ nhanh như nước chảy — chén này lão kính đạo hữu!';
  if (outcome === 'hoa') return 'Ngang tài ngang sức, thả thêm một tuần chén nữa chứ?';
  return 'Chén phạt uống rồi, chữ thì nhớ lấy. Tuần sau ắt hơn.';
}

/** Câu Thi Ông khi chưa đủ bộ (R-LUU-1). */
export const LUU_NEED_LINE = 'Đạo hữu hãy Ngồi ôn học thêm vài bộ thủ, rồi lại đây cùng thả chén.';
