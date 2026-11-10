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

## Sự kiện (mốc 3 — chưa làm)

Dạng chung `{type: string, payload: object}`.

- JS → Flutter: `window.flutter_inappwebview.callHandler('sceneEvent', {type, payload})`
- Flutter → JS: `evaluateJavascript` gọi `window.scene.handle({type, payload})`

| type | Chiều | payload | Khi nào |
|---|---|---|---|
| `openLesson` | JS → Flutter | `{char: '快'}` … (chốt ở mốc 3) | người chơi bấm nút chính trên thẻ mời |
| `resume` | Flutter → JS | `{}` | đóng màn bài học, scene chạy tiếp |
