import { describe, expect, it } from 'vitest';
import { giveTrialAlms, newTrial } from '../zones/walletRules';
import { TRIAL_KEY, TrialStore, wantsReset, type KeyValue } from './browserStore';

/** Kho giả như `localStorage`; `blocked` = trình duyệt chặn dữ liệu trang (mọi lệnh ném lỗi). */
function fakeStorage(init: Record<string, string> = {}, blocked = false): KeyValue & { data: Record<string, string> } {
  const data = { ...init };
  const guard = (): void => {
    if (blocked) throw new Error('SecurityError');
  };
  return {
    data,
    getItem: (k) => (guard(), k in data ? data[k] : null),
    setItem: (k, v) => {
      guard();
      data[k] = v;
    },
    removeItem: (k) => {
      guard();
      delete data[k];
    },
  };
}

describe('kho ví thử trong trình duyệt (R-TIEN-7)', () => {
  it('R-TIEN-8: cho Tiểu Khất trên ví thử → −5, lưu ngày + số lần, tải lại trang vẫn còn', () => {
    const s = fakeStorage();
    const a = new TrialStore(s);
    const r = giveTrialAlms(a.wallet, 20771);
    expect(r.result.ok).toBe(true);
    a.update(() => r.wallet);
    const b = new TrialStore(s);
    expect(b.wallet.coins).toBe(295);
    expect(b.wallet.alms).toEqual({ lastDay: 20771, count: 1 });
    expect(giveTrialAlms(b.wallet, 20771).result).toEqual({ ok: false, reason: 'given', balance: 295 });
  });

  it('R-TIEN-7: mới mở → 300; ghi rồi mở lại (tải lại trang) → còn nguyên', () => {
    const s = fakeStorage();
    const a = new TrialStore(s);
    expect(a.wallet.coins).toBe(300);
    a.update((w) => ({ ...w, coins: 308, lessons: ['bai-01'] }));
    expect(JSON.parse(s.data[TRIAL_KEY]).coins).toBe(308);
    const b = new TrialStore(s);
    expect(b.wallet.coins).toBe(308);
    expect(b.wallet.lessons).toEqual(['bai-01']);
  });

  it('R-TIEN-7: dữ liệu hỏng → ví thử mới, trang vẫn chạy', () => {
    expect(new TrialStore(fakeStorage({ [TRIAL_KEY]: '{hỏng' })).wallet).toEqual(newTrial());
    expect(new TrialStore(fakeStorage({ [TRIAL_KEY]: '"chuỗi"' })).wallet).toEqual(newTrial());
  });

  it('R-TIEN-7: trình duyệt chặn lưu (ẩn danh / chặn dữ liệu trang) hoặc không có kho → giữ trong bộ nhớ', () => {
    for (const storage of [fakeStorage({}, true), null]) {
      const t = new TrialStore(storage);
      expect(t.wallet.coins).toBe(300);
      t.update((w) => ({ ...w, coins: 240 }));
      expect(t.wallet.coins).toBe(240);
    }
  });

  it('R-TIEN-7: `?tien=xoa` → xoá sạch dữ liệu thử, về như mới mở (300)', () => {
    expect(wantsReset('?tien=xoa')).toBe(true);
    expect(wantsReset('?vung=rung-truc&tien=xoa&debug')).toBe(true);
    expect(wantsReset('?tien=500')).toBe(false);
    expect(wantsReset('')).toBe(false);
    const s = fakeStorage({ [TRIAL_KEY]: JSON.stringify({ ...newTrial(), coins: 12, owned: ['mai'] }) });
    const t = new TrialStore(s);
    t.reset();
    expect(t.wallet).toEqual(newTrial());
    expect(s.data[TRIAL_KEY]).toBeUndefined();
    expect(new TrialStore(s).wallet.coins).toBe(300);
  });
});
