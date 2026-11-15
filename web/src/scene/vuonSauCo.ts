/**
 * Sâu ăn lá + cỏ dại trên luống (R-VUON-10/11): con sâu xanh bò vòng nhỏ trên lá, 2–3 bụi cỏ giữa luống. Mỗi loại một
 * `InstancedMesh` (2 draw call, chỉ khi có sâu / cỏ — không có thì ẩn hẳn). Bắt sâu / nhổ cỏ → `pop` nảy lên bay ra rồi biến
 * (R-VUON-13). Lớp scene không biết luật: nhận danh sách `{ bug, weeds }` theo thứ tự luống từ file ghép (`homeGarden.ts`).
 * Vật liệu mềm chung (`softMaterial`), màu ở đặc tả `garden.fx`.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { painted, type CropSpot } from './cayTrong';
import type { LookSpec } from './look';
import { softMaterial } from './materials';
import { markDynamic } from './merge';
import type { GardenFxSpec } from './spec';

/** Một luống: có sâu (đang hiện) + số bụi cỏ dại (0 · 2 · 3); `null` = luống trống / hoang. */
export interface PestShow {
  bug: boolean;
  weeds: 0 | 2 | 3;
}

/** Bay ra khi bắt / nhổ (s). */
export const POP_LEN = 0.6;
/** Sâu bò một vòng trên lá (s). */
const CRAWL_S = 9;
const MAX_WEEDS = 3;
/** Phóng sâu / bụi cỏ so với cỡ thật cho dễ thấy (kiểu game: vật cần chăm phải nổi). */
const BUG_SCALE = 1.7;
const WEED_SCALE = 1.5;

/** Chỗ sâu trên luống [spot] lúc [t] (s): bò vòng nhỏ quanh khóm lá tây bắc, cao trên mặt luống; hướng mặt theo đường bò. */
export function bugSpot(spot: CropSpot, i: number, t: number): { x: number; y: number; z: number; yaw: number } {
  const r = spot.size * 0.12;
  const a = (t / CRAWL_S) * Math.PI * 2 + i * 1.7;
  const cx = spot.x - spot.size * 0.2;
  const cz = spot.z - spot.size * 0.2;
  return { x: cx + Math.cos(a) * r, y: spot.y + 0.2 + Math.sin(a * 3) * 0.015, z: cz + Math.sin(a) * r, yaw: -a };
}

/** Chỗ [count] bụi cỏ (lệch tâm luống, giữa các khóm cây) trên luống cạnh [size]. */
export function weedOffsets(count: number, size: number): [number, number][] {
  const k = size / 1.6;
  const all: [number, number][] = [
    [0.02 * k, 0.04 * k],
    [-0.42 * k, 0.05 * k],
    [0.4 * k, -0.06 * k],
  ];
  return all.slice(0, Math.max(0, Math.min(MAX_WEEDS, count)));
}

/**
 * Quỹ đạo bay ra (t 0 → `POP_LEN`): nảy lên rồi văng ra (sâu: lên cao, xoay; cỏ: bật lên, văng ngang theo [side]), co dần về 0.
 * Trả lệch so với chỗ cũ + cỡ (nhân).
 */
export function popPath(kind: 'bug' | 'weed', t: number, side = 1): { dx: number; dy: number; dz: number; scale: number } {
  const k = Math.min(1, Math.max(0, t / POP_LEN));
  const up = kind === 'bug' ? 1.2 : 0.7;
  const out = kind === 'bug' ? 0.25 : 0.9;
  return { dx: out * k * side, dy: up * 4 * k * (1 - k) + (kind === 'bug' ? 0.6 * k : 0), dz: out * 0.4 * k, scale: k < 0.6 ? 1 + 0.25 * Math.sin((k / 0.6) * Math.PI) : 1 - (k - 0.6) / 0.4 };
}

function bugGeometry(fx: GardenFxSpec): THREE.BufferGeometry {
  // 4 đốt xanh nối nhau dọc trục +x (đầu ở +x), đầu sẫm hơn có 2 chấm mắt
  const parts: THREE.BufferGeometry[] = [];
  const c = new THREE.Color(fx.bug);
  for (let j = 0; j < 4; j++) {
    const r = 0.03 - j * 0.003;
    parts.push(painted(new THREE.SphereGeometry(r, 6, 4).translate(-j * 0.045, r, 0), j === 0 ? c.clone().multiplyScalar(0.8) : c, 0.35));
  }
  for (const s of [-1, 1]) parts.push(painted(new THREE.SphereGeometry(0.008, 4, 3).translate(0.022, 0.04, 0.012 * s), '#1a1a14'));
  // to hơn sâu thật (nhìn từ camera chơi ~9 m vẫn thấy)
  return (mergeGeometries(parts) ?? parts[0]).scale(BUG_SCALE, BUG_SCALE, BUG_SCALE);
}

function weedGeometry(fx: GardenFxSpec): THREE.BufferGeometry {
  // bụi cỏ dại: 4 lá nón nghiêng toả ra, chân sẫm
  const parts: THREE.BufferGeometry[] = [];
  for (let j = 0; j < 4; j++) {
    const blade = painted(new THREE.ConeGeometry(0.035, 0.26 + (j % 2) * 0.08, 4).translate(0, 0.13, 0), fx.weed, 0.5);
    blade.rotateZ(0.35).rotateY((j * Math.PI) / 2 + 0.4);
    parts.push(blade);
  }
  return (mergeGeometries(parts) ?? parts[0]).scale(WEED_SCALE, WEED_SCALE, WEED_SCALE);
}

interface Flight {
  i: number;
  kind: 'bug' | 'weed';
  t: number;
  /** số bụi cỏ lúc nhổ */
  weeds: number;
}

/** Lớp sâu + cỏ của vườn: `show` mỗi lần vẽ lại, `pop` khi bắt / nhổ, `tick` mỗi khung. */
export class PestLayer {
  readonly bugs: THREE.InstancedMesh;
  readonly weeds: THREE.InstancedMesh;
  private list: readonly (PestShow | null)[] = [];
  /** luống đã bắt / nhổ (đang bay hoặc chờ `show` báo hết) — không vẽ chỗ cũ */
  private goneBug = new Set<number>();
  private goneWeed = new Set<number>();
  private flights: Flight[] = [];
  private time = 0;
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly v = new THREE.Vector3();
  private readonly s = new THREE.Vector3();
  private readonly up = new THREE.Vector3(0, 1, 0);

  constructor(
    scene: THREE.Scene,
    private readonly spots: readonly CropSpot[],
    fx: GardenFxSpec,
    look: LookSpec,
  ) {
    const n = spots.length;
    // mỗi luống tối đa 1 sâu (+1 đang bay) · 3 bụi cỏ (+3 đang bay)
    this.bugs = new THREE.InstancedMesh(bugGeometry(fx), softMaterial(look.wrap), n * 2);
    this.weeds = new THREE.InstancedMesh(weedGeometry(fx), softMaterial(look.wrap, THREE.FrontSide, { amp: look.wind * 0.6, tip: 0.4 }), n * MAX_WEEDS * 2);
    for (const o of [this.bugs, this.weeds]) {
      o.count = 0;
      o.visible = false;
      o.frustumCulled = false;
      markDynamic(o);
      scene.add(o);
    }
  }

  /** Số sâu / bụi cỏ đang vẽ (gồm cả đang bay) — đo ngân sách, test. */
  get counts(): { bugs: number; weeds: number } {
    return { bugs: this.bugs.count, weeds: this.weeds.count };
  }

  show(list: readonly (PestShow | null)[]): void {
    this.list = list;
    list.forEach((p, i) => {
      if (!p?.bug) this.goneBug.delete(i);
      if (!p?.weeds) this.goneWeed.delete(i);
    });
    this.compose();
  }

  /** Bắt sâu / nhổ cỏ ở luống [i]: chỗ cũ ẩn ngay, con sâu / các bụi cỏ nảy lên bay ra (`POP_LEN`). */
  pop(i: number, kind: 'bug' | 'weed'): void {
    const p = this.list[i];
    if (!p || (kind === 'bug' ? !p.bug || this.goneBug.has(i) : !p.weeds || this.goneWeed.has(i))) return;
    (kind === 'bug' ? this.goneBug : this.goneWeed).add(i);
    this.flights.push({ i, kind, t: 0, weeds: p.weeds });
    this.compose();
  }

  tick(dt: number): void {
    this.time += dt;
    const flying = this.flights.length;
    for (const f of this.flights) f.t += dt;
    this.flights = this.flights.filter((f) => f.t < POP_LEN);
    // sâu bò mỗi khung; cỏ chỉ dựng lại khi đang bay (cả khung vừa bay xong)
    if (this.bugs.count || flying) this.compose();
  }

  private compose(): void {
    let b = 0;
    let w = 0;
    const bug = (i: number, spot: CropSpot, f: Flight | null): void => {
      // đang bay: chỗ bò đứng lại ở lúc bị bắt, rồi theo quỹ đạo bay
      const at = bugSpot(spot, i, f ? this.time - f.t : this.time);
      const pp = f ? popPath('bug', f.t, i % 2 ? 1 : -1) : null;
      this.q.setFromAxisAngle(this.up, at.yaw + (f ? f.t * 18 : 0));
      const k = pp ? pp.scale : 1;
      this.bugs.setMatrixAt(b++, this.m.compose(this.v.set(at.x + (pp?.dx ?? 0), at.y + (pp?.dy ?? 0), at.z + (pp?.dz ?? 0)), this.q, this.s.set(k, k, k)));
    };
    const weeds = (i: number, spot: CropSpot, count: number, f: Flight | null): void => {
      weedOffsets(count, spot.size).forEach(([dx, dz], j) => {
        const pp = f ? popPath('weed', f.t, j % 2 ? 1 : -1) : null;
        this.q.setFromAxisAngle(this.up, i * 1.3 + j * 2.1 + (f ? f.t * 9 : 0));
        const k = (0.85 + 0.15 * ((i + j) % 3)) * (pp ? pp.scale : 1);
        this.weeds.setMatrixAt(w++, this.m.compose(this.v.set(spot.x + dx + (pp?.dx ?? 0), spot.y - 0.02 + (pp?.dy ?? 0), spot.z + dz + (pp?.dz ?? 0)), this.q, this.s.set(k, k, k)));
      });
    };
    this.list.forEach((p, i) => {
      const spot = this.spots[i];
      if (!p || !spot) return;
      if (p.bug && !this.goneBug.has(i)) bug(i, spot, null);
      if (p.weeds && !this.goneWeed.has(i)) weeds(i, spot, p.weeds, null);
    });
    // đang bay: vẽ theo số đã chụp lúc bắt / nhổ — luật báo hết sâu / cỏ giữa chừng cũng không cắt ngang
    for (const f of this.flights) {
      const spot = this.spots[f.i];
      if (!spot) continue;
      if (f.kind === 'bug') bug(f.i, spot, f);
      else weeds(f.i, spot, f.weeds, f);
    }
    this.bugs.count = b;
    this.weeds.count = w;
    this.bugs.visible = b > 0;
    this.weeds.visible = w > 0;
    this.bugs.instanceMatrix.needsUpdate = true;
    this.weeds.instanceMatrix.needsUpdate = true;
  }
}
