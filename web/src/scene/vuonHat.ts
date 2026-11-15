/**
 * Bể hạt vườn rau (R-VUON-13): một `THREE.Points` cố định `garden.fx.pool` điểm — **1 draw call** cho mọi hạt giống rơi, tia
 * nước tưới, bụi đất, phân bón, lấp lánh xanh (bón / lớn) và lấp lánh vàng (chín). Không có hạt đang bay → ẩn (0 draw call).
 * Điểm tròn mềm (vân 16 × 16 dựng bằng mảng — không DOM), màu + độ trong theo điểm. Quỹ đạo / tuổi hạt là hàm thuần (`hatAt`)
 * để test. Lớp scene không biết luật: file ghép gọi `emit` / `stream` đúng mốc động tác (`player/lamVuonDang.ts` `WORK_FX`).
 */
import * as THREE from 'three';
import { markDynamic } from './merge';
import { seededRandom } from './random';
import type { GardenFxSpec } from './spec';

/** Đốm vàng mỗi giây quanh một cây chín. */
const GLOW_RATE = 2;

export type HatKind = 'seed' | 'water' | 'dust' | 'sparkle' | 'fert' | 'gold';

/** Cách bay từng loại: số hạt mỗi lần thả, tuổi (s), tốc ra (m/s), hất lên (m/s), trọng lực (m/s², âm = rơi), độ toả (0…1). Cả bể một cỡ điểm (garden.fx.size). */
export const HAT_KINDS: Readonly<Record<HatKind, { count: number; life: number; speed: number; up: number; gravity: number; spread: number }>> = {
  seed: { count: 9, life: 0.55, speed: 0.9, up: 0.8, gravity: -9, spread: 0.6 },
  water: { count: 3, life: 0.42, speed: 2.1, up: 0, gravity: -9.8, spread: 0.12 },
  dust: { count: 10, life: 0.7, speed: 0.7, up: 0.9, gravity: -1.5, spread: 1 },
  fert: { count: 10, life: 0.55, speed: 0.9, up: 0.7, gravity: -9, spread: 0.6 },
  sparkle: { count: 8, life: 0.9, speed: 0.35, up: 0.9, gravity: 0.3, spread: 1 },
  gold: { count: 6, life: 1.3, speed: 0.25, up: 0.55, gravity: 0.15, spread: 1 },
};

export interface XYZ {
  x: number;
  y: number;
  z: number;
}

/** Một hạt: chỗ thả, vận tốc đầu, tuổi đã qua, loại; [floor] = mặt dừng (hạt rơi chạm đất nằm lại tới hết tuổi). */
export interface Hat {
  kind: HatKind;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  t: number;
  life: number;
  floor: number;
}

/** Chỗ + độ trong của hạt [h] lúc tuổi `h.t`: ném xiên có trọng lực, chạm `floor` thì nằm lại; mờ dần 30 % tuổi cuối. Hết tuổi → null. */
export function hatAt(h: Hat): { x: number; y: number; z: number; alpha: number } | null {
  if (h.t >= h.life) return null;
  const g = HAT_KINDS[h.kind].gravity;
  let t = h.t;
  let y = h.y + h.vy * t + 0.5 * g * t * t;
  if (y < h.floor) {
    // lúc chạm mặt: nghiệm của y(t) = floor (rơi xuống — nghiệm lớn)
    const a = 0.5 * g;
    const disc = h.vy * h.vy - 4 * a * (h.y - h.floor);
    const hit = a !== 0 && disc >= 0 ? (-h.vy - Math.sqrt(disc)) / (2 * a) : t;
    t = Math.max(0, Math.min(t, hit));
    y = h.floor;
  }
  const k = h.t / h.life;
  const alpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
  // lấp lánh nhấp nháy
  const tw = h.kind === 'sparkle' || h.kind === 'gold' ? 0.55 + 0.45 * Math.sin(h.t * 24 + h.vx * 50) : 1;
  return { x: h.x + h.vx * t, y, z: h.z + h.vz * t, alpha: alpha * tw };
}

/**
 * Tạo hạt loại [kind] thả từ [from]: [dir] = hướng chính (tia nước theo miệng bình; mặc định toả đều quanh), [floor] = mặt
 * dừng (mặc định `from.y` − 2), [count] thay số mặc định. [rand] để test lặp lại được.
 */
export function makeHats(kind: HatKind, from: XYZ, rand: () => number, opts: EmitOpts = {}): Hat[] {
  const k = HAT_KINDS[kind];
  const n = opts.count ?? k.count;
  const out: Hat[] = [];
  const d = opts.dir;
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const r = rand() * k.spread;
    // hướng: dir (đã chuẩn hoá) + nhiễu ngang; không dir → toả tròn
    const dx = d ? d.x + Math.cos(a) * r * 0.5 : Math.cos(a) * r;
    const dz = d ? d.z + Math.sin(a) * r * 0.5 : Math.sin(a) * r;
    const dy = d ? d.y + (rand() - 0.5) * r : 0;
    const sp = k.speed * (0.75 + 0.5 * rand());
    const jitter = kind === 'gold' || kind === 'sparkle' ? (opts.radius ?? 0.35) : 0.04;
    out.push({
      kind,
      x: from.x + Math.cos(a) * jitter * rand(),
      y: from.y + (kind === 'gold' ? rand() * 0.4 : 0),
      z: from.z + Math.sin(a) * jitter * rand(),
      vx: dx * sp,
      vy: dy * sp + k.up * (0.6 + 0.8 * rand()),
      vz: dz * sp,
      t: 0,
      life: k.life * (0.8 + 0.4 * rand()),
      floor: opts.floor ?? from.y - 2,
    });
  }
  return out;
}

export interface EmitOpts {
  dir?: XYZ;
  floor?: number;
  count?: number;
  /** bán kính rải quanh tâm (lấp lánh quanh cây) */
  radius?: number;
}

/** Vân điểm tròn mềm 16 × 16 (alpha giảm dần ra mép) — không cần canvas. */
function dotTexture(): THREE.DataTexture {
  const S = 16;
  const data = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const r = Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2) / (S / 2);
      const a = Math.max(0, Math.min(1, (1 - r) * 2.2));
      data.set([255, 255, 255, Math.round(a * 255)], (y * S + x) * 4);
    }
  const t = new THREE.DataTexture(data, S, S);
  t.needsUpdate = true;
  return t;
}

/** Bể hạt: `emit` thả một chùm, `stream` thả liên tục theo nhịp (tia nước), `tick` mỗi khung. */
export class HatPool {
  readonly points: THREE.Points;
  private hats: Hat[] = [];
  private readonly pos: Float32Array;
  private readonly col: Float32Array;
  private readonly colors: Record<HatKind, THREE.Color>;
  private readonly rand = seededRandom(73);
  private streamAcc = 0;
  private glowT = 0;

  constructor(
    scene: THREE.Scene,
    private readonly fx: GardenFxSpec,
  ) {
    const n = Math.max(1, fx.pool);
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 4);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    const mat = new THREE.PointsMaterial({ size: fx.size, sizeAttenuation: true, vertexColors: true, transparent: true, depthWrite: false, map: dotTexture(), alphaTest: 0.02 });
    this.points = new THREE.Points(g, mat);
    this.points.frustumCulled = false;
    this.points.visible = false;
    this.points.renderOrder = 2;
    markDynamic(this.points);
    scene.add(this.points);
    this.colors = { seed: new THREE.Color(fx.seed), water: new THREE.Color(fx.water), dust: new THREE.Color(fx.dust), fert: new THREE.Color(fx.fert), sparkle: new THREE.Color(fx.sparkle), gold: new THREE.Color(fx.gold) };
  }

  /** số hạt đang bay */
  get live(): number {
    return this.hats.length;
  }

  emit(kind: HatKind, from: XYZ, opts?: EmitOpts): void {
    const room = this.fx.pool - this.hats.length;
    if (room <= 0) return;
    this.hats.push(...makeHats(kind, from, this.rand, opts).slice(0, room));
  }

  /** Tia nước liên tục: gọi mỗi khung trong lúc rót (`dt` của khung) — thả chừng 70 hạt / giây theo [dir]. */
  stream(from: XYZ, dir: XYZ, dt: number, floor?: number): void {
    this.streamAcc += dt * 70;
    const n = Math.floor(this.streamAcc);
    this.streamAcc -= n;
    if (n > 0) this.emit('water', from, { dir, floor, count: n });
  }

  /**
   * Lấp lánh vàng quanh cây chín (R-VUON-13 — thấy từ xa): gọi mỗi khung với tâm ngọn các luống chín; mỗi cây ~2 đốm / giây,
   * lệch pha theo luống để không nháy cùng lúc. Bể đầy thì bỏ đốm.
   */
  glow(spots: readonly XYZ[], dt: number): void {
    this.glowT += dt;
    spots.forEach((s, i) => {
      const prev = Math.floor((this.glowT - dt) * GLOW_RATE + i * 0.37);
      if (Math.floor(this.glowT * GLOW_RATE + i * 0.37) > prev) this.emit('gold', s, { count: 1, radius: 0.55 });
    });
  }

  tick(dt: number): void {
    if (!this.hats.length) {
      this.points.visible = false;
      return;
    }
    let w = 0;
    const keep: Hat[] = [];
    for (const h of this.hats) {
      h.t += dt;
      const p = hatAt(h);
      if (!p) continue;
      keep.push(h);
      const c = this.colors[h.kind];
      this.pos.set([p.x, p.y, p.z], w * 3);
      this.col.set([c.r, c.g, c.b, p.alpha], w * 4);
      w++;
    }
    this.hats = keep;
    const g = this.points.geometry;
    g.setDrawRange(0, w);
    g.getAttribute('position').needsUpdate = true;
    g.getAttribute('color').needsUpdate = true;
    this.points.visible = w > 0;
  }
}
