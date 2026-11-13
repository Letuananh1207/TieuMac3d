import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import { addPlasterWalls } from './kien_truc/tuong';
import type { SceneSpec, WallGate, WallSegment } from './spec';
import { makeCanvasTex } from './textures';

/** Một đoạn thẳng trục: chạy dọc trục `axis` từ `a` tới `b`, nằm ở `fixed` trên trục còn lại. */
export interface Run {
  axis: 'x' | 'z';
  fixed: number;
  a: number;
  b: number;
  height: number;
}

/** Cắt một đoạn bằng các khe [lo, hi] (đã sắp). Phần còn lại ngắn hơn 0,05 m thì bỏ. */
export function cutRun(run: Run, gaps: [number, number][]): Run[] {
  const out: Run[] = [];
  let start = run.a;
  for (const [lo, hi] of [...gaps].sort((p, q) => p[0] - q[0])) {
    if (lo - start > 0.05) out.push({ ...run, a: start, b: Math.min(lo, run.b) });
    start = Math.max(start, hi);
  }
  if (run.b - start > 0.05) out.push({ ...run, a: start, b: run.b });
  return out;
}

/** Bốn cạnh tường bao (dày 1, góc chồng lên nhau) đã trừ khe cổng; `pad` = nới mỗi khe thêm bao nhiêu mét mỗi bên. */
export function ringRuns(spec: SceneSpec['walls'], pad = 0): Run[] {
  if (!spec.enabled) return []; // cảnh vùng không có tường bao (đoạn tường lẻ vẫn dựng)
  const { half, height } = spec;
  const end = half + 0.5;
  const sides: [WallGate['side'], Run][] = [
    ['bac', { axis: 'x', fixed: -half, a: -end, b: end, height }],
    ['nam', { axis: 'x', fixed: half, a: -end, b: end, height }],
    ['tay', { axis: 'z', fixed: -half, a: -end, b: end, height }],
    ['dong', { axis: 'z', fixed: half, a: -end, b: end, height }],
  ];
  return sides.flatMap(([side, run]) =>
    cutRun(
      run,
      spec.gates.filter((g) => g.side === side).map((g) => [g.at - g.width / 2 - pad, g.at + g.width / 2 + pad]),
    ),
  );
}

export function segmentRun(s: WallSegment, defaultHeight: number): Run {
  const [x1, z1] = s.from;
  const [x2, z2] = s.to;
  const height = s.height ?? defaultHeight;
  // dài thêm 0,5 mỗi đầu để nối kín với tường khác ở góc
  if (z1 === z2) return { axis: 'x', fixed: z1, a: Math.min(x1, x2) - 0.5, b: Math.max(x1, x2) + 0.5, height };
  return { axis: 'z', fixed: x1, a: Math.min(z1, z2) - 0.5, b: Math.max(z1, z2) + 0.5, height };
}

/**
 * Tường bao ±`half` có khe cổng (`gates`) + các đoạn tường thêm (`wallSegments`). Mỗi đoạn có va chạm.
 * `style: voi` → tường vôi + cổng trăng (`kien_truc/tuong.ts`); mặc định `gach` = vân gạch như bản gốc.
 */
export function addWalls(
  scene: THREE.Scene,
  colliders: Colliders,
  spec: SceneSpec['walls'],
  extra: WallSegment[],
  style: SceneSpec['buildingStyle'],
): void {
  if (spec.style === 'voi') {
    addPlasterWalls(scene, colliders, spec, extra, style);
    return;
  }
  const brickTex = makeCanvasTex(
    256,
    128,
    (g) => {
      g.fillStyle = spec.color;
      g.fillRect(0, 0, 256, 128);
      for (let y = 0; y < 8; y++) {
        for (let x = -1; x < 8; x++) {
          g.fillStyle = `hsl(${spec.brickHue},${35 + Math.random() * 10}%,${30 + Math.random() * 8}%)`;
          g.fillRect(x * 34 + (y % 2) * 17 + 1, y * 16 + 1, 32, 14);
        }
      }
    },
    [1, 1],
  );
  const capMat = lambert(spec.capColor);
  // mỗi mét dài một lượt gạch như cũ (43 m ↔ 10 lượt); vật liệu theo độ dài làm tròn để dùng chung
  const mats = new Map<number, THREE.MeshLambertMaterial>();
  const matFor = (len: number): THREE.MeshLambertMaterial => {
    const rep = Math.max(1, Math.round((len * 10) / 43));
    let m = mats.get(rep);
    if (!m) {
      const tex = brickTex.clone();
      tex.repeat.set(rep, 1);
      m = lambert(0xffffff, { map: tex });
      mats.set(rep, m);
    }
    return m;
  };

  for (const r of [...ringRuns(spec), ...extra.map((s) => segmentRun(s, spec.height))]) {
    const len = r.b - r.a;
    const mid = (r.a + r.b) / 2;
    const [x, z, w, d] = r.axis === 'x' ? [mid, r.fixed, len, 1] : [r.fixed, mid, 1, len];
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, r.height, d), matFor(len));
    m.position.set(x, r.height / 2, z);
    scene.add(m);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.35, d + 0.5), capMat);
    cap.position.set(x, r.height + 0.17, z);
    scene.add(cap);
    colliders.add(x, z, w, d);
  }
}
