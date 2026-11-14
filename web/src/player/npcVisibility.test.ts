import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { NPC_HIDE_DIST, showNearNpcs } from './npc';

describe('NPC ở xa', () => {
  it('R-NPC-1: Tiểu Mặc (−2,4; 8) — người chơi ở (−2,4; −30) cách 38 m → ẩn; (−2,4; −25) cách 33 m → hiện', () => {
    expect(NPC_HIDE_DIST).toBe(35);
    const root = new THREE.Object3D();
    root.position.set(-2.4, 0, 8);
    const npc = { id: 'tieu-mac', root, update: () => {} };
    expect(showNearNpcs([npc], -2.4, -30)).toEqual([]);
    expect(root.visible).toBe(false);
    expect(showNearNpcs([npc], -2.4, -25)).toEqual([npc]);
    expect(root.visible).toBe(true);
  });
});
