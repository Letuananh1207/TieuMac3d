/**
 * Ảnh biển chung: mọi biển hiệu, cờ chữ, bảng giấy của một cảnh vẽ vào MỘT canvas 2048 × 2048, mỗi thứ một ô; các
 * tấm biển dùng chung một vật liệu nên `mergeStatic` gộp tất cả thành 1 draw call (trước: mỗi biển 1 draw call).
 * Mỗi lần dựng cảnh (`buildWorld`) gọi `resetSignAtlas()` để bắt đầu ảnh mới. Hết chỗ → biển đó dùng texture riêng.
 */
import * as THREE from 'three';
import type { SceneSpec } from './spec';
import { makeCanvasTex, SUNDIAL_HOURS } from './textures';

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

const SIZE = 2048;
/** khe giữa các ô: mipmap không lem màu ô bên cạnh */
const PAD = 6;

interface Atlas {
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  mat: THREE.MeshBasicMaterial;
  x: number;
  y: number;
  rowH: number;
}

let atlas: Atlas | null = null;

function create(): Atlas {
  const tex = makeCanvasTex(SIZE, SIZE, () => {});
  const ctx = (tex.image as HTMLCanvasElement).getContext('2d')!;
  return { ctx, tex, mat: new THREE.MeshBasicMaterial({ map: tex }), x: 0, y: 0, rowH: 0 };
}

/** Bắt đầu ảnh biển mới cho cảnh sắp dựng (cảnh cũ giữ ảnh của nó). */
export function resetSignAtlas(): void {
  atlas = null;
}

/** Xếp ô `pw` × `ph` px theo hàng (kệ). Trả về góc trên trái, hoặc null nếu hết chỗ. */
function place(a: Atlas, pw: number, ph: number): [number, number] | null {
  if (a.x + pw > SIZE) {
    a.x = 0;
    a.y += a.rowH + PAD;
    a.rowH = 0;
  }
  if (a.y + ph > SIZE) return null;
  const at: [number, number] = [a.x, a.y];
  a.x += pw + PAD;
  a.rowH = Math.max(a.rowH, ph);
  return at;
}

/**
 * Tấm phẳng `w` × `h` m (mặt nhìn +z) mang hình `draw` vẽ trong ô `pw` × `ph` px của ảnh chung.
 * `fadeable` = vật sẽ đổi độ mờ riêng (mái nhà vào được) → cũng được, vì `rooms.ts` nhân bản vật liệu khi làm mờ.
 */
export function signMesh(w: number, h: number, pw: number, ph: number, draw: Draw): THREE.Mesh {
  atlas ??= create();
  const at = place(atlas, pw, ph);
  const geo = new THREE.PlaneGeometry(w, h);
  if (!at) return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: makeCanvasTex(pw, ph, draw) }));
  const [px, py] = at;
  const { ctx } = atlas;
  ctx.save();
  ctx.translate(px, py);
  ctx.beginPath();
  ctx.rect(0, 0, pw, ph);
  ctx.clip();
  draw(ctx, pw, ph);
  ctx.restore();
  atlas.tex.needsUpdate = true;
  // uv của tấm (0..1) → ô trong ảnh; CanvasTexture lật trục dọc (v = 1 là mép trên canvas)
  const u0 = px / SIZE;
  const u1 = (px + pw) / SIZE;
  const v1 = 1 - py / SIZE;
  const v0 = 1 - (py + ph) / SIZE;
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
  return new THREE.Mesh(geo, atlas.mat);
}

/** Mọi chữ sẽ vẽ lên biển / cờ / bảng của cảnh: nạp font "Han Serif" cho các chữ Hán trong đó trước khi dựng. */
export function signText(spec: Pick<SceneSpec, 'buildings' | 'gates' | 'props' | 'gameTables' | 'walls' | 'wallSegments'>): string {
  const gateSigns = [...spec.walls.gates, ...spec.wallSegments.map((s) => s.gate)].flatMap((g) => Object.values(g?.signs ?? {}));
  return [
    ...gateSigns,
    ...spec.buildings.flatMap((b) => [b.title, b.sign ?? '']),
    ...spec.gates.flatMap((g) => [g.title, g.hanTitle ?? '']),
    ...spec.props.map((p) => p.text ?? (p.kind === 'nhat-quy' ? SUNDIAL_HOURS : '')),
    ...spec.gameTables.map((t) => t.sign?.han ?? ''),
  ].join('');
}
