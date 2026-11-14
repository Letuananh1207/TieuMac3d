import { describe, expect, it } from 'vitest';
import { JOURNEY_MAP, placeAt, placeScene, placeStates, type MapPlace } from './journeyMap';

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

describe('Nhà của ta trên bản đồ (R-NHA-1, thiết kế 2026-11-14.13)', () => {
  const nha = JOURNEY_MAP.places.find((p) => p.id === 'nha-ta');

  it('R-NHA-1: bản đồ có nơi "Nhà của ta" 我家 ở (1190; 560), vùng chạm r 80 riêng', () => {
    expect(nha).toMatchObject({ han: '我家', ten: 'Nhà của ta', x: 1190, y: 560, r: 80 });
  });

  it('R-NHA-1: chạm (1190; 560) → Nhà của ta, không phải Khởi Nguyên Trấn; mã cảnh nha-ta', () => {
    expect(placeAt(JOURNEY_MAP.places, 1190, 560)?.id).toBe('nha-ta');
    expect(placeAt(JOURNEY_MAP.places, 1000, 680)?.id).toBe('van-uyen');
    expect(placeScene('nha-ta', 'tong-mon')).toBe('nha-ta');
  });

  it('R-NHA-1: luôn đi được (mới cài, mọi nơi) khi có cảnh nha-ta; đang ở nhà → "đang ở"', () => {
    const scenes = new Set(['nha-ta']);
    expect(placeStates(JOURNEY_MAP.places, 'tong-mon', 'tong-mon', scenes)['nha-ta']).toBe('mo');
    const home = placeStates(JOURNEY_MAP.places, 'nha-ta', 'tong-mon', scenes);
    expect(home['nha-ta']).toBe('oDay');
    expect(home['van-uyen']).toBe('mo');
  });
});
