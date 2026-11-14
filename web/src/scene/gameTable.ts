/**
 * Bàn chơi khu giao lưu (R-GIAO-1): bàn đá thấp, bồ đoàn cho người chơi phía +z, NPC đứng phía −z. Bàn `co` có mặt
 * gỗ kẻ 13 × 13 đường + quân đen / trắng (InstancedMesh — 2 draw call cho cả bàn quân, R-CO-1); bàn `dau-chu` có thẻ
 * giấy hiện bộ thủ (R-DAU-1). Không biết luật chơi — `gamePlay.ts` (gốc) đưa trạng thái vào.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Style } from './kien_truc/chi_tiet';
import { gameSign } from './kien_truc/do_pho';
import { box } from './kien_truc/hinh';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { Seat } from './seat';
import { GAME_SLOT, rotateXZ, type GameSignSpec, type GameTableSpec } from './spec';

/** Số đường mỗi chiều (Ngũ Tử Kỳ 13 × 13 giao điểm). Trùng `games/gomoku.ts` BOARD_SIZE — scene không import games. */
const LINES = 13;
/** Khoảng cách hai đường (m). */
const CELL = 0.1;
const SPAN = (LINES - 1) * CELL;
/** Mặt bàn cao, bàn sâu (m) — × 1,3 cho vừa nhân vật chibi (L-8, như `FURN` của kien_truc/do_pho). */
const TOP_Y = 0.5;
const TOP = 2.0;
/** Ghế người chơi / chỗ NPC đứng, theo trục z cục bộ (L-8: ghế 1,1 → 1,4). */
export const SEAT_Z = 1.4;
const NPC_Z = -1.55;
/** Bồ đoàn: bán kính mặt trên / đáy, cao (L-8: ~0,42 như mọi nơi). */
const CUSHION_TOP = 0.42;
const CUSHION_BOT = 0.46;
/** Chân bàn mỗi chỗ chơi (m). */
const FOOT = 1.3;
const STONE_R = 0.042;
const BLACK = '#0b0b0d';
const WHITE = '#f2efe6';
const GLOW = '#ffd66b';
/** chấm son nước vừa đi — token `lacquer` */
const LACQUER = '#a8322a';
const WOOD = '#d9b47a';
const INK = '#4a3420';

export interface BoardPoint {
  x: number;
  y: number;
}

/** Một chỗ chơi (bàn vuông = 1 chỗ; bàn dài `boards` = nhiều chỗ dọc bàn). */
export interface GameTable {
  readonly spec: GameTableSpec;
  /** ghế (toạ độ cảnh), hướng nhìn vào bàn: [0] phía +z cục bộ; bàn dài thêm [1] phía −z (đối diện) */
  readonly seats: readonly Seat[];
  /** chỗ NPC đứng (toạ độ cảnh) + hướng nhìn (độ, như `NpcSpec.rotY`); `null` = không NPC đứng (`npcStand: false`) */
  readonly npcSpot: { x: number; z: number; rotY: number } | null;
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
  /** làm sáng các giao điểm (5 quân thắng — viền vàng, R-CO-3) */
  highlight(points: readonly BoardPoint[]): void;
  /** chấm son trên quân vừa đi (thiết kế 2026-11-13.27); `null` = bỏ chấm */
  mark(point: BoardPoint | null): void;
  /** thẻ bộ thủ trên bàn đấu chữ, chữ quay về ghế `seat`; `null` = úp thẻ (R-DAU-1) */
  showCard(text: string | null, seat?: number): void;
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

/** Một chỗ chơi: tâm (toạ độ cảnh), `sx` dọc trục x cục bộ, các ghế (bàn dài: nam rồi bắc). */
export interface TableSlot {
  sx: number;
  x: number;
  z: number;
  seats: Seat[];
}

/** Vị trí các chỗ chơi + ghế của bàn `t` — thuần, không dựng gì (R-GIAO-1). */
export function tableSlots(t: GameTableSpec, y0 = 0): TableSlot[] {
  const rot = t.rotY ?? 0;
  const angle = (rot * Math.PI) / 180;
  const long = t.boards !== undefined;
  const n = long ? Math.max(1, Math.round(t.boards ?? 1)) : 1;
  const at = (x: number, z: number): [number, number] => {
    const [dx, dz] = rotateXZ(x, z, rot);
    return [t.x + dx, t.z + dz];
  };
  return Array.from({ length: n }, (_, k) => {
    const sx = (k - (n - 1) / 2) * GAME_SLOT;
    const [x, z] = at(sx, 0);
    const seats = (long ? [1, -1] : [1]).map((side): Seat => {
      const [px, pz] = at(sx, side * SEAT_Z);
      return { x: px, y: y0, z: pz, rotY: side > 0 ? angle + Math.PI : angle };
    });
    return { sx, x, z, seats };
  });
}

/**
 * Dựng bàn chơi; trả một `GameTable` cho mỗi chỗ chơi. Không `boards` → bàn vuông một ghế (+z), NPC đứng phía −z như cũ.
 * Có `boards` → bàn đá dài `boards` chỗ dọc trục x cục bộ, mỗi chỗ hai bồ đoàn đối diện (R-GIAO-1).
 */
export function addGameTable(scene: THREE.Scene, colliders: Colliders, t: GameTableSpec, style: Style, y0 = 0): GameTable[] {
  const rot = t.rotY ?? 0;
  const angle = (rot * Math.PI) / 180;
  const long = t.boards !== undefined;
  const n = long ? Math.max(1, Math.round(t.boards ?? 1)) : 1;
  const length = long ? n * GAME_SLOT : TOP;
  const g = new THREE.Group();
  g.position.set(t.x, y0, t.z);
  g.rotation.y = angle;

  // bàn đá thấp (dài) + chân mỗi chỗ (đứng yên → gộp)
  g.add(box(length, 0.12, TOP, style.base, 0, TOP_Y - 0.06, 0));
  const cushionGeo = new THREE.CylinderGeometry(CUSHION_TOP, CUSHION_BOT, 0.14, 12);
  const slotX = Array.from({ length: n }, (_, k) => (k - (n - 1) / 2) * GAME_SLOT);
  for (const sx of slotX) {
    g.add(box(FOOT, TOP_Y - 0.12, FOOT, style.base, sx, (TOP_Y - 0.12) / 2, 0));
    for (const side of long ? [1, -1] : [1]) {
      const cushion = new THREE.Mesh(cushionGeo, lambert('#8a3b2c'));
      cushion.position.set(sx, 0.07, side * SEAT_Z);
      g.add(cushion);
    }
  }
  scene.add(g);

  const at = (x: number, z: number): [number, number] => {
    const [dx, dz] = rotateXZ(x, z, rot);
    return [t.x + dx, t.z + dz];
  };
  const [cx, cz] = at(0, 0);
  const across = rot % 180 !== 0;
  colliders.add(cx, cz, across ? TOP : length, across ? length : TOP); // quay bội 90; bàn thấp không che camera

  const isBoard = t.kind === 'co';
  const boardTex = isBoard ? boardTexture() : null;
  const stoneGeo = new THREE.CylinderGeometry(STONE_R, STONE_R * 1.05, 0.03, 12);
  const glowGeo = new THREE.CylinderGeometry(STONE_R * 1.45, STONE_R * 1.45, 0.012, 16);
  const markGeo = new THREE.CylinderGeometry(STONE_R / 3, STONE_R / 3, 0.004, 10); // ≈ 1/3 đường kính quân
  const npcStand = t.npcStand !== false;

  const seatsAt = tableSlots(t, y0);
  const slots = slotX.map((sx, k): GameTable => {
    const slot = new THREE.Group();
    slot.position.x = sx;
    g.add(slot);
    // mặt bàn: bàn cờ (gỗ kẻ lưới) hoặc mặt đá trơn cho bàn đấu chữ
    const topMat = boardTex ? new THREE.MeshLambertMaterial({ map: boardTex }) : lambert(style.base);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(SPAN + 0.16, SPAN + 0.16), topMat);
    top.rotation.x = -Math.PI / 2;
    top.position.y = TOP_Y + 0.003;
    markDynamic(top); // đích tia dò — không gộp
    slot.add(top);

    // quân + vầng sáng (chỉ bàn cờ)
    const makeSet = (color: string, count: number, geo: THREE.BufferGeometry, basic = false): THREE.InstancedMesh => {
      const mat = basic ? new THREE.MeshBasicMaterial({ color }) : lambert(color);
      const m = new THREE.InstancedMesh(geo, mat, count);
      m.count = 0;
      markDynamic(m);
      slot.add(m);
      return m;
    };
    const blacks = isBoard ? makeSet(BLACK, LINES * LINES, stoneGeo) : null;
    const whites = isBoard ? makeSet(WHITE, LINES * LINES, stoneGeo) : null;
    const glow = isBoard ? makeSet(GLOW, LINES, glowGeo, true) : null;
    const dot = isBoard ? makeSet(LACQUER, 1, markGeo, true) : null;

    // thẻ bộ thủ (chỉ bàn đấu chữ)
    let card: { canvas: HTMLCanvasElement; tex: THREE.CanvasTexture; mesh: THREE.Mesh } | null = null;
    if (t.kind === 'dau-chu') {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      drawCard(canvas, null);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tex }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, TOP_Y + 0.006, 0);
      markDynamic(mesh);
      slot.add(mesh);
      card = { canvas, tex, mesh };
    }

    const seats = seatsAt[k].seats;
    const [nx, nz] = at(sx, NPC_Z);
    const [ox, oz] = at(sx, 0);
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
      seats,
      npcSpot: npcStand && !long ? { x: nx, z: nz, rotY: rot } : null,
      center: new THREE.Vector3(ox, y0 + TOP_Y, oz),
      angle,
      top,
      pointAt(world) {
        if (!isBoard) return null;
        local.copy(world);
        slot.updateWorldMatrix(true, false);
        slot.worldToLocal(local);
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
      mark(point) {
        if (dot) place(dot, point ? [point] : [], TOP_Y + 0.035); // trên mặt quân (quân cao 0,03 từ 0,018)
      },
      showCard(text, seat = 0) {
        if (!card) return;
        drawCard(card.canvas, text);
        card.tex.needsUpdate = true;
        card.mesh.rotation.z = seat === 1 ? Math.PI : 0; // chữ quay về người ngồi phía −z
      },
    };
  });
  g.updateMatrixWorld(true);
  return slots;
}

/** Biển tên trò của bàn (R-GIAO-2) tại (sign.x, sign.z), chân ở `y0`; vật cản theo hộp biển. */
export function addGameSign(scene: THREE.Scene, colliders: Colliders, sign: GameSignSpec, style: Style, y0 = 0): void {
  const rot = sign.rotY ?? 0;
  const g = new THREE.Group();
  g.position.set(sign.x, y0, sign.z);
  g.rotation.y = (rot * Math.PI) / 180;
  const b = gameSign(g, style, sign.han, sign.name);
  const [w, d] = rot % 180 !== 0 ? [b.d, b.w] : [b.w, b.d];
  colliders.add(sign.x, sign.z, w, d);
  scene.add(g);
}
