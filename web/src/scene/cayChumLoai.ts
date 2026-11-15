/**
 * Các kiểu cây "tán chùm nổi" ngoài tùng / bụi (V-60 — nhân công thức V-58 theo hồ sơ `docs/tham_khao/thuc-vat-dep-nhe.md`):
 * cây tán, mai / đào, liễu, trúc. Mỗi kiểu **một hình** (thân + tán / hoa / dải lá gộp, màu đỉnh, `softMaterial`) và một hình
 * thô cho bậc LOD xa; đặt bằng `InstancedMesh` ở `cayChum.ts`. Hình mẫu có cỡ như cây cũ (`trees.ts`, `cay_moi.ts`) ở
 * `scale` 1. Số đo dưới đây là dáng hình mẫu (như lưới), không phải số cảnh — màu, chỗ, cỡ vẫn từ `SceneSpec`.
 */
import * as THREE from 'three';
import { mergeParts, softCrown, softLimb, softStrip, withSway, type Lobe } from './khoiMem';
import { seededRandom } from './random';

type Tri = readonly [string, string, string];
const v = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
const UP = v(0, 1, 0);
const hex = (c: THREE.Color): string => `#${c.getHexString()}`;
/** ba sắc tối → giữa → sáng từ một màu */
export function shades(c: string, dark = 0.62, light = 0.2): Tri {
  const b = new THREE.Color(c);
  return [hex(b.clone().multiplyScalar(dark)), c, hex(b.clone().lerp(new THREE.Color('#fff6e0'), light))];
}

/** Cây tán (`tan`): 7 múi trên elip ~1,5 : 1 (múi giữa to, 1 múi đỉnh, 5 múi vòng), thân gốc loe + 2 khúc + 2 cành. Xa: 3 múi. */
export function broadleafGeometry(trunk: string, leaves: Tri, far: boolean): THREE.BufferGeometry {
  const lobes: Lobe[] = far
    ? [
        { x: 0, y: 3.3, z: 0, rx: 1.75, ry: 1.2, rz: 1.65 },
        { x: 0.75, y: 2.95, z: 0.5, rx: 1.1, ry: 0.85, rz: 1.0 },
        { x: -0.65, y: 3.05, z: -0.6, rx: 1.1, ry: 0.85, rz: 1.0 },
      ]
    : [
        { x: 0, y: 3.4, z: 0, rx: 1.4, ry: 1.2, rz: 1.35 },
        { x: 0.1, y: 4.3, z: -0.1, rx: 0.95, ry: 0.85, rz: 0.9 },
        ...Array.from({ length: 5 }, (_, k): Lobe => {
          const a = (k / 5) * Math.PI * 2 + 0.3;
          return { x: Math.cos(a) * 1.1, y: 2.9 + 0.15 * (k % 2), z: Math.sin(a) * 1.05, rx: 0.92, ry: 0.85, rz: 0.88 };
        }),
      ];
  const crown = softCrown({ lobes, colors: leaves, seg: far ? [7, 4] : [8, 4], flat: -0.55, lobeShade: 0.35, noise: 0.1 });
  const limbs = far
    ? [softLimb([v(0, -0.1, 0), v(0.08, 1.4, 0.03), v(0, 2.8, 0)], [0.33, 0.22, 0.12], trunk, 0.45)]
    : [
        softLimb([v(0, -0.1, 0), v(0.03, 0.35, 0), v(0.12, 1.5, 0.05), v(-0.04, 2.8, 0)], [0.36, 0.27, 0.22, 0.13], trunk, 0.45),
        softLimb([v(0.1, 1.8, 0.04), v(0.8, 2.75, 0.45)], [0.1, 0.05], trunk, 0.35),
        softLimb([v(0.05, 2.1, 0), v(-0.7, 2.9, -0.5)], [0.09, 0.05], trunk, 0.35),
      ];
  return mergeParts([...limbs, crown]);
}

/**
 * Bông hoa nón 5 cạnh dẹt (mai, đào — V-60): đỉnh nón (nhị, màu `heart`) nhô theo hướng `dir`, vành 5 đỉnh màu cánh; mặt
 * dưới là đáy nón (cánh tối hơn chút). 10 tam giác. Pháp tuyến theo đỉnh pha hướng bông với hướng ra khỏi tâm cây `c`.
 */
function blossom(at: THREE.Vector3, dir: THREE.Vector3, r: number, petal: THREE.Color, heart: THREE.Color, c: THREE.Vector3): THREE.BufferGeometry {
  const side = Math.abs(dir.y) > 0.9 ? v(1, 0, 0) : UP;
  const a = new THREE.Vector3().crossVectors(dir, side).normalize();
  const b = new THREE.Vector3().crossVectors(dir, a).normalize();
  const apex = at.clone().addScaledVector(dir, r * 0.6);
  const under = at.clone().addScaledVector(dir, -r * 0.12);
  const rim = Array.from({ length: 5 }, (_, k) => {
    const t = (k / 5) * Math.PI * 2;
    return at.clone().addScaledVector(a, Math.cos(t) * r).addScaledVector(b, Math.sin(t) * r);
  });
  // pháp tuyến theo đỉnh: nhị = hướng bông, vành = toả ra (pha hướng bông + hướng ra khỏi tâm cây) → mỗi bông tròn dưới nắng
  const out = at.clone().sub(c).normalize();
  const nApex = dir.clone().multiplyScalar(0.7).addScaledVector(out, 0.3).normalize();
  const nRim = (p: THREE.Vector3): THREE.Vector3 => {
    const n = p.clone().sub(at).normalize().multiplyScalar(0.55).addScaledVector(dir, 0.2).addScaledVector(out, 0.25).normalize();
    if (n.y < -0.3) n.setY(-0.3).normalize();
    return n;
  };
  const nUnder = out.clone().addScaledVector(dir, -0.3).normalize();
  if (nUnder.y < -0.3) nUnder.setY(-0.3).normalize();
  const pos: number[] = [];
  const col: number[] = [];
  const nrm: number[] = [];
  const under0 = petal.clone().multiplyScalar(0.82);
  for (let k = 0; k < 5; k++) {
    const p0 = rim[k];
    const p1 = rim[(k + 1) % 5];
    const verts: [THREE.Vector3, THREE.Color, THREE.Vector3][] = [
      [apex, heart, nApex],
      [p0, petal, nRim(p0)],
      [p1, petal, nRim(p1)],
      [under, under0, nUnder],
      [p1, under0, nUnder],
      [p0, under0, nUnder],
    ];
    for (const [p, cc, n] of verts) {
      pos.push(p.x, p.y, p.z);
      col.push(cc.r, cc.g, cc.b);
      nrm.push(n.x, n.y, n.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

/**
 * Mai (`mai`): thân thấp, 4 cành gãy khúc (2 khúc + 1 nhánh con ở khuỷu), hoa nón 5 cạnh thành cụm ở khuỷu / ngọn / nhánh
 * con, hai màu xen (`trees.plum`: gỗ, hoa đậm, hoa nhạt). `dense` false = ít hoa hơn (đào: nhường tam giác cho lá + quả).
 * Xa: cành một khúc, mỗi khuỷu / ngọn một bông to.
 */
export function plumGeometry(colors: Tri, far: boolean, dense = true): THREE.BufferGeometry {
  const [wood, deepC, paleC] = colors;
  const rand = seededRandom(6151);
  const deep = new THREE.Color(deepC);
  const pale = new THREE.Color(paleC);
  const heart = new THREE.Color('#fbe7a2');
  const C = v(0, 2.1, 0);
  const parts: THREE.BufferGeometry[] = [];
  const fork = v(-0.04, 1.4, 0);
  parts.push(far ? softLimb([v(0, -0.05, 0), fork], [0.16, 0.1], wood, 0.25) : softLimb([v(0, -0.05, 0), v(0.06, 0.7, 0.02), fork], [0.17, 0.13, 0.1], wood, 0.25));
  const turn = [0.2, 0.9, 0.1, 0.6];
  const l1 = [1.1, 0.95, 1.25, 1.0];
  const l2 = [0.85, 0.75, 0.95, 0.8];
  let flower = 0;
  const bloom = (p: THREE.Vector3, count: number, r: number): void => {
    for (let k = 0; k < count; k++) {
      const at = p.clone().add(v(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(count > 1 ? 0.36 : 0));
      const out = v(at.x, 0, at.z).normalize().multiplyScalar(0.6).add(v((rand() - 0.5) * 0.6, 0.8, (rand() - 0.5) * 0.6)).normalize();
      parts.push(blossom(at, out, r, flower++ % 2 === 0 ? deep : pale, heart, C));
    }
  };
  for (let b = 0; b < 4; b++) {
    const a = (b / 4) * Math.PI * 2 + turn[b];
    const d1 = v(Math.cos(a) * 0.8, 0.9, Math.sin(a) * 0.8).normalize();
    const knee = fork.clone().addScaledVector(d1, l1[b]);
    const d2 = v(Math.cos(a + 0.9) * 0.6, 1, Math.sin(a + 0.9) * 0.6).normalize(); // gãy khúc
    const tip = knee.clone().addScaledVector(d2, l2[b]);
    if (far) {
      parts.push(softLimb([fork, tip], [0.07, 0.03], wood, 0.2, 4));
      bloom(knee, 1, 0.26);
      bloom(tip, 1, 0.28);
      continue;
    }
    parts.push(softLimb([fork, knee, tip], [0.075, 0.05, 0.025], wood, 0.2, 5));
    const d3 = v(Math.cos(a - 0.8) * 0.9, 0.55, Math.sin(a - 0.8) * 0.9).normalize();
    const twig = knee.clone().addScaledVector(d3, 0.45);
    parts.push(softLimb([knee, twig], [0.035, 0.015], wood, 0.1, 4));
    bloom(knee, 3, 0.14);
    bloom(tip, dense ? 4 : 3, 0.15);
    if (dense) bloom(twig, 2, 0.13);
  }
  // mọi phần cùng thuộc tính (vị trí, pháp tuyến, màu), không chỉ mục — gộp được
  return mergeParts(parts.map((g) => (g.index ? nonIndexed(g) : g)));
}

function nonIndexed(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const out = g.toNonIndexed();
  g.dispose();
  return out;
}

/** Đào tiên (`dao`): dáng mai ×1,5 (ít hoa hơn) + 3 đám lá dẹt xanh nhạt + 6 quả treo dưới tán. Xa: mai xa + 1 đám lá. */
export function peachGeometry(colors: Tri, far: boolean): THREE.BufferGeometry {
  const [trunk, flower, fruit] = colors;
  const plum = plumGeometry([trunk, flower, '#e88aa4'], far, false).scale(1.5, 1.5, 1.5);
  const leaf = shades('#8fb35e', 0.7, 0.18);
  const pads: Lobe[] = far
    ? [{ x: 0.2, y: 3.75, z: 0.1, rx: 1.9, ry: 0.55, rz: 1.8 }]
    : [
        { x: 0.4, y: 3.6, z: 0.2, rx: 1.7, ry: 0.55, rz: 1.6 },
        { x: -0.5, y: 4.05, z: -0.3, rx: 1.3, ry: 0.5, rz: 1.25 },
        { x: 0.6, y: 4.2, z: -0.7, rx: 0.9, ry: 0.42, rz: 0.85 },
      ];
  const parts = [plum, nonIndexed(softCrown({ lobes: pads, colors: leaf, seg: far ? [7, 4] : [8, 4], flat: -0.6, lobeShade: 0.6 }))];
  if (!far) {
    const fruits: Lobe[] = Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * Math.PI * 2 + 0.4;
      const r = 1.0 + (k % 3) * 0.35;
      return { x: Math.cos(a) * r, y: 3.15 - (k % 2) * 0.3, z: Math.sin(a) * r, rx: 0.2, ry: 0.23, rz: 0.2 };
    });
    parts.push(nonIndexed(softCrown({ lobes: fruits, colors: shades(fruit, 0.7, 0.3), seg: [5, 3], flat: -1, normalBlend: 1, coreAo: 0, rimAmount: 0, noise: 0 })));
  }
  return mergeParts(parts);
}

/**
 * Liễu (`lieu`): thân, vòm 5 múi (`trees.willow[0]`), 16 dải lá thon 3 khúc rủ quanh mép vòm (`willow[1]`, gốc sẫm → ngọn
 * sáng). Gió trong shader theo thuộc tính `aSway` (ngọn dải lay mạnh, vòm lay nhẹ, gốc thân đứng yên) — thay cập nhật ma
 * trận từng dải trên CPU. Xa: vòm 3 múi + 10 dải 2 khúc.
 */
export function willowGeometry(trunk: string, willow: readonly [string, string], far: boolean): THREE.BufferGeometry {
  const rand = seededRandom(8191);
  const top = 2.75;
  const stem = far
    ? softLimb([v(0, -0.1, 0), v(0, top, 0)], [0.3, 0.14], trunk, 0.4)
    : softLimb([v(0, -0.1, 0), v(0.04, 0.4, 0), v(0.15, 1.6, 0.05), v(0.02, top, 0)], [0.32, 0.25, 0.2, 0.13], trunk, 0.4);
  withSway(stem, (p) => Math.min(0.15, (Math.max(0, p.y) / top) * 0.15));
  const ring = far ? 2 : 4;
  const lobes: Lobe[] = [{ x: 0, y: 2.95, z: 0, rx: 1.45, ry: 0.85, rz: 1.4 }];
  for (let k = 0; k < ring; k++) {
    const a = (k / ring) * Math.PI * 2 + 0.4;
    lobes.push({ x: Math.cos(a) * 0.95, y: 2.75, z: Math.sin(a) * 0.95, rx: 1.0, ry: 0.65, rz: 0.95 });
  }
  const crown = withSway(softCrown({ lobes, colors: shades(willow[0], 0.7, 0.22), seg: far ? [6, 3] : [8, 4], flat: -0.35, lobeShade: 0.4 }), 0.18);
  const parts = [stem, crown];
  const n = far ? 10 : 16;
  const strandBase = new THREE.Color(willow[1]).multiplyScalar(0.72);
  const strandTip = new THREE.Color(willow[1]).lerp(new THREE.Color('#eef2a8'), 0.25);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + rand() * 0.25;
    const out = v(Math.cos(a), 0, Math.sin(a));
    const r0 = 1.55 + rand() * 0.3;
    const L = 1.8 + rand() * 0.8;
    const p0 = out.clone().multiplyScalar(r0).setY(2.62);
    const pts = far
      ? [p0, p0.clone().addScaledVector(out, 0.14).add(v(0, -L * 0.5, 0)), p0.clone().addScaledVector(out, 0.1).add(v(0, -L, 0))]
      : [
          p0,
          p0.clone().addScaledVector(out, 0.13).add(v(0, -L * 0.35, 0)),
          p0.clone().addScaledVector(out, 0.17).add(v(0, -L * 0.7, 0)),
          p0.clone().addScaledVector(out, 0.1).add(v(0, -L, 0)),
        ];
    const widths = far ? [0.18, 0.12, 0.02] : [0.16, 0.13, 0.09, 0.02];
    const nrm = out.clone().setY(0.35).normalize();
    parts.push(softStrip(pts, widths, v(-Math.sin(a), 0, Math.cos(a)), () => nrm, hex(strandBase), hex(strandTip), (t) => 0.25 + 0.75 * t ** 1.5));
  }
  return mergeParts(parts);
}

/**
 * Khóm trúc (`truc`): 5 thân cao gầy nghiêng nhẹ (`trees.bamboo[0]`), ngọn mỗi thân 3 dải lá thon chéo toả ra rồi rủ
 * (`bamboo[1]`, gốc lá sẫm → ngọn sáng) + 2 dải ngắn tầng dưới, thay túm nón cứng. Một hình cả khóm. Xa: thân 3 cạnh, 2 dải
 * một khúc.
 */
export function bambooGeometry(colors: readonly [string, string], far: boolean): THREE.BufferGeometry {
  const stalks = [
    { x: 0, z: 0, h: 6.2, lx: 0.05, lz: -0.04 },
    { x: 0.35, z: 0.2, h: 5.0, lx: 0.09, lz: 0.03 },
    { x: -0.3, z: 0.25, h: 5.6, lx: -0.07, lz: 0.05 },
    { x: 0.15, z: -0.38, h: 4.4, lx: 0.03, lz: -0.09 },
    { x: -0.25, z: -0.3, h: 4.8, lx: -0.06, lz: -0.06 },
  ];
  const leafBase = new THREE.Color(colors[1]).multiplyScalar(0.75);
  const leafTip = new THREE.Color(colors[1]).lerp(new THREE.Color('#f4f0b0'), 0.2);
  const parts: THREE.BufferGeometry[] = [];
  stalks.forEach((s, i) => {
    const base = v(s.x, -0.05, s.z);
    const top = v(s.x + s.lx * s.h, s.h, s.z + s.lz * s.h);
    parts.push(softLimb([base, top], [0.085, 0.06], colors[0], -0.12, far ? 3 : 5));
    // ngọn: 3 dải lá toả chéo (2 khúc, vồng lên rồi rủ) + tầng dưới 2 dải ngắn một khúc; xa: 2 dải một khúc
    const blades = far ? 2 : 5;
    for (let k = 0; k < blades; k++) {
      const low = !far && k >= 3;
      const a = i * 1.3 + (low ? (k - 3) * Math.PI + 0.9 : (k / (far ? 2 : 3)) * Math.PI * 2);
      const out = v(Math.cos(a), 0, Math.sin(a));
      const p0 = top.clone().add(v(0, low ? -0.95 : -0.15 - 0.2 * (k % 2), 0));
      const len = low ? 0.9 : 1.3;
      const pts =
        far || low
          ? [p0, p0.clone().addScaledVector(out, len).add(v(0, -0.2, 0))]
          : [p0, p0.clone().addScaledVector(out, 0.6).add(v(0, 0.15, 0)), p0.clone().addScaledVector(out, len).add(v(0, -0.22, 0))];
      const widths = far ? [0.5, 0] : low ? [0.36, 0] : [0.12, 0.44, 0];
      const nrm = out.clone().multiplyScalar(0.5).add(v(0, 0.85, 0)).normalize();
      parts.push(nonIndexed(softStrip(pts, widths, v(-Math.sin(a), 0, Math.cos(a)), () => nrm, hex(leafBase), hex(leafTip))));
    }
  });
  return mergeParts(parts.map((g) => (g.index ? nonIndexed(g) : g)));
}
