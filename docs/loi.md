# Sổ lỗi — Học Xá 3D

| Lệnh | Làm gì |
|---|---|
| `/loi` | Liệt kê lỗi chưa `xong`, xếp theo mức độ rồi theo mã. |
| `/loi <mô tả>` | Ghi lỗi mới, chưa sửa. |
| `/loi sua [L-…]` | Sửa lỗi đó (không mã → lỗi đầu danh sách mở). |
| `/loi xong L-…` | Thử trên máy thật đạt → `xong`. |
| `/loi mo L-…` | Thử trên máy vẫn lỗi → mở lại. |

Trạng thái: `mới` → `đang sửa` → `chờ thử máy` → `xong` · `không sửa (<lý do>)`.
Mã `L-<số>` tăng dần, không dùng lại.

Mức độ:
- **chặn dùng** — văng app, màn trắng / scene không hiện, nhân vật không đi được hoặc kẹt cứng, không vào được bài học.
- **khó chịu** — điều khiển sai hướng / giật, thẻ mời hiện sai lúc, va chạm xuyên vật, chữ vỡ dấu, HUD bị tai thỏ che, tụt fps rõ.
- **nhỏ** — lệch màu, lệch vài pixel, chữ sai chính tả, thứ chỉ thấy khi cố tìm.

## Đang mở

### L-1 · Chạy app trên máy tính (Windows) / web báo lỗi build

- Trạng thái: chờ thử máy · Mức độ: chặn dùng (không mở được app trên máy tính) · Phần: app Flutter, WebView · Quy tắc: chưa có
- Báo: 2026-11-11 — "vì ứng dụng này sẽ chạy được cả trên nền tảng web nhưng hiện tại khi run ở web thì đang báo lỗi"
- Các bước: 1. `cd app && flutter run`, chọn thiết bị Windows. 2. Build lỗi.
- Mong đợi / thực tế: app mở, thấy cảnh 3D / build thất bại `error MSB3073 … NUGET-NOTFOUND install Microsoft.Web.WebView2`,
  dòng đầu "Nuget is not installed! The flutter_inappwebview_windows plugin requires it."
- Bằng chứng: log build người dùng dán (Windows 11, Visual Studio 18 Insiders). Chạy thử trên web (`flutter build web`):
  "This project is not configured for the web."

**Sửa**
- Nguyên nhân:
  1. Windows: máy chưa cài NuGet (`where nuget` không thấy). Gói `flutter_inappwebview_windows` dùng NuGet tải WebView2
     + 2 thư viện C++ khi build → lỗi môi trường, không phải code.
  2. Web (trình duyệt): app chỉ tạo cho android + ios ở mốc 1, chưa bật nền tảng web. Bật lên rồi vẫn hỏng tiếp:
     `InAppLocalhostServer` dùng `dart:io` (mở cổng http) — trình duyệt không có.
- Hướng (người dùng chọn): **chỉ web (trình duyệt)**, không làm bản Windows desktop → không cần NuGet, bỏ `app/windows/`.
- Test: `app/test/scene/scene_server_test.dart` — `'(L-1): trên web nạp cảnh thẳng từ asset cùng nguồn, không dùng máy chủ
  localhost'` (+ chạy ở gốc, + Android / iOS vẫn qua cổng 8080). Đỏ trước khi sửa (chưa có `sceneUrl`).
- Code: `flutter create . --platforms web` (`app/web/`, tên / màu / `viewport-fit=cover` / nạp `web_support.js` của
  flutter_inappwebview); `app/lib/scene/scene_server.dart` — web: không tạo `InAppLocalhostServer`, mở
  `assets/assets/scene/index.html` cùng nguồn; `app/lib/main.dart` — không gọi bật gỡ lỗi WebView Android khi chạy web.
  `flutter build web` thành công; mở `app/build/web/` bằng Chrome headless thấy cảnh 3D trong khung WebView.
- Thử máy: `cd web && npm run build`, rồi `cd ../app && flutter run -d chrome` → thấy cảnh, đi lại được; nếu còn lỗi gửi
  log terminal + ảnh màn, F12 → Console.
- Commit: —

**Lịch sử**
- 2026-11-11: ghi; người dùng chọn "ghi rồi sửa luôn". Log người dùng dán là bản **Windows** (thiếu NuGet); hỏi lại →
  người dùng chọn chỉ web.

## Đã xong
