/**
 * Chợ Đêm Đèn Hoa (V-108, concept `design/concept/cho-dem-den-hoa/`, đặc tả `choDemSpec.ts`): Cây Đèn Trăm Tầng trên
 * đài đá bát giác, sạp chợ mái vải, bến gỗ có đèn. Khối low-poly đứng yên — `mergeStatic` / `mergeSoft` gộp theo vật liệu
 * (cả trăm đèn lồng cùng một vật liệu → 1 draw call). Đèn lồng là lòng đèn tự sáng (`lampMaterial` — không đèn thật, không
 * bóng); dưới cây một đĩa sáng ấm mờ trên mặt sân thay vầng sáng đèn (không PointLight). Trả về chỗ đặt quầng giả
 * (`quangDen.ts`) và các tấm đi được (đài cây đèn).
 */
import * as THREE from 'three';
import type { Pad } from '../collision/ground';
import type { Colliders } from '../collision/colliders';
import type { LanternTreeSpec, PierSpec, StallSpec } from './choDemSpec';
import { box, column } from './kien_truc/hinh';
import { currentLampGlow, isLampDynamic, lambert, lampMaterial } from './materials';
import type { SceneSpec } from './spec';
import type { GroundY } from './terrainHeight';
import { makeCanvasTex } from './textures';

/** Đài: cao mỗi bậc, bề rộng bậc dưới, cao lan can (m). */
const STEP_H = 0.25;
const STEP_W = 0.6;
const RAIL_H = 0.75;
/** Lối bậc phía +z: bề ngang (m). */
const STAIR_W = 3.2;
/** Bệ giữa: hai tầng bát giác quanh chân trục. */
const PLINTH: [number, number][] = [
  [1.5, 0.4],
  [1.05, 0.4],
];
const POLE_R = 0.32;
/** Vòng đèn dưới cùng / trên cùng cách chân, đỉnh trục bao nhiêu (m). */
const TIER_FROM = 3.6;
const TIER_TOP_GAP = 1.6;
/** Đèn lồng tròn trên cây: bán kính, treo dưới vòng (m). */
const LANTERN_R = 0.42;
const LANTERN_DROP = 0.55;
/** Mỗi bao nhiêu đèn lồng trên cây thì có một quầng giả (quầng cộng màu tốn điểm ảnh — giữ ít). */
const GLOW_EVERY = 4;
/** Đĩa sáng ấm trên sân quanh cây: bán kính = `baseRadius` × hệ số; độ đậm lúc đèn sáng hẳn. */
const POOL_SCALE = 1.9;
const POOL_OPACITY = 0.32;
/** Sạp: rộng × sâu (m), cao cột trước / sau. */
const STALL_W = 2.6;
const STALL_D = 1.8;
const STALL_FRONT_H = 2.05;
const STALL_BACK_H = 2.35;

export interface ChoDem {
  /** tâm các đèn có quầng giả */
  glow: THREE.Vector3[];
  /** mặt đi được (đài cây đèn) */
  pads: Pad[];
}

/** Một hình bát giác đứng (mặt phẳng quay ra +z). */
function octagon(r: number, h: number, color: string, x: number, y0: number, z: number): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(r, r, h, 8).rotateY(Math.PI / 8);
  const m = new THREE.Mesh(geo, lambert(color));
  m.position.set(x, y0 + h / 2, z);
  return m;
}

/** Góc bát giác thứ `i` (mặt phẳng quay ra +z → góc ở ±22,5° quanh +z). */
const corner = (r: number, i: number): [number, number] => {
  const a = Math.PI / 8 + (i * Math.PI) / 4;
  return [Math.sin(a) * r, Math.cos(a) * r];
};

const lanternGeo = new THREE.SphereGeometry(LANTERN_R, 8, 5).scale(1, 1.15, 1);

function addLanternTree(g: THREE.Group, colliders: Colliders, t: LanternTreeSpec, spec: SceneSpec, y0: number, glow: THREE.Vector3[], pads: Pad[]): void {
  const st = spec.choDemStyle;
  const { x, z, baseRadius: R } = t;
  // đài hai bậc + lối bậc phía +z
  g.add(octagon(R, STEP_H, st.stone, x, y0, z));
  g.add(octagon(R - STEP_W, STEP_H, st.stone, x, y0 + STEP_H, z));
  g.add(box(STAIR_W, STEP_H / 2, 0.5, st.stone, x, y0 + STEP_H / 4, z + R * Math.cos(Math.PI / 8) + 0.2));
  const top = y0 + 2 * STEP_H;
  pads.push({ minX: x - (R - STEP_W), maxX: x + (R - STEP_W), minZ: z - (R - STEP_W), maxZ: z + (R - STEP_W), y: top, round: true });
  pads.push({ minX: x - R, maxX: x + R, minZ: z - R, maxZ: z + R, y: y0 + STEP_H, round: true });
  // lan can đá quanh mép bậc trên, chừa cạnh phía +z (lối lên)
  const rr = R - STEP_W - 0.25;
  for (let i = 0; i < 8; i++) {
    const [ax, az] = corner(rr, i);
    const [bx, bz] = corner(rr, i + 1);
    const mid: [number, number] = [(ax + bx) / 2, (az + bz) / 2];
    const front = mid[1] > rr * 0.85; // cạnh phẳng quay ra +z
    g.add(box(0.22, RAIL_H + 0.15, 0.22, st.rail, x + ax, top + (RAIL_H + 0.15) / 2, z + az));
    if (front) continue;
    const len = Math.hypot(bx - ax, bz - az);
    const rail = box(len, 0.12, 0.14, st.rail, x + mid[0], top + RAIL_H, z + mid[1]);
    rail.rotation.y = Math.atan2(-(bz - az), bx - ax);
    g.add(rail);
    const panel = box(len - 0.3, RAIL_H - 0.35, 0.08, st.rail, x + mid[0], top + (RAIL_H - 0.35) / 2 + 0.08, z + mid[1]);
    panel.rotation.y = rail.rotation.y;
    g.add(panel);
    for (let k = 0; k <= 4; k++) colliders.addCircle(x + ax + ((bx - ax) * k) / 4, z + az + ((bz - az) * k) / 4, 0.3);
  }
  // bệ giữa + trục son
  let py = top;
  for (const [r, h] of PLINTH) {
    g.add(octagon(r, h, st.stone, x, py, z));
    py += h;
  }
  colliders.addCircle(x, z, PLINTH[0][0] + 0.1);
  g.add(column(POLE_R, y0 + t.height - py, st.pole, x, py, z, 8));
  // các vòng đèn: vòng son + 8 nan + đèn lồng treo dưới vòng
  const lantern = lampMaterial(st.lantern); // một vật liệu cho mọi đèn — gộp còn 1 draw call
  const capGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.08, 6);
  const tasselGeo = new THREE.BoxGeometry(0.05, 0.22, 0.05);
  const capMat = lambert(st.trim);
  const y1 = y0 + t.height - TIER_TOP_GAP;
  const spacing = t.spacing ?? 1.05;
  let count = 0;
  for (let i = 0; i < t.tiers; i++) {
    const k = t.tiers > 1 ? i / (t.tiers - 1) : 0;
    const r = t.bottomRadius + (t.topRadius - t.bottomRadius) * k;
    const ty = y0 + TIER_FROM + (y1 - y0 - TIER_FROM) * k;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 4, 28).rotateX(Math.PI / 2), lambert(st.pole));
    ring.position.set(x, ty, z);
    g.add(ring);
    for (let s = 0; s < 8; s++) {
      const a = (s * Math.PI) / 4;
      const spoke = box(0.07, 0.07, r, st.pole, x + (Math.sin(a) * r) / 2, ty, z + (Math.cos(a) * r) / 2);
      spoke.rotation.y = a;
      g.add(spoke);
    }
    const n = Math.max(6, Math.round((2 * Math.PI * r) / spacing));
    for (let j = 0; j < n; j++) {
      const a = ((j + (i % 2) * 0.5) / n) * Math.PI * 2;
      const lx = x + Math.sin(a) * r;
      const lz = z + Math.cos(a) * r;
      const ly = ty - LANTERN_DROP;
      const body = new THREE.Mesh(lanternGeo, lantern);
      body.position.set(lx, ly, lz);
      g.add(body);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(lx, ly + LANTERN_R * 1.15, lz);
      g.add(cap);
      const tassel = new THREE.Mesh(tasselGeo, capMat);
      tassel.position.set(lx, ly - LANTERN_R * 1.15 - 0.12, lz);
      g.add(tassel);
      if (count++ % GLOW_EVERY === 0) glow.push(body.position.clone());
    }
  }
  // đỉnh: đèn hoa sen — hai vòng cánh nghiêng ra + nụ giữa, cùng tự sáng
  const lotusY = y0 + t.height;
  const lotus = lampMaterial(st.lotus);
  const petalGeo = new THREE.ConeGeometry(0.7, 2, 4).scale(1, 1, 0.35);
  for (const [ring, n, tilt, len] of [
    [0.8, 10, 1.0, 1],
    [0.45, 8, 0.5, 0.85],
  ] as const) {
    for (let j = 0; j < n; j++) {
      const a = ((j + (ring < 0.5 ? 0.5 : 0)) / n) * Math.PI * 2;
      const p = new THREE.Mesh(petalGeo, lotus);
      p.scale.setScalar(len);
      p.position.set(x + Math.sin(a) * ring, lotusY + 0.9 * len, z + Math.cos(a) * ring);
      p.rotation.set(tilt, a, 0, 'YXZ');
      g.add(p);
    }
  }
  const bud = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 5).scale(1, 1.3, 1), lotus);
  bud.position.set(x, lotusY + 0.8, z);
  g.add(bud);
  g.add(octagon(0.8, 0.3, st.pole, x, lotusY - 0.1, z));
  glow.push(bud.position.clone(), new THREE.Vector3(x, lotusY + 1.6, z));
  addLightPool(g, x, y0, z, R * POOL_SCALE, st.lantern);
}

/** Đĩa sáng ấm mờ trên sân quanh cây đèn — đổi độ đậm theo giờ như tấm sáng cửa sổ (`userData.lampOpacity`). */
function addLightPool(g: THREE.Group, x: number, y: number, z: number, r: number, color: string): void {
  const tex = makeCanvasTex(64, 64, (c, w, h) => {
    const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
  });
  const mat = new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  if (isLampDynamic()) {
    mat.userData.lampOpacity = POOL_OPACITY;
    mat.opacity = 0;
    mat.visible = false;
  } else {
    mat.opacity = POOL_OPACITY * currentLampGlow();
    mat.visible = currentLampGlow() > 0;
  }
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), mat);
  disc.position.set(x, y + 0.04, z);
  disc.renderOrder = 1;
  g.add(disc);
}

/** Sạp chợ (hệ sạp: mặt trước +z) — cột, mái vải dốc ra trước + diềm, quầy + hàng, thùng gỗ, hai đèn nhỏ góc trước. */
function addStall(g: THREE.Group, colliders: Colliders, s: StallSpec, spec: SceneSpec, y0: number, glow: THREE.Vector3[], seed: number): void {
  const st = spec.choDemStyle;
  const cloth = st.awnings[s.color ?? 0];
  const rot = ((s.rotY ?? 0) * Math.PI) / 180;
  const sg = new THREE.Group();
  sg.position.set(s.x, y0, s.z);
  sg.rotation.y = rot;
  const hw = STALL_W / 2 - 0.1;
  const hd = STALL_D / 2 - 0.1;
  for (const sx of [-1, 1]) {
    sg.add(column(0.07, STALL_FRONT_H, st.wood, sx * hw, 0, hd, 6));
    sg.add(column(0.07, STALL_BACK_H, st.wood, sx * hw, 0, -hd, 6));
  }
  // mái vải: tấm nghiêng từ sau cao xuống trước thấp, nhô ra trước 0,35 m; diềm rủ ở mép trước và hai bên
  const roofD = STALL_D + 0.5;
  const slope = Math.atan2(STALL_BACK_H - STALL_FRONT_H, STALL_D);
  const roof = box(STALL_W + 0.4, 0.06, roofD / Math.cos(slope), cloth, 0, (STALL_FRONT_H + STALL_BACK_H) / 2 + 0.06, 0.1);
  roof.rotation.x = slope;
  sg.add(roof);
  sg.add(box(STALL_W + 0.4, 0.34, 0.04, cloth, 0, STALL_FRONT_H - 0.12, hd + 0.45));
  for (const sx of [-1, 1]) {
    const side = box(0.04, 0.24, roofD / Math.cos(slope) - 0.1, cloth, sx * (STALL_W / 2 + 0.18), (STALL_FRONT_H + STALL_BACK_H) / 2 - 0.08, 0.1);
    side.rotation.x = slope;
    sg.add(side);
  }
  // quầy + mặt ván + hàng bày
  sg.add(box(STALL_W - 0.3, 0.72, 0.7, st.counter, 0, 0.36, hd - 0.3));
  sg.add(box(STALL_W - 0.2, 0.06, 0.8, st.wood, 0, 0.75, hd - 0.3));
  for (let i = 0; i < 3; i++) {
    const c = st.goods[(i + seed) % 3];
    const w = 0.35 + ((i + seed) % 2) * 0.15;
    sg.add(box(w, 0.18 + (i % 2) * 0.1, 0.32, c, -0.75 + i * 0.75, 0.87 + (i % 2) * 0.05, hd - 0.3));
  }
  sg.add(box(0.5, 0.45, 0.45, st.wood, hw + 0.45, 0.225, hd - 0.2));
  sg.add(box(STALL_W - 0.4, 0.06, 0.4, st.wood, 0, 1.3, -hd + 0.15)); // kệ sau
  // hai đèn lồng nhỏ treo ở góc trước dưới mái
  const lamp = lampMaterial(st.lantern);
  const small = new THREE.SphereGeometry(0.17, 6, 4).scale(1, 1.2, 1);
  for (const sx of [-1, 1]) {
    const l = new THREE.Mesh(small, lamp);
    l.position.set(sx * (hw - 0.15), STALL_FRONT_H - 0.5, hd + 0.3);
    sg.add(l);
    sg.updateMatrixWorld(true);
    if (sx > 0) glow.push(l.getWorldPosition(new THREE.Vector3()));
  }
  g.add(sg);
  const turned = Math.round(s.rotY ?? 0) % 180 !== 0;
  colliders.add(s.x, s.z, turned ? STALL_D : STALL_W, turned ? STALL_W : STALL_D);
}

/** Bến gỗ: sàn ván trên mặt nước từ bờ ra theo +z (hệ bến), cọc dưới sàn, hai cột đèn ở đầu xa. */
function addPier(g: THREE.Group, p: PierSpec, spec: SceneSpec, bankY: number, glow: THREE.Vector3[]): void {
  const st = spec.choDemStyle;
  const pg = new THREE.Group();
  const deck = bankY - (p.sunk ?? 0) + 0.3;
  pg.position.set(p.x, 0, p.z);
  pg.rotation.y = ((p.rotY ?? 0) * Math.PI) / 180;
  const lamps: THREE.Mesh[] = [];
  pg.add(box(p.width, 0.12, p.length, st.wood, 0, deck, p.length / 2));
  for (let k = 1; k <= 3; k++) pg.add(box(p.width + 0.06, 0.03, 0.08, st.counter, 0, deck + 0.07, (p.length * k) / 4));
  for (const sx of [-1, 1]) {
    for (const zz of [p.length * 0.45, p.length - 0.15]) pg.add(column(0.1, 1.1, st.wood, sx * (p.width / 2 - 0.1), deck - 1, zz, 6));
    pg.add(column(0.06, 1.1, st.wood, sx * (p.width / 2 - 0.1), deck, p.length - 0.15, 6));
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.24), lampMaterial(st.lantern));
    l.position.set(sx * (p.width / 2 - 0.1), deck + 1.3, p.length - 0.15);
    pg.add(l);
    lamps.push(l);
    pg.add(box(0.3, 0.05, 0.3, st.trim, sx * (p.width / 2 - 0.1), deck + 1.48, p.length - 0.15));
  }
  g.add(pg);
  pg.updateMatrixWorld(true);
  for (const l of lamps) glow.push(l.getWorldPosition(new THREE.Vector3()));
}

export function addChoDem(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, groundY?: GroundY): ChoDem {
  const glow: THREE.Vector3[] = [];
  const pads: Pad[] = [];
  if (!spec.lanternTrees.length && !spec.stalls.length && !spec.piers.length) return { glow, pads };
  const ground = (x: number, z: number): number => (groundY ? groundY(x, z) : 0);
  const g = new THREE.Group();
  scene.add(g);
  for (const t of spec.lanternTrees) addLanternTree(g, colliders, t, spec, ground(t.x, t.z), glow, pads);
  spec.stalls.forEach((s, i) => addStall(g, colliders, s, spec, ground(s.x, s.z), glow, i));
  for (const p of spec.piers) addPier(g, p, spec, ground(p.x, p.z), glow);
  return { glow, pads };
}
