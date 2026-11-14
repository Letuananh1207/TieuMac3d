import { describe, expect, it } from 'vitest';
import { gameGuide, gameSigns, signInRange } from './gameGuides';
import { LIBRARIAN } from './library';
import { guideOf, STUDY_GUIDE, STUDY_KIND, studySign } from './studyGuide';

/** Chân biển "Khu tự học" trên sàn tầng 2 (cao 6,1 m) + biển bàn cờ dưới đất. */
const SIGN = studySign({ x: 10, y: 6.1, z: -3.5 });
const SIGNS = [
  ...gameSigns([{ kind: 'co', npc: 'tieu-mac', sign: { x: -29.5, z: 4, han: '五子棋', name: 'Ngũ Tử Kỳ' } }]),
  SIGN,
];

const plain = (t: string): string => t.replace(/\*\*/g, '');

describe('Hướng dẫn Khu tự học — R-VA-5', () => {
  it('R-VA-5: cùng tầng, dưới 2,5 m → nút trên biển "Khu tự học"; xa hơn → không có', () => {
    expect(SIGN).toMatchObject({ kind: STUDY_KIND, name: 'Khu tự học', han: '', npc: LIBRARIAN });
    expect(signInRange(SIGNS, 10, -2, 6.1)?.kind).toBe(STUDY_KIND); // cách 1,5 m
    expect(signInRange(SIGNS, 10, 0, 6.1)).toBeNull(); // cách 3,5 m
  });

  it('R-VA-5: tầng 1 ngay dưới biển → không có nút; biển dưới đất không xét tầng', () => {
    expect(signInRange(SIGNS, 10, -3, 0.5)).toBeNull();
    expect(signInRange(SIGNS, 10, -3, 5.5)?.kind).toBe(STUDY_KIND); // lệch dưới 1 m (đang bước lên sàn)
    expect(signInRange(SIGNS, -28, 4, 6.1)?.kind).toBe('co'); // biển bàn chơi không có y
  });

  it('R-VA-5: bảng — đầu "Tàng Thư Các · Hướng dẫn", không chữ Hán (R-HUD-4), 4 mục theo thứ tự, lời thủ thư', () => {
    const g = guideOf(STUDY_KIND)!;
    expect(g).toBe(STUDY_GUIDE);
    expect(g.label).toBe('Hướng dẫn');
    expect(g.eyebrow).toBe('Tàng Thư Các · Hướng dẫn');
    expect(JSON.stringify(g)).not.toMatch(/\p{Script=Han}/u);
    expect(g.name).toBe('Khu tự học');
    expect(g.figure).toBe('tu-hoc');
    expect(g.sections.map((s) => s.title)).toEqual(['Ngồi vào bồ đoàn', 'Cuộn sách ôn', 'Học bộ mới ở Rừng trúc', 'Đứng dậy']);
    expect(g.tipBy).toBe(LIBRARIAN);
    expect(g.tipTitle).toBe('Lời thủ thư Điển Thư');
  });

  it('R-VA-5: bảng nói đúng luật (R-NGOI-1, R-ON-8, R-VUNG-1, R-VA-4)', () => {
    const all = plain([STUDY_GUIDE.caption, ...STUDY_GUIDE.sections.map((s) => s.body)].join(' '));
    expect(all).toContain('"Ngồi"'); // nút nổi ở bồ đoàn giữ nhãn "Ngồi"
    expect(all).toContain('24 chỗ');
    expect(all).toContain('phía nam');
    expect(all).toContain('1 giây');
    expect(all).toContain('"Ôn bộ đến hạn"');
    expect(all).toContain('"Xem bộ đã học"');
    expect(all).toContain('"Học bộ mới" mờ, ghi "Học ở Rừng trúc"');
    expect(all).toContain('"Đứng dậy"');
  });

  it('R-VA-5: chưa học bộ nào → ô báo vàng biểu tượng bản đồ, hướng ra Rừng trúc', () => {
    expect(STUDY_GUIDE.none).toMatchObject({ icon: 'ban-do', title: 'Đạo hữu chưa học bộ thủ nào' });
    expect(plain(STUDY_GUIDE.none!.body)).toContain('Rừng trúc');
  });

  it('R-GIAO-2: biển bàn chơi vẫn mở bảng cách chơi của trò', () => {
    expect(guideOf('co')).toBe(gameGuide('co'));
    expect(guideOf('co')!.label).toBe('Cách chơi');
    expect(guideOf('dau-chu')!.none?.icon).toBe('lua');
    expect(guideOf('khac')).toBeNull();
  });
});
