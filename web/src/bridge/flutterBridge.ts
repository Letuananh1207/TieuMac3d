import type { Radical } from '../zones/radicals';
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
    scene?: { handle(e: unknown): boolean };
  }
}

/** Việc trang làm khi Flutter gửi sự kiện sang. */
export interface BridgeHandlers {
  /** `resume`: Flutter đóng màn bài học → cảnh chạy tiếp */
  onResume(): void;
  /** `lifecycle`: app xuống nền (`false`) / hiện lại (`true`) */
  onVisible(visible: boolean): void;
  /** `debug`: bật / tắt bảng gỡ lỗi */
  onDebug(on: boolean): void;
  /** `back`: nút quay lại của máy — `true` = trang đã xử lý (đóng bản đồ), `false` = để Flutter thoát */
  onBack(): boolean;
}

/** Tên handler Flutter đăng ký (`addJavaScriptHandler`). */
const HANDLER = 'sceneEvent';

/** Chờ cầu nối sẵn sàng lúc trang mới tải tối đa bấy nhiêu ms (trình duyệt thường: không bao giờ sẵn sàng). */
const READY_WAIT_MS = 800;

/** Tiến độ Flutter trả về cho `getProgress` (docs/bridge.md, R-HANH-1). */
export interface JourneyProgress {
  /** mã vùng đã mở */
  open: string[];
  /** số chữ đã học */
  chars: number;
  /** mã bộ thủ đã học — tu luyện mở bộ chưa học đầu tiên (R-HANH-3) */
  radicals: string[];
  /** mốc của vùng còn khoá: số chữ (`chars`) hoặc số bộ thủ (`radicals`) — bản đồ ghi "Cần … chữ" */
  need: Record<string, { chars?: number; radicals?: number }>;
}

/** Cầu nối có sẵn chưa; chưa thì đợi sự kiện `flutterInAppWebViewPlatformReady` (tối đa `READY_WAIT_MS`). */
function hostReady(): Promise<InAppWebViewHost | null> {
  const now = window.flutter_inappwebview;
  if (now && typeof now.callHandler === 'function') return Promise.resolve(now);
  return new Promise((done) => {
    const finish = (): void => {
      window.removeEventListener('flutterInAppWebViewPlatformReady', finish);
      clearTimeout(timer);
      const h = window.flutter_inappwebview;
      done(h && typeof h.callHandler === 'function' ? h : null);
    };
    const timer = setTimeout(finish, READY_WAIT_MS);
    window.addEventListener('flutterInAppWebViewPlatformReady', finish);
  });
}

/**
 * Hỏi Flutter vùng nào đã mở (`getProgress`). `null` = không có Flutter / lỗi → trang dùng mặc định.
 * Hàm rời (không cần `FlutterBridge`) để gọi sớm, song song với nạp font.
 */
export async function getProgress(): Promise<JourneyProgress | null> {
  const host = await hostReady();
  if (!host) return null;
  const event: SceneEvent = { type: 'getProgress', payload: {} };
  try {
    return parseProgress(await host.callHandler(HANDLER, event));
  } catch {
    return null;
  }
}

/** Đọc câu trả lời `getProgress`; sai dạng → `null`. */
export function parseProgress(v: unknown): JourneyProgress | null {
  if (typeof v !== 'object' || v === null) return null;
  const { open, chars, need, radicals } = v as Record<string, unknown>;
  if (!Array.isArray(open) || !open.every((x) => typeof x === 'string')) return null;
  const needs: JourneyProgress['need'] = {};
  if (typeof need === 'object' && need !== null) {
    for (const [id, n] of Object.entries(need as Record<string, unknown>)) {
      if (typeof n !== 'object' || n === null) continue;
      const { chars: c, radicals: r } = n as Record<string, unknown>;
      needs[id] = { ...(typeof c === 'number' ? { chars: c } : {}), ...(typeof r === 'number' ? { radicals: r } : {}) };
    }
  }
  const learned = Array.isArray(radicals) ? radicals.filter((x): x is string => typeof x === 'string') : [];
  return { open, chars: typeof chars === 'number' ? chars : 0, radicals: learned, need: needs };
}

/**
 * Cầu nối JS ↔ Flutter. Không có Flutter (trình duyệt thường, Canvas 3D) thì mọi yêu cầu trả `false` để trang tự
 * lo (bảng bài học HTML).
 */
export class FlutterBridge {
  constructor(private readonly on: BridgeHandlers) {
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

  /** Trả `true` khi trang đã xử lý sự kiện cần trả lời (`back`); các sự kiện khác trả `false`. */
  /** Nhờ Flutter mở thẻ học bộ thủ native (R-HANH-3). `false` = không có Flutter → trang mở bảng HTML. */
  async openRadical(radical: Radical, learned: boolean, region: string): Promise<boolean> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return false;
    const event: SceneEvent = { type: 'openRadical', payload: { radical, learned, region } };
    try {
      return (await host.callHandler(HANDLER, event)) === true;
    } catch {
      return false;
    }
  }

  private handle(e: unknown): boolean {
    if (typeof e !== 'object' || e === null) return false;
    const { type, payload } = e as Partial<SceneEvent>;
    const p = typeof payload === 'object' && payload !== null ? payload : {};
    if (type === 'resume') this.on.onResume();
    else if (type === 'lifecycle' && (p.state === 'hidden' || p.state === 'visible')) this.on.onVisible(p.state === 'visible');
    else if (type === 'debug') this.on.onDebug(p.on === true);
    else if (type === 'back') return this.on.onBack();
    return false;
  }
}
