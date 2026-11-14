import { createBlockCharacter } from './blockCharacter';
import type { Character } from './character';
import { createChibiCharacter, DE_TU, TIEU_MAC } from './chibiCharacter';
import { createDiscipleCharacter } from './discipleCharacter';
import { loadGlbCharacter } from './glbCharacter';

/**
 * Model nhân vật AI: `design/models/nhan-vat.glb` (phiên thiết kế / người dùng đặt — docs/ai3d.md). Vite gói file
 * vào bản build (chạy offline); không có file → `undefined`.
 */
const MODELS = import.meta.glob('../../../design/models/nhan-vat.glb', { query: '?url', import: 'default', eager: true });
export const PLAYER_MODEL_URL = Object.values(MODELS)[0] as string | undefined;

/**
 * Nhân vật người chơi. `choice` (tham số URL `?nhan-vat=`): không có / khác = đệ tử chibi dựng bằng code (mặc định —
 * người dùng duyệt 2026-11-14, `docs/tasks/2026-11-12-nhan-vat-chibi.md`), `tieu-mac` = Tiểu Mặc (NPC, xem thử),
 * `glb` = model AI `.glb` (lỗi nạp hoặc không có file → đệ tử khối, quyết định 0003), `khoi` = đệ tử khối,
 * `gau` = gấu khối cũ.
 */
export async function createPlayerCharacter(choice: string | null): Promise<Character> {
  if (choice === 'gau') return createBlockCharacter();
  if (choice === 'khoi') return createDiscipleCharacter();
  if (choice === 'tieu-mac') return createChibiCharacter(TIEU_MAC);
  if (choice !== 'glb') return createChibiCharacter(DE_TU);
  if (!PLAYER_MODEL_URL) return createDiscipleCharacter();
  try {
    return await loadGlbCharacter(PLAYER_MODEL_URL);
  } catch (e) {
    console.warn('Không nạp được nhân vật .glb — dùng đệ tử khối.', e);
    return createDiscipleCharacter();
  }
}
