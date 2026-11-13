/**
 * Bàn chơi khu giao lưu (R-GIAO-1): bàn đá thấp, bồ đoàn cho người chơi phía +z, NPC đứng phía −z. Bàn `co` có mặt
 * gỗ kẻ 13 × 13 đường + quân đen / trắng (InstancedMesh — 2 draw call cho cả bàn quân, R-CO-1); bàn `dau-chu` có thẻ
 * giấy hiện bộ thủ (R-DAU-1). Không biết luật chơi — `gamePlay.ts` (gốc) đưa trạng thái vào.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './kien_truc/chi_tiet';
import { box } from './kien_truc/hinh';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { Seat } from './rapPhim';
import { rotateXZ, type GameTableSpec } from './spec';

/** Số đường mỗi chiều (Ngũ Tử Kỳ 13 × 13 giao điểm). Trùng `games/gomoku.ts` BOARD_SIZE — scene không import games. */
const LINES = 13;
/** Khoảng cách hai đường (m). */
const CELL = 0.1;
const SPAN = (LINES - 1) * CELL;
const TOP_Y = 0.42;
const TOP = 1.6;
/** Ghế người chơi / chỗ NPC đứng, theo trục z cục bộ. */
const SEAT_Z = 1.1;
const NPC_Z = -1.25;
const STONE_R = 0.042;
const BLACK = '#0b0b0d';
const WHITE = '#f2efe6';
const GLOW = '#ffd66b';
const WOOD = '#d9b47a';
const INK = '#4a3420';

export interface BoardPoint {
  x: number;
  y: number;
}

export interface GameTable {
  readonly spec: GameTableSpec;
  /** chỗ ngồi của người chơi (toạ độ cảnh), hướng nhìn về NPC */
  readonly seat: Seat;
  /** chỗ NPC đứng (toạ độ cảnh) + hướng nhìn (độ, như `NpcSpec.rotY`) */
  readonly npcSpot: { x: number; z: number; rotY: number };
  /** tâm mặt bàn (toạ độ cảnh) — camera nhìn vào đây khi ngồi chơi */
  readonly center: THREE.Vector3;
  /** góc quay của bàn (radian) */
  readonly angle: number;
  /** mặt bàn — đích tia dò khi chạm */
  readonly top: THREE.Mesh;
  /** điểm trên mặt bàn (toạ độ cảnh) → giao điểm gần nhất; ngoài bàn → `null` (chỉ bàn `co`) */
  pointAt(world: THREE.Vector3): BoardPoint | null;
  /** vẽ lại quân theo `cells` (0 trống · 1 đen · 2 trắng, chỉ số y × 13 + x) */
  setStones(cells: ArrayLike<number>): void;
  /** làm sáng các giao điểm (quân thắng R-CO-3, hoặc nước NPC vừa đi) */
  highlight(points: readonly BoardPoint[]): void;
  /** thẻ bộ thủ trên bàn đấu chữ; `null` = úp thẻ (R-DAU-1) */
  showCard(text: string | null): void;
}

/** Mặt bàn cờ: gỗ + lưới 13 × 13 + 5 điểm sao. */
function boardTexture(): THREE.CanvasTexture {
  const px = 512;
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = WOOD;
    g.fillRect(0, 0, px, px);
    const k = px / (SPAN + 0.16); // mặt gỗ rộng hơn lưới 8 cm mỗi bên
    const o = 0.08 * k;
    g.strokeStyle = INK;
    g.lineWidth = 2;
    for (let i = 0; i < LINES; i++) {
      const p = o + i * CELL * k;
      g.beginPath();
      g.moveTo(o, p);
      g.lineTo(px - o, p);
      g.moveTo(p, o);
      g.lineTo(p, px - o);
      g.stroke();
    }
    g.fillStyle = INK;
    for (const [i, j] of [[3, 3], [9, 3], [6, 6], [3, 9], [9, 9]]) {
      g.beginPath();
      g.arc(o + i * CELL * k, o + j * CELL * k, 5, 0, Math.PI * 2);
      g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Thẻ giấy vẽ một chữ (font "Han Serif" — `main.ts` nạp trước). */
function drawCard(canvas: HTMLCanvasElement, text: string | null): void {
  const g = canvas.getContext('2d');
  if (!g) return;
  const s = canvas.width;
  g.fillStyle = text ? '#f4ead2' : '#8a3b2c';
  g.fillRect(0, 0, s, s);
  g.strokeStyle = '#6b4a2a';
  g.lineWidth = 8;
  g.strokeRect(8, 8, s - 16, s - 16);
  if (!text) return;
  g.fillStyle = '#1d1d1f';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(s * 0.62)}px "Han Serif", serif`;
  g.fillText(text, s / 2, s / 2 + s * 0.03);
}

const pointLocal = (p: BoardPoint): [number, number] => [-SPAN / 2 + p.x * CELL, -SPAN / 2 + p.y * CELL];

export function addGameTable(scene: THREE.Scene, colliders: Colliders, t: GameTableSpec, style: Style, y0 = 0): GameTable {
  const rot = t.rotY ?? 0;
  const angle = (rot * Math.PI) / 180;
  const g = new THREE.Group();
  g.position.set(t.x, y0, t.z);
  g.rotation.y = angle;

  // bàn đá thấp + chân + bồ đoàn (đứng yên → gộp)
  g.add(box(TOP, 0.12, TOP, style.base, 0, TOP_Y - 0.06, 0));
  g.add(box(1.0, TOP_Y - 0.12, 1.0, style.base, 0, (TOP_Y - 0.12) / 2, 0));
  const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.14, 12), lambert('#8a3b2c'));
  cushion.position.set(0, 0.07, SEAT_Z);
  g.add(cushion);

  // mặt bàn: bàn cờ (gỗ kẻ lưới) hoặc mặt đá trơn cho bàn đấu chữ
  const topMat =
    t.kind === 'co' ? new THREE.MeshLambertMaterial({ map: boardTexture() }) : lambert(style.base);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(SPAN + 0.16, SPAN + 0.16), topMat);
  top.rotation.x = -Math.PI / 2;
  top.position.y = TOP_Y + 0.003;
  markDynamic(top); // đích tia dò — không gộp
  g.add(top);

  // quân + vầng sáng (chỉ bàn cờ)
  const stoneGeo = new THREE.CylinderGeometry(STONE_R, STONE_R * 1.05, 0.03, 12);
  const makeSet = (color: string, n: number, geo = stoneGeo, basic = false): THREE.InstancedMesh => {
    const mat = basic ? new THREE.MeshBasicMaterial({ color }) : lambert(color);
    const m = new THREE.InstancedMesh(geo, mat, n);
    m.count = 0;
    markDynamic(m);
    g.add(m);
    return m;
  };
  const isBoard = t.kind === 'co';
  const blacks = isBoard ? makeSet(BLACK, LINES * LINES) : null;
  const whites = isBoard ? makeSet(WHITE, LINES * LINES) : null;
  const glow = isBoard ? makeSet(GLOW, LINES, new THREE.CylinderGeometry(STONE_R * 1.45, STONE_R * 1.45, 0.012, 16), true) : null;

  // thẻ bộ thủ (chỉ bàn đấu chữ)
  let card: { canvas: HTMLCanvasElement; tex: THREE.CanvasTexture } | null = null;
  if (t.kind === 'dau-chu') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    drawCard(canvas, null);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tex }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, TOP_Y + 0.006, 0);
    markDynamic(m);
    g.add(m);
    card = { canvas, tex };
  }
  scene.add(g);
  g.updateMatrixWorld(true);

  const at = (x: number, z: number): [number, number] => {
    const [dx, dz] = rotateXZ(x, z, rot);
    return [t.x + dx, t.z + dz];
  };
  const [cx, cz] = at(0, 0);
  colliders.add(cx, cz, TOP, TOP); // mặt bàn vuông — quay bội 90 không đổi hộp; bàn thấp không che camera
  const [sx, sz] = at(0, SEAT_Z);
  const [nx, nz] = at(0, NPC_Z);

  const m4 = new THREE.Matrix4();
  const place = (mesh: THREE.InstancedMesh, pts: readonly BoardPoint[], y: number): void => {
    pts.forEach((p, i) => {
      const [lx, lz] = pointLocal(p);
      mesh.setMatrixAt(i, m4.makeTranslation(lx, y, lz));
    });
    mesh.count = pts.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  const local = new THREE.Vector3();

  return {
    spec: t,
    seat: { x: sx, y: y0, z: sz, rotY: angle + Math.PI },
    npcSpot: { x: nx, z: nz, rotY: rot },
    center: new THREE.Vector3(cx, y0 + TOP_Y, cz),
    angle,
    top,
    pointAt(world) {
      if (!isBoard) return null;
      local.copy(world);
      g.worldToLocal(local);
      const x = Math.round((local.x + SPAN / 2) / CELL);
      const y = Math.round((local.z + SPAN / 2) / CELL);
      return x >= 0 && y >= 0 && x < LINES && y < LINES ? { x, y } : null;
    },
    setStones(cells) {
      if (!blacks || !whites) return;
      const b: BoardPoint[] = [];
      const wh: BoardPoint[] = [];
      for (let i = 0; i < LINES * LINES; i++) {
        if (cells[i] === 1) b.push({ x: i % LINES, y: Math.floor(i / LINES) });
        else if (cells[i] === 2) wh.push({ x: i % LINES, y: Math.floor(i / LINES) });
      }
      place(blacks, b, TOP_Y + 0.018);
      place(whites, wh, TOP_Y + 0.018);
    },
    highlight(points) {
      if (glow) place(glow, points.slice(0, LINES), TOP_Y + 0.008);
    },
    showCard(text) {
      if (!card) return;
      drawCard(card.canvas, text);
      card.tex.needsUpdate = true;
    },
  };
}
