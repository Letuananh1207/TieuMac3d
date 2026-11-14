import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NPC_HIDE_DIST, showNearNpcs } from './npc';

describe('NPC ở xa', () => {
  it('R-NPC-1: Tiểu Mặc (−7,5; 24) — người chơi ở (−7,5; −14,5) cách 38,5 m → ẩn; (−7,5; −9,5) cách 33,5 m → hiện', () => {
    expect(NPC_HIDE_DIST).toBe(35);
    const root = new THREE.Object3D();
    root.position.set(-7.5, 0, 24);
    const npc = { id: 'tieu-mac', root, update: () => {} };
    expect(showNearNpcs([npc], -7.5, -14.5)).toEqual([]);
    expect(root.visible).toBe(false);
    expect(showNearNpcs([npc], -7.5, -9.5)).toEqual([npc]);
    expect(root.visible).toBe(true);
  });
});
