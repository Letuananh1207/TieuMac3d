/**
 * Canvas 3D — nhà kín bằng model (V-88, kế hoạch docs/tasks/2026-11-16-nha-model.md NV6). Không vào app.
 * - `&mau-nha=khoi-gop` — model thế (bản khối gộp một lưới) đi đúng đường co / dán biển / tấm sáng cửa sổ như file thật
 * - `&mau-nha=<mã>` — nạp `design/models/<mã>.glb` làm nhà (vd. `cong-son-mon` để thử đường nạp file + báo lệch dáng)
 * - `&khoi` — bỏ `model` của đặc tả, xem bản khối để so
 * - `&ty-le=giu` — co đều giữ tỉ lệ model (NV9 phương án (b), chỉ để NHÌN — va chạm vẫn theo khối)
 * Không tham số: như app (đặc tả có `model` + có file → model; không → khối).
 */
import { NHA_MODEL_TUNE, type HouseReport } from './scene/nhaModel';
import type { SceneSpec } from './scene/spec';

const fmt = (v: number): string => v.toFixed(2).replace('.', ',');

/** Đặc tả đã áp `&mau-nha` / `&khoi` cho các nhà kín `nha-o`. */
export function withHouseParam(spec: SceneSpec, params: URLSearchParams): SceneSpec {
  if (params.get('ty-le') === 'giu') NHA_MODEL_TUNE.keepRatio = true; // trang Canvas 3D riêng — không lẫn vào app
  const mau = params.get('mau-nha');
  const block = params.has('khoi');
  if (!mau && !block) return spec;
  const buildings = spec.buildings.map((b) => {
    if (b.kind !== 'nha-o' || !b.closed) return b;
    const { model: _old, ...rest } = b;
    return block ? rest : { ...rest, model: mau as string };
  });
  return { ...spec, buildings };
}

/** Dòng báo ở bảng: nhà nào dùng gì, co bao nhiêu, lệch dáng, số tam giác. */
export async function houseLines(ready: Promise<HouseReport[]>, params: URLSearchParams): Promise<string[]> {
  const reports = await ready;
  const lines = reports.map((r) => {
    if (r.source === 'khoi' || !r.fit) return `Nhà ${r.id}: nạp model lỗi — đang xem bản khối`;
    const { scale, skew, triangles } = r.fit;
    const what = r.source === 'the' ? 'model thế (khối gộp một lưới)' : `model design/models/${r.model}.glb`;
    return (
      `Nhà ${r.id}: ${what} · co ${scale.map(fmt).join(' × ')} · lệch dáng ${Math.round(skew * 100)} %` +
      `${NHA_MODEL_TUNE.keepRatio ? ' (GIỮ TỈ LỆ — va chạm chưa khớp)' : skew > 0.15 ? ' (QUÁ 15 % — xem lại ảnh / NHA_MODEL_TUNE)' : ''} · ${Math.round(triangles).toLocaleString('vi-VN')} tam giác`
    );
  });
  if (!lines.length && params.has('khoi')) lines.push('Nhà: bản khối (&khoi)');
  return lines;
}
