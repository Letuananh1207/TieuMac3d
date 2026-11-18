/**
 * Nấm Mẹ + Lò Thuốc Tiên (V-109, concept `design/concept/rung-nam-tien/cong-trinh.png`): thân nấm trắng ngà, mũ phẳng
 * hồng có giếng thang giữa, thang gỗ xoắn quanh thân (lan can dây thừng) lên mặt mũ; trên mũ: đỉnh đồng ba chân hai quai,
 * lửa nhỏ dưới bụng, khói tím cuộn thành cụm mây tròn, hũ sứ, bàn đá. Mặt mũ + thang đi được (`Pad` tầng trên — thang là
 * `helix`, mũ là tấm tròn khoét giếng); mép mũ, mép giếng, lan can thang chặn bằng hộp có khoảng cao (không rào thấy được
 * ở mép mũ — giữ dáng concept). Khối tĩnh Lambert → `mergeSoft` / `mergeStatic` gộp; khói + lửa `markDynamic`.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { dayNightTag, lambert } from './materials';
import { markDynamic } from './merge';
import { CAULDRON_R, motherStair, stairPoint, type MotherStair, type MushroomForestSpec } from './rungNamSpec';

type Colors = MushroomForestSpec['colors'];

/** Bậc thang: bước dọc thang (m ở giữa bậc), dày mặt bậc. */
const STEP_RUN = 0.62;
const STEP_THICK = 0.12;
/** Cung cuối thang (rad) mở ra mặt mũ: không lan can thang, không rào giếng. */
const EXIT_ARC = 0.55;
/** Chân thang (mặt bậc ≤ 0,6 m — bước lên được từ mọi phía): không lan can, vào thang từ chính diện. */
const FOOT_RISE = 0.6;
/** Số khói (mỗi cụm 3 quả cầu), chu kỳ bay lên (giây), cao tối đa trên nắp lò (m). */
const PUFFS = 7;
const PUFF_PERIOD = 10;
const PUFF_RISE = 9;
/** Cỡ lò so với khối dựng (∅ ≈ 4,4 m × hệ số; mép quai ≈ `CAULDRON_R`). */
const POT_SCALE = 1.25;

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Ống tròn qua các điểm (dây thừng, dầm) — ít mặt. */
function tube(points: THREE.Vector3[], r: number, mat: THREE.Material, g: THREE.Object3D): void {
  if (points.length < 2) return;
  const curve = new THREE.CatmullRomCurve3(points);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(4, points.length * 2), r, 4, false), mat));
}

/** Thân + mũ Nấm Mẹ (toạ độ cục bộ, gốc ở chân thân). Mũ là vành khăn: lỗ giữa bán kính `hole` = giếng thang; thân dừng ngang gầm mũ (nhìn xuống giếng thấy thang xoắn). */
function body(g: THREE.Group, m: MushroomForestSpec['mother'], hole: number, c: Colors): void {
  const h = m.h;
  const s = m.stem;
  const stem: [number, number][] = [
    [s * 1.3, -0.3],
    [s * 1.12, 0.4],
    [s * 1.02, 1.6],
    [s * 0.97, h * 0.45],
    [s * 1.0, h * 0.72],
    [s * 1.05, h - 1.65],
    [0, h - 1.65],
  ];
  put(g, new THREE.LatheGeometry(stem.map(([r, y]) => new THREE.Vector2(r, y)), 20), lambert(c.stem), 0, 0, 0);
  const R = m.cap;
  const cap: [number, number][] = [
    [hole, h - 1.7],
    [R * 0.55, h - 1.55],
    [R - 0.5, h - 1.25],
    [R, h - 0.7],
    [R - 0.15, h - 0.25],
    [R - 0.9, h],
    [hole + 0.3, h],
    [hole, h - 0.15],
    [hole, h - 1.7],
  ];
  put(g, new THREE.LatheGeometry(cap.map(([r, y]) => new THREE.Vector2(r, y)), 32), lambert(m.color), 0, 0, 0);
}

/** Thang xoắn: bậc gỗ, dầm ngoài, cột + dây thừng lan can (bỏ cung cuối ra mũ); rào dây quanh giếng trên mũ. */
function stairs(g: THREE.Group, m: MushroomForestSpec['mother'], st: MotherStair, c: Colors): void {
  const wood = lambert(c.wood);
  const rope = lambert(c.rope);
  const local = (t: number, r: number, dy = 0): THREE.Vector3 => {
    const [x, y, z] = stairPoint(st, t, r);
    return new THREE.Vector3(x - st.cx, y + dy, z - st.cz);
  };
  const rm = (st.r0 + st.r1) / 2;
  const n = Math.ceil((st.span * rm) / STEP_RUN);
  const width = st.r1 - st.r0 - 0.04;
  const depth = ((st.span * rm) / n) * 1.12;
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) / n) * st.span;
    const p = local(t, rm + 0.02, -STEP_THICK / 2);
    const step = put(g, new THREE.BoxGeometry(depth, STEP_THICK, width), wood, p.x, p.y, p.z);
    step.rotation.y = st.a0 + t;
  }
  // dầm ngoài đỡ bậc
  const beam: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) beam.push(local((i / n) * st.span, st.r1 - 0.06, -0.24));
  tube(beam, 0.08, wood, g);
  // lan can: cột mỗi 2 bậc + dây võng nhẹ trên đầu cột
  const postGeo = new THREE.CylinderGeometry(0.06, 0.07, 1, 5);
  const top: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i += 2) {
    const t = (i / n) * st.span;
    if (t > st.span - EXIT_ARC) break;
    if (t * st.rise < FOOT_RISE) continue;
    const p = local(t, st.r1 - 0.08);
    put(g, postGeo, wood, p.x, p.y + 0.45, p.z);
    top.push(p.clone().setY(p.y + 0.92));
  }
  tube(top, 0.035, rope, g);
  // rào dây quanh giếng trên mặt mũ, chừa cung ra
  const end = st.span;
  const rr = st.r1 + 0.15;
  const steps = Math.ceil((Math.PI * 2 * rr) / 0.9);
  const run: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = end + 0.05 + (i / steps) * (Math.PI * 2 - EXIT_ARC - 0.05);
    const a = st.a0 + t;
    const p = new THREE.Vector3(Math.sin(a) * rr, m.h, Math.cos(a) * rr);
    put(g, postGeo, wood, p.x, p.y + 0.45, p.z);
    run.push(p.clone().setY(p.y + 0.92));
  }
  tube(run, 0.035, rope, g);
}

/** Đỉnh đồng ba chân hai quai, nắp vòm có núm; gỉ ngọc ở mép miệng, quai; lửa + đá kê dưới bụng. Trả về lửa (lay). */
function cauldron(g: THREE.Group, c: Colors): THREE.Object3D {
  const bronze = lambert(c.bronze);
  const dark = lambert(new THREE.Color(c.bronze).multiplyScalar(0.78));
  const patina = lambert(c.patina);
  // ba chân (một chân nhìn ra sau, hai chân phía trước — như concept)
  for (const a of [Math.PI, Math.PI / 3, -Math.PI / 3]) {
    const leg = put(g, new THREE.CylinderGeometry(0.34, 0.26, 1.8, 7), bronze, Math.sin(a) * 1.3, 0.9, Math.cos(a) * 1.3);
    leg.rotation.set(Math.cos(a) * 0.12, 0, -Math.sin(a) * 0.12);
    put(g, new THREE.SphereGeometry(0.36, 7, 5).scale(1, 0.6, 1), dark, Math.sin(a) * 1.42, 0.12, Math.cos(a) * 1.42);
  }
  const belly: [number, number][] = [
    [0.01, 1.4],
    [1.0, 1.45],
    [1.7, 1.7],
    [2.12, 2.2],
    [2.28, 2.8],
    [2.18, 3.4],
    [1.95, 3.82],
    [2.05, 3.95],
  ];
  put(g, new THREE.LatheGeometry(belly.map(([r, y]) => new THREE.Vector2(r, y)), 18), bronze, 0, 0, 0);
  for (const y of [2.8]) put(g, new THREE.TorusGeometry(2.29, 0.06, 4, 18).rotateX(Math.PI / 2), dark, 0, y, 0);
  put(g, new THREE.TorusGeometry(2.02, 0.13, 5, 20).rotateX(Math.PI / 2), patina, 0, 3.97, 0);
  put(g, new THREE.SphereGeometry(1.92, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1), bronze, 0, 3.95, 0);
  put(g, new THREE.CylinderGeometry(0.16, 0.22, 0.3, 7), dark, 0, 5.0, 0);
  put(g, new THREE.SphereGeometry(0.34, 8, 6), bronze, 0, 5.3, 0);
  // hai quai dựng đứng trên miệng (đông – tây)
  for (const s of [-1, 1]) {
    for (const dz of [-0.42, 0.42]) put(g, new THREE.BoxGeometry(0.22, 1.25, 0.18), bronze, s * 1.95, 4.5, dz);
    put(g, new THREE.BoxGeometry(0.26, 0.24, 1.06), patina, s * 1.95, 5.15, 0);
  }
  // đá kê + lửa
  const stone = lambert('#8f8a90');
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    put(g, new THREE.IcosahedronGeometry(0.2, 0).scale(1, 0.6, 1), stone, Math.sin(a) * 0.62, 0.08, Math.cos(a) * 0.62);
  }
  const fire = new THREE.Group();
  const outer = new THREE.MeshBasicMaterial({ color: c.fire });
  const inner = new THREE.MeshBasicMaterial({ color: '#fff0a8' });
  dayNightTag(outer, 'bo');
  dayNightTag(inner, 'bo');
  put(fire, new THREE.ConeGeometry(0.48, 1.0, 6), outer, 0, 0.5, 0);
  put(fire, new THREE.ConeGeometry(0.26, 0.62, 5), inner, 0, 0.36, 0.06);
  fire.traverse((o) => markDynamic(o));
  g.add(fire);
  return fire;
}

/** Hũ sứ (bình thắt cổ) cao `h`. */
function jar(g: THREE.Group, color: string, h: number, x: number, z: number): void {
  const p: [number, number][] = [
    [0.01, 0],
    [0.32, 0.02],
    [0.42, 0.35],
    [0.36, 0.72],
    [0.2, 0.85],
    [0.24, 1],
    [0.01, 1],
  ];
  const s = h;
  put(g, new THREE.LatheGeometry(p.map(([r, y]) => new THREE.Vector2(r * s, y * s)), 9), lambert(color), x, 0, z);
}

/** Bàn đá tròn + hai ghế đôn. */
function table(g: THREE.Group, color: string, x: number, z: number): void {
  const m = lambert(color);
  put(g, new THREE.CylinderGeometry(0.9, 0.85, 0.14, 10), m, x, 0.78, z);
  put(g, new THREE.CylinderGeometry(0.28, 0.4, 0.72, 7), m, x, 0.36, z);
  for (const [dx, dz] of [
    [1.25, 0.5],
    [-0.3, 1.3],
  ]) put(g, new THREE.CylinderGeometry(0.32, 0.36, 0.45, 7), m, x + dx, 0.22, z + dz);
}

/** Khói: `PUFFS` cụm 3 quả cầu dùng chung một InstancedMesh, bay lên + nở to rồi tan, lệch dần theo gió. */
function smoke(scene: THREE.Scene, color: string, at: THREE.Vector3): (dt: number) => void {
  const parts = [
    [0, 0, 0, 1],
    [0.55, -0.15, 0.2, 0.72],
    [-0.45, -0.1, -0.25, 0.66],
  ].map(([x, y, z, r]) => new THREE.IcosahedronGeometry(r, 1).translate(x, y, z));
  const geo = mergeGeometries(parts);
  for (const p of parts) p.dispose();
  const mat = lambert(color, { emissive: color, emissiveIntensity: 0.18 });
  const mesh = new THREE.InstancedMesh(geo, mat, PUFFS);
  markDynamic(mesh);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  let time = 0;
  const update = (dt: number): void => {
    time += dt;
    for (let i = 0; i < PUFFS; i++) {
      const u = (time / PUFF_PERIOD + i / PUFFS) % 1;
      const grow = 0.35 + 1.25 * Math.sqrt(u);
      const fade = u > 0.82 ? Math.max(0, 1 - (u - 0.82) / 0.18) : Math.min(1, u / 0.06);
      v.set(at.x + Math.sin(u * 3 + i) * 0.6 + u * 2.2, at.y + u * PUFF_RISE, at.z - u * 1.2);
      q.setFromAxisAngle(sc.set(0, 1, 0), i * 1.7 + u);
      const s = grow * fade;
      m.compose(v, q, sc.set(s, s * 0.85, s));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return update;
}

/** Hộp chặn nhỏ (cạnh `size`) tại (x, z), chỉ khi chân ở khoảng cao [lo, hi] — rào vô hình / lan can. */
function block(colliders: Colliders, x: number, z: number, lo: number, hi: number, size = 0.3): void {
  colliders.add(x, z, size, size, 0, { minY: lo, maxY: hi });
}

/**
 * Dựng Nấm Mẹ + Lò Thuốc Tiên trên mặt đất cao `base` (tâm thân). Trả về tấm đi được (thang + mặt mũ, tầng trên) và
 * hàm cập nhật (khói, lửa).
 */
export function addMotherMushroom(
  scene: THREE.Scene,
  colliders: Colliders,
  f: MushroomForestSpec,
  base: number,
): { pads: Pad[]; update: (dt: number) => void } {
  const m = f.mother;
  const c = f.colors;
  const st = motherStair(m);
  const g = new THREE.Group();
  g.position.set(m.x, base, m.z);
  body(g, m, st.r1, c);
  stairs(g, m, st, c);
  // lò + đồ trên mũ (toạ độ cục bộ của nấm)
  const [ox, oz] = m.cauldron;
  const top = new THREE.Group();
  top.position.set(0, m.h, 0);
  g.add(top);
  const pot = new THREE.Group();
  pot.position.set(ox, 0, oz);
  pot.scale.setScalar(POT_SCALE);
  top.add(pot);
  const fire = cauldron(pot, c);
  const dir = Math.atan2(ox, oz); // hướng từ tâm nấm ra lò
  const side = (along: number, across: number): [number, number] => [ox + Math.sin(dir) * along + Math.cos(dir) * across, oz + Math.cos(dir) * along - Math.sin(dir) * across];
  const jars: [number, number, number, number][] = [
    [0.4, 3.8, 1.05, 0],
    [-1.0, 3.7, 0.85, 1],
    [1.5, 3.6, 0.75, 2],
    [-0.4, 4.6, 0.65, 0],
    [1.4, -3.8, 0.7, 2],
  ];
  for (const [al, ac, h, k] of jars) jar(top, c.jar[k], h, ...side(al, ac));
  const [tx, tz] = side(-0.8, -4.4);
  table(top, c.table, tx, tz);
  scene.add(g);

  // va chạm (toạ độ cảnh)
  const H = base + m.h;
  colliders.addCircle(m.x, m.z, m.stem);
  const wx = (lx: number, lz: number): [number, number] => [m.x + lx, m.z + lz];
  colliders.add(...wx(ox, oz), CAULDRON_R * 2, CAULDRON_R * 2, 0, { minY: H - 0.5, maxY: H + 2 });
  for (const [al, ac] of jars) block(colliders, ...wx(...side(al, ac)), H - 0.5, H + 2, 0.8);
  colliders.add(...wx(tx, tz), 2.4, 2.4, 0, { minY: H - 0.5, maxY: H + 2 });
  // mép mũ: rào vô hình
  const rim = m.cap - 0.7;
  const nRim = Math.ceil((Math.PI * 2 * rim) / 0.9);
  for (let i = 0; i < nRim; i++) {
    const a = (i / nRim) * Math.PI * 2;
    block(colliders, m.x + Math.sin(a) * rim, m.z + Math.cos(a) * rim, H - 0.6, H + 2, 0.4);
  }
  // mép giếng thang (trừ cung ra) + chắn ngang lối thang ngay sau bậc cuối
  const rr = st.r1 + 0.15;
  const nWell = Math.ceil((Math.PI * 2 * rr) / 0.7);
  for (let i = 0; i <= nWell; i++) {
    const t = st.span + 0.05 + (i / nWell) * (Math.PI * 2 - EXIT_ARC - 0.05);
    const [x, , z] = stairPoint(st, t, rr);
    block(colliders, x, z, H - 0.6, H + 2);
  }
  for (let r = st.r0 + 0.2; r <= st.r1; r += 0.4) {
    const [x, , z] = stairPoint(st, st.span + 0.14, r);
    block(colliders, x, z, H - 1.2, H + 2);
  }
  // lan can thang: mỗi bậc một cọc ở mép ngoài, chặn khi chân gần độ cao bậc đó (đứng dưới đất cạnh bậc thấp cũng bị chặn)
  const rm = (st.r0 + st.r1) / 2;
  const n = Math.ceil((st.span * (st.r1 - 0.1)) / 0.55);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * st.span;
    if (t > st.span - EXIT_ARC) break;
    if (t * st.rise < FOOT_RISE) continue;
    const [x, y, z] = stairPoint(st, t, st.r1 - 0.05);
    block(colliders, x, z, base + y - 2, base + y + 0.9);
  }
  // gầm thang thấp (mặt bậc 0,6–2,3 m): người dưới đất không chui vào
  for (let t = FOOT_RISE / st.rise; t <= 2.3 / st.rise; t += 0.4 / rm) {
    for (const r of [st.r0 + 0.5, rm, st.r1 - 0.4]) {
      const [x, , z] = stairPoint(st, t, r);
      block(colliders, x, z, -Infinity, base + 0.12, 0.5);
    }
  }

  const pads: Pad[] = [
    {
      minX: m.x - st.r1,
      maxX: m.x + st.r1,
      minZ: m.z - st.r1,
      maxZ: m.z + st.r1,
      y: base,
      upper: true,
      helix: { r0: st.r0, r1: st.r1, a0: st.a0, rise: st.rise, span: st.span },
    },
    { minX: m.x - m.cap, maxX: m.x + m.cap, minZ: m.z - m.cap, maxZ: m.z + m.cap, y: H, round: true, hole: st.r1, upper: true },
  ];

  const lidTop = new THREE.Vector3(m.x + ox, H + 5.4 * POT_SCALE, m.z + oz);
  const puffs = smoke(scene, c.smoke, lidTop);
  let t = 0;
  return {
    pads,
    update(dt) {
      t += dt;
      puffs(dt);
      const k = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
      fire.scale.set(1 + (k - 1) * 0.5, k, 1 + (k - 1) * 0.5);
    },
  };
}
