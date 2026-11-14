import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from '../collision/colliders';
import { lauSach } from './kien_truc/lau_sach';
import { addPlasterWalls } from './kien_truc/tuong';
import { DEFAULT_SCENE, type BuildingSpec } from './spec';

// biển / vôi vẽ bằng canvas 2D: Node không có — canvas giả, mọi lệnh vẽ trả lại chính nó
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) });

const style = { ...DEFAULT_SCENE.buildingStyle, heightScale: 1.6 };

/** Một mặt của hộp (thẳng trục): trục pháp tuyến, chiều, toạ độ mặt phẳng, hình chữ nhật trên hai trục còn lại, vật liệu. */
interface Face {
  axis: number;
  sign: number;
  at: number;
  r: [number, number, number, number];
  key: string;
}

/** Mặt các khối hộp đang hiện trong `root` (toạ độ thế giới). Khoá vật liệu: ảnh (vôi, đá) hoặc màu. */
function boxFaces(root: THREE.Object3D): Face[] {
  root.updateMatrixWorld(true);
  const out: Face[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || m.geometry.type !== 'BoxGeometry' || !m.visible) return;
    const mat = m.material as THREE.MeshLambertMaterial;
    const key = mat.map ? 'anh' : `#${mat.color.getHexString()}`;
    const bb = new THREE.Box3().setFromObject(m);
    const [lo, hi] = [bb.min.toArray(), bb.max.toArray()];
    for (let a = 0; a < 3; a++) {
      const [u, v] = [(a + 1) % 3, (a + 2) % 3];
      const r: [number, number, number, number] = [lo[u], hi[u], lo[v], hi[v]];
      out.push({ axis: a, sign: -1, at: lo[a], r, key }, { axis: a, sign: 1, at: hi[a], r, key });
    }
  });
  return out;
}

/**
 * Cặp mặt cùng hướng, cùng mặt phẳng (lệch < 2 mm), chồng nhau > 1 cm mỗi chiều, khác vật liệu → chớp (z-fighting).
 * Bỏ mặt đáy nằm sát đất (không ai nhìn thấy).
 */
function fighting(faces: Face[], keys: [string, string]): number {
  let n = 0;
  for (const a of faces)
    for (const b of faces) {
      if (a.key !== keys[0] || b.key !== keys[1] || a.axis !== b.axis || a.sign !== b.sign || Math.abs(a.at - b.at) > 0.002) continue;
      if (a.axis === 1 && a.sign < 0 && a.at < 0.01) continue;
      const w = Math.min(a.r[1], b.r[1]) - Math.max(a.r[0], b.r[0]);
      const h = Math.min(a.r[3], b.r[3]) - Math.max(a.r[2], b.r[2]);
      if (w > 0.01 && h > 0.01) n++;
    }
  return n;
}

describe('(L-10) mặt trùng nhau gây chớp', () => {
  it('(L-10): cổng mái ngói — khung gỗ (trụ, xà) không nằm trùng mặt tường vôi của cổng', () => {
    const scene = new THREE.Scene();
    const walls = { ...DEFAULT_SCENE.walls, half: 17, height: 4.5, thickness: 0.5, style: 'voi' as const, windows: 0 };
    addPlasterWalls(scene, new Colliders(), { ...walls, gates: [{ side: 'nam', at: 0, width: 6.4, kind: 'lau' }] }, [], style);
    expect(fighting(boxFaces(scene), [`#${new THREE.Color(style.timber).getHexString()}`, 'anh'])).toBe(0);
  });

  it('(L-10): Tàng Thư Các — hiên lửng tầng 1 thấp hơn mặt sàn tầng 2 (không trùng mặt sàn)', () => {
    const b: BuildingSpec = { id: 't', kind: 'lau-sach', x: 0, z: 0, w: 18, d: 9, title: 'Thư viện', roofColor: '#2f3236' };
    const [g, fade, low] = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
    g.add(fade, low);
    lauSach(g, b, style, fade, low);
    g.updateMatrixWorld(true);
    // sàn tầng 2: tấm gỗ phủ cả nhà (w × d) trong lớp tầng 2
    const slab = low.children.map((o) => new THREE.Box3().setFromObject(o)).find((bb) => Math.abs(bb.max.x - bb.min.x - b.w) < 1e-6);
    expect(slab).toBeDefined();
    // hiên lửng: chóp cụt màu mái rộng hơn nhà trong lớp mờ
    const eaves = fade.children
      .filter((o) => (o as THREE.Mesh).isMesh && ((o as THREE.Mesh).material as THREE.MeshLambertMaterial).color?.getHexString() === '2f3236')
      .map((o) => new THREE.Box3().setFromObject(o))
      .filter((bb) => bb.max.x - bb.min.x > b.w + 2 && bb.min.y < slab!.max.y);
    expect(eaves.length).toBeGreaterThan(0);
    for (const e of eaves) expect(e.max.y).toBeLessThan(slab!.max.y - 0.01);
  });
});
