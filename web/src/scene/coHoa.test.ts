import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { flowerGeometry, MAX_FLOWERS, MAX_SOFT_TUFTS, softTuftGeometry } from './coHoa';
import { groundColor, patch } from './terrainMem';
import { DEFAULT_SCENE } from './spec';

describe('cỏ hoa cảnh mềm (kế hoạch canh-dep NV9)', () => {
  it('búi cỏ 4 tam giác, hoa 5 tam giác; trần số lượng giữ ngân sách (≤ 2 500 búi, ≤ 800 bông)', () => {
    expect(softTuftGeometry().getAttribute('position').count / 3).toBe(4);
    expect(flowerGeometry().getAttribute('position').count / 3).toBe(5);
    expect(MAX_SOFT_TUFTS * 4 + MAX_FLOWERS * 5).toBeLessThanOrEqual(14000);
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
