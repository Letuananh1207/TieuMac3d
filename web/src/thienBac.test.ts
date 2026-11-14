import { describe, expect, it } from 'vitest';
import { canStep } from './player/controller';
import { HOME_SCENE, loadScene } from './scene/loadSpec';
import { buildHeightfield } from './scene/terrainHeight';

/**
 * Thiên Bậc ngắn (V-41, người dùng 2026-11-15 "bậc lên đài truyền tống đang quá dài"): bục Truyền Tống Đài hạ xuống 5,5 m,
 * dời lại gần Quảng Trường (bục z −53 … −35), bậc z −20 … −36 (~16 m). Đi trên địa hình theo R-VA-2 (dốc ≤ 35°).
 */
const spec = loadScene(HOME_SCENE).spec;
const hf = buildHeightfield(spec.terrain, spec.paths);

/** Đi thẳng từ (x, z) theo (dx, dz) tối đa `dist` m, bước 5 cm, dừng khi không bước được (R-VA-2). */
function walk(x: number, z: number, dx: number, dz: number, dist: number): { x: number; z: number; y: number; maxSlope: number } {
  const p = { x, z, y: hf.heightAt(x, z), maxSlope: 0 };
  for (let s = 0; s < dist / 0.05; s++) {
    const nx = p.x + dx * 0.05;
    const nz = p.z + dz * 0.05;
    if (!canStep(hf, p.x, p.z, nx, nz)) break;
    p.x = nx;
    p.z = nz;
    p.y = hf.heightAt(nx, nz);
    p.maxSlope = Math.max(p.maxSlope, hf.slopeAt(nx, nz));
  }
  return p;
}

describe('Thiên Bậc → Truyền Tống Đài (V-41)', () => {
  it('R-VA-2: từ cổng bắc Quảng Trường (0; −14) đi thẳng lên bắc → lên hết bậc tới bục đài cao 5,5 m, dốc ≤ 35°', () => {
    const p = walk(0, -14, 0, -1, 23);
    console.log(`lên tới (${p.x}; ${p.z.toFixed(2)}) cao ${p.y.toFixed(2)}, dốc lớn nhất ${p.maxSlope.toFixed(1)}°`);
    expect(p.z).toBeCloseTo(-37, 1);
    expect(p.y).toBeCloseTo(5.5, 1);
    expect(p.maxSlope).toBeLessThanOrEqual(35);
  });

  it('R-VA-2: bậc dài 15–18 m (trước V-41: 33 m), đỉnh bậc cao 5–6 m', () => {
    const bac = spec.terrain.stairs[0];
    expect(bac.from).toEqual([0, -20]);
    const len = Math.abs(bac.to[1] - bac.from[1]);
    expect(len).toBeGreaterThanOrEqual(15);
    expect(len).toBeLessThanOrEqual(18);
    expect(hf.heightAt(0, -36)).toBeGreaterThanOrEqual(5);
    expect(hf.heightAt(0, -36)).toBeLessThanOrEqual(6);
  });

  it('R-HANH-2: vòng trận (0; −44,5), Mặc Ông (6,5; −38,5), hai đèn đá (±4,6; −37,2) đứng phẳng trên bục 5,5 m', () => {
    expect(spec.teleport.center).toEqual([0, -44.5]);
    const pts: [number, number][] = [[0, -44.5], [-7.5, -44.5], [7.5, -44.5], [6.5, -38.5], [-4.6, -37.2], [4.6, -37.2]];
    for (const [x, z] of pts) {
      expect(hf.heightAt(x, z)).toBeCloseTo(5.5, 2);
      expect(hf.slopeAt(x, z)).toBeLessThan(1);
    }
    const npc = spec.npcs.find((n) => n.id === 'su-phu')!;
    expect([npc.x, npc.z]).toEqual([6.5, -38.5]);
  });

  it('R-VA-2: mép đông bục đài là vách xuống hai bậc chè dưới (cao 0,9 / 2,7) — đi về đông thì dừng ở mép; bậc chè trên cùng (4,5 m) liền bục → đi sang được', () => {
    for (const z of [-38, -43]) {
      const p = walk(6, z, 1, 0, 8);
      expect(p.x).toBeLessThan(10);
      expect(p.y).toBeGreaterThan(5);
    }
    const top = walk(6, -48, 1, 0, 8);
    expect(top.x).toBeCloseTo(14, 1);
    expect(top.y).toBeCloseTo(4.5, 1);
  });

  it('Đồi Chè và Vườn Bia giữ nguyên độ cao: ruộng chè 0,9 / 2,7 / 4,5 m, Vườn Bia 0 m', () => {
    expect(hf.heightAt(16, -38)).toBeCloseTo(0.9, 1);
    expect(hf.heightAt(16, -43)).toBeCloseTo(2.7, 1);
    expect(hf.heightAt(16, -47.7)).toBeCloseTo(4.5, 1);
    expect(hf.heightAt(-33, -43)).toBeCloseTo(0, 1);
  });
});
