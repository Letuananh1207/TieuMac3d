/**
 * Biến thể bố cục (bản thử để so — V-42 "trấn mở"): file `design/scene/bien_the/<tên>.json` chỉ ghi phần **khác** so với
 * `design/scene/scene.json`; Canvas 3D xem bằng `?bocuc=<tên>`, app không đọc. Ghép thuần JSON, không three:
 *
 * - object → ghép đệ quy (khoá thiếu giữ nguyên bản gốc);
 * - mảng / số / chữ → thay hẳn;
 * - `{ "bo": [mẫu…], "them": [phần tử…] }` đặt vào chỗ một **mảng** của bản gốc → bỏ các phần tử khớp một mẫu (mọi trường
 *   ghi trong mẫu bằng đúng giá trị), rồi thêm `them` vào cuối. Nhờ vậy việc khác sửa phần còn lại của mảng (vd. bậc Thiên
 *   Bậc) thì biến thể vẫn nhận;
 * - khoá bắt đầu bằng `_` (ghi chú) bị bỏ qua.
 */

type Json = unknown;

const isObj = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** `item` khớp mẫu `pat`: mọi trường của mẫu bằng trường cùng tên của `item` (so sâu). */
export function matches(item: Json, pat: Json): boolean {
  if (!isObj(pat)) return JSON.stringify(item) === JSON.stringify(pat);
  if (!isObj(item)) return false;
  return Object.entries(pat).every(([k, v]) => k.startsWith('_') || (k in item && matches(item[k], v)));
}

const isListOp = (v: Json): v is { bo?: Json[]; them?: Json[] } =>
  isObj(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => k === 'bo' || k === 'them' || k.startsWith('_'));

/** Ghép biến thể `patch` lên `base`; trả bản mới, không sửa hai đầu vào. `problems` nhận mẫu `bo` không khớp gì. */
export function applyVariant(base: Json, patch: Json, problems: string[] = [], path = ''): Json {
  if (Array.isArray(base) && isListOp(patch)) {
    let out = [...base];
    for (const pat of patch.bo ?? []) {
      const before = out.length;
      out = out.filter((it) => !matches(it, pat));
      if (out.length === before) problems.push(`biến thể ${path}.bo: mẫu ${JSON.stringify(pat)} không khớp phần tử nào`);
    }
    return [...out, ...(patch.them ?? []).map(stripNotes)];
  }
  if (isObj(base) && isObj(patch)) {
    const out: Record<string, Json> = { ...base };
    for (const [k, v] of Object.entries(patch)) {
      if (k.startsWith('_')) continue;
      out[k] = k in base ? applyVariant(base[k], v, problems, path ? `${path}.${k}` : k) : stripNotes(v);
    }
    return out;
  }
  return stripNotes(patch);
}

function stripNotes(v: Json): Json {
  if (Array.isArray(v)) return v.map(stripNotes);
  if (!isObj(v)) return v;
  if (isListOp(v)) return (v.them ?? []).map(stripNotes); // bản gốc chưa có mảng → chỉ phần thêm
  return Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('_')).map(([k, x]) => [k, stripNotes(x)]));
}
