/**
 * Tối nhẹ mép màn kiểu ảnh phim (cảnh "mềm" — kế hoạch docs/tasks/2026-11-14-canh-dep.md, NV12; người dùng chọn 4B):
 * một lớp HTML phủ ngay trên canvas cảnh, nền gradient tròn trong suốt ở giữa → nâu tím ấm ở mép. Trình duyệt ghép lớp,
 * WebGL không tốn gì (khác hậu kỳ trong three). Không bắt chạm. `strength` 0 = không có lớp.
 */
export function addVignette(stage: HTMLElement, strength: number): HTMLElement | null {
  if (strength <= 0) return null;
  const v = document.createElement('div');
  v.id = 'vignette';
  v.setAttribute('aria-hidden', 'true');
  // `strength` = độ tối ở mép trái / phải; góc màn tối hơn chút (gradient tới góc xa nhất)
  const a = Math.min(0.9, strength * 1.6).toFixed(2);
  Object.assign(v.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    background: `radial-gradient(ellipse at 50% 45%, rgba(60,40,52,0) 40%, rgba(60,40,52,${a}) 100%)`,
  });
  stage.after(v); // ngay trên cảnh, dưới mọi lớp HUD (HUD đứng sau trong DOM)
  return v;
}
