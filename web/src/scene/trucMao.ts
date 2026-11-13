import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { lambert } from './materials';
import { makeCanvasTex } from './textures';
import { markDynamic } from './merge';
import type { Updater } from './props';
import { seededRandom } from './random';
import type { SceneSpec } from './spec';
import type { Placed } from './trees';

/**
 * Trúc mao 毛竹 (Rừng trúc — docs/tham_khao/rung-truc.md "Dựng low-poly"): mỗi khóm 4 thân 6 cạnh cao 12–18 m, đốt vẽ
 * bằng texture sọc, chùm lá dẹt mảnh ở 1/3 trên (≈ 60 tam giác / thân); xen thân già vàng, cao thấp, nghiêng nhẹ; ngọn đung đưa (lệch đỉnh trong shader
 * theo độ cao, pha theo vị trí khóm). 3 InstancedMesh cho cả rừng (thân xanh, thân già, lá).
 */
const STALKS = 4;
const NODES = 9; // số đốt dọc thân (vẽ bằng texture sọc — khối đốt thật tốn ~300 tam giác / thân)
const LEAF_CLUSTERS = 2; // chùm lá mỗi thân
const BLADES = 4; // phiến lá mỗi chùm
const SWAY = 0.55; // lệch ngọn tối đa (m)

/** Thân cao 1 (kéo theo chiều cao từng cây), gốc ở y = 0: trụ 6 cạnh hở hai đầu, thon dần — 12 tam giác. */
function stalkGeometry(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.055, 0.085, 1, 6, 1, true).translate(0, 0.5, 0);
}

/** Vòng đốt: sọc sẫm mảnh lặp `NODES` lần dọc thân (texture xám nhân với màu thân). */
function nodeTexture(): THREE.CanvasTexture {
  return makeCanvasTex(4, 64, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#9a9a8a';
    g.fillRect(0, 0, w, 3);
    g.fillStyle = '#e8e8e0';
    g.fillRect(0, 3, w, 3);
  }, [1, NODES]);
}

/** Chùm lá: 4 phiến dẹt mảnh nhọn xoè quanh trục, rủ nhẹ xuống — lá trúc là chùm mảnh, không phải tán tròn. */
function leafGeometry(): THREE.BufferGeometry {
  const blades: THREE.BufferGeometry[] = [];
  for (let i = 0; i < BLADES; i++) {
    const blade = new THREE.ConeGeometry(0.3, 2.3, 3, 1).scale(1, 1, 0.18);
    blade.rotateZ(-Math.PI / 2 + 0.35); // nằm ngang, chúc xuống
    blade.translate(1.0, -0.2, 0);
    blade.rotateY((i / BLADES) * Math.PI * 2 + (i % 2) * 0.4);
    blades.push(blade);
  }
  return mergeGeometries(blades)!;
}

/** Chèn đoạn đung đưa vào vật liệu: đỉnh lệch theo `aSway` (m, nhân y² với thân) và pha `aPhase`. */
function swayMaterial(color: string, time: { value: number }, stalk: boolean, map?: THREE.Texture): THREE.MeshLambertMaterial {
  const m = lambert(color, { flatShading: !stalk, map });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nattribute float aPhase;\nattribute float aSway;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float swayK = ${stalk ? 'aSway * position.y * position.y' : 'aSway'};
        transformed.x += sin(uTime * 0.9 + aPhase) * swayK;
        transformed.z += cos(uTime * 0.7 + aPhase * 1.3) * swayK * 0.5;`,
      );
  };
  m.customProgramCacheKey = () => (stalk ? 'truc-mao-than' : 'truc-mao-la');
  return m;
}

export function addTallBamboo(scene: THREE.Scene, spec: SceneSpec['trees'], all: Placed[], seed: number): Updater {
  if (all.length === 0) return () => {};
  const rand = seededRandom(seed * 7349 + 11);
  const time = { value: 0 };
  const n = all.length * STALKS;
  const stalkGeo = stalkGeometry();
  const nodes = nodeTexture();
  const green = new THREE.InstancedMesh(stalkGeo, swayMaterial(spec.mao[0], time, true, nodes), n);
  const old = new THREE.InstancedMesh(stalkGeo, swayMaterial(spec.mao[1], time, true, nodes), n);
  const leaves = new THREE.InstancedMesh(leafGeometry(), swayMaterial(spec.mao[2], time, false), n * LEAF_CLUSTERS);
  const phase = { green: new Float32Array(n), old: new Float32Array(n), leaf: new Float32Array(n * LEAF_CLUSTERS) };
  const sway = { green: new Float32Array(n), old: new Float32Array(n), leaf: new Float32Array(n * LEAF_CLUSTERS) };

  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const size = new THREE.Vector3();
  let gi = 0;
  let oi = 0;
  let li = 0;
  for (const t of all) {
    const ph = t.x * 0.37 + t.z * 0.21; // cả khóm cùng pha → đung đưa như một bụi
    for (let k = 0; k < STALKS; k++) {
      const h = (12 + rand() * 6) * (0.8 + t.scale * 0.2);
      const lean = (rand() - 0.5) * 0.12;
      const turn = rand() * Math.PI * 2;
      const x = t.x + (rand() - 0.5) * 1.1 * t.scale;
      const z = t.z + (rand() - 0.5) * 1.1 * t.scale;
      const y0 = t.y ?? 0;
      const thick = 0.9 + rand() * 0.5;
      quat.setFromEuler(euler.set(lean, turn, lean * 0.7));
      m.compose(pos.set(x, y0, z), quat, size.set(thick, h, thick));
      const isOld = rand() < 0.22;
      const swayAmp = SWAY * (h / 15);
      if (isOld) {
        old.setMatrixAt(oi, m);
        phase.old[oi] = ph;
        sway.old[oi++] = swayAmp;
      } else {
        green.setMatrixAt(gi, m);
        phase.green[gi] = ph;
        sway.green[gi++] = swayAmp;
      }
      // chùm lá ở 1/3 trên, dọc theo thân đã nghiêng
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
      for (let c = 0; c < LEAF_CLUSTERS; c++) {
        const f = 0.72 + (c / Math.max(1, LEAF_CLUSTERS - 1)) * 0.24 + (rand() - 0.5) * 0.04;
        const s = 1.0 + (1 - f) * 2 + rand() * 0.4;
        quat.setFromEuler(euler.set((rand() - 0.5) * 0.3, rand() * Math.PI * 2, (rand() - 0.5) * 0.3));
        m.compose(pos.set(x, y0, z).addScaledVector(up, h * f), quat, size.setScalar(s));
        leaves.setMatrixAt(li, m);
        phase.leaf[li] = ph;
        sway.leaf[li++] = swayAmp * f * f;
      }
    }
  }
  green.count = gi;
  old.count = oi;
  const meshes: [THREE.InstancedMesh, Float32Array, Float32Array][] = [
    [green, phase.green, sway.green],
    [old, phase.old, sway.old],
    [leaves, phase.leaf, sway.leaf],
  ];
  for (const [mesh, p, s] of meshes) {
    mesh.geometry = mesh.geometry.clone(); // thuộc tính theo từng mesh
    mesh.geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(p, 1));
    mesh.geometry.setAttribute('aSway', new THREE.InstancedBufferAttribute(s, 1));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    markDynamic(mesh);
    scene.add(mesh);
  }
  return (dt) => {
    time.value += dt;
  };
}
