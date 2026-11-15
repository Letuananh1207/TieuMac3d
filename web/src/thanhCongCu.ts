/**
 * Ghép thanh công cụ đáy màn (R-THANH-1/2, R-HANH-6/7, R-BIEU-1…3, R-TUI-1 — kế hoạch docs/tasks/2026-11-15-thanh-cong-cu.md,
 * thiết kế 2026-11-15.35): 5 nút Bản đồ · Về nhà · Biểu cảm · Túi đồ · Nhiệm vụ. Luật nút ở `zones/thanhCongCu.ts`, biểu cảm
 * `zones/bieuCam.ts`, túi đồ `zones/tuiDo.ts`; HUD `ui/toolbar.ts`, `ui/emotePanel.ts`, `ui/bagPanel.ts`. Máy tính: phím
 * M / H / G / B / J (V-76); bảng Biểu cảm mở thì phím số 1…8 chọn theo thứ tự ô. Bản máy tính màn ngang: thêm hình Trò chuyện
 * đầu hàng (Enter — V-20261116-77, R-CHAT-3).
 */
import { BagPanel } from './ui/bagPanel';
import { EmotePanel } from './ui/emotePanel';
import { Toolbar } from './ui/toolbar';
import { emoteByDigit, type Emote } from './zones/bieuCam';
import { toolbarHidden, toolForKey, toolStep, toolbarView, type ToolContext, type ToolId, type ToolPanel, type ToolbarView } from './zones/thanhCongCu';
import { bagView, type BagSource } from './zones/tuiDo';

/** Chờ đứng dậy / chạm đất tối đa (s) — quá thì bỏ việc (phòng kẹt). */
const PENDING_MAX = 2;

export interface ThanhDeps {
  /** ngữ cảnh mỗi lần hỏi (cờ của `main.ts`) — bảng đang mở do lớp này giữ */
  context(): Omit<ToolContext, 'panel'>;
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
  /** bong bóng hình trên đầu (R-BIEU-1/3) */
  bubble(e: Emote): void;
  /** số đã lưu cho túi đồ — hỏi lúc mở, ở mọi cảnh (R-TUI-1) */
  bagSource(): Promise<BagSource>;
  /** "Đọc" ở mục Sách = nút Đọc sách (R-SACH-2) */
  readBook(): void;
  /** hình Trò chuyện (bản máy tính): mở / đóng ô nhập (R-CHAT-3) */
  toggleChat(): void;
}

export class ThanhCongCu {
  private pending: { id: ToolId; t: number; stood: boolean } | null = null;
  private last: ToolbarView | null = null;
  private panel: ToolPanel | null = null;
  /** lần mở túi — câu trả lời của lần mở cũ về muộn thì bỏ */
  private bagAsk = 0;
  private readonly bar: Toolbar;
  private readonly emotes: EmotePanel;
  private readonly bag: BagPanel;

  constructor(private readonly deps: ThanhDeps) {
    this.bar = new Toolbar(
      (id) => this.press(id),
      () => {
        this.closePanel();
        this.deps.toggleChat();
      },
    );
    this.emotes = new EmotePanel(
      (e) => this.pickEmote(e),
      () => this.closePanel(),
      () => this.bar.cell('bieuCam'),
    );
    this.bag = new BagPanel(
      () => this.closePanel(),
      () => {
        this.closePanel();
        this.deps.readBook();
      },
    );
  }

  /** Trạng thái nút khung vừa rồi. */
  get view(): ToolbarView | null {
    return this.last;
  }

  /** Túi đồ đang mở → nhân vật đứng yên (R-TUI-1). */
  get busy(): boolean {
    return this.panel === 'tuiDo';
  }

  /** Phím của thanh (M / H / G / B / J) — `true` nếu đã dùng. */
  key(key: string): boolean {
    const id = toolForKey(key);
    if (!id) return false;
    this.press(id);
    return true;
  }

  /** Phím số khi bảng Biểu cảm mở → chọn ô thứ n (R-BIEU-1). `true` nếu đã dùng. */
  digit(n: number): boolean {
    const e = this.panel === 'bieuCam' ? emoteByDigit(n) : null;
    if (!e) return false;
    this.pickEmote(e);
    return true;
  }

  /** Esc / nút quay lại: đóng bảng Biểu cảm / Túi đồ. */
  back(): boolean {
    if (!this.panel) return false;
    this.closePanel();
    return true;
  }

  /** Chạm / phím một nút (R-THANH-2): ngồi → đứng dậy rồi làm; nhảy → làm khi chạm đất; đi / chào / biểu cảm → dừng rồi làm. */
  press(id: ToolId): void {
    if (this.panel === id) {
      this.closePanel(); // bấm lại Biểu cảm / Túi đồ → đóng
      return;
    }
    const c = this.context();
    const step = toolStep(id, c);
    if (step === 'none') return;
    if (step === 'homeHere') {
      this.bar.homeHere(); // "Bạn đang ở Nhà của ta" ~2 s (R-HANH-7)
      return;
    }
    this.closePanel();
    if (id === 'bieuCam') {
      this.openPanel('bieuCam');
      return;
    }
    if (step === 'now') {
      this.run(id);
      return;
    }
    this.pending = { id, t: 0, stood: false };
  }

  /** Mỗi khung: làm việc đang chờ (đứng dậy xong / chạm đất), đóng bảng khi hết dùng được, vẽ thanh. */
  update(dt: number): void {
    const c = this.context();
    // bảng Biểu cảm: ngồi / nhảy / thanh ẩn → đóng; Túi đồ: màn khác chen vào (thoại, màn phủ…) → đóng
    if (this.panel === 'bieuCam' && !toolbarView(c).on.bieuCam) this.closePanel();
    if (this.panel === 'tuiDo' && toolbarHidden({ ...c, panel: null })) this.closePanel();
    this.last = toolbarView(this.context());
    this.bar.render(this.last, dt, c.chatTyping);
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

  private context(): ToolContext {
    return { ...this.deps.context(), panel: this.panel };
  }

  private run(id: ToolId): void {
    this.deps.halt();
    if (id === 'banDo') this.deps.openMap();
    else if (id === 'veNha') this.deps.goHome();
    else if (id === 'nhiemVu') this.deps.openDaily();
    else if (id === 'tuiDo') this.openPanel('tuiDo');
  }

  private pickEmote(e: Emote): void {
    this.closePanel();
    if (toolStep('bieuCam', this.context()) !== 'now') return;
    this.deps.halt();
    this.deps.emote(e);
    if (e.bubble) this.deps.bubble(e);
  }

  private openPanel(p: ToolPanel): void {
    this.panel = p;
    if (p === 'bieuCam') {
      const r = this.bar.cellRect('bieuCam');
      this.emotes.show(true, r.left + r.width / 2);
      return;
    }
    this.bag.show(true);
    const ask = ++this.bagAsk;
    void this.deps.bagSource().then((s) => {
      if (ask === this.bagAsk && this.panel === 'tuiDo') this.bag.render(bagView(s));
    });
  }

  private closePanel(): void {
    if (!this.panel) return;
    if (this.panel === 'bieuCam') this.emotes.show(false);
    else this.bag.show(false);
    this.panel = null;
  }
}
