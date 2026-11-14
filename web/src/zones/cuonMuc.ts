/**
 * Mục in trên cuộn sách Ngồi ôn trước mắt (R-ON-8; thiết kế 2026-11-14.21 `NgoiMat-*`): chữ từng dòng mực, bố cục giấy
 * (px thiết kế: dọc 343 × 330, ngang 300 × 288) và vùng chạm theo (u, v) trên giấy. Thuần — không three, không DOM;
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

/** Tỉ lệ giấy cao / rộng (0,25 / 0,26 m). */
export const PAPER_RATIO = 0.25 / 0.26;

/** Bố cục giấy theo thiết kế: dọc mục 56 · ngang mục 54, cách 2; "Đứng dậy" cao 44 sát đáy, bên phải. */
export function cuonLayout(landscape: boolean): CuonLayout {
  const w = landscape ? 300 : 343;
  const h = Math.round(w * PAPER_RATIO);
  const pad = landscape ? { top: 10, side: 14, bottom: 8 } : { top: 12, side: 16, bottom: 10 };
  const headH = landscape ? 36 : 40;
  const gap = landscape ? 4 : 6;
  const rowH = landscape ? 54 : 56;
  const header = { x: pad.side, y: pad.top, w: w - pad.side * 2, h: headH };
  const ruleY = header.y + headH + gap + 2;
  const top = ruleY + 2 + gap;
  const rows = [0, 1, 2].map((i) => ({ x: pad.side, y: top + i * (rowH + 2), w: w - pad.side * 2, h: rowH }));
  const standW = 120;
  const stand = { x: w - pad.side - standW, y: h - pad.bottom - 44, w: standW, h: 44 };
  const last = rows[2]!;
  const hintY = last.y + last.h + 4;
  const hint = { x: pad.side, y: hintY, w: w - pad.side * 2 - standW - 6, h: Math.max(0, h - pad.bottom - hintY) };
  return { landscape, w, h, pad, header, ruleY, rows, hint, stand };
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
