import { describe, expect, it } from 'vitest';
import { arrivalFor, buttonPortalAt, checkPortals, portalButtonText, portalVia } from './portals';
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

describe('cổng bấm nút (V-71 cửa gian trong "Ra sân", V-81 mọi cổng có nhãn)', () => {
  const OUT: PortalSpec = { scene: 'nha-ta', area: { from: [-6.8, 1.4], to: [-5.2, 3.8] }, arrive: { at: [-3.8, 2.6], rotY: 90 }, label: 'Ra sân', via: 'nut' };
  const HOME_GATE: PortalSpec = { ...TO_HOME, label: 'Về nhà' };

  it('R-HANH-4: `via` chỉ "di" | "nut"; cổng nút thiếu nhãn → lỗi; đặc tả giữ nguyên `via` (thiếu vẫn thiếu)', () => {
    expect(portalProblems([{ ...OUT, via: 'bay' }]).join()).toContain('via');
    expect(portalProblems([OUT])).toEqual([]);
    expect(checkPortals({ portals: [{ ...OUT, label: '' }], teleport: DEFAULT_SCENE.teleport }).join()).toContain('cần label');
    expect(resolveSceneSpec({ ...base, portals: [TO_HOME] }).spec.portals[0].via).toBeUndefined();
  });

  it('R-HANH-4 (V-81): thiếu `via` → cổng có nhãn là bấm nút, cổng không nhãn (cảnh cũ) đi bộ; ghi rõ thì theo', () => {
    expect(portalVia(HOME_GATE)).toBe('nut');
    expect(portalVia(TO_HOME)).toBe('di');
    expect(portalVia({ ...HOME_GATE, via: 'di' })).toBe('di');
    expect(portalVia(OUT)).toBe('nut');
  });

  it('R-HANH-4 (V-81): chữ trên nút — "Đi <nơi đến>", về trấn "Về Khởi Nguyên Trấn", nhãn đã là lời mời giữ nguyên', () => {
    expect(portalButtonText({ scene: 'rung-truc', label: 'Trúc Lâm' })).toBe('Đi Trúc Lâm');
    expect(portalButtonText({ scene: 'tong-mon', label: 'Khởi Nguyên Trấn' })).toBe('Về Khởi Nguyên Trấn');
    expect(portalButtonText({ scene: 'nha-ta', label: 'Về nhà' })).toBe('Về nhà');
    expect(portalButtonText({ scene: 'nha-ta-trong', label: 'Vào nhà' })).toBe('Vào nhà');
    expect(portalButtonText(OUT)).toBe('Ra sân');
  });

  it('R-HANH-4 R-NHA-1: đứng trong vùng cổng có nhãn → có nút (không tự sang); ngoài vùng hoặc cổng không nhãn → không', () => {
    expect(buttonPortalAt([HOME_GATE, OUT], -6, 2.6)).toBe(OUT);
    expect(buttonPortalAt([HOME_GATE, OUT], -3.8, 2.6)).toBeUndefined(); // vừa vào, đứng chỗ tới
    expect(buttonPortalAt([HOME_GATE, OUT], 0, 45)).toBe(HOME_GATE); // vòng "Về nhà": đứng trong → nút
    expect(buttonPortalAt([HOME_GATE, OUT], 0, 38.4)).toBeUndefined(); // vừa tới, đứng chỗ tới ngoài vòng
    expect(buttonPortalAt([TO_HOME], 0, 45)).toBeUndefined(); // cổng không nhãn: bước vào là sang (PortalTrigger)
  });

  it('R-HANH-4: cổng bấm nút chỉ cần chỗ đứng ngoài vùng (không bắt cách ≥ 1 m như cổng đi bộ)', () => {
    const close = { ...HOME_GATE, arrive: { at: [0, 42.7], rotY: 180 } };
    expect(portalProblems([close])).toEqual([]);
    expect(portalProblems([{ ...close, via: 'di' }]).join()).toMatch(/chỗ đứng/);
  });
});
