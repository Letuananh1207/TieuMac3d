import { resolveSceneSpec, type ResolvedScene } from './specCheck';

/** Mã cảnh tông môn (nhà, trạm gốc) — file `design/scene/scene.json`. Cảnh vùng: `design/scene/<mã vùng>.json`. */
export const HOME_SCENE = 'tong-mon';

// Vite đọc các file lúc build (glob: chưa có file thì ra object rỗng, không lỗi build).
// Phiên thiết kế ghi các file này; xem decisions/0002-thiet-ke-3d.md. Mỗi vùng một đặc tả (mục 2026-11-13.6).
const found = import.meta.glob('../../../design/scene/*.json', { eager: true, import: 'default' });

/** đường dẫn file → mã cảnh: `scene.json` = tông môn, `<mã>.json` = vùng */
const byId = new Map<string, unknown>();
for (const [path, raw] of Object.entries(found)) {
  const name = path.slice(path.lastIndexOf('/') + 1, -'.json'.length);
  byId.set(name === 'scene' ? HOME_SCENE : name, raw);
}

/** Các vùng đã có cảnh (có file đặc tả riêng) — vòng trận chỉ sáng khi vùng mở **và** có cảnh (R-HANH-1). */
export const REGION_SCENES: ReadonlySet<string> = new Set([...byId.keys()].filter((id) => id !== HOME_SCENE));

export type LoadedScene = ResolvedScene & { id: string; file: string; fromFile: boolean };

/** Đường dẫn file đặc tả của cảnh `id`, tính từ gốc repo (để in thông báo). */
export function sceneFile(id: string): string {
  return `design/scene/${id === HOME_SCENE ? 'scene' : id}.json`;
}

/** Cảnh đã kiểm. Mã lạ / chưa có file → tông môn (chưa có cả `scene.json` → cảnh mặc định trong code). */
export function loadScene(id: string | null): LoadedScene {
  const key = id && byId.has(id) ? id : HOME_SCENE;
  const raw = byId.get(key);
  return { ...resolveSceneSpec(raw), id: key, file: sceneFile(key), fromFile: raw !== undefined };
}
