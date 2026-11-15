import { describe, expect, it } from 'vitest';
import { HOME_SCENE, loadScene, REGION_SCENES } from './loadSpec';
import { landingPad, START_HEADING } from './hacDuong';
import { DEFAULT_SCENE } from './spec';
import { checkStoneYardEmpty, resolveSceneSpec } from './specCheck';

// V-65: các vùng bỏ vòng trận — chỗ vòng cũ thành sân đá trống (bãi hạc đáp); chỉ Truyền Tống Đài còn vòng (R-HANH-2)
const YARDS: Record<string, [number, number]> = {
  'rung-truc': [0, 39],
  'giang-nam': [0, 39],
  'bong-lai': [0, 39],
  'truong-thanh': [0, 39],
  'tu-cam-thanh': [0, 70],
  'to-lua': [0, 56],
};

describe('vòng trận chỉ ở Truyền Tống Đài, vùng có sân đá trống (V-65)', () => {
  it('R-HANH-2: Khởi Nguyên Trấn còn vòng trận (0; −44,5), không có sân đá trống; Nhà của ta không có cả hai', () => {
    const town = loadScene(HOME_SCENE).spec;
    expect(town.teleport.enabled).toBe(true);
    expect(town.teleport.center).toEqual([0, -44.5]);
    expect(town.stoneYard.enabled).toBe(false);
    const home = loadScene('nha-ta').spec;
    expect([home.teleport.enabled, home.stoneYard.enabled]).toEqual([false, false]);
  });

  it('R-HANH-2: mặc định tắt — cảnh cũ không đổi', () => {
    expect(DEFAULT_SCENE.stoneYard.enabled).toBe(false);
  });

  it('R-HANH-2: đủ 6 vùng', () => {
    expect([...REGION_SCENES].filter((id) => id !== 'nha-ta' && id !== 'nha-ta-trong').sort()).toEqual(Object.keys(YARDS).sort());
  });

  for (const [id, center] of Object.entries(YARDS)) {
    it(`R-HANH-2, R-HANH-5: ${id} — không vòng trận; sân đá trống tâm (${center.join('; ')}) bán kính 4,7 m, trống; hạc hạ ở chỗ xuất phát cạnh sân`, () => {
      const { spec, problems } = loadScene(id);
      expect(spec.teleport.enabled).toBe(false);
      expect(spec.stoneYard).toMatchObject({ enabled: true, center, radius: 4.7 });
      expect(checkStoneYardEmpty(spec)).toEqual([]);
      expect(problems.filter((p) => p.includes('stoneYard') || p.includes('sân đá'))).toEqual([]);
      // hạc đáp giữa sân: chỗ xuất phát (1,25 m trái tâm) + chỗ hạc đáp (2,5 m bên phải) đều trong sân, cách mép ≥ 0,8 m
      expect(spec.player.start).toEqual([center[0] - 1.25, center[1]]);
      const pad = landingPad(spec.player.start, START_HEADING, spec.crane.padOffset);
      for (const [x, z] of [spec.player.start, pad]) expect(Math.hypot(x - center[0], z - center[1])).toBeLessThanOrEqual(spec.stoneYard.radius - 0.8);
      // chỗ xuất phát không nằm trong vùng chạm cổng đi bộ nào (R-HANH-4)
      const [sx, sz] = spec.player.start;
      for (const p of spec.portals) expect(sx >= p.area.from[0] && sx <= p.area.to[0] && sz >= p.area.from[1] && sz <= p.area.to[1]).toBe(false);
    });
  }
});

describe('kiểm sân đá trống (specCheck)', () => {
  const yard = { enabled: true, center: [10, 10], radius: 4.7 };
  it('R-HANH-2: vật / cây / ô trang trí đè sân → báo; cỡ ngoài 2 … 8 m → báo; vừa có vòng trận vừa có sân → báo', () => {
    const s = resolveSceneSpec({ stoneYard: yard, props: [{ kind: 'lo-dan', x: 11, z: 10 }], trees: { yard: [{ x: 9, z: 12, scale: 1 }] } }).spec;
    const out = checkStoneYardEmpty(s).join('\n');
    expect(out).toContain('lo-dan');
    expect(out).toContain('cây (9; 12)');
    expect(resolveSceneSpec({ stoneYard: { ...yard, radius: 12 } }).problems.join()).toContain('stoneYard.radius');
    const both = resolveSceneSpec({ stoneYard: yard, teleport: { enabled: true, center: [-20, -20] }, player: { start: [0, 0] } });
    expect(both.problems.join()).toContain('stoneYard: cảnh có vòng trận');
  });

  it('R-HANH-2: sân trống, đủ cỡ → không báo', () => {
    const s = resolveSceneSpec({ buildings: [], trees: { yard: [], groves: [] }, stoneYard: yard, props: [{ kind: 'lo-dan', x: 20, z: 10 }] });
    expect(checkStoneYardEmpty(s.spec)).toEqual([]);
    expect(s.problems.filter((p) => p.includes('stoneYard'))).toEqual([]);
  });
});
