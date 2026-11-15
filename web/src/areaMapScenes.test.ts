import { describe, expect, it } from 'vitest';
import { HOME_SCENE, loadScene, REGION_SCENES } from './scene/loadSpec';
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
    it(`R-BANDO-2: ${id} — khung hữu hạn, vòng trận đúng như cảnh (Nhà của ta không có), mọi khu có nhãn, mọi nhà có chân nhà`, () => {
      const spec = loadScene(id).spec;
      const m = mapOf(id);
      const b = m.bounds;
      for (const v of [b.minX, b.maxX, b.minZ, b.maxZ]) expect(Number.isFinite(v)).toBe(true);
      expect(b.maxX - b.minX).toBeGreaterThan(10);
      expect(b.maxZ - b.minZ).toBeGreaterThan(10);
      expect(m.icons.some((i) => i.kind === 'vong-tran')).toBe(id !== 'nha-ta');
      expect(spec.teleport.enabled).toBe(id !== 'nha-ta'); // V-47: nhà bỏ vòng trận (R-HANH-2, R-NHA-1)
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

  it('R-BANDO-2: Khởi Nguyên Trấn — 11 khu, vòng trận (0; −44,5) đầu Thiên Bậc, vòng "Về nhà" ngoài cổng xuống núi (0; 54) ghi "Nhà của ta", bàn cờ + Đấu chữ, Tạp hoá, bảng nhiệm vụ', () => {
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
    const gate = m.icons.find((i) => i.kind === 'cong-canh');
    expect(Math.round(gate!.x)).toBe(0);
    expect(Math.round(gate!.z)).toBe(54);
    expect(m.labels.find((l) => l.kind === 'cong')?.text).toBe('Nhà của ta');
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
      { kind: 'dat', x: 0, z: -2.5, w: 34, d: 31 },
      { kind: 'dat', x: 0, z: 18, w: 6, d: 10 },
    ]);
    // V-48: nhà là đảo nhỏ trên biển mây — bản đồ vẽ mép đảo (như Bồng Lai)
    expect(nha.find((s) => s.kind === 'mep')).toEqual({ kind: 'mep', x: 0, z: -2, r: 27 });
    for (const id of IDS) expect(mapOf(id).shapes.filter((s) => s.kind === 'khu')).toHaveLength(loadScene(id).spec.site.areas.length);
  });

  it('R-BANDO-2: Nhà của ta — 5 khu, vòng "Khởi Nguyên Trấn" (0; 21) cuối Bến mây, không có cổng đứng riêng (V-51), không có vòng trận, không có dấu ô trang trí', () => {
    const m = mapOf('nha-ta');
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Chính phòng', 'Sân trong', 'Bến mây', 'Đồi sau', 'Vườn']);
    expect(m.icons.find((i) => i.kind === 'cong-canh')).toMatchObject({ x: 0, z: 21, scene: HOME_SCENE });
    expect(m.labels.filter((l) => l.kind === 'cong').map((l) => l.text)).toEqual(['Khởi Nguyên Trấn']);
    expect(m.icons.map((i) => i.kind)).toEqual(['cong-canh']);
  });
});
