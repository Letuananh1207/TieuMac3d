/**
 * Canvas 3D `?dang=dong-tac&nv=<mã>[&tinh=<tính cách>]` — phòng thử động tác (R-NPC-10, kế hoạch
 * `docs/tasks/2026-11-16-dong-tac-code-mixamo.md` NV6). Chỉ trang thiết kế dùng, không vào app.
 * - Hai bản của NPC (model `design/models/<mã>.glb`, xương chuẩn): một **đi vòng** (đi ~7 s, dừng ~3 s — xem đà), một
 *   **đứng** cạnh chỗ xuất phát; một "người chơi giả" (cột xanh) đi tới trước mặt, sang ngang, ra sau lưng → xem nhìn theo,
 *   đứng trước mặt thì "thoại" 2 câu → gật 2 lần.
 * - Bảng thanh trượt chỉnh tham số tính cách (áp ngay cho cả hai bản); nút **Chốt** hiện + chép bộ số để dán lại cho
 *   Claude ghi vào `TINH` (`player/dongTac.ts`).
 */
import * as THREE from 'three';
import type { Colliders } from './collision/colliders';
import { TINH, TINH_IDS, type Tinh, type TinhId } from './player/dongTac';
import { loadGlbCharacter } from './player/glbCharacter';
import { NPC_TINH, npcModelUrl, placeNpcs } from './player/npc';
import { NPC_IDS, type NpcSpec, type SceneSpec } from './scene/spec';

/** Nhãn + khoảng của từng tham số (đơn vị như chú thích `Tinh`). */
const KNOBS: readonly [keyof Tinh, string, number, number][] = [
  ['nhip', 'Nhịp bước', 1.5, 4],
  ['buoc', 'Biên độ bước', 0, 0.9],
  ['goi', 'Co gối', 0, 1.2],
  ['vungTay', 'Vung tay', 0, 0.8],
  ['khuyuTre', 'Khuỷu theo sau', 0, 1],
  ['khuyuCong', 'Khuỷu cong sẵn', 0, 0.8],
  ['nhun', 'Nhún hông (m)', 0, 0.1],
  ['xoayHong', 'Hông xoay', 0, 0.3],
  ['xoayVai', 'Vai xoay ngược', 0, 0.3],
  ['doNguoi', 'Đổ người khi đi', 0, 0.25],
  ['nghiengRe', 'Nghiêng khi rẽ', 0, 0.25],
  ['da', 'Đà (lớn = dứt khoát)', 1, 10],
  ['tho', 'Thở', 0, 0.08],
  ['nhipTho', 'Nhịp thở', 0.8, 3],
  ['donTam', 'Dồn trọng tâm', 0, 0.12],
  ['nhinQuanh', 'Nhìn quanh', 0, 0.6],
  ['haTay', 'Hạ tay (từ chữ A)', 0.2, 0.9],
  ['tayTruoc', 'Tay đưa ra trước', -0.1, 0.4],
  ['cong', 'Lưng còng', 0, 0.4],
];
const WALK_TIME = 7;
const STOP_TIME = 3;
const RADIUS = 3;
/** đường người chơi giả quanh NPC đứng (toạ độ so với NPC, NPC nhìn +z): xa → trước mặt (thoại) → ngang vai → sau lưng */
const PATH: readonly [number, number, number][] = [
  // [x, z, giây dừng ở điểm này]
  [0, 7, 0],
  [1, 3, 4],
  [3.9, 0.5, 2],
  [0, -2, 2],
  [-2.5, 2, 2],
  [0, 7, 1],
];
const PLAYER_SPEED = 1.6;

export interface DongTacPreview {
  update(dt: number): void;
  readonly lines: string[];
}

export async function addDongTacPreview(
  scene: THREE.Scene,
  colliders: Colliders,
  spec: SceneSpec,
  groundAt: (x: number, z: number) => number,
  params: URLSearchParams,
  aim: (x: number, z: number) => void,
): Promise<DongTacPreview | null> {
  if (params.get('dang') !== 'dong-tac') return null;
  const nv = (NPC_IDS as readonly string[]).includes(params.get('nv') ?? '') ? (params.get('nv') as NpcSpec['id']) : 'thu-thu';
  const url = npcModelUrl(nv);
  const lines: string[] = [];
  if (!url) return { update() {}, lines: [`dong-tac: thiếu design/models/${nv}.glb`] };
  const pick = params.get('tinh');
  let tinhId: TinhId = pick && pick in TINH ? (pick as TinhId) : (NPC_TINH[nv] ?? 'diem-tinh');
  const tinh: Tinh = { ...TINH[tinhId] };

  // cạnh chỗ xuất phát (nhân vật chính của Canvas 3D đứng ở `player.start`)
  const x0 = spec.player.start[0] + 4;
  const z0 = spec.player.start[1] - 3;
  const y = (x: number, z: number): number => {
    const h = groundAt(x, z);
    return Number.isFinite(h) ? h : 0;
  };
  // NPC đứng ở chỗ xuất phát, nhìn +z
  const { npcs, problems } = await placeNpcs(scene, colliders, [{ id: nv, x: x0, z: z0, rotY: 0 }], groundAt);
  lines.push(...problems);
  const stander = npcs[0] ?? null;
  if (stander?.dong) stander.dong.tinh = tinh;
  else lines.push(`dong-tac: ${nv}.glb không có xương chuẩn (Mixamo) — chỉ thở như cũ`);
  // NPC đi vòng bên trái
  const walker = await loadGlbCharacter(url, { tinh: tinhId, seed: 3 });
  if (walker.dong) walker.dong.tinh = tinh;
  scene.add(walker.root);
  const cx = x0 - 9;
  const cz = z0;
  // người chơi giả
  const fake = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.8, 12), new THREE.MeshBasicMaterial({ color: 0x7bc86c }));
  scene.add(fake);
  aim(x0 - 4.5, z0);

  const speedIn = buildPanel(tinh, (id) => {
    tinhId = id;
    Object.assign(tinh, TINH[id]);
  }, () => tinhId);
  lines.push(`dong-tac: ${nv} · tính cách ${tinhId} · đứng ở (${x0}; ${z0}), đi vòng quanh (${cx}; ${cz})`);

  let theta = 0;
  let clock = 0;
  let seg = 0;
  let segWait = 0;
  let px = PATH[0][0];
  let pz = PATH[0][1];
  let lineNo = 0;
  return {
    lines,
    update(dt) {
      clock += dt;
      // đi vòng: đi WALK_TIME rồi dừng STOP_TIME
      const walking = clock % (WALK_TIME + STOP_TIME) < WALK_TIME;
      const v = walking ? Number(speedIn.value) : 0;
      theta += (v / RADIUS) * dt;
      const wx = cx + RADIUS * Math.sin(theta);
      const wz = cz + RADIUS * Math.cos(theta);
      walker.root.position.set(wx, y(wx, wz), wz);
      walker.facing.rotation.y = Math.atan2(Math.cos(theta), -Math.sin(theta));
      walker.animate(dt, 0, { mps: v, air: false, vy: 0, sit: 0, bow: 0, idle: 0 });

      // người chơi giả theo PATH; dừng trước mặt thì "thoại" 2 câu (gật 2 lần)
      const [tx, tz, wait] = PATH[(seg + 1) % PATH.length];
      const d = Math.hypot(tx - px, tz - pz);
      let line: string | null = null;
      if (d > 0.02) {
        const k = Math.min(1, (PLAYER_SPEED * dt) / d);
        px += (tx - px) * k;
        pz += (tz - pz) * k;
      } else {
        segWait += dt;
        if (seg + 1 === 1) line = segWait < wait / 2 ? `cau-${lineNo}` : `cau-${lineNo + 1}`;
        if (segWait >= wait) {
          segWait = 0;
          seg = (seg + 1) % PATH.length;
          if (seg === 1) lineNo += 2;
        }
      }
      fake.position.set(x0 + px, y(x0 + px, z0 + pz) + 0.9, z0 + pz);
      stander?.watch?.(x0 + px, z0 + pz, line);
      stander?.update(dt);
    },
  };
}

/** Bảng thanh trượt trong `#panel .body`; trả về ô tốc độ đi. */
function buildPanel(tinh: Tinh, onPreset: (id: TinhId) => void, current: () => TinhId): HTMLInputElement {
  const body = document.querySelector('#panel .body') ?? document.body;
  const h = document.createElement('h2');
  h.textContent = 'Động tác (R-NPC-10)';
  const preset = document.createElement('select');
  for (const id of TINH_IDS) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = id;
    preset.append(o);
  }
  preset.value = current();
  const speed = slider('Tốc độ đi (m/s)', 0.5, 3.2, 1.1);
  const inputs = new Map<keyof Tinh, HTMLInputElement>();
  const rows = KNOBS.map(([key, name, min, max]) => {
    const row = slider(name, min, max, tinh[key], (v) => {
      tinh[key] = v;
    });
    inputs.set(key, row.input);
    return row.label;
  });
  preset.addEventListener('change', () => {
    onPreset(preset.value as TinhId);
    for (const [key, input] of inputs) {
      input.value = String(tinh[key]);
      input.dispatchEvent(new Event('input'));
    }
  });
  const out = document.createElement('textarea');
  out.rows = 5;
  out.style.width = '100%';
  out.hidden = true;
  const done = document.createElement('button');
  done.textContent = 'Chốt — chép bộ số';
  done.addEventListener('click', () => {
    const nums = KNOBS.map(([k]) => `${k}: ${+tinh[k].toFixed(3)}`).join(', ');
    out.value = `'${current()}': { ${nums} },`;
    out.hidden = false;
    out.select();
    navigator.clipboard?.writeText(out.value).catch(() => {});
  });
  body.append(h, preset, speed.label, ...rows, done, out);
  return speed.input;
}

function slider(name: string, min: number, max: number, value: number, on?: (v: number) => void): { label: HTMLLabelElement; input: HTMLInputElement } {
  const label = document.createElement('label');
  const text = document.createElement('span');
  text.style.flex = '1';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String((max - min) / 200);
  input.value = String(value);
  const show = (): void => {
    text.textContent = `${name}: ${(+input.value).toFixed(3)}`;
  };
  input.addEventListener('input', () => {
    show();
    on?.(Number(input.value));
  });
  show();
  label.append(text, input);
  return { label, input };
}
