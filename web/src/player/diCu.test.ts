import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { CharacterState } from './character';
import { RUN_SPEED, WALK_SPEED } from './controller';
import { DongTac, TINH, type Pose } from './dongTac';
import { mixamoCharacter, tinhFor, type MixamoOpts } from './mixamoCharacter';
import { mixamoRig, type MixamoRig } from './mixamoRig';

/** Xương giả: ghi lại dáng mỗi khung (không cần model). */
function fakeRig(): MixamoRig & { last: Pose | null } {
  const r = {
    last: null as Pose | null,
    aPose: 0.7,
    hipY: 0.6,
    gripR: new THREE.Vector3(),
    bone: () => undefined,
    apply(p: Pose) {
      r.last = JSON.parse(JSON.stringify(p)) as Pose;
    },
  };
  return r;
}

function make(opts: MixamoOpts) {
  const parts = { root: new THREE.Group(), body: new THREE.Group(), bob: new THREE.Group(), model: new THREE.Object3D() };
  const rig = fakeRig();
  const ch = mixamoCharacter(parts, rig, opts);
  return { ch, rig, bob: parts.bob };
}

/** Dáng đi cũ chép nguyên văn nhánh `autoRig` của `glbCharacter.ts` (trước L-18) — độc lập với `dang7.ts`. */
function oldWalk() {
  let move = 0;
  let runB = 0;
  let airB = 0;
  let walkT = 0;
  return (dt: number, mps: number, air = false) => {
    const k = Math.min(1, mps / WALK_SPEED);
    const run = Math.min(1, Math.max(0, (mps - WALK_SPEED) / (RUN_SPEED - WALK_SPEED)));
    move += (k - move) * Math.min(1, dt * 8);
    runB += (run - runB) * Math.min(1, dt * 6);
    airB += ((air ? 1 : 0) - airB) * Math.min(1, dt * 14);
    if (mps > 0.05) walkT += dt * (2.4 * Math.max(mps, 2.2)) * (1 - airB);
    else walkT *= 0.85;
    const step = Math.sin(walkT);
    const amp = (0.55 + 0.35 * runB) * move;
    const swing = (0.34 + 0.45 * runB) * move;
    return {
      thighL: step * amp,
      armLx: -step * swing,
      armRx: step * swing,
      lift: Math.abs(step) * (0.05 + 0.06 * runB) * move * (1 - airB),
      lean: (0.05 + 0.2 * runB) * move,
      hipsY: step * (0.1 + 0.08 * runB) * move,
    };
  };
}

const st = (mps: number): CharacterState => ({ mps, air: false, vy: 0, sit: 0, bow: 0, idle: 0 });

describe('Dáng đi nhân vật chính (L-18, R-DIEU-5, R-NPC-10)', () => {
  for (const [ten, mps] of [['đi bộ', WALK_SPEED], ['chạy', RUN_SPEED]] as const) {
    it(`R-DIEU-5 (L-18): nhân vật chính ${ten} — đùi, vung tay, nhún, đổ người bằng dáng đi cũ`, () => {
      const { ch, rig, bob } = make({ player: true });
      // dáng nền: cùng bộ số người chơi, tắt phần bước
      const base = new DongTac(tinhFor({ player: true }, rig.aPose), 0);
      const ref = oldWalk();
      const dt = 1 / 60;
      let maxThigh = 0;
      for (let i = 0; i < 150; i++) {
        ch.animate(dt, mps / RUN_SPEED, st(mps));
        const b = base.update(dt, { mps, turn: 0, sit: 0, tuDi: true });
        const o = ref(dt, mps);
        const p = rig.last!;
        expect(p.j.upLegL[0] - b.j.upLegL[0]).toBeCloseTo(o.thighL, 9);
        expect(p.j.upLegR[0] - b.j.upLegR[0]).toBeCloseTo(-o.thighL, 9);
        expect(p.j.armL[0] - b.j.armL[0]).toBeCloseTo(o.armLx, 9);
        expect(p.j.armR[0] - b.j.armR[0]).toBeCloseTo(o.armRx, 9);
        // L-21: lưng thẳng — bỏ xoay hông theo bước của dáng cũ (`o.hipsY`), hông không vặn
        expect(p.j.hips[1]).toBeCloseTo(0, 9);
        expect(bob.position.y - b.lift).toBeCloseTo(o.lift, 9);
        expect(bob.rotation.x).toBeCloseTo(o.lean, 9);
        maxThigh = Math.max(maxThigh, Math.abs(o.thighL));
      }
      // biên độ đùi như bản cũ: 0,55 đi bộ, 0,55 + 0,35 chạy
      expect(maxThigh).toBeGreaterThan(mps === WALK_SPEED ? 0.5 : 0.85);
    });
  }

  it('R-DIEU-5 (L-18): nhịp bước như cũ — 2,4·max(tốc độ, 2,2) rad/s, không theo bảng hoạt bát', () => {
    const { ch, rig } = make({ player: true });
    const ref = oldWalk();
    // đếm số lần đùi trái đổi chiều trong 2 s đi bộ hết tốc
    let flips = 0;
    let prev = 0;
    for (let i = 0; i < 120; i++) {
      ch.animate(1 / 60, WALK_SPEED / RUN_SPEED, st(WALK_SPEED));
      ref(1 / 60, WALK_SPEED);
      const v = rig.last!.j.upLegL[0];
      if (i > 10 && Math.sign(v) !== Math.sign(prev)) flips++;
      prev = v;
    }
    // 2,4 · 3,2 = 7,68 rad/s → ~4,9 nửa chu kỳ trong 2 s (hoạt bát 3,1 · 3,2 = 9,9 rad/s → ~6,3)
    expect(flips).toBeGreaterThanOrEqual(4);
    expect(flips).toBeLessThanOrEqual(5);
  });

  it('R-NPC-10 (L-18): NPC giữ dáng đi theo tính cách — đúng `DongTac` không tắt bước, thân không đổ cả khối', () => {
    for (const tinh of ['diem-tinh', 'gia'] as const) {
      const { ch, rig, bob } = make({ tinh, seed: 3 });
      const ref = new DongTac(TINH[tinh], 3);
      for (let i = 0; i < 90; i++) {
        ch.animate(1 / 60, 1.1 / RUN_SPEED, st(1.1));
        const p = ref.update(1 / 60, { mps: 1.1, turn: 0, sit: 0 });
        expect(rig.last!.j).toEqual(JSON.parse(JSON.stringify(p.j)));
        expect(bob.position.y).toBeCloseTo(p.lift, 12);
        expect(bob.rotation.x).toBe(0);
      }
    }
  });

  it('R-DIEU-8 (L-18): đứng yên — nhân vật chính không đổ người, dáng đứng của `DongTac` giữ nguyên', () => {
    const { ch, rig, bob } = make({ player: true });
    const base = new DongTac(tinhFor({ player: true }, rig.aPose), 0);
    for (let i = 0; i < 60; i++) {
      ch.animate(1 / 60, 0, st(0));
      const b = base.update(1 / 60, { mps: 0, turn: 0, sit: 0 });
      expect(rig.last!.j).toEqual(JSON.parse(JSON.stringify(b.j)));
    }
    expect(bob.rotation.x).toBe(0);
  });
});

/** Xương giả kiểu Mixamo đứng chữ A (tay trái chéo ra +x, xuống), chân thẳng — để đo hướng xương thật sau `mixamoRig`. */
function aPoseSkeleton(a = 0.7): { root: THREE.Group; at: (n: string) => THREE.Vector3; rot: (n: string) => THREE.Quaternion } {
  const root = new THREE.Group();
  const bones = new Map<string, THREE.Bone>();
  const add = (name: string, parent: THREE.Object3D, pos: [number, number, number]): THREE.Bone => {
    const b = new THREE.Bone();
    b.name = `mixamorig${name}`;
    b.position.set(...pos);
    parent.add(b);
    bones.set(name, b);
    return b;
  };
  const hips = add('Hips', root, [0, 0.6, 0]);
  const spine = add('Spine', hips, [0, 0.1, 0]);
  const chest = add('Spine1', spine, [0, 0.1, 0]);
  const upper = add('Spine2', chest, [0, 0.1, 0]);
  const neck = add('Neck', upper, [0, 0.15, 0]);
  add('Head', neck, [0, 0.08, 0]);
  for (const [side, sx] of [['Left', 1], ['Right', -1]] as const) {
    const dir: [number, number, number] = [Math.sin(a) * sx * 0.2, -Math.cos(a) * 0.2, 0];
    const arm = add(`${side}Arm`, upper, [0.12 * sx, 0.1, 0]);
    const fore = add(`${side}ForeArm`, arm, dir);
    add(`${side}Hand`, fore, dir);
    const up = add(`${side}UpLeg`, hips, [0.08 * sx, -0.05, 0]);
    const leg = add(`${side}Leg`, up, [0, -0.25, 0]);
    add(`${side}Foot`, leg, [0, -0.25, 0]);
  }
  root.updateMatrixWorld(true);
  return {
    root,
    at: (n) => {
      root.updateMatrixWorld(true);
      return bones.get(n)!.getWorldPosition(new THREE.Vector3());
    },
    rot: (n) => bones.get(n)!.getWorldQuaternion(new THREE.Quaternion()),
  };
}

describe('Dáng đi / chạy nhân vật chính trên xương thật (L-20, R-DIEU-5)', () => {
  for (const [ten, mps] of [['đi bộ', WALK_SPEED], ['chạy', RUN_SPEED]] as const) {
    it(`R-DIEU-5 (L-20): nhân vật chính ${ten} — chân thẳng (gối 0), cả cánh tay vung từ vai, cẳng tay đi theo (khuỷu 0)`, () => {
      const { root, at, rot } = aPoseSkeleton();
      const rig = mixamoRig(root)!;
      const ch = mixamoCharacter(
        { root: new THREE.Group(), body: new THREE.Group(), bob: new THREE.Group(), model: root },
        rig,
        { player: true },
      );
      const ref = oldWalk();
      const fwd = (v: THREE.Vector3): number => Math.atan2(v.z, -v.y); // góc ra trước trên mặt phẳng dọc
      let lo = Infinity;
      let hi = -Infinity;
      let swingMax = 0;
      for (let i = 0; i < 120; i++) {
        ch.animate(1 / 60, mps / RUN_SPEED, st(mps));
        const o = ref(1 / 60, mps);
        if (i < 60) continue; // đã vào nhịp đều
        // (a) chân thẳng: đùi → gối → cổ chân thẳng hàng
        for (const s of ['Left', 'Right']) {
          const thigh = at(`${s}Leg`).sub(at(`${s}UpLeg`)).normalize();
          const shin = at(`${s}Foot`).sub(at(`${s}Leg`)).normalize();
          expect(thigh.angleTo(shin), `gối ${s}`).toBeLessThan(0.02);
        }
        // (b) đo trong khung ngực (`Spine2` — cha của vai; xương giả gốc không xoay): bỏ phần thân cúi / xoay hông
        const chest = rot('Spine2').invert();
        const up = at('LeftForeArm').sub(at('LeftArm')).applyQuaternion(chest).normalize();
        const fore = at('LeftHand').sub(at('LeftForeArm')).applyQuaternion(chest).normalize();
        // cẳng tay cùng hướng cánh tay trên (khuỷu thẳng như tư thế gốc) — không lắc riêng
        expect(up.angleTo(fore), 'khuỷu trái').toBeLessThan(0.02);
        // góc ra trước của cánh tay trên = tay đưa trước của dáng nền + vung tay dáng cũ, từng khung (x âm = ra trước)
        expect(fwd(up)).toBeCloseTo(TINH['hoat-bat'].tayTruoc - o.armLx, 2);
        lo = Math.min(lo, fwd(up));
        hi = Math.max(hi, fwd(up));
        swingMax = Math.max(swingMax, Math.abs(o.armLx));
      }
      // cánh tay trên dao động hai chiều quanh vai với biên độ vung tay dáng cũ (0,34 đi bộ, 0,79 chạy)
      expect(hi - lo).toBeGreaterThan(2 * swingMax * 0.95);
      expect(swingMax).toBeGreaterThan(mps === WALK_SPEED ? 0.3 : 0.7);
    });
  }
});

describe('Lưng thẳng khi đi / chạy (L-21, R-DIEU-5)', () => {
  const LUNG = ['hips', 'spine', 'chest', 'upperChest'] as const;
  for (const [ten, mps] of [['đi bộ', WALK_SPEED], ['chạy', RUN_SPEED]] as const) {
    it(`R-DIEU-5 (L-21): nhân vật chính ${ten} — hông, spine, chest, upperChest không vặn (y), không nghiêng ngang (z); đầu không quay ngược`, () => {
      const { ch, rig, bob } = make({ player: true });
      // đứng lâu trước (dồn trọng tâm sang một bên — R-DIEU-8), rồi đi
      for (let i = 0; i < 60 * 20; i++) ch.animate(1 / 60, 0, st(0));
      let lean = 0;
      for (let i = 0; i < 150; i++) {
        ch.animate(1 / 60, mps / RUN_SPEED, st(mps));
        if (i < 20) continue; // vừa bước (cường độ bước ≥ 0,5)
        const j = rig.last!.j;
        for (const k of LUNG) {
          expect(j[k][1], `${k} y (vặn)`).toBeCloseTo(0, 9);
          expect(j[k][2], `${k} z (nghiêng ngang)`).toBeCloseTo(0, 9);
        }
        expect(j.neck[1], 'cổ y').toBeCloseTo(0, 9);
        expect(j.head[1], 'đầu y').toBeCloseTo(0, 9);
        lean = Math.max(lean, bob.rotation.x);
      }
      // giữ: đổ người về trước bằng cả thân cứng (bob), nhún
      expect(lean).toBeGreaterThan(mps === WALK_SPEED ? 0.04 : 0.2);
    });
  }

  it('R-DIEU-5 (L-21): trên xương thật — ngực (`Spine2`) chỉ cúi / ngửa, trục ngang của ngực luôn nằm ngang khi đi / chạy', () => {
    const { root, rot } = aPoseSkeleton();
    const rig = mixamoRig(root)!;
    const ch = mixamoCharacter({ root: new THREE.Group(), body: new THREE.Group(), bob: new THREE.Group(), model: root }, rig, { player: true });
    for (const mps of [WALK_SPEED, RUN_SPEED]) {
      for (let i = 0; i < 120; i++) {
        ch.animate(1 / 60, mps / RUN_SPEED, st(mps));
        if (i < 20) continue;
        root.updateMatrixWorld(true);
        for (const b of ['Hips', 'Spine', 'Spine1', 'Spine2']) {
          const side = new THREE.Vector3(1, 0, 0).applyQuaternion(rot(b));
          expect(side.distanceTo(new THREE.Vector3(1, 0, 0)), `${b} vặn / nghiêng`).toBeLessThan(1e-6);
        }
      }
    }
  });
});
