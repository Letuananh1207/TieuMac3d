import { describe, expect, it } from 'vitest';
import { canhDem, canhGio, cauHoiGio, cauRao, cauRaoHaiDong, gioNoi, giayTrongNgayVN, lechGioThu, maNgayVN, soTiengMo } from './gioVN';

/** Mốc UTC của giờ VN `y-m-d h:mi` (GMT+7). */
const vn = (y: number, mo: number, d: number, h: number, mi = 0, s = 0): number => Date.UTC(y, mo - 1, d, h - 7, mi, s);

describe('Đồng hồ giờ Việt Nam (GMT+7)', () => {
  it('R-TIEN-8: giờ và ngày theo GMT+7 từ mốc UTC, không theo múi giờ máy', () => {
    const t = vn(2026, 11, 14, 10, 5);
        expect(giayTrongNgayVN(t)).toBe(10 * 3600 + 5 * 60);
  });

  it('R-TIEN-8: London 18 giờ ngày 14 (UTC 18:00) là 1 giờ sáng ngày 15 ở VN → đã sang ngày mới', () => {
    const london = Date.UTC(2026, 10, 14, 18, 0); // tháng 11 London = UTC
    expect(maNgayVN(london)).toBe(maNgayVN(vn(2026, 11, 15, 0, 1)));
    expect(maNgayVN(london)).toBe(maNgayVN(vn(2026, 11, 14, 23, 59)) + 1);
    expect(Math.floor(giayTrongNgayVN(london) / 3600)).toBe(1);
  });

  it('R-TIEN-8: 23 giờ 59 và 0 giờ 01 (GMT+7) là hai ngày liền nhau', () => {
    expect(maNgayVN(vn(2026, 11, 15, 0, 1)) - maNgayVN(vn(2026, 11, 14, 23, 59))).toBe(1);
    expect(maNgayVN(vn(2026, 11, 14, 0, 0))).toBe(maNgayVN(vn(2026, 11, 14, 23, 59, 59)));
  });
});

describe('Báo giờ Lão Canh', () => {
  it('R-NPC-8: 23:00 → canh ba, 3 tiếng, "Canh ba, đầu giờ Tý (11 giờ đêm) — Trời hanh vật khô…"', () => {
    expect(canhDem(23)).toBe(3);
    expect(soTiengMo(23)).toBe(3);
    expect(cauRao(23)).toBe('Canh ba, đầu giờ Tý (11 giờ đêm) — Trời hanh vật khô, cẩn thận đèn đuốc!');
  });

  it('R-NPC-8: 7:00 → 3 tiếng, "Đầu giờ Thìn (7 giờ sáng) — Trời sáng rồi, ai học chữ thì học đi thôi!"', () => {
    expect(soTiengMo(7)).toBe(3);
    expect(cauRao(7)).toBe('Đầu giờ Thìn (7 giờ sáng) — Trời sáng rồi, ai học chữ thì học đi thôi!');
  });

  it('R-NPC-8: 12:00 → "Chính giờ Ngọ (12 giờ trưa) — Nắng đứng bóng, nghỉ tay uống chén trà."', () => {
    expect(cauRao(12)).toBe('Chính giờ Ngọ (12 giờ trưa) — Nắng đứng bóng, nghỉ tay uống chén trà.');
  });

  it('R-NPC-8: 0:00 → canh ba, chính giờ Tý (12 giờ đêm)', () => {
    expect(soTiengMo(0)).toBe(3);
    expect(cauRao(0).startsWith('Canh ba, chính giờ Tý (12 giờ đêm)')).toBe(true);
  });

  it('R-NPC-8: đêm 19 giờ – 5 giờ gõ số tiếng bằng số canh, ngày gõ 3', () => {
    const tieng = Array.from({ length: 24 }, (_, h) => soTiengMo(h));
    expect(tieng).toEqual([3, 4, 4, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 3]);
    expect(canhDem(5)).toBe(0);
    expect(canhDem(4)).toBe(5); // 4:59 vẫn canh năm
  });

  it('R-NPC-8: mười hai canh giờ, giờ Tý từ 23 giờ', () => {
    expect([23, 0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21].map(canhGio)).toEqual(
      ['Tý', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'],
    );
    expect([0, 7, 12, 15, 19, 23].map(gioNoi)).toEqual(
      ['12 giờ đêm', '7 giờ sáng', '12 giờ trưa', '3 giờ chiều', '7 giờ tối', '11 giờ đêm'],
    );
  });

  it('R-NPC-7: "Bây giờ là giờ gì?" đọc giờ hiện tại theo GMT+7', () => {
    expect(cauHoiGio(vn(2026, 11, 14, 10, 5))).toBe('Bây giờ là giờ Tỵ — 10 giờ 5 phút sáng đó cháu.');
    expect(cauHoiGio(vn(2026, 11, 14, 4, 59))).toBe('Bây giờ là giờ Dần, canh năm — 4 giờ 59 phút sáng đó cháu.');
  });

  it('?gio thử: "08:59:50" hoặc số giờ → đồng hồ VN bắt đầu đúng giờ đó; sai dạng → null', () => {
    const now = vn(2026, 11, 14, 15, 0);
    const lech = lechGioThu('08:59:50', now)!;
    expect(giayTrongNgayVN(now + lech)).toBeCloseTo(8 * 3600 + 59 * 60 + 50, 6);
    expect(giayTrongNgayVN(now + lechGioThu('21.5', now)!)).toBeCloseTo(21.5 * 3600, 6);
    expect(lechGioThu('abc', now)).toBeNull();
    expect(lechGioThu('25:00', now)).toBeNull();
    expect(lechGioThu(null, now)).toBeNull();
  });

  it('R-NPC-8: rao trên kênh chung tách hai tin, mỗi tin ≤ 60 ký tự (R-CHAT-1), ghép lại đúng câu rao', () => {
    for (let h = 0; h < 24; h++) {
      const [a, b] = cauRaoHaiDong(h);
      expect(`${a} — ${b}`).toBe(cauRao(h));
      expect([...a].length).toBeLessThanOrEqual(60);
      expect([...b].length).toBeLessThanOrEqual(60);
    }
  });
});
