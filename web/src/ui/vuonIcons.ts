/**
 * Hình giữ chỗ của vòng công cụ + dấu luống (thiết kế 2026-11-16.4, artboard `VuonMole-trang-thai`) — chép đúng hình khối
 * phẳng của artboard tới khi có hình minh hoạ `tay-thu`, `bat-sau`, `nho-co`, `phan-bon`, `dau-kho`, `dau-sau`, `dau-co`
 * (còn chờ — câu lệnh trong `VuonMole-ghi-chu`). Hạt giống / Bình tưới / Mở ô đã có hình đợt 2 (`gieo`, `tuoi`, `mo-o`).
 * Khung `0 0 48 48`.
 */
import type { SvgNode } from './decorIcons';

const p = (d: string, attrs: Record<string, string>): SvgNode => ['path', { d, ...attrs }];
const c = (cx: number, cy: number, r: number, fill: string, stroke?: string): SvgNode => ['circle', { cx: String(cx), cy: String(cy), r: String(r), fill, ...(stroke ? { stroke, 'stroke-width': '1.2' } : {}) }];

/** Bàn tay mở (ô giữa Tay — thu). */
export const HAND: readonly SvgNode[] = [
  p('M14 40c-4-4-7-10-7-15 0-2 2-3 3.5-1.5L14 28V12c0-2 3-2 3 0v11h1V8c0-2 3-2 3 0v15h1V10c0-2 3-2 3 0v13h1V14c0-2 3-2 3 0v16c0 6-2 10-6 12z', {
    fill: '#F2D2B0', stroke: '#C99A76', 'stroke-width': '1.6', 'stroke-linejoin': 'round',
  }),
  ['ellipse', { cx: '22', cy: '33', rx: '5', ry: '3', fill: '#E9BC96', opacity: '.7' }],
];

/** Con sâu xanh (dấu luống "có sâu"). */
export const BUG: readonly SvgNode[] = [
  p('M8 32c4-2 6 2 10 0s6-6 10-4 6 4 10 0', { stroke: '#7FA05A', 'stroke-width': '2', fill: 'none' }),
  c(12, 30, 5, '#8CC064', '#5E8C3E'),
  c(18, 28, 5, '#8CC064', '#5E8C3E'),
  c(24, 26, 5, '#8CC064', '#5E8C3E'),
  c(30, 27, 5, '#8CC064', '#5E8C3E'),
  c(36, 24, 6, '#9BCF6E', '#5E8C3E'),
  c(38, 22, 1.4, '#24323A'),
  p('M36 18l-1-4M39 18l2-4', { stroke: '#5E8C3E', 'stroke-width': '1.4', 'stroke-linecap': 'round' }),
];

/** Sâu + vợt (ô Bắt sâu). */
export const BUG_NET: readonly SvgNode[] = [
  ...BUG,
  p('M6 14l8 8M10 10l8 8', { stroke: '#C9A86A', 'stroke-width': '2.4', 'stroke-linecap': 'round' }),
  ['ellipse', { cx: '10', cy: '12', rx: '6', ry: '4', fill: 'none', stroke: '#C9A86A', 'stroke-width': '1.6', transform: 'rotate(45 10 12)' }],
];

/** Bụi cỏ dại (ô Nhổ cỏ, dấu "có cỏ"). */
export const WEED: readonly SvgNode[] = [
  p('M24 30 C20 20 14 16 9 14 C15 20 18 26 20 31Z', { fill: '#6FA34E' }),
  p('M24 30 C24 18 28 11 32 7 C29 16 28 24 27 31Z', { fill: '#82B85A' }),
  p('M24 31 C30 24 35 22 40 21 C34 26 31 29 28 32Z', { fill: '#5E9C4E' }),
  p('M22 32 c-2 4-6 6-9 7M25 32c0 4 1 7 3 9M27 32c3 3 6 4 9 4', { stroke: '#8A6A48', 'stroke-width': '1.8', fill: 'none', 'stroke-linecap': 'round' }),
  ['ellipse', { cx: '24', cy: '32', rx: '6', ry: '2.5', fill: '#7A5A3E' }],
];

/** Bao phân có mầm (ô Phân bón, dấu "bón được", thẻ Tạp hoá). */
export const FERT_BAG: readonly SvgNode[] = [
  p('M12 16c0-3 3-4 5-4h14c2 0 5 1 5 4l2 22c0 3-2 4-4 4H14c-2 0-4-1-4-4z', { fill: '#C9A26E', stroke: '#9A7448', 'stroke-width': '1.6' }),
  p('M16 12c2 3 14 3 16 0', { stroke: '#9A7448', 'stroke-width': '1.6', fill: 'none' }),
  p('M24 34c0-6 3-9 8-10-1 5-4 8-8 10z', { fill: '#6FA34E' }),
  p('M24 34c0-5-3-8-7-9 1 5 3 7 7 9z', { fill: '#82B85A' }),
  p('M24 34v4', { stroke: '#5E8C3E', 'stroke-width': '1.6' }),
];

/** Khung vẽ gọn của từng hình khi làm dấu 22 (artboard: sâu dời 2 4, cỏ `4 2 40 42`, bao `4 6 40 40`). */
export const MARK_VIEW = { sau: '2 4 48 48', co: '4 2 40 42', bon: '4 6 40 40' } as const;
