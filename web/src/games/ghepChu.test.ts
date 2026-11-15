import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RADICALS } from '../zones/radicals';
import { formsChar, GHEP_CHU, ghepDetail, ghepOf } from './ghepChu';

describe('Lưu Thương — dữ liệu chữ ghép', () => {
  it('R-LUU-3: mọi chữ thuộc một bộ có thật, phần còn lại một chữ Hán, không trùng chữ', () => {
    const ids = new Set(RADICALS.map((r) => r.id));
    for (const c of GHEP_CHU) {
      expect(ids.has(c.radical), c.han).toBe(true);
      expect([...c.rest]).toHaveLength(1);
      expect(c.rest).toMatch(/\p{Script=Han}/u);
      expect(c.rest).not.toBe(c.han);
      expect([...c.han]).toHaveLength(1);
      expect(c.hv && c.pinyin && c.meaning).toBeTruthy();
      if (c.layout === 'bao') expect(c.at).toBe('dau');
    }
    expect(new Set(GHEP_CHU.map((c) => c.han)).size).toBe(GHEP_CHU.length);
  });

  it('R-LUU-3: đủ 50 bộ, mỗi bộ ≥ 2 chữ, tổng 100–160 chữ', () => {
    for (const r of RADICALS) expect(ghepOf(r.id).length, r.id).toBeGreaterThanOrEqual(2);
    expect(GHEP_CHU.length).toBeGreaterThanOrEqual(100);
    expect(GHEP_CHU.length).toBeLessThanOrEqual(160);
  });

  it('R-LUU-3: soát tay 20 chữ đầu (bộ + phần còn lại + âm)', () => {
    const head = GHEP_CHU.slice(0, 20).map((c) => `${c.han}=${c.radical}+${c.rest} ${c.hv}`);
    expect(head).toEqual([
      '筆=truc+聿 bút', '笑=truc+夭 tiếu', '答=truc+合 đáp',
      '林=moc+木 lâm', '松=moc+公 tùng', '桃=moc+兆 đào',
      '河=thuy+可 hà', '海=thuy+每 hải', '湖=thuy+胡 hồ',
      '岩=son+石 nham', '崩=son+朋 băng', '峽=son+夾 hiệp',
      '砂=thach+少 sa', '破=thach+皮 phá', '碑=thach+卑 bi',
      '明=nhat+月 minh', '晴=nhat+青 tình', '時=nhat+寺 thời',
      '朋=nguyet+月 bằng', '期=nguyet+其 kỳ',
    ]);
  });

  it('R-LUU-3: dòng sau khi chấm "hà · hé — sông"; ghép thử bộ + phần còn lại', () => {
    const he = GHEP_CHU.find((c) => c.han === '河');
    expect(he && ghepDetail(he)).toBe('hà · hé — sông');
    expect(formsChar('thuy', '可')).toBe(true);
    expect(formsChar('tam', '青')).toBe(true); // 情 — nên 忄 không được làm ô nhiễu cho 晴
    expect(formsChar('moc', '可')).toBe(false);
  });

  it('R-LUU-3: chữ + phần còn lại nằm trong nguồn quét font (file .ts) — `fonts:han` cắt được', () => {
    const src = readFileSync(new URL('./ghepChu.ts', import.meta.url), 'utf8');
    for (const c of GHEP_CHU) {
      expect(src.includes(c.han)).toBe(true);
      expect(src.includes(c.rest)).toBe(true);
    }
  });
});
