/**
 * Ô in trên cuộn Tĩnh toạ khi ngồi trước mắt (R-ON-8 — bảng chọn chức năng; thiết kế 2026-11-16.12 "Cuộn Tĩnh toạ",
 * artboard `Cuon-*`): giấy trải ngang 16 : 9, đầu cuộn (dòng nơi · "Tĩnh toạ" · ấn son "Tĩnh" · "Đứng dậy" góc trên phải),
 * một hàng 4 ô **Đọc sách · Bộ đã học · Nhiệm vụ hôm nay · Sắp có**, dòng gợi ý khi chưa học bộ nào; vùng chạm theo (u, v)
 * trên giấy. Thuần — không three, không DOM; vẽ ở `ui/cuonMucPaint.ts`. Ấn son chỉ chữ Việt (R-HUD-4).
 */
import { RADICALS, type Radical } from './radicals';
import type { ScrollItem, ScrollItemId } from './studyMenu';
import { placeName } from './journeyMap';

/** vùng học bộ thủ: tên lấy từ bản đồ (R-HANH-1), không viết cứng */
const FOREST = placeName('rung-truc');

/** Thứ chạm được trên cuộn: 3 ô chức năng + "Đứng dậy" (ô "Sắp có" không chạm — R-ON-8). */
export type CuonRowId = ScrollItemId | 'stand';
export type CuonTileId = ScrollItemId | 'soon';
/** thường · mờ (lý do ở dòng phụ, chạm không mở) · "Sắp có" (nét đứt, không chạm, không đọc màn hình) */
export type CuonTileLook = 'thuong' | 'mo' | 'sap';

export interface CuonTile {
  id: CuonTileId;
  look: CuonTileLook;
  title: string;
  /** dòng phụ 1 dòng ("HSK 1 · Nhập môn", "5 / 50 bộ", "Còn 1 việc"; mờ = lý do); "Sắp có" = '' */
  sub: string;
  /** chấm son góc trên phải ô (ô Nhiệm vụ: số việc còn lại; 0 / không biết → `null`) */
  badge: number | null;
  /** ô Đọc sách: số cấp in trên bìa mini ("1" của "HSK 1") */
  mark?: string;
}

export interface CuonView {
  /** dòng nơi đang ngồi ("Khởi Nguyên Trấn · Quảng Trường") */
  place: string;
  /** đúng 4 ô, theo thứ tự trên giấy */
  tiles: CuonTile[];
  /** chưa học bộ nào → dòng gợi ý gặp Trúc Lão */
  hint: string | null;
}

/** chuỗi `reviewScroll`, `reviewScrollSeal`, `standUp`, `scrollSoon`, `hintGoForest` (design/l10n/vi.arb) */
export const CUON_TITLE = 'Tĩnh toạ';
export const CUON_SEAL = 'Tĩnh';
export const STAND_UP = 'Đứng dậy';
export const CUON_SOON = 'Sắp có';
export const CUON_HINT = `Chưa học bộ nào. Sang ${FOREST}, gặp Trúc Lão ở bãi hạc đáp để học bộ đầu tiên.`;

/** Ô trên cuộn từ bảng chọn (`scrollMenu`) + sổ từ đang mượn; thêm ô "Sắp có" cuối hàng. */
export function cuonView(
  items: readonly ScrollItem[],
  place: string,
  book: { title: string; subtitle: string } | null,
  pool: readonly Radical[] = RADICALS,
): CuonView {
  const tiles = items.map((it): CuonTile => {
    const look: CuonTileLook = it.enabled ? 'thuong' : 'mo';
    if (it.id === 'book')
      return { id: 'book', look, title: 'Đọc sách', sub: it.enabled && book ? `${book.title} · ${book.subtitle}` : 'Mượn ở Tàng Thư Các', badge: null, mark: /\d+/.exec(book?.title ?? '')?.[0] ?? '1' };
    if (it.id === 'learned')
      return { id: 'learned', look, title: 'Bộ đã học', sub: it.enabled ? `${it.count ?? 0} / ${pool.length} bộ` : 'Chưa học bộ nào', badge: null };
    const n = it.count;
    return {
      id: 'daily',
      look,
      title: 'Nhiệm vụ hôm nay',
      sub: n === null ? 'Xem việc hôm nay' : n > 0 ? `Còn ${n} việc` : 'Đã xong hôm nay',
      badge: n !== null && n > 0 ? n : null,
    };
  });
  tiles.push({ id: 'soon', look: 'sap', title: CUON_SOON, sub: '', badge: null });
  const none = items.find((i) => i.id === 'learned')?.enabled === false; // chưa học bộ nào
  return { place, tiles, hint: none ? CUON_HINT : null };
}

/** Hộp (px thiết kế, gốc góc trên trái giấy). */
export interface CuonBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Cỡ chữ / hình theo hướng màn (px thiết kế — artboard `Cuon-1-tran-doc` / `-ngang`). */
export interface CuonType {
  place: number;
  title: number;
  seal: number;
  stand: number;
  tileName: number;
  tileSub: number;
  icon: number;
  hint: number;
}

export interface CuonLayout {
  landscape: boolean;
  /** cỡ giấy (px thiết kế) */
  w: number;
  h: number;
  pad: { top: number; side: number; bottom: number };
  /** đầu cuộn (dòng nơi + "Tĩnh toạ" + ấn son; "Đứng dậy" bên phải) */
  header: CuonBox;
  /** vạch chấm vàng (tâm y) */
  ruleY: number;
  /** 4 ô một hàng */
  tiles: CuonBox[];
  hint: CuonBox;
  /** nút "Đứng dậy" (hình viên) */
  stand: CuonBox;
  /** vùng chạm "Đứng dậy" — 48 × 48 (token `size.scroll-stand-hit`), tràn lên mép trên giấy */
  standHit: CuonBox;
  type: CuonType;
}

/** Tỉ lệ giấy cao / rộng (0,27 / 0,48 m = 9 : 16 — `scene/cuonSachNhip.ts` `CUON_GIAY_*`). */
export const PAPER_RATIO = 0.27 / 0.48;
/** token `size.scroll-tile` (ô cao, dọc; ngang 128) · `size.scroll-stand-hit` */
export const TILE_H = { doc: 98, ngang: 128 } as const;
export const STAND_HIT = 48;

/**
 * Bố cục giấy (thiết kế 2026-11-16.12, artboard `Cuon-*`): dọc **352 × 198** (đệm 8 / 10, đầu 36, cách 5, ô 77 × 98 cách 8)
 * · ngang **464 × 261** (đệm 12 / 14, đầu 42, cách 7, ô ~102 × 128 cách 10). "Đứng dậy" viên cao 32 / 36 bên phải đầu cuộn,
 * vùng chạm 48 × 48 tràn lên mép trên. Dòng gợi ý cả bề ngang dưới hàng ô.
 */
export function cuonLayout(landscape: boolean): CuonLayout {
  const w = landscape ? 464 : 352;
  const h = Math.round(w * PAPER_RATIO);
  const pad = landscape ? { top: 12, side: 14, bottom: 12 } : { top: 8, side: 10, bottom: 8 };
  const headH = landscape ? 42 : 36;
  const gap = landscape ? 7 : 5;
  const tileGap = landscape ? 10 : 8;
  const tileH = landscape ? TILE_H.ngang : TILE_H.doc;
  const inner = w - pad.side * 2;
  const header = { x: pad.side, y: pad.top, w: inner, h: headH };
  const ruleY = header.y + headH + gap + 2;
  const top = ruleY + 2 + gap;
  const tileW = (inner - tileGap * 3) / 4;
  const tiles = [0, 1, 2, 3].map((i) => ({ x: pad.side + i * (tileW + tileGap), y: top, w: tileW, h: tileH }));
  const standH = landscape ? 36 : 32;
  const standW = landscape ? 104 : 96;
  const stand = { x: w - pad.side - standW, y: header.y + (headH - standH) / 2, w: standW, h: standH };
  // vùng chạm: rộng thêm 6 mỗi bên, đáy thêm 6, cao đủ 48 tính ngược lên trên (artboard: −6 / −10 / −6)
  const hitW = Math.max(STAND_HIT, standW + 12);
  const hitBottom = stand.y + standH + 6;
  const standHit = { x: stand.x + standW / 2 - hitW / 2, y: hitBottom - STAND_HIT, w: hitW, h: STAND_HIT };
  const hintY = top + tileH + gap;
  // gợi ý được lấn nửa đệm dưới (artboard `Cuon-3-moi-doc`: 2 dòng 11 × 1,35 ≈ 30 px trong 29 px còn lại)
  const hint = { x: pad.side, y: hintY, w: inner, h: Math.max(0, h - pad.bottom / 2 - hintY) };
  const type: CuonType = landscape
    ? { place: 10.5, title: 16, seal: 10.5, stand: 14, tileName: 14, tileSub: 11.5, icon: 40, hint: 12 }
    : { place: 9.5, title: 14, seal: 9.5, stand: 12.5, tileName: 12.5, tileSub: 10.5, icon: 30, hint: 11 };
  return { landscape, w, h, pad, header, ruleY, tiles, hint, stand, standHit, type };
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

/** Đệm dòng gợi ý: trái + phải, trên + dưới (px thiết kế). */
export const HINT_PAD_X = 8;
export const HINT_PAD_Y = 2;
/** cỡ nhỏ nhất của dòng gợi ý (thiết kế: "chật thì nhỏ dần tới 10, không cắt") */
const HINT_MIN = 9;

/** Dòng gợi ý đã gói: cỡ chữ, cao dòng, các dòng. */
export interface HintFit {
  size: number;
  lineH: number;
  lines: string[];
}

/**
 * Gói dòng gợi ý vừa hộp `box` (không bao giờ cắt chữ): cỡ chữ từ `base` lùi dần 0,5 tới khi đủ chỗ cho mọi dòng
 * (tối thiểu 9 — nhỏ hơn nữa vẫn trả đủ dòng). Cao dòng 1,35 (artboard). `measure(chữ, cỡ)` = bề ngang px thiết kế.
 */
export function fitHint(text: string, box: CuonBox, base: number, measure: (s: string, size: number) => number): HintFit {
  for (let size = base; ; size -= 0.5) {
    const lineH = Math.round(size * 13.5) / 10;
    const lines = wrapWords(text, box.w - HINT_PAD_X, (s) => measure(s, size));
    if (lines.length * lineH + HINT_PAD_Y <= box.h || size <= HINT_MIN) return { size, lineH, lines };
  }
}

const inside = (b: CuonBox, x: number, y: number): boolean => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

/**
 * Chạm (u, v) trên giấy (u trái → phải, v dưới → lên — như `CuonSach.hitUv`) → ô / "Đứng dậy"; ngoài ô hoặc ô "Sắp có"
 * → `null` (không chạm được). Ô mờ vẫn trả về (người gọi bỏ qua — chạm không mở, không vệt vàng).
 */
export function cuonHit(layout: CuonLayout, view: CuonView, u: number, v: number): CuonRowId | null {
  const x = u * layout.w;
  const y = (1 - v) * layout.h;
  if (inside(layout.standHit, x, y)) return 'stand';
  const i = layout.tiles.findIndex((b) => inside(b, x, y));
  const id = i >= 0 ? view.tiles[i]?.id : undefined;
  return id && id !== 'soon' ? id : null;
}

/** Ô dùng được (không mờ) — "Đứng dậy" luôn dùng được, "Sắp có" không. */
export function cuonUsable(view: CuonView, id: CuonRowId): boolean {
  return id === 'stand' || view.tiles.some((t) => t.id === id && t.look === 'thuong');
}

/** Tay trỏ vào ô: ô nửa trái (1–2) → tay trái, nửa phải (3–4) và "Đứng dậy" → tay phải (thiết kế 2026-11-16.12). */
export function cuonHand(view: CuonView, id: CuonRowId): 'left' | 'right' {
  const i = view.tiles.findIndex((t) => t.id === id);
  return i >= 0 && i < view.tiles.length / 2 ? 'left' : 'right';
}

/**
 * Nút ẩn cho trình đọc màn hình (cuộn 3D không có nút DOM thật): 3 ô chức năng ("{tên}, {dòng phụ}" — chuỗi
 * `scrollTileLabel`; mờ thêm ", chưa dùng được" — `scrollTileOff`) + "Đứng dậy". Ô "Sắp có" không đọc (R-ON-8).
 */
export function cuonA11yItems(view: CuonView): { id: CuonRowId; label: string; enabled: boolean }[] {
  const out: { id: CuonRowId; label: string; enabled: boolean }[] = [];
  for (const t of view.tiles)
    if (t.id !== 'soon') out.push({ id: t.id, label: `${t.title}, ${t.sub}${t.look === 'mo' ? ', chưa dùng được' : ''}`, enabled: t.look === 'thuong' });
  out.push({ id: 'stand', label: STAND_UP, enabled: true });
  return out;
}
