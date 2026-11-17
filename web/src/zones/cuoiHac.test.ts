import { describe, expect, it } from 'vitest';
import { arrivingByCrane, CRANE_IN_APP, CRANE_TIMING, CraneClock, craneTotal, departStage, landStage, travelParams, wantsCrane } from './cuoiHac';

/** chạy đồng hồ từng bước 1/60 s; `loadedAt`: giây cảnh dựng xong; `skipAt`: giây chạm bỏ qua */
function run(leg: 'cat' | 'bay' | 'ha', o: { loadedAt?: number; skipAt?: number } = {}): CraneClock {
  const c = new CraneClock(leg);
  for (let i = 0; i < 60 * 20 && !c.done; i++) {
    if (o.skipAt !== undefined && c.t >= o.skipAt && !c.skipped) c.skip();
    c.update(1 / 60, c.t >= (o.loadedAt ?? 0));
  }
  return c;
}

describe('cưỡi hạc — dòng thời gian (R-HANH-5)', () => {
  it('R-HANH-5: máy nhanh (cảnh dựng 0,6 s) → 2,2 s cất cánh + 1,5 s bay + 2 s hạ ≈ 5,7 s', () => {
    expect(CRANE_TIMING.arrive).toBe(0.8);
    expect(CRANE_TIMING.takeoff).toBe(2.2);
    expect(run('cat').t).toBeCloseTo(2.2, 1);
    const fly = run('bay', { loadedAt: 0.6 });
    expect(fly.t).toBeCloseTo(1.5, 1);
    expect(fly.landsAfter).toBe(true);
    expect(run('ha').t).toBeCloseTo(2, 1);
    expect(craneTotal(0.6)).toBeCloseTo(5.7, 5);
  });

  it('R-HANH-5: máy chậm (dựng 4 s) → bay kéo tới 4 s, tổng ≈ 8,2 s', () => {
    expect(run('bay', { loadedAt: 4 }).t).toBeCloseTo(4, 1);
    expect(craneTotal(4)).toBeCloseTo(8.2, 5);
  });

  it('R-HANH-5: chạm lúc bay giây 0,5, cảnh xong 1,2 s → hết bay ở 1,2 s, không có khúc hạ; gợi ý "sắp tới" trong lúc chờ', () => {
    const c = new CraneClock('bay');
    for (let i = 0; i < 30; i++) c.update(1 / 60, false);
    c.skip();
    c.update(1 / 60, false);
    expect(c.done).toBe(false);
    expect(c.hint).toBe('sapToi');
    const fly = run('bay', { skipAt: 0.5, loadedAt: 1.2 });
    expect(fly.t).toBeCloseTo(1.2, 1);
    expect(fly.landsAfter).toBe(false);
    expect(craneTotal(1.2, 0.5)).toBeCloseTo(2.2 + 1.2, 5);
  });

  it('R-HANH-5: chạm lúc cất cánh → sang bay ngay; chạm lúc hạ → đứng ngay', () => {
    expect(run('cat', { skipAt: 0.3 }).t).toBeLessThan(0.35);
    expect(run('ha', { skipAt: 0.5 }).t).toBeLessThan(0.55);
    // bỏ qua lúc cất cánh: mây phủ 0,4 s; bỏ qua lúc bay: mây tan 0,4 s như màn tải
    expect(CRANE_TIMING.skipFade).toBe(0.4);
    expect(CRANE_TIMING.uncover).toBe(0.4);
  });

  it('R-HANH-5: mây phủ 1,8 → 2,2 s của khúc cất cánh; các mốc dáng', () => {
    const c = new CraneClock('cat');
    c.update(1.8);
    expect(c.veil).toBe(0);
    c.update(0.2);
    expect(c.veil).toBeCloseTo(0.5, 5);
    expect([departStage(0.5), departStage(1), departStage(1.5)]).toEqual(['den', 'len', 'bayLen']);
    expect([landStage(1), landStage(1.5), landStage(1.9)]).toEqual(['ha', 'nhay', 'veSau']);
  });

  it('R-MAN-2: cổng (bấm nút), giảm chuyển động, hoạt cảnh tắt → màn tải; trang mở không có den=hac → màn tải', () => {
    expect(wantsCrane({ how: 'cong', trial: true, reducedMotion: false, inApp: true })).toBe(false);
    expect(wantsCrane({ how: 'vong', trial: false, reducedMotion: true, inApp: true })).toBe(false);
    expect(wantsCrane({ how: 'vong', trial: false, reducedMotion: false, inApp: false })).toBe(false);
    expect(arrivingByCrane(new URLSearchParams(''), false)).toBe(false);
    expect(arrivingByCrane(new URLSearchParams('qua=nha-ta'), false)).toBe(false);
  });

  it('R-HANH-5: bật trong app; chỉ vòng trận; giảm chuyển động → không hạc', () => {
    expect(CRANE_IN_APP).toBe(true);
    expect(wantsCrane({ how: 'vong', trial: false, reducedMotion: false })).toBe(true);
    expect(wantsCrane({ how: 'vong', trial: false, reducedMotion: true })).toBe(false);
    expect(wantsCrane({ how: 'cong', trial: false, reducedMotion: false })).toBe(false);
    expect(wantsCrane({ how: 'vong', trial: true, reducedMotion: false })).toBe(true);
    expect(wantsCrane({ how: 'vong', trial: true, reducedMotion: true })).toBe(false);
    expect(wantsCrane({ how: 'cong', trial: true, reducedMotion: false })).toBe(false);
    expect(wantsCrane({ how: 'vong', trial: false, reducedMotion: false, inApp: true })).toBe(true);
    expect(arrivingByCrane(new URLSearchParams('vung=rung-truc&den=hac'), false)).toBe(true);
    expect(arrivingByCrane(new URLSearchParams('vung=rung-truc&den=hac'), true)).toBe(false);
    expect(arrivingByCrane(new URLSearchParams('vung=rung-truc'), false)).toBe(false);
  });

  it('R-HANH-6: nút Bản đồ trên thanh công cụ → cưỡi hạc như vòng trận; giảm chuyển động / trong nhà → màn tải', () => {
    expect(wantsCrane({ how: 'thanh', trial: false, reducedMotion: false })).toBe(true);
    expect(wantsCrane({ how: 'thanh', trial: false, reducedMotion: true })).toBe(false);
    // tầng 2 Tàng Thư Các / dưới mái một nhà vào được → màn tải (hạc không sà vào phòng)
    expect(wantsCrane({ how: 'thanh', trial: false, reducedMotion: false, indoor: true })).toBe(false);
    expect(wantsCrane({ how: 'vong', trial: false, reducedMotion: false, indoor: false })).toBe(true);
    expect(wantsCrane({ how: 'cong', trial: false, reducedMotion: false, indoor: false })).toBe(false);
    // ở Trúc Lâm bấm Bản đồ, chạm Khởi Nguyên Trấn → trang trấn (không `vung`), `tu` = vùng vừa rời
    expect(travelParams('tong-mon', 'rung-truc', 'thanh', 'tong-mon', new URLSearchParams(), []).toString()).toBe('tu=rung-truc');
    // ở nhà chạm Trúc Lâm → trang Trúc Lâm, đứng ở chỗ xuất phát (không `qua`)
    expect(travelParams('rung-truc', 'nha-ta', 'thanh', 'tong-mon', new URLSearchParams(), []).toString()).toBe('vung=rung-truc');
  });

  it('R-HANH-7: Về nhà một chạm → trang Nhà của ta, đứng chỗ xuất phát (không `qua`), giữ tham số thử', () => {
    const keep = new URLSearchParams('debug&hac&x=1');
    expect(travelParams('nha-ta', 'rung-truc', 'thanh', 'tong-mon', keep, ['debug', 'hac']).toString()).toBe('vung=nha-ta&debug=&hac=');
    // cổng đi bộ vẫn `qua` (R-HANH-4)
    expect(travelParams('nha-ta', 'tong-mon', 'cong', 'tong-mon', keep, []).toString()).toBe('vung=nha-ta&qua=tong-mon');
    expect(wantsCrane({ how: 'thanh', trial: false, reducedMotion: false, indoor: false })).toBe(true);
  });
});
