import type { BookEntry, Word } from '../zones/books';
import type { DecorItem } from '../zones/decor';
import type { Radical } from '../zones/radicals';
import type { ReviewItem } from '../zones/review';
import type { StudyMenu } from '../zones/studyMenu';
import { parseGameEarning, type GameEarning, type GameKind, type GameOutcome } from '../zones/wallet';
import { parseActReply, parseGarden, type Garden, type GardenAct } from '../zones/vuon';
import { parseAlms, type AlmsRecord, type AlmsResult } from '../zones/walletRules';
import type { Lesson } from '../zones/zones';

/** Dữ liệu cuộn sách Ngồi ôn gửi Flutter (`openStudy` — R-ON-8). */
export interface StudyPayload {
  menu: StudyMenu;
  /** câu đố các bộ đến hạn (như `openReview`) */
  review: ReviewItem[];
  /** các bộ đã học, theo thứ tự Rừng trúc */
  learned: Radical[];
  region: string;
}

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
  /** `resume`: Flutter đóng màn bài học → cảnh chạy tiếp; `stand` = thẻ bộ thủ đóng bằng "Xuất định" → đứng dậy (R-HANH-3) */
  onResume(stand: boolean): void;
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

/** Tiến độ Flutter trả về cho `getProgress` (docs/bridge.md). Không khoá vùng (R-HANH-1) — không có vùng mở / mốc. */
export interface JourneyProgress {
  /** số chữ đã học */
  chars: number;
  /** mã bộ thủ đã học — tu luyện mở bộ chưa học đầu tiên (R-HANH-3) */
  radicals: string[];
  /** mã bộ thủ đến hạn ôn hôm nay, theo thứ tự hỏi (R-ON-4) — ngồi thiền mở lượt ôn trước (R-ON-5) */
  due: string[];
  /** bảng nhiệm vụ hôm nay (R-NV-1, R-NV-2); `null` = Flutter bản cũ không gửi */
  daily: DailyBoard | null;
  /** mã sổ từ đang mượn ở Tàng Thư Các (R-SACH-2); `null` = không mượn */
  book: string | null;
  /** số dư Văn tiền (R-TIEN-1); `null` = Flutter không gửi (bản cũ / không có ví) → ví ẩn */
  coins: number | null;
  /** Văn tiền trò chơi đã nhận hôm nay (trần 60 — R-TIEN-3) */
  gameCoinsToday: number;
  /** đã cho Tiểu Khất (R-NPC-6, R-TIEN-8); Flutter bản cũ không gửi → chưa cho lần nào */
  alms: AlmsRecord;
}

/** Hai việc hôm nay + chuỗi ngày (docs/bridge.md `getProgress.daily`). */
export interface DailyBoard {
  /** số bộ mới đã học hôm nay */
  learned: number;
  /** mục tiêu bộ mới mỗi ngày */
  goal: number;
  /** số bộ còn đến hạn ôn */
  due: number;
  streak: number;
  best: number;
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
 * Có Flutter không (chờ cầu nối như `getProgress`, tối đa `READY_WAIT_MS`). Không có → trang chạy chế độ thử trình duyệt
 * (R-TIEN-7). Flutter bản cũ (không gửi `coins`) vẫn là "có Flutter".
 */
export async function hasFlutter(): Promise<boolean> {
  return (await hostReady()) !== null;
}

/**
 * Hỏi Flutter tiến độ học (`getProgress`). `null` = không có Flutter / lỗi → trang dùng mặc định.
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

/**
 * Hỏi Flutter vườn rau đã lưu (`getGarden` — R-VUON-1). `null` = không có Flutter / lỗi / bản cũ → trang coi vườn mới chỉ
 * xem. Có → vườn đã đọc (`zones/vuon.ts` `parseGarden`).
 */
export async function getGarden(): Promise<Garden | null> {
  const host = await hostReady();
  if (!host) return null;
  try {
    const r = await host.callHandler(HANDLER, { type: 'getGarden', payload: {} } satisfies SceneEvent);
    if (!r || typeof r !== 'object' || !('garden' in r)) return null;
    return parseGarden((r as { garden: unknown }).garden);
  } catch {
    return null;
  }
}

/**
 * Hỏi Flutter nhà của ta đã lưu (`getHome` — R-NHA-3). Trả nguyên câu trả lời (`{placed}`) để `zones/decor.ts`
 * `cleanHome` làm sạch theo cảnh; `null` = không có Flutter / lỗi → nhà trống.
 */
export async function getHome(): Promise<unknown> {
  const host = await hostReady();
  if (!host) return null;
  const event: SceneEvent = { type: 'getHome', payload: {} };
  try {
    return await host.callHandler(HANDLER, event);
  } catch {
    return null;
  }
}

/** Đọc câu trả lời `getProgress`; sai dạng → `null`. */
export function parseProgress(v: unknown): JourneyProgress | null {
  if (typeof v !== 'object' || v === null) return null;
  const { chars, radicals, due, daily, book, coins, gameCoinsToday, alms } = v as Record<string, unknown>;
  const learned = Array.isArray(radicals) ? radicals.filter((x): x is string => typeof x === 'string') : [];
  const dueIds = Array.isArray(due) ? due.filter((x): x is string => typeof x === 'string') : [];
  return {
    chars: typeof chars === 'number' ? chars : 0,
    radicals: learned,
    due: dueIds,
    daily: parseDaily(daily),
    book: typeof book === 'string' && book ? book : null,
    coins: typeof coins === 'number' && Number.isFinite(coins) ? Math.max(0, coins) : null,
    gameCoinsToday: typeof gameCoinsToday === 'number' && gameCoinsToday > 0 ? gameCoinsToday : 0,
    alms: parseAlms(alms),
  };
}

/** Đọc `getProgress.daily`; thiếu / sai dạng → `null`. */
function parseDaily(v: unknown): DailyBoard | null {
  if (typeof v !== 'object' || v === null) return null;
  const d = v as Record<string, unknown>;
  const n = (k: string): number | null => (typeof d[k] === 'number' ? (d[k] as number) : null);
  const [learned, goal, due, streak, best] = ['learned', 'goal', 'due', 'streak', 'best'].map(n);
  if (learned === null || goal === null || due === null || streak === null || best === null) return null;
  return { learned, goal, due, streak, best };
}

/** Vật bày bán gửi Flutter (`openShop`, docs/bridge.md) — bỏ trường chỉ cảnh dùng (`blocks`). */
export function shopPayload(items: readonly DecorItem[]): Record<string, unknown>[] {
  return items.map(({ id, name, slot, price }) => ({ id, name, slot, price }));
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

  /** Nhờ Flutter mở lượt ôn câu đố (R-ON-5). `false` = không có Flutter / chưa có màn ôn → trang mở thẻ bộ mới. */
  openReview(items: ReviewItem[], region: string): Promise<boolean> {
    return this.ask({ type: 'openReview', payload: { items, region } });
  }

  /**
   * Nhờ Flutter mở màn "Bộ đã học" (chạm "Xem bộ đã học" trên cuộn sách 3D — R-ON-8, thiết kế 2026-11-14.21). Đóng →
   * `resume` (vẫn ngồi). `false` = không có Flutter → trang mở thẻ HTML.
   */
  openLearned(learned: Radical[], region: string): Promise<boolean> {
    return this.ask({ type: 'openLearned', payload: { learned, region } });
  }

  /**
   * **Thôi dùng** (V-20261114-34 — mục in trên cuộn 3D, docs/bridge.md). Nhờ Flutter mở bảng chọn cuộn sách Ngồi ôn
   * (R-ON-8). Bảng chỉ đóng bằng "Đứng dậy" → `resume {stand: true}`.
   */
  openStudy({ menu, review, learned, region }: StudyPayload): Promise<boolean> {
    const { items, highlight, next, upcoming } = menu;
    return this.ask({ type: 'openStudy', payload: { items, highlight, review, next, upcoming, learned, region } });
  }

  /**
   * Nhờ Flutter mở bảng nhiệm vụ hằng ngày (R-NV-3), kèm câu đố các bộ đến hạn (`review` — "Ôn ngay", R-ON-5) và chữ của
   * từng bộ thủ (`forms`, mã → chữ). `false` = không có Flutter → bảng HTML trên web (`ui/dailyPanel.ts`).
   */
  openDaily(review: ReviewItem[], forms: Record<string, string>): Promise<boolean> {
    return this.ask({ type: 'openDaily', payload: { review, forms } });
  }

  /** Ghi cuốn đang mượn (R-SACH-1). `false` = không có Flutter → trang giữ trong bộ nhớ. */
  borrowBook(id: string): Promise<boolean> {
    return this.ask({ type: 'borrowBook', payload: { id } });
  }

  /** Trả cuốn đang mượn (R-SACH-4). `false` = không có Flutter → trang xoá trong bộ nhớ. */
  returnBook(): Promise<boolean> {
    return this.ask({ type: 'returnBook', payload: {} });
  }

  /** Ghi vật ở một ô nhà của ta (R-NHA-2/3); `item` `null` = gỡ. `false` = không có Flutter → giữ trong bộ nhớ trang. */
  setDecor(slot: string, item: string | null): Promise<boolean> {
    return this.ask({ type: 'setDecor', payload: { slot, item } });
  }

  /** Mở danh mục sách (R-SACH-1). `false` = chưa có màn (chờ thiết kế) → chọn cuốn trong khung thoại. */
  openLibrary(books: readonly BookEntry[], borrowed: string | null): Promise<boolean> {
    return this.ask({ type: 'openLibrary', payload: { books, borrowed } });
  }

  /** Mở sổ từ cuốn đang mượn (R-SACH-3). `false` = chưa có màn đọc (chờ thiết kế). */
  openBook(book: Pick<BookEntry, 'id' | 'title' | 'subtitle'>, words: Word[]): Promise<boolean> {
    const { id, title, subtitle } = book;
    return this.ask({ type: 'openBook', payload: { book: { id, title, subtitle }, words } });
  }

  /**
   * Hết một ván ở bàn chơi (R-TIEN-3): Flutter tính thưởng (bảng + trần 60 / ngày) và ghi ngay. `null` = không có
   * Flutter / lỗi → không thưởng, ví ẩn.
   */
  async earnGame(game: GameKind, outcome: GameOutcome): Promise<GameEarning | null> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return null;
    try {
      return parseGameEarning(await host.callHandler(HANDLER, { type: 'earnGame', payload: { game, outcome } }));
    } catch {
      return null;
    }
  }

  /**
   * Cho Tiểu Khất 5 văn (R-TIEN-8): Flutter tính (mỗi ngày giờ VN một lần, ví ≥ 5) và ghi ngay. `null` = không có Flutter /
   * lỗi / bản cũ → không cho được.
   */
  async giveAlms(): Promise<AlmsResult | null> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return null;
    try {
      return parseAlmsReply(await host.callHandler(HANDLER, { type: 'giveAlms', payload: {} }));
    } catch {
      return null;
    }
  }

  /**
   * Một thao tác ở vườn rau (`gardenAct` — R-VUON-1…9): Flutter tính theo `garden.dart` và ghi ngay. `null` = không có
   * Flutter / lỗi / bản cũ → không làm gì (không có Flutter thì trang tự tính trên ví thử, không gọi tới đây).
   */
  async gardenAct(a: GardenAct): Promise<ReturnType<typeof parseActReply>> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return null;
    try {
      return parseActReply(await host.callHandler(HANDLER, { type: 'gardenAct', payload: a }));
    } catch {
      return null;
    }
  }

  /**
   * Mở Tạp hoá (R-TIEN-4, R-TIEN-6) với danh mục + giá của `zones/decor.ts` (một nguồn giá). `false` = không có Flutter /
   * Flutter không mở (không có Flutter thì trang mở Tạp hoá bản web — R-TIEN-7, không gọi tới đây).
   */
  openShop(items: readonly DecorItem[]): Promise<boolean> {
    return this.ask({ type: 'openShop', payload: { items: shopPayload(items) } });
  }

  private async ask(event: SceneEvent): Promise<boolean> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return false;
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
    if (type === 'resume') this.on.onResume(p.stand === true);
    else if (type === 'lifecycle' && (p.state === 'hidden' || p.state === 'visible')) this.on.onVisible(p.state === 'visible');
    else if (type === 'debug') this.on.onDebug(p.on === true);
    else if (type === 'back') return this.on.onBack();
    return false;
  }
}

/** Đọc câu trả lời `giveAlms` (docs/bridge.md); sai dạng → `null`. */
export function parseAlmsReply(v: unknown): AlmsResult | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const balance = typeof o.balance === 'number' && Number.isFinite(o.balance) && o.balance >= 0 ? o.balance : null;
  if (balance === null) return null;
  if (o.ok === true) {
    const alms = parseAlms(o.alms);
    return alms.lastDay >= 0 ? { ok: true, balance, alms } : null;
  }
  if (o.ok === false && (o.reason === 'given' || o.reason === 'short')) return { ok: false, reason: o.reason, balance };
  return null;
}
