import { describe, expect, it } from 'vitest';
import { buildAreaMap, footprint, mapBounds, type AreaMapSource } from './areaMap';

/** Cảnh nhỏ kiểu Khởi Nguyên Trấn (số lấy từ scene.json lúc viết test: vòng trận, cổng đi bộ — ngõ cũ V-16, bàn chơi). */
function town(over: Partial<AreaMapSource> = {}): AreaMapSource {
  return {
    site: {
      name: 'Khởi Nguyên Trấn',
      han: '起源鎮',
      areas: [
        { name: 'Truyền Tống Đài', han: '傳送台', from: [17, -10], to: [41, 10] },
        { name: 'Quảng Trường', from: [-17, -17], to: [17, 17] },
      ],
    },
    terrain: { enabled: true, center: [0, -20], edge: { radius: 120 } },
    walls: { enabled: true, half: 17, thickness: 0.8, gates: [{ side: 'dong', at: 0, width: 6 }] },
    wallSegments: [{ from: [-30, 20], to: [-30, 40], gate: { at: 30, width: 4 } }],
    paths: [{ from: [0, 0], to: [30, 0], width: 3 }],
    water: [{ x: 5, z: 5, r: 2 }],
    bridges: [],
    buildings: [
      { id: 'tang-thu-cac', x: -34, z: -22, w: 14, d: 10, rotY: 90, title: 'Thư viện', kind: 'lau-sach' },
      { id: 'tap-hoa', x: 10, z: 25, w: 6, d: 5, title: 'Tạp hoá', kind: 'cua-hang' },
    ],
    gates: [],
    teleport: { enabled: true, center: [30, 0], ringRadius: 4 },
    portals: [{ scene: 'nha-ta', area: { from: [-24.6, 32.9], to: [-19.5, 39.1] } }],
    gameTables: [
      { id: 'ban-co', kind: 'co', x: -30.5, z: 7.5 },
      { id: 'ban-dau-chu', kind: 'dau-chu', x: -37.5, z: 7.5, sign: { name: 'Đấu chữ' } },
    ],
    player: { start: [21.8, 0] },
    ...over,
  };
}

describe('bản đồ vùng — nội dung (R-BANDO-2)', () => {
  it('R-BANDO-2: có tên mọi khu, vòng trận, cổng sang cảnh ghi nơi đến, hai bàn chơi', () => {
    const m = buildAreaMap(town(), { sceneNames: { 'nha-ta': 'Nhà của ta' } });
    expect(m.labels.filter((l) => l.kind === 'khu').map((l) => l.text)).toEqual(['Truyền Tống Đài', 'Quảng Trường']);
    expect(m.icons.find((i) => i.kind === 'vong-tran')).toMatchObject({ x: 30, z: 0 });
    const gate = m.icons.find((i) => i.kind === 'cong-canh');
    expect(gate).toMatchObject({ scene: 'nha-ta' });
    expect(gate!.x).toBeCloseTo(-22.05);
    expect(gate!.z).toBeCloseTo(36);
    expect(m.labels.find((l) => l.kind === 'cong')?.text).toBe('Nhà của ta');
    expect(m.icons.filter((i) => i.kind === 'ban-co' || i.kind === 'ban-dau-chu').map((i) => [i.x, i.z])).toEqual([
      [-30.5, 7.5],
      [-37.5, 7.5],
    ]);
    expect(m.labels.filter((l) => l.kind === 'cho').map((l) => l.text)).toEqual(['Ngũ Tử Kỳ', 'Đấu chữ']);
  });

  it('R-BANDO-2: chân nhà đúng hướng — nhà quay 90° đổi rộng ↔ sâu', () => {
    expect(footprint({ x: -34, z: -22, w: 14, d: 10, rotY: 90 })).toEqual({ x: -34, z: -22, w: 10, d: 14 });
    const m = buildAreaMap(town());
    expect(m.shapes.find((s) => s.kind === 'nha' && s.id === 'tang-thu-cac')).toMatchObject({ w: 10, d: 14 });
    expect(m.labels.filter((l) => l.kind === 'nha').map((l) => l.text)).toEqual(['Thư viện', 'Tạp hoá']);
  });

  it('R-BANDO-2: tường chừa khe cổng — tường bao đông và đoạn tường thêm', () => {
    const walls = buildAreaMap(town()).shapes.filter((s) => s.kind === 'tuong');
    // 4 cạnh, cạnh đông bị khe 6 m cắt làm hai → 5; đoạn thêm bị khe 4 m cắt làm hai → 2
    expect(walls).toHaveLength(7);
    const east = walls.filter((s) => s.kind === 'tuong' && s.from[0] === 17 && s.to[0] === 17);
    expect(east.map((s) => (s.kind === 'tuong' ? [s.from[1], s.to[1]] : []))).toEqual([
      [-17, -3],
      [3, 17],
    ]);
  });

  it('R-BANDO-2: không vẽ NPC, ô trang trí — nguồn không có, bản đồ không có biểu tượng nào ngoài danh sách', () => {
    const m = buildAreaMap(town());
    const kinds = new Set(m.icons.map((i) => i.kind));
    expect([...kinds].sort()).toEqual(['ban-co', 'ban-dau-chu', 'cong-canh', 'vong-tran']);
  });

  it('R-BANDO-2: Tạp hoá, bảng nhiệm vụ, khu tự học tầng 2, chỗ ngồi ôn gom một dấu mỗi nhà / tầng', () => {
    const m = buildAreaMap(town(), {
      shopDoor: { x: 10, z: 27.5 },
      board: { x: 5.5, z: 15.2 },
      studySign: { x: -30, z: -25, floor: 2 },
      seats: [
        // 3 án thư tầng 1 Tàng Thư Các → 1 dấu
        { x: -36, z: -20 },
        { x: -32, z: -20 },
        { x: -34, z: -24 },
        // bồ đoàn tầng 2 → đã có dấu khu tự học, không thêm dấu chỗ ngồi
        { x: -36, z: -22, floor: 2, study: true },
        { x: -32, z: -22, floor: 2, study: true },
        // hai bàn trà ngoài trời gần nhau → 1 dấu; một chỗ xa → dấu riêng
        { x: 0, z: 10 },
        { x: 3, z: 10 },
        { x: 0, z: -12 },
      ],
    });
    expect(m.icons.find((i) => i.kind === 'tap-hoa')).toMatchObject({ x: 10, z: 27.5 });
    expect(m.icons.find((i) => i.kind === 'bang-nhiem-vu')).toMatchObject({ x: 5.5, z: 15.2 });
    expect(m.icons.find((i) => i.kind === 'tu-hoc')).toMatchObject({ floor: 2, building: 'tang-thu-cac' });
    expect(m.labels.find((l) => l.text === 'Khu tự học')).toMatchObject({ floor: 2 });
    expect(JSON.stringify(m)).not.toMatch(/\p{Script=Han}/u); // nhãn bản đồ chỉ tiếng Việt (R-HUD-4)
    const seats = m.icons.filter((i) => i.kind === 'cho-ngoi');
    expect(seats).toHaveLength(3);
    expect(seats[0]).toMatchObject({ building: 'tang-thu-cac', floor: 1, x: -34, z: -22 });
    expect(seats[1]).toMatchObject({ x: 1.5, z: 10 });
    expect(seats[1]!.building).toBeUndefined();
  });

  it('R-BANDO-2: không có biển khu tự học nhưng có bồ đoàn → dấu ở giữa các bồ đoàn', () => {
    const m = buildAreaMap(town(), { seats: [{ x: -36, z: -22, floor: 2, study: true }, { x: -32, z: -22, floor: 2, study: true }] });
    expect(m.icons.find((i) => i.kind === 'tu-hoc')).toMatchObject({ x: -34, z: -22, floor: 2 });
  });

  it('R-BANDO-2: không có tên nơi đến → nhãn cổng ghi mã cảnh (không mất cổng)', () => {
    expect(buildAreaMap(town()).labels.find((l) => l.kind === 'cong')?.text).toBe('nha-ta');
  });

  it('R-BANDO-2: khung gồm mọi khu, nhà, tường, vòng trận, cổng — nới 4 m', () => {
    expect(mapBounds(town())).toEqual({ minX: -43, maxX: 45, minZ: -33, maxZ: 43.1 });
  });

  it('R-BANDO-2: cảnh vùng không tường bao, không địa hình → không có nét tường bao, không mép đất', () => {
    const m = buildAreaMap(
      town({ walls: { enabled: false, half: 17, thickness: 0.8, gates: [] }, wallSegments: [], terrain: { enabled: false, center: [0, 0], edge: { radius: 0 } } }),
    );
    expect(m.shapes.some((s) => s.kind === 'tuong' || s.kind === 'mep')).toBe(false);
  });
});
