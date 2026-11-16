import { describe, expect, it } from 'vitest';
import { TINH } from './dongTac';
import { sitDropFor, tinhFor } from './mixamoCharacter';

describe('Nhân vật chính xương chuẩn (R-DIEU-7, R-DIEU-8)', () => {
  it('R-DIEU-8: người chơi dáng hoạt bát, không nhìn quanh liên tục, tay buông đo từ xương; bảng TINH không đổi', () => {
    const before = JSON.stringify(TINH);
    const t = tinhFor({ player: true }, 0.7);
    expect(t.nhip).toBe(TINH['hoat-bat'].nhip);
    expect(t.nhinQuanh).toBe(0);
    expect(t.haTay).toBeCloseTo(0.64, 9);
    expect(JSON.stringify(TINH)).toBe(before);
    expect(tinhFor({ tinh: 'gia' }, 0.7)).toBe(TINH.gia);
    expect(tinhFor({}, 0.7)).toBe(TINH['diem-tinh']);
  });
  it('R-DIEU-7: ngồi hạ thân theo độ cao háng của model — háng thấp hạ ít, không âm', () => {
    expect(sitDropFor(0.6)).toBeGreaterThan(sitDropFor(0.45));
    expect(sitDropFor(0.05)).toBe(0);
  });
});
