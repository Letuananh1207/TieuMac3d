import { resolveSceneSpec, type ResolvedScene } from './spec';

/** Đường dẫn file đặc tả, tính từ gốc repo (để in thông báo). */
export const SCENE_FILE = 'design/scene/scene.json';

// Vite đọc file lúc build (glob: chưa có file thì ra object rỗng, không lỗi build).
// Phiên thiết kế ghi file này; xem decisions/0002-thiet-ke-3d.md.
const found = import.meta.glob('../../../design/scene/scene.json', { eager: true, import: 'default' });
const raw: unknown = Object.values(found)[0];

/** Cảnh đã kiểm. `fromFile = false` → chưa có file, dùng cảnh mặc định. */
export const SCENE: ResolvedScene & { fromFile: boolean } = { ...resolveSceneSpec(raw), fromFile: raw !== undefined };
