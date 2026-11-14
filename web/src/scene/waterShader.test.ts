import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOK } from './look';
import { WIND_TIME } from './materials';
import { circleEdge, linkWaterClock, rectEdge, setShore, softWaterMaterial } from './waterShader';

describe('nước stylized (kế hoạch canh-dep NV4)', () => {
  it('khoảng cách tới bờ: chữ nhật, tròn', () => {
    expect(rectEdge(8, 4)(0, 0)).toBe(2);
    expect(rectEdge(8, 4)(3.5, 0)).toBeCloseTo(0.5);
    expect(circleEdge(3)(0, 0)).toBe(3);
    expect(circleEdge(3)(3, 0)).toBe(0);
  });

  it('thuộc tính shore: mét + tỉ lệ 0 (bờ) … 1 (tâm)', () => {
    const g = new THREE.PlaneGeometry(8, 4, 8, 4);
    setShore(g, rectEdge(8, 4), 2);
    const a = g.getAttribute('shore');
    let maxT = 0;
    let minT = 1;
    for (let i = 0; i < a.count; i++) {
      maxT = Math.max(maxT, a.getY(i));
      minT = Math.min(minT, a.getY(i));
    }
    expect(maxT).toBe(1);
    expect(minT).toBe(0);
  });

  it('mức Thấp: không gợn (R-HIEU-1); đồng hồ dùng chung với gió', () => {
    expect(softWaterMaterial(DEFAULT_LOOK, '#ffffff', false).uniforms.uRipple.value).toBe(0);
    expect(softWaterMaterial(DEFAULT_LOOK, '#ffffff', true).uniforms.uRipple.value).toBe(DEFAULT_LOOK.water.ripple);
    expect(linkWaterClock(softWaterMaterial(DEFAULT_LOOK, '#ffffff', true)).uniforms.uTime).toBe(WIND_TIME);
  });
});
