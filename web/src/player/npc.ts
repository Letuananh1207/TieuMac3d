import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { NpcSpec } from '../scene/spec';
import { loadGlbModel } from './glbCharacter';

/** Bán kính vật cản tròn của NPC (R-NPC-1). */
export const NPC_RADIUS = 0.45;
/** Người chơi gần hơn khoảng này (m) thì NPC quay mặt về phía người chơi (R-NPC-1). */
export const NPC_LOOK_DIST = 4;
/** Tốc độ quay tối đa (rad/s) — quay từ từ, không giật (R-NPC-1). */
const TURN_SPEED = 3;

/** Model NPC: `design/models/<mã>.glb` (tạo bằng /tai-nguyen). Vite gói file vào bản build (offline). */
const MODELS = import.meta.glob('../../../design/models/*.glb', { query: '?url', import: 'default', eager: true }) as Record<
  string,
  string
>;

export interface Npc {
  readonly root: THREE.Object3D;
  /** Mỗi khung hình: thở + quay theo người chơi. */
  update(dt: number, player: THREE.Vector3): void;
}

/** Góc mới khi quay từ `cur` về `target` (radian), đi đường ngắn nhất, không quá `maxStep`. */
export function turnToward(cur: number, target: number, maxStep: number): number {
  const d = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
  return cur + Math.max(-maxStep, Math.min(maxStep, d));
}

/**
 * NPC đứng tại chỗ (R-NPC-1). Không gắn xương: xương tự gắn (`autoRig`) đo theo dáng nhân vật chính, đặt lên model
 * khác thì tay gập sai, áo rách — NPC chỉ thở (phồng nhẹ, nghiêng khẽ) và xoay cả người. Thiếu file model → `null`.
 * Đặt vị trí (`root`) và vật cản là việc của nơi gọi (`main.ts`).
 */
export async function createNpc(spec: NpcSpec): Promise<Npc | null> {
  const url = MODELS[`../../../design/models/${spec.id}.glb`];
  if (!url) return null;
  const { model, root, body, bob } = await loadGlbModel(url);
  bob.add(model);
  const home = THREE.MathUtils.degToRad(spec.rotY ?? 0); // 0 = mặt trước nhìn về +z
  body.rotation.y = home;
  let time = spec.x * 0.37 + spec.z * 0.11; // lệch nhịp thở giữa các NPC
  return {
    root,
    update(dt, player) {
      time += dt;
      const dx = player.x - root.position.x;
      const dz = player.z - root.position.z;
      const target = Math.hypot(dx, dz) < NPC_LOOK_DIST ? Math.atan2(dx, dz) : home;
      body.rotation.y = turnToward(body.rotation.y, target, TURN_SPEED * dt);
      bob.scale.y = 1 + Math.sin(time * 2) * 0.012;
      bob.rotation.z = Math.sin(time * 1.1) * 0.015;
    },
  };
}

/**
 * Dựng mọi NPC của đặc tả: đặt lên mặt đất, thêm vào `parent`, thêm vật cản tròn. NPC thiếu model / nạp lỗi → bỏ qua
 * (cảnh vẫn chạy — R-NPC-1), trả về `problems` để in.
 */
export async function placeNpcs(
  parent: THREE.Object3D,
  colliders: Colliders,
  list: readonly NpcSpec[],
  groundAt: (x: number, z: number) => number,
): Promise<{ npcs: Npc[]; problems: string[] }> {
  const problems: string[] = [];
  const made = await Promise.all(
    list.map(async (spec) => {
      try {
        const npc = await createNpc(spec);
        if (!npc) problems.push(`npcs: thiếu design/models/${spec.id}.glb — bỏ NPC "${spec.id}"`);
        return npc;
      } catch (e) {
        problems.push(`npcs: không nạp được "${spec.id}" — ${String(e)}`);
        return null;
      }
    }),
  );
  const npcs: Npc[] = [];
  made.forEach((npc, i) => {
    if (!npc) return;
    const { x, z } = list[i];
    const y = groundAt(x, z);
    npc.root.position.set(x, Number.isFinite(y) ? y : 0, z);
    parent.add(npc.root);
    colliders.addCircle(x, z, NPC_RADIUS);
    npcs.push(npc);
  });
  return { npcs, problems };
}
