import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { CharacterState } from './character';
import { RUN_SPEED, WALK_SPEED } from './controller';
import { CHAO, REST } from './dang7';
import { TINH, type Pose } from './dongTac';
import { mixamoCharacter, sitDropFor, tinhFor } from './mixamoCharacter';
import type { MixamoRig } from './mixamoRig';

describe('Nhân vật chính xương chuẩn (R-DIEU-7, R-DIEU-8)', () => {
  it('R-DIEU-8: người chơi dáng hoạt bát, không nhìn quanh liên tục, tay buông đo từ xương; bảng TINH không đổi', () => {
    const before = JSON.stringify(TINH);
    const t = tinhFor({ player: true }, 0.7);
    expect(t.nhip).toBe(TINH['hoat-bat'].nhip);
    expect(t.nhinQuanh).toBe(0);
    expect(t.haTay).toBeCloseTo(0.64, 9);
    expect(JSON.stringify(TINH)).toBe(before);
    expect(tinhFor({ tinh: 'gia' }, 0.7)).toBe(TINH.gia);
    expect(tinhFor({}, 0.7)).toBe(TINH['diem-tinh']);
  });
  it('R-DIEU-7: ngồi hạ thân theo độ cao háng của model — háng thấp hạ ít, không âm', () => {
    expect(sitDropFor(0.6)).toBeGreaterThan(sitDropFor(0.45));
    expect(sitDropFor(0.05)).toBe(0);
  });
});

/* ---------------- L-23: tay đứng dạng khỏi thân ---------------- */

const A_POSE = 0.7;
const DEG = Math.PI / 180;

function run(state: (i: number) => CharacterState, frames: number): Pose {
  const parts = { root: new THREE.Group(), body: new THREE.Group(), bob: new THREE.Group(), model: new THREE.Object3D() };
  let last: Pose | null = null;
  const rig: MixamoRig = {
    aPose: A_POSE,
    hipY: 0.6,
    gripR: new THREE.Vector3(),
    bone: () => undefined,
    apply(p) {
      last = JSON.parse(JSON.stringify(p)) as Pose;
    },
  };
  const ch = mixamoCharacter(parts, rig, { player: true });
  for (let i = 0; i < frames; i++) ch.animate(1 / 60, 0, state(i));
  return last!;
}
const st = (o: Partial<CharacterState> = {}): CharacterState => ({ mps: 0, air: false, vy: 0, sit: 0, bow: 0, idle: 0, ...o });
/** góc cánh tay so với phương thẳng đứng (rad, dương = dạng ra ngoài thân) */
const dang = (p: Pose): [number, number] => [A_POSE + p.j.armL[2], A_POSE - p.j.armR[2]];

describe('Tay nhân vật chính lúc đứng (L-23)', () => {
  it('R-DIEU-8 (L-23): đứng / thở — hai tay dạng khỏi thân ~15°, khuỷu hơi cong', () => {
    for (const frames of [120, 200, 290]) {
      const p = run(() => st(), frames); // các pha thở khác nhau
      for (const a of dang(p)) {
        expect(a).toBeGreaterThan(12 * DEG);
        expect(a).toBeLessThan(18 * DEG);
      }
      expect(p.j.foreL[0]).toBeLessThan(-0.15);
      expect(p.j.foreR[0]).toBeLessThan(-0.15);
    }
  });
  it('R-DIEU-5 (L-23): đi / chạy — tay vẫn dạng ít nhất như lúc đứng (không khép vào áo khi vung)', () => {
    for (const mps of [WALK_SPEED, RUN_SPEED]) {
      let min = Infinity;
      for (let n = 60; n < 160; n += 7) for (const a of dang(run(() => st({ mps }), n))) min = Math.min(min, a);
      expect(min).toBeGreaterThan(12 * DEG);
    }
  });
  it('R-BIEU-2 (L-23): dáng riêng (chắp tay) giữ đúng đích cũ — dạng tay chỉ là dáng đứng', () => {
    const p = run(() => st({ bow: 1 }), 30);
    const off = A_POSE - 0.06 - REST; // tay buông tham chiếu cũ (sát thân)
    expect(p.j.armL[2]).toBeCloseTo(CHAO.aLz - off, 6);
    expect(p.j.armR[2]).toBeCloseTo(CHAO.aRz + off, 6);
  });
});

describe('NPC phục vụ đứng ở quầy (tiểu nhị — R-TRA-1, R-NPC-10)', () => {
  function npcRun(state: (i: number) => CharacterState, frames: number): Pose {
    const parts = { root: new THREE.Group(), body: new THREE.Group(), bob: new THREE.Group(), model: new THREE.Object3D() };
    let last: Pose | null = null;
    const rig: MixamoRig = { aPose: A_POSE, hipY: 0.6, gripR: new THREE.Vector3(), bone: () => undefined, apply: (p) => void (last = JSON.parse(JSON.stringify(p)) as Pose) };
    const ch = mixamoCharacter(parts, rig, { tinh: 'hoat-bat', seed: 1 });
    for (let i = 0; i < frames; i++) ch.animate(1 / 60, 0, state(i));
    return last!;
  }
  const yawOf = (p: Pose): number => p.j.head[1] + p.j.neck[1];

  it('R-TRA-1: `look` quay đầu về phía người chơi; không có `look` thì nhìn thẳng như cũ', () => {
    const plain = yawOf(npcRun(() => st(), 120));
    const left = yawOf(npcRun(() => st({ look: 0.8 }), 120));
    const right = yawOf(npcRun(() => st({ look: -0.8 }), 120));
    expect(left - plain).toBeGreaterThan(0.3);
    expect(plain - right).toBeGreaterThan(0.3);
  });

  it('R-TRA-1: `nod` tăng → gật một cái (đầu cúi xuống rồi về)', () => {
    const pitch = (p: Pose): number => p.j.head[0] + p.j.neck[0];
    const base = pitch(npcRun(() => st({ nod: 0 }), 40));
    const nod = Math.max(...[10, 15, 20, 25, 30].map((f) => pitch(npcRun((i) => st({ nod: i >= 5 ? 1 : 0 }), f))));
    expect(nod - base).toBeGreaterThan(0.05);
  });
});
