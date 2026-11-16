/**
 * Hình nét mực trên cuộn Tĩnh toạ (thiết kế 2026-11-16.12, SVG trong artboard `Cuon-1-tran-doc`): bìa sổ từ mini, bó thẻ
 * tre buộc dây son, bảng gỗ treo, vòng "Sắp có", mũi tên "Đứng dậy". Vẽ bằng canvas 2D (`cuonMucPaint.ts`).
 */
import type { CuonTile } from '../zones/cuonMuc';

// token: slate · slate-muted · jade · gold · lacquer
const SLATE = '#24323a';
const MUTED = '#5e6a70';
const JADE = '#2b5446';
const GOLD = '#d4a64a';
const LACQUER = '#a8322a';
const SERIF = 'Lora, Georgia, serif';

type Ctx = CanvasRenderingContext2D;

/** Hình ô (viewBox 40 — artboard `Cuon-1-tran-doc`), vẽ ở (x, y) cỡ `size`. */
export function tileIcon(c: Ctx, t: CuonTile, x: number, y: number, size: number): void {
  const mo = t.look === 'mo';
  c.save();
  c.translate(x, y);
  c.scale(size / 40, size / 40);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const rr = (rx: number, ry: number, w: number, h: number, r: number): void => {
    c.beginPath();
    c.roundRect(rx, ry, w, h, r);
  };
  if (t.id === 'book') {
    // bìa mini: ngọc (mờ: xám 50 %), gáy tối, khung chỉ vàng, số cấp
    c.globalAlpha *= mo ? 0.5 : 1;
    c.fillStyle = mo ? MUTED : JADE;
    rr(9, 4, 22, 31, 2);
    c.fill();
    c.globalAlpha /= mo ? 0.5 : 1;
    c.fillStyle = 'rgba(0,0,0,.2)';
    c.fillRect(9, 4, 4, 31);
    c.strokeStyle = GOLD;
    c.lineWidth = 1;
    c.strokeRect(15, 8, 13, 23);
    c.fillStyle = '#ffffff';
    c.font = `700 11px ${SERIF}`;
    c.textAlign = 'center';
    c.fillText(t.mark ?? '1', 21.5, 24);
  } else if (t.id === 'learned') {
    // bó thẻ tre buộc dây son
    if (mo) c.globalAlpha *= 0.45;
    c.strokeStyle = SLATE;
    c.lineWidth = 2;
    c.fillStyle = '#e6d6b4';
    for (const sx of [6, 13, 20, 27]) {
      rr(sx, 7, 5.5, 26, 2);
      c.fill();
      c.stroke();
    }
    c.strokeStyle = LACQUER;
    c.lineWidth = 1.6;
    c.stroke(new Path2D('M4 15 q16 -3 32 0 M4 26 q16 -3 32 0'));
  } else if (t.id === 'daily') {
    // bảng gỗ treo
    if (mo) c.globalAlpha *= 0.45;
    c.strokeStyle = SLATE;
    c.lineWidth = 2;
    c.stroke(new Path2D('M10 30v7M30 30v7'));
    c.fillStyle = '#c99a6b';
    rr(5, 6, 30, 24, 2);
    c.fill();
    c.stroke();
    c.stroke(new Path2D('M5 6 l15 -3 l15 3'));
    c.lineWidth = 1.6;
    c.stroke(new Path2D('M10 14h20M10 19h14M10 24h17'));
  } else {
    // "Sắp có": vòng nét đứt + dấu cộng
    c.strokeStyle = MUTED;
    c.lineWidth = 1.8;
    c.setLineDash([3, 3]);
    c.beginPath();
    c.arc(20, 20, 13, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    c.stroke(new Path2D('M20 14v12M14 20h12'));
  }
  c.restore();
}

/** Biểu tượng "Đứng dậy" (viewBox 24). */
export function standIcon(c: Ctx, x: number, y: number, size: number): void {
  c.save();
  c.translate(x, y);
  c.scale(size / 24, size / 24);
  c.strokeStyle = SLATE;
  c.lineWidth = 2.4;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.stroke(new Path2D('M12 19V7M7 12l5-5 5 5M5 21h14'));
  c.restore();
}
