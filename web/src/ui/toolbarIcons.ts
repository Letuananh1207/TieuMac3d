/**
 * Hình của thanh công cụ, bảng Biểu cảm, bong bóng hình, Túi đồ (thiết kế 2026-11-15.35 — chép từ artboard
 * `ThanhCongCu-*`, `BieuCam-*`, `TuiDo-*`). Biểu tượng nét 24 × 24 (`currentColor`); hình biểu cảm 48 × 48 hai màu (nét
 * `slate` 2,4 + nhấn `gold` / `lacquer` / `jade`) — không emoji hệ thống, không chữ (R-HUD-4).
 */
import type { EmoteId } from '../zones/bieuCam';
import type { ToolId } from '../zones/thanhCongCu';
import type { SvgNode } from './decorIcons';

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
const LACQUER = '#A8322A';
const JADE = '#2B5446';
/** nét chính của hình biểu cảm */
const line = (d: string): SvgNode => ['path', { stroke: SLATE, 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none', d }];
const accent = (d: string, color: string, w = '2.4'): SvgNode => ['path', { d, stroke: color, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }];

/** Hình 8 biểu cảm (khung 0 0 48 48). */
export const EMOTE_ICONS: Readonly<Record<EmoteId, readonly SvgNode[]>> = {
  'vay-tay': [line('M18 34l-6-10a2.5 2.5 0 0 1 4-3l4 6V12a2.5 2.5 0 0 1 5 0v10V9a2.5 2.5 0 0 1 5 0v13V11a2.5 2.5 0 0 1 5 0v15c0 7-5 12-11 12-3 0-5-1.5-6-4z'), accent('M8 10q-3 3 0 7M40 9q3 3 0 7', GOLD)],
  'chap-tay': [line('M24 8l-6 16-2 14h8zM24 8l6 16 2 14h-8z'), accent('M14 40h20', LACQUER, '3')],
  'cui-chao': [['circle', { cx: '30', cy: '14', r: '5', fill: SLATE }], line('M27 18l-10 8v14M17 26l12 4M22 40h8'), accent('M8 40h32', GOLD, '2')],
  'vo-tay': [line('M14 30l6-14a2 2 0 0 1 4 1l-2 7 6-10a2 2 0 0 1 3.5 2l-5 9 7-8a2 2 0 0 1 3 2.5l-8 10c-4 5-10 6-14 1z'), accent('M30 6l2 4M38 10l-3 3M40 18h-4', GOLD)],
  cuoi: [
    ['circle', { cx: '24', cy: '24', r: '16', fill: '#F7D774', stroke: SLATE, 'stroke-width': '2.4' }],
    line('M16 20q3-3 6 0M26 20q3-3 6 0'),
    ['path', { d: 'M15 27h18q-2 9-9 9t-9-9z', fill: LACQUER, stroke: SLATE, 'stroke-width': '2.4', 'stroke-linejoin': 'round' }],
  ],
  'nhay-mung': [['circle', { cx: '24', cy: '12', r: '5', fill: SLATE }], line('M24 17v12M24 21l-9-7M24 21l9-7M24 29l-7 8M24 29l7 8'), accent('M8 8l2 2M40 8l-2 2M6 22h3M42 22h-3', GOLD)],
  'suy-nghi': [
    ['circle', { cx: '20', cy: '26', r: '13', fill: '#FFFFFF', stroke: SLATE, 'stroke-width': '2.4' }],
    line('M14 24h.01M24 24h.01M15 32h8'),
    ['circle', { cx: '36', cy: '12', r: '5', fill: 'none', stroke: JADE, 'stroke-width': '2.2' }],
    ['circle', { cx: '31', cy: '20', r: '2', fill: JADE }],
    accent('M34 12h.01M36 12h.01M38 12h.01', JADE),
  ],
  'ngoi-nghi': [['circle', { cx: '24', cy: '12', r: '5', fill: SLATE }], line('M24 17v11M24 21l-7 6M24 21l7 6M12 36q12-8 24 0'), accent('M34 6h5l-5 5h5', JADE, '2')],
};
