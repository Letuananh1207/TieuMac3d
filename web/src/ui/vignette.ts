/**
 * Tối nhẹ mép màn kiểu ảnh phim (cảnh "mềm" — kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV12; người dùng chọn 4B):
 * một lớp HTML phủ ngay trên canvas cảnh, nền gradient tròn trong suốt ở giữa → màu `color` ở mép (mặc định nâu tím ấm). Trình duyệt ghép lớp,
 * WebGL không tốn gì (khác hậu kỳ trong three). Không bắt chạm. `strength` 0 = không có lớp.
 */
export function addVignette(stage: HTMLElement, strength: number, color: string): HTMLElement | null {
  if (strength <= 0) return null;
  const v = document.createElement('div');
  v.id = 'vignette';
  v.setAttribute('aria-hidden', 'true');
  Object.assign(v.style, { position: 'fixed', inset: '0', pointerEvents: 'none' });
  setVignette(v, strength, color);
  stage.after(v); // ngay trên cảnh, dưới mọi lớp HUD (HUD đứng sau trong DOM)
  return v;
}

/** Đổi độ tối / màu mép của lớp đã có (ngày đêm — `web/src/ngayDem.ts`): chỉ đổi nền CSS, không thêm lớp. */
export function setVignette(v: HTMLElement, strength: number, color: string): void {
  // `strength` = độ tối ở mép trái / phải; góc màn tối hơn chút (gradient tới góc xa nhất)
  const a = Math.min(0.9, strength * 1.2).toFixed(2);
  // màu mép "#rrggbb" (đặc tả `look.vignetteColor`) → "r,g,b"
  const n = parseInt(color.slice(1), 16);
  const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  v.style.background = `radial-gradient(ellipse at 50% 45%, rgba(${rgb},0) 40%, rgba(${rgb},${a}) 100%)`;
}
