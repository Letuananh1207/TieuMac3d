import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Colliders } from '../collision/colliders';

// canvas 2D giả (biển, vôi, ngói vẽ bằng canvas): mọi lệnh vẽ trả lại chính nó
const ctx: unknown = new Proxy({}, { get: (_t, key) => (key === 'measureText' ? () => ({ width: 10 }) : key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) : () => ctx) });
vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx }) });
// không gộp khối: thấy từng khối gốc (kích thước, màu riêng) để biết chỗ dựng
vi.mock('./merge', async (orig) => ({ ...(await orig<typeof import('./merge')>()), mergeStatic: () => 0, mergeVertexColors: () => 0 }));
vi.stubGlobal('window', { devicePixelRatio: 1, innerWidth: 390, innerHeight: 844, addEventListener: () => {} });

const { loadScene, REGION_SCENES, HOME_SCENE } = await import('./loadSpec');
const { buildWorld } = await import('./world');
const { scanZFight } = await import('./zfightScan');

// Mặc định quét 2 cảnh nhanh (≈ 3 s mỗi cảnh) phủ cửa bức bàn, góc tường, cuộn lụa, lan can thang.
// Cả 7 cảnh (≈ 2 phút): ZFIGHT=1 npx vitest run src/scene/zfightRegions.test.ts
const QUICK = new Set(['to-lua', 'bong-lai']);
const ALL = !!import.meta.env.ZFIGHT;

describe('(L-10) dò mặt trùng cả cảnh', () => {
  for (const id of [HOME_SCENE, ...REGION_SCENES]) {
    it.skipIf(!ALL && !QUICK.has(id))(`(L-10): ${id} — không có mặt trùng khác màu`, () => {
      const scene = new THREE.Scene();
      const spec = loadScene(id).spec;
      buildWorld(scene, new Colliders(), spec);
      const hits = scanZFight(scene);
      if (hits.length) console.log(`${id}: ${hits.length}\n` + hits.slice(0, 400).map((h) => `  ${h.at.join(';')}  ${h.a}  ×  ${h.b}`).join('\n'));
      expect(hits.length).toBe(0);
    }, 300_000); // cảnh lớn quét lâu (tông môn ≈ 1,5 phút)
  }
});
