import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CROP_STAGES, codePart, CropLayer } from './cayTrong';
import { CODE_LOOKS, codeShape, POP_S, popScale } from './cayTrongHinh';
import { triangleCount } from './khoiMem';
import { DEFAULT_SCENE } from './spec';

/** mã cây `zones/vuon.ts` (lớp scene không import zones) */
const CROPS = ['cai', 'cu-cai', 'ngo', 'lua', 'bi', 'cuc', 'dua', 'tra'].map((id) => ({ id }));

describe('cây vườn dựng code (cây chum, V-60)', () => {
  it('đủ 8 cây × 4 dáng; vừa gieo = ụ đất; cây lạ → cải', () => {
    for (const c of CROPS) expect(CODE_LOOKS[c.id]).toBeTruthy();
    expect(codePart({ crop: 'lua', stage: 'vua-gieo' }).shape).toBe('dat');
    expect(codePart({ crop: 'la', stage: 'chin' }).shape).toBe('cai-chin');
  });

  it('mỗi khóm ≤ 150 tam giác, mỗi luống ≤ 400; 4 dáng của một cây khác hình và lớn dần', () => {
    for (const c of CROPS) {
      const sizes = CROP_STAGES.map((stage) => {
        const part = codePart({ crop: c.id, stage });
        const g = codeShape(part.shape);
        const tri = triangleCount(g);
        expect(tri).toBeLessThanOrEqual(150);
        expect(tri * part.count).toBeLessThanOrEqual(400);
        g.computeBoundingBox();
        const s = g.boundingBox!.getSize(new THREE.Vector3());
        return { shape: part.shape, h: s.y * part.scale, w: Math.max(s.x, s.z) * part.scale };
      });
      expect(new Set(sizes.map((x) => x.shape)).size).toBe(4);
      // lớn dần: đang lớn to hơn mầm, chín to hơn đang lớn (cao hoặc rộng)
      expect(Math.max(sizes[2].h - sizes[1].h, sizes[2].w - sizes[1].w)).toBeGreaterThan(0);
      expect(Math.max(sizes[3].h - sizes[2].h, sizes[3].w - sizes[2].w)).toBeGreaterThan(0);
    }
  });

  it('hình chỉ có vị trí + pháp tuyến + màu, không chỉ mục (gộp được)', () => {
    for (const c of CROPS)
      for (const stage of CROP_STAGES) {
        const g = codeShape(codePart({ crop: c.id, stage }).shape);
        expect(g.index).toBeNull();
        expect(Object.keys(g.attributes).sort()).toEqual(['color', 'normal', 'position']);
      }
  });

  it('nảy: 0,6 → 1,1 → 1,0 trong 0,25 s', () => {
    expect(POP_S).toBe(0.25);
    expect(popScale(0)).toBeCloseTo(0.6);
    expect(popScale(POP_S * 0.6)).toBeCloseTo(1.1);
    expect(popScale(POP_S)).toBe(1);
    expect(popScale(1)).toBe(1);
  });

  it('CropLayer code: đổi dáng → nảy (lưới nhỏ hơn lúc đầu), hết 0,25 s về cỡ thật; lần dựng đầu không nảy', () => {
    const scene = new THREE.Scene();
    const layer = new CropLayer(scene, [{ x: 0, y: 0, z: 0, size: 1.6 }], DEFAULT_SCENE.look, 1.6, true);
    const width = (): number => {
      layer.mesh.geometry.computeBoundingBox();
      return layer.mesh.geometry.boundingBox!.getSize(new THREE.Vector3()).x;
    };
    layer.show([{ crop: 'bi', stage: 'lon' }]);
    const w0 = width();
    layer.tick(0.1);
    expect(width()).toBeCloseTo(w0); // lần đầu: không nảy
    layer.show([{ crop: 'bi', stage: 'chin' }]);
    const full = (() => {
      layer.tick(1);
      return width();
    })();
    layer.show([{ crop: 'bi', stage: 'lon' }]);
    layer.show([{ crop: 'bi', stage: 'chin' }]);
    expect(width()).toBeLessThan(full); // vừa đổi: 0,6 cỡ
    layer.tick(POP_S + 0.01);
    expect(width()).toBeCloseTo(full);
  });
});
