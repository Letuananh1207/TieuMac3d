import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { CROP_LOOKS, CROP_STAGES, cropPart, CropLayer } from './cayTrong';
import { DEFAULT_SCENE } from './spec';
import { resolveSceneSpec } from './specCheck';
import { checkGarden, fenceSegments, GARDEN_PLOT_IDS } from './vuonLayout';
import { addGarden } from './vuonLuong';

const NHA = resolveSceneSpec(JSON.parse(readFileSync(new URL('../../../design/scene/nha-ta.json', import.meta.url), 'utf8')));
const g = NHA.spec.garden;

describe('vườn rau — bố cục (R-VUON-1)', () => {
  it('R-VUON-1: cảnh mặc định không có vườn; Nhà của ta có 12 luống o-1 … o-12, 3 cột × 4 hàng, đặc tả không lỗi', () => {
    expect(DEFAULT_SCENE.garden.enabled).toBe(false);
    expect(NHA.problems).toEqual([]);
    expect(g.enabled).toBe(true);
    expect(g.plots.map((p) => p.id)).toEqual(GARDEN_PLOT_IDS);
    expect(new Set(g.plots.map((p) => p.x)).size).toBe(3);
    expect(new Set(g.plots.map((p) => p.z)).size).toBe(4);
    // 6 luống mở sẵn ở hai hàng giữa (gần cổng vườn nhất — cổng ở giữa cạnh tây, V-68: vườn giữa đảo z −16 … −3)
    expect(new Set(g.plots.slice(0, 6).map((p) => Math.round(Math.abs(p.z - g.fence.gate) * 10) / 10))).toEqual(new Set([1.3]));
  });

  it('R-VUON-1: rào chặn, chừa khe cổng cạnh tây; luống không chặn người; thùng thu mua chặn', () => {
    const c = new Colliders();
    addGarden(new THREE.Scene(), c, g, NHA.spec.look);
    expect(c.boxes).toHaveLength(fenceSegments(g).length + 1);
    // đi qua khe cổng (3,5; −9,5) và đứng trên luống (6,1; −10,8) → không bị đẩy
    for (const [x, z] of [[3.5, -9.5], [6.1, -10.8], [8.7, -5.6]]) {
      const q = { x, z };
      c.resolve(q, 0.4);
      expect(q).toEqual({ x, z });
    }
    // sát rào nam (z −3) từ trong → bị đẩy lùi
    const s = { x: 8.7, z: -3.1 };
    c.resolve(s, 0.4);
    expect(s.z).toBeLessThan(-3.1);
    const b = { x: g.bin.x, z: g.bin.z };
    c.resolve(b, 0.4);
    expect(b).not.toEqual({ x: g.bin.x, z: g.bin.z });
  });

  it('R-VUON-1: kiểm đặc tả — thiếu luống, luống ra ngoài rào, thùng trong rào → báo lỗi', () => {
    const bad = { ...NHA.spec, garden: { ...g, plots: g.plots.slice(1).concat({ id: 'o-2', x: 30, z: 0 }), bin: { x: 8, z: -9, rotY: 0 } } };
    const out = checkGarden(bad);
    expect(out.some((m) => m.includes('cần đủ 12 luống'))).toBe(true);
    expect(out.some((m) => m.includes('nằm trong rào'))).toBe(true);
    expect(out.some((m) => m.includes('garden.bin'))).toBe(true);
  });
});

describe('cây trên luống (R-VUON-4)', () => {
  it('R-VUON-4: 8 cây × 3 dáng có hình trong gói Kenney; vừa gieo = ụ đất; cây lạ → lá', () => {
    expect(Object.keys(CROP_LOOKS)).toEqual(['cai', 'cu-cai', 'ngo', 'lua', 'bi', 'cuc', 'dua', 'tra']);
    for (const crop of Object.keys(CROP_LOOKS)) {
      for (const stage of CROP_STAGES) {
        const f = new URL(`../../../design/models/thuc-vat/vuon/${cropPart({ crop, stage }).shape}.glb`, import.meta.url);
        expect(readFileSync(f, 'utf8').length).toBeGreaterThan(0);
      }
    }
    expect(cropPart({ crop: 'lua', stage: 'vua-gieo' }).shape).toBe('dat');
    expect(cropPart({ crop: 'la', stage: 'chin' }).shape).toBe('la-b');
  });

  it('R-VUON-4: mọi cây gộp một lưới; cùng dáng → không dựng lại', () => {
    const scene = new THREE.Scene();
    const layer = new CropLayer(scene, [{ x: 0, y: 0, z: 0, size: 1.6 }, { x: 2, y: 0, z: 0, size: 1.6 }], NHA.spec.look, 1.6);
    layer.show([{ crop: 'cai', stage: 'chin' }, null]);
    const geo = layer.mesh.geometry;
    expect(layer.triangles).toBeGreaterThan(0);
    layer.show([{ crop: 'cai', stage: 'chin' }, null]);
    expect(layer.mesh.geometry).toBe(geo);
    layer.show([null, null]);
    expect(layer.triangles).toBe(0);
    expect(scene.children.filter((o) => o instanceof THREE.Mesh)).toHaveLength(1);
  });
});
