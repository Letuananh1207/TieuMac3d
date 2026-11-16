import { createBlockCharacter } from './blockCharacter';
import type { Character } from './character';
import { createChibiCharacter, DE_TU, TIEU_MAC } from './chibiCharacter';
import { createDiscipleCharacter } from './discipleCharacter';
import { loadGlbCharacter } from './glbCharacter';
import { npcModelUrl } from './npc';

/**
 * Model nhân vật AI: `design/models/nhan-vat.glb` (phiên thiết kế / người dùng đặt — docs/ai3d.md). Vite gói file
 * vào bản build (chạy offline); không có file → `undefined`.
 */
const MODELS = import.meta.glob('../../../design/models/nhan-vat.glb', { query: '?url', import: 'default', eager: true });
export const PLAYER_MODEL_URL = Object.values(MODELS)[0] as string | undefined;

/** Mã `?nhan-vat=` dựng bằng code (không phải file `.glb`). */
const BUILT_IN = new Set(['gau', 'khoi', 'tieu-mac', 'chibi']);

/**
 * Model `.glb` của nhân vật chính theo `?nhan-vat=<mã>`: mã có file `design/models/<mã>.glb` (vd. `thu-thu` — thử dáng xương
 * Mixamo trước khi có bản Tripo của nhân vật chính) → file đó; còn lại → `nhan-vat.glb`. Trang thế (gõ mõ, gảy đàn) dùng chung.
 */
export function playerModelUrl(choice: string | null): string | undefined {
  if (choice && !BUILT_IN.has(choice)) return npcModelUrl(choice) ?? PLAYER_MODEL_URL;
  return PLAYER_MODEL_URL;
}

/**
 * Nhân vật người chơi. `choice` (tham số URL `?nhan-vat=`): không có / khác = model AI `.glb` (mặc định — người dùng
 * chọn 2026-11-14: "dùng mô hình glb trước"; lỗi nạp hoặc không có file → đệ tử khối, quyết định 0003),
 * `chibi` = đệ tử chibi dựng bằng code (`docs/tasks/2026-11-12-nhan-vat-chibi.md`), `tieu-mac` = Tiểu Mặc (NPC, xem
 * thử), `khoi` = đệ tử khối, `gau` = gấu khối cũ, `<mã>` có file `design/models/<mã>.glb` = model đó (`playerModelUrl`).
 * Model có xương Mixamo dựng dáng nhân vật chính (`opts.player`: hoạt bát, tay buông đo từ xương).
 */
export async function createPlayerCharacter(choice: string | null): Promise<Character> {
  if (choice === 'gau') return createBlockCharacter();
  if (choice === 'khoi') return createDiscipleCharacter();
  if (choice === 'tieu-mac') return createChibiCharacter(TIEU_MAC);
  if (choice === 'chibi') return createChibiCharacter(DE_TU);
  const url = playerModelUrl(choice);
  if (!url) return createDiscipleCharacter();
  try {
    return await loadGlbCharacter(url, { player: true });
  } catch (e) {
    console.warn('Không nạp được nhân vật .glb — dùng đệ tử khối.', e);
    return createDiscipleCharacter();
  }
}
