/**
 * Vật trang trí riêng của các vùng hành trình (props `hac-dong` · `rua-dong` · `lac-da` · `hang`). Mỗi hàm dựng vào
 * nhóm `g` (gốc ở chân vật, mặt trước +z) và trả về kích thước va chạm; `props.ts` gọi và đặt va chạm.
 */
import * as THREE from 'three';
import type { Style } from './buildings';
import { lambert } from './materials';
import { markDynamic } from './merge';
import { signMesh } from './signAtlas';

type Updater = (dt: number) => void;

function put(g: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

/** Bệ đá vuông cạnh `w`, cao `h`, viền trên nhô. */
function plinth(g: THREE.Group, style: Style, w: number, h: number): void {
  const stone = lambert(style.stone);
  put(g, new THREE.BoxGeometry(w, h, w), stone, 0, h / 2, 0);
  put(g, new THREE.BoxGeometry(w + 0.16, 0.1, w + 0.16), stone, 0, h + 0.05, 0);
}

/** Hạc đồng (銅鶴) trên bệ: đứng một dáng, cổ vươn cao, mỏ ngẩng. Va chạm tròn — trả về bán kính. */
export function hacDong(g: THREE.Group, style: Style): number {
  plinth(g, style, 1, 0.8);
  const bronze = lambert(style.bronze);
  const y = 0.9;
  for (const s of [-1, 1]) put(g, new THREE.CylinderGeometry(0.035, 0.035, 0.9, 4), bronze, s * 0.12, y + 0.45, 0);
  const body = put(g, new THREE.SphereGeometry(0.32, 8, 6).scale(0.8, 0.75, 1.4), bronze, 0, y + 1.05, -0.05);
  body.rotation.x = 0.25;
  const neck = put(g, new THREE.CylinderGeometry(0.05, 0.07, 0.9, 5), bronze, 0, y + 1.6, 0.32);
  neck.rotation.x = 0.35;
  put(g, new THREE.SphereGeometry(0.09, 6, 4), bronze, 0, y + 2.02, 0.48);
  const beak = put(g, new THREE.ConeGeometry(0.03, 0.32, 4), bronze, 0, y + 2.08, 0.66);
  beak.rotation.x = Math.PI / 2 - 0.4;
  put(g, new THREE.ConeGeometry(0.14, 0.4, 4).rotateX(-Math.PI / 2 - 0.5), bronze, 0, y + 0.95, -0.55); // đuôi
  return 0.7;
}

/** Rùa đồng (銅龜) trên bệ thấp: mai vòm, đầu rồng ngẩng. Va chạm hộp — trả về [rộng, sâu]. */
export function ruaDong(g: THREE.Group, style: Style): [number, number] {
  plinth(g, style, 1.6, 0.5);
  const bronze = lambert(style.bronze);
  const y = 0.6;
  put(g, new THREE.SphereGeometry(0.62, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.75, 1.25), bronze, 0, y, 0);
  put(g, new THREE.TorusGeometry(0.6, 0.06, 4, 16).rotateX(Math.PI / 2).scale(1, 1, 1.25), bronze, 0, y + 0.02, 0);
  const neck = put(g, new THREE.CylinderGeometry(0.11, 0.14, 0.5, 6), bronze, 0, y + 0.25, 0.82);
  neck.rotation.x = 0.9;
  put(g, new THREE.SphereGeometry(0.17, 6, 5).scale(0.9, 0.8, 1.3), bronze, 0, y + 0.45, 1.02);
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]] as const) {
    put(g, new THREE.SphereGeometry(0.13, 5, 4).scale(1, 0.6, 1.4), bronze, sx * 0.55, y + 0.05, sz * 0.55);
  }
  return [1.8, 1.8];
}

/**
 * Lạc đà hai bướu (駱駝) đứng nghỉ, chở hai túi hàng; cổ + đầu cúi xuống ngẩng lên chậm (nhai cỏ).
 * Va chạm hộp — trả về [rộng, sâu].
 */
export function lacDa(g: THREE.Group, style: Style, seed: number, updaters: Updater[], animate = true): [number, number] {
  const fur = lambert('#b98a55');
  const dark = lambert('#7a5634');
  const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.3, 5);
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]] as const) put(g, legGeo, fur, sx * 0.25, 0.65, sz * 0.75);
  put(g, new THREE.SphereGeometry(0.5, 8, 6).scale(0.8, 0.75, 1.75), fur, 0, 1.55, 0);
  for (const z of [-0.4, 0.35]) put(g, new THREE.SphereGeometry(0.3, 7, 5).scale(1, 1.1, 1), fur, 0, 1.95, z);
  // túi hàng vắt hai bên (tơ lụa)
  for (const s of [-1, 1]) put(g, new THREE.BoxGeometry(0.22, 0.5, 0.7), lambert(style.cloth), s * 0.5, 1.45, -0.02);
  put(g, new THREE.BoxGeometry(0.06, 0.05, 1), dark, 0, 2.1, -0.02);
  // cổ + đầu xoay quanh vai: cổ vươn lên trước, cúi xuống gặm rồi ngẩng
  const head = new THREE.Group();
  head.position.set(0, 1.7, 0.8);
  put(head, new THREE.CylinderGeometry(0.1, 0.15, 0.95, 6).translate(0, 0.47, 0), fur, 0, 0, 0);
  put(head, new THREE.BoxGeometry(0.2, 0.22, 0.5), fur, 0, 0.98, 0.16);
  for (const s of [-1, 1]) put(head, new THREE.ConeGeometry(0.04, 0.12, 4), dark, s * 0.08, 1.12, -0.02);
  g.add(head);
  if (!animate) {
    head.rotation.x = 0.35; // đi trong đoàn: ngẩng, gộp được cùng thân
    return [1, 2.6];
  }
  head.traverse((o) => markDynamic(o));
  let t = seed;
  updaters.push((dt) => {
    t += dt;
    // đứng ngẩng (0,35 rad) — cúi gặm (≈ 1,5 rad), chu kỳ ~7 s, khác pha theo con
    head.rotation.x = 0.35 + 1.15 * Math.max(0, Math.sin(t * 0.9)) ** 2;
  });
  return [1, 2.6];
}

/** Bích hoạ (壁畫) tự vẽ: nền đất nung, mây cuộn, dải lụa bay, hoa sen — hoa văn, không chép tranh thật. */
export function drawMural(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.fillStyle = '#c99a62';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#7a3a24';
  g.lineWidth = w * 0.025;
  g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, w - g.lineWidth, h - g.lineWidth);
  // mây cuộn
  g.strokeStyle = '#3f6f6a';
  g.lineWidth = w * 0.012;
  for (const [cx, cy, r] of [[0.2, 0.22, 0.07], [0.78, 0.18, 0.06], [0.55, 0.3, 0.05]] as const) {
    g.beginPath();
    g.arc(cx * w, cy * h, r * w, 0, Math.PI * 1.6);
    g.arc((cx + r * 0.9) * w, cy * h, r * 0.6 * w, Math.PI, Math.PI * 2.6);
    g.stroke();
  }
  // hai dải lụa bay chéo
  for (const [color, dy] of [['#a8382a', 0], ['#e2c27a', 0.08]] as const) {
    g.strokeStyle = color;
    g.lineWidth = w * 0.03;
    g.beginPath();
    g.moveTo(w * 0.08, h * (0.7 + dy));
    g.bezierCurveTo(w * 0.35, h * (0.35 + dy), w * 0.6, h * (0.85 + dy), w * 0.92, h * (0.45 + dy));
    g.stroke();
  }
  // hoa sen dưới đáy
  g.fillStyle = '#d98a7a';
  for (let i = 0; i < 5; i++) {
    const cx = w * (0.16 + i * 0.17);
    for (const a of [-0.5, 0, 0.5]) {
      g.beginPath();
      g.ellipse(cx + Math.sin(a) * w * 0.02, h * 0.9, w * 0.018, h * 0.05, a, 0, Math.PI * 2);
      g.fill();
    }
  }
}

/** Cửa hang trong vách đá (石窟): vách đá thô, cửa vòm tối, tấm bích hoạ hai bên cửa. Va chạm hộp [rộng, sâu]. */
export function hang(g: THREE.Group, style: Style): [number, number] {
  const rock = lambert('#b07a4e');
  const cliff = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1).scale(4.4, 3.4, 1.6), rock);
  cliff.position.set(0, 2.6, -0.6);
  g.add(cliff);
  // cửa vòm tối (mặt phẳng hình vòm sát mặt vách)
  const s = new THREE.Shape();
  s.moveTo(-0.9, 0);
  s.lineTo(-0.9, 1.4);
  s.absarc(0, 1.4, 0.9, Math.PI, 0, true);
  s.lineTo(0.9, 0);
  s.closePath();
  put(g, new THREE.ShapeGeometry(s, 10), new THREE.MeshBasicMaterial({ color: '#1e140e' }), 0, 0.02, 1.02);
  put(g, new THREE.TorusGeometry(0.98, 0.1, 4, 12, Math.PI), lambert(style.stone), 0, 1.4, 1.02);
  for (const sx of [-1, 1]) {
    const m = signMesh(1.3, 1.7, 208, 272, drawMural);
    m.position.set(sx * 2.05, 1.7, 1.0);
    m.rotation.y = -sx * 0.18;
    g.add(m);
  }
  return [8.8, 3];
}
