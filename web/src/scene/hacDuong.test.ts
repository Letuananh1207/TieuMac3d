import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { buildFlight } from './bayMay';
import { Crane } from './hac';
import { arriveCurve, bezier, jumpArc, landCurve, landingPad, mountPad, START_HEADING, takeoffCurve } from './hacDuong';
import { HOME_SCENE, loadScene, REGION_SCENES } from './loadSpec';
import { craneProblems } from './specCheck';
import { DEFAULT_SCENE } from './spec';

const near = (a: number[], b: number[]): void => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 5));

describe('hạc truyền tống — bãi đáp, đường bay (R-HANH-5)', () => {
  it('R-HANH-5: bãi đáp mặc định lệch 2,5 m sang phải hướng nhìn (nhìn bắc → +x); đón người: trước mặt', () => {
    near(landingPad([0, 34.5], START_HEADING), [2.5, 34.5]);
    near(landingPad([0, 0], 0), [-2.5, 0]); // nhìn +z → phải là −x
    near(mountPad([0, 0], START_HEADING, 2), [0, -2]);
  });

  it('R-HANH-5: đường hạ kết thúc đúng bãi đáp, bắt đầu cao phía trước; cất cánh bắt đầu ở bãi, vút lên', () => {
    const pad: [number, number] = [2.5, 48];
    const land = landCurve(pad, 3, START_HEADING);
    near(bezier(land, 1), [2.5, 3, 48]);
    const s = bezier(land, 0);
    expect(s[1]).toBeGreaterThan(20);
    expect(s[2]).toBeLessThan(48 - 20); // nhìn bắc (−z) → tới từ phía trước
    near(bezier(arriveCurve(pad, 3, START_HEADING), 1), [2.5, 3, 48]);
    const up = takeoffCurve(pad, 3, START_HEADING);
    near(bezier(up, 0), [2.5, 3, 48]);
    expect(bezier(up, 1)[1]).toBeGreaterThan(20);
  });

  it('R-HANH-5: cung nhảy qua hai đầu, đỉnh cao hơn điểm cao', () => {
    near(jumpArc([0, 0, 0], [2, 1.8, 0], 0), [0, 0, 0]);
    near(jumpArc([0, 0, 0], [2, 1.8, 0], 1), [2, 1.8, 0]);
    expect(jumpArc([0, 0, 0], [2, 1.8, 0], 0.5)[1]).toBeCloseTo(1.8 + 0.9, 5);
  });

  it('R-HANH-5: bãi đáp ở mọi cảnh có vòng trận không nằm trong nhà / ao (về trấn: cạnh cổng trấn (0; 48))', () => {
    const ids = [HOME_SCENE, ...REGION_SCENES];
    for (const id of ids) {
      const s = loadScene(id).spec;
      expect(craneProblems(s), id).toEqual([]);
    }
    const town = loadScene(HOME_SCENE).spec;
    expect(town.player.start).toEqual([0, 48]);
    near(landingPad(town.player.start, START_HEADING, town.crane.padOffset), [2.5, 48]);
  });

  it('R-HANH-5: hạc 3 draw call, ≤ 800 tam giác; cảnh bay ≤ 12 draw call (Thấp: không mây phồng)', () => {
    const crane = new Crane(DEFAULT_SCENE.crane);
    const meshes: THREE.Mesh[] = [];
    crane.root.traverse((o) => o instanceof THREE.Mesh && meshes.push(o));
    expect(meshes.length).toBe(3);
    const tris = meshes.reduce((a, m) => a + m.geometry.getAttribute('position').count / 3, 0);
    expect(tris).toBeLessThanOrEqual(800);
    const town = loadScene(HOME_SCENE).spec;
    const count = (detail: number): number => {
      const f = buildFlight({ ...town, dayNight: { ...town.dayNight, enabled: false } }, detail, 12, true);
      let n = 0;
      f.scene.traverse((o) => (o instanceof THREE.Mesh || o instanceof THREE.Points) && n++);
      f.dispose();
      return n;
    };
    // + nhân vật (glb ~3) lúc vẽ
    expect(count(1) + 3).toBeLessThanOrEqual(12);
    expect(count(0.5)).toBe(count(1) - 2); // Thấp: bỏ mây phồng + dải sương núi
  });
});
