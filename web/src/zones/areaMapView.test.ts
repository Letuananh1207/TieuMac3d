import { describe, expect, it } from 'vitest';
import { buildAreaMap, LABEL_PRIORITY, type AreaMapSource, type MapLabel } from './areaMap';
import {
  BigMapState,
  bigArrow,
  edgeMarks,
  fitLabels,
  fitScale,
  hitsMiniMap,
  inMiniSquare,
  miniArrow,
  miniMapShown,
  miniPoint,
  miniRotation,
  placeLabels,
  squareEdge,
  toMap,
  whereAmI,
} from './areaMapView';

const EAST = Math.PI / 2;
const NORTH = Math.PI;
const near = (a: number, b: number): void => expect(Math.abs(a - b)).toBeLessThan(1e-9);

const SRC: AreaMapSource = {
  site: { name: 'Khởi Nguyên Trấn', han: '起源鎮', areas: [{ name: 'Quảng Trường', from: [-17, -17], to: [17, 17] }] },
  terrain: { enabled: false, center: [0, 0], edge: { radius: 0 } },
  walls: { enabled: false, half: 17, thickness: 0.8, gates: [] },
  wallSegments: [],
  paths: [],
  water: [],
  bridges: [],
  buildings: [{ id: 'tang-thu-cac', x: -34, z: -22, w: 14, d: 10, title: 'Thư viện' }],
  gates: [],
  teleport: { enabled: true, center: [30, -9], ringRadius: 4 },
  portals: [{ scene: 'nha-ta', area: { from: [-24.6, 32.9], to: [-19.5, 39.1] } }],
  gameTables: [],
  player: { start: [21.8, -9] },
};
const MAP = buildAreaMap(SRC);

describe('bản đồ vùng — vị trí của mình (R-BANDO-3)', () => {
  it('R-BANDO-3: đứng (0; −9), camera nhìn về đông → Truyền Tống Đài (30; −9) ở sát mép trên', () => {
    const p = miniPoint({ x: 0, z: -9 }, EAST, 30, -9);
    near(p.x, 0);
    near(p.y, -1);
  });

  it('R-BANDO-3: quay camera nhìn về bắc → bản đồ quay, Truyền Tống Đài sang mép phải; bắc ở trên', () => {
    const p = miniPoint({ x: 0, z: -9 }, NORTH, 30, -9);
    near(p.x, 1);
    near(p.y, 0);
    near(miniRotation(NORTH), 0);
  });

  it('R-BANDO-3: mũi tên chỉ hướng nhân vật quay mặt — cùng hướng camera thì chỉ lên', () => {
    near(miniArrow(EAST, EAST), 0);
    // camera nhìn bắc, nhân vật quay về đông → mũi tên chỉ sang phải (90° theo kim đồng hồ)
    near(miniArrow(EAST, NORTH), Math.PI / 2);
    // bản đồ lớn bắc lên trên: quay về bắc → lên, về đông → phải
    near(bigArrow(NORTH), 0);
    near(bigArrow(EAST), Math.PI / 2);
  });

  it('R-BANDO-3: vòng trận trong 30 m → không có dấu mép; ở (−20; −9) cách 50 m → dấu ở mép phía đông', () => {
    expect(edgeMarks(MAP, { x: 10, z: -9 }, NORTH).filter((m) => m.kind === 'vong-tran')).toEqual([]);
    const mark = edgeMarks(MAP, { x: -20, z: -9 }, NORTH).find((m) => m.kind === 'vong-tran');
    expect(mark?.dist).toBe(50);
    near(mark!.angle, Math.PI / 2); // bắc ở trên → đông ở bên phải
  });

  it('R-BANDO-3: cổng sang cảnh ngoài tầm cũng có dấu mép, mang mã nơi đến', () => {
    const marks = edgeMarks(MAP, { x: 30, z: -9 }, NORTH);
    expect(marks.find((m) => m.kind === 'cong-canh')?.scene).toBe('nha-ta');
  });

  it('R-BANDO-3: bản đồ lớn bắc lên trên, cả cảnh vừa khung', () => {
    const b = MAP.bounds;
    const s = fitScale(b, 390, 600);
    expect(toMap(b, s, b.minX, b.minZ)).toEqual({ x: 0, y: 0 });
    const se = toMap(b, s, b.maxX, b.maxZ);
    expect(se.x).toBeLessThanOrEqual(390 + 1e-9);
    expect(se.y).toBeLessThanOrEqual(600 + 1e-9);
    // điểm bắc hơn (z nhỏ hơn) nằm trên
    expect(toMap(b, s, 0, -10).y).toBeLessThan(toMap(b, s, 0, 10).y);
  });
});

describe('bản đồ vùng — trong nhà / tầng (R-BANDO-4)', () => {
  it('R-BANDO-4: trong Tàng Thư Các tầng 1 → nhà đó, tầng 1; lên tầng 2 → tầng 2; ra sân → không nhà nào', () => {
    expect(whereAmI(MAP, -34, -22, 0.4)).toEqual({ building: 'tang-thu-cac', floor: 1 });
    expect(whereAmI(MAP, -34, -22, 3.6)).toEqual({ building: 'tang-thu-cac', floor: 2 });
    expect(whereAmI(MAP, 0, 0, 0)).toEqual({ building: null, floor: 1 });
  });
});

describe('bản đồ vùng — nhãn chồng nhau (R-BANDO-2)', () => {
  it('R-BANDO-2: nhãn chồng → giữ khu trước nơi đến cổng, nhà, chỗ', () => {
    const at = (kind: MapLabel['kind'], text: string, x: number): MapLabel => ({ kind, text, x, z: 0, floor: 1 });
    const labels = [at('cho', 'Đấu chữ', 0), at('nha', 'Thư viện', 1), at('khu', 'Tàng Thư Các', 2), at('cong', 'Nhà của ta', 50)];
    const kept = fitLabels(
      labels,
      (l) => ({ x: l.x * 10, y: 0 }),
      () => ({ w: 60, h: 16 }),
      (l) => LABEL_PRIORITY[l.kind],
    );
    expect(kept.map((k) => k.label.text)).toEqual(['Tàng Thư Các', 'Nhà của ta']);
  });
});

describe('bản đồ lớn — luật đặt chữ (R-BANDO-2, thiết kế 2026-11-14.20)', () => {
  it('R-BANDO-2: tên khu thử chỗ thứ hai khi chỗ đầu đè biểu tượng; chữ cấp sau đè → bỏ chữ', () => {
    const icon = { x: 100, y: 20, w: 24, h: 24 };
    const placed = placeLabels(
      [
        { item: 'cho', priority: 3, w: 60, h: 13, spots: [{ x: 100, y: 52 }] },
        { item: 'khu', priority: 0, w: 80, h: 14, spots: [{ x: 100, y: 22 }, { x: 100, y: 52 }, { x: 100, y: 90 }] },
      ],
      [icon],
    );
    expect(placed).toEqual([{ item: 'khu', x: 100, y: 52 }]);
  });

  it('R-BANDO-3: biểu tượng ra ngoài khung vuông (nửa cạnh 28 m, khung cắt) → thành dấu mép', () => {
    expect(edgeMarks(MAP, { x: 1.5, z: -9 }, NORTH).filter((m) => m.kind === 'vong-tran')).toHaveLength(1);
    expect(edgeMarks(MAP, { x: 2.5, z: -9 }, NORTH).filter((m) => m.kind === 'vong-tran')).toEqual([]);
  });

  it('R-BANDO-3: tầm 30 m tính theo nửa cạnh — chéo góc 35 m vẫn trong khung, không có dấu mép', () => {
    // vòng trận (30; −9): đứng (5; 16) → lệch 25 m đông, 25 m bắc (cách ~35 m) — trong hình vuông 28 m
    const me = { x: 5, z: 16 };
    expect(edgeMarks(MAP, me, NORTH).filter((m) => m.kind === 'vong-tran')).toEqual([]);
    expect(inMiniSquare(miniPoint(me, NORTH, 30, -9))).toBe(true);
    // xoay camera 45° → cùng điểm nằm trên đường giữa, 35 m > 28 → ra khỏi khung → dấu mép
    expect(inMiniSquare(miniPoint(me, NORTH - Math.PI / 4, 30, -9))).toBe(false);
  });

  it('R-BANDO-3: dấu mép đặt trên cạnh hình vuông — đông → giữa cạnh phải', () => {
    const mark = edgeMarks(MAP, { x: -20, z: -9 }, NORTH).find((m) => m.kind === 'vong-tran');
    near(mark!.edge.x, 1);
    near(mark!.edge.y, 0);
  });

  it('R-BANDO-3: squareEdge — hướng chiếu ra cạnh vuông (lên, phải, góc chéo, dốc 30°)', () => {
    expect(squareEdge(0)).toEqual({ x: 0, y: -1 });
    expect(squareEdge(Math.PI / 2)).toEqual({ x: 1, y: 0 });
    expect(squareEdge(Math.PI)).toEqual({ x: 0, y: 1 });
    const d = squareEdge(Math.PI / 4);
    near(d.x, 1);
    near(d.y, -1);
    const t = squareEdge(Math.PI / 6); // 30° lệch phải từ trên → cạnh trên, x = tan 30°
    near(t.y, -1);
    near(t.x, Math.tan(Math.PI / 6));
    for (let a = 0; a < Math.PI * 2; a += 0.37) {
      const p = squareEdge(a);
      near(Math.max(Math.abs(p.x), Math.abs(p.y)), 1);
    }
  });
});

describe('bản đồ nhỏ — khi nào hiện (R-BANDO-1)', () => {
  it('R-BANDO-1: đi lại → hiện; thoại, bàn chơi, đang ngồi, gõ chat, trang trí, màn phủ, màn tải, bản đồ → ẩn', () => {
    expect(miniMapShown({})).toBe(true);
    for (const k of ['loading', 'travelMap', 'bigMap', 'covered', 'talking', 'gameTable', 'sitting', 'chatTyping', 'decorating'] as const) {
      expect(miniMapShown({ [k]: true })).toBe(false);
    }
  });

  it('R-BANDO-1: ngồi bàn trà → ẩn; đứng dậy → hiện lại', () => {
    expect(miniMapShown({ sitting: true })).toBe(false);
    expect(miniMapShown({ sitting: false })).toBe(true);
  });
});

describe('chạm bản đồ nhỏ không thành joystick (R-DIEU-1)', () => {
  it('R-DIEU-1: chạm x = 60, y = 100 trúng bản đồ nhỏ vuông (x 20–168, y 14–162) → mở bản đồ; ngoài khung → không', () => {
    const square = { cx: 94, cy: 88, half: 74 }; // dọc 148 px, trái 20, trên 14
    expect(hitsMiniMap(60, 100, square)).toBe(true);
    expect(hitsMiniMap(60, 400, square)).toBe(false);
    // góc khung vuông vẫn trúng (khung tròn cũ thì trượt), ra ngoài 1 px thì không
    expect(hitsMiniMap(166, 160, square)).toBe(true);
    expect(hitsMiniMap(169, 88, square)).toBe(false);
  });
});

describe('bản đồ lớn — mở / đóng (R-BANDO-5)', () => {
  it('R-BANDO-5: chạm bản đồ nhỏ → mở, nhân vật đứng yên; nút quay lại → đóng, báo đã xử lý', () => {
    const m = new BigMapState();
    expect(m.toggle({})).toBe(true);
    expect(m.freezes).toBe(true);
    expect(m.back()).toBe(true);
    expect(m.open).toBe(false);
    // đóng rồi: nút quay lại không phải của bản đồ → để Flutter làm như thường
    expect(m.back()).toBe(false);
  });

  it('R-BANDO-5: phím M khi đang mở → đóng; bản đồ nhỏ đang ẩn (đang thoại) → không mở được', () => {
    const m = new BigMapState();
    m.toggle({});
    expect(m.toggle({})).toBe(false);
    expect(m.toggle({ talking: true })).toBe(false);
  });

  it('R-BANDO-5: bản đồ truyền tống / màn tải chen vào → bản đồ lớn đóng', () => {
    const m = new BigMapState();
    m.toggle({});
    m.update({ travelMap: true });
    expect(m.open).toBe(false);
    m.toggle({});
    m.update({ loading: true });
    expect(m.open).toBe(false);
  });
});
