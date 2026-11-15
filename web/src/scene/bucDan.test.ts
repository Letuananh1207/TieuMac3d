import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Colliders } from '../collision/colliders';
import { BUC_DAN, bucDanList, bucDanSeat, DAN_TRANH } from './bucDan';
import { HOME_SCENE, loadScene } from './loadSpec';
import { DRAFT_GO_MO } from './npcDraft';
import { addProps } from './props';
import { DEFAULT_SCENE, type PropSpec } from './spec';

/** Bục đàn mẫu trong sổ (R-NPC-9): (8,5; 14,3), mặt nhìn bắc vào giữa Quảng Trường. */
const buc: PropSpec = { kind: 'buc-dan', x: 8.5, z: 14.3, rotY: 180 };

/** Khoảng cách từ điểm tới đoạn thẳng (x, z). */
function segDist(px: number, pz: number, [ax, az]: [number, number], [bx, bz]: [number, number]): number {
  const vx = bx - ax;
  const vz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz)));
  return Math.hypot(px - ax - t * vx, pz - az - t * vz);
}

describe('Bục đàn Quảng Trường — chỗ, va chạm, chỗ nhạc công', () => {
  it('R-NPC-9: nhạc công ngồi sau đàn ở (8,5; 14,85), cao 0,4 (mặt bục), nhìn bắc (rotY 180)', () => {
    const s = bucDanSeat(buc, () => 0);
    expect(s.x).toBeCloseTo(8.5, 9);
    expect(s.z).toBeCloseTo(14.85, 9);
    expect(s.y).toBeCloseTo(0.4, 9);
    expect(s.rotY).toBe(180);
    expect(DAN_TRANH.strings).toBe(21);
  });

  it('R-NPC-9: bục chặn hết (x 6,8 … 10,2; z 13 … 15,6) — không ai đi lên; ít tam giác', () => {
    const colliders = new Colliders();
    const scene = new THREE.Scene();
    addProps(scene, colliders, [buc], DEFAULT_SCENE.buildingStyle, DEFAULT_SCENE.trees);
    expect(colliders.boxes).toHaveLength(1);
    const b = colliders.boxes[0];
    expect([b.minX, b.maxX, b.minZ, b.maxZ].map((v) => +v.toFixed(6))).toEqual([6.8, 10.2, 13, 15.6]);
    expect(BUC_DAN.h).toBe(0.4);
    let tris = 0;
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const g = o.geometry as THREE.BufferGeometry;
        tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
      }
    });
    expect(tris).toBeLessThanOrEqual(600); // ngân sách trấn sát trần 150k — bục + đàn nhẹ
  });

  it('R-NPC-9: đặc tả thật — đúng một bục đàn ở mép nam Quảng Trường, không chắn cổng nam, giữa sân, đường Lão Canh', () => {
    const list = bucDanList(loadScene(HOME_SCENE).spec.props);
    expect(list).toHaveLength(1);
    const p = list[0];
    expect([p.x, p.z, p.rotY]).toEqual([8.5, 14.3, 180]);
    const minX = p.x - BUC_DAN.w / 2;
    const maxZ = p.z + BUC_DAN.d / 2;
    const minZ = p.z - BUC_DAN.d / 2;
    expect(minX - 4.8).toBeGreaterThanOrEqual(2); // lòng cổng nam x −4,8 … 4,8
    expect(17 - maxZ).toBeGreaterThanOrEqual(1.2); // lối sau bục tới lan can nam (z 17)
    expect(minZ).toBeGreaterThan(6); // khoảng giữa quảng trường (|x|, |z| < 6) để trống
    // đường vòng Lão Canh (bản thử) cách mép bục ≥ 0,6 m
    const r = DRAFT_GO_MO.route ?? [];
    const corners: [number, number][] = [
      [minX, minZ],
      [p.x + BUC_DAN.w / 2, minZ],
      [minX, maxZ],
      [p.x + BUC_DAN.w / 2, maxZ],
    ];
    for (let i = 0; i < r.length; i++) {
      for (const [cx, cz] of corners) expect(segDist(cx, cz, r[i], r[(i + 1) % r.length])).toBeGreaterThanOrEqual(0.6);
    }
  });

  it('R-NPC-9: cảnh mặc định (không đặc tả) không có bục đàn — cảnh cũ giữ nguyên', () => {
    expect(bucDanList(DEFAULT_SCENE.props)).toEqual([]);
  });
});
