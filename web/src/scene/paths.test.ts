import { describe, expect, it } from 'vitest';
import { curbRuns, keepRows } from './paths';
import { DEFAULT_SCENE, type SceneSpec } from './spec';
import { loadScene, HOME_SCENE } from './loadSpec';

/** Cảnh tối thiểu: địa hình bật, không bục / nền nào, các lối cho sẵn. */
function town(paths: SceneSpec['paths'], extra: Partial<SceneSpec['terrain']> = {}): SceneSpec {
  return {
    ...DEFAULT_SCENE,
    paths,
    buildingStyle: { ...DEFAULT_SCENE.buildingStyle, pathEdge: { width: 0.3, height: 0.08, color: '#c9c3b6' } },
    terrain: { ...DEFAULT_SCENE.terrain, enabled: true, plateaus: [], floors: [], ...extra },
  };
}

describe('keepRows — bỏ hàng điểm giữa ở chỗ đất phẳng', () => {
  it('đất phẳng chỉ giữ hai đầu; có gờ thì giữ chỗ gãy', () => {
    expect(keepRows([[0, 0], [0, 0], [0, 0], [0, 0]])).toEqual([0, 3]);
    expect(keepRows([[0], [1], [2], [3]])).toEqual([0, 3]); // dốc đều
    expect(keepRows([[0], [0], [1], [1]])).toEqual([0, 1, 2, 3]);
  });
});

describe('bó vỉa lối lát (V-44)', () => {
  it('pathEdge.width 0 (mặc định) → không có bó vỉa như cũ', () => {
    expect(curbRuns({ ...town([{ from: [0, 0], to: [10, 0], width: 2 }]), buildingStyle: DEFAULT_SCENE.buildingStyle })).toEqual([]);
  });

  it('hai mép ngoài lối, chừa khe chỗ lối rẽ cắt vào', () => {
    const runs = curbRuns(town([
      { from: [0, 0], to: [10, 0], width: 2 },
      { from: [5, 0], to: [5, 8], width: 2 },
    ]));
    // lối chính: mép z = −1,15 liền; mép z = +1,15 chừa x 4 … 6 (lối rẽ rộng 2)
    const main = runs.filter((r) => r.dz === 0 && Math.abs(r.z0) > 1);
    const far = main.find((r) => r.z0 < 0)!;
    const near = main.find((r) => r.z0 > 0)!;
    expect(far.spans).toEqual([[0, 10]]);
    expect(near.spans.map(([a, b]) => [+a.toFixed(2), +b.toFixed(2)])).toEqual([
      [0, 4],
      [6, 10],
    ]);
  });

  it('lối chạy trên sân lát cùng gạch → không gờ; trên chất nền khác màu → có gờ', () => {
    const plateau = { from: [-20, -20] as [number, number], to: [20, 20] as [number, number], y: 0, pave: true };
    expect(curbRuns(town([{ from: [0, 0], to: [10, 0], width: 2 }], { plateaus: [plateau] }))).toEqual([]);
    const floors = [{ from: [-20, -20] as [number, number], to: [20, 20] as [number, number], color: '#8e8474' }];
    expect(curbRuns(town([{ from: [0, 0], to: [10, 0], width: 2 }], { plateaus: [plateau], floors }))).toHaveLength(2);
  });

  it('tông môn: không bó vỉa nào chạy trong nền gạch Kỳ Văn Uyển; trục đông – tây có gờ hai bên', () => {
    const spec = loadScene(HOME_SCENE).spec;
    const runs = curbRuns(spec);
    const inside = (x: number, z: number): boolean => x > -51 && x < -17 && z > -11 && z < 17;
    for (const r of runs) for (const [a, b] of r.spans) expect(inside(r.x0 + r.dx * ((a + b) / 2), r.z0 + r.dz * ((a + b) / 2))).toBe(false);
    const axis = runs.filter((r) => r.dz === 0 && r.x0 === 17);
    expect(axis.map((r) => +r.z0.toFixed(2)).sort()).toEqual([1.35, 6.65]);
  });
});
