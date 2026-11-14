import * as THREE from 'three';
import { mergeStatic } from '../scene/merge';
import type { Character } from './character';
import { ChibiFace, type Expression, type FaceStyle } from './chibiFace';
import { ARM_A, chibiPose, ease, HIP_X, HIP_Y, idleAction, SHOULDER_X, SHOULDER_Y } from './chibiPose';
import { RUN_SPEED, WALK_SPEED } from './controller';

/** Bộ màu + kiểu tóc / phụ kiện của một nhân vật chibi. */
export interface ChibiLook {
  skin: string;
  hair: string;
  robe: string;
  /** viền áo, cổ giao lĩnh, cổ tay áo */
  trim: string;
  /** áo lót lộ ở cổ */
  inner: string;
  sash: string;
  pendant: string;
  boots: string;
  sole: string;
  hairStyle: 'bun' | 'ponytail';
  /** dây buộc tóc (búi: đai búi; đuôi ngựa: dây đỏ) */
  tie: string;
  /** trâm cài búi (bỏ = không có) */
  pin?: string;
  /** kiếm đeo sau lưng (Tiểu Mặc) */
  sword?: { sheath: string; hilt: string; tassel: string };
  face: FaceStyle;
}

/** Nhân vật chính — theo ảnh người dùng (`design/models/anh/nhan-vat.webp`). */
export const DE_TU: ChibiLook = {
  skin: '#f6d3bd',
  hair: '#202026',
  robe: '#bfcfe0',
  trim: '#4d6db2',
  inner: '#f3f5f7',
  sash: '#33456d',
  pendant: '#8ccb9e',
  boots: '#33456d',
  sole: '#f4f4f2',
  hairStyle: 'bun',
  tie: '#4d6db2',
  pin: '#e2b24c',
  face: { blush: true, ink: '#2a2228', mouth: '#c9524a', blushColor: '#f28b8b' },
};

/** NPC Tiểu Mặc — theo tờ thiết kế "小墨 Tiểu Mặc" của người dùng. */
export const TIEU_MAC: ChibiLook = {
  skin: '#fbe5d3',
  hair: '#1d1b1e',
  robe: '#f4f1e8',
  trim: '#2e6b57',
  inner: '#ffffff',
  sash: '#221e1f',
  pendant: '#3f8f6e',
  boots: '#221e1f',
  sole: '#f4f1e8',
  hairStyle: 'ponytail',
  tie: '#c8372d',
  sword: { sheath: '#4a3527', hilt: '#d9a43a', tassel: '#c8372d' },
  face: { blush: true, ink: '#1d1b1e', mouth: '#c8372d', blushColor: '#f07c84' },
};

const NECK_Y = 1.2;
const HEAD_R = 0.46;

/** Mặt cắt áo xoè (bán kính theo độ cao) — dùng cho thân, viền, đai để ôm khít nhau. */
const ROBE: [number, number][] = [
  [0.001, 1.22],
  [0.22, 1.2],
  [0.29, 1.1],
  [0.32, 0.95],
  [0.35, 0.78],
  [0.41, 0.55],
  [0.47, 0.34],
  [0.5, 0.21],
  [0.47, 0.19],
  [0.001, 0.2],
];
function robeR(y: number): number {
  for (let i = 1; i < 8; i++) {
    const [r0, y0] = ROBE[i];
    const [r1, y1] = ROBE[i + 1];
    if (y <= y0 && y >= y1) return r0 + ((r1 - r0) * (y0 - y)) / (y0 - y1);
  }
  return 0.3;
}

/**
 * Nhân vật chibi kiểu đồ chơi (đầu ≈ ½ chiều cao, khối tròn mịn, mặt vẽ đổi biểu cảm), cùng hợp đồng `Character`.
 * Khớp riêng: thân (nhún, xoay, cúi; tay + đầu gắn theo thân), đầu (nghiêng), tay trái / phải (dang, vung), chân trái /
 * phải (bước, gập). Dáng đi / chạy / nhảy / ngồi xếp bằng / chào / đứng lâu: `chibiPose.ts`. Trong mỗi khớp các khối cùng
 * màu được gộp. Cao ≈ 2,1 m như đệ tử khối cũ (bán kính va chạm 0,5 không đổi).
 */
export function createChibiCharacter(look: ChibiLook = DE_TU): Character & { setExpression(e: Expression): void } {
  const mats = new Map<string, THREE.MeshLambertMaterial>();
  const mat = (c: string): THREE.MeshLambertMaterial => {
    let m = mats.get(c);
    if (!m) mats.set(c, (m = new THREE.MeshLambertMaterial({ color: c })));
    return m;
  };
  const mesh = (geo: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z);
    return m;
  };
  /** gộp khối cùng màu trong một khớp (gọi trước khi gắn khớp con) */
  const seal = (g: THREE.Object3D): void => {
    mergeStatic(g, new Set());
  };

  const root = new THREE.Group();
  const facing = new THREE.Group();
  const body = new THREE.Group(); // thân: nhún + xoay hông
  root.add(facing);
  facing.add(body);

  /* ---------- thân áo ---------- */
  // LatheGeometry cần điểm từ dưới lên để mặt ngoài quay ra ngoài (ngược lại → chỉ thấy mặt trong, như trong suốt)
  const up = (pts: [number, number][]): THREE.Vector2[] => [...pts].reverse().map(([r, y]) => new THREE.Vector2(r, y));
  const robeGeo = new THREE.LatheGeometry(up(ROBE), 32);
  body.add(mesh(robeGeo, look.robe));
  // viền gấu áo
  body.add(mesh(new THREE.CylinderGeometry(robeR(0.27) + 0.012, 0.505, 0.08, 32, 1, true), look.trim, 0, 0.25, 0));
  // dải viền vạt áo chạy dọc thân phía trước (vạt giao lĩnh): một lát của mặt cắt áo, nổi lên 1 cm
  const flap = up(ROBE.slice(2, 8).map(([r, y]) => [r + 0.01, y] as [number, number]));
  body.add(mesh(new THREE.LatheGeometry(flap, 3, -0.42, 0.13), look.trim));
  // cổ giao lĩnh: hai vạt chéo + áo lót trắng ở giữa
  body.add(mesh(new THREE.ConeGeometry(0.08, 0.16, 3), look.inner, 0, 1.13, robeR(1.13) - 0.03));
  for (const [x, rz] of [
    [-0.07, 0.6],
    [0.07, -0.6],
  ] as const) {
    const lapel = mesh(new THREE.BoxGeometry(0.07, 0.3, 0.03), look.trim, x, 1.06, robeR(1.06) + 0.005);
    lapel.rotation.z = rz;
    lapel.rotation.x = -0.18;
    body.add(lapel);
  }
  // đai lưng + ngọc bội
  body.add(mesh(new THREE.CylinderGeometry(robeR(0.8) + 0.025, robeR(0.92) + 0.02, 0.14, 32), look.sash, 0, 0.86, 0));
  const cordX = 0.2;
  const cordZ = robeR(0.7) + 0.03;
  body.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 5), look.trim, cordX, 0.72, cordZ));
  const jade = mesh(new THREE.TorusGeometry(0.055, 0.022, 8, 16), look.pendant, cordX, 0.6, cordZ + 0.01);
  body.add(jade);
  // kiếm sau lưng (Tiểu Mặc)
  if (look.sword) {
    const sw = new THREE.Group();
    sw.position.set(0, 1.0, -0.33);
    sw.rotation.z = -0.75;
    sw.add(mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.95, 8), look.sword.sheath));
    sw.add(mesh(new THREE.BoxGeometry(0.2, 0.04, 0.06), look.sword.hilt, 0, 0.5, 0));
    sw.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6), look.sword.sheath, 0, 0.63, 0));
    sw.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), look.sword.hilt, 0, 0.75, 0));
    sw.add(mesh(new THREE.ConeGeometry(0.04, 0.22, 6), look.sword.tassel, 0.05, 0.62, 0));
    body.add(sw);
  }
  seal(body);

  /* ---------- chân (ủng lộ dưới gấu áo) ---------- */
  const legs: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(HIP_X * s, HIP_Y, 0);
    leg.add(mesh(new THREE.CylinderGeometry(0.085, 0.09, HIP_Y - 0.1, 10), look.boots, 0, -(HIP_Y - 0.1) / 2 - 0.02, 0));
    const boot = mesh(new THREE.SphereGeometry(0.12, 14, 10), look.boots, 0, -HIP_Y + 0.1, 0.04);
    boot.scale.set(0.95, 0.8, 1.35);
    leg.add(boot);
    const sole = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 14), look.sole, 0, -HIP_Y + 0.03, 0.05);
    sole.scale.z = 1.4;
    leg.add(sole);
    seal(leg);
    leg.rotation.order = 'ZXY'; // gập (x) rồi dang (z) — dáng ngồi xếp bằng (chibiPose.ts)
    facing.add(leg);
    legs.push(leg);
  }

  /* ---------- tay áo rộng (tư thế chữ A) — gắn vào thân: cúi / ngồi thì tay theo thân ---------- */
  const shoulders: THREE.Group[] = [];
  const arms: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(SHOULDER_X * s, SHOULDER_Y, 0);
    shoulder.rotation.z = ARM_A * s; // dang chéo xuống
    const arm = new THREE.Group(); // vung trước / sau
    const sleeve = up([
      [0.1, 0.02],
      [0.13, -0.15],
      [0.18, -0.38],
      [0.21, -0.52],
      [0.001, -0.53],
    ]);
    arm.add(mesh(new THREE.LatheGeometry(sleeve, 20), look.robe));
    arm.add(mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.07, 20, 1, true), look.trim, 0, -0.5, 0));
    const hand = mesh(new THREE.SphereGeometry(0.085, 12, 10), look.skin, 0, -0.6, 0.02);
    hand.scale.set(0.9, 1.05, 0.85);
    arm.add(hand);
    seal(arm);
    shoulder.add(arm);
    body.add(shoulder);
    shoulders.push(shoulder);
    arms.push(arm);
  }

  /* ---------- đầu ---------- */
  const head = new THREE.Group();
  head.position.set(0, NECK_Y, 0);
  const skull = new THREE.Group(); // cầu đầu hơi dẹt, mặt + tóc gắn theo
  skull.position.y = HEAD_R * 0.92;
  skull.scale.set(1.04, 0.94, 0.96);
  skull.add(mesh(new THREE.SphereGeometry(HEAD_R, 32, 24), look.skin));
  // tai
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.075, 10, 8), look.skin, s * HEAD_R * 0.98, -0.02, -0.02);
    ear.scale.set(0.6, 1, 0.9);
    skull.add(ear);
  }
  // tóc: chỏm trên (đường chân tóc cao ở trán, thấp ở gáy) + nửa sau + hai mai
  const cap = mesh(new THREE.SphereGeometry(HEAD_R * 1.04, 32, 16, 0, Math.PI * 2, 0, 1.2), look.hair);
  cap.rotation.x = -0.42;
  skull.add(cap);
  skull.add(mesh(new THREE.SphereGeometry(HEAD_R * 1.035, 24, 16, Math.PI, Math.PI, 0.35, 1.9), look.hair));
  for (const s of [-1, 1]) {
    const side = mesh(new THREE.SphereGeometry(0.11, 12, 10), look.hair, s * HEAD_R * 0.9, 0.06, 0.02);
    side.scale.set(0.4, 1.2, 0.6);
    skull.add(side);
  }
  if (look.hairStyle === 'bun') {
    skull.add(mesh(new THREE.SphereGeometry(0.17, 16, 12), look.hair, 0, HEAD_R * 1.05, -0.06));
    const band = mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 20), look.tie, 0, HEAD_R * 0.96, -0.06);
    band.rotation.x = Math.PI / 2;
    skull.add(band);
    if (look.pin) {
      const pin = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.62, 6), look.pin, 0, HEAD_R * 1.05, -0.04);
      pin.rotation.z = Math.PI / 2 - 0.12;
      skull.add(pin);
      skull.add(mesh(new THREE.SphereGeometry(0.045, 8, 6), look.pin, -0.31, HEAD_R * 1.02, -0.04));
    }
  } else {
    // đuôi ngựa cao buộc dây đỏ, vắt ra sau
    skull.add(mesh(new THREE.SphereGeometry(0.1, 12, 10), look.hair, 0, HEAD_R * 1.0, -0.12));
    const tail = mesh(new THREE.ConeGeometry(0.11, 0.62, 12), look.hair, 0, HEAD_R * 0.95, -0.42);
    tail.rotation.x = -2.1;
    skull.add(tail);
    const tie = mesh(new THREE.TorusGeometry(0.075, 0.03, 8, 16), look.tie, 0, HEAD_R * 1.0, -0.17);
    tie.rotation.x = 0.4;
    skull.add(tie);
    for (const s of [-1, 1]) {
      const rib = mesh(new THREE.BoxGeometry(0.05, 0.32, 0.015), look.tie, 0.06 * s, HEAD_R * 0.86, -0.24);
      rib.rotation.set(-0.5, 0, 0.35 * s);
      skull.add(rib);
    }
  }
  // mặt vẽ: chỏm cầu phía trước, nổi trên da một chút
  const face = new ChibiFace(look.face);
  face.draw('binh');
  const faceMat = new THREE.MeshLambertMaterial({
    map: face.texture,
    transparent: true,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const faceMesh = new THREE.Mesh(
    new THREE.SphereGeometry(HEAD_R * 1.004, 32, 16, Math.PI / 2 - 0.95, 1.9, 0.95, 1.15),
    faceMat,
  );
  skull.add(faceMesh);
  head.add(skull);
  seal(head);
  body.add(head);

  // bóng giả (không shadow realtime — quy tắc 4)
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  let walkT = 0;
  let time = 0;
  let move = 0; // 0..1: cường độ bước (đi bộ hết tốc = 1), mượt
  let runB = 0; // 0..1: hoà dáng chạy (R-DIEU-5)
  let airB = 0; // 0..1: dáng nhảy (R-DIEU-6)
  return {
    root,
    facing,
    setExpression: (e) => face.draw(e),
    animate(dt, speed, state) {
      time += dt;
      // nhân vật cũ không có `state`: suy tốc độ thật từ `speed`
      const mps = state?.mps ?? speed * RUN_SPEED;
      const k = Math.min(1, mps / WALK_SPEED);
      const run = Math.min(1, Math.max(0, (mps - WALK_SPEED) / (RUN_SPEED - WALK_SPEED)));
      move += (k - move) * Math.min(1, dt * 8);
      runB += (run - runB) * Math.min(1, dt * 6);
      airB += ((state?.air ? 1 : 0) - airB) * Math.min(1, dt * 14);
      // nhịp bước theo tốc độ thật: đi bộ ~7,5 rad/s, chạy ~14 (R-DIEU-5); đang bay thì thôi bước
      if (mps > 0.05) walkT += dt * 2.4 * Math.max(mps, 2.2) * (1 - airB);
      else walkT *= 0.85;
      const { stretch, look } = idleAction(state?.idle ?? 0);
      const p = chibiPose({
        move,
        run: runB,
        air: airB,
        sit: ease(state?.sit ?? 0),
        bow: ease(state?.bow ?? 0),
        stretch,
        look,
        walkT,
        time,
      });
      body.position.set(0, p.body.y, p.body.z);
      body.rotation.x = p.body.rx;
      body.rotation.y = p.body.ry;
      head.rotation.set(p.head.x, p.head.y, p.head.z);
      for (let i = 0; i < 2; i++) {
        shoulders[i].rotation.z = p.arms[i].z;
        arms[i].rotation.x = p.arms[i].x;
        const l = p.legs[i];
        legs[i].rotation.set(l.x, 0, l.z);
        legs[i].position.y = l.posY;
        legs[i].position.z = l.posZ;
      }
    },
  };
}
