/**
 * Thanh nông cụ Vườn rau kiểu 摩尔 (V-73, R-VUON-2/3/13) — thuần, không DOM / three: 6 ô (Tay · Bình tưới · Hạt giống · Bắt
 * sâu · Nhổ cỏ · Phân bón), ô sáng / mờ / số, công cụ hợp luống không (`fits` + câu từ chối tiếng Việt), hàng đợi lướt nhiều
 * luống (bỏ trùng, giữ thứ tự, dừng khi hết hạt / phân), điểm đứng cạnh luống. HUD dựng thanh chờ thiết kế (phiếu
 * `2026-11-15-vuon-mole`); tạm thời ghép bằng phím 1–6 / E / Esc (`gardenWork.ts`).
 */
import { canWater, CROPS, cropOf, plotOf, plotState, remainingMs, type CropId, type Garden, type GardenAct } from './vuon';
import { hasBug, weedsOf } from './vuon';
import { remainText } from './vuonHud';

export type ToolId = 'tay' | 'binh' | 'hat' | 'sau' | 'co' | 'phan';

/** Mã động tác nhân vật (trùng `WorkId` ở `player/lamVuonDang.ts` — zones không import player). */
export type WorkKind = 'gieo' | 'tuoi' | 'bat' | 'nho' | 'bon' | 'thu';

/** 6 ô theo thứ tự (phím 1 … 6 trên máy tính). Tên chỉ tiếng Việt (R-HUD-4). */
export const TOOLS: readonly { id: ToolId; name: string; work: WorkKind }[] = [
  { id: 'tay', name: 'Tay', work: 'thu' },
  { id: 'binh', name: 'Bình tưới', work: 'tuoi' },
  { id: 'hat', name: 'Hạt giống', work: 'gieo' },
  { id: 'sau', name: 'Bắt sâu', work: 'bat' },
  { id: 'co', name: 'Nhổ cỏ', work: 'nho' },
  { id: 'phan', name: 'Phân bón', work: 'bon' },
];

export const toolOf = (id: ToolId): (typeof TOOLS)[number] => TOOLS.find((t) => t.id === id)!;

/** Đang cầm gì: công cụ + loại hạt (chỉ khi cầm Hạt giống). `null` = không cầm (đi lại thường). */
export interface Holding {
  tool: ToolId;
  crop?: CropId;
}

export interface ToolSlot {
  id: ToolId;
  name: string;
  /** đang cầm ô này */
  on: boolean;
  /** sáng = có luống làm được ngay; mờ = không có việc / hết vật */
  lit: boolean;
  /** số góc ô: Hạt giống = tổng số hạt, Phân bón = số bao; ô khác `null` */
  count: number | null;
}

/** Danh sách luống mở để duyệt. */
const openPlots = (g: Garden): string[] => Array.from({ length: g.open }, (_, i) => `o-${i + 1}`);

/** 6 ô thanh nông cụ lúc [now]. */
export function toolSlots(g: Garden, holding: Holding | null, now: number, speed = 1): ToolSlot[] {
  const seeds = CROPS.reduce((s, c) => s + (g.seeds[c.id] ?? 0), 0);
  return TOOLS.map(({ id, name }) => {
    const probe: Holding = id === 'hat' ? { tool: 'hat', crop: CROPS.find((c) => (g.seeds[c.id] ?? 0) > 0)?.id } : { tool: id };
    const lit = openPlots(g).some((p) => fits(g, p, probe, now, speed).ok);
    return { id, name, on: holding?.tool === id, lit, count: id === 'hat' ? seeds : id === 'phan' ? g.fert : null };
  });
}

/** Lưới hạt (R-VUON-3): chỉ loại đang có, theo thứ tự bảng cây; rỗng → [EMPTY_SEED_BAG]. */
export const seedGrid = (g: Garden): { crop: CropId; name: string; count: number }[] =>
  CROPS.filter((c) => (g.seeds[c.id] ?? 0) > 0).map((c) => ({ crop: c.id, name: c.name, count: g.seeds[c.id]! }));

export const EMPTY_SEED_BAG = 'Túi hạt trống — mua hạt ở Tạp hoá trấn';
export const EMPTY_FERT = 'Hết phân bón — mua ở Tạp hoá trấn';
export const outOfSeed = (crop: CropId): string => `Hết hạt ${cropOf(crop)?.name ?? ''}`.trim();

/** Kết quả thử công cụ lên luống: được → thao tác `gardenAct` + động tác; không → câu báo + có phải "hết vật" (dừng hàng). */
export type Fit = { ok: true; act: GardenAct; work: WorkKind } | { ok: false; why: string; stop: boolean };

const yes = (act: GardenAct, work: WorkKind): Fit => ({ ok: true, act, work });
const nope = (why: string, stop = false): Fit => ({ ok: false, why, stop });

/** Công cụ [h] dùng được lên luống [id] không (R-VUON-2/3/5/10/11/12) — kiểm như luật, câu báo cho người chơi. */
export function fits(g: Garden, id: string, h: Holding, now: number, speed = 1): Fit {
  const st = plotState(g, id, now, speed);
  if (st === 'hoang') return nope('Luống chưa mở — đứng gần bấm "Mở ô"');
  const p = plotOf(g, id);
  const c = cropOf(p.crop);
  switch (h.tool) {
    case 'hat':
      if (!h.crop) return nope(EMPTY_SEED_BAG, true);
      if ((g.seeds[h.crop] ?? 0) <= 0) return nope(outOfSeed(h.crop), true);
      return st === 'trong' ? yes({ act: 'sow', plot: id, crop: h.crop }, 'gieo') : nope('Luống đã có cây');
    case 'tay':
      if (st === 'chin') return yes({ act: 'harvest', plot: id }, 'thu');
      return nope(!c ? 'Luống trống — cầm Hạt giống để gieo' : `${c.name} · còn ${remainText(remainingMs(p, now, speed))}`);
    case 'binh':
      if (canWater(p, now, speed)) return yes({ act: 'water', plot: id }, 'tuoi');
      return nope(!c ? 'Luống trống' : st === 'chin' ? 'Cây đã chín — dùng Tay để thu' : 'Đất còn ẩm');
    case 'sau':
      return hasBug(p, id, now, speed) ? yes({ act: 'bug', plot: id }, 'bat') : nope(!c ? 'Luống trống' : 'Không có sâu');
    case 'co':
      return weedsOf(p, id, now, speed) ? yes({ act: 'weed', plot: id }, 'nho') : nope(!c ? 'Luống trống' : 'Không có cỏ');
    case 'phan':
      if (!c) return nope('Luống trống');
      if (st === 'chin') return nope('Cây đã chín — dùng Tay để thu');
      if (p.boost > 0) return nope('Cây này bón rồi');
      if (g.fert <= 0) return nope(EMPTY_FERT, true);
      return yes({ act: 'fert', plot: id }, 'bon');
  }
}

/** Thêm luống [id] vào hàng đợi lướt: bỏ nếu đang làm ([current]) hoặc đã có trong hàng; giữ thứ tự lướt qua. */
export function queueAdd(queue: readonly string[], id: string, current: string | null): string[] {
  return id === current || queue.includes(id) ? [...queue] : [...queue, id];
}

/**
 * Lấy việc kế từ hàng đợi: bỏ qua luống không hợp (ghi vào `skipped`); gặp "hết hạt / hết phân" → `stop` (câu báo) và bỏ cả
 * hàng. Hàng rỗng → `job: null`.
 */
export function queueNext(
  queue: readonly string[],
  g: Garden,
  h: Holding,
  now: number,
  speed = 1,
): { job: { plot: string; act: GardenAct; work: WorkKind } | null; rest: string[]; stop: string | null; skipped: { plot: string; why: string }[] } {
  const skipped: { plot: string; why: string }[] = [];
  for (let i = 0; i < queue.length; i++) {
    const f = fits(g, queue[i], h, now, speed);
    if (f.ok) return { job: { plot: queue[i], act: f.act, work: f.work }, rest: queue.slice(i + 1), stop: null, skipped };
    if (f.stop) return { job: null, rest: [], stop: f.why, skipped };
    skipped.push({ plot: queue[i], why: f.why });
  }
  return { job: null, rest: [], stop: null, skipped };
}

/** Sau khi làm xong: còn cầm được không (R-VUON-3: hết hạt loại đang cầm → bỏ cầm + câu báo). */
export function holdAfter(g: Garden, h: Holding): { holding: Holding | null; why: string | null } {
  if (h.tool === 'hat' && h.crop && (g.seeds[h.crop] ?? 0) <= 0) return { holding: null, why: outOfSeed(h.crop) };
  return { holding: h, why: null };
}

/** Chọn loại hạt kế tiếp khi bấm lại ô Hạt giống (tạm, khi chưa có lưới hạt): vòng theo loại đang có. */
export function nextSeed(g: Garden, current: CropId | undefined): CropId | undefined {
  const have = seedGrid(g).map((s) => s.crop);
  if (!have.length) return undefined;
  const i = current ? have.indexOf(current) : -1;
  return have[(i + 1) % have.length];
}

/** Khoảng đứng từ tâm luống (m): ra mép luống về phía người chơi (R-VUON-13). */
export const STAND_OFF = 1.05;

/** Điểm đứng cạnh luống tâm [plot] gần [from] nhất (trên đường nối tâm → người chơi), mặt nhìn về tâm luống. */
export function standSpot(plot: { x: number; z: number }, from: { x: number; z: number }): { x: number; z: number; faceX: number; faceZ: number } {
  let dx = from.x - plot.x;
  let dz = from.z - plot.z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) {
    dx = 0;
    dz = 1;
  } else {
    dx /= len;
    dz /= len;
  }
  return { x: plot.x + dx * STAND_OFF, z: plot.z + dz * STAND_OFF, faceX: plot.x, faceZ: plot.z };
}
