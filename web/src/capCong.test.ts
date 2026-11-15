import { describe, expect, it } from 'vitest';
import { HOME_SCENE, loadScene, REGION_SCENES } from './scene/loadSpec';
import { arrivalFor, checkPortals, portalRect } from './scene/portals';
import type { PathSpec, PortalSpec } from './scene/spec';
import { placeName } from './zones/journeyMap';

// Cổng đi bộ nối các vùng lân cận theo bản đồ truyền tống (R-HANH-4, V-59) — đọc đặc tả thật design/scene/*.json.
const IDS = [HOME_SCENE, ...REGION_SCENES];
const SPECS = Object.fromEntries(IDS.map((id) => [id, loadScene(id).spec]));

/** 8 cặp: Nhà của ta ↔ trấn, trấn ↔ Trúc Lâm (V-57) + 6 cặp vùng V-59 (đã duyệt). */
const PAIRS: [string, string][] = [
  ['nha-ta', HOME_SCENE],
  [HOME_SCENE, 'rung-truc'],
  ['rung-truc', 'giang-nam'],
  ['rung-truc', 'truong-thanh'],
  ['truong-thanh', 'to-lua'],
  ['truong-thanh', 'tu-cam-thanh'],
  ['giang-nam', 'tu-cam-thanh'],
  ['giang-nam', 'bong-lai'],
];

/** Cổng V-59: cảnh → cảnh đích → mép cảnh đúng hướng nơi đến trên bản đồ (x đông, z nam), tâm vòng, chỗ đứng khi tới. */
const NEW: { from: string; to: string; side: 'dong' | 'tay' | 'bac' | 'nam'; at: [number, number]; arrive: [number, number] }[] = [
  { from: 'rung-truc', to: 'giang-nam', side: 'dong', at: [20.6, 43], arrive: [17, 43] },
  { from: 'rung-truc', to: 'truong-thanh', side: 'bac', at: [-5, -44.2], arrive: [-3.7, -41.2] },
  { from: 'giang-nam', to: 'rung-truc', side: 'tay', at: [-30.2, -2], arrive: [-26.4, -2.3] },
  { from: 'giang-nam', to: 'tu-cam-thanh', side: 'bac', at: [25, -24.4], arrive: [25, -21] },
  { from: 'giang-nam', to: 'bong-lai', side: 'dong', at: [30.6, -14], arrive: [27.4, -14.6] },
  { from: 'truong-thanh', to: 'rung-truc', side: 'nam', at: [0, 49], arrive: [0, 45.4] },
  { from: 'truong-thanh', to: 'to-lua', side: 'tay', at: [-43.2, -3], arrive: [-39.6, -3] },
  { from: 'truong-thanh', to: 'tu-cam-thanh', side: 'dong', at: [43.2, -3], arrive: [39.6, -3] },
  { from: 'to-lua', to: 'truong-thanh', side: 'dong', at: [46.6, 19.5], arrive: [43, 20] },
  { from: 'tu-cam-thanh', to: 'giang-nam', side: 'nam', at: [0, 81], arrive: [0, 77] },
  { from: 'tu-cam-thanh', to: 'truong-thanh', side: 'tay', at: [-63, 54], arrive: [-57.4, 54] },
  { from: 'bong-lai', to: 'giang-nam', side: 'nam', at: [-9, 42.2], arrive: [-5, 41.8] },
];

const portalOf = (from: string, to: string): PortalSpec | undefined => SPECS[from].portals.find((p) => p.scene === to);
const center = (p: PortalSpec): [number, number] => {
  const r = portalRect(p);
  return [(r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2];
};
/** Khoảng cách từ điểm tới mép lối lát (0 = trên lối). */
const toPath = (x: number, z: number, p: PathSpec): number => {
  const [x0, z0] = p.from;
  const [dx, dz] = [p.to[0] - x0, p.to[1] - z0];
  const t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz || 1)));
  return Math.max(0, Math.hypot(x - x0 - t * dx, z - z0 - t * dz) - p.width / 2);
};

describe('cổng đi bộ nối vùng lân cận (R-HANH-4, V-59)', () => {
  it('R-HANH-4: đúng 8 cặp cổng, cặp nào cũng hai chiều; ngoài các cặp đó không có cổng nào', () => {
    const all = IDS.flatMap((id) => SPECS[id].portals.map((p) => [id, p.scene].sort().join(' ↔ ')));
    const pairs = PAIRS.map((p) => [...p].sort().join(' ↔ '));
    expect([...new Set(all)].sort()).toEqual([...pairs].sort());
    for (const [a, b] of PAIRS) {
      expect(portalOf(a, b), `${a} → ${b}`).toBeDefined();
      expect(portalOf(b, a), `${b} → ${a}`).toBeDefined();
    }
    // Nhà của ta chỉ nối với trấn
    expect(SPECS['nha-ta'].portals.map((p) => p.scene)).toEqual([HOME_SCENE]);
  });

  it('R-HANH-4: nhãn vòng = tên nơi đến (một nguồn — placeName / ban-do.json), riêng cổng về Nhà của ta ghi "Về nhà"; mọi cảnh không lỗi cổng', () => {
    for (const id of IDS) {
      for (const p of SPECS[id].portals) expect(p.label, `${id} → ${p.scene}`).toBe(p.scene === 'nha-ta' ? 'Về nhà' : placeName(p.scene));
      expect(checkPortals(SPECS[id]), id).toEqual([]);
    }
  });

  for (const c of NEW) {
    it(`R-HANH-4: ${placeName(c.from)} → vòng "${placeName(c.to)}" ở mép ${c.side} (${c.at.join('; ')}) (cuối lối nếu vùng có lối); tới từ ${placeName(c.to)} đứng (${c.arrive.join('; ')}) quay vào trong`, () => {
      const p = portalOf(c.from, c.to)!;
      const [x, z] = center(p);
      expect(x).toBeCloseTo(c.at[0]);
      expect(z).toBeCloseTo(c.at[1]);
      const out = { dong: x > 15, tay: x < -15, bac: z < -15, nam: z > 15 }[c.side];
      expect(out).toBe(true);
      // cuối một lối lát (vòng chạm / sát mép lối) — vùng chưa có lối (V-66 đang làm lại: chỉ địa hình + cổng + bãi hạc) thì bỏ qua
      const paths = SPECS[c.from].paths;
      if (paths.length) expect(Math.min(...paths.map((q) => toPath(x, z, q)))).toBeLessThanOrEqual(2);
      // tới qua cổng từ nơi kia → đứng trước vòng, nhìn ra xa vòng
      const a = arrivalFor(SPECS[c.from].portals, c.to)!;
      expect(a.at).toEqual(c.arrive);
      expect(Math.sin(a.rotY) * (a.at[0] - x) + Math.cos(a.rotY) * (a.at[1] - z)).toBeGreaterThan(0);
    });
  }
});
