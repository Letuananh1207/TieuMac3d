import { describe, expect, it } from 'vitest';
import { tableSlots } from './gameTable';
import { HOME_SCENE, loadScene } from './loadSpec';
import { GAME_SLOT, type GameTableSpec } from './spec';

/** Bàn cờ Kỳ Văn Uyển (R-GIAO-1, V-29): bàn dài chạy bắc – nam, tâm (−30,5; 7,5), quay 270°. */
const banCo: GameTableSpec = { id: 'ban-co', kind: 'co', x: -30.5, z: 7.5, rotY: 270, npc: 'tieu-mac', boards: 3, npcStand: false };

describe('Bàn đá dài Kỳ Văn Uyển — chỗ ngồi', () => {
  it('R-GIAO-1: bàn (−30,5; 7,5) 3 chỗ ở z 5 / 7,5 / 10, ghế tây x −31,9 nhìn đông, ghế đông x −29,1 nhìn tây', () => {
    const slots = tableSlots(banCo);
    expect(slots.map((s) => s.z)).toEqual([5, 7.5, 10].map((z) => expect.closeTo(z, 9)));
    for (const s of slots) {
      expect(s.x).toBeCloseTo(-30.5, 9);
      const [tay, dong] = s.seats;
      expect(tay.z).toBeCloseTo(s.z, 9);
      expect(tay.x).toBeCloseTo(-31.9, 9);
      expect(tay.rotY).toBeCloseTo(Math.PI / 2, 9); // nhìn +x (đông)
      expect(dong.z).toBeCloseTo(s.z, 9);
      expect(dong.x).toBeCloseTo(-29.1, 9);
      expect(dong.rotY).toBeCloseTo((3 * Math.PI) / 2, 9); // nhìn −x (tây)
    }
  });

  it('R-GIAO-1 (L-8): bàn không quay (rotY 0) như cũ — ghế +z nhìn π, ghế −z nhìn 0', () => {
    const slots = tableSlots({ ...banCo, x: -34, z: 4, rotY: 0 });
    expect(slots.map((s) => s.x)).toEqual([-36.5, -34, -31.5].map((x) => expect.closeTo(x, 9)));
    for (const s of slots) {
      const [nam, bac] = s.seats;
      expect(nam.z).toBeCloseTo(5.4, 9);
      expect(nam.rotY).toBeCloseTo(Math.PI, 9);
      expect(bac.z).toBeCloseTo(2.6, 9);
      expect(bac.rotY).toBeCloseTo(0, 9);
    }
  });

  it('R-GIAO-1 / R-GIAO-2 (V-29): đặc tả thật — hai bàn bắc – nam, ghế trong sân, biển quay về cổng đông, lối giữa hai bàn thông', () => {
    const tables = loadScene(HOME_SCENE).spec.gameTables;
    const co = tables.find((t) => t.kind === 'co')!;
    const dau = tables.find((t) => t.kind === 'dau-chu')!;
    expect([co.x, co.z, co.rotY]).toEqual([-30.5, 7.5, 270]);
    expect([dau.x, dau.z, dau.rotY]).toEqual([-37.5, 7.5, 270]);
    const seats = tables.flatMap((t) => tableSlots(t).flatMap((s) => s.seats));
    expect(seats).toHaveLength(12);
    for (const s of seats) {
      // trong sân Kỳ Văn Uyển (tường tây x −51, tường Quảng Trường x −17, tường nam z 17), xa khe hai cổng trên x −17
      expect(s.x).toBeGreaterThan(-50);
      expect(s.x).toBeLessThan(-28);
      expect(s.z).toBeGreaterThan(4);
      expect(s.z).toBeLessThan(11);
    }
    // ghế đông bàn Đấu chữ (x −36,1) cách ghế tây bàn cờ (x −31,9) 4,2 m — lối đi giữa hai bàn
    expect(Math.min(...seats.filter((s) => s.x > -34).map((s) => s.x)) - Math.max(...seats.filter((s) => s.x < -34).map((s) => s.x))).toBeCloseTo(4.2, 9);
    for (const t of tables) {
      expect(t.sign?.rotY).toBe(90); // mặt biển nhìn đông, về cổng (x −17, z 4)
      expect(t.sign?.x).toBe(t.x); // ở đầu bàn, thẳng trục bàn
      const gap = Math.abs(t.sign!.z - t.z) - (t.boards! * GAME_SLOT) / 2 - 0.9; // nửa biển dọc z 0,9
      expect(gap).toBeGreaterThan(0); // không chạm mặt bàn
    }
  });

  it('R-GIAO-1: bàn vuông (không boards) → một ghế phía +z', () => {
    const [s] = tableSlots({ id: 'v', kind: 'co', x: 0, z: 0, npc: 'tieu-mac' });
    expect(s.seats).toHaveLength(1);
    expect(s.seats[0].z).toBeGreaterThan(0);
  });
});
