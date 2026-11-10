/** Lấy phần tử theo id; thiếu thì báo lỗi ngay (sai lệch giữa index.html và code). */
export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const e = document.getElementById(id);
  if (!e) throw new Error(`Thiếu phần tử #${id} trong index.html`);
  return e as T;
}
