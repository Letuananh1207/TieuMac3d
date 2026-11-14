/**
 * Bộ biểu tượng bản đồ vùng (thiết kế 2026-11-14.20, `BanDoVung-nho-trang-thai`): đĩa giấy viền mực + hình vẽ trong ô 24,
 * vẽ lên Canvas 2D bằng `Path2D` (chuỗi path SVG chép từ artboard). Dùng chung cho bản đồ nhỏ, bản đồ lớn, chú giải.
 * Không chữ Hán (R-HUD-4): bàn Đấu chữ vẽ ô giấy viền ngọc + dấu hỏi thay chữ 字 của artboard.
 */
import type { IconKind } from '../zones/areaMap';

export const MAP_INK = '#3a3024';
const ink = (a: number): string => `rgba(58,48,36,${a})`;
export const MAP_PAPER = '#f2eada';
const DISC = '#f7f1e4';
const JADE = '#2b5446';
const GOLD = '#d4a64a';
const LACQUER = '#a8322a';

type Ctx = CanvasRenderingContext2D;

const paths = new Map<string, Path2D>();
const P = (d: string): Path2D => {
  let p = paths.get(d);
  if (!p) paths.set(d, (p = new Path2D(d)));
  return p;
};

function stroke(c: Ctx, d: string, color: string, w: number, join: CanvasLineJoin = 'miter'): void {
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineJoin = join;
  c.stroke(P(d));
}

function fill(c: Ctx, d: string, color: string): void {
  c.fillStyle = color;
  c.fill(P(d));
}

function circle(c: Ctx, x: number, y: number, r: number, f: string | null, s?: string, w = 1): void {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (f) {
    c.fillStyle = f;
    c.fill();
  }
  if (s) {
    c.strokeStyle = s;
    c.lineWidth = w;
    c.stroke();
  }
}

function rect(c: Ctx, x: number, y: number, w: number, h: number, r: number, f: string, s: string, sw: number): void {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = f;
  c.fill();
  c.strokeStyle = s;
  c.lineWidth = sw;
  c.stroke();
}

/** Hình vẽ trong ô 24 × 24 (toạ độ artboard). */
const GLYPH: Record<IconKind, (c: Ctx) => void> = {
  'vong-tran': (c) => {
    circle(c, 12, 12, 8, null, JADE, 2);
    circle(c, 12, 12, 4, null, JADE, 1.4);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      circle(c, 12 + 8 * Math.cos(a), 12 + 8 * Math.sin(a), 1.6, GOLD);
    }
  },
  'cong-canh': (c) => {
    stroke(c, 'M5 20V10L12 5l7 5v10', ink(0.85), 2, 'round');
    stroke(c, 'M3 10h18', ink(0.85), 2);
    fill(c, 'M9.5 20v-5h5v5', ink(0.85));
  },
  'son-mon': (c) => GLYPH['cong-canh'](c),
  'ban-co': (c) => {
    rect(c, 4, 4, 16, 16, 2, '#e7d6b4', ink(0.85), 1.6);
    stroke(c, 'M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16', ink(0.5), 1);
    circle(c, 9.3, 9.3, 2.4, '#1e2226');
    circle(c, 14.7, 14.7, 2.4, '#ffffff', ink(0.6), 1);
  },
  'ban-dau-chu': (c) => {
    rect(c, 4, 4, 16, 16, 2, MAP_PAPER, JADE, 1.8);
    stroke(c, 'M9.4 9.6a2.7 2.7 0 1 1 3.9 2.4c-.9.5-1.3 1-1.3 2', JADE, 1.8, 'round');
    circle(c, 12, 16.6, 1.1, JADE);
  },
  'tap-hoa': (c) => {
    c.fillStyle = LACQUER;
    c.fill(P('M4 9l2-4h12l2 4'));
    stroke(c, 'M4 9l2-4h12l2 4', ink(0.85), 1.4, 'round');
    fill(c, 'M4 9h16v2a2.6 2.6 0 0 1-5.3 0 2.6 2.6 0 0 1-5.4 0A2.6 2.6 0 0 1 4 11z', DISC);
    stroke(c, 'M4 9h16v2a2.6 2.6 0 0 1-5.3 0 2.6 2.6 0 0 1-5.4 0A2.6 2.6 0 0 1 4 11z', ink(0.85), 1.4);
    stroke(c, 'M6 13v6h12v-6', ink(0.85), 1.6);
  },
  'tu-hoc': (c) => {
    c.beginPath();
    c.roundRect(5, 13, 14, 5, 2);
    c.fillStyle = LACQUER;
    c.fill();
    circle(c, 12, 7, 2.6, ink(0.85));
    fill(c, 'M8 13c1-3 7-3 8 0', ink(0.85));
  },
  'cho-ngoi': (c) => GLYPH['tu-hoc'](c),
  'bang-nhiem-vu': (c) => {
    rect(c, 4, 4, 16, 12, 1.5, DISC, ink(0.85), 1.6);
    stroke(c, 'M7 8h10M7 11h7', ink(0.6), 1.4);
    stroke(c, 'M7 16v5M17 16v5', ink(0.85), 1.8);
  },
};

/** Biểu tượng tâm (x, y), cỡ `size` px (bản đồ nhỏ 15, dấu mép 13, bản đồ lớn 22, chú giải 16): đĩa giấy + hình. */
export function drawMapIcon(c: Ctx, kind: IconKind, x: number, y: number, size: number): void {
  circle(c, x, y, size * 0.62, DISC, ink(0.55), 1);
  c.save();
  c.translate(x - size / 2, y - size / 2);
  c.scale(size / 24, size / 24);
  GLYPH[kind](c);
  c.restore();
}

/** Mũi tên "mình" (thiết kế: mũi `jade` viền trắng 2 trong quầng `jade` 18 % r 11); `angle` radian, 0 = lên. */
export function drawMe(c: Ctx, x: number, y: number, angle: number, scale: number, ring = false): void {
  c.save();
  c.translate(x, y);
  if (ring) circle(c, 0, 0, 16, null, GOLD, 2);
  c.rotate(angle);
  c.scale(scale, scale);
  circle(c, 0, 0, 11, 'rgba(43,84,70,.18)');
  c.fillStyle = JADE;
  c.fill(P('M0 -10 L7 7 L0 3.5 L-7 7 Z'));
  stroke(c, 'M0 -10 L7 7 L0 3.5 L-7 7 Z', '#ffffff', 2, 'round');
  c.restore();
}

/** Dấu mép bản đồ nhỏ: mũi tam giác `jade` chỉ ra ngoài (góc `angle`) + biểu tượng 13. */
export function drawEdgeMark(c: Ctx, kind: IconKind, x: number, y: number, angle: number): void {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.fillStyle = JADE;
  c.fill(P('M0 -12 L5 -6 L-5 -6 Z'));
  c.restore();
  drawMapIcon(c, kind, x, y, 13);
}

/** Chú giải: biểu tượng 16 trên canvas nhỏ (DOM). */
export function legendIcon(kind: IconKind, dpr: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = cv.height = Math.round(18 * dpr);
  cv.style.width = cv.style.height = '18px';
  cv.setAttribute('aria-hidden', 'true');
  const c = cv.getContext('2d');
  if (c) {
    c.scale(dpr, dpr);
    drawMapIcon(c, kind, 9, 9, 16);
  }
  return cv;
}
