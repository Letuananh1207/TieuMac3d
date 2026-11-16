import * as THREE from 'three';
import type { Circle, Colliders } from '../collision/colliders';
import { mergeVertexColors } from '../scene/merge';
import { GAME_NPC_IDS, type NpcSpec } from '../scene/spec';
import { autoRig, type RigShape } from './autoRig';
import type { Character, CharacterState } from './character';
import { createDiscipleCharacter, type DiscipleColors } from './discipleCharacter';
import { DongTac, lookYaw, TINH, type TinhId } from './dongTac';
import { GLB_HEIGHT, loadGlbCharacter, loadGlbModel } from './glbCharacter';
import { mixamoRig } from './mixamoRig';
import { createMiMat, type MiMat } from './miMat';
import { ChopMat } from './chopMat';

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

/** R-NPC-10: tính cách dáng của NPC có xương chuẩn (model Tripo); thiếu → điềm tĩnh. */
export const NPC_TINH: Readonly<Record<string, TinhId>> = {
  'thu-thu': 'diem-tinh',
  'cam-nu': 'diem-tinh',
  'tieu-nhi': 'hoat-bat',
  'khat-nhi': 'hoat-bat',
  'tieu-mac': 'hoat-bat',
  'go-mo': 'gia',
  'su-phu': 'gia',
  'quan-su': 'hoat-bat', // thiếu nữ chủ trò ≈ 16 tuổi, nhanh nhẹn (hồ sơ npc-ky-van-uyen.md — mặt dịu là nét mặt, không phải dáng)
  'tran-su': 'nghiem',
};

/** NPC ngồi xin (R-NPC-6): model cầm sẵn bát + gậy → dáng tay `xinDang.ts` khi ngồi. */
const NPC_XIN: readonly string[] = ['khat-nhi'];

export interface Npc {
  /** mã NPC (đặc tả cảnh `npcs[].id`) — dùng tra hội thoại */
  readonly id: string;
  readonly root: THREE.Object3D;
  /** Mỗi khung hình: thở, tay buông khẽ đung đưa, thỉnh thoảng nhìn quanh. Giữ nguyên hướng đặc tả (R-NPC-1). */
  update(dt: number): void;
  /**
   * R-NPC-10 (NPC có xương chuẩn): người chơi đang ở (px, pz); `line` = mã câu thoại đang hiện nếu đang thoại với NPC
   * này, không thì `null` — đổi câu thì gật. Gọi trước `update` mỗi khung; NPC khác bỏ qua.
   */
  watch?(px: number, pz: number, line: string | null): void;
  /** bộ động tác (NPC có xương chuẩn) — phòng thử Canvas 3D `?dang=dong-tac` chỉnh `tinh` trực tiếp */
  readonly dong?: DongTac;
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
  /**
   * dáng khung này: tốc độ (m/s), ngồi 0…1, gõ mõ (`strike`); tiểu nhị (R-TRA-1): đồ cầm tay (`hold`, mã `lamVuonDang` — ấm trà
   * là `rot`), động tác (`work` — rót), `watch` = đang đứng ở quầy → `watch()` nhìn người chơi / gật (R-NPC-10)
   */
  readonly motion: { mps: number; sit: number; strike?: number; hold?: string; work?: { id: string; t: number; len: number }; watch?: boolean };
}

/** NPC phục vụ đi theo việc (R-TRA-1): dựng bằng `Character` như NPC biết đi nhưng không có `route` — file ghép riêng lái. */
export const SERVING_NPC_IDS: readonly string[] = ['tieu-nhi'];

/** NPC có đường đi, ngồi, hoặc phục vụ → dựng bằng `Character` thay cho dáng đứng tại chỗ. */
export const isMovingSpec = (s: NpcSpec): boolean => !!s.route || s.pose === 'ngoi' || SERVING_NPC_IDS.includes(s.id);

/** Dựng NPC biết đi / ngồi từ model [url]. */
export async function createMovingNpc(spec: NpcSpec, url: string): Promise<MovingNpc> {
  const character = await loadGlbCharacter(url, { tinh: NPC_TINH[spec.id], seed: spec.x * 0.37 + spec.z * 0.11 });
  character.root.scale.setScalar(spec.scale ?? 1);
  character.facing.rotation.y = THREE.MathUtils.degToRad(spec.rotY ?? 0);
  const motion = { mps: 0, sit: spec.pose === 'ngoi' ? 1 : 0 } as MovingNpc['motion'];
  const state: CharacterState = { mps: 0, air: false, vy: 0, sit: 0, bow: 0, idle: 0, beg: NPC_XIN.includes(spec.id) ? 1 : undefined };
  let lastLine: string | null = null;
  const npc: MovingNpc = {
    id: spec.id,
    spec,
    root: character.root,
    character,
    motion,
    update(dt) {
      state.mps = motion.mps;
      state.sit = motion.sit;
      state.strike = motion.strike;
      state.hold = motion.hold;
      state.work = motion.work;
      if (!motion.watch) state.look = undefined;
      state.idle = motion.mps > 0 || motion.work ? 0 : state.idle + dt;
      character.animate(dt, 0, state);
    },
  };
  // NPC phục vụ đứng ở quầy: nhìn người chơi, gật khi sang câu thoại (R-NPC-10) — NPC đi vòng / ngồi giữ như cũ
  if (SERVING_NPC_IDS.includes(spec.id))
    npc.watch = (px, pz, line) => {
      if (!motion.watch) return;
      const at = character.root.position;
      state.look = lookYaw(at.x, at.z, character.facing.rotation.y, px, pz, line !== null);
      if (line !== null && line !== lastLine) state.nod = (state.nod ?? 0) + 1;
      lastLine = line;
    };
  return npc;
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
  const mx = mixamoRig(model);
  if (mx) return standingMixamoNpc(spec, root, body, bob, model, mx, createMiMat(model, mx.bone('head')!, url));
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

/** NPC đứng có xương chuẩn (R-NPC-10): thở, dồn trọng tâm, nhìn quanh, nhìn người chơi, gật khi thoại (+ chớp — R-MAT-1) — thân giữ hướng. */
function standingMixamoNpc(
  spec: NpcSpec,
  root: THREE.Group,
  body: THREE.Group,
  bob: THREE.Group,
  model: THREE.Object3D,
  mx: NonNullable<ReturnType<typeof mixamoRig>>,
  mi: MiMat | null,
): Npc {
  bob.add(model);
  const rotY = THREE.MathUtils.degToRad(spec.rotY ?? 0);
  body.rotation.y = rotY;
  const seed = spec.x * 0.37 + spec.z * 0.11;
  const dong = new DongTac(TINH[NPC_TINH[spec.id] ?? 'diem-tinh'], seed);
  const chop = new ChopMat(seed); // mắt (R-MAT-1): chớp lệch nhịp theo vị trí
  let look: number | null = null;
  let lastLine: string | null = null;
  return {
    id: spec.id,
    root,
    dong,
    watch(px, pz, line) {
      look = lookYaw(root.position.x, root.position.z, rotY, px, pz, line !== null);
      if (line !== null && line !== lastLine) {
        dong.nodOnce();
        chop.chopNgay(); // gật thì chớp cùng lúc (R-MAT-1)
      }
      lastLine = line;
    },
    update(dt) {
      const pose = dong.update(dt, { mps: 0, look });
      mx.apply(pose);
      bob.position.y = pose.lift;
      if (mi) {
        const m = chop.update(dt);
        mi.dat(m.tren, m.duoi);
      }
    },
  };
}

/**
 * Màu áo thế khối của NPC trò chơi chưa có model (R-NPC-1, V-66 B4): Thi Ông áo lam râu bạc, Tú Tài trắng ngà, Tài Nữ
 * lục nhạt, Trúc Ông nâu (lão tiều phu), thầy Trúc Lão lục trúc sẫm (R-HANH-8). Dáng đệ tử khối (`discipleCharacter.ts`) — bản đẹp qua `/tai-nguyen`.
 */
export const BLOCK_NPC_COLORS: Readonly<Record<string, DiscipleColors>> = {
  'thi-ong': { robe: '#5b7896', trim: '#2e3f58', hair: '#d9d6cf', jade: '#c9b37a' },
  'tu-tai': { robe: '#efe6d2', trim: '#7a6a4a', hair: '#1f1a1a' },
  'tai-nu': { robe: '#bcd5b4', trim: '#5f8a63', hair: '#1f1a1a', jade: '#d98aa0' },
  'truc-ong': { robe: '#8a6a48', trim: '#4f3b28', hair: '#bdb6aa', jade: '#6f8a4a' },
  'truc-lao': { robe: '#3f5e48', trim: '#22362a', hair: '#e4e0d6', jade: '#c9b37a' }, // Trúc Lão: lục trúc sẫm, tóc bạc (R-HANH-8)
};

/** Ngồi xếp bằng (thế khối): hạ thân xuống — vạt áo chìm dưới mặt đệm (m). */
const BLOCK_SIT_DROP = 0.42;

/**
 * NPC trò chơi chưa có model (R-NPC-1): đệ tử khối đổi màu áo, **gộp thành 1 khối màu theo đỉnh** (+ đĩa bóng) — 2 draw call
 * mỗi NPC; dáng ngồi = hạ thân; thở nhẹ. Giữ hướng đặc tả.
 */
export function createBlockNpc(spec: NpcSpec): Npc {
  const c = createDiscipleCharacter(BLOCK_NPC_COLORS[spec.id] ?? {});
  c.animate(0, 0, { mps: 0, air: false, vy: 0, sit: 0, bow: 0, idle: 0 });
  const body = c.facing;
  body.rotation.y = THREE.MathUtils.degToRad(spec.rotY ?? 0);
  const sit = spec.pose === 'ngoi';
  if (sit) body.position.y = -BLOCK_SIT_DROP;
  mergeVertexColors(body);
  c.root.scale.setScalar(spec.scale ?? 1);
  let time = spec.x * 0.37 + spec.z * 0.11;
  const baseY = body.position.y;
  return {
    id: spec.id,
    root: c.root,
    update(dt) {
      time += dt;
      body.scale.y = 1 + Math.sin(time * 2) * 0.012;
      body.position.y = baseY + Math.sin(time * 2) * 0.004;
    },
  };
}

/**
 * Dựng mọi NPC của đặc tả: đặt lên mặt đất, thêm vào `parent`, thêm vật cản tròn. NPC thiếu model / nạp lỗi → bỏ qua
 * (cảnh vẫn chạy — R-NPC-1), trả về `problems` để in — **trừ NPC trò chơi** (`GAME_NPC_IDS`): thế bằng khối.
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
        // NPC trò chơi chưa có model → khối (R-NPC-1, V-66 B4)
        if (GAME_NPC_IDS.includes(spec.id) && !npcModelUrl(spec.id)) return createBlockNpc(spec);
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
