import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOK } from './look';
import { puffGeometry } from './sky';
import { skyColor } from './skyDome';
import { mistBands } from './farMountains';
import { DEFAULT_SCENE } from './spec';

const top = new THREE.Color('#0000ff');
const mid = new THREE.Color('#00ff00');
const hor = new THREE.Color('#ff0000');
const glow = new THREE.Color('#ffffff');
const sun = new THREE.Vector3(1, 0, 0);

describe('vòm trời (kế hoạch canh-dep NV7)', () => {
  it('chân trời → giữa → đỉnh theo độ cao hướng nhìn', () => {
    const c = new THREE.Color();
    expect(skyColor(new THREE.Vector3(0, 0, -1), sun, top, mid, hor, glow, 0, c).getHex()).toBe(hor.getHex());
    expect(skyColor(new THREE.Vector3(0, 1, 0), sun, top, mid, hor, glow, 0, c).getHex()).toBe(top.getHex());
    const m = skyColor(new THREE.Vector3(0, 0.3, -0.954), sun, top, mid, hor, glow, 0, c);
    expect(m.g).toBeCloseTo(1);
  });

  it('quầng nắng chỉ quanh hướng mặt trời; size 0 = không quầng', () => {
    const c = new THREE.Color();
    const toward = skyColor(new THREE.Vector3(1, 0, 0), sun, top, mid, hor, glow, 0.35, c).clone();
    const away = skyColor(new THREE.Vector3(-1, 0, 0), sun, top, mid, hor, glow, 0.35, c).clone();
    expect(toward.g).toBeGreaterThan(0.5);
    expect(away.getHex()).toBe(hor.getHex());
    expect(skyColor(new THREE.Vector3(1, 0, 0), sun, top, mid, hor, glow, 0, c).getHex()).toBe(hor.getHex());
  });
});

describe('mây phồng, dải sương núi', () => {
  it('mây: đáy phẳng, trên sáng hơn bụng', () => {
    const g = puffGeometry('#ffffff', '#000000');
    const pos = g.getAttribute('position');
    const col = g.getAttribute('color');
    let minY = Infinity;
    let hi = 0;
    let lo = 1;
    for (let i = 0; i < pos.count; i++) {
      minY = Math.min(minY, pos.getY(i));
      if (pos.getY(i) > 1.2) hi = Math.max(hi, col.getX(i));
      if (pos.getY(i) <= -0.34) lo = Math.min(lo, col.getX(i));
    }
    expect(minY).toBeCloseTo(-0.35);
    expect(hi).toBeGreaterThan(lo);
  });

  it('sương: mỗi lớp núi một vòng, đặc ở chân, trong suốt ở mép trên', () => {
    const spec = {
      ...DEFAULT_SCENE,
      farMountains: { base: -40, layers: [{ radius: 170, height: 40, color: '#000000', peaks: 5 }, { radius: 240, height: 60, color: '#000000', peaks: 5 }] },
      look: { ...DEFAULT_LOOK, style: 'mem' as const },
    };
    const g = mistBands(spec);
    const col = g.getAttribute('color');
    expect(col.itemSize).toBe(4);
    expect(g.getAttribute('position').count).toBe(2 * 96 * 6);
    const alphas = new Set<number>();
    for (let i = 0; i < col.count; i++) alphas.add(Math.round(col.getW(i) * 100));
    expect([...alphas].sort((a, b) => a - b)).toEqual([0, Math.round(DEFAULT_LOOK.mist.opacity * 100)]);
  });
});
