import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { CROP_LOOKS, CROP_STAGES, cropPart, CropLayer } from './cayTrong';
import { DEFAULT_SCENE } from './spec';
import { resolveSceneSpec } from './specCheck';
import { borderBoxes, checkGarden, fenceSegments, GARDEN_PLOT_IDS, gardenZone, inBox, tapPlan } from './vuonLayout';
import { addGarden } from './vuonLuong';

const NHA = resolveSceneSpec(JSON.parse(readFileSync(new URL('../../../design/scene/nha-ta.json', import.meta.url), 'utf8')));
const g = NHA.spec.garden;

describe('vườn rau — bố cục "Trục giữa" (R-VUON-1, V-82)', () => {
  it('R-VUON-1: cảnh mặc định có rào (như cũ); Nhà của ta: vườn không rào, 12 luống o-1 … o-12, 6 mỗi bên lối trục (2 cột × 3 hàng), đặc tả không lỗi', () => {
    expect(DEFAULT_SCENE.garden.enabled).toBe(false);
    expect(DEFAULT_SCENE.garden.layout).toBe('rao');
    expect(NHA.problems).toEqual([]);
    expect(g.enabled).toBe(true);
    expect(g.layout).toBe('mo');
    expect(g.plots.map((p) => p.id)).toEqual(GARDEN_PLOT_IDS);
    expect(g.plots.filter((p) => p.x < 0)).toHaveLength(6);
    expect(g.plots.filter((p) => p.x > 0)).toHaveLength(6);
    expect(new Set(g.plots.map((p) => Math.abs(p.x)))).toEqual(new Set([3.4, 6]));
    expect(new Set(g.plots.map((p) => p.z))).toEqual(new Set([2.6, 0, -2.6]));
    // 6 luống mở sẵn = hai cột sát lối trục; ô 7, 8 (mở sau) = hàng gần chỗ xuất hiện, tây rồi đông (R-VUON-8)
    expect(g.plots.slice(0, 6).every((p) => Math.abs(p.x) === 3.4)).toBe(true);
    expect([g.plots[6].x < 0, g.plots[6].z, g.plots[7].x > 0, g.plots[7].z]).toEqual([true, 2.6, true, 2.6]);
    // lối trục rộng 2,4 m (x ±1,2) không đè luống; lối giữa các luống ≥ 1 m
    for (const p of g.plots) expect(Math.abs(p.x) - g.size / 2).toBeGreaterThanOrEqual(1.2 + 1);
    expect(fenceSegments(g)).toEqual([]);
    expect(borderBoxes(g)).toHaveLength(2);
  });

  it('R-VUON-1: viền đá cuội + luống không chặn người; thùng thu mua (mép lối bên phải, giữa chỗ xuất hiện và luống) chặn', () => {
    const c = new Colliders();
    addGarden(new THREE.Scene(), c, g, NHA.spec.look);
    expect(c.boxes).toHaveLength(1); // chỉ thùng
    for (const [x, z] of [[2.2, 0], [-3.4, 2.6], [-7.3, 0], [6, -4], [-6, 4.1]]) {
      const q = { x, z };
      c.resolve(q, 0.4);
      expect(q).toEqual({ x, z });
    }
    expect(g.bin.x).toBeGreaterThan(1.2); // mép lối bên phải
    expect(g.bin.z).toBeLessThan(NHA.spec.player.start[1]);
    expect(g.bin.z).toBeGreaterThan(Math.max(...g.plots.map((p) => p.z)));
    const b = { x: g.bin.x, z: g.bin.z };
    c.resolve(b, 0.4);
    expect(b).not.toEqual({ x: g.bin.x, z: g.bin.z });
  });

  it('R-VUON-1: kiểm đặc tả — thiếu luống, luống ngoài viền, hai luống sát (< 1 m), thùng trong viền → báo lỗi', () => {
    const plots = g.plots.slice(2).concat({ id: 'o-1', x: 30, z: 0 }, { id: 'o-2', x: 3.4, z: 1.6 });
    const bad = { ...NHA.spec, garden: { ...g, plots: plots.slice(1), bin: { x: 3.4, z: -1.3, rotY: 0 } } };
    const out = checkGarden(bad);
    expect(out.some((m) => m.includes('cần đủ 12 luống'))).toBe(true);
    expect(out.some((m) => m.includes('khung viền'))).toBe(true);
    expect(out.some((m) => m.includes('lối giữa hai luống'))).toBe(true);
    expect(out.some((m) => m.includes('garden.bin'))).toBe(true);
    expect(checkGarden({ ...NHA.spec, garden: { ...g, border: [] } }).some((m) => m.includes('garden.border'))).toBe(true);
  });

  it('R-VUON-2: chạm luống — trong vườn (vùng luống nới 3 m) → mở ngay; xa hơn mà ≤ 25 m → tự đi tới rồi mở; > 25 m → không', () => {
    const z = gardenZone(g);
    expect([z.x0, z.x1, z.z0, z.z1]).toEqual([-9.8, 9.8, -6.4, 6.4]);
    const o11 = g.plots.find((p) => p.id === 'o-11')!;
    const o2 = g.plots.find((p) => p.id === 'o-2')!;
    expect([o11.x, o11.z]).toEqual([-6, -2.6]);
    expect(tapPlan(g, { x: 0, z: 2 }, o11)).toBe('mo-ngay');
    expect(tapPlan(g, { x: 0, z: 6.5 }, o11)).toBe('di-toi'); // chỗ xuất hiện (ngay ngoài vùng)
    expect(tapPlan(g, { x: 0, z: -7 }, o2)).toBe('di-toi'); // sân trước nhà
    expect(tapPlan(g, { x: 20, z: -20 }, o11)).toBe('khong'); // cách 31 m
    expect(inBox(z, 0, -7)).toBe(false); // đi lên sân trước nhà → ra khỏi vườn → vòng đóng
    // vườn có rào (cảnh cũ): chỉ trong rào mới mở
    const rao = { ...g, layout: 'rao' as const, fence: { from: [-8, -5] as [number, number], to: [8, 5] as [number, number], gate: 0, gateWidth: 1.6, height: 0.6 } };
    expect(tapPlan(rao, { x: 0, z: 6.5 }, o11)).toBe('khong');
    expect(tapPlan(rao, { x: 0, z: 2 }, o11)).toBe('mo-ngay');
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
