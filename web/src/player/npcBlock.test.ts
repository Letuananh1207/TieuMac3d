import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { GAME_NPC_IDS, NPC_IDS } from '../scene/spec';
import { BLOCK_NPC_COLORS, createBlockNpc, isMovingSpec } from './npc';

describe('Tiểu nhị đi mang trà (R-TRA-1)', () => {
  it('R-TRA-1: tiểu nhị dựng như NPC biết đi (không cần `route`); NPC đứng khác vẫn đứng', () => {
    expect(isMovingSpec({ id: 'tieu-nhi', x: 42.1, z: -36, rotY: 270 })).toBe(true);
    expect(isMovingSpec({ id: 'thu-thu', x: 0, z: 0 })).toBe(false);
  });
});

describe('NPC trò chơi thế bằng khối', () => {
  it('R-NPC-1: 4 NPC trò chơi + thầy Trúc Lão (R-HANH-8) có trong NPC_IDS và có bảng màu áo riêng', () => {
    expect(GAME_NPC_IDS).toEqual(['thi-ong', 'tu-tai', 'tai-nu', 'truc-ong', 'truc-lao']);
    for (const id of GAME_NPC_IDS) {
      expect((NPC_IDS as readonly string[]).includes(id)).toBe(true);
      expect(BLOCK_NPC_COLORS[id]?.robe).toMatch(/^#/);
    }
    expect(new Set(GAME_NPC_IDS.map((id) => BLOCK_NPC_COLORS[id].robe)).size).toBe(GAME_NPC_IDS.length); // mỗi người một màu áo
  });

  it('R-NPC-1: thiếu model → dựng khối (không bỏ), gộp còn ≤ 2 khối vẽ; ngồi thì thân hạ xuống', () => {
    const stand = createBlockNpc({ id: 'truc-ong', x: 0, z: 0 });
    const sit = createBlockNpc({ id: 'thi-ong', x: 1, z: 1, pose: 'ngoi', rotY: 90 });
    for (const n of [stand, sit]) {
      let meshes = 0;
      n.root.traverse((o) => {
        if (o instanceof THREE.Mesh) meshes++;
      });
      expect(meshes).toBeLessThanOrEqual(2);
      n.update(0.1);
    }
    const yOf = (n: typeof stand): number => {
      const b = new THREE.Box3().setFromObject(n.root);
      return b.max.y;
    };
    expect(yOf(sit)).toBeLessThan(yOf(stand) - 0.3);
  });
});
