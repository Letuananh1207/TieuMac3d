import { describe, expect, it } from 'vitest';
import { DongTac, NGOI, TINH, type Euler3 } from './dongTac';
import { CUOI, tronCuoi } from './cuoiDang';

type V = [number, number, number];

/** Xoay [v] theo góc Euler thứ tự XYZ (như three: R = Rx·Ry·Rz). */
function rot(e: Euler3, v: V): V {
  const [a, b, c] = e;
  // Rz
  let [x, y, z] = [v[0] * Math.cos(c) - v[1] * Math.sin(c), v[0] * Math.sin(c) + v[1] * Math.cos(c), v[2]];
  // Ry
  [x, z] = [x * Math.cos(b) + z * Math.sin(b), -x * Math.sin(b) + z * Math.cos(b)];
  // Rx
  [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
  return [x, y, z];
}

/** Hướng đùi + hướng cẳng chân (trong khung hông) của chân có góc đùi [up], gối [knee] — chân buông = (0, −1, 0). */
function leg(up: Euler3, knee: Euler3): { thigh: V; shin: V } {
  const down: V = [0, -1, 0];
  return { thigh: rot(up, down), shin: rot(up, rot(knee, down)) };
}

const sitPose = (pitch = 0) => {
  const t = TINH['hoat-bat'];
  const pose = new DongTac(t, 1).update(0.016, { mps: 0, sit: 1, sitDrop: 0.3 });
  const before = JSON.stringify(pose.j);
  tronCuoi(pose, t.haTay, 1, pitch);
  return { pose, before, t };
};

describe('Dáng ngồi cưỡi hạc (R-HANH-5)', () => {
  it('R-HANH-5: w 0 → giữ nguyên dáng ngồi nền', () => {
    const t = TINH['hoat-bat'];
    const pose = new DongTac(t, 1).update(0.016, { mps: 0, sit: 1, sitDrop: 0.3 });
    const before = JSON.stringify(pose);
    tronCuoi(pose, t.haTay, 0, -0.38);
    expect(JSON.stringify(pose)).toBe(before);
  });

  it('R-HANH-5: hai đùi dạng hai bên thân hạc (đối xứng, rộng hơn ngồi xếp bằng), không xếp bằng ra trước', () => {
    const { pose } = sitPose();
    const L = leg(pose.j.upLegL, pose.j.legL);
    const R = leg(pose.j.upLegR, pose.j.legR);
    // trái ra +x, phải ra −x, đối xứng
    expect(L.thigh[0]).toBeGreaterThan(0.85);
    expect(R.thigh[0]).toBeCloseTo(-L.thigh[0]);
    expect(pose.j.upLegL[2]).toBeGreaterThan(NGOI.dang);
    // đùi không chĩa thẳng ra trước như ngồi xếp bằng: phần ngang lớn hơn phần ra trước
    expect(Math.abs(L.thigh[0])).toBeGreaterThan(Math.abs(L.thigh[2]) * 2);
  });

  it('R-HANH-5: gối gập, cẳng chân thả xuống (bàn chân thấp hơn hông + gối) áp vào sườn', () => {
    const { pose } = sitPose();
    for (const [up, knee] of [[pose.j.upLegL, pose.j.legL], [pose.j.upLegR, pose.j.legR]] as const) {
      const { thigh, shin } = leg(up, knee);
      // đùi chếch xuống (không giơ lên), cẳng chân hướng xuống rõ (thả dọc sườn)
      expect(thigh[1]).toBeLessThan(0);
      expect(shin[1]).toBeLessThan(-0.6);
      // gối gập: cẳng chân lệch hướng đùi
      const cos = thigh[0] * shin[0] + thigh[1] * shin[1] + thigh[2] * shin[2];
      expect(cos).toBeLessThan(Math.cos(0.6));
      // cẳng chân khép vào sườn: dốc hơn đùi (ít ra ngoài hơn)
      expect(Math.abs(shin[0])).toBeLessThan(Math.abs(thigh[0]));
    }
    expect(CUOI.goi).toBeGreaterThan(0);
  });

  it('R-HANH-5: hai tay đưa ra trước (đặt trên cổ / lưng hạc)', () => {
    const { pose, t } = sitPose();
    expect(pose.j.armL[0]).toBeLessThan(-0.6);
    expect(pose.j.armR[0]).toBeLessThan(-0.6);
    // tay đưa ra trước rồi mới hạ: bàn tay ở phía trước thân (z > 0)
    const armL = rot(pose.j.armL, rot([0, 0, t.haTay], [0, -1, 0]));
    expect(armL[2]).toBeGreaterThan(0.5);
  });

  it('R-HANH-5: hông nghiêng theo lưng hạc, cột sống bù lại — thân trên gần thẳng đứng', () => {
    const flat = sitPose(0).pose;
    const up = sitPose(-0.38).pose;
    expect(up.j.hips[0]).toBeCloseTo(-0.38);
    // tổng nghiêng hông + cột sống như khi hạc nằm ngang
    expect(up.j.hips[0] + up.j.spine[0]).toBeCloseTo(flat.j.hips[0] + flat.j.spine[0]);
  });
});
