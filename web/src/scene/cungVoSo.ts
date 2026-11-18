/**
 * Cung Vỏ Sò (V-110, Cung Ngọc Đáy Biển — concept `design/concept/cung-ngoc-day-bien/cong-trinh.png`): nền san hô hai bậc,
 * vỏ ốc xà cừ nằm nghiêng (lathe quanh trục, dải kem / hồng / tím tô theo mặt), cửa vòm (môi + lòng tối + rèm rong), cột san
 * hô, mái san hô 3 sừng, đèn ngọc. Khối Lambert tĩnh → `mergeSoft` gộp. Số đo ở `seaFloor.palace` (`cungNgocSpec.ts`).
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import type { SeaFloorSpec, SeaPalaceSpec } from './cungNgocSpec';
import { archPoints, taperTube, v3, type V3 } from './hinhBien';
import { lambert } from './materials';
import { seededRandom } from './random';

/** Mặt cắt vỏ ốc (r, t) theo bán kính thân = 1: t < 0 lưng thân tròn, t 0…1 thân, sau đó 4 vòng xoắn thu dần tới chóp. */
const SHELL_PROFILE: [number, number][] = [
  [0, -1],
  [0.38, -0.93],
  [0.7, -0.72],
  [0.9, -0.44],
  [0.99, -0.15],
  [1, 0.1],
  [0.97, 0.35],
  [0.88, 0.62],
  [0.74, 0.86],
  [0.62, 1.0],
  [0.66, 1.1],
  [0.6, 1.3],
  [0.48, 1.48],
  [0.49, 1.56],
  [0.41, 1.72],
  [0.31, 1.86],
  [0.32, 1.92],
  [0.24, 2.05],
  [0.17, 2.17],
  [0.17, 2.22],
  [0.09, 2.38],
  [0, 2.55],
];
const SHELL_TIP = 2.55;
/** Trục vỏ ốc (hệ nền cung): chóp chĩa về +x, ngẩng lên, lệch ra sau. */
const SHELL_AXIS = v3(1, 0.3, -0.3).normalize();
/** Dải xà cừ: 0 kem · 1 hồng · 0 kem · 2 tím, xoắn theo trục. */
const BAND_ORDER = [0, 1, 0, 2];

interface ShellFrame {
  /** tâm thân ốc (hệ nền, y tính từ mặt đất) */
  c: V3;
  /** (bán kính, toạ độ dọc trục) thật */
  profile: [number, number][];
  /** mặt trước thân ốc ở 3/4 cao cửa (z hệ nền) */
  front: number;
}

function shellFrame(p: SeaPalaceSpec): ShellFrame {
  const R = p.shellR;
  const c = v3(p.shellAt[0], p.plinthH + R - 0.7, p.shellAt[1]);
  const k = (p.spireLength / R - 0.6) / (SHELL_TIP - 0.6);
  const profile = SHELL_PROFILE.map(([r, t]): [number, number] => [r * R, (t <= 0.6 ? t : 0.6 + (t - 0.6) * k) * R]);
  const dy = c.y - (p.plinthH + p.doorH * 0.75);
  const front = c.z + Math.sqrt(Math.max(0, R * R - dy * dy));
  return { c, profile, front };
}

/** Vỏ ốc: lathe quanh trục, tô dải xà cừ theo từng mặt → 3 khối Lambert (gộp mềm). */
function addShell(g: THREE.Group, p: SeaPalaceSpec, sf: ShellFrame, nacre: [string, string, string]): void {
  const lathe = new THREE.LatheGeometry(
    sf.profile.map(([r, t]) => new THREE.Vector2(r, t)),
    20,
  ).toNonIndexed();
  const pos = lathe.getAttribute('position');
  const buckets: number[][] = [[], [], []];
  for (let f = 0; f < pos.count / 3; f++) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let j = 0; j < 3; j++) {
      x += pos.getX(f * 3 + j) / 3;
      y += pos.getY(f * 3 + j) / 3;
      z += pos.getZ(f * 3 + j) / 3;
    }
    const band = Math.floor((y / p.shellR) * 2.4 + Math.atan2(x, z) / (Math.PI * 2) + 8);
    const b = buckets[BAND_ORDER[band % BAND_ORDER.length]];
    for (let j = 0; j < 3; j++) b.push(pos.getX(f * 3 + j), pos.getY(f * 3 + j), pos.getZ(f * 3 + j));
  }
  const q = new THREE.Quaternion().setFromUnitVectors(v3(0, 1, 0), SHELL_AXIS);
  buckets.forEach((arr, i) => {
    if (!arr.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, lambert(nacre[i]));
    mesh.quaternion.copy(q);
    mesh.position.copy(sf.c);
    g.add(mesh);
  });
}

/** Mái san hô trên lưng ốc: váy cánh hoa loe + 3 sừng cong (giữa cao `crownH`). Gốc ở (0, 0, 0) của `parent`. */
function addCrown(parent: THREE.Group, h: number, color: string): void {
  const s = h / 4.5;
  const mat = lambert(color);
  const skirtP: [number, number][] = [
    [0, 1.9],
    [0.9, 1.7],
    [1.7, 1.15],
    [2.6, 0.45],
    [3.3, 0.15],
    [3.65, 0.5],
  ];
  const skirt = new THREE.LatheGeometry(
    skirtP.map(([r, y]) => new THREE.Vector2(r * s, y * s)).reverse(),
    24,
  );
  // cánh hoa: mép váy lượn 6 múi, múi vểnh lên
  const pos = skirt.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.01) continue;
    const a = Math.atan2(x, z);
    const w = Math.cos(a * 6);
    const k = 1 + 0.1 * w * (r / (3.6 * s));
    pos.setXYZ(i, x * k, pos.getY(i) + 0.35 * s * Math.max(0, w) * (r / (3.6 * s)) ** 2, z * k);
  }
  skirt.computeVertexNormals();
  parent.add(new THREE.Mesh(skirt, mat));
  const horn = (pts: [number, number, number][], r0: number): void => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => v3(x * s, y * s, z * s)));
    parent.add(new THREE.Mesh(taperTube(curve.getPoints(10), r0 * s, 0.12 * s, 7), mat));
  };
  horn(
    [
      [0, 1.6, 0],
      [0, 3.0, 0],
      [0.15, 4.0, 0],
      [0.55, 4.5, 0],
    ],
    0.8,
  );
  for (const sx of [-1, 1]) {
    horn(
      [
        [sx * 1.6, 0.9, 0],
        [sx * 2.4, 1.7, 0],
        [sx * 2.7, 2.6, 0],
        [sx * 3.2, 3.1, 0],
      ],
      0.6,
    );
  }
}

/** Nhánh san hô dáng gạc (đầu cột cửa, cụm san hô): thân + 5 nhánh vểnh, cao ≈ 1 m. */


/**
 * Dựng Cung Vỏ Sò: nền hai bậc + bậc tím trước cửa, vỏ ốc, cửa vòm (môi + lòng tối + rèm rong), cột san hô, mái san hô, đèn
 * ngọc. Thêm va chạm (thân ốc ở tầm người, môi cửa, cột, đèn), trả tấm nền, vị trí ngọn cột (đặt san hô), tâm đèn ngọc.
 */
export function addPalace(
  scene: THREE.Scene,
  colliders: Colliders,
  f: SeaFloorSpec,
  y0: number,
  kelp: string,
): { pads: Pad[]; coralTops: V3[]; pearls: { at: V3; r: number }[] } {
  const p = f.palace;
  const c = f.colors;
  const g = new THREE.Group();
  g.position.set(p.x, y0, p.z);
  g.rotation.y = (p.rotY * Math.PI) / 180;
  const put = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number): THREE.Mesh => {
    const m = new THREE.Mesh(geo, lambert(color));
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  const R = p.plinthR;
  const H = p.plinthH;
  // nền: bậc ngoài (cao H/2) + khối trong (cao H, lùi 0,8 m)
  put(new THREE.CylinderGeometry(R, R + 0.15, H / 2, 44), c.plinth, 0, H / 4, 0);
  put(new THREE.CylinderGeometry(R - 0.8, R - 0.7, H, 44), c.plinthTop, 0, H / 2, 0);
  const sf = shellFrame(p);
  addShell(g, p, sf, c.nacre);
  // bậc tím trước cửa: phủ đúng hai bậc nền (nổi 2 cm)
  const stepW = p.doorW + 1.2;
  for (let i = 0; i < 2; i++) {
    const top = (H / 2) * (i + 1) + 0.02;
    put(new THREE.BoxGeometry(stepW, top, 0.8), c.steps, 0, top / 2, R - 0.4 - i * 0.8);
  }
  // cửa: khối tiền sảnh (bịt thân ốc) + lòng tối + môi cửa
  const outer = archPoints(p.doorW + 1.4, p.doorH + 0.7);
  const inner = archPoints(p.doorW, p.doorH);
  const back = sf.c.z + 1;
  const vest = new THREE.ExtrudeGeometry(new THREE.Shape(outer), { depth: sf.front - 0.3 - back, bevelEnabled: false });
  put(vest, c.nacre[0], 0, H, back);
  put(new THREE.ShapeGeometry(new THREE.Shape(inner)), c.doorway, 0, H, sf.front - 0.28);
  const lip = new THREE.Shape([...outer, ...[...inner].reverse()]);
  put(new THREE.ExtrudeGeometry(lip, { depth: 1.0, bevelEnabled: false }), c.lip, 0, H, sf.front - 0.3);
  // rèm rong rủ từ đỉnh vòm
  const rand = seededRandom(f.seed + 3);
  const half = p.doorW / 2;
  for (let i = 0; i < 9; i++) {
    const x = -half + 0.2 + ((p.doorW - 0.4) * i) / 8;
    const topY = p.doorH - half + Math.sqrt(Math.max(0, half * half - x * x));
    const len = topY * (0.45 + rand() * 0.4);
    const strip = new THREE.BoxGeometry(0.2, len, 0.04, 1, 6, 1).translate(0, -len / 2, 0);
    const sp = strip.getAttribute('position');
    for (let k = 0; k < sp.count; k++) sp.setX(k, sp.getX(k) + Math.sin(sp.getY(k) * 3 + i) * 0.07);
    strip.computeVertexNormals();
    put(strip, kelp, x, H + topY - 0.05, sf.front - 0.2 + (i % 2) * 0.06);
  }
  // cột san hô hai bên cửa + mái san hô
  const coralTops: V3[] = [];
  const colX = half + 1.35;
  const colZ = sf.front + 0.7;
  for (const sx of [-1, 1]) {
    put(new THREE.BoxGeometry(0.9, 0.4, 0.9), c.coral, sx * colX, H + 0.2, colZ);
    put(new THREE.CylinderGeometry(0.3, 0.36, p.columnH, 6), c.coral, sx * colX, H + 0.4 + p.columnH / 2, colZ);
    put(new THREE.CylinderGeometry(0.46, 0.4, 0.3, 6), c.coral, sx * colX, H + 0.55 + p.columnH, colZ);
    coralTops.push(v3(sx * colX, H + 0.7 + p.columnH, colZ));
  }
  const crown = new THREE.Group();
  crown.position.set(sf.c.x + 0.4, sf.c.y + p.shellR * 0.96 - 0.6, sf.c.z);
  addCrown(crown, p.crownH, c.coral);
  g.add(crown);
  // đèn ngọc: chồng 3 viên hai bên cửa (đứng trên mặt nền)
  const pearls: { at: V3; r: number }[] = [];
  const lamps: [number, number][] = [
    [half + 0.45, sf.front + 1.7],
    [half + 2.6, sf.front + 1.1],
  ];
  for (const sx of [-1, 1]) {
    for (const [lx, lz] of lamps) {
      pearls.push({ at: v3(sx * lx, H + 0.36, lz), r: 0.36 }, { at: v3(sx * lx + 0.12, H + 0.98, lz - 0.05), r: 0.28 }, { at: v3(sx * lx - 0.1, H + 1.45, lz + 0.05), r: 0.2 });
    }
  }
  scene.add(g);
  g.updateMatrixWorld(true);
  const toWorld = (v: V3): V3 => v.clone().applyMatrix4(g.matrixWorld);
  // va chạm: thân ốc ở tầm người (cao H + 1), môi cửa, cột, đèn
  const chest = H + 1;
  for (const [r, t] of sf.profile) {
    const at = sf.c.clone().addScaledVector(SHELL_AXIS, t);
    const dy = at.y - chest;
    if (Math.abs(dy) >= r) continue;
    const w = toWorld(at);
    colliders.addCircle(w.x, w.z, Math.sqrt(r * r - dy * dy) * 0.95);
  }
  for (const sx of [-0.55, 0.55]) {
    const w = toWorld(v3(sx * (half + 0.2), 0, sf.front - 0.2));
    colliders.addCircle(w.x, w.z, half * 0.55 + 0.6);
  }
  for (const t of coralTops) {
    const w = toWorld(t);
    colliders.addCircle(w.x, w.z, 0.5);
  }
  for (const [lx, lz] of lamps) {
    for (const sx of [-1, 1]) {
      const w = toWorld(v3(sx * lx, 0, lz));
      colliders.addCircle(w.x, w.z, 0.4);
    }
  }
  const pads: Pad[] = [
    { minX: p.x - (R - 0.8), maxX: p.x + (R - 0.8), minZ: p.z - (R - 0.8), maxZ: p.z + (R - 0.8), y: y0 + H, round: true },
    { minX: p.x - R, maxX: p.x + R, minZ: p.z - R, maxZ: p.z + R, y: y0 + H / 2, round: true },
  ];
  return { pads, coralTops: coralTops.map(toWorld), pearls: pearls.map((q) => ({ at: toWorld(q.at), r: q.r })) };
}

