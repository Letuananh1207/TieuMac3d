/**
 * Bảng HTML dự phòng của một bài từ (chạy trình duyệt không có Flutter — R-HANH-8, R-TIEN-7): dùng khung bảng bài học
 * có sẵn (`ui/lessonBoard.ts`), liệt kê các từ của bài. Màn bài từ thật (lật từng từ, loa, câu nhanh) là màn Flutter —
 * chờ thiết kế (phiếu `docs/phieu_thiet_ke/2026-11-17-hoc-tu-vung.md`). Thuần.
 */
import type { Lesson } from '../zones';
import type { BaiHoc } from './bai';
import type { Tu } from './tu';

export function baiHtml(b: BaiHoc, index: number, words: readonly Tu[]): Lesson {
  return {
    han: words.map((t) => t.han).join(' '),
    pinyin: words.map((t) => t.pinyin).join(' · '),
    meaning: `Bài ${index} · ${b.ten}`,
    info: words.map((t): [string, string] => [t.han, `${t.pinyin} · ${t.meaning} — ${t.example.han} ${t.example.meaning}`]),
  };
}
