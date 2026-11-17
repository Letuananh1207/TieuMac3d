import type { BookEntry, Word } from '../zones/books';
import type { DecorItem, PlacedDecor } from '../zones/decor';
import type { BaiHoc } from '../zones/tuVung/bai';
import type { MucOn } from '../zones/tuVung/cauHoi';
import type { Tu } from '../zones/tuVung/tu';
import { parseGameEarning, type GameEarning, type GameKind, type GameOutcome } from '../zones/wallet';
import { parseActReply, parseGarden, type Garden, type GardenAct } from '../zones/vuon';
import { parseMang, parseMangReply, type MangAct, type MangState } from '../zones/mang';
import { parseAlms, type AlmsRecord, type AlmsResult } from '../zones/walletRules';
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
  /** `resume`: Flutter đóng màn bài học → cảnh chạy tiếp; `stand` = trang từ đã học đóng bằng "Xuất định" → đứng dậy (R-HANH-3) */
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
  /** mã bài đã học (R-TU-1) — Trúc Lão mở bài chưa học đầu tiên (R-HANH-3) */
  lessons: string[];
  /** mã từ đã học (= từ của các bài đã học) */
  words: string[];
  /** mã từ đến hạn ôn hôm nay, theo thứ tự hỏi (R-ON-4) — tổng, chưa cắt 20 */
  due: string[];
  /** bậc lịch ôn của từng từ trong `due` (0 = 1 ngày … 6 = 120, 7 = đã thuộc) — chọn dạng câu (R-ON-2); thiếu → 0 */
  dueSteps: number[];
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
  /** số bài mới đã học hôm nay */
  learned: number;
  /** mục tiêu bài mới mỗi ngày (1) */
  goal: number;
  /** số từ còn đến hạn ôn (0 khi đã ôn đủ 20 từ hôm nay — R-NV-1) */
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
 * Hỏi Flutter măng Trúc Lâm đã lưu (`getMang` — R-MANG-1…5). `null` = không có Flutter / lỗi / bản cũ → túi trống, chỉ xem.
 */
export async function getMang(): Promise<MangState | null> {
  const host = await hostReady();
  if (!host) return null;
  try {
    const r = await host.callHandler(HANDLER, { type: 'getMang', payload: {} } satisfies SceneEvent);
    if (!r || typeof r !== 'object' || !('mang' in r)) return null;
    return parseMang((r as { mang: unknown }).mang);
  } catch {
    return null;
  }
}

/**
 * Hỏi Flutter nhà của ta đã lưu (`getHome` — R-NHA-3). Trả nguyên câu trả lời (`{items, owned, placed?}`) để `zones/decor.ts`
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
  const { lessons, words, due, dueSteps, daily, book, coins, gameCoinsToday, alms } = v as Record<string, unknown>;
  const strs = (a: unknown): string[] => (Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string') : []);
  const dueIds = strs(due);
  const steps = Array.isArray(dueSteps) ? dueSteps : [];
  return {
    lessons: strs(lessons),
    words: strs(words),
    due: dueIds,
    dueSteps: dueIds.map((_, i) => (typeof steps[i] === 'number' ? (steps[i] as number) : 0)),
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
  return items.map(({ id, name, where, price }) => ({ id, name, where, price }));
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

  /**
   * Nhờ Flutter mở **màn bài từ** của bài `b` (R-HANH-3, docs/bridge.md `openWordLesson`). "Đã lĩnh hội" → Flutter ghi bài đã
   * học (cả bài vào lịch ôn) rồi `resume`. `false` = không có Flutter → trang mở bảng HTML liệt kê từ của bài.
   */
  openWordLesson(b: BaiHoc, index: number, total: number, words: Tu[], learned: boolean, region: string): Promise<boolean> {
    return this.ask({ type: 'openWordLesson', payload: { lesson: { id: b.id, title: b.ten, index, total }, words, learned, region } });
  }

  /** Nhờ Flutter mở lượt ôn câu đố (R-ON-5, R-ON-2). `false` = không có Flutter / chưa có màn ôn. */
  openReview(items: MucOn[], region: string): Promise<boolean> {
    return this.ask({ type: 'openReview', payload: { items, region } });
  }

  /**
   * Nhờ Flutter mở màn "Từ đã học" (chạm ô trên cuộn Tĩnh toạ — R-ON-8): `words` theo thứ tự giáo trình, `lessons` = các bài
   * đã học (mã + tên — nhóm theo bài). Đóng → `resume` (vẫn ngồi). `false` = không có Flutter → bảng HTML bài học gần nhất.
   */
  openLearned(words: Tu[], lessons: { id: string; title: string }[], region: string): Promise<boolean> {
    return this.ask({ type: 'openLearned', payload: { words, lessons, region } });
  }

  /**
   * Nhờ Flutter mở bảng nhiệm vụ hằng ngày (R-NV-3), kèm câu đố các từ đến hạn (`review` — "Ôn ngay", R-ON-5).
   * `false` = không có Flutter → bảng HTML trên web (`ui/dailyPanel.ts`).
   */
  openDaily(review: MucOn[]): Promise<boolean> {
    return this.ask({ type: 'openDaily', payload: { review } });
  }

  /** Ghi cuốn đang mượn (R-SACH-1). `false` = không có Flutter → trang giữ trong bộ nhớ. */
  borrowBook(id: string): Promise<boolean> {
    return this.ask({ type: 'borrowBook', payload: { id } });
  }

  /** Trả cuốn đang mượn (R-SACH-4). `false` = không có Flutter → trang xoá trong bộ nhớ. */
  returnBook(): Promise<boolean> {
    return this.ask({ type: 'returnBook', payload: {} });
  }

  /**
   * Ghi cả danh sách món nhà của ta (`setHome` — R-NHA-2/3, V-69). `false` = không có Flutter (giữ trong bộ nhớ trang) hoặc Flutter
   * không ghi (vượt số cái / sai dạng — trang hỏi lại `getHome`).
   */
  setHome(items: readonly PlacedDecor[]): Promise<boolean> {
    return this.ask({ type: 'setHome', payload: { items: items.map(({ item, scene, x, z, rot }) => ({ item, scene, x, z, rot })) } });
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
  async earnGame(game: GameKind, outcome: GameOutcome, song?: string): Promise<GameEarning | null> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return null;
    try {
      // `song`: mã bài Đàn cầm (R-CAM-4) — chỉ gửi khi có
      return parseGameEarning(await host.callHandler(HANDLER, { type: 'earnGame', payload: { game, outcome, ...(song ? { song } : {}) } }));
    } catch {
      return null;
    }
  }

  /**
   * Một thao tác măng Trúc Lâm (`mangAct` — R-MANG-3/5): Flutter tính theo `mang.dart` và ghi ngay. `null` = không có Flutter
   * / lỗi / bản cũ → không làm gì.
   */
  async mangAct(a: MangAct): Promise<ReturnType<typeof parseMangReply>> {
    const host = window.flutter_inappwebview;
    if (!host || typeof host.callHandler !== 'function') return null;
    try {
      return parseMangReply(await host.callHandler(HANDLER, { type: 'mangAct', payload: a }));
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
