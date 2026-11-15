import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { paveProblem, treesOnPaving } from './cayTrenNen';
import { DEFAULT_SCENE, type SceneSpec, type TreePlace } from './spec';
import { resolveSceneSpec } from './specCheck';

const DIR = new URL('../../../design/scene/', import.meta.url);

/** Cảnh thử: lối lát dọc x = 0 (rộng 4), sân lát x 10 … 20, còn lại là đất. */
function scene(yard: TreePlace[]): SceneSpec {
  const t = DEFAULT_SCENE.terrain;
  return {
    ...DEFAULT_SCENE,
    paths: [{ from: [0, -20], to: [0, 20], width: 4 }],
    terrain: { ...t, enabled: true, stairs: [], floors: [], plateaus: [{ from: [10, -10], to: [20, 10], y: 0, pave: true }] },
    buildings: [],
    bridges: [],
    gates: [],
    teleport: { ...DEFAULT_SCENE.teleport, enabled: false },
    trees: { ...DEFAULT_SCENE.trees, yard, groves: [] },
  };
}

describe('R-VA-6: cây không mọc trên nền lát', () => {
  it('thân chạm lối lát → lỗi, có bồn cũng vậy; ra ngoài lối (cỏ) → hợp lệ', () => {
    // tùng 1,6: nửa cạnh thân 0,72 — mép lối x = 2
    const onPath = treesOnPaving(scene([{ kind: 'tung', x: 2.5, z: 0, scale: 1.6 }]));
    expect(onPath).toMatchObject([{ tree: 'trees.yard[0]', on: 'paths[0]', court: false }]);
    expect(paveProblem(onPath[0])).toContain('dời ra khỏi lối đi');
    expect(treesOnPaving(scene([{ kind: 'tung', x: 2.5, z: 0, scale: 1.6, planter: true }]))).toHaveLength(1);
    expect(treesOnPaving(scene([{ kind: 'tung', x: 3, z: 0, scale: 1.6 }]))).toEqual([]);
  });

  it('trên sân lát: không bồn → lỗi (gợi ý thêm bồn); có bồn → hợp lệ', () => {
    const bare = treesOnPaving(scene([{ kind: 'mai', x: 15, z: 0, scale: 1 }]));
    expect(bare).toMatchObject([{ court: true }]);
    expect(paveProblem(bare[0])).toContain('"planter": true');
    expect(treesOnPaving(scene([{ kind: 'mai', x: 15, z: 0, scale: 1, planter: true }]))).toEqual([]);
  });

  it('cụm cây: xét từng cây sinh ra', () => {
    const s = scene([]);
    s.trees.groves = [{ kind: 'tan', x: 15, z: 0, w: 4, d: 4, count: 3 }];
    expect(treesOnPaving(s)).toHaveLength(3);
    s.trees.groves[0].planter = true;
    expect(treesOnPaving(s)).toEqual([]);
  });

  it('mọi cảnh trong design/scene/ không còn cây trên nền lát (V-63)', () => {
    for (const f of readdirSync(DIR).filter((n) => n.endsWith('.json'))) {
      const spec = resolveSceneSpec(JSON.parse(readFileSync(new URL(f, DIR), 'utf8'))).spec;
      expect(treesOnPaving(spec).map(paveProblem), f).toEqual([]);
    }
  });
});
