import { describe, expect, it } from 'vitest';
import { DAN_LOOP, DAN_NOTES, DAN_RAMP_SECONDS, danNotesBetween, danRamp, danVolume, midiHz, pluckLift } from './danTranh';

describe('Tiếng đàn cổ tranh — âm lượng, nhịp, vòng lặp', () => {
  it('R-AM-2: cách 2 m → 1; 9 m → 0,5; 15 m trở lên → 0 (chỉ x, z)', () => {
    expect(danVolume(0)).toBe(1);
    expect(danVolume(2)).toBe(1);
    expect(danVolume(3)).toBe(1);
    expect(danVolume(9)).toBeCloseTo(0.5, 9);
    expect(danVolume(15)).toBe(0);
    expect(danVolume(40)).toBe(0);
  });

  it('R-AM-2: lên / xuống mượt — từ 0 lên đầy mất 1 s, mở màn che thì về 0 trong 1 s', () => {
    expect(DAN_RAMP_SECONDS).toBe(1);
    let v = 0;
    for (let i = 0; i < 5; i++) v = danRamp(v, 1, 0.1);
    expect(v).toBeCloseTo(0.5, 9);
    for (let i = 0; i < 5; i++) v = danRamp(v, 1, 0.1);
    expect(v).toBeCloseTo(1, 9);
    expect(danRamp(1, 0, 2)).toBe(0); // không xuống quá 0
  });

  it('R-AM-2: đài phát — nốt theo đồng hồ thật, vòng 30 s lặp lại y hệt', () => {
    expect(DAN_LOOP).toBe(30);
    const t0 = 1_800_000_000; // chia hết 30 → đầu vòng
    const first = danNotesBetween(t0 + 1.4, t0 + 1.6);
    expect(first.map((n) => n.midi)).toEqual([69]); // phách 2 (1,5 s): La 4
    expect(danNotesBetween(t0 + 31.4, t0 + 31.6)).toEqual(first); // vòng sau y hệt
    // qua mốc cuối vòng → đầu vòng (vuốt dây bắt đầu ở 0 s)
    expect(danNotesBetween(t0 + 29.9, t0 + 30.1).map((n) => n.midi)).toEqual([81, 78]);
  });

  it('R-AM-2: khung lỡ dài (app vừa về từ nền) → không phát bù', () => {
    const t0 = 1_800_000_000;
    expect(danNotesBetween(t0, t0 + 0.6)).toEqual([]);
    expect(danNotesBetween(t0 + 2, t0 + 2)).toEqual([]);
    expect(danNotesBetween(t0 + 3, t0 + 2)).toEqual([]);
  });

  it('R-AM-2: ngũ cung Rê (Rê · Mi · Fa♯ · La · Si), không nốt ngoài cung', () => {
    const pentatonic = new Set([2, 4, 6, 9, 11]); // lớp cao độ của Rê, Mi, Fa♯, La, Si
    for (const n of DAN_NOTES) expect(pentatonic.has(n.midi % 12)).toBe(true);
    for (const n of DAN_NOTES) expect(n.t >= 0 && n.t < DAN_LOOP).toBe(true);
    expect(midiHz(69)).toBe(440);
  });

  it('R-NPC-9: tay phải nhấc sau mỗi tiếng gảy — 0 lúc gảy, 1 sau 0,25 s', () => {
    expect(pluckLift(0)).toBe(0);
    expect(pluckLift(0.125)).toBeCloseTo(0.5, 9);
    expect(pluckLift(3)).toBe(1);
  });
});
