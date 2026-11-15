import { describe, expect, it } from 'vitest';
import { planterGeometry } from './bonCay';
import { DEFAULT_SCENE } from './spec';

describe('bồn cây (R-VA-6)', () => {
  it('một bồn 18 tam giác, có màu đỉnh, cao đúng `trees.planter.height`', () => {
    const g = planterGeometry(DEFAULT_SCENE.trees.planter);
    expect(g.getAttribute('position').count / 3).toBe(18);
    expect(g.getAttribute('color')).toBeDefined();
    g.computeBoundingBox();
    expect(g.boundingBox?.max.y).toBeCloseTo(DEFAULT_SCENE.trees.planter.height, 5);
  });
});
