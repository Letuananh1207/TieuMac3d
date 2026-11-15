import { describe, expect, it } from 'vitest';
import { arrivalFor, checkPortals } from './portals';
import { DEFAULT_SCENE, type PortalSpec } from './spec';
import { resolveSceneSpec } from './specCheck';

const TO_HOME: PortalSpec = { scene: 'nha-ta', area: { from: [-1.8, 43.2], to: [1.8, 47] }, arrive: { at: [0, 38.4], rotY: 180 } };
const base = { teleport: { enabled: false }, player: { start: [0, 6] } };
const portalProblems = (portals: unknown[], extra: object = {}): string[] =>
  resolveSceneSpec({ ...base, ...extra, portals }).problems.filter((p) => p.includes('portals'));

describe('cổng đi bộ trong đặc tả cảnh (R-HANH-4)', () => {
  it('R-HANH-4: cảnh mặc định không có cổng — cảnh cũ không đổi', () => {
    expect(DEFAULT_SCENE.portals).toEqual([]);
    expect(resolveSceneSpec({}).spec.portals).toEqual([]);
  });

  it('R-HANH-4: cổng đúng → nhận, không lỗi', () => {
    expect(portalProblems([TO_HOME])).toEqual([]);
    expect(resolveSceneSpec({ ...base, portals: [TO_HOME] }).spec.portals).toEqual([TO_HOME]);
  });

  it('R-HANH-4: thiếu trường / trường lạ → bỏ cổng', () => {
    expect(resolveSceneSpec({ ...base, portals: [{ scene: 'nha-ta', area: TO_HOME.area }] }).spec.portals).toEqual([]);
  });

  it('R-HANH-4: vùng rỗng, chỗ đứng trong vùng, hai cổng cùng cảnh đích → lỗi', () => {
    const flat = { ...TO_HOME, area: { from: [0, 44], to: [0, 48] } };
    expect(portalProblems([flat]).join()).toMatch(/vùng/);
    const inside = { ...TO_HOME, arrive: { at: [0, 45], rotY: 180 } };
    expect(portalProblems([inside]).join()).toMatch(/chỗ đứng/);
    const twin = { ...TO_HOME, area: { from: [10, 10], to: [12, 12] }, arrive: { at: [15, 11], rotY: 0 } };
    expect(portalProblems([TO_HOME, twin]).join()).toMatch(/trùng/);
  });

  it('R-HANH-4: vùng cổng chạm vòng trận → lỗi (hai lối đi chồng nhau)', () => {
    const tp = { enabled: true, center: [0, 45], radius: 0, ringRadius: 4 };
    expect(checkPortals({ portals: [TO_HOME], teleport: { ...DEFAULT_SCENE.teleport, enabled: true, center: [0, 45] } }).join()).toMatch(/vòng trận/);
    expect(portalProblems([TO_HOME], { teleport: tp, player: { start: [10, 38] } }).join()).toMatch(/vòng trận/);
  });

  it('R-HANH-4: chỗ đứng nhìn về phía vòng (không quay vào trong cảnh) → lỗi; nhìn ra xa vòng → không lỗi', () => {
    expect(portalProblems([{ ...TO_HOME, arrive: { at: [0, 38.4], rotY: 0 } }]).join()).toMatch(/quay vào trong cảnh/);
    expect(portalProblems([{ ...TO_HOME, arrive: { at: [0, 38.4], rotY: 150 } }])).toEqual([]);
  });

  it('R-HANH-4: hai cổng sát nhau (< 3 m) hoặc chỗ đứng của cổng này sát vùng cổng kia → lỗi', () => {
    const near: PortalSpec = { scene: 'rung-truc', area: { from: [3, 43.2], to: [5, 47] }, arrive: { at: [4, 38.4], rotY: 180 } };
    expect(portalProblems([TO_HOME, near]).join()).toMatch(/sát cổng/);
    const far: PortalSpec = { scene: 'rung-truc', area: { from: [10, 43.2], to: [12, 47] }, arrive: { at: [2.5, 46], rotY: 90 } };
    expect(portalProblems([TO_HOME, far]).join()).toMatch(/lỡ chân/);
    expect(portalProblems([TO_HOME, { ...far, arrive: { at: [11, 38.4], rotY: 180 } }])).toEqual([]);
  });

  it('R-HANH-4 R-VA-2: vùng chạm vắt sườn dốc → lỗi (vòng sáng nằm phẳng trên mặt đất)', () => {
    const terrain = { enabled: true, size: 120, plateaus: [{ from: [-20, 20], to: [20, 44], y: 0 }], peaks: [{ x: 0, z: 56, r: 10, h: 8 }] };
    const errs = resolveSceneSpec({ ...base, player: { start: [0, 30] }, terrain, portals: [{ ...TO_HOME, area: { from: [-1.2, 47], to: [1.2, 52] }, arrive: { at: [0, 42], rotY: 180 } }] }).problems;
    expect(errs.join()).toMatch(/vùng chạm \(area\)/);
  });

  it('R-HANH-4 R-NHA-1: tới qua cổng → đứng ở chỗ của cổng dẫn về nơi vừa rời, hướng độ → radian', () => {
    const back: PortalSpec = { scene: 'tong-mon', area: { from: [-4, 12.5], to: [4, 16] }, arrive: { at: [0, 10], rotY: 180 } };
    expect(arrivalFor([back], 'tong-mon')).toEqual({ at: [0, 10], rotY: Math.PI });
    expect(arrivalFor([TO_HOME], 'nha-ta')).toEqual({ at: [0, 38.4], rotY: Math.PI });
  });

  it('R-HANH-4: nơi đến không có cổng về / không có ?qua → không có chỗ đứng (dùng chỗ xuất phát)', () => {
    expect(arrivalFor([TO_HOME], 'rung-truc')).toBeUndefined();
    expect(arrivalFor([TO_HOME], null)).toBeUndefined();
    expect(arrivalFor([], 'nha-ta')).toBeUndefined();
  });
});
