/**
 * Nội thất nhà vào được, theo mặt bằng canvas `NoiThat-mat-bang` (đề xuất 2026-11-11, người dùng cho code theo).
 * Toạ độ nhà: tâm (0, 0), mặt trước (cửa) nhìn +z, sàn ở độ cao `floor`. Đồ đạc tĩnh gộp chung với cảnh;
 * hộp bắt chạm vô hình (`hits`) không gộp, để chạm vào vật mở bài (R-VUNG-2).
 */
import * as THREE from 'three';
import type { BuildingSpec, InteriorKind } from '../spec';
import { markDynamic } from '../merge';
import { makeCanvasTex } from '../textures';
import { box, column } from './hinh';
import type { Style } from './chi_tiet';

/** Hộp va chạm trong hệ toạ độ nhà: tâm (x, z), rộng w (theo x), sâu d (theo z). */
export interface LocalBox {
  x: number;
  z: number;
  w: number;
  d: number;
}

export interface Furnished {
  /** vật cản (R-VA-3) */
  boxes: LocalBox[];
  /** hộp bắt chạm vô hình của vật học */
  hits: THREE.Mesh[];
  /** chỗ thầy đứng (lớp học) */
  teacher?: { x: number; y: number; z: number };
  /** điểm treo nút học nổi, trên vật học */
  anchor: THREE.Vector3;
}

const WOOD = '#3a2418';
const WOOD_SHELF = '#6b4a2e';
const PODIUM = '#b08a60';
const BOARD = '#2f3a2c';
const CHALK = '#f5f1e3';
const CUSHION = '#8a3b2c';
const PAGE = '#f3e6c8';
const SPINES = ['#8fa6b8', '#c9a57a', '#a8b89a', '#d9cbb0', '#9c6b5a'];

const hitMat = new THREE.MeshBasicMaterial({ visible: false });

function hitBox(g: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hitMat);
  m.position.set(x, y, z);
  markDynamic(m); // không gộp: tia dò chạm cần đúng vật này
  g.add(m);
  return m;
}

/** Chữ phấn trên bảng: chữ Hán trắng trên nền trong suốt. */
function chalkTex(han: string): THREE.CanvasTexture {
  return makeCanvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = CHALK;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '700 200px "Noto Serif CJK SC", "Noto Serif SC", "Songti SC", "SimSun", serif';
    g.fillText(han, w / 2, h / 2 + 8);
  });
}

/** Lớp học: bảng đen + chữ phấn, bục giảng, chỗ thầy, 4 án thư + bồ đoàn, lối giữa thẳng từ cửa tới bảng. */
function lopHoc(g: THREE.Group, b: BuildingSpec, floor: number, han: string): Furnished {
  const zi = -(b.d - 0.8) / 2 + 0.25; // mặt trong tường sau
  const boxes: LocalBox[] = [];
  // bảng đen 4 m, khung gỗ, chữ phấn
  g.add(box(4.3, 1.9, 0.08, WOOD, 0, floor + 1.85, zi + 0.04));
  g.add(box(4, 1.6, 0.06, BOARD, 0, floor + 1.85, zi + 0.09));
  const chalk = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: chalkTex(han), transparent: true }));
  chalk.position.set(0, floor + 1.85, zi + 0.125);
  g.add(chalk);
  // bục giảng 6 × 1 m, cao 0,2
  const podiumZ = zi + 0.7;
  g.add(box(6, 0.2, 1, PODIUM, 0, floor + 0.1, podiumZ));
  boxes.push({ x: 0, z: podiumZ, w: 6, d: 1 });
  // 4 án thư 1,6 × 0,6 (2 hàng × 2), lối giữa 3,6 m; bồ đoàn phía cửa
  for (const z of [zi + 2.85, zi + 4.45]) {
    for (const x of [-2.6, 2.6]) {
      g.add(box(1.6, 0.06, 0.6, WOOD, x, floor + 0.38, z));
      for (const s of [-1, 1]) g.add(box(0.06, 0.35, 0.5, WOOD, x + s * 0.7, floor + 0.175, z));
      g.add(column(0.28, 0.12, CUSHION, x, floor, z + 0.6, 10));
      boxes.push({ x, z, w: 1.6, d: 0.6 });
    }
  }
  const teacher = { x: -2.6, y: floor + 0.2, z: podiumZ };
  boxes.push({ x: teacher.x, z: teacher.z, w: 0.9, d: 0.9 });
  const hits = [
    hitBox(g, 4.4, 2.2, 0.8, 0, floor + 1.85, zi + 0.3), // bảng đen
    hitBox(g, 1, 2.1, 1, teacher.x, floor + 1.25, teacher.z), // thầy
  ];
  return { boxes, hits, teacher, anchor: new THREE.Vector3(0, floor + 3.05, zi + 0.3) };
}

/** Một kệ sách dài `len` (theo trục x của kệ), 4 tầng gáy sách nhiều màu; mặt sách nhìn về +z của kệ. */
function shelf(g: THREE.Group, len: number, x: number, z: number, rotY: number, floor: number, seed: number): void {
  const k = new THREE.Group();
  k.position.set(x, floor, z);
  k.rotation.y = rotY;
  const H = 2.3;
  const D = 0.45;
  k.add(box(len, H, 0.06, WOOD_SHELF, 0, H / 2, -D / 2 + 0.03)); // lưng kệ
  for (const s of [-1, 1]) k.add(box(0.06, H, D, WOOD_SHELF, s * (len / 2 - 0.03), H / 2, 0));
  for (let i = 0; i <= 4; i++) k.add(box(len, 0.05, D, WOOD_SHELF, 0, 0.1 + i * 0.53, 0));
  // gáy sách: khối liền theo đoạn, màu xoay vòng (không ngẫu nhiên — cảnh nào cũng giống nhau)
  for (let row = 0; row < 4; row++) {
    let at = -len / 2 + 0.1;
    let n = seed + row * 3;
    while (at < len / 2 - 0.2) {
      const seg = Math.min(0.35 + ((n * 37) % 5) * 0.12, len / 2 - 0.1 - at);
      const h = 0.34 + ((n * 13) % 4) * 0.035;
      k.add(box(seg - 0.02, h, D - 0.12, SPINES[n % SPINES.length], at + seg / 2, 0.125 + row * 0.53 + h / 2, 0.02));
      at += seg;
      n++;
    }
  }
  g.add(k);
}

/** Thư viện: kệ sách tường sau + hai tường bên, án đọc giữa phòng có sách mở. */
function thuVien(g: THREE.Group, b: BuildingSpec, floor: number): Furnished {
  const zi = -(b.d - 0.8) / 2 + 0.25;
  const xi = (b.w - 0.8) / 2 - 0.25;
  const boxes: LocalBox[] = [];
  const backLen = 2 * xi - 0.1;
  shelf(g, backLen, 0, zi + 0.225, 0, floor, 1);
  boxes.push({ x: 0, z: zi + 0.225, w: backLen, d: 0.45 });
  const sideZ = zi + 0.45 + 1.5;
  shelf(g, 3, -xi + 0.225, sideZ, Math.PI / 2, floor, 7);
  shelf(g, 3, xi - 0.225, sideZ, -Math.PI / 2, floor, 13);
  for (const s of [-1, 1]) boxes.push({ x: s * (xi - 0.225), z: sideZ, w: 0.45, d: 3 });
  // án đọc 1,4 × 0,7, sách mở hai trang nghiêng
  g.add(box(1.4, 0.06, 0.7, WOOD, 0, floor + 0.75, 0));
  for (const s of [-1, 1]) g.add(box(0.06, 0.72, 0.6, WOOD, s * 0.62, floor + 0.36, 0));
  for (const s of [-1, 1]) {
    const page = box(0.36, 0.02, 0.5, PAGE, s * 0.19, floor + 0.8, 0);
    page.rotation.z = -s * 0.12;
    g.add(page);
  }
  boxes.push({ x: 0, z: 0, w: 1.4, d: 0.7 });
  const hits = [
    hitBox(g, 1.6, 1.3, 0.9, 0, floor + 0.65, 0), // án đọc
    hitBox(g, backLen, 2.4, 0.6, 0, floor + 1.2, zi + 0.225), // kệ sau
    hitBox(g, 0.6, 2.4, 3, -xi + 0.225, floor + 1.2, sideZ),
    hitBox(g, 0.6, 2.4, 3, xi - 0.225, floor + 1.2, sideZ),
  ];
  return { boxes, hits, anchor: new THREE.Vector3(0, floor + 1.9, 0) };
}

/** Dựng nội thất theo kiểu; `han` = chữ trên bảng (lớp học). */
export function addInterior(g: THREE.Group, b: BuildingSpec, _style: Style, kind: InteriorKind, floor: number, han: string): Furnished {
  return kind === 'lop-hoc' ? lopHoc(g, b, floor, han) : thuVien(g, b, floor);
}
