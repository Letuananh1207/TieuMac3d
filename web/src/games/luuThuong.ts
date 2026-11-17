/**
 * Lưu Thương Lệnh ở Khúc Thuỷ Đài (R-LUU-1…5, V-80): 8 lượt, người chơi 4 + 3 văn nhân 4; chén dừng trước ai người đó
 * **ghép từ**: chọn chữ còn thiếu của một từ hai chữ đã học (1 trong 4 ô chữ). Chỉ ôn — không ghi tiến độ học (như R-DAU-1).
 * Logic thuần — không three, không DOM. Vòng thời gian: `luuThuongRound.ts`.
 */
import { TU_VUNG, type Tu } from '../zones/tuVung/tu';
import { chuNguon, ghepCua, thanhTuKhac, tuHaiChu, type ChuO, type GhepTu } from './ghepTu';

export const LUU_TURNS = 8;
export const LUU_PLAYER_TURNS = 4;
/** Cần học ít nhất chừng này từ hai chữ mới vào tiệc (R-LUU-1). */
export const LUU_MIN_WORDS = 3;
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

/** Các từ hai chữ đã học (R-LUU-1, R-LUU-3), theo thứ tự giáo trình. */
export function ghepWords(learnedIds: Iterable<string>, pool: readonly Tu[] = TU_VUNG): Tu[] {
  const known = new Set(learnedIds);
  return tuHaiChu(pool).filter((t) => known.has(t.id));
}

/** Vào tiệc được chưa (R-LUU-1): ≥ 3 từ hai chữ đã học. */
export const canJoin = (learnedIds: Iterable<string>): boolean => ghepWords(learnedIds).length >= LUU_MIN_WORDS;

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
  ghep: GhepTu;
  /** 4 ô chữ khác nhau */
  options: ChuO[];
  /** chỉ số chữ đúng trong `options` */
  answer: number;
  /** ai trả lời */
  by: LuuSeat;
}

/**
 * 4 ô chữ (R-LUU-3): 1 đúng + 3 nhiễu — chữ của các từ HSK khác, ưu tiên chữ của từ đã học; bỏ chữ ghép với chữ hiện sẵn
 * thành một từ HSK khác.
 */
export function charOptions(g: GhepTu, learnedIds: readonly string[], rng: () => number = Math.random, pool: readonly Tu[] = TU_VUNG): ChuO[] {
  const right: ChuO = { han: g.missing, pinyin: g.pinyins[g.at === 'dau' ? 0 : 1] };
  const known = new Set(learnedIds);
  const ok = chuNguon(pool).filter((c) => c.han !== g.missing && c.han !== g.shown && !thanhTuKhac(g, c.han, pool));
  const learned = shuffle(ok.filter((c) => known.has(c.tu)), rng);
  const others = shuffle(ok.filter((c) => !known.has(c.tu)), rng);
  const wrong = [...learned, ...others].slice(0, LUU_OPTIONS - 1).map(({ han, pinyin }) => ({ han, pinyin }));
  return shuffle([right, ...wrong], rng);
}

/** 8 câu của một ván (R-LUU-3): từ hai chữ đã học, không lặp từ (hết từ mới lặp lại); chữ ẩn đầu / cuối ngẫu nhiên. */
export function makeQuestions(learnedIds: readonly string[], order: readonly LuuSeat[], rng: () => number = Math.random): LuuQuestion[] {
  const words = ghepWords(learnedIds);
  if (!words.length) return [];
  let bag: Tu[] = [];
  return order.map((by) => {
    if (!bag.length) bag = shuffle(words, rng);
    const word = bag.pop() as Tu;
    const both = ghepCua(word);
    const ghep = both[Math.floor(rng() * both.length) % both.length];
    const options = charOptions(ghep, learnedIds, rng);
    return { ghep, options, answer: options.findIndex((o) => o.han === ghep.missing), by };
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

/** Lời Thi Ông trên thẻ kết quả (chuỗi `luuHostWin` / `luuHostTie` / `luuHostLose` — thiết kế 2026-11-16.13). */
export function hostLine(outcome: 'thang' | 'hoa' | 'thua'): string {
  if (outcome === 'thang') return 'Hay! Chén này xin kính đạo hữu.';
  if (outcome === 'hoa') return 'Ngang tài ngang sức, cạn chén nào!';
  return 'Ván sau ắt đạo hữu hơn lão.';
}

/** Dòng hạng của người chơi trên thẻ kết quả (R-LUU-5): hạng 1 đồng → "Đồng hạng nhất". */
export function rankTitle(s: LuuScores): string {
  const me = ranking(s).find((r) => r.seat === 'nguoi');
  const rank = me?.rank ?? 4;
  if (rank === 1) return luuOutcome(s) === 'hoa' ? 'Đồng hạng nhất' : 'Hạng nhất';
  return ['Hạng nhì', 'Hạng ba', 'Hạng tư'][Math.min(4, rank) - 2];
}

/** Ấn son "Thi khôi" trên thẻ kết quả: chỉ khi hạng 1 một mình (R-LUU-5 — chỉ hình, không đổi thưởng). */
export const thiKhoi = (s: LuuScores): boolean => luuOutcome(s) === 'thang';

/** Câu Thi Ông khi chưa đủ từ (R-LUU-1, chuỗi `luuHostNotEnough`). */
export const LUU_NEED_LINE = 'Đạo hữu hãy tới Trúc Lão học thêm vài bài từ, rồi lại đây cùng thả chén.';
