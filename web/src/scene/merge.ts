import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { bakeSoftColors, type SoftLook } from './bake';
import { softMaterial } from './materials';

/** Đánh dấu vật chuyển động (khói, đảo nổi…): `mergeStatic` bỏ qua nó và mọi con của nó. */
export function markDynamic(o: THREE.Object3D): void {
  o.userData.dynamic = true;
}

function isDynamic(o: THREE.Object3D | null): boolean {
  for (let p = o; p; p = p.parent) if (p.userData.dynamic) return true;
  return false;
}

/** Nhóm tự quản vật liệu (mái / tường trước mờ dần khi vào nhà — rooms.ts): `mergeSoft` không kéo khối ra khỏi nhóm. */
export function markOwnMaterials(o: THREE.Object3D): void {
  o.userData.ownMaterials = true;
}

function ownsMaterials(o: THREE.Object3D | null): boolean {
  for (let p = o; p; p = p.parent) if (p.userData.ownMaterials) return true;
  return false;
}

/** Hai vật liệu "giống nhau" nếu vẽ ra y hệt: cùng loại, màu, texture, trong suốt, mặt, đẩy độ sâu. */
function materialKey(m: THREE.Material): string | null {
  if (!(m instanceof THREE.MeshLambertMaterial || m instanceof THREE.MeshBasicMaterial)) return null;
  if (m.userData.soft) return null; // vật liệu mềm mang màu theo đỉnh — gộp ở mergeSoft, không xoá màu đỉnh
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
  // khối gộp gắn vào `root` → toạ độ tính tương đối với `root` (root = scene thì là toạ độ cảnh như cũ)
  const toRoot = root.matrixWorld.clone().invert();
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
      g.applyMatrix4(toRoot.clone().multiply(m.matrixWorld));
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

/**
 * Gộp mọi khối Lambert không texture, đục, đứng yên trong `root` thành MỘT khối màu theo đỉnh (mỗi khối mang màu vật
 * liệu của nó) — dù khác màu vẫn 1 draw call. Dùng cho nhóm cần vật liệu riêng (mái nhà vào được, làm mờ R-HUD-2):
 * gộp theo vật liệu ở đó tốn mỗi màu một draw call cho từng nhà. Vẽ hai mặt (mái nhìn từ dưới hiên vẫn đặc).
 * `look` (cảnh mềm — kế hoạch 2026-11-14-canh-dep NV10): màu mỗi khối nướng bóng (gầm mái / hiên tối ấm, chân tường sẫm;
 * độ cao tính trong toạ độ `root`, y = 0 là nền nhà) + vật liệu mềm (wrap lighting).
 * Trả về số draw call bớt được.
 */
export function mergeVertexColors(root: THREE.Object3D, look?: SoftLook): number {
  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert();
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || o instanceof THREE.InstancedMesh || isDynamic(o)) return;
    const m = o.material;
    if (!(m instanceof THREE.MeshLambertMaterial) || m.map || m.transparent || m.vertexColors) return;
    meshes.push(o);
  });
  if (meshes.length < 2) return 0;
  const geos = meshes.map((mesh) => {
    const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    }
    const c = (mesh.material as THREE.MeshLambertMaterial).color;
    g.applyMatrix4(toRoot.clone().multiply(mesh.matrixWorld));
    if (look) {
      bakeSoftColors(g, c, look);
      return g;
    }
    const n = g.getAttribute('position').count;
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) colors.set([c.r, c.g, c.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  });
  const merged = mergeGeometries(geos);
  for (const g of geos) g.dispose();
  if (!merged) return 0;
  for (const m of meshes) m.removeFromParent();
  const mat = look ? softMaterial(look.wrap, THREE.DoubleSide) : new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  root.add(new THREE.Mesh(merged, mat));
  return meshes.length - 1;
}

/** Chép vật liệu giữ cả móc shader (vật liệu mềm: `clone()` của three bỏ `onBeforeCompile` / khoá chương trình). */
export function cloneMaterial<M extends THREE.Material>(m: M): M {
  const c = m.clone() as M;
  if (m.userData.soft) {
    c.onBeforeCompile = m.onBeforeCompile;
    c.customProgramCacheKey = m.customProgramCacheKey;
  }
  return c;
}

/**
 * Cảnh "mềm" (kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV3 — chỉ gọi khi đặc tả bật, mặc định không gọi): gộp mọi khối
 * Lambert đứng yên, đục, không ảnh, chưa có màu đỉnh trong `root` thành **một khối mỗi mặt vẽ** (trước / hai mặt) dùng vật
 * liệu mềm chung — mỗi khối mang màu vật liệu của nó đã nướng bóng (`bake.ts`): chân tường sẫm, gầm mái tối ấm. Gọi
 * TRƯỚC `mergeStatic` (phần còn lại — ảnh, trong suốt, Basic — vẫn gộp theo vật liệu như cũ). `groundY` theo toạ độ của
 * `root`. Trả về số draw call bớt được.
 */
export function mergeSoft(
  root: THREE.Object3D,
  keep: Set<THREE.Object3D>,
  look: SoftLook,
  groundY: (x: number, z: number) => number = () => 0,
): number {
  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert();
  const bySide = new Map<THREE.Side, THREE.Mesh[]>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || o instanceof THREE.InstancedMesh || keep.has(o) || isDynamic(o) || ownsMaterials(o)) return;
    const m = o.material;
    if (!(m instanceof THREE.MeshLambertMaterial) || m.map || m.transparent || m.vertexColors || m.userData.soft) return;
    if (m.polygonOffset) return; // mặt dán đẩy độ sâu (chống nhấp nháy) giữ vật liệu riêng
    const list = bySide.get(m.side) ?? [];
    list.push(o);
    bySide.set(m.side, list);
  });
  let saved = 0;
  for (const [side, meshes] of bySide) {
    const geos = meshes.map((mesh) => {
      const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      for (const name of Object.keys(g.attributes)) {
        if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
      }
      g.applyMatrix4(toRoot.clone().multiply(mesh.matrixWorld));
      bakeSoftColors(g, (mesh.material as THREE.MeshLambertMaterial).color, look, groundY);
      return g;
    });
    const merged = mergeGeometries(geos);
    for (const g of geos) g.dispose();
    if (!merged) continue;
    for (const m of meshes) m.removeFromParent();
    root.add(new THREE.Mesh(merged, softMaterial(look.wrap, side)));
    saved += meshes.length - 1;
  }
  return saved;
}
