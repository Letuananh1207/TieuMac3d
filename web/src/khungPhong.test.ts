import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { loadScene } from './scene/loadSpec';
import { clampFrameYaw, fitDistance, framePoints, placeFrame } from './input/khungPhong';
import { OrbitCamera } from './input/orbitCamera';

const spec = loadScene('nha-ta-trong').spec;
const f = spec.camera.frame;
const look: [number, number, number] = [f.center[0], f.lookY, f.center[1]];
const fit = (aspect: number): { w: number; h: number } => fitDistance(spec.camera.fov, aspect, 0, spec.camera.near.pitch, look, framePoints(f));

/** Camera thật đặt như khung: điểm (x, y, z) có lọt màn không (NDC trong ±1). */
function onScreen(cam: THREE.PerspectiveCamera, x: number, y: number, z: number): boolean {
  const v = new THREE.Vector3(x, y, z).project(cam);
  return Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && v.z < 1;
}

function framedCamera(aspect: number, player: THREE.Vector3): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(spec.camera.fov, aspect, 0.1, 200);
  const orbit = new OrbitCamera(spec.camera);
  orbit.viewAspect = aspect;
  orbit.update(cam, player, 0, true);
  cam.updateMatrixWorld();
  return cam;
}

describe('khung phòng — camera gian trong (V-71, R-NHA-1, R-DIEU-3, R-HUD-2)', () => {
  it('gian trong bật khung: nhìn chếch xuống ~53°, xoay ±35°, camera không tự về sau lưng', () => {
    expect(f.enabled).toBe(true);
    expect(spec.camera.near.pitch).toBeGreaterThan(0.8); // ≥ 46°
    expect(f.yawLimit).toBe(35);
  });

  it('màn ngang (844×390) và máy tính (16:9): thấy trọn sàn + đỉnh tường sau, dù nhân vật đứng góc phòng', () => {
    for (const aspect of [844 / 390, 16 / 9]) {
      for (const p of [new THREE.Vector3(-6.4, 0, 4.4), new THREE.Vector3(6.4, 0, -4.4), new THREE.Vector3(0, 0, 0)]) {
        const cam = framedCamera(aspect, p);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) expect(onScreen(cam, sx * 6.7, 0, sz * 4.7), `${aspect} ${p.x},${p.z}`).toBe(true);
        expect(onScreen(cam, -6.7, f.height, -4.7)).toBe(true);
      }
    }
  });

  it('điện thoại dọc (390×844): lọt bề sâu phòng, bề ngang theo nhân vật — nhân vật ở góc nào cũng trong màn', () => {
    const d = fit(390 / 844);
    expect(d.w).toBeGreaterThan(d.h); // không lọt bề ngang
    for (const [x, z] of [[-6.4, 4.4], [6.4, 4.4], [-6.4, -4.4], [6.4, -4.4]]) {
      const cam = framedCamera(390 / 844, new THREE.Vector3(x, 0, z));
      expect(onScreen(cam, x, 0, z), `${x},${z}`).toBe(true);
      expect(onScreen(cam, x, 1.6, z), `${x},${z} đầu`).toBe(true);
    }
  });

  it('khoảng cách không xa hơn mức vừa lọt phòng; zoom gần thì theo nhân vật nhiều hơn', () => {
    const d = fit(16 / 9);
    const far = placeFrame(f, 100, d, { x: 6, z: 4 });
    expect(far.dist).toBeCloseTo(Math.max(d.h, Math.min(d.w, 2 * d.h)));
    expect(far.x).toBeCloseTo(f.center[0] + 6 * f.follow);
    const near = placeFrame(f, d.h / 2, d, { x: 6, z: 4 });
    expect(near.x).toBeGreaterThan(far.x);
  });

  it('kéo xoay chỉ trong yaw ± yawLimit; góc ngẩng trong pitchMin … pitchMax; đi lại không tự xoay', () => {
    expect((clampFrameYaw(f, 2) * 180) / Math.PI).toBeCloseTo(35);
    expect((clampFrameYaw(f, -2) * 180) / Math.PI).toBeCloseTo(-35);
    const orbit = new OrbitCamera(spec.camera);
    for (let i = 0; i < 20; i++) orbit.rotate(-50, 50); // kéo dần sang trái, xuống
    expect((orbit.yaw * 180) / Math.PI).toBeCloseTo(35);
    expect(orbit.pitch).toBeCloseTo(f.pitchMax);
    for (let i = 0; i < 20; i++) orbit.rotate(25, -50);
    for (let i = 0; i < 300; i++) orbit.follow(1 / 60, 0.05, 0, Math.PI / 2, true);
    expect(orbit.pitch).toBeCloseTo(f.pitchMin); // không về góc chuẩn khi đi
    const yaw = orbit.yaw;
    for (let i = 0; i < 300; i++) orbit.follow(1 / 60, 0.05, 0, 0, true);
    expect(orbit.yaw).toBe(yaw);
  });

  it('ngồi (bồ đoàn / Ngồi ôn) thì dùng camera ngồi như cũ; đứng dậy trở lại khung', () => {
    const orbit = new OrbitCamera(spec.camera);
    orbit.sit(true, 0);
    expect(orbit.framed).toBe(false);
    orbit.sit(false);
    expect(orbit.framed).toBe(true);
  });

  it('cảnh khác: khung tắt — camera sau lưng như cũ', () => {
    expect(loadScene('nha-ta').spec.camera.frame.enabled).toBe(false);
    expect(new OrbitCamera(loadScene('nha-ta').spec.camera).framed).toBe(false);
  });
});
