import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { softBlob } from './khoiMem';
import { softMaterial, tickWind, windChunk, WIND_TIME } from './materials';

describe('khối tròn mềm cho tán cây (kế hoạch canh-dep NV8)', () => {
  it('đáy phẳng, đỉnh sáng hơn đáy, pháp tuyến hướng từ tâm (dài 1)', () => {
    const g = softBlob('#000000', '#808080', '#ffffff', -0.45);
    const pos = g.getAttribute('position');
    const col = g.getAttribute('color');
    const nrm = g.getAttribute('normal');
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      minY = Math.min(minY, pos.getY(i));
      maxY = Math.max(maxY, pos.getY(i));
      expect(Math.hypot(nrm.getX(i), nrm.getY(i), nrm.getZ(i))).toBeCloseTo(1);
    }
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) === maxY) expect(col.getX(i)).toBeGreaterThan(0.8);
      if (pos.getY(i) === minY) expect(col.getX(i)).toBeLessThan(0.05);
    }
    expect(minY).toBeCloseTo(-0.45);
    expect(softBlob('#000000', '#808080', '#ffffff', -0.45, 1).getAttribute('position').count).toBe(240);
  });
});

describe('gió trong vertex shader', () => {
  it('chỉ ngọn: lệch tỉ lệ theo độ cao / tip; cả khối: hệ số 1', () => {
    expect(windChunk({ amp: 0.06, tip: 0.5 })).toContain('position.y / 0.500');
    expect(windChunk({ amp: 0.06 })).toContain('float wK = 0.0600 * 1.0;');
  });

  it('vật liệu có gió chèn uniform đồng hồ chung; không gió thì không chèn', () => {
    const shader = (): THREE.WebGLProgramParametersWithUniforms =>
      ({ uniforms: {}, vertexShader: '#include <begin_vertex>', fragmentShader: '#include <lights_lambert_pars_fragment>' }) as unknown as THREE.WebGLProgramParametersWithUniforms;
    const a = shader();
    softMaterial(0.5, THREE.FrontSide, { amp: 0.05 }).onBeforeCompile(a, {} as THREE.WebGLRenderer);
    expect(a.vertexShader).toContain('uniform float uWindTime;');
    expect(a.uniforms.uWindTime).toBe(WIND_TIME);
    const b = shader();
    softMaterial(0.5).onBeforeCompile(b, {} as THREE.WebGLRenderer);
    expect(b.vertexShader).toBe('#include <begin_vertex>');
    expect(softMaterial(0.5, THREE.FrontSide, { amp: 0.05 }).customProgramCacheKey()).not.toBe(softMaterial(0.5).customProgramCacheKey());
  });

  it('đồng hồ gió tăng theo dt', () => {
    const t0 = WIND_TIME.value;
    tickWind(0.5);
    expect(WIND_TIME.value).toBeCloseTo(t0 + 0.5);
  });
});
