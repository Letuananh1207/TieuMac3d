import { describe, expect, test } from 'vitest';
import { CUON_AN, isOpen, poseAt, poseOf, stepCuon, type CuonState } from './cuonSachNhip';

/** Chạy nhiều khung `dt` giây với cùng `sitT`. */
function run(s: CuonState, seconds: number, sitT: number | null, dt = 1 / 60): CuonState {
  let st = s;
  for (let k = 0; k < seconds; k += dt) st = stepCuon(st, dt, sitT);
  return st;
}

describe('cuộn sách trên tay — nhịp mở', () => {
  test('R-HANH-3: 0 → 0,3 s chưa hiện cuộn', () => {
    expect(poseAt(0).visible).toBe(false);
    expect(poseAt(0.29).visible).toBe(false);
  });

  test('R-HANH-3: 0,3 s hai trục hiện chập, phóng 0 → 1 trong 0,15 s, giấy chưa mở', () => {
    const p = poseAt(0.3);
    expect(p.visible).toBe(true);
    expect(p.scale).toBeCloseTo(0);
    expect(poseAt(0.45).scale).toBeCloseTo(1);
    expect(poseAt(0.45).mo).toBeCloseTo(0);
  });

  test('R-HANH-3: 0,45 → 1 s giấy mở dần, chậm dần; 1 s mở hết', () => {
    const a = poseAt(0.6).mo;
    const b = poseAt(0.8).mo;
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    // chậm dần: nửa đầu khoảng mở được hơn nửa
    expect(poseAt(0.725).mo).toBeGreaterThan(0.5);
    expect(poseAt(1).mo).toBeCloseTo(1);
    expect(poseAt(5).mo).toBeCloseTo(1);
  });

  test('R-ON-8: ngồi đủ 1 s → cuộn mở hết, giữ mở', () => {
    const s = stepCuon(CUON_AN, 0.016, 1);
    expect(isOpen(s)).toBe(true);
    expect(poseOf(run(s, 3, 1)).mo).toBeCloseTo(1);
  });
});

describe('cuộn sách trên tay — thu cuộn', () => {
  test('R-HANH-3: đứng dậy trước 1 s → tắt dần 0,2 s rồi mất, không cuộn lại', () => {
    let s = stepCuon(CUON_AN, 0.016, 0.7);
    const mo = poseOf(s).mo;
    s = stepCuon(s, 0.1, null);
    expect(s.kind).toBe('tat');
    expect(poseOf(s).mo).toBeCloseTo(mo); // giữ dáng, chỉ mờ đi
    expect(poseOf(s).alpha).toBeLessThan(1);
    s = run(s, 0.25, null);
    expect(s).toEqual(CUON_AN);
    expect(poseOf(s).visible).toBe(false);
  });

  test('R-HANH-3: đứng dậy lúc vòng sáng còn nở (< 0,3 s) → không có cuộn', () => {
    const s = stepCuon(stepCuon(CUON_AN, 0.016, 0.2), 0.016, null);
    expect(s).toEqual(CUON_AN);
  });

  test('R-ON-8: "Đứng dậy" trên bảng → hai trục chập về giữa 0,25 s, tắt, chờ nhân vật đứng', () => {
    let s = stepCuon(CUON_AN, 0.016, 1);
    s = stepCuon(s, 0.016, 1, true);
    expect(s.kind).toBe('cuon');
    expect(poseOf(s).mo).toBeCloseTo(1);
    s = stepCuon(s, 0.125, 1);
    expect(poseOf(s).mo).toBeGreaterThan(0);
    expect(poseOf(s).mo).toBeLessThan(1);
    s = run(s, 0.2, 1);
    expect(s.kind).toBe('xong'); // còn ngồi: không hiện lại nhịp mở
    expect(poseOf(s).visible).toBe(false);
    expect(stepCuon(s, 0.016, null)).toEqual(CUON_AN);
  });

  test('R-ON-8: "Đứng dậy" khi cuộn chưa mở hết → bỏ qua (đứng ngay như thường)', () => {
    const s = stepCuon(stepCuon(CUON_AN, 0.016, 0.6), 0.016, 0.6, true);
    expect(s.kind).toBe('ngoi');
  });

  test('R-HANH-3: đã mở rồi đứng dậy bằng điều khiển → cũng cuộn lại 0,25 s', () => {
    let s = stepCuon(CUON_AN, 0.016, 1.2);
    s = stepCuon(s, 0.016, null);
    expect(s.kind).toBe('cuon');
    expect(run(s, 0.3, null)).toEqual(CUON_AN);
  });
});
