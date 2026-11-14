import { describe, expect, it } from 'vitest';
import { tableSlots } from './gameTable';
import type { GameTableSpec } from './spec';

const banCo: GameTableSpec = { id: 'ban-co', kind: 'co', x: -34, z: 4, npc: 'tieu-mac', boards: 3, npcStand: false };

describe('Bàn đá dài Kỳ Văn Uyển — chỗ ngồi', () => {
  it('R-GIAO-1 (L-8): bàn (−34; 4) 3 chỗ ở x −36,5 / −34 / −31,5, ghế nam z 5,4 nhìn bắc, ghế bắc z 2,6 nhìn nam', () => {
    const slots = tableSlots(banCo);
    expect(slots.map((s) => s.x)).toEqual([-36.5, -34, -31.5].map((x) => expect.closeTo(x, 9)));
    for (const s of slots) {
      const [nam, bac] = s.seats;
      expect(nam.x).toBeCloseTo(s.x, 9);
      expect(nam.z).toBeCloseTo(5.4, 9);
      expect(nam.rotY).toBeCloseTo(Math.PI, 9);
      expect(bac.z).toBeCloseTo(2.6, 9);
      expect(bac.rotY).toBeCloseTo(0, 9);
    }
  });

  it('R-GIAO-1: bàn vuông (không boards) → một ghế phía +z', () => {
    const [s] = tableSlots({ id: 'v', kind: 'co', x: 0, z: 0, npc: 'tieu-mac' });
    expect(s.seats).toHaveLength(1);
    expect(s.seats[0].z).toBeGreaterThan(0);
  });
});
