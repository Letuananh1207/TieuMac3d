/**
 * Tường vôi mái ngói (粉牆黛瓦) + cổng trăng (月洞門) + cửa sổ hoa — kiểu `walls.style: "voi"`.
 * Cổng trăng: vòm tròn đường kính = bề rộng khe, nhưng không cao quá tường (đỉnh vòm cách đỉnh tường ≥ 0,6 m — tường
 * thấp thì vòm thu nhỏ, tấm cổng vẫn che kín khe). Tâm vòm ở 0,6 bán kính trên mặt đất, nên lối đi qua được ở mặt đất
 * = dây cung = 1,6 × bán kính (khe 4 m, tường đủ cao → 3,2 m). Va chạm khớp đúng phần tường hai bên vòm.
 */
import * as THREE from 'three';
import type { Colliders } from '../../collision/colliders';
import { lambert } from '../materials';
import type { SceneSpec, WallGate } from '../spec';
import { ringRuns, segmentRun, type Run } from '../walls';
import { box, prism } from './hinh';
import { roofMat } from './mai';

type Walls = SceneSpec['walls'];
type Style = SceneSpec['buildingStyle'];

/** Mỗi bên khe, tấm cổng trăng lấn vào tường thêm bao nhiêu mét. */
const PAD = 1;
const ARC_LIFT = 0.6; // tâm vòm cao 0,6 r → dây cung mặt đất 0,8 × 2r
/** Khoảng tối thiểu từ đỉnh vòm tới đỉnh tường. */
const TOP_GAP = 0.6;

/** Bán kính vòm của khe rộng `width` trên tường cao `wallH`: nửa khe, thu lại cho đỉnh vòm vừa dưới tường. */
export const moonRadius = (width: number, wallH: number): number => Math.min(width / 2, (wallH - TOP_GAP) / (1 + ARC_LIFT));

/** Nửa bề rộng lối đi được ở mặt đất của vòm bán kính `r`. */
export const moonOpening = (r: number): number => Math.sqrt(1 - ARC_LIFT * ARC_LIFT) * r;

/** Nửa bề rộng tấm cổng = nửa khe + `PAD` (tường vòng bị cắt rộng đúng chừng ấy — `ringRuns(w, PAD)`). */
const moonHalf = (gate: WallGate): number => gate.width / 2 + PAD;

/** Một đoạn tường vôi: thân vôi, chân đá, mái ngói hai mái trên đỉnh, cửa sổ hoa cách nhau `windows` m. */
function plasterRun(g: THREE.Group, r: Run, w: Walls, style: Style): void {
  const len = r.b - r.a;
  const mid = (r.a + r.b) / 2;
  const run = new THREE.Group();
  if (r.axis === 'x') run.position.set(mid, 0, r.fixed);
  else {
    run.position.set(r.fixed, 0, mid);
    run.rotation.y = Math.PI / 2;
  }
  run.add(box(len, r.height, 1, w.color, 0, r.height / 2, 0));
  run.add(box(len, 0.5, 1.15, style.stone, 0, 0.25, 0));
  const cap = new THREE.Mesh(prism(len + 0.3, 1.5, 0.5), roofMat(w.capColor));
  cap.position.y = r.height;
  run.add(cap);
  if (w.windows > 0 && len > w.windows) {
    const n = Math.floor(len / w.windows);
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + (i + 0.5) * (len / n);
      run.add(box(1, 1, 1.14, style.timber, x, r.height * 0.58, 0));
      run.add(box(0.86, 0.08, 1.16, w.color, x, r.height * 0.58, 0));
      run.add(box(0.08, 0.86, 1.16, w.color, x, r.height * 0.58, 0));
    }
  }
  g.add(run);
}

/** Tấm tường có vòm trăng cho khe `gate`, đứng ở tâm khe. Trả về hai hộp va chạm hai bên vòm (theo hệ của run). */
function moonGate(g: THREE.Group, gate: WallGate, w: Walls, style: Style): void {
  const r = moonRadius(gate.width, w.height);
  const cy = ARC_LIFT * r;
  const c = moonOpening(r);
  const hw = moonHalf(gate);
  const h = Math.max(w.height, cy + r + 0.6);
  const start = Math.PI + Math.asin(ARC_LIFT); // điểm vòm chạm đất bên trái
  const end = -Math.asin(ARC_LIFT); // bên phải
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(-c, 0);
  shape.absarc(0, cy, r, start, end, true); // đi qua đỉnh vòm
  shape.lineTo(hw, 0);
  shape.lineTo(hw, h);
  shape.lineTo(-hw, h);
  shape.closePath();
  const panel = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, -0.55),
    lambert(w.color),
  );
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.14, 5, 24, Math.PI + 2 * Math.asin(ARC_LIFT)),
    lambert(style.stone),
  );
  rim.rotation.z = end;
  rim.position.y = cy;
  const cap = new THREE.Mesh(prism(2 * hw + 0.4, 1.6, 0.6), roofMat(w.capColor));
  cap.position.y = h;
  const foot = box(2 * hw, 0.5, 1.2, style.stone, 0, 0.25, 0);
  const grp = new THREE.Group();
  grp.add(panel, rim, cap);
  // chân đá chỉ ở hai bên vòm
  for (const s of [-1, 1]) {
    const f = foot.clone();
    f.scale.x = (hw - c) / (2 * hw);
    f.position.x = (s * (hw + c)) / 2;
    grp.add(f);
  }
  const half = w.half;
  if (gate.side === 'bac' || gate.side === 'nam') grp.position.set(gate.at, 0, gate.side === 'bac' ? -half : half);
  else {
    grp.position.set(gate.side === 'tay' ? -half : half, 0, gate.at);
    grp.rotation.y = Math.PI / 2;
  }
  g.add(grp);
}

/** Va chạm hai bên vòm của một cổng trăng (đoạn [at − hw, at − c] và [at + c, at + hw], hw = nửa tấm cổng). */
function moonColliders(colliders: Colliders, gate: WallGate, w: Walls): void {
  const half = w.half;
  const r = moonRadius(gate.width, w.height);
  const c = moonOpening(r);
  const len = moonHalf(gate) - c;
  for (const s of [-1, 1]) {
    const along = gate.at + s * (c + len / 2);
    if (gate.side === 'bac' || gate.side === 'nam') colliders.add(along, gate.side === 'bac' ? -half : half, len, 1);
    else colliders.add(gate.side === 'tay' ? -half : half, along, 1, len);
  }
}

export function addPlasterWalls(
  scene: THREE.Scene,
  colliders: Colliders,
  w: Walls,
  extra: SceneSpec['wallSegments'],
  style: Style,
): void {
  const g = new THREE.Group();
  for (const r of [...ringRuns(w, PAD), ...extra.map((s) => segmentRun(s, w.height))]) {
    plasterRun(g, r, w, style);
    const len = r.b - r.a;
    const mid = (r.a + r.b) / 2;
    if (r.axis === 'x') colliders.add(mid, r.fixed, len, 1);
    else colliders.add(r.fixed, mid, 1, len);
  }
  for (const gate of w.gates) {
    moonGate(g, gate, w, style);
    moonColliders(colliders, gate, w);
  }
  scene.add(g);
}
