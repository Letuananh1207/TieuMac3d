import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { CharacterState } from './character';
import { RUN_SPEED, WALK_SPEED } from './controller';
import { DongTac, TINH, type Pose } from './dongTac';
import { mixamoCharacter, tinhFor, type MixamoOpts } from './mixamoCharacter';
import type { MixamoRig } from './mixamoRig';

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
    it(`R-DIEU-5 (L-18): nhân vật chính ${ten} — đùi, vung tay, nhún, đổ người, xoay hông bằng dáng đi cũ`, () => {
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
        expect(p.j.hips[1] - b.j.hips[1]).toBeCloseTo(o.hipsY, 9);
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
