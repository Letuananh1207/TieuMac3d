/**
 * Mục in trên cuộn sách Ngồi ôn trước mắt (R-ON-8; thiết kế 2026-11-14.21 `NgoiMat-*`): chữ từng dòng mực, bố cục giấy
 * (px thiết kế: dọc 343 × 462, ngang 250 × 337 — V-43) và vùng chạm theo (u, v) trên giấy. Thuần — không three, không DOM;
 * vẽ ở `ui/cuonMucPaint.ts`. Chuỗi theo `design/l10n/vi.arb` (`reviewDue*`, `learnNew*`, `learnAt*`, `viewLearned*`,
 * `hintGoForest`, `standUp`). Ấn son chỉ chữ Việt "Ôn" (R-HUD-4).
 */
import { RADICALS, type Radical } from './radicals';
import type { StudyItemId, StudyMenu } from './studyMenu';

export type CuonRowId = StudyItemId | 'stand';
/** thường · nổi bật (vệt mực ngọc) · mờ (lý do) */
export type CuonRowLook = 'thuong' | 'noi' | 'mo';

export interface CuonRow {
  id: StudyItemId;
  look: CuonRowLook;
  title: string;
  /** dòng phụ: các đoạn chữ, `han` = chữ Hán nội dung học (bộ thủ — R-HUD-4 cho phép) */
  sub: { text: string; han?: boolean }[];
}

export interface CuonView {
  /** dòng nơi đang ngồi ("Khởi Nguyên Trấn · Quảng Trường") */
  place: string;
  rows: CuonRow[];
  /** chưa học bộ nào → dòng gợi ý đi Rừng trúc */
  hint: string | null;
}

export const CUON_TITLE = 'Ngồi ôn';
export const CUON_SEAL = 'Ôn';
export const STAND_UP = 'Đứng dậy';
const HINT = 'Chưa học bộ nào. Đến Truyền Tống Đài, chọn Rừng trúc rồi Ngồi ôn để học bộ đầu tiên.';
const REASON: Record<string, string> = {
  reviewedToday: 'Hôm nay đã ôn xong',
  learnInRegion: 'Học ở Rừng trúc',
  allLearned: 'Đã học đủ',
};

/** Chữ các mục trên cuộn từ bảng chọn (`studyMenu`) + các bộ đến hạn (theo thứ tự hỏi). */
export function cuonView(menu: StudyMenu, due: readonly string[], place: string, pool: readonly Radical[] = RADICALS): CuonView {
  const byId = new Map(pool.map((r) => [r.id, r]));
  const look = (id: StudyItemId, enabled: boolean): CuonRowLook => (!enabled ? 'mo' : menu.highlight === id ? 'noi' : 'thuong');
  const rows = menu.items.map((it): CuonRow => {
    if (it.id === 'review') {
      if (!it.enabled)
        return { id: 'review', look: 'mo', title: 'Ôn bộ đến hạn', sub: [{ text: it.reason === 'noneLearned' ? 'Chưa có bộ nào để ôn' : REASON.reviewedToday! }] };
      const sub: CuonRow['sub'] = [];
      for (const r of due.map((id) => byId.get(id)).filter((r): r is Radical => !!r).slice(0, 3)) {
        sub.push({ text: r.form, han: true }, { text: ` ${r.name} · ` });
      }
      sub.push({ text: 'mỗi bộ 2 câu' });
      return { id: 'review', look: look('review', true), title: `Ôn bộ đến hạn (${it.count})`, sub };
    }
    if (it.id === 'learn') {
      if (!it.enabled) return { id: 'learn', look: 'mo', title: 'Học bộ mới', sub: [{ text: REASON[it.reason ?? ''] ?? '' }] };
      const n = menu.next;
      return {
        id: 'learn',
        look: look('learn', true),
        title: 'Học bộ mới',
        sub: n ? [{ text: 'Bộ kế tiếp: ' }, { text: n.form, han: true }, { text: ` ${n.name} — ${n.meaning}` }] : [],
      };
    }
    return it.enabled
      ? { id: 'learned', look: 'thuong', title: 'Xem bộ đã học', sub: [{ text: `${it.count} / ${pool.length} bộ` }] }
      : { id: 'learned', look: 'mo', title: 'Xem bộ đã học', sub: [{ text: 'Chưa học bộ nào' }] };
  });
  const none = menu.items.find((i) => i.id === 'learned')?.enabled === false; // chưa học bộ nào
  return { place, rows, hint: none ? HINT : null };
}

/** Hộp (px thiết kế, gốc góc trên trái giấy). */
export interface CuonBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CuonLayout {
  landscape: boolean;
  /** cỡ giấy (px thiết kế) */
  w: number;
  h: number;
  pad: { top: number; side: number; bottom: number };
  /** đầu cuộn (dòng nơi + "Ngồi ôn" + ấn son) */
  header: CuonBox;
  /** vạch chấm vàng (tâm y) */
  ruleY: number;
  rows: CuonBox[];
  hint: CuonBox;
  stand: CuonBox;
}

/** Tỉ lệ giấy cao / rộng (0,35 / 0,26 m — `scene/cuonSachNhip.ts` `CUON_GIAY_*`; V-43 đổi từ 0,25 / 0,26). */
export const PAPER_RATIO = 0.35 / 0.26;

/**
 * Bố cục giấy (V-43 — giấy dài hơn, cầm giữa màn; thiết kế 2026-11-14.21 cũ: dọc 343 × 330, ngang 300 × 288): dọc 343 × 462
 * (trên màn 390 rộng ~0,91 px màn / px giấy, 360 rộng ~0,84) mục 70 · ngang 250 × 337 (màn 844 × 390 ~0,97, 640 × 360
 * ~0,9) mục 53, cách 2; dòng gợi ý cả bề ngang dưới mục (đủ chỗ xuống dòng, không bị cắt); "Đứng dậy" sát đáy, bên phải,
 * cao 53 / 49 — trên màn nhỏ nhất (360 × 640 dọc, 640 × 360 ngang) vẫn ≥ 44 px.
 */
export function cuonLayout(landscape: boolean): CuonLayout {
  const w = landscape ? 250 : 343;
  const h = Math.round(w * PAPER_RATIO);
  const pad = landscape ? { top: 10, side: 12, bottom: 8 } : { top: 14, side: 16, bottom: 12 };
  const headH = landscape ? 36 : 42;
  const gap = landscape ? 5 : 8;
  const rowH = landscape ? 53 : 70;
  const standH = landscape ? 49 : 53;
  const header = { x: pad.side, y: pad.top, w: w - pad.side * 2, h: headH };
  const ruleY = header.y + headH + gap + 2;
  const top = ruleY + 2 + gap;
  const rows = [0, 1, 2].map((i) => ({ x: pad.side, y: top + i * (rowH + 2), w: w - pad.side * 2, h: rowH }));
  const standW = 120;
  const stand = { x: w - pad.side - standW, y: h - pad.bottom - standH, w: standW, h: standH };
  const last = rows[2]!;
  const hintY = last.y + last.h + (landscape ? 4 : 6);
  const hint = { x: pad.side, y: hintY, w: w - pad.side * 2, h: Math.max(0, stand.y - (landscape ? 4 : 6) - hintY) };
  return { landscape, w, h, pad, header, ruleY, rows, hint, stand };
}

/** Gói chữ theo từ thành dòng rộng tối đa `max` (đo bằng `width`). */
export function wrapWords(s: string, max: number, width: (line: string) => number): string[] {
  const out: string[] = [];
  let line = '';
  for (const word of s.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && width(next) > max) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

/** Đệm dòng gợi ý: trái (vạch 3 + cách) + phải, trên + dưới (px thiết kế). */
export const HINT_PAD_X = 14;
export const HINT_PAD_Y = 8;
const HINT_MIN = 9;

/** Dòng gợi ý đã gói: cỡ chữ, cao dòng, các dòng. */
export interface HintFit {
  size: number;
  lineH: number;
  lines: string[];
}

/**
 * Gói dòng gợi ý vừa hộp `box` (V-43: không bao giờ cắt chữ): cỡ chữ từ `base` lùi dần 0,5 tới khi đủ chỗ cho mọi dòng
 * (tối thiểu 9 — nhỏ hơn nữa vẫn trả đủ dòng, người vẽ nới hộp). `measure(chữ, cỡ)` = bề ngang px thiết kế.
 */
export function fitHint(text: string, box: CuonBox, base: number, measure: (s: string, size: number) => number): HintFit {
  for (let size = base; ; size -= 0.5) {
    const lineH = Math.round(size * 12.5) / 10;
    const lines = wrapWords(text, box.w - HINT_PAD_X, (s) => measure(s, size));
    if (lines.length * lineH + HINT_PAD_Y <= box.h || size <= HINT_MIN) return { size, lineH, lines };
  }
}

const inside = (b: CuonBox, x: number, y: number): boolean => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

/**
 * Chạm (u, v) trên giấy (u trái → phải, v dưới → lên — như `CuonSach.hitUv`) → mục / "Đứng dậy"; ngoài mục → `null`.
 * Mục mờ vẫn trả về (người gọi bỏ qua — chạm không mở, không vệt vàng).
 */
export function cuonHit(layout: CuonLayout, view: CuonView, u: number, v: number): CuonRowId | null {
  const x = u * layout.w;
  const y = (1 - v) * layout.h;
  if (inside(layout.stand, x, y)) return 'stand';
  const i = layout.rows.findIndex((r) => inside(r, x, y));
  return i >= 0 ? (view.rows[i]?.id ?? null) : null;
}

/** Mục dùng được (không mờ) — "Đứng dậy" luôn dùng được. */
export function cuonUsable(view: CuonView, id: CuonRowId): boolean {
  return id === 'stand' || view.rows.some((r) => r.id === id && r.look !== 'mo');
}
