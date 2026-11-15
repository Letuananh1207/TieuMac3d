import { describe, expect, it } from 'vitest';
import type { LuuSeat } from './luuThuong';
import { easeStop, LUU_ANSWER_SECONDS, LUU_DRIFT_MIN, LuuThuongRound } from './luuThuongRound';

const ORDER: LuuSeat[] = ['nguoi', 'thi-ong', 'nguoi', 'tai-nu', 'nguoi', 'tu-tai', 'nguoi', 'thi-ong'];
const LEARNED = ['truc', 'moc', 'thuy'];

/** Chạy tới khi pha đổi thành [phase] (tối đa 60 s), trả số giây đã chạy. */
function runTo(r: LuuThuongRound, phase: string, dt = 0.05): number {
  let t = 0;
  while (r.phase !== phase && t < 60) {
    r.update(dt);
    t += dt;
  }
  return t;
}

describe('Lưu Thương — vòng thời gian', () => {
  it('R-LUU-2: chén trôi 3–6 s, chậm dần, rồi dừng trước người tới lượt', () => {
    for (const k of [0, 0.5, 0.999]) {
      const r = new LuuThuongRound(LEARNED, () => k, ORDER);
      runTo(r, 'troi');
      const before = r.drift;
      const t = runTo(r, 'hoi');
      expect(t).toBeGreaterThanOrEqual(LUU_DRIFT_MIN - 0.06);
      expect(t).toBeLessThanOrEqual(6.06);
      expect(before).toBeLessThan(0.05);
      expect(r.drift).toBe(1);
      expect(r.seat).toBe('nguoi');
    }
    expect(easeStop(0)).toBe(0);
    expect(easeStop(1)).toBe(1);
    expect(easeStop(0.9) - easeStop(0.8)).toBeLessThan(easeStop(0.2) - easeStop(0.1)); // chậm dần
  });

  it('R-LUU-3: chạm là chọn — đúng +1 điểm; chạm ngoài lượt không có gì', () => {
    const r = new LuuThuongRound(LEARNED, () => 0.5, ORDER);
    expect(r.choose(0)).toBe(false); // đang thả chén
    runTo(r, 'hoi');
    const q = r.question;
    if (!q) throw new Error('không có câu');
    expect(r.choose(q.answer)).toBe(true);
    expect(r.phase).toBe('cham');
    expect(r.scores.nguoi).toBe(1);
    expect(r.choose(q.answer)).toBe(false);
  });

  it('R-LUU-3: quá 20 giây không chọn → sai, 0 điểm', () => {
    const r = new LuuThuongRound(LEARNED, () => 0.5, ORDER);
    runTo(r, 'hoi');
    expect(r.left).toBeCloseTo(LUU_ANSWER_SECONDS, 0);
    runTo(r, 'cham', 0.25);
    expect(r.picked).toBeNull();
    expect(r.lastRight).toBe(false);
    expect(r.scores.nguoi).toBe(0);
  });

  it('R-LUU-4: văn nhân nghĩ 1,5–3 s rồi tự chọn; chạm lúc đó không có gì', () => {
    const r = new LuuThuongRound(LEARNED, () => 0.5, ORDER);
    runTo(r, 'hoi');
    r.choose(0);
    runTo(r, 'nghi');
    expect(r.seat).toBe('thi-ong');
    expect(r.choose(0)).toBe(false);
    const t = runTo(r, 'cham');
    expect(t).toBeGreaterThanOrEqual(1.45);
    expect(t).toBeLessThanOrEqual(3.05);
  });

  it('R-LUU-5: hết 8 lượt → het, có kết quả', () => {
    const r = new LuuThuongRound(LEARNED, () => 0.1, ORDER); // văn nhân luôn đúng (0,1 < xác suất)
    for (let i = 0; i < 8 && r.phase !== 'het'; i++) {
      runTo(r, 'hoi');
      const q = r.question;
      if (q && r.phase === 'hoi') r.choose(q.answer);
      runTo(r, r.turn === 7 ? 'het' : 'tha');
    }
    runTo(r, 'het');
    expect(r.marks).toHaveLength(8);
    expect(r.scores.nguoi).toBe(4);
    expect(r.scores['thi-ong']).toBe(2);
    expect(r.outcome).toBe('thang');
  });

  it('R-LUU-1: chưa học bộ có chữ ghép → ván không bắt đầu', () => {
    expect(new LuuThuongRound([], () => 0.5, ORDER).phase).toBe('het');
  });
});
