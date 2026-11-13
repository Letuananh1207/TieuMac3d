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
| `getProgress` | JS → Flutter | `{}` | `{open: ['rung-truc', …], chars: 2, need: {'giang-nam': {radicals: 50}, 'bong-lai': {chars: 300}, …}}` — `open` = mã vùng đã mở theo thứ tự hành trình (R-HANH-1, mốc ở `app/lib/journey/journey.dart`), `chars` = số chữ đã học, `need` = mốc của từng vùng **còn khoá** (`chars` số chữ hoặc `radicals` số bộ thủ) để bản đồ ghi "Cần … chữ" · khác (`null`, lỗi, không có Flutter) = trang dùng `?mo=<mã>,<mã>` hoặc mặc định `['rung-truc']` | trang dựng vòng trận (lúc tải) và sau mỗi `resume` (học thêm chữ có thể mở vùng mới) |
| `resume` | Flutter → JS | `{}` | — | đóng màn bài học native → nhân vật đi lại được, cảnh vẽ tiếp đúng chỗ cũ |
| `back` | Flutter → JS | `{}` | `true` = trang đã xử lý (vd. đóng bản đồ truyền tống — R-HANH-2) · khác = Flutter làm như thường (thoát app) | người dùng bấm nút quay lại của máy khi đang ở màn cảnh 3D (không có màn native nào mở). Flutter đọc giá trị trả về của `evaluateJavascript` (`window.scene.handle` trả `true` / `false`) |
| `lifecycle` | Flutter → JS | `{state: 'hidden' \| 'visible'}` | — | app xuống nền / bị che (`hidden`) → trang dừng hẳn vòng lặp vẽ; app hiện lại (`visible`) → chạy tiếp (mốc 4) |
| `debug` | Flutter → JS | `{on: true \| false}` | — | bản debug của app gửi `{on: true}` sau khi trang tải xong → bảng gỡ lỗi (fps · draw call · tam giác) (mốc 4) |

- `openLesson` cũng là lúc Flutter ghi chữ `lesson.han` là **đã học** (lần đầu mở — R-HANH-1, tạm tới khi có nút
  "Đã thuộc"); tiến độ lưu ở Flutter (`app/lib/journey/progress_store.dart`).
- **Đổi vùng** (R-HANH-2) không qua Flutter: trang tự tải lại `index.html?vung=<mã vùng>` (về nhà:
  `index.html?tu=<mã vùng vừa rời>`). Flutter thấy một lần tải trang mới → `onLoadStop` gửi lại biến safe area và `debug`
  như lúc mở app; trang gọi lại `getProgress`.
- Trang cũng tự dừng khi `document.hidden` (trình duyệt thường đổi tab). Dừng vì bất kỳ lý do nào → không vẽ, không
  cập nhật; chạy lại thì bước thời gian đầu tiên bỏ qua (nhân vật không "nhảy").
- `?debug` trên URL vẫn bật bảng gỡ lỗi khi chạy trình duyệt thường.

- Trong lúc màn bài học native mở (đã trả `true`), JS **ngừng vẽ** (không gọi `renderer.render`) tới khi nhận `resume`.
- Màn bài học native chưa có thiết kế (phiếu `2026-11-10-man-bai-hoc`) → Flutter hiện trả `false`, app vẫn dùng bảng
  HTML. Có màn thì chỉ đổi phía Flutter, không đổi hợp đồng này.
- Không có `window.flutter_inappwebview` (trình duyệt thường, `npm run dev`, Canvas 3D) → bảng HTML.
