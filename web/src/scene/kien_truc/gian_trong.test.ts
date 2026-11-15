import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENE, type BuildingSpec } from '../spec';
import { GIAN_TRONG_FLOOR, gianTrong } from './gian_trong';

const ROOM: BuildingSpec = { id: 'gian-trong', x: 0, z: 0, w: 14, d: 10, title: 'Chính phòng', roofColor: '#8a6a4c', kind: 'gian-trong' };

describe('gian trong Nhà của ta (V-68)', () => {
  const g = new THREE.Group();
  const shell = gianTrong(g, ROOM, DEFAULT_SCENE.buildingStyle);
  const hitsAt = (x: number, z: number): boolean => shell.boxes.some((b) => Math.abs(x - b.x) <= b.w / 2 && Math.abs(z - b.z) <= b.d / 2);

  it('R-NHA-1: phòng kín bốn tường (che camera), chừa ô cửa giữa tường trước; ngoài cửa có túi chặn — không đi ra khỏi phòng', () => {
    expect(hitsAt(0, -4.9)).toBe(true); // tường sau
    expect(hitsAt(-6.9, 0)).toBe(true); // hồi tây
    expect(hitsAt(4, 4.9)).toBe(true); // tường trước cạnh cửa
    expect(hitsAt(0, 4.9)).toBe(false); // ô cửa mở
    expect(hitsAt(0, 6.6)).toBe(true); // túi chặn ngoài cửa
    const walls = shell.boxes.filter((b) => b.h === Infinity);
    expect(walls.length).toBe(5);
  });

  it('R-NHA-2: sàn ván đứng được, "trong nhà" = lòng phòng (camera không ra sau tường)', () => {
    expect(shell.pads).toEqual([{ x: 0, z: 0, w: 14, d: 10, y: GIAN_TRONG_FLOOR }]);
    expect(shell.floor.w).toBeLessThan(14 - 2 * 0.24);
    expect(shell.floor.d).toBeLessThan(10 - 2 * 0.24);
  });

  it('trần một mặt nhìn xuống, không gộp (camera kéo cao quá trần thì nhìn được vào phòng)', () => {
    const ceiling = g.children.find((o) => o instanceof THREE.Mesh && o.geometry instanceof THREE.PlaneGeometry) as THREE.Mesh;
    expect(ceiling.userData.dynamic).toBe(true);
    expect((ceiling.material as THREE.Material).side).toBe(THREE.FrontSide);
    const n = new THREE.Vector3(0, 0, 1).applyEuler(ceiling.rotation);
    expect(n.y).toBeCloseTo(-1);
  });
});
