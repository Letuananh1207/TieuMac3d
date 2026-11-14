/**
 * Dò mặt trùng (z-fighting, L-10): tam giác của hai vật khác màu / khác vật liệu nằm cùng mặt phẳng, cùng hướng, chồng nhau.
 * Chỉ dùng trong test (vitest) — quét cả cảnh đã dựng.
 */
import * as THREE from 'three';

export interface FightHit {
  a: string;
  b: string;
  /** tâm vùng chồng (toạ độ thế giới) */
  at: [number, number, number];
}

interface Tri {
  key: string;
  name: string;
  mesh: THREE.Object3D;
  p: THREE.Vector3[];
  n: THREE.Vector3;
  d: number;
}

/** Khoá vật liệu: màu vật liệu (+ màu đỉnh nếu có) — hai mặt cùng khoá trùng nhau thì không thấy chớp. */
function matKey(m: THREE.Mesh, g: THREE.BufferGeometry, i0: number): string {
  const mats = Array.isArray(m.material) ? m.material : [m.material];
  let mat = mats[0];
  if (Array.isArray(m.material)) {
    const grp = g.groups.find((gr) => i0 >= gr.start && i0 < gr.start + gr.count);
    mat = mats[grp?.materialIndex ?? 0];
  }
  const mm = mat as THREE.MeshLambertMaterial;
  if ((mm.transparent && mm.opacity < 0.999) || !mm.visible || !mm.colorWrite) return 'trong'; // trong suốt / vô hình: bỏ qua
  // vật liệu đã có polygonOffset (vệt đường, mặt nước…) luôn vẽ đè lên — khác offset thì không chớp
  const off = mm.polygonOffset ? `@${mm.polygonOffsetFactor},${mm.polygonOffsetUnits}` : '';
  let key = `${off}${mm.color ? mm.color.getHexString() : '?'}${mm.map ? '+anh' + mm.map.uuid.slice(0, 4) : ''}`;
  const col = g.getAttribute('color');
  if (col) {
    const idx = g.index ? g.index.getX(i0) : i0;
    key += `/${col.getX(idx).toFixed(2)},${col.getY(idx).toFixed(2)},${col.getZ(idx).toFixed(2)}`;
  }
  return key;
}

function label(o: THREE.Object3D): string {
  const m = o as THREE.Mesh;
  const g = m.geometry as THREE.BufferGeometry;
  if (!g.boundingBox) g.computeBoundingBox();
  const s = new THREE.Vector3();
  g.boundingBox!.getSize(s);
  const p = (g as unknown as { parameters?: Record<string, number> }).parameters;
  const dims = p && 'width' in p ? `${p.width}x${p.height}x${p.depth}` : `${s.x.toFixed(2)}x${s.y.toFixed(2)}x${s.z.toFixed(2)}`;
  return `${g.type.replace('Geometry', '')}[${dims}]${o.name ? ' ' + o.name : ''}`;
}

function inside(p: THREE.Vector3, t: Tri): boolean {
  const [a, b, c] = t.p;
  const v0 = new THREE.Vector3().subVectors(c, a);
  const v1 = new THREE.Vector3().subVectors(b, a);
  const v2 = new THREE.Vector3().subVectors(p, a);
  const d00 = v0.dot(v0), d01 = v0.dot(v1), d02 = v0.dot(v2), d11 = v1.dot(v1), d12 = v1.dot(v2);
  const den = d00 * d11 - d01 * d01;
  if (Math.abs(den) < 1e-12) return false;
  const u = (d11 * d02 - d01 * d12) / den;
  const v = (d00 * d12 - d01 * d02) / den;
  const e = 0.02; // bỏ chạm mép
  return u > e && v > e && u + v < 1 - e;
}

/** Quét `root`; trả về các cặp chớp (gộp theo cặp tên + ô 1 m). */
export function scanZFight(root: THREE.Object3D, tol = 0.002): FightHit[] {
  root.updateMatrixWorld(true);
  const buckets = new Map<string, Tri[]>();
  const tmp = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.visible || (m as unknown as THREE.InstancedMesh).isInstancedMesh) return;
    const g = m.geometry as THREE.BufferGeometry;
    const pos = g.getAttribute('position');
    if (!pos) return;
    const count = g.index ? g.index.count : pos.count;
    const name = label(m);
    for (let i = 0; i + 2 < count; i += 3) {
      for (let k = 0; k < 3; k++) {
        const idx = g.index ? g.index.getX(i + k) : i + k;
        tmp[k].fromBufferAttribute(pos, idx).applyMatrix4(m.matrixWorld);
      }
      const n = new THREE.Vector3().subVectors(tmp[1], tmp[0]).cross(new THREE.Vector3().subVectors(tmp[2], tmp[0]));
      const area = n.length() / 2;
      if (area < 1e-4) continue;
      n.normalize();
      const key = matKey(m, g, i);
      if (key === 'trong') continue;
      const d = n.dot(tmp[0]);
      // gom theo mặt phẳng: pháp tuyến làm tròn + khoảng cách làm tròn (xét cả ô kề vì làm tròn)
      const nk = `${Math.round(n.x * 50)},${Math.round(n.y * 50)},${Math.round(n.z * 50)}`;
      const t: Tri = { key, name, mesh: m, p: tmp.map((v) => v.clone()), n, d };
      const bk = `${nk}|${Math.round(d / 0.01)}`;
      if (!buckets.has(bk)) buckets.set(bk, []);
      buckets.get(bk)!.push(t);
    }
  });
  // khối đặc (hộp, trụ) để biết mặt nào bị che: điểm ngay trước mặt nằm trong khối khác → không thấy, bỏ qua
  const solids: { o: THREE.Object3D; bb: THREE.Box3 }[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.visible) return;
    const type = (m.geometry as THREE.BufferGeometry).type;
    if (type !== 'BoxGeometry' && type !== 'CylinderGeometry') return;
    const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.Material;
    if (mat.transparent || !mat.visible) return;
    solids.push({ o: m, bb: new THREE.Box3().setFromObject(m).expandByScalar(-0.001) });
  });
  const hidden = (p: THREE.Vector3, n: THREE.Vector3, a: Tri, b: Tri): boolean => {
    const q = p.clone().addScaledVector(n, 0.01);
    if (n.y < -0.9 && q.y < 0.02) return true; // mặt đáy sát đất
    return solids.some((s) => s.o !== a.mesh && s.o !== b.mesh && s.bb.containsPoint(q));
  };
  const hits = new Map<string, FightHit>();
  for (const [bk, list] of buckets) {
    const [nk, dk] = bk.split('|');
    const near = [...list, ...(buckets.get(`${nk}|${+dk + 1}`) ?? [])];
    for (const a of list)
      for (const b of near) {
        // cùng màu trơn: trùng cũng không thấy; cùng ảnh (vôi, đá…) nhưng hai khối → UV lệch nhau, vẫn thấy lấm tấm
        if (a === b || a.mesh === b.mesh || (a.key === b.key && !a.key.includes('+anh'))) continue;
        if (a.key.startsWith('@') !== b.key.startsWith('@') || (a.key.startsWith('@') && a.key.split('#')[0] !== b.key.split('#')[0])) continue;
        if (Math.abs(a.d - b.d) > tol || a.n.dot(b.n) < 0.999) continue;
        const ca = new THREE.Vector3().add(a.p[0]).add(a.p[1]).add(a.p[2]).divideScalar(3);
        const cb = new THREE.Vector3().add(b.p[0]).add(b.p[1]).add(b.p[2]).divideScalar(3);
        let at: THREE.Vector3 | null = null;
        if (inside(ca, b)) at = ca;
        else if (inside(cb, a)) at = cb;
        if (!at || hidden(at, a.n, a, b)) continue;
        const pair = [a.name, b.name].sort().join(' × ');
        const hk = `${pair}@${Math.round(at.x)},${Math.round(at.y)},${Math.round(at.z)}`;
        if (!hits.has(hk)) hits.set(hk, { a: `${a.name} (#${a.key})`, b: `${b.name} (#${b.key})`, at: [+at.x.toFixed(2), +at.y.toFixed(2), +at.z.toFixed(2)] });
      }
  }
  return [...hits.values()];
}
