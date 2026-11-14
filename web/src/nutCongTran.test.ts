import { describe, expect, it } from 'vitest';
import { NPC_TALK_DIST } from './player/npc';
import { HOME_SCENE, loadScene } from './scene/loadSpec';
import { BOARD_RANGE, boardBeforeNpc, dailyBoardSpot, nearBoard } from './zones/dailyBoard';
import { SHOP_RANGE, shopDoor } from './zones/shop';

// Đặc tả thật (design/scene/scene.json): Tiểu Mặc đứng sát bên phải bảng nhiệm vụ ở Cổng Trấn — "Nói chuyện" và
// "Xem bảng" có thể cùng trong tầm, chỉ hiện nút của vật gần hơn; "Vào tiệm" Tạp hoá ở xa cả hai.
describe('Cổng Trấn — nút "Nói chuyện" / "Xem bảng" / "Vào tiệm" không chồng nhau', () => {
  const spec = loadScene(HOME_SCENE).spec;
  const tm = spec.npcs.find((n) => n.id === 'tieu-mac')!;
  const board = dailyBoardSpot(spec.props)!;
  const door = shopDoor(spec.buildings)!;
  const d = (a: { x: number; z: number }, b: { x: number; z: number }): number => Math.hypot(a.x - b.x, a.z - b.z);
  /** Nút hiện khi đứng ở (x; z), như main.ts: chỉ nút của vật gần hơn. */
  const button = (x: number, z: number): 'Xem bảng' | 'Nói chuyện' | null => {
    const talk = d(tm, { x, z }) < NPC_TALK_DIST;
    const look = nearBoard(board, x, z);
    if (look && talk) return boardBeforeNpc(board, tm, x, z) ? 'Xem bảng' : 'Nói chuyện';
    return look ? 'Xem bảng' : talk ? 'Nói chuyện' : null;
  };

  it('R-NV-1: Tiểu Mặc (−4,4; 19) đứng ngay bên phải bảng (−7,5; 18,8), cùng nhìn nam; cửa Tạp hoá (−8; 30) ở xa', () => {
    expect([tm.x, tm.z, tm.rotY]).toEqual([-4.4, 19, 0]);
    expect(board).toEqual({ x: -7.5, z: 18.8 });
    expect(door).toEqual({ x: -8, z: 30 });
    expect(tm.x).toBeGreaterThan(board.x); // phía đông = tay phải khi đứng trước bảng nhìn vào
    expect(d(tm, door)).toBeGreaterThanOrEqual(NPC_TALK_DIST + SHOP_RANGE);
    expect(d(board, door)).toBeGreaterThanOrEqual(BOARD_RANGE + SHOP_RANGE);
  });

  it('R-NPC-2 / R-NV-3: cùng trong tầm → chỉ nút của vật gần hơn, không bao giờ hai nút', () => {
    expect(button(-6.6, 20.6)).toBe('Xem bảng'); // cách bảng 2,0, cách Tiểu Mặc 2,7 — chỉ bảng trong tầm
    expect(button(-6.2, 20.4)).toBe('Xem bảng'); // cách bảng 2,1, cách Tiểu Mặc 2,3 — cả hai, bảng gần hơn
    expect(button(-5.8, 20.2)).toBe('Nói chuyện'); // cách bảng 2,2, cách Tiểu Mặc 1,8 — cả hai, Tiểu Mặc gần hơn
    expect(button(-4.4, 21)).toBe('Nói chuyện'); // cách Tiểu Mặc 2,0, cách bảng 3,7
    expect(button(-4.4, 21.5)).toBeNull(); // cách Tiểu Mặc 2,5
  });
});
