/**
 * Chế độ "bản máy tính" (R-DIEU-1, R-THANH-1): máy có chuột (hover + con trỏ mịn) mà chưa chạm màn → `body.ban-may`:
 * ẩn joystick gợi ý, thanh công cụ dải đáy kiểu 摩尔 bản web (CSS: `ui/toolbarMay.css`, `style.css`). Máy tính có màn cảm ứng:
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

/** Đang ở bản máy tính (`body.ban-may`). */
export function dangBanMay(body: HTMLElement = document.body): boolean {
  return body.classList.contains('ban-may');
}

/**
 * Bản máy tính màn ngang: Trò chuyện là một hình trên thanh công cụ (phím Enter), ô nhập nổi ngay trên hàng hình — đang gõ
 * thanh vẫn hiện (R-CHAT-3, R-THANH-1, V-20261116-77). Màn dọc giữ nút Trò chuyện tròn như điện thoại.
 */
export function troChuyenTrenThanh(body: HTMLElement = document.body): boolean {
  const ngang = typeof matchMedia === 'function' && matchMedia('(orientation: landscape)').matches;
  return dangBanMay(body) && ngang;
}
