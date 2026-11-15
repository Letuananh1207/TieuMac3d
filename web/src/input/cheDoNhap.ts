/**
 * Chế độ "bản máy tính" (R-DIEU-1, R-THANH-1): máy có chuột (hover + con trỏ mịn) mà chưa chạm màn → `body.ban-may`:
 * ẩn joystick gợi ý, thanh công cụ dời sang trái đáy (CSS: `ui/toolbar.css`, `style.css`). Máy tính có màn cảm ứng:
 * chạm lần đầu → bỏ lớp, về giao diện cảm ứng tới hết phiên. Điện thoại / máy tính bảng không bao giờ vào chế độ này.
 */

/** `true` = giao diện máy tính: con trỏ chính là chuột và chưa có ngón nào chạm màn. */
export function laBanMay(chuotMin: boolean, daCham: boolean): boolean {
  return chuotMin && !daCham;
}

/** Gắn lớp `ban-may` lên body theo [laBanMay]; nghe chạm (pointerdown kiểu touch / pen) để tắt. */
export function attachCheDoNhap(body: HTMLElement = document.body): void {
  const mq = typeof matchMedia === 'function' ? matchMedia('(hover: hover) and (pointer: fine)') : null;
  let daCham = false;
  const apDung = (): void => {
    body.classList.toggle('ban-may', laBanMay(mq?.matches ?? false, daCham));
  };
  apDung();
  mq?.addEventListener?.('change', apDung);
  const khiCham = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse') return;
    daCham = true;
    apDung();
    window.removeEventListener('pointerdown', khiCham, true);
  };
  window.addEventListener('pointerdown', khiCham, true);
}

/** Đang ở bản máy tính (`body.ban-may`) — ô trò chuyện nằm trên thanh công cụ (R-CHAT-3, R-THANH-1). */
export function dangBanMay(body: HTMLElement = document.body): boolean {
  return body.classList.contains('ban-may');
}
