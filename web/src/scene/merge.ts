import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Đánh dấu vật chuyển động (khói, đảo nổi…): `mergeStatic` bỏ qua nó và mọi con của nó. */
export function markDynamic(o: THREE.Object3D): void {
  o.userData.dynamic = true;
}

function isDynamic(o: THREE.Object3D | null): boolean {
  for (let p = o; p; p = p.parent) if (p.userData.dynamic) return true;
  return false;
}

/** Hai vật liệu "giống nhau" nếu vẽ ra y hệt: cùng loại, màu, texture, trong suốt, mặt, đẩy độ sâu. */
function materialKey(m: THREE.Material): string | null {
  if (!(m instanceof THREE.MeshLambertMaterial || m instanceof THREE.MeshBasicMaterial)) return null;
  return [
    m.type,
    m.color.getHexString(),
    m.map?.uuid ?? '',
    m.transparent,
    m.opacity,
    m.side,
    m.polygonOffset ? m.polygonOffsetFactor : '',
  ].join('|');
}

/**
 * Gộp mọi khối đứng yên cùng vật liệu thành một khối: mỗi nhóm còn 1 draw call thay vì vài chục.
 * Bỏ qua InstancedMesh, vật `dynamic`, và `keep` (mặt sân — tia dò chạm cần đúng object đó).
 * Gọi một lần sau khi dựng xong cảnh. Trả về số draw call bớt được.
 */
export function mergeStatic(root: THREE.Object3D, keep: Set<THREE.Object3D>): number {
  root.updateMatrixWorld(true);
  const groups = new Map<string, THREE.Mesh[]>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || o instanceof THREE.InstancedMesh || keep.has(o) || isDynamic(o)) return;
    if (Array.isArray(o.material)) return;
    const key = materialKey(o.material);
    if (!key) return;
    const list = groups.get(key) ?? [];
    list.push(o);
    groups.set(key, list);
  });

  let saved = 0;
  for (const meshes of groups.values()) {
    if (meshes.length < 2) continue;
    const geos = meshes.map((m) => {
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      for (const name of Object.keys(g.attributes)) {
        if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
      }
      g.applyMatrix4(m.matrixWorld);
      return g;
    });
    const merged = mergeGeometries(geos);
    for (const g of geos) g.dispose();
    if (!merged) continue; // thuộc tính lệch nhau: để nguyên từng khối
    for (const m of meshes) m.removeFromParent();
    const mesh = new THREE.Mesh(merged, meshes[0].material);
    root.add(mesh);
    saved += meshes.length - 1;
  }
  return saved;
}
