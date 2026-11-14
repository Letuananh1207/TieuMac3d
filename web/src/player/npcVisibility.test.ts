import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NPC_HIDE_DIST, showNearNpcs } from './npc';

describe('NPC ở xa', () => {
  it('R-NPC-1: Tiểu Mặc (7,6; 13,6) — người chơi ở (7,6; −25) cách 38,6 m → ẩn; (7,6; −20) cách 33,6 m → hiện', () => {
    expect(NPC_HIDE_DIST).toBe(35);
    const root = new THREE.Object3D();
    root.position.set(7.6, 0, 13.6);
    const npc = { id: 'tieu-mac', root, update: () => {} };
    expect(showNearNpcs([npc], 7.6, -25)).toEqual([]);
    expect(root.visible).toBe(false);
    expect(showNearNpcs([npc], 7.6, -20)).toEqual([npc]);
    expect(root.visible).toBe(true);
  });
});
