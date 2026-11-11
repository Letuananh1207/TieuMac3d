# Cầu nối Flutter ↔ scene 3D

Nguồn sự thật cho mọi thứ hai phía trao đổi. Đổi gì ở đây trước, rồi sửa **cả hai phía** cùng lúc.

| Phía | File |
|---|---|
| Flutter | `app/lib/scene/` |
| Web | `web/src/style.css` (biến CSS); `web/src/bridge/` (sự kiện, mốc 3) |

## Biến CSS do Flutter đặt (mốc 2)

Flutter gọi `evaluateJavascript` đặt lên `document.documentElement.style` sau khi trang tải xong và mỗi khi
`MediaQuery.viewPadding` đổi (xoay máy, hiện/ẩn thanh hệ thống). Tạo chuỗi JS: `app/lib/scene/safe_area_script.dart`.

| Biến | Giá trị | Nghĩa |
|---|---|---|
| `--inset-top` | `<số>px` | vùng bị che phía trên (thanh trạng thái, tai thỏ) |
| `--inset-right` | `<số>px` | bên phải (tai thỏ khi máy nằm ngang) |
| `--inset-bottom` | `<số>px` | phía dưới (thanh điều hướng, thanh home iOS) |
| `--inset-left` | `<số>px` | bên trái |

Web dùng qua `--sa-*` = `max(env(safe-area-inset-*), var(--inset-*))` (`web/src/style.css`). Đơn vị px của CSS
bằng đơn vị logic của Flutter (viewport `width=device-width`).

## Sự kiện (mốc 3)

Dạng chung `{type: string, payload: object}`.

- JS → Flutter: `window.flutter_inappwebview.callHandler('sceneEvent', {type, payload})` — Flutter đăng ký handler
  tên `sceneEvent`; giá trị handler trả về là kết quả `Promise` phía JS.
- Flutter → JS: `evaluateJavascript` gọi `window.scene.handle({type, payload})` (chuỗi JS: `app/lib/scene/scene_event.dart`).

| type | Chiều | payload | Trả về | Khi nào |
|---|---|---|---|---|
| `openLesson` | JS → Flutter | `{zoneId: 'lop-hsk3', lesson: {han: '快', pinyin: 'kuài', meaning: 'nhanh; vui', info: [['Bộ', '忄 tâm đứng'], …]}}` (`lesson` = kiểu `Lesson` của `web/src/zones/zones.ts`) | `true` = Flutter đã mở màn bài học native · khác (`false`, lỗi, không có Flutter) = JS tự mở bảng HTML | người chơi bấm nút học hoặc chạm vật học (R-VUNG-2/3) |
| `resume` | Flutter → JS | `{}` | — | đóng màn bài học native → nhân vật đi lại được, cảnh vẽ tiếp đúng chỗ cũ |
| `lifecycle` | Flutter → JS | `{state: 'hidden' \| 'visible'}` | — | app xuống nền / bị che (`hidden`) → trang dừng hẳn vòng lặp vẽ; app hiện lại (`visible`) → chạy tiếp (mốc 4) |
| `debug` | Flutter → JS | `{on: true \| false}` | — | bản debug của app gửi `{on: true}` sau khi trang tải xong → bảng gỡ lỗi (fps · draw call · tam giác) (mốc 4) |

- Trang cũng tự dừng khi `document.hidden` (trình duyệt thường đổi tab). Dừng vì bất kỳ lý do nào → không vẽ, không
  cập nhật; chạy lại thì bước thời gian đầu tiên bỏ qua (nhân vật không "nhảy").
- `?debug` trên URL vẫn bật bảng gỡ lỗi khi chạy trình duyệt thường.

- Trong lúc màn bài học native mở (đã trả `true`), JS **ngừng vẽ** (không gọi `renderer.render`) tới khi nhận `resume`.
- Màn bài học native chưa có thiết kế (phiếu `2026-11-10-man-bai-hoc`) → Flutter hiện trả `false`, app vẫn dùng bảng
  HTML. Có màn thì chỉ đổi phía Flutter, không đổi hợp đồng này.
- Không có `window.flutter_inappwebview` (trình duyệt thường, `npm run dev`, Canvas 3D) → bảng HTML.
