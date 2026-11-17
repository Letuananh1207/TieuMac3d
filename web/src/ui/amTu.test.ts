import { describe, expect, it } from 'vitest';
import { amCuaTu, phatTu } from './amTu';

describe('Phát âm từ — R-AM-5', () => {
  it('R-AM-5: chưa có âm → không phát (loa mờ), không lỗi; có âm → đường dẫn theo mã điểm', () => {
    const t = { id: '朋友', am: false, amCau: false };
    expect(amCuaTu(t)).toBeNull();
    expect(phatTu(t)).toBe(false);
    expect(amCuaTu({ ...t, am: true })).toBe('am/tu/670b-53cb.mp3');
    expect(amCuaTu({ ...t, amCau: true }, true)).toBe('am/cau/670b-53cb.mp3');
    expect(amCuaTu({ ...t, am: true }, true)).toBeNull();
  });
});
