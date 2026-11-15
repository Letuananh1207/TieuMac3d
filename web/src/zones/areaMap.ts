/**
 * Bản đồ vùng — dữ liệu (R-BANDO-2, R-BANDO-4; kế hoạch `docs/tasks/2026-11-14-ban-do-vung.md`). Từ đặc tả cảnh dựng
 * danh sách hình (mép đất, nước, lối, cầu, tường có khe cổng, chân nhà), biểu tượng (vòng trận, cổng sang cảnh, bàn
 * chơi, Tạp hoá, khu tự học, chỗ ngồi ôn, bảng nhiệm vụ) và nhãn (khu, nơi đến của cổng, nhà, chỗ) — mọi toạ độ là mét
 * của cảnh (bắc = −z, đông = +x). Nét vẽ + chữ hiển thị do HUD (`ui/`, chờ thiết kế) quyết. Thuần — không three, không DOM.
 * Không vẽ NPC, người chơi khác, cây lẻ, ô trang trí.
 */

type XZ = [number, number];

/** Tập con của `SceneSpec` (`scene/spec.ts`) mà bản đồ cần — cùng dạng, zones không import scene. */
export interface AreaMapSource {
  site: { name: string; han: string; areas: readonly { name: string; han?: string; from: XZ; to: XZ }[] };
  terrain: { enabled: boolean; center: XZ; edge: { radius: number }; plateaus?: readonly { from: XZ; to: XZ; y: number }[] };
  walls: {
    enabled: boolean;
    half: number;
    thickness: number;
    gates: readonly { side: 'bac' | 'nam' | 'dong' | 'tay'; at: number; width: number }[];
  };
  wallSegments: readonly { from: XZ; to: XZ; gate?: { at: number; width: number } }[];
  paths: readonly { from: XZ; to: XZ; width: number; dirt?: boolean }[];
  water: readonly { x: number; z: number; r?: number; w?: number; d?: number; rotY?: number }[];
  bridges: readonly { x: number; z: number; rotY?: number; length: number; width: number }[];
  buildings: readonly { id: string; x: number; z: number; w: number; d: number; rotY?: number; title: string; kind?: string }[];
  gates: readonly { id: string; x: number; z: number; rotY?: number; width: number; title: string }[];
  teleport: { enabled: boolean; center: XZ; ringRadius: number };
  portals: readonly { scene: string; area: { from: XZ; to: XZ }; label?: string }[];
  gameTables: readonly { id: string; kind: string; x: number; z: number; sign?: { name: string } }[];
  player: { start: XZ };
}

/** Chỗ do `main.ts` đưa vào (cảnh dựng ra, không có sẵn trong đặc tả). `floor` 2 = tầng trên. */
export interface AreaMapSpots {
  /** chỗ ngồi trong cảnh (án thư, bàn trà, bồ đoàn) — không gồm ghế bàn chơi */
  seats?: readonly { x: number; z: number; floor?: number; study?: boolean }[];
  /** chân biển "Khu tự học" */
  studySign?: { x: number; z: number; floor?: number } | null;
  /** cửa tiệm Tạp hoá (`zones/shop.ts` `shopDoor`) */
  shopDoor?: { x: number; z: number } | null;
  /** bảng nhiệm vụ (`zones/dailyBoard.ts` `dailyBoardSpot`) */
  board?: { x: number; z: number } | null;
  /** mã cảnh → tên nơi (tên nơi đến của cổng sang cảnh) */
  sceneNames?: Readonly<Record<string, string>>;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Hình chữ nhật xoay: tâm, rộng theo x / sâu theo z **sau khi xoay** (nhà chỉ quay bội 90). */
export interface MapRect {
  x: number;
  z: number;
  w: number;
  d: number;
}

export type MapShape =
  | { kind: 'mep'; x: number; z: number; r: number }
  /** đất (giấy) — mặt bằng bục; ngoài đất là biển mây (thiết kế 2026-11-14.20) */
  | ({ kind: 'dat' } & MapRect)
  /** khu `site.areas` (bản đồ lớn tô mảng nhạt, `index` để tô xen kẽ) */
  | ({ kind: 'khu'; index: number } & MapRect)
  | { kind: 'nuoc'; x: number; z: number; r: number }
  | ({ kind: 'nuoc-vuong'; rot: number } & MapRect)
  | { kind: 'loi'; from: XZ; to: XZ; width: number }
  | ({ kind: 'cau'; rot: number } & MapRect)
  | { kind: 'tuong'; from: XZ; to: XZ; width: number }
  | ({ kind: 'nha'; id: string } & MapRect);

export const ICON_KINDS = ['vong-tran', 'cong-canh', 'son-mon', 'ban-co', 'ban-dau-chu', 'tap-hoa', 'tu-hoc', 'cho-ngoi', 'bang-nhiem-vu'] as const;
export type IconKind = (typeof ICON_KINDS)[number];

export interface MapIcon {
  kind: IconKind;
  x: number;
  z: number;
  /** 2 = ở tầng trên */
  floor: number;
  /** nhà chứa biểu tượng (nếu có) */
  building?: string;
  /** cổng sang cảnh: mã cảnh đến */
  scene?: string;
}

/** Ưu tiên nhãn khi chồng nhau (nhỏ = giữ trước): khu > nơi đến cổng > nhà > chỗ (R-BANDO-2). */
export const LABEL_PRIORITY = { khu: 0, cong: 1, nha: 2, cho: 3 } as const;
export type LabelKind = keyof typeof LABEL_PRIORITY;

export interface MapLabel {
  kind: LabelKind;
  text: string;
  han?: string;
  x: number;
  z: number;
  /** 2 = chỗ ở tầng trên — HUD ghi kèm "· tầng 2" (R-BANDO-4) */
  floor: number;
  /** nhãn khu: vị trí khu trong `site.areas` (= `index` của hình `khu`) */
  area?: number;
}

export interface AreaMap {
  name: string;
  bounds: Bounds;
  shapes: MapShape[];
  icons: MapIcon[];
  labels: MapLabel[];
}

/** Lề quanh khung bản đồ (m). */
export const MAP_PAD = 4;
/** Chỗ ngồi ngoài nhà cách nhau dưới khoảng này (m) → gom một dấu. */
export const SEAT_CLUSTER = 6;

const GAME_NAMES: Record<string, string> = { co: 'Ngũ Tử Kỳ', 'dau-chu': 'Đấu chữ' };
const GAME_ICON: Record<string, IconKind> = { co: 'ban-co', 'dau-chu': 'ban-dau-chu' };

const rad = (deg = 0): number => (deg * Math.PI) / 180;
const round = (v: number): number => Math.round(v * 1000) / 1000;

/** Chân nhà sau khi xoay (bội 90: 90 / 270 đổi rộng ↔ sâu). */
export function footprint(b: { x: number; z: number; w: number; d: number; rotY?: number }): MapRect {
  const q = ((Math.round((b.rotY ?? 0) / 90) % 4) + 4) % 4;
  return q % 2 ? { x: b.x, z: b.z, w: b.d, d: b.w } : { x: b.x, z: b.z, w: b.w, d: b.d };
}

export function inRect(r: MapRect, x: number, z: number): boolean {
  return Math.abs(x - r.x) <= r.w / 2 && Math.abs(z - r.z) <= r.d / 2;
}

/** Đoạn [a, b] trừ các khe — như `scene/walls.ts` `cutRun` (zones không import scene). */
function cut(a: number, b: number, gaps: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  let start = a;
  for (const [lo, hi] of [...gaps].sort((p, q) => p[0] - q[0])) {
    if (lo - start > 0.05) out.push([start, Math.min(lo, b)]);
    start = Math.max(start, hi);
  }
  if (b - start > 0.05) out.push([start, b]);
  return out;
}

/** Tường bao + đoạn tường thêm thành các đoạn nét đã chừa khe cổng. */
function wallLines(src: AreaMapSource): MapShape[] {
  const out: MapShape[] = [];
  const t = src.walls.thickness;
  if (src.walls.enabled) {
    const h = src.walls.half;
    const sides: [AreaMapSource['walls']['gates'][number]['side'], 'x' | 'z', number][] = [
      ['bac', 'x', -h],
      ['nam', 'x', h],
      ['tay', 'z', -h],
      ['dong', 'z', h],
    ];
    for (const [side, axis, fixed] of sides) {
      const gaps = src.walls.gates.filter((g) => g.side === side).map((g): [number, number] => [g.at - g.width / 2, g.at + g.width / 2]);
      for (const [a, b] of cut(-h, h, gaps)) {
        out.push({ kind: 'tuong', from: axis === 'x' ? [a, fixed] : [fixed, a], to: axis === 'x' ? [b, fixed] : [fixed, b], width: t });
      }
    }
  }
  for (const s of src.wallSegments) {
    const alongX = s.from[1] === s.to[1];
    const fixed = alongX ? s.from[1] : s.from[0];
    const a = alongX ? Math.min(s.from[0], s.to[0]) : Math.min(s.from[1], s.to[1]);
    const b = alongX ? Math.max(s.from[0], s.to[0]) : Math.max(s.from[1], s.to[1]);
    const gaps: [number, number][] = s.gate ? [[s.gate.at - s.gate.width / 2, s.gate.at + s.gate.width / 2]] : [];
    for (const [p, q] of cut(a, b, gaps)) {
      out.push({ kind: 'tuong', from: alongX ? [p, fixed] : [fixed, p], to: alongX ? [q, fixed] : [fixed, q], width: t });
    }
  }
  return out;
}

/** Chỗ ngồi gom: một dấu mỗi nhà / tầng; ngoài nhà gom các chỗ cách nhau dưới [SEAT_CLUSTER] m. Bồ đoàn khu tự học
 *  (`study`) không thành dấu "chỗ ngồi" — đã có dấu khu tự học. */
function seatIcons(seats: NonNullable<AreaMapSpots['seats']>, houses: { id: string; rect: MapRect }[]): MapIcon[] {
  const groups: { building?: string; floor: number; xs: number[]; zs: number[] }[] = [];
  for (const s of seats) {
    if (s.study) continue;
    const floor = s.floor ?? 1;
    const house = houses.find((h) => inRect(h.rect, s.x, s.z));
    const g = house
      ? groups.find((q) => q.building === house.id && q.floor === floor)
      : groups.find((q) => !q.building && q.floor === floor && q.xs.some((x, i) => Math.hypot(x - s.x, (q.zs[i] ?? 0) - s.z) < SEAT_CLUSTER));
    if (g) {
      g.xs.push(s.x);
      g.zs.push(s.z);
    } else groups.push({ building: house?.id, floor, xs: [s.x], zs: [s.z] });
  }
  return groups.map((g) => {
    const house = houses.find((h) => h.id === g.building);
    const mean = (v: number[]): number => v.reduce((a, b) => a + b, 0) / v.length;
    // trong nhà: dấu ở tâm nhà (gọn, không lệch theo bàn); ngoài nhà: tâm nhóm
    return {
      kind: 'cho-ngoi',
      x: round(house ? house.rect.x : mean(g.xs)),
      z: round(house ? house.rect.z : mean(g.zs)),
      floor: g.floor,
      ...(g.building ? { building: g.building } : {}),
    };
  });
}

function grow(b: Bounds, x: number, z: number, r = 0): void {
  b.minX = Math.min(b.minX, x - r);
  b.maxX = Math.max(b.maxX, x + r);
  b.minZ = Math.min(b.minZ, z - r);
  b.maxZ = Math.max(b.maxZ, z + r);
}

/** Dựng bản đồ của một cảnh (R-BANDO-2). */
export function buildAreaMap(src: AreaMapSource, spots: AreaMapSpots = {}): AreaMap {
  const shapes: MapShape[] = [];
  const icons: MapIcon[] = [];
  const labels: MapLabel[] = [];
  const houses = src.buildings.map((b) => ({ id: b.id, title: b.title, rect: footprint(b) }));
  const houseAt = (x: number, z: number): string | undefined => houses.find((h) => inRect(h.rect, x, z))?.id;

  if (src.terrain.enabled && src.terrain.edge.radius > 0) {
    shapes.push({ kind: 'mep', x: src.terrain.center[0], z: src.terrain.center[1], r: src.terrain.edge.radius });
  }
  shapes.push(...landRects(src));
  src.site.areas.forEach((a, index) => {
    const r = landRect(a.from, a.to);
    shapes.push({ kind: 'khu', index, x: r.x, z: r.z, w: r.w, d: r.d });
  });
  for (const w of src.water) {
    if (w.w !== undefined && w.d !== undefined) shapes.push({ kind: 'nuoc-vuong', x: w.x, z: w.z, w: w.w, d: w.d, rot: rad(w.rotY) });
    else shapes.push({ kind: 'nuoc', x: w.x, z: w.z, r: w.r ?? 1 });
  }
  for (const p of src.paths.filter((q) => !q.dirt)) shapes.push({ kind: 'loi', from: p.from, to: p.to, width: p.width });
  for (const b of src.bridges) shapes.push({ kind: 'cau', x: b.x, z: b.z, w: b.width, d: b.length, rot: rad(b.rotY) });
  shapes.push(...wallLines(src));
  for (const h of houses) shapes.push({ kind: 'nha', id: h.id, ...h.rect });

  if (src.teleport.enabled) icons.push({ kind: 'vong-tran', x: src.teleport.center[0], z: src.teleport.center[1], floor: 1 });
  for (const p of src.portals) {
    const x = round((p.area.from[0] + p.area.to[0]) / 2);
    const z = round((p.area.from[1] + p.area.to[1]) / 2);
    icons.push({ kind: 'cong-canh', x, z, floor: 1, scene: p.scene });
    // cửa giữa hai phần của cùng một nơi (Nhà của ta ↔ gian trong — V-68): ghi nhãn cửa ("Vào nhà" / "Ra sân")
    const dest = spots.sceneNames?.[p.scene];
    labels.push({ kind: 'cong', text: dest === src.site.name && p.label ? p.label : (dest ?? p.scene), x, z, floor: 1 });
  }
  for (const g of src.gates) icons.push({ kind: 'son-mon', x: g.x, z: g.z, floor: 1 });
  for (const t of src.gameTables) {
    const kind = GAME_ICON[t.kind];
    if (!kind) continue;
    icons.push({ kind, x: t.x, z: t.z, floor: 1 });
    labels.push({ kind: 'cho', text: t.sign?.name || (GAME_NAMES[t.kind] ?? t.kind), x: t.x, z: t.z, floor: 1 });
  }
  const at = (x: number, z: number): { building?: string } => {
    const id = houseAt(x, z);
    return id ? { building: id } : {};
  };
  if (spots.shopDoor) icons.push({ kind: 'tap-hoa', x: spots.shopDoor.x, z: spots.shopDoor.z, floor: 1 });
  if (spots.board) {
    icons.push({ kind: 'bang-nhiem-vu', x: spots.board.x, z: spots.board.z, floor: 1, ...at(spots.board.x, spots.board.z) });
    labels.push({ kind: 'cho', text: 'Bảng nhiệm vụ', x: spots.board.x, z: spots.board.z, floor: 1 });
  }
  const study = spots.studySign ?? studyCenter(spots.seats ?? []);
  if (study) {
    const floor = study.floor ?? 1;
    icons.push({ kind: 'tu-hoc', x: round(study.x), z: round(study.z), floor, ...at(study.x, study.z) });
    labels.push({ kind: 'cho', text: 'Khu tự học', x: round(study.x), z: round(study.z), floor });
  }
  icons.push(...seatIcons(spots.seats ?? [], houses));

  src.site.areas.forEach((a, area) => {
    labels.push({ kind: 'khu', text: a.name, x: (a.from[0] + a.to[0]) / 2, z: (a.from[1] + a.to[1]) / 2, floor: 1, area });
  });
  for (const h of houses) labels.push({ kind: 'nha', text: h.title, x: h.rect.x, z: h.rect.z, floor: 1 });

  return { name: src.site.name, bounds: mapBounds(src), shapes, icons, labels };
}

/** Bục thấp hơn mức này (m) là đáy vực / mặt nước — không vẽ thành đất. */
export const LAND_MIN_Y = -1;
/** Không có địa hình: đất = khung chung các khu nới thêm chừng này (m). */
export const LAND_PAD = 3;

/** Đất trên bản đồ: các bục `terrain.plateaus` có y ≥ [LAND_MIN_Y]; không có địa hình → khung các khu nới [LAND_PAD] m. */
function landRect(a: XZ, b: XZ, pad = 0): MapRect {
  return { x: (a[0] + b[0]) / 2, z: (a[1] + b[1]) / 2, w: Math.abs(b[0] - a[0]) + pad * 2, d: Math.abs(b[1] - a[1]) + pad * 2 };
}

export function landRects(src: AreaMapSource): MapShape[] {
  const rect = (a: XZ, b: XZ, pad = 0): MapShape => ({ kind: 'dat', ...landRect(a, b, pad) });
  const plateaus = src.terrain.enabled ? (src.terrain.plateaus ?? []).filter((p) => p.y >= LAND_MIN_Y) : [];
  if (plateaus.length) return plateaus.map((p) => rect(p.from, p.to));
  const areas = src.site.areas;
  if (!areas.length) return [];
  const xs = areas.flatMap((a) => [a.from[0], a.to[0]]);
  const zs = areas.flatMap((a) => [a.from[1], a.to[1]]);
  return [rect([Math.min(...xs), Math.min(...zs)], [Math.max(...xs), Math.max(...zs)], LAND_PAD)];
}

/** Bồ đoàn khu tự học không có biển → dấu ở tâm các bồ đoàn. */
function studyCenter(seats: NonNullable<AreaMapSpots['seats']>): { x: number; z: number; floor?: number } | null {
  const s = seats.filter((q) => q.study);
  if (!s.length) return null;
  return { x: s.reduce((a, q) => a + q.x, 0) / s.length, z: s.reduce((a, q) => a + q.z, 0) / s.length, floor: s[0]?.floor };
}

/** Khung bản đồ: gồm mọi khu, nhà, tường bao, vòng trận, cổng, bàn chơi, chỗ xuất phát; nới [MAP_PAD] m. */
export function mapBounds(src: AreaMapSource): Bounds {
  const b: Bounds = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const a of src.site.areas) {
    grow(b, a.from[0], a.from[1]);
    grow(b, a.to[0], a.to[1]);
  }
  for (const h of src.buildings) {
    const r = footprint(h);
    grow(b, r.x - r.w / 2, r.z - r.d / 2);
    grow(b, r.x + r.w / 2, r.z + r.d / 2);
  }
  if (src.walls.enabled) grow(b, 0, 0, src.walls.half);
  if (src.teleport.enabled) grow(b, src.teleport.center[0], src.teleport.center[1], src.teleport.ringRadius);
  for (const p of src.portals) {
    grow(b, p.area.from[0], p.area.from[1]);
    grow(b, p.area.to[0], p.area.to[1]);
  }
  for (const t of src.gameTables) grow(b, t.x, t.z);
  grow(b, src.player.start[0], src.player.start[1]);
  return { minX: b.minX - MAP_PAD, maxX: b.maxX + MAP_PAD, minZ: b.minZ - MAP_PAD, maxZ: b.maxZ + MAP_PAD };
}
