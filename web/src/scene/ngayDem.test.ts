import { describe, expect, it } from 'vitest';
import { checkDayNight, DEFAULT_DAY_NIGHT, docEpGio, gioLuc, gioVN, lechPha, nhanGio, phaNgay, tronMau } from './ngayDem';
import { DEFAULT_SCENE } from './spec';
import { resolveSceneSpec } from './specCheck';

/** Mốc UTC của một giờ VN trong ngày 2026-11-14 (giờ VN = UTC + 7). */
const vn = (h: number, m = 0): number => Date.UTC(2026, 10, 14, h - 7, m);

describe('R-NGAY-1: giờ Việt Nam GMT+7, mốc pha cố định', () => {
  it('giờ VN tính từ mốc UTC, không theo múi giờ máy (máy ở Tokyo 23:00 = VN 21:00)', () => {
    // Tokyo GMT+9: 23:00 Tokyo = 14:00 UTC = 21:00 VN
    expect(gioVN(Date.UTC(2026, 10, 14, 14, 0))).toBeCloseTo(21);
    expect(gioVN(vn(12, 30))).toBeCloseTo(12.5);
    // qua nửa đêm UTC: 20:00 UTC = 3:00 VN hôm sau
    expect(gioVN(Date.UTC(2026, 10, 14, 20))).toBeCloseTo(3);
    expect(gioVN(0)).toBeCloseTo(7); // 1970-01-01 00:00 UTC
  });

  it('5:00–6:30 bình minh · 6:30–17:00 ngày · 17:00–18:45 hoàng hôn · còn lại đêm', () => {
    expect(phaNgay(4.99).pha).toBe('dem');
    expect(phaNgay(5).pha).toBe('sang');
    expect(phaNgay(5.5).pha).toBe('sang');
    expect(phaNgay(6.5).pha).toBe('ngay');
    expect(phaNgay(12).pha).toBe('ngay');
    expect(phaNgay(17).pha).toBe('chieu');
    expect(phaNgay(18.7).pha).toBe('chieu');
    expect(phaNgay(18.75).pha).toBe('dem');
    expect(phaNgay(21).pha).toBe('dem');
    expect(phaNgay(0).pha).toBe('dem');
  });

  it('ban ngày mức đêm 0, ban đêm 1', () => {
    expect(phaNgay(12)).toEqual({ pha: 'ngay', dem: 0, hoang: 0, den: 0 });
    expect(phaNgay(21)).toEqual({ pha: 'dem', dem: 1, hoang: 0, den: 1 });
    expect(phaNgay(2)).toEqual({ pha: 'dem', dem: 1, hoang: 0, den: 1 });
  });

  it('?gio=21 ép giờ đứng yên; ?gio=17&toc=60 một phút thật = một giờ; không ép = giờ VN thật', () => {
    const start = vn(10);
    const ep21 = docEpGio(new URLSearchParams('gio=21'));
    expect(ep21).toEqual({ gio: 21, toc: 0 });
    expect(gioLuc(ep21, start, start + 3_600_000)).toBe(21);
    const tua = docEpGio(new URLSearchParams('gio=17&toc=60'));
    expect(tua).toEqual({ gio: 17, toc: 60 });
    expect(gioLuc(tua, start, start + 60_000)).toBeCloseTo(18);
    expect(gioLuc(tua, start, start + 8 * 60_000)).toBeCloseTo(1); // quấn qua 24 h
    const that = docEpGio(new URLSearchParams(''));
    expect(that).toEqual({ gio: null, toc: 1 });
    expect(gioLuc(that, start, vn(20, 15))).toBeCloseTo(20.25);
    expect(docEpGio(new URLSearchParams('gio=abc')).gio).toBeNull();
  });

  it('R-NGAY-1: cảnh có giờ cố định (chợ đêm, V-108) đứng yên ở giờ đó; ?gio= vẫn ép được; giờ sai → báo', () => {
    const start = vn(10);
    const that = docEpGio(new URLSearchParams(''));
    expect(gioLuc(that, start, vn(12), 21)).toBe(21);
    expect(gioLuc(that, start, vn(3, 30), 21)).toBe(21);
    expect(gioLuc(docEpGio(new URLSearchParams('gio=12')), start, start, 21)).toBe(12);
    expect(gioLuc(that, start, vn(20, 15), -1)).toBeCloseTo(20.25);
    expect(checkDayNight({ ...DEFAULT_DAY_NIGHT, gioCoDinh: 21 })).toEqual([]);
    expect(checkDayNight({ ...DEFAULT_DAY_NIGHT, gioCoDinh: 25 }).join()).toContain('gioCoDinh');
    expect(docEpGio(new URLSearchParams('gio=5.5')).gio).toBe(5.5);
    expect(nhanGio(21.0833)).toBe('21:04');
  });
});

describe('R-NGAY-2: chuyển pha dần, không nhảy cóc; mở lại thì đúng giờ ngay', () => {
  it('liên tục mọi giờ trong ngày, kể cả qua 0 h / 24 h (bước 1 phút lệch < 0,05)', () => {
    let prev = phaNgay(0);
    for (let m = 1; m <= 24 * 60; m++) {
      const cur = phaNgay(m / 60);
      expect(lechPha(prev, cur)).toBeLessThan(0.05);
      prev = cur;
    }
  });

  it('17:00 bắt đầu ngả cam, 18:00 hồng tím (nửa đêm nửa cam), 18:45 là đêm', () => {
    const p17 = phaNgay(17.1);
    expect(p17.hoang).toBeGreaterThan(0);
    expect(p17.dem).toBeLessThan(0.05);
    const p18 = phaNgay(18);
    expect(p18.hoang).toBeGreaterThan(0.6);
    expect(p18.dem).toBeGreaterThan(0.3);
    expect(p18.dem).toBeLessThan(0.9);
    expect(phaNgay(18.75)).toMatchObject({ dem: 1, hoang: 0 });
    // bình minh cũng nhuộm hồng
    expect(phaNgay(5.75).hoang).toBeGreaterThan(0.6);
  });

  it('pha chỉ phụ thuộc giờ hiện tại: tắt app lúc 12:00, mở lại 20:00 → đêm ngay', () => {
    const ep = docEpGio(new URLSearchParams(''));
    expect(phaNgay(gioLuc(ep, vn(20), vn(20))).pha).toBe('dem');
  });
});

describe('R-NGAY-3: đèn bật dần 17:30–18:30, tắt dần 5:30–6:30', () => {
  it('ban ngày đèn tắt hẳn, đêm sáng hẳn, giữa chừng sáng dần', () => {
    expect(phaNgay(12).den).toBe(0);
    expect(phaNgay(17.4).den).toBe(0);
    expect(phaNgay(18).den).toBeCloseTo(0.5);
    expect(phaNgay(18.5).den).toBe(1);
    expect(phaNgay(5.4).den).toBe(1);
    expect(phaNgay(6).den).toBeCloseTo(0.5);
    expect(phaNgay(6.5).den).toBe(0);
  });
});

describe('R-NGAY-4: đêm xanh dịu vẫn chơi rõ', () => {
  it('bảng đêm chung đạt mức sáng tối thiểu; đặc tả tối quá bị báo', () => {
    expect(checkDayNight(DEFAULT_DAY_NIGHT)).toEqual([]);
    const toi = { ...DEFAULT_DAY_NIGHT, dem: { ...DEFAULT_DAY_NIGHT.dem, light: { ...DEFAULT_DAY_NIGHT.dem.light, hemiScale: 0.1 }, tint: { ...DEFAULT_DAY_NIGHT.dem.tint, near: '#202020' } } };
    const errs = checkDayNight(toi);
    expect(errs.some((e) => e.includes('hemiScale'))).toBe(true);
    expect(errs.some((e) => e.includes('tint.near'))).toBe(true);
  });

  it('mốc sai thứ tự bị báo', () => {
    const sai = { ...DEFAULT_DAY_NIGHT, moc: { ...DEFAULT_DAY_NIGHT.moc, chieuTu: 4 } };
    expect(checkDayNight(sai).length).toBeGreaterThan(0);
  });
});

describe('dayNight trong đặc tả cảnh', () => {
  it('mặc định tắt (cảnh cũ không đổi); file chỉ ghi enabled thì bảng đêm chung đủ', () => {
    expect(DEFAULT_SCENE.dayNight.enabled).toBe(false);
    const { spec, problems } = resolveSceneSpec({ dayNight: { enabled: true } });
    expect(problems).toEqual([]);
    expect(spec.dayNight.enabled).toBe(true);
    expect(spec.dayNight.dem.sky).toEqual(DEFAULT_DAY_NIGHT.dem.sky);
  });

  it('nội suy màu theo từng kênh', () => {
    expect(tronMau('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(tronMau('#ff0000', '#0000ff', 0)).toBe('#ff0000');
    expect(tronMau('#ff0000', '#0000ff', 1)).toBe('#0000ff');
  });
});
