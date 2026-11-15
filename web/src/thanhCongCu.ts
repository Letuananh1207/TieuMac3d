/**
 * Ghép thanh công cụ đáy màn (R-THANH-1/2, R-HANH-6/7, R-BIEU-1/2 — kế hoạch docs/tasks/2026-11-15-thanh-cong-cu.md):
 * 5 nút Bản đồ · Về nhà · Biểu cảm · Túi đồ · Nhiệm vụ. Luật nút ở `zones/thanhCongCu.ts`, biểu cảm `zones/bieuCam.ts`.
 *
 * **HUD chưa có** (chờ thiết kế — phiếu `docs/phieu_thiet_ke/2026-11-15-thanh-cong-cu.md`, nhiệm vụ 7–10): file này chỉ
 * nối luật với phím máy tính (T / H / B / I / J) để thử; không dựng giao diện tạm. Tạm thời:
 * - B rồi phím số 1…8 (trong 4 giây) = chọn biểu cảm theo thứ tự bảng (R-BIEU-1 — tới khi có bảng);
 * - I (Túi đồ) và thẻ "Bạn đang ở Nhà của ta" chỉ ghi log — chờ thiết kế (R-TUI-1, R-HANH-7).
 */
import { emoteByDigit, type Emote } from './zones/bieuCam';
import { HOME_HERE_TEXT, toolForKey, toolStep, toolbarView, type ToolContext, type ToolId, type ToolbarView } from './zones/thanhCongCu';

/** B rồi phím số: chờ phím số trong bấy nhiêu giây (tạm, tới khi có bảng biểu cảm). */
const EMOTE_KEY_WINDOW = 4;
/** Chờ đứng dậy / chạm đất tối đa (s) — quá thì bỏ việc (phòng kẹt). */
const PENDING_MAX = 2;

export interface ThanhDeps {
  /** ngữ cảnh mỗi lần hỏi (cờ của `main.ts`) */
  context(): ToolContext;
  /** đứng dậy (Ngồi ôn: cuộn lại rồi đứng — R-THANH-2) */
  standUp(): void;
  /** dừng đi / thôi chào / thôi biểu cảm trước khi làm (R-THANH-2) */
  halt(): void;
  /** mở bản đồ truyền tống từ chỗ nhân vật (R-HANH-6) */
  openMap(): void;
  /** về Nhà của ta một chạm (R-HANH-7) */
  goHome(): void;
  /** bảng nhiệm vụ hằng ngày (R-NV-3) */
  openDaily(): void;
  /** diễn biểu cảm (R-BIEU-2) */
  emote(e: Emote): void;
}

export class ThanhCongCu {
  private pending: { id: ToolId; t: number; stood: boolean } | null = null;
  /** còn bao lâu nhận phím số sau khi bấm B */
  private emoteKeys = 0;
  private last: ToolbarView | null = null;

  constructor(private readonly deps: ThanhDeps) {}

  /** Trạng thái nút khung vừa rồi (cho HUD khi có thiết kế). */
  get view(): ToolbarView | null {
    return this.last;
  }

  /** Phím của thanh (T / H / B / I / J) — `true` nếu đã dùng. */
  key(key: string): boolean {
    const id = toolForKey(key);
    if (!id) return false;
    this.press(id);
    return true;
  }

  /** Phím số (B rồi số — tạm, R-BIEU-1). `true` nếu đã dùng. */
  digit(n: number): boolean {
    if (this.emoteKeys <= 0) return false;
    this.emoteKeys = 0;
    const e = emoteByDigit(n);
    const c = this.deps.context();
    if (!e || toolStep('bieuCam', c) !== 'now') return false;
    this.deps.emote(e);
    return true;
  }

  /** Esc / nút quay lại: bỏ chọn biểu cảm đang chờ. */
  back(): boolean {
    if (this.emoteKeys <= 0) return false;
    this.emoteKeys = 0;
    return true;
  }

  /** Chạm / phím một nút (R-THANH-2): ngồi → đứng dậy rồi làm; nhảy → làm khi chạm đất; đi / chào / biểu cảm → dừng rồi làm. */
  press(id: ToolId): void {
    const c = this.deps.context();
    const step = toolStep(id, c);
    if (step === 'none') return;
    if (step === 'homeHere') {
      // thẻ "Bạn đang ở Nhà của ta" ~2 s — chờ thiết kế (V-64 NV10); chưa dựng giao diện tạm
      console.info(`[thanh] ${HOME_HERE_TEXT}`);
      return;
    }
    if (id === 'bieuCam') {
      // bảng biểu cảm chờ thiết kế (V-64 NV8): tạm B rồi phím số 1…8; bấm lại B = đóng
      this.emoteKeys = this.emoteKeys > 0 ? 0 : EMOTE_KEY_WINDOW;
      return;
    }
    this.emoteKeys = 0;
    if (step === 'now') {
      this.run(id);
      return;
    }
    this.pending = { id, t: 0, stood: false };
  }

  /** Mỗi khung: làm việc đang chờ (đứng dậy xong / chạm đất), đếm giờ phím số, giữ trạng thái nút. */
  update(dt: number): void {
    const c = this.deps.context();
    this.last = toolbarView(c);
    if (this.emoteKeys > 0) this.emoteKeys = c.sitting || c.air || !this.last.visible ? 0 : this.emoteKeys - dt;
    const p = this.pending;
    if (!p) return;
    p.t += dt;
    if (p.t > PENDING_MAX || !this.last.visible) {
      this.pending = null; // có màn khác chen vào / kẹt → bỏ
      return;
    }
    if (c.sitting) {
      if (!p.stood) {
        p.stood = true;
        this.deps.standUp();
      }
      return;
    }
    if (c.air) return;
    this.pending = null;
    this.run(p.id);
  }

  private run(id: ToolId): void {
    this.deps.halt();
    if (id === 'banDo') this.deps.openMap();
    else if (id === 'veNha') this.deps.goHome();
    else if (id === 'nhiemVu') this.deps.openDaily();
    else if (id === 'tuiDo') console.info('[thanh] Túi đồ — chờ thiết kế (R-TUI-1, V-64 NV9)');
  }
}
