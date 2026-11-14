import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { addFences } from './lanCan';
import { DEFAULT_SCENE, type SceneSpec } from './spec';

const withFence = (style: Partial<SceneSpec['fenceStyle']>): SceneSpec => ({
  ...DEFAULT_SCENE,
  fences: [{ from: [0, 0], to: [6, 0] }],
  fenceStyle: { ...DEFAULT_SCENE.fenceStyle, ...style },
});

describe('lan can (fences) — V-42', () => {
  it('mặc định kiểu gỗ như cũ: 5 trụ (6 m / 1,6 → 4 khoảng) × trụ + chóp, 3 thanh ngang; một vật cản dày 0,3', () => {
    const scene = new THREE.Scene();
    const c = new Colliders();
    addFences(scene, c, withFence({}));
    expect(DEFAULT_SCENE.fenceStyle.kind).toBe('go');
    expect(scene.children).toHaveLength(5 * 2 + 3);
    expect(c.boxes).toHaveLength(1);
    expect(c.boxes[0].maxZ - c.boxes[0].minZ).toBeCloseTo(0.3, 6);
  });

  it('kiểu đá: 4 trụ (6 m / 2 → 3 khoảng), mỗi trụ có chụp + búp sen trên đỉnh lan can; tay vịn, tấm chắn, gờ chân; cao ≈ 0,8 m + đầu sen', () => {
    const scene = new THREE.Scene();
    const c = new Colliders();
    addFences(scene, c, withFence({ kind: 'da', height: 0.8, postEvery: 2 }));
    expect(scene.children).toHaveLength(4 * 3 + 3);
    const top = new THREE.Box3().setFromObject(scene).max.y;
    expect(top).toBeGreaterThan(0.95);
    expect(top).toBeLessThan(1.2);
    expect(c.boxes).toHaveLength(1);
  });
});
