import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NPC_HIDE_DIST, showNearNpcs } from './npc';

describe('NPC ở xa', () => {
  it('R-NPC-1: Tiểu Mặc (−4,4; 19) — người chơi ở (−4,4; −16,5) cách 35,5 m → ẩn; (−4,4; −14,5) cách 33,5 m → hiện', () => {
    expect(NPC_HIDE_DIST).toBe(35);
    const root = new THREE.Object3D();
    root.position.set(-4.4, 0, 19);
    const npc = { id: 'tieu-mac', root, update: () => {} };
    expect(showNearNpcs([npc], -4.4, -16.5)).toEqual([]);
    expect(root.visible).toBe(false);
    expect(showNearNpcs([npc], -4.4, -14.5)).toEqual([npc]);
    expect(root.visible).toBe(true);
  });
});
