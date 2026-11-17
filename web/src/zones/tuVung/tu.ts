/**
 * Từ vựng — đơn vị học (R-TU-1). **Một nguồn**: sổ từ HSK của Tàng Thư Các (`zones/sach/hsk1.ts`, `hsk2.ts` — nghĩa Việt +
 * câu ví dụ tự soạn) + giáo trình bài (`bai.ts`); ở đây chỉ ghép thêm mã, thanh, cấp, bài, có âm hay không.
 * Thuần, không three, không DOM. Dạng gửi Flutter: `openWordLesson`, `openReview`, `openLearned` (docs/bridge.md).
 */
import { HSK1 } from '../sach/hsk1';
import { HSK2 } from '../sach/hsk2';
import type { WordRow } from '../sach/word';
import { AM_CAU, AM_TU } from './am';
import { BAI_HOC, type BaiHoc } from './bai';
import { thanhCua } from './thanh';

export interface Tu {
  /** mã từ = chữ giản thể ('朋友'); về sau trùng chữ khác âm thì thêm hậu tố '#2' */
  id: string;
  han: string;
  /** pinyin dấu thanh, thanh gốc như sổ ('bú kèqi') */
  pinyin: string;
  /** thanh từng âm tiết 1–4, 0 = nhẹ (sinh từ pinyin) */
  thanh: number[];
  meaning: string;
  example: { han: string; pinyin: string; meaning: string };
  cap: 1 | 2;
  /** mã bài (`BAI_HOC`) */
  bai: string;
  /** có file âm từ / âm câu ví dụ (R-AM-5) */
  am: boolean;
  amCau: boolean;
}

const baiCua = new Map<string, string>();
for (const b of BAI_HOC) for (const id of b.tu) baiCua.set(id, b.id);

const tuTuHang = ([han, pinyin, meaning, exHan, exPinyin, exMeaning]: WordRow, cap: 1 | 2): Tu => ({
  id: han,
  han,
  pinyin,
  thanh: thanhCua(pinyin) ?? [],
  meaning,
  example: { han: exHan, pinyin: exPinyin, meaning: exMeaning },
  cap,
  bai: baiCua.get(han) ?? '',
  am: AM_TU.has(han),
  amCau: AM_CAU.has(han),
});

const ALL: Tu[] = [...HSK1.map((r) => tuTuHang(r, 1)), ...HSK2.map((r) => tuTuHang(r, 2))];
const BY_ID = new Map(ALL.map((t) => [t.id, t]));

/** Mọi từ theo **thứ tự giáo trình** (bài 1 → 50, trong bài theo trang) — thứ tự hỏi khi cùng bậc, cùng trễ (R-ON-4). */
export const TU_VUNG: readonly Tu[] = BAI_HOC.flatMap((b) => b.tu.map((id) => BY_ID.get(id)).filter((t): t is Tu => !!t));

/** Tổng số từ của giáo trình (cuộn "n / 303 từ" — R-ON-8; Flutter `tuVungWordCount`). */
export const TONG_TU = TU_VUNG.length;

export const tuTheoMa = (id: string): Tu | undefined => BY_ID.get(id);

/** Từ của một bài theo thứ tự trang. */
export const tuCuaBai = (b: BaiHoc): Tu[] => b.tu.map((id) => BY_ID.get(id)).filter((t): t is Tu => !!t);

/** Bài chưa học đầu tiên theo giáo trình (R-HANH-3); học hết → `null`. */
export function baiKeTiep(daHoc: Iterable<string>, pool: readonly BaiHoc[] = BAI_HOC): BaiHoc | null {
  const known = new Set(daHoc);
  return pool.find((b) => !known.has(b.id)) ?? null;
}

/** Các từ đã học (mã) theo thứ tự giáo trình, từ danh sách mã từ bất kỳ thứ tự; mã lạ bỏ qua. */
export function tuDaHoc(ids: Iterable<string>): Tu[] {
  const known = new Set(ids);
  return TU_VUNG.filter((t) => known.has(t.id));
}

/** Mọi từ của sổ (kể cả từ chưa vào bài nào — để `tu:check` bắt), theo thứ tự sổ. */
export const TU_SO: readonly Tu[] = ALL;
