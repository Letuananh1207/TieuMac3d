import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { cupFlowerGeometry, flowerGeometry, MAX_FLOWERS, MAX_SOFT_TUFTS, softTuftGeometry } from './coHoa';
import { groundColor, patch } from './terrainMem';
import { DEFAULT_SCENE } from './spec';

describe('cỏ hoa cảnh mềm (kế hoạch canh-dep NV9)', () => {
  it('búi cỏ 4 tam giác, hoa 5 tam giác; trần số lượng giữ ngân sách (≤ 1 500 búi, ≤ 600 bông)', () => {
    expect(softTuftGeometry().getAttribute('position').count / 3).toBe(4);
    expect(flowerGeometry().getAttribute('position').count / 3).toBe(5);
    expect(MAX_SOFT_TUFTS * 4 + MAX_FLOWERS * 5).toBeLessThanOrEqual(9000);
  });

  it('búi cỏ: gốc tối hơn ngọn (màu đỉnh); pháp tuyến hướng lên', () => {
    const g = softTuftGeometry();
    const pos = g.getAttribute('position');
    const col = g.getAttribute('color');
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) === 0) expect(col.getX(i)).toBeLessThan(0.6);
      else expect(col.getX(i)).toBeGreaterThan(1);
      expect(g.getAttribute('normal').getY(i)).toBe(1);
    }
  });
});

describe('hoa chén + gốc cỏ theo đất (cây chum, V-60)', () => {
  it('hoa chén 12 tam giác (5 cánh × 2 + cuống + lá); trần 600 bông vẫn ≤ 7,2k tam giác', () => {
    expect(cupFlowerGeometry().getAttribute('position').count / 3).toBe(12);
    expect(MAX_FLOWERS * 12).toBeLessThanOrEqual(7200);
  });

  it('cánh nghiêng lên: mũi cánh cao hơn nhị (không còn đĩa phẳng)', () => {
    const p = cupFlowerGeometry().getAttribute('position');
    expect(p.getY(1) - p.getY(0)).toBeGreaterThan(0.08);
  });

  it('búi cỏ có lift: gốc = 1 (màu búi = màu đất), ngọn = lift', () => {
    const lift = new THREE.Color(1.3, 1.25, 1.1);
    const g = softTuftGeometry(lift);
    const pos = g.getAttribute('position');
    const col = g.getAttribute('color');
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) === 0) expect(col.getX(i)).toBe(1);
      else expect(col.getX(i)).toBeGreaterThan(1.2);
    }
  });
});

describe('đất mềm: màu theo dốc chuyển mượt', () => {
  const t = DEFAULT_SCENE.terrain;
  const c = new THREE.Color();

  it('đất phẳng là cỏ, dốc quá slopeRock là đá; giữa hai mốc là màu pha', () => {
    const flat = groundColor(t, 0, 0, 0, 0, c).clone();
    expect(flat.getHex()).toBe(new THREE.Color(t.colors.grass[0]).getHex());
    expect(groundColor(t, t.slopeRock + 10, 0, 0, 0, c).getHex()).toBe(new THREE.Color(t.colors.rock).getHex());
    const mid = groundColor(t, t.slopeDirt, 0, 0, 0, c).clone();
    expect(mid.getHex()).not.toBe(flat.getHex());
    expect(mid.getHex()).not.toBe(new THREE.Color(t.colors.dirt).getHex());
  });

  it('nhiễu mảng cỏ trong 0…1', () => {
    for (const [x, z] of [[0, 0], [37, -12], [-200, 90]]) {
      expect(patch(x, z)).toBeGreaterThanOrEqual(0);
      expect(patch(x, z)).toBeLessThanOrEqual(1);
    }
  });
});
