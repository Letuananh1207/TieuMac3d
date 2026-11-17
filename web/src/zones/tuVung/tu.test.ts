import { describe, expect, test } from 'vitest';
import { amTuPath, tenTepAm } from './am';
import { BAI_HOC } from './bai';
import { kiemTuVung } from './kiem';
import { baiKeTiep, TONG_TU, TU_SO, TU_VUNG, tuCuaBai, tuDaHoc, tuTheoMa } from './tu';

describe('R-TU-1: đơn vị học là từ, giáo trình 50 bài', () => {
  test('304 từ HSK 1–2, mã = chữ, không trùng', () => {
    expect(TU_SO).toHaveLength(304);
    expect(TONG_TU).toBe(304);
    expect(new Set(TU_VUNG.map((t) => t.id)).size).toBe(304);
    expect(TU_VUNG.every((t) => t.id === t.han)).toBe(true);
  });

  test('bài 1 Chào hỏi; HSK 1 trước HSK 2; mỗi bài 6–7 từ', () => {
    expect(BAI_HOC).toHaveLength(50);
    expect(BAI_HOC[0].ten).toBe('Chào hỏi');
    expect(tuCuaBai(BAI_HOC[0]).map((t) => t.han)).toEqual(['你', '我', '好', '谢谢', '再见', '不客气']);
    expect(BAI_HOC.slice(0, 25).every((b) => b.cap === 1)).toBe(true);
    expect(BAI_HOC.slice(25).every((b) => b.cap === 2)).toBe(true);
    expect(BAI_HOC[25].ten).toBe('Gia đình (2)');
    expect(BAI_HOC.every((b) => b.tu.length >= 6 && b.tu.length <= 7)).toBe(true);
  });

  test('mỗi từ thuộc đúng 1 bài; thứ tự giáo trình theo bài', () => {
    expect(TU_VUNG[0].id).toBe('你');
    expect(TU_VUNG.every((t) => t.bai !== '')).toBe(true);
    expect(tuTheoMa('朋友')?.bai).toBe('bai-05');
    expect(tuTheoMa('朋友')?.thanh).toEqual([2, 0]);
  });

  test('bài chưa học đầu tiên; học hết → null', () => {
    expect(baiKeTiep([])?.id).toBe('bai-01');
    expect(baiKeTiep(['bai-01'])?.ten).toBe('Lễ phép');
    expect(baiKeTiep(BAI_HOC.map((b) => b.id))).toBeNull();
  });

  test('từ đã học theo thứ tự giáo trình, mã lạ bỏ qua', () => {
    expect(tuDaHoc(['好', 'xx', '你']).map((t) => t.id)).toEqual(['你', '好']);
  });
});

describe('R-TU-4: kiểm dữ liệu từ', () => {
  test('sổ hiện tại không lỗi', () => {
    expect(kiemTuVung().loi).toEqual([]);
  });

  test('số âm tiết khác số chữ → lỗi; tên bài chữ Hán → lỗi; đa âm → cảnh báo', () => {
    const t = { ...TU_VUNG[0], id: '朋友', han: '朋友', pinyin: 'péng' };
    const r = kiemTuVung([t, { ...TU_VUNG[0], id: '还', han: '还', pinyin: 'hái' }], [{ id: 'b', ten: '你好', cap: 1, tu: ['朋友', '还'] }]);
    expect(r.loi.some((l) => l.includes('朋友: 2 chữ nhưng 1 âm tiết'))).toBe(true);
    expect(r.loi.some((l) => l.includes('tên bài có chữ Hán'))).toBe(true);
    expect(r.canhBao.some((l) => l.startsWith('还'))).toBe(true);
  });
});

describe('R-AM-5: tên tệp âm theo mã điểm', () => {
  test('ASCII, "…" bỏ qua', () => {
    expect(tenTepAm('朋友')).toBe('670b-53cb');
    expect(amTuPath('你')).toBe('am/tu/4f60.mp3');
    expect(tenTepAm('因为…所以')).toBe(['因', '为', '所', '以'].map((c) => c.codePointAt(0)!.toString(16)).join('-'));
  });
});
