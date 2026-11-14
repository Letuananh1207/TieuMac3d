import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { aimCamera, blendCamera, BODY_HIDE_AT, eyeAt, eyeFov, eyeSettings, EyeLook, lookDir, stepBlend } from './eyeCamera';

// = `camera.firstPerson` mặc định (scene/spec.ts — lớp input không import scene)
const S = eyeSettings({ eyeY: 1.35, eyeFwd: 0.08, yawLimit: 60, pitchUp: 20, pitchDown: 70, minHFov: 40, blend: 0.4, returnDelay: 1, returnTime: 0.6 });
const DEG = Math.PI / 180;
const BASE = -35 * DEG;

describe('R-DIEU-7: nhìn quanh từ mắt có giới hạn', () => {
  it('R-DIEU-7: kéo sang phải 300 px → lệch tối đa 60°, không hơn', () => {
    const l = new EyeLook(S);
    l.look(300, 0, BASE);
    expect(l.yaw).toBeCloseTo(-60 * DEG, 5); // yaw giảm = quay sang phải (mặt nhìn +z, bên phải là −x)
    l.look(-2000, 0, BASE);
    expect(l.yaw).toBeCloseTo(60 * DEG, 5);
  });

  it('R-DIEU-7: ngẩng tối đa 20°, cúi tối đa 70° (tính cả góc cúi chuẩn)', () => {
    const l = new EyeLook(S);
    l.look(0, -5000, BASE); // kéo lên → ngẩng
    expect(BASE + l.pitch).toBeCloseTo(20 * DEG, 5);
    l.look(0, 5000, BASE);
    expect(BASE + l.pitch).toBeCloseTo(-70 * DEG, 5);
  });

  it('R-DIEU-7: thả tay 1 giây chưa về; sau đó ~0,6 giây về gần thẳng', () => {
    const l = new EyeLook(S);
    l.look(100, 0, BASE); // lệch 0,6 rad
    const at = l.yaw;
    for (let t = 0; t < 0.95; t += 1 / 60) l.update(1 / 60);
    expect(l.yaw).toBeCloseTo(at, 5);
    for (let t = 0; t < 0.7; t += 1 / 60) l.update(1 / 60);
    expect(Math.abs(l.yaw)).toBeLessThan(Math.abs(at) * 0.08);
  });

  it('R-DIEU-7: nhìn lại không nhanh hơn 90°/s', () => {
    const l = new EyeLook(S);
    l.look(-2000, 0, BASE);
    for (let t = 0; t < 1.1; t += 1 / 60) l.update(1 / 60);
    const before = l.yaw;
    l.update(0.1);
    expect(before - l.yaw).toBeLessThanOrEqual(9 * DEG + 1e-9);
  });
});

describe('R-DIEU-7: chuyển ngôi mượt', () => {
  it('R-DIEU-7: 0,4 giây từ ngôi 3 vào mắt, đứng dậy 0,4 giây ra lại', () => {
    let w = 0;
    for (let i = 0; i < 12; i++) w = stepBlend(w, true, 1 / 30, S.blend);
    expect(w).toBeCloseTo(1, 5);
    w = stepBlend(w, false, 0.2, S.blend);
    expect(w).toBeCloseTo(0.5, 5);
    expect(BODY_HIDE_AT).toBeGreaterThan(0.5);
  });

  it('R-DIEU-7: trộn đúng đầu-cuối, đứng dậy về đúng camera cũ', () => {
    const cam = new THREE.PerspectiveCamera(55, 0.5);
    const third = { position: new THREE.Vector3(0, 5, -9), quaternion: new THREE.Quaternion(), fov: 55 };
    const eye = new THREE.Object3D();
    aimCamera(eye, eyeAt(new THREE.Vector3(), 0, S), 0, BASE);
    const first = { position: eye.position, quaternion: eye.quaternion, fov: 70 };
    blendCamera(cam, third, first, 1);
    expect(cam.position.distanceTo(first.position)).toBeLessThan(1e-9);
    expect(cam.fov).toBeCloseTo(70);
    blendCamera(cam, third, first, 0);
    expect(cam.position.distanceTo(third.position)).toBeLessThan(1e-9);
    expect(cam.quaternion.angleTo(third.quaternion)).toBeLessThan(1e-6);
    expect(cam.fov).toBeCloseTo(55);
  });

  it('R-DIEU-7: camera ở mắt nhìn đúng hướng mặt, cúi theo góc chuẩn', () => {
    const eye = new THREE.Object3D();
    const p = eyeAt(new THREE.Vector3(2, 0, 3), Math.PI / 2, S);
    expect(p.y).toBeCloseTo(S.eyeY);
    expect(p.x).toBeCloseTo(2 + S.eyeFwd);
    aimCamera(eye, p, Math.PI / 2, BASE);
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(eye.quaternion);
    expect(fwd.distanceTo(lookDir(Math.PI / 2, BASE))).toBeLessThan(1e-6);
  });

  it('R-DIEU-7: màn dọc nới FOV cho đủ bề ngang, màn ngang giữ FOV cảnh', () => {
    const dọc = eyeFov(55, 390 / 844, S.minHFov);
    const hfov = 2 * Math.atan(Math.tan((dọc * DEG) / 2) * (390 / 844));
    expect(hfov).toBeCloseTo(S.minHFov, 5);
    expect(eyeFov(55, 844 / 390, S.minHFov)).toBe(55);
  });
});
