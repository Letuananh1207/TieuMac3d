import { describe, expect, it } from 'vitest';
import { absorbSquat, arriveStand, CRANE_LEGS, launchLegs } from './scene/hacDuong';
import { CRANE_TIMING } from './zones/cuoiHac';

describe('R-HANH-5 (L-22): chân hạc — duỗi xuống trước khi chạm, nhún, bật, thu chân (mốc thời gian giữ nguyên)', () => {
  it('sà xuống: chân thẳng đứng hẳn trước khi chạm đất, lúc còn bay xa thì duỗi sau', () => {
    expect(arriveStand(0.3)).toBe(0);
    expect(arriveStand(0.9)).toBe(1);
    expect(arriveStand(1)).toBe(1);
  });

  it('nhún đỡ quanh lúc chạm, hết trước khi nhân vật nhảy lên / xuống xong', () => {
    expect(absorbSquat(-0.2)).toBe(0);
    expect(absorbSquat(0.1)).toBeGreaterThan(0.2);
    expect(absorbSquat(CRANE_LEGS.absorb)).toBe(0);
    expect(CRANE_LEGS.absorb).toBeLessThan(CRANE_TIMING.mount - CRANE_TIMING.arrive);
  });

  it('cất cánh: đứng yên nhún xuống → bật (rời đất) → chân thu hết; đường bay xong đúng hết khúc', () => {
    const len = CRANE_TIMING.takeoff - CRANE_TIMING.mount;
    const a = launchLegs(0, len);
    expect([a.stand, a.squat, a.u]).toEqual([1, 0, 0]);
    const c = launchLegs(CRANE_LEGS.crouch, len);
    expect(c.squat).toBeCloseTo(1, 5);
    expect(c.u).toBe(0); // còn trên đất lúc nhún sâu nhất
    expect(c.fold).toBe(0); // cánh đã mở
    const up = launchLegs(CRANE_LEGS.crouch + CRANE_LEGS.spring, len);
    expect(up.squat).toBeCloseTo(0, 5);
    expect(up.u).toBeGreaterThan(0);
    expect(launchLegs(CRANE_LEGS.crouch + CRANE_LEGS.spring + CRANE_LEGS.tuck, len).stand).toBe(0);
    expect(launchLegs(len, len).u).toBe(1);
    // chân thu xong trước khi mây bắt đầu phủ
    expect(CRANE_LEGS.crouch + CRANE_LEGS.spring + CRANE_LEGS.tuck).toBeLessThanOrEqual(CRANE_TIMING.veilFrom - CRANE_TIMING.mount + 1e-9);
  });
});
