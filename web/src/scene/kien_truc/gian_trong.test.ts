import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { wallCut, worldCut } from '../rooms';
import { DEFAULT_SCENE, type BuildingSpec } from '../spec';
import { GIAN_TRONG_CUT, GIAN_TRONG_DOOR_Z, GIAN_TRONG_FLOOR, gianTrong } from './gian_trong';

const ROOM: BuildingSpec = { id: 'gian-trong', x: 0, z: 0, w: 14, d: 10, title: 'Chính phòng', roofColor: '#8a6a4c', kind: 'gian-trong' };

describe('gian trong Nhà của ta (V-68, V-71)', () => {
  const g = new THREE.Group();
  const shell = gianTrong(g, ROOM, DEFAULT_SCENE.buildingStyle);
  const hitsAt = (x: number, z: number): boolean => shell.boxes.some((b) => Math.abs(x - b.x) <= b.w / 2 && Math.abs(z - b.z) <= b.d / 2);

  it('R-NHA-1 (V-71): phòng kín bốn tường — cửa ra hồi tây đóng, không đi bộ ra được', () => {
    expect(hitsAt(0, -4.9)).toBe(true); // tường sau
    expect(hitsAt(0, 4.9)).toBe(true); // tường trước liền (không còn ô cửa)
    expect(hitsAt(6.9, 0)).toBe(true); // hồi đông
    expect(hitsAt(-6.9, GIAN_TRONG_DOOR_Z)).toBe(true); // cửa hồi tây đóng
    expect(shell.boxes.filter((b) => b.h === Infinity)).toHaveLength(4);
    expect(shell.boxes).toHaveLength(4); // không còn túi chặn ngoài cửa
  });

  it('R-NHA-2: sàn ván đứng được, "trong nhà" = lòng phòng', () => {
    expect(shell.pads).toEqual([{ x: 0, z: 0, w: 14, d: 10, y: GIAN_TRONG_FLOOR }]);
    expect(shell.floor.w).toBeLessThan(14 - 2 * 0.24);
    expect(shell.floor.d).toBeLessThan(10 - 2 * 0.24);
  });

  it('V-71: không trần — không mặt phẳng trần, không khối nào trên đỉnh tường', () => {
    let top = 0;
    g.updateMatrixWorld(true);
    g.traverse((o) => {
      if (o instanceof THREE.Mesh && o.geometry instanceof THREE.PlaneGeometry) throw new Error('còn trần');
      if (o instanceof THREE.Mesh) {
        o.geometry.computeBoundingBox();
        const b = o.geometry.boundingBox!.clone().applyMatrix4(o.matrixWorld);
        top = Math.max(top, b.max.y);
      }
    });
    expect(top).toBeLessThanOrEqual(4.01);
  });

  it('V-71: tường trước + hai hồi cắt được (nhóm riêng, không gộp chung), tường sau luôn cao; cắt khi camera ở phía ngoài', () => {
    const cuts = shell.cutaway ?? [];
    expect(cuts.map((c) => [c.axis, c.side])).toEqual([['z', 1], ['x', 1], ['x', -1]]);
    for (const c of cuts) {
      expect(c.group.userData.dynamic).toBe(true);
      const box = new THREE.Box3().setFromObject(c.group);
      expect(box.min.y).toBeGreaterThanOrEqual(GIAN_TRONG_CUT - 0.01); // chân tường thấp ở lại
    }
    const [front, east, west] = cuts.map((c) => worldCut(ROOM, c));
    // camera chính diện cao phía nam (0; 13) → cắt tường trước, giữ hai hồi
    expect([front, east, west].map((c) => wallCut(c, 0, 13))).toEqual([true, false, false]);
    // xoay 35° sang đông, camera (8,5; 12) → cắt cả hồi đông
    expect([front, east, west].map((c) => wallCut(c, 8.5, 12))).toEqual([true, true, false]);
  });

  it('V-71: nhà quay 90° thì mặt cắt quay theo', () => {
    const c = worldCut({ x: 10, z: 0, rotY: 90 }, { group: new THREE.Group(), axis: 'z', side: 1, at: 5 });
    expect([c.nx, c.nz, c.at]).toEqual([1, 0, 15]);
  });
});
