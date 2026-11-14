import { describe, expect, it } from 'vitest';
import {
  bookPose,
  railPose,
  fingertip,
  len,
  MIN_EYE_DIST,
  reach,
  REACH_GO,
  REACH_TOTAL,
  reachPhase,
  restPose,
  scrollPose,
  SHOULDER_R,
  TEA_CYCLE,
  TEA_SIP,
  teaPose,
  type HandsPose,
  type V3,
} from './tayNgoiDang';

const far = (p: HandsPose): void => {
  for (const h of [p.left, p.right]) expect(len(h.pos)).toBeGreaterThanOrEqual(MIN_EYE_DIST);
};
const dist = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('R-DIEU-7: hai bàn tay khi nhìn từ mắt', () => {
  it('R-DIEU-7: cầm cuộn — tay trái bên trái, tay phải bên phải trục, lòng quay vào cuộn', () => {
    const p = scrollPose([0, -0.33, 0.47], [1, 0, 0], 0.15);
    // cổ tay ngoài trục, lùi sau trục — ba ngón co móc ôm trục (không chĩa lên)
    expect(p.left.pos[0]).toBeLessThan(-0.15);
    expect(p.right.pos[0]).toBeGreaterThan(0.15);
    expect(p.left.pos[2]).toBeLessThan(0.47);
    expect(p.left.palm[0]).toBeGreaterThan(0);
    expect(p.right.palm[0]).toBeLessThan(0);
    far(p);
  });

  it('R-DIEU-7: trỏ vào mục — đầu ngón trỏ chạm đúng điểm (±1 cm), rồi rút về', () => {
    const target: V3 = [0.05, -0.3, 0.47];
    const base = scrollPose([0, -0.33, 0.47], [1, 0, 0], 0.15);
    const p = reach(base, target, 1);
    expect(dist(fingertip(p.right.pos, SHOULDER_R), target)).toBeLessThan(0.01);
    expect(p.right.point).toBe(1);
    expect(reachPhase(0)).toBe(0);
    expect(reachPhase(REACH_GO + 0.05)).toBe(1);
    expect(reachPhase(REACH_TOTAL)).toBe(0);
    expect(reach(base, target, 0)).toBe(base);
    far(p);
  });

  it('R-NGOI-1: bàn trà — tay phải cầm chén, cứ 8 giây nâng lên một lần, không sát mắt', () => {
    const hold = teaPose(1);
    const sip = teaPose(TEA_CYCLE - TEA_SIP / 2);
    expect(hold.cup).toBe(true);
    expect(sip.right.pos[1]).toBeGreaterThan(hold.right.pos[1]);
    for (let t = 0; t < TEA_CYCLE; t += 0.1) far(teaPose(t));
  });

  it('R-NGOI-1: án thư — hai tay đặt hai bên quyển sách; tay để yên không sát mắt', () => {
    const p = bookPose([0, -0.5, 0.45]);
    expect(p.left.pos[0]).toBeLessThan(0);
    expect(p.right.pos[0]).toBeGreaterThan(0);
    far(p);
    far(restPose());
  });

  it('R-GIAO-1: đặt quân — tay phải cầm quân với tới giao điểm', () => {
    const at: V3 = [0.1, -1.0, 0.9];
    const p = reach(restPose(), at, 1, true);
    expect(p.stone).toBe(true);
    expect(dist(fingertip(p.right.pos), at)).toBeLessThan(0.01);
  });

  it('R-VA-4: ghế lan can — hai tay đặt lên thanh lan can, lòng úp, cách nhau, không sát mắt', () => {
    const p = railPose(0.58, -0.4);
    expect(p.left.pos[1]).toBeCloseTo(-0.38);
    expect(p.right.pos[0] - p.left.pos[0]).toBeGreaterThan(0.3);
    expect(p.left.palm[1]).toBeLessThan(0);
    far(p);
  });
});
