/**
 * Vẽ chữ / mục lên giấy cuộn sách Ngồi ôn trước mắt (R-ON-8; thiết kế 2026-11-14.21 `NgoiMat-on-*`, `-bien-the`): đầu cuộn
 * (dòng nơi · "Ngồi ôn" Lora · ấn son "Ôn"), vạch chấm vàng, 3 "dòng mực" (thường gạch chân · nổi bật vệt mực ngọc · mờ
 * nét đứt + lý do · nhấn viền vàng + quầng), dòng gợi ý, "Đứng dậy". Vẽ vào canvas (gắn làm `CanvasTexture` ở `ngoiMat.ts`)
 * — chỉ khi mục đổi / nhịp hiện chữ, không mỗi khung. Kèm nút ẩn cho đọc màn hình (`sitScrollItemLabel`).
 */
import { CUON_SEAL, CUON_TITLE, fitHint, HINT_PAD_Y, STAND_UP, type CuonLayout, type CuonRowId, type CuonView } from '../zones/cuonMuc';

/** Bề ngang ảnh giấy (px thật) — 1024 × 1378 (giấy 0,26 × 0,35), chữ nghiêng vẫn rõ (mipmap). */
export const PAPER_PX = 1024;

const PAPER = '#f2eada';
const SLATE = '#24323a';
const MUTED = '#5e6a70';
const JADE = '#2b5446';
const GOLD = '#d4a64a';
const LACQUER = '#a8322a';
const UI = '"Be Vietnam Pro", system-ui, sans-serif';
const HAN = '"Han Serif", "Noto Serif SC", serif';

const ICON: Record<CuonRowId, string[]> = {
  review: ['M20 11a8 8 0 0 0-14.6-4.5M4 4v3.5h3.5M4 13a8 8 0 0 0 14.6 4.5M20 20v-3.5h-3.5'],
  learn: ['M14.5 4.5l5 5L10 19l-5.5.5L5 14z'],
  learned: ['M5.5 4h3.5a1.5 1.5 0 0 1 1.5 1.5V9a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 9V5.5A1.5 1.5 0 0 1 5.5 4z', 'M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9a1.5 1.5 0 0 1-1.5 1.5H15A1.5 1.5 0 0 1 13.5 9V5.5A1.5 1.5 0 0 1 15 4z', 'M5.5 13.5h3.5a1.5 1.5 0 0 1 1.5 1.5v3.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5V15a1.5 1.5 0 0 1 1.5-1.5z', 'M15 13.5h3.5A1.5 1.5 0 0 1 20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15a1.5 1.5 0 0 1-1.5-1.5V15a1.5 1.5 0 0 1 1.5-1.5z'],
  stand: ['M12 19V7M7 12l5-5 5 5M5 21h14'],
};

export interface CuonPaintState {
  /** chữ mờ → rõ (0..1) */
  alpha: number;
  /** đang nhấn: viền vàng + quầng (0,15 s) */
  press: CuonRowId | null;
  /** vừa đóng màn: viền ngọc nhấp một lần (0,6 s) */
  flash: CuonRowId | null;
}

type Ctx = CanvasRenderingContext2D;

function icon(c: Ctx, id: CuonRowId, x: number, y: number, size: number, color: string): void {
  c.save();
  c.translate(x, y);
  c.scale(size / 24, size / 24);
  c.strokeStyle = color;
  c.lineWidth = 2.3;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  for (const d of ICON[id]) c.stroke(new Path2D(d));
  c.restore();
}

/** Chữ cắt "…" cho vừa `max` px. */
function fit(c: Ctx, s: string, max: number): string {
  if (c.measureText(s).width <= max) return s;
  let t = s;
  while (t.length > 1 && c.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

/** Nạp sẵn font chữ Việt cho canvas (canvas không tự kéo phần font tiếng Việt như DOM) — xong thì vẽ lại. */
export function loadCuonFonts(): Promise<unknown> {
  const vi = 'Ngồi ôn Đứng dậy ấầẩẫậắằẳẵặếềểễệốồổỗộớờởỡợứừửữự';
  return Promise.allSettled([
    document.fonts.load('700 18px Lora', vi),
    document.fonts.load(`700 16px ${UI}`, vi),
    document.fonts.load(`500 12px ${UI}`, vi),
  ]);
}

/** Vẽ cả mặt giấy vào `canvas` (đổi cỡ nếu cần). */
export function paintCuon(canvas: HTMLCanvasElement, l: CuonLayout, view: CuonView, st: CuonPaintState): void {
  const W = PAPER_PX;
  const H = Math.round((PAPER_PX * l.h) / l.w);
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const c = canvas.getContext('2d');
  if (!c) return;
  const k = W / l.w;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.fillStyle = PAPER;
  c.fillRect(0, 0, W, H);
  c.setTransform(k, 0, 0, k, 0, 0);
  // viền bồi: ngọc 12 % + gỗ 18 %
  c.strokeStyle = 'rgba(43,84,70,.12)';
  c.lineWidth = 4;
  c.strokeRect(2, 2, l.w - 4, l.h - 4);
  c.strokeStyle = 'rgba(58,36,24,.18)';
  c.lineWidth = 1;
  c.strokeRect(4.5, 4.5, l.w - 9, l.h - 9);
  c.globalAlpha = Math.max(0, Math.min(1, st.alpha));
  const ls = l.landscape;
  c.textBaseline = 'alphabetic';
  c.textAlign = 'left';

  // đầu cuộn
  const hd = l.header;
  const sealW = 22;
  c.font = `700 11px ${UI}`;
  c.fillStyle = MUTED;
  c.fillText(fit(c, view.place, hd.w - sealW - 10), hd.x, hd.y + 12);
  c.font = `700 ${ls ? 16 : 18}px Lora, Georgia, serif`;
  c.fillStyle = SLATE;
  c.fillText(CUON_TITLE, hd.x, hd.y + (ls ? 31 : 35));
  // ấn son "Ôn" chữ dọc (R-HUD-4)
  c.fillStyle = LACQUER;
  c.beginPath();
  c.roundRect(hd.x + hd.w - sealW, hd.y + 2, sealW, hd.h - 4, 3);
  c.fill();
  c.fillStyle = '#ffffff';
  c.font = `700 12px ${UI}`;
  c.textAlign = 'center';
  c.fillText(CUON_SEAL, hd.x + hd.w - sealW / 2, hd.y + hd.h / 2 + 4);
  c.textAlign = 'left';
  // vạch chấm vàng
  c.strokeStyle = 'rgba(58,36,24,.22)';
  c.lineWidth = 1;
  const mid = l.w / 2;
  c.beginPath();
  c.moveTo(hd.x, l.ruleY);
  c.lineTo(mid - 8, l.ruleY);
  c.moveTo(mid + 8, l.ruleY);
  c.lineTo(hd.x + hd.w, l.ruleY);
  c.stroke();
  c.fillStyle = GOLD;
  c.beginPath();
  c.arc(mid, l.ruleY, 2, 0, Math.PI * 2);
  c.fill();

  // các dòng mực
  view.rows.forEach((row, i) => {
    const b = l.rows[i];
    if (!b) return;
    const noi = row.look === 'noi';
    const mo = row.look === 'mo';
    if (noi) {
      const g = c.createLinearGradient(b.x, 0, b.x + b.w, 0);
      g.addColorStop(0, 'rgba(43,84,70,.92)');
      g.addColorStop(0.85, 'rgba(43,84,70,.82)');
      g.addColorStop(1, 'rgba(43,84,70,.55)');
      c.fillStyle = g;
      c.beginPath();
      c.roundRect(b.x, b.y, b.w, b.h, 4);
      c.fill();
    } else {
      c.strokeStyle = mo ? 'rgba(58,48,36,.3)' : 'rgba(58,48,36,.22)';
      c.lineWidth = 1.5;
      c.setLineDash(mo ? [4, 3] : []);
      c.beginPath();
      c.moveTo(b.x, b.y + b.h - 0.75);
      c.lineTo(b.x + b.w, b.y + b.h - 0.75);
      c.stroke();
      c.setLineDash([]);
    }
    const ink = noi ? '#ffffff' : mo ? MUTED : SLATE;
    const iconSize = ls ? 18 : 20;
    icon(c, row.id, b.x + 10, b.y + (b.h - iconSize) / 2, iconSize, noi ? '#ffffff' : mo ? MUTED : JADE);
    const tx = b.x + 10 + iconSize + 10;
    const maxW = b.x + b.w - 26 - tx;
    c.fillStyle = ink;
    c.globalAlpha = Math.max(0, Math.min(1, st.alpha)) * (mo ? 0.9 : 1);
    c.font = `700 ${ls ? 15 : 16}px ${UI}`;
    c.fillText(fit(c, row.title, maxW), tx, b.y + b.h / 2 - 2);
    c.globalAlpha = Math.max(0, Math.min(1, st.alpha));
    // dòng phụ (chữ Hán bộ thủ bằng font chữ Hán)
    let x = tx;
    const subY = b.y + b.h / 2 + 15;
    c.fillStyle = noi ? 'rgba(255,255,255,.88)' : MUTED;
    for (const part of row.sub) {
      c.font = part.han ? `700 ${ls ? 11.5 : 12}px ${HAN}` : `500 ${ls ? 11.5 : 12}px ${UI}`;
      const room = tx + maxW - x;
      if (room <= 8) break;
      const s = fit(c, part.text, room);
      c.fillText(s, x, subY);
      x += c.measureText(s).width;
    }
    if (!mo) {
      c.fillStyle = ink;
      c.font = `700 18px ${UI}`;
      c.fillText('›', b.x + b.w - 18, b.y + b.h / 2 + 6);
    }
    const ring = st.press === row.id ? GOLD : st.flash === row.id ? JADE : null;
    if (ring) {
      c.save();
      c.shadowColor = st.press === row.id ? 'rgba(212,166,74,.7)' : 'transparent';
      c.shadowBlur = 18;
      c.strokeStyle = ring;
      c.lineWidth = st.press === row.id ? 3 : 2;
      c.beginPath();
      c.roundRect(b.x + 1.5, b.y + 1.5, b.w - 3, b.h - 3, 4);
      c.stroke();
      c.restore();
    }
  });

  // dòng gợi ý chưa học: chữ ngọc 12, vạch trái 3, nền ngọc 8 % — cả bề ngang dưới mục, đủ mọi dòng (V-43: không cắt)
  if (view.hint) {
    const hb = l.hint;
    const font = (size: number): string => `500 ${size}px ${UI}`;
    const fitted = fitHint(view.hint, hb, ls ? 11 : 12, (s, size) => {
      c.font = font(size);
      return c.measureText(s).width;
    });
    c.font = font(fitted.size);
    const boxH = fitted.lines.length * fitted.lineH + HINT_PAD_Y;
    c.fillStyle = 'rgba(43,84,70,.08)';
    c.fillRect(hb.x, hb.y, hb.w, boxH);
    c.fillStyle = JADE;
    c.fillRect(hb.x, hb.y, 3, boxH);
    fitted.lines.forEach((s, i) => c.fillText(s, hb.x + 9, hb.y + HINT_PAD_Y / 2 + (i + 1) * fitted.lineH - 3));
  }

  // "Đứng dậy": biểu tượng 16 + 14/700, gạch chân mực 45 %
  const sb = l.stand;
  c.font = `700 14px ${UI}`;
  const tw = c.measureText(STAND_UP).width;
  const sx = sb.x + sb.w - tw - 8;
  icon(c, 'stand', sx - 22, sb.y + sb.h / 2 - 8, 16, SLATE);
  c.fillStyle = SLATE;
  c.fillText(STAND_UP, sx, sb.y + sb.h / 2 + 5);
  c.strokeStyle = 'rgba(58,48,36,.45)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(sx - 30, sb.y + sb.h - 1);
  c.lineTo(sb.x + sb.w, sb.y + sb.h - 1);
  c.stroke();
  if (st.press === 'stand') {
    c.save();
    c.shadowColor = 'rgba(212,166,74,.7)';
    c.shadowBlur = 18;
    c.strokeStyle = GOLD;
    c.lineWidth = 3;
    c.beginPath();
    c.roundRect(sx - 34, sb.y + 2, sb.x + sb.w - sx + 34, sb.h - 4, 4);
    c.stroke();
    c.restore();
  }
  c.globalAlpha = 1;
  c.setTransform(1, 0, 0, 1, 0, 0);
}

/** Nút ẩn đọc được cho từng mục trên cuộn 3D (trợ năng — cuộn không có nút DOM thật). */
export class CuonA11y {
  private readonly root = document.createElement('div');

  constructor(private readonly onPick: (id: CuonRowId) => void) {
    this.root.className = 'sr-only';
    this.root.setAttribute('role', 'group');
    this.root.setAttribute('aria-label', 'Cuộn sách Ngồi ôn');
    this.root.hidden = true;
    document.body.append(this.root);
  }

  set(view: CuonView | null): void {
    this.root.replaceChildren();
    this.root.hidden = !view;
    if (!view) return;
    const add = (id: CuonRowId, label: string, enabled: boolean): void => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `${label}, trên cuộn sách`;
      b.disabled = !enabled;
      b.addEventListener('click', () => this.onPick(id));
      this.root.append(b);
    };
    for (const r of view.rows) add(r.id, r.title, r.look !== 'mo');
    add('stand', STAND_UP, true);
  }
}
