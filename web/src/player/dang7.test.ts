import { describe, expect, it } from 'vitest';
import { emotePose } from './bieuCamDang';
import { CHAO, dungLauDang, goMoDang, gayDanDang, REST, SPINE_SPLIT, tronDang7 } from './dang7';
import { DongTac, JOINTS, TINH } from './dongTac';
import { WORK_IDS, WORK_LEN, workPose } from './lamVuonDang';

const T = TINH['hoat-bat'];
const cal = { off: T.haTay - REST };
const standing = (): DongTac['pose'] => {
  const d = new DongTac(T, 1);
  for (let i = 0; i < 30; i++) d.update(1 / 60, { mps: 0 });
  return d.pose;
};
const copy = (p: DongTac['pose']): string => JSON.stringify(p);

describe('Lớp nối dáng 7 khớp → xương chuẩn (R-BIEU-2, R-VUON-13, R-DIEU-8, R-NPC-8/9)', () => {
  it('R-BIEU-2: trọng số 0 → dáng không đổi', () => {
    const p = standing();
    const before = copy(p);
    tronDang7(p, emotePose('vo-tay', 0.5, 1.6)!, 0, cal);
    expect(copy(p)).toBe(before);
  });
  it('R-BIEU-2: cúi hông chia cho ba đốt sống, Hips (cha của chân) giữ nguyên', () => {
    const p = standing();
    const hips = [...p.j.hips];
    tronDang7(p, { hipsX: 0.55, hipsY: 0.1 }, 1, cal);
    expect(p.j.hips).toEqual(hips);
    expect(p.j.spine[0] + p.j.chest[0] + p.j.upperChest[0]).toBeCloseTo(0.55, 9);
    expect(p.j.spine[0]).toBeCloseTo(0.55 * SPINE_SPLIT[0], 9);
    expect(p.j.spine[1] + p.j.chest[1] + p.j.upperChest[1]).toBeCloseTo(0.1, 9);
  });
  it('R-BIEU-2: tay buông của dáng cũ (−REST) → tay buông của model (−haTay): cộng lệch, không nhân tỉ lệ', () => {
    const p = standing();
    tronDang7(p, { aLx: -0.12, aLz: -REST, aRx: -0.12, aRz: REST }, 1, cal);
    expect(p.j.armL[2]).toBeCloseTo(-T.haTay, 9);
    expect(p.j.armR[2]).toBeCloseTo(T.haTay, 9);
    // giơ cao 1,5 rad trên dáng cũ → lệch cùng một lượng
    tronDang7(p, { aLz: 1.5 }, 1, cal);
    expect(p.j.armL[2]).toBeCloseTo(1.5 - (T.haTay - REST), 9);
  });
  it('R-BIEU-2: chân co (legs âm) → đùi ra trước, gối gập (dương), bàn chân giữ bằng', () => {
    const p = standing();
    tronDang7(p, { legs: -0.45 }, 1, cal);
    expect(p.j.upLegL[0]).toBeCloseTo(-0.45, 9);
    expect(p.j.legL[0]).toBeGreaterThan(0.5);
    expect(p.j.upLegR[0] + p.j.legR[0] + p.j.footR[0]).toBeCloseTo(0, 9);
  });
  it('R-BIEU-2: khuỷu chỉ đổi khi dáng có eL / eR; vai dùng aLxE khi có khuỷu', () => {
    const p = standing();
    const fore = p.j.foreL[0];
    tronDang7(p, { aLx: -1.2 }, 1, cal);
    expect(p.j.foreL[0]).toBe(fore);
    expect(p.j.armL[0]).toBeCloseTo(-1.2, 9);
    tronDang7(p, CHAO, 1, cal);
    expect(p.j.foreL[0]).toBeCloseTo(-1.3, 9);
    expect(p.j.armL[0]).toBeCloseTo(-0.9, 9);
  });
  it('R-BIEU-2 / R-VUON-13: mọi dáng biểu cảm / làm vườn có khuỷu nằm trong giới hạn khớp', () => {
    const ids = ['vay-tay', 'cui-chao', 'vo-tay', 'cuoi', 'nhay-mung', 'suy-nghi'];
    for (const id of ids)
      for (const t of [0.2, 0.6, 1.0]) {
        const e = emotePose(id, t, 2)!;
        for (const v of [e.eL, e.eR]) if (v !== undefined) expect(v <= 0 && v > -2.4).toBe(true);
      }
    for (const id of WORK_IDS)
      for (let t = 0; t < WORK_LEN[id]; t += 0.1) {
        const p = standing();
        tronDang7(p, workPose(id, t)!, 1, cal);
        for (const k of JOINTS) for (const v of p.j[k]) expect(Number.isFinite(v) && Math.abs(v) < 3).toBe(true);
      }
  });
  it('R-DIEU-8: đứng lâu — trước 6 s đứng thường; chu kỳ đầu vươn vai, chu kỳ sau nhìn quanh', () => {
    expect(dungLauDang(5)).toEqual({ stretch: 0, look: 0 });
    const s = dungLauDang(7.25);
    expect(s.stretch).toBeGreaterThan(0.9);
    expect(s.look).toBe(0);
    const l = dungLauDang(14.6);
    expect(l.stretch).toBe(0);
    expect(Math.abs(l.look)).toBeGreaterThan(0.3);
  });
  it('R-NPC-8: gõ mõ — tay phải giơ dùi cao theo strike, tay trái đỡ mõ trước ngực (khuỷu gập)', () => {
    expect(goMoDang(1).aRx!).toBeLessThan(goMoDang(0).aRx!);
    expect(goMoDang(0.5).eL!).toBeLessThan(-0.5);
  });
  it('R-NPC-9: gảy đàn — tay phải nhấc theo pluck', () => {
    expect(gayDanDang(1, 0).aRx!).toBeLessThan(gayDanDang(0, 0).aRx!);
  });
});
