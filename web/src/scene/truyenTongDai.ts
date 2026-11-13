/**
 * Đài tròn nhiều tầng dưới vòng trận Truyền Tống Đài (kế hoạch docs/tasks/2026-11-13-truyen-tong-dai-nhieu-tang.md):
 * tầng đá trụ tròn có gờ đá trắng, lan can quanh mép tầng (chừa 4 lối bậc), 4 lối bậc, trụ đá khắc phù văn sáng theo độ
 * nạp. Hình suy từ `teleportLayout.ts` (dùng chung với vật cản, mặt đất đi được, `scene:check`).
 * Ngân sách: tầng + gờ + bậc (đá) · lan can (đá trắng) · thân trụ — đứng yên, `mergeStatic` gộp theo màu ≈ 3 draw call;
 * phù văn 1 `InstancedMesh` (đổi màu khi nạp) = 1.
 */
import * as THREE from 'three';
import type { Colliders } from '../collision/colliders';
import type { Pad } from '../collision/ground';
import { box } from './kien_truc/hinh';
import { lambert } from './materials';
import { markDynamic } from './merge';
import type { TeleportSpec } from './spec';
import { daisLayout, daisPads, pillarSpots, railPosts, STAIR_DIRS } from './teleportLayout';

/** Cao một bậc (m) — cỡ người bước. */
const RISER = 0.2;
/** Lan can: cao trụ, cao thanh, cạnh trụ (m). */
const RAIL_H = 0.6;
const RAIL_BAR_Y = 0.45;
const POST = 0.18;
/** Vật cản mỗi trụ lan can (m) — trụ cách nhau 0,8 → khe 0,4 < đường kính nhân vật. */
const POST_HIT = 0.4;
/** Trụ phù văn: cạnh thân, cao thân, bán kính vật cản (m). */
const PILLAR_W = 0.6;
const PILLAR_H = 3.2;
const PILLAR_HIT = 0.5;
/** Dải phù văn trên thân trụ: cao, từ chân lên tâm dải (m). */
const RUNE_H = 1.8;
const RUNE_Y = 1.7;

export interface Dais {
  /** độ cao mặt tầng trên cùng (toạ độ cảnh) — vòng trận đặt ở đây */
  topY: number;
  /** bán kính mặt tầng trên cùng */
  topRadius: number;
  /** mặt đất đi được (tầng + dốc bậc) cho `LayeredGround` */
  pads: Pad[];
  /** 0 = phù văn tắt (màu `dim`) · 1 = sáng hẳn (`lit`) */
  setGlow(glow: number): void;
}

/** Dựng đài quanh tâm vòng (`y0` = mặt đất tại tâm), thêm vật cản (lan can, trụ). Gọi khi `tp.dais.tiers` > 0. */
export function addDais(scene: THREE.Scene, colliders: Colliders, tp: TeleportSpec, y0: number): Dais {
  const { dais } = tp;
  const { stone, rail, pillar } = dais.colors;
  const L = daisLayout(tp);
  const [cx, cz] = tp.center;
  const g = new THREE.Group();
  g.position.set(cx, y0, cz);
  scene.add(g);

  // tầng: trụ tròn từ đất lên mặt tầng, gờ đá trắng nhô ra ở mép trên
  L.radii.forEach((r, i) => {
    const top = (i + 1) * dais.tierHeight;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.06, top, 36), lambert(stone));
    body.position.y = top / 2;
    const lip = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.1, r + 0.1, 0.12, 36), lambert(rail));
    lip.position.y = top - 0.06;
    g.add(body, lip);
  });

  // lối bậc: dựng cho hướng +z rồi xoay sang 4 hướng; mặt bậc bám dốc `daisPads` (cao dần về phía tâm)
  const topR = L.radii[L.radii.length - 1];
  const run = L.stairEnd - topR;
  const steps = Math.max(2, Math.round(L.height / RISER));
  const depth = run / steps;
  for (const [dx, dz] of STAIR_DIRS) {
    const s = new THREE.Group();
    s.rotation.y = Math.atan2(dx, dz);
    for (let i = 0; i < steps; i++) {
      const h = (L.height * (steps - i)) / steps;
      s.add(box(dais.stairWidth, h, depth, stone, 0, h / 2, topR + (i + 0.5) * depth));
    }
    // má bậc hai bên (đá trắng), thấp dần theo bậc
    for (const side of [-1, 1]) {
      for (let i = 0; i < steps; i++) {
        const h = (L.height * (steps - i)) / steps + 0.25;
        s.add(box(0.3, h, depth, rail, side * (dais.stairWidth / 2 + 0.15), h / 2, topR + (i + 0.5) * depth));
      }
    }
    g.add(s);
  }

  // lan can: trụ + thanh nối hai trụ liền nhau cùng cung; mỗi trụ một vật cản nhỏ
  const posts = railPosts(tp);
  posts.forEach((p, i) => {
    const y = (p.tier + 1) * dais.tierHeight;
    g.add(box(POST, RAIL_H, POST, rail, p.x, y + RAIL_H / 2, p.z));
    colliders.add(cx + p.x, cz + p.z, POST_HIT, POST_HIT);
    const next = posts[i + 1];
    if (!next || next.tier !== p.tier) return;
    const len = Math.hypot(next.x - p.x, next.z - p.z);
    if (len > 1.2) return; // khe lối bậc: hai trụ hai bên khe không nối
    const bar = box(len, 0.1, 0.12, rail, (p.x + next.x) / 2, y + RAIL_BAR_Y, (p.z + next.z) / 2);
    bar.rotation.y = -Math.atan2(next.z - p.z, next.x - p.x);
    g.add(bar);
  });

  // trụ phù văn: thân + đế + mũ (đá), dải phù văn chéo hai chiều (1 InstancedMesh, đổi màu theo độ nạp)
  const spots = pillarSpots(tp);
  const runeMat = new THREE.MeshBasicMaterial({ color: tp.colors.dim });
  const runes = new THREE.InstancedMesh(new THREE.BoxGeometry(PILLAR_W + 0.04, RUNE_H, 0.16), runeMat, Math.max(1, spots.length * 2));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  spots.forEach((p, i) => {
    g.add(box(PILLAR_W + 0.2, 0.3, PILLAR_W + 0.2, pillar, p.x, p.y + 0.15, p.z));
    g.add(box(PILLAR_W, PILLAR_H, PILLAR_W, pillar, p.x, p.y + PILLAR_H / 2, p.z));
    g.add(box(PILLAR_W + 0.25, 0.25, PILLAR_W + 0.25, rail, p.x, p.y + PILLAR_H + 0.12, p.z));
    colliders.addCircle(cx + p.x, cz + p.z, PILLAR_HIT);
    for (let k = 0; k < 2; k++) {
      q.setFromAxisAngle(up, (k * Math.PI) / 2);
      runes.setMatrixAt(i * 2 + k, m.compose(new THREE.Vector3(p.x, p.y + RUNE_Y, p.z), q, new THREE.Vector3(1, 1, 1)));
    }
  });
  runes.count = spots.length * 2;
  runes.instanceMatrix.needsUpdate = true;
  runes.computeBoundingSphere();
  markDynamic(runes);
  g.add(runes);

  const dim = new THREE.Color(tp.colors.dim);
  const lit = new THREE.Color(tp.colors.lit);
  return {
    topY: y0 + L.height,
    topRadius: topR,
    pads: daisPads(tp, y0),
    setGlow(glow) {
      runeMat.color.copy(dim).lerp(lit, glow);
      runes.visible = spots.length > 0;
    },
  };
}
