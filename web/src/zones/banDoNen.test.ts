import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { JOURNEY_MAP, placeAt } from './journeyMap';

/**
 * Nền bản đồ truyền tống = tranh minh hoạ (V-115, thiết kế 2026-11-18.12, R-HANH-2): tranh có sẵn tên 8 nơi + đường nối;
 * điểm chạm / ghim khớp biểu tượng trên tranh; code không vẽ chữ đè.
 */
const BAN_DO = new URL('../../../design/scene/ban-do/', import.meta.url);
const raw = JSON.parse(readFileSync(new URL('ban-do.json', BAN_DO), 'utf8')) as { anh: string; rong: number; cao: number };

/** Cỡ ảnh WebP (khối VP8 / VP8L / VP8X). */
function webpSize(b: Uint8Array): { w: number; h: number } {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const tag = (o: number): string => String.fromCharCode(...b.subarray(o, o + 4));
  expect(tag(0)).toBe('RIFF');
  expect(tag(8)).toBe('WEBP');
  const kind = tag(12);
  if (kind === 'VP8 ') return { w: v.getUint16(26, true) & 0x3fff, h: v.getUint16(28, true) & 0x3fff };
  const u24 = (o: number): number => v.getUint16(o, true) | (v.getUint8(o + 2) << 16);
  if (kind === 'VP8X') return { w: u24(24) + 1, h: u24(27) + 1 };
  const bits = v.getUint32(21, true); // VP8L
  return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
}

// Đo trên tranh 2048 × 1152 (V-115): tâm biểu tượng và tâm nhãn tên Gemini vẽ.
const ICON: Record<string, [number, number]> = {
  'to-lua': [312, 268], // cổng thành vùi cát trên đĩa cát
  'truong-thanh': [952, 235], // đình bát giác trên cột đá
  'tu-cam-thanh': [1462, 292], // lò thuốc giữa cụm nấm
  'rung-truc': [862, 728], // tháp sáo trúc trên đĩa đá
  'giang-nam': [1405, 768], // cây đèn trăm tầng
  'bong-lai': [1875, 575], // cung vỏ sò dưới nước
  'van-uyen': [442, 805], // mái trấn giữa núi mây
  'nha-ta': [222, 955], // đảo nhà nổi trên biển mây
};
const LABEL: Record<string, [number, number]> = {
  'to-lua': [327, 353],
  'truong-thanh': [929, 300],
  'tu-cam-thanh': [1433, 363],
  'rung-truc': [860, 804],
  'giang-nam': [1403, 857],
  'bong-lai': [1787, 676],
  'van-uyen': [436, 868],
  'nha-ta': [224, 1043],
};
const TOL = 25;

describe('Nền bản đồ truyền tống — tranh minh hoạ (R-HANH-2, V-115)', () => {
  it('R-HANH-2: nền là ban-do-nen.webp 2048 × 1152 (16 : 9, khung ban-do.json), ≤ 600 KB, banDo.ts nạp đúng file đó', () => {
    expect(raw.anh).toBe('ban-do-nen.webp');
    const file = new URL(raw.anh, BAN_DO);
    expect(statSync(file).size).toBeLessThanOrEqual(600 * 1024);
    expect(webpSize(readFileSync(file))).toEqual({ w: raw.rong, h: raw.cao });
    expect([raw.rong, raw.cao]).toEqual([2048, 1152]);
    const src = readFileSync(new URL('../scene/banDo.ts', import.meta.url), 'utf8');
    expect(src).toContain(`design/scene/ban-do/${raw.anh}'`);
  });

  it('R-HANH-2: 8 nơi nằm trong tranh, tâm khớp biểu tượng ± 25 px', () => {
    expect(JOURNEY_MAP.places.map((p) => p.id).sort()).toEqual(Object.keys(ICON).sort());
    for (const p of JOURNEY_MAP.places) {
      expect(p.x - p.r * 0.5, p.id).toBeGreaterThanOrEqual(0);
      expect(p.x + p.r * 0.5, p.id).toBeLessThanOrEqual(JOURNEY_MAP.width);
      expect(p.y - p.r * 0.5, p.id).toBeGreaterThanOrEqual(0);
      expect(p.y + p.r * 0.5, p.id).toBeLessThanOrEqual(JOURNEY_MAP.height);
      const [ix, iy] = ICON[p.id];
      expect(Math.hypot(p.x - ix, p.y - iy), p.id).toBeLessThanOrEqual(TOL);
    }
  });

  it('R-HANH-2: chạm biểu tượng hoặc tâm nhãn tên trên tranh → đúng nơi đó', () => {
    for (const id of Object.keys(ICON)) {
      expect(placeAt(JOURNEY_MAP.places, ...ICON[id])?.id, `biểu tượng ${id}`).toBe(id);
      expect(placeAt(JOURNEY_MAP.places, ...LABEL[id])?.id, `nhãn ${id}`).toBe(id);
    }
  });

  it('R-HANH-2: code không vẽ chữ tên đè lên tranh (banDo.ts không fillText / strokeText)', () => {
    const src = readFileSync(new URL('../scene/banDo.ts', import.meta.url), 'utf8');
    expect(src).not.toMatch(/\.(fillText|strokeText)\(/);
  });
});
