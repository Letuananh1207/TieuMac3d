import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { bushGeometry, lodNear, pineGeometry } from './cayChum';
import { CROWN_MIN_NY, softCrown, triangleCount } from './khoiMem';
import { DEFAULT_SCENE } from './spec';
import { addTrees } from './trees';

const LEAVES = ['#2f5a3a', '#3f6e45', '#4a7a4a'] as const;
const SOFT = { ...DEFAULT_SCENE.look, style: 'mem' as const };

describe('tán chùm nổi (V-58)', () => {
  it('mỗi múi 8 × 4 = 48 tam giác; pháp tuyến dài 1, đáy không cúi quá −0,3', () => {
    const g = softCrown({ lobes: [{ x: 0, y: 0, z: 0, rx: 1, ry: 0.5, rz: 1 }, { x: 1, y: 0.2, z: 0, rx: 0.6, ry: 0.4, rz: 0.6 }], colors: LEAVES });
    expect(triangleCount(g)).toBe(96);
    const n = g.getAttribute('normal');
    for (let i = 0; i < n.count; i++) {
      expect(Math.hypot(n.getX(i), n.getY(i), n.getZ(i))).toBeCloseTo(1);
      expect(n.getY(i)).toBeGreaterThanOrEqual(CROWN_MIN_NY - 1e-6);
    }
  });

  it('lõi tán tối hơn mép: đỉnh hướng vào giữa tán tối hơn đỉnh hướng ra ngoài cùng độ cao', () => {
    const g = softCrown({ lobes: [{ x: 0, y: 0, z: 0, rx: 0.4, ry: 0.4, rz: 0.4 }, { x: 1.2, y: 0, z: 0, rx: 0.4, ry: 0.4, rz: 0.4 }], colors: ['#808080', '#808080', '#808080'], rimAmount: 0, noise: 0 });
    const p = g.getAttribute('position');
    const c = g.getAttribute('color');
    let inner = 0;
    let outer = 0;
    for (let i = 0; i < p.count; i++) {
      if (Math.abs(p.getY(i)) > 1e-3 || Math.abs(p.getZ(i)) > 1e-3) continue;
      if (Math.abs(p.getX(i) - 0.4) < 1e-3) inner = c.getX(i);
      if (Math.abs(p.getX(i) + 0.4) < 1e-3) outer = c.getX(i);
    }
    expect(inner).toBeGreaterThan(0);
    expect(inner).toBeLessThan(outer);
  });

  it('ngân sách: tùng gần 500–750, tùng xa ≤ 200, bụi gần ≤ 300, bụi xa ≤ 120 tam giác (thân + tán một hình)', () => {
    const pineNear = triangleCount(pineGeometry('#5a4030', LEAVES, false));
    const pineFar = triangleCount(pineGeometry('#5a4030', LEAVES, true));
    expect(pineNear).toBeGreaterThanOrEqual(500);
    expect(pineNear).toBeLessThanOrEqual(750);
    expect(pineFar).toBeLessThanOrEqual(200);
    expect(triangleCount(bushGeometry(['#b8462a', '#d8a03a'], false))).toBeLessThanOrEqual(300);
    expect(triangleCount(bushGeometry(['#b8462a', '#d8a03a'], true))).toBeLessThanOrEqual(120);
  });
});

describe('LOD 2 bậc', () => {
  const trees = [
    { x: 0, z: 0 },
    { x: 30, z: 0 },
    { x: 0, z: 40 },
  ];
  it('cách nhân vật ≤ lodDistance = bậc gần, xa hơn = bậc xa', () => {
    expect(lodNear(trees, { x: 0, y: 0, z: 0 }, { x: 0, y: 8, z: 12 }, 35)).toEqual([true, true, false]);
  });
  it('camera cao hơn nhân vật quá lodDistance (nhìn từ trên) → mọi cây bậc xa', () => {
    expect(lodNear(trees, { x: 0, y: 0, z: 0 }, { x: 0, y: 200, z: 0 }, 35)).toEqual([false, false, false]);
  });
  it('chưa biết nhân vật → mọi cây bậc gần', () => {
    expect(lodNear(trees, undefined, undefined, 35)).toEqual([true, true, true]);
  });
});

describe('dựng cây theo trees.crown', () => {
  const build = (crown: 'cau' | 'chum'): THREE.InstancedMesh[] => {
    const scene = new THREE.Scene();
    const spec = {
      ...DEFAULT_SCENE.trees,
      crown,
      ring: { ...DEFAULT_SCENE.trees.ring, count: 0 },
      yard: [
        { kind: 'tung' as const, x: 0, z: 0, scale: 1 },
        { kind: 'tung' as const, x: 60, z: 0, scale: 1 },
        { kind: 'bui' as const, x: 3, z: 0, scale: 1 },
      ],
    };
    const update = addTrees(scene, new Colliders(), spec, undefined, SOFT);
    update(1, { x: 0, y: 0, z: 0 }, { x: 0, y: 8, z: 12 });
    return scene.children.filter((o): o is THREE.InstancedMesh => o instanceof THREE.InstancedMesh);
  };

  it('mặc định "cau" giữ cảnh cũ: tùng thân + đám lá cầu 48 mặt, bụi 2 khối 20 mặt', () => {
    expect(DEFAULT_SCENE.trees.crown).toBe('cau');
    const meshes = build('cau');
    expect(meshes.some((m) => m.userData.chum)).toBe(false);
    expect(meshes.map((m) => triangleCount(m.geometry))).toEqual([24, 48, 20, 20]);
  });

  it('"chum": mỗi kiểu 2 InstancedMesh (gần / xa), cây xa nhân vật sang bậc xa', () => {
    const meshes = build('chum');
    expect(meshes.length).toBe(4);
    const [pineNear, pineFar, bushNear, bushFar] = meshes;
    expect([pineNear.count, pineFar.count, bushNear.count, bushFar.count]).toEqual([1, 1, 1, 0]);
    expect(triangleCount(pineNear.geometry)).toBeGreaterThan(triangleCount(pineFar.geometry));
  });
});
