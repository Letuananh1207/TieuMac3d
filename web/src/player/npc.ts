import * as THREE from 'three';
import type { Circle, Colliders } from '../collision/colliders';
import type { NpcSpec } from '../scene/spec';
import { autoRig, type RigShape } from './autoRig';
import type { Character, CharacterState } from './character';
import { GLB_HEIGHT, loadGlbCharacter, loadGlbModel } from './glbCharacter';

/** Bán kính vật cản tròn của NPC (R-NPC-1). */
export const NPC_RADIUS = 0.45;
/** R-NPC-1: NPC cách nhân vật từ khoảng này (m) trở lên thì ẩn (không vẽ, không cử động). */
export const NPC_HIDE_DIST = 35;
/** R-NPC-2: người chơi gần hơn khoảng này (m) thì hiện nút "Nói chuyện". */
export const NPC_TALK_DIST = 2.5;

/** Model NPC: `design/models/<mã>.glb` (tạo bằng /tai-nguyen). Vite gói file vào bản build (offline). */
const MODELS = import.meta.glob('../../../design/models/*.glb', { query: '?url', import: 'default', eager: true }) as Record<
  string,
  string
>;

/**
 * Dáng từng model NPC để tự gắn xương (đo trên ảnh 4 góc `design/models/anh/<mã>-truoc.png`, phần của chiều cao /
 * bề rộng cả hai tay) + góc hạ tay từ tư thế chữ A về buông xuôi. Model chưa đo → không gắn xương, chỉ thở.
 */
const NPC_RIGS: Record<string, { shape: Partial<RigShape>; armDown: number }> = {
  // Sư phụ: áo rộng, tay áo thụng — vai cao, ranh giới thân / tay áo ở 28 % W ngang bàn tay
  'su-phu': { shape: { hip: 0.34, neck: 0.62, shoulderY: 0.6, shoulderX: 0.16, torsoLowX: 0.285, handY: 0.225, legTop: 0.06 }, armDown: 0.5 },
  // Tiểu Mặc: đầu to, vai thấp; kiếm sau lưng nằm trong thân (dưới bàn tay / sát trục) nên không theo tay
  'tieu-mac': { shape: { hip: 0.3, neck: 0.53, shoulderY: 0.49, shoulderX: 0.18, torsoLowX: 0.22, handY: 0.23, legTop: 0.11 }, armDown: 0.45 },
};

export interface Npc {
  /** mã NPC (đặc tả cảnh `npcs[].id`) — dùng tra hội thoại */
  readonly id: string;
  readonly root: THREE.Object3D;
  /** Mỗi khung hình: thở, tay buông khẽ đung đưa, thỉnh thoảng nhìn quanh. Giữ nguyên hướng đặc tả (R-NPC-1). */
  update(dt: number): void;
  /** vật cản tròn của NPC (`placeNpcs` gắn) — NPC biết đi dời `x`, `z` theo mình (R-NPC-7) */
  block?: Circle;
}

/**
 * NPC biết đi (`route` — R-NPC-7) hoặc ngồi (`pose: 'ngoi'` — R-NPC-6): dựng bằng hợp đồng `Character` (dáng đi / ngồi lập
 * trình sẵn của `glbCharacter.ts`). Nơi ghép (`townNpcs.ts`) đặt vị trí, hướng (`character.facing`) và `motion` mỗi khung.
 */
export interface MovingNpc extends Npc {
  readonly spec: NpcSpec;
  readonly character: Character;
  /** dáng khung này: tốc độ (m/s), ngồi 0…1, gõ mõ (`strike`) */
  readonly motion: { mps: number; sit: number; strike?: number };
}

/** NPC có đường đi hoặc ngồi → dựng bằng `Character` thay cho dáng đứng tại chỗ. */
export const isMovingSpec = (s: NpcSpec): boolean => !!s.route || s.pose === 'ngoi';

/** Dựng NPC biết đi / ngồi từ model [url]. */
export async function createMovingNpc(spec: NpcSpec, url: string): Promise<MovingNpc> {
  const character = await loadGlbCharacter(url);
  character.root.scale.setScalar(spec.scale ?? 1);
  character.facing.rotation.y = THREE.MathUtils.degToRad(spec.rotY ?? 0);
  const motion = { mps: 0, sit: spec.pose === 'ngoi' ? 1 : 0 } as MovingNpc['motion'];
  const state: CharacterState = { mps: 0, air: false, vy: 0, sit: 0, bow: 0, idle: 0 };
  return {
    id: spec.id,
    spec,
    root: character.root,
    character,
    motion,
    update(dt) {
      state.mps = motion.mps;
      state.sit = motion.sit;
      state.strike = motion.strike;
      state.idle = motion.mps > 0 ? 0 : state.idle + dt;
      character.animate(dt, 0, state);
    },
  };
}

/** Model của NPC [id] (`design/models/<mã>.glb`); không có → `undefined`. */
export const npcModelUrl = (id: string): string | undefined => MODELS[`../../../design/models/${id}.glb`];

/**
 * NPC đứng tại chỗ, giữ hướng theo đặc tả (R-NPC-1) — không quay theo người chơi (sau này nhiều người chơi cùng
 * cảnh). Model AI ở tư thế chữ A → tự gắn xương theo dáng riêng (`NPC_RIGS`) để buông tay xuôi. Thiếu file → `null`.
 * Đặt vị trí (`root`) và vật cản là việc của nơi gọi.
 */
export async function createNpc(spec: NpcSpec): Promise<Npc | null> {
  const url = MODELS[`../../../design/models/${spec.id}.glb`];
  if (!url) return null;
  const { model, root, body, bob } = await loadGlbModel(url);
  root.scale.setScalar(spec.scale ?? 1); // thiếu = 1 (như cũ)
  const tune = NPC_RIGS[spec.id];
  const rig = tune ? autoRig(model, GLB_HEIGHT, tune.shape) : null;
  bob.add(rig ? rig.group : model);
  body.rotation.y = THREE.MathUtils.degToRad(spec.rotY ?? 0); // 0 = mặt trước nhìn về +z
  let time = spec.x * 0.37 + spec.z * 0.11; // lệch nhịp giữa các NPC
  return {
    id: spec.id,
    root,
    update(dt) {
      time += dt;
      bob.scale.y = 1 + Math.sin(time * 2) * 0.012;
      bob.rotation.z = Math.sin(time * 1.1) * 0.012;
      if (!rig || !tune) return;
      const r = rig.rig;
      // tay buông, hơi đưa ra trước, đung đưa rất khẽ theo nhịp thở (tay trái ở +x: rotation.z âm = khép vào thân)
      const sway = Math.sin(time * 2) * 0.025;
      r.armL.rotation.set(-0.1 + Math.sin(time * 1.3) * 0.03, 0, -(tune.armDown + sway));
      r.armR.rotation.set(-0.1 + Math.sin(time * 1.3 + 1.7) * 0.03, 0, tune.armDown + sway);
      // nhìn quanh chậm: hai nhịp sin lệch nhau → không lặp đều
      r.head.rotation.y = Math.sin(time * 0.31) * Math.sin(time * 0.13) * 0.18;
      r.head.rotation.x = Math.sin(time * 0.5) * 0.03;
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
  /** model thế khi NPC biết đi / ngồi chưa có model riêng (Canvas 3D `?dang=go-mo` dùng `nhan-vat.glb`); thiếu = bỏ NPC */
  standIn?: string,
): Promise<{ npcs: Npc[]; problems: string[] }> {
  const problems: string[] = [];
  const made = await Promise.all(
    list.map(async (spec) => {
      try {
        const moving = isMovingSpec(spec) ? (npcModelUrl(spec.id) ?? standIn) : undefined;
        const npc = moving ? await createMovingNpc(spec, moving) : isMovingSpec(spec) ? null : await createNpc(spec);
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
    npc.block = colliders.addCircle(x, z, NPC_RADIUS);
    npcs.push(npc);
  });
  return { npcs, problems };
}

/** R-NPC-2: NPC gần người chơi nhất trong tầm nói chuyện (dưới `NPC_TALK_DIST`), không có → `null`. */
export function npcInTalkRange(npcs: readonly Npc[], player: THREE.Vector3): Npc | null {
  let best: Npc | null = null;
  let bestD = NPC_TALK_DIST;
  for (const n of npcs) {
    const d = Math.hypot(n.root.position.x - player.x, n.root.position.z - player.z);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}

/** R-NPC-1: ẩn NPC cách (x, z) từ `NPC_HIDE_DIST` trở lên, hiện lại khi gần; trả về NPC đang hiện (để cập nhật dáng). */
export function showNearNpcs<T extends Pick<Npc, 'root'>>(npcs: readonly T[], x: number, z: number): T[] {
  const near: T[] = [];
  for (const n of npcs) {
    const show = Math.hypot(n.root.position.x - x, n.root.position.z - z) < NPC_HIDE_DIST;
    n.root.visible = show;
    if (show) near.push(n);
  }
  return near;
}
