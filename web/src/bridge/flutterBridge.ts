import type { Lesson } from '../zones/zones';

/** Sự kiện qua cầu nối — hợp đồng ở `docs/bridge.md`. */
export interface SceneEvent {
  type: string;
  payload: Record<string, unknown>;
}

/** `window.flutter_inappwebview` do gói flutter_inappwebview chèn vào trang khi chạy trong app. */
interface InAppWebViewHost {
  callHandler(name: string, ...args: unknown[]): Promise<unknown>;
}

declare global {
  interface Window {
    flutter_inappwebview?: InAppWebViewHost;
    /** Flutter gọi `window.scene.handle({type, payload})` bằng evaluateJavascript. */
    scene?: { handle(e: unknown): void };
  }
}

/** Tên handler Flutter đăng ký (`addJavaScriptHandler`). */
const HANDLER = 'sceneEvent';

/**
 * Cầu nối JS ↔ Flutter. Không có Flutter (trình duyệt thường, Canvas 3D) thì mọi yêu cầu trả `false` để trang tự
 * lo (bảng bài học HTML).
 */
export class FlutterBridge {
  /** @param onResume Flutter đóng màn bài học → cảnh chạy tiếp */
  constructor(private readonly onResume: () => void) {
    window.scene = { handle: (e) => this.handle(e) };
  }

  /**
   * Nhờ Flutter mở màn bài học native. `true` = Flutter đã mở (trang ngừng vẽ, chờ `resume`);
   * `false` = không có Flutter / Flutter chưa có màn → trang mở bảng HTML.
   */
  async openLesson(zoneId: string, lesson: Lesson): Promise<boolean> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return false;
    const event: SceneEvent = { type: 'openLesson', payload: { zoneId, lesson } };
    try {
      return (await host.callHandler(HANDLER, event)) === true;
    } catch {
      return false; // handler chưa đăng ký / lỗi phía Flutter → vẫn học được bằng bảng HTML
    }
  }

  private handle(e: unknown): void {
    if (typeof e !== 'object' || e === null) return;
    if ((e as Partial<SceneEvent>).type === 'resume') this.onResume();
  }
}
