import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { WALK_SPEED } from '../player/controller';
import { DEFAULT_ORBIT, OrbitCamera } from './orbitCamera';

const DT = 1 / 60;
const wrap = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));
const deg = (a: number): number => (Math.abs(wrap(a)) * 180) / Math.PI;

/** Hướng đi trên mặt đất từ joystick (ix, iy) theo `yaw` — đúng công thức của `PlayerController.update`. */
function moveDir(ix: number, iy: number, yaw: number): [number, number] {
  const mx = -Math.sin(yaw) * -iy + Math.cos(yaw) * ix;
  const mz = -Math.cos(yaw) * -iy - Math.sin(yaw) * ix;
  const m = Math.hypot(mx, mz);
  return [mx / m, mz / m];
}

/** Nhân vật giả: hướng quay mặt xoay về hướng đi như `PlayerController` (hệ số 12/s). */
const body = { facing: 0 };
/** tốc độ xoay camera lớn nhất đã thấy (°/s) — chống chóng mặt */
let peak = 0;

/** Giữ joystick (ix, iy) trong `secs` giây, đi bộ; trả về các hướng đi từng khung hình. (0, 0) = đứng yên. */
function hold(orbit: OrbitCamera, ix: number, iy: number, secs: number): [number, number][] {
  const dirs: [number, number][] = [];
  for (let t = 0; t < secs - 1e-9; t += DT) {
    const steer = orbit.steerYaw(ix, iy);
    const moving = !!(ix || iy);
    let dx = 0;
    let dz = 0;
    if (moving) {
      [dx, dz] = moveDir(ix, iy, steer);
      dirs.push([dx, dz]);
      body.facing += wrap(Math.atan2(dx, dz) - body.facing) * Math.min(1, DT * 12);
    }
    const before = orbit.yaw;
    orbit.follow(DT, dx * WALK_SPEED * DT, dz * WALK_SPEED * DT, body.facing, moving);
    peak = Math.max(peak, deg(orbit.yaw - before) / DT);
  }
  return dirs;
}

/** Camera mới, nhìn về −z ("bắc"); nhân vật quay lưng về camera. */
function start(): OrbitCamera {
  const orbit = new OrbitCamera();
  orbit.yaw = 0;
  body.facing = Math.PI;
  peak = 0;
  return orbit;
}

/** Camera lệch bao nhiêu độ so với thẳng sau lưng nhân vật. */
const offBehind = (orbit: OrbitCamera): number => deg(orbit.yaw - (body.facing + Math.PI));

describe('OrbitCamera — bám êm + khoá hướng đi', () => {
  it('R-DIEU-3 (L-7): giữ joystick xuống (đi về phía camera) → đi thẳng, camera vòng êm ra sau lưng trong ~3 s', () => {
    const orbit = start(); // camera ở phía +z, nhìn về −z ("bắc")
    const dirs = hold(orbit, 0, 1, 1);
    expect(deg(orbit.yaw)).toBeGreaterThan(20); // đã bắt đầu vòng ra
    dirs.push(...hold(orbit, 0, 1, 2.2));
    // nhân vật đi thẳng về +z (về phía camera lúc đầu), không đi vòng
    for (const [dx, dz] of dirs) {
      expect(dx).toBeCloseTo(0, 6);
      expect(dz).toBeCloseTo(1, 6);
    }
    // camera đã ra sau lưng: đứng ở phía −z của nhân vật (yaw ≈ π)
    expect(deg(orbit.yaw - Math.PI)).toBeLessThan(5);
    expect(peak).toBeLessThanOrEqual(90.01);
  });

  it('R-DIEU-3: rẽ 90° → ~2 s sau camera thẳng sau lưng, không xoay quá 90°/s', () => {
    const orbit = start();
    hold(orbit, 1, 0, 2.2); // rẽ sang +x
    // sau lưng hướng +x là phía −x: yaw = atan2(−1, 0) = −π/2
    expect(deg(orbit.yaw + Math.PI / 2)).toBeLessThan(5);
    expect(peak).toBeLessThanOrEqual(90.01);
  });

  it('R-DIEU-3: rẽ 90° → camera không giật ra sau lưng ngay (0,3 s đầu xoay chưa tới 20°)', () => {
    const orbit = start();
    hold(orbit, 1, 0, 0.3);
    expect(deg(orbit.yaw)).toBeLessThan(20);
  });

  it('R-DIEU-3: thả tay rồi bấm lại → hướng đi tính theo camera lúc đó', () => {
    const orbit = start();
    hold(orbit, 0, 1, 3.5); // quay đầu, camera ra sau lưng
    orbit.steerYaw(0, 0); // thả tay
    const [dx, dz] = moveDir(0, -1, orbit.steerYaw(0, -1)); // đẩy lên = đi tới, theo camera mới
    expect(dx).toBeCloseTo(-Math.sin(orbit.yaw), 6);
    expect(dz).toBeCloseTo(-Math.cos(orbit.yaw), 6);
  });

  it('R-DIEU-3: đổi hướng joystick từ 45° trở lên → mở khoá; dưới 45° → giữ khoá', () => {
    const orbit = start();
    hold(orbit, 0, 1, 1);
    const locked = orbit.steerYaw(0, 1);
    expect(deg(locked)).toBeLessThan(1e-9); // vẫn khoá theo yaw lúc bắt đầu
    const small = Math.sin((30 * Math.PI) / 180);
    expect(orbit.steerYaw(small, Math.cos((30 * Math.PI) / 180))).toBe(locked);
    expect(orbit.steerYaw(-1, 0)).toBe(orbit.yaw); // đổi hẳn sang trái → theo camera
  });

  it('R-DIEU-3: kéo xoay camera bằng tay khi đang đi → hướng đi xoay theo', () => {
    const orbit = start();
    hold(orbit, 0, -1, 0.5); // đi tới
    const before = orbit.steerYaw(0, -1);
    orbit.rotate(100, 0); // kéo ngang 100 px
    expect(orbit.steerYaw(0, -1)).toBeCloseTo(before - 100 * 0.006, 9);
  });

  it('R-DIEU-3: vừa kéo camera chưa tới 1,5 s → chỉ dây kéo, chưa tự về sau lưng', () => {
    const dragged = start();
    dragged.rotate(0, 0);
    hold(dragged, 1, 0, 1.4);
    const free = start();
    hold(free, 1, 0, 1.4);
    expect(deg(dragged.yaw)).toBeGreaterThan(3); // dây kéo vẫn có
    expect(deg(dragged.yaw)).toBeLessThan(deg(free.yaw) - 20); // nhưng kém xa khi được tự về sau lưng
  });

  it('R-DIEU-3 (L-7): đổi trái / phải liên tục rồi đi thẳng → ~3 s sau camera thẳng sau lưng, không chéo', () => {
    const orbit = start();
    for (let i = 0; i < 3; i++) {
      hold(orbit, -1, 0, 1);
      hold(orbit, 1, 0, 1);
    }
    hold(orbit, 0, -1, 3);
    expect(offBehind(orbit)).toBeLessThan(5);
    expect(peak).toBeLessThanOrEqual(90.01);
  });

  it('R-DIEU-3 (L-7): đang xoay mà dừng → hãm lại trong ~0,2 s, đứng yên thì không xoay về chính diện', () => {
    const orbit = start();
    hold(orbit, -1, 0, 1); // rẽ trái, camera đang xoay theo
    const stopAt = orbit.yaw;
    hold(orbit, 0, 0, 0.25); // dừng: trượt nốt một chút
    expect(deg(orbit.yaw - stopAt)).toBeLessThan(10);
    const yaw = orbit.yaw;
    hold(orbit, 0, 0, 2); // đứng yên → camera đứng yên dù chưa thẳng sau lưng
    expect(orbit.yaw).toBe(yaw);
    expect(offBehind(orbit)).toBeGreaterThan(5);
  });

  it('R-DIEU-3: kéo camera rồi đứng yên → không xoay nốt', () => {
    const orbit = start();
    orbit.rotate(200, 0);
    const yaw = orbit.yaw;
    hold(orbit, 0, 0, 2);
    expect(orbit.yaw).toBe(yaw);
  });
});

describe('OrbitCamera — camera khi ngồi (L-8)', () => {
  const look = (orbit: OrbitCamera): number => {
    orbit.update(new THREE.PerspectiveCamera(), new THREE.Vector3(), 0, true);
    return orbit.lookTarget.y;
  };

  it('R-NGOI-1 (L-8): ngồi → camera lùi 5,5 m, chúc ~25°, ngắm thấp hơn 0,3 m; đứng dậy → về khoảng cách + góc cũ', () => {
    const orbit = new OrbitCamera({ ...DEFAULT_ORBIT, near: { dist: 4.2, pitch: 0.32 } });
    orbit.dist = 4.6; // người chơi đã zoom
    orbit.pitch = 0.3;
    const standAt55 = new OrbitCamera({ ...DEFAULT_ORBIT });
    standAt55.dist = 5.5;
    standAt55.pitch = 0.44;
    orbit.sit(true);
    expect(orbit.dist).toBeCloseTo(5.5, 9);
    expect((orbit.pitch * 180) / Math.PI).toBeCloseTo(25, 0);
    expect(look(orbit)).toBeCloseTo(look(standAt55) - 0.3, 9);
    orbit.sit(false);
    expect(orbit.dist).toBe(4.6);
    expect(orbit.pitch).toBe(0.3);
  });

  it('R-NGOI-1: đang ngồi vẫn zoom / xoay được; ngồi hai lần không mất góc cũ', () => {
    const orbit = new OrbitCamera();
    const d0 = orbit.dist;
    orbit.sit(true);
    orbit.sit(true);
    orbit.wheel(100);
    expect(orbit.dist).toBeGreaterThan(5.5);
    orbit.sit(false);
    expect(orbit.dist).toBe(d0);
  });
});
