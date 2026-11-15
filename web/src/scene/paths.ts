import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { GroundY } from './terrainHeight';
import { lambert } from './materials';
import { brickTexture, paveTileM } from './environment';
import type { PathSpec, SceneSpec } from './spec';
import { SLAB_TILE_M, slabTex } from './textures';

/** Lối lát nổi trên mặt đất (m): trên sân lát (0,03) và chất nền khu (0,04 — `terrain.ts`) → không chớp. */
export const PATH_LIFT = 0.05;

/** Sai lệch độ cao (m) cho phép khi bỏ bớt hàng điểm giữa (mặt đất phẳng / dốc đều → ít tam giác). */
const FLAT_TOL = 0.01;

/**
 * Chỉ số các hàng điểm cần giữ của một dải chia đều `rows.length` hàng (mỗi hàng các độ cao theo bề ngang): bỏ hàng giữa khi
 * mọi hàng nằm trên đường thẳng nối hai hàng giữ hai bên (sai ≤ `FLAT_TOL`). Đất phẳng → chỉ còn hai đầu.
 */
export function keepRows(rows: number[][]): number[] {
  const n = rows.length - 1;
  if (n <= 1) return n === 1 ? [0, 1] : [0];
  const kept = [0];
  let last = 0;
  for (let a = 1; a < n; a++) {
    const end = a + 1;
    let ok = true;
    for (let m = last + 1; m < end && ok; m++) {
      const t = (m - last) / (end - last);
      for (let b = 0; b < rows[m].length; b++) {
        if (Math.abs(rows[m][b] - (rows[last][b] + (rows[end][b] - rows[last][b]) * t)) > FLAT_TOL) {
          ok = false;
          break;
        }
      }
    }
    if (!ok) {
      kept.push(a);
      last = a;
    }
  }
  kept.push(n);
  return kept;
}

/**
 * Lối lát đá: dải hơi nổi trên mặt sân (không đè hình nhau), không va chạm. Có địa hình: lưới bám theo độ cao mặt đất
 * (`groundY`) — lấy mẫu từng mét, bỏ hàng giữa ở chỗ đất phẳng / dốc đều — lên xuống bục, gờ, dốc theo đất (L-3).
 * `pave` (đặc tả `buildingStyle.pathLook: "san"`): mặt lối là gạch của sân lát, UV theo toạ độ cảnh như sân
 * (`terrain.ts` `addPaving`) → lối chạy trên sân không lộ mạch lệch; bỏ qua màu `path` / `color` từng lối.
 */
export function addPaths(
  scene: THREE.Scene,
  paths: PathSpec[],
  defaultColor: string,
  groundY: GroundY = () => 0,
  pave?: SceneSpec['ground'],
): void {
  const base = new Map<string, THREE.CanvasTexture>();
  const paveTex = pave ? brickTexture(pave) : null;
  const paveTile = pave ? paveTileM(pave) : 1;
  // `pave`: mọi lối cùng một ảnh, UV theo toạ độ cảnh → chỗ hai lối chồng nhau vẽ ra y hệt, không cần vật liệu riêng từng
  // lối để xếp lớp. Gộp hết vào MỘT khối (V-42: trước đây mỗi lối một draw call — tông môn 16 lối = 16 draw call).
  const paveGeos: THREE.BufferGeometry[] = [];
  paths.forEach((p, i) => {
    const color = p.color ?? defaultColor;
    let tex = paveTex ?? base.get(color);
    if (!tex) {
      tex = slabTex(color); // phiến đá so le, mép vát (2026-11-13)
      base.set(color, tex);
    }
    const [x1, z1] = p.from;
    const [x2, z2] = p.to;
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 0.01) return;
    // units −2: nhìn thẳng từ trên (độ dốc sâu ≈ 0) lối vẫn nằm trên sân lát và trên chất nền khu (`terrain.floors`, units −1)
    const mat = pave ? null : lambert(0xffffff, { map: tex, polygonOffset: true, polygonOffsetFactor: -1 - i * 0.01, polygonOffsetUnits: -2 });
    const lift = PATH_LIFT + i * 0.001;
    const dx = (x2 - x1) / len;
    const dz = (z2 - z1) / len;
    const nx = dz; // vuông góc với hướng lối
    const nz = -dx;
    const segs = Math.max(1, Math.ceil(len));
    const across = 2;
    const at = (a: number, b: number): [number, number, number] => {
      const o = (b / across - 0.5) * p.width;
      const t = (a / segs) * len;
      return [x1 + dx * t + nx * o, z1 + dz * t + nz * o, t];
    };
    const rows: number[][] = [];
    for (let a = 0; a <= segs; a++) {
      const r: number[] = [];
      for (let b = 0; b <= across; b++) {
        const [x, z] = at(a, b);
        r.push(groundY(x, z));
      }
      rows.push(r);
    }
    const kept = keepRows(rows);
    const pos: number[] = [];
    const uv: number[] = [];
    for (const a of kept) {
      for (let b = 0; b <= across; b++) {
        const [x, z, t] = at(a, b);
        pos.push(x, rows[a][b] + lift, z);
        if (pave) uv.push(x / paveTile, -z / paveTile);
        else uv.push(((b / across) * p.width) / SLAB_TILE_M, t / SLAB_TILE_M);
      }
    }
    const idx: number[] = [];
    const w = across + 1;
    for (let a = 0; a < kept.length - 1; a++) {
      for (let b = 0; b < across; b++) {
        const q = a * w + b;
        idx.push(q, q + w, q + 1, q + 1, q + w, q + w + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    if (geo.getAttribute('normal').getY(0) < 0) {
      // mặt luôn hướng lên: đảo chiều mọi tam giác
      for (let k = 0; k < idx.length; k += 3) [idx[k + 1], idx[k + 2]] = [idx[k + 2], idx[k + 1]];
      geo.setIndex(idx);
      geo.computeVertexNormals();
    }
    if (pave) paveGeos.push(geo);
    else scene.add(new THREE.Mesh(geo, mat!));
  });
  if (paveGeos.length) {
    const merged = mergeGeometries(paveGeos);
    for (const g of paveGeos) g.dispose();
    if (merged) scene.add(new THREE.Mesh(merged, lambert(0xffffff, { map: paveTex!, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 })));
  }
}

/* ---------- bó vỉa đá (V-44) ---------- */

/** Hình chữ nhật xoay: tâm, hướng dọc (đơn vị), nửa dài, nửa rộng. */
interface Rect {
  cx: number;
  cz: number;
  ux: number;
  uz: number;
  hl: number;
  hw: number;
}

type Span = [number, number];

const pathRect = (p: PathSpec): Rect | null => {
  const len = Math.hypot(p.to[0] - p.from[0], p.to[1] - p.from[1]);
  if (len < 0.01) return null;
  return {
    cx: (p.from[0] + p.to[0]) / 2,
    cz: (p.from[1] + p.to[1]) / 2,
    ux: (p.to[0] - p.from[0]) / len,
    uz: (p.to[1] - p.from[1]) / len,
    hl: len / 2,
    hw: p.width / 2,
  };
};

const boxRect = (from: [number, number], to: [number, number]): Rect => ({
  cx: (from[0] + to[0]) / 2,
  cz: (from[1] + to[1]) / 2,
  ux: 1,
  uz: 0,
  hl: Math.abs(to[0] - from[0]) / 2,
  hw: Math.abs(to[1] - from[1]) / 2,
});

/** Khoảng tham số t ∈ [0, len] của đoạn p0 + t·d nằm hẳn trong hình (mép chung không tính là trong). */
function spanIn(r: Rect, x0: number, z0: number, dx: number, dz: number, len: number): Span | null {
  const eps = 1e-3;
  let lo = 0;
  let hi = len;
  // trục dọc (u) và trục ngang (n = (uz, −ux)) của hình
  for (const [ax, az, h] of [
    [r.ux, r.uz, r.hl],
    [r.uz, -r.ux, r.hw],
  ] as const) {
    const a0 = (x0 - r.cx) * ax + (z0 - r.cz) * az;
    const da = dx * ax + dz * az;
    const H = h - eps;
    if (H <= 0) return null;
    if (Math.abs(da) < 1e-9) {
      if (Math.abs(a0) >= H) return null;
      continue;
    }
    let t1 = (-H - a0) / da;
    let t2 = (H - a0) / da;
    if (t1 > t2) [t1, t2] = [t2, t1];
    lo = Math.max(lo, t1);
    hi = Math.min(hi, t2);
    if (lo >= hi) return null;
  }
  return [lo, hi];
}

function union(spans: Span[]): Span[] {
  const s = [...spans].sort((a, b) => a[0] - b[0]);
  const out: Span[] = [];
  for (const [a, b] of s) {
    const last = out[out.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

/** `from` trừ đi các khoảng `cut` (đã gộp). */
function subtract(from: Span[], cut: Span[]): Span[] {
  let cur = from;
  for (const [c0, c1] of cut) {
    const next: Span[] = [];
    for (const [a, b] of cur) {
      if (c1 <= a || c0 >= b) next.push([a, b]);
      else {
        if (c0 > a) next.push([a, c0]);
        if (c1 < b) next.push([c1, b]);
      }
    }
    cur = next;
  }
  return cur;
}

const spansOf = (rects: Rect[], x0: number, z0: number, dx: number, dz: number, len: number): Span[] =>
  union(rects.map((r) => spanIn(r, x0, z0, dx, dz, len)).filter((s): s is Span => s !== null));

/** Một đường bó vỉa: tâm gờ chạy từ (x0, z0) theo hướng (dx, dz) dài `len`, các khoảng `[a, b]` được dựng. */
export interface CurbRun {
  x0: number;
  z0: number;
  dx: number;
  dz: number;
  spans: Span[];
}

/**
 * Các đường bó vỉa của cảnh (chưa dựng hình — để kiểm / test): hai mép ngoài mỗi lối (`edge` khác `false`) và mép trong
 * mỗi bục lát `edge: true`. Chừa chỗ: lối khác cắt vào; lối chạy trên sân lát (bục `pave`) cùng gạch — trừ chỗ có chất nền
 * khu (`terrain.floors`) khác màu thì vẫn có gờ; bục: chỗ lối vào, chỗ liền bục lát khác / chất nền.
 */
export function curbRuns(spec: SceneSpec): CurbRun[] {
  const cw = spec.buildingStyle.pathEdge.width;
  if (cw <= 0) return [];
  const paths = spec.paths;
  const pRects = paths.map(pathRect);
  const pave = spec.terrain.enabled ? spec.terrain.plateaus.filter((p) => p.pave) : [];
  const paveRects = pave.map((p) => boxRect(p.from, p.to));
  const floorRects = spec.terrain.enabled ? spec.terrain.floors.map((f) => boxRect(f.from, f.to)) : [];
  const runs: CurbRun[] = [];
  const line = (x0: number, z0: number, x1: number, z1: number, block: (x0: number, z0: number, dx: number, dz: number, len: number) => Span[]): void => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (len < 0.05) return;
    const dx = (x1 - x0) / len;
    const dz = (z1 - z0) / len;
    const spans = subtract([[0, len]], block(x0, z0, dx, dz, len)).filter(([a, b]) => b - a > 0.05);
    if (spans.length) runs.push({ x0, z0, dx, dz, spans });
  };
  paths.forEach((p, i) => {
    const r = pRects[i];
    if (!r || p.edge === false) return;
    const others = pRects.filter((q, j): q is Rect => q !== null && j !== i);
    const block = (x0: number, z0: number, dx: number, dz: number, len: number): Span[] =>
      union([
        ...spansOf(others, x0, z0, dx, dz, len),
        ...subtract(spansOf(paveRects, x0, z0, dx, dz, len), spansOf(floorRects, x0, z0, dx, dz, len)),
      ]);
    const nx = r.uz; // pháp tuyến ngang lối
    const nz = -r.ux;
    for (const s of [-1, 1]) {
      const o = s * (r.hw + cw / 2);
      line(p.from[0] + nx * o, p.from[1] + nz * o, p.to[0] + nx * o, p.to[1] + nz * o, block);
    }
  });
  pave.forEach((p, i) => {
    if (!p.edge) return;
    const others = paveRects.filter((_, j) => j !== i);
    const block = (x0: number, z0: number, dx: number, dz: number, len: number): Span[] =>
      union([
        ...spansOf(pRects.filter((q): q is Rect => q !== null), x0, z0, dx, dz, len),
        ...spansOf(others, x0, z0, dx, dz, len),
        ...spansOf(floorRects, x0, z0, dx, dz, len),
      ]);
    const x0 = Math.min(p.from[0], p.to[0]) + cw / 2;
    const x1 = Math.max(p.from[0], p.to[0]) - cw / 2;
    const z0 = Math.min(p.from[1], p.to[1]) + cw / 2;
    const z1 = Math.max(p.from[1], p.to[1]) - cw / 2;
    // bốn cạnh nối đầu ở tâm góc: hai gờ gặp nhau thành góc vuông kín (phần chồng ở góc cùng mặt → nâng nhẹ một cạnh)
    line(x0 - cw / 2, z0, x1 + cw / 2, z0, block);
    line(x0 - cw / 2, z1, x1 + cw / 2, z1, block);
    line(x0, z0 + cw / 2, x0, z1 - cw / 2, block);
    line(x1, z0 + cw / 2, x1, z1 - cw / 2, block);
  });
  return runs;
}

/** Dựng bó vỉa (`curbRuns`) thành một khối gờ thấp: mặt trên + hai mặt bên + hai đầu; bám mặt đất, đất phẳng thì ít tam giác. */
export function addCurbs(scene: THREE.Scene, spec: SceneSpec, groundY: GroundY = () => 0): void {
  const runs = curbRuns(spec);
  if (!runs.length) return;
  const { width: cw, height, color } = spec.buildingStyle.pathEdge;
  const pos: number[] = [];
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  /** tứ giác a b c d; đảo chiều nếu mặt không quay về hướng `want` (mặt trước = ngược chiều kim đồng hồ nhìn từ ngoài) */
  const quad = (a: number[], b: number[], c: number[], d: number[], want: [number, number, number]): void => {
    e1.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    e2.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const n = e1.cross(e2);
    if (n.x * want[0] + n.y * want[1] + n.z * want[2] >= 0) pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    else pos.push(...a, ...c, ...b, ...a, ...d, ...c);
  };
  runs.forEach((run, k) => {
    const nx = run.dz; // ngang gờ
    const nz = -run.dx;
    const top = PATH_LIFT + height + (k % 2) * 0.004; // hai gờ chồng ở góc: lệch nhẹ độ cao → không chớp
    for (const [a, b] of run.spans) {
      const segs = Math.max(1, Math.ceil(b - a));
      const rows: number[][] = [];
      const pts: [number, number][] = [];
      for (let i = 0; i <= segs; i++) {
        const t = a + ((b - a) * i) / segs;
        const x = run.x0 + run.dx * t;
        const z = run.z0 + run.dz * t;
        pts.push([x, z]);
        rows.push([groundY(x - (nx * cw) / 2, z - (nz * cw) / 2), groundY(x + (nx * cw) / 2, z + (nz * cw) / 2)]);
      }
      const kept = keepRows(rows);
      const corner = (i: number, side: number, up: boolean): number[] => {
        const [x, z] = pts[i];
        const y = rows[i][side < 0 ? 0 : 1];
        return [x + (side * nx * cw) / 2, up ? y + top : y - 0.02, z + (side * nz * cw) / 2];
      };
      for (let q = 0; q < kept.length - 1; q++) {
        const i = kept[q];
        const j = kept[q + 1];
        quad(corner(i, -1, true), corner(j, -1, true), corner(j, 1, true), corner(i, 1, true), [0, 1, 0]); // mặt trên
        quad(corner(i, -1, false), corner(j, -1, false), corner(j, -1, true), corner(i, -1, true), [-nx, 0, -nz]); // mặt bên
        quad(corner(i, 1, true), corner(j, 1, true), corner(j, 1, false), corner(i, 1, false), [nx, 0, nz]); // mặt bên kia
      }
      const f = kept[0];
      const l = kept[kept.length - 1];
      quad(corner(f, 1, false), corner(f, -1, false), corner(f, -1, true), corner(f, 1, true), [-run.dx, 0, -run.dz]); // đầu gờ
      quad(corner(l, -1, false), corner(l, 1, false), corner(l, 1, true), corner(l, -1, true), [run.dx, 0, run.dz]);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals(); // không chỉ số → pháp tuyến từng mặt (gờ vuông cạnh)
  scene.add(new THREE.Mesh(geo, lambert(color)));
}
