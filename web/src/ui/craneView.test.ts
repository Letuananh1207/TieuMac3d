import { describe, expect, it } from 'vitest';
import { CRANE_TEXT, CRANE_UI, departFrame, flightFrame, hintText, landFrame } from './craneView';

// thiết kế 2026-11-15.9 (screen_specs "Cưỡi hạc", artboard CuoiHac-nhip); chuỗi design/l10n/vi.arb crane*
describe('cưỡi hạc — lớp chữ', () => {
  it('R-HANH-5: chuỗi chỉ tiếng Việt, gợi ý theo trạng thái', () => {
    expect(CRANE_TEXT).toEqual({ flyingTo: 'Cưỡi hạc tới', tapToSkip: 'Chạm để bỏ qua', almostThere: 'Sắp tới nơi' });
    expect(hintText('boQua')).toBe('Chạm để bỏ qua');
    expect(hintText('sapToi')).toBe('Sắp tới nơi');
    for (const s of Object.values(CRANE_TEXT)) expect(s).not.toMatch(/[\u4e00-\u9fff]/); // R-HUD-4
  });

  it('R-HANH-5: trang mới mở → màn mây kín + khối chữ, chưa có gợi ý', () => {
    expect(flightFrame(-1)).toEqual({ veil: 1, text: 1, hint: 0 });
    expect(flightFrame(0)).toEqual({ veil: 1, text: 1, hint: 0 });
  });

  it('R-HANH-5: khung đầu cảnh bay → mây tan 0,5 s, khối chữ đứng yên; gợi ý trễ 0,6 s rồi mờ vào 0,3 s', () => {
    expect(CRANE_UI).toEqual({ cloudOut: 0.5, hintDelay: 0.6, hintIn: 0.3 });
    expect(flightFrame(0.25).veil).toBeCloseTo(0.25, 5); // ease-out: nửa thời gian đã tan 3/4
    expect(flightFrame(0.25).text).toBe(1);
    expect(flightFrame(0.5).veil).toBe(0);
    expect(flightFrame(0.6).hint).toBe(0);
    expect(flightFrame(0.75).hint).toBeCloseTo(0.5, 5);
    expect(flightFrame(0.9)).toEqual({ veil: 0, text: 1, hint: 1 });
  });

  it('R-HANH-5: hết bay → mây phủ 0,3 s, chữ + gợi ý mờ đi cùng lúc', () => {
    expect(flightFrame(2, 0.15)).toEqual({ veil: 0.5, text: 0.5, hint: 0.5 });
    expect(flightFrame(2, 0.3)).toEqual({ veil: 1, text: 0, hint: 0 });
  });

  it('R-HANH-5: cất cánh / hạ cánh trên cảnh thật — không gợi ý; hạ cánh mây tan 0,4 s, không chữ', () => {
    expect(departFrame(0)).toEqual({ veil: 0, text: 0, hint: 0 });
    expect(departFrame(1)).toEqual({ veil: 1, text: 1, hint: 0 }); // tải lại trang: khớp màn mây trang mới
    expect(landFrame(0)).toEqual({ veil: 1, text: 0, hint: 0 });
    expect(landFrame(0.2).veil).toBeCloseTo(0.5, 5);
    expect(landFrame(0.4)).toEqual({ veil: 0, text: 0, hint: 0 });
  });
});
