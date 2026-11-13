/**
 * Nội thất nhà vào được, theo mặt bằng canvas `NoiThat-mat-bang` (đề xuất 2026-11-11, người dùng cho code theo).
 * Toạ độ nhà: tâm (0, 0), mặt trước (cửa) nhìn +z, sàn ở độ cao `floor`. Đồ đạc tĩnh gộp chung với cảnh;
 * hộp bắt chạm vô hình (`hits`) không gộp, để chạm vào vật mở bài (R-VUNG-2).
 * Bảng đen, bục to theo hệ số chiều cao (`hk`); án thư, kệ, án đọc giữ cỡ người — phòng to thì xếp thêm hàng / thêm kệ
 * (đặt theo kích thước phòng: nhà cỡ gốc hệ số 1 ra đúng mặt bằng cũ).
 */
import * as THREE from 'three';
import type { BuildingSpec, InteriorKind } from '../spec';
import { markDynamic } from '../merge';
import { makeCanvasTex } from '../textures';
import { box, column } from './hinh';
import { hk, type Style } from './chi_tiet';

/** Hộp va chạm trong hệ toạ độ nhà: tâm (x, z), rộng w (theo x), sâu d (theo z). */
export interface LocalBox {
  x: number;
  z: number;
  w: number;
  d: number;
  /** > 0: vật cao che tầm nhìn camera (tường nhà) — R-DIEU-4 */
  h?: number;
  /** chỉ chặn khi chân nhân vật ở khoảng cao này (m, tính từ chân nhà) — nhà nhiều tầng (R-VA-3); thiếu = mọi độ cao */
  minY?: number;
  maxY?: number;
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
    g.font = '700 200px "Han Serif", "Noto Serif CJK SC", "Noto Serif SC", "Songti SC", "SimSun", serif';
    g.fillText(han, w / 2, h / 2 + 8);
  });
}

/** Án thư: lối giữa rộng 3,6 m, hai án cạnh nhau cách 2,2 m, hàng cách 1,6 m; chừa 0,6 m sát tường, 1,25 m trước cửa. */
const DESK_X0 = 2.6;
const DESK_PITCH_X = 2.2;
const DESK_PITCH_Z = 1.6;

/** Lớp học: bảng đen + chữ phấn, bục giảng, chỗ thầy, án thư + bồ đoàn xếp đầy phòng, lối giữa thẳng từ cửa tới bảng. */
function lopHoc(g: THREE.Group, b: BuildingSpec, floor: number, han: string, k: number): Furnished {
  const zi = -(b.d - 0.8) / 2 + 0.25; // mặt trong tường sau
  const xi = (b.w - 0.8) / 2 - 0.25; // mặt trong tường bên
  const zFront = (b.d - 0.8) / 2 - 0.25; // mặt trong tường trước
  const boxes: LocalBox[] = [];
  // bảng đen 4 m × 1,6 (× hệ số), khung gỗ, chữ phấn
  const bw = 4 * k;
  const bh = 1.6 * k;
  const by = floor + 1.85 * k;
  g.add(box(bw + 0.3, bh + 0.3, 0.08, WOOD, 0, by, zi + 0.04));
  g.add(box(bw, bh, 0.06, BOARD, 0, by, zi + 0.09));
  const chalk = new THREE.Mesh(new THREE.PlaneGeometry(1.3 * k, 1.3 * k), new THREE.MeshBasicMaterial({ map: chalkTex(han), transparent: true }));
  chalk.position.set(0, by, zi + 0.125);
  g.add(chalk);
  // bục giảng rộng 6 m (× hệ số), sâu 1, cao 0,2
  const podiumZ = zi + 0.7;
  const pw = 6 * k;
  g.add(box(pw, 0.2, 1, PODIUM, 0, floor + 0.1, podiumZ));
  boxes.push({ x: 0, z: podiumZ, w: pw, d: 1 });
  // án thư 1,6 × 0,6 xếp đầy phòng (nhà gốc 13 × 7: 2 hàng × 2), lối giữa; bồ đoàn phía cửa
  const rows: number[] = [];
  for (let z = zi + 2.85; z <= zFront - 1.25 + 1e-6; z += DESK_PITCH_Z) rows.push(z);
  const cols: number[] = [];
  for (let x = DESK_X0; x + 0.8 <= xi - 0.6 + 1e-6 || x === DESK_X0; x += DESK_PITCH_X) cols.push(-x, x);
  for (const z of rows) {
    for (const x of cols) {
      g.add(box(1.6, 0.06, 0.6, WOOD, x, floor + 0.38, z));
      for (const s of [-1, 1]) g.add(box(0.06, 0.35, 0.5, WOOD, x + s * 0.7, floor + 0.175, z));
      g.add(column(0.28, 0.12, CUSHION, x, floor, z + 0.6, 10));
      boxes.push({ x, z, w: 1.6, d: 0.6 });
    }
  }
  // thầy đứng trên bục, cạnh mép trái bảng
  const teacher = { x: -(bw / 2 + 0.6), y: floor + 0.2, z: podiumZ };
  boxes.push({ x: teacher.x, z: teacher.z, w: 0.9, d: 0.9 });
  const hits = [
    hitBox(g, bw + 0.4, bh + 0.6, 0.8, 0, by, zi + 0.3), // bảng đen
    hitBox(g, 1, 2.1, 1, teacher.x, floor + 1.25, teacher.z), // thầy
  ];
  return { boxes, hits, teacher, anchor: new THREE.Vector3(0, by + bh / 2 + 0.4, zi + 0.3) };
}

/** Một kệ sách dài `len` (theo trục x của kệ), 4 tầng gáy sách nhiều màu; mặt sách nhìn về +z của kệ. */
export function shelf(g: THREE.Group, len: number, x: number, z: number, rotY: number, floor: number, seed: number): void {
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

/** Kệ đứng giữa phòng (thư viện rộng): dài 2 m, cách kệ sau 1,3 m; chỉ đặt khi lối hai bên còn ≥ 1,1 m. */
const FREE_SHELF = 2;

/**
 * Thư viện: kệ sách tường sau + hai tường bên (dài theo phòng), phòng rộng thì thêm hai kệ đứng; án đọc giữa phòng.
 * `stairX` = gian cầu thang bắt đầu từ x này về +x (Tàng Thư Các): bỏ kệ bên phải, kệ sau dừng trước gian đó.
 */
function thuVien(g: THREE.Group, b: BuildingSpec, floor: number, stairX?: number): Furnished {
  const zi = -(b.d - 0.8) / 2 + 0.25;
  const xi = (b.w - 0.8) / 2 - 0.25;
  const id = b.d - 0.8;
  const boxes: LocalBox[] = [];
  const backEnd = stairX === undefined ? xi - 0.05 : stairX - 0.15;
  const backLen = backEnd + xi - 0.05;
  const backX = (backEnd - xi + 0.05) / 2;
  shelf(g, backLen, backX, zi + 0.225, 0, floor, 1);
  boxes.push({ x: backX, z: zi + 0.225, w: backLen, d: 0.45 });
  // kệ hai bên: từ kệ sau ra tới cách tường trước ~1,75 m (nhà gốc: 3 m)
  const sideLen = Math.max(3, id - 2.2);
  const sideZ = zi + 0.45 + sideLen / 2;
  const sides = stairX === undefined ? [-1, 1] : [-1];
  shelf(g, sideLen, -xi + 0.225, sideZ, Math.PI / 2, floor, 7);
  if (stairX === undefined) shelf(g, sideLen, xi - 0.225, sideZ, -Math.PI / 2, floor, 13);
  for (const s of sides) boxes.push({ x: s * (xi - 0.225), z: sideZ, w: 0.45, d: sideLen });
  // kệ đứng: lối giữa ≥ 2,8 m, lối tới kệ bên ≥ 1,1 m, cách án đọc ≥ 1,5 m
  const freeX = 1.4 + FREE_SHELF / 2;
  const freeZ = zi + 0.45 + 1.3 + 0.225;
  const extra: [number, number][] = [];
  const EPS = 1e-6;
  if (xi - 0.45 - (freeX + FREE_SHELF / 2) >= 1.1 - EPS && -0.35 - (freeZ + 0.225) >= 1.5 - EPS) {
    for (const s of [-1, 1]) {
      shelf(g, FREE_SHELF, s * freeX, freeZ, 0, floor, 19 + s * 4);
      boxes.push({ x: s * freeX, z: freeZ, w: FREE_SHELF, d: 0.45 });
      extra.push([s * freeX, freeZ]);
    }
  }
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
    hitBox(g, backLen, 2.4, 0.6, backX, floor + 1.2, zi + 0.225), // kệ sau
    ...sides.map((s) => hitBox(g, 0.6, 2.4, sideLen, s * (xi - 0.225), floor + 1.2, sideZ)),
    ...extra.map(([x, z]) => hitBox(g, FREE_SHELF + 0.1, 2.4, 0.6, x, floor + 1.2, z)),
  ];
  return { boxes, hits, anchor: new THREE.Vector3(0, floor + 1.9, 0) };
}

/** Dựng nội thất theo kiểu; `han` = chữ trên bảng (lớp học); `stairX` = chừa gian cầu thang (thư viện, xem `thuVien`). */
export function addInterior(
  g: THREE.Group,
  b: BuildingSpec,
  style: Style,
  kind: InteriorKind,
  floor: number,
  han: string,
  stairX?: number,
): Furnished {
  return kind === 'lop-hoc' ? lopHoc(g, b, floor, han, hk(style)) : thuVien(g, b, floor, stairX);
}
