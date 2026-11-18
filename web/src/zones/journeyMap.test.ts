import { describe, expect, it } from 'vitest';
import { JOURNEY_MAP, placeAt, placeName, placeScene, placeStates, type MapPlace } from './journeyMap';

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

  it('R-NHA-1: bản đồ có nơi "Nhà của ta" 我家 ở (230; 975), vùng chạm r 95 riêng (V-54)', () => {
    expect(nha).toMatchObject({ han: '我家', ten: 'Nhà của ta', x: 230, y: 975, r: 95 });
  });

  it('R-NHA-1: chạm (230; 975) → Nhà của ta, không phải Khởi Nguyên Trấn; mã cảnh nha-ta', () => {
    expect(placeAt(JOURNEY_MAP.places, 230, 975)?.id).toBe('nha-ta');
    expect(placeAt(JOURNEY_MAP.places, 440, 800)?.id).toBe('van-uyen');
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

describe('bố cục bản đồ (R-HANH-2, V-54)', () => {
  const by = (id: string): MapPlace => JOURNEY_MAP.places.find((p) => p.id === id)!;

  it('R-HANH-2: Khởi Nguyên Trấn ở góc trái dưới giấy; Nhà của ta sát góc trái dưới của trấn', () => {
    const tran = by('van-uyen');
    const nha = by('nha-ta');
    expect(tran.x).toBeLessThan(JOURNEY_MAP.width / 3);
    expect(tran.y).toBeGreaterThan(JOURNEY_MAP.height / 2);
    expect(nha.x).toBeLessThan(tran.x);
    expect(nha.y).toBeGreaterThan(tran.y);
    expect(Math.hypot(nha.x - tran.x, nha.y - tran.y)).toBeLessThan(400);
  });

  it('R-HANH-2: Thung Trúc Gió Hát là vùng gần trấn nhất', () => {
    const tran = by('van-uyen');
    const d = (p: MapPlace): number => Math.hypot(p.x - tran.x, p.y - tran.y);
    const regions = JOURNEY_MAP.places.filter((p) => p.id !== 'van-uyen' && p.id !== 'nha-ta');
    const nearest = regions.reduce((a, b) => (d(b) < d(a) ? b : a));
    expect(nearest.id).toBe('rung-truc');
  });

  it('R-HANH-2: vùng chạm mỗi nơi ≥ cỡ ngón tay (∅ ≥ 32 px ở màn dọc 360 px, giấy rộng 97 %) và không chồng nhau', () => {
    const pxPerPaper = (360 * 0.97) / JOURNEY_MAP.width;
    for (const p of JOURNEY_MAP.places) expect(2 * p.r * pxPerPaper).toBeGreaterThanOrEqual(32);
    const ps = JOURNEY_MAP.places;
    for (let i = 0; i < ps.length; i++)
      for (let j = i + 1; j < ps.length; j++)
        expect(Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y)).toBeGreaterThan(ps[i].r + ps[j].r);
  });
});

describe('tên vùng một nguồn (R-HANH-1, V-50)', () => {
  it('R-HANH-1: placeName đọc ten của ban-do.json; mã cảnh tong-mon = Khởi Nguyên Trấn; mã lạ trả lại mã', () => {
    expect(placeName('rung-truc')).toBe('Thung Trúc Gió Hát');
    expect(placeName('giang-nam')).toBe('Chợ Đêm Đèn Hoa');
    expect(placeName('bong-lai')).toBe('Cung Ngọc Đáy Biển');
    expect(placeName('truong-thanh')).toBe('Đỉnh Hạc Bay');
    expect(placeName('tu-cam-thanh')).toBe('Rừng Nấm Tiên');
    expect(placeName('to-lua')).toBe('Thành Cát Ngủ Quên');
    expect(placeName('tong-mon')).toBe('Khởi Nguyên Trấn');
    expect(placeName('khong-co')).toBe('khong-co');
  });

  it('R-HANH-1: chuỗi giao diện không còn tên vùng cũ viết cứng', async () => {
    const { STUDY_GUIDE } = await import('./studyGuide');
    const { gameGuide } = await import('./gameGuides');
    const { DIALOGS } = await import('./dialogs');
    const all = JSON.stringify([STUDY_GUIDE, gameGuide('dau-chu'), DIALOGS]);
    for (const old of ['Rừng trúc', 'Giang Nam', 'Con đường tơ lụa']) expect(all).not.toContain(old);
    expect(all).toContain('Thung Trúc Gió Hát');
  });
});
