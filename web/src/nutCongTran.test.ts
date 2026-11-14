import { describe, expect, it } from 'vitest';
import { NPC_TALK_DIST } from './player/npc';
import { HOME_SCENE, loadScene } from './scene/loadSpec';
import { BOARD_RANGE, dailyBoardSpot } from './zones/dailyBoard';
import { SHOP_RANGE, shopDoor } from './zones/shop';

// Đặc tả thật (design/scene/scene.json): Tiểu Mặc, bảng nhiệm vụ, cửa Tạp hoá ở Cổng Trấn — ba nút nổi không bao giờ hiện cùng lúc.
describe('Cổng Trấn — nút "Nói chuyện" / "Xem bảng" / "Vào tiệm" không chồng nhau', () => {
  const spec = loadScene(HOME_SCENE).spec;
  const tm = spec.npcs.find((n) => n.id === 'tieu-mac')!;
  const board = dailyBoardSpot(spec.props)!;
  const door = shopDoor(spec.buildings)!;
  const d = (a: { x: number; z: number }, b: { x: number; z: number }): number => Math.hypot(a.x - b.x, a.z - b.z);

  it('R-NPC-2: Tiểu Mặc (−7,5; 24) cách bảng (−7,5; 18,8) 5,2 m, cách cửa Tạp hoá (−8; 30) 6,0 m', () => {
    expect([tm.x, tm.z]).toEqual([-7.5, 24]);
    expect(board).toEqual({ x: -7.5, z: 18.8 });
    expect(door).toEqual({ x: -8, z: 30 });
    expect(d(tm, board)).toBeGreaterThanOrEqual(NPC_TALK_DIST + BOARD_RANGE);
    expect(d(tm, door)).toBeGreaterThanOrEqual(NPC_TALK_DIST + SHOP_RANGE);
    expect(d(board, door)).toBeGreaterThanOrEqual(BOARD_RANGE + SHOP_RANGE);
  });
});
