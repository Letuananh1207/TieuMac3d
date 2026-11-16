/**
 * Canvas 3D `?dang=hac` — duyệt hạc truyền tống bằng model (kế hoạch docs/tasks/2026-11-16-hac-model.md, Q3). Không vào app.
 * Hạc lượn tại chỗ xuất phát (hoặc `&nv=x,z`), nhân vật ngồi cưỡi trên lưng (dáng `cuoiDang.ts` — R-HANH-5), thông số đo ở bảng.
 * - `&mau=hac` (mặc định khi có `design/models/hac.glb`) · `&mau=khoi-gop` (thân + cánh khối gộp một lưới — thử đường tự
 *   tách cánh, mặc định khi chưa có model; artifact không nhúng được .glb lớn) · `&mau=<mã>` (model khác trong design/models/)
 * - `&nan=0` — model chưa nắn dáng (so trước / sau V-20261116-104) · `&khoi` — bản khối cũ (3 draw call) để so · `&gap=1` — đứng đáp trên hai chân, cánh xếp (Q1, L-22)
 * - `&chan=0…1` — chân: 0 duỗi sau (bay) → 1 đứng (mặc định theo `gap`) · `&nhun=0…1` — nhún · `&cao=<m>` — cao hơn đất
 *   (mặc định: đứng hẳn → 0, còn lại lượn 2,2 m) — chụp "vừa rời đất, chân đang thu" (L-22)
 * - `&gan[=k]` — camera lại gần (khoảng cách × k, mặc định 0,5 — soát chân người cưỡi)
 * - `&vo=len|xuong` — dừng ở đỉnh / đáy nhịp vỗ (chụp so) · `&goc=truoc|sau-tren|ben|cheo|co|hong` — góc camera (co / hong: cận cổ, cận hông)
 */
import * as THREE from 'three';
import { showGroundShadow, type Character } from './player/character';
import { blockCraneGeometry, Crane } from './scene/hac';
import { craneModelFrom, CRANE_MODEL_TUNE, loadCraneModel, type CraneModel } from './scene/hacModel';
import { lambert } from './scene/materials';
import { staticModelUrl } from './scene/staticModel';
import type { SceneSpec } from './scene/spec';

type V3 = [number, number, number];
const fmt = (v: number): string => v.toFixed(2).replace('.', ',').replace('-', '−');
/** nhịp vỗ khi lượn tại chỗ (biên độ rad, nhịp) */
const AMP = 0.6;
const SPEED = 4;
/** lượn: cao hơn mặt đất (m) */
const HOVER = 2.2;

async function pickModel(spec: SceneSpec, mau: string, nan: boolean, lines: string[]): Promise<CraneModel | null> {
  if (mau === 'khoi-gop') {
    lines.push('Hạc: khối gộp (thân + 2 cánh một lưới) — thử đường tự tách cánh như model Tripo');
    return craneModelFrom(blockCraneGeometry(spec.crane), lambert('#ffffff', { vertexColors: true, side: THREE.DoubleSide, emissive: '#2b2b2b' }));
  }
  const m = await loadCraneModel(mau, nan);
  const how = nan ? 'đã nắn dáng' : 'chưa nắn (`&nan=0`)';
  lines.push(m ? `Hạc: model design/models/${mau}.glb — ${how}` : `Hạc: không nạp được design/models/${mau}.glb — đang xem bản khối`);
  return m;
}

export async function addCranePreview(
  scene: THREE.Scene,
  spec: SceneSpec,
  params: URLSearchParams,
  groundAt: (x: number, z: number) => number,
  rider: Character,
  view: (pos: V3, target: V3) => void,
): Promise<{ update(dt: number): void; lines: string[]; ride: { w: number; pitch: number } } | null> {
  if (params.get('dang') !== 'hac') return null;
  const lines: string[] = [];
  const crane = new Crane(spec.crane);
  const block = params.has('khoi');
  const mau = params.get('mau') ?? (staticModelUrl(CRANE_MODEL_TUNE.id) ? CRANE_MODEL_TUNE.id : 'khoi-gop');
  const model = block ? null : await pickModel(spec, mau, params.get('nan') !== '0', lines);
  if (block) lines.push('Hạc: bản khối cũ (3 draw call)');
  if (model) {
    crane.useModel(model);
    const s = model.shape;
    lines.push(
      `Đo: sải ${fmt(s.halfSpan * 2)} m · vai x ${fmt(s.shoulder[0])} y ${fmt(s.shoulder[1])} · đầu cánh x ${fmt(s.tip[0])} · ` +
        `đỉnh lưng ${fmt(s.backTop)} · chỗ ngồi y ${fmt(s.seat[1])} z ${fmt(s.seat[2])} (chưa nhân scale ${fmt(spec.crane.scale)}) · ` +
        `${Math.round(model.triangles).toLocaleString('vi-VN')} tam giác`,
    );
  }
  const gap = params.get('gap') === '1';
  crane.fold = gap ? 1 : 0;
  const num = (k: string, d: number): number => {
    const v = Number(params.get(k));
    return params.has(k) && Number.isFinite(v) ? v : d;
  };
  crane.stand = num('chan', gap ? 1 : 0);
  crane.squat = num('nhun', 0);
  const lift = num('cao', crane.stand >= 1 ? 0 : HOVER);
  const hover = lift > 0 && !gap && !params.has('cao');
  const vo = params.get('vo');
  const frozen = vo === 'len' || vo === 'xuong';
  // dừng nhịp: sin(t·SPEED) = ±1
  if (frozen) crane.update((vo === 'len' ? Math.PI / 2 : Math.PI * 1.5) / SPEED, gap ? 0 : AMP, SPEED);
  else crane.update(0, gap ? 0 : AMP, SPEED);
  // chỗ nhân vật đứng lúc mở trang (chỗ xuất phát, hoặc `&nv=x,z` — chọn chỗ thoáng để chụp)
  const { x, z } = rider.root.position;
  const ground = groundAt(x, z);
  const base = Number.isFinite(ground) ? ground : 0;
  crane.root.position.set(x, base + lift, z);
  crane.root.rotation.set(0, 0, 0); // mũi nhìn +z
  scene.add(crane.root);

  const k = spec.crane.scale;
  const P = crane.root.position;
  const goc = params.get('goc') ?? 'truoc';
  const up = 1.6 * k + crane.standLift * 0.6;
  const target: V3 = [P.x, P.y + up, P.z];
  const cams: Record<string, V3> = {
    'sau-tren': [P.x, P.y + 6 * k, P.z - 6.5 * k],
    ben: [P.x + 8 * k, P.y + up + 0.2 * k, P.z],
    cheo: [P.x + 6 * k, P.y + up + 1.2 * k, P.z + 6 * k],
  };
  // cận đầu cổ / hông (khi đứng — L-22): nhìn ngang chéo
  if (goc === 'co') target.splice(0, 3, P.x, P.y + 2.2 * k, P.z + 0.9 * k);
  if (goc === 'hong') target.splice(0, 3, P.x, P.y + 0.6 * k, P.z - 0.4 * k);
  cams.co = [P.x + 3.2 * k, P.y + 2.6 * k, P.z + 2.6 * k];
  cams.hong = [P.x + 3 * k, P.y + 0.9 * k, P.z + 1.2 * k];
  const far: V3 = cams[goc] ?? [P.x, P.y + up + 0.3 * k, P.z + 7.5 * k];
  // `&gan[=k]` — kéo camera lại gần (soát chân người cưỡi — R-HANH-5)
  const near = params.has('gan') ? Number(params.get('gan')) || 0.5 : 1;
  const cam = far.map((v, i) => target[i] + (v - target[i]) * near) as V3;
  if (!params.has('cam')) view(cam, target);

  const seat = new THREE.Vector3();
  let t = 0;
  const place = (): void => {
    rider.root.position.copy(crane.seatWorld(seat));
    rider.facing.rotation.y = crane.root.rotation.y;
  };
  place();
  showGroundShadow(rider, false);
  // dáng ngồi cưỡi (R-HANH-5) — hông theo lưng hạc
  const ride = { w: 1, pitch: crane.pitch };
  return {
    lines,
    ride,
    update(dt) {
      if (!frozen) {
        t += dt;
        crane.update(dt, gap ? 0 : AMP, SPEED, 0);
        if (hover) P.y = base + lift + Math.sin(t * 1.6) * 0.15;
      }
      place();
      ride.pitch = crane.pitch;
    },
  };
}
