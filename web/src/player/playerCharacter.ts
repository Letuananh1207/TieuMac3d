import { createBlockCharacter } from './blockCharacter';
import type { Character } from './character';
import { createDiscipleCharacter } from './discipleCharacter';
import { loadGlbCharacter } from './glbCharacter';

/**
 * Model nhân vật chính: `design/models/nhan-vat.glb` (phiên thiết kế / người dùng đặt — docs/ai3d.md). Vite gói file
 * vào bản build (chạy offline); không có file → `undefined`.
 */
const MODELS = import.meta.glob('../../../design/models/nhan-vat.glb', { query: '?url', import: 'default', eager: true });
export const PLAYER_MODEL_URL = Object.values(MODELS)[0] as string | undefined;

/**
 * Nhân vật người chơi. `choice` (tham số URL `?nhan-vat=`): `gau` = gấu khối cũ, `khoi` = đệ tử khối, khác / không có
 * = model `.glb` nếu có, lỗi nạp hoặc không có file → đệ tử khối (dự phòng — quyết định 0003).
 */
export async function createPlayerCharacter(choice: string | null): Promise<Character> {
  if (choice === 'gau') return createBlockCharacter();
  if (choice === 'khoi' || !PLAYER_MODEL_URL) return createDiscipleCharacter();
  try {
    return await loadGlbCharacter(PLAYER_MODEL_URL);
  } catch (e) {
    console.warn('Không nạp được nhân vật .glb — dùng đệ tử khối.', e);
    return createDiscipleCharacter();
  }
}
