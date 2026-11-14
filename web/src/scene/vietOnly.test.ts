import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hanOnDisplay, resolveSceneSpec } from './specCheck';

// R-HUD-4 (người dùng 2026-11-14): biển, tên nơi / khu, vòng trận, câu đối, chữ trang trí trong game chỉ tiếng Việt —
// chữ Hán chỉ ở nội dung học (thẻ học, màn ôn, Đấu chữ, sách).
const SCENES = import.meta.glob('../../../design/scene/*.json', { eager: true, import: 'default' });
const FILES = Object.keys(SCENES).map((p) => p.split('/').pop()!);
const raw = (f: string): unknown => SCENES[`../../../design/scene/${f}`];
const HAN = /\p{Script=Han}/u;

describe('biển / tên trong cảnh chỉ tiếng Việt (R-HUD-4)', () => {
  it('R-HUD-4: có đủ các cảnh để soát', () => {
    expect(FILES).toContain('scene.json');
    expect(FILES.length).toBeGreaterThanOrEqual(8);
  });

  for (const f of FILES) {
    it(`R-HUD-4: ${f} — biển, cờ, cổng, bảng, đá khắc, vòng trận, tên nơi / khu không có chữ Hán`, () => {
      const { spec } = resolveSceneSpec(raw(f));
      expect(hanOnDisplay(spec)).toEqual([]);
      expect(spec.site.name).not.toMatch(HAN);
      for (const a of spec.site.areas) expect(a.name).not.toMatch(HAN);
    });
  }

  it('R-HUD-4: biển có chữ Hán → scene:check báo lỗi; mã hình bồn hoa / pháp bảo và bảng bài học không tính', () => {
    const { problems } = resolveSceneSpec({
      gates: [{ id: 'g', x: 0, z: 9, width: 5, title: 'Khởi Nguyên Trấn', hanTitle: '下山', backTitle: '起源鎮' }],
      props: [
        { kind: 'bien-go', x: 3, z: 3, text: '歸家|Xuống núi · Về nhà' },
        { kind: 'bon-hoa', x: 5, z: 5, text: '梅' },
      ],
    });
    const han = problems.filter((p) => p.includes('R-HUD-4'));
    expect(han.some((p) => p.startsWith('gates[0].hanTitle'))).toBe(true);
    expect(han.some((p) => p.startsWith('gates[0].backTitle'))).toBe(true);
    expect(han.some((p) => p.startsWith('props[0].text'))).toBe(true);
    expect(han.some((p) => p.startsWith('props[1]'))).toBe(false);
  });

  it('R-HUD-4: trang HTML (ngoài chú thích) không có chữ Hán trang trí', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    expect(html).not.toMatch(HAN);
  });
});
