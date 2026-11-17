/**
 * Kho ví thử trong trình duyệt (R-TIEN-7 — chạy không có Flutter, vd. `npm run dev`): một khoá `localStorage`
 * `hoc-xa.thu.v1` giữ `TrialWallet` (số dư, thưởng trò hôm nay, đồ sở hữu, nhà, bài đã học). Đọc / ghi bọc `try/catch`:
 * bị chặn (ẩn danh, chặn dữ liệu trang) → giữ trong bộ nhớ, trang vẫn chạy. Tách hẳn dữ liệu app (`ProgressStore` của
 * Flutter) — không chép qua lại. `?tien=xoa` xoá kho thử. Luật: `zones/walletRules.ts`.
 */
import { newTrial, parseTrial, type TrialWallet } from '../zones/walletRules';

/** Khoá lưu (đổi dạng dữ liệu → đổi số phiên bản). */
export const TRIAL_KEY = 'hoc-xa.thu.v1';

/** Phần `Storage` cần dùng (test truyền kho giả). */
export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** URL có `tien=xoa` → xoá dữ liệu thử (R-TIEN-7). */
export function wantsReset(search: string): boolean {
  return new URLSearchParams(search).get('tien') === 'xoa';
}

export class TrialStore {
  private w: TrialWallet;

  /** [storage] `null` = không có kho (giữ trong bộ nhớ). */
  constructor(private readonly storage: KeyValue | null) {
    this.w = this.read();
  }

  get wallet(): TrialWallet {
    return this.w;
  }

  /** Đổi ví bằng [f] rồi ghi ngay; trả ví mới. */
  update(f: (w: TrialWallet) => TrialWallet): TrialWallet {
    this.w = f(this.w);
    try {
      this.storage?.setItem(TRIAL_KEY, JSON.stringify(this.w));
    } catch {
      // bị chặn / đầy → chỉ giữ trong bộ nhớ trang
    }
    return this.w;
  }

  /** Xoá sạch dữ liệu thử → ví mới (300). */
  reset(): void {
    try {
      this.storage?.removeItem(TRIAL_KEY);
    } catch {
      // bị chặn → bỏ qua
    }
    this.w = newTrial();
  }

  private read(): TrialWallet {
    try {
      const raw = this.storage?.getItem(TRIAL_KEY);
      return raw ? parseTrial(JSON.parse(raw)) : newTrial();
    } catch {
      return newTrial();
    }
  }
}

/** `localStorage` của trang; truy cập bị chặn → `null`. */
function browserStorage(): KeyValue | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Mở kho thử của trang (gọi một lần lúc tải, khi không có Flutter): `?tien=xoa` → xoá rồi bỏ tham số khỏi URL (tải lại
 * không xoá nữa). Báo một dòng Console (quyết định 3 — không nhãn trên màn).
 */
export function openTrialStore(): TrialStore {
  const store = new TrialStore(browserStorage());
  if (wantsReset(location.search)) {
    store.reset();
    const q = new URLSearchParams(location.search);
    q.delete('tien');
    const s = q.toString();
    history.replaceState(history.state, '', `${location.pathname}${s ? `?${s}` : ''}${location.hash}`);
  }
  console.info('Văn tiền: chế độ thử (lưu trong trình duyệt) — mở lại với ?tien=xoa để xoá dữ liệu thử');
  return store;
}
