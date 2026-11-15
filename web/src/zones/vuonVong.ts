/**
 * Vòng công cụ quanh luống kiểu 摩尔 (V-73 đổi hướng 2026-11-16, R-VUON-2/3/13) — thuần, không DOM / three. Chạm một luống →
 * vòng nổi quanh luống đó: ô giữa **Tay** (thu), quanh theo chiều kim đồng hồ từ trên **Hạt giống · Bình tưới · Bắt sâu ·
 * Nhổ cỏ · Phân bón**; ô sáng = làm được ngay ở luống này, mờ = không (kèm lý do tiếng Việt); Hạt giống / Phân bón có số.
 * Luống hoang → vòng chỉ một ô giữa **Mở ô**. Ô Hạt giống mở **lưới hạt** (chỉ loại đang có) → chọn loại → gieo đúng luống đó.
 * Mỗi lần một luống (không lướt). HUD vòng chờ thiết kế (phiếu `2026-11-15-vuon-mole`); tạm ghép ở `gardenWork.ts` bằng
 * click luống + phím 1–6 / E / Esc + Console.
 */
import { canWater, CROPS, cropOf, plotOf, plotState, remainingMs, type CropId, type Garden, type GardenAct } from './vuon';
import { hasBug, weedsOf } from './vuon';
import { remainText } from './vuonHud';

/** Ô của vòng: 6 ô của luống đã mở + `mo` (Mở ô — luống hoang). */
export type SlotId = 'tay' | 'hat' | 'binh' | 'sau' | 'co' | 'phan' | 'mo';
/** Ô làm việc lên luống (trừ Mở ô). */
export type ToolId = Exclude<SlotId, 'mo'>;

/** Mã động tác nhân vật (trùng `WorkId` ở `player/lamVuonDang.ts` — zones không import player). */
export type WorkKind = 'gieo' | 'tuoi' | 'bat' | 'nho' | 'bon' | 'thu';

/**
 * Bố cục vòng (phím 1 … 6 trên máy tính theo thứ tự này). `at`: `null` = ô giữa; số = góc (độ) theo chiều kim đồng hồ từ
 * đỉnh vòng (5 ô quanh cách nhau 72°). Tên chỉ tiếng Việt (R-HUD-4).
 */
export const RING: readonly { id: ToolId; name: string; work: WorkKind; at: number | null }[] = [
  { id: 'tay', name: 'Tay', work: 'thu', at: null },
  { id: 'hat', name: 'Hạt giống', work: 'gieo', at: 0 },
  { id: 'binh', name: 'Bình tưới', work: 'tuoi', at: 72 },
  { id: 'sau', name: 'Bắt sâu', work: 'bat', at: 144 },
  { id: 'co', name: 'Nhổ cỏ', work: 'nho', at: 216 },
  { id: 'phan', name: 'Phân bón', work: 'bon', at: 288 },
];
export const OPEN_SLOT_NAME = 'Mở ô';

export interface RingSlot {
  id: SlotId;
  name: string;
  /** phím máy tính (1 = ô giữa) */
  key: number;
  /** `null` = ô giữa; số = góc (độ) theo chiều kim đồng hồ từ đỉnh */
  at: number | null;
  /** sáng = làm được ngay ở luống này; mờ = không */
  lit: boolean;
  /** ô mờ: lý do (chạm ô mờ → câu báo này); ô sáng `null` */
  why: string | null;
  /** số góc ô: Hạt giống = tổng số hạt, Phân bón = số bao; ô khác `null` */
  count: number | null;
}

export interface RingView {
  plot: string;
  /** luống hoang → chỉ ô Mở ô */
  wild: boolean;
  slots: RingSlot[];
}

export const EMPTY_SEED_BAG = 'Túi hạt trống — mua hạt ở Tạp hoá trấn';
export const EMPTY_FERT = 'Hết phân bón — mua ở Tạp hoá trấn';
export const outOfSeed = (crop: CropId): string => `Hết hạt ${cropOf(crop)?.name ?? ''}`.trim();

/** Tổng số hạt trong túi. */
const seedTotal = (g: Garden): number => CROPS.reduce((s, c) => s + (g.seeds[c.id] ?? 0), 0);

/** Lưới hạt (R-VUON-3): chỉ loại đang có, theo thứ tự bảng cây (phím 1 … n). */
export const seedGrid = (g: Garden): { crop: CropId; name: string; count: number }[] =>
  CROPS.filter((c) => (g.seeds[c.id] ?? 0) > 0).map((c) => ({ crop: c.id, name: c.name, count: g.seeds[c.id]! }));

/** Kết quả thử một việc lên luống: được → thao tác `gardenAct` + động tác; không → câu báo. */
export type Fit = { ok: true; act: GardenAct; work: WorkKind } | { ok: false; why: string };

const yes = (act: GardenAct, work: WorkKind): Fit => ({ ok: true, act, work });
const nope = (why: string): Fit => ({ ok: false, why });

/**
 * Việc [tool] (Hạt giống: với loại [crop]) làm được lên luống [id] không (R-VUON-2/3/5/10/11/12) — kiểm như luật, câu báo
 * cho người chơi. Kiểm lại lúc bắt đầu làm (vườn có thể đã đổi).
 */
export function fits(g: Garden, id: string, tool: ToolId, now: number, speed = 1, crop?: CropId): Fit {
  const st = plotState(g, id, now, speed);
  if (st === 'hoang') return nope('Luống chưa mở — chọn "Mở ô"');
  const p = plotOf(g, id);
  const c = cropOf(p.crop);
  switch (tool) {
    case 'hat':
      if (st !== 'trong') return nope('Luống đã có cây');
      if (!crop) return nope(EMPTY_SEED_BAG);
      if ((g.seeds[crop] ?? 0) <= 0) return nope(outOfSeed(crop));
      return yes({ act: 'sow', plot: id, crop }, 'gieo');
    case 'tay':
      if (st === 'chin') return yes({ act: 'harvest', plot: id }, 'thu');
      return nope(!c ? 'Luống trống — chọn Hạt giống để gieo' : `${c.name} · còn ${remainText(remainingMs(p, now, speed))}`);
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
      if (g.fert <= 0) return nope(EMPTY_FERT);
      return yes({ act: 'fert', plot: id }, 'bon');
  }
}

/** Ô Hạt giống: sáng khi luống trống và túi có hạt (chọn → lưới hạt). */
function seedSlotWhy(g: Garden, id: string, now: number, speed: number): string | null {
  if (plotState(g, id, now, speed) !== 'trong') return 'Luống đã có cây';
  return seedTotal(g) > 0 ? null : EMPTY_SEED_BAG;
}

/** Vòng công cụ của luống [id] lúc [now] (R-VUON-2). */
export function ringView(g: Garden, id: string, now: number, speed = 1): RingView {
  if (plotState(g, id, now, speed) === 'hoang') {
    return { plot: id, wild: true, slots: [{ id: 'mo', name: OPEN_SLOT_NAME, key: 1, at: null, lit: true, why: null, count: null }] };
  }
  const slots = RING.map(({ id: tool, name, at }, i): RingSlot => {
    const why = tool === 'hat' ? seedSlotWhy(g, id, now, speed) : ((f) => (f.ok ? null : f.why))(fits(g, id, tool, now, speed));
    const count = tool === 'hat' ? seedTotal(g) : tool === 'phan' ? g.fert : null;
    return { id: tool, name, key: i + 1, at, lit: why === null, why, count };
  });
  return { plot: id, wild: false, slots };
}

/** Chọn một ô của vòng: việc làm ngay · mở lưới hạt · mở hộp Mở ô · không được (câu báo, vòng vẫn mở). */
export type Pick =
  | { kind: 'job'; plot: string; act: GardenAct; work: WorkKind }
  | { kind: 'grid'; seeds: ReturnType<typeof seedGrid> }
  | { kind: 'open' }
  | { kind: 'no'; why: string };

/** Chọn ô [slot] trên vòng luống [id] (R-VUON-2/3). */
export function pickSlot(g: Garden, id: string, slot: SlotId, now: number, speed = 1): Pick {
  const st = plotState(g, id, now, speed);
  if (slot === 'mo') return st === 'hoang' ? { kind: 'open' } : { kind: 'no', why: 'Luống đã mở' };
  if (st === 'hoang') return { kind: 'no', why: 'Luống chưa mở — chọn "Mở ô"' };
  if (slot === 'hat') {
    const why = seedSlotWhy(g, id, now, speed);
    return why ? { kind: 'no', why } : { kind: 'grid', seeds: seedGrid(g) };
  }
  const f = fits(g, id, slot, now, speed);
  return f.ok ? { kind: 'job', plot: id, act: f.act, work: f.work } : { kind: 'no', why: f.why };
}

/** Chọn loại [crop] trong lưới hạt → gieo đúng luống [id] (R-VUON-3). */
export function pickSeed(g: Garden, id: string, crop: CropId, now: number, speed = 1): Pick {
  const f = fits(g, id, 'hat', now, speed, crop);
  return f.ok ? { kind: 'job', plot: id, act: f.act, work: f.work } : { kind: 'no', why: f.why };
}

/**
 * Chọn việc mới khi đang bận việc khác (R-VUON-13): rảnh → `di` (đi làm ngay); đang đi tới → `doi` (bỏ việc cũ, đi việc
 * mới); đang diễn → `cho` (diễn xong mới làm — chỉ nhớ việc chọn sau cùng).
 */
export const whenChosen = (phase: 'walk' | 'work' | null): 'di' | 'doi' | 'cho' => (phase === 'work' ? 'cho' : phase === 'walk' ? 'doi' : 'di');

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
