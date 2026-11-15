import { describe, expect, it } from 'vitest';
import { HOME_SCENE, loadScene, REGION_SCENES } from './scene/loadSpec';
import { legendKinds } from './ui/areaMapPanel';
import { buildAreaMap } from './zones/areaMap';
import { dailyBoardSpot } from './zones/dailyBoard';
import { shopDoor } from './zones/shop';

// Bản đồ vùng dựng từ đặc tả thật của mọi cảnh design/scene/*.json (R-BANDO-2): cảnh nào cũng có, không phải vẽ tay.
const IDS = [HOME_SCENE, ...REGION_SCENES];
const NAMES = Object.fromEntries(IDS.map((id) => [id, loadScene(id).spec.site.name]));
const mapOf = (id: string): ReturnType<typeof buildAreaMap> => {
  const spec = loadScene(id).spec;
  return buildAreaMap(spec, { sceneNames: NAMES, shopDoor: shopDoor(spec.buildings), board: dailyBoardSpot(spec.props) });
};

describe('bản đồ vùng — đủ mọi cảnh (R-BANDO-2)', () => {
  it('R-BANDO-2: có đủ 8 cảnh (trấn, Nhà của ta, 6 vùng)', () => {
    expect(IDS.length).toBeGreaterThanOrEqual(8);
    expect(IDS).toContain('nha-ta');
  });

  for (const id of IDS) {
    it(`R-BANDO-2: ${id} — khung hữu hạn, vòng trận chỉ ở trấn (V-47 nhà, V-65 vùng), mọi khu có nhãn, mọi nhà có chân nhà`, () => {
      const spec = loadScene(id).spec;
      const m = mapOf(id);
      const b = m.bounds;
      for (const v of [b.minX, b.maxX, b.minZ, b.maxZ]) expect(Number.isFinite(v)).toBe(true);
      expect(b.maxX - b.minX).toBeGreaterThan(10);
      expect(b.maxZ - b.minZ).toBeGreaterThan(10);
      const ring = id === HOME_SCENE; // V-47: nhà bỏ vòng trận; V-65: vùng bỏ vòng trận (R-HANH-2)
      expect(m.icons.some((i) => i.kind === 'vong-tran')).toBe(ring);
      expect(spec.teleport.enabled).toBe(ring);
      expect(legendKinds(m).includes('vong-tran')).toBe(ring); // chú giải bỏ "Vòng trận" khi không có
      expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(spec.site.areas.map((a) => a.name));
      expect(m.shapes.filter((s) => s.kind === 'nha')).toHaveLength(spec.buildings.length);
      // nhãn + biểu tượng đều nằm trong khung
      for (const p of [...m.icons, ...m.labels]) {
        expect(p.x).toBeGreaterThanOrEqual(b.minX);
        expect(p.x).toBeLessThanOrEqual(b.maxX);
        expect(p.z).toBeGreaterThanOrEqual(b.minZ);
        expect(p.z).toBeLessThanOrEqual(b.maxZ);
      }
    });
  }

  it('R-BANDO-2: Khởi Nguyên Trấn — 11 khu, vòng trận (0; −44,5) đầu Thiên Bậc, vòng "Về nhà" ngoài cổng xuống núi (0; 54) ghi "Nhà của ta", vòng "Trúc Lâm" cuối trục đông – tây (41,2; 4) ghi "Trúc Lâm", bàn cờ + Đấu chữ, Tạp hoá, bảng nhiệm vụ', () => {
    const m = mapOf(HOME_SCENE);
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual([
      'Sân Cổ Thụ',
      'Cổng Trấn',
      'Quảng Trường',
      'Kỳ Văn Uyển',
      'Thiên Bậc',
      'Truyền Tống Đài',
      'Hậu Sơn',
      'Tàng Thư Các',
      'Mặc Trì',
      'Vườn Bia',
      'Đồi Chè',
    ]);
    expect(m.icons.find((i) => i.kind === 'vong-tran')).toMatchObject({ x: 0, z: -44.5 });
    const gates = m.icons.filter((i) => i.kind === 'cong-canh');
    const gate = gates.find((g) => g.scene === 'nha-ta');
    expect(Math.round(gate!.x)).toBe(0);
    expect(Math.round(gate!.z)).toBe(54);
    // V-57: vòng "Trúc Lâm" cuối trục đông – tây (41,2; 4), khe hàng trúc mép đông
    expect(gates.find((g) => g.scene === 'rung-truc')).toMatchObject({ x: 41.2, z: 4 });
    expect(m.labels.filter((l) => l.kind === 'cong').map((l) => l.text).sort()).toEqual(['Nhà của ta', 'Trúc Lâm']);
    expect(m.icons.find((i) => i.kind === 'ban-co')).toMatchObject({ x: -30.5, z: 7.5 });
    expect(m.icons.find((i) => i.kind === 'ban-dau-chu')).toMatchObject({ x: -37.5, z: 7.5 });
    expect(m.icons.some((i) => i.kind === 'tap-hoa')).toBe(true);
    expect(m.icons.some((i) => i.kind === 'bang-nhiem-vu')).toBe(true);
  });

  it('R-BANDO-2: đất = các bục cao từ −1 m (trấn; Nhà của ta — đảo: sân + Bến mây, mép đảo tròn)', () => {
    const tran = loadScene(HOME_SCENE).spec;
    const land = mapOf(HOME_SCENE).shapes.filter((s) => s.kind === 'dat');
    expect(land).toHaveLength(tran.terrain.plateaus.filter((p) => p.y >= -1).length);
    const nha = mapOf('nha-ta').shapes;
    expect(nha.filter((s) => s.kind === 'dat')).toEqual([
      { kind: 'dat', x: -3, z: -2.5, w: 40, d: 31 }, // V-68: nới về tây cho nhà chính sát mép trái
      { kind: 'dat', x: 0, z: 18, w: 6, d: 10 },
      { kind: 'dat', x: 18.25, z: 0, w: 9.5, d: 12 }, // bục Vườn rau (V-52)
    ]);
    // V-48: nhà là đảo nhỏ trên biển mây — bản đồ vẽ mép đảo (như Bồng Lai)
    expect(nha.find((s) => s.kind === 'mep')).toEqual({ kind: 'mep', x: 0, z: -2, r: 27 });
    for (const id of IDS) expect(mapOf(id).shapes.filter((s) => s.kind === 'khu')).toHaveLength(loadScene(id).spec.site.areas.length);
  });

  it('R-BANDO-2: Nhà của ta — 6 khu (có Vườn rau — V-52), vòng "Khởi Nguyên Trấn" (0; 21) cuối Bến mây, cửa "Vào nhà" ở nhà chính (−15; −5,1) (V-68), không có cổng đứng riêng (V-51), không có vòng trận, không có dấu ô trang trí', () => {
    const m = mapOf('nha-ta');
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Chính phòng', 'Sân trước', 'Bến mây', 'Đồi sau', 'Vườn rau', 'Vườn']);
    expect(m.icons.find((i) => i.scene === HOME_SCENE)).toMatchObject({ kind: 'cong-canh', x: 0, z: 21 });
    expect(m.icons.find((i) => i.scene === 'nha-ta-trong')).toMatchObject({ kind: 'cong-canh', x: -15, z: -5.1 });
    // cửa nhà chính sang gian trong (cùng nơi "Nhà của ta") ghi nhãn cửa, không ghi tên nơi
    expect(m.labels.filter((l) => l.kind === 'cong').map((l) => l.text).sort()).toEqual(['Khởi Nguyên Trấn', 'Vào nhà']);
    expect(m.icons.map((i) => i.kind)).toEqual(['cong-canh', 'cong-canh']);
  });

  it('R-BANDO-2: Trong nhà (gian trong Nhà của ta — V-68) — khu "Trong nhà", chân gian phòng, cửa "Ra sân", không vòng trận', () => {
    const m = mapOf('nha-ta-trong');
    expect(m.name).toBe('Nhà của ta');
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Trong nhà']);
    expect(m.shapes.filter((s) => s.kind === 'nha')).toHaveLength(1);
    expect(m.icons).toEqual([expect.objectContaining({ kind: 'cong-canh', x: 0, z: 5.4, scene: 'nha-ta' })]);
    expect(m.labels.filter((l) => l.kind === 'cong').map((l) => l.text)).toEqual(['Ra sân']);
  });

  it('R-BANDO-2: Trúc Lâm — vòng "Khởi Nguyên Trấn" (−47,5; 4) đầu lối tây, vòng "Yên Vũ Lâu" (47,5; 4) cuối quan đạo đông, vòng "Nhạn Môn Quan" (0; −47) trên đèo bắc (V-66 B2)', () => {
    const m = mapOf('rung-truc');
    const gates = m.icons.filter((i) => i.kind === 'cong-canh');
    expect(gates.find((g) => g.scene === HOME_SCENE)).toMatchObject({ x: -47.5, z: 4 });
    expect(gates.find((g) => g.scene === 'giang-nam')).toMatchObject({ x: 47.5, z: 4 });
    expect(gates.find((g) => g.scene === 'truong-thanh')).toMatchObject({ x: 0, z: -47 });
    expect(m.labels.filter((l) => l.kind === 'cong').map((l) => l.text).sort()).toEqual(['Khởi Nguyên Trấn', 'Nhạn Môn Quan', 'Yên Vũ Lâu']);
  });

  // V-59: mỗi cảnh vẽ đủ dấu cổng + ghi tên nơi đến (không bị bỏ vì chồng nhãn khu)
  const GATE_NAMES: Record<string, string[]> = {
    'giang-nam': ['Bồng Lai Đảo', 'Trúc Lâm', 'Tử Cấm Thành'],
    'truong-thanh': ['Trúc Lâm', 'Tử Cấm Thành', 'Đôn Hoàng Lộ'],
    'to-lua': ['Nhạn Môn Quan'],
    'tu-cam-thanh': ['Nhạn Môn Quan', 'Yên Vũ Lâu'],
    'bong-lai': ['Yên Vũ Lâu'],
  };
  for (const [id, names] of Object.entries(GATE_NAMES)) {
    it(`R-BANDO-2: ${NAMES[id]} — dấu cổng đi bộ ghi ${names.join(', ')} (V-59)`, () => {
      const m = mapOf(id);
      expect(m.icons.filter((i) => i.kind === 'cong-canh')).toHaveLength(names.length);
      expect(m.labels.filter((l) => l.kind === 'cong').map((l) => l.text).sort()).toEqual([...names].sort());
    });
  }
});
