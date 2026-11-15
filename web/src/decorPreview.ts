/**
 * Canvas 3D `?dang=trang-tri` (V-69 — R-NHA-7): đặt sẵn đồ trang trí tự do vào cảnh có `decorArea` để duyệt vùng đặt / vùng cấm, xem
 * bóng ma xanh / đỏ và đo ngân sách vẽ. Tham số: `&so=20` số món (tối đa trần cảnh), `&ma=ban-tra:0:0:45` bóng ma (vật:x:z:góc),
 * `&vungcam` tô vùng cấm, `&cu=1` đồ đứng đúng 12 ô cũ (ảnh "trước chuyển dữ liệu"), `&cu=1&chuyen=1` sau khi chuyển + xếp lại
 * (R-NHA-3). Món rải tất định trên lưới, xoay khác nhau, chỉ ở chỗ hợp lệ (cùng luật app). File gốc (import mọi lớp).
 */
import type * as THREE from 'three';
import type { Colliders } from './collision/colliders';
import { buildDecorArea } from './scene/decorArea';
import { DECOR_SHAPES } from './scene/decorItems';
import { DecorLayer } from './scene/decorLayer';
import type { SceneSpec } from './scene/spec';
import { DECOR_ITEMS, decorItem, type PlacedDecor } from './zones/decor';
import { LEGACY_SLOTS, migrateHome } from './zones/decorLegacy';
import { checkSpot, settleScene, snap } from './zones/decorPlace';

const shapeOf = (id: string) => DECOR_SHAPES[id];

/** Rải [count] món hợp lệ (tất định): duyệt lưới 3 m từ chỗ xuất phát ra ngoài, vật + góc xoay vòng theo danh mục. */
export function fillDecor(area: NonNullable<ReturnType<typeof buildDecorArea>>, count: number): PlacedDecor[] {
  const ids = DECOR_ITEMS.filter((i) => i.where === area.where).map((i) => i.id);
  const out: PlacedDecor[] = [];
  const xs = area.bounds.map((p) => p[0]);
  const zs = area.bounds.map((p) => p[1]);
  const spots: [number, number][] = [];
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += 3) for (let z = Math.min(...zs); z <= Math.max(...zs); z += 3) spots.push([snap(x), snap(z)]);
  const [sx, sz] = area.start;
  spots.sort((a, b) => Math.hypot(a[0] - sx, a[1] - sz) - Math.hypot(b[0] - sx, b[1] - sz));
  let k = 0;
  for (const [x, z] of spots) {
    if (out.length >= Math.min(count, area.maxItems)) break;
    for (let t = 0; t < ids.length; t++) {
      const item = ids[(k + t) % ids.length];
      const rot = ((k * 3) % 8) * 45;
      if (checkSpot(area, out, shapeOf, item, { x, z, rot }).ok) {
        out.push({ item, scene: area.scene, x, z, rot });
        k++;
        break;
      }
    }
  }
  return out;
}

/** Dựng lớp trang trí thử cho Canvas 3D; `null` khi không bật `?dang=trang-tri` hoặc cảnh không có vùng đặt. */
export function addDecorPreview(scene: THREE.Scene, colliders: Colliders, spec: SceneSpec, sceneId: string, heightAt: (x: number, z: number) => number, params: URLSearchParams): { layer: DecorLayer; lines: string[] } | null {
  if (params.get('dang') !== 'trang-tri' || !spec.decorArea) return null;
  const area = buildDecorArea(sceneId, spec, [...colliders.boxes], [...colliders.circles], spec.decorArea.where === 'ngoai' ? heightAt : undefined);
  if (!area) return null;
  const layer = new DecorLayer(scene, colliders, spec, heightAt, { jade: '#2B5446', lacquer: '#A8322A' });
  let items = fillDecor(area, Number(params.get('so') ?? 20));
  if (params.has('cu')) {
    // mỗi ô cũ của cảnh này một vật (vòng theo danh mục hợp nơi), như nhà bản có ô
    const ids = DECOR_ITEMS.filter((i) => i.where === area.where).map((i) => i.id);
    const slots = LEGACY_SLOTS.filter((sl) => sl.scene === sceneId);
    const placed = Object.fromEntries(slots.map((sl, i) => [sl.id, ids[i % ids.length]]));
    const owned = Object.fromEntries(ids.map((id) => [id, 12]));
    items = migrateHome([], placed, owned);
    if (params.has('chuyen')) items = settleScene(area, items, shapeOf).items;
  }
  layer.setItems(items.map((p) => ({ ...p, blocks: decorItem(p.item)?.blocks ?? false })));
  const lines = [`Trang trí thử: ${items.length} món / trần ${area.maxItems}`];
  const ma = (params.get('ma') ?? '').split(':');
  if (ma.length === 4 && decorItem(ma[0])) {
    const spot = { x: snap(Number(ma[1])), z: snap(Number(ma[2])), rot: Number(ma[3]) || 0 };
    const c = checkSpot(area, items, shapeOf, ma[0], spot);
    layer.setGhost({ item: ma[0], ...spot, ok: c.ok });
    lines.push(`Bóng ma ${ma[0]} (${spot.x}; ${spot.z}) ${spot.rot}°: ${c.ok ? 'hợp lệ' : `đỏ — ${c.label}`}`);
  }
  if (params.has('vungcam') || ma.length === 4) {
    layer.setKeepOut(area.keepOut.flatMap((k) => (k.rect ? [k.rect] : [])), area.keepOut.flatMap((k) => (k.circle ? [k.circle] : [])));
    if (ma.length !== 4) layer.setGhost({ item: 'chau-lan', x: area.start[0], z: area.start[1] - 3, rot: 0, ok: true });
  }
  return { layer, lines };
}
