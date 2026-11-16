import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { scanZFight } from './zfightScan';

/** Hai tấm mỏng khác màu nằm trùng mặt phẳng y = 0,5 quanh (x, z) — chỗ chớp thật. */
function fightPair(scene: THREE.Scene, x: number, z: number): void {
  const a = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#ff0000' }));
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#00ff00' }));
  a.position.set(x, 0.5, z);
  b.position.set(x, 0.5, z);
  scene.add(a, b);
}

/** Rừng cây InstancedMesh (thân hộp): hai cây cách xa nhau, khoảng giữa trống. */
function forest(scene: THREE.Scene, at: [number, number][]): THREE.InstancedMesh {
  const trees = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 4, 1), new THREE.MeshLambertMaterial({ color: '#336633' }), at.length);
  at.forEach(([x, z], i) => trees.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 2, z)));
  scene.add(trees);
  return trees;
}

describe('(L-13) bộ quét mặt trùng — khối che của InstancedMesh', () => {
  it('(L-13): khoảng trống giữa các cây InstancedMesh không bị coi là khối đặc — chỗ chớp ở đó vẫn bị bắt', () => {
    const scene = new THREE.Scene();
    forest(scene, [[-20, -20], [20, 20]]);
    fightPair(scene, 0, 0);
    expect(scanZFight(scene).length).toBe(1);
  });

  it('(L-13): chỗ chớp nằm trong một cây InstancedMesh thật thì vẫn bị che (bỏ qua)', () => {
    const scene = new THREE.Scene();
    forest(scene, [[-20, -20], [0, 0], [20, 20]]);
    fightPair(scene, 0, 0);
    expect(scanZFight(scene).length).toBe(0);
  });

  it('(L-13): khung bao một khối đặc không gộp khung bao vật con của nó', () => {
    const scene = new THREE.Scene();
    const post = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#888888' }));
    post.position.set(-10, 0.5, -10);
    const far = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#888888' }));
    far.position.set(20, 0, 20); // con ở xa: khung bao gộp sẽ phủ (0; 0,5; 0)
    post.add(far);
    scene.add(post);
    fightPair(scene, 0, 0);
    expect(scanZFight(scene).length).toBe(1);
  });
});
