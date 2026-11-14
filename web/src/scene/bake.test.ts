import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { aoFactor, bakeSoftColors, shadeColor, SOFT_LOOK_TRY, type SoftLook } from './bake';

const look: SoftLook = { wrap: 0.5, ao: 0.4, foot: 1, footShare: 0.5, aoTint: '#000000' };

describe('aoFactor — bóng nướng sẵn (kế hoạch canh-dep NV3)', () => {
  it('chân tường tối hơn đỉnh tường; trên vùng chân thì không bóng', () => {
    expect(aoFactor(0, 0, look)).toBeCloseTo(1 - 0.4 * 0.5);
    expect(aoFactor(0.5, 0, look)).toBeGreaterThan(aoFactor(0, 0, look));
    expect(aoFactor(1, 0, look)).toBe(1);
    expect(aoFactor(5, 0, look)).toBe(1);
  });

  it('mặt hướng thẳng xuống (gầm mái) tối nhất = 1 − ao, ở mọi độ cao', () => {
    expect(aoFactor(6, -1, look)).toBeCloseTo(0.6);
    expect(aoFactor(0, -1, look)).toBeCloseTo(0.6);
  });

  it('mặt hướng lên không thêm bóng; hệ số luôn trong [1 − ao, 1]', () => {
    for (const h of [0, 0.3, 2]) {
      for (const ny of [-1, -0.4, 0, 0.7, 1]) {
        const f = aoFactor(h, ny, look);
        expect(f).toBeGreaterThanOrEqual(0.6 - 1e-9);
        expect(f).toBeLessThanOrEqual(1);
      }
    }
    expect(aoFactor(3, 1, look)).toBe(1);
  });
});

describe('shadeColor — bóng pha về màu ấm, không đen', () => {
  const base = new THREE.Color(0.8, 0.6, 0.4);
  const tint = new THREE.Color(SOFT_LOOK_TRY.aoTint);

  it('hệ số 1 giữ nguyên màu gốc', () => {
    expect(shadeColor(base, 1, tint).getHex()).toBe(base.getHex());
  });

  it('hệ số 0 = màu gốc nhân màu bóng (không về đen)', () => {
    const c = shadeColor(base, 0, tint);
    expect(c.r).toBeCloseTo(base.r * tint.r);
    expect(c.b).toBeCloseTo(base.b * tint.b);
    expect(c.r + c.g + c.b).toBeGreaterThan(0);
  });
});

describe('bakeSoftColors', () => {
  it('hộp đứng trên đất: đỉnh đáy sẫm hơn đỉnh trên, mặt đáy (hướng xuống) sẫm nhất', () => {
    const g = new THREE.BoxGeometry(1, 3, 1).translate(0, 1.5, 0).toNonIndexed();
    bakeSoftColors(g, new THREE.Color(1, 1, 1), look);
    const pos = g.getAttribute('position');
    const nrm = g.getAttribute('normal');
    const col = g.getAttribute('color');
    let side0 = -1;
    let side3 = -1;
    let bottom = -1;
    for (let i = 0; i < pos.count; i++) {
      if (nrm.getY(i) < -0.9) bottom = col.getX(i);
      else if (Math.abs(nrm.getY(i)) < 0.1 && pos.getY(i) === 0) side0 = col.getX(i);
      else if (Math.abs(nrm.getY(i)) < 0.1 && pos.getY(i) === 3) side3 = col.getX(i);
    }
    expect(side3).toBeCloseTo(1);
    expect(side0).toBeLessThan(side3);
    expect(bottom).toBeLessThan(side0);
  });

  it('độ cao tính theo mặt đất `groundY` (đất cao 10 → chân hộp ở y 10 vẫn là chân)', () => {
    const g = new THREE.BoxGeometry(1, 1, 1).translate(0, 10.5, 0).toNonIndexed();
    bakeSoftColors(g, new THREE.Color(1, 1, 1), look, () => 10);
    const pos = g.getAttribute('position');
    const nrm = g.getAttribute('normal');
    const col = g.getAttribute('color');
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(nrm.getY(i)) < 0.1 && pos.getY(i) === 10) expect(col.getX(i)).toBeCloseTo(0.8);
    }
  });
});
