import { describe, expect, it } from 'vitest';
import {
  CAM_KEYS,
  CAM_LOW,
  camRank,
  camSeatAt,
  judge,
  laneOfKey,
  songClock,
  songLaneOfKey,
  rankOutcome,
  songLength,
  songNotes,
  SongPlay,
  SONGS,
} from './danCam';

describe('Đàn cầm — chỗ ngồi', () => {
  it('R-CAM-1: chỗ ngồi sau đá theo hướng đá', () => {
    expect(camSeatAt({ x: -7.5, z: -4.5 }, { dx: 0, dz: -0.9 })).toEqual({ x: -7.5, z: -5.4, rotY: 0 });
    const r = camSeatAt({ x: 0, z: 0, rotY: 90 }, { dx: 0, dz: -1, rotY: 0 });
    expect(r.x).toBeCloseTo(-1);
    expect(r.z).toBeCloseTo(0);
    expect(r.rotY).toBe(90);
  });
});

describe('Đàn cầm — đàn tự do', () => {
  it('R-CAM-2: 10 phím ngũ cung Rê, 1–5 quãng thấp, Q W E R T quãng cao', () => {
    expect(Object.keys(CAM_KEYS)).toHaveLength(10);
    expect(CAM_KEYS.Digit1).toBe(62); // Rê
    expect(CAM_KEYS.KeyT).toBe(83); // Si cao
    const pcs = new Set(Object.values(CAM_KEYS).map((m) => m % 12));
    expect(pcs).toEqual(new Set([2, 4, 6, 9, 11])); // D E F# A B
    expect(laneOfKey('Digit3')).toBe(2);
    expect(laneOfKey('KeyR')).toBe(3);
    expect(laneOfKey('KeyZ')).toBeNull();
    expect(CAM_LOW).toHaveLength(5);
  });
});

describe('Đàn cầm — theo bài', () => {
  it('R-CAM-3: máy tính đánh làn bằng phím 1–5 (hàng Q W E R T không đánh làn)', () => {
    expect([1, 2, 3, 4, 5].map((n) => songLaneOfKey(`Digit${n}`))).toEqual([0, 1, 2, 3, 4]);
    expect(songLaneOfKey('KeyQ')).toBeNull();
    expect(songLaneOfKey('Digit6')).toBeNull();
    expect(SONGS.map(songClock).every((c) => /^[01]:\d\d$/.test(c))).toBe(true);
  });

  it('R-CAM-3: 3 bài 40–60 s, ≤ 2 nốt / giây, 5 làn, một làn một lúc', () => {
    expect(SONGS.map((s) => s.name)).toEqual(['Suối trúc', 'Mưa măng', 'Trăng trên gò']);
    for (const s of SONGS) {
      const len = songLength(s);
      expect(len, s.id).toBeGreaterThanOrEqual(40);
      expect(len, s.id).toBeLessThanOrEqual(60);
      const notes = songNotes(s);
      for (let i = 1; i < notes.length; i++) expect(notes[i].t - notes[i - 1].t).toBeGreaterThanOrEqual(0.5 - 1e-9);
      for (const n of notes) expect(n.lane).toBeGreaterThanOrEqual(0);
      for (const n of notes) expect(n.lane).toBeLessThanOrEqual(4);
    }
  });

  it('R-CAM-3: lệch ≤ 0,12 s Hay, ≤ 0,25 s Được, còn lại trượt', () => {
    expect(judge(0.1)).toBe('hay');
    expect(judge(-0.12)).toBe('hay');
    expect(judge(0.2)).toBe('duoc');
    expect(judge(0.3)).toBeNull();
  });

  it('R-CAM-3: tỉ lệ → hạng: 50 Hay + 4 Được / 60 = 86,7 % → Tri âm', () => {
    expect(camRank((50 + 4 * 0.5) / 60)).toBe('tri-am');
    expect(camRank(0.6)).toBe('thanh-nha');
    expect(camRank(0.59)).toBe('tap-dan');
  });

  it('R-CAM-3: gảy đúng lúc mọi nốt → Tri âm; bỏ hết → Tập đàn; bài vẫn chạy tới hết', () => {
    const s = SONGS[0];
    const good = new SongPlay(s);
    for (const n of good.notes) expect(good.hit(n.lane, n.t + 0.05)).toBe('hay');
    expect(good.rank).toBe('tri-am');
    const idle = new SongPlay(s);
    idle.update(100);
    expect(idle.marks.every((m) => m === null)).toBe(true);
    expect(idle.rank).toBe('tap-dan');
    expect(idle.done(100)).toBe(true);
    expect(idle.done(10)).toBe(false);
  });

  it('R-CAM-3: gảy sai làn / xa nốt → không chấm nốt nào', () => {
    const p = new SongPlay(SONGS[0]);
    const n = p.notes[0];
    expect(p.hit((n.lane + 1) % 5, n.t)).toBeNull();
    expect(p.hit(n.lane, n.t + 0.4)).toBeNull();
    expect(p.hit(n.lane, n.t + 0.2)).toBe('duoc');
  });

  it('R-CAM-4: Tri âm / Thanh nhã / Tập đàn = thắng / hoà / thua', () => {
    expect(rankOutcome('tri-am')).toBe('thang');
    expect(rankOutcome('thanh-nha')).toBe('hoa');
    expect(rankOutcome('tap-dan')).toBe('thua');
  });
});
