/**
 * Vẽ mặt giấy cuộn Tĩnh toạ trước mắt (R-ON-8; thiết kế 2026-11-16.12 "Cuộn Tĩnh toạ", artboard `Cuon-*`): đầu cuộn
 * (dòng nơi · "Tĩnh toạ" Lora · ấn son "Tĩnh" · viên "Đứng dậy" góc trên phải), vạch chấm vàng, một hàng 4 ô kiểu triện gỗ
 * khảm (hình nét mực + tên + dòng phụ; thường · mờ nét đứt · "Sắp có" · nhấn viền ngọc + quầng vàng · vừa cập nhật viền
 * vàng + ✓), chấm son trên ô Nhiệm vụ, dòng gợi ý chưa học. Vẽ vào canvas (gắn làm `CanvasTexture` ở `ngoiMat.ts`) — chỉ
 * khi ô đổi / nhịp hiện chữ, không mỗi khung. Kèm nút ẩn cho đọc màn hình (chuỗi `scrollTileLabel`; ô "Sắp có" không đọc).
 */
import {
  cuonA11yItems,
  CUON_SEAL,
  CUON_TITLE,
  fitHint,
  HINT_PAD_Y,
  STAND_UP,
  type CuonBox,
  type CuonLayout,
  type CuonRowId,
  type CuonTile,
  type CuonView,
} from '../zones/cuonMuc';
import { standIcon, tileIcon } from './cuonMucHinh';

/** Bề ngang ảnh giấy (px thật) — 1024 × 576 (giấy 0,48 × 0,27), chữ nghiêng vẫn rõ (mipmap). */
export const PAPER_PX = 1024;

// token (design/tokens/design_tokens.json): map-paper · slate · slate-muted · jade · gold · lacquer
const PAPER = '#f2eada';
const SLATE = '#24323a';
const MUTED = '#5e6a70';
const JADE = '#2b5446';
const GOLD = '#d4a64a';
const LACQUER = '#a8322a';
const UI = '"Be Vietnam Pro", system-ui, sans-serif';
const SERIF = 'Lora, Georgia, serif';

export interface CuonPaintState {
  /** chữ mờ → rõ (0..1) */
  alpha: number;
  /** đang nhấn: viền ngọc + quầng vàng, co 97 % (0,15 s) */
  press: CuonRowId | null;
  /** vừa đóng màn: viền vàng + ✓ nhấp một lần (0,6 s) */
  flash: CuonRowId | null;
}

type Ctx = CanvasRenderingContext2D;

/** Chữ cắt "…" cho vừa `max` px. */
function fit(c: Ctx, s: string, max: number): string {
  if (c.measureText(s).width <= max) return s;
  let t = s;
  while (t.length > 1 && c.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

/** Gói chữ ô tối đa 2 dòng (dòng 2 cắt "…") — tên ô và dòng phụ (artboard: chữ xuống dòng, không cắt giữa từ). */
function twoLines(c: Ctx, s: string, max: number): string[] {
  if (c.measureText(s).width <= max) return [s];
  const words = s.split(' ');
  let first = words[0] ?? '';
  let i = 1;
  while (i < words.length && c.measureText(`${first} ${words[i]}`).width <= max) first = `${first} ${words[i++]}`;
  const rest = words.slice(i).join(' ');
  return rest ? [fit(c, first, max), fit(c, rest, max)] : [fit(c, first, max)];
}

/** Nạp sẵn font chữ Việt cho canvas (canvas không tự kéo phần font tiếng Việt như DOM) — xong thì vẽ lại. */
export function loadCuonFonts(): Promise<unknown> {
  const vi = 'Tĩnh toạ Đứng dậy Đọc sách Bộ đã học Nhiệm vụ hôm nay Sắp có ấầẩẫậắằẳẵặếềểễệốồổỗộớờởỡợứừửữự';
  return Promise.allSettled([
    document.fonts.load(`700 18px ${SERIF}`, vi),
    document.fonts.load(`700 16px ${UI}`, vi),
    document.fonts.load(`500 12px ${UI}`, vi),
  ]);
}

function roundBox(c: Ctx, b: CuonBox, r: number): void {
  c.beginPath();
  c.roundRect(b.x, b.y, b.w, b.h, r);
}

/** Một ô: nền + viền theo trạng thái, hình, tên (≤ 2 dòng), dòng phụ (1 dòng), chấm son / ✓. */
function paintTile(c: Ctx, l: CuonLayout, b0: CuonBox, t: CuonTile, st: CuonPaintState): void {
  const ty = l.type;
  const press = st.press === t.id;
  const flash = !press && st.flash === t.id;
  const k = press ? 0.97 : 1;
  const b = { x: b0.x + (b0.w * (1 - k)) / 2, y: b0.y + (b0.h * (1 - k)) / 2, w: b0.w * k, h: b0.h * k };
  c.save();
  // quầng ngoài (nhấn: vàng 45 % 4 px · vừa cập nhật: vàng 30 % 3 px)
  if (press || flash) {
    const g = press ? 4 : 3;
    c.fillStyle = press ? 'rgba(212,166,74,.45)' : 'rgba(212,166,74,.3)';
    roundBox(c, { x: b.x - g, y: b.y - g, w: b.w + g * 2, h: b.h + g * 2 }, 8 + g);
    c.fill();
  }
  c.fillStyle = PAPER;
  if (press || flash) {
    roundBox(c, b, 8);
    c.fill();
  }
  c.fillStyle =
    t.look === 'sap' ? 'transparent' : press ? 'rgba(43,84,70,.14)' : flash ? 'rgba(212,166,74,.16)' : t.look === 'mo' ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.42)';
  if (t.look === 'thuong' && !press) {
    c.shadowColor = 'rgba(58,36,24,.12)';
    c.shadowBlur = 4;
    c.shadowOffsetY = 2;
  }
  roundBox(c, b, 8);
  c.fill();
  c.shadowColor = 'transparent';
  c.strokeStyle = press ? JADE : flash ? GOLD : t.look === 'thuong' ? 'rgba(58,36,24,.35)' : t.look === 'mo' ? 'rgba(58,48,36,.35)' : 'rgba(58,48,36,.3)';
  c.lineWidth = press ? 2 : 1.5;
  c.setLineDash(t.look === 'thuong' || press || flash ? [] : [4, 3]);
  roundBox(c, { x: b.x + c.lineWidth / 2, y: b.y + c.lineWidth / 2, w: b.w - c.lineWidth, h: b.h - c.lineWidth }, 8);
  c.stroke();
  c.setLineDash([]);
  if (t.look === 'thuong' && !press) {
    c.strokeStyle = 'rgba(255,255,255,.6)'; // ánh sáng mép trên trong ô
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(b.x + 6, b.y + 2.5);
    c.lineTo(b.x + b.w - 6, b.y + 2.5);
    c.stroke();
  }

  // nội dung căn giữa: hình · 4 · tên · 4 · dòng phụ
  const maxW = b.w - 8 * k;
  c.font = `700 ${ty.tileName * k}px ${UI}`;
  const names = twoLines(c, t.title, maxW);
  const nameH = ty.tileName * 1.2 * k;
  c.font = `500 ${ty.tileSub * k}px ${UI}`;
  const subs = t.sub ? twoLines(c, t.sub, maxW) : [];
  const subH = ty.tileSub * 1.25 * k;
  // chật (tên 2 dòng + lý do 2 dòng): hình nhỏ lại cho vừa ô, chữ giữ cỡ
  const textH = names.length * nameH + (subs.length ? 4 * k + subs.length * subH : 0);
  const icon = Math.min(ty.icon * k, b.h - 8 - 4 * k - textH);
  const gap = 4 * k;
  const total = icon + gap + textH;
  let y = b.y + (b.h - total) / 2;
  const cx = b.x + b.w / 2;
  tileIcon(c, t, cx - icon / 2, y, icon);
  y += icon + gap;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = t.look === 'thuong' || press || flash ? SLATE : MUTED;
  c.font = `700 ${ty.tileName * k}px ${UI}`;
  for (const s of names) {
    c.fillText(s, cx, y + nameH / 2);
    y += nameH;
  }
  if (subs.length) {
    y += gap;
    c.font = `500 ${ty.tileSub * k}px ${UI}`;
    c.fillStyle = MUTED;
    for (const s of subs) {
      c.fillText(s, cx, y + subH / 2);
      y += subH;
    }
  }
  // chấm son (số việc còn lại) · ✓ khi vừa cập nhật
  if (flash) {
    const r = 8;
    const ox = b.x + b.w - 6 - r;
    const oy = b.y + 6 + r;
    c.fillStyle = JADE;
    c.beginPath();
    c.arc(ox, oy, r, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.translate(ox - 5, oy - 5);
    c.scale(10 / 24, 10 / 24);
    c.strokeStyle = '#ffffff';
    c.lineWidth = 3.5;
    c.lineCap = 'round';
    c.stroke(new Path2D('M5 12l5 5 9-10'));
    c.restore();
  } else if (t.badge !== null) {
    const s = t.badge >= 100 ? '99+' : String(t.badge);
    c.font = `700 10px ${UI}`;
    const bw = Math.max(18, c.measureText(s).width + 10);
    const bx = b.x + b.w - 5 - bw;
    const by = b.y + 5;
    c.fillStyle = LACQUER;
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.5;
    roundBox(c, { x: bx, y: by, w: bw, h: 18 }, 9);
    c.fill();
    c.stroke();
    c.fillStyle = '#ffffff';
    c.fillText(s, bx + bw / 2, by + 9.5);
  }
  c.restore();
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
  const ty = l.type;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.fillStyle = PAPER;
  c.fillRect(0, 0, W, H);
  c.setTransform(k, 0, 0, k, 0, 0);
  // viền bồi: ngọc 12 % + gỗ 18 %; thớ giấy dọc mờ ở 1/4, 1/2, 3/4
  c.strokeStyle = 'rgba(43,84,70,.12)';
  c.lineWidth = 4;
  c.strokeRect(2, 2, l.w - 4, l.h - 4);
  c.strokeStyle = 'rgba(58,36,24,.18)';
  c.lineWidth = 1;
  c.strokeRect(4.5, 4.5, l.w - 9, l.h - 9);
  c.fillStyle = 'rgba(58,36,24,.07)';
  for (const f of [0.25, 0.5, 0.75]) c.fillRect(l.w * f, 5, 1, l.h - 10);
  c.globalAlpha = Math.max(0, Math.min(1, st.alpha));
  c.textBaseline = 'alphabetic';
  c.textAlign = 'left';

  // đầu cuộn: dòng nơi (trên) · "Tĩnh toạ" + ấn son "Tĩnh" (dưới) — bên trái viên "Đứng dậy"
  const hd = l.header;
  const sb = l.stand;
  const left = sb.x - hd.x - 8;
  c.font = `700 ${ty.place}px ${UI}`;
  c.fillStyle = MUTED;
  c.fillText(fit(c, view.place, left), hd.x, hd.y + hd.h / 2 - 3);
  c.font = `700 ${ty.title}px ${SERIF}`;
  c.fillStyle = SLATE;
  const titleY = hd.y + hd.h / 2 + ty.title * 0.95;
  c.fillText(CUON_TITLE, hd.x, titleY);
  const sealX = hd.x + c.measureText(CUON_TITLE).width + 6;
  c.font = `700 ${ty.seal}px ${UI}`;
  const sealW = c.measureText(CUON_SEAL).width + 10;
  const sealH = ty.seal + 4;
  c.fillStyle = LACQUER;
  roundBox(c, { x: sealX, y: titleY - ty.title * 0.72 - 2, w: sealW, h: sealH }, 3);
  c.fill();
  c.fillStyle = '#ffffff';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(CUON_SEAL, sealX + sealW / 2, titleY - ty.title * 0.72 - 2 + sealH / 2 + 0.5);

  // "Đứng dậy": viên viền mực 45 % 1,5, nền trắng 40 %, biểu tượng 14 + chữ 700 — sát phải ô `stand`
  c.font = `700 ${ty.stand}px ${UI}`;
  const tw = c.measureText(STAND_UP).width;
  const pw = Math.min(sb.w, 10 + 14 + 5 + tw + 10);
  const px = sb.x + sb.w - pw;
  if (st.press === 'stand') {
    c.fillStyle = 'rgba(212,166,74,.45)';
    roundBox(c, { x: px - 4, y: sb.y - 4, w: pw + 8, h: sb.h + 8 }, sb.h / 2 + 4);
    c.fill();
  }
  c.fillStyle = st.press === 'stand' ? '#eef0ea' : 'rgba(255,255,255,.4)';
  c.strokeStyle = 'rgba(58,48,36,.45)';
  c.lineWidth = 1.5;
  roundBox(c, { x: px + 0.75, y: sb.y + 0.75, w: pw - 1.5, h: sb.h - 1.5 }, sb.h / 2);
  c.fill();
  c.stroke();
  standIcon(c, px + 10, sb.y + sb.h / 2 - 7, 14);
  c.fillStyle = SLATE;
  c.textAlign = 'left';
  c.fillText(STAND_UP, px + 10 + 14 + 5, sb.y + sb.h / 2 + 0.5);

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

  // hàng 4 ô
  view.tiles.forEach((t, i) => {
    const b = l.tiles[i];
    if (b) paintTile(c, l, b, t, st);
  });

  // dòng gợi ý chưa học: chữ mực căn giữa, cả bề ngang dưới hàng ô, đủ mọi dòng (không cắt)
  if (view.hint) {
    const hb = l.hint;
    const font = (size: number): string => `500 ${size}px ${UI}`;
    const fitted = fitHint(view.hint, hb, ty.hint, (s, size) => {
      c.font = font(size);
      return c.measureText(s).width;
    });
    c.font = font(fitted.size);
    c.fillStyle = SLATE;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    fitted.lines.forEach((s, i) => c.fillText(s, hb.x + hb.w / 2, hb.y + HINT_PAD_Y / 2 + (i + 0.5) * fitted.lineH));
  }
  c.globalAlpha = 1;
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.setTransform(1, 0, 0, 1, 0, 0);
}

/** Nút ẩn đọc được cho từng ô trên cuộn 3D (trợ năng — cuộn không có nút DOM thật). Ô "Sắp có" không có nút. */
export class CuonA11y {
  private readonly root = document.createElement('div');

  constructor(private readonly onPick: (id: CuonRowId) => void) {
    this.root.className = 'sr-only';
    this.root.setAttribute('role', 'group');
    this.root.setAttribute('aria-label', `Cuộn ${CUON_TITLE}`);
    this.root.hidden = true;
    document.body.append(this.root);
  }

  set(view: CuonView | null): void {
    this.root.replaceChildren();
    this.root.hidden = !view;
    if (!view) return;
    for (const it of cuonA11yItems(view)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.label;
      b.disabled = !it.enabled;
      b.addEventListener('click', () => this.onPick(it.id));
      this.root.append(b);
    }
  }
}
