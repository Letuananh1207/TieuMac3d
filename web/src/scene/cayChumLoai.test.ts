import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { bambooGeometry, broadleafGeometry, peachGeometry, plumGeometry, willowGeometry } from './cayChumLoai';
import { triangleCount } from './khoiMem';
import { DEFAULT_SCENE } from './spec';
import { addTrees } from './trees';
import { withLookParam } from './look';

const T = DEFAULT_SCENE.trees;
const peach = [T.peach[0], T.peach[1], T.peach[2]] as const;

describe('tán chùm nổi — các kiểu V-60: ngân sách tam giác (thân + tán / hoa / dải một hình)', () => {
  const cases: [string, (far: boolean) => THREE.BufferGeometry, number, number, number][] = [
    // tên, hình, gần tối thiểu, gần tối đa, xa tối đa
    ['cây tán', (f) => broadleafGeometry(T.trunk, T.leaves, f), 300, 750, 200],
    ['mai', (f) => plumGeometry(T.plum, f), 300, 750, 200],
    ['đào', (f) => peachGeometry(peach, f), 400, 750, 250],
    ['liễu', (f) => willowGeometry(T.trunk, T.willow, f), 350, 750, 250],
    ['trúc', (f) => bambooGeometry(T.bamboo, f), 100, 250, 90],
  ];
  for (const [name, geo, lo, hi, farMax] of cases) {
    it(`${name}: gần ${lo}–${hi}, xa ≤ ${farMax}, xa < gần`, () => {
      const near = triangleCount(geo(false));
      const far = triangleCount(geo(true));
      expect(near).toBeGreaterThanOrEqual(lo);
      expect(near).toBeLessThanOrEqual(hi);
      expect(far).toBeLessThanOrEqual(farMax);
      expect(far).toBeLessThan(near);
    });
    it(`${name}: có màu đỉnh + pháp tuyến dài 1`, () => {
      const g = geo(false);
      expect(g.getAttribute('color')).toBeTruthy();
      const n = g.getAttribute('normal');
      for (let i = 0; i < n.count; i += 7) expect(Math.hypot(n.getX(i), n.getY(i), n.getZ(i))).toBeCloseTo(1, 3);
    });
  }

  it('liễu: gió theo aSway — gốc thân đứng yên, ngọn dải lay mạnh nhất', () => {
    const g = willowGeometry(T.trunk, T.willow, false);
    const s = g.getAttribute('aSway');
    const p = g.getAttribute('position');
    let ground = 0;
    let max = 0;
    for (let i = 0; i < s.count; i++) {
      if (p.getY(i) < 0.05) ground = Math.max(ground, s.getX(i));
      max = Math.max(max, s.getX(i));
    }
    expect(ground).toBe(0);
    expect(max).toBeCloseTo(1, 2);
  });
});

describe('trees.crown "chum" — mọi kiểu (V-60)', () => {
  const build = (crown: 'cau' | 'chum'): THREE.InstancedMesh[] => {
    const scene = new THREE.Scene();
    const yard = (['tan', 'mai', 'dao', 'lieu', 'truc'] as const).map((kind, i) => ({ kind, x: i * 4, z: 0, scale: 1 }));
    const spec = { ...T, crown, ring: { ...T.ring, count: 0 }, yard };
    addTrees(scene, new Colliders(), spec, undefined, DEFAULT_SCENE.look)(1, { x: 0, y: 0, z: 0 }, { x: 0, y: 8, z: 12 });
    return scene.children.filter((o): o is THREE.InstancedMesh => o instanceof THREE.InstancedMesh);
  };

  it('"chum" ở cảnh cũ (look.style cu) vẫn dựng: 5 kiểu × 2 bậc, hết cập nhật ma trận liễu trên CPU', () => {
    expect(DEFAULT_SCENE.look.style).toBe('cu');
    const meshes = build('chum');
    expect(meshes.length).toBe(10);
    expect(meshes.every((m) => m.userData.chum)).toBe(true);
  });

  it('mặc định "cau" giữ cảnh cũ: không có lưới chùm', () => {
    expect(build('cau').some((m) => m.userData.chum)).toBe(false);
  });

  it('?look=cu ép cả dáng cây về "cau" để so trước / sau', () => {
    const spec = { ...DEFAULT_SCENE, trees: { ...T, crown: 'chum' as const } };
    expect(withLookParam(spec, 'cu').trees.crown).toBe('cau');
    expect(withLookParam(spec, null).trees.crown).toBe('chum');
  });
});
