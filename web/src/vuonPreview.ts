/**
 * Canvas 3D vườn rau (V-52 NV7, V-73): cùng code dựng như app (`scene/vuonLuong.ts`, `cayTrong.ts`, `vuonSauCo.ts`, `vuonHat.ts`,
 * dáng `player/lamVuonDang.ts`). Chỉ trang thiết kế dùng, không vào app. `?dang=vuon` đã là dáng "vươn vai" nên dùng tên khác:
 * - `?dang=vuon-rau` — 12 luống điền sẵn: o-1 … o-4 chín (lấp lánh vàng), o-5 mầm đất khô + sâu, o-6 đang lớn đất ẩm + 3 bụi
 *   cỏ, o-7 đang lớn sâu + 2 bụi cỏ, o-8 đang lớn vừa bón (lấp lánh xanh), o-9 vừa gieo đất khô, o-10 … o-12 hoang; + bảng mẫu
 *   **8 cây × 4 dáng** trên bãi cỏ tây (hàng bắc → nam: vừa gieo · mầm · đang lớn · chín).
 * - `?dang=lam-vuon[&viec=gieo|tuoi|bat|nho|bon|thu][&t=<giây>]` — nhân vật diễn lần lượt 6 việc ở o-1 … o-6 (gieo hạt rơi ·
 *   tưới tia nước + đất sẫm · bắt sâu bay · nhổ cỏ bay + bụi · bón phân + lấp lánh + nảy · thu quả bay), lặp vòng; `viec` = chỉ
 *   một việc; `t` = dừng ở giây đó của vòng (ảnh chụp đúng lúc).
 */
import * as THREE from 'three';
import { CROP_STAGES, CropLayer, type PlotShow } from './scene/cayTrong';
import type { SceneSpec } from './scene/spec';
import type { SoilLook } from './scene/vuonLuong';
import type { Garden3D } from './scene/vuonLuong';
import type { PestShow } from './scene/vuonSauCo';
import { hasToolTip, type Character, type CharacterState } from './player/character';
import { isWork, WORK_FX, WORK_IDS, WORK_LEN, type WorkId } from './player/lamVuonDang';
import { CROPS } from './zones/vuon';

/** Bảng mẫu: góc tây bắc + khoảng hai ô (m). */
const SAMPLE = { x0: -22.4, z0: -3.6, dx: 1.2, dz: 2.4, size: 1.1 };
/** Khoảng nghỉ giữa hai việc (s) — nhân vật đã cầm đồ, đứng cạnh luống kế. */
const GAP = 0.6;

export interface GardenPreview {
  lines: string[];
  /** mỗi khung trước `character.animate`: chạy hiệu ứng; `lam-vuon` đặt `state.work` / `state.hold` */
  update(dt: number, state: CharacterState): void;
}

interface Plot3 {
  x: number;
  y: number;
  z: number;
}

/** Một luống trong cảnh mẫu: dáng cây, đất, sâu / cỏ. */
interface Fill {
  show: PlotShow | null;
  soil: SoilLook;
  pest: PestShow | null;
}

function apply(garden: Garden3D, fills: readonly Fill[]): void {
  garden.crops.show(fills.map((f) => f.show));
  fills.forEach((f, i) => garden.beds.setSoil(i, f.soil));
  garden.pests.show(fills.map((f) => f.pest));
}

const fill = (show: PlotShow | null, soil: SoilLook = 'thuong', pest: PestShow | null = null): Fill => ({ show, soil, pest });

/** Ngọn cây chín (tâm lấp lánh vàng). */
const ripeTops = (garden: Garden3D, fills: readonly Fill[], top: (i: number) => number): Plot3[] =>
  fills.flatMap((f, i) => (f.show?.stage === 'chin' ? [{ x: garden.plots[i].x, y: top(i) + 0.5, z: garden.plots[i].z }] : []));

/** `?dang=vuon-rau` / `?dang=lam-vuon` → dựng; khác → `null`. */
export function addGardenPreview(
  scene: THREE.Scene,
  spec: SceneSpec,
  garden: Garden3D | null,
  params: URLSearchParams,
  groundY: (x: number, z: number) => number,
  character?: Character,
): GardenPreview | null {
  const dang = params.get('dang');
  if (!garden || (dang !== 'vuon-rau' && dang !== 'lam-vuon')) return null;
  return dang === 'vuon-rau' ? vuonRau(scene, spec, garden, groundY) : lamVuon(garden, params, character);
}

function vuonRau(scene: THREE.Scene, spec: SceneSpec, garden: Garden3D, groundY: (x: number, z: number) => number): GardenPreview {
  garden.beds.setOpen(9);
  const fills: Fill[] = garden.plots.map((_, i) => {
    if (i < 4) return fill({ crop: CROPS[i].id, stage: 'chin' });
    if (i === 4) return fill({ crop: CROPS[4].id, stage: 'mam' }, 'kho', { bug: true, weeds: 0 });
    if (i === 5) return fill({ crop: CROPS[5].id, stage: 'lon' }, 'am', { bug: false, weeds: 3 });
    if (i === 6) return fill({ crop: CROPS[6].id, stage: 'lon' }, 'am', { bug: true, weeds: 2 });
    if (i === 7) return fill({ crop: CROPS[7].id, stage: 'lon' }, 'am');
    if (i === 8) return fill({ crop: 'cai', stage: 'vua-gieo' }, 'kho');
    return fill(null);
  });
  apply(garden, fills);
  const spots = CROP_STAGES.flatMap((_, r) => CROPS.map((_, c) => ({ x: SAMPLE.x0 + c * SAMPLE.dx, z: SAMPLE.z0 + r * SAMPLE.dz })));
  const sample = new CropLayer(scene, spots.map((p) => ({ ...p, y: groundY(p.x, p.z), size: SAMPLE.size })), spec.look, spec.garden.cropScale, spec.trees.crown === 'chum');
  sample.show(CROP_STAGES.flatMap((stage) => CROPS.map((c) => ({ crop: c.id, stage }))));
  const tops = ripeTops(garden, fills, (i) => garden.beds.topY(i));
  const o8 = garden.plots[7];
  let fert = 0;
  return {
    lines: [
      `Vườn rau: o-1 … o-4 chín (${CROPS.slice(0, 4).map((c) => c.name).join(', ')}) · o-5 mầm đất khô + sâu · o-6 lớn đất ẩm + 3 cỏ · o-7 sâu + 2 cỏ · o-8 vừa bón · o-9 vừa gieo đất khô · o-10 … o-12 hoang`,
      `Bảng mẫu bãi tây x ${SAMPLE.x0} … ${(SAMPLE.x0 + 7 * SAMPLE.dx).toFixed(1)}: hàng z ${CROP_STAGES.map((s, i) => `${(SAMPLE.z0 + i * SAMPLE.dz).toFixed(1)} ${s}`).join(' · ')}`,
    ],
    update(dt) {
      garden.crops.tick(dt);
      garden.pests.tick(dt);
      garden.hats.glow(tops, dt);
      // o-8 vừa bón: lấp lánh xanh mỗi 1,5 s
      fert += dt;
      if (fert > 1.5) {
        fert = 0;
        garden.hats.emit('sparkle', { x: o8.x, y: garden.beds.topY(7) + 0.2, z: o8.z }, { radius: 0.5 });
      }
      garden.hats.tick(dt);
    },
  };
}

function lamVuon(garden: Garden3D, params: URLSearchParams, character?: Character): GardenPreview {
  garden.beds.setOpen(6);
  const only = params.get('viec');
  const jobs: readonly WorkId[] = only && isWork(only) ? [only] : WORK_IDS;
  /** việc j làm ở luống o-(j+1) theo thứ tự WORK_IDS (luống cố định theo việc, lọc `viec` vẫn đúng luống) */
  const plotOf = (id: WorkId): number => WORK_IDS.indexOf(id);
  const before = (): Fill[] =>
    garden.plots.map((_, i) => {
      const id = WORK_IDS[i];
      if (id === 'gieo') return fill(null);
      if (id === 'tuoi') return fill({ crop: 'cai', stage: 'mam' }, 'kho');
      if (id === 'bat') return fill({ crop: 'ngo', stage: 'mam' }, 'am', { bug: true, weeds: 0 });
      if (id === 'nho') return fill({ crop: 'cuc', stage: 'lon' }, 'am', { bug: false, weeds: 3 });
      if (id === 'bon') return fill({ crop: 'tra', stage: 'mam' }, 'am');
      if (id === 'thu') return fill({ crop: 'bi', stage: 'chin' });
      return fill(null);
    });
  let fills = before();
  apply(garden, fills);
  const top = (i: number): number => garden.beds.topY(i);
  const slot = (id: WorkId): number => GAP + WORK_LEN[id];
  const cycle = jobs.reduce((s, id) => s + slot(id), 0) + GAP;
  const freezeAt = Number(params.get('t'));
  const frozen = Number.isFinite(freezeAt) && freezeAt >= 0 && params.has('t');
  let clock = 0;
  const tip = new THREE.Vector3();
  const dir = new THREE.Vector3();

  /** đứng phía nam luống [i], mặt nhìn về luống (−z) */
  const standAt = (i: number): void => {
    if (!character) return;
    const p = garden.plots[i];
    character.root.position.set(p.x, top(i) - 0.2, p.z + 1.25);
    character.facing.rotation.y = Math.PI;
  };
  const hand = (i: number): Plot3 => {
    const p = garden.plots[i];
    return { x: p.x + 0.15, y: top(i) + 0.75, z: p.z + 0.8 };
  };
  /** hiệu ứng lúc [t] (giây trong việc) cho khung dài [dt] — gọi mọi khung, kể cả khi tua nhanh */
  const fx = (id: WorkId, i: number, t0: number, t1: number, dt: number): void => {
    const p = garden.plots[i];
    const at = (s: number): boolean => t0 < s && t1 >= s;
    const centre = { x: p.x, y: top(i) + 0.05, z: p.z };
    for (const s of WORK_FX[id].at) {
      if (!at(s)) continue;
      if (id === 'gieo') garden.hats.emit('seed', hand(i), { floor: top(i), dir: { x: 0, y: -0.3, z: -1 } });
      if (id === 'bon') garden.hats.emit('fert', hand(i), { floor: top(i), dir: { x: 0, y: -0.3, z: -1 } });
      if (id === 'bat') garden.pests.pop(i, 'bug');
      if (id === 'nho') {
        garden.pests.pop(i, 'weed');
        garden.hats.emit('dust', centre, { floor: top(i) - 0.05 });
      }
      if (id === 'thu') {
        garden.crops.flyHarvest(i, { x: p.x + 1.6, y: top(i) + 3.2, z: p.z + 2.5 });
        garden.hats.emit('gold', { x: p.x, y: top(i) + 0.4, z: p.z }, { count: 8, radius: 0.5 });
      }
    }
    const until = WORK_FX[id].until;
    if (id === 'tuoi' && until && t1 > WORK_FX.tuoi.at[0] && t0 < until) {
      if (character && hasToolTip(character) && character.toolTip(tip, dir)) garden.hats.stream(tip, dir, dt, top(i));
      else garden.hats.stream(hand(i), { x: 0, y: -0.4, z: -1 }, dt, top(i));
    }
    // kết quả lúc diễn xong (như app: ghi luật lúc diễn xong)
    if (at(WORK_LEN[id] - 1e-6)) {
      if (id === 'gieo') fills[i] = fill({ crop: 'lua', stage: 'vua-gieo' }, 'am');
      if (id === 'tuoi') fills[i] = { ...fills[i], soil: 'am' };
      if (id === 'bat') fills[i] = { ...fills[i], pest: { bug: false, weeds: 0 } };
      if (id === 'nho') fills[i] = { ...fills[i], pest: { bug: false, weeds: 0 } };
      if (id === 'bon') {
        fills[i] = { ...fills[i], show: { crop: 'tra', stage: 'lon' } };
        garden.hats.emit('sparkle', { x: p.x, y: top(i) + 0.2, z: p.z }, { radius: 0.5 });
      }
      if (id === 'thu') fills[i] = fill(null);
      apply(garden, fills);
      if (id === 'bon') garden.crops.bounce(i);
    }
  };

  const step = (dt: number, state: CharacterState): void => {
    const c0 = clock;
    clock += dt;
    if (clock >= cycle) {
      // hết vòng: dựng lại từ đầu
      clock -= cycle;
      fills = before();
      apply(garden, fills);
      state.work = undefined;
    }
    let s = 0;
    let cur: { id: WorkId; t: number } | null = null;
    for (const id of jobs) {
      const begin = s + GAP;
      const end = begin + WORK_LEN[id];
      const i = plotOf(id);
      if (clock >= s && clock < end) {
        standAt(i);
        state.hold = id;
        if (clock >= begin) cur = { id, t: clock - begin };
      }
      // hiệu ứng theo giờ việc (cả phần tua qua trong khung này)
      const t0 = c0 - begin;
      const t1 = clock - begin;
      if (t1 > 0 && t0 < WORK_LEN[id]) fx(id, i, Math.max(-1, t0), Math.min(WORK_LEN[id], t1), dt);
      s = end;
    }
    state.work = cur ? { id: cur.id, t: cur.t, len: WORK_LEN[cur.id] } : undefined;
    if (!cur && clock >= s) state.hold = undefined;
    garden.crops.tick(dt);
    garden.pests.tick(dt);
    garden.hats.glow(ripeTops(garden, fills, top), dt);
    garden.hats.tick(dt);
  };

  let warmed = false;
  return {
    lines: [`Làm vườn: ${jobs.map((id) => `${id} o-${plotOf(id) + 1}`).join(' → ')}, vòng ${cycle.toFixed(1)} s${frozen ? ` · dừng ở ${freezeAt} s` : ''}`],
    update(dt, state) {
      if (frozen) {
        // tua tới đúng giây [t] bằng bước nhỏ một lần, rồi đứng hình (hạt / dáng giữ nguyên để chụp)
        if (!warmed) {
          warmed = true;
          for (let t = 0; t < freezeAt; t += 1 / 60) {
            step(1 / 60, state);
            character?.animate(1 / 60, 0, state);
          }
        }
        return;
      }
      step(dt, state);
    },
  };
}
