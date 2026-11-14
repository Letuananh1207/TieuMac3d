import { describe, expect, it } from 'vitest';
import { arrivalFor, checkPortals } from './portals';
import { DEFAULT_SCENE, type PortalSpec } from './spec';
import { resolveSceneSpec } from './specCheck';

const TO_HOME: PortalSpec = { scene: 'nha-ta', area: { from: [-24.6, 32.9], to: [-19.5, 39.1] }, arrive: { at: [-16.5, 36], rotY: 90 } };
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
    const flat = { ...TO_HOME, area: { from: [-20, 33], to: [-20, 39] } };
    expect(portalProblems([flat]).join()).toMatch(/vùng/);
    const inside = { ...TO_HOME, arrive: { at: [-22, 36], rotY: 90 } };
    expect(portalProblems([inside]).join()).toMatch(/chỗ đứng/);
    const twin = { ...TO_HOME, area: { from: [10, 10], to: [12, 12] }, arrive: { at: [15, 11], rotY: 0 } };
    expect(portalProblems([TO_HOME, twin]).join()).toMatch(/trùng/);
  });

  it('R-HANH-4: vùng cổng chạm vòng trận → lỗi (hai lối đi chồng nhau)', () => {
    const tp = { enabled: true, center: [-22, 36], radius: 0, ringRadius: 4 };
    expect(checkPortals({ portals: [TO_HOME], teleport: { ...DEFAULT_SCENE.teleport, enabled: true, center: [-22, 36] } }).join()).toMatch(/vòng trận/);
    expect(portalProblems([TO_HOME], { teleport: tp, player: { start: [10, 36] } }).join()).toMatch(/vòng trận/);
  });

  it('R-HANH-4 R-NHA-1: tới qua cổng → đứng ở chỗ của cổng dẫn về nơi vừa rời, hướng độ → radian', () => {
    const back: PortalSpec = { scene: 'tong-mon', area: { from: [-4, 12.5], to: [4, 16] }, arrive: { at: [0, 10], rotY: 180 } };
    expect(arrivalFor([back], 'tong-mon')).toEqual({ at: [0, 10], rotY: Math.PI });
    expect(arrivalFor([TO_HOME], 'nha-ta')).toEqual({ at: [-16.5, 36], rotY: Math.PI / 2 });
  });

  it('R-HANH-4: nơi đến không có cổng về / không có ?qua → không có chỗ đứng (dùng chỗ xuất phát)', () => {
    expect(arrivalFor([TO_HOME], 'rung-truc')).toBeUndefined();
    expect(arrivalFor([TO_HOME], null)).toBeUndefined();
    expect(arrivalFor([], 'nha-ta')).toBeUndefined();
  });
});
