/**
 * Kiểm dữ liệu từ vựng (R-TU-4) — `npm run tu:check` (`web/scripts/check-tu.mjs`) gọi hàm này; test `tu.test.ts`.
 * Lỗi → build dừng; cảnh báo chỉ in (đa âm để soát tai, chưa có âm).
 */
import { BAI_HOC, type BaiHoc } from './bai';
import { CHU_DA_AM, khopSoChu, soChu, tachAmTiet } from './thanh';
import { TU_SO, type Tu } from './tu';

export interface KetQuaKiem {
  loi: string[];
  canhBao: string[];
  /** số từ chưa có âm từ (gộp một dòng cảnh báo) */
  thieuAm: number;
}

export function kiemTuVung(tu: readonly Tu[] = TU_SO, bai: readonly BaiHoc[] = BAI_HOC): KetQuaKiem {
  const loi: string[] = [];
  const canhBao: string[] = [];
  const seen = new Set<string>();
  for (const t of tu) {
    if (seen.has(t.id)) loi.push(`${t.id}: trùng mã từ`);
    seen.add(t.id);
    if (!t.han || !t.pinyin || !t.meaning || !t.example.han || !t.example.pinyin || !t.example.meaning) {
      loi.push(`${t.id}: thiếu chữ / pinyin / nghĩa / câu ví dụ`);
    }
    const am = tachAmTiet(t.pinyin);
    if (!am) loi.push(`${t.id}: pinyin "${t.pinyin}" không tách được âm tiết (dấu thanh / vần sai?)`);
    else if (!khopSoChu(t.han, t.pinyin)) loi.push(`${t.id}: ${soChu(t.han)} chữ nhưng ${am.length} âm tiết ("${t.pinyin}")`);
    if (!t.bai) loi.push(`${t.id}: chưa thuộc bài nào (zones/tuVung/bai.ts)`);
    const da = [...t.han].filter((c) => CHU_DA_AM.has(c));
    if (da.length) canhBao.push(`${t.id} (${t.pinyin}): chữ đa âm ${da.join(' ')} — soát tai`);
  }
  const inBai = new Map<string, string>();
  for (const b of bai) {
    if (/\p{Script=Han}/u.test(b.ten)) loi.push(`${b.id} "${b.ten}": tên bài có chữ Hán (R-HUD-4)`);
    if (b.tu.length < 1) loi.push(`${b.id}: bài trống`);
    for (const id of b.tu) {
      if (!seen.has(id)) loi.push(`${b.id}: từ "${id}" không có trong sổ HSK`);
      const truoc = inBai.get(id);
      if (truoc) loi.push(`${id}: ở cả ${truoc} và ${b.id}`);
      inBai.set(id, b.id);
    }
  }
  return { loi, canhBao, thieuAm: tu.filter((t) => !t.am).length };
}
