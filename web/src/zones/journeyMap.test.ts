import { describe, expect, it } from 'vitest';
import { placeStates, type MapPlace } from './journeyMap';

const at = (id: string): MapPlace => ({ id, han: '', ten: id, x: 0, y: 0, r: 1 });
const places = ['van-uyen', 'rung-truc', 'giang-nam', 'bong-lai'].map(at);

describe('placeStates (R-HANH-1, R-HANH-2)', () => {
  it('R-HANH-1: không khoá vùng — vùng có cảnh đi được, chưa có cảnh "sắp mở", không nơi nào khoá', () => {
    const s = placeStates(places, 'tong-mon', 'tong-mon', new Set(['rung-truc']));
    expect(s).toEqual({ 'van-uyen': 'oDay', 'rung-truc': 'mo', 'giang-nam': 'sapMo', 'bong-lai': 'sapMo' });
  });

  it('R-HANH-2: đang ở vùng → vùng đó "đang ở", tông môn đi được', () => {
    const s = placeStates(places, 'rung-truc', 'tong-mon', new Set(['rung-truc', 'bong-lai']));
    expect(s).toEqual({ 'van-uyen': 'mo', 'rung-truc': 'oDay', 'giang-nam': 'sapMo', 'bong-lai': 'mo' });
  });
});
