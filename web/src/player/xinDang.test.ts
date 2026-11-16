import { describe, expect, it } from 'vitest';
import { DongTac, TINH } from './dongTac';
import { tronXin, XIN } from './xinDang';

describe('Dáng ngồi xin Tiểu Khất (R-NPC-6)', () => {
  it('R-NPC-6: ngồi → tay phải gập nâng bát trước bụng, tay trái dạng ra cầm gậy; không ngồi (w 0) → giữ dáng nền', () => {
    const t = TINH['hoat-bat'];
    const d = new DongTac(t, 1);
    const pose = d.update(0.016, { mps: 0, sit: 1, sitDrop: 0.3 });
    const before = JSON.stringify(pose.j);
    tronXin(pose, t.haTay, 0);
    expect(JSON.stringify(pose.j)).toBe(before);
    tronXin(pose, t.haTay, 1);
    expect(pose.j.foreR[0]).toBeCloseTo(XIN.batKhuyu);
    expect(pose.j.armR[2]).toBeCloseTo(t.haTay + XIN.batKhep);
    // tay trái dạng ra ngoài hơn tay buông (z −haTay) → gậy đứng cạnh người, không chĩa vào chân
    expect(pose.j.armL[2]).toBeGreaterThan(-t.haTay);
    expect(pose.j.handL[0]).toBeCloseTo(XIN.gayCoTay);
  });
});
