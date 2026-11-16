import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { blockCraneGeometry, Crane, SEAT_AT } from './hac';
import { craneMesh, craneModelFrom, CRANE_SPAN, loadCraneModel, type CraneModel } from './hacModel';
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

  it('1 SkinnedMesh, 5 xương (gốc, vai + đầu cánh hai bên), trọng số mỗi đỉnh tổng 1', () => {
    const { mesh, bones } = craneMesh(model);
    expect(mesh).toBeInstanceOf(THREE.SkinnedMesh);
    expect(mesh.skeleton.bones.length).toBe(5);
    expect(bones.map((b) => b.name)).toEqual(['goc', 'vai-trai', 'dau-trai', 'vai-phai', 'dau-phai']);
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
