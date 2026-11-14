import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import { lambert } from './materials';
import { addPlasterWalls } from './kien_truc/tuong';
import type { GATE_KINDS, GateSigns, SceneSpec, WallGate, WallSegment } from './spec';
import type { GroundY } from './terrainHeight';
import { makeCanvasTex } from './textures';

type Walls = SceneSpec['walls'];

/** Một đoạn thẳng trục: chạy dọc trục `axis` từ `a` tới `b`, nằm ở `fixed` trên trục còn lại; dày `thickness`. */
export interface Run {
  axis: 'x' | 'z';
  fixed: number;
  a: number;
  b: number;
  height: number;
  thickness: number;
}

/**
 * Một cổng đã đặt chỗ — trên tường bao hay trên đoạn tường thêm đều quy về đây: tâm khe `at` dọc trục `axis`, tường
 * nằm ở `fixed`; cao / dày theo bức tường chứa nó.
 */
export interface GatePlace {
  axis: 'x' | 'z';
  fixed: number;
  at: number;
  width: number;
  height: number;
  thickness: number;
  kind: (typeof GATE_KINDS)[number];
  signs: GateSigns;
}

/** Hai mặt của bức tường chạy theo `axis`: mặt nhìn về phía + trục kia, mặt nhìn về phía −. */
export function gateFaces(axis: Run['axis']): ['nam' | 'dong', 'bac' | 'tay'] {
  return axis === 'x' ? ['nam', 'bac'] : ['dong', 'tay'];
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

/** Bốn cạnh tường bao (góc chồng lên nhau) đã trừ khe cổng; `pad` = nới mỗi khe thêm bao nhiêu mét mỗi bên. */
export function ringRuns(spec: Walls, pad = 0): Run[] {
  if (!spec.enabled) return []; // cảnh vùng không có tường bao (đoạn tường lẻ vẫn dựng)
  const { half, height, thickness } = spec;
  const end = half + thickness / 2;
  const sides: [WallGate['side'], Run][] = [
    ['bac', { axis: 'x', fixed: -half, a: -end, b: end, height, thickness }],
    ['nam', { axis: 'x', fixed: half, a: -end, b: end, height, thickness }],
    ['tay', { axis: 'z', fixed: -half, a: -end, b: end, height, thickness }],
    ['dong', { axis: 'z', fixed: half, a: -end, b: end, height, thickness }],
  ];
  return sides.flatMap(([side, run]) =>
    cutRun(
      run,
      spec.gates.filter((g) => g.side === side).map((g) => [g.at - g.width / 2 - pad, g.at + g.width / 2 + pad]),
    ),
  );
}

/** Đoạn tường thêm, chưa cắt khe; dài thêm nửa bề dày mỗi đầu để nối kín với tường khác ở góc. */
export function segmentRun(s: WallSegment, walls: Pick<Walls, 'height' | 'thickness'>): Run {
  const [x1, z1] = s.from;
  const [x2, z2] = s.to;
  const height = s.height ?? walls.height;
  const thickness = s.thickness ?? walls.thickness;
  const ext = thickness / 2;
  if (z1 === z2) return { axis: 'x', fixed: z1, a: Math.min(x1, x2) - ext, b: Math.max(x1, x2) + ext, height, thickness };
  return { axis: 'z', fixed: x1, a: Math.min(z1, z2) - ext, b: Math.max(z1, z2) + ext, height, thickness };
}

/** Đoạn tường thêm đã trừ khe cổng của nó (nới `pad` mỗi bên). */
export function segmentRuns(s: WallSegment, walls: Pick<Walls, 'height' | 'thickness'>, pad = 0): Run[] {
  const run = segmentRun(s, walls);
  return s.gate ? cutRun(run, [[s.gate.at - s.gate.width / 2 - pad, s.gate.at + s.gate.width / 2 + pad]]) : [run];
}

/** Mọi cổng: trên tường bao (nếu có) rồi trên các đoạn tường thêm. */
export function wallGates(walls: Walls, segments: WallSegment[]): GatePlace[] {
  const ring: GatePlace[] = walls.enabled
    ? walls.gates.map((g) => ({
        axis: g.side === 'bac' || g.side === 'nam' ? 'x' : 'z',
        fixed: g.side === 'bac' || g.side === 'tay' ? -walls.half : walls.half,
        at: g.at,
        width: g.width,
        height: walls.height,
        thickness: walls.thickness,
        kind: g.kind ?? 'trang',
        signs: g.signs ?? {},
      }))
    : [];
  const extra = segments.flatMap((s): GatePlace[] => {
    if (!s.gate) return [];
    const r = segmentRun(s, walls);
    return [{ axis: r.axis, fixed: r.fixed, at: s.gate.at, width: s.gate.width, height: r.height, thickness: r.thickness, kind: s.gate.kind ?? 'trang', signs: s.gate.signs ?? {} }];
  });
  return [...ring, ...extra];
}

/**
 * Tường bao ±`half` có khe cổng (`gates`) + các đoạn tường thêm (`wallSegments`, có thể có cổng). Mỗi đoạn có va chạm.
 * `style: voi` → tường vôi + cổng trăng / cổng mái ngói (`kien_truc/tuong.ts`); mặc định `gach` = vân gạch như bản
 * gốc, cổng chỉ là khe trơn.
 */
export function addWalls(
  scene: THREE.Scene,
  colliders: Colliders,
  spec: Walls,
  extra: WallSegment[],
  style: SceneSpec['buildingStyle'],
  groundY?: GroundY,
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
      if (spec.style === 'dat') {
        // đất nện 夯土: lớp nện ngang + sọc lau sậy mảnh (tường Hán vùng Tây Bắc), không có viên gạch
        for (let y = 0; y < 8; y++) {
          g.fillStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.03})`;
          g.fillRect(0, y * 16, 256, 9);
          g.fillStyle = 'rgba(70,58,30,0.22)';
          g.fillRect(0, y * 16 + 14, 256, 1);
        }
        return;
      }
      for (let y = 0; y < 8; y++) {
        for (let x = -1; x < 8; x++) {
          g.fillStyle = `hsl(${spec.brickHue},${spec.brickSat - 5 + Math.random() * 10}%,${30 + Math.random() * 8}%)`;
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

  const stepped = groundY ? extra.filter((s) => s.follow) : [];
  for (const s of stepped) for (const r of segmentRuns(s, spec)) addFollowRun(scene, colliders, r, matFor(FOLLOW_STEP), capMat, groundY!);
  const flat = extra.filter((s) => !stepped.includes(s));
  for (const r of [...ringRuns(spec), ...flat.flatMap((s) => segmentRuns(s, spec))]) {
    const len = r.b - r.a;
    const mid = (r.a + r.b) / 2;
    const t = r.thickness;
    const [x, z, w, d] = r.axis === 'x' ? [mid, r.fixed, len, t] : [r.fixed, mid, t, len];
    // góc tường: hai đoạn chồng nhau một ô t × t → mặt ngoài trùng nhau, gạch lệch nhau chớp (L-10). Đoạn trục x dài thêm,
    // đoạn trục z ngắn lại CORNER_EPS mỗi đầu → ở góc chỉ còn mặt của đoạn x. Vật cản giữ đúng kích thước cũ.
    const [mw, md] = r.axis === 'x' ? [w + 2 * CORNER_EPS, d] : [w, d - 2 * CORNER_EPS];
    const m = new THREE.Mesh(new THREE.BoxGeometry(mw, r.height, md), matFor(len));
    m.position.set(x, r.height / 2, z);
    scene.add(m);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.35, d + 0.5), capMat);
    cap.position.set(x, r.height + 0.17, z);
    scene.add(cap);
    colliders.add(x, z, w, d);
  }
}

/** Lệch hình ở góc tường để hai đoạn không có mặt trùng (m) — L-10. */
export const CORNER_EPS = 0.005;

/** Tường bám đất: dài mỗi khúc (m). */
export const FOLLOW_STEP = 2;
/** Khúc tường chôn sâu dưới điểm thấp nhất của nó bao nhiêu (che khe khi đất dốc). */
const FOLLOW_SINK = 1.2;

/** Một khúc của tường bám đất: tâm dọc đoạn, đáy, đỉnh (đỉnh = đất cao nhất dưới khúc + cao tường). Thuần, không three. */
export interface FollowPiece {
  along: number;
  len: number;
  bottom: number;
  top: number;
}

/** Chia đoạn `r` thành các khúc ~`FOLLOW_STEP` m, mỗi khúc theo độ cao đất dưới nó. */
export function followPieces(r: Run, groundY: GroundY): FollowPiece[] {
  const n = Math.max(1, Math.round((r.b - r.a) / FOLLOW_STEP));
  const len = (r.b - r.a) / n;
  const at = (t: number): number => (r.axis === 'x' ? groundY(t, r.fixed) : groundY(r.fixed, t));
  return Array.from({ length: n }, (_, i) => {
    const a = r.a + i * len;
    const ys = [at(a), at(a + len / 2), at(a + len)];
    return { along: a + len / 2, len, bottom: Math.min(...ys) - FOLLOW_SINK, top: Math.max(...ys) + r.height };
  });
}

/** Dựng đoạn tường gạch bám đất: khúc nối khúc như bậc thang, mũ tường + răng cưa (垛口) trên mỗi khúc. */
function addFollowRun(
  scene: THREE.Scene,
  colliders: Colliders,
  r: Run,
  mat: THREE.Material,
  capMat: THREE.Material,
  groundY: GroundY,
): void {
  const t = r.thickness;
  const merlon = new THREE.BoxGeometry(0.5, 0.55, 0.3);
  for (const p of followPieces(r, groundY)) {
    const h = p.top - p.bottom;
    const [x, z, w, d] = r.axis === 'x' ? [p.along, r.fixed, p.len + 0.02, t] : [r.fixed, p.along, t, p.len + 0.02];
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, p.bottom + h / 2, z);
    scene.add(m);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.25, d + 0.2), capMat);
    cap.position.set(x, p.top + 0.12, z);
    scene.add(cap);
    // răng cưa hai mép trên: mỗi khúc 2 răng mỗi bên
    for (const side of [-1, 1]) {
      for (const k of [-0.25, 0.25]) {
        const mm = new THREE.Mesh(merlon, capMat);
        const off = side * (t / 2 - 0.05);
        if (r.axis === 'x') mm.position.set(x + k * p.len, p.top + 0.5, z + off);
        else {
          mm.position.set(x + off, p.top + 0.5, z + k * p.len);
          mm.rotation.y = Math.PI / 2;
        }
        scene.add(mm);
      }
    }
    colliders.add(x, z, w, d);
  }
}
