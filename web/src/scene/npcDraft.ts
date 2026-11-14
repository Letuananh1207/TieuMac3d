/**
 * **Bản thử** hai NPC Khởi Nguyên Trấn (V-20261114-31, kế hoạch `docs/tasks/2026-11-14-npc-khat-nhi-go-mo.md`, đã duyệt):
 * chỗ ngồi Tiểu Khất (R-NPC-6) + đường vòng B của Lão Canh (R-NPC-7). Chưa vào cảnh app — chỉ Canvas 3D `?dang=go-mo` và
 * test cảnh dùng. Khi có model, `/canh` chép đúng hai mục này vào `npcs` của `design/scene/scene.json` (rồi `scene:check`).
 */
import type { NpcSpec } from './spec';

export const DRAFT_KHAT_NHI: NpcSpec = { id: 'khat-nhi', x: -6.2, z: 25.6, rotY: 90, pose: 'ngoi', scale: 0.8 };

export const DRAFT_GO_MO: NpcSpec = {
  id: 'go-mo',
  x: 2.5,
  z: 44,
  rotY: 180,
  speed: 1.1,
  route: [
    // đầu nam: tới gần cổng xuống núi (z 51, V-39 kéo dài lối Cổng Trấn), quay đầu trước vòng "Về nhà"
    [2.5, 44],
    [-2.5, 44],
    [-2.5, 18],
    [-8, 10],
    [-8, -8],
    [-2.5, -14],
    [-2.5, -19],
    [-1.5, -52],
    [1.5, -52],
    [1.5, -20],
    [2.5, -14],
    [8, -8],
    [8, 8],
    [2.5, 14],
    [2.5, 18],
  ],
};

export const DRAFT_TOWN_NPCS: readonly NpcSpec[] = [DRAFT_KHAT_NHI, DRAFT_GO_MO];
