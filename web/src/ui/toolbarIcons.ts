/**
 * Hình của thanh công cụ, bảng Biểu cảm, bong bóng hình, Túi đồ (thiết kế 2026-11-15.35 — chép từ artboard
 * `ThanhCongCu-*`, `BieuCam-*`, `TuiDo-*`). Biểu tượng nét 24 × 24 (`currentColor`); biểu cảm dùng hình minh hoạ đất sét
 * (2026-11-16.3), chỗ chưa có hình giữ nét 48 × 48 hai màu — không emoji hệ thống, không chữ (R-HUD-4).
 */
import type { EmoteId } from '../zones/bieuCam';
import type { ToolId } from '../zones/thanhCongCu';
import { svgIcon, type SvgNode } from './decorIcons';
import { hinhImg, isHinh } from './hinh';

const path = (d: string, extra: Record<string, string> = {}): SvgNode => ['path', { d, ...extra }];

/** 5 nút thanh: cuộn bản đồ gấp · mái nhà có cửa · mặt cười · túi vải · thẻ có dải. */
export const TOOL_ICONS: Readonly<Record<ToolId, readonly SvgNode[]>> = {
  banDo: [path('M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z'), path('M9 4v14M15 6v14')],
  veNha: [path('M3 11l9-7 9 7'), path('M5 10v10h14V10'), path('M10 20v-5h4v5')],
  bieuCam: [['circle', { cx: '12', cy: '12', r: '9' }], path('M8.5 14.5c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2'), path('M9 9.5h.01M15 9.5h.01', { 'stroke-width': '3' })],
  tuiDo: [path('M6 8h12l1 12H5z'), path('M9 8V6a3 3 0 0 1 6 0v2'), path('M9 12h6')],
  nhiemVu: [path('M7 3h10v18l-5-3-5 3z'), path('M10 8h4M10 12h4')],
};

export const ICON_CLOSE: readonly SvgNode[] = [path('M6 6l12 12M18 6L6 18')];
export const ICON_BOOK: readonly SvgNode[] = [path('M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z'), path('M12 6v13')];

const SLATE = '#24323A';
const GOLD = '#D4A64A';
/** nét chính của hình biểu cảm */
const line = (d: string): SvgNode => ['path', { stroke: SLATE, 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none', d }];
const accent = (d: string, color: string, w = '2.4'): SvgNode => ['path', { d, stroke: color, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }];

/** Hình nét (khung 0 0 48 48) cho biểu cảm chưa có hình minh hoạ — còn Cúi chào (đợt 2b). */
const EMOTE_ICONS: Partial<Record<EmoteId, readonly SvgNode[]>> = {
  'cui-chao': [['circle', { cx: '30', cy: '14', r: '5', fill: SLATE }], line('M27 18l-10 8v14M17 26l12 4M22 40h8'), accent('M8 40h32', GOLD, '2')],
};

/**
 * Hình biểu cảm cỡ [size] — ô bảng 32, bong bóng 34 (thiết kế 2026-11-16.3): bản cắt sát mặt `<mã>-mat` (mặt to gấp ~1,6 bản
 * nửa người); chưa có hình → nét cũ.
 */
export function emoteIcon(id: EmoteId, size: number): Element {
  const ma = `${id}-mat`;
  if (isHinh(ma)) return hinhImg(ma, size);
  return svgIcon(EMOTE_ICONS[id] ?? [], size, '0 0 48 48');
}
