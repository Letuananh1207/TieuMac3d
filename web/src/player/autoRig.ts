import * as THREE from 'three';

/**
 * Tự gắn xương cho model nhân vật chibi đứng tư thế chữ A (model AI thường không có xương) — để có động tác đi / đứng
 * mà không cần công cụ ngoài (Mixamo, Blender). Khung xương theo tỉ lệ cao H / rộng W của model đã chuẩn hoá (chân ở
 * y = 0, tâm x/z = 0, mặt trước +z): hông → đầu, tay trái / phải, chân trái / phải. Trọng số mềm ở khớp để không rách.
 */

/** Tỉ lệ dáng chibi (phần của chiều cao / bề rộng) — chỉnh nếu model khác dáng. */
const P = {
  hip: 0.32, // gốc thân (xoay nhẹ khi đi)
  neck: 0.6, // trên đây là đầu
  shoulderY: 0.55,
  shoulderX: 0.2, // |x| / W vượt mức này là tay
  legTop: 0.15, // dưới đây là chân (lộ ra dưới vạt áo)
  legX: 0.0,
};

export interface Rig {
  root: THREE.Bone;
  hips: THREE.Bone;
  head: THREE.Bone;
  armL: THREE.Bone;
  armR: THREE.Bone;
  legL: THREE.Bone;
  legR: THREE.Bone;
}

/**
 * Bản sao geometry với mọi thuộc tính là Float32. File nén meshopt lưu toạ độ / pháp tuyến / UV dạng số nguyên lượng tử
 * hoá (normalized int) — biến đổi sang toạ độ mét trên kiểu đó sẽ bị cắt cụt (hình vỡ, mất đầu).
 */
function toFloat(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  for (const [name, attr] of Object.entries(src.attributes)) {
    const a = attr as THREE.BufferAttribute;
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let c = 0; c < a.itemSize; c++) out[i * a.itemSize + c] = a.getComponent(i, c);
    geo.setAttribute(name, new THREE.Float32BufferAttribute(out, a.itemSize));
  }
  if (src.index) geo.setIndex(src.index.clone());
  return geo;
}

const smooth = (a: number, b: number, v: number): number => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Biến các mesh trong `model` (đã chuẩn hoá cỡ, nằm trong `model`) thành SkinnedMesh dùng chung một bộ xương.
 * Trả về mesh mới (đặt thay chỗ) và xương để `glbCharacter` điều khiển.
 */
export function autoRig(model: THREE.Object3D, height: number): { group: THREE.Group; rig: Rig } {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const W = Math.max(box.max.x - box.min.x, 1e-3);
  const H = height;

  const bone = (name: string, x: number, y: number, z = 0): THREE.Bone => {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(x, y, z);
    return b;
  };
  const root = bone('root', 0, 0);
  const hips = bone('hips', 0, P.hip * H);
  const head = bone('head', 0, (P.neck - P.hip) * H);
  const armL = bone('armL', P.shoulderX * W, (P.shoulderY - P.hip) * H);
  const armR = bone('armR', -P.shoulderX * W, (P.shoulderY - P.hip) * H);
  const legL = bone('legL', 0.08 * W, (P.legTop - P.hip) * H);
  const legR = bone('legR', -0.08 * W, (P.legTop - P.hip) * H);
  root.add(hips);
  hips.add(head, armL, armR, legL, legR);
  const bones = [root, hips, head, armL, armR, legL, legR];
  const index = new Map(bones.map((b, i) => [b, i]));

  const group = new THREE.Group();
  group.add(root);
  const meshes: THREE.Mesh[] = [];
  model.traverse((o) => {
    if (o instanceof THREE.Mesh) meshes.push(o);
  });
  group.updateMatrixWorld(true); // ma trận xương phải đúng trước khi bind (tính ma trận nghịch)
  const skeleton = new THREE.Skeleton(bones);
  const v = new THREE.Vector3();
  for (const m of meshes) {
    const geo = toFloat(m.geometry);
    geo.applyMatrix4(m.matrixWorld); // về toạ độ của model đã chuẩn hoá
    const pos = geo.getAttribute('position');
    const n = pos.count;
    const skinIndex = new Uint16Array(n * 4);
    const skinWeight = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      const y = v.y / H;
      const ax = Math.abs(v.x) / W;
      const side = v.x >= 0 ? 'L' : 'R';
      const wHead = smooth(P.neck - 0.03, P.neck + 0.03, y);
      const wArm = (1 - wHead) * smooth(P.shoulderX - 0.02, P.shoulderX + 0.06, ax) * smooth(0.3, 0.38, y);
      const wLeg = (1 - smooth(P.legTop - 0.05, P.legTop + 0.02, y)) * smooth(0.0, 0.04, ax + 0.04);
      const wBody = Math.max(0, 1 - wHead - wArm - wLeg);
      const pairs: [THREE.Bone, number][] = [
        [hips, wBody],
        [head, wHead],
        [side === 'L' ? armL : armR, wArm],
        [side === 'L' ? legL : legR, wLeg],
      ];
      const sum = pairs.reduce((s, [, w]) => s + w, 0) || 1;
      pairs.forEach(([b, w], k) => {
        skinIndex[i * 4 + k] = index.get(b) ?? 0;
        skinWeight[i * 4 + k] = w / sum;
      });
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));
    const skinned = new THREE.SkinnedMesh(geo, m.material);
    skinned.frustumCulled = false; // khung bao tĩnh không theo xương → tránh biến mất khi tay / chân vung
    group.add(skinned);
    skinned.bind(skeleton);
  }
  return { group, rig: { root, hips, head, armL, armR, legL, legR } };
}
