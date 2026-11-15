/**
 * Thanh công cụ đáy màn (R-THANH-1/2, R-HANH-6/7 — kế hoạch docs/tasks/2026-11-15-thanh-cong-cu.md): 5 nút, trạng thái
 * từng nút theo ngữ cảnh + việc phải làm khi chạm. Thuần (không three, không DOM) — test `thanhCongCu.test.ts`.
 * HUD (hình nút, chỗ đặt) chờ thiết kế (phiếu `2026-11-15-thanh-cong-cu`); máy tính dùng phím T / H / B / I / J.
 */

export type ToolId = 'banDo' | 'veNha' | 'bieuCam' | 'tuiDo' | 'nhiemVu';

/** Thứ tự trên thanh, trái → phải (R-THANH-1). */
export const TOOL_ORDER: readonly ToolId[] = ['banDo', 'veNha', 'bieuCam', 'tuiDo', 'nhiemVu'];

/** Tên nút (chỉ tiếng Việt — R-HUD-4). */
export const TOOL_NAMES: Record<ToolId, string> = {
  banDo: 'Bản đồ',
  veNha: 'Về nhà',
  bieuCam: 'Biểu cảm',
  tuiDo: 'Túi đồ',
  nhiemVu: 'Nhiệm vụ',
};

/** Phím máy tính (R-THANH-1). */
export const TOOL_KEYS: Record<ToolId, string> = { banDo: 't', veNha: 'h', bieuCam: 'b', tuiDo: 'i', nhiemVu: 'j' };

/** Thẻ khi bấm Về nhà lúc đang ở nhà (R-HANH-7), hiện khoảng `HOME_HERE_SECONDS` giây. */
export const HOME_HERE_TEXT = 'Bạn đang ở Nhà của ta';
export const HOME_HERE_SECONDS = 2;

/** Ngữ cảnh cho thanh — mỗi khung `main.ts` / `thanhCongCu.ts` gom từ các cờ đang có. */
export interface ToolContext {
  /** màn tải, hoặc đang đổi cảnh */
  loading: boolean;
  /** đang cưỡi hạc (cất / hạ cánh) */
  crane: boolean;
  /** bài học / thẻ bộ thủ / màn Flutter / bảng HTML phủ cảnh */
  covered: boolean;
  /** bản đồ truyền tống mở */
  travelMap: boolean;
  /** bản đồ lớn mở */
  areaMap: boolean;
  /** hội thoại NPC */
  talking: boolean;
  /** ngồi bàn chơi */
  gameTable: boolean;
  /** chế độ trang trí */
  decorating: boolean;
  /** bảng vườn rau mở */
  garden: boolean;
  /** ô nhập trò chuyện mở */
  chatTyping: boolean;
  /** đang ngồi (Ngồi ôn kể cả cuộn sách mở, chỗ ngồi, bồ đoàn, đôn trà) — không tính bàn chơi (đã ẩn) */
  sitting: boolean;
  /** đang nhảy (trên không) */
  air: boolean;
  /** đang ở Nhà của ta */
  atHome: boolean;
  /** số việc hôm nay còn lại (`dailyBoard.tasksLeft`); null = chưa biết */
  tasksLeft: number | null;
}

export interface ToolbarView {
  /** thanh hiện (R-THANH-1: ẩn khi có màn phủ / thoại / bàn chơi…) */
  visible: boolean;
  /** nút sáng (true) hay mờ (false) */
  on: Record<ToolId, boolean>;
  /** chấm son trên nút Nhiệm vụ: số việc còn lại, 0 = không chấm */
  badge: number;
}

/** Thanh có bị ẩn không (R-THANH-1) — mọi lý do ẩn đều là tạm: đóng / xong là hiện lại. */
export function toolbarHidden(c: ToolContext): boolean {
  return c.loading || c.crane || c.covered || c.travelMap || c.areaMap || c.talking || c.gameTable || c.decorating || c.garden || c.chatTyping;
}

/** Trạng thái các nút (R-THANH-1/2, R-HANH-7, R-BIEU-1). */
export function toolbarView(c: ToolContext): ToolbarView {
  const visible = !toolbarHidden(c);
  return {
    visible,
    on: {
      banDo: visible,
      veNha: visible && !c.atHome, // ở nhà: mờ, chạm → thẻ (R-HANH-7)
      bieuCam: visible && !c.sitting && !c.air, // ngồi / nhảy: mờ (R-BIEU-1, R-THANH-2)
      tuiDo: visible,
      nhiemVu: visible,
    },
    badge: Math.max(0, c.tasksLeft ?? 0),
  };
}

/**
 * Việc khi chạm một nút (R-THANH-2):
 * - `none`: không làm gì (thanh ẩn, hoặc nút Biểu cảm mờ);
 * - `homeHere`: đang ở nhà bấm Về nhà → thẻ "Bạn đang ở Nhà của ta" (R-HANH-7);
 * - `standThen`: đang ngồi → đứng dậy rồi làm;
 * - `afterLand`: đang nhảy → làm ngay khi chạm đất;
 * - `now`: làm luôn (đang đi / chào / biểu cảm thì nơi gọi dừng lại trước).
 */
export type ToolStep = 'none' | 'homeHere' | 'standThen' | 'afterLand' | 'now';

export function toolStep(id: ToolId, c: ToolContext): ToolStep {
  if (toolbarHidden(c)) return 'none';
  if (id === 'veNha' && c.atHome) return 'homeHere';
  if (id === 'bieuCam' && (c.sitting || c.air)) return 'none';
  if (c.sitting) return 'standThen';
  if (c.air) return 'afterLand';
  return 'now';
}

/** Phím → nút (không phân biệt hoa thường); không phải phím của thanh → null. */
export function toolForKey(key: string): ToolId | null {
  const k = key.toLowerCase();
  return TOOL_ORDER.find((id) => TOOL_KEYS[id] === k) ?? null;
}
