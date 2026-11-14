import { describe, expect, it } from 'vitest';
import { FrameCap, pickTier, ResolutionGovernor, TIERS } from './quality';

describe('Mức chất lượng theo máy (R-HIEU-1)', () => {
  it('GPU giả lập phần mềm / đời cũ → Thấp; tầm trung → Vừa; còn lại → Cao', () => {
    expect(pickTier('Google, Vulkan 1.3.0 (SwiftShader Device')).toBe('thap');
    expect(pickTier('Qualcomm, Adreno (TM) 506')).toBe('thap');
    expect(pickTier('ARM, Mali-G52')).toBe('thap');
    expect(pickTier('Qualcomm, Adreno (TM) 610')).toBe('vua');
    expect(pickTier('ARM, Mali-G76')).toBe('vua');
    expect(pickTier('Qualcomm, Adreno (TM) 740')).toBe('cao');
    expect(pickTier('Apple GPU')).toBe('cao');
    expect(pickTier('AMD, AMD Radeon(TM) Graphics')).toBe('cao');
  });

  it('máy ít RAM (≤ 3 GB) hạ một mức', () => {
    expect(pickTier('Qualcomm, Adreno (TM) 740', 2)).toBe('vua');
    expect(pickTier('Qualcomm, Adreno (TM) 610', 3)).toBe('thap');
  });

  it('mỗi mức có độ phân giải tối đa / tối thiểu, Thấp tắt khử răng cưa', () => {
    expect(TIERS.cao.maxRatio).toBe(1.5);
    expect(TIERS.thap.antialias).toBe(false);
    for (const t of Object.values(TIERS)) expect(t.minRatio).toBeLessThan(t.maxRatio);
  });
});

/** Chạy bộ điều tiết `secs` giây với mọi khung `ms`; trả độ phân giải cuối. */
function run(g: ResolutionGovernor, ms: number, secs: number): number {
  for (let t = 0; t < secs * 1000; t += ms) g.update(ms);
  return g.ratio;
}

describe('Độ phân giải động (R-HIEU-1)', () => {
  it('khung chậm (25 ms) kéo dài → hạ dần tới mức tối thiểu, không thấp hơn', () => {
    const g = new ResolutionGovernor(0.8, 1.5);
    expect(run(g, 25, 0.5)).toBe(1.5); // chậm thoáng qua chưa hạ
    expect(run(g, 25, 2)).toBeLessThan(1.5);
    expect(run(g, 25, 20)).toBeCloseTo(0.8, 9);
  });

  it('dư sức (bám 60 fps) đủ lâu → nâng lại từng bậc tới tối đa', () => {
    const g = new ResolutionGovernor(0.8, 1.5);
    run(g, 25, 20); // xuống đáy
    const low = g.ratio;
    expect(run(g, 16.7, 6)).toBeGreaterThan(low);
    expect(run(g, 16.7, 60)).toBeCloseTo(1.5, 9);
  });

  it('nâng lên mà lại chậm → hạ lại và 30 giây sau mới thử nâng (không nhấp nháy mờ / nét)', () => {
    const g = new ResolutionGovernor(0.8, 1.5);
    run(g, 25, 20);
    // máy chỉ gánh được 0,8: ở 0,8 thì 16,7 ms, cao hơn thì 25 ms
    let changes = 0;
    let last = g.ratio;
    for (let t = 0; t < 60_000; ) {
      const ms = g.ratio <= 0.8 + 1e-9 ? 16.7 : 25;
      g.update(ms);
      t += ms;
      if (g.ratio !== last) {
        changes++;
        last = g.ratio;
      }
    }
    expect(changes).toBeLessThanOrEqual(6); // trong 60 s: thử nâng ít lần, không lật liên tục
  });

  it('khựng lẻ (1 khung 200 ms) không làm hạ độ phân giải', () => {
    const g = new ResolutionGovernor(0.8, 1.5);
    run(g, 16.7, 2);
    g.update(200);
    expect(run(g, 16.7, 2)).toBe(1.5);
  });
});

describe('Khung hình đều 60 / 30 fps (R-HIEU-2)', () => {
  /** Mô phỏng màn `hz` trong `secs` giây; trả số khung đã vẽ. */
  const frames = (cap: FrameCap, hz: number, secs: number, start = 0): number => {
    let n = 0;
    for (let t = start; t < start + secs * 1000; t += 1000 / hz) if (cap.shouldRender(t)) n++;
    return n;
  };

  it('màn 120 Hz → vẽ ~60 khung / giây, không 120', () => {
    expect(frames(new FrameCap(), 120, 10) / 10).toBeCloseTo(60, 0);
  });

  it('màn 60 Hz → vẽ đủ 60; ở chế độ 30 → đúng 30, đều cách một nhịp', () => {
    expect(frames(new FrameCap(), 60, 10) / 10).toBeCloseTo(60, 0);
    const cap = new FrameCap();
    cap.fps = 30;
    expect(frames(cap, 60, 10) / 10).toBeCloseTo(30, 0);
  });

  /** Cho `ms` mỗi khung vào bộ điều tiết + bộ giới hạn trong `secs` giây; trả bộ giới hạn. */
  const feed = (cap: FrameCap, gov: ResolutionGovernor, ms: number, secs: number): void => {
    for (let t = 0; t < secs * 1000; t += ms) {
      if (cap.fps === 60) gov.update(ms);
      cap.observe(ms, gov);
    }
  };

  it('độ nét đã ở đáy mà vẫn chậm 3 giây → 30 fps; chưa tới đáy thì chưa xuống 30', () => {
    const gov = new ResolutionGovernor(0.7, 1.0);
    const cap = new FrameCap();
    feed(cap, gov, 25, 1.5);
    expect(cap.fps).toBe(60); // còn đang hạ độ nét
    feed(cap, gov, 25, 10);
    expect(gov.ratio).toBeCloseTo(0.7, 9);
    expect(cap.fps).toBe(30);
  });

  it('ở 30 fps 60 giây → thử lại 60; thử hỏng thì lần sau chờ gấp đôi', () => {
    const gov = new ResolutionGovernor(0.7, 1.0);
    const cap = new FrameCap();
    for (let i = 0; i < 1000 && cap.fps === 60; i++) feed(cap, gov, 25, 0.025); // chậm tới khi xuống 30
    expect(cap.fps).toBe(30);
    feed(cap, gov, 33.3, 59);
    expect(cap.fps).toBe(30);
    feed(cap, gov, 33.3, 2);
    expect(cap.fps).toBe(60); // thử lại
    feed(cap, gov, 25, 4); // vẫn không gánh nổi
    expect(cap.fps).toBe(30);
    // lần này chờ ~120 s (gấp đôi) mới thử lại 60
    let waited = 0;
    while (cap.fps === 30 && waited < 400_000) {
      feed(cap, gov, 33.3, 0.03); // đúng 1 khung
      waited += 33.3;
    }
    expect(waited / 1000).toBeGreaterThan(115);
    expect(waited / 1000).toBeLessThan(121);
  });
});
