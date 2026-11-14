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
    it(`R-BANDO-2: ${id} — khung hữu hạn, có vòng trận, mọi khu có nhãn, mọi nhà có chân nhà`, () => {
      const spec = loadScene(id).spec;
      const m = mapOf(id);
      const b = m.bounds;
      for (const v of [b.minX, b.maxX, b.minZ, b.maxZ]) expect(Number.isFinite(v)).toBe(true);
      expect(b.maxX - b.minX).toBeGreaterThan(10);
      expect(b.maxZ - b.minZ).toBeGreaterThan(10);
      expect(m.icons.some((i) => i.kind === 'vong-tran')).toBe(true);
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

  it('R-BANDO-2: Khởi Nguyên Trấn — 9 khu, vòng trận (30; −9), lối xuống núi (0; 45) ghi "Nhà của ta", bàn cờ + Đấu chữ, Tạp hoá, bảng nhiệm vụ', () => {
    const m = mapOf(HOME_SCENE);
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual([
      'Truyền Tống Đài',
      'Cổng Trấn',
      'Quảng Trường',
      'Kỳ Văn Uyển',
      'Thiên Bậc',
      'Thượng Trấn',
      'Hậu Sơn',
      'Tàng Thư Các',
      'Mặc Trì',
    ]);
    expect(m.icons.find((i) => i.kind === 'vong-tran')).toMatchObject({ x: 30, z: -9 });
    const gate = m.icons.find((i) => i.kind === 'cong-canh');
    expect(Math.round(gate!.x)).toBe(0);
    expect(Math.round(gate!.z)).toBe(45);
    expect(m.labels.find((l) => l.kind === 'cong')?.text).toBe('Nhà của ta');
    expect(m.icons.find((i) => i.kind === 'ban-co')).toMatchObject({ x: -34, z: 4 });
    expect(m.icons.find((i) => i.kind === 'ban-dau-chu')).toMatchObject({ x: -34, z: 11 });
    expect(m.icons.some((i) => i.kind === 'tap-hoa')).toBe(true);
    expect(m.icons.some((i) => i.kind === 'bang-nhiem-vu')).toBe(true);
  });

  it('R-BANDO-2: Nhà của ta — 3 khu, cổng (0; 14) ghi "Khởi Nguyên Trấn", không có dấu ô trang trí', () => {
    const m = mapOf('nha-ta');
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Chính phòng', 'Vườn', 'Sân trước']);
    expect(m.icons.find((i) => i.kind === 'cong-canh')).toMatchObject({ x: 0, z: 14.25, scene: HOME_SCENE });
    expect(m.labels.find((l) => l.kind === 'cong')?.text).toBe('Khởi Nguyên Trấn');
    expect(m.icons.map((i) => i.kind).sort()).toEqual(['cong-canh', 'vong-tran']);
  });
});
