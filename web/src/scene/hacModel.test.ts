import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { blockCraneGeometry, Crane, SEAT_AT } from './hac';
import { craneMesh, craneModelFrom, CRANE_SPAN, loadCraneModel, type CraneModel } from './hacModel';
import { fakeFlyingCrane } from './hacGia';
import { DEFAULT_SCENE } from './spec';

const spec = DEFAULT_SCENE.crane;
const mat = (): THREE.Material => new THREE.MeshBasicMaterial({ vertexColors: true });
/** "khối gộp" (thân + 2 cánh dang một lưới) đứng thay model Tripo */
const model: CraneModel = craneModelFrom(blockCraneGeometry(spec), mat());
const pos = model.geometry.getAttribute('position');
const n = pos.count;
const P = (i: number): THREE.Vector3 => new THREE.Vector3().fromBufferAttribute(pos, i);

/** chỉ số đỉnh đạt cực theo hàm điểm */
const best = (score: (p: THREE.Vector3) => number): number => {
  let k = 0;
  let s = -Infinity;
  for (let i = 0; i < n; i++) {
    const v = score(P(i));
    if (v > s) [k, s] = [i, v];
  }
  return k;
};
const tipR = best((p) => p.x);
const tipL = best((p) => -p.x);
const back = best((p) => (Math.abs(p.x) < 0.1 && Math.abs(p.z - model.shape.seat[2]) < 0.3 ? p.y : -Infinity));

/** vị trí đỉnh i sau khi da đi theo xương (toạ độ của `root`) */
function skinned(crane: Crane, i: number): THREE.Vector3 {
  crane.root.updateMatrixWorld(true);
  const mesh = crane.root.children.find((o): o is THREE.SkinnedMesh => o instanceof THREE.SkinnedMesh);
  if (!mesh) throw new Error('không có SkinnedMesh');
  return mesh.applyBoneTransform(i, P(i));
}

function modelCrane(): Crane {
  const c = new Crane(spec);
  c.useModel(model);
  return c;
}

describe('hạc model — tự gắn xương từ "khối gộp" (NV2)', () => {
  it('chuẩn hoá: sải 5,6 m dọc x, đáy y = 0, tâm ngang x = 0; lưới gốc không đổi', () => {
    const src = blockCraneGeometry(spec);
    const before = Float32Array.from(src.getAttribute('position').array);
    craneModelFrom(src, mat());
    expect(Float32Array.from(src.getAttribute('position').array)).toEqual(before);
    model.geometry.computeBoundingBox();
    const b = model.geometry.boundingBox as THREE.Box3;
    expect(b.max.x - b.min.x).toBeCloseTo(CRANE_SPAN, 4);
    expect(b.min.x + b.max.x).toBeCloseTo(0, 4);
    expect(b.min.y).toBeCloseTo(0, 4);
  });

  it('1 SkinnedMesh, 13 xương (gốc, vai + đầu cánh, hông + gối + cổ chân hai bên, gốc cổ + đầu — L-22), trọng số mỗi đỉnh tổng 1', () => {
    const { mesh, bones } = craneMesh(model);
    expect(mesh).toBeInstanceOf(THREE.SkinnedMesh);
    expect(mesh.skeleton.bones.length).toBe(13);
    expect(bones.map((b) => b.name)).toEqual([
      'goc',
      'vai-trai',
      'dau-trai',
      'vai-phai',
      'dau-phai',
      'hong-trai',
      'goi-trai',
      'co-chan-trai',
      'hong-phai',
      'goi-phai',
      'co-chan-phai',
      'goc-co',
      'dau-hac',
    ]);
    const w = model.geometry.getAttribute('skinWeight');
    for (let i = 0; i < n; i++) expect(w.getX(i) + w.getY(i) + w.getZ(i) + w.getW(i)).toBeCloseTo(1, 5);
  });

  it('chỗ ngồi không lún: cao hơn đỉnh lưng 0,11 m, không đỉnh thân nào quanh chỗ ngồi nhô cao hơn; gần chỗ của bản khối', () => {
    const [sx, sy, sz] = model.shape.seat;
    expect(sy - model.shape.backTop).toBeCloseTo(0.11, 5);
    for (let i = 0; i < n; i++) {
      const p = P(i);
      if (Math.abs(p.x - sx) < 0.25 && Math.abs(p.z - sz) < 0.25) expect(p.y).toBeLessThan(sy);
    }
    expect(Math.abs(sy - SEAT_AT[1])).toBeLessThan(0.12);
    expect(sz).toBeCloseTo(SEAT_AT[2], 5);
  });

  it('lưới quay 90° (sải dọc z) → tự đặt lại sải dọc x, đo như cũ', () => {
    const turned = craneModelFrom(blockCraneGeometry(spec).rotateY(Math.PI / 2), mat());
    expect(turned.shape.halfSpan).toBeCloseTo(model.shape.halfSpan, 3);
    expect(turned.shape.shoulder[0]).toBeCloseTo(model.shape.shoulder[0], 2);
    expect(turned.shape.backTop).toBeCloseTo(model.shape.backTop, 2);
  });

  it('chưa có design/models/hac.glb → nạp trả null (hạc giữ bản khối), không lỗi', async () => {
    await expect(loadCraneModel('khong-co-hac')).resolves.toBeNull();
  });
});

describe('Crane.useModel — vỗ cánh bằng xương (NV3)', () => {
  it('model: 1 draw call; bản khối (chưa nạp / không có file) giữ 3', () => {
    const count = (c: Crane): number => {
      let k = 0;
      c.root.traverse((o) => o instanceof THREE.Mesh && k++);
      return k;
    };
    const c = modelCrane();
    expect(c.usesModel).toBe(true);
    expect(count(c)).toBe(1);
    expect(count(new Crane(spec))).toBe(3);
    expect(c.seat.position.toArray()).toEqual(model.shape.seat);
  });

  it('vỗ: đầu cánh dịch lên / xuống rõ, lưng (chỗ ngồi) đứng yên, hai bên đối xứng', () => {
    const c = modelCrane();
    const rest = [tipR, tipL, back].map((i) => skinned(c, i));
    c.update(Math.PI / 2 / 5, 0.6, 5); // đỉnh nhịp: cánh lên hết
    const up = [tipR, tipL, back].map((i) => skinned(c, i));
    expect(up[0].y - rest[0].y).toBeGreaterThan(1);
    expect(up[0].y - rest[0].y).toBeCloseTo(up[1].y - rest[1].y, 4);
    expect(up[0].x).toBeCloseTo(-up[1].x, 4);
    expect(up[2].distanceTo(rest[2])).toBeLessThan(1e-5);
    c.update(Math.PI / 5, 0.6, 5); // đáy nhịp
    expect(skinned(c, tipR).y).toBeLessThan(rest[0].y - 1);
  });

  it('đứng đáp (fold = 1): cánh quay ra sau + gập, không vắt sang bên kia thân; lưng vẫn đứng yên', () => {
    const c = modelCrane();
    const rest = skinned(c, back);
    c.fold = 1;
    c.update(0.3, 0, 4);
    const tip = skinned(c, tipR);
    expect(tip.x).toBeGreaterThan(0.2);
    expect(tip.x).toBeLessThan(model.shape.halfSpan * 0.6); // thu gọn sát thân
    expect(skinned(c, tipL).x).toBeCloseTo(-tip.x, 4);
    expect(skinned(c, back).distanceTo(rest)).toBeLessThan(1e-5);
  });

  it('gọi useModel lần hai / sau dispose → bỏ qua', () => {
    const c = modelCrane();
    c.useModel(model);
    expect(c.root.children.filter((o) => o instanceof THREE.SkinnedMesh).length).toBe(1);
    const d = new Crane(spec);
    d.dispose();
    d.useModel(model);
    expect(d.usesModel).toBe(false);
  });
});

describe('R-HANH-5 (L-22): hạc model đáp xuống đứng trên hai chân, không nằm phục', () => {
  /** hạc giả tư thế bay như Tripo: chân duỗi thẳng ra sau (`hacGia.ts`) */
  const flyer = craneModelFrom(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(fakeFlyingCrane(), 3)), mat());
  const fp = flyer.geometry.getAttribute('position');
  const FP = (i: number): THREE.Vector3 => new THREE.Vector3().fromBufferAttribute(fp, i);
  const fBest = (score: (p: THREE.Vector3) => number): number => {
    let k = 0;
    let s = -Infinity;
    for (let i = 0; i < fp.count; i++) {
      const v = score(FP(i));
      if (v > s) [k, s] = [i, v];
    }
    return k;
  };
  const fBack = fBest((p) => (Math.abs(p.x) < 0.1 && Math.abs(p.z - flyer.shape.seat[2]) < 0.3 ? p.y : -Infinity));
  const fToe = fBest((p) => (p.x > 0 ? -p.z : -Infinity));
  const crane = (m: CraneModel): Crane => {
    const c = new Crane(spec);
    c.useModel(m);
    return c;
  };
  const at = (c: Crane, m: CraneModel, i: number): THREE.Vector3 => {
    c.root.updateMatrixWorld(true);
    const mesh = c.root.children.find((o): o is THREE.SkinnedMesh => o instanceof THREE.SkinnedMesh);
    if (!mesh) throw new Error('không có SkinnedMesh');
    return mesh.applyBoneTransform(i, new THREE.Vector3().fromBufferAttribute(m.geometry.getAttribute('position'), i));
  };
  const lowest = (c: Crane, m: CraneModel): number => {
    let y = Infinity;
    for (let i = 0; i < m.geometry.getAttribute('position').count; i++) y = Math.min(y, at(c, m, i).y);
    return y;
  };

  it('đo được hai chân: hạc giả chân duỗi sau, "khối gộp" chân thõng', () => {
    for (const m of [flyer, model]) {
      expect(m.shape.legs).toBeTruthy();
      expect(m.shape.legs?.toe[1]).toBeLessThan(0.2);
    }
  });

  it('đứng (fold = 1, stand = 1): bàn chân chạm đất (không lún, không lơ lửng), lưng nâng ≥ 0,6 m — không nằm bụng sát đất', () => {
    const c = crane(flyer);
    const rest = at(c, flyer, fBack);
    expect(lowest(c, flyer)).toBeCloseTo(0, 3); // dáng bay để dưới đất = nằm phục (lỗi cũ)
    c.fold = 1;
    c.stand = 1;
    c.update(0.3, 0, 4);
    expect(Math.abs(lowest(c, flyer))).toBeLessThan(0.05);
    expect(at(c, flyer, fBack).y - rest.y).toBeGreaterThan(0.6);
    // "khối gộp" (chân vốn thõng xuống): đứng vẫn chạm đất, không lún
    const b = crane(model);
    b.stand = 1;
    b.update(0.1, 0, 4);
    expect(Math.abs(lowest(b, model))).toBeLessThan(0.05);
  });

  it('chỗ ngồi đi theo lưng khi đứng / nhún (nhân vật ngồi đúng lưng)', () => {
    const c = crane(flyer);
    const gap0 = c.seat.position.y - at(c, flyer, fBack).y;
    for (const squat of [0, 1]) {
      c.stand = 1;
      c.squat = squat;
      c.update(0.1, 0, 4);
      const b = at(c, flyer, fBack);
      expect(Math.abs(c.seat.position.y - b.y - gap0)).toBeLessThan(0.06);
      expect(Math.abs(c.seat.position.z - b.z)).toBeLessThan(0.15);
    }
  });

  it('nhún: thân hạ, bàn chân giữ chỗ; stand = 0 về đúng dáng bay', () => {
    const c = crane(flyer);
    c.stand = 1;
    c.update(0.1, 0, 4);
    const a = at(c, flyer, fToe);
    const up = at(c, flyer, fBack).y;
    c.squat = 1;
    c.update(0.1, 0, 4);
    expect(at(c, flyer, fToe).distanceTo(a)).toBeLessThan(0.08);
    expect(at(c, flyer, fBack).y).toBeLessThan(up - 0.15);
    c.stand = 0;
    c.squat = 0;
    c.update(0.1, 0, 4);
    for (const i of [fToe, fBack]) expect(at(c, flyer, i).distanceTo(FP(i))).toBeLessThan(1e-4);
  });

  it('cổ: đứng → đầu nâng cao lên trên vai, mỏ vẫn hướng trước; stand = 0 → cổ về đúng dáng bay', () => {
    expect(flyer.shape.neck).toBeTruthy();
    const beak = fBest((p) => p.z);
    const crown = fBest((p) => (Math.abs(p.x) < 0.05 && p.z > 1.9 && p.z < 2.4 ? p.y : -Infinity));
    const c = crane(flyer);
    c.stand = 1;
    c.update(0, 0, 4);
    const back = at(c, flyer, fBack);
    const head = at(c, flyer, crown);
    const tip = at(c, flyer, beak);
    expect(head.y).toBeGreaterThan(back.y + 0.4); // đầu cao hơn lưng
    // cổ ngẩng: gốc cổ → khớp đầu dốc lên ≥ 50° so với mặt đất
    const mesh = c.root.children.find((o): o is THREE.SkinnedMesh => o instanceof THREE.SkinnedMesh);
    const bone = (name: string): THREE.Vector3 => (mesh?.skeleton.getBoneByName(name) as THREE.Bone).getWorldPosition(new THREE.Vector3());
    const d = bone('dau-hac').sub(bone('goc-co'));
    expect(Math.atan2(d.y, Math.hypot(d.x, d.z))).toBeGreaterThan(0.87);
    expect(tip.z).toBeGreaterThan(head.z + 0.3); // mỏ hướng trước
    expect(Math.abs(tip.y - head.y)).toBeLessThan(0.45); // không chĩa lên trời / cắm xuống
    c.stand = 0;
    c.update(0.5, 0, 4);
    for (const i of [beak, crown]) expect(at(c, flyer, i).distanceTo(FP(i))).toBeLessThan(1e-4);
  });

  it('chỗ ngồi khi đứng cao 2,2–2,6 m (sau scale) — nhân vật nhảy lên được', () => {
    const c = crane(flyer);
    c.stand = 1;
    c.update(0, 0, 4);
    const h = c.seat.position.y * spec.scale;
    expect(h).toBeGreaterThanOrEqual(2.2);
    expect(h).toBeLessThanOrEqual(2.6);
  });

  it('bản khối (chưa có model): stand không đổi gì', () => {
    const c = new Crane(spec);
    const before = c.seat.position.clone();
    c.stand = 1;
    c.update(0.1, 0, 4);
    expect(c.seat.position.distanceTo(before)).toBe(0);
  });
});
